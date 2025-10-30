import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../config/supabase.js';
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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

    let jobEmbedding;
    let vector;
    try {
      jobEmbedding = await generateJobEmbedding(description);
      console.log(jobEmbedding);
      // vector = jobEmbedding.data[0].embedding;
    } catch (embeddingError) {
      console.error('Failed to generate job embedding:', embeddingError);
      return res.status(500).json({ error: 'Failed to process job description for analysis' });
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
        embedding: jobEmbedding,
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


// async function generateJobEmbedding(text) {
//   try {
//     if (!text || typeof text !== 'string' || !text.trim()) {
//       throw new Error('Input text must be a non-empty string.');
//     }

//     // Generate the embedding using the latest API
//     const response = await ai.models.embedContent({
//       model: 'text-embedding-004',
//       content: { parts: [{ text }] },
//     });

//     console.log(response);
//     // Extract the embedding values from the response
//     let embeddingValues = response.embeddings?.values;

//     if (response && response.embeddings && Array.isArray(response.embeddings) && response.embeddings.length > 0) {
//       // embeddingValues = response.embeddings[0].values;
//     } else {
//       console.error('Could not find embedding values in the response. Full response:', response);
//       throw new Error('Invalid response from Google GenAI: could not locate embedding values.');
//     }

//     if (!embeddingValues || embeddingValues.length === 0) {
//       throw new Error('Invalid response from Google GenAI: embedding values array is empty.');
//     }

//     console.log(`Generated job embedding with ${embeddingValues.length} dimensions`);
//     return embeddingValues;
//   } catch (error) {
//     console.error('Error generating job embedding with Google GenAI:', error);
//     throw new Error(`Failed to generate job embedding: ${error.message}`);
//   }
// }

async function generateJobEmbedding(text) {
  try {
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('Input text must be a non-empty string.');
    }

    // ✅ Correct call to embedContent
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: [{ role: 'user', parts: [{ text }] }],
    });

    // ✅ Extract the embedding
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


export default createJobPosting;


// // import dotenv from 'dotenv';
// // dotenv.config();
// // import { supabase } from '../config/supabase.js';
// // import { generateAndSaveJobEmbedding } from './embeddingService.js';

// // async function createJobPosting(req, res) {
// //   try {
// //     let data = req.body;
// //     if (typeof data.body === 'string') {
// //       try {
// //         data = JSON.parse(data.body);
// //       } catch {
// //         // fallback if not parsable
// //       }
// //     }

// //     const { user_id, title, description, company, location, is_active } = data;

// //     if (!user_id || !title || !description || !company || !location) {
// //       return res.status(400).json({ error: 'Missing required fields' });
// //     }

// //     // Verify the user exists in auth.users
// //     const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);

// //     if (userError || !user) {
// //       return res.status(404).json({ error: 'User not found' });
// //     }

// //     let jobEmbedding;
// //     try {
// //       jobEmbedding = await generateAndSaveJobEmbedding(description);
// //     } catch (embeddingError) {
// //       console.error('Failed to generate job embedding:', embeddingError);
// //       return res.status(500).json({ error: 'Failed to process job description for analysis' });
// //     }

// //     // Create the job posting with the embedding
// //     const { data: job, error: jobError } = await supabase
// //       .from('job_postings')
// //       .insert({
// //         user_id,
// //         title,
// //         description,
// //         company,
// //         location,
// //         embedding: jobEmbedding, // This is now a native array
// //         is_active: is_active !== undefined ? is_active : true,
// //       })
// //       .select()
// //       .single();

// //     if (jobError) {
// //       console.error('Error creating job posting:', jobError);
// //       return res.status(500).json({ error: 'Failed to create job posting' });
// //     }

// //     // Generate public URL
// //     const publicUrl = `${process.env.PUBLIC_URL}/jobs/${job.id}`;

// //     return res.status(201).json({
// //       job,
// //       publicUrl,
// //     });
// //   } catch (error) {
// //     console.error('Unexpected error:', error);
// //     return res.status(500).json({ error: 'An unexpected error occurred' });
// //   }
// // }

// // export default createJobPosting;







// // import dotenv from 'dotenv';
// // dotenv.config();
// // import { supabase } from '../config/supabase.js';
// // import {generateAndSaveJobEmbedding}  from './embeddingService.js';

// // async function createJobPosting(req, res) {
// //   try {
// //     let data = req.body;
// //     if (typeof data.body === 'string') {
// //       try {
// //         data = JSON.parse(data.body);
// //       } catch {
// //         // fallback if not parsable
// //       }
// //     }
// //     console.log('Data to be saved:', data);

// //     const { user_id, title, description, company, location, is_active } = data;

