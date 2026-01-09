"use client"

import { useState } from "react"
import type { Event } from "@/types/event"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import { ShoppingCart } from "lucide-react"
import { formatPrice } from "@/lib/cart-utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  createCheckoutSession,
  upsertCheckoutItem,
  validatePromotion
} from "@/lib/actions/session"

interface TicketSelectorProps {
  event: Event
}

export function TicketSelector({ event }: TicketSelectorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        event.sections.map(section => [section.id, 0])
      )
  )

  const totalTickets = Object.values(quantities).reduce(
    (a, b) => a + b,
    0
  )


  const handleQuantityChange = (sectionId: string, value: string) => {
    setQuantities(prev => ({
      ...prev,
      [sectionId]: Number(value)
    }))
  }

  const handleSubmit = async () => {
    if (totalTickets === 0) {
      toast.error("Seleccioná al menos una entrada")
      return
    }
    try {
      setLoading(true)

      await createCheckoutSession(event.id)

      for (const section of event.sections) {
        const qty = quantities[section.id]
        if (qty > 0) {
          await upsertCheckoutItem(event.id, section.id, qty)
        }
      }

      router.push("/carrito")
    } catch {
      toast.error("No se pudo iniciar la compra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 bg-card border-border sticky top-24">
      <div className="space-y-6">

        <h3 className="text-2xl font-bold">Comprar Entradas</h3>

        {/* Tabla de secciones */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 text-sm font-semibold text-muted-foreground border-b pb-2">
            <span>Tipo de ticket</span>
            <span className="text-center">Valor</span>
            <span className="text-right">Cantidad</span>
          </div>

          {event.sections.map(section => (
            <div
              key={section.id}
              className="grid grid-cols-3 items-center gap-4"
            >
              <span className="font-medium">{section.name}</span>

              <span className="text-center">
                {formatPrice(section.price)}
              </span>

              <Select
                value={String(quantities[section.id])}
                onValueChange={value =>
                  handleQuantityChange(section.id, value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <Button
          className="w-full h-12 text-lg"
          disabled={loading}
          onClick={handleSubmit}
        >
          <ShoppingCart className="mr-2" />
          Comprar
        </Button>

      </div>
    </Card>
  )
}
