import { Contrato } from '../types'

// Función para agrupar contratos por proyecto
export const agruparContratosPorProyecto = (contratos: Contrato[]): Record<string, Contrato[]> => {
  return contratos.reduce((grupos, contrato) => {
    const proyecto = contrato.proyecto || 'Sin proyecto'
    if (!grupos[proyecto]) {
      grupos[proyecto] = []
    }
    grupos[proyecto].push(contrato)
    return grupos
  }, {} as Record<string, Contrato[]>)
}

// Función para obtener estadísticas por proyecto
export const obtenerEstadisticasPorProyecto = (contratos: Contrato[]) => {
  const contratosPorProyecto = agruparContratosPorProyecto(contratos)
  
  return Object.entries(contratosPorProyecto).map(([proyecto, contratos]) => ({
    proyecto,
    total: contratos.length,
    montoTotal: contratos.reduce((sum, contrato) => sum + (contrato.monto || 0), 0),
    activos: contratos.filter(c => c.estado === 'activo').length,
    vencidos: contratos.filter(c => c.estado === 'vencido').length,
    monedas: [...new Set(contratos.map(c => c.moneda))],
    fechaInicio: new Date(Math.min(...contratos.map(c => c.fechaInicio.getTime()))),
    fechaTermino: new Date(Math.max(...contratos.map(c => c.fechaTermino.getTime())))
  }))
}

// Función para obtener proyectos únicos
export const obtenerProyectosUnicos = (contratos: Contrato[]): string[] => {
  const proyectos = new Set(contratos.map(contrato => contrato.proyecto).filter(Boolean))
  return Array.from(proyectos).sort()
}

// Función para filtrar contratos por proyecto
export const filtrarContratosPorProyecto = (contratos: Contrato[], proyecto: string): Contrato[] => {
  if (!proyecto) return contratos
  return contratos.filter(contrato => 
    contrato.proyecto && contrato.proyecto.toLowerCase().includes(proyecto.toLowerCase())
  )
}

// Función para calcular el progreso del proyecto basado en fechas
export const calcularProgresoProyecto = (contratos: Contrato[]) => {
  if (contratos.length === 0) return 0
  
  const hoy = new Date()
  const fechaInicio = new Date(Math.min(...contratos.map(c => c.fechaInicio.getTime())))
  const fechaTermino = new Date(Math.max(...contratos.map(c => c.fechaTermino.getTime())))
  
  if (hoy < fechaInicio) return 0
  if (hoy > fechaTermino) return 100
  
  const tiempoTotal = fechaTermino.getTime() - fechaInicio.getTime()
  const tiempoTranscurrido = hoy.getTime() - fechaInicio.getTime()
  
  return Math.round((tiempoTranscurrido / tiempoTotal) * 100)
}
