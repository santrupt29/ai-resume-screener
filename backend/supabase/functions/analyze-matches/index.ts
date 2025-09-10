// backend/supabase/functions/analyze-matches/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { OpenAI } from 'https://esm.sh/openai@4.20.1';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Function to generate job description embedding
async function generateJobEmbedding(jobDescription) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: jobDescription,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating job embedding:', error);
    throw new Error('Failed to generate job embedding');
  }
}

// Function to analyze resume against job description
async function analyzeResumeWithAI(resumeText, jobDescription) {
  try {
    const prompt = `
    Analyze the following resume against the job description and provide:
    1. An overall match score from 0-100
    2. A list of strengths (what makes the candidate a good fit)
    3. A list of weaknesses (what the candidate is missing)
    4. Suggestions for interview questions
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Please respond with JSON in the following format:
    {
      "score": 85,
      "strengths": ["Strong experience in relevant technologies", "Leadership experience", etc.],
      "weaknesses": ["Limited experience with X", "Missing certification Y", etc.],
      "suggestions": ["Ask about experience with Z", "Discuss leadership style", etc.]
    }
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert recruiter analyzing resumes against job descriptions.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });
    
    const content = response.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', content);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error analyzing resume with AI:', error);
    throw new Error('Failed to analyze resume with AI');
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }

  try {
    const { resumeId, jobId } = req.body;

    if (!resumeId || !jobId) {
      return res.status(400).json({ error: 'Missing resumeId or jobId' });
    }

    // Get resume record
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (resumeError || !resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Get job posting
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    // Process resume if not already processed
    if (!resume.embedding || resume.status !== 'processed') {
      // Call process-resume function
      const processResponse = await fetch(`${process.env.SUPABASE_URL}/functions/v1/process-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ resume_id: resumeId }),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        return res.status(500).json({ error: errorData.error || 'Failed to process resume' });
      }

      // Get updated resume
      const { data: updatedResume } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (!updatedResume || !updatedResume.embedding) {
        return res.status(500).json({ error: 'Failed to process resume' });
      }

      resume.extracted_text = updatedResume.extracted_text;
      resume.embedding = updatedResume.embedding;
    }

    // Generate job description embedding
    const jobEmbedding = await generateJobEmbedding(job.description);

    // Calculate similarity score
    const similarityScore = cosineSimilarity(resume.embedding, jobEmbedding);
    const similarityPercentage = Math.round(similarityScore * 100);

    // Analyze resume with AI
    const aiAnalysis = await analyzeResumeWithAI(resume.extracted_text, job.description);

    // Check if analysis result already exists
    const { data: existingResult } = await supabase
      .from('results')
      .select('id')
      .eq('job_posting_id', jobId)
      .eq('resume_id', resumeId)
      .single();

    let result;
    
    if (existingResult) {
      // Update existing result
      const { data: updatedResult, error: updateError } = await supabase
        .from('results')
        .update({
          score: aiAnalysis.score,
          similarity_score: similarityPercentage,
          strengths: aiAnalysis.strengths,
          weaknesses: aiAnalysis.weaknesses,
          suggestions: aiAnalysis.suggestions,
        })
        .eq('id', existingResult.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating analysis result:', updateError);
        return res.status(500).json({ error: 'Failed to update analysis result' });
      }

      result = updatedResult;
    } else {
      // Create new result
      const { data: newResult, error: insertError } = await supabase
        .from('results')
        .insert({
          job_posting_id: jobId,
          resume_id: resumeId,
          score: aiAnalysis.score,
          similarity_score: similarityPercentage,
          strengths: aiAnalysis.strengths,
          weaknesses: aiAnalysis.weaknesses,
          suggestions: aiAnalysis.suggestions,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating analysis result:', insertError);
        return res.status(500).json({ error: 'Failed to create analysis result' });
      }

      result = newResult;
    }

    return res.status(200).json({
      result,
      message: 'Analysis completed successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}