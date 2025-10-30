// frontend/src/components/dashboard/JobPostingManager.jsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card';
import  Button  from '../common/Button';
import  Input  from '../common/Input';
import { useJobPostings, useCreateJobPosting, useUpdateJobPosting, useDeleteJobPosting } from '../../hooks/useJobPostings';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../lib/utils';
import { Plus, Edit, Trash2, ExternalLink, Briefcase, Eye, EyeOff, Building2, MapPin, Calendar, CheckCircle2, AlertCircle, X } from 'lucide-react';

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
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Job Postings
          </h1>
          <p className="mt-2 text-gray-600 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Manage your job postings and application forms
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="group">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Create Job Posting
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="border-2 border-indigo-200 shadow-2xl animate-in">
          <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {editingJob ? (
                    <>
                      <Edit className="w-5 h-5 text-indigo-600" />
                      Edit Job Posting
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-indigo-600" />
                      Create New Job Posting
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {editingJob ? 'Update the job posting details' : 'Fill in the details to create a new job posting'}
                </CardDescription>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Job Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Full Stack Developer"
                  required
                />
              </div>

              {/* Company and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="company" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    Company *
                  </label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g., TechCorp Inc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="location" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Location *
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., San Francisco, CA or Remote"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Describe the role, responsibilities, requirements, and benefits..."
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="is_active" className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                  {formData.is_active ? (
                    <>
                      <Eye className="w-4 h-4 text-green-600" />
                      Active (visible to candidates)
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 text-gray-500" />
                      Inactive (hidden from candidates)
                    </>
                  )}
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <Button type="submit">
                  <CheckCircle2 className="w-4 h-4" />
                  {editingJob ? 'Update Job Posting' : 'Create Job Posting'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Job Postings List */}
      {jobPostings && jobPostings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {jobPostings.map((job, index) => (
            <Card 
              key={job.id} 
              className="group hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Status Indicator Bar */}
              <div className={`h-2 ${job.is_active ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-gray-400 to-slate-400'}`} />
              
              <CardHeader className="bg-gradient-to-br from-white to-gray-50">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3 flex-wrap">
                      <CardTitle className="group-hover:text-indigo-600 transition-colors">
                        {job.title}
                      </CardTitle>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        job.is_active 
                          ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border border-gray-300'
                      }`}>
                        {job.is_active ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        {job.company}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        {job.location}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        {formatDate(job.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-start gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                      className="group/btn"
                    >
                      <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(job)}
                      className="group/btn"
                    >
                      <Edit className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                      className="group/btn"
                    >
                      <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-600" />
                    Job Description
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
                
                {job.applications_count > 0 && (
                  <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm">
                      <Briefcase className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {job.applications_count} Applications Received
                      </p>
                      <p className="text-xs text-gray-600">
                        Review candidates for this position
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-indigo-100 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full p-8 border-4 border-white shadow-xl">
                  <Briefcase className="w-20 h-20 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No job postings yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Get started by creating your first job posting and start receiving applications from talented candidates.
              </p>
              <Button onClick={() => setShowCreateForm(true)} className="group">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Create Your First Job Posting
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
);
};


export default JobPostingManager;