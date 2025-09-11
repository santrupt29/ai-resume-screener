// frontend/src/components/dashboard/JobPostingManager.jsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card';
import  Button  from '../common/Button';
import  Input  from '../common/Input';
import { useJobPostings, useCreateJobPosting, useUpdateJobPosting, useDeleteJobPosting } from '../../hooks/useJobPostings';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../lib/ToastContext';
import { formatDate } from '../../lib/utils';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

const JobPostingManager = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { data: jobPostings, isLoading } = useJobPostings(user?.id);
  const createJobPosting = useCreateJobPosting();
  const updateJobPosting = useUpdateJobPosting();
  const deleteJobPosting = useDeleteJobPosting();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    is_active: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingJob) {
        await updateJobPosting.mutateAsync({
          jobId: editingJob.id,
          updates: formData,
        });
        addToast('Job posting updated successfully!', 'success');
      } else {
        await createJobPosting.mutateAsync({
          ...formData,
          user_id: user?.id,
        });
        addToast('Job posting created successfully!', 'success');
      }
      
      setFormData({
        title: '',
        description: '',
        company: '',
        location: '',
        is_active: true,
      });
      setShowCreateForm(false);
      setEditingJob(null);
    } catch (error) {
      addToast(error.message || 'Failed to save job posting', 'error');
    }
  };

  const handleEdit = (job) => {
    setFormData({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      is_active: job.is_active,
    });
    setEditingJob(job);
    setShowCreateForm(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await deleteJobPosting.mutateAsync(jobId);
        addToast('Job posting deleted successfully!', 'success');
      } catch (error) {
        addToast(error.message || 'Failed to delete job posting', 'error');
      }
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingJob(null);
    setFormData({
      title: '',
      description: '',
      company: '',
      location: '',
      is_active: true,
    });
  };

  const getPublicJobUrl = (jobId) => {
    return `${window.location.origin}/jobs/${jobId}`;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading job postings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your job postings and application forms
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Job Posting
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}</CardTitle>
            <CardDescription>
              {editingJob ? 'Update the job posting details' : 'Fill in the details to create a new job posting'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Job Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-1">
                  Company *
                </label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  Location *
                </label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active (visible to candidates)
                </label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={createJobPosting.isLoading || updateJobPosting.isLoading}>
                  {editingJob ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {jobPostings && jobPostings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {jobPostings.map((job) => (
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
                      onClick={() => window.open(getPublicJobUrl(job.id), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(job)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
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
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job Posting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobPostingManager;