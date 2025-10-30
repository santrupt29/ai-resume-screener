import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../config/supabase.js';

async function getApplications(req, res) {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const { data: applications, error: appError } = await supabase
      .from("candidate_submissions")
      .select(`
        *,
        resumes!candidate_submissions_resume_id_fkey (
          file_name,
          file_url
        )
      `)
      .eq("job_posting_id", jobId)
      .order("created_at", { ascending: false });

    if (appError) {
      console.error("Error fetching applications:", appError);
      return res.status(500).json({ error: "Failed to fetch applications" });
    }

    if (!applications || applications.length === 0) {
      return res.status(200).json([]);
    }

    const resumeIds = [...new Set(applications.map(app => app.resume_id))];

    const { data: results, error: resultsError } = await supabase
      .from("results")
      .select("*")
      .in("resume_id", resumeIds);

    if (resultsError) {
      console.error("Error fetching results:", resultsError);
    }

    const mergedApplications = applications.map(application => {
      const applicationResults = results?.filter(result => result.resume_id === application.resume_id) || [];
      
      return {
        ...application,
        results: applicationResults 
      };
    });

    return res.status(200).json(mergedApplications);

  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
}

export default getApplications;
