import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '../stores/authStore'
import { isDateOlderThan } from '../utils/dateUtils'

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

      // Check if wizard was completed before or dismissed
      const wizardCompleted = localStorage.getItem('wizardCompleted') === 'true'
      const wizardDismissed = localStorage.getItem('wizardDismissed') === 'true'
      
      // Check if user profile seems complete
      const hasCompleteProfile = usuario.nombre && 
                                usuario.nombre !== 'Usuario' && 
                                usuario.apellido &&
                                usuario.organizacionId && 
                                usuario.rol

      // Check if user account seems established (has been created more than a day ago)
      const userCreationTime = usuario.fechaCreacion
      let isEstablishedUser = false
      
      if (userCreationTime) {
        let creationDate: Date
        
        // Handle different date formats (Firestore Timestamp, Date object, etc.)
        if (userCreationTime instanceof Date) {
          creationDate = userCreationTime
        } else if (userCreationTime && typeof userCreationTime === 'object' && 'toDate' in userCreationTime) {
          // Firestore Timestamp
          creationDate = (userCreationTime as any).toDate()
        } else if (userCreationTime && typeof userCreationTime === 'object' && 'seconds' in userCreationTime) {
          // Firestore Timestamp with seconds
          creationDate = new Date((userCreationTime as any).seconds * 1000)
        } else if (typeof userCreationTime === 'string' || typeof userCreationTime === 'number') {
          // String or number timestamp
          creationDate = new Date(userCreationTime)
        } else {
          // Fallback to current date if format is unknown
          creationDate = new Date()
        }
        
        isEstablishedUser = (Date.now() - creationDate.getTime()) > 24 * 60 * 60 * 1000 // 24 hours
      }
      
      // Show wizard only for truly new users who need onboarding
      const shouldShowWizard = !wizardCompleted && 
                              !wizardDismissed &&
                              currentUser && 
                              usuario &&
                              !hasCompleteProfile &&
                              !isEstablishedUser

      setShowWizard(shouldShowWizard)
      setIsLoading(false)
    }

    // Small delay to ensure auth state is fully loaded
    const timer = setTimeout(checkWizardStatus, 500)
    
    return () => clearTimeout(timer)
  }, [currentUser, usuario])

  const closeWizard = () => {
    setShowWizard(false)
    localStorage.setItem('wizardDismissed', 'true')
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
