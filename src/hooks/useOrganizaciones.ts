import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Organizacion } from '../types'
import { OrganizacionService } from '../services/organizacionService'
import { useToast } from '../contexts/ToastContext'

// Hook para gestionar organizaciones
export const useOrganizaciones = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const {
    data: organizaciones = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['organizaciones'],
    queryFn: OrganizacionService.getOrganizaciones,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const crearOrganizacionMutation = useMutation({
    mutationFn: (organizacionData: Omit<Organizacion, 'id' | 'fechaCreacion'>) =>
      OrganizacionService.crearOrganizacion(organizacionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizaciones'] })
      showToast('Organización creada exitosamente', 'success')
    },    onError: (error: unknown) => {
      console.error('Error creating organization:', error)
      showToast('Error al crear la organización', 'error')
    }
  })

  const actualizarOrganizacionMutation = useMutation({
    mutationFn: ({ id, cambios }: { id: string, cambios: Partial<Organizacion> }) =>
      OrganizacionService.actualizarOrganizacion(id, cambios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizaciones'] })
      showToast('Organización actualizada exitosamente', 'success')
    },    onError: (error: unknown) => {
      console.error('Error updating organization:', error)
      showToast('Error al actualizar la organización', 'error')
    }
  })

  const eliminarOrganizacionMutation = useMutation({
    mutationFn: (id: string) => OrganizacionService.eliminarOrganizacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizaciones'] })
      showToast('Organización eliminada exitosamente', 'success')
    },    onError: (error: unknown) => {
      console.error('Error deleting organization:', error)
      showToast('Error al eliminar la organización', 'error')
    }
  })

  const crearOrganizacion = async (organizacionData: Omit<Organizacion, 'id' | 'fechaCreacion'>) => {
    return crearOrganizacionMutation.mutateAsync(organizacionData)
  }

  const actualizarOrganizacion = async (id: string, cambios: Partial<Organizacion>) => {
    return actualizarOrganizacionMutation.mutateAsync({ id, cambios })
  }

  const eliminarOrganizacion = async (id: string) => {
    return eliminarOrganizacionMutation.mutateAsync(id)
  }
  return {
    organizaciones,
    loading,
    error: error instanceof Error ? error.message : null,
    refetch,
    crearOrganizacion,
    actualizarOrganizacion,
    eliminarOrganizacion,
    isCreating: crearOrganizacionMutation.isPending,
    isUpdating: actualizarOrganizacionMutation.isPending,
    isDeleting: eliminarOrganizacionMutation.isPending
  }
}

// Hook para obtener una organización específica
export const useOrganizacion = (id: string) => {
  const {
    data: organizacion,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['organizacion', id],
    queryFn: () => OrganizacionService.getOrganizacionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
  return {
    organizacion,
    loading,
    error: error instanceof Error ? error.message : null,
    refetch
  }
}

// Hook para buscar organizaciones
export const useBuscarOrganizaciones = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const {
    data: resultados = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['buscar-organizaciones', debouncedSearchTerm],
    queryFn: () => OrganizacionService.buscarOrganizaciones(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
  return {
    searchTerm,
    setSearchTerm,
    resultados,
    loading,
    error: error instanceof Error ? error.message : null
  }
}
