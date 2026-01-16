import { createClient } from "@/lib/supabase/server";
import { Order } from "@/types/admin";


export async function getOrders(): Promise<Order[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('orders')
        .select(`
            id,
            buyer_name,
            buyer_email,
            buyer_phone,
            buyer_dni,
            subtotal,
            discount_amount,
            total,
            status,
            send_email,
            created_at,
             performances(
                    id,
                    date,
                    time,
                    plays(
                        title
                    )
                ),
            tickets(
                id,
                qr_code,
                scanned,
                scanned_at,
                performances_sections(
                    name
                )
            ),
            discount_types(
                type
            )
        `)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
        throw new Error("No se pudieron obtener las órdenes");
    }

    if (!data || data.length === 0) {
        return [];
    }

    return (data as any).map((order:any) => {
        // Tomar el primer ticket para obtener performance y play
        const performance = order?.performances;
        const play = performance?.plays;

        if (!performance || !play) {
            console.warn(`Order ${order.id} tiene tickets sin performance o play`);
        }

        return {
            id: order.id,
            play: play?.title || 'Sin obra asignada',
            performance: {
                id: performance?.id || '',
                date: performance?.date || '',
                time: performance?.time || ''
            },
            customerName: order.buyer_name,
            customerEmail: order.buyer_email,
            customerPhone: order.buyer_phone,
            customerDni: order.buyer_dni,
            ticketQuantity: order.tickets?.length || 0,
            discountType: order.discount_types?.type || 'Sin descuento',
            subtotal: order.subtotal,
            discount: order.discount_amount || 0,
            total: order.total,
            status: order.status as "pending" | "paid" | "cancelled",
            tickets: order.tickets?.map((ticket:any)=> ({
                id: ticket.id,
                qrCode: ticket.qr_code,
                scanned: ticket.scanned,
                scannedAt: ticket.scanned_at ? new Date(ticket.scanned_at) : undefined,
                seatNumber: null,
                sectionName: ticket.performances_sections?.name || 'Sin sección'
            })) || [],
            createdAt: new Date(order.created_at)
        } satisfies Order;
    });
}
