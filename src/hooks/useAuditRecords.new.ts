import { useState, useEffect, useCallback } from 'react'
import { RegistroAuditoria, AccionAuditoria } from '../types'

interface UseAuditRecordsParams {
  searchTerm?: string
  accion?: AccionAuditoria
  contratoId?: string
  usuarioId?: string
  fechaInicio?: string
  fechaFin?: string
}

interface UseAuditRecordsReturn {
  records: RegistroAuditoria[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalRecords: number
  loadRecords: () => void
  nextPage: () => void
  prevPage: () => void
}

export const useAuditRecords = (params: UseAuditRecordsParams): UseAuditRecordsReturn => {
  const [records, setRecords] = useState<RegistroAuditoria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, return empty results since the service requires a full Usuario object
      // This can be implemented later when the user context is properly typed
      setRecords([])
      setTotalRecords(0)
      setTotalPages(1)
      setCurrentPage(1)
      
    } catch (err) {
      console.error('Error loading audit records:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar registros de auditoría')
    } finally {
      setLoading(false)
    }
  }, [params])

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  return {
    records,
    loading,
    error,
    currentPage,
    totalPages,
    totalRecords,
    loadRecords,
    nextPage,
    prevPage
  }
}
