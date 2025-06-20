import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { UserIcon, EnvelopeIcon, BuildingOfficeIcon, UserGroupIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { ETypes, MessageCard } from './Atoms/MessageCard'
import { AiFillExclamationCircle } from 'react-icons/ai'
import { useToast, EToastTypes } from '../contexts/ToastContext'
import { Usuario, UserRole } from '../types'
import UserService from '../services/userService'
import { useAuthStore } from '../stores/authStore'

interface UserProfileData {
  nombre: string
  apellido: string
  organizacion: string
  rol: UserRole
  email: string
  password: string
  passwordConfirm: string
}

export default function UpdateProfile() {
  const { currentUser, updatePassword, updateEmail, updateUserProfile } = useAuth()
  const { setUsuario } = useAuthStore()
  const { showTypedToast } = useToast()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [testMode, setTestMode] = useState(false) // Modo de prueba que solo actualiza Firestore
  const navigate = useNavigate()

  const [formData, setFormData] = useState<UserProfileData>({
    nombre: '',
    apellido: '',
    organizacion: '',
    rol: UserRole.USER,
    email: currentUser?.email || '',
    password: '',
    passwordConfirm: ''
  })

  // Cargar datos del perfil del usuario desde Firestore usando UserService
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!currentUser) return
      
      try {
        const userData = await UserService.getUserProfile(currentUser.uid)
        if (userData) {
          setFormData(prev => ({
            ...prev,
            nombre: userData.nombre || '',
            apellido: userData.apellido || '',
            organizacion: userData.organizacionId || '',
            rol: userData.rol || UserRole.USER,
            email: currentUser.email || ''
          }))
        } else {
          // Si no existe perfil, usar datos básicos del usuario
          setFormData(prev => ({
            ...prev,
            email: currentUser.email || '',
            nombre: currentUser.displayName?.split(' ')[0] || '',
            apellido: currentUser.displayName?.split(' ').slice(1).join(' ') || ''
          }))
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err)
        setError('Error al cargar los datos del perfil')
      } finally {
        setLoadingProfile(false)
      }
    }

    loadUserProfile()
  }, [currentUser])

  const handleInputChange = (field: keyof UserProfileData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError('')
  }

  const validateForm = (): boolean => {
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio')
      return false
    }
    if (!formData.apellido.trim()) {
      setError('El apellido es obligatorio')
      return false
    }
    if (!formData.email.trim()) {
      setError('El email es obligatorio')
      return false
    }
    if (formData.password && formData.password !== formData.passwordConfirm) {
      setError('Las contraseñas no coinciden')
      return false
    }
    if (formData.password && formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser || !validateForm()) return

    setLoading(true)
    setError('')

    try {
      // En modo de prueba, solo actualizar Firestore sin tocar Firebase Auth
      if (testMode) {
        console.log('MODO PRUEBA: Solo actualizando Firestore')
        
        const userProfileData: Partial<Usuario> = {
          id: currentUser.uid,
          email: formData.email,
          nombre: formData.nombre,
          apellido: formData.apellido,
          organizacionId: formData.organizacion,
          rol: formData.rol,
          activo: true,
          ultimoAcceso: new Date()
        }

        console.log('Datos a guardar en Firestore (modo prueba):', userProfileData)

        await UserService.updateUserProfile(currentUser.uid, userProfileData)
        
        // Update the auth store with the new user data
        const updatedUser = await UserService.getUserProfile(currentUser.uid)
        if (updatedUser) {
          setUsuario(updatedUser)
        }        console.log('Perfil actualizado exitosamente (modo prueba)')
        showTypedToast(EToastTypes.SUCCESS, 'Perfil actualizado exitosamente (solo datos del perfil)')
        navigate('/')
        return
      }

      // Modo normal: actualizar Firebase Auth + Firestore
      // Step 1: Update Firebase Authentication data
      const authPromises: Promise<any>[] = []

      // Actualizar email si cambió
      if (formData.email !== currentUser.email) {
        console.log('Actualizando email de:', currentUser.email, 'a:', formData.email)
        authPromises.push(updateEmail(formData.email))
      }

      // Actualizar contraseña si se proporcionó
      if (formData.password) {
        console.log('Actualizando contraseña')
        authPromises.push(updatePassword(formData.password))
      }

      // Actualizar displayName en Firebase Auth
      if (currentUser.displayName !== `${formData.nombre} ${formData.apellido}`) {
        console.log('Actualizando displayName a:', `${formData.nombre} ${formData.apellido}`)
        authPromises.push(updateUserProfile({
          displayName: `${formData.nombre} ${formData.apellido}`
        }))
      }

      // Ejecutar actualizaciones de autenticación
      if (authPromises.length > 0) {
        console.log('Ejecutando', authPromises.length, 'actualizaciones de autenticación')
        await Promise.all(authPromises)
        console.log('Actualizaciones de autenticación completadas')
      }

      // Step 2: Update Firestore profile using UserService
      console.log('Iniciando actualización de Firestore')
      const userProfileData: Partial<Usuario> = {
        id: currentUser.uid,
        email: formData.email,
        nombre: formData.nombre,
        apellido: formData.apellido,
        organizacionId: formData.organizacion,
        rol: formData.rol,
        activo: true,
        ultimoAcceso: new Date()
      }

      console.log('Datos a guardar en Firestore:', userProfileData)

      await UserService.updateUserProfile(currentUser.uid, userProfileData)
      
      // Update the auth store with the new user data
      const updatedUser = await UserService.getUserProfile(currentUser.uid)
      if (updatedUser) {
        setUsuario(updatedUser)
      }      console.log('Perfil actualizado exitosamente')
      showTypedToast(EToastTypes.SUCCESS, 'Perfil actualizado exitosamente')
      navigate('/')
    } catch (err: any) {
      console.error('Error completo al actualizar perfil:', err)
      console.error('Error code:', err.code)
      console.error('Error message:', err.message)
      
      let errorMessage = 'Error al actualizar el perfil. Inténtalo de nuevo.'
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está en uso por otra cuenta'
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil'
      } else if (err.code === 'auth/requires-recent-login') {
        errorMessage = 'Por seguridad, debes iniciar sesión nuevamente para cambiar estos datos'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'El formato del email no es válido'
      } else if (err.code === 'permission-denied') {
        errorMessage = 'No tienes permisos para actualizar este perfil'
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K"
            alt="ContractHub"
          />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Actualizar Perfil
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Actualiza tu información personal y configuración de cuenta
          </p>
        </div>

        <MessageCard message={error} type={ETypes.DANGER} visible={!!error} />

        {/* Test Mode Toggle */}
        <div className="flex items-center justify-center">
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>Modo prueba (solo actualizar perfil, no email/contraseña)</span>
          </label>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nombre */}
            <div className="space-y-1">
              <label htmlFor="nombre" className="block text-sm font-medium text-neutral-700">
                Nombre *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleInputChange('nombre')}
                  required
                  placeholder="Ingresa tu nombre"
                  className="block w-full pl-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 bg-white transition-colors duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-neutral-400"
                />
              </div>
            </div>

            {/* Apellido */}
            <div className="space-y-1">
              <label htmlFor="apellido" className="block text-sm font-medium text-neutral-700">
                Apellido *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={handleInputChange('apellido')}
                  required
                  placeholder="Ingresa tu apellido"
                  className="block w-full pl-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 bg-white transition-colors duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-neutral-400"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Correo Electrónico *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  placeholder="tu@email.com"
                  className="block w-full pl-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 bg-white transition-colors duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-neutral-400"
                />
              </div>
            </div>

            {/* Organización */}
            <div className="space-y-1">
              <label htmlFor="organizacion" className="block text-sm font-medium text-neutral-700">
                Organización
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="organizacion"
                  type="text"
                  value={formData.organizacion}
                  onChange={handleInputChange('organizacion')}
                  placeholder="Nombre de tu organización"
                  className="block w-full pl-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 bg-white transition-colors duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-neutral-400"
                />
              </div>
              <p className="text-sm text-neutral-500">
                Opcional: nombre de la empresa u organización
              </p>
            </div>

            {/* Rol */}
            <div className="space-y-1">
              <label htmlFor="rol" className="block text-sm font-medium text-neutral-700">
                Rol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserGroupIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <select
                  id="rol"
                  value={formData.rol}
                  onChange={handleInputChange('rol')}
                  className="block w-full pl-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 bg-white transition-colors duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-neutral-400"
                >
                  <option value={UserRole.USER}>Usuario</option>
                  <option value={UserRole.MANAGER}>Gerente</option>
                  <option value={UserRole.ORG_ADMIN}>Administrador de Organización</option>
                  <option value={UserRole.SUPER_ADMIN}>Super Administrador</option>
                </select>
              </div>
              <p className="text-sm text-neutral-500">
                Selecciona tu rol en la organización
              </p>
            </div>            {/* Separador para contraseña */}
            {!testMode && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <AiFillExclamationCircle className="mr-2 h-5 w-5" />
                  Deja en blanco para mantener la contraseña actual
                </div>

              {/* Nueva Contraseña */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      placeholder="Nueva contraseña (opcional)"
                      className="block w-full pr-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 bg-white transition-colors duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-neutral-400"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 cursor-pointer bg-transparent border-0 hover:bg-gray-50 hover:bg-opacity-50 rounded-r-lg"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-neutral-500">
                    Mínimo 6 caracteres
                  </p>
                </div>

                {/* Confirmar Contraseña */}
                {formData.password && (
                  <div className="space-y-1">
                    <label htmlFor="passwordConfirm" className="block text-sm font-medium text-neutral-700">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="passwordConfirm"
                        type={showPasswordConfirm ? 'text' : 'password'}
                        value={formData.passwordConfirm}
                        onChange={handleInputChange('passwordConfirm')}
                        placeholder="Confirma tu nueva contraseña"
                        className={`block w-full pr-10 px-3 py-2.5 border rounded-lg text-neutral-900 placeholder-neutral-500 bg-white transition-colors duration-200 focus:ring-2 hover:border-neutral-400 ${
                          formData.password !== formData.passwordConfirm && formData.passwordConfirm 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 cursor-pointer bg-transparent border-0 hover:bg-gray-50 hover:bg-opacity-50 rounded-r-lg"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        tabIndex={-1}
                        aria-label={showPasswordConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPasswordConfirm ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                        )}
                      </button>
                    </div>
                    {formData.password !== formData.passwordConfirm && formData.passwordConfirm && (
                      <p className="text-sm text-red-600" role="alert">
                        Las contraseñas no coinciden
                      </p>
                    )}
                  </div>                )}
              </div>
            </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full inline-flex items-center justify-center
                px-6 py-3 text-base font-medium rounded-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                ${loading 
                  ? 'bg-primary-400 text-white cursor-wait opacity-50' 
                  : 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md'
                }
              `}
            >
              {loading ? 'Actualizando...' : 'Actualizar Perfil'}
            </button>

            <div className="text-center">
              <Link
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                to="/dashboard"
              >
                Cancelar y volver al Dashboard
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
