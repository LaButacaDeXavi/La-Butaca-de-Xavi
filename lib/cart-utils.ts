import type { CartItem } from "@/types/event"


export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const itemPrice = item.event.price * item.quantity
    // Aplicar 2x1 si el evento tiene la promo y se compran 2 o más entradas
    if (item.event.has2x1Promo && item.quantity >= 2) {
      const pairs = Math.floor(item.quantity / 2)
      const singles = item.quantity % 2
      return total + pairs * item.event.price + singles * item.event.price
    }
    return total + itemPrice
  }, 0)
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []
  const cartData = localStorage.getItem("cart")
  return cartData ? JSON.parse(cartData) : []
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("cart", JSON.stringify(cart))
}

export function addToCart(item: CartItem): void {
  const cart = getCart()
  const existingIndex = cart.findIndex((i) => i.event.id === item.event.id)

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += item.quantity
  } else {
    cart.push(item)
  }

  saveCart(cart)
}


export function removeFromCart(eventId: string): void {
  const cart = getCart()
  const updatedCart = cart.filter((item) => item.event.id !== eventId)
  saveCart(updatedCart)
}

export function calculateCartTotal(items: CartItem[]): {
  subtotal: number
  discount: number
  total: number
} {
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
