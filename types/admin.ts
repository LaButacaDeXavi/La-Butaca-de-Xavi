export interface Theater {
  id: string
  name: string
  city: string
  address: string
  mapUrl: string
}

export interface Artist {
  id: string,
  name: string,
  avatar_url: string
  instagram_url?: string,
  twittter_url?: string,
  facebook_url?: string
}

export interface Play {
  id: string
  title: string
  subtitle?: string
  description?: string
  duration: number // en minutos
  genre: string
  mainImage: string
  gallery?: string[]
  artists?: Partial<Artist>[]
}

export interface Section {
  id: string
  name: string
  totalSeats: number
  availableSeats: number
  price: number
}


export interface Performances {
  id: string
  isMain: boolean
  play: Omit<Play, 'subtitle' | 'description' | 'duration' | 'mainImage' | 'gallery' | 'artists'>
  theater: Omit<Theater, 'mapUrl' | 'city'>
  date: string
  time: string
  sections: Section[]  // Agregar esto
  promotion?: Promotion
  status: "active" | "sold-out" | "cancelled" | "desactivate"
}

export interface Order {
  id: string
  play: string
  performance: { id: string, date: string, time: string }
  customerName: string
  customerEmail: string
  customerPhone: string
  customerDni: string
  ticketQuantity: number
  discountType: string
  subtotal: number
  discount: number
  total: number
  status: "pending" | "paid" | "cancelled"
  tickets: Ticket[]
  createdAt: Date
}

export interface Ticket {
  id: string
  qrCode: string
  scanned: boolean
  scannedAt?: Date
  seatNumber?: string | null
  sectionName: string
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
  password?: string
  name: string
  role: "admin" | "scanner"
}


// types/scanner.ts
export type ScanResult = {
  success: boolean
  message: string
  ticket?: {
    id: string
    orderId: string
    customerName: string
    customerEmail: string
    showTitle: string
    date: string
    time: string
    seatNumber?: string
    alreadyScanned: boolean
    scannedAt?: string
    section: string
  }
}

export interface Promotion {
  id: string
  name: string
  description: string
  type: "percentage" | "fixed" | "2x1"
  value: number
  requires_code: boolean
  max_uses_per_order: number
  min_tickets: number
  is_active: boolean
  valid_from: string
  valid_until: string
}