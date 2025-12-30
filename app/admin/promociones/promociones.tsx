"use client"

import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
    Plus,
    Pencil,
    Trash2,
    Percent,
    BadgeDollarSign,
    TicketCheck,
    Calendar,
    Hash,
    ToggleLeft,
    ToggleRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

import type { Promotion } from "@/types/admin"
import { createPromotion, deletePromotion, updatePromotion } from "./actions"
import type { PromotionPayload } from "./actions"

interface PromotionsPageProps {
    promotions: Promotion[]
}

type FormState = {
    name: string
    description: string
    type: Promotion["type"]
    value: string
    requires_code: boolean
    max_uses_per_order: string
    min_tickets: string
    is_active: boolean
    valid_from: string
    valid_until: string
}

const emptyFormState: FormState = {
    name: "",
    description: "",
    type: "percentage",
    value: "0",
    requires_code: false,
    max_uses_per_order: "1",
    min_tickets: "1",
    is_active: true,
    valid_from: "",
    valid_until: "",
}

const typeOptions: Array<{ value: Promotion["type"]; label: string; icon: React.ReactNode }> = [
    { value: "percentage", label: "Porcentaje", icon: <Percent className="h-4 w-4" /> },
    { value: "fixed", label: "Monto fijo", icon: <BadgeDollarSign className="h-4 w-4" /> },
    { value: "2x1", label: "2x1", icon: <TicketCheck className="h-4 w-4" /> },
]

const parseDateInput = (value: string | Date) => {
    if (!value) return ""
    if (typeof value === "string" && value.includes("T")) return value
    const date = typeof value === "string" ? parseISO(value) : value
    if (Number.isNaN(date.getTime())) return ""
    return format(date, "yyyy-MM-dd'T'HH:mm", { locale: es })
}

