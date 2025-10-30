// // src/components/layout/Sidebar.jsx
// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';

// export default function Sidebar() {
//   const { user } = useAuth();
//   const location = useLocation();

//   if (!user) {
//     return null;
//   }

//   const isActive = (path) => {
//     return location.pathname === path || location.pathname.startsWith(path + '/');
//   };

//   return (
//     <div className="hidden md:flex md:w-64 md:flex-col">
//       <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
//         <div className="flex items-center flex-shrink-0 px-4">
//           <h2 className="text-lg font-medium text-gray-900">Dashboard</h2>
//         </div>
//         <div className="mt-5 flex-grow flex flex-col">
//           <nav className="flex-1 px-2 pb-4 space-y-1">
//             <Link
//               to="/dashboard"
//               className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
//                 isActive('/dashboard') && !isActive('/dashboard/')
//                   ? 'bg-primary text-white'
//                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//               }`}
//             >
//               Dashboard
//             </Link>
//             <Link
//               to="/dashboard/jobs"
//               className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
//                 isActive('/dashboard/jobs')
//                   ? 'bg-primary text-white'
//                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//               }`}
//             >
//               Job Postings
//             </Link>
//             {/* <Link
//               to="/dashboard/applications"
//               className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
//                 isActive('/dashboard/applications')
//                   ? 'bg-primary text-white'
//                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//               }`}
//             >
//               Applications
//             </Link>
//             <Link
//               to="/dashboard/analytics"
//               className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
//                 isActive('/dashboard/analytics')
//                   ? 'bg-primary text-white'
//                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//               }`}
//             >
//               Analytics
//             </Link> */}
//           </nav>
//         </div>
//       </div>
//     </div>
//   );
// }


import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Briefcase, Users } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Briefcase className="mr-2 w-5 h-5" /> },
    { name: "Job Postings", path: "/dashboard/jobs", icon: <Users className="mr-2 w-5 h-5" /> }
  ];
  return (
    <nav className="fixed w-64 h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col py-8">
      <div className="px-6 mb-8">
        
        {/* <span className="text-xl font-semibold text-primary-600">AI Resume Screener</span> */}
        <div className="h-2 w-12 rounded-full bg-gradient-to-r from-primary-500 via-blue-400 to-primary-300 mt-2 mb-3"></div>
      </div>
      <ul>
        {navItems.map((item) => (
          <li key={item.path} className="mb-2">
            <Link
              to={item.path}
              className={`flex items-center px-6 py-2 rounded-md text-gray-700 font-medium 
                hover:bg-gray-100 transition ${
                  location.pathname === item.path ? "bg-primary-100 text-primary-700" : ""
                }`}
            >
              {item.icon}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
