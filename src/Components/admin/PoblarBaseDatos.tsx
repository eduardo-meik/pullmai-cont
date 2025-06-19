import React, { useState } from 'react'
import { collection, addDoc, Timestamp, getDocs, query, where, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { contratosEjemplo, generarFechaCreacion } from '../../data/contratosEjemplo'
import { Contrato, RegistroAuditoria, AccionAuditoria } from '../../types'
import Button from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'

interface PoblacionStats {
  total: number
  exitosos: number
  errores: number
  proyectos: Record<string, number>
}

const PoblarBaseDatos: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<PoblacionStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const verificarContratosExistentes = async (): Promise<boolean> => {
    try {
      const q = query(
        collection(db, 'contratos'),
        where('metadatos.origen', '==', 'datos-ejemplo')
      )
      const snapshot = await getDocs(q)
      return snapshot.size > 0
    } catch (error) {
      console.error('Error verificando contratos existentes:', error)
      return false
    }
  }

  const poblarBaseDatos = async () => {
    if (!currentUser) {
      setError('Debes estar autenticado para poblar la base de datos')
      return
    }

    setIsLoading(true)
    setError(null)
    setStats(null)

    try {
      // Verificar si ya existen contratos de ejemplo
      const existenContratos = await verificarContratosExistentes()
      if (existenContratos) {
        setError('Ya existen contratos de ejemplo en la base de datos. Elimínalos primero si deseas crear nuevos.')
        setIsLoading(false)
        return
      }

      const estadisticas: PoblacionStats = {
        total: contratosEjemplo.length,
        exitosos: 0,
        errores: 0,
        proyectos: {}
      }

      for (const contratoEjemplo of contratosEjemplo) {
        try {
          // Generar datos adicionales
          const fechaCreacion = generarFechaCreacion(contratoEjemplo.fechaInicio)
          
          // Usar la organización del usuario actual
          const contratoCompleto: Omit<Contrato, 'id'> = {
            ...contratoEjemplo,
            organizacionId: (currentUser as any).organizacion || 'org-001',
            fechaCreacion,
            version: 1,
            metadatos: {
              creadoPor: currentUser.uid,
              fechaUltimaModificacion: fechaCreacion,
              origen: 'datos-ejemplo',
              usuarioCreador: currentUser.displayName || currentUser.email
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
            usuarioId: currentUser.uid,
            accion: AccionAuditoria.CREACION,
            descripcion: `Contrato de ejemplo "${contratoCompleto.titulo}" creado`,
            fecha: fechaCreacion,
            metadatos: { 
              origen: 'datos-ejemplo',
              proyecto: contratoCompleto.proyecto,
              categoria: contratoCompleto.categoria
            }
          }

          await addDoc(collection(db, 'registros_auditoria'), {
            ...registroAuditoria,
            fecha: Timestamp.fromDate(registroAuditoria.fecha)
          })

          estadisticas.exitosos++
          estadisticas.proyectos[contratoCompleto.proyecto] = 
            (estadisticas.proyectos[contratoCompleto.proyecto] || 0) + 1

        } catch (error) {
          console.error(`Error creando contrato ${contratoEjemplo.titulo}:`, error)
          estadisticas.errores++
        }
      }

      setStats(estadisticas)
    } catch (error) {
      console.error('Error poblando base de datos:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const limpiarDatosEjemplo = async () => {
    if (!currentUser) {
      setError('Debes estar autenticado para limpiar la base de datos')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Obtener contratos de ejemplo
      const q = query(
        collection(db, 'contratos'),        where('metadatos.origen', '==', 'datos-ejemplo')
      )
      const snapshot = await getDocs(q)
      
      let eliminados = 0
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref)
        eliminados++
      }

      // También limpiar registros de auditoría relacionados
      const auditQuery = query(
        collection(db, 'registros_auditoria'),
        where('metadatos.origen', '==', 'datos-ejemplo')
      )
      const auditSnapshot = await getDocs(auditQuery)
      
      for (const doc of auditSnapshot.docs) {
        await deleteDoc(doc.ref)
      }

      setStats(null)
      alert(`Se eliminaron ${eliminados} contratos de ejemplo y sus registros de auditoría`)
    } catch (error) {
      console.error('Error limpiando datos:', error)
      setError(error instanceof Error ? error.message : 'Error al limpiar datos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Poblar Base de Datos con Ejemplos
        </h2>
        <p className="text-gray-600">
          Agrega contratos de ejemplo para probar el sistema. Incluye {contratosEjemplo.length} contratos 
          distribuidos en diferentes proyectos y categorías.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {stats && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-semibold text-green-800 mb-2">✅ Población Completada</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Total procesados:</strong> {stats.total}</p>
              <p><strong>Exitosos:</strong> {stats.exitosos}</p>
              <p><strong>Errores:</strong> {stats.errores}</p>
            </div>
            <div>
              <p><strong>Proyectos creados:</strong></p>
              <ul className="list-disc list-inside mt-1">
                {Object.entries(stats.proyectos).map(([proyecto, cantidad]) => (
                  <li key={proyecto} className="text-xs">
                    {proyecto}: {cantidad} contratos
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <Button
          onClick={poblarBaseDatos}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Poblando...' : 'Poblar Base de Datos'}
        </Button>

        <Button
          onClick={limpiarDatosEjemplo}
          disabled={isLoading}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          {isLoading ? 'Limpiando...' : 'Limpiar Datos de Ejemplo'}
        </Button>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <h4 className="font-medium mb-2">Los contratos de ejemplo incluyen:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Sistema ERP:</strong> Desarrollo e implementación</li>
          <li><strong>Expansión Oficinas:</strong> Arrendamiento y mobiliario</li>
          <li><strong>Marketing Digital:</strong> Campañas y contenido</li>
          <li><strong>Recursos Humanos:</strong> Consultoría y contratos laborales</li>
          <li><strong>Ventas Internacionales:</strong> Distribución y traducción</li>
          <li><strong>Mantenimiento y Soporte:</strong> IT y suministros</li>
          <li><strong>Auditoría y Compliance:</strong> Servicios profesionales</li>
        </ul>
      </div>
    </div>
  )
}

export default PoblarBaseDatos
