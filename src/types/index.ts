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
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  MANAGER = 'manager',
  USER = 'user'
}

export interface Contrato {
  id: string
  titulo: string
  descripcion: string
  tipo: TipoContrato
  estado: EstadoContrato
  fechaCreacion: Date
  fechaInicio: Date
  fechaVencimiento: Date
  valor?: number
  moneda?: string
  organizacionId: string
  departamento: string
  responsableId: string
  contraparteId?: string
  documentoUrl?: string
  documentoNombre?: string
  documentoTamaño?: number
  version: number
  etiquetas: string[]
  metadatos: Record<string, any>
  auditoria: RegistroAuditoria[]
}

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
  tipo?: TipoContrato[]
  fechaInicio?: Date
  fechaFin?: Date
  responsable?: string
  departamento?: string
  etiquetas?: string[]
}

export interface EstadisticasContrato {
  total: number
  porEstado: Record<EstadoContrato, number>
  porTipo: Record<TipoContrato, number>
  proximosVencer: number
  valorTotal: number
  tendenciaMensual: { mes: string; cantidad: number; valor: number }[]
}

// Tipos para formularios
export interface FormularioContrato {
  titulo: string
  descripcion: string
  tipo: TipoContrato
  fechaInicio: Date
  fechaVencimiento: Date
  valor?: number
  moneda?: string
  departamento: string
  contraparteId?: string
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