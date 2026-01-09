import { OrdenesPage } from "./ordenes";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";


export default async function Orders() {
  const supabase = createClient();

  const { data: ordersData, error } = await supabase
    .from('orders')
    .select(`
            id,
            customerName:buyer_name,
            customerEmail:buyer_email,
            customerPhone:buyer_phone,
            customerDni:buyer_dni,
            totalAmount:subtotal,
            discount:discount_amount,
            finalAmount:total,
            status,
            created_at,
            performances(
            date,
            time,
            play:plays(
            title
            )),
            tickets(
            section:performances_sections(
            id,
            name,
            price
            ),
            qr_code,
            scanned,
            scanned_at
            )
            `).order('created_at', { ascending: false })

  console.log(error)
  const orders: any = ordersData ?? []

  return <OrdenesPage orders={orders} />
}
