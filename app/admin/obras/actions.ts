"use server"

import { requireAdmin } from "@/lib/supabase/middlewareRole";
import { createClient } from "@/lib/supabase/server"
import { Play } from "@/types/admin";
import { deleteFromStorage } from "@/lib/supabase/storage"

type PlayCreatePayload = Omit<Play, "id" | "artists"> & {
    artistIds?: string[]
}

type PlayUpdatePayload = PlayCreatePayload & {
    id: string
    imagesToDelete?: string[]
}

export type { PlayCreatePayload, PlayUpdatePayload }

export async function createPlay(play: PlayCreatePayload) {
    try {
        await requireAdmin()

        const supabase = await createClient()

        if (
            !play.title?.trim() ||
            !play.genre?.trim() ||
            isNaN(play.duration) ||
            play.duration <= 0 ||
            !play.mainImage?.trim()
        ) {
            return {
                success: false,
                message: "El Título, Género, Duración e Imagen Principal son requeridos"
            }
        }

        const { data, error } = await supabase.rpc('create_play', {
            p_title: play.title,
            p_subtitle: play.subtitle ?? null,
            p_category: play.genre,
            p_description: play.description ?? null,
            p_duration: Number(play.duration),
            p_main_image: play.mainImage,
            p_artist_ids: play.artistIds ?? [],
            p_gallery: play.gallery ?? []
        })

        if (error) {
            console.error(error)
            return { success: false, message: "Error al Guardar" }
        }

        return {
            success: true,
            play_id: data
        }
    } catch (error) {
        console.error("Error al editar:", error)
        return {
            success: false,
            message: "Error en el Servidor al Crear"
        }
    }

}



export async function updatePlay(play: PlayUpdatePayload) {
    try {
        await requireAdmin()
        const supabase = await createClient()

        if (
            !play.id ||
            !play.title?.trim() ||
            !play.genre?.trim() ||
            isNaN(play.duration) ||
            play.duration <= 0 ||
            !play.mainImage?.trim()
        ) {
            return { success: false, message: "Datos inválidos" }
        }
        
        const { error: playError } = await supabase
            .from("plays")
            .update({
                title: play.title,
                subtitle: play.subtitle || null,
                category: play.genre,
                description: play.description || null,
                duration_minutes: play.duration,
                main_image_url: play.mainImage,
            })
            .eq("id", play.id)

        if (playError) {
            return { success: false, message: "Error al Actualizar" }
        }

        await supabase
            .from("play_artists")
            .delete()
            .eq("play_id", play.id)

        if (play.artistIds && play.artistIds.length) {
            const artistRows = play.artistIds.map((a:string) => ({
                play_id: play.id,
                artist_id: a
            }))

            const { error } = await supabase
                .from("play_artists")
                .insert(artistRows)

            if (error) {
                return { success: false, message: "Error al actualizar artistas" }
            }
        }


        await supabase
            .from("play_images")
            .delete()
            .eq("play_id", play.id)

        if (play.gallery?.length) {
            const imageRows = play.gallery.map(url => ({
                play_id: play.id,
                image_url: url
            }))

            const { error } = await supabase
                .from("play_images")
                .insert(imageRows)

            if (error) {
                return { success: false, message: "Error al actualizar galería" }
            }
        }

        if (play.imagesToDelete?.length) {
            await deleteFromStorage(play.imagesToDelete)
        }

        return {
            success: true,
            message: "Obra actualizada correctamente"
        }

    } catch (error) {
        console.error("updatePlay error:", error)
        return {
            success: false,
            message: "Error interno del servidor"
        }
    }
}


export async function deletePlay(idPlay: string) {
    try {
        await requireAdmin();
        const supabase = await createClient();
        if (!idPlay) return { success: false, message: "El Id es requerido" }

        const { data: playData } = await supabase
            .from('plays')
            .select("main_image_url")
            .eq('id', idPlay)
            .single()

        const { data: galleryData } = await supabase
            .from('play_images')
            .select("image_url")
            .eq('play_id', idPlay)

        const { error } = await supabase
            .from('plays')
            .delete()
            .eq('id', idPlay)
        if (error) return { success: false, message: "Error al Borrar" }

        const imagesToDelete = [
            playData?.main_image_url,
            ...(galleryData?.map(g => g.image_url) ?? [])
        ].filter(Boolean) as string[]

        if (imagesToDelete.length) {
            await deleteFromStorage(imagesToDelete)
        }

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



export async function getPlays() {
    try {
        await requireAdmin()
        const supabase = await createClient()

        const { data, error } = await supabase
            .from("plays")
            .select(`
        id,
        title,
        subtitle,
        description,
        duration_minutes,
        category,
        main_image_url,
        play_images (
          image_url
        ),
        play_artists (
          artists (
            id,
            name
          )
        )
      `)
            .order("created_at", { ascending: false })

        if (error || !data) {
            console.error(error)
            return { plays: [] }
        }

        const plays: Play[] = data.map(play => ({
            id: play.id,
            title: play.title,
            subtitle: play.subtitle ?? undefined,
            description: play.description ?? undefined,
            duration: play.duration_minutes,
            genre: play.category,
            mainImage: play.main_image_url,
            gallery: play.play_images?.map(img => img.image_url) ?? [],
            artists: play.play_artists?.map(pa => ({
                id: (pa.artists as any).id,
                name: (pa.artists as any).name
            })) ?? []
        }))


        return { plays: plays || [] }

    } catch (error) {
        console.error("getPlays error:", error)
        return { plays: [] }
    }
}
