import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { ContractTemplate, TemplateFormData, AutoFillData, GeneratedContract } from '../types/templates';

// Import JSON templates
import laborTemplate from '../data/contract-templates/labor.json';
import servicesTemplate from '../data/contract-templates/services.json';
import acquisitionTemplate from '../data/contract-templates/acquisition.json';
import consultancyTemplate from '../data/contract-templates/consultancy.json';

const TEMPLATES_COLLECTION = 'contract_templates';
const GENERATED_CONTRACTS_COLLECTION = 'generated_contracts';

class TemplateService {
  // System templates from JSON files
  private systemTemplates: ContractTemplate[] = [
    laborTemplate as ContractTemplate,
    servicesTemplate as ContractTemplate,
    acquisitionTemplate as ContractTemplate,
    consultancyTemplate as ContractTemplate
  ];

  /**
   * Get all available templates (system + organization custom)
   */
  async getAllTemplates(organizationId?: string): Promise<ContractTemplate[]> {
    const templates = [...this.systemTemplates];

    if (organizationId) {
      const customTemplates = await this.getCustomTemplates(organizationId);
      templates.push(...customTemplates);
    }

    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string, organizationId?: string): Promise<ContractTemplate[]> {
    const allTemplates = await this.getAllTemplates(organizationId);
    return allTemplates.filter(template => template.category === category);
  }

  /**
   * Get a specific template by ID
   */
  async getTemplateById(templateId: string, organizationId?: string): Promise<ContractTemplate | null> {
    // Check system templates first
    const systemTemplate = this.systemTemplates.find(t => t.id === templateId);
    if (systemTemplate) {
      return systemTemplate;
    }

    // Check Firestore for custom templates
    if (organizationId) {
      try {
        const templateDoc = await getDoc(doc(db, TEMPLATES_COLLECTION, templateId));
        if (templateDoc.exists()) {
          const data = templateDoc.data();
          return {
            id: templateDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          } as ContractTemplate;
        }
      } catch (error) {
        console.error('Error fetching custom template:', error);
      }
    }

    return null;
  }

  /**
   * Get custom templates for an organization
   */
  async getCustomTemplates(organizationId: string): Promise<ContractTemplate[]> {
    try {
      const q = query(
        collection(db, TEMPLATES_COLLECTION),
        where('organizationId', '==', organizationId),
        where('isActive', '==', true),
        orderBy('name')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as ContractTemplate[];
    } catch (error) {
      console.error('Error fetching custom templates:', error);
      return [];
    }
  }

  /**
   * Create a custom template
   */
  async createCustomTemplate(
    template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<string> {
    try {
      const templateData = {
        ...template,
        isSystem: false,
        isActive: true,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), templateData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating custom template:', error);
      throw new Error('No se pudo crear la plantilla personalizada');
    }
  }

  /**
   * Update a custom template
   */
  async updateCustomTemplate(
    templateId: string,
    updates: Partial<ContractTemplate>,
    userId: string
  ): Promise<void> {
    try {
      const templateRef = doc(db, TEMPLATES_COLLECTION, templateId);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating custom template:', error);
      throw new Error('No se pudo actualizar la plantilla');
    }
  }

  /**
   * Delete a custom template (soft delete)
   */
  async deleteCustomTemplate(templateId: string): Promise<void> {
    try {
      const templateRef = doc(db, TEMPLATES_COLLECTION, templateId);
      await updateDoc(templateRef, {
        isActive: false,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error deleting custom template:', error);
      throw new Error('No se pudo eliminar la plantilla');
    }
  }

  /**
   * Generate contract content from template and form data
   */
  generateContract(template: ContractTemplate, formData: TemplateFormData, autoFillData?: AutoFillData): string {
    let content = template.content;

    // Replace auto-fill placeholders first
    if (autoFillData) {
      // Add common contract fields
      const today = new Date();
      const contractData = {
        fecha_contrato: today.toLocaleDateString('es-CL'),
        ciudad: autoFillData.contract?.city || 'Santiago',
        ...autoFillData.contract
      };

      // Replace contract fields
      Object.entries(contractData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value?.toString() || '');
      });
    }

    // Replace form data placeholders
    Object.entries(formData).forEach(([fieldId, value]) => {
      const regex = new RegExp(`{{${fieldId}}}`, 'g');
      let formattedValue = value;

      // Format currency values
      const field = template.fields.find(f => f.id === fieldId);
      if (field?.type === 'currency' && typeof value === 'number') {
        formattedValue = new Intl.NumberFormat('es-CL').format(value);
      }

      content = content.replace(regex, formattedValue?.toString() || '');
    });

    // Handle conditional blocks (simple implementation)
    content = content.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, fieldName, blockContent) => {
      const fieldValue = formData[fieldName];
      return fieldValue && fieldValue !== '' ? blockContent : '';
    });

    return content;
  }

