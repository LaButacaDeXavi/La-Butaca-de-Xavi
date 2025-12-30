export interface Event {
  id: string
  play: Play
  date: string
  time: string
  theater:Theater
  sections: EventSection[]
  promotion?: Promotion
  artist?: Artist[]
}

interface Theater {
  name: string
  address: string
  mapUrl: string
}

interface Play {
  title: string
  subtitle: string
  category: string
  description: string
  durationMinutes: string
  image: string
  galerry: string[]
}

interface Artist {
  name: string,
  instagram: string
  facebook: string
  x: string
  image: string
}

export interface CartItem {
  event: Event
  quantity: number
}


export type Promotion = {
  id: string
  name: string
  description?: string
  type: 'percentage' | 'fixed' | '2x1'
  value?: number
  minTickets: number
  maxUsesPerOrder: number
  validFrom:Date
  validUntil:Date
  isActive:boolean
}

type EventSection = {
  id: string
  name: string
  price: number
}



