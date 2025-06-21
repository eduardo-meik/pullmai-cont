import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { useToast, EToastTypes } from '../contexts/ToastContext'
import ContraparteService from '../services/contraparteService'
// DEPRECATED: This hook is no longer used in the new organization-based architecture
// Use useContrapartesOrganizacion instead
// import { Contraparte } from '../types'

export const useContrapartes = () => {
  const { usuario } = useAuthStore()
  const { showTypedToast } = useToast()
  const queryClient = useQueryClient()

  // Query para obtener todas las contrapartes
  const contrapartesQuery = useQuery({
    queryKey: ['contrapartes', usuario?.organizacionId],
    queryFn: async () => {
      if (!usuario?.organizacionId) throw new Error('No hay organización')
      return await ContraparteService.getContrapartesByOrganization(usuario.organizacionId)
    },
    enabled: !!usuario?.organizacionId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  })

  // Mutation para crear contraparte
  const createContraparte = useMutation({
    mutationFn: async (contraparteData: Omit<Contraparte, 'id' | 'fechaCreacion' | 'fechaModificacion'>) => {
      return await ContraparteService.createContraparte(contraparteData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contrapartes'] })
      showTypedToast(EToastTypes.SUCCESS, 'Contraparte creada exitosamente')
    },    onError: (error: Error) => {
      showTypedToast(EToastTypes.ERROR, `Error al crear contraparte: ${error.message}`)
    }
  })

  // Mutation para actualizar contraparte
  const updateContraparte = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contraparte> }) => {
      return await ContraparteService.updateContraparte(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contrapartes'] })
      showTypedToast(EToastTypes.SUCCESS, 'Contraparte actualizada exitosamente')
    },    onError: (error: Error) => {
      showTypedToast(EToastTypes.ERROR, `Error al actualizar contraparte: ${error.message}`)
    }
  })

  // Mutation para eliminar contraparte
  const deleteContraparte = useMutation({
    mutationFn: async (id: string) => {
      if (!usuario?.id) throw new Error('No hay usuario')
      return await ContraparteService.deleteContraparte(id, usuario.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contrapartes'] })
      showTypedToast(EToastTypes.SUCCESS, 'Contraparte eliminada exitosamente')
    },    onError: (error: Error) => {
      showTypedToast(EToastTypes.ERROR, `Error al eliminar contraparte: ${error.message}`)
    }
  })

  return {
    contrapartes: contrapartesQuery.data || [],
    isLoading: contrapartesQuery.isLoading,
    error: contrapartesQuery.error,
    refetch: contrapartesQuery.refetch,
    createContraparte,
    updateContraparte,
    deleteContraparte,
    isCreating: createContraparte.isPending,
    isUpdating: updateContraparte.isPending,
    isDeleting: deleteContraparte.isPending
  }
}

export const useContraparteDetail = (contraparteNombre: string) => {
  const { usuario } = useAuthStore()

  // Query para obtener contratos de la contraparte
  const contratosQuery = useQuery({
    queryKey: ['contraparte-contratos', contraparteNombre, usuario?.organizacionId],
    queryFn: async () => {
      if (!usuario?.organizacionId) throw new Error('No hay organización')
      return await ContraparteService.getContratosByContraparte(contraparteNombre, usuario.organizacionId)
    },
    enabled: !!usuario?.organizacionId && !!contraparteNombre,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })

  // Query para obtener estadísticas de la contraparte
  const estadisticasQuery = useQuery({
    queryKey: ['contraparte-estadisticas', contraparteNombre, usuario?.organizacionId],
    queryFn: async () => {
      if (!usuario?.organizacionId) throw new Error('No hay organización')
      return await ContraparteService.getContraparteEstadisticas(contraparteNombre, usuario.organizacionId)
    },
    enabled: !!usuario?.organizacionId && !!contraparteNombre,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })

  return {
    contratos: contratosQuery.data || [],
    estadisticas: estadisticasQuery.data,
    isLoadingContratos: contratosQuery.isLoading,
    isLoadingEstadisticas: estadisticasQuery.isLoading,
    errorContratos: contratosQuery.error,
    errorEstadisticas: estadisticasQuery.error,
    refetchContratos: contratosQuery.refetch,
    refetchEstadisticas: estadisticasQuery.refetch
  }
}

export const useContraparteSearch = (searchTerm: string) => {
  const { usuario } = useAuthStore()

  return useQuery({
    queryKey: ['contrapartes-search', searchTerm, usuario?.organizacionId],
    queryFn: async () => {
      if (!usuario?.organizacionId) throw new Error('No hay organización')
      if (!searchTerm.trim()) return []
      return await ContraparteService.searchContrapartes(searchTerm, usuario.organizacionId)
    },
    enabled: !!usuario?.organizacionId && searchTerm.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
    cacheTime: 5 * 60 * 1000, // 5 minutos
  })
}
