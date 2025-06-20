import React, { useState, forwardRef } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  showPasswordToggle?: boolean
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, showPasswordToggle, icon, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    // Removed isFocused state to eliminate spotlight effect

    const inputType = showPasswordToggle 
      ? (showPassword ? 'text' : 'password')
      : props.type

    return (
      <div className="space-y-1">
        <label 
          htmlFor={props.id}
          className="block text-sm font-medium text-neutral-700"
        >
          {label}
        </label>
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-neutral-400">
                {icon}
              </div>
            </div>
          )}            <input
            ref={ref}
            className={`
              block w-full px-3 py-2.5 
              ${icon ? 'pl-10' : ''} 
              ${showPasswordToggle ? 'pr-10' : ''}
              border border-neutral-300 rounded-lg
              text-neutral-900 placeholder-neutral-500
              bg-white
              transition-colors duration-200              focus:border-primary-500
              hover:border-neutral-400
              ${error ? 'border-error-500 focus:border-error-500' : ''}
              ${className}
            `}
            onFocus={(e) => {
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              props.onBlur?.(e)
            }}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${props.id}-error` : 
              helperText ? `${props.id}-helper` : undefined
            }
            {...{ ...props, type: inputType }}
          />
          
          {showPasswordToggle && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 cursor-pointer bg-transparent border-0 hover:bg-gray-50 hover:bg-opacity-50 rounded-r-lg"              onClick={() => {
                setShowPassword(prev => !prev)
              }}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
              )}
            </button>
          )}
        </div>
        
        {error && (
          <p 
            id={`${props.id}-error`}
            className="text-sm text-error-600 animate-fade-in"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id={`${props.id}-helper`}
            className="text-sm text-neutral-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input