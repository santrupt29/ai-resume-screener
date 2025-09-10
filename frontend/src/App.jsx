// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './lib/ToastContext.jsx';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import PublicJobPage from './pages/PublicJobPage';
import StatusCheckPage from './pages/StatusCheckPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/dashboard/*" element={<DashboardPage />} />
                <Route path="/jobs/:jobId" element={<PublicJobPage />} />
                <Route path="/status" element={<StatusCheckPage />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;