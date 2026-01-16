"use server"
import { cookies } from "next/headers"
import { createClient } from "../supabase/server"
import crypto from 'crypto'

interface checkoutData {
    phone: string,
    fullName: string,
    email: string,
    dni: string
}

export async function createCheckout({ dni, email, fullName, phone }: checkoutData) {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const cookiesStorage = await cookies()
    const supabase = await createClient()
    const token = cookiesStorage.get("checkout_session")?.value

    if (!dni || !email || !fullName || !phone) throw new Error("Complete todos los campos.")

    if (!accessToken || !token) {
        throw new Error("Error al crear checkout")
    }

    const { data, error } = await supabase
        .from("checkout_sessions")
        .select(`
            subtotal,
            checkout_items(
            section_id,
            quantity
            ),
            discount_amount,
            total,
            performances(
                id,
                date,
                time,
                plays(
                    title
                )
            ),
            discount_types(
            id)
        `)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .eq("session_token", token)
        .single()

    if (error || !data) {
        throw new Error("Session vencida o no encontrada")
    }

    const discountTypeId = (data.discount_types as any).id
    const performancesId = (data.performances as any).id
    const title = ((data.performances as any).plays as any)?.title
    const subtotal = data.subtotal
    const discountAmount = data.discount_amount
    const total = data.total

    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            buyer_name: fullName,
            buyer_email: email,
            buyer_phone: phone,
            buyer_dni: dni,
            total,
            subtotal,
            discount_amount: discountAmount,
            discount_type_id: discountTypeId,
            performances_id: performancesId,
            status: "pending",
        })
        .select()
        .single();
    
    if (orderError) throw new Error('Error al crear el pago')

    const orderItems = data.checkout_items.map(item => ({
        orders_id: order.id,
        section_id: item.section_id,
        quantity: item.quantity,
    }));

    const { error: errorOrderItems } = await supabase
        .from('orders_sections')
        .insert(orderItems)

    if (errorOrderItems) throw new Error('Error al crear el pago')

    // ⏱️ Expiración en 10 minutos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const response = await fetch(
        "https://api.mercadopago.com/checkout/preferences",
        {
            method: "POST",
            headers: {
                "X-Idempotency-Key": `${order.id ?? crypto.randomBytes(32).toString('hex')}`,
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                external_reference: order.id,
                items: [
                    {
                        title,
                        unit_price: Number(total),
                        quantity: 1,
                        currency_id: "ARS",
                    },
                ],

                // ✅ Restricciones de pago
                payment_methods: {
                    excluded_payment_types: [
                        { id: "ticket" },      // rapipago, pagofacil, etc
                        { id: "atm" },         // transferencias
                    ],
                    installments: 1, // crédito solo 1 cuota
                },

                // ⏱️ Expiración
                expires: true,
                expiration_date_to: expiresAt,

                // 🔔 Webhook
                notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/mercado-pago`,

                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
                    failure: `${process.env.NEXT_PUBLIC_SITE_URL}/failure`,
                    pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pending`,
                },
                auto_return: "approved",
            }),
        }
    )

    if (!response.ok) {
        const error = await response.text()
        await supabase
            .from('orders')
            .delete()
            .eq('id', order.id)

        console.error("Mercado Pago error:", error)
        throw new Error("Error creando el checkout")
    }

    const preference = await response.json()

    return {
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
    }
}
