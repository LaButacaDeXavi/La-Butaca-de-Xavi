export interface FilterOptions {
  search: string
  province: string
  locality: string
  date: string
  category: string
}


interface Province {
  id: string
  name: string
}

interface Locality {
  id: string
  name: string
}
interface category {
  name: string
}

type LocalitiesByProvince = Record<string, Locality[]>

export interface SearchBarProps {
  title: string
  provinces: Province[]
  localitiesByProvince: LocalitiesByProvince
}