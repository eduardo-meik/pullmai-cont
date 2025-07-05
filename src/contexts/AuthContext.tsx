import React, { useContext, useState, useEffect } from 'react'
import { auth } from '../firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { useAuthStore } from '../stores/authStore'
import UserService from '../services/userService'
import { UserRole } from '../types'

interface IAuthProviderProps {
  children: JSX.Element
}

interface AuthContextType {
  currentUser: User | null
  signup: (email: string, password: string) => Promise<any>
  login: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateEmail: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  updateUserProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>
  googleSignin: () => Promise<any>
  githubSignin: () => Promise<any>
  getCurrentUserToken: () => Promise<string | null>
  refreshUserData: () => Promise<void> // New function to refresh user data
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: IAuthProviderProps): JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { setUsuario, logout: logoutFromStore } = useAuthStore()

  async function signup(email: string, password: string): Promise<any> {
    // First check if user already exists in Firestore (additional safety)
    try {
      const existingUsers = await UserService.getUsersByEmail(email)
      if (existingUsers.length > 0) {
        throw new Error('Ya existe una cuenta con este correo electrónico.')
      }
    } catch (firestoreError) {
      // If it's our custom error, re-throw it
      if (firestoreError instanceof Error && firestoreError.message.includes('Ya existe una cuenta')) {
        throw firestoreError
      }
      // Otherwise, continue with Firebase signup (Firestore check failed, but Firebase will handle duplicates)
      console.warn('Could not check Firestore for existing users, proceeding with Firebase signup')
    }
    
    return createUserWithEmailAndPassword(auth, email, password)
  }

  function googleSignin(): Promise<any> {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  function githubSignin(): Promise<any> {
    const provider = new GithubAuthProvider()
    return signInWithPopup(auth, provider)
  }
  async function login(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout(): Promise<void> {
    logoutFromStore()
    return signOut(auth)
  }

  function resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email)
  }

  function updateEmail(email: string): Promise<void> {
    if (!currentUser) throw new Error('No user is currently signed in')
    return firebaseUpdateEmail(currentUser, email)
  }
  function updatePassword(password: string): Promise<void> {
    if (!currentUser) throw new Error('No user is currently signed in')
    return firebaseUpdatePassword(currentUser, password)
  }

  function updateUserProfile(profile: { displayName?: string; photoURL?: string }): Promise<void> {
    if (!currentUser) throw new Error('No user is currently signed in')
    return updateProfile(currentUser, profile)
  }

  function getCurrentUserToken(): Promise<string | null> {
    return currentUser ? currentUser.getIdToken() : Promise.resolve(null)
  }

  async function refreshUserData(): Promise<void> {
    if (!currentUser) return
    
    try {
      console.log('🔄 Manually refreshing user data...')
      const freshUserProfile = await UserService.getUserProfile(currentUser.uid)
      if (freshUserProfile) {
        console.log('✅ Fresh user data loaded:', freshUserProfile)
        setUsuario(freshUserProfile)
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error)
      throw error
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Always fetch fresh user profile from database to avoid cache issues
          console.log('🔄 Fetching fresh user profile from database...')
          let userProfile = await UserService.getUserProfile(user.uid)
          
          if (!userProfile) {
            // For new users, check if email already exists in Firestore
            console.log('👤 Creating new user profile...')
            
            // Check for existing user with same email (safety check)
            const existingUsers = await UserService.getUsersByEmail(user.email || '')
            if (existingUsers.length > 0) {
              console.warn('⚠️ User with this email already exists in Firestore, using existing profile')
              userProfile = existingUsers[0]
            } else {
              // Create new user profile
              userProfile = {
                id: user.uid,
                email: user.email || '',
                nombre: user.displayName?.split(' ')[0] || 'Usuario',
                apellido: user.displayName?.split(' ').slice(1).join(' ') || '',
                rol: UserRole.USER,
                organizacionId: '', // No default organization - user must be assigned
                departamento: 'General',
                activo: true,
                fechaCreacion: new Date(),
                ultimoAcceso: new Date(),
                permisos: [],
                asignaciones: []
              }
              
              await UserService.updateUserProfile(user.uid, userProfile)
            }
          } else {
            console.log('✅ Fresh user profile loaded:', {
              id: userProfile.id,
              email: userProfile.email,
              organizacionId: userProfile.organizacionId,
              rol: userProfile.rol
            })
          }
          
          setUsuario(userProfile)
        } catch (error) {
          console.error('❌ Error loading user profile:', error)
          // Don't set user if there's an error
        }
      } else {
        logoutFromStore()
      }
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [setUsuario, logoutFromStore])

  const value: AuthContextType = {
    currentUser,
    login,
    signup,
    googleSignin,
    githubSignin,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
    updateUserProfile,
    getCurrentUserToken,
    refreshUserData,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
