// DEPRECATED: This hook is no longer used in the new organization-based architecture
// Use useContrapartesOrganizacion instead

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { useToast, EToastTypes } from '../contexts/ToastContext'

// Disabled all functionality - use useContrapartesOrganizacion instead

export const useContrapartes = () => {
  const { showTypedToast } = useToast()

  // Return empty/disabled implementation
  return {
    contrapartes: [],
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
    createContraparte: {
      mutateAsync: () => {
        showTypedToast(EToastTypes.ERROR, 'Esta funcionalidad ha sido deshabilitada. Use el nuevo sistema de organizaciones.')
        return Promise.reject('Disabled')
      },
      isPending: false
    },
    updateContraparte: {
      mutateAsync: () => {
        showTypedToast(EToastTypes.ERROR, 'Esta funcionalidad ha sido deshabilitada. Use el nuevo sistema de organizaciones.')
        return Promise.reject('Disabled')
      },
      isPending: false
    },
    deleteContraparte: {
      mutateAsync: () => {
        showTypedToast(EToastTypes.ERROR, 'Esta funcionalidad ha sido deshabilitada. Use el nuevo sistema de organizaciones.')
        return Promise.reject('Disabled')
      },
      isPending: false
    },
    isCreating: false,
    isUpdating: false,
    isDeleting: false
  }
}

export const useContraparteDetail = (contraparteNombre: string) => {
  return {
    contratos: [],
    estadisticas: null,
    isLoadingContratos: false,
    isLoadingEstadisticas: false,
    errorContratos: null,
    errorEstadisticas: null,
    refetchContratos: () => Promise.resolve(),
    refetchEstadisticas: () => Promise.resolve()
  }
}

export const useContraparteSearch = (searchTerm: string) => {
  return {
    data: [],
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve()
  }
}
