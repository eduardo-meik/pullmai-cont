import React, { useEffect, useState } from 'react';
import { Contrato, Proyecto } from '../../types';
import { useContracts } from '../../hooks/useContracts';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ContractSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (contrato: Contrato) => void;
  proyecto: Proyecto;
}

const ContractSelectModal: React.FC<ContractSelectModalProps> = ({ isOpen, onClose, onSelect, proyecto }) => {
  const { data: contratos, isLoading } = useContracts();
  const [filtered, setFiltered] = useState<Contrato[]>([]);

  useEffect(() => {
    if (contratos && contratos.contratos) {
      // Show all contracts that are either:
      // 1. Not linked to any project (!c.proyectoId || c.proyectoId === '')
      // 2. Already linked to this specific project (c.proyectoId === proyecto.id)
      setFiltered(contratos.contratos.filter((c: Contrato) => 
        !c.proyectoId || c.proyectoId === '' || c.proyectoId === proyecto.id
      ));
    }
  }, [contratos, proyecto.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-bold mb-2">Agregar contrato existente</h2>
        <p className="text-sm text-gray-600 mb-4">
          Proyecto: <span className="font-medium">{proyecto.nombre}</span>
        </p>
        {isLoading ? (
          <LoadingSpinner size="md" />
        ) : filtered.length === 0 ? (
          <div className="text-gray-500">No hay contratos disponibles para agregar.</div>
        ) : (
          <div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                {(() => {
                  const availableContracts = filtered.filter(c => !c.proyectoId || c.proyectoId === '');
                  const alreadyInProject = filtered.filter(c => c.proyectoId === proyecto.id);
                  return (
                    <>
                      <div>📋 {availableContracts.length} contrato(s) disponible(s) para agregar</div>
                      {alreadyInProject.length > 0 && (
                        <div>✅ {alreadyInProject.length} contrato(s) ya en este proyecto</div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {filtered.map(contrato => {
                const isAlreadyInProject = contrato.proyectoId === proyecto.id;
                
                return (
                  <li key={contrato.id} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">{contrato.titulo}</div>
                        {isAlreadyInProject && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ya en proyecto
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{contrato.contraparte}</div>
                      <div className="text-xs text-gray-400">
                        {new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: contrato.moneda || 'CLP'
                        }).format(contrato.monto)}
                      </div>
                    </div>
                    <button
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        isAlreadyInProject
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      onClick={() => !isAlreadyInProject && onSelect(contrato)}
                      disabled={isAlreadyInProject}
                      title={isAlreadyInProject ? 'Este contrato ya está en el proyecto' : 'Agregar contrato al proyecto'}
                    >
                      {isAlreadyInProject ? 'Ya agregado' : 'Agregar'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ContractSelectModal;
