import Signup from './Signup'
import { AuthProvider } from '../contexts/AuthContext'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastProvider } from '../contexts/ToastContext'
import { ApiProvider } from '../contexts/ApiContext'
import AppRoutes from './AppRoutes'
import DevUserRefreshTool from './dev/DevUserRefreshTool'
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
        <AppRoutes />
        <DevUserRefreshTool />
      </AppContextProviders>
    </Router>
  )
}

export default App