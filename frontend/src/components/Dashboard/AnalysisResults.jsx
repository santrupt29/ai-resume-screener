
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAnalysisResults } from '../../hooks/useAnalysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card';
import LoadingSpinner from '../common/Button';
import { BarChart3, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AnalysisResults() {
  const { jobId } = useParams();
  console.log('AnalysisResults component mounted with jobId:', jobId);
  const { data: analysisResults, isLoading, error } = useAnalysisResults(jobId);
  console.log('AnalysisResults data:', analysisResults);

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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analysis</h3>
        <p className="text-gray-500">{error.message}</p>
      </div>
    );
  }

  if (!analysisResults || analysisResults.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">No Analysis Results Yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Analysis results will appear here once you've analyzed candidate resumes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const scoreData = analysisResults.map(result => ({
    name: result.candidate_submissions?.candidate_name || 'Unknown',
    score: result.score || 0,
    similarity: result.similarity_score || 0,
  }));

  const statusDistribution = [
    { name: 'Received', value: analysisResults.filter(r => r.candidate_submissions?.status === 'received').length },
    { name: 'Reviewed', value: analysisResults.filter(r => r.candidate_submissions?.status === 'reviewed').length },
    { name: 'Shortlisted', value: analysisResults.filter(r => r.candidate_submissions?.status === 'shortlisted').length },
    { name: 'Rejected', value: analysisResults.filter(r => r.candidate_submissions?.status === 'rejected').length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6 ml-64">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visualize and compare candidate analysis results
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Candidate Scores
            </CardTitle>
            <CardDescription>
              Match scores and similarity scores for all candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={scoreData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" name="Match Score" fill="#8884d8" />
                <Bar dataKey="similarity" name="Similarity Score" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Application Status Distribution
            </CardTitle>
            <CardDescription>
              Distribution of application statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of each candidate's analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Similarity Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Top Strengths
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analysisResults.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.candidate_submissions?.candidate_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.candidate_submissions?.candidate_email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${result.score || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-900">{result.score || 0}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${result.similarity_score || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-900">{result.similarity_score || 0}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.candidate_submissions?.status === 'received' ? 'bg-blue-100 text-blue-800' :
                        result.candidate_submissions?.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                        result.candidate_submissions?.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                        result.candidate_submissions?.status === 'analyzed' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.candidate_submissions?.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {result.strengths && result.strengths.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {result.strengths.slice(0, 2).map((strength, index) => (
                              <li key={index} className="truncate">{strength}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500">No strengths identified</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}