import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EnvelopeIcon, LockClosedIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import Input from '../ui/Input'
import Button from '../ui/Button'
import SocialButton from '../ui/SocialButton'
import PasswordStrength from '../ui/PasswordStrength'
import { useAuth } from '../../contexts/AuthContext'
import { ETypes, MessageCard } from '../Atoms/MessageCard'

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

const ModernSignup: React.FC = () => {
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const { signup, googleSignin, githubSignin } = useAuth()
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showPasswordStrength, setShowPasswordStrength] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
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
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
    if (!/(?=.*[a-z])/.test(password)) return 'Debe contener al menos una letra minúscula'
    if (!/(?=.*[A-Z])/.test(password)) return 'Debe contener al menos una letra mayúscula'
    if (!/(?=.*\d)/.test(password)) return 'Debe contener al menos un número'
    return undefined
  }

  const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) return 'Confirma tu contraseña'
    if (password !== confirmPassword) return 'Las contraseñas no coinciden'
    return undefined
  }

  const validateForm = (): boolean => {
    const email = emailRef.current?.value || ''
    const password = passwordRef.current?.value || ''
    const confirmPassword = confirmPasswordRef.current?.value || ''
    
    const newErrors: FormErrors = {}
    
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword)
    
    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError
    
    if (!acceptTerms) {
      newErrors.general = 'Debes aceptar los términos y condiciones'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setLoading(true)
      setErrors({})
      
      await signup(emailRef.current?.value, passwordRef.current?.value)
      navigate('/')
    } catch (error: any) {
      let errorMessage = 'Error al crear la cuenta'
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Ya existe una cuenta con este correo electrónico'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil'
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Registro no permitido. Contacta al administrador'
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
      let errorMessage = `Error al registrarse con ${provider === 'google' ? 'Google' : 'GitHub'}`
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Registro cancelado'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqueado. Permite popups para este sitio'
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Ya existe una cuenta con este correo usando otro método'
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setShowPasswordStrength(newPassword.length > 0)
    handleInputChange('password')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <UserPlusIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Crea tu cuenta
          </h2>
          <p className="text-neutral-600">
            Únete a nosotros y comienza tu experiencia
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
              O regístrate con tu correo
            </span>
          </div>
        </div>

        {/* Signup Form */}
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

            <div>
              <Input
                id="password"
                ref={passwordRef}
                type="password"
                label="Contraseña"
                placeholder="Crea una contraseña segura"
                icon={<LockClosedIcon />}
                error={errors.password}
                onChange={handlePasswordChange}
                showPasswordToggle
                autoComplete="new-password"
                required
              />
              <PasswordStrength password={password} show={showPasswordStrength} />
            </div>

            <Input
              id="confirm-password"
              ref={confirmPasswordRef}
              type="password"
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              icon={<LockClosedIcon />}
              error={errors.confirmPassword}
              onChange={() => handleInputChange('confirmPassword')}
              showPasswordToggle
              autoComplete="new-password"
              required
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="accept-terms"
                name="accept-terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-colors"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="accept-terms" className="text-neutral-700">
                Acepto los{' '}
                <Link
                  to="/terms"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link
                  to="/privacy"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  política de privacidad
                </Link>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={socialLoading !== null || !acceptTerms}
          >
            Crear cuenta
          </Button>
        </form>

        {/* Login Link */}
        <div className="text-center animate-fade-in">
          <p className="text-sm text-neutral-600">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ModernSignup