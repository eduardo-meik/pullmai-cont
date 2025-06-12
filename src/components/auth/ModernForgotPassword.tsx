import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { ETypes, MessageCard } from '../Atoms/MessageCard'

interface FormErrors {
  email?: string
  general?: string
}

const ModernForgotPassword: React.FC = () => {
  const emailRef = useRef<HTMLInputElement>(null)
  const { resetPassword } = useAuth()
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'El correo electrónico es obligatorio'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Por favor, introduce un correo electrónico válido'
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const email = emailRef.current?.value || ''
    const newErrors: FormErrors = {}
    
    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setLoading(true)
      setErrors({})
      
      await resetPassword(emailRef.current?.value)
      setSuccess(true)
    } catch (error: any) {
      let errorMessage = 'Error al enviar el correo de recuperación'
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Intenta más tarde'
      }
      
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = () => {
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center animate-fade-in">
            <div className="mx-auto h-16 w-16 bg-success-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">
              Correo enviado
            </h2>
            <p className="text-neutral-600 mb-6">
              Hemos enviado las instrucciones de recuperación a tu correo electrónico.
              Revisa tu bandeja de entrada y sigue los pasos para restablecer tu contraseña.
            </p>
            <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-success-700">
                <strong>¿No ves el correo?</strong> Revisa tu carpeta de spam o correo no deseado.
                El correo puede tardar unos minutos en llegar.
              </p>
            </div>
            <div className="space-y-4">
              <Button
                onClick={() => setSuccess(false)}
                variant="outline"
                size="lg"
                fullWidth
              >
                Enviar otro correo
              </Button>
              <Link to="/login">
                <Button variant="primary" size="lg" fullWidth>
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <EnvelopeIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Recuperar contraseña
          </h2>
          <p className="text-neutral-600">
            Introduce tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña
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

        {/* Reset Form */}
        <form className="space-y-6 animate-fade-in" onSubmit={handleSubmit}>
          <Input
            id="email"
            ref={emailRef}
            type="email"
            label="Correo electrónico"
            placeholder="tu@ejemplo.com"
            icon={<EnvelopeIcon />}
            error={errors.email}
            onChange={handleInputChange}
            autoComplete="email"
            helperText="Introduce el correo asociado a tu cuenta"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Enviar instrucciones
          </Button>
        </form>

        {/* Back to Login */}
        <div className="text-center animate-fade-in">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ModernForgotPassword