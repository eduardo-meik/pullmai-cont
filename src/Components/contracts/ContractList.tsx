import React, { useState, useEffect } from 'react'
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
import { Contrato, EstadoContrato, CategoriaContrato, TipoEconomico, Periodicidad } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ContractFilters from './ContractFilters'
import ContractCard from './ContractCard'
import LoadingSpinner from '../ui/LoadingSpinner'
import EmptyState from '../ui/EmptyState'
import { useAuth } from '../../contexts/AuthContext'
import { canAccessContract, getRoleById } from '../../types/roles'

interface Contract {
  id: string
  titulo: string
  organizacionId: string
  responsableId: string
  estado: string
  fechaCreacion: any
  fechaInicio: any
  fechaTermino: any
  contraparte: string
  monto: number
  categoria: CategoriaContrato
  tipo: TipoEconomico
  periodicidad: Periodicidad
  proyecto: string
  departamento: string
}

const ContractList: React.FC = () => {
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const { filtros } = useContractStore()
  const { data, isLoading, error } = useContracts(filtros)
  const deleteContract = useDeleteContract()
  const { currentUser } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [errorUser, setError] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userOrgId, setUserOrgId] = useState('')

  useEffect(() => {
    if (currentUser) {
      loadUserData()
    }
  }, [currentUser])

  useEffect(() => {
    if (userRole && userOrgId) {
      loadContracts()
    }
  }, [userRole, userOrgId])
  const loadUserData = async () => {
    if (!currentUser) return
    
    try {
      const { doc, getDoc, getFirestore } = await import('firebase/firestore')
      const db = getFirestore()
      const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setUserRole(userData.rol || 'user')
        setUserOrgId(userData.organizacionId || '')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setError('Error al cargar los datos del usuario')
    }
  }

  const loadContracts = async () => {
    if (!currentUser || !userRole || !userOrgId) return

    setLoading(true)
    setError('')

    try {
      const { collection, query, where, getDocs, getFirestore, orderBy } = await import('firebase/firestore')
      const db = getFirestore()
      
      let contractsQuery;
      const role = getRoleById(userRole);
      
      if (role?.id === 'super_admin') {
        // Super Admin can see all contracts
        contractsQuery = query(
          collection(db, 'contracts'),
          orderBy('createdAt', 'desc')
        )
      } else if (role?.id === 'organization_admin') {
        // Organization Admin can see all contracts in their organization
        contractsQuery = query(
          collection(db, 'contracts'),
          where('organizationId', '==', userOrgId),
          orderBy('createdAt', 'desc')
        )
      } else if (role?.id === 'manager') {
        // Manager can see contracts in their organization that they manage or are assigned to
        contractsQuery = query(
          collection(db, 'contracts'),
          where('organizationId', '==', userOrgId),
          orderBy('createdAt', 'desc')
        )
      } else {
        // Regular user can only see contracts assigned to them or created by them
        contractsQuery = query(
          collection(db, 'contracts'),
          where('organizationId', '==', userOrgId),
          orderBy('createdAt', 'desc')
        )
      }

      const querySnapshot = await getDocs(contractsQuery)
      const contractsData: Contract[] = []

      querySnapshot.forEach((doc) => {
        const contract = { id: doc.id, ...doc.data() } as Contract        // Additional filtering based on role permissions
        if (canAccessContract(userRole, userOrgId, contract.organizacionId, contract.proyecto, [], contract.id)) {
          contractsData.push(contract)
        }
      })

      console.log(`Loaded ${contractsData.length} contracts for user role: ${userRole}`)
      setContracts(contractsData)

    } catch (error) {
      console.error('Error loading contracts:', error)
      setError('Error al cargar los contratos')
    } finally {
      setLoading(false)
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

  const getTipoIcon = (tipo: TipoEconomico) => {
    return <DocumentTextIcon className="h-5 w-5" />
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate()
    } else if (timestamp instanceof Date) {
      date = timestamp
    } else {
      date = new Date(timestamp)
    }
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'activo':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
      case 'completado':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Activo'
      case 'pending':
        return 'Pendiente'
      case 'completed':
        return 'Completado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status || 'Desconocido'
    }
  }

  const handleEliminar = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este contrato?')) {
      await deleteContract.mutateAsync(id)
    }
  }

  if (isLoading || loading) {
    return <LoadingSpinner />
  }

  if (error || errorUser) {
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