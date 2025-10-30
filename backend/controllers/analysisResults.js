import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../config/supabase.js';

async function analysisResults(req, res) {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // 1. Fetch all analysis results for the given job
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

    // If there are no results, return an empty array immediately
    if (!results || results.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Get all the unique resume IDs from the results
    const resumeIds = [...new Set(results.map(r => r.resume_id))];

    // 3. Fetch all candidate submissions that match those resume IDs for this job
    const { data: submissions, error: submissionsError } = await supabase
      .from('candidate_submissions')
      .select('*')
      .eq('job_posting_id', jobId)
      .in('resume_id', resumeIds);

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return res.status(500).json({ error: 'Failed to fetch candidate submissions' });
    }

    // 4. Fetch the resume file details for each result
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
        candidate_submissions: submission, // Use the plural key to match the frontend
        resumes: resume
      };
    });

    return res.status(200).json(mergedData);

  } catch (error) {
    console.error('Unexpected error in getAnalysisResultsForJob:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }

    // try {
    //     const { jobId } = req.params;
    
    //     if (!jobId) {
    //       return res.status(400).json({ error: 'Job ID is required' });
    //     }
    
    //     // Fetch all results for the given job, joining with candidate and resume info
    //     const { data: results, error } = await supabase
    //       .from('results')
    //       .select(`
    //         id,
    //         score,
    //         similarity_score,
    //         strengths,
    //         weaknesses,
    //         suggestions,
    //         resume_id,
    //         job_posting_id,
    //         candidate_submissions!inner (
    //           candidate_name,
    //           candidate_email,
    //           application_id,
    //           status
    //         ),
    //         resumes!inner (
    //           file_url,
    //           file_name
    //         )
    //       `)
    //       .eq('job_posting_id', jobId)
    //       .order('score', { ascending: false }) // Order by AI score descending
    //       .order('similarity_score', { ascending: false }); // Then by similarity score
    
    //     if (error) {
    //       console.error('Error fetching analysis results:', error);
    //       return res.status(500).json({ error: 'Failed to fetch analysis results' });
    //     }
    
    //     // If no results are found, it's not an error, just return an empty array
    //     return res.status(200).json(results || []);
    
    //   } catch (error) {
    //     console.error('Unexpected error in getAnalysisResultsForJob:', error);
    //     return res.status(500).json({ error: 'An unexpected error occurred' });
    //   }    
}

export default analysisResults;