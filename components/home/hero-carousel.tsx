"use client"

import { useState, useEffect } from "react"
import type { Event } from "@/types/event"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MapPin, Calendar, Clock } from "lucide-react"
import { formatDate, formatPrice } from "@/lib/cart-utils"
import Link from "next/link"

interface HeroCarouselProps {
  events: Event[]
}

export function HeroCarousel({ events }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % events.length)
        setIsTransitioning(false)
      }, 300)
    }, 5000)
    return () => clearInterval(timer)
  }, [events.length])

  const goToPrevious = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + events.length) % events.length)
      setIsTransitioning(false)
    }, 300)
  }

  const goToNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length)
      setIsTransitioning(false)
    }, 300)
  }

  const currentEvent = events[currentIndex]

  return (
    <div className="relative w-full h-125 md:h-150 overflow-hidden bg-linear-to-br from-primary/20 via-background to-accent/10">
      {/* Background Image with Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
      >
        <img
          src={currentEvent.image || "/placeholder.svg"}
          alt={currentEvent.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-background/70 via-background/10 to-transparent" />
      </div>

      {/* Content */}
      <div
        className={`container mx-auto px-4 h-full relative z-10 transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
      >
        <div className="flex flex-col justify-center h-full max-w-2xl">
          {currentEvent.has2x1Promo && (
            <Badge className="w-fit mb-4 bg-accent text-accent-foreground hover:bg-accent/90 text-sm px-4 py-1">
              🎉 PROMO 2x1
            </Badge>
          )}

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4 text-balance">{currentEvent.title}</h1>

          {currentEvent.subtitle && (
            <p className="text-xl md:text-2xl text-muted-foreground mb-6">{currentEvent.subtitle}</p>
          )}

          <div className="flex flex-wrap gap-4 mb-6 text-foreground/90">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">{formatDate(currentEvent.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">{currentEvent.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">{currentEvent.venue}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Link href={`/evento/${currentEvent.id}`}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Comprar entradas
              </Button>
            </Link>
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(currentEvent.price)}
              {currentEvent.has2x1Promo && <span className="text-sm text-accent ml-2">• 2x1 disponible</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 opacity-70 hover:opacity-100 cursor-pointer text-foreground p-2 rounded-full transition-all"
        aria-label="Evento anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 opacity-70 hover:opacity-100 cursor-pointer text-foreground p-2 rounded-full transition-all"
        aria-label="Siguiente evento"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "w-8 bg-primary" : "w-2 bg-foreground/30"
            }`}
            aria-label={`Ir al evento ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
