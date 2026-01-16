"use server"

import { createClient } from "@/lib/supabase/server"
import type { ScanResult } from "@/types/admin"

export async function scanTicket(code: string): Promise<ScanResult> {
    const supabase = await createClient();

    try {
        // Buscar el ticket
        const { data: ticket, error } = await supabase
            .from('tickets')
            .select(`
                id,
                scanned,
                scanned_at,
                performances_sections(
                    name
                ),
                orders(
                    id,
                    buyer_name,
                    buyer_email,
                    performances(
                        id,
                        date,
                        time,
                        plays(
                            id,
                            title
                        )
                    )
                )
            `)
            .eq('qr_code', code)
            .single()

        if (error || !ticket) {
            return {
                success: false,
                message: "QR inválido o no encontrado en el sistema"
            }
        }

        // ✅ Extraer datos correctamente (Supabase devuelve objetos/arrays según la relación)
        const order = ticket.orders as any;
        const performance = order.performances as any;
        const play = performance.plays as any;
        const section = ticket.performances_sections as any;

        console.log('Ticket completo:', ticket);
        console.log('Play title:', play?.title);

        if (ticket.scanned) {
            return {
                success: false,
                message: "Este ticket ya fue escaneado anteriormente",
                ticket: {
                    id: ticket.id,
                    orderId: order.id,
                    customerName: order.buyer_name,
                    customerEmail: order.buyer_email,
                    section: section?.name || 'Sin sección',
                    date: performance.date,
                    time: performance.time,
                    showTitle: play.title,
                    alreadyScanned: true,
                    scannedAt: ticket.scanned_at
                }
            }
        }

        // Marcar como escaneado
        const { error: updateError } = await supabase
            .from('tickets')
            .update({
                scanned: true,
                scanned_at: new Date().toISOString()
            })
            .eq('id', ticket.id)

        if (updateError) {
            throw updateError
        }

        return {
            success: true,
            message: "Ticket validado correctamente",
            ticket: {
                id: ticket.id,
                orderId: order.id,
                customerName: order.buyer_name,
                customerEmail: order.buyer_email,
                section: section?.name || 'Sin sección',
                showTitle: play.title,
                date: performance.date,
                time: performance.time,
                alreadyScanned: false
            }
        }
    } catch (error) {
        console.error("Error al escanear ticket:", error)
        return {
            success: false,
            message: "Error al procesar el ticket"
        }
    }
}