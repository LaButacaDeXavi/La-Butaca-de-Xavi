"use client"

import { FormEvent, useState } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Artist, Play } from "@/types/admin"
import { createPlay, deletePlay, updatePlay } from "./actions"
import type { PlayCreatePayload, PlayUpdatePayload } from "./actions"
import { toast } from "sonner"
import { compressAndUploadImage } from "@/lib/supabase/storage"

interface PlaysPageProps {
    plays: Play[]
    artists: Artist[]
}

type FormState = {
    title: string
    subtitle: string
    description: string
    duration: number
    genre: string
    mainImage: string
    gallery: string[]
    artistIds: string[]
}

const initialFormState: FormState = {
    title: "",
    subtitle: "",
    description: "",
    duration: 0,
    genre: "",
    mainImage: "",
    gallery: [],
    artistIds: []
}

type ImagePreviewVariant = "existing" | "new"

type GalleryFile = {
    file: File
    preview: string
}

export default function PlaysPage({ plays, artists }: PlaysPageProps) {
    const [loading, setLoading] = useState(false)
    const [mainImageFile, setMainImageFile] = useState<File | null>(null)
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
    const [galleryFiles, setGalleryFiles] = useState<GalleryFile[]>([])
    const [removedGalleryUrls, setRemovedGalleryUrls] = useState<string[]>([])
    const [removedMainImageUrl, setRemovedMainImageUrl] = useState<string | null>(null)
    const [playsState, setPlaysState] = useState<Play[]>(plays)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPlay, setEditingPlay] = useState<Play | null>(null)
    const [formData, setFormData] = useState<FormState>({ ...initialFormState })
    const clearNewUploads = () => {
        setMainImageFile(null)
        setMainImagePreview(prev => {
            if (prev) URL.revokeObjectURL(prev)
            return null
        })
        setGalleryFiles(prev => {
            prev.forEach(item => URL.revokeObjectURL(item.preview))
            return []
        })
    }

    const openCreateModal = () => {
        clearNewUploads()
        setFormData({ ...initialFormState })
        setEditingPlay(null)
        setRemovedGalleryUrls([])
        setRemovedMainImageUrl(null)
        setIsModalOpen(true)
    }

    const resetForm = () => {
        clearNewUploads()
        setFormData({ ...initialFormState })
        setEditingPlay(null)
        setIsModalOpen(false)
        setRemovedGalleryUrls([])
        setRemovedMainImageUrl(null)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const imagesToDelete: string[] = []
            let mainImageUrl = formData.mainImage

            if (mainImageFile) {
                const uploadedMain = await compressAndUploadImage(mainImageFile, "plays/main")

                if (!uploadedMain) {
                    toast.error("No se pudo subir la imagen principal")
                    return
                }

                if (editingPlay?.mainImage) {
                    imagesToDelete.push(editingPlay.mainImage)
                }

                mainImageUrl = uploadedMain
            } else if (editingPlay && !formData.mainImage && editingPlay.mainImage) {
                imagesToDelete.push(editingPlay.mainImage)
            }

            if (!mainImageUrl) {
                toast.error("La imagen principal es obligatoria")
                return
            }

            const uploadedGalleryUrls = galleryFiles.length
                ? await Promise.all(
                    galleryFiles.map(({ file }) => compressAndUploadImage(file, "plays/gallery"))
                )
                : []

            if (uploadedGalleryUrls.some(url => !url)) {
                toast.error("No se pudieron subir algunas imágenes de la galería")
                return
            }

            const combinedGallery = [...formData.gallery, ...uploadedGalleryUrls].filter(Boolean)
            const uniqueGallery = Array.from(new Set(combinedGallery))

            if (editingPlay?.gallery?.length) {
                editingPlay.gallery.forEach(url => {
                    if (!uniqueGallery.includes(url)) {
                        imagesToDelete.push(url)
                    }
                })
            }

            if (removedGalleryUrls.length) {
                removedGalleryUrls.forEach(url => {
                    if (!imagesToDelete.includes(url)) {
                        imagesToDelete.push(url)
                    }
                })
            }

            if (removedMainImageUrl && !imagesToDelete.includes(removedMainImageUrl)) {
                imagesToDelete.push(removedMainImageUrl)
            }

            const uniqueImagesToDelete = Array.from(new Set(imagesToDelete.filter(Boolean)))

            if (editingPlay) {
                const payload: PlayUpdatePayload = {
                    ...formData,
                    mainImage: mainImageUrl,
                    gallery: uniqueGallery,
                    id: editingPlay.id,
                    imagesToDelete: uniqueImagesToDelete
                }

                const result = await updatePlay(payload)

                if (!result.success) {
                    toast.error(result.message)
                    return
                }

                toast.success(result.message)

                setPlaysState(prev =>
                    prev.map(p =>
                        p.id === editingPlay.id
                            ? {
                                ...p,
                                ...payload,
                                gallery: uniqueGallery,
                                mainImage: mainImageUrl,
                                artists: artists
                                    .filter(artist => (payload.artistIds ?? []).includes(artist.id))
                                    .map(artist => ({ id: artist.id, name: artist.name }))
                            }
                            : p
                    )
                )
            } else {
                const payload: PlayCreatePayload = {
                    ...formData,
                    mainImage: mainImageUrl,
                    gallery: uniqueGallery
                }

                const result = await createPlay(payload)

                if (!result.success) {
                    toast.error(result.message)
                    return
                }

                toast.success("Obra creada correctamente")

                setPlaysState(prev => [
                    ...prev,
                    {
                        ...payload,
                        id: result.play_id,
                        artists: artists
                            .filter(artist => (payload.artistIds ?? []).includes(artist.id))
                            .map(artist => ({ id: artist.id, name: artist.name }))
                    } as Play
                ])
            }

            resetForm()
        } catch (error) {
            console.error("handleSubmit error:", error)
            toast.error("Error al guardar la obra")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (play: Play) => {
        const artistIds = (play.artists ?? [])
            .map(artist => artist.id ?? "")
            .filter((id): id is string => Boolean(id))

        clearNewUploads()
        setEditingPlay(play)
        setFormData({
            title: play.title,
            subtitle: play.subtitle ?? "",
            description: play.description ?? "",
            duration: play.duration,
            genre: play.genre,
            mainImage: play.mainImage,
            gallery: play.gallery ?? [],
            artistIds
        })
        setRemovedGalleryUrls([])
        setRemovedMainImageUrl(null)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar la obra?")) return
        const data = await deletePlay(id)
        if (!data.success) return toast.error(data.message)
        toast.success(data.message)
        setPlaysState(prev => prev.filter(p => p.id !== id))
    }

    const toggleArtist = (artistId: string) => {
        setFormData(prev => ({
            ...prev,
            artistIds: prev.artistIds.includes(artistId)
                ? prev.artistIds.filter(id => id !== artistId)
                : [...prev.artistIds, artistId]
        }))
    }

    const handleRemoveExistingMainImage = () => {
        if (!formData.mainImage) return
        setRemovedMainImageUrl(formData.mainImage)
        setFormData(prev => ({ ...prev, mainImage: "" }))
        setMainImageFile(null)
        setMainImagePreview(prev => {
            if (prev) URL.revokeObjectURL(prev)
            return null
        })
    }

    const handleRemoveExistingGallery = (url: string) => {
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery.filter(imageUrl => imageUrl !== url)
        }))
        setRemovedGalleryUrls(prev => (prev.includes(url) ? prev : [...prev, url]))
    }

    const removeGalleryFile = (index: number) => {
        setGalleryFiles(prev => {
            const next = [...prev]
            const [removed] = next.splice(index, 1)
            if (removed) {
                URL.revokeObjectURL(removed.preview)
            }
            return next
        })
    }

    const renderImagePreview = (
        src: string,
        alt: string,
        variant: ImagePreviewVariant,
        onRemove: () => void
    ) => (
        <div className="relative h-24 w-24 overflow-hidden rounded-md border">
            <Image
                src={src}
                alt={alt}
                sizes="96px"
                className="object-contain"
                width={100}
                height={100}
            />
            <button
                type="button"
                onClick={onRemove}
                className={`absolute right-1 top-1 rounded-full p-1 text-white transition ${variant === "existing"
                        ? "bg-black/70 hover:bg-black"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Obras</h1>
                    <p className="mt-1 text-muted-foreground">Gestiona las obras de la plataforma</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Obra
                </Button>
            </div>

            {playsState.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 py-12">
                    <p className="max-w-xs text-center text-muted-foreground">
                        Aún no tienes obras creadas. Agrega tu primera obras para poder crear funciones.
                    </p>
                    <Button onClick={openCreateModal} className="mt-4">
                        Crear Obra
                    </Button>
                </div>
            )}


            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {playsState.length > 0 &&
                    playsState.map(play => (
                        <div key={play.id} className="overflow-hidden rounded-lg border">
                            <div className="relative h-48">
                                <Image
                                    src={play.mainImage || "/placeholder.svg"}
                                    alt={play.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover"
                                />
                            </div>

                            <div className="p-4">
                                <div className="mb-2 flex justify-between">
                                    <h3 className="text-xl font-semibold">{play.title}</h3>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => handleEdit(play)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => handleDelete(play.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>

                                <p className="mb-2 text-sm text-muted-foreground">
                                    {play.description}
                                </p>

                                <p className="text-sm">
                                    <strong>Duración:</strong> {play.duration} min
                                </p>

                                <p className="text-sm">
                                    <strong>Artistas:</strong>{" "}
                                    {play.artists?.map(a => a.name).join(", ") || "—"}
                                </p>
                            </div>
                        </div>
                    ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
                    <div className="flex min-h-full items-start justify-center p-4">
                        <div className="relative w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6 shadow-lg max-h-[calc(100vh-4rem)]">
                            <button
                                type="button"
                                className="absolute right-4 top-4 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                                onClick={resetForm}
                                aria-label="Cerrar"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <h2 className="mb-4 pr-10 text-xl font-bold">
                                {editingPlay ? "Editar Obra" : "Nueva Obra"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título de la Obra</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Macbeth"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subtitle">Subtítulo de la Obra</Label>
                                    <Input
                                        id="subtitle"
                                        value={formData.subtitle}
                                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                        placeholder="Una obra especial"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duración (minutos)</Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            min={1}
                                            value={formData.duration}
                                            onChange={e =>
                                                setFormData({ ...formData, duration: Number(e.target.value) })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="genre">Género</Label>
                                        <Input
                                            id="genre"
                                            value={formData.genre}
                                            onChange={e => setFormData({ ...formData, genre: e.target.value })}
                                            placeholder="Comedia"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="main-image">Imagen Principal</Label>
                                    <Input
                                        id="main-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={e => {
                                            const file = e.target.files?.[0] ?? null
                                            setMainImageFile(file)
                                            setMainImagePreview(prev => {
                                                if (prev) URL.revokeObjectURL(prev)
                                                return file ? URL.createObjectURL(file) : null
                                            })
                                        }}
                                        required={!editingPlay || !formData.mainImage}
                                    />

                                    {formData.mainImage && !mainImageFile && (
                                        <div className="mt-3 h-32 w-32">
                                            {renderImagePreview(
                                                formData.mainImage,
                                                "Imagen principal actual",
                                                "existing",
                                                handleRemoveExistingMainImage
                                            )}
                                        </div>
                                    )}

                                    {mainImagePreview && (
                                        <div className="relative mt-3 h-32 w-32 overflow-hidden rounded-md border">
                                            <Image
                                                src={mainImagePreview}
                                                alt="Vista previa"
                                                fill
                                                sizes="128px"
                                                className="object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMainImageFile(null)
                                                    setMainImagePreview(prev => {
                                                        if (prev) URL.revokeObjectURL(prev)
                                                        return null
                                                    })
                                                }}
                                                className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gallery">Galería de Imágenes</Label>
                                    <Input
                                        id="gallery"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={e => {
                                            const files = Array.from(e.target.files ?? [])
                                            setGalleryFiles(prev => {
                                                const existingNames = new Set(prev.map(item => item.file.name))
                                                const next = [...prev]
                                                files.forEach(file => {
                                                    if (!existingNames.has(file.name)) {
                                                        next.push({
                                                            file,
                                                            preview: URL.createObjectURL(file)
                                                        })
                                                    }
                                                })
                                                return next
                                            })
                                        }}
                                    />

                                    {formData.gallery.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-3">
                                            {formData.gallery.map((url, index) => (
                                                <div key={`${url}-${index}`} className="h-24 w-24">
                                                    {renderImagePreview(
                                                        url,
                                                        `Imagen actual ${index + 1}`,
                                                        "existing",
                                                        () => handleRemoveExistingGallery(url)
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {galleryFiles.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-3">
                                            {galleryFiles.map((item, index) => (
                                                <div key={`${item.file.name}-${index}`} className="h-24 w-24">
                                                    {renderImagePreview(
                                                        item.preview,
                                                        item.file.name,
                                                        "new",
                                                        () => removeGalleryFile(index)
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label>Artistas</Label>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        {artists.map(artist => (
                                            <label key={artist.id} className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.artistIds.includes(artist.id)}
                                                    onChange={() => toggleArtist(artist.id)}
                                                />
                                                {artist.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={resetForm}
                                        className="flex-1"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={loading}
                                    >
                                        Guardar
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
