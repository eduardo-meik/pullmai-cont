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
export const formatDate = (date: Date | { seconds: number } | string | null | undefined): string => {
  try {
    if (!date) {
      return 'Nunca'
    }
    
    let actualDate: Date
    
    if (typeof date === 'string') {
      actualDate = new Date(date)
    } else if (date instanceof Date) {
      actualDate = date
    } else if (date && typeof date === 'object' && 'seconds' in date) {
      // Firestore Timestamp
      actualDate = new Date(date.seconds * 1000)
    } else if (date && typeof date === 'object' && 'toDate' in date && typeof (date as any).toDate === 'function') {
      // Firestore Timestamp with toDate method
      actualDate = (date as any).toDate()
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
      // Check if it's a valid date
      if (isNaN(date.getTime())) {
        console.warn('Invalid Date object provided:', date)
        return new Date()
      }
      return date
    }

    if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      const converted = date.toDate()
      if (converted instanceof Date && !isNaN(converted.getTime())) {
        return converted
      }
    }

    if (date && typeof date === 'object' && 'seconds' in date) {
      const converted = new Date(date.seconds * 1000)
      if (!isNaN(converted.getTime())) {
        return converted
      }
    }

    if (typeof date === 'string' || typeof date === 'number') {
      const converted = new Date(date)
      if (!isNaN(converted.getTime())) {
        return converted
      }
    }

    console.warn('Unable to convert to valid date:', date, typeof date)
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
    
    // Additional safety check to ensure we have a valid date
    if (!date || isNaN(date.getTime())) {
      console.warn('Invalid date in isDateOlderThan:', dateValue)
      return false
    }
    
    return (Date.now() - date.getTime()) > milliseconds
  } catch (error) {
    console.warn('Error checking date age:', dateValue, error)
    return false
  }
}