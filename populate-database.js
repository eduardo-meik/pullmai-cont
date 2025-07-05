// Script para poblar la base de datos con datos de ejemplo
// Ejecutar con: node populate-database.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID,
  measurementId: process.env.VITE_MEASUREMENT_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enumeraciones
const CategoriaContrato = {
  SERVICIOS: 'servicios',
  COMPRAS: 'compras',
  VENTAS: 'ventas',
  ARRENDAMIENTO: 'arrendamiento',
  LABORAL: 'laboral',
  CONFIDENCIALIDAD: 'confidencialidad',
  CONSULTORIA: 'consultoria',
  MANTENIMIENTO: 'mantenimiento',
  SUMINISTRO: 'suministro',
  OTRO: 'otro'
};

const Periodicidad = {
  UNICO: 'unico',
  MENSUAL: 'mensual',
  TRIMESTRAL: 'trimestral',
  SEMESTRAL: 'semestral',
  ANUAL: 'anual',
  BIANUAL: 'bianual'
};

const TipoEconomico = {
  COMPRA: 'compra',
  VENTA: 'venta',
  INGRESO: 'ingreso',
  EGRESO: 'egreso'
};

const EstadoContrato = {
  BORRADOR: 'borrador',
  REVISION: 'revision',
  APROBADO: 'aprobado',
  ACTIVO: 'activo',
  VENCIDO: 'vencido',
  CANCELADO: 'cancelado',
  RENOVADO: 'renovado'
};

const AccionAuditoria = {
  CREACION: 'creacion',
  MODIFICACION: 'modificacion',
  VISUALIZACION: 'visualizacion',
  DESCARGA: 'descarga',
  ELIMINACION: 'eliminacion',
  CAMBIO_ESTADO: 'cambio_estado',
  SUBIDA_DOCUMENTO: 'subida_documento',
  APROBACION: 'aprobacion',
  RECHAZO: 'rechazo'
};

