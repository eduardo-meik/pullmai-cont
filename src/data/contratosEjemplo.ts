import { Contrato, CategoriaContrato, TipoEconomico, Periodicidad, EstadoContrato } from '../types'

// Datos de ejemplo para poblar la base de datos
export const contratosEjemplo: Omit<Contrato, 'id' | 'fechaCreacion' | 'version' | 'metadatos' | 'auditoria'>[] = [
  // Proyecto: Sistema ERP (proj-001)
  {
    titulo: "Desarrollo de Sistema ERP",
    descripcion: "Desarrollo e implementación de sistema de planificación de recursos empresariales para gestión integral de la organización",
    contraparte: "TechSolutions SpA",
    contraparteId: "org-tech-solutions", // ID de la organización contraparte
    fechaInicio: new Date('2024-01-15'),
    fechaTermino: new Date('2024-12-15'),
    monto: 85000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/erp-desarrollo.pdf',
    categoria: CategoriaContrato.SERVICIOS,
    periodicidad: Periodicidad.UNICO,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Sistema ERP',
    proyectoId: 'proj-001',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'org-001',
    departamento: 'Tecnología',
    responsableId: 'user-001',
    documentoNombre: 'contrato-erp-desarrollo.pdf',
    documentoTamaño: 2500000,
    etiquetas: ['desarrollo', 'erp', 'software', 'tecnología']
  },
  {
    titulo: "Licencias de Software ERP",
    descripcion: "Adquisición de licencias anuales para el sistema ERP desarrollado",
    contraparte: "TechSolutions SpA",
    contraparteId: "org-tech-solutions", // ID de la organización contraparte
    fechaInicio: new Date('2025-01-01'),
    fechaTermino: new Date('2025-12-31'),
    monto: 12000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/erp-licencias.pdf',
    categoria: CategoriaContrato.SERVICIOS,
    periodicidad: Periodicidad.ANUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Sistema ERP',
    proyectoId: 'proj-001',
    estado: EstadoContrato.APROBADO,
    organizacionId: 'org-001',
    departamento: 'Tecnología',
    responsableId: 'user-001',
    documentoNombre: 'contrato-erp-licencias.pdf',
    documentoTamaño: 1200000,
    etiquetas: ['licencias', 'erp', 'software', 'anual']
  },

  // Proyecto: Expansión Oficinas (proj-002)
  {
    titulo: "Arriendo de Oficina Central",
    descripcion: "Contrato de arriendo de nuevas oficinas centrales para expansión de operaciones",
    contraparte: "Inmobiliaria Corporativa Ltda",
    contraparteId: "org-inmobiliaria-corportiva", // ID de la organización contraparte
    fechaInicio: new Date('2024-03-01'),
    fechaTermino: new Date('2027-02-28'),
    monto: 180000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/arriendo-oficina.pdf',
    categoria: CategoriaContrato.ARRENDAMIENTO,
    periodicidad: Periodicidad.MENSUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Expansión Oficinas',
    proyectoId: 'proj-002',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'org-001',
    departamento: 'Administración',
    responsableId: 'user-002',
    documentoNombre: 'arriendo-oficina-central.pdf',
    documentoTamaño: 3200000,
    etiquetas: ['arriendo', 'oficinas', 'expansión', 'inmueble']
  },
  {
    titulo: "Servicio de Remodelación",
    descripcion: "Servicios de arquitectura y remodelación para adaptación de nuevas oficinas",
    contraparte: "Arquitectos & Diseño SA",
    contraparteId: "org-arquitectos-diseno", // ID de la organización contraparte
    fechaInicio: new Date('2024-04-15'),
    fechaTermino: new Date('2024-08-30'),
    monto: 45000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/remodelacion.pdf',
    categoria: CategoriaContrato.SERVICIOS,
    periodicidad: Periodicidad.UNICO,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Expansión Oficinas',
    proyectoId: 'proj-002',
    estado: EstadoContrato.VENCIDO,
    organizacionId: 'org-001',
    departamento: 'Administración',
    responsableId: 'user-002',
    documentoNombre: 'contrato-remodelacion.pdf',
    documentoTamaño: 1800000,
    etiquetas: ['remodelación', 'arquitectura', 'oficinas', 'diseño']
  },

  // Proyecto: Marketing Digital (proj-003)
  {
    titulo: "Campaña Publicitaria Digital",
    descripcion: "Desarrollo y ejecución de campaña publicitaria integral en medios digitales",
    contraparte: "Digital Marketing Pro",
    contraparteId: "org-digital-marketing-pro", // ID de la organización contraparte
    fechaInicio: new Date('2024-05-01'),
    fechaTermino: new Date('2024-11-30'),
    monto: 28000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/marketing-digital.pdf',
    categoria: CategoriaContrato.SERVICIOS,
    periodicidad: Periodicidad.MENSUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Marketing Digital',
    proyectoId: 'proj-003',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'org-001',
    departamento: 'Marketing',
    responsableId: 'user-003',
    documentoNombre: 'campana-digital.pdf',
    documentoTamaño: 2100000,
    etiquetas: ['marketing', 'digital', 'campaña', 'publicidad']
  },
  {
    titulo: "Plataforma de Analytics",
    descripcion: "Suscripción anual a plataforma de análisis y métricas de marketing digital",
    contraparte: "Analytics Solutions Inc",
    contraparteId: "org-analytics-solutions", // ID de la organización contraparte
    fechaInicio: new Date('2024-06-01'),
    fechaTermino: new Date('2025-05-31'),
    monto: 8500000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/analytics.pdf',
    categoria: CategoriaContrato.SERVICIOS,
    periodicidad: Periodicidad.ANUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Marketing Digital',
    proyectoId: 'proj-003',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'org-001',
    departamento: 'Marketing',
    responsableId: 'user-003',
    documentoNombre: 'plataforma-analytics.pdf',
    documentoTamaño: 950000,
    etiquetas: ['analytics', 'métricas', 'suscripción', 'datos']
  },

  // Proyecto: Recursos Humanos (proj-004)
  {
    titulo: "Consultoría en Gestión del Talento",
    descripcion: "Servicios de consultoría para implementación de sistema de gestión y evaluación del talento humano",
    contraparte: "HR Consulting Group",
    contraparteId: "org-hr-consulting-group", // ID de la organización contraparte
    fechaInicio: new Date('2024-08-01'),
    fechaTermino: new Date('2025-01-31'),
    monto: 15000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/consultoria-rrhh.pdf',
    categoria: CategoriaContrato.CONSULTORIA,
    periodicidad: Periodicidad.MENSUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Recursos Humanos',
    proyectoId: 'proj-004',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'org-001',
    departamento: 'Recursos Humanos',
    responsableId: 'user-004',
    documentoNombre: 'consultoria-talento.pdf',
    documentoTamaño: 2800000,
    etiquetas: ['consultoria', 'rrhh', 'talento', 'evaluación']
  },
  {
    titulo: "Plataforma de Capacitación Online",
    descripcion: "Suscripción a plataforma de capacitación y desarrollo profesional para empleados",
    contraparte: "LearnTech Solutions",
    contraparteId: "org-learntech-solutions", // ID de la organización contraparte
    fechaInicio: new Date('2024-09-01'),
    fechaTermino: new Date('2025-08-31'),
    monto: 6800000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/capacitacion.pdf',
    categoria: CategoriaContrato.SERVICIOS,
    periodicidad: Periodicidad.ANUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Recursos Humanos',
    proyectoId: 'proj-004',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'org-001',
    departamento: 'Recursos Humanos',
    responsableId: 'user-004',
    documentoNombre: 'plataforma-capacitacion.pdf',
    documentoTamaño: 1100000,
    etiquetas: ['capacitación', 'online', 'desarrollo', 'empleados']
  },

  // Proyecto: Ventas Internacionales (proj-005)
  {
    titulo: "Contrato de Exportación - Europa",
    descripcion: "Acuerdo marco para exportación de productos a mercados europeos",
    contraparte: "EuroTrade Distribution GmbH",
    contraparteId: "org-eurotrade-distribution", // ID de la organización contraparte
    fechaInicio: new Date('2024-10-01'),
    fechaTermino: new Date('2025-09-30'),
    monto: 150000000,
    moneda: 'EUR',
    pdfUrl: 'https://example.com/contratos/exportacion-europa.pdf',
    categoria: CategoriaContrato.VENTAS,
    periodicidad: Periodicidad.ANUAL,
    tipo: TipoEconomico.INGRESO,
    proyecto: 'Ventas Internacionales',
    proyectoId: 'proj-005',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'org-001',
    departamento: 'Ventas',
    responsableId: 'user-005',
    documentoNombre: 'exportacion-europa.pdf',
    documentoTamaño: 4200000,
    etiquetas: ['exportación', 'europa', 'ventas', 'internacional']
  },
  {
    titulo: "Servicios de Logística Internacional",
    descripcion: "Contrato de servicios logísticos para distribución internacional de productos",
    contraparte: "Global Logistics Partners",
    contraparteId: "org-global-logistics-partners", // ID de la organización contraparte
    fechaInicio: new Date('2024-11-01'),
    fechaTermino: new Date('2025-10-31'),
    monto: 35000000,
    moneda: 'USD',
    pdfUrl: 'https://example.com/contratos/logistica-internacional.pdf',
    categoria: CategoriaContrato.SERVICIOS,
    periodicidad: Periodicidad.MENSUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Ventas Internacionales',
    proyectoId: 'proj-005',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'org-001',
    departamento: 'Logística',
    responsableId: 'user-005',
    documentoNombre: 'logistica-internacional.pdf',
    documentoTamaño: 2600000,
    etiquetas: ['logística', 'internacional', 'distribución', 'transporte']
  },

  // Proyecto: Mantenimiento y Soporte (proj-006)
  {
    titulo: "Mantenimiento de Equipos de Oficina",
    descripcion: "Contrato de mantenimiento preventivo y correctivo de equipos de oficina y tecnología",
    contraparte: "TechService Maintenance",
    contraparteId: "org-techservice-maintenance", // ID de la organización contraparte
    fechaInicio: new Date('2024-07-01'),
    fechaTermino: new Date('2025-06-30'),
    monto: 18000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/mantenimiento-equipos.pdf',
    categoria: CategoriaContrato.MANTENIMIENTO,
    periodicidad: Periodicidad.MENSUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Mantenimiento y Soporte',
    proyectoId: 'proj-006',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'org-001',
    departamento: 'Tecnología',
    responsableId: 'user-006',
    documentoNombre: 'mantenimiento-equipos.pdf',
    documentoTamaño: 1700000,
    etiquetas: ['mantenimiento', 'equipos', 'soporte técnico', 'preventivo']
  },
  {
    titulo: "Soporte Técnico Especializado",
    descripcion: "Servicios de soporte técnico especializado 24/7 para sistemas críticos",
    contraparte: "Support Pro Services",
    contraparteId: "org-support-pro-services", // ID de la organización contraparte
    fechaInicio: new Date('2024-01-01'),
    fechaTermino: new Date('2024-12-31'),
    monto: 24000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/soporte-tecnico.pdf',
    categoria: CategoriaContrato.SERVICIOS,
    periodicidad: Periodicidad.ANUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Mantenimiento y Soporte',
    proyectoId: 'proj-006',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'org-001',
    departamento: 'Tecnología',
    responsableId: 'user-006',
    documentoNombre: 'soporte-especializado.pdf',
    documentoTamaño: 1400000,
    etiquetas: ['soporte', '24/7', 'técnico', 'crítico']
  },
  {
    titulo: "Seguro de Equipos Tecnológicos",
    descripcion: "Póliza de seguro integral para protección de equipos tecnológicos y sistemas",
    contraparte: "Seguros Corporativos SA",
    contraparteId: "org-seguros-corporativos", // ID de la organización contraparte
    fechaInicio: new Date('2024-04-01'),
    fechaTermino: new Date('2025-03-31'),
    monto: 8200000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/seguro-equipos.pdf',
    categoria: CategoriaContrato.SERVICIOS,
    periodicidad: Periodicidad.ANUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Mantenimiento y Soporte',
    proyectoId: 'proj-006',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'org-001',
    departamento: 'Administración',
    responsableId: 'user-006',
    documentoNombre: 'seguro-equipos-tech.pdf',
    documentoTamaño: 2300000,
    etiquetas: ['seguro', 'equipos', 'tecnología', 'protección']
  },

  // Proyecto: Auditoría y Compliance (proj-007)
  {
    titulo: "Auditoría Externa Anual",
    descripcion: "Servicios de auditoría externa integral y revisión de estados financieros",
    contraparte: "Auditoría y Consultoría Profesional",
    contraparteId: "org-auditoria-consultoria-profesional", // ID de la organización contraparte
    fechaInicio: new Date('2024-12-01'),
    fechaTermino: new Date('2025-03-31'),
    monto: 22000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/auditoria-externa.pdf',
    categoria: CategoriaContrato.CONSULTORIA,
    periodicidad: Periodicidad.ANUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Auditoría y Compliance',
    proyectoId: 'proj-007',
    estado: EstadoContrato.APROBADO,
    organizacionId: 'org-001',
    departamento: 'Finanzas',
    responsableId: 'user-007',
    documentoNombre: 'auditoria-externa-2024.pdf',
    documentoTamaño: 3500000,
    etiquetas: ['auditoría', 'externa', 'financiera', 'compliance']
  }
]

