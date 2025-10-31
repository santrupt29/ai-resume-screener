// import pdf from 'pdf-parse';
import {PDFParse} from 'pdf-parse';
import mammoth from 'mammoth';
import dotenv from 'dotenv';
dotenv.config();
import analyzeMatches from './analyzeMatches.js';
import { supabase } from '../config/supabase.js';
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function generateEmbedding(text) {
  try {
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('Input text must be a non-empty string.');
    }

    const maxTokens = 8000;
    const truncatedText = text.length > maxTokens ? text.substring(0, maxTokens) : text;

    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: [{ role: 'user', parts: [{ text: truncatedText }] }],
    });

    // let embeddingValues;
    const embeddingValues = response?.embeddings?.[0]?.values;
    console.log('embeddingValues:', embeddingValues);

    if (response && response.embeddings && Array.isArray(response.embeddings) && response.embeddings.length > 0) {
      // embeddingValues = response.embeddings[0].values;
    } else {
      console.error('Could not find embedding values in the response. Full response:', response);
      throw new Error('Invalid response from Google GenAI: could not locate embedding values.');
    }

    if (!embeddingValues || embeddingValues.length === 0) {
      throw new Error('Invalid response from Google GenAI: embedding values array is empty.');
    }

    return embeddingValues;
  } catch (error) {
    console.error('Error generating embedding with Google GenAI:', error);
    if (error.message.includes('API key') || error.status === 403) {
      throw new Error('Gemini API key is invalid or missing. Please check your .env file.');
    }
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

async function updateResumeStatus(resumeId, status, errorMessage = null) {
  try {
    const updateData = { status };
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }
    await supabase
      .from('resumes')
      .update(updateData)
      .eq('id', resumeId);
    console.log(`Resume ${resumeId} status updated to: ${status}`);
  } catch (error) {
    console.error(`Failed to update status for resume ${resumeId}:`, error);
  }
}

export async function processResume(req, res) {
  const { resume_id, job_posting_id } = req.body;

  const sendResponse = (statusCode, data) => {
    if (res && typeof res.status === 'function') {
      const response = res.status(statusCode);
      if (response && typeof response.json === 'function') {
        return response.json(data);
      }
    }
    throw new Error(data.error || 'An unexpected error occurred during background processing.');
  };

  try {
    if (!resume_id) {
      return sendResponse(400, { error: 'Missing resume_id' });
    }

    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resume_id)
      .single();

    if (resumeError || !resume) {
      return sendResponse(404, { error: 'Resume not found' });
    }

    await updateResumeStatus(resume_id, 'processing');

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(resume.file_path);

    if (downloadError) {
      console.error('Error downloading resume:', downloadError);
      await updateResumeStatus(resume_id, 'error', 'Failed to download resume from storage.');
      return sendResponse(500, { error: 'Failed to download resume' });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    // const fileBuffer = Buffer.from(arrayBuffer);
    const fileBuffer = new Uint8Array(arrayBuffer);

    let extractedText = '';
    const fileName = resume.file_name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      const parser = new PDFParse(fileBuffer);
      // const data = await pdf(fileBuffer);
      const result = await parser.getText();
      // extractedText = data.text;
      extractedText = result.text;
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else if (fileName.endsWith('.doc')) {
      extractedText = fileBuffer.toString('utf-8');
    } else {
      await updateResumeStatus(resume_id, 'error', 'Unsupported file type.');
      return sendResponse(400, { error: 'Unsupported file type' });
    }

    if (!extractedText.trim()) {
      await updateResumeStatus(resume_id, 'error', 'Could not extract text from the resume.');
      return sendResponse(400, { error: 'Could not extract text from the resume.' });
    }

    let embedding;
    try {
      embedding = await generateEmbedding(extractedText);
      // const vector = embedding.data[0].embedding;
      // console.log(vector);
    } catch (embeddingError) {
      console.error('Embedding generation failed:', embeddingError.message);
      await updateResumeStatus(resume_id, 'error', `Embedding generation failed: ${embeddingError.message}`);
      return sendResponse(500, { error: embeddingError.message });
    }

    const { data: updatedResume, error: updateError } = await supabase
      .from('resumes')
      .update({
        extracted_text: extractedText,
        embedding: embedding,
        status: 'processed',
      })
      .eq('id', resume_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating resume:', updateError);
      await updateResumeStatus(resume_id, 'error', 'Failed to update resume record in database.');
      return sendResponse(500, { error: 'Failed to update resume' });
    }

    if (job_posting_id) {
      console.log(`Starting integrated analysis for resume ${resume_id} against job posting ${job_posting_id}`);
      await analyzeMatchesAgainstJob(resume_id, job_posting_id);
    }

    return sendResponse(200, {
      resume: updatedResume,
      message: 'Resume processed successfully',
    });

  } catch (error) {
    console.error('Unexpected error in processResume:', error);
    if (resume_id) {
      await updateResumeStatus(resume_id, 'error', `An unexpected error occurred: ${error.message}`);
    }
    return sendResponse(500, { error: 'An unexpected error occurred' });
  }
}

