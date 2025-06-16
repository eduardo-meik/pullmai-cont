import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import DashNavbar from '../../Components/DashNavbar'
import Sidebar from './Sidebar'

const DashboardLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashNavbar />
      <div className="flex">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapsed={handleToggleSidebar}
        />
        <main className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-0' : 'ml-0'
        }`}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout