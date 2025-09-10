// src/hooks/useAnalysis.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  analyzeResume, 
  getAnalysisResults 
} from '../lib/api';

export function useAnalysis() {
  return useMutation({
    mutationFn: ({ resumeId, jobId }) => analyzeResume(resumeId, jobId),
  });
}

export function useAnalysisResults(jobId) {
  return useQuery({
    queryKey: ['analysisResults', jobId],
    queryFn: () => getAnalysisResults(jobId),
    enabled: !!jobId,
  });
}