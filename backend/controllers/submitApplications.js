// import dotenv from 'dotenv';
// dotenv.config();
// import { supabase } from '../config/supabase.js';
// import processResume from './processResume.js';

// // Utility function to generate application ID
// function generateApplicationId() {
//   const timestamp = Date.now().toString();
//   const randomString = Math.random().toString(36).substring(2, 8);
//   return `APP-${timestamp}-${randomString}`;
// }

// async function submitApplication(req, res) {
//   try {
//     console.log("Incoming body:", req.body);
//     const { job_posting_id, candidate_name, candidate_email, candidate_phone } = req.body;
//     const resumeFile = req.file; // multer gives you the file here ✅

//     if (!job_posting_id || !candidate_name || !candidate_email || !resumeFile) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Build filename
//     const fileName = `${candidate_name.replace(/\s+/g, "_")}_${Date.now()}.${resumeFile.originalname.split(".").pop()}`;
//     const filePath = `resumes/${job_posting_id}/${fileName}`;

//     // Upload buffer to Supabase storage
//     const { data: uploadData, error: uploadError } = await supabase.storage
//       .from("resumes")
//       .upload(filePath, resumeFile.buffer, {
//         cacheControl: "3600",
//         upsert: false,
//       });

//     if (uploadError) {
//       console.error("Error uploading resume:", uploadError);
//       return res.status(500).json({ error: "Failed to upload resume" });
//     }

//     // Get public URL
//     const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(filePath);
//     const fileUrl = urlData.publicUrl;

//     // Insert into resumes table
//     const { data: resumeData, error: resumeError } = await supabase
//       .from("resumes")
//       .insert({
//         file_name: resumeFile.originalname,
//         file_url: fileUrl,
//         file_path: filePath,
//         status: "pending",
//       })
//       .select()
//       .single();

//     if (resumeError) {
//       console.error("Error creating resume record:", resumeError);
//       return res.status(500).json({ error: "Failed to create resume record" });
//     }

//     // Generate applicationId + insert submission
//     const applicationId = generateApplicationId();

//     const { error: submissionError } = await supabase
//       .from("candidate_submissions")
//       .insert({
//         job_posting_id,
//         resume_id: resumeData.id,
//         candidate_name,
//         candidate_email,
//         candidate_phone,
//         application_id: applicationId,
//         status: "received",
//       });

//     if (submissionError) {
//       console.error("Error creating candidate submission:", submissionError);
//       return res.status(500).json({ error: "Failed to create application" });
//     }
// // Create a proper mock response object
// const mockRes = {
//   status: (code) => mockRes,
//    // Return the mock object itself to allow chaining
//   json: (data) => console.log('Mock response:', data) // Optional: log the data
// };

// processResume(
//   { body: { resume_id: resumeData.id } },
//   mockRes // Use the new mock object
// ).catch(error => {
//       // Log any errors from the background process, but don't fail the main request
//       console.error("Background resume processing failed:", error);
//     });

//     return res.status(201).json({
//       application_id: applicationId,
//       message: "Application submitted successfully",
//     });
//   } catch (error) {
//     console.error("Unexpected error:", error);
//     return res.status(500).json({ error: "An unexpected error occurred" });
//   }
// }


// export default submitApplication;




import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../config/supabase.js';
import processResume from './processResume.js';
import analyzeMatches from './analyzeMatches.js';

// Utility function to generate application ID
function generateApplicationId() {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `APP-${timestamp}-${randomString}`;
}

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

    // Process resume in background
    // Create a proper mock response object
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code >= 400) {
            console.error(`Background processing error (${code}):`, data.error);
            // Update the resume status to error
            supabase
              .from('resumes')
              .update({ 
                status: 'error', 
                error_message: data.error 
              })
              .eq('id', resumeData.id)
              .then(() => console.log(`Updated resume ${resumeData.id} status to error`))
              .catch(err => console.error('Failed to update resume status:', err));
          } else {
            console.log('Background processing successful:', data.message);
          }
        }
      })
    };

    // Start background processing without waiting
    processResume(
      { body: { resume_id: resumeData.id, job_posting_id: job_posting_id } },
      mockRes
    ).catch(error => {
      console.error("Background resume processing failed:", error);
      // Update the resume status to error
      supabase
        .from('resumes')
        .update({ 
          status: 'error', 
          error_message: error.message 
        })
        .eq('id', resumeData.id)
        .then(() => console.log(`Updated resume ${resumeData.id} status to error`))
        .catch(err => console.error('Failed to update resume status:', err));
    });

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