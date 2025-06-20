import React from 'react'

interface PasswordStrengthProps {
  password: string
  show: boolean
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, show }) => {  const calculateStrength = (password: string): number => {
    let score = 0
    
    // Longitud 
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1
    
    // Contiene minúsculas
    if (/[a-z]/.test(password)) score += 1
    
    // Contiene mayúsculas
    if (/[A-Z]/.test(password)) score += 1
    
    // Contiene números
    if (/\d/.test(password)) score += 1
    
    // Contiene caracteres especiales
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    
    // Bonificaciones por complejidad
    if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) score += 1
    
    // Evita patrones comunes débiles
    const commonPatterns = [
      /123456/, /password/, /qwerty/, /admin/, /letmein/,
      /welcome/, /monkey/, /dragon/, /master/, /sunshine/
    ]
    const hasCommonPattern = commonPatterns.some(pattern => 
      pattern.test(password.toLowerCase())
    )
    if (hasCommonPattern) score -= 2
    
    // Evita repeticiones excesivas
    if (/(.)\1{2,}/.test(password)) score -= 1
    
    return Math.max(0, score) // Asegurar que el score no sea negativo
  }

  const getStrengthInfo = (score: number) => {
    if (score <= 2) {
      return {
        level: 'Muy Débil',
        color: 'bg-red-500',
        width: '20%',
        textColor: 'text-red-600',
        description: 'Contraseña fácil de adivinar'
      }
    } else if (score <= 4) {
      return {
        level: 'Débil',
        color: 'bg-orange-500',
        width: '40%',
        textColor: 'text-orange-600',
        description: 'Mejora la seguridad'
      }
    } else if (score <= 6) {
      return {
        level: 'Media',
        color: 'bg-warning-500',
        width: '60%',
        textColor: 'text-warning-600',
        description: 'Contraseña aceptable'
      }
    } else if (score <= 8) {
      return {
        level: 'Fuerte',
        color: 'bg-success-500',
        width: '80%',
        textColor: 'text-success-600',
        description: 'Buena seguridad'
      }
    } else {
      return {
        level: 'Muy Fuerte',
        color: 'bg-green-600',
        width: '100%',
        textColor: 'text-green-700',
        description: 'Excelente seguridad'
      }
    }
  }

  const getRequirements = (password: string) => [
    {
      text: 'Al menos 8 caracteres',
      met: password.length >= 8,
      essential: true
    },
    {
      text: 'Una letra minúscula (a-z)',
      met: /[a-z]/.test(password),
      essential: true
    },
    {
      text: 'Una letra mayúscula (A-Z)',
      met: /[A-Z]/.test(password),
      essential: true
    },
    {
      text: 'Un número (0-9)',
      met: /\d/.test(password),
      essential: true
    },
    {
      text: 'Un carácter especial (!@#$...)',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      essential: false
    },
    {
      text: '12+ caracteres (recomendado)',
      met: password.length >= 12,
      essential: false
    },
    {
      text: 'Sin patrones comunes',
      met: !/123456|password|qwerty|admin|letmein/i.test(password),
      essential: false
    }
  ]

  if (!show || !password) return null

  const strength = calculateStrength(password)
  const strengthInfo = getStrengthInfo(strength)
  const requirements = getRequirements(password)
  return (
    <div className="mt-2 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-600">Fortaleza de contraseña</span>
        <div className="text-right">
          <span className={`text-xs font-medium ${strengthInfo.textColor}`}>
            {strengthInfo.level}
          </span>
          <div className={`text-xs ${strengthInfo.textColor} opacity-75`}>
            {strengthInfo.description}
          </div>
        </div>
      </div>
      
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${strengthInfo.color}`}
          style={{ width: strengthInfo.width }}
        />
      </div>
      
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-neutral-700 mb-2">
          Requisitos:
        </div>
        {requirements.map((req, index) => (
          <div key={index} className={`
            flex items-center gap-2 text-xs transition-all duration-200
            ${req.essential ? 'opacity-100' : 'opacity-75'}
          `}>
            <div className={`
              w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0
              ${req.met ? 'bg-success-500' : (req.essential ? 'bg-red-400' : 'bg-neutral-300')}
              transition-colors duration-200
            `}>
              {req.met && (
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`
              ${req.met ? 'text-success-600' : (req.essential ? 'text-red-600' : 'text-neutral-500')}
              ${req.essential ? 'font-medium' : 'font-normal'}
            `}>
              {req.text}
              {req.essential && !req.met && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </span>
          </div>
        ))}
        
        {requirements.some(req => req.essential && !req.met) && (
          <div className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-200">
            <span className="font-medium">* Requisitos obligatorios</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PasswordStrength