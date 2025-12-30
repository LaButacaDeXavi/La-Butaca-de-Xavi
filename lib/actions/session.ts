'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function createCheckoutSession(performanceId: string) {
    const supabase = await createClient();
    const cookiesStorage = await cookies();

    const sessionToken = crypto.randomBytes(32).toString('hex')

    const expiresAt = new Date(Date.now() + 20 * 60 * 1000)

    const { data, error } = await supabase
        .from('checkout_sessions')
        .insert({
            session_token: sessionToken,
            performance_id: performanceId,
            expires_at: expiresAt
        })
        .select('id')
        .single()

    if (error) throw error

    cookiesStorage.set('checkout_session', sessionToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10
    })

    return { sessionId: data.id }
}


export async function getActiveCheckoutSession() {

    const cookiesStorage = await cookies();
    const token = cookiesStorage.get('checkout_session')?.value
    if (!token) return null

    const supabase = await createClient()

    const { data } = await supabase
        .from('checkout_sessions')
        .select('*')
        .eq('session_token', token)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single()

    return data
}


export async function upsertCheckoutItem(
    sectionId: string,
    quantity: number
) {
    const supabase = await createClient()
    const session = await getActiveCheckoutSession()
    if (!session) throw new Error('Sesión inválida')

    // Traer sección
    const { data: section } = await supabase
        .from('performances_sections')
        .select('available_seats, price')
        .eq('id', sectionId)
        .single()

    const { data: reserved } = await supabase
        .from('checkout_items')
        .select('quantity')
        .eq('section_id', sectionId)

    const reservedQty = reserved?.reduce((a, b) => a + b.quantity, 0) ?? 0

    if (section && section.available_seats - reservedQty < quantity) {
        throw new Error('No hay disponibilidad')
    }

    const subtotal = quantity * (section?.price ?? 0)

    await supabase.from('checkout_items').upsert({
        checkout_session_id: session.id,
        performance_id: session.performance_id,
        section_id: sectionId,
        quantity,
        unit_price: (section?.price ?? 0),
        subtotal
    })

    // Recalcular totales
    await recalcCheckoutTotals(session.id)
}


async function recalcCheckoutTotals(sessionId: string) {
    const supabase = await createClient()

    const { data: items } = await supabase
        .from('checkout_items')
        .select('subtotal')
        .eq('checkout_session_id', sessionId)

    const subtotal = items?.reduce((a, b) => a + b.subtotal, 0) ?? 0

    await supabase
        .from('checkout_sessions')
        .update({
            subtotal,
            total: subtotal, // luego aplicás descuentos
            updated_at: new Date()
        })
        .eq('id', sessionId)
}



export async function clearCheckout() {
    const cookiesStorage = await cookies();
    const supabase = await createClient();
    const session = await getActiveCheckoutSession();
    if (!session) return

    await supabase
        .from('checkout_sessions')
        .update({ status: 'expired' })
        .eq('id', session.id)

    cookiesStorage.delete('checkout_session')
}


