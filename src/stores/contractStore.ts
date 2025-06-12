import { create } from 'zustand'
import { Contrato, FiltrosContrato, EstadisticasContrato } from '../types'

interface ContractState {
  contratos: Contrato[]
  contratoSeleccionado: Contrato | null
  filtros: FiltrosContrato
  estadisticas: EstadisticasContrato | null
  isLoading: boolean
  
  // Actions
  setContratos: (contratos: Contrato[]) => void
  addContrato: (contrato: Contrato) => void
  updateContrato: (id: string, updates: Partial<Contrato>) => void
  removeContrato: (id: string) => void
  setContratoSeleccionado: (contrato: Contrato | null) => void
  setFiltros: (filtros: Partial<FiltrosContrato>) => void
  clearFiltros: () => void
  setEstadisticas: (estadisticas: EstadisticasContrato) => void
  setLoading: (loading: boolean) => void
}

export const useContractStore = create<ContractState>((set, get) => ({
  contratos: [],
  contratoSeleccionado: null,
  filtros: {},
  estadisticas: null,
  isLoading: false,

  setContratos: (contratos) => set({ contratos }),

  addContrato: (contrato) => set((state) => ({
    contratos: [contrato, ...state.contratos]
  })),

  updateContrato: (id, updates) => set((state) => ({
    contratos: state.contratos.map(contrato =>
      contrato.id === id ? { ...contrato, ...updates } : contrato
    ),
    contratoSeleccionado: state.contratoSeleccionado?.id === id
      ? { ...state.contratoSeleccionado, ...updates }
      : state.contratoSeleccionado
  })),

  removeContrato: (id) => set((state) => ({
    contratos: state.contratos.filter(contrato => contrato.id !== id),
    contratoSeleccionado: state.contratoSeleccionado?.id === id
      ? null
      : state.contratoSeleccionado
  })),

  setContratoSeleccionado: (contrato) => set({ contratoSeleccionado: contrato }),

  setFiltros: (filtros) => set((state) => ({
    filtros: { ...state.filtros, ...filtros }
  })),

  clearFiltros: () => set({ filtros: {} }),

  setEstadisticas: (estadisticas) => set({ estadisticas }),

  setLoading: (isLoading) => set({ isLoading })
}))