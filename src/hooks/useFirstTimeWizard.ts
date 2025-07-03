import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '../stores/authStore'

/**
 * Hook to manage the first-time wizard state
 * Shows the wizard for new users who haven't completed it
 */
export function useFirstTimeWizard() {
  const [showWizard, setShowWizard] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { currentUser } = useAuth()
  const { usuario } = useAuthStore()

  useEffect(() => {
    const checkWizardStatus = () => {
      if (!currentUser || !usuario) {
        setIsLoading(false)
        return
      }

      // Check if wizard was completed before
      const wizardCompleted = localStorage.getItem('wizardCompleted') === 'true'
      
      // Show wizard if:
      // 1. User hasn't completed the wizard before
      // 2. User is authenticated
      // 3. User has no organization set (except default MEIK LABS)
      const shouldShowWizard = !wizardCompleted && 
                              currentUser && 
                              usuario &&
                              (!usuario.organizacionId || usuario.organizacionId === 'MEIK LABS')

      setShowWizard(shouldShowWizard)
      setIsLoading(false)
    }

    // Small delay to ensure auth state is fully loaded
    const timer = setTimeout(checkWizardStatus, 500)
    
    return () => clearTimeout(timer)
  }, [currentUser, usuario])

  const closeWizard = () => {
    setShowWizard(false)
    localStorage.setItem('wizardCompleted', 'true')
  }

  const completeWizard = () => {
    setShowWizard(false)
    localStorage.setItem('wizardCompleted', 'true')
  }

  return {
    showWizard,
    isLoading,
    closeWizard,
    completeWizard
  }
}
