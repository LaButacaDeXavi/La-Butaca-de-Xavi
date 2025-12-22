export interface Theater {
  id: string
  name: string
  address: string
  city: string
  mapUrl: string
  createdAt: Date
}

export interface Artist {
  id: string
  name: string
  bio?: string
  image?: string
  socialMedia: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
  createdAt: Date
}

export interface Show {
  id: string
  title: string
  description: string
  duration: number // en minutos
  genre: string
  mainImage: string
  gallery: string[]
  theaterId: string
  artistIds: string[]
  createdAt: Date
}

export interface ShowFunction {
  id: string
  showId: string
  theaterId: string
  date: Date
  time: string
  totalSeats: number
  availableSeats: number
  price: number
  has2x1Promo: boolean
  status: "active" | "sold-out" | "cancelled"
  createdAt: Date
}

export interface Order {
  id: string
  functionId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  ticketQuantity: number
  totalAmount: number
  discount: number
  finalAmount: number
  status: "pending" | "confirmed" | "cancelled"
  paymentMethod: string
  createdAt: Date
  tickets: Ticket[]
}

export interface Ticket {
  id: string
  orderId: string
  functionId: string
  qrCode: string
  scanned: boolean
  scannedAt?: Date
  seatNumber?: string
}

export interface DashboardStats {
  totalSales: number
  todayShows: number
  scannedTickets: number
  totalTickets: number
  recentOrders: Order[]
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin" | "scanner"
}
