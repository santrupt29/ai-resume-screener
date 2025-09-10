// // src/pages/DashboardPage.jsx
// import React, { useState } from 'react';
// import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// import Header from '../components/layout/Header';
// import Sidebar from '../components/layout/Sidebar';
// import { useAuth } from '../hooks/useAuth';
// import LoadingSpinner from '../components/common/LoadingSpinner';

// export default function DashboardPage() {
//   const { user, loading } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner size="large" />
//       </div>
//     );
//   }

//   if (!user) {
//     navigate('/');
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />
//       <div className="flex">
//         <Sidebar />
//         <main className="flex-1 md:ml-64">
//           <div className="py-6">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
//               <Outlet />
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// src/pages/DashboardPage.jsx
// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardRoutes from '../components/dashboard/DashboardRoutes';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  // Handle navigation when user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Update page title based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard/jobs')) {
      setPageTitle('Job Postings');
    } else if (path.includes('/dashboard/applications')) {
      setPageTitle('Applications');
    } else if (path.includes('/dashboard/analytics')) {
      setPageTitle('Analytics');
    } else {
      setPageTitle('Dashboard');
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Return null while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
              </div>
              <DashboardRoutes />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}