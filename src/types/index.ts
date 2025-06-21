// Tipos principales del sistema
export interface Usuario {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: UserRole
  organizacionId: string
  departamento?: string
  activo: boolean
  fechaCreacion: Date
  ultimoAcceso?: Date
  permisos: string[]
  // Nuevos campos para el sistema de asignaciones
  asignaciones?: UserAssignment[]
}

// Interfaz para asignaciones específicas de usuarios (importada desde roles.ts)
export interface UserAssignment {
  userId: string
  organizationId?: string
  projectIds?: string[]
  contractIds?: string[]
  permissions: AssignmentPermission[]
}

export interface AssignmentPermission {
  resource: 'projects' | 'contracts'
  resourceId: string
  actions: ('view' | 'edit')[]
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  MANAGER = 'manager',
  USER = 'user'
}

// Nuevas enumeraciones para contratos
export enum CategoriaContrato {
  SERVICIOS = 'servicios',
  COMPRAS = 'compras',
  VENTAS = 'ventas',
  ARRENDAMIENTO = 'arrendamiento',
  LABORAL = 'laboral',
  CONFIDENCIALIDAD = 'confidencialidad',
  CONSULTORIA = 'consultoria',
  MANTENIMIENTO = 'mantenimiento',
  SUMINISTRO = 'suministro',
  OTRO = 'otro'
}

export enum Periodicidad {
  UNICO = 'unico',
  MENSUAL = 'mensual',
  TRIMESTRAL = 'trimestral',
  SEMESTRAL = 'semestral',
  ANUAL = 'anual',
  BIANUAL = 'bianual'
}

export enum TipoEconomico {
  COMPRA = 'compra',
  VENTA = 'venta',
  INGRESO = 'ingreso',
  EGRESO = 'egreso'
}

export interface Contrato {
  id: string
  titulo: string
  descripcion: string
  contraparte: string // Nombre de la organización contraparte (for display)
  contraparteId?: string // ID de la organización contraparte (referencia a organizaciones collection)
  fechaInicio: Date // Fecha de Inicio
  fechaTermino: Date // Fecha de Termino (anteriormente fechaVencimiento)
  monto: number // Monto del contrato
  moneda: string // Moneda (USD, CLP, EUR, etc.)
  pdfUrl: string // URL del PDF del contrato
  categoria: CategoriaContrato // Categoría del contrato
  periodicidad: Periodicidad // Frecuencia del contrato
  tipo: TipoEconomico // Tipo económico (Compra/Venta, Ingreso/Egreso)
  proyecto: string // Proyecto al que pertenece el contrato (nombre del proyecto)
  proyectoId: string // ID del proyecto (nuevo campo para la relación jerárquica)
  
  // Campos existentes mantenidos
  estado: EstadoContrato
  fechaCreacion: Date
  organizacionId: string
  departamento: string
  responsableId: string
  documentoNombre?: string
  documentoTamaño?: number
  version: number
  etiquetas: string[]
  metadatos: Record<string, any>
  auditoria: RegistroAuditoria[]
}

// Mantenido para compatibilidad con código existente
export enum TipoContrato {
  SERVICIO = 'servicio',
  COMPRA = 'compra',
  VENTA = 'venta',
  CONFIDENCIALIDAD = 'confidencialidad',
  LABORAL = 'laboral',
  ARRENDAMIENTO = 'arrendamiento',
  OTRO = 'otro'
}

export enum EstadoContrato {
  BORRADOR = 'borrador',
  REVISION = 'revision',
  APROBADO = 'aprobado',
  ACTIVO = 'activo',
  VENCIDO = 'vencido',
  CANCELADO = 'cancelado',
  RENOVADO = 'renovado'
}

export interface Organizacion {
  id: string
  nombre: string
  descripcion?: string
  logo?: string
  configuracion: ConfiguracionOrg
  fechaCreacion: Date
  activa: boolean
}

export interface ConfiguracionOrg {
  tiposContratoPermitidos: TipoContrato[]
  flujoAprobacion: boolean
  notificacionesEmail: boolean
  retencionDocumentos: number // días
  plantillasPersonalizadas: boolean
}

