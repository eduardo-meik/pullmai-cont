import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ContraparteOrganizacionService } from '../services/contraparteOrganizacionService'
import { useAuthStore } from '../stores/authStore'
import { ContraparteRelacion, Contrato } from '../types'
import { useToast } from '../contexts/ToastContext'

/**
 * Hook para gestionar contrapartes basadas en organizaciones
 */
export const useContrapartesOrganizacion = () => {
  const { usuario } = useAuthStore()

  return useQuery({
    queryKey: ['contrapartes-organizacion', usuario?.organizacionId],
    queryFn: async () => {
      if (!usuario?.organizacionId) throw new Error('No hay organización')
      
      return await ContraparteOrganizacionService.getContrapartes(usuario.organizacionId)
    },
    enabled: !!usuario?.organizacionId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para obtener una contraparte específica
 */
export const useContraparteOrganizacion = (contraparteId: string) => {
  const { usuario } = useAuthStore()

  return useQuery({
    queryKey: ['contraparte-organizacion', usuario?.organizacionId, contraparteId],
    queryFn: async () => {
      if (!usuario?.organizacionId) throw new Error('No hay organización')
      
      return await ContraparteOrganizacionService.getContraparte(usuario.organizacionId, contraparteId)
    },
    enabled: !!usuario?.organizacionId && !!contraparteId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

/**
 * Hook para buscar contrapartes
 */
export const useBuscarContrapartesOrganizacion = () => {
  const { usuario } = useAuthStore()

  return useMutation({
    mutationFn: async (termino: string) => {
      if (!usuario?.organizacionId) throw new Error('No hay organización')
      
      return await ContraparteOrganizacionService.buscarContrapartes(usuario.organizacionId, termino)
    }
  })
}

/**
 * Hook para obtener contratos con una contraparte específica
 */
export const useContratosConContraparte = (contraparteId: string) => {
  const { usuario } = useAuthStore()

  return useQuery({
    queryKey: ['contratos-contraparte', usuario?.organizacionId, contraparteId],
    queryFn: async () => {
      if (!usuario?.organizacionId) throw new Error('No hay organización')
      
      return await ContraparteOrganizacionService.getContratosConContraparte(usuario.organizacionId, contraparteId)
    },
    enabled: !!usuario?.organizacionId && !!contraparteId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}
