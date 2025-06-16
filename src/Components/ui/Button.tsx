import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `

  const variantClasses = {
    primary: `
      bg-primary-600 text-white
      hover:bg-primary-700 active:bg-primary-800
      focus:ring-primary-500
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-secondary-100 text-secondary-900
      hover:bg-secondary-200 active:bg-secondary-300
      focus:ring-secondary-500
    `,
    outline: `
      border border-neutral-300 bg-white text-neutral-700
      hover:bg-neutral-50 active:bg-neutral-100
      focus:ring-primary-500
    `,
    ghost: `
      text-neutral-700
      hover:bg-neutral-100 active:bg-neutral-200
      focus:ring-primary-500
    `
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  }

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      {icon && !loading && icon}
      {children}
    </button>
  )
}

export default Button