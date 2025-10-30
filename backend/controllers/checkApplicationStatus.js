import { supabase } from "../config/supabase";
async function checkApplicationStatus(req, res) {
    const { applicationId, email } = req.body;

    if (!applicationId || !email) {
        return res.status(400).json({ error: "Missing applicationId or email" });
    }
    console.log(`[DEBUG] Searching for applicationId: ${applicationId} with email: ${email}`);

    // Query the candidate_submissions table directly
    // We are assuming the custom ID is stored in a column named 'application_id'
    // and the email is in 'candidate_email'
    const { data: submission, error: submissionError } = await supabase
        .from("candidate_submissions")
        .select(`
        *,
        job_postings!candidate_submissions_job_posting_id_fkey(title, company),
        resumes!candidate_submissions_resume_id_fkey(
          id,
          results!results_resume_id_fkey(score, similarity_score, strengths, weaknesses, suggestions)
        )
      `)
        .eq("application_id", applicationId) // Filter by the custom application ID
        .eq("candidate_email", email) // Filter by the candidate's email
        .maybeSingle();

    if (submissionError) {
        console.error("[DEBUG] Error fetching submission:", submissionError);
        // This error might indicate that 'application_id' or 'candidate_email' columns don't exist.
        // Let's check the table structure if that's the case.
        if (submissionError.code === "PGRST116") {
            return res.status(500).json({
                error: "Database schema mismatch. The columns \"application_id\" or \"candidate_email\" might not exist on the candidate_submissions table.",
                details: submissionError.message
            });
        }
        return res.status(500).json({ error: "Error fetching application" });
    }

    if (!submission) {
        console.log(`[DEBUG] Application not found. No record matched applicationId: ${applicationId} and email: ${email}`);
        return res.status(404).json({ error: "Application not found" });
    }

    console.log("[DEBUG] Submission found:", submission.id);

    // Format response
    const response = {
        application_id: submission.application_id, // Use the custom ID
        candidate_name: submission.candidate_name,
        job_title: submission.job_postings?.title || "N/A",
        company: submission.job_postings?.company || "N/A",
        status: submission.status,
        created_at: submission.created_at,
        updated_at: submission.updated_at,
    };

    // Include AI analysis if available
    if (submission.resumes && submission.resumes.results && submission.resumes.results.length > 0) {
        const result = submission.resumes.results[0];
        response.analysis = {
            score: result.score,
            similarity_score: result.similarity_score,
            strengths: result.strengths,
            weaknesses: result.weaknesses,
            suggestions: result.suggestions,
        };
    }

    return res.status(200).json(response);  

}