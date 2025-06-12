import React from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

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
  // Estos datos vendrían de una API o store
  const stats = [
    {
      title: 'Total Contratos',
      value: 156,
      change: '+12% vs mes anterior',
      changeType: 'increase' as const,
      icon: <DocumentTextIcon className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-100'
    },
    {
      title: 'Contratos Activos',
      value: 89,
      change: '+5% vs mes anterior',
      changeType: 'increase' as const,
      icon: <CheckCircleIcon className="h-6 w-6 text-green-600" />,
      color: 'bg-green-100'
    },
    {
      title: 'Próximos a Vencer',
      value: 12,
      change: '3 en los próximos 7 días',
      changeType: 'neutral' as const,
      icon: <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />,
      color: 'bg-orange-100'
    },
    {
      title: 'Valor Total',
      value: '€2.4M',
      change: '+18% vs mes anterior',
      changeType: 'increase' as const,
      icon: <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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