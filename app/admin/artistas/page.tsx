"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Instagram, Facebook, Twitter } from "lucide-react"
import { mockArtists } from "@/lib/mock-admin-data"
import type { Artist } from "@/types/admin"
import Image from "next/image"

export default function ArtistasPage() {
  const [artists, setArtists] = useState<Artist[]>(mockArtists)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    image: "",
    instagram: "",
    facebook: "",
    twitter: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingArtist) {
      setArtists(
        artists.map((artist) =>
          artist.id === editingArtist.id
            ? {
                ...artist,
                name: formData.name,
                bio: formData.bio,
                image: formData.image,
                socialMedia: {
                  instagram: formData.instagram,
                  facebook: formData.facebook,
                  twitter: formData.twitter,
                },
              }
            : artist,
        ),
      )
    } else {
      const newArtist: Artist = {
        id: String(Date.now()),
        name: formData.name,
        bio: formData.bio,
        image: formData.image,
        socialMedia: {
          instagram: formData.instagram,
          facebook: formData.facebook,
          twitter: formData.twitter,
        },
        createdAt: new Date(),
      }
      setArtists([...artists, newArtist])
    }

    resetForm()
  }

  const handleEdit = (artist: Artist) => {
    setEditingArtist(artist)
    setFormData({
      name: artist.name,
      bio: artist.bio || "",
      image: artist.image || "",
      instagram: artist.socialMedia.instagram || "",
      facebook: artist.socialMedia.facebook || "",
      twitter: artist.socialMedia.twitter || "",
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este artista?")) {
      setArtists(artists.filter((artist) => artist.id !== id))
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      bio: "",
      image: "",
      instagram: "",
      facebook: "",
      twitter: "",
    })
    setEditingArtist(null)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Artistas</h1>
          <p className="text-muted-foreground mt-1">Gestiona los artistas de la plataforma</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Artista
        </Button>
      </div>

      {/* Lista de Artistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <div key={artist.id} className="bg-card border border-border rounded-lg overflow-hidden">
            {artist.image && (
              <div className="relative h-48 bg-muted">
                <Image src={artist.image || "/placeholder.svg"} alt={artist.name} fill className="object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-foreground">{artist.name}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(artist)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(artist.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {artist.bio && <p className="text-sm text-muted-foreground mb-4">{artist.bio}</p>}
              <div className="flex gap-3">
                {artist.socialMedia.instagram && (
                  <a
                    href={`https://instagram.com/${artist.socialMedia.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {artist.socialMedia.facebook && (
                  <a
                    href={`https://facebook.com/${artist.socialMedia.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {artist.socialMedia.twitter && (
                  <a
                    href={`https://twitter.com/${artist.socialMedia.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6 my-8">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingArtist ? "Editar Artista" : "Nuevo Artista"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Artista</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">URL de Imagen</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {formData.image && (
                  <div className="relative h-32 mt-2 rounded-lg overflow-hidden bg-muted">
                    <Image src={formData.image || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@usuario"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="usuario"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <div className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="@usuario"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
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
