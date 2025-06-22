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
      setFiltered(contratos.contratos.filter((c: Contrato) => !c.proyectoId || c.proyectoId === ''));
    }
  }, [contratos]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-bold mb-4">Agregar contrato existente</h2>
        {isLoading ? (
          <LoadingSpinner size="md" />
        ) : filtered.length === 0 ? (
          <div className="text-gray-500">No hay contratos disponibles para agregar.</div>
        ) : (
          <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {filtered.map(contrato => (
              <li key={contrato.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-gray-900">{contrato.titulo}</div>
                  <div className="text-xs text-gray-500">{contrato.contraparte}</div>
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium"
                  onClick={() => onSelect(contrato)}
                >
                  Agregar
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ContractSelectModal;
