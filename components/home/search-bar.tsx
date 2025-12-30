"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useState } from "react"
import type { FilterOptions, SearchBarProps } from "@/types/filter"
import { useRouter } from "next/navigation"

const calculateMonthSum = (i: number) => {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + i, 1)
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const monthName = months[nextMonth.getMonth()]
  const currentYear = now.getFullYear()
  const nextYear = nextMonth.getFullYear()
  if (nextYear !== currentYear) {
    return `${monthName} ${nextYear}`
  }
  return monthName
}

const getStartOfWeek = (date: Date) => {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Lunes como primer día
  return new Date(date.setDate(diff))
}

const getEndOfWeek = (date: Date) => {
  const startOfWeek = getStartOfWeek(new Date(date))
  return new Date(startOfWeek.setDate(startOfWeek.getDate() + 6))
}

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const convertDate = (str: string) => {
  const now = new Date()
  let startDate = ""
  let endDate = ""
  
  switch (str) {
    case "Hoy":
      startDate = formatDate(now)
      endDate = formatDate(now)
      break
      
    case "Mañana":
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      startDate = formatDate(tomorrow)
      endDate = formatDate(tomorrow)
      break
      
    case "Esta Semana":
      const thisWeekStart = getStartOfWeek(new Date(now))
      const thisWeekEnd = getEndOfWeek(new Date(now))
      startDate = formatDate(thisWeekStart)
      endDate = formatDate(thisWeekEnd)
      break
      
    case "Próxima Semana":
      const nextWeekStart = new Date(now)
      nextWeekStart.setDate(nextWeekStart.getDate() + 7)
      const nextWeekStartMonday = getStartOfWeek(nextWeekStart)
      const nextWeekEnd = getEndOfWeek(new Date(nextWeekStartMonday))
      startDate = formatDate(nextWeekStartMonday)
      endDate = formatDate(nextWeekEnd)
      break
      
    case "Este Mes":
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      startDate = formatDate(firstDayOfMonth)
      endDate = formatDate(lastDayOfMonth)
      break
      
    default:
      // Para los meses calculados dinámicamente (Ene, Feb, etc.)
      if (str.includes("Ene") || str.includes("Feb") || str.includes("Mar") || 
          str.includes("Abr") || str.includes("May") || str.includes("Jun") ||
          str.includes("Jul") || str.includes("Ago") || str.includes("Sep") ||
          str.includes("Oct") || str.includes("Nov") || str.includes("Dic")) {
        
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        const parts = str.split(" ")
        const monthName = parts[0]
        const year = parts[1] ? parseInt(parts[1]) : now.getFullYear()
        const monthIndex = months.indexOf(monthName)
        
        if (monthIndex !== -1) {
          const firstDay = new Date(year, monthIndex, 1)
          const lastDay = new Date(year, monthIndex + 1, 0)
          startDate = formatDate(firstDay)
          endDate = formatDate(lastDay)
        }
      }
      break
  }
  
  return { startDate, endDate }
}

const dates = [
  { id: "1", name: "Hoy" },
  { id: "2", name: "Mañana" },
  { id: "3", name: "Esta Semana" },
  { id: "4", name: "Próxima Semana" },
  { id: "5", name: "Este Mes" },
  { id: "6", name: calculateMonthSum(1) },
  { id: "7", name: calculateMonthSum(2) },
  { id: "8", name: calculateMonthSum(3) }
]

export function SearchBar({ title, provinces, localitiesByProvince }: SearchBarProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    province: "",
    locality: "",
    date: "",
    category: "",
  })

  const handleSearch = () => {
    const hasAnyFilter = Object.values(filters).some(value => value.trim() !== "")
    if (!hasAnyFilter) return
    if (filters.province && !filters.locality) return
    const params = new URLSearchParams()
    
    if (filters.search.trim()) {
      params.append("q", filters.search.trim())
    }
    
    if (filters.province) {
      params.append("province", filters.province)
    }
    
    if (filters.locality) {
      params.append("locality", filters.locality)
    }
    
    if (filters.date) {
      const { startDate, endDate } = convertDate(filters.date)
      if (startDate && endDate) {
        params.append("startDate", startDate)
        params.append("endDate", endDate)
      }
    }
    
    if (filters.category) {
      params.append("category", filters.category)
    }

    // Navegar con los query params
    router.push(`/eventos?${params.toString()}`)
  }

  const availableLocalities = filters.province ? localitiesByProvince[filters.province] || [] : []

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 select-none">
        {/* Input de búsqueda - visible en mobile y desktop */}
        <div className="md:col-span-1">
          <Input
            placeholder="Buscar eventos..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="bg-background border-border text-foreground"
          />
        </div>

        {/* Provincia - solo desktop */}
        <div className="hidden md:block">
          <Select
            value={filters.province}
            onValueChange={(value) => setFilters({ ...filters, province: value, locality: "" })}
          >
            <SelectTrigger className="bg-background border-border text-foreground w-full">
              <SelectValue placeholder="Provincia" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Localidad - solo desktop */}
        <div className="hidden md:block">
          <Select
            value={filters.locality}
            onValueChange={(value) => setFilters({ ...filters, locality: value })}
            disabled={!filters.province}
          >
            <SelectTrigger className="bg-background border-border text-foreground w-full disabled:opacity-50 disabled:cursor-not-allowed">
              <SelectValue placeholder={filters.province ? "Localidad" : "Seleccione provincia"} />
            </SelectTrigger>
            <SelectContent>
              {availableLocalities.map(locality => (
                <SelectItem key={locality.id} value={locality.id}>{locality.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fecha - visible en mobile y desktop */}
        <div className="md:col-span-1">
          <Select
            value={filters.date}
            onValueChange={(value) => setFilters({ ...filters, date: value })}
          >
            <SelectTrigger className="bg-background border-border text-foreground w-full">
              <SelectValue placeholder="Fecha" />
            </SelectTrigger>
            <SelectContent>
              {dates.map(d => (
                <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botón de búsqueda - más pequeño en desktop */}
        <div className="md:col-span-2">
          <Button
            onClick={handleSearch}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold w-full h-10"
          >
            <Search className="h-4 w-4 mr-2" />
            BUSCAR
          </Button>
        </div>
      </div>
    </div>
  )
}