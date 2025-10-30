import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useJobPostings } from '../../hooks/useJobPostings';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate } from '../../lib/utils';
import { Briefcase, Users, BarChart3, Plus, TrendingUp, Calendar, CheckCircle, XCircle, ArrowRight, Sparkles, Target, Award, Zap } from 'lucide-react';

function StatCard({ title, value, subtitle, icon: Icon, gradient, trend }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
            <p className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
              {value}
            </p>
            <p className="text-xs text-gray-500">{subtitle}</p>
            
            {trend && (
              <div className="flex items-center mt-3 text-sm">
                <div className={`flex items-center px-2.5 py-1 rounded-full ${
                  trend.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <TrendingUp className={`w-3.5 h-3.5 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
                  <span className="font-semibold">{trend.value}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-110 transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { profile, user } = useAuth();

  const navigate = useNavigate();
  const { data: jobPostings, isLoading: isLoadingJobs, error: jobError } = useJobPostings(user?.id);
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useDashboardStats();

  const isLoading = isLoadingJobs || isLoadingStats;
  const error = jobError || statsError;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-sm text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 ml-64">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              <h3 className="text-lg font-medium">Error Loading Dashboard</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {error?.message || 'Could not fetch your data. Please try refreshing the page.'}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="relative">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-20" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
          
          <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-8 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Welcome Back, {profile?.name || user?.email}! 👋
                  </h1>
                  <p className="mt-2 text-gray-600 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Here's an overview of your recruitment activity and performance
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/dashboard/jobs')} className="group">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Create Job Posting
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Postings"
            value={stats?.totalJobs || 0}
            subtitle={`${stats?.activeJobs || 0} currently active`}
            icon={Briefcase}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Applications"
            value={stats?.totalApplications || 0}
            subtitle="Across all postings"
            icon={Users}
            gradient="from-green-500 to-emerald-600"
          />
          <StatCard
            title="AI Analyzed"
            value={stats?.analyzedCount || 0}
            subtitle="Resumes processed"
            icon={Zap}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Analysis Rate"
            value={`${stats?.totalApplications > 0 ? Math.round((stats.analyzedCount / stats.totalApplications) * 100) : 0}%`}
            subtitle="Of all applications"
            icon={Award}
            gradient="from-orange-500 to-amber-600"
          />
        </div>

        {/* Recent Job Postings */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                  Recent Job Postings
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Manage and track your active listings</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/jobs')}
                className="group"
              >
                View All Jobs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {jobPostings && jobPostings.length > 0 ? (
              <div className="space-y-4">
                {jobPostings.slice(0, 3).map((job, index) => (
                  <div 
                    key={job.id} 
                    className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start gap-3 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {job.title}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                            job.is_active 
                              ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-2 border-emerald-200' 
                              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-2 border-red-200'
                          }`}>
                            {job.is_active ? (
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-1.5" />
                            )}
                            {job.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="font-semibold">{job.company}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          <span className="flex items-center gap-1.5 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {formatDate(job.created_at)}
                          </span>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold border border-indigo-100">
                            <Users className="w-4 h-4" />
                            {job.applications_count || 0} applications
                          </div>
                          <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                            <TrendingUp className="w-4 h-4" />
                            {job.views || 0} views
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/dashboard/applications/${job.id}`)}
                          className="group/btn"
                        >
                          <Users className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          Applications
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/dashboard/analytics/${job.id}`)}
                          className="group/btn"
                        >
                          <BarChart3 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-indigo-200 rounded-full blur-3xl opacity-40 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full p-8 border-4 border-white shadow-2xl">
                    <Briefcase className="w-20 h-20 text-indigo-600" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No job postings yet</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">
                  Get started by creating your first job posting and start receiving applications from talented candidates.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button onClick={() => navigate('/dashboard/jobs')} className="group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Create Your First Job Posting
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/dashboard/templates')}>
                    Browse Templates
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}