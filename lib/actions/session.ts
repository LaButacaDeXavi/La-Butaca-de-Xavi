'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { parseLocalDate } from '../cart-utils'

// Tipos para mejor type safety
interface Promotion {
    id: string
    name: string
    type: '2x1' | '3x2' | 'fixed' | 'percentage'
    value: number | null
    validFrom: string
    validUntil: string
    isActive: boolean
    minTickets: number | null
    maxUsesPerOrder: number | null
}

interface CheckoutItem {
    quantity: number
    subtotal: number
    unit_price: number
}

export async function createCheckoutSession(performanceId: string) {
    const supabase = await createClient()
    const cookiesStorage = await cookies()

    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

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
    cookiesStorage.set('eventId', performanceId, {
        httpOnly: true,
        sameSite: 'strict',
        path: '/'
    })
    cookiesStorage.set('checkout_session', sessionToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10
    })

    return { sessionId: data.id }
}

export async function getActiveCheckoutSession() {
    const cookiesStorage = await cookies()
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

export const validatePromotion = async (performanceId: string): Promise<Promotion | null> => {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('performances_discounts')
        .select(`
            discount_types(
                id,
                name,
                type,
                value,
                valid_from,
                valid_until,
                is_active,
                min_tickets,
                max_uses_per_order
            )
        `)
        .eq('performances_id', performanceId)
        .single()

    if (error || !data || !data.discount_types) return null

    const promotion: any = data.discount_types

    if (!promotion.is_active) return null

    const dateStr = promotion.valid_from
    const dateEnd = promotion.valid_until

    if (!dateStr || !dateEnd) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const validFrom = parseLocalDate(dateStr)
    const validUntil = parseLocalDate(dateEnd)

    validFrom.setHours(0, 0, 0, 0)
    validUntil.setHours(23, 59, 59, 999)

    const validPromotion = today >= validFrom && today <= validUntil

    if (!validPromotion) return null

    // Validar minTickets según el tipo de promoción
    let minTickets = promotion.min_tickets

    // Para 2x1, el mínimo debe ser al menos 2
    if (promotion.type === '2x1' && (!minTickets || minTickets < 2)) {
        minTickets = 2
    }

    // Para 3x2, el mínimo debe ser al menos 3
    if (promotion.type === '3x2' && (!minTickets || minTickets < 3)) {
        minTickets = 3
    }

    return {
        id: promotion.id,
        name: promotion.name,
        type: promotion.type,
        value: promotion.value,
        validFrom: promotion.valid_from,
        validUntil: promotion.valid_until,
        isActive: promotion.is_active,
        minTickets: minTickets,
        maxUsesPerOrder: promotion.max_uses_per_order,
    }
}

// Función para calcular el descuento según el tipo de promoción
function calculateDiscount(
    promotion: Promotion,
    items: CheckoutItem[],
    subtotal: number
): number {
    // Calcular cantidad total de tickets
    const totalTickets = items.reduce((sum, item) => sum + item.quantity, 0)

    // Validar tickets mínimos
    if (promotion.minTickets && totalTickets < promotion.minTickets) {
        return 0 // No aplica el descuento si no cumple el mínimo
    }

    let discount = 0

    switch (promotion.type) {
        case '2x1': {
            const sortedItems = [...items].sort((a, b) => a.unit_price - b.unit_price)

            let remainingUses = promotion.maxUsesPerOrder ?? Infinity

            for (const item of sortedItems) {
                if (remainingUses <= 0) break

                const pairs = Math.floor(item.quantity / 2) // Cantidad de pares en esta sección
                const applicablePairs = Math.min(pairs, remainingUses) // Limitar por usos restantes

                discount += applicablePairs * item.unit_price
                remainingUses -= applicablePairs
            }
            break
        }

        case 'fixed': {
            if (promotion.value) {
                discount = subtotal - promotion.value
                discount = Math.min(discount, subtotal)
            }
            break
        }

        case 'percentage': {
            if (promotion.value) {
                const percentageDiscount = (subtotal * promotion.value) / 100
                discount = percentageDiscount

                discount = Math.min(discount, subtotal)
            }
            break
        }

        default:
            discount = 0
    }

    // Asegurar que el descuento no sea negativo ni mayor al subtotal
    return Math.max(0, Math.min(discount, subtotal))
}

export async function upsertCheckoutItem(
    performanceId: string,
    sectionId: string,
    quantity: number
) {
    const supabase = await createClient()
    const session = await getActiveCheckoutSession()
    if (!session) throw new Error('Sesión inválida')

    const [{ data: section }, { data: reserved }] = await Promise.all([
        supabase
            .from('performances_sections')
            .select('available_seats, price')
            .eq('id', sectionId)
            .single(),
        supabase
            .from('checkout_items')
            .select('quantity, checkout_sessions!inner(status, expires_at)')
            .eq('section_id', sectionId)
            .eq('checkout_sessions.status', 'active')
            .gt('checkout_sessions.expires_at', new Date().toISOString())
            .neq('checkout_session_id', session.id)
    ])
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
    await recalcCheckoutTotals(performanceId, session.id)
}

async function recalcCheckoutTotals(performanceId: string, sessionId: string) {
    const supabase = await createClient()

    const [{ data: items }, promotion] = await Promise.all([
        supabase
            .from('checkout_items')
            .select('quantity, subtotal, unit_price')
            .eq('checkout_session_id', sessionId),
        validatePromotion(performanceId)
    ])

    const subtotal = items?.reduce((a, b) => a + b.subtotal, 0) ?? 0

    // Calcular descuento según la promoción
    let discountAmount = 0
    if (promotion && items && items.length > 0) {
        discountAmount = calculateDiscount(promotion, items, subtotal)
    }

    const total = subtotal - discountAmount

    await supabase
        .from('checkout_sessions')
        .update({
            subtotal,
            discount_amount: discountAmount,
            total,
            discount_type_id: promotion?.id ?? null,
            updated_at: new Date()
        })
        .eq('id', sessionId)
}

export async function clearCheckout() {
    const cookiesStorage = await cookies()
    const supabase = await createClient()
    const session = await getActiveCheckoutSession()
    if (!session) return

    await supabase
        .from('checkout_sessions')
        .update({ status: 'expired' })
        .eq('id', session.id)

    cookiesStorage.delete('checkout_session')
}