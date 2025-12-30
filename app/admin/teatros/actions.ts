"use server"

import { requireAdmin } from "@/lib/supabase/middlewareRole";
import { createClient } from "@/lib/supabase/server"
import { Theater } from "@/types/admin";

export async function createTheaters(theater: Omit<Theater, "id">) {

    try {
        await requireAdmin();
        const supabase = await createClient();

        if (!theater.name?.trim() || !theater.city?.trim() || !theater.address?.trim()) return { success: false, message: "El Nombre, Ciudad y Direccion son requeridos" }

        const { data, error } = await supabase
            .from('theaters')
            .insert({
                name: theater.name,
                city: theater.city,
                address: theater.address,
                map_url: theater.mapUrl || null,
            })
            .select()
            .single()
        if (error) return { success: false, message: "Error al Guardar" }

        return {
            success: true,
            message: "Creado Correctamente",
            theater_id: data.id
        }

    } catch (error) {
        console.error("Error al crear:", error)
        return {
            success: false,
            message: "Error en el servidor al Crear"
        }
    }

}


export async function updateTheaters(theater: Partial<Theater>) {
    try {
        await requireAdmin();
        const supabase = await createClient();

        if (!theater.id?.trim() || !theater.name?.trim() || !theater.city?.trim() || !theater.address?.trim()) return { success: false, message: "El Id, Nombre, Ciudad y Direccion son requeridos" }

        const { error } = await supabase
            .from('theaters')
            .update({
                name: theater.name,
                city: theater.city,
                address: theater.address,
                map_url: theater.mapUrl || null,
            })
            .eq('id', theater.id)
        console.log(error)
        if (error) return { success: false, message: "Error al Editar" }

        return {
            success: true,
            message: "Editado Correctamente"
        }

    } catch (error) {
        console.error("Error al editar:", error)
        return {
            success: false,
            message: "Error en el Servidor al Editar"
        }
    }

}


export async function deleteTheaters(idTheater: string) {
    try {
        await requireAdmin();
        const supabase = await createClient();
        if (!idTheater) return { success: false, message: "El Id es requerido" }

        const { error } = await supabase
            .from('theaters')
            .delete()
            .eq('id', idTheater)
        if (error) return { success: false, message: "Error al Borrar" }

        return {
            success: true,
            message: "Eliminado Correctamente"
        }

    } catch (error) {
        console.error("Error al Borrar", error)
        return {
            success: false,
            message: "Error al Borrar"
        }
    }

}

export async function getTheaters() {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const { data } = await supabase
            .from('theaters')
            .select(`
                id,
                name,
                city,
                address,
                mapUrl:map_url
                `)

        return { theaters: data }
    } catch (error) {
        return {
            theaters: []
        }
    }

}
