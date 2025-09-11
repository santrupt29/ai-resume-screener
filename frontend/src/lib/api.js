// // // frontend/src/lib/api.js
// // import { supabase } from './supabase';

// // // Job postings API
// // export const createJobPosting = async (jobData) => {
// //   const { data, error } = await supabase.functions.invoke('create-job-posting', {
// //     body: jobData,
// //   });
  
// //   if (error) throw error;
// //   return data;
// // };

// // export const getJobPostings = async (userId) => {
// //   const { data, error } = await supabase
// //     .from('job_postings')
// //     .select('*')
// //     .eq('user_id', userId)
// //     .order('created_at', { ascending: false });
  
// //   if (error) throw error;
// //   return data;
// // };

// // export const getJobPosting = async (jobId) => {
// //   const { data, error } = await supabase
// //     .from('job_postings')
// //     .select('*')
// //     .eq('id', jobId)
// //     .single();
  
// //   if (error) throw error;
// //   return data;
// // };

// // export const updateJobPosting = async (jobId, updates) => {
// //   const { data, error } = await supabase
// //     .from('job_postings')
// //     .update(updates)
// //     .eq('id', jobId)
// //     .select()
// //     .single();
  
// //   if (error) throw error;
// //   return data;
// // };

// // export const deleteJobPosting = async (jobId) => {
// //   const { error } = await supabase
// //     .from('job_postings')
// //     .delete()
// //     .eq('id', jobId);
  
// //   if (error) throw error;
// //   return true;
// // };

// // // Applications API
// // export const submitApplication = async (applicationData) => {
// //   const { data, error } = await supabase.functions.invoke('submit-application', {
// //     body: applicationData,
// //   });
  
// //   if (error) throw error;
// //   return data;
// // };

// // export const getApplications = async (jobId) => {
// //   const { data, error } = await supabase
// //     .from('candidate_submissions')
// //     .select(`
// //       *,
// //       resume:resumes(*),
// //       job_posting:job_postings(*)
// //     `)
// //     .eq('job_posting_id', jobId)
// //     .order('created_at', { ascending: false });
  
// //   if (error) throw error;
// //   return data;
// // };

// // export const updateApplicationStatus = async (applicationId, status) => {
// //   const { data, error } = await supabase
// //     .from('candidate_submissions')
// //     .update({ status })
// //     .eq('id', applicationId)
// //     .select()
// //     .single();
  
// //   if (error) throw error;
// //   return data;
// // };

// // export const checkApplicationStatus = async (applicationId, email) => {
// //   const { data, error } = await supabase.functions.invoke('check-application-status', {
// //     body: { applicationId, email },
// //   });
  
// //   if (error) throw error;
// //   return data;
// // };

// // // Analysis API
// // export const analyzeResume = async (resumeId, jobId) => {
// //   const { data, error } = await supabase.functions.invoke('analyze-matches', {
// //     body: { resumeId, jobId },
// //   });
  
// //   if (error) throw error;
// //   return data;
// // };

// // export const getAnalysisResults = async (jobId) => {
// //   const { data, error } = await supabase
// //     .from('results')
// //     .select(`
// //       *,
// //       resume:resumes(*),
// //       candidate_submission:candidate_submissions(*)
// //     `)
// //     .eq('job_posting_id', jobId)
// //     .order('score', { ascending: false });
  
// //   if (error) throw error;
// //   return data;
// // };

// // // Auth API
// // export const getCurrentUser = async () => {
// //   const { data: { user } } = await supabase.auth.getUser();
// //   return user;
// // };

// // export const signIn = async (email, password) => {
// //   const { data, error } = await supabase.auth.signInWithPassword({
// //     email,
// //     password,
// //   });
  
// //   if (error) throw error;
// //   return data;
// // };

// // // export const signUp = async (email, password, name) => {
// // //   const { data, error } = await supabase.auth.signUp({
// // //     email,
// // //     password,
// // //     options: {
// // //       data: {
// // //         name,
// // //       },
// // //     },
// // //   });
  
// // //   if (error) throw error;
// // //   return data;
// // // };
// // export const signUp = async (email, password, name) => {
// //   try {
// //     console.log('Attempting to sign up user:', { email, name });
    
// //     const { data, error } = await supabase.auth.signUp({
// //       email,
// //       password,
// //       options: {
// //         data: {
// //           name,
// //         },
// //       },
// //     });
    
// //     if (error) {
// //       console.error('Supabase auth error:', error);
// //       throw error;
// //     }
    
// //     console.log('Sign up response:', data);
// //     return data;
// //   } catch (error) {
// //     console.error('Signup error:', error);
// //     throw error;
// //   }
// // };

// // export const signOut = async () => {
// //   const { error } = await supabase.auth.signOut();
// //   if (error) throw error;
// //   return true;
// // };



// // src/lib/api.js
// import { supabase } from './supabase';

// // Auth API
// export const getCurrentUser = async () => {
//   const { data: { user } } = await supabase.auth.getUser();
//   return user;
// };

