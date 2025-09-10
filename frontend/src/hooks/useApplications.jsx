// src/hooks/useApplications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApplications, 
  submitApplication, 
  updateApplicationStatus,
  checkApplicationStatus
} from '../lib/api';

export function useApplications(jobId) {
  return useQuery({
    queryKey: ['applications', jobId],
    queryFn: () => getApplications(jobId),
    enabled: !!jobId,
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitApplication,
    onSuccess: () => {
      // Invalidate relevant queries if needed
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ applicationId, status }) => updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useCheckApplicationStatus() {
  return useMutation({
    mutationFn: ({ applicationId, email }) => checkApplicationStatus(applicationId, email),
  });
}