import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../config/supabase.js';
import {processResume} from './processResume.js';
import jobQueue from '../queue.js';

function generateApplicationId() {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `APP-${timestamp}-${randomString}`;
}

async function submitApplication(req, res) {
  try {
    console.log("Incoming body:", req.body);
    const { job_posting_id, candidate_name, candidate_email, candidate_phone } = req.body;
    const resumeFile = req.file; 

    if (!job_posting_id || !candidate_name || !candidate_email || !resumeFile) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const fileName = `${candidate_name.replace(/\s+/g, "_")}_${Date.now()}.${resumeFile.originalname.split(".").pop()}`;
    const filePath = `resumes/${job_posting_id}/${fileName}`;

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

    const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(filePath);
    const fileUrl = urlData.publicUrl;

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

      const { data, error: applicationCountError } = await supabase.rpc('increment_application_count', {
        job_posting_id_param: job_posting_id
      });
      if(applicationCountError) {
        console.error("Error incrementing application count:", applicationCountError)
      }
      

    if (submissionError) {
      console.error("Error creating candidate submission:", submissionError);
      return res.status(500).json({ error: "Failed to create application" });
    }
    // const mockRes = {
    //   status: (code) => ({
    //     json: (data) => {
    //       if (code >= 400) {
    //         console.error(`Background processing error (${code}):`, data.error);
    //         supabase
    //           .from('resumes')
    //           .update({ 
    //             status: 'error', 
    //             error_message: data.error 
    //           })
    //           .eq('id', resumeData.id)
    //           .then(() => console.log(`Updated resume ${resumeData.id} status to error`))
    //           .catch(err => console.error('Failed to update resume status:', err));
    //       } else {
    //         console.log('Background processing successful:', data.message);
    //       }
    //     }
    //   })
    // };

    // processResume(
    //   { body: { resume_id: resumeData.id, job_posting_id: job_posting_id } },
    //   mockRes
    // ).catch(error => {
    //   console.error("Background resume processing failed:", error);
    //   supabase
    //     .from('resumes')
    //     .update({ 
    //       status: 'error', 
    //       error_message: error.message 
    //     })
    //     .eq('id', resumeData.id)
    //     .then(() => console.log(`Updated resume ${resumeData.id} status to error`))
    //     .catch(err => console.error('Failed to update resume status:', err));
    // });
    const jobId = await jobQueue.addJob({
      type: 'jobPostingEmbedding',
      resume_id: resumeData.id,
      job_posting_id,
    });
    console.log(`Enqueued jobId ${jobId} for resume processing`);

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