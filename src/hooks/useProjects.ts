import { useState, useEffect } from 'react'
import { Proyecto, EstadisticasProyecto, Contrato } from '../types'
import ProjectService from '../services/projectService'

// Hook para gestionar proyectos
export const useProjects = (organizacionId?: string) => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarProyectos()
  }, [organizacionId])

  const cargarProyectos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = organizacionId 
        ? await ProjectService.obtenerProyectosPorOrganizacion(organizacionId)
        : await ProjectService.obtenerProyectos()
      
      setProyectos(data)
    } catch (err) {
      setError('Error cargando proyectos')
      console.error('Error cargando proyectos:', err)
    } finally {
      setLoading(false)
    }
  }

  const crearProyecto = async (proyecto: Omit<Proyecto, 'id' | 'fechaCreacion' | 'fechaUltimaModificacion' | 'version'>) => {
    try {
      const id = await ProjectService.crearProyecto(proyecto)
      if (id) {
        await cargarProyectos() // Recargar lista
        return id
      }
      throw new Error('No se pudo crear el proyecto')
    } catch (err) {
      setError('Error creando proyecto')
      throw err
    }
  }

  const actualizarProyecto = async (id: string, cambios: Partial<Proyecto>) => {
    try {
      const success = await ProjectService.actualizarProyecto(id, cambios)
      if (success) {
        await cargarProyectos() // Recargar lista
        return true
      }
      throw new Error('No se pudo actualizar el proyecto')
    } catch (err) {
      setError('Error actualizando proyecto')
      throw err
    }
  }

  const eliminarProyecto = async (id: string) => {
    try {
      const success = await ProjectService.eliminarProyecto(id)
      if (success) {
        await cargarProyectos() // Recargar lista
        return true
      }
      throw new Error('No se pudo eliminar el proyecto')
    } catch (err) {
      setError('Error eliminando proyecto')
      throw err
    }
  }
  return {
    proyectos,
    loading,
    error,
    cargarProyectos,
    refetchProjects: cargarProyectos, // Alias for cargarProyectos
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto
  }
}

// Hook para obtener un proyecto específico
export const useProject = (id: string) => {
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasProyecto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      cargarProyecto()
    }
  }, [id])

  const cargarProyecto = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar proyecto
      const proyectoData = await ProjectService.obtenerProyectoPorId(id)
      if (!proyectoData) {
        throw new Error('Proyecto no encontrado')
      }
      setProyecto(proyectoData)

      // Cargar contratos del proyecto
      const contratosData = await ProjectService.obtenerContratosPorProyecto(proyectoData.nombre)
      setContratos(contratosData)

      // Cargar estadísticas
      const estadisticasData = await ProjectService.calcularEstadisticasProyecto(proyectoData.nombre)
      setEstadisticas(estadisticasData)

    } catch (err) {
      setError('Error cargando proyecto')
      console.error('Error cargando proyecto:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    proyecto,
    contratos,
    estadisticas,
    loading,
    error,
    refetch: cargarProyecto, // Expose for manual refresh
  }
}

// Hook para estadísticas generales de proyectos
export const useProjectStats = () => {
  const [resumen, setResumen] = useState({
    totalProyectos: 0,
    proyectosActivos: 0,
    proyectosCompletados: 0,
    valorTotalProyectos: 0,
    proyectosPorEstado: {} as Record<string, number>
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarResumen()
  }, [])

  const cargarResumen = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await ProjectService.obtenerResumenProyectos()
      setResumen(data)
    } catch (err) {
      setError('Error cargando estadísticas')
      console.error('Error cargando estadísticas de proyectos:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    resumen,
    loading,
    error,
    recargar: cargarResumen
  }
}