// export const signIn = async (email, password) => {
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });
  
//   if (error) throw error;
//   return data;
// };

// export const signUp = async (email, password, name) => {
//   try {
//     console.log('Attempting to sign up user:', { email, name });

//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (error) {
//       console.error('Supabase auth error:', error);
//       throw error;
//     }
//     if (data.user) {
//       const { error: profileError } = await supabase
//         .from('profiles')
//         .insert([
//           { id: data.user.id, full_name: name }
//         ]);

//       if (profileError) {
//         console.error('Profile insert error:', profileError);
//         throw profileError;
//       }
//     }

//     console.log('Sign up + profile creation successful:', data);

//     console.log('Sign up response:', data);
//     return data;
//   } catch (error) {
//     console.error('Signup error:', error);
//     throw error;
//   }
// };


// export const signOut = async () => {
//   const { error } = await supabase.auth.signOut();
//   if (error) throw error;
//   return true;
// };

// // Job postings API
// export const createJobPosting = async (jobData) => {
//   const { data, error } = await supabase.functions.invoke('create-job-posting', {
//     body: jobData,
//   });
  
//   if (error) throw error;
//   return data;
// };

// export const getJobPostings = async (userId) => {
//   const { data, error } = await supabase
//     .from('job_postings')
//     .select('*')
//     .eq('user_id', userId)
//     .order('created_at', { ascending: false });
  
//   if (error) throw error;
//   return data;
// };

// export const getJobPosting = async (jobId) => {
//   const { data, error } = await supabase
//     .from('job_postings')
//     .select('*')
//     .eq('id', jobId)
//     .single();
  
//   if (error) throw error;
//   return data;
// };

// export const updateJobPosting = async (jobId, updates) => {
//   const { data, error } = await supabase
//     .from('job_postings')
//     .update(updates)
//     .eq('id', jobId)
//     .select()
//     .single();
  
//   if (error) throw error;
//   return data;
// };

// export const deleteJobPosting = async (jobId) => {
//   const { error } = await supabase
//     .from('job_postings')
//     .delete()
//     .eq('id', jobId);
  
//   if (error) throw error;
//   return true;
// };

// // Applications API
// export const submitApplication = async (applicationData) => {
//   const { data, error } = await supabase.functions.invoke('submit-application', {
//     body: applicationData,
//   });
  
//   if (error) throw error;
//   return data;
// };

// export const getApplications = async (jobId) => {
//   const { data, error } = await supabase
//     .from('candidate_submissions')
//     .select(`
//       *,
//       resume:resumes(*),
//       job_posting:job_postings(*)
//     `)
//     .eq('job_posting_id', jobId)
//     .order('created_at', { ascending: false });
  
//   if (error) throw error;
//   return data;
// };

// export const updateApplicationStatus = async (applicationId, status) => {
//   const { data, error } = await supabase
//     .from('candidate_submissions')
//     .update({ status })
//     .eq('id', applicationId)
//     .select()
//     .single();
  
//   if (error) throw error;
//   return data;
// };

// export const checkApplicationStatus = async (applicationId, email) => {
//   const { data, error } = await supabase.functions.invoke('check-application-status', {
//     body: { applicationId, email },
//   });
  
//   if (error) throw error;
//   return data;
// };

// // Analysis API
// export const analyzeResume = async (resumeId, jobId) => {
//   const { data, error } = await supabase.functions.invoke('analyze-matches', {
//     body: { resumeId, jobId },
//   });
  
//   if (error) throw error;
//   return data;
// };

// export const getAnalysisResults = async (jobId) => {
//   const { data, error } = await supabase
//     .from('results')
//     .select(`
//       *,
//       resume:resumes(*),
//       candidate_submission:candidate_submissions(*)
//     `)
//     .eq('job_posting_id', jobId)
//     .order('score', { ascending: false });
  
//   if (error) throw error;
//   return data;
// };

// // Resume API
// export const getResume = async (resumeId) => {
//   const { data, error } = await supabase
//     .from('resumes')
//     .select('*')
//     .eq('id', resumeId)
//     .single();
  
//   if (error) throw error;
//   return data;
// };

// export const updateResume = async (resumeId, updates) => {
//   const { data, error } = await supabase
//     .from('resumes')
//     .update(updates)
//     .eq('id', resumeId)
//     .select()
//     .single();
  
//   if (error) throw error;
//   return data;
// };

// // Storage API
// export const uploadResume = async (file, path) => {
//   const { data, error } = await supabase.storage
//     .from('resumes')
//     .upload(path, file);
  
//   if (error) throw error;
//   return data;
// };

// export const getResumeUrl = async (path) => {
//   const { data } = supabase.storage
//     .from('resumes')
//     .getPublicUrl(path);
  
//   return data.publicUrl;
// };

// // Utility functions
// export const generatePublicJobUrl = (jobId) => {
//   return `${window.location.origin}/jobs/${jobId}`;
// };

