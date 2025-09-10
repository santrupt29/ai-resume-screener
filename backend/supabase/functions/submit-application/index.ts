// // backend/supabase/functions/submit-application/index.ts
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// // Utility function to generate application ID
// function generateApplicationId() {
//   const timestamp = Date.now().toString();
//   const randomString = Math.random().toString(36).substring(2, 8);
//   return `APP-${timestamp}-${randomString}`;
// }

// export default async function handler(req, res) {
//   // Set CORS headers
//   res.set('Access-Control-Allow-Origin', '*');
//   res.set('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
//   res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
  
//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     return res.status(200).send();
//   }

//   try {
//     const { job_posting_id, candidate_name, candidate_email, candidate_phone, resume } = req.body;

//     if (!job_posting_id || !candidate_name || !candidate_email || !resume) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Verify the job posting exists and is active
//     const { data: job, error: jobError } = await supabase
//       .from('job_postings')
//       .select('id, is_active')
//       .eq('id', job_posting_id)
//       .single();

//     if (jobError || !job) {
//       return res.status(404).json({ error: 'Job posting not found' });
//     }

//     if (!job.is_active) {
//       return res.status(400).json({ error: 'Job posting is not active' });
//     }

//     // Upload resume to Supabase Storage
//     const fileName = `${candidate_name.replace(/\s+/g, '_')}_${Date.now()}.${resume.name.split('.').pop()}`;
//     const filePath = `resumes/${job_posting_id}/${fileName}`;

//     const { data: uploadData, error: uploadError } = await supabase.storage
//       .from('resumes')
//       .upload(filePath, resume, {
//         cacheControl: '3600',
//         upsert: false,
//       });

//     if (uploadError) {
//       console.error('Error uploading resume:', uploadError);
//       return res.status(500).json({ error: 'Failed to upload resume' });
//     }

//     // Get public URL for the uploaded file
//     const { data: urlData } = supabase.storage
//       .from('resumes')
//       .getPublicUrl(filePath);

//     const fileUrl = urlData.publicUrl;

//     // Create resume record
//     const { data: resumeData, error: resumeError } = await supabase
//       .from('resumes')
//       .insert({
//         file_name: resume.name,
//         file_url: fileUrl,
//         file_path: filePath,
//         status: 'pending',
//       })
//       .select()
//       .single();

//     if (resumeError) {
//       console.error('Error creating resume record:', resumeError);
//       return res.status(500).json({ error: 'Failed to create resume record' });
//     }

//     // Generate unique application ID
//     const applicationId = generateApplicationId();

//     // Create candidate submission record
//     const { data: submission, error: submissionError } = await supabase
//       .from('candidate_submissions')
//       .insert({
//         job_posting_id,
//         resume_id: resumeData.id,
//         candidate_name,
//         candidate_email,
//         candidate_phone,
//         application_id: applicationId,
//         status: 'received',
//       })
//       .select()
//       .single();

//     if (submissionError) {
//       console.error('Error creating candidate submission:', submissionError);
//       return res.status(500).json({ error: 'Failed to create application' });
//     }

//     return res.status(201).json({
//       application_id: applicationId,
//       message: 'Application submitted successfully',
//     });
//   } catch (error) {
//     console.error('Unexpected error:', error);
//     return res.status(500).json({ error: 'An unexpected error occurred' });
//   }
// }

// backend/supabase/functions/submit-application/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Utility function to generate application ID
function generateApplicationId() {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `APP-${timestamp}-${randomString}`;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};

export default async function handler(req, res) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { job_posting_id, candidate_name, candidate_email, candidate_phone, resume } = await req.json();

    if (!job_posting_id || !candidate_name || !candidate_email || !resume) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Verify the job posting exists and is active
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('id, is_active')
      .eq('id', job_posting_id)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: 'Job posting not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    if (!job.is_active) {
      return new Response(JSON.stringify({ error: 'Job posting is not active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
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
      return new Response(JSON.stringify({ error: 'Failed to upload resume' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
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
      return new Response(JSON.stringify({ error: 'Failed to create resume record' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
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
      return new Response(JSON.stringify({ error: 'Failed to create application' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    return new Response(JSON.stringify({
      application_id: applicationId,
      message: 'Application submitted successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}