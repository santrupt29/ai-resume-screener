import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../config/supabase.js';
import {processResume} from './processResume.js';

const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function retryWithBackoff(fn, retries = 5, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise(r => setTimeout(r, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2); 
  }
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB) {
    console.error('cosineSimilarity: One or both vectors are null or undefined.');
    return 0;
  }

  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    console.error('cosineSimilarity: One or both inputs are not arrays.');
    return 0;
  }

  if (vecA.length === 0 || vecB.length === 0) {
    console.error('cosineSimilarity: One or both vectors are empty.');
    return 0;
  }

  if (vecA.length !== vecB.length) {
    console.error(`cosineSimilarity: Vector dimensions do not match (${vecA.length} vs ${vecB.length}).`);
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    console.error('cosineSimilarity: Cannot calculate similarity with a zero-norm vector.');
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

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
      Give the complete response without any text formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
    });

    const content = response.text;

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
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

async function analyzeMatches(req, res) {
  try {
    const { resumeId, jobId } = req.body;

    if (!resumeId || !jobId) {
      return res.status(400).json({ error: 'Missing resumeId or jobId' });
    }

    const { data: resume, error: resumeError } = await supabase
      .from('resumes_with_json_embedding')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (resumeError || !resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const { data: job, error: jobError } = await supabase
      .from('job_postings_with_json_embedding')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    if (!job.embedding) {
      return res.status(400).json({ error: 'Job posting does not have a valid embedding. Please recreate the job posting.' });
    }

    if (!Array.isArray(job.embedding)) {
      return res.status(500).json({ error: 'Internal server error: Job embedding is not a valid array.' });
    }

    if (!resume.embedding || resume.status !== 'processed') {
      try {
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              if (code >= 400) {
                throw new Error(data.error || 'Failed to process resume');
              }
              return data;
            }
          })
        };

        const processedData = await processResume(
          { body: { resume_id: resumeId } },
          mockRes
        );

        resume.extracted_text = processedData.resume.extracted_text;
        resume.embedding = processedData.resume.embedding;
      } catch (processError) {
        console.error('Error processing resume:', processError);
        return res.status(500).json({ error: 'Failed to process resume' });
      }
    }

    const jobEmbedding = job.embedding;

    const similarityScore = cosineSimilarity(resume.embedding, jobEmbedding);
    const similarityPercentage = Math.round(similarityScore * 100);

    // const aiAnalysis = await analyzeResumeWithAI(resume.extracted_text, job.description);
    const aiAnalysis = await retryWithBackoff(
      () => analyzeResumeWithAI(resume.extracted_text, job.description),
      5, 
      1000
    );

    const { data: existingResult } = await supabase
      .from('results')
      .select('id')
      .eq('job_posting_id', jobId)
      .eq('resume_id', resumeId)
      .single();

    let result;

    if (existingResult) {
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

    await supabase
      .from('candidate_submissions')
      .update({ status: 'analyzed' })
      .eq('resume_id', resumeId)
      .eq('job_posting_id', jobId);

    return res.status(200).json({
      result,
      message: 'Analysis completed successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

export default analyzeMatches;