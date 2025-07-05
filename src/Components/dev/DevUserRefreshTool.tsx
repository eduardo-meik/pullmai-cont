import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthStore } from '../../stores/authStore'

/**
 * Development tool for clearing cached user data and forcing refresh
 * This should only be used during development to fix cache issues
 */
const DevUserRefreshTool: React.FC = () => {
  const { refreshUserData, logout } = useAuth()
  const { usuario, logout: logoutFromStore } = useAuthStore()
  const [isVisible, setIsVisible] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)

  const handleClearCacheAndRefresh = async () => {
    try {
      console.log('🔧 Clearing localStorage cache...')
      
      // Clear all potential localStorage keys
      const keys = ['auth-storage', 'usuario', 'pullmai-auth', 'firebase-auth']
      keys.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
      
      console.log('🔄 Refreshing user data...')
      await refreshUserData()
      
      console.log('✅ Cache cleared and user data refreshed!')
      window.location.reload() // Force full page reload
      
    } catch (error) {
      console.error('❌ Error refreshing user data:', error)
      alert('Error refreshing user data. Check console for details.')
    }
  }

  const handleForceLogoutLogin = async () => {
    try {
      console.log('🚪 Forcing logout and clearing all data...')
      
      // Clear localStorage
      localStorage.clear()
      sessionStorage.clear()
      
      // Logout from auth
      await logout()
      
      console.log('✅ Logged out. Please log in again.')
      
    } catch (error) {
      console.error('❌ Error during logout:', error)
    }
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // If closed completely, show a small floating button to reopen
  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          cursor: 'pointer',
          fontSize: '16px',
          zIndex: 9999,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Show Dev Tools"
      >
        🔧
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#ff6b6b',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      zIndex: 9999,
      fontSize: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: isMinimized ? '0' : '8px',
        fontWeight: 'bold' 
      }}>
        <span>🔧 DEV TOOLS</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '0 2px'
            }}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '0 2px'
            }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div style={{ marginBottom: '8px', fontSize: '10px' }}>
            Current User: {usuario?.email || 'None'}
            <br />
            Org ID: {usuario?.organizacionId || 'None'}
            <br />
            Role: {usuario?.rol || 'None'}
          </div>
          
          <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
            <button 
              onClick={handleClearCacheAndRefresh}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: '4px',
                background: '#fff',
                color: '#ff6b6b',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Clear Cache & Refresh
            </button>
            
            <button 
              onClick={handleForceLogoutLogin}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: '4px',
                background: '#333',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Force Logout
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default DevUserRefreshTool
