"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/supabase/middlewareRole"

interface UpdatePerformanceInput {
    id: string
    theaterId: string
    date: string
    time: string
    status: string
    promotionId?: string | null
    sections: {
        name: string
        price: number
        totalSeats: number
    }[]
}

interface CreatePerformanceInput {
    playId: string
    theaterId: string
    date: string
    time: string
    promotionId?: string | null
    sections: {
        name: string
        price: number
        totalSeats: number
    }[]
    status: string
}

export async function createPerformance(input: CreatePerformanceInput) {
    await requireAdmin();
    const supabase = await createClient()

    if (!input.playId || !input.theaterId) {
        return { success: false, message: "Play y Teatro son obligatorios" }
    }

    if (!input.date || !input.time) {
        return { success: false, message: "Fecha y hora son obligatorias" }
    }

    if (!input.sections || input.sections.length === 0) {
        return { success: false, message: "Debe existir al menos una sección" }
    }

    for (const section of input.sections) {
        if (
            !section.name?.trim() ||
            section.price <= 0 ||
            section.totalSeats <= 0
        ) {
            return {
                success: false,
                message: "Las secciones tienen datos inválidos"
            }
        }
    }

    const { data: performance, error: performanceError } = await supabase
        .from("performances")
        .insert({
            play_id: input.playId,
            theater_id: input.theaterId,
            date: input.date,
            time: input.time,
            status: 'active'
        })
        .select()
        .single()

    if (performanceError || !performance) {
        return {
            success: false,
            message: "Error al crear la función"
        }
    }

    const performanceId = performance.id

    const sectionsPayload = input.sections.map(section => ({
        performances_id: performanceId,
        name: section.name,
        price: section.price,
        total_seats: section.totalSeats,
        available_seats: section.totalSeats
    }))

    const { error: sectionsError } = await supabase
        .from("performances_sections")
        .insert(sectionsPayload)

    if (sectionsError) {
        await supabase.from("performances").delete().eq("id", performanceId)

        return {
            success: false,
            message: "Error al crear las secciones"
        }
    }

    if (input.promotionId) {
        const { error: discountError } = await supabase
            .from("performances_discounts")
            .insert({
                performances_id: performanceId,
                discount_type_id: input.promotionId
            })

        if (discountError) {
            await supabase.from("performance_sections").delete().eq("performance_id", performanceId)
            await supabase.from("performances").delete().eq("id", performanceId)

            return {
                success: false,
                message: "Error al asociar la promoción"
            }
        }
    }

    return {
        success: true,
        message: "Función creada correctamente",
        performanceId
    }
}


export async function updatePerformance(input: UpdatePerformanceInput) {
    const supabase = await createClient()

    if (!input.sections || input.sections.length === 0) {
        return { success: false, message: "Debe haber al menos una sección" }
    }

    const { error: perfError } = await supabase
        .from("performances")
        .update({
            theater_id: input.theaterId,
            date: input.date,
            time: input.time,
            status: input.status
        })
        .eq("id", input.id)

    if (perfError) {
        return { success: false, message: "Error al actualizar la función" }
    }

    /* -------- replace sections -------- */

    await supabase
        .from("performances_sections")
        .delete()
        .eq("performances_id", input.id)

    const sectionsPayload = input.sections.map(s => ({
        performances_id: input.id,
        name: s.name,
        price: s.price,
        total_seats: s.totalSeats,
        available_seats: s.totalSeats
    }))

    const { error: sectionError } = await supabase
        .from("performances_sections")
        .insert(sectionsPayload)

    if (sectionError) {
        return { success: false, message: "Error al actualizar secciones" }
    }


    await supabase
        .from("performances_discounts")
        .delete()
        .eq("performances_id", input.id)

    if (input.promotionId) {
        const { error } = await supabase
            .from("performances_discounts")
            .insert({
                performances_id: input.id,
                discount_type_id: input.promotionId
            })

        if (error) {
            return { success: false, message: "Error al actualizar promoción" }
        }
    }

    return {
        success: true,
        message: "Función actualizada correctamente"
    }
}



export async function deletePerformance(id: string) {
    const supabase = await createClient()

    await supabase
        .from("performances_sections")
        .delete()
        .eq("performances_id", id)

    await supabase
        .from("performances_discounts")
        .delete()
        .eq("performances_id", id)

    const { error } = await supabase
        .from("performances")
        .delete()
        .eq("id", id)

    if (error) {
        return { success: false, message: "Error al eliminar la función" }
    }

    return {
        success: true,
        message: "Función eliminada correctamente"
    }
}


export async function getPerformances() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("performances")
        .select(`
      id,
      date,
      time,
      status,
      play:plays (
        id,
        title,
        category
      ),
      theater:theaters (
        id,
        name,
        address
      ),
      sections:performances_sections (
        id,
        name,
        price,
        totalSeats:total_seats,
        availableSeats:available_seats
      ),
      discount:performances_discounts (
        promotion:discount_types (
          id,
          name,
          type,
          value,
          is_active
        )
      )
    `)
        .order("date", { ascending: true })

    if (error) {
        console.error(error)
        return { performances: [] }
    }

    const performances = data.map(p => ({
        ...p,
        date: new Date(p.date),
        genre: p.play?.[0]?.category ?? "",
        promotion: p.discount?.[0]?.promotion ?? undefined
    }))

    return { performances }
}

