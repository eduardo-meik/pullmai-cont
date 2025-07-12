import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { templateService } from '../services/templateService';
import { useEffect } from 'react';

/**
 * Hook to handle cache invalidation for template-based contract creation
 */
export const useTemplateContractCache = () => {
  const queryClient = useQueryClient();
  const { usuario } = useAuthStore();

  useEffect(() => {
    // Set up cache invalidation callback for template service
    const invalidateAllCaches = (contractId: string) => {
      console.log('Invalidating caches after template contract creation:', contractId);
      
      // Invalidate all related caches
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      queryClient.invalidateQueries({ queryKey: ['contratos', usuario?.organizacionId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', usuario?.organizacionId] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      queryClient.invalidateQueries({ queryKey: ['organization-stats'] });
      queryClient.invalidateQueries({ queryKey: ['contrapartes'] });
      queryClient.invalidateQueries({ queryKey: ['contrapartes', usuario?.organizacionId] });
      
      // Also invalidate any contract-specific queries
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
    };

    templateService.setOnContractCreatedCallback(invalidateAllCaches);

    // Cleanup callback on unmount
    return () => {
      templateService.setOnContractCreatedCallback(() => {});
    };
  }, [queryClient, usuario?.organizacionId]);

  return {
    invalidateTemplateContractCaches: (contractId: string) => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      queryClient.invalidateQueries({ queryKey: ['contratos', usuario?.organizacionId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', usuario?.organizacionId] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      queryClient.invalidateQueries({ queryKey: ['organization-stats'] });
      queryClient.invalidateQueries({ queryKey: ['contrapartes'] });
      queryClient.invalidateQueries({ queryKey: ['contrapartes', usuario?.organizacionId] });
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
    }
  };
};