export interface RegistroAuditoria {
  id: string
  contratoId: string
  usuarioId: string
  accion: AccionAuditoria
  descripcion: string
  fecha: Date
  metadatos?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export enum AccionAuditoria {
  CREACION = 'creacion',
  MODIFICACION = 'modificacion',
  VISUALIZACION = 'visualizacion',
  DESCARGA = 'descarga',
  ELIMINACION = 'eliminacion',
  CAMBIO_ESTADO = 'cambio_estado',
  SUBIDA_DOCUMENTO = 'subida_documento',
  APROBACION = 'aprobacion',
  RECHAZO = 'rechazo'
}

export interface VersionDocumento {
  id: string
  contratoId: string
  version: number
  documentoUrl: string
  documentoNombre: string
  documentoTamaño: number
  fechaSubida: Date
  usuarioId: string
  comentarios?: string
  activa: boolean
}

export interface PlantillaContrato {
  id: string
  nombre: string
  descripcion: string
  tipo: TipoContrato
  contenido: string
  campos: CampoPlantilla[]
  organizacionId: string
  activa: boolean
  fechaCreacion: Date
}

export interface CampoPlantilla {
  id: string
  nombre: string
  tipo: 'texto' | 'numero' | 'fecha' | 'seleccion'
  requerido: boolean
  opciones?: string[]
  valorPorDefecto?: string
}

export interface FiltrosContrato {
  busqueda?: string
  estado?: EstadoContrato[]
  categoria?: CategoriaContrato[]
  tipo?: TipoEconomico[]
  periodicidad?: Periodicidad[]
  proyecto?: string
  fechaInicio?: Date
  fechaFin?: Date
  responsable?: string
  departamento?: string
  etiquetas?: string[]
}

export interface EstadisticasContrato {
  total: number
  porEstado: Record<EstadoContrato, number>
  porCategoria: Record<CategoriaContrato, number>
  porTipoEconomico: Record<TipoEconomico, number>
  porProyecto: Record<string, number>
  proximosVencer: number
  montoTotal: number
  tendenciaMensual: { mes: string; cantidad: number; monto: number }[]
}

// Tipos para formularios
export interface FormularioContrato {
  titulo: string
  descripcion: string
  contraparte: string
  contraparteId?: string // ID de la organización contraparte
  fechaInicio: string
  fechaTermino: string
  monto: number
  moneda: string
  categoria: CategoriaContrato
  periodicidad: Periodicidad
  tipo: TipoEconomico
  proyecto: string
  proyectoId: string // Nuevo campo para la relación jerárquica
  estado: EstadoContrato
  departamento: string
  etiquetas: string[]
  documento?: File
}

// Tipos para permisos
export interface Permiso {
  recurso: string
  accion: 'crear' | 'leer' | 'actualizar' | 'eliminar'
  condiciones?: Record<string, any>
}

export interface ContextoPermiso {
  usuario: Usuario
  organizacion: Organizacion
  recurso?: any
}

// Enumeraciones para proyectos
export enum EstadoProyecto {
  PLANIFICACION = 'planificacion',
  EN_CURSO = 'en_curso',
  PAUSADO = 'pausado',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado'
}

export enum PrioridadProyecto {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica'
}

// Interfaz para proyectos
export interface Proyecto {
  id: string
  nombre: string
  descripcion: string
  estado: EstadoProyecto
  prioridad: PrioridadProyecto
  fechaInicio: Date
  fechaFinEstimada?: Date
  fechaFinReal?: Date
  presupuestoTotal: number
  presupuestoGastado: number
  moneda: string
  
  // Responsables y organización
  responsableId: string
  organizacionId: string
  departamento: string
  equipoIds: string[] // IDs de los miembros del equipo
  
  // Métricas del proyecto
  numeroContratos: number
  valorTotalContratos: number
  contratosActivos: number
  contratosPendientes: number
  
  // Metadatos
  etiquetas: string[]
  color?: string // Color para visualización en UI
  icono?: string // Icono para el proyecto
  
  // Auditoría
  fechaCreacion: Date
  creadoPor: string
  fechaUltimaModificacion: Date
  modificadoPor: string
  version: number
}

// Estadísticas agregadas por proyecto
export interface EstadisticasProyecto {
  totalContratos: number
  contratosActivos: number
  contratosPorVencer: number
  contratosVencidos: number
  valorTotal: number
  valorActivo: number
  ingresos: number
  egresos: number
  distribucionPorCategoria: Record<CategoriaContrato, number>
  distribucionPorEstado: Record<EstadoContrato, number>
  tendenciaMensual: Array<{
    mes: string
    valor: number
    cantidad: number
  }>
}

// Tipos para contrapartes (organizaciones con las que tenemos contratos)
export interface ContraparteRelacion {
  organizacionId: string // ID de la organización contraparte
  organizacion: Organizacion // Datos completos de la organización
  estadisticas: ContraparteEstadisticas // Estadísticas de la relación contractual
}

export interface ContraparteEstadisticas {
  totalContratos: number
  montoTotal: number
  montoPromedio: number
  contratosActivos: number
  contratosVencidos: number
  contratosProximosVencer: number
  ultimoContrato?: Date
  proximoVencimiento?: Date
  categoriasPrincipales: string[] // Categorías de contratos más comunes
  departamentosInvolucrados: string[] // Departamentos que han contratado con esta organización
}