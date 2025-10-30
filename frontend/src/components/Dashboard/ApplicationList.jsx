import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApplications, useUpdateApplicationStatus } from '../../hooks/useApplications';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDateTime, getStatusColor, truncateText } from '../../lib/utils';
import { User, Mail, Phone, FileText, Briefcase, AlertCircle } from 'lucide-react';

export default function ApplicationList() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();
  
  const { data: applications, isLoading, error, refetch } = useApplications(jobId);
  const updateApplicationStatus = useUpdateApplicationStatus();

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus.mutateAsync({ applicationId, status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['applications', jobId] });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-medium">Error Loading Applications</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">{error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Applications Yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Candidates haven't applied for this job yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 ml-64">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage candidate applications for this job posting.
        </p>
      </div>

      <div className="space-y-4">
        {applications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center text-lg">
                    <User className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="truncate">{application.candidate_name}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1 space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>Applied {formatDateTime(application.created_at)}</span>
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 mt-2 sm:mt-0">
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusChange(application.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <p className="text-gray-600 truncate">{application.candidate_email}</p>
                </div>
                {application.candidate_phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-600">{application.candidate_phone}</p>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <p className="text-gray-600">{application.job_posting?.title}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <a 
                    href={application.resumes?.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {application.resumes?.file_name || 'View Resume'}
                  </a>
                </div>
              </div>
              
              {/* Analysis Results Section */}
              {application.results && application.results.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">AI Analysis Results</h3>
                  {application.results.map(result => (
                    <div key={result.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-600">Overall Match Score</h4>
                          <div className="flex items-center mt-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
                                style={{ width: `${result.score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{result.score}%</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-600">Similarity Score</h4>
                          <div className="flex items-center mt-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                                style={{ width: `${result.similarity_score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{result.similarity_score}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {result.strengths && result.strengths.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Key Strengths</h4>
                          <ul className="text-sm text-gray-900 list-disc pl-5 space-y-1">
                            {result.strengths.slice(0, 3).map((strength, index) => (
                              <li key={index}>{truncateText(strength, 80)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}