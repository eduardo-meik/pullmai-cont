import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractService } from '../services/contractService'
import { useAuthStore } from '../stores/authStore'
import { useContractStore } from '../stores/contractStore'
import { FormularioContrato, FiltrosContrato, Contrato } from '../types'
import { useToast } from '../contexts/ToastContext'
import { CACHE_KEYS, useCacheInvalidation } from './useCacheInvalidation'

export const useContracts = (filtros?: FiltrosContrato) => {
  const { usuario } = useAuthStore()
  const { setContratos, setLoading } = useContractStore()

  return useQuery({
    queryKey: [CACHE_KEYS.CONTRACTS, usuario?.organizacionId, filtros],
    queryFn: async () => {
      if (!usuario?.organizacionId) throw new Error('No hay organización')
      
      setLoading(true)
      try {
        const result = await contractService.getContratos(
          usuario.organizacionId,
          filtros
        )
        setContratos(result.contratos)
        return result
      } finally {
        setLoading(false)
      }
    },
    enabled: !!usuario?.organizacionId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: false
  })
}

export const useContract = (id: string) => {
  const { setContratoSeleccionado } = useContractStore()

  return useQuery({
    queryKey: [CACHE_KEYS.CONTRACT, id],
    queryFn: async () => {
      const contrato = await contractService.getContrato(id)
      setContratoSeleccionado(contrato)
      
      // Registrar acceso
      if (contrato) {
        await contractService.registrarAcceso(id, 'current-user-id')
      }
      
      return contrato
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true
  })
}

export const useCreateContract = () => {
  const { usuario } = useAuthStore()
  const { addContrato } = useContractStore()
  const { showTypedToast } = useToast()
  const { invalidateContracts, invalidateOrganizationData } = useCacheInvalidation()

  return useMutation({
    mutationFn: async (formulario: FormularioContrato) => {
      if (!usuario?.organizacionId) throw new Error('No hay organización')
      
      const id = await contractService.crearContrato(
        formulario,
        usuario.organizacionId,
        usuario.id
      )
      
      return { id, ...formulario }
    },
    onSuccess: (data) => {
      // Optimistic update
      addContrato(data as any)
      
      // Invalidate related cache
      if (usuario?.organizacionId) {
        invalidateContracts(usuario.organizacionId)
        invalidateOrganizationData(usuario.organizacionId)
      }
      
      showTypedToast('success', 'Contrato creado exitosamente')
    },
    onError: (error: Error) => {
      showTypedToast('error', error.message)
    }
  })
}

export const useUpdateContract = () => {
  const { usuario } = useAuthStore()
  const { updateContrato } = useContractStore()
  const { showTypedToast } = useToast()
  const { invalidateContracts, invalidateContract, updateContractInCache } = useCacheInvalidation()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contrato> }) => {
      if (!usuario) throw new Error('Usuario no autenticado')
      
      await contractService.actualizarContrato(id, updates, usuario.id)
      return { id, updates }
    },
    onMutate: async ({ id, updates }: { id: string; updates: Partial<Contrato> }) => {
      // Optimistic update
      updateContractInCache(id, (old: Contrato) => ({ ...old, ...updates }))
      updateContrato(id, updates)
    },
    onSuccess: ({ id }: { id: string }) => {
      // Invalidate related cache
      invalidateContract(id)
      if (usuario?.organizacionId) {
        invalidateContracts(usuario.organizacionId)
      }
      
      showTypedToast('success', 'Contrato actualizado exitosamente')
    },
    onError: (error: Error) => {
      showTypedToast('error', error.message)
    }
  })
}

export const useDeleteContract = () => {
  const { usuario } = useAuthStore()
  const { removeContrato } = useContractStore()
  const { showTypedToast } = useToast()
  const { invalidateContracts, invalidateOrganizationData } = useCacheInvalidation()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!usuario) throw new Error('Usuario no autenticado')
      
      await contractService.eliminarContrato(id, usuario.id)
      return id
    },
    onSuccess: (id) => {
      removeContrato(id)
      
      // Invalidate related cache
      if (usuario?.organizacionId) {
        invalidateContracts(usuario.organizacionId)
        invalidateOrganizationData(usuario.organizacionId)
      }
      
      showTypedToast('success', 'Contrato eliminado exitosamente')
    },
    onError: (error: Error) => {
      showTypedToast('error', error.message)
    }
  })
}

export const useSearchContracts = () => {
  const { usuario } = useAuthStore()

  return useMutation({
    mutationFn: async ({ termino, filtros }: { termino: string; filtros?: FiltrosContrato }) => {
      if (!usuario?.organizacionId) throw new Error('No hay organización')
      
      return await contractService.buscarContratos(
        usuario.organizacionId,
        termino,
        filtros
      )
    }
  })
}

export const useUnlinkContractFromProject = () => {
  const { usuario } = useAuthStore()
  const { showTypedToast } = useToast()
  const { invalidateContracts, invalidateProjects } = useCacheInvalidation()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!usuario) throw new Error('Usuario no autenticado')
      await contractService.desvincularContratoDeProyecto(id)
      return id
    },
    onSuccess: () => {
      // Invalidate both contracts and projects cache
      if (usuario?.organizacionId) {
        invalidateContracts(usuario.organizacionId)
        invalidateProjects(usuario.organizacionId)
      }
      
      showTypedToast('success', 'Contrato desvinculado del proyecto')
    },
    onError: (error: Error) => {
      showTypedToast('error', error.message)
    }
  })
}

// Hook for contract operations with cache invalidation
export const useContractOperations = () => {
  const { invalidateContracts, invalidateContract, invalidateOrganizationData } = useCacheInvalidation()
  const { usuario } = useAuthStore()

  const invalidateContractsCache = () => {
    if (usuario?.organizacionId) {
      invalidateContracts(usuario.organizacionId)
    }
  }

  const invalidateAllOrgData = () => {
    if (usuario?.organizacionId) {
      invalidateOrganizationData(usuario.organizacionId)
    }
  }

  return {
    invalidateContractsCache,
    invalidateAllOrgData,
    invalidateContract
  }
}
