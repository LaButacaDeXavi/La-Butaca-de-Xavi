"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingCart, Trash2, Mail } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/format"
import type { CartItem } from "@/types/event"
import type { CheckoutFormData } from "@/types/checkout"

export default function CarritoPage() {
    const { removeFromCart, getCartTotal, items } = useCart();
    const [cart, setCart] = useState<CartItem[]>(items)
    const [formData, setFormData] = useState<CheckoutFormData>({
        fullName: "",
        email: "",
        confirmEmail: "",
        phone: "",
        dni: "",
    })

    const [errors, setErrors] = useState<Partial<CheckoutFormData>>({})

    useEffect(() => {
        setCart(items)
    }, [items])

    const handleRemove = (eventId: string) => {
        removeFromCart(eventId)
    }

    const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error for this field
        setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    const validateForm = (): boolean => {
        const newErrors: Partial<CheckoutFormData> = {}

        if (!formData.fullName.trim()) {
            newErrors.fullName = "El nombre y apellido es requerido"
        }

        if (!formData.email.trim()) {
            newErrors.email = "El email es requerido"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email inválido"
        }

        if (!formData.confirmEmail.trim()) {
            newErrors.confirmEmail = "Confirme su email"
        } else if (formData.email !== formData.confirmEmail) {
            newErrors.confirmEmail = "Los emails no coinciden"
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "El teléfono es requerido"
        }

        if (!formData.dni.trim()) {
            newErrors.dni = "El DNI es requerido"
        } else if (!/^\d{7,8}$/.test(formData.dni)) {
            newErrors.dni = "DNI inválido (debe tener 7 u 8 dígitos)"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        // Here you would normally process the payment
        console.log("Processing order:", { formData, cart })
        alert("Compra procesada exitosamente! Las entradas serán enviadas a tu email.")
    }

    const { subtotal, discount, total } = getCartTotal();

    const calculateQuantity = (q: number) => {
        if (q % 2 === 0) {
            return q / 2
        } else {
            return Math.round(q / 2)
        }
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-16">
                    <Card className="p-12 text-center">
                        <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
                        <p className="text-muted-foreground mb-6">Explora nuestros eventos y agrega entradas</p>
                        <Button asChild>
                            <a href="/">Ver Eventos</a>
                        </Button>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <Card key={item.event.id} className="p-4">
                                <div className="flex gap-4">
                                    <img
                                        src={item.event.image || "/placeholder.svg"}
                                        alt={item.event.title}
                                        className="w-24 h-24 object-cover rounded-md"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{item.event.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {item.event.date} - {item.event.time}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{item.event.venue}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <div>
                                                <span className="text-sm text-muted-foreground">Cantidad: {item.quantity}</span>
                                                {item.event.has2x1Promo && item.quantity >= 2 && (
                                                    <span className="ml-2 text-sm text-accent font-semibold">(2x1 Aplicado)</span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                {item.event.has2x1Promo && item.quantity >= 2 && (
                                                    <p className="font-bold">{formatPrice(item.event.price * calculateQuantity(item.quantity))}</p>
                                                )}
                                                <p className={` ${item.event.has2x1Promo && item.quantity > 1 ? "line-through text-sm text-muted-foreground" : "font-bold "} `}>
                                                    {formatPrice(item.event.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemove(item.event.id)}>
                                        <Trash2 className="h-5 w-5 text-destructive" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Checkout Form */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-4">Datos del Comprador</h2>

                            {/* Important Notice */}
                            <div className="bg-accent/10 border border-accent rounded-lg p-4 mb-6 flex gap-3">
                                <Mail className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-accent mb-1">Las entradas se enviarán por email</p>
                                    <p className="text-muted-foreground">Asegúrate de escribir correctamente tu correo electrónico</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                <div>
                                    <Label className="mb-2" htmlFor="lastName">Nombre y Apellido *</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                                        className={errors.fullName ? "border-destructive" : ""}
                                        placeholder="Nombre y Apellido"
                                    />
                                    {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}

                                </div>

                                <div>
                                    <Label className="mb-2" htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className={errors.email ? "border-destructive" : ""}
                                        placeholder="ejemplo@gmail.com"
                                    />
                                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <Label className="mb-2" htmlFor="confirmEmail">Repetir Email *</Label>
                                    <Input
                                        id="confirmEmail"
                                        type="email"
                                        value={formData.confirmEmail}
                                        onChange={(e) => handleInputChange("confirmEmail", e.target.value)}
                                        className={errors.confirmEmail ? "border-destructive" : ""}
                                        placeholder="ejemplo@gmail.com"

                                    />
                                    {errors.confirmEmail && <p className="text-xs text-destructive mt-1">{errors.confirmEmail}</p>}
                                </div>

                                <div>
                                    <Label className="mb-2" htmlFor="phone">Teléfono *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        className={errors.phone ? "border-destructive" : ""}
                                        placeholder="3851234567"
                                    />
                                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <Label className="mb-2" htmlFor="dni">DNI *</Label>
                                    <Input
                                        id="dni"
                                        value={formData.dni}
                                        onChange={(e) => handleInputChange("dni", e.target.value)}
                                        className={errors.dni ? "border-destructive" : ""}
                                        placeholder="12345678"
                                    />
                                    {errors.dni && <p className="text-xs text-destructive mt-1">{errors.dni}</p>}
                                </div>

                                {/* Order Summary */}
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-sm text-accent font-semibold">
                                            <span>Descuento 2x1</span>
                                            <span>-{formatPrice(discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total</span>
                                        <span>{formatPrice(total)}</span>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" size="lg">
                                    Finalizar Compra
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
