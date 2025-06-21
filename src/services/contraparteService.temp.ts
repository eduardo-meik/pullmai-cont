// DEPRECATED: This service is no longer used in the new organization-based architecture
// Contrapartes are now relationships between organizations, not separate entities
// The functionality has been moved to contraparteOrganizacionService.ts

// This file is kept temporarily to avoid breaking imports, but should be removed
// once all references are updated

export default class ContraparteService {
  static instance: ContraparteService | null = null

  static getInstance(): ContraparteService {
    if (!ContraparteService.instance) {
      ContraparteService.instance = new ContraparteService()
    }
    return ContraparteService.instance
  }

  async getContrapartesByOrganization(): Promise<any[]> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
    return []
  }

  async getContraparteById(): Promise<any> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
    return null
  }

  async createContraparte(): Promise<string> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
    return ''
  }

  async updateContraparte(): Promise<void> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
  }

  async deleteContraparte(): Promise<void> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
  }

  async getContratosByContraparte(): Promise<any[]> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
    return []
  }

  async getContraparteEstadisticas(): Promise<any> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
    return {}
  }

  async searchContrapartes(): Promise<any[]> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
    return []
  }
}
