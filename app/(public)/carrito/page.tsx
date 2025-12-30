"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"
import { formatPrice } from "@/lib/format"

type CheckoutItem = {
    id: string
    section_name: string
    quantity: number
    subtotal: number
}

type CheckoutSummary = {
    items: CheckoutItem[]
    subtotal: number
    total: number
}

type CheckoutFormData = {
    fullName: string
    email: string
    confirmEmail: string
    phone: string
    dni: string
}

export default function CarritoPage() {
    // ⚠️ esto debería venir del backend
    const checkout: CheckoutSummary = {
        items: [
            {
                id: "1",
                section_name: "Platea Baja",
                quantity: 2,
                subtotal: 12000
            }
        ],
        subtotal: 12000,
        total: 12000
    }

    const [formData, setFormData] = useState<CheckoutFormData>({
        fullName: "",
        email: "",
        confirmEmail: "",
        phone: "",
        dni: ""
    })

    const handleChange = (field: keyof CheckoutFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // acá solo enviás datos del comprador
        console.log("checkout data", formData)
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Resumen de tu compra</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Entradas seleccionadas */}
                    <div className="lg:col-span-2 space-y-4">
                        {checkout.items.map(item => (
                            <Card key={item.id} className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{item.section_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Cantidad: {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-bold">
                                        {formatPrice(item.subtotal)}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Datos del comprador */}
                    <div>
                        <Card className="p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-4">Datos del comprador</h2>

                            <div className="bg-accent/10 border border-accent rounded-lg p-4 mb-6 flex gap-3">
                                <Mail className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-accent mb-1">
                                        Las entradas se enviarán por email
                                    </p>
                                    <p className="text-muted-foreground">
                                        Revisá que tu correo sea correcto
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label className="mb-2">Nombre y Apellido</Label>
                                    <Input
                                        value={formData.fullName}
                                        onChange={e => handleChange("fullName", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2">Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => handleChange("email", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2">Repetir Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.confirmEmail}
                                        onChange={e => handleChange("confirmEmail", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2">Teléfono</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={e => handleChange("phone", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2">DNI</Label>
                                    <Input
                                        value={formData.dni}
                                        onChange={e => handleChange("dni", e.target.value)}
                                    />
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(checkout.subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total</span>
                                        <span>{formatPrice(checkout.total)}</span>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" size="lg">
                                    Ir al pago
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
