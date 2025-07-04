import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import { Contrato, FormularioContrato, FiltrosContrato, RegistroAuditoria, AccionAuditoria } from '../types'
import { ContraparteAutoCreationService } from './contraparteAutoCreationService'

// Custom error for contract already linked to another project
export class ContratoYaVinculadoError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContratoYaVinculadoError'
  }
}

export class ContractService {
  private static instance: ContractService
  private readonly collection = 'contratos'
  private readonly auditCollection = 'registros_auditoria'

  static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService()
    }
    return ContractService.instance
  }

  async getContratos(
    organizacionId: string,
    filtros?: FiltrosContrato,
    pageSize = 20,
    lastDoc?: any
  ): Promise<{ contratos: Contrato[]; hasMore: boolean; lastDoc: any }> {
    try {
      let q = query(
        collection(db, this.collection),
        where('organizacionId', '==', organizacionId),
        orderBy('fechaCreacion', 'desc')
      )      // Aplicar filtros
      if (filtros?.estado?.length) {
        q = query(q, where('estado', 'in', filtros.estado))
      }

      if (filtros?.categoria?.length) {
        q = query(q, where('categoria', 'in', filtros.categoria))
      }

      if (filtros?.tipo?.length) {
        q = query(q, where('tipo', 'in', filtros.tipo))
      }

      if (filtros?.periodicidad?.length) {
        q = query(q, where('periodicidad', 'in', filtros.periodicidad))
      }

      if (filtros?.proyecto) {
        q = query(q, where('proyecto', '==', filtros.proyecto))
      }

      if (filtros?.departamento) {
        q = query(q, where('departamento', '==', filtros.departamento))
      }

      if (filtros?.responsable) {
        q = query(q, where('responsableId', '==', filtros.responsable))
      }

      // Paginación
      q = query(q, limit(pageSize))
      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }      const snapshot = await getDocs(q)
      const contratos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate(),
        fechaInicio: doc.data().fechaInicio?.toDate(),
        fechaTermino: doc.data().fechaTermino?.toDate()
      })) as Contrato[]

      const hasMore = snapshot.docs.length === pageSize
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1]

      return { contratos, hasMore, lastDoc: newLastDoc }
    } catch (error) {
      console.error('Error al obtener contratos:', error)
      throw new Error('Error al cargar los contratos')
    }
  }

  async getContrato(id: string): Promise<Contrato | null> {
    try {
      const docRef = doc(db, this.collection, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        fechaCreacion: data.fechaCreacion?.toDate(),
        fechaInicio: data.fechaInicio?.toDate(),
        fechaTermino: data.fechaTermino?.toDate()
      } as Contrato
    } catch (error) {
      console.error('Error al obtener contrato:', error)
      throw new Error('Error al cargar el contrato')
    }
  }
  async crearContrato(
    formulario: FormularioContrato,
    organizacionId: string,
    usuarioId: string
  ): Promise<string> {
    try {
      console.log('Creating contract with:', { organizacionId, usuarioId })
      
      // Check if user is authenticated
      const { currentUser } = await import('../firebase').then(m => ({ currentUser: m.auth.currentUser }))
      if (!currentUser) {
        throw new Error('Usuario no autenticado')
      }
      console.log('User authenticated:', currentUser.uid)
      
      const batch = writeBatch(db)
      
      // Auto-create contraparte organization if contraparte name is provided
      let contraparteId = formulario.contraparteId || ''
      
      if (formulario.contraparte && formulario.contraparte.trim() !== '') {
        try {
          console.log('Auto-creating contraparte organization for:', formulario.contraparte)
          contraparteId = await ContraparteAutoCreationService.getOrCreateContraparte(
            formulario.contraparte,
            usuarioId
          )
          console.log('Contraparte organization ID:', contraparteId)
          
          // Link contraparte to user for future access
          await ContraparteAutoCreationService.linkContraparteToUser(usuarioId, contraparteId, 'read')
        } catch (contraparteError) {
          console.warn('Error creating contraparte organization, continuing with contract creation:', contraparteError)
          // Don't fail contract creation if contraparte creation fails
        }
      }
      
      // Subir documento si existe
      let pdfUrl = ''
      let documentoNombre = ''
      let documentoTamaño = 0

      if (formulario.documento) {        console.log('Uploading document:', formulario.documento.name, 'for organization:', organizacionId)
        
        // Validate file size (limit to 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (formulario.documento.size > maxSize) {
          throw new Error(`El archivo es demasiado grande. Tamaño máximo permitido: 10MB`)
        }
        
        // Use organization ID with safe encoding for path
        const safeOrgId = organizacionId?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '_') || 'default_org'
        const documentoPath = `contracts/${safeOrgId}/contract_${Date.now()}`
        console.log('Upload path:', documentoPath)
        
        const documentoRef = ref(storage, documentoPath)
        
        try {
          console.log('Upload attempt details:', {
            originalOrgId: organizacionId,
            safeOrgId,
            path: documentoPath,
            fileSize: formulario.documento.size,
            fileType: formulario.documento.type
          })
          await uploadBytes(documentoRef, formulario.documento)
          // Store the relative path instead of the full download URL
          pdfUrl = documentoPath 
          documentoNombre = formulario.documento.name
          documentoTamaño = formulario.documento.size
          console.log('Document uploaded successfully, path stored:', pdfUrl)
        } catch (uploadError) {
          console.error('Error uploading document:', uploadError)
          throw new Error(`Error al subir el documento: ${uploadError instanceof Error ? uploadError.message : 'Error desconocido'}`)        }
      }

      // Crear contrato
      const contratoRef = doc(collection(db, this.collection))
      const contratoData: Omit<Contrato, 'id'> = {
        titulo: formulario.titulo,
        descripcion: formulario.descripcion,
        contraparte: formulario.contraparte,
        contraparteId: contraparteId, // Use the auto-created contraparte ID
        fechaInicio: new Date(formulario.fechaInicio),
        fechaTermino: new Date(formulario.fechaTermino),
        monto: formulario.monto,
        moneda: formulario.moneda,
        pdfUrl,
        categoria: formulario.categoria,
        periodicidad: formulario.periodicidad,
        tipo: formulario.tipo,
        proyecto: formulario.proyecto,
        proyectoId: formulario.proyectoId,
        estado: 'borrador' as any,
        fechaCreacion: new Date(),
        organizacionId,
        departamento: formulario.departamento,
        responsableId: usuarioId,
        documentoNombre,
        documentoTamaño,
        version: 1,
        etiquetas: formulario.etiquetas,
        metadatos: {},
        auditoria: []
      }

      batch.set(contratoRef, {
        ...contratoData,
        fechaCreacion: Timestamp.fromDate(contratoData.fechaCreacion),
        fechaInicio: Timestamp.fromDate(contratoData.fechaInicio),
        fechaTermino: Timestamp.fromDate(contratoData.fechaTermino)
      })

      // Crear registro de auditoría
      const auditoriaRef = doc(collection(db, this.auditCollection))
      const auditoriaData: Omit<RegistroAuditoria, 'id'> = {
        contratoId: contratoRef.id,
        usuarioId,
        accion: AccionAuditoria.CREACION,
        descripcion: `Contrato "${formulario.titulo}" creado`,
        fecha: new Date(),
        metadatos: { categoria: formulario.categoria, tipo: formulario.tipo }
      }

      batch.set(auditoriaRef, {
        ...auditoriaData,
        fecha: Timestamp.fromDate(auditoriaData.fecha)
      })

      await batch.commit()
      return contratoRef.id
    } catch (error) {
      console.error('Error al crear contrato:', error)
      throw new Error('Error al crear el contrato')
    }
  }

  async actualizarContrato(
    id: string,
    updates: Partial<Contrato>,
    usuarioId: string
  ): Promise<void> {
    try {
      // Check if trying to link to a project
      if (updates.proyectoId && updates.proyectoId !== '') {
        const current = await this.getContrato(id)
        if (current && current.proyectoId && current.proyectoId !== updates.proyectoId && current.proyectoId !== '') {
          throw new ContratoYaVinculadoError('El contrato ya está vinculado a otro proyecto.')
        }
      }
      const batch = writeBatch(db)
      const contratoRef = doc(db, this.collection, id)
      const updateData = { ...updates }      // Convertir fechas a Timestamp
      if (updateData.fechaInicio) {
        updateData.fechaInicio = Timestamp.fromDate(updateData.fechaInicio) as any
      }
      if (updateData.fechaTermino) {
        updateData.fechaTermino = Timestamp.fromDate(updateData.fechaTermino) as any
      }
      batch.update(contratoRef, updateData)
      // Crear registro de auditoría
      const auditoriaRef = doc(collection(db, this.auditCollection))
      const auditoriaData: Omit<RegistroAuditoria, 'id'> = {
        contratoId: id,
        usuarioId,
        accion: AccionAuditoria.MODIFICACION,
        descripcion: 'Contrato actualizado',
        fecha: new Date(),
        metadatos: { campos: Object.keys(updates) }
      }
      batch.set(auditoriaRef, {
        ...auditoriaData,
        fecha: Timestamp.fromDate(auditoriaData.fecha)
      })
      await batch.commit()
    } catch (error) {
      if (error instanceof ContratoYaVinculadoError) {
        throw error
      }
      console.error('Error al actualizar contrato:', error)
      throw new Error('Error al actualizar el contrato')
    }
  }

  async eliminarContrato(id: string, usuarioId: string): Promise<void> {
    try {
      const batch = writeBatch(db)
        // Obtener contrato para eliminar documento
      const contrato = await this.getContrato(id)
      if (contrato?.pdfUrl) {
        const documentoRef = ref(storage, contrato.pdfUrl)
        await deleteObject(documentoRef)
      }

      // Eliminar contrato
      const contratoRef = doc(db, this.collection, id)
      batch.delete(contratoRef)

      // Crear registro de auditoría
      const auditoriaRef = doc(collection(db, this.auditCollection))
      const auditoriaData: Omit<RegistroAuditoria, 'id'> = {
        contratoId: id,
        usuarioId,
        accion: AccionAuditoria.ELIMINACION,
        descripcion: `Contrato "${contrato?.titulo}" eliminado`,
        fecha: new Date()
      }

      batch.set(auditoriaRef, {
        ...auditoriaData,
        fecha: Timestamp.fromDate(auditoriaData.fecha)
      })

      await batch.commit()
    } catch (error) {
      console.error('Error al eliminar contrato:', error)
      throw new Error('Error al eliminar el contrato')
    }
  }

  async buscarContratos(
    organizacionId: string,
    termino: string,
    filtros?: FiltrosContrato
  ): Promise<Contrato[]> {
    try {
      // Implementar búsqueda de texto completo
      // Por ahora, búsqueda simple por título
      let q = query(
        collection(db, this.collection),
        where('organizacionId', '==', organizacionId),        orderBy('fechaCreacion', 'desc')
      )

      const snapshot = await getDocs(q)
      const contratos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate(),
        fechaInicio: doc.data().fechaInicio?.toDate(),
        fechaTermino: doc.data().fechaTermino?.toDate()
      })) as Contrato[]

      // Filtrar por término de búsqueda
      return contratos.filter(contrato =>
        contrato.titulo.toLowerCase().includes(termino.toLowerCase()) ||
        contrato.descripcion.toLowerCase().includes(termino.toLowerCase())
      )
    } catch (error) {
      console.error('Error en búsqueda:', error)
      throw new Error('Error al buscar contratos')
    }
  }

  async registrarAcceso(contratoId: string, usuarioId: string): Promise<void> {
    try {
      const auditoriaRef = doc(collection(db, this.auditCollection))
      const auditoriaData: Omit<RegistroAuditoria, 'id'> = {
        contratoId,
        usuarioId,
        accion: AccionAuditoria.VISUALIZACION,
        descripcion: 'Contrato visualizado',
        fecha: new Date()
      }

      await addDoc(collection(db, this.auditCollection), {
        ...auditoriaData,
        fecha: Timestamp.fromDate(auditoriaData.fecha)
      })
    } catch (error) {
      console.error('Error al registrar acceso:', error)
    }
  }

  async desvincularContratoDeProyecto(id: string): Promise<void> {
    try {
      const contratoRef = doc(db, this.collection, id)
      await updateDoc(contratoRef, {
        proyectoId: '',
        proyecto: '',
        fechaUltimaModificacion: new Date(),
      })
    } catch (error) {
      console.error('Error al desvincular contrato del proyecto:', error)
      throw new Error('Error al desvincular el contrato del proyecto')
    }
  }
}

export const contractService = ContractService.getInstance()