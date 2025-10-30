import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../config/supabase.js';
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function createJobPosting(req, res) {
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

    const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let jobEmbedding;
    try {
      jobEmbedding = await generateJobEmbedding(description);
      console.log(jobEmbedding);
    } catch (embeddingError) {
      console.error('Failed to generate job embedding:', embeddingError);
      return res.status(500).json({ error: 'Failed to process job description for analysis' });
    }

    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .insert({
        user_id,
        title,
        description,
        company,
        location,
        embedding: jobEmbedding,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job posting:', jobError);
      return res.status(500).json({ error: 'Failed to create job posting' });
    }

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

async function generateJobEmbedding(text) {
  try {
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('Input text must be a non-empty string.');
    }

    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: [{ role: 'user', parts: [{ text }] }],
    });

    const embeddingValues = response?.embeddings?.[0]?.values;
    console.log("Embedding is array?", Array.isArray(embeddingValues));
console.log("Embedding types:", embeddingValues.map(x => typeof x));
console.log("Embedding length:", embeddingValues.length);

    if (!embeddingValues || embeddingValues.length === 0) {
      throw new Error('Invalid response from Google GenAI: embedding values array is empty.');
    }

    console.log(`✅ Generated job embedding with ${embeddingValues.length} dimensions`);
    return embeddingValues;
  } catch (error) {
    console.error('❌ Error generating job embedding with Google GenAI:', error);
    throw new Error(`Failed to generate job embedding: ${error.message}`);
  }
}


export async function updateJobPosting(req, res) {
  try {
    const { jobId } = req.params;
    const { user_id, title, description, company, location, is_active } = req.body;
    console.log("Incoming job post:", req.body);
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }
    if (!user_id || !title || !description || !company || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let jobEmbedding;
    try {
      jobEmbedding = await generateJobEmbedding(description);
      console.log(jobEmbedding);
    } catch (embeddingError) {
      console.error('Failed to generate job embedding:', embeddingError);
      return res.status(500).json({ error: 'Failed to process job description for analysis' });
    }

    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .update({
        title,
        description,
        company,
        location,
        embedding: jobEmbedding,
        is_active: is_active !== undefined ? is_active : true,
      })
      .eq('id', jobId)
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job posting:', jobError);
      return res.status(500).json({ error: 'Failed to create job posting' });
    }
    console.log("Updated job posting:", job);
    return res.status(200).json(job);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
