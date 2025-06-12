import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'
import Input from '../ui/Input'
import Button from '../ui/Button'
import SocialButton from '../ui/SocialButton'
import PasswordStrength from '../ui/PasswordStrength'
import { useAuth } from '../../contexts/AuthContext'
import { ETypes, MessageCard } from '../Atoms/MessageCard'

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

const ModernLogin: React.FC = () => {
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const { login, googleSignin, githubSignin } = useAuth()
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'El correo electrónico es obligatorio'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Por favor, introduce un correo electrónico válido'
    }
    return undefined
  }

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'La contraseña es obligatoria'
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    return undefined
  }

  const validateForm = (): boolean => {
    const email = emailRef.current?.value || ''
    const password = passwordRef.current?.value || ''
    
    const newErrors: FormErrors = {}
    
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setLoading(true)
      setErrors({})
      
      await login(emailRef.current?.value, passwordRef.current?.value)
      navigate('/')
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión'
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Esta cuenta ha sido deshabilitada'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde'
      }
      
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setSocialLoading(provider)
      setErrors({})
      
      if (provider === 'google') {
        await googleSignin()
      } else if (provider === 'github') {
        await githubSignin()
      }
      
      navigate('/')
    } catch (error: any) {
      let errorMessage = `Error al iniciar sesión con ${provider === 'google' ? 'Google' : 'GitHub'}`
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Inicio de sesión cancelado'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqueado. Permite popups para este sitio'
      }
      
      setErrors({ general: errorMessage })
    } finally {
      setSocialLoading(null)
    }
  }

  const handleInputChange = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Bienvenido de vuelta
          </h2>
          <p className="text-neutral-600">
            Inicia sesión en tu cuenta para continuar
          </p>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="animate-shake">
            <MessageCard
              message={errors.general}
              type={ETypes.DANGER}
              visible={true}
            />
          </div>
        )}

        {/* Social Login */}
        <div className="space-y-3 animate-slide-in">
          <SocialButton
            provider="google"
            onClick={() => handleSocialLogin('google')}
            loading={socialLoading === 'google'}
            disabled={loading || socialLoading !== null}
          />
          <SocialButton
            provider="github"
            onClick={() => handleSocialLogin('github')}
            loading={socialLoading === 'github'}
            disabled={loading || socialLoading !== null}
          />
        </div>

        {/* Divider */}
        <div className="relative animate-fade-in">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-neutral-500 font-medium">
              O continúa con tu correo
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form className="space-y-6 animate-fade-in" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              id="email"
              ref={emailRef}
              type="email"
              label="Correo electrónico"
              placeholder="tu@ejemplo.com"
              icon={<EnvelopeIcon />}
              error={errors.email}
              onChange={() => handleInputChange('email')}
              autoComplete="email"
              required
            />

            <Input
              id="password"
              ref={passwordRef}
              type="password"
              label="Contraseña"
              placeholder="Tu contraseña"
              icon={<LockClosedIcon />}
              error={errors.password}
              onChange={() => handleInputChange('password')}
              showPasswordToggle
              autoComplete="current-password"
              required
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-colors"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                Recordar sesión
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={socialLoading !== null}
          >
            Iniciar sesión
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center animate-fade-in">
          <p className="text-sm text-neutral-600">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ModernLogin