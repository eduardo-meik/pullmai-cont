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

/**
 * Converts various date formats to a JavaScript Date object
 */
export const convertToDate = (date: any): Date => {
  try {
    if (!date) {
      return new Date()
    }

    if (date instanceof Date) {
      return date
    }

    if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      return date.toDate()
    }

    if (date && typeof date === 'object' && 'seconds' in date) {
      return new Date(date.seconds * 1000)
    }

    if (typeof date === 'string' || typeof date === 'number') {
      return new Date(date)
    }

    return new Date()
  } catch (error) {
    console.warn('Error converting date:', date, error)
    return new Date()
  }
}

/**
 * Checks if a date is older than the specified number of milliseconds
 */
export const isDateOlderThan = (dateValue: any, milliseconds: number): boolean => {
  try {
    if (!dateValue) {
      return false
    }

    const date = convertToDate(dateValue)
    return (Date.now() - date.getTime()) > milliseconds
  } catch (error) {
    console.warn('Error checking date age:', dateValue, error)
    return false
  }
}