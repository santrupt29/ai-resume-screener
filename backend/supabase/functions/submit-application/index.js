// backend/functions/submit-application/index.js
import { createClient } from '@supabase/supabase-js';
import { generateApplicationId } from '../../shared/utils';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { job_posting_id, candidate_name, candidate_email, candidate_phone, resume } = req.body;

    if (!job_posting_id || !candidate_name || !candidate_email || !resume) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the job posting exists and is active
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('id, is_active')
      .eq('id', job_posting_id)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    if (!job.is_active) {
      return res.status(400).json({ error: 'Job posting is not active' });
    }

    // Upload resume to Supabase Storage
    const fileName = `${candidate_name.replace(/\s+/g, '_')}_${Date.now()}.${resume.name.split('.').pop()}`;
    const filePath = `resumes/${job_posting_id}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, resume, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading resume:', uploadError);
      return res.status(500).json({ error: 'Failed to upload resume' });
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Create resume record
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        file_name: resume.name,
        file_url: fileUrl,
        file_path: filePath,
        status: 'pending',
      })
      .select()
      .single();

    if (resumeError) {
      console.error('Error creating resume record:', resumeError);
      return res.status(500).json({ error: 'Failed to create resume record' });
    }

    // Generate unique application ID
    const applicationId = generateApplicationId();

    // Create candidate submission record
    const { data: submission, error: submissionError } = await supabase
      .from('candidate_submissions')
      .insert({
        job_posting_id,
        resume_id: resumeData.id,
        candidate_name,
        candidate_email,
        candidate_phone,
        application_id: applicationId,
        status: 'received',
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Error creating candidate submission:', submissionError);
      return res.status(500).json({ error: 'Failed to create application' });
    }

    return res.status(201).json({
      application_id: applicationId,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}