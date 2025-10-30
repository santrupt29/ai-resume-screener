import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useCheckApplicationStatus } from '../hooks/useApplications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDateTime, getStatusColor } from '../lib/utils';

export default function StatusCheckPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const checkApplicationStatus = useCheckApplicationStatus();
  
  const [applicationId, setApplicationId] = useState(location.state?.applicationId || '');
  const [email, setEmail] = useState(location.state?.email || '');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!applicationId || !email) {
      setError('Please enter both application ID and email');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await checkApplicationStatus.mutateAsync({ applicationId, email });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to check application status');
      console.error('Error checking status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Check Application Status</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your application ID and email to check the status of your application
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>
              Please provide the following information to check your application status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="applicationId" className="block text-sm font-medium mb-1">
                  Application ID *
                </label>
                <Input
                  id="applicationId"
                  type="text"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  placeholder="APP-1234567890-abc123"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <div className="pt-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Checking...
                    </>
                  ) : (
                    'Check Status'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Current status of your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Application ID</h3>
                    <p className="mt-1 text-sm text-gray-900">{result.application_id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Candidate Name</h3>
                    <p className="mt-1 text-sm text-gray-900">{result.candidate_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Job Title</h3>
                    <p className="mt-1 text-sm text-gray-900">{result.job_title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Company</h3>
                    <p className="mt-1 text-sm text-gray-900">{result.company}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Applied On</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDateTime(result.created_at)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDateTime(result.updated_at)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </div>
                </div>
                
                {result.analysis && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Analysis Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Match Score</h4>
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${result.analysis.score}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{result.analysis.score}%</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Similarity Score</h4>
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${result.analysis.similarity_score}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{result.analysis.similarity_score}%</div>
                        </div>
                      </div>
                    </div>
                    
                    {result.analysis.strengths && result.analysis.strengths.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">Strengths</h4>
                        <ul className="mt-1 text-sm text-gray-900 list-disc pl-5 space-y-1">
                          {result.analysis.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.analysis.weaknesses && result.analysis.weaknesses.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">Areas for Improvement</h4>
                        <ul className="mt-1 text-sm text-gray-900 list-disc pl-5 space-y-1">
                          {result.analysis.weaknesses.map((weakness, index) => (
                            <li key={index}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="pt-4">
                  <Button 
                    onClick={() => navigate('/')} 
                    variant="outline"
                  >
                    Back to Homepage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}