"use server"

import { requireAdmin } from "@/lib/supabase/middlewareRole"
import { createClient } from "@/lib/supabase/server"
import type { Promotion } from "@/types/admin"

const TABLE = "discount_types"

export type PromotionPayload = Omit<Promotion, "id"> & {
    id?: string
}

const sanitizePayload = (promotion: PromotionPayload) => {
    const {
        name,
        description,
        type,
        value,
        requires_code,
        max_uses_per_order,
        min_tickets,
        is_active,
        valid_from,
        valid_until,
    } = promotion

    return {
        name: name.trim(),
        description: description.trim(),
        type,
        value: type === "2x1" ? null : value,
        requires_code: null,
        max_uses_per_order: max_uses_per_order < 0 ? 0 : max_uses_per_order,
        min_tickets: type === "2x1" && min_tickets < 2 ? 2 : value,
        is_active,
        valid_from: valid_from ,
        valid_until: valid_until 
    }
}

export async function createPromotion(promotion: PromotionPayload) {
    try {
        await requireAdmin()
        const supabase = await createClient()

        if (!promotion.name?.trim()) {
            return { success: false, message: "El nombre es requerido" }
        }

        const payload = sanitizePayload(promotion)

        const { data, error } = await supabase
            .from(TABLE)
            .insert(payload)
            .select("id")
            .single()

        if (error || !data) {
            console.error(error)
            return { success: false, message: "Error al crear la promoción" }
        }

        return {
            success: true,
            promotion_id: data.id,
            message: "Promoción creada correctamente"
        }
    } catch (error) {
        console.error("createPromotion error", error)
        return { success: false, message: "Error interno del servidor" }
    }
}

export async function updatePromotion(promotion: PromotionPayload & { id: string }) {
    try {
        await requireAdmin()
        const supabase = await createClient()

        if (!promotion.id?.trim()) {
            return { success: false, message: "El id es requerido" }
        }

        if (!promotion.name?.trim()) {
            return { success: false, message: "El nombre es requerido" }
        }

        const payload = sanitizePayload(promotion)

        const { error } = await supabase
            .from(TABLE)
            .update(payload)
            .eq("id", promotion.id)

        if (error) {
            console.error(error)
            return { success: false, message: "Error al actualizar la promoción" }
        }

        return {
            success: true,
            message: "Promoción actualizada correctamente"
        }
    } catch (error) {
        console.error("updatePromotion error", error)
        return { success: false, message: "Error interno del servidor" }
    }
}

export async function deletePromotion(id: string) {
    try {
        await requireAdmin()
        const supabase = await createClient()

        if (!id?.trim()) {
            return { success: false, message: "El id es requerido" }
        }

        const { error } = await supabase
            .from(TABLE)
            .delete()
            .eq("id", id)

        if (error) {
            console.error(error)
            return { success: false, message: "Error al eliminar la promoción" }
        }

        return { success: true, message: "Promoción eliminada correctamente" }
    } catch (error) {
        console.error("deletePromotion error", error)
        return { success: false, message: "Error interno del servidor" }
    }
}

export async function getPromotions(): Promise<{ promotions: Promotion[] }> {
    try {
        await requireAdmin()
        const supabase = await createClient()

        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .order("created_at", { ascending: false })

        if (error || !data) {
            console.error(error)
            return { promotions: [] }
        }

        const promotions: Promotion[] = data.map(promotion => ({
            ...promotion,
            valid_from: promotion.valid_from,
            valid_until: promotion.valid_until
        }))

        return { promotions }
    } catch (error) {
        console.error("getPromotions error", error)
        return { promotions: [] }
    }
}
