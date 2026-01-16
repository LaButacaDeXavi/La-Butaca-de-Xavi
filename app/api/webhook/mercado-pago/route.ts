import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import crypto from "crypto"
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { parseLocalDate } from "@/lib/cart-utils";


const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? "";
const bearer = process.env.MERCADO_PAGO_ACCESS_TOKEN
export async function POST(req: Request) {
   const rawBody = await req.text();
    const signatureHeader = req.headers.get("x-signature");
    const requestId = req.headers.get("x-request-id");

    if (!signatureHeader || !requestId) {
        console.log("❌ Falta signature o requestId");
        return new Response("Unauthorized", { status: 401 });
    }

    const parts = signatureHeader.split(",");
    const ts = parts.find(p => p.startsWith("ts="))?.split("=")[1];
    const v1 = parts.find(p => p.startsWith("v1="))?.split("=")[1];

    if (!ts || !v1) {
        console.log("❌ No se pudo extraer ts o v1");
        return new Response("Unauthorized", { status: 401 });
    }

    const data = JSON.parse(rawBody);
    const paymentId = data.resource || data.data?.id;

    const manifest1 = `id:${paymentId};request-id:${requestId};ts:${ts};`;
    const signature1 = crypto
        .createHmac("sha256", secret)
        .update(manifest1)
        .digest("hex");

    const manifest2 = `${ts}.${requestId}.${rawBody}`;
    const signature2 = crypto
        .createHmac("sha256", secret)
        .update(manifest2)
        .digest("hex");

    const manifest3 = `id:${paymentId};request-id:${requestId};ts:${ts}`;
    const signature3 = crypto
        .createHmac("sha256", secret)
        .update(manifest3)
        .digest("hex");

    const isValid = signature1 === v1 || signature2 === v1 || signature3 === v1;

    if (!isValid) {
        console.log("\n❌ NINGUNA FIRMA COINCIDE");
        const secretTrimmed = secret.trim();
        const sig4 = crypto.createHmac("sha256", secretTrimmed).update(manifest1).digest("hex");

        return new Response("Unauthorized", { status: 401 });
    }
    
    const typePayment = data.type ?? "";

    if (typePayment !== "payment" || !paymentId) {
        return NextResponse.json('OK', { status: 200 });
    }
    processPayment(paymentId, data.external_reference).catch(err =>
        console.error("❌ Error procesando pago:", err)
    );

    return NextResponse.json('OK', { status: 200 });
}

async function processPayment(paymentId: string, externalReference: string) {
    const supabase = createClient();

    try {
        // Obtener datos del pago
        const paymentResponse = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${bearer}`
                }
            }
        );

        if (!paymentResponse.ok) {
            throw new Error(`Error fetching payment: ${paymentResponse.status}`);
        }

        const paymentData = await paymentResponse.json();

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
                id,
                status,
                orders_sections(quantity, section_id)
            `)
            .eq('id', paymentData.external_reference)
            .single();

        if (orderError || !order) {
            throw new Error(`Order not found: ${orderError?.message}`);
        }

        if (order.status !== 'pending') {
            console.log("⚠️ Orden ya procesada, ignorando webhook duplicado");
            return; 
        }

        if (paymentData.status !== "approved") {
            console.log("⚠️ Pago no aprobado:", paymentData.status);
            return;
        }

        for (const section of order.orders_sections) {
            const { error: stockError } = await supabase.rpc("decrement_section_stock", {
                p_section_id: section.section_id,
                p_quantity: section.quantity,
            });

            if (stockError) {
                throw new Error(`Stock insuficiente para sección ${section.section_id}: ${stockError.message}`);
            }
        }

        // Crear tickets
        const ticketsToInsert = order.orders_sections.flatMap(section =>
            Array.from({ length: section.quantity }, () => ({
                order_id: order.id,
                section_id: section.section_id,
                qr_code: crypto.randomUUID(),
                scanned: false,
            }))
        );

        const [updateResult, insertResult] = await Promise.all([
            supabase.from('orders').update({ status: 'paid' }).eq('id', order.id),
            supabase.from('tickets').insert(ticketsToInsert).select(`
                qr_code,
                performances_sections(name)
            `)
        ]);

        // ⚠️ Verificar ambos resultados
        if (updateResult.error) {
            throw new Error(`Error actualizando orden: ${updateResult.error.message}`);
        }

        if (insertResult.error || !insertResult.data) {
            throw new Error(`Error creando tickets: ${insertResult.error?.message}`);
        }

        console.log(`✅ Pago procesado correctamente: ${order.id}`);

        // Enviar email (no bloquea el proceso principal)
        await sendMail(insertResult.data as any, order.id).catch(err =>
            console.error("⚠️ Error enviando email (no crítico):", err)
        );

    } catch (error) {
        console.error("❌ Error procesando pago:", error);

        await supabase.from('webhook_failures').insert({
            payment_id: paymentId,
            external_reference: externalReference,
            error_message: error instanceof Error ? error.message : 'Unknown error',
            retry_count: 0
        })
    }
}

