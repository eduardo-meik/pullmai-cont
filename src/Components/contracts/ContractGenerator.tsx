import React, { useState, useEffect, useCallback } from 'react';
import { TemplateSelection } from './TemplateSelection';
import { TemplateForm } from './TemplateForm';
import { ContractPreview } from './ContractPreview';
import { ContractTemplate, TemplateFormData, AutoFillData } from '../../types/templates';
import { templateService } from '../../services/templateService';
import { useAuthStore } from '../../stores/authStore';

interface ContraparteData {
  id: string;
  nombre: string;
  rut: string;
  direccion: string;
  email?: string;
  telefono?: string;
  personaContacto?: string;
  tipoEntidad?: 'empresa' | 'persona_natural';
}

interface OrganizationData {
  id: string;
  nombre: string;
  rut: string;
  direccion: string;
  ciudad?: string;
  email?: string;
  telefono?: string;
  representanteLegal?: string;
  rutRepresentanteLegal?: string;
  tipoEntidad?: 'empresa' | 'persona_natural';
}

interface ContractGeneratorProps {
  contraparte?: ContraparteData;
  organization?: OrganizationData;
  onContractSaved?: (contractId: string) => void;
  className?: string;
}

export const ContractGenerator: React.FC<ContractGeneratorProps> = ({
  contraparte,
  organization,
  onContractSaved,
  className = ''
}) => {
  const { usuario } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<'template' | 'form' | 'preview'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill data from props
  const autoFillData: AutoFillData | undefined = React.useMemo(() => {
    if (!contraparte && !organization) return undefined;

    return {
      organization: organization ? {
        nombre: organization.nombre,
        rut: organization.rut,
        direccion: organization.direccion,
        ciudad: organization.ciudad,
        email: organization.email,
        telefono: organization.telefono,
        representanteLegal: organization.representanteLegal,
        rutRepresentanteLegal: organization.rutRepresentanteLegal,
        tipoEntidad: organization.tipoEntidad,
        // Legacy mappings for template compatibility
        name: organization.nombre,
        address: organization.direccion,
        phone: organization.telefono,
        legalRep: organization.representanteLegal,
        legalRepRut: organization.rutRepresentanteLegal,
        entityType: organization.tipoEntidad
      } : undefined,
      contraparte: contraparte ? {
        nombre: contraparte.nombre,
        rut: contraparte.rut,
        direccion: contraparte.direccion,
        email: contraparte.email,
        telefono: contraparte.telefono,
        personaContacto: contraparte.personaContacto,
        tipoEntidad: contraparte.tipoEntidad,
        // Legacy mappings for template compatibility
        name: contraparte.nombre,
        address: contraparte.direccion,
        phone: contraparte.telefono,
        contactPerson: contraparte.personaContacto,
        entityType: contraparte.tipoEntidad
      } : undefined,
      contract: {
        date: new Date().toLocaleDateString('es-CL'),
        city: 'Santiago' // Default city, could be configurable
      }
    };
  }, [contraparte, organization]);

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setFormData({});
    setCurrentStep('form');
    setError(null);
  };

  const handleFormDataChange = useCallback((newFormData: TemplateFormData) => {
    setFormData(newFormData);
  }, []);

  const handleSaveContract = async (generatedContent: string): Promise<void> => {
    if (!selectedTemplate || !usuario) {
      throw new Error('Datos faltantes para guardar el contrato');
    }

    try {
      setIsLoading(true);
      const contractId = await templateService.saveGeneratedContract(
        selectedTemplate.id,
        selectedTemplate.name,
        formData,
        generatedContent,
        usuario.organizacionId,
        usuario.id
      );

      if (onContractSaved) {
        onContractSaved(contractId);
      }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (generatedContent: string): Promise<void> => {
    // This would integrate with a PDF generation service
    // For now, we'll create a simple PDF-like download
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.name || 'contrato'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackToTemplates = () => {
    setCurrentStep('template');
    setSelectedTemplate(null);
    setFormData({});
    setError(null);
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setError(null);
  };

  const handleContinueToPreview = () => {
    if (!selectedTemplate) return;
    
    // Validate required fields
    const requiredFields = selectedTemplate.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.id] || formData[field.id] === '');
    
    if (missingFields.length > 0) {
      setError(`Por favor complete los siguientes campos: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setCurrentStep('preview');
    setError(null);
  };

  const steps = [
    { id: 'template', name: 'Seleccionar Plantilla', completed: !!selectedTemplate },
    { id: 'form', name: 'Completar Información', completed: currentStep === 'preview' },
    { id: 'preview', name: 'Vista Previa y Descarga', completed: false }
  ];

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Step Indicator */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                <div className="flex items-center">
                  <div className={`
                    relative flex h-8 w-8 items-center justify-center rounded-full
                    ${step.completed 
                      ? 'bg-green-600' 
                      : currentStep === step.id 
                        ? 'bg-blue-600' 
                        : 'bg-gray-300'
                    }
                  `}>
                    {step.completed ? (
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className={`h-2.5 w-2.5 rounded-full ${currentStep === step.id ? 'bg-white' : 'bg-gray-400'}`} />
                    )}
                  </div>
                  <span className={`ml-4 text-sm font-medium ${currentStep === step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.name}
                  </span>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow">
        {currentStep === 'template' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Seleccionar Plantilla de Contrato</h2>
              <p className="text-gray-600">Elija una plantilla que se adapte a sus necesidades.</p>
            </div>
            <TemplateSelection
              onTemplateSelect={handleTemplateSelect}
              selectedTemplateId={selectedTemplate?.id}
            />
          </div>
        )}

        {currentStep === 'form' && selectedTemplate && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Completar Información del Contrato</h2>
                <p className="text-gray-600">Plantilla: {selectedTemplate.name}</p>
              </div>
              <button
                onClick={handleBackToTemplates}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ← Cambiar Plantilla
              </button>
            </div>

            {autoFillData && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Los campos marcados con "Auto-rellenado" se han completado automáticamente con la información disponible.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <TemplateForm
              template={selectedTemplate}
              autoFillData={autoFillData}
              onFormDataChange={handleFormDataChange}
              initialData={formData}
            />

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleContinueToPreview}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continuar a Vista Previa →
              </button>
            </div>
          </div>
        )}

        {currentStep === 'preview' && selectedTemplate && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Vista Previa y Descarga</h2>
                <p className="text-gray-600">Revise el contrato antes de guardarlo o descargarlo.</p>
              </div>
              <button
                onClick={handleBackToForm}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ← Editar Información
              </button>
            </div>

            <ContractPreview
              template={selectedTemplate}
              formData={formData}
              autoFillData={autoFillData}
              onSave={handleSaveContract}
              onDownloadPDF={handleDownloadPDF}
            />
          </div>
        )}
      </div>
    </div>
  );
};
