import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  DocumentArrowUpIcon,
  CheckCircleIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import { FormularioContrato, CategoriaContrato, TipoEconomico, Periodicidad, EstadoContrato, Proyecto } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ProjectSelect from '../projects/ProjectSelect'
import FileStorageService, { FileUploadProgress } from '../../services/fileStorageService'
import { contractService } from '../../services/contractService'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthStore } from '../../stores/authStore'

interface ContractFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  contractToEdit?: FormularioContrato | null
}

const ContractForm: React.FC<ContractFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  contractToEdit
}) => {
  const { showToast } = useToast()
  const { currentUser } = useAuth()
  const { usuario } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress | null>(null)
  
  const [formData, setFormData] = useState<FormularioContrato>({
    titulo: contractToEdit?.titulo || '',
    descripcion: contractToEdit?.descripcion || '',
    contraparte: contractToEdit?.contraparte || '',
    fechaInicio: contractToEdit?.fechaInicio || '',
    fechaTermino: contractToEdit?.fechaTermino || '',
    monto: contractToEdit?.monto || 0,
    moneda: contractToEdit?.moneda || 'CLP',
    categoria: contractToEdit?.categoria || CategoriaContrato.SERVICIOS,
    periodicidad: contractToEdit?.periodicidad || Periodicidad.UNICO,
    tipo: contractToEdit?.tipo || TipoEconomico.EGRESO,
    proyecto: contractToEdit?.proyecto || '',
    proyectoId: contractToEdit?.proyectoId || '',
    estado: contractToEdit?.estado || EstadoContrato.BORRADOR,
    departamento: contractToEdit?.departamento || '',
    etiquetas: contractToEdit?.etiquetas || []
  })

  // Dropzone para archivos PDF
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file)
      showToast('PDF cargado correctamente', 'success')
    } else {
      showToast('Por favor, selecciona un archivo PDF válido', 'error')
    }
  }, [showToast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 10485760 // 10MB
  })
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadedFile && !contractToEdit) {
      showToast('Por favor, carga un archivo PDF', 'error')
      return
    }

    if (!currentUser) {
      showToast('Usuario no autenticado', 'error')
      return
    }

    try {
      setLoading(true)
      setUploadProgress({ progress: 0, status: 'uploading' })      // Handle file metadata (upload will be handled by contractService)
      let fileUrl = ''
      let fileName = uploadedFile?.name || 'documento.pdf'
      let fileSize = uploadedFile?.size || 0
      
      // Note: File upload is handled by contractService.crearContrato method
      // No duplicate upload needed here
      
      // Save the contract data to the database
      const contractData = {
        ...formData,
        pdfUrl: fileUrl,
        documentoNombre: fileName,
        documentoTamaño: fileSize,
        organizacionId: usuario?.organizacionId || 'default-org',
        usuarioCreadorId: currentUser?.uid || '',
        fechaCreacion: new Date(),
        fechaUltimaModificacion: new Date()
      }
        console.log('Saving contract to database:', contractData)
        if (contractToEdit && 'id' in contractToEdit) {
        // Update existing contract - convert string dates to Date objects
        const updateData = {
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          contraparte: formData.contraparte,
          fechaInicio: new Date(formData.fechaInicio),
          fechaTermino: new Date(formData.fechaTermino),
          monto: formData.monto,
          moneda: formData.moneda,
          categoria: formData.categoria,
          periodicidad: formData.periodicidad,
          tipo: formData.tipo,
          proyecto: formData.proyecto,
          proyectoId: formData.proyectoId,
          estado: formData.estado,
          departamento: formData.departamento,
          etiquetas: formData.etiquetas,
          pdfUrl: fileUrl,
          documentoNombre: fileName,
          documentoTamaño: fileSize,
          fechaUltimaModificacion: new Date()
        }
        await contractService.actualizarContrato((contractToEdit as any).id, updateData, currentUser?.uid || '')      } else {
        // Create new contract - pass the file directly so the service can handle upload
        console.log('Creating new contract with organization:', usuario?.organizacionId)
        console.log('Current user:', currentUser?.uid)
        console.log('Upload file present:', !!uploadedFile)
        
        const contratoCompleto = {
          ...formData,
          documento: uploadedFile || undefined
        }
        await contractService.crearContrato(
          contratoCompleto, 
          usuario?.organizacionId || 'default-org', 
          currentUser?.uid || ''
        )
      }
      
      setUploadProgress({ progress: 100, status: 'completed' })
      
      showToast(
        contractToEdit ? 'Contrato actualizado exitosamente' : 'Contrato creado exitosamente',
        'success'
      )
      
      onSuccess()
    } catch (error) {
      console.error('Error processing contract:', error)
      setUploadProgress({ 
        progress: 0, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
      showToast('Error al procesar el contrato', 'error')
    } finally {
      setLoading(false)
      setUploadProgress(null)
    }
  }

  const handleInputChange = (field: keyof FormularioContrato, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle bg-white shadow-xl rounded-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  {contractToEdit ? 'Editar Contrato' : 'Nuevo Contrato'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-4">
                    {/* Título */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título del Contrato *
                      </label>                      <input                        type="text"
                        value={formData.titulo}
                        onChange={(e) => handleInputChange('titulo', e.target.value)}
                        placeholder="Ej: Contrato de Servicios de Consultoría"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                        placeholder="Descripción detallada del contrato..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                      />
                    </div>

                    {/* Contraparte */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraparte *
                      </label>                      <input
                        type="text"
                        value={formData.contraparte}
                        onChange={(e) => handleInputChange('contraparte', e.target.value)}
                        placeholder="Nombre de la empresa o persona"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                      />
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha Inicio *
                        </label>                        <input
                          type="date"
                          value={formData.fechaInicio}
                          onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha Término *
                        </label>                        <input
                          type="date"
                          value={formData.fechaTermino}
                          onChange={(e) => handleInputChange('fechaTermino', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Monto y Moneda */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Monto *
                        </label>                        <input
                          type="number"
                          value={formData.monto}
                          onChange={(e) => handleInputChange('monto', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Moneda
                        </label>                        <select
                          value={formData.moneda}
                          onChange={(e) => handleInputChange('moneda', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                        >
                          <option value="CLP">CLP</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>

                    {/* Categoría y Tipo */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoría
                        </label>                        <select
                          value={formData.categoria}
                          onChange={(e) => handleInputChange('categoria', e.target.value as CategoriaContrato)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                        >
                          {Object.values(CategoriaContrato).map(categoria => (
                            <option key={categoria} value={categoria}>
                              {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo Económico
                        </label>                        <select
                          value={formData.tipo}
                          onChange={(e) => handleInputChange('tipo', e.target.value as TipoEconomico)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                        >
                          {Object.values(TipoEconomico).map(tipo => (
                            <option key={tipo} value={tipo}>
                              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Periodicidad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Periodicidad
                      </label>                      <select
                        value={formData.periodicidad}
                        onChange={(e) => handleInputChange('periodicidad', e.target.value as Periodicidad)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                      >
                        {Object.values(Periodicidad).map(periodicidad => (
                          <option key={periodicidad} value={periodicidad}>
                            {periodicidad.charAt(0).toUpperCase() + periodicidad.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>                    {/* Proyecto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proyecto
                      </label>
                      <ProjectSelect
                        selectedProject={formData.proyectoId ? { 
                          id: formData.proyectoId, 
                          nombre: formData.proyecto 
                        } as Proyecto : null}
                        onProjectSelect={(project: Proyecto | null) => {
                          if (project) {
                            handleInputChange('proyecto', project.nombre)
                            handleInputChange('proyectoId', project.id)
                          } else {
                            handleInputChange('proyecto', '')
                            handleInputChange('proyectoId', '')
                          }
                        }}
                        placeholder="Selecciona o crea un proyecto"
                        showCreateOption={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Right Column - PDF Upload */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Documento PDF {!contractToEdit && '*'}
                      </label>
                      
                      {/* Dropzone */}
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                          isDragActive
                            ? 'border-blue-400 bg-blue-50'
                            : uploadedFile
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input {...getInputProps()} />
                        
                        {uploadedFile ? (
                          <div className="space-y-2">
                            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
                            <div>
                              <p className="text-sm font-medium text-green-700">
                                {uploadedFile.name}
                              </p>
                              <p className="text-xs text-green-600">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setUploadedFile(null)
                              }}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Eliminar archivo
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-sm text-gray-600">
                                {isDragActive
                                  ? 'Suelta el archivo PDF aquí'
                                  : 'Arrastra un PDF aquí o haz clic para seleccionar'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Máximo 10MB
                              </p>
                            </div>
                          </div>
                        )}
                      </div>                      {contractToEdit && !uploadedFile && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-md">
                          <div className="flex items-center">
                            <DocumentIcon className="h-5 w-5 text-blue-500 mr-2" />
                            <span className="text-sm text-blue-700">
                              Documento actual mantenido
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Upload Progress */}
                      {uploadProgress && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {uploadProgress.status === 'uploading' && 'Subiendo archivo...'}
                              {uploadProgress.status === 'completed' && 'Archivo subido exitosamente'}
                              {uploadProgress.status === 'error' && 'Error en la subida'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {uploadProgress.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                uploadProgress.status === 'error' 
                                  ? 'bg-red-500' 
                                  : uploadProgress.status === 'completed'
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${uploadProgress.progress}%` }}
                            />
                          </div>
                          {uploadProgress.error && (
                            <p className="text-sm text-red-600 mt-1">
                              {uploadProgress.error}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>                      <select
                        value={formData.estado}
                        onChange={(e) => handleInputChange('estado', e.target.value as EstadoContrato)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                      >
                        {Object.values(EstadoContrato).map(estado => (
                          <option key={estado} value={estado}>
                            {estado.charAt(0).toUpperCase() + estado.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Departamento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departamento
                      </label>                      <input
                        type="text"
                        value={formData.departamento}
                        onChange={(e) => handleInputChange('departamento', e.target.value)}
                        placeholder="Departamento responsable"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                      />
                    </div>

                    {/* Etiquetas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Etiquetas
                      </label>                      <input
                        type="text"
                        placeholder="Separadas por comas: urgente, confidencial"
                        onChange={(e) => {
                          const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                          handleInputChange('etiquetas', tags)                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                      />
                      {formData.etiquetas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {formData.etiquetas.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                  >
                    {contractToEdit ? 'Actualizar Contrato' : 'Crear Contrato'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ContractForm
