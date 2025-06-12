import React from 'react'

interface PasswordStrengthProps {
  password: string
  show: boolean
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, show }) => {
  const calculateStrength = (password: string): number => {
    let score = 0
    
    // Longitud mínima
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    
    // Contiene minúsculas
    if (/[a-z]/.test(password)) score += 1
    
    // Contiene mayúsculas
    if (/[A-Z]/.test(password)) score += 1
    
    // Contiene números
    if (/\d/.test(password)) score += 1
    
    // Contiene caracteres especiales
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    
    return score
  }

  const getStrengthInfo = (score: number) => {
    if (score <= 2) {
      return {
        level: 'Débil',
        color: 'bg-error-500',
        width: '33%',
        textColor: 'text-error-600'
      }
    } else if (score <= 4) {
      return {
        level: 'Media',
        color: 'bg-warning-500',
        width: '66%',
        textColor: 'text-warning-600'
      }
    } else {
      return {
        level: 'Fuerte',
        color: 'bg-success-500',
        width: '100%',
        textColor: 'text-success-600'
      }
    }
  }

  const getRequirements = (password: string) => [
    {
      text: 'Al menos 8 caracteres',
      met: password.length >= 8
    },
    {
      text: 'Una letra minúscula',
      met: /[a-z]/.test(password)
    },
    {
      text: 'Una letra mayúscula',
      met: /[A-Z]/.test(password)
    },
    {
      text: 'Un número',
      met: /\d/.test(password)
    },
    {
      text: 'Un carácter especial',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ]

  if (!show || !password) return null

  const strength = calculateStrength(password)
  const strengthInfo = getStrengthInfo(strength)
  const requirements = getRequirements(password)

  return (
    <div className="mt-2 space-y-2 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-600">Fortaleza de contraseña</span>
        <span className={`text-xs font-medium ${strengthInfo.textColor}`}>
          {strengthInfo.level}
        </span>
      </div>
      
      <div className="w-full bg-neutral-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${strengthInfo.color}`}
          style={{ width: strengthInfo.width }}
        />
      </div>
      
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className={`
              w-3 h-3 rounded-full flex items-center justify-center
              ${req.met ? 'bg-success-500' : 'bg-neutral-300'}
              transition-colors duration-200
            `}>
              {req.met && (
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={req.met ? 'text-success-600' : 'text-neutral-500'}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PasswordStrength