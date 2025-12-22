export interface Event {
  id: string
  title: string
  subtitle?: string
  date: string
  time: string
  venue: string
  location: string
  price: number
  image: string
  gallery?: string[]
  featured?: boolean
  has2x1Promo?: boolean
  category: "teatro" | "musica" | "comedia" | "danza"
  description: string
}

export interface CartItem {
  event: Event
  quantity: number
}
