import { supabase } from './supabase';
import { axiosInstance } from './axios';

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signUp = async (email, password, name) => {
  try {
    console.log('Attempting to sign up user:', { email, name });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      throw error;
    }
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { id: data.user.id, name }
        ]);

      if (profileError) {
        console.error('Profile insert error:', profileError);
        throw profileError;
      }
    }

    console.log('Sign up + profile creation successful:', data);
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
};



export const createJobPosting = async (jobData) => {
  try {
    const response = await axiosInstance.post("/create-job-posting", jobData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create job posting");
  }
};

export const getJobPostings = async (userId) => {
  console.log("API: getJobPostings called with userId:", userId);
  const response = await axiosInstance.get(`/job-postings/${userId}`);
  return response.data;
};

export const getJobPosting = async (jobId) => {
  const response = await axiosInstance.get(`/job-posting/${jobId}`);
  return response.data;
};

export const updateJobPosting = async (jobId, updates) => {
  const response = await axiosInstance.put(`/job-posting/${jobId}`, updates);
  return response.data;
};

export const deleteJobPosting = async (jobId) => {
  const response = await axiosInstance.delete(`/job-posting/${jobId}`);
  return response.data;
};

export const submitApplication = async (formPayload) => {
  const response = await axiosInstance.post("/submit-application", formPayload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};


export const getApplications = async (jobId) => {
  try {
    const response = await axiosInstance.get(`/applications/${jobId}`);
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching applications:", error);
    return { error: error.response?.data?.error || "Failed to fetch applications" };
  }
};

export const updateApplicationStatus = async (id, status) => {
  try {
    const response = await axiosInstance.post(`/update-application-status/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating application status:", error);
    throw new Error(error.response?.data?.error || "Failed to update application status");
  }
  // const response = await axiosInstance.post(`/update-application-status/${applicationId}`, { status });
  // return response.data;
};

export const checkApplicationStatus = async (applicationId, email) => {
  try {
    const response = await axiosInstance.post("/check-application-status", { applicationId, email });
    return response.data;
  } catch (error) {
    console.error("Error checking application status:", error);
    throw new Error(error.response?.data?.error || "Failed to check application status");
  }
  
};

// ------------------- Resume Analysis -------------------

export const analyzeResume = async (resumeId, jobId) => {
  const response = await axiosInstance.post("/analyze-matches", { resumeId, jobId });
  return response.data;
};

export const getAnalysisResults = async (jobId) => {
  const response = await axiosInstance.get(`/analyze-results/${jobId}`);
  return response.data;
};

// ------------------- Resumes -------------------

export const getResume = async (resumeId) => {
  const response = await axiosInstance.get(`/resume/${resumeId}`);
  return response.data;
};

export const updateResume = async (resumeId, updates) => {
  const response = await axiosInstance.put(`/resume/${resumeId}`, updates);
  return response.data;
};

export const uploadResume = async (file, path) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);

  const response = await axiosInstance.post("/upload-resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getResumeUrl = async (path) => {
  const response = await axiosInstance.get(`/resume-url?path=${encodeURIComponent(path)}`);
  return response.data;
};

// ------------------- Utilities -------------------

export const generatePublicJobUrl = (jobId) => {
  return `${window.location.origin}/jobs/${jobId}`;
};

export const generateApplicationStatusUrl = () => {
  return `${window.location.origin}/status`;
};

export const handleApiError = (error, customMessage) => {
  console.error("API Error:", error);
  throw new Error(error.response?.data?.error || customMessage || "An unexpected error occurred");
};

// ------------------- Dashboard -------------------

export const getJobPostingsWithCounts = async (userId) => {
  const response = await axiosInstance.get(`/job-postings-with-counts/${userId}`);
  return response.data;
};

export const getDashboardStats = async (userId) => {
  const response = await axiosInstance.get(`/dashboard-stats/${userId}`);
  return response.data;
};

// ------------------- Search -------------------

export const searchJobPostings = async (searchTerm, userId) => {
  const response = await axiosInstance.get(
    `/search-job-postings?term=${encodeURIComponent(searchTerm)}&userId=${userId}`
  );
  return response.data;
};

// ------------------- Export -------------------

const api = {
  createJobPosting,
  getJobPostings,
  getJobPosting,
  updateJobPosting,
  deleteJobPosting,
  submitApplication,
  getApplications,
  updateApplicationStatus,
  checkApplicationStatus,
  analyzeResume,
  getAnalysisResults,
  getResume,
  updateResume,
  uploadResume,
  getResumeUrl,
  generatePublicJobUrl,
  generateApplicationStatusUrl,
  handleApiError,
  getJobPostingsWithCounts,
  getDashboardStats,
  searchJobPostings,
};

export default api;
