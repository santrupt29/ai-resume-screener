// src/hooks/useJobPostings.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getJobPostings, 
  createJobPosting, 
  updateJobPosting, 
  deleteJobPosting 
} from '../lib/api';

export function useJobPostings(userId) {
  return useQuery({
    queryKey: ['jobPostings', userId],
    queryFn: () => getJobPostings(userId),
    enabled: !!userId,
  });
}

export function useCreateJobPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createJobPosting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
    },
  });
}

export function useUpdateJobPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, updates }) => updateJobPosting(jobId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
    },
  });
}

export function useDeleteJobPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteJobPosting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
    },
  });
}