"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { mockShows, mockTheaters, mockArtists } from "@/lib/mock-admin-data"
import type { Show } from "@/types/admin"
import Image from "next/image"

export default function ObrasPage() {
  const [shows, setShows] = useState<Show[]>(mockShows)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingShow, setEditingShow] = useState<Show | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 0,
    genre: "",
    mainImage: "",
    gallery: [] as string[],
    theaterId: "",
    artistIds: [] as string[],
  })
  const [newGalleryUrl, setNewGalleryUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingShow) {
      setShows(shows.map((show) => (show.id === editingShow.id ? { ...show, ...formData } : show)))
    } else {
      const newShow: Show = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date(),
      }
      setShows([...shows, newShow])
    }

    resetForm()
  }

  const handleEdit = (show: Show) => {
    setEditingShow(show)
    setFormData({
      title: show.title,
      description: show.description,
      duration: show.duration,
      genre: show.genre,
      mainImage: show.mainImage,
      gallery: show.gallery,
      theaterId: show.theaterId,
      artistIds: show.artistIds,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta obra?")) {
      setShows(shows.filter((show) => show.id !== id))
    }
  }

  const addToGallery = () => {
    if (newGalleryUrl.trim()) {
      setFormData({ ...formData, gallery: [...formData.gallery, newGalleryUrl.trim()] })
      setNewGalleryUrl("")
    }
  }

  const removeFromGallery = (index: number) => {
    setFormData({ ...formData, gallery: formData.gallery.filter((_, i) => i !== index) })
  }

  const toggleArtist = (artistId: string) => {
    if (formData.artistIds.includes(artistId)) {
      setFormData({ ...formData, artistIds: formData.artistIds.filter((id) => id !== artistId) })
    } else {
      setFormData({ ...formData, artistIds: [...formData.artistIds, artistId] })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: 0,
      genre: "",
      mainImage: "",
      gallery: [],
      theaterId: "",
      artistIds: [],
    })
    setEditingShow(null)
    setIsModalOpen(false)
    setNewGalleryUrl("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Obras</h1>
          <p className="text-muted-foreground mt-1">Gestiona las obras y espectáculos</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Obra
        </Button>
      </div>

      {/* Lista de Obras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {shows.map((show) => {
          const theater = mockTheaters.find((t) => t.id === show.theaterId)
          const artists = mockArtists.filter((a) => show.artistIds.includes(a.id))

          return (
            <div key={show.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="relative h-48 bg-muted">
                <Image src={show.mainImage || "/placeholder.svg"} alt={show.title} fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">{show.title}</h3>
                    <p className="text-sm text-muted-foreground">{show.genre}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(show)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(show.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{show.description}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium">Duración:</span> {show.duration} minutos
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Artistas:</span>{" "}
                    {artists.map((a) => a.name).join(", ") || "Sin asignar"}
                  </p>
                  {show.gallery.length > 0 && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Galería:</span> {show.gallery.length} imágenes
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">{editingShow ? "Editar Obra" : "Nueva Obra"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Obra</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Género</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainImage">Imagen Principal (URL)</Label>
                <Input
                  id="mainImage"
                  value={formData.mainImage}
                  onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  required
                />
                {formData.mainImage && (
                  <div className="relative h-40 mt-2 rounded-lg overflow-hidden bg-muted">
                    <Image src={formData.mainImage || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Galería de Imágenes</Label>
                <div className="flex gap-2">
                  <Input
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="URL de imagen"
                  />
                  <Button type="button" onClick={addToGallery}>
                    Agregar
                  </Button>
                </div>
                {formData.gallery.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {formData.gallery.map((url, index) => (
                      <div key={index} className="relative h-24 rounded-lg overflow-hidden bg-muted group">
                        <Image src={url || "/placeholder.svg"} alt={`Gallery ${index}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFromGallery(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Artistas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {mockArtists.map((artist) => (
                    <label
                      key={artist.id}
                      className="flex items-center gap-2 p-2 border border-border rounded-lg cursor-pointer hover:bg-accent"
                    >
                      <input
                        type="checkbox"
                        checked={formData.artistIds.includes(artist.id)}
                        onChange={() => toggleArtist(artist.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{artist.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingShow ? "Guardar" : "Crear"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
