import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './Dashboard'
import Login from './Login'
import PrivateRoutes from './PrivateRoutes'
import ForgotPassword from './ForgotPassword'
import UpdateProfile from './UpdateProfile'
import Projects from './Projects'
import ContractModule from './contracts/ContractModule'
import ContraparteModule from './contrapartes/ContraparteModule'
import UserModule from './usuarios/UserModule'
import PlantillaModule from './plantillas/PlantillaModule'
import ConfigurationModule from './configuration/ConfigurationModule'
import AdminRoute from './admin/AdminRoute'
import AuditModule from './audit/AuditModule'
import ProjectModule from './projects/ProjectModule'
import DashboardLayout from './layout/DashboardLayout'
import ProjectList from './projects/ProjectList'
import ProjectDetail from './projects/ProjectDetail'
import TermsAndConditions from './legal/TermsAndConditions'
import PrivacyPolicy from './legal/PrivacyPolicy'
import Signup from './Signup'
import FirstTimeWizard from './onboarding/FirstTimeWizard'
import EnvTest from './EnvTest'
import { useFirstTimeWizard } from '../hooks/useFirstTimeWizard'

/**
 * AppRoutes component that handles routing and wizard display
 * This component is rendered inside the provider context
 */
const AppRoutes: React.FC = () => {
  const { showWizard, closeWizard, completeWizard } = useFirstTimeWizard()

  return (
    <>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contratos" element={<ContractModule />} />
            <Route path="/contrapartes" element={<ContraparteModule />} />
            <Route path="/usuarios" element={<UserModule />} />
            <Route path="/plantillas" element={<PlantillaModule />} />
            <Route path="/configuracion" element={
              <AdminRoute>
                <ConfigurationModule />
              </AdminRoute>
            } />
            <Route path="/auditoria" element={<AuditModule />} />
            <Route path="/proyectos" element={<ProjectModule />} />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
          </Route>
        </Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/env-test" element={<EnvTest />} />
      </Routes>
      
      {/* Global First Time Wizard - only shows for authenticated users */}
      <FirstTimeWizard
        isOpen={showWizard}
        onClose={closeWizard}
        onComplete={completeWizard}
      />
    </>
  )
}

export default AppRoutes
