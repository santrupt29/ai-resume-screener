// src/components/dashboard/ApplicationList.jsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApplications, useUpdateApplicationStatus } from '../../hooks/useApplications';
import { useAnalysis } from '../../hooks/useAnalysis';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDateTime, getStatusColor, truncateText } from '../../lib/utils';
import { Briefcase, User, Mail, Phone, FileText, BarChart3 } from 'lucide-react';

export default function ApplicationList() {
  const { jobId } = useParams();
  const { data: applications, isLoading, error } = useApplications(jobId);
  const updateApplicationStatus = useUpdateApplicationStatus();
  const analyzeResume = useAnalysis();
  
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus.mutateAsync({ applicationId, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleAnalyze = async (application) => {
    setSelectedApplication(application);
    setIsAnalyzing(true);
    
    try {
      await analyzeResume.mutateAsync({ 
        resumeId: application.resume_id, 
        jobId: application.job_posting_id 
      });
      
      // Refresh applications to get updated analysis results
      window.location.reload();
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Applications</h3>
        <p className="text-gray-500">{error.message}</p>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">No Applications Yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Applications will appear here once candidates start applying.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage candidate applications
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {application.candidate_name}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Applied on {formatDateTime(application.created_at)}</span>
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnalyze(application)}
                    disabled={isAnalyzing && selectedApplication?.id === application.id}
                  >
                    {isAnalyzing && selectedApplication?.id === application.id ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusChange(application.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="received">Received</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </div>
                  <p className="text-sm">{application.candidate_email}</p>
                </div>
                {application.candidate_phone && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Phone className="h-4 w-4 mr-1" />
                      Phone
                    </div>
                    <p className="text-sm">{application.candidate_phone}</p>
                  </div>
                )}
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Briefcase className="h-4 w-4 mr-1" />
                    Job
                  </div>
                  <p className="text-sm">{application.job_posting.title}</p>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <FileText className="h-4 w-4 mr-1" />
                    Resume
                  </div>
                  <a 
                    href={application.resume.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {application.resume.file_name}
                  </a>
                </div>
              </div>
              
              {application.results && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Analysis Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Match Score</h4>
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${application.results.score}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{application.results.score}%</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Similarity Score</h4>
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${application.results.similarity_score}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{application.results.similarity_score}%</div>
                      </div>
                    </div>
                  </div>
                  
                  {application.results.strengths && application.results.strengths.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-600">Strengths</h4>
                      <ul className="mt-1 text-sm text-gray-900 list-disc pl-5 space-y-1">
                        {application.results.strengths.slice(0, 3).map((strength, index) => (
                          <li key={index}>{truncateText(strength, 80)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}