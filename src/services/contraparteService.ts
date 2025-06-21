// DEPRECATED: This service is no longer used in the new organization-based architecture
// Contrapartes are now relationships between organizations, not separate entities
// The functionality has been moved to contraparteOrganizacionService.ts

export default class ContraparteService {
  private static instance: ContraparteService | null = null

  static getInstance(): ContraparteService {
    if (!ContraparteService.instance) {
      ContraparteService.instance = new ContraparteService()
    }
    return ContraparteService.instance
  }

  // Static methods for backward compatibility
  static async getContrapartesByOrganization(): Promise<any[]> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
    return []
  }

  static async getContraparteById(): Promise<any> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
    return null
  }

  static async createContraparte(): Promise<string> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
    return ''
  }

  static async updateContraparte(): Promise<void> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
  }

  static async deleteContraparte(): Promise<void> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
  }

  static async getContratosByContraparte(): Promise<any[]> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
    return []
  }

  static async getContraparteEstadisticas(): Promise<any> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
    return {}
  }

  static async searchContrapartes(): Promise<any[]> {
    console.warn('ContraparteService is deprecated. Use ContraparteOrganizacionService instead.')
    return []
  }

  // Instance methods for backward compatibility
  async getContrapartesByOrganization(): Promise<any[]> {
    return ContraparteService.getContrapartesByOrganization()
  }

  async getContraparteById(): Promise<any> {
    return ContraparteService.getContraparteById()
  }

  async createContraparte(): Promise<string> {
    return ContraparteService.createContraparte()
  }

  async updateContraparte(): Promise<void> {
    return ContraparteService.updateContraparte()
  }

  async deleteContraparte(): Promise<void> {
    return ContraparteService.deleteContraparte()
  }

  async getContratosByContraparte(): Promise<any[]> {
    return ContraparteService.getContratosByContraparte()
  }

  async getContraparteEstadisticas(): Promise<any> {
    return ContraparteService.getContraparteEstadisticas()
  }

  async searchContrapartes(): Promise<any[]> {
    return ContraparteService.searchContrapartes()
  }
}
