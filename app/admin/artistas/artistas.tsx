"use client"

import type React from "react"

import { FormEvent, useEffect, useState } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, Instagram, Facebook, Twitter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Artist } from "@/types/admin"
import { createArtist, updateArtist, deleteArtist } from "./actions"
import type { ArtistCreatePayload, ArtistUpdatePayload } from "./actions"
import { toast } from "sonner"
import { compressAndUploadImage } from "@/lib/supabase/storage"

interface ArtistProps {
    artists: Artist[]
}

type FormState = {
    name: string
    imageUrl: string
    instagram: string
    facebook: string
    twitter: string
}

type PendingUpload = {
    file: File
    preview: string
}

const emptyFormState: FormState = {
    name: "",
    imageUrl: "",
    instagram: "",
    facebook: "",
    twitter: "",
}

export default function ArtistasPage({ artists: initialArtists }: ArtistProps) {
    const [loading, setLoading] = useState(false)
    const [artists, setArtists] = useState<Artist[]>(initialArtists)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
    const [formData, setFormData] = useState<FormState>({ ...emptyFormState })
    const [upload, setUpload] = useState<PendingUpload | null>(null)
    const [imageToDelete, setImageToDelete] = useState<string | null>(null)

    useEffect(() => {
        return () => {
            if (upload?.preview) URL.revokeObjectURL(upload.preview)
        }
    }, [upload?.preview])

    const openCreateModal = () => {
        clearUploads()
        setFormData({ ...emptyFormState })
        setEditingArtist(null)
        setIsModalOpen(true)
        setImageToDelete(null)
    }

    const clearUploads = () => {
        if (upload?.preview) URL.revokeObjectURL(upload.preview)
        setUpload(null)
    }

    const resetForm = () => {
        clearUploads()
        setFormData({ ...emptyFormState })
        setEditingArtist(null)
        setIsModalOpen(false)
        setImageToDelete(null)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            let avatarUrl = formData.imageUrl
            const imagesToDelete: string[] = []

            if (upload?.file) {
                const uploadedUrl = await compressAndUploadImage(upload.file, "artists/avatar")
                if (!uploadedUrl) {
                    toast.error("No se pudo subir la imagen del artista")
                    return
                }

                avatarUrl = uploadedUrl

                if (editingArtist?.avatar_url) {
                    imagesToDelete.push(editingArtist.avatar_url)
                }
            }

            if (!avatarUrl) {
                toast.error("La imagen es obligatoria")
                return
            }

            const payload: ArtistCreatePayload | ArtistUpdatePayload = {
                name: formData.name.trim(),
                avatar_url: avatarUrl,
                instagram_url: formData.instagram.trim() || null,
                facebook_url: formData.facebook.trim() || null,
                twitter_url: formData.twitter.trim() || null,
                removeImages: imagesToDelete,
                ...(editingArtist ? { id: editingArtist.id } : {})
            }

            if (editingArtist) {
                const result = await updateArtist(payload as ArtistUpdatePayload)

                if (!result.success) {
                    toast.error(result.message)
                    return
                }

                toast.success(result.message)

                setArtists(prev =>
                    prev.map(artist =>
                        artist.id === editingArtist.id
                            ? {
                                  ...artist,
                                  name: payload.name,
                                  avatar_url: avatarUrl,
                                  instagram_url: payload.instagram_url ?? undefined,
                                  facebook_url: payload.facebook_url ?? undefined,
                                  twittter_url: payload.twitter_url ?? undefined
                              }
                            : artist
                    )
                )
            } else {
                const result = await createArtist(payload as ArtistCreatePayload)

                if (!result.success) {
                    toast.error(result.message)
                    return
                }

                toast.success(result.message)

                setArtists(prev => [
                    ...prev,
                    {
                        id: result.artist_id,
                        name: payload.name,
                        avatar_url: avatarUrl,
                        instagram_url: payload.instagram_url ?? undefined,
                        facebook_url: payload.facebook_url ?? undefined,
                        twittter_url: payload.twitter_url ?? undefined
                    }
                ])
            }

            resetForm()
        } catch (error) {
            console.error("handleSubmit error", error)
            toast.error("Error al guardar el artista")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (artist: Artist) => {
        clearUploads()
        setEditingArtist(artist)
        setFormData({
            name: artist.name,
            imageUrl: artist.avatar_url ?? "",
            instagram: artist.instagram_url ?? "",
            facebook: artist.facebook_url ?? "",
            twitter: artist.twittter_url ?? "",
        })
        setImageToDelete(null)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este artista?")) return
        setLoading(true)

        try {
            const artist = artists.find(a => a.id === id)
            const result = await deleteArtist(id, artist?.avatar_url ? [artist.avatar_url] : [])
            if (!result.success) {
                toast.error(result.message)
                return
            }

            toast.success(result.message)
            setArtists(prev => prev.filter(artistItem => artistItem.id !== id))
        } catch (error) {
            console.error("handleDelete error", error)
            toast.error("Error al eliminar el artista")
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveExistingImage = () => {
        if (!formData.imageUrl) return
        setImageToDelete(formData.imageUrl)
        setFormData(prev => ({ ...prev, imageUrl: "" }))
    }

    const onImageChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        const file = event.target.files?.[0]
        if (!file) return

        if (upload?.preview) URL.revokeObjectURL(upload.preview)

        const preview = URL.createObjectURL(file)
        setUpload({ file, preview })
        setFormData(prev => ({ ...prev, imageUrl: "" }))
        setImageToDelete(editingArtist?.avatar_url ?? null)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Artistas</h1>
                    <p className="text-muted-foreground mt-1">Gestiona los artistas de la plataforma</p>
                </div>
                <Button onClick={openCreateModal} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Artista
                </Button>
            </div>
            {artists.length === 0 && (
                 <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 py-12">
                    <p className="max-w-xs text-center text-muted-foreground">
                        Aún no tienes artistas creados. Agrega tu primer artista.
                    </p>
                    <Button onClick={openCreateModal} className="mt-4">
                        Crear Artista
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {artists.length > 0 &&
                    artists.map(artist => (
                        <div key={artist.id} className="rounded-lg border border-border bg-card overflow-hidden">
                            {artist.avatar_url && (
                                <div className="relative h-48 bg-muted">
                                    <Image
                                        src={artist.avatar_url || "/placeholder.svg"}
                                        alt={artist.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <div className="mb-3 flex items-start justify-between">
                                    <h3 className="text-lg font-semibold text-foreground">{artist.name}</h3>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(artist)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(artist.id)}
                                            className="text-red-600 hover:text-red-700"
                                            disabled={loading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {artist.instagram_url && (
                                        <a
                                            href={artist.instagram_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            <Instagram className="h-5 w-5" />
                                        </a>
                                    )}
                                    {artist.facebook_url && (
                                        <a
                                            href={artist.facebook_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            <Facebook className="h-5 w-5" />
                                        </a>
                                    )}
                                    {artist.twittter_url && (
                                        <a
                                            href={artist.twittter_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            <Twitter className="h-5 w-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-6">
                        <h2 className="text-xl font-bold text-foreground">
                            {editingArtist ? "Editar Artista" : "Nuevo Artista"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Artista</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Imagen</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={onImageChange}
                                    required={!editingArtist && !upload}
                                />

                                {(formData.imageUrl || upload?.preview) && (
                                    <div className="relative mt-3 h-32 w-full overflow-hidden rounded-lg border bg-muted">
                                        <Image
                                            src={upload?.preview || formData.imageUrl}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black"
                                            onClick={() => {
                                                if (upload?.preview) URL.revokeObjectURL(upload.preview)
                                                setUpload(null)
                                                if (editingArtist?.avatar_url) {
                                                    setImageToDelete(editingArtist.avatar_url)
                                                }
                                                setFormData(prev => ({ ...prev, imageUrl: "" }))
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {editingArtist && formData.imageUrl && !upload && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleRemoveExistingImage}
                                        disabled={loading}
                                    >
                                        Quitar imagen actual
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <div className="flex items-center gap-2">
                                    <Instagram className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="instagram"
                                        type="url"
                                        value={formData.instagram}
                                        onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                                        placeholder="https://www.instagram.com/nombre_usuario"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="facebook">Facebook</Label>
                                <div className="flex items-center gap-2">
                                    <Facebook className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="facebook"
                                        type="url"
                                        value={formData.facebook}
                                        onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                                        placeholder="https://www.facebook.com/nombre_usuario"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="twitter">Twitter</Label>
                                <div className="flex items-center gap-2">
                                    <Twitter className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="twitter"
                                        type="url"
                                        value={formData.twitter}
                                        onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                                        placeholder="https://x.com/nombre_usuario"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    className="flex-1 bg-transparent"
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1" disabled={loading}>
                                    {editingArtist ? "Guardar" : "Crear"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
