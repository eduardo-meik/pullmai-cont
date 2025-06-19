import { Proyecto, EstadoProyecto, PrioridadProyecto } from '../types'

// Datos de ejemplo para proyectos basados en los contratos existentes
export const proyectosEjemplo: Omit<Proyecto, 'id' | 'fechaCreacion' | 'creadoPor' | 'fechaUltimaModificacion' | 'modificadoPor' | 'version'>[] = [
  {
    nombre: "Sistema ERP",
    descripcion: "Implementación completa de sistema de planificación de recursos empresariales para modernizar la gestión organizacional y mejorar la eficiencia operativa.",
    estado: EstadoProyecto.EN_CURSO,
    prioridad: PrioridadProyecto.ALTA,
    fechaInicio: new Date('2024-01-01'),
    fechaFinEstimada: new Date('2025-12-31'),
    presupuestoTotal: 120000000, // 120M CLP
    presupuestoGastado: 85000000, // 85M CLP ya gastado en desarrollo
    moneda: 'CLP',
    responsableId: 'user-001',
    organizacionId: 'org-001',
    departamento: 'Tecnología',
    equipoIds: ['user-001', 'user-007', 'user-008'],
    numeroContratos: 2,
    valorTotalContratos: 97000000, // 85M desarrollo + 12M licencias
    contratosActivos: 1,
    contratosPendientes: 1,
    etiquetas: ['tecnología', 'erp', 'software', 'transformación-digital'],
    color: '#3B82F6', // Azul
    icono: '🖥️'
  },
  
  {
    nombre: "Expansión Oficinas",
    descripcion: "Proyecto de expansión física de la organización con nuevas oficinas, equipamiento y mobiliario para soportar el crecimiento empresarial.",
    estado: EstadoProyecto.EN_CURSO,
    prioridad: PrioridadProyecto.MEDIA,
    fechaInicio: new Date('2024-02-01'),
    fechaFinEstimada: new Date('2024-08-31'),
    presupuestoTotal: 35000000, // 35M CLP
    presupuestoGastado: 28500000, // 28.5M CLP gastado
    moneda: 'CLP',
    responsableId: 'user-002',
    organizacionId: 'org-001',
    departamento: 'Administración',
    equipoIds: ['user-002', 'user-009', 'user-010'],
    numeroContratos: 2,
    valorTotalContratos: 28500000, // 3.5M arrendamiento + 25M mobiliario
    contratosActivos: 2,
    contratosPendientes: 0,
    etiquetas: ['expansión', 'oficinas', 'infraestructura', 'mobiliario'],
    color: '#10B981', // Verde
    icono: '🏢'
  },
  
  {
    nombre: "Marketing Digital",
    descripcion: "Estrategia integral de marketing digital para aumentar la presencia online, generar leads y fortalecer la marca en el mercado digital.",
    estado: EstadoProyecto.EN_CURSO,
    prioridad: PrioridadProyecto.ALTA,
    fechaInicio: new Date('2024-05-01'),
    fechaFinEstimada: new Date('2025-06-30'),
    presupuestoTotal: 35000000, // 35M CLP
    presupuestoGastado: 18000000, // 18M CLP gastado hasta ahora
    moneda: 'CLP',
    responsableId: 'user-003',
    organizacionId: 'org-001',
    departamento: 'Marketing',
    equipoIds: ['user-003', 'user-011', 'user-012'],
    numeroContratos: 2,
    valorTotalContratos: 30500000, // 18M campaña + 12.5M audiovisual
    contratosActivos: 2,
    contratosPendientes: 0,
    etiquetas: ['marketing', 'digital', 'branding', 'contenido'],
    color: '#F59E0B', // Amarillo/Naranja
    icono: '📱'
  },
  
  {
    nombre: "Recursos Humanos",
    descripcion: "Modernización de procesos de RRHH, incorporación de nuevo talento y implementación de sistemas de gestión del talento.",
    estado: EstadoProyecto.EN_CURSO,
    prioridad: PrioridadProyecto.MEDIA,
    fechaInicio: new Date('2024-07-01'),
    fechaFinEstimada: new Date('2025-12-31'),
    presupuestoTotal: 45000000, // 45M CLP
    presupuestoGastado: 17800000, // 17.8M CLP gastado
    moneda: 'CLP',
    responsableId: 'user-004',
    organizacionId: 'org-001',
    departamento: 'Recursos Humanos',
    equipoIds: ['user-004', 'user-013', 'user-014'],
    numeroContratos: 2,
    valorTotalContratos: 17800000, // 15M consultoría + 2.8M gerente
    contratosActivos: 2,
    contratosPendientes: 0,
    etiquetas: ['rrhh', 'talento', 'consultoría', 'gestión'],
    color: '#8B5CF6', // Púrpura
    icono: '👥'
  },
  
  {
    nombre: "Ventas Internacionales",
    descripcion: "Expansión hacia mercados internacionales con foco en América Latina, incluyendo acuerdos de distribución y servicios de soporte.",
    estado: EstadoProyecto.PLANIFICACION,
    prioridad: PrioridadProyecto.ALTA,
    fechaInicio: new Date('2024-09-01'),
    fechaFinEstimada: new Date('2027-12-31'),
    presupuestoTotal: 25000000, // 25M CLP
    presupuestoGastado: 8500000, // 8.5M CLP en servicios de traducción
    moneda: 'CLP',
    responsableId: 'user-005',
    organizacionId: 'org-001',
    departamento: 'Ventas',
    equipoIds: ['user-005', 'user-015', 'user-016'],
    numeroContratos: 2,
    valorTotalContratos: 8500000, // 0 distribución (comisiones) + 8.5M traducción
    contratosActivos: 1,
    contratosPendientes: 1,
    etiquetas: ['internacional', 'ventas', 'distribución', 'latam'],
    color: '#EF4444', // Rojo
    icono: '🌎'
  },
  
  {
    nombre: "Mantenimiento y Soporte",
    descripcion: "Servicios continuos de mantenimiento de equipos, suministros de oficina y soporte técnico para garantizar la operación diaria.",
    estado: EstadoProyecto.EN_CURSO,
    prioridad: PrioridadProyecto.MEDIA,
    fechaInicio: new Date('2024-12-01'),
    fechaFinEstimada: new Date('2025-12-31'),
    presupuestoTotal: 12000000, // 12M CLP
    presupuestoGastado: 0, // Proyectos en borrador
    moneda: 'CLP',
    responsableId: 'user-002',
    organizacionId: 'org-001',
    departamento: 'Administración',
    equipoIds: ['user-001', 'user-002', 'user-017'],
    numeroContratos: 2,
    valorTotalContratos: 8400000, // 6M mantenimiento IT + 2.4M suministros
    contratosActivos: 0,
    contratosPendientes: 2,
    etiquetas: ['mantenimiento', 'soporte', 'equipos', 'suministros'],
    color: '#6B7280', // Gris
    icono: '🔧'
  },
  
  {
    nombre: "Auditoría y Compliance",
    descripcion: "Procesos de auditoría externa, cumplimiento normativo y mejora de procesos internos para garantizar la transparencia organizacional.",
    estado: EstadoProyecto.COMPLETADO,
    prioridad: PrioridadProyecto.MEDIA,
    fechaInicio: new Date('2024-01-01'),
    fechaFinEstimada: new Date('2024-03-31'),
    fechaFinReal: new Date('2024-03-31'),
    presupuestoTotal: 20000000, // 20M CLP
    presupuestoGastado: 18000000, // 18M CLP gastado
    moneda: 'CLP',
    responsableId: 'user-006',
    organizacionId: 'org-001',
    departamento: 'Finanzas',
    equipoIds: ['user-006', 'user-018', 'user-019'],
    numeroContratos: 1,
    valorTotalContratos: 18000000, // 18M auditoría
    contratosActivos: 0,
    contratosPendientes: 0,
    etiquetas: ['auditoría', 'compliance', 'finanzas', 'transparencia'],
    color: '#059669', // Verde oscuro
    icono: '📊'
  }
]

