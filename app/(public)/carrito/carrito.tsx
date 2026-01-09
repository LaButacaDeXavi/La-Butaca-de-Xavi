"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, AlertCircle } from "lucide-react"
import { formatPrice } from "@/lib/format"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/layout/header"
import { toast } from "sonner"
import { clearCheckout } from "@/lib/actions/session"
import { createCheckout } from "@/lib/actions/mercadopago"
type CheckoutData = {
    subtotal: number
    discount_amount: number
    total: number
    discount_types: {
        type: string
        value: number | null
    } | null
    checkout_items: {
        performances_sections: {
            name: string
        }
        unit_price: number
        subtotal: number
        quantity: number
    }[]
    performances: {
        id: string
        date: string
        time: string
        plays: {
            title: string
            main_image_url: string
        }
    }
}

type CheckoutFormData = {
    fullName: string
    email: string
    confirmEmail: string
    phone: string
    dni: string
}

interface CarritoPageProps {
    data: CheckoutData | null
}

export default function CarritoPage({ data }: CarritoPageProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<CheckoutFormData>({
        fullName: "",
        email: "",
        confirmEmail: "",
        phone: "",
        dni: ""
    })

    const [timeRemaining, setTimeRemaining] = useState(600)

    // Timer de cuenta regresiva
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleChange = (field: keyof CheckoutFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!formData.phone || !formData.fullName || !formData.dni || !formData.email || !formData.confirmEmail) return toast.error('Completa todos los campos.')
        if (formData.email !== formData.confirmEmail) {
            toast.error('Los emails no coinciden')
            return
        }

        try {
            setLoading(true)
            const data = await createCheckout({
                dni: formData.dni,
                email: formData.email,
                fullName: formData.fullName,
                phone: formData.phone
            });

            window.location.href = data.init_point
        } catch (error) {
            toast.error('Error al crear el pago')
        } finally {
            setLoading(false)
        }

    }

    if (!data) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No hay items en el carrito</p>
                </Card>
            </div>
        )
    }

    const event = data.performances
    const hasDiscount = data.discount_amount > 0

    return (
        <div>
            <Header />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-2">Comprando</h1>

                    {/* Timer de sesión */}
                    <div className="flex items-center gap-2 mb-8 text-muted-foreground">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <span className="text-orange-500 font-semibold text-lg">
                            {formatTime(timeRemaining)}
                        </span>
                        <span className="text-sm">
                            Tienes 10 minutos para realizar la compra.
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Columna izquierda - Información del evento y entradas */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Información del evento */}
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Evento</h2>
                                <div className="flex gap-4">
                                    <img
                                        src={event.plays.main_image_url}
                                        alt={event.plays.title}
                                        className="w-24 h-32 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-2">
                                            {event.plays.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            {new Date(event.date).toLocaleDateString('es-AR', {
                                                weekday: 'long',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {event.time} hs
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Tabla de entradas */}
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Entradas Seleccionadas</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-left">
                                                <th className="pb-3 font-semibold text-sm">Producto</th>
                                                <th className="pb-3 font-semibold text-sm text-right">Precio</th>
                                                <th className="pb-3 font-semibold text-sm text-center">Cantidad</th>
                                                <th className="pb-3 font-semibold text-sm text-right">Sub Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.checkout_items.map((item, index) => (
                                                <tr key={index} className="border-b last:border-0">
                                                    <td className="py-4">
                                                        <p className="font-medium">
                                                            {item.performances_sections.name}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        {formatPrice(item.unit_price)}
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="py-4 text-right font-semibold">
                                                        {formatPrice(item.subtotal)}
                                                    </td>
                                                </tr>
                                            ))}

                                            {/* Fila de descuento si existe */}
                                            {hasDiscount && data.discount_types && (
                                                <tr className="border-b">
                                                    <td className="py-4" colSpan={3}>
                                                        <p className="font-medium text-green-600">
                                                            {data.discount_types.type === '2x1' && '2x1'}
                                                            {data.discount_types.type === '3x2' && '3x2'}
                                                            {data.discount_types.type === 'fixed' && `Descuento -$${data.discount_types.value}`}
                                                            {data.discount_types.type === 'percentage' && `Descuento ${data.discount_types.value}%`}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 text-right font-semibold text-green-600">
                                                        -{formatPrice(data.discount_amount)}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>

                        {/* Columna derecha - Formulario */}
                        <div>
                            <Card className="p-6 sticky top-4">
                                <h2 className="text-xl font-bold mb-4">Datos del Comprador</h2>

                                <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
                                        <strong>ATENCIÓN:</strong> Verifica que tu correo sea correcto:
                                        allí recibirás los accesos al evento.
                                    </AlertDescription>
                                </Alert>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="fullName" className="mb-2 block">
                                            Nombre y Apellido *
                                        </Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            required
                                            minLength={3}
                                            placeholder="Juan Pérez"
                                            value={formData.fullName}
                                            onChange={e => handleChange("fullName", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email" className="mb-2 block">
                                            Email *
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            required
                                            type="email"
                                            placeholder="tu@email.com"
                                            value={formData.email}
                                            onChange={e => handleChange("email", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="confirmEmail" className="mb-2 block">
                                            Repetir Email *
                                        </Label>
                                        <Input
                                            id="confirmEmail"
                                            name="confirmEmail"
                                            required
                                            type="email"
                                            placeholder="tu@email.com"
                                            value={formData.confirmEmail}
                                            onChange={e => handleChange("confirmEmail", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone" className="mb-2 block">
                                            Teléfono *
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            required
                                            type="tel"
                                            placeholder="+54 9 11 1234-5678"
                                            value={formData.phone}
                                            onChange={e => handleChange("phone", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="dni" className="mb-2 block">
                                            DNI  *
                                        </Label>
                                        <Input
                                            id="dni"
                                            name="dni"
                                            required
                                            minLength={7}
                                            placeholder="12345678"
                                            value={formData.dni}
                                            onChange={e => handleChange("dni", e.target.value)}
                                        />
                                    </div>

                                    <div className="border-t pt-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(data.subtotal)}</span>
                                        </div>

                                        {hasDiscount && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Descuento</span>
                                                <span>-{formatPrice(data.discount_amount)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-xl font-bold border-t pt-3">
                                            <span>Total</span>
                                            <span>{formatPrice(data.total)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-12 bg-[#009EE3] hover:bg-[#0088c6] gap-0"
                                        size="lg"
                                        disabled={timeRemaining === 0 || loading}
                                    >
                                        <span className="text-white text-[17px]">
                                            Pagar con
                                        </span>
                                        <img
                                            src="/logoMercadoPago1.png"
                                            alt="Mercado Pago"
                                            className="h-full w-auto text-white"
                                        />
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}