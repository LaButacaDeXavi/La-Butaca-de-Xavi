"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {CartItem} from "@/types/event"

export interface CartEvent {
  id: string
  title: string
  price: number
  date: string
  theater: string
  has2x1Promo: boolean
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (eventId: string) => void
  updateQuantity: (eventId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => {
    subtotal: number
    discount: number
    total: number
  }
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cartData = localStorage.getItem("cart")
      if (cartData) {
        try {
          setItems(JSON.parse(cartData))
        } catch (error) {
          console.error("Error loading cart:", error)
          localStorage.removeItem("cart")
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addToCart = (item: CartItem) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex((i) => i.event.id === item.event.id)
      
      if (existingIndex >= 0) {
        // Actualizar cantidad del item existente
        const newItems = [...currentItems]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + item.quantity,
        }
        return newItems
      } else {
        // Agregar nuevo item
        return [...currentItems, item]
      }
    })
  }

  const removeFromCart = (eventId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.event.id !== eventId))
  }

  const updateQuantity = (eventId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(eventId)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.event.id === eventId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getCartTotal = () => {
    let subtotal = 0
    let discount = 0

    items.forEach((item) => {
      const itemSubtotal = item.event.price * item.quantity
      subtotal += itemSubtotal

      // Aplicar 2x1 si el evento tiene la promo y se compran 2 o más entradas
      if (item.event.has2x1Promo && item.quantity >= 2) {
        const pairs = Math.floor(item.quantity / 2)
        discount += pairs * item.event.price
      }
    })

    return {
      subtotal,
      discount,
      total: subtotal - discount,
    }
  }

  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}