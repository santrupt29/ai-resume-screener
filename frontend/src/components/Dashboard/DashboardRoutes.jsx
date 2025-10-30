import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import JobPostingManager from './JobPostingManager';
import ApplicationList from './ApplicationList';
import AnalysisResults from './AnalysisResults';

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/jobs" element={<JobPostingManager />} />
      <Route path="/applications/:jobId" element={<ApplicationList />} />
      <Route path="/analytics/:jobId" element={<AnalysisResults />} />
    </Routes>
  );
}