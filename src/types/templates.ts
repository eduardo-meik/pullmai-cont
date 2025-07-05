export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'currency' | 'checkbox';
  required: boolean;
  autoFill?: string; // Path like "organization.name", "contraparte.rut"
  options?: { value: string; label: string }[];
  currency?: string;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  isSystem: boolean;
  organizationId?: string; // For custom templates
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  fields: TemplateField[];
  content: string; // Template content with {{field}} placeholders
}

export interface TemplateFormData {
  [fieldId: string]: any;
}

export interface AutoFillData {
  organization?: {
    nombre: string;
    rut: string;
    direccion: string;
    ciudad?: string;
    telefono?: string;
    email?: string;
    representanteLegal?: string;
    rutRepresentanteLegal?: string;
    tipoEntidad?: 'empresa' | 'persona_natural';
    // Legacy field mappings for template compatibility
    name?: string;
    address?: string;
    phone?: string;
    legalRep?: string;
    legalRepRut?: string;
    entityType?: string;
  };
  contraparte?: {
    nombre: string;
    rut: string;
    direccion: string;
    email?: string;
    telefono?: string;
    personaContacto?: string;
    tipoEntidad?: 'empresa' | 'persona_natural';
    // Legacy field mappings for template compatibility
    name?: string;
    address?: string;
    phone?: string;
    contactPerson?: string;
    entityType?: string;
  };
  contract?: {
    date: string;
    city: string;
    number?: string;
  };
}

export interface GeneratedContract {
  templateId: string;
  templateName: string;
  formData: TemplateFormData;
  generatedContent: string;
  createdAt: Date;
  organizationId: string;
  createdBy: string;
}

export type TemplateCategory = 'laboral' | 'servicios' | 'comercial' | 'arrendamiento' | 'confidencialidad' | 'otros';

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'laboral', label: 'Laboral' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'arrendamiento', label: 'Arrendamiento' },
  { value: 'confidencialidad', label: 'Confidencialidad' },
  { value: 'otros', label: 'Otros' }
];
