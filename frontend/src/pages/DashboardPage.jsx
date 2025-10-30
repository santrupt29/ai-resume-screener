// import React, { useEffect, useState } from 'react';
// import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// import Header from '../components/layout/Header';
// import Sidebar from '../components/layout/Sidebar';
// import { useAuth } from '../hooks/useAuth';
// import LoadingSpinner from '../components/common/LoadingSpinner';
// import DashboardRoutes from '../components/dashboard/DashboardRoutes';

// export default function DashboardPage() {
//   const { user, loading } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [pageTitle, setPageTitle] = useState('Dashboard');

//   useEffect(() => {
//     if (!loading && !user) {
//       navigate('/');
//     }
//   }, [user, loading, navigate]);

//   useEffect(() => {
//     const path = location.pathname;
//     if (path.includes('/dashboard/jobs')) {
//       setPageTitle('Job Postings');
//     } else if (path.includes('/dashboard/applications')) {
//       setPageTitle('Applications');
//     } else if (path.includes('/dashboard/analytics')) {
//       setPageTitle('Analytics');
//     } else {
//       setPageTitle('Dashboard');
//     }
//   }, [location.pathname]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner size="large" />
//       </div>
//     );
//   }

//   if (!user) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />
//       <div className="flex">
//         <Sidebar />
//         <main className="flex-1">
//           <div className="py-6">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
//               <div className="mb-6">
//               </div>
//               <DashboardRoutes />
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }






import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/common/LoadingSpinner";
import DashboardRoutes from "../components/dashboard/DashboardRoutes";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1">
        {/* <Header /> */}
        <div className="py-6 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <DashboardRoutes />
          </div>
        </div>
      </main>
    </div>
  );
}
