

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}

// Función helper para parsear fecha en zona horaria local
export function parseLocalDate(dateString: string): Date {
  // Validar formato básico
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Invalid date string')
  }
  const parts = dateString.split('-')

  // Validar que tenga 3 partes (año-mes-día)
  if (parts.length !== 3) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD')
  }

  const [year, month, day] = parts.map(Number)

  // Validar que sean números válidos
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error('Invalid date values')
  }

  // Validar rangos
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error('Invalid month or day values')
  }

  return new Date(year, month - 1, day)
}

export function formatDate(dateString: string): string {
  try {
    // Parsear en zona horaria local en lugar de UTC
    const date = parseLocalDate(dateString)

    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      console.error('Invalid date after parsing:', dateString)
      return dateString // Retornar el string original como fallback
    }

    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', dateString, error)
    return dateString // Retornar el string original como fallback
  }
}


export function formatDateWhitFormatISO(dateString: string) {
 const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function formatDateWithFormatISO(dateString: string): string {
  try {
    const dateOnly = dateString.split('T')[0].split(' ')[0]
    
    // Validar formato
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      console.error('Invalid date format:', dateString)
      return dateString
    }
    
    const [year, month, day] = dateOnly.split('-').map(Number)
    
    // Crear fecha en zona horaria local
    const date = new Date(year, month - 1, day)
    
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      console.error('Invalid date after parsing:', dateString)
      return dateString
    }
    
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date)
  } catch (error) {
    console.error('Error formatting ISO date:', dateString, error)
    return dateString
  }
}


