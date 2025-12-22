"use client"

import { useState } from "react"
import type { Event } from "@/types/event"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { formatPrice } from "@/lib/cart-utils"
import { toast } from "sonner"
import { useCart } from "@/context/cart-context"

interface TicketSelectorProps {
  event: Event
}

export function TicketSelector({ event }: TicketSelectorProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart();
  const handleAggreate = () => {
    if (!event) return
    addToCart({
      event,
      quantity
    })
    toast.success("Agregado al carrito")
  }

  const calculateTotal = () => {
    if (event.has2x1Promo && quantity >= 2) {
      const pairs = Math.floor(quantity / 2)
      const singles = quantity % 2
      return pairs * event.price + singles * event.price
    }
    return quantity * event.price
  }

  const calculateDiscount = () => {
    if (event.has2x1Promo && quantity >= 2) {
      const regularPrice = quantity * event.price
      const discountedPrice = calculateTotal()
      return regularPrice - discountedPrice
    }
    return 0
  }

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const handleIncrease = () => {
    if (quantity < 10) setQuantity(quantity + 1)
  }

  const discount = calculateDiscount()
  const total = calculateTotal()

  return (
    <Card className="p-6 bg-card border-border sticky top-24">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Comprar Entradas</h3>
          <p className="text-sm text-muted-foreground">Selecciona la cantidad de entradas</p>
        </div>

        {/* Price */}
        <div className="pb-4 border-b border-border">
          <p className="text-sm text-muted-foreground mb-1">Precio por entrada</p>
          <p className="text-3xl font-bold text-foreground">{formatPrice(event.price)}</p>
        </div>

        {/* Quantity Selector */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Cantidad</p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrease}
              disabled={quantity <= 1}
              className="h-12 w-12 border-border bg-transparent"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-3xl font-bold text-foreground w-12 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrease}
              disabled={quantity >= 10}
              className="h-12 w-12 border-border"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Promo Info */}
        {event.has2x1Promo && (
          <div className="bg-accent/20 border border-accent rounded-lg p-4">
            <p className="text-sm font-semibold text-accent-foreground text-center">🎉 Promoción 2x1 aplicada</p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal ({quantity} {quantity === 1 ? "entrada" : "entradas"})
            </span>
            <span className="text-foreground font-medium">{formatPrice(quantity * event.price)}</span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-accent font-medium">Descuento 2x1</span>
              <span className="text-accent font-medium">-{formatPrice(discount)}</span>
            </div>
          )}

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Buy Button */}
        <Button
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg"
          size="lg"
          onClick={handleAggreate}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Agregar al carrito
        </Button>
      </div>
    </Card>
  )
}
