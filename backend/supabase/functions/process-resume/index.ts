// backend/supabase/functions/process-resume/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { OpenAI } from 'https://esm.sh/openai@4.20.1';
import pdf from 'https://esm.sh/pdf-parse@1.1.1';
import mammoth from 'https://esm.sh/mammoth@1.6.0';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};

export default async function handler(req, res) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resume_id } = await req.json();

    if (!resume_id) {
      return new Response(JSON.stringify({ error: 'Missing resume_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Get resume record
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resume_id)
      .single();

    if (resumeError || !resume) {
      return new Response(JSON.stringify({ error: 'Resume not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(resume.file_path);

    if (downloadError) {
      console.error('Error downloading resume:', downloadError);
      return new Response(JSON.stringify({ error: 'Failed to download resume' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
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
        return new Response(JSON.stringify({ error: 'Failed to parse PDF' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    } else if (fileName.endsWith('.docx')) {
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value;
      } catch (error) {
        console.error('Error parsing DOCX:', error);
        return new Response(JSON.stringify        { error: 'Failed to parse DOCX' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
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
        return new Response(JSON.stringify({ error: 'Failed to parse DOC' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported file type' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
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
      return new Response(JSON.stringify({ error: 'Failed to update resume' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    return new Response(JSON.stringify({
      resume: updatedResume,
      message: 'Resume processed successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
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