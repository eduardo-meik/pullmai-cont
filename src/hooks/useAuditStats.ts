import { useState, useEffect } from 'react'

interface AuditStats {
  totalRecords: number
  recordsToday: number
  recordsThisWeek: number
  recordsThisMonth: number
}

interface UseAuditStatsReturn {
  stats: AuditStats | null
  loading: boolean
  error: string | null
}

export const useAuditStats = (): UseAuditStatsReturn => {
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // For now, return mock stats since the service requires a full Usuario object
    // This can be implemented later when the user context is properly typed
    setStats({
      totalRecords: 0,
      recordsToday: 0,
      recordsThisWeek: 0,
      recordsThisMonth: 0
    })
  }, [])

  return {
    stats,
    loading,
    error
  }
}
