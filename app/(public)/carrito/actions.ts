"use server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function getDataSession() {
    const cookiesStorage = await cookies()
    const token = cookiesStorage.get('checkout_session')?.value
    if (!token) return null

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('checkout_sessions')
        .select(`
            subtotal,
            discount_amount,
            total,
            discount_types(
                type,
                value
            ),
            checkout_items(
                quantity,
                unit_price,
                subtotal,
                performances_sections(
                    name
                )
            ),
            performances(
                id,
                date,
                time,
                plays(
                    title,
                    main_image_url
                )
            )
        `)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .eq('session_token', token)
        .single()


    if (error || !data) {
        console.error("Error fetching session:", error)
        return null
    }
    //const dataFormated = { ...data, discount_types: data?.discount_types[0], performances: {...data?.performances[0],plays:data?.performances[0]?.plays[0]} ,checkout_items:{...data.checkout_items,performances_sections:data?.checkout_items[0]?.performances_sections[0]}}

    return data
}