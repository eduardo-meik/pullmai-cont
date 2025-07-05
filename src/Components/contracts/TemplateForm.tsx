import React, { useState, useEffect, useCallback } from 'react';
import { ContractTemplate, TemplateField, TemplateFormData, AutoFillData } from '../../types/templates';
import { templateService } from '../../services/templateService';

interface TemplateFormProps {
  template: ContractTemplate;
  autoFillData?: AutoFillData;
  onFormDataChange: (formData: TemplateFormData) => void;
  initialData?: TemplateFormData;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  autoFillData,
  onFormDataChange,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<TemplateFormData>(initialData);
  const [errors, setErrors] = useState<{ [fieldId: string]: string }>({});

  useEffect(() => {
    console.log('TemplateForm useEffect triggered', { templateId: template?.id });
    
    // Safe auto-fill implementation without async operations
    if (autoFillData && template) {
      try {
        console.log('Processing auto-fill synchronously');
        const autoFilledData: TemplateFormData = {};

        // Process each field with auto-fill
        template.fields.forEach(field => {
          if (field.autoFill) {
            const value = getSimpleNestedValue(autoFillData, field.autoFill);
            if (value !== undefined && value !== null && value !== '') {
              autoFilledData[field.id] = value;
            }
          }
        });

        console.log('Auto-fill completed', { autoFilledData });
        const mergedData = { ...autoFilledData, ...initialData };
        
        setFormData(mergedData);
        onFormDataChange(mergedData);
        console.log('Form data updated successfully');
      } catch (error) {
        console.error('Error in auto-fill:', error);
        setFormData(initialData);
        onFormDataChange(initialData);
      }
    } else {
      console.log('No auto-fill needed, using initial data');
      setFormData(initialData);
      onFormDataChange(initialData);
    }
  }, [template?.id]); // Only depend on template id to avoid loops

  // Simple synchronous version of getNestedValue to avoid potential async issues
  const getSimpleNestedValue = (obj: any, path: string): any => {
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
  };

  const validateField = (field: TemplateField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} es requerido`;
    }

    if (field.validation) {
      const { min, max, pattern } = field.validation;

      if (field.type === 'number' || field.type === 'currency') {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (min !== undefined && numValue < min) {
          return `El valor mínimo es ${min}`;
        }
        if (max !== undefined && numValue > max) {
          return `El valor máximo es ${max}`;
        }
      }

      if (pattern && typeof value === 'string') {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          return field.validation.message || 'Formato inválido';
        }
      }
    }

    return null;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    const field = template.fields.find(f => f.id === fieldId);
    if (!field) return;

    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);

    // Validate field
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [fieldId]: error || ''
    }));

    onFormDataChange(newFormData);
  };

  const renderField = (field: TemplateField) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];
    const isAutoFilled = autoFillData && field.autoFill;

    const baseClassName = `
      mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
      ${error ? 'border-red-300' : 'border-gray-300'}
      ${isAutoFilled ? 'bg-blue-50' : 'bg-white'}
    `;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseClassName}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={baseClassName}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={baseClassName}
          />
        );

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
              placeholder={field.placeholder}
              min={0}
              className={`${baseClassName} pl-8`}
            />
            {field.currency && (
              <span className="absolute right-3 top-2 text-gray-500 text-sm">
                {field.currency}
              </span>
            )}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseClassName}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseClassName}
          >
            <option value="">Seleccionar...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">
              {field.placeholder || 'Activar'}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  const hasRequiredErrors = template.fields
    .filter(field => field.required)
    .some(field => !formData[field.id] || formData[field.id] === '');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {template.fields.map((field) => (
          <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
              {autoFillData && field.autoFill && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                  Auto-rellenado
                </span>
              )}
            </label>
            {renderField(field)}
            {errors[field.id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.id]}</p>
            )}
          </div>
        ))}
      </div>

      {hasRequiredErrors && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Por favor complete todos los campos requeridos antes de generar el contrato.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
