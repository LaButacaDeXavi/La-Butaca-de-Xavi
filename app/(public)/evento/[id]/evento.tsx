import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Calendar, Clock, ArrowUpRightFromSquareIcon, Instagram, Facebook, Twitter } from "lucide-react"
import { formatDate, parseLocalDate } from "@/lib/cart-utils"
import { TicketSelector } from "@/components/evento/ticket-selector"
import { ImageGallery } from "@/components/evento/image-gallery"
import { Event } from "@/types/event"
import Link from "next/link"

interface EventoPageProps {
  event: Event
}

export default async function EventoPage({ event }: EventoPageProps) {
  if (!event) {
    return <div>Evento no encontrado</div>
  }

  const images = [event.play.image, ...event.play.galerry ?? ""]

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
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Image */}
          <div className="lg:col-span-2">
            <div className="mb-6 relative">
              <ImageGallery images={images || [event.play.image]} title={event.play.title} />
              {event.promotion?.name && promotionValid && (
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground md:text-lg text-xs px-4 py-2 z-10">
                  {badgeText}
                </Badge>
              )}
            </div>

            {/* Event Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{event.play.title}</h1>
                {event.play.subtitle && <p className="text-xl text-muted-foreground">{event.play.subtitle}</p>}
                {event.play.category && (
                  <Badge variant="outline" className="mt-2">
                    {event.play.category}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha</p>
                      <p className="font-semibold text-foreground">{formatDate(event.date)}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hora</p>
                      <p className="font-semibold text-foreground">{event.time}</p>
                      {event.play.durationMinutes && (
                        <p className="text-xs text-muted-foreground">
                          Duración: {event.play.durationMinutes} min
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Lugar</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground line-clamp-1">
                            {event.theater.name}
                          </p>
                          {event.theater.address && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {event.theater.address}
                            </p>
                          )}
                        </div>
                        {event.theater.mapUrl && (
                          <Link
                            href={event.theater.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            <ArrowUpRightFromSquareIcon className="h-5 w-5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Descripción</h2>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                  {event.play.description}
                </p>
              </div>

              {/* Artists Section */}
              {event.artist && event.artist.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Artistas</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.artist.map((artist, index) => (
                      <Card key={index} className="p-4 bg-card border-border">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={artist.image} alt={artist.name} />
                            <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{artist.name}</p>
                            <div className="flex gap-2 mt-2">
                              {artist.instagram && (
                                <Link
                                  href={artist.instagram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Instagram className="h-4 w-4" />
                                </Link>
                              )}
                              {artist.facebook && (
                                <Link
                                  href={artist.facebook}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Facebook className="h-4 w-4" />
                                </Link>
                              )}
                              {artist.x && (
                                <Link
                                  href={artist.x}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Twitter className="h-4 w-4" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Promotion Section */}
              {event.promotion?.name && event.promotion.isActive && promotionValid && (
                <Card className="p-6 bg-linear-to-r from-accent/20 to-accent/5 border-accent">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {badgeText} {event.promotion.name}
                  </h3>
                  {event.promotion.description && (
                    <p className="text-foreground/80 mb-3">
                      {event.promotion.description}
                    </p>
                  )}
                  {event.promotion.type === "2x1" && (
                    <p className="text-foreground/80 mb-3">
                     Promoción 2x1 válida únicamente para entradas del mismo tipo.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {event.promotion.minTickets && (
                      <span>Mínimo: {event.promotion.minTickets} tickets</span>
                    )}
                    {event.promotion.maxUsesPerOrder && event.promotion.type === "2x1" && (
                      <span>Máx. usos: {event.promotion.maxUsesPerOrder}</span>
                    )}
                    {event.promotion.validUntil && (
                      <span>Válido hasta: {formatDate(event.promotion.validUntil)}</span>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Ticket Selector */}
          <div className="lg:col-span-1">
            <TicketSelector event={event} />
          </div>
        </div>
      </div>
    </div>
  )
}