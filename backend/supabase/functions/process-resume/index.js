// backend/functions/process-resume/index.js
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { resume_id } = req.body;

    if (!resume_id) {
      return res.status(400).json({ error: 'Missing resume_id' });
    }

    // Get resume record
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resume_id)
      .single();

    if (resumeError || !resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(resume.file_path);

    if (downloadError) {
      console.error('Error downloading resume:', downloadError);
      return res.status(500).json({ error: 'Failed to download resume' });
    }

    // Extract text based on file type
    let extractedText = '';
    const fileBuffer = Buffer.from(await fileData.arrayBuffer());
    const fileName = resume.file_name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      try {
        const data = await pdf(fileBuffer);
        extractedText = data.text;
      } catch (error) {
        console.error('Error parsing PDF:', error);
        return res.status(500).json({ error: 'Failed to parse PDF' });
      }
    } else if (fileName.endsWith('.docx')) {
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value;
      } catch (error) {
        console.error('Error parsing DOCX:', error);
        return res.status(500).json({ error: 'Failed to parse DOCX' });
      }
    } else if (fileName.endsWith('.doc')) {
      // Note: DOC files are harder to parse without additional libraries
      // This is a simplified approach
      try {
        // For DOC files, we'll use a basic text extraction
        // In a real implementation, you might want to use a library like 'docx'
        extractedText = fileBuffer.toString('utf-8');
      } catch (error) {
        console.error('Error parsing DOC:', error);
        return res.status(500).json({ error: 'Failed to parse DOC' });
      }
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Generate embedding
    const embedding = await generateEmbedding(extractedText);

    // Update resume record with extracted text and embedding
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
      return res.status(500).json({ error: 'Failed to update resume' });
    }

    return res.status(200).json({
      resume: updatedResume,
      message: 'Resume processed successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

async function generateEmbedding(text) {
  try {
    // Truncate text if too long (OpenAI has a limit)
    const maxTokens = 8000;
    const truncatedText = text.length > maxTokens 
      ? text.substring(0, maxTokens) 
      : text;
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: truncatedText,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}