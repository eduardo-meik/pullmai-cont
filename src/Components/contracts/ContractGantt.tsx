import React, { useState, useMemo } from 'react'
import { useContracts } from '../../hooks/useContracts'
import { Contrato, EstadoContrato } from '../../types'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import ContractPDFViewer from './ContractPDFViewer'

interface GanttBar {
  id: string
  title: string
  startDate: Date
  endDate: Date
  progress: number
  status: string
  provider: string
  amount: number
  pdfUrl?: string
}

const ContractGantt: React.FC = () => {
  const { data, isLoading } = useContracts()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewingPDF, setViewingPDF] = useState<{ url: string; title: string } | null>(null)

  const contracts = data?.contratos || []

  // Transform contracts to Gantt bars
  const ganttBars: GanttBar[] = useMemo(() => {
    return contracts
      .filter((contract: Contrato) => {
        const matchesSearch = 
          contract.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.contraparte.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || contract.estado === statusFilter
        
        return matchesSearch && matchesStatus && contract.fechaInicio && contract.fechaTermino
      })
      .map((contract: Contrato) => {
        const startDate = contract.fechaInicio
        const endDate = contract.fechaTermino
        const today = new Date()
        
        // Calculate progress based on dates and status
        let progress = 0
        if (contract.estado === EstadoContrato.APROBADO || contract.estado === EstadoContrato.RENOVADO) {
          progress = 100
        } else if (contract.estado === EstadoContrato.ACTIVO) {
          const totalDuration = differenceInDays(endDate, startDate)
          const elapsed = differenceInDays(today, startDate)
          progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
        } else if (contract.estado === EstadoContrato.REVISION) {
          progress = 50
        } else {
          progress = 25
        }

        return {
          id: contract.id,
          title: contract.titulo,
          startDate,
          endDate,
          progress,
          status: contract.estado,
          provider: contract.contraparte,
          amount: contract.monto,
          pdfUrl: contract.pdfUrl
        }
      })
      .sort((a: GanttBar, b: GanttBar) => a.startDate.getTime() - b.startDate.getTime())
  }, [contracts, searchTerm, statusFilter])

  // Generate calendar grid for current month view
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getBarPosition = (startDate: Date, endDate: Date) => {
    const monthStartTime = monthStart.getTime()
    const monthEndTime = monthEnd.getTime()
    const barStartTime = Math.max(startDate.getTime(), monthStartTime)
    const barEndTime = Math.min(endDate.getTime(), monthEndTime)
    
    const totalMonthDuration = monthEndTime - monthStartTime
    const left = ((barStartTime - monthStartTime) / totalMonthDuration) * 100
    const width = ((barEndTime - barStartTime) / totalMonthDuration) * 100
    
    return { left: Math.max(0, left), width: Math.max(1, width) }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case EstadoContrato.ACTIVO:
        return 'bg-green-500'
      case EstadoContrato.APROBADO:
        return 'bg-blue-500'
      case EstadoContrato.REVISION:
        return 'bg-yellow-500'
      case EstadoContrato.RENOVADO:
        return 'bg-purple-500'
      case EstadoContrato.VENCIDO:
        return 'bg-gray-500'
      case EstadoContrato.CANCELADO:
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const previousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando vista Gantt...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar contratos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              {Object.values(EstadoContrato).map(estado => (
                <option key={estado} value={estado}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Mes anterior"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Hoy
          </button>
          
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>
          </div>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Mes siguiente"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {ganttBars.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay contratos para mostrar en este período</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Header with dates */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <div className="w-64 flex-shrink-0 p-4 font-medium text-gray-900 border-r border-gray-200">
                Contrato
              </div>
              <div className="flex-1 min-w-96">
                <div className="flex h-12 items-center">
                  {daysInMonth.map((day, index) => (
                    <div
                      key={index}
                      className={`flex-1 text-center text-xs py-2 border-r border-gray-100 ${
                        isSameDay(day, new Date()) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600'
                      }`}
                    >
                      <div>{format(day, 'd')}</div>
                      <div className="text-xs opacity-75">{format(day, 'eee', { locale: es })}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-32 flex-shrink-0 p-4 text-center font-medium text-gray-900 border-l border-gray-200">
                Acciones
              </div>
            </div>

            {/* Contract bars */}
            <div className="divide-y divide-gray-200">
              {ganttBars.map((bar, index) => {
                const position = getBarPosition(bar.startDate, bar.endDate)
                
                return (
                  <motion.div
                    key={bar.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex hover:bg-gray-50 transition-colors group"
                  >
                    {/* Contract info */}
                    <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200">
                      <div className="space-y-1">
                        <h4 className="font-medium text-gray-900 text-sm truncate" title={bar.title}>
                          {bar.title}
                        </h4>
                        <p className="text-xs text-gray-600 truncate" title={bar.provider}>
                          {bar.provider}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatAmount(bar.amount)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(bar.status)}`} />
                          <span className="text-xs text-gray-600 capitalize">
                            {bar.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 min-w-96 relative p-4">
                      <div className="relative h-8">
                        {/* Gantt bar */}
                        <div
                          className={`absolute top-1 h-6 rounded-md ${getStatusColor(bar.status)} bg-opacity-20 border-l-4 ${getStatusColor(bar.status)} group-hover:bg-opacity-30 transition-all`}
                          style={{
                            left: `${position.left}%`,
                            width: `${position.width}%`
                          }}
                        >
                          {/* Progress indicator */}
                          <div
                            className={`h-full rounded-md ${getStatusColor(bar.status)} transition-all duration-300`}
                            style={{ width: `${bar.progress}%` }}
                          />
                          
                          {/* Duration tooltip */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {format(bar.startDate, 'dd/MM/yyyy')} - {format(bar.endDate, 'dd/MM/yyyy')}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="w-32 flex-shrink-0 p-4 border-l border-gray-200">
                      <div className="flex justify-center space-x-2">
                        {bar.pdfUrl && (
                          <button
                            onClick={() => setViewingPDF({ url: bar.pdfUrl!, title: bar.title })}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver PDF"
                          >
                            <DocumentIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{ganttBars.length}</div>
          <div className="text-sm text-gray-600">Contratos en período</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {ganttBars.filter(bar => bar.status === EstadoContrato.ACTIVO).length}
          </div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">
            {ganttBars.filter(bar => bar.status === EstadoContrato.VENCIDO).length}
          </div>
          <div className="text-sm text-gray-600">Vencidos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">
            {formatAmount(ganttBars.reduce((sum, bar) => sum + bar.amount, 0))}
          </div>
          <div className="text-sm text-gray-600">Valor total</div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewingPDF && (
        <ContractPDFViewer
          isOpen={true}
          onClose={() => setViewingPDF(null)}
          pdfUrl={viewingPDF.url}
          contractTitle={viewingPDF.title}
        />
      )}
    </div>
  )
}

export default ContractGantt
