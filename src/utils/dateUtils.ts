/**
 * Formats a date or Firestore timestamp for display
 */
export const formatDateTime = (date: Date | { seconds: number } | string): string => {
  try {
    let actualDate: Date
    
    if (typeof date === 'string') {
      actualDate = new Date(date)
    } else if (date instanceof Date) {
      actualDate = date
    } else if (date && typeof date === 'object' && 'seconds' in date) {
      // Firestore Timestamp
      actualDate = new Date(date.seconds * 1000)
    } else {
      return 'Fecha inválida'
    }

    if (isNaN(actualDate.getTime())) {
      return 'Fecha inválida'
    }

    return actualDate.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

/**
 * Formats a date for display (no time)
 */
export const formatDate = (date: Date | { seconds: number } | string): string => {
  try {
    let actualDate: Date
    
    if (typeof date === 'string') {
      actualDate = new Date(date)
    } else if (date instanceof Date) {
      actualDate = date
    } else if (date && typeof date === 'object' && 'seconds' in date) {
      // Firestore Timestamp
      actualDate = new Date(date.seconds * 1000)
    } else {
      return 'Fecha inválida'
    }

    if (isNaN(actualDate.getTime())) {
      return 'Fecha inválida'
    }

    return actualDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}