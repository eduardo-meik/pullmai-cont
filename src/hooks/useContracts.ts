import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
      // Invalidate all related caches
      queryClient.invalidateQueries({ queryKey: ['contratos'] })
      queryClient.invalidateQueries({ queryKey: ['contratos', usuario?.organizacionId] })
      
      // Invalidate project-specific caches if contract is associated with a project
      if (data.proyecto && data.proyecto.trim() !== '') {
        queryClient.invalidateQueries({ queryKey: ['contratos', 'project', data.proyecto] })
        queryClient.invalidateQueries({ queryKey: ['project', 'stats', data.proyecto] })
        queryClient.invalidateQueries({ queryKey: ['projects'] })
        queryClient.invalidateQueries({ queryKey: ['projects', usuario?.organizacionId] })
      }
      
      // Invalidate organization data to update statistics
      queryClient.invalidateQueries({ queryKey: ['organization', usuario?.organizacionId] })
      
      // Invalidate contrapartes cache if contraparte was auto-created
      if (data.contraparte && data.contraparte.trim() !== '') {
        queryClient.invalidateQueries({ queryKey: ['contrapartes'] })
        queryClient.invalidateQueries({ queryKey: ['contrapartes', usuario?.organizacionId] })
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contrato> }) => {
      if (!usuario) throw new Error('Usuario no autenticado')
      
      await contractService.actualizarContrato(id, updates, usuario.id)
      return { id, updates }
    },
    onSuccess: ({ id, updates }) => {
      updateContrato(id, updates)
      
      // Invalidate all related caches
      queryClient.invalidateQueries({ queryKey: ['contratos'] })
      queryClient.invalidateQueries({ queryKey: ['contratos', usuario?.organizacionId] })
      queryClient.invalidateQueries({ queryKey: ['contrato', id] })
      
      // Invalidate project-specific caches if contract is associated with a project
      if (updates.proyecto && updates.proyecto.trim() !== '') {
        queryClient.invalidateQueries({ queryKey: ['contratos', 'project', updates.proyecto] })
        queryClient.invalidateQueries({ queryKey: ['project', 'stats', updates.proyecto] })
        queryClient.invalidateQueries({ queryKey: ['projects'] })
        queryClient.invalidateQueries({ queryKey: ['projects', usuario?.organizacionId] })
      }
      
      // Invalidate organization data to update statistics
      queryClient.invalidateQueries({ queryKey: ['organization', usuario?.organizacionId] })
      
      // Invalidate contrapartes cache if contraparte was updated
      if (updates.contraparte && updates.contraparte.trim() !== '') {
        queryClient.invalidateQueries({ queryKey: ['contrapartes'] })
        queryClient.invalidateQueries({ queryKey: ['contrapartes', usuario?.organizacionId] })
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