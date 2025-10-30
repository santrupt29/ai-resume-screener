// import pdf from 'pdf-parse';
// import mammoth from 'mammoth';
// import dotenv from 'dotenv';
// dotenv.config();
// import { supabase } from '../config/supabase.js';
// import { GoogleGenAI } from "@google/genai";

// // Initialize the Google GenAI client with your API key from the .env file
// const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

// /**
//  * Generates an embedding vector for a given text using Google's gemini-embedding-001 model.
//  * @param {string} text - The text to generate an embedding for.
//  * @returns {Promise<number[]>} - A promise that resolves to the embedding vector.
//  */
// async function generateEmbedding(text) {
//   try {
//     // The model can handle a reasonable amount of text, but it's good practice
//     // to ensure it's not excessively long.
//     const maxTokens = 8000;
//     const truncatedText = text.length > maxTokens ? text.substring(0, maxTokens) : text;

//     const response = await ai.models.embedContent({
//       model: 'gemini-embedding-001',
//       contents: truncatedText,
//     });

//     // The embedding vector is in the `values` property of the `embedding` object
//     return response.embedding.values;
//   } catch (error) {
//     console.error('Error generating embedding with Google GenAI:', error);
//     // Check for specific authentication errors
//     if (error.message.includes('API key')) {
//       throw new Error('Google GenAI API key is invalid or missing. Please check your .env file.');
//     }
//     throw new Error('Failed to generate embedding');
//   }
// }

// /**
//  * Main controller function to process a resume.
//  * It downloads the file, extracts text, generates an embedding, and updates the database.
//  * @param {object} req - The Express request object.
//  * @param {object} res - The Express response object.
//  */
// async function processResume(req, res) {
//   const { resume_id } = req.body;

//   // Helper function to send responses or throw errors if res is not available (for background calls)
//   const sendResponse = (statusCode, data) => {
//     if (res && res.status && res.json) {
//       return res.status(statusCode).json(data);
//     }
//     throw new Error(data.error || 'An unexpected error occurred');
//   };

//   try {
//     if (!resume_id) {
//       return sendResponse(400, { error: 'Missing resume_id' });
//     }

//     // Get resume record
//     const { data: resume, error: resumeError } = await supabase
//       .from('resumes')
//       .select('*')
//       .eq('id', resume_id)
//       .single();

//     if (resumeError || !resume) {
//       return sendResponse(404, { error: 'Resume not found' });
//     }

//     // Update status to 'processing' before starting the work
//     await supabase
//       .from('resumes')
//       .update({ status: 'processing' })
//       .eq('id', resume_id);

//     // Download the file from Supabase Storage
//     const { data: fileData, error: downloadError } = await supabase.storage
//       .from('resumes')
//       .download(resume.file_path);

//     if (downloadError) {
//       console.error('Error downloading resume:', downloadError);
//       await updateResumeStatus(resume_id, 'error', 'Failed to download resume from storage.');
//       return sendResponse(500, { error: 'Failed to download resume' });
//     }

//     // Convert to Buffer
//     const arrayBuffer = await fileData.arrayBuffer();
//     const fileBuffer = Buffer.from(arrayBuffer);

//     // Extract text based on file type
//     let extractedText = '';
//     const fileName = resume.file_name.toLowerCase();

//     if (fileName.endsWith('.pdf')) {
//       const data = await pdf(fileBuffer);
//       extractedText = data.text;
//     } else if (fileName.endsWith('.docx')) {
//       const result = await mammoth.extractRawText({ buffer: fileBuffer });
//       extractedText = result.value;
//     } else if (fileName.endsWith('.doc')) {
//       // Note: DOC files are harder to parse. This is a simplified approach.
//       extractedText = fileBuffer.toString('utf-8');
//     } else {
//       await updateResumeStatus(resume_id, 'error', 'Unsupported file type.');
//       return sendResponse(400, { error: 'Unsupported file type' });
//     }