// //     if (!user_id || !title || !description || !company || !location) {
// //       return res.status(400).json({ error: 'Missing required fields' });
// //     }

// //     // Verify the user exists in auth.users
// //     const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);

// //     if (userError || !user) {
// //       return res.status(404).json({ error: 'User not found' });
// //     }

// //     let jobEmbedding;
// //     try {
// //       // The function now returns a native array
// //       jobEmbedding = await generateAndSaveJobEmbedding(description);
// //       console.log('Job embedding to be saved:', jobEmbedding);
// //     } catch (embeddingError) {
// //       console.error('Failed to generate job embedding:', embeddingError);
// //       return res.status(500).saveJobEmbedding(description);
// //       return res.status(500).json({ error: 'Failed to process job description for analysis' });
// //     }

// //     // Create the job posting with the embedding
// //     const { data: job, error: jobError } = await supabase
// //       .from('job_postings')
// //       .insert({
// //         user_id,
// //         title,
// //         description,
// //         company,
// //         location,
// //         embedding: jobEmbedding, // This is now a native array
// //         is_active: is_active !== undefined ? is_active : true,
// //       })
// //       .select()
// //       .single();

// //     if (jobError) {
// //       console.error('Error creating job posting:', jobError);
// //       return res.status(500).json({ error: 'Failed to create job posting' });
// //     }

// //     // Generate public URL
// //     const publicUrl = `${process.env.PUBLIC_URL}/jobs/${job.id}`;

// //     return res.status(201).json({
// //       job,
// //       publicUrl,
// //     });
// //   } catch (error) {
// //     console.error('Unexpected error:', error);
// //     return res.status(500).json({ error: 'An unexpected error occurred' });
// //   }
// // }

// // export default createJobPosting;









// import dotenv from 'dotenv';
// dotenv.config();
// import { supabase } from '../config/supabase.js';
// import { generateAndSaveJobEmbedding } from './embeddingService.js';

// async function createJobPosting(req, res) {
//   try {
//     let data = req.body;

//     // 🧠 Handle possible JSON-stringified input
//     if (typeof data === 'string') {
//       try {
//         data = JSON.parse(data);
//       } catch {
//         console.warn('Request body was not valid JSON.');
//       }
//     } else if (typeof data.body === 'string') {
//       try {
//         data = JSON.parse(data.body);
//       } catch {
//         console.warn('Nested body was not valid JSON.');
//       }
//     }

//     console.log('📩 Data to be saved:', data);

//     const { user_id, title, description, company, location, is_active = true } = data;

//     if (!user_id || !title || !description || !company || !location) {
//       return res.status(400).json({ error: 'Missing required fields.' });
//     }

//     // ✅ Verify user exists
//     const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);
//     if (userError || !user) {
//       console.error('❌ User not found:', userError);
//       return res.status(404).json({ error: 'User not found.' });
//     }

//     // ✅ Generate embedding for job description
//     let jobEmbedding;
//     try {
//       jobEmbedding = await generateAndSaveJobEmbedding(description);
//       console.log(`🧠 Embedding generated with ${jobEmbedding.length} dimensions`);
//     } catch (embeddingError) {
//       console.error('❌ Embedding generation failed:', embeddingError);
//       return res.status(500).json({ error: 'Failed to generate embedding for job description.' });
//     }

//     // ✅ Convert JS array → PostgreSQL vector literal
//     // Example: [0.1, 0.2, 0.3] → '[0.1,0.2,0.3]'
//     const embeddingVector = `[${jobEmbedding.join(',')}]`;

//     // ✅ Use raw SQL for insertion
//     const { data: job, error: jobError } = await supabase.rpc('exec_sql', {
//       sql: `
//         INSERT INTO job_postings 
//           (user_id, title, description, company, location, embedding, is_active)
//         VALUES 
//           ('${user_id}', '${title.replace(/'/g, "''")}', '${description.replace(/'/g, "''")}', 
//            '${company.replace(/'/g, "''")}', '${location.replace(/'/g, "''")}', 
//            '${embeddingVector}', ${is_active})
//         RETURNING *;
//       `
//     });
    

//     if (jobError) {
//       console.error('❌ Error inserting job posting:', jobError);
//       return res.status(500).json({ error: `Database error: ${jobError.message}` });
//     }

//     const publicUrl = `${process.env.PUBLIC_URL}/jobs/${job[0].id}`;
//     console.log('✅ Job created successfully with ID:', job[0].id);

//     return res.status(201).json({
//       message: 'Job posting created successfully!',
//       job: job[0],
//       publicUrl,
//     });

//   } catch (error) {
//     console.error('💥 Unexpected error:', error);
//     return res.status(500).json({ error: 'An unexpected server error occurred.' });
//   }
// }

// export default createJobPosting;
