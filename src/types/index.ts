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
  contraparte: string // Nombre de la contraparte
  fechaInicio: Date // Fecha de Inicio
  fechaTermino: Date // Fecha de Termino (anteriormente fechaVencimiento)
  monto: number // Monto del contrato
  moneda: string // Moneda (USD, CLP, EUR, etc.)
  pdfUrl: string // URL del PDF del contrato
  categoria: CategoriaContrato // Categoría del contrato
  periodicidad: Periodicidad // Frecuencia del contrato
  tipo: TipoEconomico // Tipo económico (Compra/Venta, Ingreso/Egreso)
  proyecto: string // Proyecto al que pertenece el contrato
  
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
  fechaInicio: Date
  fechaTermino: Date
  monto: number
  moneda: string
  categoria: CategoriaContrato
  periodicidad: Periodicidad
  tipo: TipoEconomico
  proyecto: string
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