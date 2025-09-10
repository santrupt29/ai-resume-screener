// frontend/src/components/application/PublicJobPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card';
import  Button  from '../common/Button';
import  Input  from '../common/Input';
import { getJobPosting } from '../../lib/api';
import { useSubmitApplication } from '../../hooks/useApplications';
import { useToast } from '../../lib/ToastContext';
import  Toast  from '../common/Toast';
import { formatDate } from '../../lib/utils';
import { Briefcase, MapPin, Calendar, Upload, Send } from 'lucide-react';

const PublicJobPageComponent = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobPosting(jobId),
    enabled: !!jobId,
  });
  
  const submitApplication = useSubmitApplication();
  
  const [formData, setFormData] = useState({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    resume: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is a PDF or DOC/DOCX
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        addToast('Please upload a PDF or Word document', 'error');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast('File size must be less than 5MB', 'error');
        return;
      }
      
      setFormData({
        ...formData,
        resume: file,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.candidate_name || !formData.candidate_email || !formData.resume) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitApplication.mutateAsync({
        job_posting_id: jobId,
        candidate_name: formData.candidate_name,
        candidate_email: formData.candidate_email,
        candidate_phone: formData.candidate_phone,
        resume: formData.resume,
      });
      
      addToast('Application submitted successfully!', 'success');
      
      // Navigate to status page with application ID
      navigate('/status', { 
        state: { 
          applicationId: result.application_id,
          email: formData.candidate_email
        } 
      });
    } catch (error) {
      addToast(error.message || 'Failed to submit application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Job Not Found</h3>
              <p className="mt-1 text-sm text-gray-500">
                The job posting you're looking for doesn't exist or is no longer active.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
          <div className="mt-2 flex items-center justify-center text-gray-600">
            <Briefcase className="h-5 w-5 mr-1" />
            <span>{job.company}</span>
            <MapPin className="h-5 w-5 ml-4 mr-1" />
            <span>{job.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Posted on {formatDate(job.created_at)}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Apply for this Position</CardTitle>
                <CardDescription>
                  Submit your application and we'll get back to you soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="candidate_name" className="block text-sm font-medium mb-1">
                      Full Name *
                    </label>
                    <Input
                      id="candidate_name"
                      name="candidate_name"
                      value={formData.candidate_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="candidate_email" className="block text-sm font-medium mb-1">
                      Email Address *
                    </label>
                    <Input
                      id="candidate_email"
                      name="candidate_email"
                      type="email"
                      value={formData.candidate_email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="candidate_phone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <Input
                      id="candidate_phone"
                      name="candidate_phone"
                      value={formData.candidate_phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="resume" className="block text-sm font-medium mb-1">
                      Resume *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="resume"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80"
                          >
                            <span>Upload a file</span>
                            <input
                              id="resume"
                              name="resume"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX up to 5MB
                        </p>
                      </div>
                    </div>
                    {formData.resume && (
                      <div className="mt-2 text-sm text-gray-500">
                        Selected file: {formData.resume.name}
                      </div>
                    )}
                  </div>
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.candidate_name || !formData.candidate_email || !formData.resume}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    By submitting this application, you agree to our privacy policy and terms of service.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicJobPageComponent;