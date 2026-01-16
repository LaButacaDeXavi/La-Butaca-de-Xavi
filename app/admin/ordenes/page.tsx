import { OrdenesPage } from "./ordenes";
import { createClient } from "@/lib/supabase/client";
import { getOrders } from "./actions";

export const dynamic = "force-dynamic";


export default async function Orders() {

  const orders: any = await getOrders() ?? []

  return <OrdenesPage orders={orders} />
}
