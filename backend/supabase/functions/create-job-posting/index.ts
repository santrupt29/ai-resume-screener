// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export default async function handler(req, res) {
//   try {
//     const { user_id, title, description, company, location, is_active } = req.body;

//     if (!user_id || !title || !description || !company || !location) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Verify the user exists
//     const { data: user, error: userError } = await supabase
//       .from('users')
//       .select('id')
//       .eq('id', user_id)
//       .single();

//     if (userError || !user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Create the job posting
//     const { data: job, error: jobError } = await supabase
//       .from('job_postings')
//       .insert({
//         user_id,
//         title,
//         description,
//         company,
//         location,
//         is_active: is_active !== undefined ? is_active : true,
//       })
//       .select()
//       .single();

//     if (jobError) {
//       console.error('Error creating job posting:', jobError);
//       return res.status(500).json({ error: 'Failed to create job posting' });
//     }

//     // Generate public URL
//     const publicUrl = `${process.env.PUBLIC_URL}/jobs/${job.id}`;

//     return res.status(201).json({
//       job,
//       publicUrl,
//     });
//   } catch (error) {
//     console.error('Unexpected error:', error);
//     return res.status(500).json({ error: 'An unexpected error occurred' });
//   }
// }

// backend/supabase/functions/create-job-posting/index.ts
// backend/supabase/functions/create-job-posting/index.ts
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// // CORS headers
// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
//   'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
// };

// export default async function handler(req, res) {
//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders });
//   }

//   try {
//     const { user_id, title, description, company, location, is_active } = await req.json();

//     if (!user_id || !title || !description || !company || !location) {
//       return new Response(JSON.stringify({ error: 'Missing required fields' }), {
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//         status: 400
//       });
//     }

//     // Verify the user exists
//     const { data: user, error: userError } = await supabase
//       .from('users')
//       .select('id')
//       .eq('id', user_id)
//       .single();

//     if (userError || !user) {
//       return new Response(JSON.stringify({ error: 'User not found' }), {
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//         status: 404
//       });
//     }

//     // Create the job posting
//     const { data: job, error: jobError } = await supabase
//       .from('job_postings')
//       .insert({
//         user_id,
//         title,
//         description,
//         company,
//         location,
//         is_active: is_active !== undefined ? is_active : true,
//       })
//       .select()
//       .single();

//     if (jobError) {
//       console.error('Error creating job posting:', jobError);
//       return new Response(JSON.stringify({ error: 'Failed to create job posting' }), {
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//         status: 500
//       });
//     }

//     // Generate public URL
//     const publicUrl = `${process.env.PUBLIC_URL}/jobs/${job.id}`;

//     return new Response(JSON.stringify({
//       job,
//       publicUrl,
//     }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       status: 201
//     });
//   } catch (error) {
//     console.error('Unexpected error:', error);
//     return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       status: 500
//     });
//   }
// }

// supabase/functions/create-job-posting/index.ts
// backend/supabase/functions/create-job-posting/index.ts
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { createClient } from '@supabase/supabase-js';


const supabase  = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const { user_id, title, description, company, location, is_active } = await req.json();

    if (!user_id || !title || !description || !company || !location) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Verify the user exists in auth.users
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
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
      return new Response(JSON.stringify({ error: 'Failed to create job posting' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    // Generate public URL
    const publicUrl = `${process.env.PUBLIC_URL}/jobs/${job.id}`;

    return new Response(JSON.stringify({
      job,
      publicUrl,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}