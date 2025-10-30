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
    retry: 1, 
    select: (response) => {
      return response?.data || [];
    },
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitApplication,
    onSuccess: () => {
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error) => {
      console.error("Failed to submit application:", error);
      // You could show a toast notification here
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
    onError: (error) => {
      console.error("Failed to update application status:", error);
    },
  });
}

export function useCheckApplicationStatus() {
  return useMutation({
    mutationFn: ({ applicationId, email }) => checkApplicationStatus(applicationId, email),
    onError: (error) => {
      console.error("Failed to check application status:", error);
    },
  });
}