// Datos de ejemplo
const contratosEjemplo = [
  {
    titulo: "Desarrollo de Sistema ERP",
    descripcion: "Desarrollo e implementación de sistema de planificación de recursos empresariales para gestión integral de la organización",
    contraparte: "TechSolutions SpA",
    fechaInicio: new Date('2024-01-15'),
    fechaTermino: new Date('2024-12-15'),
    monto: 85000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/erp-desarrollo.pdf',
    categoria: CategoriaContrato.SERVICIOS,
    periodicidad: Periodicidad.UNICO,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Sistema ERP',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'MEIK LABS',
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
    fechaInicio: new Date('2025-01-01'),
    fechaTermino: new Date('2025-12-31'),
    monto: 12000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/erp-licencias.pdf',
    categoria: CategoriaContrato.SERVICIOS,
    periodicidad: Periodicidad.ANUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Sistema ERP',
    estado: EstadoContrato.APROBADO,
    organizacionId: 'MEIK LABS',
    departamento: 'Tecnología',
    responsableId: 'user-001',
    documentoNombre: 'contrato-erp-licencias.pdf',
    documentoTamaño: 1200000,
    etiquetas: ['licencias', 'erp', 'software', 'anual']
  },
  {
    titulo: "Arrendamiento Oficina Principal",
    descripcion: "Contrato de arrendamiento para nueva sede principal en Las Condes, 500m2",
    contraparte: "Inmobiliaria Del Centro Ltda",
    fechaInicio: new Date('2024-03-01'),
    fechaTermino: new Date('2027-02-28'),
    monto: 3500000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/arrendamiento-oficina.pdf',
    categoria: CategoriaContrato.ARRENDAMIENTO,
    periodicidad: Periodicidad.MENSUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Expansión Oficinas',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'MEIK LABS',
    departamento: 'Administración',
    responsableId: 'user-002',
    documentoNombre: 'arrendamiento-oficina-principal.pdf',
    documentoTamaño: 3200000,
    etiquetas: ['arrendamiento', 'oficina', 'las-condes', 'sede']
  },
  {
    titulo: "Mobiliario y Equipamiento",
    descripcion: "Suministro e instalación de mobiliario de oficina y equipamiento tecnológico",
    contraparte: "Muebles Corporativos SA",
    fechaInicio: new Date('2024-04-15'),
    fechaTermino: new Date('2024-06-15'),
    monto: 25000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/mobiliario.pdf',
    categoria: CategoriaContrato.COMPRAS,
    periodicidad: Periodicidad.UNICO,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Expansión Oficinas',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'MEIK LABS',
    departamento: 'Administración',
    responsableId: 'user-002',
    documentoNombre: 'contrato-mobiliario.pdf',
    documentoTamaño: 1800000,
    etiquetas: ['mobiliario', 'equipamiento', 'oficina', 'suministro']
  },
  {
    titulo: "Campaña Publicitaria Digital",
    descripcion: "Diseño y ejecución de campaña publicitaria digital en redes sociales y Google Ads",
    contraparte: "Agencia Creativa Digital",
    fechaInicio: new Date('2024-06-01'),
    fechaTermino: new Date('2024-12-31'),
    monto: 18000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/marketing-digital.pdf',
    categoria: CategoriaContrato.SERVICIOS,
    periodicidad: Periodicidad.MENSUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Marketing Digital',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'MEIK LABS',
    departamento: 'Marketing',
    responsableId: 'user-003',
    documentoNombre: 'campaña-digital.pdf',
    documentoTamaño: 2100000,
    etiquetas: ['marketing', 'digital', 'redes-sociales', 'publicidad']
  },
  {
    titulo: "Consultoría en Gestión del Talento",
    descripcion: "Servicios de consultoría para implementación de sistema de gestión del talento y evaluación de desempeño",
    contraparte: "HR Consulting Group",
    fechaInicio: new Date('2024-08-01'),
    fechaTermino: new Date('2025-01-31'),
    monto: 15000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/consultoria-rrhh.pdf',
    categoria: CategoriaContrato.CONSULTORIA,
    periodicidad: Periodicidad.MENSUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Recursos Humanos',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'MEIK LABS',
    departamento: 'Recursos Humanos',
    responsableId: 'user-004',
    documentoNombre: 'consultoria-talento.pdf',
    documentoTamaño: 2800000,
    etiquetas: ['consultoria', 'rrhh', 'talento', 'evaluación']
  },
  {
    titulo: "Contrato Gerente de Ventas",
    descripcion: "Contrato de trabajo indefinido para Gerente de Ventas",
    contraparte: "María González Pérez",
    fechaInicio: new Date('2024-09-01'),
    fechaTermino: new Date('2026-08-31'),
    monto: 2800000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/gerente-ventas.pdf',
    categoria: CategoriaContrato.LABORAL,
    periodicidad: Periodicidad.MENSUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Recursos Humanos',
    estado: EstadoContrato.ACTIVO,
    organizacionId: 'MEIK LABS',
    departamento: 'Recursos Humanos',
    responsableId: 'user-004',
    documentoNombre: 'contrato-gerente-ventas.pdf',
    documentoTamaño: 1500000,
    etiquetas: ['laboral', 'gerente', 'ventas', 'indefinido']
  },
  {
    titulo: "Mantenimiento de Equipos Informáticos",
    descripcion: "Servicio de mantenimiento preventivo y correctivo de equipos informáticos",
    contraparte: "IT Support Solutions",
    fechaInicio: new Date('2024-12-01'),
    fechaTermino: new Date('2025-11-30'),
    monto: 6000000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/mantenimiento-it.pdf',
    categoria: CategoriaContrato.MANTENIMIENTO,
    periodicidad: Periodicidad.MENSUAL,
    tipo: TipoEconomico.EGRESO,
    proyecto: 'Mantenimiento y Soporte',
    estado: EstadoContrato.BORRADOR,
    organizacionId: 'MEIK LABS',
    departamento: 'Tecnología',
    responsableId: 'user-001',
    documentoNombre: 'mantenimiento-equipos.pdf',
    documentoTamaño: 1700000,
    etiquetas: ['mantenimiento', 'it', 'equipos', 'soporte']
  }
];

