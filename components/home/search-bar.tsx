"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchBarProps } from "@/types/filter"
import { Search } from "lucide-react"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"


const isValidDateString = (value?: string) => {
  if (!value) return false
  const date = new Date(value)
  return !isNaN(date.getTime())
}

// Función para parsear fecha en zona horaria local
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getStartOfWeek = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const getEndOfWeek = (date: Date) => {
  const startOfWeek = getStartOfWeek(new Date(date))
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  return endOfWeek
}

const resolveInitialDateFilter = (
  startDate?: string,
  endDate?: string
): string => {
  if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
    return ""
  }

  // Usar parseLocalDate para evitar problemas de zona horaria
  const start = parseLocalDate(startDate!)
  const end = parseLocalDate(endDate!)
  const now = new Date()

  // Normalizar fechas para comparación (solo año-mes-día)
  const normalizeForComparison = (d: Date) => formatDate(d)

  const startStr = normalizeForComparison(start)
  const endStr = normalizeForComparison(end)
  const todayStr = normalizeForComparison(now)

  // Hoy
  if (startStr === todayStr && endStr === todayStr) {
    return "Hoy"
  }

  // Mañana
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = normalizeForComparison(tomorrow)
  if (startStr === tomorrowStr && endStr === tomorrowStr) {
    return "Mañana"
  }

  // Esta semana (semana completa lunes → domingo)
  const thisWeekStart = getStartOfWeek(now)
  const thisWeekEnd = getEndOfWeek(now)
  if (startStr === normalizeForComparison(thisWeekStart) &&
    endStr === normalizeForComparison(thisWeekEnd)) {
    return "Esta Semana"
  }

  // Próxima semana
  const nextWeekDate = new Date(now)
  nextWeekDate.setDate(nextWeekDate.getDate() + 7)
  const nextWeekStart = getStartOfWeek(nextWeekDate)
  const nextWeekEnd = getEndOfWeek(nextWeekDate)
  if (startStr === normalizeForComparison(nextWeekStart) &&
    endStr === normalizeForComparison(nextWeekEnd)) {
    return "Próxima Semana"
  }

  // Este mes
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  if (startStr === normalizeForComparison(monthStart) &&
    endStr === normalizeForComparison(monthEnd)) {
    return "Este Mes"
  }

  // Meses dinámicos (Ene 2025, Feb 2025, etc.)
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  // Verificar si es el primer y último día del mismo mes
  if (start.getDate() === 1 &&
    end.getDate() === new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()) {
    return `${months[start.getMonth()]} ${start.getFullYear()}`
  }

  return ""
}

const calculateMonthSum = (i: number) => {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + i, 1)
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const monthName = months[nextMonth.getMonth()]
  const year = nextMonth.getFullYear()
  return `${monthName} ${year}`
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
      const thisWeekStart = getStartOfWeek(now)
      const thisWeekEnd = getEndOfWeek(now)
      startDate = formatDate(thisWeekStart)
      endDate = formatDate(thisWeekEnd)
      break

    case "Próxima Semana":
      const nextWeekDate = new Date(now)
      nextWeekDate.setDate(nextWeekDate.getDate() + 7)
      const nextWeekStart = getStartOfWeek(nextWeekDate)
      const nextWeekEnd = getEndOfWeek(nextWeekDate)
      startDate = formatDate(nextWeekStart)
      endDate = formatDate(nextWeekEnd)
      break

    case "Este Mes":
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      startDate = formatDate(firstDayOfMonth)
      endDate = formatDate(lastDayOfMonth)
      break

    default:
      // Para los meses calculados dinámicamente
      if (str.match(/^(Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic) \d{4}$/)) {
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        const parts = str.split(" ")
        const monthName = parts[0]
        const year = parseInt(parts[1])
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

export function SearchBar({ title, q, startDate, endDate }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname()
  const [filters, setFilters] = useState({
    search: q ?? "",
    date: resolveInitialDateFilter(startDate, endDate),
  })

  const handleSearch = () => {
    const hasAnyFilter = Object.values(filters).some(value => value.trim() !== "")
    if (!hasAnyFilter) return

    const params = new URLSearchParams()

    if (filters.search.trim()) {
      params.append("q", filters.search.trim())
    }

    if (filters.date) {
      const { startDate, endDate } = convertDate(filters.date)
      if (startDate && endDate) {
        params.append("startDate", startDate)
        params.append("endDate", endDate)
      }
    }

    router.push(`/eventos?${params.toString()}`)
  }

  const handleClear = () => {
    if (pathname === "/") return
    setFilters({
      search: "",
      date: "",
    })
    // Navegar a la página sin filtros
    router.push('/eventos')
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
        <div className="md:col-span-1">
          <Input
            placeholder="Buscar eventos..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="bg-background border-border text-foreground"
          />
        </div>

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
        <div className="md:col-span-1 flex gap-2">
          <Button
            onClick={handleSearch}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex-1 h-10"
          >
            <Search className="h-4 w-4 mr-2" />
            BUSCAR
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            className="border-border hover:bg-muted font-semibold flex-1 h-10"
          >
            LIMPIAR
          </Button>
        </div>
      </div>
    </div>
  )
}