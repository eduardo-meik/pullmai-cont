import { useEffect } from 'react'
import { useCurrentOrganization } from './useCurrentOrganization'

/**
 * Hook to apply organization branding to the document
 * Sets CSS custom properties for brand colors that can be used by Tailwind
 */
export function useOrganizationBranding() {
  const { organizacion } = useCurrentOrganization()

  useEffect(() => {
    const root = document.documentElement

    if (organizacion?.branding) {
      const { branding } = organizacion

      // Helper function to convert hex to RGB values
      const hexToRgb = (hex: string): string => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        if (result) {
          const r = parseInt(result[1], 16)
          const g = parseInt(result[2], 16)
          const b = parseInt(result[3], 16)
          return `${r} ${g} ${b}`
        }
        return '0 0 0'
      }

      // Generate color palette from primary color
      const generateColorPalette = (baseColor: string) => {
        // This is a simplified palette generation
        // In a real app, you might want to use a color manipulation library
        const rgb = hexToRgb(baseColor)
        return {
          50: `${rgb.split(' ').map(c => Math.min(255, parseInt(c) + 50)).join(' ')}`,
          100: `${rgb.split(' ').map(c => Math.min(255, parseInt(c) + 40)).join(' ')}`,
          200: `${rgb.split(' ').map(c => Math.min(255, parseInt(c) + 30)).join(' ')}`,
          300: `${rgb.split(' ').map(c => Math.min(255, parseInt(c) + 20)).join(' ')}`,
          400: `${rgb.split(' ').map(c => Math.min(255, parseInt(c) + 10)).join(' ')}`,
          500: rgb,
          600: `${rgb.split(' ').map(c => Math.max(0, parseInt(c) - 10)).join(' ')}`,
          700: `${rgb.split(' ').map(c => Math.max(0, parseInt(c) - 20)).join(' ')}`,
          800: `${rgb.split(' ').map(c => Math.max(0, parseInt(c) - 30)).join(' ')}`,
          900: `${rgb.split(' ').map(c => Math.max(0, parseInt(c) - 40)).join(' ')}`
        }
      }

      // Set brand colors
      if (branding.primaryColor) {
        const palette = generateColorPalette(branding.primaryColor)
        Object.entries(palette).forEach(([shade, rgb]) => {
          root.style.setProperty(`--brand-${shade}`, rgb)
        })
      }

      // Set navigation colors
      if (branding.navBackgroundColor) {
        root.style.setProperty('--nav-bg', hexToRgb(branding.navBackgroundColor))
        // Generate a slightly lighter version for hover
        const rgb = hexToRgb(branding.navBackgroundColor)
        const hoverRgb = rgb.split(' ').map(c => Math.min(255, parseInt(c) + 15)).join(' ')
        root.style.setProperty('--nav-bg-hover', hoverRgb)
      }

      if (branding.navTextColor) {
        root.style.setProperty('--nav-text', branding.navTextColor)
        root.style.setProperty('--nav-text-hover', branding.navTextColor)
        // Generate a muted version
        const rgb = hexToRgb(branding.navTextColor)
        const mutedRgb = rgb.split(' ').map(c => Math.max(0, parseInt(c) - 30)).join(' ')
        root.style.setProperty('--nav-text-muted', `rgb(${mutedRgb})`)
      }

      // Apply custom CSS if provided
      if (branding.customCSS) {
        let styleElement = document.getElementById('org-custom-styles')
        if (!styleElement) {
          styleElement = document.createElement('style')
          styleElement.id = 'org-custom-styles'
          document.head.appendChild(styleElement)
        }
        styleElement.textContent = branding.customCSS
      }
    } else {
      // Reset to default values if no branding is set
      root.style.removeProperty('--nav-bg')
      root.style.removeProperty('--nav-bg-hover')
      root.style.removeProperty('--nav-text')
      root.style.removeProperty('--nav-text-hover')
      root.style.removeProperty('--nav-text-muted')

      // Remove custom styles
      const styleElement = document.getElementById('org-custom-styles')
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [organizacion])

  return {
    organizacion,
    branding: organizacion?.branding
  }
}