// Función para generar fecha de creación realista
function generarFechaCreacion(fechaInicio) {
  const diasAntes = Math.floor(Math.random() * 30) + 15; // Entre 15 y 45 días antes
  const fechaCreacion = new Date(fechaInicio);
  fechaCreacion.setDate(fechaCreacion.getDate() - diasAntes);
  return fechaCreacion;
}

// Función principal para poblar la base de datos
async function poblarBaseDatos() {
  try {
    console.log('🚀 Iniciando población de base de datos...');
    console.log(`📊 Total de contratos a crear: ${contratosEjemplo.length}`);
    
    const contractosCreados = [];
    let exitosos = 0;
    let errores = 0;
    
    for (let i = 0; i < contratosEjemplo.length; i++) {
      const contratoEjemplo = contratosEjemplo[i];
      
      try {
        console.log(`\n⏳ Procesando ${i + 1}/${contratosEjemplo.length}: ${contratoEjemplo.titulo}`);
        
        // Generar datos adicionales
        const fechaCreacion = generarFechaCreacion(contratoEjemplo.fechaInicio);
        
        // Crear el contrato completo
        const contratoCompleto = {
          ...contratoEjemplo,
          fechaCreacion,
          version: 1,
          metadatos: {
            creadoPor: 'script-poblacion',
            fechaUltimaModificacion: fechaCreacion,
            origen: 'datos-ejemplo'
          },
          auditoria: []
        };

        // Convertir fechas a Timestamp para Firestore
        const contratoParaFirestore = {
          ...contratoCompleto,
          fechaCreacion: Timestamp.fromDate(contratoCompleto.fechaCreacion),
          fechaInicio: Timestamp.fromDate(contratoCompleto.fechaInicio),
          fechaTermino: Timestamp.fromDate(contratoCompleto.fechaTermino)
        };

        // Agregar a Firestore
        const docRef = await addDoc(collection(db, 'contratos'), contratoParaFirestore);
        
        // Crear registro de auditoría
        const registroAuditoria = {
          contratoId: docRef.id,
          usuarioId: 'system',
          accion: AccionAuditoria.CREACION,
          descripcion: `Contrato "${contratoCompleto.titulo}" creado automáticamente`,
          fecha: Timestamp.fromDate(fechaCreacion),
          metadatos: { 
            origen: 'script-poblacion',
            proyecto: contratoCompleto.proyecto,
            categoria: contratoCompleto.categoria
          }
        };

        await addDoc(collection(db, 'registros_auditoria'), registroAuditoria);

        contractosCreados.push({
          id: docRef.id,
          titulo: contratoCompleto.titulo,
          proyecto: contratoCompleto.proyecto
        });

        exitosos++;
        console.log(`✅ Creado: ${contratoCompleto.titulo} (${contratoCompleto.proyecto})`);

      } catch (error) {
        errores++;
        console.error(`❌ Error creando contrato ${contratoEjemplo.titulo}:`, error.message);
      }
    }

    console.log('\n🎉 ¡Población completada!');
    console.log(`📈 Resultados:`);
    console.log(`   • Total procesados: ${contratosEjemplo.length}`);
    console.log(`   • Exitosos: ${exitosos}`);
    console.log(`   • Errores: ${errores}`);
    
    // Resumen por proyecto
    const proyectos = contractosCreados.reduce((acc, contrato) => {
      acc[contrato.proyecto] = (acc[contrato.proyecto] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📋 Resumen por proyecto:');
    Object.entries(proyectos).forEach(([proyecto, cantidad]) => {
      console.log(`   • ${proyecto}: ${cantidad} contratos`);
    });

    return contractosCreados;

  } catch (error) {
    console.error('💥 Error fatal al poblar la base de datos:', error);
    throw error;
  }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  poblarBaseDatos()
    .then(() => {
      console.log('\n✅ Script ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en la ejecución:', error);
      process.exit(1);
    });
}

export { poblarBaseDatos };
