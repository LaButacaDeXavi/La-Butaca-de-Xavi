import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { MapPin, Calendar, Clock, ArrowUpRightFromSquareIcon } from "lucide-react"
import { featuredEvents, upcomingEvents } from "@/lib/mock-events"
import { formatDate } from "@/lib/cart-utils"
import { TicketSelector } from "@/components/evento/ticket-selector"
import { ImageGallery } from "@/components/evento/image-gallery"

export default async function EventoPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const allEvents = [...featuredEvents, ...upcomingEvents]
  const event = allEvents.find((e) => e.id === id)

  if (!event) {
    return <div>Evento no encontrado</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Image */}
          <div className="lg:col-span-2">
            <div className="mb-6 relative">
              <ImageGallery images={event.gallery || [event.image]} title={event.title} />
              {event.has2x1Promo && (
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground text-lg px-4 py-2 z-10">
                    PROMO 2x1
                </Badge>
              )}
            </div>

            {/* Event Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{event.title}</h1>
                {event.subtitle && <p className="text-xl text-muted-foreground">{event.subtitle}</p>}
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
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-card border-border cursor-pointer">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lugar</p>
                      <div className="flex gap-2">
                        <p className="font-semibold text-foreground line-clamp-1">{event.venue}</p>
                        <ArrowUpRightFromSquareIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Descripción</h2>
                <p className="text-foreground/90 leading-relaxed">{event.description}</p>
              </div>

              {event.has2x1Promo && (
                <Card className="p-6 bg-linear-to-r from-accent/20 to-accent/5 border-accent">
                  <h3 className="text-xl font-bold text-foreground mb-2"> Promoción 2x1 Activa</h3>
                  <p className="text-foreground/80">
                    Al comprar 2 entradas, solo pagas 1. La promoción se aplica automáticamente en tu carrito.
                  </p>
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
