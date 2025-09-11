// backend/controllers/checkApplicationStatus.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
// Initialize Supabase client (assuming you have a shared/supabase.js for this, but shown here for completeness)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Main controller function
async function checkApplicationStatus(req, res) {
  try {
    const { applicationId, email } = req.body;

    if (!applicationId || !email) {
      return res.status(400).json({ error: 'Missing applicationId or email' });
    }

    // Get candidate submission
    const { data: submission, error: submissionError } = await supabase
      .from('candidate_submissions')
      .select(`
        *,
        job_posting:job_postings(title, company),
        results(score, similarity_score, strengths, weaknesses)
      `)
      .eq('application_id', applicationId)
      .eq('candidate_email', email)
      .single();

    if (submissionError || !submission) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Format the response
    const response = {
      application_id: submission.application_id,
      candidate_name: submission.candidate_name,
      job_title: submission.job_posting.title,
      company: submission.job_posting.company,
      status: submission.status,
      created_at: submission.created_at,
      updated_at: submission.updated_at,
    };

    // Include analysis results if available
    if (submission.results) {
      response.analysis = {
        score: submission.results.score,
        similarity_score: submission.results.similarity_score,
        strengths: submission.results.strengths,
        weaknesses: submission.results.weaknesses,
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

export default checkApplicationStatus;