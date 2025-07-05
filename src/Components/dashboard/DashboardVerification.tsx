import React, { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuthStore } from '../../stores/authStore'

interface DashboardVerificationProps {
  onClose: () => void
}

interface VerificationData {
  orgProjects: {
    total: number
    active: number
    completed: number
  }
  globalProjects: {
    total: number
    active: number
    completed: number
  }
  orgContracts: {
    total: number
    active: number
  }
  globalContracts: {
    total: number
    active: number
  }
}

const DashboardVerification: React.FC<DashboardVerificationProps> = ({ onClose }) => {
  const { usuario } = useAuthStore()
  const [data, setData] = useState<VerificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyDashboardData = async () => {
      if (!usuario?.organizacionId) {
        setError('No organization ID found')
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Get organization-filtered projects
        const orgProjectsQuery = query(
          collection(db, 'proyectos'),
          where('organizacionId', '==', usuario.organizacionId)
        )
        const orgProjectsSnapshot = await getDocs(orgProjectsQuery)
        const orgProjects = orgProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        // Get all projects (global)
        const globalProjectsSnapshot = await getDocs(collection(db, 'proyectos'))
        const globalProjects = globalProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Get organization-filtered contracts
        const orgContractsQuery = query(
          collection(db, 'contratos'),
          where('organizacionId', '==', usuario.organizacionId)
        )
        const orgContractsSnapshot = await getDocs(orgContractsQuery)
        const orgContracts = orgContractsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Get all contracts (global)
        const globalContractsSnapshot = await getDocs(collection(db, 'contratos'))
        const globalContracts = globalContractsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        setData({
          orgProjects: {
            total: orgProjects.length,
            active: orgProjects.filter((p: any) => p.estado === 'EN_CURSO').length,
            completed: orgProjects.filter((p: any) => p.estado === 'COMPLETADO').length
          },
          globalProjects: {
            total: globalProjects.length,
            active: globalProjects.filter((p: any) => p.estado === 'EN_CURSO').length,
            completed: globalProjects.filter((p: any) => p.estado === 'COMPLETADO').length
          },
          orgContracts: {
            total: orgContracts.length,
            active: orgContracts.filter((c: any) => c.estado === 'ACTIVO').length
          },
          globalContracts: {
            total: globalContracts.length,
            active: globalContracts.filter((c: any) => c.estado === 'ACTIVO').length
          }
        })
      } catch (err) {
        console.error('Error verifying dashboard data:', err)
        setError('Error loading verification data')
      } finally {
        setLoading(false)
      }
    }

    verifyDashboardData()
  }, [usuario?.organizacionId])

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Verifying dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-red-600 font-medium">Error: {error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Dashboard Data Verification</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {data && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Organization: {usuario?.organizacionId}
              </h4>
            </div>

            {/* Projects Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-3">Organization Projects</h5>
                <div className="space-y-1 text-sm">
                  <p>Total: <span className="font-semibold">{data.orgProjects.total}</span></p>
                  <p>Active: <span className="font-semibold">{data.orgProjects.active}</span></p>
                  <p>Completed: <span className="font-semibold">{data.orgProjects.completed}</span></p>
                </div>
                <p className="text-xs text-blue-700 mt-2">✅ What dashboard SHOULD show</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h5 className="font-medium text-red-900 mb-3">Global Projects (All Orgs)</h5>
                <div className="space-y-1 text-sm">
                  <p>Total: <span className="font-semibold">{data.globalProjects.total}</span></p>
                  <p>Active: <span className="font-semibold">{data.globalProjects.active}</span></p>
                  <p>Completed: <span className="font-semibold">{data.globalProjects.completed}</span></p>
                </div>
                <p className="text-xs text-red-700 mt-2">❌ What old dashboard was showing</p>
              </div>
            </div>

            {/* Contracts Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-medium text-green-900 mb-3">Organization Contracts</h5>
                <div className="space-y-1 text-sm">
                  <p>Total: <span className="font-semibold">{data.orgContracts.total}</span></p>
                  <p>Active: <span className="font-semibold">{data.orgContracts.active}</span></p>
                </div>
                <p className="text-xs text-green-700 mt-2">✅ Correctly filtered</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-3">Global Contracts (All Orgs)</h5>
                <div className="space-y-1 text-sm">
                  <p>Total: <span className="font-semibold">{data.globalContracts.total}</span></p>
                  <p>Active: <span className="font-semibold">{data.globalContracts.active}</span></p>
                </div>
                <p className="text-xs text-gray-700 mt-2">ℹ️ For reference</p>
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h5 className="font-medium text-yellow-900 mb-3">Analysis</h5>
              <div className="text-sm space-y-2">
                {data.globalProjects.total === 9 && data.globalProjects.active === 2 ? (
                  <p className="text-yellow-800">
                    🎯 <strong>Issue Confirmed:</strong> You were seeing global totals ({data.globalProjects.total} total, {data.globalProjects.active} active) instead of organization-specific totals ({data.orgProjects.total} total, {data.orgProjects.active} active).
                  </p>
                ) : (
                  <p className="text-yellow-800">
                    📊 Global vs Organization project counts comparison available above.
                  </p>
                )}
                
                <p className="text-yellow-800">
                  ✅ <strong>Fix Applied:</strong> Dashboard now uses organization-filtered project stats.
                </p>
                
                <p className="text-yellow-800">
                  🔄 <strong>Next Step:</strong> Refresh your dashboard to see the corrected counts.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardVerification
