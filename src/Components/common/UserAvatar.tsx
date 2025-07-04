import React from 'react'
import { useAuthStore } from '../../stores/authStore'

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const { usuario } = useAuthStore()

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm', 
    lg: 'h-12 w-12 text-lg'
  }

  const getInitials = (): string => {
    if (!usuario) return 'U'
    
    const firstName = usuario.nombre || ''
    const lastName = usuario.apellido || ''
    
    const firstInitial = firstName.charAt(0).toUpperCase()
    const lastInitial = lastName.charAt(0).toUpperCase()
    
    return `${firstInitial}${lastInitial}` || 'U'
  }

  const getBackgroundColor = (): string => {
    if (!usuario) return 'bg-gray-500'
    
    // Generate a consistent color based on user name
    const name = `${usuario.nombre}${usuario.apellido}`.toLowerCase()
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ]
    
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${getBackgroundColor()} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        font-semibold 
        ${className}
      `}
    >
      {getInitials()}
    </div>
  )
}

export default UserAvatar
