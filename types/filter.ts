export interface FilterOptions {
  search: string
  // province: string
  //locality: string
  date: string
  //category: string
}

export interface SearchBarProps {
  title: string
  q?:string
  startDate?:string
  endDate?:string
}