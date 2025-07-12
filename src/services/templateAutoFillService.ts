import { ContraparteAutoCreationService } from './contraparteAutoCreationService';
import { TemplateFormData, ContractTemplate } from '../types/templates';
import { EstadoContrato } from '../types';

export interface EnhancedAutoFillData {
  // Basic contract info
  titulo?: string;
  monto?: number;
  moneda?: string;
  
  // Contraparte information
  contraparteNombre?: string;
  contraparteRut?: string;
  contraparte_direccion?: string;
  contraparte_email?: string;
  contraparte_telefono?: string;
  
  // Organization information
  organizacion_nombre?: string;
  organizacion_rut?: string;
  organizacion_direccion?: string;
  
  // Project information
  proyecto?: string;
  proyectoId?: string;
  
  // Additional fields
  descripcion?: string;
  fechaInicio?: string;
  fechaTermino?: string;
}

export class TemplateAutoFillService {
  
  /**
   * Extract contraparte and monto information from template form data
   */
  static extractContraparteAndMontoFromFormData(
    formData: TemplateFormData, 
    template: ContractTemplate
  ): { contraparteData: any; monto: number } {
    
    const contraparteData: any = {};
    let monto = 0;
    
    // Extract contraparte information based on template category and field mapping
    const contraparteFieldMappings = {
      // Labor contract mappings
      'trabajador_nombre': 'nombre',
      'trabajador_rut': 'rut', 
      'trabajador_direccion': 'direccion',
      'trabajador_email': 'email',
      'trabajador_telefono': 'telefono',
      
      // Services contract mappings
      'contratista_nombre': 'nombre',
      'contratista_rut': 'rut',
      'contratista_direccion': 'direccion',
      'contratista_email': 'email',
      'contratista_telefono': 'telefono',
      
      // Acquisition contract mappings
      'proveedor_nombre': 'nombre',
      'proveedor_rut': 'rut',
      'proveedor_direccion': 'direccion',
      'proveedor_email': 'email',
      'proveedor_telefono': 'telefono',
      
      // Consultancy contract mappings
      'consultor_nombre': 'nombre',
      'consultor_rut': 'rut',
      'consultor_direccion': 'direccion',
      'consultor_email': 'email',
      'consultor_telefono': 'telefono',
      
      // Generic contraparte mappings
      'contraparte_nombre': 'nombre',
      'contraparte_rut': 'rut',
      'contraparte_direccion': 'direccion',
      'contraparte_email': 'email',
      'contraparte_telefono': 'telefono'
    };
    
    // Extract contraparte data
    Object.entries(contraparteFieldMappings).forEach(([templateField, contraparteField]) => {
      if (formData[templateField]) {
        contraparteData[contraparteField] = formData[templateField];
      }
    });
    
    // Extract monto information based on common field names
    const montoFieldMappings = [
      'valor_total', 'monto_total', 'precio_total',
      'sueldo_base', 'remuneracion', 'honorarios',
      'precio', 'costo', 'valor', 'amount', 'monto'
    ];
    
    for (const field of montoFieldMappings) {
      if (formData[field]) {
        const parsedMonto = typeof formData[field] === 'string' 
          ? parseFloat(formData[field].replace(/[^\d.-]/g, ''))
          : Number(formData[field]);
        
        if (!isNaN(parsedMonto) && parsedMonto > 0) {
          monto = parsedMonto;
          break;
        }
      }
    }
    
    return { contraparteData, monto };
  }
  
  /**
   * Create or find contraparte and prepare enhanced form data
   */
  static async prepareEnhancedFormData(
    formData: TemplateFormData,
    template: ContractTemplate,
    organizationId: string,
    userId: string
  ): Promise<{ 
    enhancedFormData: TemplateFormData; 
    contraparteId?: string; 
    monto: number 
  }> {
    
    const { contraparteData, monto } = this.extractContraparteAndMontoFromFormData(formData, template);
    
    let contraparteId: string | undefined;
    
    // Create or find contraparte if we have contraparte data
    if (contraparteData.nombre && contraparteData.nombre.trim()) {
      try {
        console.log('Creating/finding contraparte for:', contraparteData.nombre);
        
        // Check if contraparte already exists
        const existingContraparte = await ContraparteAutoCreationService.findContraparteByName(
          contraparteData.nombre
        );
        
        if (existingContraparte) {
          contraparteId = existingContraparte.id;
          console.log('Found existing contraparte:', contraparteId);
        } else {
          // Create new contraparte with enhanced data
          contraparteId = await ContraparteAutoCreationService.createEnhancedContraparte(
            contraparteData.nombre,
            userId,
            {
              rut: contraparteData.rut || '',
              direccion: contraparteData.direccion || '',
              email: contraparteData.email || '',
              telefono: contraparteData.telefono || '',
              tipoEntidad: 'empresa' // Default to empresa
            }
          );
          console.log('Created new enhanced contraparte:', contraparteId);
        }
        
      } catch (error) {
        console.error('Error creating/finding contraparte:', error);
        // Continue without contraparte if creation fails
      }
    }
    
    // Enhance form data with extracted information
    const enhancedFormData = {
      ...formData,
      contraparteId,
      contraparte: contraparteData.nombre || formData.contraparte || '',
      monto: monto || formData.monto || 0,
      organizacionId: organizationId
    };
    
    return {
      enhancedFormData,
      contraparteId,
      monto
    };
  }
  
  /**
   * Generate auto-fill data from template form for contract creation
   */
  static generateAutoFillFromTemplate(
    formData: TemplateFormData,
    template: ContractTemplate
  ): EnhancedAutoFillData {
    
    const { contraparteData, monto } = this.extractContraparteAndMontoFromFormData(formData, template);
    
    return {
      titulo: formData.titulo || formData.contract_title || `Contrato basado en ${template.name}`,
      monto,
      moneda: formData.moneda || formData.currency || 'CLP',
      contraparteNombre: contraparteData.nombre,
      contraparteRut: contraparteData.rut,
      contraparte_direccion: contraparteData.direccion,
      contraparte_email: contraparteData.email,
      contraparte_telefono: contraparteData.telefono,
      descripcion: formData.descripcion || formData.contract_description || `Contrato generado desde plantilla: ${template.name}`,
      fechaInicio: formData.fecha_inicio,
      fechaTermino: formData.fecha_termino,
      proyecto: formData.proyecto,
      proyectoId: formData.proyectoId
    };
  }
}