  /**
   * Auto-fill form data based on organization and contraparte info
   */
  async autoFillFormData(
    template: ContractTemplate,
    autoFillData: AutoFillData
  ): Promise<TemplateFormData> {
    console.log('autoFillFormData called', { 
      templateId: template.id, 
      templateName: template.name,
      fieldsCount: template.fields.length,
      autoFillData 
    });
    
    const formData: TemplateFormData = {};

    template.fields.forEach((field, index) => {
      console.log(`Processing field ${index + 1}/${template.fields.length}:`, {
        fieldId: field.id,
        fieldLabel: field.label,
        autoFill: field.autoFill
      });
      
      if (field.autoFill) {
        try {
          console.log(`Getting nested value for ${field.id} with path: ${field.autoFill}`);
          const value = this.getNestedValue(autoFillData, field.autoFill);
          console.log(`Value retrieved for ${field.id}:`, value);
          
          if (value !== undefined) {
            formData[field.id] = value;
          }
        } catch (error) {
          console.error(`Error processing field ${field.id}:`, error);
        }
      }
    });

    console.log('autoFillFormData completed', { formData });
    return formData;
  }

  /**
   * Save a generated contract
   */
  async saveGeneratedContract(
    templateId: string,
    templateName: string,
    formData: TemplateFormData,
    generatedContent: string,
    organizationId: string,
    userId: string
  ): Promise<string> {
    try {
      const contractData: Omit<GeneratedContract, 'id'> = {
        templateId,
        templateName,
        formData,
        generatedContent,
        organizationId,
        createdBy: userId,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, GENERATED_CONTRACTS_COLLECTION), contractData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving generated contract:', error);
      throw new Error('No se pudo guardar el contrato generado');
    }
  }

  /**
   * Get generated contracts for an organization
   */
  async getGeneratedContracts(organizationId: string): Promise<GeneratedContract[]> {
    try {
      const q = query(
        collection(db, GENERATED_CONTRACTS_COLLECTION),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          templateId: data.templateId,
          templateName: data.templateName,
          formData: data.formData,
          generatedContent: data.generatedContent,
          organizationId: data.organizationId,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate()
        } as GeneratedContract;
      });
    } catch (error) {
      console.error('Error fetching generated contracts:', error);
      return [];
    }
  }

  /**
   * Helper function to get nested object values with field name mapping
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    
    const parts = path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (!current || current === null || current === undefined) {
        return undefined;
      }
      
      // Handle field name mapping for organization
      if (i === 1 && parts[0] === 'organization' && current === obj.organization) {
        switch (part) {
          case 'name':
            return current.nombre || current.name;
          case 'address':
            return current.direccion || current.address;
          case 'legalRep':
            return current.representanteLegal || current.legalRep;
          case 'legalRepRut':
            return current.rutRepresentanteLegal || current.legalRepRut;
          case 'entityType':
            return current.tipoEntidad || current.entityType;
          default:
            return current[part];
        }
      }
      
      // Handle field name mapping for contraparte
      if (i === 1 && parts[0] === 'contraparte' && current === obj.contraparte) {
        switch (part) {
          case 'name':
            return current.nombre || current.name;
          case 'address':
            return current.direccion || current.address;
          case 'entityType':
            return current.tipoEntidad || current.entityType;
          default:
            return current[part];
        }
      }
      
      // Normal property access
      current = current[part];
    }
    
    return current;
  }
}

export const templateService = new TemplateService();
