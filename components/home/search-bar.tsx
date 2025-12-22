"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useState } from "react"
import type { FilterOptions } from "@/types/filter"

export function SearchBar() {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    province: "",
    locality: "",
    date: "",
    category: "",
  })

  const handleSearch = () => {
    console.log("Búsqueda:", filters)
    // Implementar lógica de búsqueda
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <Input
            placeholder="Buscar eventos..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="bg-background border-border text-foreground"
          />
        </div>

        <Select value={filters.province} onValueChange={(value) => setFilters({ ...filters, province: value })}>
          <SelectTrigger className="bg-background border-border text-foreground">
            <SelectValue placeholder="Provincia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buenos-aires">Buenos Aires</SelectItem>
            <SelectItem value="cordoba">Córdoba</SelectItem>
            <SelectItem value="santa-fe">Santa Fe</SelectItem>
            <SelectItem value="mendoza">Mendoza</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.locality} onValueChange={(value) => setFilters({ ...filters, locality: value })}>
          <SelectTrigger className="bg-background border-border text-foreground">
            <SelectValue placeholder="Localidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="caba">CABA</SelectItem>
            <SelectItem value="la-plata">La Plata</SelectItem>
            <SelectItem value="mar-del-plata">Mar del Plata</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
          <Search className="h-4 w-4 mr-2" />
          BUSCAR
        </Button>
      </div>
    </div>
  )
}
