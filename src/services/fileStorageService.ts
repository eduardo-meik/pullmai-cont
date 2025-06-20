import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'
import { v4 as uuidv4 } from 'uuid'

export interface FileUploadResult {
  url: string
  fileName: string
  fileSize: number
  filePath: string
}

export interface FileUploadProgress {
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

export class FileStorageService {
  
  /**
   * Sube un archivo PDF a Firebase Storage
   */
  static async uploadContractPDF(
    file: File,
    contractId: string,
    organizationId: string,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult> {
    
    // Validar que es un PDF
    if (file.type !== 'application/pdf') {
      throw new Error('Solo se permiten archivos PDF')
    }
    
    // Validar tamaño (10MB máximo)
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      throw new Error('El archivo es demasiado grande. Máximo 10MB permitido.')
    }
    
    try {
      onProgress?.({ progress: 0, status: 'uploading' })
      
      // Generar nombre único para el archivo
      const fileExtension = file.name.split('.').pop()
      const uniqueFileName = `${contractId}_${uuidv4()}.${fileExtension}`
      
      // Crear referencia en Storage
      const filePath = `contracts/${organizationId}/${contractId}/${uniqueFileName}`
      const fileRef = ref(storage, filePath)
      
      onProgress?.({ progress: 25, status: 'uploading' })
      
      // Subir archivo
      const snapshot = await uploadBytes(fileRef, file)
      
      onProgress?.({ progress: 75, status: 'uploading' })
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      onProgress?.({ progress: 100, status: 'completed' })
      
      return {
        url: downloadURL,
        fileName: file.name,
        fileSize: file.size,
        filePath: filePath
      }
      
    } catch (error) {
      console.error('Error uploading file:', error)
      onProgress?.({ 
        progress: 0, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
      throw error
    }
  }
  
  /**
   * Elimina un archivo del Storage
   */
  static async deleteContractPDF(filePath: string): Promise<void> {
    try {
      const fileRef = ref(storage, filePath)
      await deleteObject(fileRef)
      console.log('File deleted successfully:', filePath)
    } catch (error) {
      console.error('Error deleting file:', error)
      throw new Error(`Error al eliminar archivo: ${error}`)
    }
  }
  
  /**
   * Reemplaza un archivo existente
   */
  static async replaceContractPDF(
    newFile: File,
    contractId: string,
    organizationId: string,
    oldFilePath?: string,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult> {
    
    try {
      // Subir nuevo archivo
      const uploadResult = await this.uploadContractPDF(
        newFile, 
        contractId, 
        organizationId, 
        onProgress
      )
      
      // Eliminar archivo anterior si existe
      if (oldFilePath) {
        try {
          await this.deleteContractPDF(oldFilePath)
        } catch (error) {
          console.warn('Could not delete old file:', error)
          // No fallar si no se puede eliminar el archivo anterior
        }
      }
      
      return uploadResult
      
    } catch (error) {
      console.error('Error replacing file:', error)
      throw error
    }
  }
  
  /**
   * Valida un archivo antes de subirlo
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Solo se permiten archivos PDF' }
    }
    
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      return { valid: false, error: 'El archivo es demasiado grande. Máximo 10MB.' }
    }
    
    if (file.size === 0) {
      return { valid: false, error: 'El archivo está vacío' }
    }
    
    return { valid: true }
  }
  
  /**
   * Obtiene información de un archivo
   */
  static getFileInfo(file: File) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      sizeFormatted: this.formatFileSize(file.size)
    }
  }
  
  /**
   * Formatea el tamaño de archivo para mostrar
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export default FileStorageService
