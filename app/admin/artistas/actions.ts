"use server"

import { requireAdmin } from "@/lib/supabase/middlewareRole";
import { createClient } from "@/lib/supabase/server"
import { Artist } from "@/types/admin";
import { deleteFromStorage } from "@/lib/supabase/storage"

const TABLE = "artists"

const mapSocialUrls = (artist: Partial<ArtistCreatePayload>) => ({
    name: artist.name ?? null,
    avatar_url: artist.avatar_url ?? null,
    instagram_url: artist.instagram_url ?? undefined,
    twitter_url: artist.twitter_url ?? undefined,
    facebook_url: artist.facebook_url ?? undefined
})

type ArtistCreatePayload = {
    name: string
    avatar_url: string
    instagram_url?: string | null
    facebook_url?: string | null
    twitter_url?: string | null
    removeImages?: string[]
}

type ArtistUpdatePayload = ArtistCreatePayload & {
    id: string
}

export type { ArtistCreatePayload, ArtistUpdatePayload }

export async function createArtist(artist: ArtistCreatePayload) {
    try {
        await requireAdmin()
        const supabase = await createClient()

        if (!artist.name?.trim() || !artist.avatar_url?.trim()) {
            return { success: false, message: "El Nombre e Imagen son requeridos" }
        }

        const payload = mapSocialUrls(artist)

        const { data, error } = await supabase
            .from(TABLE)
            .insert({
                ...payload,
                avatar_url: artist.avatar_url
            })
            .select("id")
            .single()

        if (error || !data) {
            console.error(error)
            return { success: false, message: "Error al Guardar" }
        }

        return {
            success: true,
            message: "Creado Correctamente",
            artist_id: data.id
        }
    } catch (error) {
        console.error("Error al crear:", error)
        return {
            success: false,
            message: "Error en el Servidor al Crear"
        }
    }
}

export async function updateArtist(artist: ArtistUpdatePayload) {
    try {
        await requireAdmin()
        const supabase = await createClient()

        if (!artist.id?.trim() || !artist.name?.trim() || !artist.avatar_url?.trim()) {
            return { success: false, message: "El Id, Nombre e Imagen son requeridos" }
        }

        const payload = mapSocialUrls(artist)

        const { error } = await supabase
            .from(TABLE)
            .update({
                ...payload,
                avatar_url: artist.avatar_url
            })
            .eq("id", artist.id)

        if (error) {
            console.error(error)
            return { success: false, message: "Error al Editar" }
        }

        if (artist.removeImages?.length) {
            await deleteFromStorage(artist.removeImages)
        }

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

export async function deleteArtist(idArtist: string, imagesToDelete: string[] = []) {
    try {
        await requireAdmin()
        const supabase = await createClient()
        if (!idArtist) return { success: false, message: "El Id es requerido" }

        const { error } = await supabase
            .from(TABLE)
            .delete()
            .eq("id", idArtist)

        if (error) {
            console.error(error)
            return { success: false, message: "Error al Borrar" }
        }

        if (imagesToDelete.length) {
            await deleteFromStorage(imagesToDelete)
        }

        return {
            success: true,
            message: "Eliminado Correctamente"
        }
    } catch (error) {
        console.error("Error al borrar", error)
        return {
            success: false,
            message: "Error al Borrar"
        }
    }
}

export async function getArtists() {
    await requireAdmin()
    const supabase = await createClient()
    const { data } = await supabase
        .from(TABLE)
        .select("id,name,instagram_url,twitter_url,facebook_url,avatar_url")

    return { artists: data || [] }
}
