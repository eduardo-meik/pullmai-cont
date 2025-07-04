import React from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  FolderIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { useContracts } from '../../hooks/useContracts'
import { useProjectsResumen } from '../../hooks/useProjects'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  color: string
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${getChangeColor()}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

const DashboardStats: React.FC = () => {
  const contractsQuery = useContracts()
  const { data: projectStats, isLoading: projectsLoading } = useProjectsResumen()

  const contratos = contractsQuery.data?.contratos || []
  const contractsLoading = contractsQuery.isLoading

  // Calcular estadísticas de contratos
  const contratosActivos = contratos.filter((c: any) => c.estado === 'ACTIVO').length
  const contratosPorVencer = contratos.filter((c: any) => {
    const hoy = new Date()
    const diasParaVencer = Math.ceil((c.fechaTermino.getTime() - hoy.getTime()) / (1000 * 3600 * 24))
    return diasParaVencer <= 30 && diasParaVencer > 0
  }).length
  
  const valorTotal = contratos.reduce((sum: number, c: any) => sum + c.monto, 0)

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (contractsLoading || projectsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Contratos',
      value: contratos.length,
      change: `${contratosActivos} activos`,
      changeType: 'neutral' as const,
      icon: <DocumentTextIcon className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-100'
    },
    {
      title: 'Contratos Activos',
      value: contratosActivos,
      change: `${Math.round((contratosActivos / contratos.length) * 100)}% del total`,
      changeType: 'increase' as const,
      icon: <CheckCircleIcon className="h-6 w-6 text-green-600" />,
      color: 'bg-green-100'
    },
    {
      title: 'Próximos a Vencer',
      value: contratosPorVencer,
      change: 'En los próximos 30 días',
      changeType: contratosPorVencer > 5 ? 'decrease' as const : 'neutral' as const,
      icon: <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />,
      color: 'bg-orange-100'
    },
    {
      title: 'Valor Total',
      value: formatCurrency(valorTotal),
      change: `${contratos.length} contratos`,
      changeType: 'increase' as const,
      icon: <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-100'
    },
    {
      title: 'Total Proyectos',
      value: projectStats?.totalProyectos || 0,
      change: `${projectStats?.proyectosActivos || 0} activos`,
      changeType: 'neutral' as const,
      icon: <FolderIcon className="h-6 w-6 text-indigo-600" />,
      color: 'bg-indigo-100'
    },
    {
      title: 'Proyectos Activos',
      value: projectStats?.proyectosActivos || 0,
      change: `${projectStats?.proyectosCompletados || 0} completados`,
      changeType: 'increase' as const,
      icon: <PlayIcon className="h-6 w-6 text-emerald-600" />,
      color: 'bg-emerald-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  )
}

export default DashboardStats