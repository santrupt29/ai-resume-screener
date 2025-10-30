// src/hooks/useDashboardStats.js
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';
const fetchDashboardStats = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const { data, error } = await supabase
    .from('job_postings')
    .select(`
      id,
      is_active,
      candidate_submissions ( id ),
      results ( id )
    `)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  const totalJobs = data.length;
  const activeJobs = data.filter(job => job.is_active).length;
  const totalApplications = data.reduce((acc, job) => acc + (job.candidate_submissions?.length || 0), 0);
  const analyzedCount = data.reduce((acc, job) => acc + (job.results?.length || 0), 0);

  return {
    totalJobs,
    activeJobs,
    totalApplications,
    analyzedCount,
  };
};

export function useDashboardStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: () => fetchDashboardStats(user.id),
    enabled: !!user?.id, 
    retry: 1,
    staleTime: 1000 * 60 * 5, 
  });
}