// import { GoogleGenAI } from "@google/genai";
// import dotenv from 'dotenv';
// dotenv.config();

// const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
// const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// /**
//  * Generates an embedding vector for a given text using Google's embedding model.
//  * @param {string} text - The text to generate an embedding for.
//  * @returns {Promise<number[]>} - A promise that resolves to the embedding vector.
//  */
// async function generateEmbedding(text) {
//   try {
//     if (!text || typeof text !== 'string' || !text.trim()) {
//       throw new Error('Input text must be a non-empty string.');
//     }

//     const maxTokens = 8000;
//     const truncatedText = text.length > maxTokens ? text.substring(0, maxTokens) : text;

//     const response = await ai.models.embedContent({
//       model: 'text-embedding-004',
//       contents: truncatedText,
//     });

//     let embeddingValues;

//     if (response && response.embeddings && Array.isArray(response.embeddings) && response.embeddings.length > 0) {
//       embeddingValues = response.embeddings[0].values;
//     } else {
//       console.error('Could not find embedding values in the response. Full response:', response);
//       throw new Error('Invalid response from Google GenAI: could not locate embedding values.');
//     }

//     if (!embeddingValues || embeddingValues.length === 0) {
//       throw new Error('Invalid response from Google GenAI: embedding values array is empty.');
//     }

//     console.log(`Generated embedding with ${embeddingValues.length} dimensions`);
//     return embeddingValues;
//   } catch (error) {
//     console.error('Error generating embedding with Google GenAI:', error);
//     if (error.message.includes('API key') || error.status === 403) {
//       throw new Error('Gemini API key is invalid or missing. Please check your .env file.');
//     }
//     throw new Error(`Failed to generate embedding: ${error.message}`);
//   }
// }

// /**
//  * Generates a job description embedding and saves it to the database.
//  * @param {string} description - The job description text.
//  * @returns {Promise<number[]>} - A promise that resolves to the embedding vector.
//  */
// async function generateAndSaveJobEmbedding(description) {
//   try {
//     if (!description || typeof description !== 'string' || !description.trim()) {
//       throw new Error('Input text must be a non-empty string.');
//     }
//     // The generateEmbedding function from the service now returns a native array
//     return await generateEmbedding(description);
//   } catch (error) {
//     console.error('Error in generateJobEmbedding:', error);
//     throw error;
//   }
// }

// export { generateEmbedding, generateAndSaveJobEmbedding };


import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Generates an embedding vector for a given text using Google's embedding model.
 * @param {string} text - The text to generate an embedding for.
 * @returns {Promise<number[]>} - A promise that resolves to the embedding vector.
 */
async function generateEmbedding(text) {
  try {
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('Input text must be a non-empty string.');
    }

    const maxTokens = 8000;
    // const truncatedText = text.length > maxTokens ? text.substring(0, const maxTokens : text;
    const truncatedText = text.length > maxTokens ? text.substring(0, maxTokens) : text;

    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: truncatedText,
    });

    let embeddingValues;

    if (response && response.embeddings && Array.isArray(response.embeddings) && response.embeddings.length > 0) {
      embeddingValues = response.embeddings[0].values;
    } else {
      console.error('Could not find embedding values in the response. Full response:', response);
      throw new Error('Invalid response from Google GenAI: could not locate embedding values.');
    }

    if (!embeddingValues || embeddingValues.length === 0) {
      throw new Error('Invalid response from Google GenAI: embedding values array is empty.');
    }

    console.log(`Generated embedding with ${embeddingValues.length} dimensions`);
    return embeddingValues;
  } catch (error) {
    console.error('Error generating embedding with Google GenAI:', error);
    if (error.message.includes('API key') || error.status === 403) {
      throw new Error('Gemini API key is invalid or missing. Please check your .env file.');
    }
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

async function generateAndSaveJobEmbedding(description) {
  try {
    if (!description || typeof description !== 'string' || !description.trim()) {
      throw new Error('Input text must be a non-empty string.');
    }
    // The generateEmbedding function from the service now returns a native array
    return await generateEmbedding(description);
  } catch (error) {
    console.error('Error in generateJobEmbedding:', error);
    throw error;
  }
}

export { generateEmbedding, generateAndSaveJobEmbedding };