// Función helper para generar proyectos de ejemplo
export const proyectosEjemplo = [
  {
    id: 'proj-001',
    nombre: 'Sistema ERP',
    organizacionId: 'org-001'
  },
  {
    id: 'proj-002',
    nombre: 'Expansión Oficinas',
    organizacionId: 'org-001'
  },
  {
    id: 'proj-003',
    nombre: 'Marketing Digital',
    organizacionId: 'org-001'
  },
  {
    id: 'proj-004',
    nombre: 'Recursos Humanos',
    organizacionId: 'org-001'
  },
  {
    id: 'proj-005',
    nombre: 'Ventas Internacionales',
    organizacionId: 'org-001'
  },
  {
    id: 'proj-006',
    nombre: 'Mantenimiento y Soporte',
    organizacionId: 'org-001'
  },  {
    id: 'proj-007',
    nombre: 'Auditoría y Compliance',
    organizacionId: 'org-001'
  }
]

// Función auxiliar para generar fechas de creación realistas
export const generarFechaCreacion = (fechaInicio: Date): Date => {
  // Generar fecha de creación entre 1-30 días antes de la fecha de inicio
  const diasAntes = Math.floor(Math.random() * 30) + 1
  const fechaCreacion = new Date(fechaInicio)
  fechaCreacion.setDate(fechaCreacion.getDate() - diasAntes)
  return fechaCreacion
}
