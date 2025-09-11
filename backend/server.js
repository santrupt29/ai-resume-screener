// backend/server.js

import { config } from 'dotenv';
config(); // Load environment variables from .env.local or .env
// console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
// console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

import express from 'express';
import cors from 'cors';
import multer from 'multer'; 

import analyzeMatches from './controllers/analyzeMatches.js';
import checkApplicationStatus from './controllers/checkApplications.js';
import createJobPosting from './controllers/createJobPosting.js';
import processResume from './controllers/processResume.js';
import submitApplication from './controllers/submitApplications.js';

// // Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// CORS configuration - adjust origins as needed (e.g., your frontend URL)
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Add your frontend origins here (e.g., Vite default port 5173)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If you need cookies/auth
};

// Middlewares
app.use(cors(corsOptions)); // Enable CORS with specific options
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Multer setup for file uploads (used in submit-application)
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory for Supabase upload

// Routes
app.post('/api/analyze-matches', analyzeMatches);
app.post('/api/check-application-status', checkApplicationStatus);
app.post('/api/create-job-posting', createJobPosting);
app.post('/api/process-resume', processResume);
app.post('/api/submit-application', upload.single('resume'), submitApplication); // Handles file upload via multer
app.get("/api/job-postings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("job_postings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching job postings:", error);
      return res.status(500).json({ error: "Failed to fetch job postings" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected error occurred" });
  }
});
app.get("/api/job-posting/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;

    const { data, error } = await supabase
      .from("job_postings")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) {
      console.error("Error fetching job posting:", error);
      return res.status(500).json({ error: "Failed to fetch job posting" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected error occurred" });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