const toNumber = (value: string, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const normalizePayload = (state: FormState): PromotionPayload => ({
    name: state.name.trim(),
    description: state.description.trim(),
    type: state.type,
    value: toNumber(state.value),
    requires_code: state.requires_code,
    max_uses_per_order: toNumber(state.max_uses_per_order, 1),
    min_tickets: toNumber(state.min_tickets, 1),
    is_active: state.is_active,
    valid_from: new Date(state.valid_from),
    valid_until: new Date(state.valid_until),
})

export default function PromotionsPage({ promotions: initialPromotions }: PromotionsPageProps) {
    const [promotions, setPromotions] = useState<Promotion[]>(() =>
        initialPromotions.sort(
            (a, b) => new Date(b.valid_from).getTime() - new Date(a.valid_from).getTime()
        )
    )
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
    const [formState, setFormState] = useState<FormState>({ ...emptyFormState })
    const [loading, setLoading] = useState(false)

    const typeLabel = useMemo(() => Object.fromEntries(typeOptions.map(option => [option.value, option.label])), [])

    const openCreateModal = () => {
        setFormState({ ...emptyFormState, valid_from: "", valid_until: "" })
        setEditingPromotion(null)
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormState({ ...emptyFormState })
        setEditingPromotion(null)
        setIsModalOpen(false)
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)

        try {
            if (!formState.valid_from || !formState.valid_until) {
                toast.error("Debes seleccionar las fechas de vigencia")
                return
            }

            if (new Date(formState.valid_from) > new Date(formState.valid_until)) {
                toast.error("La fecha de inicio no puede ser posterior a la de fin")
                return
            }

            const payload = normalizePayload(formState)

            if (editingPromotion) {
                const result = await updatePromotion({ ...payload, id: editingPromotion.id })

                if (!result.success) {
                    toast.error(result.message)
                    return
                }

                toast.success(result.message)

                setPromotions(prev =>
                    prev.map(promotion =>
                        promotion.id === editingPromotion.id
                            ? {
                                ...promotion,
                                ...payload,
                                valid_from: payload.valid_from,
                                valid_until: payload.valid_until,
                            }
                            : promotion
                    )
                )
            } else {
                const result = await createPromotion(payload)

                if (!result.success) {
                    toast.error(result.message)
                    return
                }

                toast.success(result.message)

                setPromotions(prev => [
                    {
                        ...payload,
                        id: result.promotion_id!,
                    } as Promotion,
                    ...prev,
                ])
            }

            resetForm()
        } catch (error) {
            console.error("handleSubmit error", error)
            toast.error("Error al guardar la promoción")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (promotion: Promotion) => {
        setEditingPromotion(promotion)
        setFormState({
            name: promotion.name,
            description: promotion.description,
            type: promotion.type,
            value: String(promotion.value),
            requires_code: promotion.requires_code,
            max_uses_per_order: String(promotion.max_uses_per_order),
            min_tickets: String(promotion.min_tickets),
            is_active: promotion.is_active,
            valid_from: parseDateInput(promotion.valid_from),
            valid_until: parseDateInput(promotion.valid_until),
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta promoción?")) return
        setLoading(true)

        try {
            const result = await deletePromotion(id)

            if (!result.success) {
                toast.error(result.message)
                return
            }

            toast.success(result.message)

            setPromotions(prev => prev.filter(promotion => promotion.id !== id))
        } catch (error) {
            console.error("handleDelete error", error)
            toast.error("Error al eliminar la promoción")
        } finally {
            setLoading(false)
        }
    }

    const renderTypeBadge = (promotion: Promotion) => {
        const option = typeOptions.find(item => item.value === promotion.type)
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {option?.icon}
                {option?.label || promotion.type}
            </span>
        )
    }

    const Badge = ({ label, icon }: { label: React.ReactNode; icon: React.ReactNode }) => (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
            {icon}
            <span>{label}</span>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Promociones</h1>
                    <p className="mt-1 text-muted-foreground">Gestiona las promociones</p>
                </div>
                <Button onClick={openCreateModal} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Promoción
                </Button>
            </div>

            {promotions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 py-12">
                    <p className="max-w-xs text-center text-muted-foreground">
                        Aún no tienes promociones creadas. Agrega tu primera promoción para ofrecer descuentos a tus clientes.
                    </p>
                    <Button onClick={openCreateModal} className="mt-4">
                        Crear promoción
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {promotions.map(promotion => (
                        <div key={promotion.id} className="flex flex-col justify-between rounded-lg border border-border bg-card shadow-sm">
                            <div className="space-y-4 p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-semibold text-foreground">{promotion.name}</h3>
                                        <p className="text-sm text-muted-foreground">{promotion.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(promotion)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => handleDelete(promotion.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {renderTypeBadge(promotion)}
                                    {promotion.type !== "2x1" && (
                                        <Badge
                                            label={`Valor: ${promotion.type === "percentage" ? `${promotion.value}%` : `$${promotion.value.toFixed(2)}`}`}
                                            icon={<BadgeDollarSign className="h-4 w-4" />}
                                        />

                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                                    <Badge
                                        label={`Límite por orden: ${promotion.max_uses_per_order}`}
                                        icon={<ToggleRight className="h-4 w-4" />}
                                    />
                                    <Badge
                                        label={`Tickets mínimos: ${promotion.min_tickets}`}
                                        icon={<TicketCheck className="h-4 w-4" />}
                                    />
                                    <Badge
                                        label={`Desde: ${format(promotion.valid_from, "PPPp", { locale: es })}`}
                                        icon={<Calendar className="h-4 w-4" />}
                                    />
                                    <Badge
                                        label={`Hasta: ${format(promotion.valid_until, "PPPp", { locale: es })}`}
                                        icon={<Calendar className="h-4 w-4" />}
                                    />
                                    <Badge
                                        label={promotion.is_active ? "Activa" : "Inactiva"}
                                        icon={promotion.is_active ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6 shadow-lg max-h-[calc(100vh-4rem)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    {editingPromotion ? "Editar promoción" : "Nueva promoción"}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Define los detalles y vigencia de la promoción
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        value={formState.name}
                                        onChange={event => setFormState(prev => ({ ...prev, name: event.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipo</Label>
                                    <Select
                                        value={formState.type}
                                        onValueChange={value => setFormState(prev => ({ ...prev, type: value as Promotion["type"] }))}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Selecciona un tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {typeOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center gap-2">
                                                        {option.icon}
                                                        <span>{option.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={formState.description}
                                    onChange={event => setFormState(prev => ({ ...prev, description: event.target.value }))}
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="value">Valor</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={formState.value}
                                        onChange={event => setFormState(prev => ({ ...prev, value: event.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxUses">Máximo por orden</Label>
                                    <Input
                                        id="maxUses"
                                        type="number"
                                        min={1}
                                        value={formState.max_uses_per_order}
                                        onChange={event =>
                                            setFormState(prev => ({ ...prev, max_uses_per_order: event.target.value }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minTickets">Tickets mínimos</Label>
                                    <Input
                                        id="minTickets"
                                        type="number"
                                        min={1}
                                        value={formState.min_tickets}
                                        onChange={event =>
                                            setFormState(prev => ({ ...prev, min_tickets: event.target.value }))
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="validFrom">Válido desde</Label>
                                    <Input
                                        id="validFrom"
                                        type="datetime-local"
                                        value={formState.valid_from}
                                        onChange={event => setFormState(prev => ({ ...prev, valid_from: event.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="validUntil">Válido hasta</Label>
                                    <Input
                                        id="validUntil"
                                        type="datetime-local"
                                        value={formState.valid_until}
                                        onChange={event => setFormState(prev => ({ ...prev, valid_until: event.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-1">
                                <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Promoción activa</p>
                                        <p className="text-xs text-muted-foreground">
                                            Si está desactivada, no se aplicará aunque esté dentro de la vigencia
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formState.is_active}
                                        onCheckedChange={is_active => setFormState(prev => ({ ...prev, is_active }))}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1" disabled={loading}>
                                    {editingPromotion ? "Guardar cambios" : "Crear promoción"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