//     if (!extractedText.trim()) {
//       await updateResumeStatus(resume_id, 'error', 'Could not extract text from the resume.');
//       return sendResponse(400, { error: 'Could not extract text from the resume.' });
//     }

//     // Generate embedding
//     let embedding;
//     try {
//       embedding = await generateEmbedding(extractedText);
//     } catch (embeddingError) {
//       console.error('Embedding generation failed:', embeddingError.message);
//       await updateResumeStatus(resume_id, 'error', `Embedding generation failed: ${embeddingError.message}`);
//       return sendResponse(500, { error: embeddingError.message });
//     }

//     // Update resume record with extracted text and embedding
//     const { data: updatedResume, error: updateError } = await supabase
//       .from('resumes')
//       .update({
//         extracted_text: extractedText,
//         embedding: embedding,
//         status: 'processed',
//       })
//       .eq('id', resume_id)
//       .select()
//       .single();

//     if (updateError) {
//       console.error('Error updating resume:', updateError);
//       await updateResumeStatus(resume_id, 'error', 'Failed to update resume record in database.');
//       return sendResponse(500, { error: 'Failed to update resume' });
//     }

//     return sendResponse(200, {
//       resume: updatedResume,
//       message: 'Resume processed successfully',
//     });

//   } catch (error) {
//     console.error('Unexpected error in processResume:', error);
//     if (resume_id) {
//       await updateResumeStatus(resume_id, 'error', `An unexpected error occurred: ${error.message}`);
//     }
//     return sendResponse(500, { error: 'An unexpected error occurred' });
//   }
// }

// /**
//  * Helper function to update the resume status in the database.
//  * @param {string} resumeId - The ID of the resume to update.
//  * @param {string} status - The new status ('processing', 'processed', 'error').
//  * @param {string} [errorMessage] - An optional error message to store.
//  */
// async function updateResumeStatus(resumeId, status, errorMessage = null) {
//   try {
//     const updateData = { status };
//     if (errorMessage) {
//       updateData.error_message = errorMessage;
//     }
//     await supabase
//       .from('resumes')
//       .update(updateData)
//       .eq('id', resumeId);
//     console.log(`Resume ${resumeId} status updated to: ${status}`);
//   } catch (error) {
//     console.error(`Failed to update status for resume ${resumeId}:`, error);
//   }
// }

// export default processResume;





// controllers/processResume.js

// controllers/processResume.js

import pdf from 'pdf-parse';
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

/**
 * Helper function to update the resume status in the database.
 * @param {string} resumeId - The ID of the resume to update.
 * @param {string} status - The new status ('processing', 'processed', 'error').
 * @param {string} [errorMessage] - An optional error message to store.
 */
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

/**
 * Main controller function to process a resume.
 * It downloads the file, extracts text, generates an embedding, and updates the database.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object (can be a mock for background calls).
 */
async function processResume(req, res) {
  const { resume_id, job_posting_id } = req.body;

  // This helper function handles sending responses for both API calls and background processing.
  const sendResponse = (statusCode, data) => {
    // If a real response object exists, use it.
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

    // Get resume record
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resume_id)
      .single();

    if (resumeError || !resume) {
      return sendResponse(404, { error: 'Resume not found' });
    }

    // Update status to 'processing' before starting the work
    await updateResumeStatus(resume_id, 'processing');

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(resume.file_path);

    if (downloadError) {
      console.error('Error downloading resume:', downloadError);
      await updateResumeStatus(resume_id, 'error', 'Failed to download resume from storage.');
      return sendResponse(500, { error: 'Failed to download resume' });
    }

    // Convert to Buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Extract text based on file type
    let extractedText = '';
    const fileName = resume.file_name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      const data = await pdf(fileBuffer);
      extractedText = data.text;
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else if (fileName.endsWith('.doc')) {
      // Note: DOC files are harder to parse. This is a simplified approach.
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

export default processResume;







