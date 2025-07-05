import { useState, useEffect } from 'react'
import { Organizacion } from '../types'
import { OrganizacionService } from '../services/organizacionService'
import { useAuthStore } from '../stores/authStore'

export function useCurrentOrganization() {
  const [organizacion, setOrganizacion] = useState<Organizacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { usuario } = useAuthStore()
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!usuario?.organizacionId) {
        console.log('DEBUG: No organizacionId found for user:', usuario)
        setOrganizacion(null)
        setError('Usuario no asignado a ninguna organización')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        console.log('DEBUG: Fetching organization with ID:', usuario.organizacionId)
        const org = await OrganizacionService.getOrganizacionById(usuario.organizacionId)
        console.log('DEBUG: Fetched organization:', org)
        
        if (!org) {
          setError(`Organización con ID ${usuario.organizacionId} no encontrada`)
        }
        
        setOrganizacion(org)
      } catch (err) {
        console.error('Error fetching current organization:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [usuario?.organizacionId])

  return { organizacion, loading, error }
}
