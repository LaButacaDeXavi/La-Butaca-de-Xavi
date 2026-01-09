"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MapPin, Calendar, Clock } from "lucide-react"
import Link from "next/link"

// Tipos adaptados a la nueva estructura
interface Promotion {
  id: string
  name: string
  type: string
  value: number | null
  validFrom: string
  validUntil: string
  isActive: boolean
}

interface Play {
  title: string
  subtitle?: string
  category: string
  image: string
}

interface Theater {
  name: string
}

interface EventData {
  id: string
  date: string
  time: string
  isMain: boolean
  play: Play
  theater: Theater
  promotion?: Promotion
}

interface HeroCarouselProps {
  events: EventData[]
}


// Función para obtener el texto de la promoción
const getPromotionText = (promotion: Promotion) => {
  switch (promotion.type) {
    case '2x1':
      return 'PROMO 2x1'
    case 'percentage':
      return `${promotion.value}% OFF`
    case 'fixed':
      return `$${promotion.value} OFF`
    default:
      return 'PROMOCIÓN'
  }
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

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + events.length) % events.length)
      setIsTransitioning(false)
    }, 300)
  }

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length)
      setIsTransitioning(false)
    }, 300)
  }

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(index)
  }

  const currentEvent = events[currentIndex]

  const now = new Date();

  const promotionValid =
    currentEvent.promotion?.validFrom &&
    currentEvent.promotion?.validUntil &&
    new Date(currentEvent.promotion.validFrom) <= now &&
    new Date(currentEvent.promotion.validUntil) >= now;


  return (
    <Link href={`/evento/${currentEvent.id}`} className="block">
      <div className="relative w-full h-125 md:h-150 overflow-hidden bg-linear-to-br from-purple-900/20 via-background to-blue-900/10 cursor-pointer group">
        {/* Background Image with Overlay */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
        >
          <img
            src={currentEvent.play.image || "/placeholder.svg"}
            alt={currentEvent.play.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 " />
        </div>

        {/* Badge de promoción */}
        {currentEvent.promotion && promotionValid && (
          <div className="absolute top-8 left-8 z-20">
            <Badge className="bg-yellow-500 text-black hover:bg-yellow-600 text-lg px-6 py-2 font-bold shadow-lg">
              {getPromotionText(currentEvent.promotion)}
            </Badge>
          </div>
        )}


        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/50 hover:bg-background/80 backdrop-blur-sm text-foreground p-3 rounded-full transition-all"
          aria-label="Evento anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-background/50 hover:bg-background/80 backdrop-blur-sm text-foreground p-3 rounded-full transition-all"
          aria-label="Siguiente evento"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots Indicator */}
        {events.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleDotClick(e, index)}
                className={`h-2 rounded-full transition-all ${index === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/50"
                  }`}
                aria-label={`Ir al evento ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}