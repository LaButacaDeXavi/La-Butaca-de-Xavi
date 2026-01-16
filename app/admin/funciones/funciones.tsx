"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Search } from "lucide-react"
import type { Play, Promotion, Section, Performances, Theater } from "@/types/admin"
import { formatPrice } from "@/lib/format"
import { formatDate } from "@/lib/cart-utils"
import { toast } from "sonner"
import { createPerformance, deletePerformance, updatePerformance } from "./actions"
import { Switch } from "@/components/ui/switch"

interface funcionesPageProps {
  promotions: Promotion[]
  plays: Play[]
  theaters: Theater[]
  perfomances: Performances[]
}
export default function FuncionesPage({ perfomances, plays, promotions, theaters }: funcionesPageProps) {
  const [loading, setLoading] = useState(false)
  const [functions, setFunctions] = useState<Performances[]>(perfomances)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFunction, setEditingFunction] = useState<Performances | null>(null)
  const [formData, setFormData] = useState({
    isMain: false,
    playId: "",
    theaterId: "",
    date: "",
    time: "",
    promotionId: "",
    status: ""
  })

  // Estados para manejar las secciones
  const [sections, setSections] = useState<Section[]>([])
  const [newSection, setNewSection] = useState({
    name: "",
    totalSeats: 0,
    price: 0
  })

  // Filtrado de funciones
  const filteredFunctions = functions.filter(func => {
    const searchLower = searchTerm.toLowerCase()
    return (
      func.play.title.toLowerCase().includes(searchLower) ||
      func.theater.name.toLowerCase().includes(searchLower) ||
      func.theater.address.toLowerCase().includes(searchLower) ||
      func.date.toString().includes(searchLower) ||
      func.time.toLowerCase().includes(searchLower)
    )
  })

  const handleAddSection = () => {
    if (!newSection.name || newSection.totalSeats <= 0 || newSection.price <= 0) {
      toast.error("Por favor completa todos los campos de la sección")
      return
    }

    const section: Section = {
      id: "",
      name: newSection.name,
      totalSeats: newSection.totalSeats,
      availableSeats: newSection.totalSeats,
      price: newSection.price
    }

    setSections([...sections, section])
    setNewSection({ name: "", totalSeats: 0, price: 0 })
  }

  const handleRemoveSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.date || !formData.time || !formData.playId || !formData.theaterId) {
      return toast.error("Completa los Campos")
    }
    if (sections.length === 0) {
      toast.error("Debes agregar al menos una sección")
      return
    }

    setLoading(true)
    try {
      if (editingFunction) {

        const newSections = sections.filter(s => !s.id)

        const existingNames = new Set(editingFunction.sections?.map(s => s.name.toLowerCase()) || [])
        const duplicatesWithExisting = newSections.filter(s =>
          existingNames.has(s.name.toLowerCase())
        )

        if (duplicatesWithExisting.length > 0) return toast.error('No pueden haber secciones con el mismo nombre')

        const data = await updatePerformance({
          isMain: formData.isMain,
          date: formData.date,
          id: editingFunction.id,
          status: formData.status,
          theaterId: formData.theaterId,
          time: formData.time,
          promotionId: formData.promotionId,
          sections: newSections
        })

        if (!data.success) return toast.error(data.message)

        toast.success(data.message)

        setFunctions(
          functions.map((func) =>
            func.id === editingFunction.id
              ? {
                ...func,
                isMain: formData.isMain,
                sections: sections,
                status: formData.status as "active" | "sold-out" | "cancelled",
                play: plays.find(p => p.id === formData.playId) ?? { genre: "", id: "", title: "" },
                theater: theaters.find(t => t.id === formData.theaterId) ?? { id: "", address: "", name: "" },
                date: formData.date,
                time: formData.time,
                promotion: promotions.find(p => p.id === formData.promotionId) ?? undefined
              }
              : func,
          ),
        )
      } else {
        const data = await createPerformance({ ...formData, sections })
        if (!data.success) return toast.error(data.message)

        toast.success(data.message)

        const newFunction: Performances = {
          id: data.performanceId,
          isMain: formData.isMain,
          sections: sections,
          status: "active",
          play: plays.find(p => p.id === formData.playId) ?? { genre: "", id: "", title: "" }, // ✅ === en vez de =
          theater: theaters.find(t => t.id === formData.theaterId) ?? { id: "", address: "", name: "" }, // ✅ === en vez de ==
          date: formData.date,
          time: formData.time,
          promotion: promotions.find(p => p.id === formData.promotionId) ?? undefined // ✅ === en vez de ==
        }
        setFunctions([...functions, newFunction])
      }

      resetForm()
    } catch (error) {
      toast.error('Error al Crear Función')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (func: Performances) => {
    setEditingFunction(func)
    setFormData({
      isMain: func.isMain,
      playId: func.play.id,
      theaterId: func.theater.id,
      date: func.date,
      time: func.time,
      promotionId: func.promotion?.id ?? "",
      status: func.status
    })
    setSections(func.sections || [])
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta función?")) {
      const data = await deletePerformance(id)
      if (!data.success) return toast(data.message)
      toast.success(data.message);
      setFunctions(functions.filter((func) => func.id !== id))
    }
  }


  const resetForm = () => {
    setFormData({
      isMain: false,
      playId: "",
      theaterId: "",
      date: "",
      time: "",
      promotionId: "",
      status: ""
    })
    setSections([])
    setNewSection({ name: "", totalSeats: 0, price: 0 })
    setEditingFunction(null)
    setIsModalOpen(false)
  }

  const getTotalSeats = (sections: Section[]) => {
    return sections.reduce((sum, s) => sum + s.totalSeats, 0)
  }

  const getAvailableSeats = (sections: Section[]) => {
    return sections.reduce((sum, s) => sum + s.availableSeats, 0)
  }

  const getBadgeText = (type: string, value: number) => {
    switch (type) {
      case "2x1":
        return "2x1"
      case "fixed":
        return value ? `-$${value}` : null
      case "percentage":
        return value ? `-${value}%` : null
      default:
        return "Sin Promoción"
    }
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

      {functions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 py-12">
          <p className="max-w-xs text-center text-muted-foreground">
            Aún no tienes funciones creadas. Agrega tu primer función.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4">
            Crear Función
          </Button>
        </div>
      ) : (<>
        {/* Input de filtrado */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por obra, teatro, fecha o hora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Obra</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Teatro</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Hora</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Secciones</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Asientos</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Promo</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Visible Carrousel</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFunctions.map((func) => {

                  return (
                    <tr key={func.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm font-medium">{func?.play.title || "N/A"}</td>
                      <td className="p-4 text-sm">{func?.theater.name + "-" + func.theater.address || "N/A"}</td>
                      <td className="p-4 text-sm">{formatDate(func.date.toString())}</td>
                      <td className="p-4 text-sm">{func.time}</td>
                      <td className="p-4 text-sm">
                        {func.sections && func.sections.length > 0 ? (
                          <div className="space-y-1">
                            {func.sections.map(section => (
                              <div key={section.id} className="text-xs">
                                <span className="font-medium">{section.name}:</span> {formatPrice(section.price)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {func.sections && func.sections.length > 0 && (
                          <>{getAvailableSeats(func.sections)} / {getTotalSeats(func.sections)}</>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {func.promotion?.name ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {getBadgeText(func.promotion?.type ?? "", func.promotion?.value ?? 0)}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            Sin Promocion
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        <button
                          className={`px-2 py-1 rounded-full text-xs font-medium ${func.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : func.status === "sold-out"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                            }`}
                        >
                          {func.status === "active" ? "Activo" : func.status === "sold-out" ? "Agotado" : func.status === "desactivate" ? "No activo" : "Cancelado"}
                        </button>
                      </td>
                      <td className="p-4 text-sm">
                        <button
                          className={`px-2 py-1 rounded-full text-xs font-medium ${func.isMain ?
                            "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                            }`}
                        >
                          {func.isMain ? "Activado" : "Desactivado"}
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

      </>)}

      {/* Lista de Funciones */}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingFunction ? "Editar Función" : "Nueva Función"}
            </h2>
            <div className="space-y-4">
              {!editingFunction && (
                <div className="space-y-2">
                  <Label htmlFor="showId">Obra</Label>
                  <select
                    id="showId"
                    value={formData.playId}
                    onChange={(e) => setFormData({ ...formData, playId: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                    required
                  >
                    <option value="">Seleccionar obra</option>
                    {plays.map((play) => (
                      <option key={play.id} value={play.id}>
                        {play.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  {theaters.map((theater) => (
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

              {/* Secciones */}
              <div className="space-y-3">
                <Label>Secciones</Label>

                {/* Secciones agregadas */}
                {sections.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {sections.map((section, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{section.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {section.totalSeats} asientos · {formatPrice(section.price)}
                          </div>
                        </div>
                        {!section.id && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSection(section.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Agregar nueva sección */}
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nombre</Label>
                      <Input
                        type="text"
                        placeholder="General, Balcón..."
                        value={newSection.name}
                        onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Asientos</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={newSection.totalSeats || ""}
                        onChange={(e) => setNewSection({ ...newSection, totalSeats: Number(e.target.value) })}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Precio</Label>
                      <Input
                        type="number"
                        placeholder="5000"
                        value={newSection.price || ""}
                        onChange={(e) => setNewSection({ ...newSection, price: Number(e.target.value) })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSection}
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Sección
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promotionId">Promocion</Label>
                <select
                  id="promotionId"
                  value={formData.promotionId}
                  onChange={(e) => setFormData({ ...formData, promotionId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="">Selecciona Promoción</option>
                  {promotions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {getBadgeText(p.type, p.value)} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
              {editingFunction && (
                <div className="space-y-2">
                  <Label htmlFor="promotionId">Estado</Label>
                  <select
                    id="estado"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  >
                    <option key="active" value="active">
                      Activo
                    </option>
                    <option key="cancelled" value="cancelled">
                      Cancelado
                    </option>
                    <option key="desactivate" value="desactivate">
                      No Activo
                    </option>
                  </select>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-1">
                <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Si está activada, aparecerá en el carrousel de la página principal
                    </p>
                  </div>
                  <Switch
                    checked={formData.isMain}
                    onCheckedChange={isMain => setFormData(prev => ({ ...prev, isMain }))}
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
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={loading}
                >
                  {editingFunction ? "Guardar" : "Crear"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}