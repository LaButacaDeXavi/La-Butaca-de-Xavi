"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { mockTheaters } from "@/lib/mock-admin-data"
import type { Theater } from "@/types/admin"

export default function TeatrosPage() {
  const [theaters, setTheaters] = useState<Theater[]>(mockTheaters)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTheater, setEditingTheater] = useState<Theater | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    mapUrl: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingTheater) {
      // Editar teatro existente
      setTheaters(theaters.map((theater) => (theater.id === editingTheater.id ? { ...theater, ...formData } : theater)))
    } else {
      // Crear nuevo teatro
      const newTheater: Theater = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date(),
      }
      setTheaters([...theaters, newTheater])
    }

    resetForm()
  }

  const handleEdit = (theater: Theater) => {
    setEditingTheater(theater)
    setFormData({
      name: theater.name,
      address: theater.address,
      city: theater.city,
      mapUrl: theater.mapUrl,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este teatro?")) {
      setTheaters(theaters.filter((theater) => theater.id !== id))
    }
  }

  const resetForm = () => {
    setFormData({ name: "", address: "", city: "", mapUrl: "" })
    setEditingTheater(null)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teatros</h1>
          <p className="text-muted-foreground mt-1">Gestiona los teatros de la plataforma</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Teatro
        </Button>
      </div>

      {/* Lista de Teatros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theaters.map((theater) => (
          <div key={theater.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{theater.name}</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(theater)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(theater.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium">Dirección:</span> {theater.address}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Ciudad:</span> {theater.city}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Google Maps URL:</span> {theater.mapUrl}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingTheater ? "Editar Teatro" : "Nuevo Teatro"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Teatro</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Google Maps URL</Label>
                <Input
                  id="capacity"
                  type="text"
                  value={formData.mapUrl}
                  onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingTheater ? "Guardar" : "Crear"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
