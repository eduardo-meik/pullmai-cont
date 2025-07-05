import { useQuery, useMutation } from '@tanstack/react-query'
import { Proyecto, EstadisticasProyecto, Contrato } from '../types'
import ProjectService from '../services/projectService'
import { CACHE_KEYS, useCacheInvalidation } from './useCacheInvalidation'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../contexts/ToastContext'

// Hook para gestionar proyectos
export const useProjects = (organizacionId?: string) => {
  const { usuario } = useAuthStore()
  const orgId = organizacionId || usuario?.organizacionId

  return useQuery({
    queryKey: [CACHE_KEYS.PROJECTS, orgId],
    queryFn: async () => {
      const data = orgId 
        ? await ProjectService.obtenerProyectosPorOrganizacion(orgId)
        : await ProjectService.obtenerProyectos()
      
      return data
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false
  })
}

// Hook para operaciones de proyectos con invalidación de caché
export const useProjectOperations = () => {
  const { invalidateProjects, invalidateProject, invalidateOrganizationData } = useCacheInvalidation()
  const { usuario } = useAuthStore()
  const { showTypedToast } = useToast()

  const crearProyectoMutation = useMutation({
    mutationFn: (proyecto: Omit<Proyecto, 'id' | 'fechaCreacion' | 'fechaUltimaModificacion' | 'version'>) => 
      ProjectService.crearProyecto(proyecto),
    onSuccess: (id) => {
      if (usuario?.organizacionId) {
        invalidateProjects(usuario.organizacionId)
        invalidateOrganizationData(usuario.organizacionId)
      }
      showTypedToast('success', 'Proyecto creado exitosamente')
      return id
    },
    onError: (error) => {
      showTypedToast('error', 'Error creando proyecto')
      throw error
    }
  })

  const actualizarProyectoMutation = useMutation({
    mutationFn: ({ id, cambios }: { id: string; cambios: Partial<Proyecto> }) => 
      ProjectService.actualizarProyecto(id, cambios),
    onSuccess: (_, { id }) => {
      invalidateProject(id)
      if (usuario?.organizacionId) {
        invalidateProjects(usuario.organizacionId)
      }
      showTypedToast('success', 'Proyecto actualizado exitosamente')
    },
    onError: () => {
      showTypedToast('error', 'Error actualizando proyecto')
    }
  })

  const eliminarProyectoMutation = useMutation({
    mutationFn: (id: string) => ProjectService.eliminarProyecto(id),
    onSuccess: () => {
      if (usuario?.organizacionId) {
        invalidateProjects(usuario.organizacionId)
        invalidateOrganizationData(usuario.organizacionId)
      }
      showTypedToast('success', 'Proyecto eliminado exitosamente')
    },
    onError: () => {
      showTypedToast('error', 'Error eliminando proyecto')
    }
  })

  return {
    crearProyecto: crearProyectoMutation.mutate,
    actualizarProyecto: actualizarProyectoMutation.mutate,
    eliminarProyecto: eliminarProyectoMutation.mutate,
    isCreating: crearProyectoMutation.isPending,
    isUpdating: actualizarProyectoMutation.isPending,
    isDeleting: eliminarProyectoMutation.isPending
  }
}

// Hook para obtener un proyecto específico
export const useProject = (id: string) => {
  return useQuery({
    queryKey: [CACHE_KEYS.PROJECT, id],
    queryFn: async () => {
      const proyecto = await ProjectService.obtenerProyectoPorId(id)
      if (!proyecto) {
        throw new Error('Proyecto no encontrado')
      }
      return proyecto
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

// Hook para obtener contratos de un proyecto
export const useProjectContracts = (projectName: string) => {
  const { usuario } = useAuthStore()
  
  return useQuery({
    queryKey: [CACHE_KEYS.CONTRACTS, 'project', projectName, usuario?.organizacionId],
    queryFn: () => ProjectService.obtenerContratosPorProyecto(projectName, usuario?.organizacionId),
    enabled: !!projectName && !!usuario?.organizacionId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

// Hook para estadísticas de un proyecto
export const useProjectStats = (projectName: string) => {
  const { usuario } = useAuthStore()
  
  return useQuery({
    queryKey: [CACHE_KEYS.PROJECT, 'stats', projectName, usuario?.organizacionId],
    queryFn: () => ProjectService.calcularEstadisticasProyecto(projectName, usuario?.organizacionId),
    enabled: !!projectName && !!usuario?.organizacionId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

// Hook para resumen general de proyectos
export const useProjectsResumen = (organizacionId?: string) => {
  const { usuario } = useAuthStore()
  const orgId = organizacionId || usuario?.organizacionId

  return useQuery({
    queryKey: [CACHE_KEYS.PROJECTS, 'resumen', orgId],
    queryFn: () => ProjectService.obtenerResumenProyectos(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}