// Función para generar IDs únicos para proyectos
export const generarIdProyecto = (): string => {
  return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Función para calcular estadísticas de proyecto basadas en contratos
export const calcularEstadisticasProyecto = (nombreProyecto: string, contratos: any[]): any => {
  const contratosDelProyecto = contratos.filter(c => c.proyecto === nombreProyecto)
  
  const totalContratos = contratosDelProyecto.length
  const contratosActivos = contratosDelProyecto.filter(c => c.estado === 'ACTIVO').length
  const contratosPorVencer = contratosDelProyecto.filter(c => {
    const fechaVencimiento = new Date(c.fechaTermino)
    const hoy = new Date()
    const diasParaVencer = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24))
    return diasParaVencer <= 30 && diasParaVencer > 0
  }).length
  
  const contratosVencidos = contratosDelProyecto.filter(c => {
    const fechaVencimiento = new Date(c.fechaTermino)
    const hoy = new Date()
    return fechaVencimiento < hoy && c.estado !== 'RENOVADO'
  }).length
  
  const valorTotal = contratosDelProyecto.reduce((sum, c) => sum + c.monto, 0)
  const ingresos = contratosDelProyecto.filter(c => c.tipo === 'INGRESO').reduce((sum, c) => sum + c.monto, 0)
  const egresos = contratosDelProyecto.filter(c => c.tipo === 'EGRESO').reduce((sum, c) => sum + c.monto, 0)
  
  return {
    totalContratos,
    contratosActivos,
    contratosPorVencer,
    contratosVencidos,
    valorTotal,
    valorActivo: contratosDelProyecto.filter(c => c.estado === 'ACTIVO').reduce((sum, c) => sum + c.monto, 0),
    ingresos,
    egresos
  }
}

// Mapeo de proyectos con sus colores e iconos para la UI
export const proyectoConfig = {
  "Sistema ERP": { color: '#3B82F6', icono: '🖥️' },
  "Expansión Oficinas": { color: '#10B981', icono: '🏢' },
  "Marketing Digital": { color: '#F59E0B', icono: '📱' },
  "Recursos Humanos": { color: '#8B5CF6', icono: '👥' },
  "Ventas Internacionales": { color: '#EF4444', icono: '🌎' },
  "Mantenimiento y Soporte": { color: '#6B7280', icono: '🔧' },
  "Auditoría y Compliance": { color: '#059669', icono: '📊' }
}