async function analyzeMatchesAgainstJob(resumeId, jobPostingId) {
  try {
    const mockReq = {
      body: {
        resumeId: resumeId,
        jobId: jobPostingId
      }
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code >= 400) {
            console.error(`Background analysis error (${code}):`, data.error);
          } else {
            console.log('Background analysis successful:', data.message);
          }
        }
      })
    };
    await analyzeMatches(mockReq, mockRes);
  } catch (error) {
    console.error("Error in background analysis:", error);
  }
}

export async function processResumeCore({resume_id, job_posting_id}) {

  const sendResponse = (statusCode, data) => {
    if (res && typeof res.status === 'function') {
      const response = res.status(statusCode);
      if (response && typeof response.json === 'function') {
        return response.json(data);
      }
    }
    throw new Error(data.error || 'An unexpected error occurred during background processing.');
  };

  try {
    if (!resume_id) {
      throw new Error('Missing resume_id');
    }

    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resume_id)
      .single();

    if (resumeError || !resume) {
      throw new Error('Resume not found');
    }

    await updateResumeStatus(resume_id, 'processing');

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(resume.file_path);

    if (downloadError) {
      console.error('Error downloading resume:', downloadError);
      await updateResumeStatus(resume_id, 'error', 'Failed to download resume from storage.');
      throw new Error('Failed to download resume from storage.');
    }

    const arrayBuffer = await fileData.arrayBuffer();
    // const fileBuffer = Buffer.from(arrayBuffer);
    const fileBuffer = new Uint8Array(arrayBuffer);

    let extractedText = '';
    const fileName = resume.file_name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      const parser = new PDFParse(fileBuffer);
      const result = await parser.getText();
      extractedText = result.text;
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else if (fileName.endsWith('.doc')) {
      extractedText = fileBuffer.toString('utf-8');
    } else {
      await updateResumeStatus(resume_id, 'error', 'Unsupported file type.');
      throw new Error('Unsupported file type.');
    }

    if (!extractedText.trim()) {
      await updateResumeStatus(resume_id, 'error', 'Could not extract text from the resume.');
      throw new Error('Could not extract text from the resume.');
    }

    let embedding;
    try {
      embedding = await generateEmbedding(extractedText);
      // const vector = embedding.data[0].embedding;
      // console.log(vector);
    } catch (embeddingError) {
      console.error('Embedding generation failed:', embeddingError.message);
      await updateResumeStatus(resume_id, 'error', `Embedding generation failed: ${embeddingError.message}`);
      throw new Error(`Embedding generation failed: ${embeddingError.message}`);
    }

    const { data: updatedResume, error: updateError } = await supabase
      .from('resumes')
      .update({
        extracted_text: extractedText,
        embedding: embedding,
        status: 'processed',
      })
      .eq('id', resume_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating resume:', updateError);
      await updateResumeStatus(resume_id, 'error', 'Failed to update resume record in database.');
      throw new Error('Failed to update resume record in database.');
    }

    if (job_posting_id) {
      console.log(`Starting integrated analysis for resume ${resume_id} against job posting ${job_posting_id}`);
      await analyzeMatchesAgainstJob(resume_id, job_posting_id);
    }

    return {
      resume: updatedResume,
      message: 'Resume processed successfully',
    }

  } catch (error) {
    console.error('Unexpected error in processResume:', error);
    if (resume_id) {
      await updateResumeStatus(resume_id, 'error', `An unexpected error occurred: ${error.message}`);
    }
    throw new Error(`An unexpected error occurred: ${error.message}`);
  }
}