import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useContracts, useDeleteContract } from '../../hooks/useContracts'
import { useContractStore } from '../../stores/contractStore'
import { Contrato, EstadoContrato, TipoContrato } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ContractFilters from './ContractFilters'
import ContractCard from './ContractCard'
import LoadingSpinner from '../ui/LoadingSpinner'
import EmptyState from '../ui/EmptyState'

const ContractList: React.FC = () => {
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const { filtros } = useContractStore()
  const { data, isLoading, error } = useContracts(filtros)
  const deleteContract = useDeleteContract()

  const handleEliminar = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este contrato?')) {
      await deleteContract.mutateAsync(id)
    }
  }

  const contratosFiltrados = data?.contratos.filter(contrato =>
    contrato.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    contrato.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  ) || []

  const getEstadoColor = (estado: EstadoContrato) => {
    const colores = {
      borrador: 'bg-gray-100 text-gray-800',
      revision: 'bg-yellow-100 text-yellow-800',
      aprobado: 'bg-blue-100 text-blue-800',
      activo: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800',
      cancelado: 'bg-gray-100 text-gray-800',
      renovado: 'bg-purple-100 text-purple-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  const getTipoIcon = (tipo: TipoContrato) => {
    return <DocumentTextIcon className="h-5 w-5" />
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar los contratos</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Contratos</h1>
          <p className="text-gray-600">
            {contratosFiltrados.length} contrato{contratosFiltrados.length !== 1 ? 's' : ''} encontrado{contratosFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<PlusIcon className="h-5 w-5" />}
          onClick={() => {/* Navegar a crear contrato */}}
        >
          Nuevo Contrato
        </Button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar contratos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            icon={<MagnifyingGlassIcon />}
            label=""
          />
        </div>
        <Button
          variant="outline"
          icon={<FunnelIcon className="h-5 w-5" />}
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          Filtros
        </Button>
      </div>

      {/* Panel de Filtros */}
      <AnimatePresence>
        {mostrarFiltros && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ContractFilters />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Contratos */}
      {contratosFiltrados.length === 0 ? (
        <EmptyState
          title="No hay contratos"
          description="No se encontraron contratos que coincidan con los criterios de búsqueda."
          action={
            <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />}>
              Crear Primer Contrato
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {contratosFiltrados.map((contrato) => (
              <motion.div
                key={contrato.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <ContractCard
                  contrato={contrato}
                  onEliminar={() => handleEliminar(contrato.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default ContractList