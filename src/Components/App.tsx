import Signup from './Signup'
import { AuthProvider } from '../contexts/AuthContext'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Dashboard from './Dashboard'
import Login from './Login'
import PrivateRoutes from './PrivateRoutes'
import ForgotPassword from './ForgotPassword'
import UpdateProfile from './UpdateProfile'
import Projects from './Projects'
import ContractList from '../components/contracts/ContractList'
import DashboardLayout from './layout/DashboardLayout'
import { ToastProvider } from '../contexts/ToastContext'
import { ApiProvider } from '../contexts/ApiContext'
import 'react-toastify/dist/ReactToastify.min.css'
import AppContextProviders from '../contexts/AppContextProvider'

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})

function App() {
  const providers = [
    ToastProvider, 
    AuthProvider, 
    ApiProvider,
    ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    )
  ]
  
  return (
    <Router>
      <AppContextProviders components={providers}>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/contratos" element={<ContractList />} />
              <Route path="/update-profile" element={<UpdateProfile />} />
              <Route path="/projects" element={<Projects />} />
            </Route>
          </Route>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </AppContextProviders>
    </Router>
  )
}

export default App