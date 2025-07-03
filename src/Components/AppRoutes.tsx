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
import DashboardLayout from './layout/DashboardLayout'
import ProjectList from './projects/ProjectList'
import ProjectDetail from './projects/ProjectDetail'
import TermsAndConditions from './legal/TermsAndConditions'
import PrivacyPolicy from './legal/PrivacyPolicy'
import Signup from './Signup'
import FirstTimeWizard from './onboarding/FirstTimeWizard'
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
