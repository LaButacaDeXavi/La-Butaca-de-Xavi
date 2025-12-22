import type { Event } from "@/types/event"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar } from "lucide-react"
import { formatDate, formatPrice } from "@/lib/cart-utils"
import Link from "next/link"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/evento/${event.id}`}>
      <Card className="pt-0 group overflow-hidden bg-card hover:bg-card/80 border-border transition-all hover:scale-[1.02] cursor-pointer h-full">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {event.has2x1Promo && (
            <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground hover:bg-accent font-bold">
              2x1
            </Badge>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          {event.subtitle && <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{event.subtitle}</p>}
          <div className="space-y-2 text-sm text-foreground/80">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">{formatPrice(event.price)}</span>
            {event.has2x1Promo && <span className="text-xs text-accent font-semibold">PROMO 2x1</span>}
          </div>
        </div>
      </Card>
    </Link>
  )
}
