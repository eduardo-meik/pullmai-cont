import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query' // Added useInfiniteQuery
import { contractService } from '../services/contractService'
import { useAuthStore } from '../stores/authStore'
import { useContractStore } from '../stores/contractStore'
import { FormularioContrato, FiltrosContrato, Contrato } from '../types'
import { useToast } from '../contexts/ToastContext'

export const useContracts = (filtros?: FiltrosContrato) => {
  const { usuario } = useAuthStore()
  const { setContratos, setLoading } = useContractStore()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['contratos', usuario?.organizacionId, filtros],
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
    cacheTime: 10 * 60 * 1000 // 10 minutos
  })
}

// New hook for infinite scrolling / "Load More" pagination
export const useContractsInfinite = (filtros?: FiltrosContrato, pageSize = 20) => {
  const { usuario } = useAuthStore();
  // setLoading and setContratos from useContractStore might not be directly compatible
  // with useInfiniteQuery's way of managing pages, unless the store is adapted.

  return useInfiniteQuery({
    queryKey: ['contratosInfinite', usuario?.organizacionId, filtros, pageSize],
    queryFn: async ({ pageParam = undefined }) => { // pageParam will be the lastDoc from previous fetch
      if (!usuario?.organizacionId) throw new Error('No hay organización');

      // The contractService.getContratos already returns { contratos, hasMore, lastDoc }
      const result = await contractService.getContratos(
        usuario.organizacionId,
        filtros,
        pageSize,
        pageParam // pageParam is the lastDoc from the previous fetch
      );
      return result;
    },
    getNextPageParam: (lastPage) => {
      // lastPage is the full result object: { contratos, hasMore, lastDoc }
      return lastPage.hasMore ? lastPage.lastDoc : undefined;
    },
    enabled: !!usuario?.organizacionId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    // keepPreviousData: true, // Consider adding if you want to keep showing old data while new page loads
  });
};

export const useContract = (id: string) => {
  const { setContratoSeleccionado } = useContractStore()

  return useQuery({
    queryKey: ['contrato', id],
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
    staleTime: 2 * 60 * 1000 // 2 minutos
  })
}

export const useCreateContract = () => {
  const { usuario } = useAuthStore()
  const { addContrato } = useContractStore()
  const { showTypedToast } = useToast()
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: ['contratos'] })
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contrato> }) => {
      if (!usuario) throw new Error('Usuario no autenticado')
      
      await contractService.actualizarContrato(id, updates, usuario.id)
      return { id, updates }
    },
    onSuccess: ({ id, updates }) => {
      updateContrato(id, updates)
      queryClient.invalidateQueries({ queryKey: ['contratos'] })
      queryClient.invalidateQueries({ queryKey: ['contrato', id] })
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!usuario) throw new Error('Usuario no autenticado')
      
      await contractService.eliminarContrato(id, usuario.id)
      return id
    },
    onSuccess: (id) => {
      removeContrato(id)
      queryClient.invalidateQueries({ queryKey: ['contratos'] })
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!usuario) throw new Error('Usuario no autenticado')
      await contractService.desvincularContratoDeProyecto(id)
      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] })
      showTypedToast('success', 'Contrato desvinculado del proyecto')
    },
    onError: (error: Error) => {
      showTypedToast('error', error.message)
    }
  })
}