import React, { useState } from 'react'
import { BrandingConfig } from '../../types'

interface BrandSettingsProps {
  currentBranding?: BrandingConfig
  onSave: (branding: BrandingConfig) => void
  loading?: boolean
}

const BrandSettings: React.FC<BrandSettingsProps> = ({
  currentBranding,
  onSave,
  loading = false
}) => {
  const [branding, setBranding] = useState<BrandingConfig>({
    primaryColor: currentBranding?.primaryColor || '#0ea5e9',
    secondaryColor: currentBranding?.secondaryColor || '#64748b',
    navBackgroundColor: currentBranding?.navBackgroundColor || '#075985',
    navTextColor: currentBranding?.navTextColor || '#ffffff',
    ...currentBranding
  })

  const handleColorChange = (field: keyof BrandingConfig, value: string) => {
    setBranding(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave(branding)
  }

  const handleReset = () => {
    setBranding({
      primaryColor: '#0ea5e9',
      secondaryColor: '#64748b',
      navBackgroundColor: '#075985',
      navTextColor: '#ffffff'
    })
  }

  const colorPresets = [
    { name: 'Azul (Defecto)', primary: '#0ea5e9', nav: '#075985' },
    { name: 'Verde', primary: '#22c55e', nav: '#166534' },
    { name: 'Púrpura', primary: '#8b5cf6', nav: '#6d28d9' },
    { name: 'Rojo', primary: '#ef4444', nav: '#b91c1c' },
    { name: 'Naranja', primary: '#f59e0b', nav: '#d97706' },
    { name: 'Indigo', primary: '#6366f1', nav: '#4338ca' },
    { name: 'Rosa', primary: '#ec4899', nav: '#be185d' },
    { name: 'Esmeralda', primary: '#10b981', nav: '#047857' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configuración de Marca
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Personaliza los colores de tu organización para reflejar tu identidad de marca.
        </p>
      </div>

      {/* Color Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Paletas Predefinidas
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                handleColorChange('primaryColor', preset.primary)
                handleColorChange('navBackgroundColor', preset.nav)
              }}
              className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-center"
            >
              <div className="flex space-x-1 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.nav }}
                />
              </div>
              <span className="text-xs text-gray-600">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color Primario
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={branding.primaryColor || '#0ea5e9'}
              onChange={(e) => handleColorChange('primaryColor', e.target.value)}
              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={branding.primaryColor || '#0ea5e9'}
              onChange={(e) => handleColorChange('primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#0ea5e9"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color Secundario
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={branding.secondaryColor || '#64748b'}
              onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={branding.secondaryColor || '#64748b'}
              onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#64748b"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fondo de Navegación
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={branding.navBackgroundColor || '#075985'}
              onChange={(e) => handleColorChange('navBackgroundColor', e.target.value)}
              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={branding.navBackgroundColor || '#075985'}
              onChange={(e) => handleColorChange('navBackgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#075985"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texto de Navegación
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={branding.navTextColor || '#ffffff'}
              onChange={(e) => handleColorChange('navTextColor', e.target.value)}
              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={branding.navTextColor || '#ffffff'}
              onChange={(e) => handleColorChange('navTextColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Vista Previa de la Navegación
        </label>
        <div 
          className="p-4 rounded-lg border-2 border-dashed border-gray-300"
          style={{ 
            backgroundColor: branding.navBackgroundColor || '#075985',
            color: branding.navTextColor || '#ffffff'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded"></div>
              <span className="font-semibold">Pullmai</span>
              <span className="opacity-75">| {currentBranding ? 'Tu Organización' : 'Organización'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded"></div>
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: branding.primaryColor || '#0ea5e9' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Restablecer
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  )
}

export default BrandSettings
