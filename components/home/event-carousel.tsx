"use client"

import type { Event } from "@/types/event"
import { EventCard } from "./event-card"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

interface EventGridProps {
  title: string
  events: Event[]
}

export function EventGrid({ title, events }: EventGridProps) {
  const router = useRouter();
  const handleClear = () => {
    router.push('/eventos')
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{title}</h2>

      {events.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-muted/30 rounded-lg border-2 border-dashed border-border">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No se encontraron eventos
          </h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            No hay eventos que coincidan con los filtros seleccionados. Intenta ajustar los criterios de búsqueda.
          </p>
          <Button
            onClick={handleClear}
            variant="outline"
            className="border-border hover:bg-muted font-semibold"
          >
            LIMPIAR FILTROS
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}