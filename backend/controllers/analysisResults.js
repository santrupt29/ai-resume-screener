import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../config/supabase.js';

async function analysisResults(req, res) {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select('*')
      .eq('job_posting_id', jobId)
      .order('score', { ascending: false })
      .order('similarity_score', { ascending: false });

    if (resultsError) {
      console.error('Error fetching results:', resultsError);
      return res.status(500).json({ error: 'Failed to fetch analysis results' });
    }

    if (!results || results.length === 0) {
      return res.status(200).json([]);
    }

    const resumeIds = [...new Set(results.map(r => r.resume_id))];

    const { data: submissions, error: submissionsError } = await supabase
      .from('candidate_submissions')
      .select('*')
      .eq('job_posting_id', jobId)
      .in('resume_id', resumeIds);

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return res.status(500).json({ error: 'Failed to fetch candidate submissions' });
    }

    const { data: resumes, error: resumesError } = await supabase
      .from('resumes')
      .select('id, file_url, file_name')
      .in('id', resumeIds);

    if (resumesError) {
      console.error('Error fetching resume details:', resumesError);
      return res.status(500).json({ error: 'Failed to fetch resume details' });
    }

    const mergedData = results.map(result => {
      const submission = submissions.find(s => s.resume_id === result.resume_id);
      const resume = resumes.find(r => r.id === result.resume_id);

      return {
        ...result,
        candidate_submissions: submission, 
        resumes: resume
      };
    });

    return res.status(200).json(mergedData);

  } catch (error) {
    console.error('Unexpected error in getAnalysisResultsForJob:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

export default analysisResults;