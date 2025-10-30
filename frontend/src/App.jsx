import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthProvider';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import useAuth from './hooks/useAuth.jsx';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import PublicJobPage from './pages/PublicJobPage';
import StatusCheckPage from './pages/StatusCheckPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Header from './components/layout/Header.jsx';

import './index.css';

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/jobs/:jobId" element={<PublicJobPage />} />
      <Route path="/status" element={<StatusCheckPage />} />

      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignUpPage />} 
      />

      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      >
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const headerExcludedPaths = [
  /^\/jobs\/[^/]+$/, // regex for "/jobs/:jobId"
  // Add other patterns as needed
  /^\/status\/[^/]+$/, // regex for "/status/:applicationId",
  /^\/status$/, // regex for "/status",
];

function App() {
  const { signOut } = useAuth();
  const location = useLocation();
  const hideHeader = headerExcludedPaths.some((re) =>
    re.test(location.pathname)
  );
  
  const handleSignOut = () => {
    signOut();
  };
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
            <div className="min-h-screen bg-gray-50">
                {/* <Header /> */}
                {!hideHeader && <Header />}
              <AppRoutes />
            </div>
        </AuthProvider>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;