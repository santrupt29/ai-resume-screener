// src/components/dashboard/Dashboard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useJobPostings } from '../../hooks/useJobPostings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card';
import  Button  from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate } from '../../lib/utils';
import { Briefcase, Users, BarChart3, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: jobPostings, isLoading } = useJobPostings(user?.id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your recruitment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobPostings?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {jobPostings?.filter(job => job.is_active).length || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobPostings?.reduce((acc, job) => acc + (job.application_count || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysis</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobPostings?.reduce((acc, job) => acc + (job.analysis_count || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Resumes analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/dashboard/jobs')}
              className="w-full"
            >
              Create Job Posting
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Job Postings</h2>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard/jobs')}
          >
            View All
          </Button>
        </div>

        {jobPostings && jobPostings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {jobPostings.slice(0, 3).map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>
                        {job.company} • {job.location}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/applications/${job.id}`)}
                      >
                        Applications
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/analytics/${job.id}`)}
                      >
                        Analytics
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-sm text-gray-900 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Status: </span>
                        <span className={job.is_active ? 'text-green-600' : 'text-red-600'}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Created: </span>
                        <span>{formatDate(job.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">No job postings yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first job posting
                </p>
                <div className="mt-6">
                  <Button onClick={() => navigate('/dashboard/jobs')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job Posting
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