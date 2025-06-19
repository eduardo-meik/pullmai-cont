import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import { FormularioContrato, CategoriaContrato, TipoEconomico, Periodicidad, EstadoContrato } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useToast } from '../../contexts/ToastContext'

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
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
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
      showToast('Archivo PDF cargado correctamente', 'success')
    } else {
      showToast('Por favor, selecciona un archivo PDF válido', 'error')
    }
  }, [showToast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  })

  const handleInputChange = (field: keyof FormularioContrato, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEtiquetasChange = (etiquetas: string) => {
    const etiquetasArray = etiquetas
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
    
    setFormData(prev => ({
      ...prev,
      etiquetas: etiquetasArray
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones básicas
      if (!formData.titulo || !formData.contraparte || !formData.fechaInicio || !formData.fechaTermino) {
        showToast('Por favor, completa todos los campos obligatorios', 'error')
        return
      }

      if (new Date(formData.fechaInicio) >= new Date(formData.fechaTermino)) {
        showToast('La fecha de término debe ser posterior a la fecha de inicio', 'error')
        return
      }

      // Aquí iría la lógica para subir el archivo y crear el contrato
      // Por ahora simularemos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000))

      showToast(
        contractToEdit ? 'Contrato actualizado exitosamente' : 'Contrato creado exitosamente', 
        'success'
      )
      onSuccess()
    } catch (error) {
      showToast('Error al guardar el contrato', 'error')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {contractToEdit ? 'Editar Contrato' : 'Nuevo Contrato'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {contractToEdit ? 'Modifica los datos del contrato' : 'Completa la información del nuevo contrato'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Información Básica */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
                  </div>

                  <div>
                    <Input
                      label="Título del Contrato *"
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => handleInputChange('titulo', e.target.value)}
                      placeholder="Ej: Servicios de desarrollo de software"
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="Contraparte *"
                      type="text"
                      value={formData.contraparte}
                      onChange={(e) => handleInputChange('contraparte', e.target.value)}
                      placeholder="Ej: TechSolutions SpA"
                      required
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      placeholder="Descripción detallada del contrato..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Fechas y Montos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas y Montos</h3>
                  </div>

                  <div>
                    <Input
                      label="Fecha de Inicio *"
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="Fecha de Término *"
                      type="date"
                      value={formData.fechaTermino}
                      onChange={(e) => handleInputChange('fechaTermino', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="Monto"
                      type="number"
                      value={formData.monto}
                      onChange={(e) => handleInputChange('monto', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moneda
                    </label>
                    <select
                      value={formData.moneda}
                      onChange={(e) => handleInputChange('moneda', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="CLP">CLP - Peso Chileno</option>
                      <option value="USD">USD - Dólar Americano</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                </div>

                {/* Categorización */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorización</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => handleInputChange('categoria', e.target.value as CategoriaContrato)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.values(CategoriaContrato).map(categoria => (
                        <option key={categoria} value={categoria}>
                          {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo Económico
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => handleInputChange('tipo', e.target.value as TipoEconomico)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.values(TipoEconomico).map(tipo => (
                        <option key={tipo} value={tipo}>
                          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Periodicidad
                    </label>
                    <select
                      value={formData.periodicidad}
                      onChange={(e) => handleInputChange('periodicidad', e.target.value as Periodicidad)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.values(Periodicidad).map(periodicidad => (
                        <option key={periodicidad} value={periodicidad}>
                          {periodicidad.charAt(0).toUpperCase() + periodicidad.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value as EstadoContrato)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.values(EstadoContrato).map(estado => (
                        <option key={estado} value={estado}>
                          {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Input
                      label="Proyecto"
                      type="text"
                      value={formData.proyecto}
                      onChange={(e) => handleInputChange('proyecto', e.target.value)}
                      placeholder="Ej: Sistema ERP"
                    />
                  </div>

                  <div>
                    <Input
                      label="Departamento"
                      type="text"
                      value={formData.departamento}
                      onChange={(e) => handleInputChange('departamento', e.target.value)}
                      placeholder="Ej: Tecnología"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <Input
                      label="Etiquetas"
                      type="text"
                      value={formData.etiquetas.join(', ')}
                      onChange={(e) => handleEtiquetasChange(e.target.value)}
                      placeholder="Ej: desarrollo, software, tecnología (separadas por comas)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separa las etiquetas con comas
                    </p>
                  </div>
                </div>

                {/* Upload PDF */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Documento PDF</h3>
                  
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
                          <p className="text-sm font-medium text-green-800">
                            Archivo cargado: {uploadedFile.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra el PDF aquí o haz clic para seleccionar'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Solo archivos PDF hasta 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                loading={loading}
                disabled={!formData.titulo || !formData.contraparte}
              >
                {contractToEdit ? 'Actualizar Contrato' : 'Crear Contrato'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

export default ContractForm
