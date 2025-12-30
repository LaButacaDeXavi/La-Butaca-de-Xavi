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
        *,
        orders (
          id,
          buyer_name,
          buyer_email
        ),
        shows (
          id,
          show_date,
          show_hour,
          plays (
            id,
            title
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

        if (ticket.scanned) {
            return {
                success: false,
                message: "Este ticket ya fue escaneado anteriormente",
                ticket: {
                    id: ticket.id,
                    orderId: ticket.order_id,
                    customerName: `${ticket.orders.buyer_name}, ${ticket.orders.buyer_email}`,
                    date: ticket.shows.show_date,
                    time: ticket.shows.show_hour,
                    showTitle: ticket.functions.shows.title,
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
                orderId: ticket.order_id,
                customerName: `${ticket.orders.buyer_name}, ${ticket.orders.buyer_email}`,
                showTitle: ticket.functions.shows.title,
                date: ticket.shows.show_date,
                time: ticket.shows.show_hour,
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