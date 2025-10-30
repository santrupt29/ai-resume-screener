import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getJobPostings, 
  createJobPosting, 
  updateJobPosting, 
  deleteJobPosting 
} from '../lib/api';
import { supabase } from '../lib/supabase';

export function useJobPostings(userId) {
  const result = useQuery({
    queryKey: ['jobPostings', userId],
    queryFn: () => getJobPostings(userId),
    enabled: !!userId,
    retry: 1, 
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
export const useUpdateJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, updates }) => {
      const { data, error } = await supabase
        .from('job_postings')
        .update(updates)
        .eq('id', jobId)
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['jobPostings']);
    },
  });
};

export const useDeleteJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId) => {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId);

      if (error) throw new Error(error.message);
      return jobId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['jobPostings']);
    },
  });
};