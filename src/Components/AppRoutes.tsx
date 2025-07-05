import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import LoadingSpinner from './ui/LoadingSpinner' // Assuming this is your loading spinner

// Layouts and Route Guards
import PrivateRoutes from './PrivateRoutes'
import DashboardLayout from './layout/DashboardLayout'
import AdminRoute from './admin/AdminRoute'

// Hooks
import { useFirstTimeWizard } from '../hooks/useFirstTimeWizard'

// Eagerly loaded components (Login, Signup, ForgotPassword can be candidates for lazy loading too if needed)
import Login from './Login'
import Signup from './Signup'
import ForgotPassword from './ForgotPassword'
import EnvTest from './EnvTest' // Small component, can be eager
import FirstTimeWizard from './onboarding/FirstTimeWizard' // Modal, likely okay to be eager if not too complex

// Lazy loaded components
const Dashboard = lazy(() => import('./Dashboard'))
const UpdateProfile = lazy(() => import('./UpdateProfile'))
const ContractModule = lazy(() => import('./contracts/ContractModule'))
const ContraparteModule = lazy(() => import('./contrapartes/ContraparteModule'))
const UserModule = lazy(() => import('./usuarios/UserModule'))
const PlantillaModule = lazy(() => import('./plantillas/PlantillaModule'))
const ConfigurationModule = lazy(() => import('./configuration/ConfigurationModule'))
const AuditModule = lazy(() => import('./audit/AuditModule'))
const ProjectModule = lazy(() => import('./projects/ProjectModule'))
const ProjectList = lazy(() => import('./projects/ProjectList'))
const ProjectDetail = lazy(() => import('./projects/ProjectDetail'))
const TermsAndConditions = lazy(() => import('./legal/TermsAndConditions'))
const PrivacyPolicy = lazy(() => import('./legal/PrivacyPolicy'))

/**
 * AppRoutes component that handles routing and wizard display
 * This component is rendered inside the provider context
 */
const AppRoutes: React.FC = () => {
  const { showWizard, closeWizard, completeWizard } = useFirstTimeWizard()

  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/contratos" element={<ContractModule />} />
              <Route path="/contrapartes" element={<ContraparteModule />} />
              <Route path="/usuarios" element={<UserModule />} />
              <Route path="/plantillas" element={<PlantillaModule />} />
              <Route
                path="/configuracion"
                element={
                  <AdminRoute>
                    <ConfigurationModule />
                  </AdminRoute>
                }
              />
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
      </Suspense>
      
      {/* Global First Time Wizard - only shows for authenticated users */}
      {showWizard && ( // Conditionally render FirstTimeWizard to avoid issues if its internals are complex
        <FirstTimeWizard
          isOpen={showWizard}
          onClose={closeWizard}
          onComplete={completeWizard}
        />
      )}
    </>
  )
}

export default AppRoutes
