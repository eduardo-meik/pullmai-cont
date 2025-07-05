import { useState, useEffect, useCallback, useMemo } from 'react'
import { RegistroAuditoria, AccionAuditoria } from '../types'
import { AuditService } from '../services/auditService'
import { useAuthStore } from '../stores/authStore'

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
  
  // Get the current user from the auth store
  const { usuario } = useAuthStore()
  const auditService = AuditService.getInstance()

  // Memoize params to prevent infinite re-renders
  const stableParams = useMemo(() => ({
    searchTerm: params.searchTerm,
    accion: params.accion,
    contratoId: params.contratoId,
    usuarioId: params.usuarioId,
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin
  }), [
    params.searchTerm,
    params.accion,
    params.contratoId,
    params.usuarioId,
    params.fechaInicio,
    params.fechaFin
  ])

  const loadRecords = useCallback(async () => {
    // Don't load if no user is authenticated
    if (!usuario) {
      setRecords([])
      setTotalRecords(0)
      setTotalPages(1)
      setCurrentPage(1)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Prepare filters for the audit service
      const filters: any = {}
      if (stableParams.contratoId) filters.contratoId = stableParams.contratoId
      if (stableParams.usuarioId) filters.usuarioId = stableParams.usuarioId
      if (stableParams.accion) filters.accion = stableParams.accion
      if (stableParams.fechaInicio) filters.fechaInicio = new Date(stableParams.fechaInicio)
      if (stableParams.fechaFin) filters.fechaFin = new Date(stableParams.fechaFin)
      if (stableParams.searchTerm) filters.searchTerm = stableParams.searchTerm
      
      // Call the audit service with the current user and filters
      const result = await auditService.getAuditRecords(usuario, filters, 50)
      
      setRecords(result.records)
      setTotalRecords(result.records.length)
      setTotalPages(Math.max(1, Math.ceil(result.records.length / 50)))
      setCurrentPage(1)
      
    } catch (err) {
      console.error('Error loading audit records:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar registros de auditoría')
      setRecords([])
      setTotalRecords(0)
      setTotalPages(1)
      setCurrentPage(1)
    } finally {
      setLoading(false)
    }
  }, [stableParams, usuario, auditService])

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
