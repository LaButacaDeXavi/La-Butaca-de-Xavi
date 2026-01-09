import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import Link from "next/link"
import { Event } from "@/types/event"
import { parseLocalDate } from "@/lib/cart-utils"



function formatEventDate(dateStr: string) {
  const date = parseLocalDate(dateStr)
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const day = String(date.getDate()).padStart(2, "0")
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return { day, month, year }
}

interface eventProps {
  event: Event
}

export function EventCard({ event }: eventProps) {
  const { day, month, year } = formatEventDate(event.date)
  const [hours, minutes] = event.time.split(":")

  const today = new Date()
  today.setHours(0, 0, 0, 0) // Resetear horas para comparar solo fechas

  const validFrom = event.promotion?.validFrom
    ? parseLocalDate(event.promotion.validFrom)
    : null
  const validUntil = event.promotion?.validUntil
    ? parseLocalDate(event.promotion.validUntil)
    : null

  if (validFrom) validFrom.setHours(0, 0, 0, 0)
  if (validUntil) validUntil.setHours(23, 59, 59, 999) // Hasta el final del día

  const promotionValid =
    validFrom &&
    validUntil &&
    today >= validFrom &&
    today <= validUntil

  const getBadgeText = (type: string, value: number) => {
    switch (type) {
      case "2x1":
        return "PROMO 2x1"
      case "fixed":
        return value ? `-$${value} OFF` : null
      case "percentage":
        return value ? `${value}% OFF` : null
      default:
        return null
    }
  }
  const badgeText = promotionValid ? getBadgeText(event.promotion?.type ?? "", event.promotion?.value ?? 0) : ""

  return (
    <Link href={`/evento/${event.id}`}>
      <Card className="group overflow-hidden bg-card hover:bg-card/80 border-border transition-all hover:scale-[1.02] cursor-pointer h-full pt-0 pb-0">
        <div className="flex md:flex-col">
          {/* Image section */}
          <div className="relative w-32  md:w-full md:aspect-3/4 shrink-0 overflow-hidden">
            <img
              src={event.play.image || "/placeholder.svg"}
              alt={event.play.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {promotionValid && (
              <Badge className="absolute top-2 right-2 md:top-3 md:right-3 bg-primary text-primary-foreground hover:bg-primary font-bold text-md">
                {badgeText}
              </Badge>
            )}
          </div>

          {/* Content section */}
          <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
            {/* Theater name */}
            <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm line-clamp-1">{event.theater.name}</span>
            </div>

            {/* Event title and subtitle */}
            <div className="mb-3">
              <h3 className="font-bold text-base md:text-lg text-foreground line-clamp-2 md:line-clamp-1 group-hover:text-primary transition-colors">
                {event.play.title}
              </h3>
              {event.play.subtitle && (
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 mt-0.5">{event.play.subtitle}</p>
              )}
            </div>

            {/* Date and time - large display */}
            <div className="flex items-end gap-3 md:gap-4">
              {/* Day */}
              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-bold text-foreground leading-none">{day}</span>
                <span className="text-xs text-muted-foreground leading-tight">{month}</span>
                <span className="text-xs text-muted-foreground leading-tight">{year}</span>
              </div>

              {/* Separator */}
              <div className="h-8 w-px bg-border self-center" />

              {/* Time */}
              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-bold text-foreground leading-none">{hours}</span>
                <span className="text-xs text-muted-foreground leading-tight">{minutes}</span>
                <span className="text-xs text-muted-foreground leading-tight">hrs</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
