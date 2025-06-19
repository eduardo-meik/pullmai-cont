import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { contratosEjemplo, generarFechaCreacion } from '../data/contratosEjemplo'
import { Contrato, RegistroAuditoria, AccionAuditoria } from '../types'

// Función para poblar la base de datos con contratos de ejemplo
export const poblarBaseDatos = async () => {
  try {
    console.log('Iniciando población de base de datos...')
    
    const contractosCreados = []
    
    for (const contratoEjemplo of contratosEjemplo) {
      // Generar datos adicionales
      const fechaCreacion = generarFechaCreacion(contratoEjemplo.fechaInicio)
      
      // Crear el contrato completo
      const contratoCompleto: Omit<Contrato, 'id'> = {
        ...contratoEjemplo,
        fechaCreacion,
        version: 1,
        metadatos: {
          creadoPor: 'script-poblacion',
          fechaUltimaModificacion: fechaCreacion,
          origen: 'datos-ejemplo'
        },
        auditoria: []
      }

      // Convertir fechas a Timestamp para Firestore
      const contratoParaFirestore = {
        ...contratoCompleto,
        fechaCreacion: Timestamp.fromDate(contratoCompleto.fechaCreacion),
        fechaInicio: Timestamp.fromDate(contratoCompleto.fechaInicio),
        fechaTermino: Timestamp.fromDate(contratoCompleto.fechaTermino)
      }

      // Agregar a Firestore
      const docRef = await addDoc(collection(db, 'contratos'), contratoParaFirestore)
      
      // Crear registro de auditoría
      const registroAuditoria: Omit<RegistroAuditoria, 'id'> = {
        contratoId: docRef.id,
        usuarioId: 'system',
        accion: AccionAuditoria.CREACION,
        descripcion: `Contrato "${contratoCompleto.titulo}" creado automáticamente`,
        fecha: fechaCreacion,
        metadatos: { 
          origen: 'script-poblacion',
          proyecto: contratoCompleto.proyecto,
          categoria: contratoCompleto.categoria
        }
      }

      await addDoc(collection(db, 'registros_auditoria'), {
        ...registroAuditoria,
        fecha: Timestamp.fromDate(registroAuditoria.fecha)
      })

      contractosCreados.push({
        id: docRef.id,
        titulo: contratoCompleto.titulo,
        proyecto: contratoCompleto.proyecto
      })

      console.log(`✅ Creado contrato: ${contratoCompleto.titulo} (Proyecto: ${contratoCompleto.proyecto})`)
    }

    console.log(`\n🎉 ¡Población completada exitosamente!`)
    console.log(`📊 Total de contratos creados: ${contractosCreados.length}`)
    
    // Resumen por proyecto
    const proyectos = contractosCreados.reduce((acc, contrato) => {
      acc[contrato.proyecto] = (acc[contrato.proyecto] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('\n📋 Resumen por proyecto:')
    Object.entries(proyectos).forEach(([proyecto, cantidad]) => {
      console.log(`   • ${proyecto}: ${cantidad} contratos`)
    })

    return contractosCreados

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error)
    throw error
  }
}

// Función para ejecutar el script desde línea de comandos
if (require.main === module) {
  poblarBaseDatos()
    .then(() => {
      console.log('✅ Script ejecutado exitosamente')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error en la ejecución:', error)
      process.exit(1)
    })
}
