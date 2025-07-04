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

  function signup(email: string, password: string): Promise<any> {
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    // Wait for the auth state to be fully processed
    await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && user.uid === userCredential.user.uid) {
          unsubscribe()
          resolve(void 0)
        }
      })
    })
    
    return userCredential
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
  }  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user profile or create default one
        let userProfile = await UserService.getUserProfile(user.uid)
        
        if (!userProfile) {
          userProfile = {
            id: user.uid,
            email: user.email || '',
            nombre: user.displayName?.split(' ')[0] || 'Usuario',
            apellido: user.displayName?.split(' ').slice(1).join(' ') || '',
            rol: UserRole.USER,
            organizacionId: 'MEIK LABS',
            departamento: 'General',
            activo: true,
            fechaCreacion: new Date(),
            ultimoAcceso: new Date(),
            permisos: [],
            asignaciones: []
          }
          
          try {
            await UserService.updateUserProfile(user.uid, userProfile)
          } catch (error) {
            console.error('Error saving default user profile:', error)
          }
        }
        
        setUsuario(userProfile)
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
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
