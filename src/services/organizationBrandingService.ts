import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { BrandingConfig } from '../types'

export class OrganizationBrandingService {
  /**
   * Update organization branding configuration
   */
  static async updateBranding(organizacionId: string, branding: BrandingConfig): Promise<void> {
    try {
      const orgRef = doc(db, 'organizaciones', organizacionId)
      await updateDoc(orgRef, {
        branding: branding,
        fechaActualizacion: new Date()
      })
    } catch (error) {
      console.error('Error updating organization branding:', error)
      throw new Error('Error al actualizar la configuración de marca')
    }
  }

  /**
   * Reset organization branding to default
   */
  static async resetBranding(organizacionId: string): Promise<void> {
    try {
      const orgRef = doc(db, 'organizaciones', organizacionId)
      await updateDoc(orgRef, {
        branding: null,
        fechaActualizacion: new Date()
      })
    } catch (error) {
      console.error('Error resetting organization branding:', error)
      throw new Error('Error al restablecer la configuración de marca')
    }
  }

  /**
   * Get organization's custom CSS for branding
   */
  static generateCustomCSS(branding: BrandingConfig): string {
    const { primaryColor, secondaryColor, navBackgroundColor, navTextColor } = branding

    // Helper function to convert hex to RGB
    const hexToRgb = (hex: string): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (result) {
        const r = parseInt(result[1], 16)
        const g = parseInt(result[2], 16)
        const b = parseInt(result[3], 16)
        return `${r}, ${g}, ${b}`
      }
      return '0, 0, 0'
    }

    // Generate lighter and darker shades
    const generateShades = (baseColor: string) => {
      const rgb = hexToRgb(baseColor)
      const [r, g, b] = rgb.split(', ').map(Number)
      
      return {
        50: `${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}`,
        100: `${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}`,
        200: `${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)}`,
        300: `${Math.min(255, r + 20)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 20)}`,
        400: `${Math.min(255, r + 10)}, ${Math.min(255, g + 10)}, ${Math.min(255, b + 10)}`,
        500: rgb,
        600: `${Math.max(0, r - 10)}, ${Math.max(0, g - 10)}, ${Math.max(0, b - 10)}`,
        700: `${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)}`,
        800: `${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}`,
        900: `${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}`
      }
    }

    let css = ':root {\n'

    // Set brand colors
    if (primaryColor) {
      const shades = generateShades(primaryColor)
      Object.entries(shades).forEach(([shade, rgb]) => {
        css += `  --brand-${shade}: ${rgb};\n`
      })
    }

    // Set navigation colors
    if (navBackgroundColor) {
      const navRgb = hexToRgb(navBackgroundColor)
      css += `  --nav-bg: ${navRgb};\n`
      
      // Generate hover color (slightly lighter)
      const [r, g, b] = navRgb.split(', ').map(Number)
      const hoverRgb = `${Math.min(255, r + 15)}, ${Math.min(255, g + 15)}, ${Math.min(255, b + 15)}`
      css += `  --nav-bg-hover: ${hoverRgb};\n`
    }

    if (navTextColor) {
      css += `  --nav-text: ${navTextColor};\n`
      css += `  --nav-text-hover: ${navTextColor};\n`
      
      // Generate muted text color
      const textRgb = hexToRgb(navTextColor)
      const [r, g, b] = textRgb.split(', ').map(Number)
      const mutedRgb = `${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}`
      css += `  --nav-text-muted: rgb(${mutedRgb});\n`
    }

    if (primaryColor) {
      css += `  --nav-accent: ${hexToRgb(primaryColor)};\n`
      css += `  --nav-border: ${hexToRgb(primaryColor)};\n`
    }

    css += '}\n'

    return css
  }
}
