"use client"

import type { Event } from "@/types/event"
import { EventCard } from "./event-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

interface EventCarouselProps {
  title: string
  events: Event[]
}

export function EventCarousel({ title, events }: EventCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {events.map((event) => (
          <div key={event.id} className="flex-none w-62.5 md:w-70 select-none">
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  )
}
