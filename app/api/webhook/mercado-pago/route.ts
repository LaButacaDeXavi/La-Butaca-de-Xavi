import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import crypto from "crypto"
import QRCode from "qrcode";
import nodemailer from "nodemailer";


const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? "";
const bearer = process.env.MERCADO_PAGO_ACCESS_TOKEN

export async function POST(req: Request) {

    const rawBody = await req.text();
    const signatureHeader = req.headers.get("x-signature");
    const requestId = req.headers.get("x-request-id");

    // 🔍 LOGS DE DEBUG
    console.log("=== WEBHOOK DEBUG ===");
    console.log("Signature Header:", signatureHeader);
    console.log("Request ID:", requestId);
    console.log("Raw Body:", rawBody);
    console.log("Secret (primeros 10 chars):", secret.substring(0, 10));

    if (!signatureHeader || !requestId) {
        console.log("❌ Falta signature o requestId");
        return new Response("Unauthorized", { status: 401 });
    }

    const parts = signatureHeader.split(",");
    const ts = parts.find(p => p.startsWith("ts="))?.split("=")[1];
    const v1 = parts.find(p => p.startsWith("v1="))?.split("=")[1];

    console.log("Timestamp:", ts);
    console.log("v1 (firma recibida):", v1);

    if (!ts || !v1) {
        console.log("❌ No se pudo extraer ts o v1");
        return new Response("Unauthorized", { status: 401 });
    }
    const data = JSON.parse(rawBody);
    const paymentId = data.id;

    const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;

    console.log("Manifest construido:", manifest);

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(manifest)
        .digest("hex");

    console.log("Firma esperada:", expectedSignature);
    console.log("Firma recibida:", v1);
    console.log("¿Coinciden?:", expectedSignature === v1);

    if (expectedSignature !== v1) {
        console.log("❌ Las firmas NO coinciden");
        return new Response("Unauthorized", { status: 401 });
    }

    console.log("✅ Firma verificada correctamente");


    const supabase = createClient();


    const typePayment = data.type ?? ""


    if (typePayment !== "payment" || !paymentId) return NextResponse.json('Todo ok', { status: 200 });

    console.log("DataMP", data)

    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearer ?? ""}`
        }
    })

    const paymentData = await res.json();

    const { data: order, error } = await supabase
        .from('orders')
        .select('')
        .eq('id', paymentData.external_reference)
        .select(`
            id,
            status,
            buyer_email,
            orders_sections(
            quantity,
            section_id
            )
            `)
        .single()


    if (!order || error) {
        console.log("error buscar orden", error)
        return NextResponse.json('Pago no encontrado', { status: 404 });
    }

    if (order && order.status === 'pending' && paymentData.status === "approved") {

        await supabase
            .from('orders')
            .update({
                status: 'paid'
            })
            .eq('id', order.id)


        const ticketsToInsert = [];

        for (const section of order.orders_sections) {
            for (let i = 0; i < section.quantity; i++) {
                ticketsToInsert.push({
                    order_id: order.id,
                    section_id: section.section_id,
                    qr_code: crypto.randomUUID(),
                    scanned: false,
                });
            }
        }

        const { error: ticketsError } = await supabase
            .from('tickets')
            .insert(ticketsToInsert)

        const { data: tickets } = await supabase
            .from("tickets")
            .select(`
                 qr_code,
                 performances_sections(
                 name)
                 `)
            .eq("order_id", order.id);

        if (ticketsError || !tickets) {
            console.log("error creando tickers", error)
            return NextResponse.json('Error creando tickets', { status: 500 });
        }

        const ticketsWithQr = await Promise.all(
            tickets.map(async (ticket) => {
                const qrBase64 = await QRCode.toDataURL(ticket.qr_code);

                return {
                    qrBase64,
                    sectionName: ticket.performances_sections[0].name,
                };
            })
        );

        //falta descontar stock

        await sendMail(ticketsWithQr, order.buyer_email)



    }

    return NextResponse.json('Todo ok', { status: 200 });
}


export async function GET() {
    return new Response("OK", { status: 200 });
}

export async function OPTIONS() {
    return new Response("OK", { status: 200 });
}


async function sendMail(tickets: any[], email: string) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: '"Butaca Xavi" <tickets@butacaxavi.com>',
        to: email,
        subject: "Tus entradas",
        html: `
      <h2>Gracias por tu compra</h2>
      <p>Presentá estos códigos QR en el ingreso</p>

      ${tickets
                .map(
                    (t) => `
        <div style="margin-bottom:24px">
          <img src="${t.qrBase64}" width="200" />
          <p>Sección: ${t.sectionName}</p>
        </div>
      `
                )
                .join("")}
    `,
    });
}
