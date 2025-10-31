import { config } from 'dotenv';
config(); 
import { supabase } from './config/supabase.js';
import express from 'express';
import cors from 'cors';
import multer from 'multer'; 
import checkApplicationStatus from './controllers/checkApplications.js';
import {processResume} from './controllers/processResume.js';
import submitApplication from './controllers/submitApplications.js';
console.log('checkApplicationStatus handler imported:', checkApplicationStatus); 
import analysisResults from './controllers/analysisResults.js';
import getApplications from './controllers/getApplications.js';
import updateApplicationStatus from './controllers/updateApplicationStatus.js';
import {updateJobPosting, createJobPosting} from './controllers/createJobPosting.js';

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: [process.env.PUBLIC_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, 
};

app.use(cors(corsOptions)); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

const upload = multer({ storage: multer.memoryStorage() }); 

app.get('/api/analyze-results/:jobId', analysisResults);
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
app.get("/api/applications/:jobId", getApplications);
app.post("/api/update-application-status/:id", updateApplicationStatus);
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
app.post("/api/job-posting/:jobId", updateJobPosting)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
