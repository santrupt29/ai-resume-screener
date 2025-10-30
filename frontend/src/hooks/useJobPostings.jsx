import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getJobPostings, 
  createJobPosting, 
  updateJobPosting, 
  deleteJobPosting 
} from '../lib/api';

export function useJobPostings(userId) {
  const result = useQuery({
    queryKey: ['jobPostings', userId],
    queryFn: () => getJobPostings(userId),
    enabled: !!userId,
    retry: 1, // Prevents infinite retries on failure
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Return all relevant states, including error
  return {
    ...result,
    // You can add custom transformations here if needed
  };
}

// --- UPDATED useCreateJobPosting ---
export function useCreateJobPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createJobPosting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
    },
    // Add error handling
    onError: (error) => {
      console.error("Failed to create job posting:", error);
      // You can also trigger a toast notification here
    },
  });
}

// --- UPDATED useUpdateJobPosting ---
export function useUpdateJobPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, updates }) => updateJobPosting(jobId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
    },
    // Add error handling
    onError: (error) => {
      console.error("Failed to update job posting:", error);
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
    onError: (error) => {
      console.error("Failed to delete job posting:", error);
    },
  });
}