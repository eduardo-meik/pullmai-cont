import React, { useState, useEffect } from 'react';
import { ContractGenerator } from '../contracts/ContractGenerator';
import { TemplateSelection } from '../contracts/TemplateSelection';
import { ContractTemplate } from '../../types/templates';
import { useAuthStore } from '../../stores/authStore';
import { OrganizacionService } from '../../services/organizacionService';
import { Organizacion, UserRole } from '../../types';
import {
  DocumentTextIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  ViewColumnsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

type ViewMode = 'generator' | 'templates' | 'management';

const PlantillaModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('generator');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [organizationData, setOrganizationData] = useState<Organizacion | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(false);
  const { usuario } = useAuthStore();

  // Load organization data by default
  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!usuario?.organizacionId) return;
      
      try {
        setIsLoadingOrg(true);
        const orgData = await OrganizacionService.getOrganizacionById(usuario.organizacionId);
        setOrganizationData(orgData);
      } catch (error) {
        console.error('Error loading organization data:', error);
      } finally {
        setIsLoadingOrg(false);
      }
    };

    loadOrganizationData();
  }, [usuario?.organizacionId]);

  const canManageTemplates = usuario?.rol === UserRole.ORG_ADMIN || 
                            usuario?.rol === UserRole.SUPER_ADMIN || 
                            usuario?.rol === UserRole.MANAGER;

  const handleContractSaved = (contractId: string) => {
    // Handle successful contract save - could navigate to contracts module
    console.log('Contract saved with ID:', contractId);
    // You might want to show a success toast or navigate somewhere
  };

  const renderTabButtons = () => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => setViewMode('generator')}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
          ${viewMode === 'generator' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
          }
        `}
      >
        <DocumentTextIcon className="w-4 h-4 mr-2" />
        Generar Contrato
      </button>
      
      <button
        onClick={() => setViewMode('templates')}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
          ${viewMode === 'templates' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
          }
        `}
      >
        <ViewColumnsIcon className="w-4 h-4 mr-2" />
        Ver Plantillas
      </button>

      {canManageTemplates && (
        <button
          onClick={() => setViewMode('management')}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${viewMode === 'management' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <Squares2X2Icon className="w-4 h-4 mr-2" />
          Gestionar
        </button>
      )}
    </div>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'generator':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Generador de Contratos</h2>
              <p className="text-gray-600">
                Seleccione una plantilla y complete la información para generar un contrato.
              </p>
              {isLoadingOrg && (
                <div className="mt-2 text-sm text-blue-600">
                  Cargando información de la organización...
                </div>
              )}
            </div>
            <ContractGenerator
              organization={organizationData ? {
                id: organizationData.id,
                nombre: organizationData.nombre,
                rut: organizationData.rut || '',
                direccion: organizationData.direccion || '',
                ciudad: organizationData.ciudad,
                email: organizationData.email,
                telefono: organizationData.telefono,
                representanteLegal: organizationData.representanteLegal,
                rutRepresentanteLegal: organizationData.rutRepresentanteLegal,
                tipoEntidad: organizationData.tipoEntidad
              } : undefined}
              onContractSaved={handleContractSaved}
              className="mt-6"
            />
          </div>
        );

      case 'templates':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Plantillas Disponibles</h2>
              <p className="text-gray-600">
                Explore todas las plantillas de contratos disponibles para su organización.
              </p>
            </div>
            <TemplateSelection
              onTemplateSelect={(template) => {
                setSelectedTemplate(template);
                setViewMode('generator');
              }}
              selectedTemplateId={selectedTemplate?.id}
            />
          </div>
        );

      case 'management':
        return (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Plantillas</h2>
                <p className="text-gray-600">
                  Administre las plantillas personalizadas de su organización.
                </p>
              </div>
              <button
                onClick={() => {
                  // TODO: Open create template modal
                  console.log('Create custom template');
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nueva Plantilla
              </button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Función en Desarrollo
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    La gestión de plantillas personalizadas estará disponible en una próxima actualización. 
                    Por ahora puede utilizar las plantillas del sistema disponibles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plantillas</h1>
          <p className="text-gray-600">
            Gestione plantillas de contratos y genere documentos personalizados.
          </p>
        </div>
        {renderTabButtons()}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default PlantillaModule;