// export const generateApplicationStatusUrl = () => {
//   return `${window.location.origin}/status`;
// };

// // Error handling wrapper
// export const handleApiError = (error, customMessage) => {
//   console.error('API Error:', error);
  
//   if (error.code === 'PGRST116') {
//     throw new Error('Resource not found');
//   } else if (error.code === '23505') {
//     throw new Error('Duplicate entry');
//   } else if (error.code === '23503') {
//     throw new Error('Foreign key constraint violation');
//   } else if (error.code === '23514') {
//     throw new Error('Check constraint violation');
//   } else {
//     throw new Error(customMessage || error.message || 'An unexpected error occurred');
//   }
// };

// // Batch operations
// export const getJobPostingsWithCounts = async (userId) => {
//   const { data, error } = await supabase
//     .from('job_postings')
//     .select(`
//       *,
//       applications:candidate_submissions(count),
//       analyses:results(count)
//     `)
//     .eq('user_id', userId)
//     .order('created_at', { ascending: false });
  
//   if (error) throw error;
//   return data;
// };

// export const getDashboardStats = async (userId) => {
//   try {
//     // Get total job postings
//     const { data: jobPostings, error: jobError } = await supabase
//       .from('job_postings')
//       .select('id, is_active')
//       .eq('user_id', userId);
    
//     if (jobError) throw jobError;
    
//     // Get total applications
//     const { data: applications, error: appError } = await supabase
//       .from('candidate_submissions')
//       .select('id')
//       .in('job_posting_id', jobPostings.map(job => job.id));
    
//     if (appError) throw appError;
    
//     // Get total analyses
//     const { data: analyses, error: analysisError } = await supabase
//       .from('results')
//       .select('id')
//       .in('job_posting_id', jobPostings.map(job => job.id));
    
//     if (analysisError) throw analysisError;
    
//     return {
//       totalJobPostings: jobPostings.length,
//       activeJobPostings: jobPostings.filter(job => job.is_active).length,
//       totalApplications: applications.length,
//       totalAnalyses: analyses.length,
//     };
//   } catch (error) {
//     handleApiError(error, 'Failed to fetch dashboard stats');
//   }
// };

// // Search functionality
// export const searchJobPostings = async (searchTerm, userId) => {
//   const { data, error } = await supabase
//     .from('job_postings')
//     .select('*')
//     .eq('user_id', userId)
//     .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
//     .order('created_at', { ascending: false });
  
//   if (error) throw error;
//   return data;
// };

// // Export all functions
// const api = {
//   getCurrentUser,
//   signIn,
//   signUp,
//   signOut,
//   createJobPosting,
//   getJobPostings,
//   getJobPosting,
//   updateJobPosting,
//   deleteJobPosting,
//   submitApplication,
//   getApplications,
//   updateApplicationStatus,
//   checkApplicationStatus,
//   analyzeResume,
//   getAnalysisResults,
//   getResume,
//   updateResume,
//   uploadResume,
//   getResumeUrl,
//   generatePublicJobUrl,
//   generateApplicationStatusUrl,
//   handleApiError,
//   getJobPostingsWithCounts,
//   getDashboardStats,
//   searchJobPostings,
// };

// export default api;


import { supabase } from './supabase';
import { axiosInstance } from './axios';

// Auth API
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


// ------------------- Job Postings -------------------

export const createJobPosting = async (jobData) => {
  try {
    const response = await axiosInstance.post("/create-job-posting", jobData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create job posting");
  }
};

export const getJobPostings = async (userId) => {
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

// ------------------- Applications -------------------

// export const submitApplication = async (applicationData) => {
//   const formData = new FormData();
//   formData.append("job_posting_id", applicationData.job_posting_id);
//   formData.append("candidate_name", applicationData.candidate_name);
//   formData.append("candidate_email", applicationData.candidate_email);
//   formData.append("candidate_phone", applicationData.candidate_phone);
//   formData.append("resume", applicationData.resume);

//   const response = await axiosInstance.post("/submit-application", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return response.data;
// };
export const submitApplication = async (formPayload) => {
  const response = await axiosInstance.post("/submit-application", formPayload, {
    headers: {
      "Content-Type": "multipart/form-data", // important
    },
  });
  return response.data;
};


export const getApplications = async (jobId) => {
  const response = await axiosInstance.get(`/applications/${jobId}`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await axiosInstance.put(`/application/${applicationId}`, { status });
  return response.data;
};

export const checkApplicationStatus = async (applicationId, email) => {
  const response = await axiosInstance.post("/check-application-status", { applicationId, email });
  return response.data;
};

// ------------------- Resume Analysis -------------------

export const analyzeResume = async (resumeId, jobId) => {
  const response = await axiosInstance.post("/analyze-matches", { resumeId, jobId });
  return response.data;
};

export const getAnalysisResults = async (jobId) => {
  const response = await axiosInstance.get(`/analysis-results/${jobId}`);
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
