// src/pages/PublicJobPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJobPosting } from '../lib/api';
import PublicJobPageComponent from '../components/Dashboard/PublicJobPageComponent';

export default function PublicJobPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const jobData = await getJobPosting(jobId);
        setJob(jobData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Job Not Found</h3>
          <p className="text-gray-500 mb-4">
            The job posting you're looking for doesn't exist or is no longer active.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return <PublicJobPageComponent job={job} />;
}