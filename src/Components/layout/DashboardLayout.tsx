import React from 'react'
import { Outlet } from 'react-router-dom'
import DashNavbar from '../../Components/DashNavbar'
import Sidebar from './Sidebar'

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashNavbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout