// backend/controllers/submitApplication.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
// Initialize Supabase client (assuming you have a shared/supabase.js for this, but shown here for completeness)
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

// Main controller function
// async function submitApplication(req, res) {
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
//     // NOTE: In the original code, 'resume' is expected in the JSON body (perhaps as a base64 string or buffer).
//     // For proper file uploads in Express, consider using middleware like multer to handle multipart/form-data.
//     // Adjust your frontend to send form data accordingly, and parse req.file in the controller.
//     // For now, assuming 'resume' is the file content (e.g., Buffer), as per original.
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

async function submitApplication(req, res) {
  try {
    console.log("Incoming body:", req.body);
    const { job_posting_id, candidate_name, candidate_email, candidate_phone } = req.body;
    const resumeFile = req.file; // multer gives you the file here ✅

    if (!job_posting_id || !candidate_name || !candidate_email || !resumeFile) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Build filename
    const fileName = `${candidate_name.replace(/\s+/g, "_")}_${Date.now()}.${resumeFile.originalname.split(".").pop()}`;
    const filePath = `resumes/${job_posting_id}/${fileName}`;

    // Upload buffer to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, resumeFile.buffer, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading resume:", uploadError);
      return res.status(500).json({ error: "Failed to upload resume" });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(filePath);
    const fileUrl = urlData.publicUrl;

    // Insert into resumes table
    const { data: resumeData, error: resumeError } = await supabase
      .from("resumes")
      .insert({
        file_name: resumeFile.originalname,
        file_url: fileUrl,
        file_path: filePath,
        status: "pending",
      })
      .select()
      .single();

    if (resumeError) {
      console.error("Error creating resume record:", resumeError);
      return res.status(500).json({ error: "Failed to create resume record" });
    }

    // Generate applicationId + insert submission
    const applicationId = generateApplicationId();

    const { error: submissionError } = await supabase
      .from("candidate_submissions")
      .insert({
        job_posting_id,
        resume_id: resumeData.id,
        candidate_name,
        candidate_email,
        candidate_phone,
        application_id: applicationId,
        status: "received",
      });

    if (submissionError) {
      console.error("Error creating candidate submission:", submissionError);
      return res.status(500).json({ error: "Failed to create application" });
    }

    return res.status(201).json({
      application_id: applicationId,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
}


export default submitApplication;