// backend/controllers/createJobPosting.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Main controller function
async function createJobPosting(req, res) {
  // console.log('Incoming job post:', req.body);
  console.log("Actual req.body type:", typeof req.body);
console.log("Actual req.body content:", req.body);
let data = req.body;
if (typeof data.body === 'string') {
  try {
    data = JSON.parse(data.body);
  } catch {
    // fallback if not parsable
  }
}
console.log(data)

  try {
    const { user_id, title, description, company, location, is_active } = data

    if (!user_id || !title || !description || !company || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the user exists in auth.users
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create the job posting
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .insert({
        user_id,
        title,
        description,
        company,
        location,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job posting:', jobError);
      return res.status(500).json({ error: 'Failed to create job posting' });
    }

    // Generate public URL
    const publicUrl = `${process.env.PUBLIC_URL}/jobs/${job.id}`;

    return res.status(201).json({
      job,
      publicUrl,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

export default createJobPosting;
