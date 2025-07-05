import React, { useState, useEffect } from 'react';
import { ContractTemplate, TEMPLATE_CATEGORIES } from '../../types/templates';
import { templateService } from '../../services/templateService';
import { useAuthStore } from '../../stores/authStore';

interface TemplateSelectionProps {
  onTemplateSelect: (template: ContractTemplate) => void;
  selectedTemplateId?: string;
}

export const TemplateSelection: React.FC<TemplateSelectionProps> = ({
  onTemplateSelect,
  selectedTemplateId
}) => {
  const { usuario } = useAuthStore();
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [usuario]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const allTemplates = await templateService.getAllTemplates(usuario?.organizacionId);
      setTemplates(allTemplates);
    } catch (err) {
      setError('Error al cargar las plantillas');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleTemplateSelect = (template: ContractTemplate) => {
    onTemplateSelect(template);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadTemplates}
          className="mt-2 text-sm text-red-700 underline hover:text-red-800"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por categoría
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todas las categorías</option>
          {TEMPLATE_CATEGORIES.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`
              border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
              ${selectedTemplateId === template.id 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900 text-sm">
                {template.name}
              </h3>
              {template.isSystem ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Sistema
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Personalizada
                </span>
              )}
            </div>
            
            <p className="text-gray-600 text-xs mb-2 line-clamp-2">
              {template.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="capitalize">
                {TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label || template.category}
              </span>
              <span>{template.fields.length} campos</span>
            </div>

            {selectedTemplateId === template.id && (
              <div className="mt-2 flex items-center text-blue-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">Seleccionada</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {selectedCategory === 'all' 
              ? 'No hay plantillas disponibles' 
              : `No hay plantillas en la categoría "${TEMPLATE_CATEGORIES.find(c => c.value === selectedCategory)?.label}"`
            }
          </p>
        </div>
      )}
    </div>
  );
};
