"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { mockFunctions, mockShows, mockTheaters } from "@/lib/mock-admin-data"
import type { ShowFunction } from "@/types/admin"
import { formatPrice, formatDate } from "@/lib/format"

export default function FuncionesPage() {
  const [functions, setFunctions] = useState<ShowFunction[]>(mockFunctions)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFunction, setEditingFunction] = useState<ShowFunction | null>(null)
  const [formData, setFormData] = useState({
    showId: "",
    theaterId: "",
    date: "",
    time: "",
    totalSeats: 0,
    price: 0,
    has2x1Promo: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingFunction) {
      setFunctions(
        functions.map((func) =>
          func.id === editingFunction.id
            ? {
              ...func,
              ...formData,
              date: new Date(formData.date),
              availableSeats: func.availableSeats,
              status: func.status,
            }
            : func,
        ),
      )
    } else {
      const newFunction: ShowFunction = {
        id: String(Date.now()),
        ...formData,
        date: new Date(formData.date),
        availableSeats: formData.totalSeats,
        status: "active",
        createdAt: new Date(),
      }
      setFunctions([...functions, newFunction])
    }

    resetForm()
  }

  const handleEdit = (func: ShowFunction) => {
    setEditingFunction(func)
    setFormData({
      showId: func.showId,
      theaterId: func.theaterId,
      date: func.date.toISOString().split("T")[0],
      time: func.time,
      totalSeats: func.totalSeats,
      price: func.price,
      has2x1Promo: func.has2x1Promo,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta función?")) {
      setFunctions(functions.filter((func) => func.id !== id))
    }
  }

  const toggleStatus = (id: string) => {
    setFunctions(
      functions.map((func) =>
        func.id === id
          ? {
            ...func,
            status: func.status === "active" ? "cancelled" : "active",
          }
          : func,
      ),
    )
  }

  const resetForm = () => {
    setFormData({
      showId: "",
      theaterId: "",
      date: "",
      time: "",
      totalSeats: 0,
      price: 0,
      has2x1Promo: false,
    })
    setEditingFunction(null)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funciones</h1>
          <p className="text-muted-foreground mt-1">Gestiona las funciones y horarios</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Función
        </Button>
      </div>

      {/* Lista de Funciones */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Obra</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Teatro</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Hora</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Asientos</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Precio</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Promo 2x1</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {functions.map((func) => {
                const show = mockShows.find((s) => s.id === func.showId)
                const theater = mockTheaters.find((t) => t.id === func.theaterId)

                return (
                  <tr key={func.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm font-medium">{show?.title || "N/A"}</td>
                    <td className="p-4 text-sm">{theater?.name || "N/A"}</td>
                    <td className="p-4 text-sm">{formatDate(func.date)}</td>
                    <td className="p-4 text-sm">{func.time}</td>
                    <td className="p-4 text-sm">
                      {func.availableSeats} / {func.totalSeats}
                    </td>
                    <td className="p-4 text-sm font-medium">{formatPrice(func.price)}</td>
                    <td className="p-4 text-sm">
                      {func.has2x1Promo ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Activa
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          No
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <button
                        onClick={() => toggleStatus(func.id)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${func.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : func.status === "sold-out"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                          }`}
                      >
                        {func.status === "active" ? "Activo" : func.status === "sold-out" ? "Agotado" : "Cancelado"}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(func)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(func.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingFunction ? "Editar Función" : "Nueva Función"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="showId">Obra</Label>
                <select
                  id="showId"
                  value={formData.showId}
                  onChange={(e) => setFormData({ ...formData, showId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  required
                >
                  <option value="">Seleccionar obra</option>
                  {mockShows.map((show) => (
                    <option key={show.id} value={show.id}>
                      {show.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theaterId">Teatro</Label>
                <select
                  id="theaterId"
                  value={formData.theaterId}
                  onChange={(e) => setFormData({ ...formData, theaterId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  required
                >
                  <option value="">Seleccionar teatro</option>
                  {mockTheaters.map((theater) => (
                    <option key={theater.id} value={theater.id}>
                      {theater.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalSeats">Asientos Totales</Label>
                  <Input
                    id="totalSeats"
                    type="number"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  <span>Promoción 2x1</span>
                  <button
                    type="button"

                    className="text-primary"
                  >
                    {formData.has2x1Promo ? (
                      <ToggleRight className="w-10 h-10" onClick={() => setFormData({ ...formData, has2x1Promo: !formData.has2x1Promo })} />
                    ) : (
                      <ToggleLeft className="w-10 h-10" onClick={() => setFormData({ ...formData, has2x1Promo: !formData.has2x1Promo })} />
                    )}
                  </button>
                </Label>
                <p className="text-sm text-muted-foreground">
                  {formData.has2x1Promo ? "La promoción 2x1 está activada" : "La promoción 2x1 está desactivada"}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingFunction ? "Guardar" : "Crear"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