export async function GET() {
    return new Response("OK", { status: 200 });
}

export async function OPTIONS() {
    return new Response("OK", { status: 200 });
}


type TicketResult = {
    qr_code: string
    performances_sections: {
        name: string
    }
}

async function sendMail(result: TicketResult[], orderId: string) {
    if (!result || result.length === 0) {
        console.log("⚠️ No hay tickets para enviar");
        return;
    }

    const supabase = createClient();

    try {
        // ✅ Generar QRs y obtener datos de la orden en paralelo
        const [tickets, { data: order, error }] = await Promise.all([
            Promise.all(
                result.map(async (ticket) => ({
                    qrBase64: await QRCode.toDataURL(ticket.qr_code),
                    sectionName: ticket.performances_sections.name,
                }))
            ),
            supabase
                .from('orders')
                .select(`
                    id,
                    buyer_email,
                    buyer_name,
                    performances(
                        date,
                        time,
                        plays(
                            title,
                            description,
                            main_image_url
                        ),
                        theaters(
                            name,
                            address,
                            map_url
                        )
                    )
                `)
                .eq('id', orderId)
                .single()
        ]);

        if (!order || error) {
            console.error("❌ Error obteniendo datos de la orden:", error);
            throw new Error("No se pudo obtener la información de la orden");
        }

        // ✅ Desestructurar datos de manera más segura
        const performance = order.performances as any;
        const play = performance.plays;
        const theater = performance.theaters;

        // ✅ Formatear fecha en español
        const eventDate = parseLocalDate(performance.date);
        const formattedDate = eventDate.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            pool: true,
            maxConnections: 1,
        });

        // Crear attachments para cada QR
        const attachments = tickets.map((ticket, index) => ({
            filename: `entrada-${index + 1}.png`,
            content: ticket.qrBase64.split('base64,')[1],
            encoding: 'base64' as const,
            cid: `qr${index}`
        }));

        await transporter.sendMail({
            from: '"La Butaca de Xavi" <tickets@butacaxavi.com>',
            to: order.buyer_email,
            subject: `🎭 Tus entradas para "${play.title}"`,
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tus Entradas</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FFF4E3; font-family: 'Georgia', serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6E0C1B 0%, #8B1526 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #F7C948; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                🎭 La Butaca de Xavi
            </h1>
            <p style="color: #FFF4E3; margin: 10px 0 0 0; font-size: 16px;">
                Tu experiencia teatral comienza aquí
            </p>
        </div>

        <!-- Greeting -->
        <div style="padding: 30px 20px; background-color: #FFF4E3;">
            <h2 style="color: #6E0C1B; margin: 0 0 15px 0; font-size: 24px;">
                ¡Hola, ${order.buyer_name}! 👋
            </h2>
            <p style="color: #333; margin: 0; font-size: 16px; line-height: 1.6;">
                Gracias por tu compra. Tus entradas ya están listas. ¡Nos vemos en el teatro!
            </p>
        </div>

        <!-- Event Details -->
        <div style="background-color: #ffffff; padding: 30px 20px; border-top: 3px solid #F7C948; border-bottom: 3px solid #F7C948;">
            <h3 style="color: #6E0C1B; margin: 0 0 20px 0; font-size: 22px; border-left: 4px solid #F7C948; padding-left: 15px;">
                📅 Detalles del Evento
            </h3>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #FFF4E3;">
                        <strong style="color: #6E0C1B;">🎭 Obra:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #FFF4E3; text-align: right; color: #333;">
                        ${play.title}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #FFF4E3;">
                        <strong style="color: #6E0C1B;">📆 Fecha:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #FFF4E3; text-align: right; color: #333; text-transform: capitalize;">
                        ${formattedDate}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #FFF4E3;">
                        <strong style="color: #6E0C1B;">🕐 Horario:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #FFF4E3; text-align: right; color: #333;">
                        ${performance.time} hs
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #FFF4E3;">
                        <strong style="color: #6E0C1B;">🏛️ Teatro:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #FFF4E3; text-align: right; color: #333;">
                        ${theater.name}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 0;">
                        <strong style="color: #6E0C1B;">📍 Dirección:</strong>
                    </td>
                    <td style="padding: 12px 0; text-align: right; color: #333;">
                        ${theater.address}
                    </td>
                </tr>
            </table>

            ${theater.map_url ? `
            <div style="margin-top: 20px; text-align: center;">
                <a href="${theater.map_url}" 
                   style="display: inline-block; background-color: #F7C948; color: #FFFFFF; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 14px;">
                    📍 Ver en el mapa
                </a>
            </div>
            ` : ''}
        </div>

        <!-- QR Codes -->
        <div style="background-color: #FFF4E3; padding: 30px 20px;">
            <h3 style="color: #6E0C1B; margin: 0 0 10px 0; font-size: 22px; border-left: 4px solid #F7C948; padding-left: 15px;">
                🎫 Tus Entradas
            </h3>
            <p style="color: #666; margin: 0 0 25px 0; font-size: 14px; padding-left: 19px;">
                Presentá estos códigos QR en el ingreso del teatro
            </p>
            
            ${tickets.map((ticket, index) => `
                <div style="background-color: #ffffff; margin-bottom: 20px; padding: 25px; border-radius: 12px; border: 2px solid #F7C948; box-shadow: 0 3px 10px rgba(110, 12, 27, 0.1);">
                    <div style="text-align: center;">
                        <div style="background-color: #FFF4E3; padding: 15px; border-radius: 8px; display: inline-block; margin-bottom: 15px;">
                            <img src="cid:qr${index}" 
                                 alt="Código QR Entrada ${index + 1}" 
                                 style="display: block; width: 200px; height: 200px; margin: 0 auto;" />
                        </div>
                        <p style="margin: 0; font-weight: bold; color: #6E0C1B; font-size: 16px;">
                            🎭 Entrada ${index + 1}
                        </p>
                        <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
                            Sección: <strong style="color: #6E0C1B;">${ticket.sectionName}</strong>
                        </p>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Important Info -->
        <div style="background-color: #6E0C1B; padding: 25px 20px; color: #FFF4E3;">
            <h4 style="color: #F7C948; margin: 0 0 15px 0; font-size: 18px;">
                ℹ️ Información Importante
            </h4>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Llegá con al menos 15 minutos de anticipación</li>
                <li>Presentá el código QR en tu teléfono o impreso</li>
                <li>Cada entrada es personal e intransferible</li>
                <li>No se permite el ingreso una vez iniciada la función</li>
            </ul>
        </div>

        <!-- Footer -->
        <div style="background-color: #FFF4E3; padding: 30px 20px; text-align: center; border-top: 3px solid #F7C948;">
            <p style="color: #6E0C1B; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
                ¿Tenés alguna consulta?
            </p>
            <p style="color: #666; margin: 0 0 20px 0; font-size: 14px;">
                Estamos para ayudarte. Contactanos cuando quieras.
            </p>
            <p style="color: #999; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} La Butaca de Xavi. Todos los derechos reservados.
            </p>
        </div>

    </div>
</body>
</html>
            `,
            attachments
        });

        // ✅ Cerrar transporter
        transporter.close();

        // ✅ Actualizar estado del email en la BD
        await supabase
            .from('orders')
            .update({ send_email: true })
            .eq('id', orderId);

        console.log(`✅ Email enviado correctamente a: ${order.buyer_email}`);

    } catch (error) {
        console.error("❌ Error enviando email:", error);
        throw error;
    }
}