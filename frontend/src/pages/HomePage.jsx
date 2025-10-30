// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import Button from '../components/common/Button';
// import Card, {CardContent, CardDescription, CardHeader, CardTitle} from '../components/common/Card';
// import { useAuth } from '../hooks/useAuth';
// import Input from '../components/common/Input';

// export default function HomePage() {
//   const { user, signInFunction } = useAuth();
//   const navigate = useNavigate();
//   const [showLogin, setShowLogin] = useState(false);
//   const [loginForm, setLoginForm] = useState({
//     email: '',
//     password: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleLoginChange = (e) => {
//     const { name, value } = e.target;
//     setLoginForm(prev => ({ ...prev, [name]: value }));
//   };

//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
    
//     try {
//       await signInFunction(loginForm.email, loginForm.password);
//       navigate('/dashboard');
//     } catch (err) {
//       setError('Invalid email or password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col justify-center items-center min-h-screen py-12">
//           <div className="text-center mb-12">
//             <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
//               AI Resume Screener
//             </h1>
//             <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
//               Streamline your recruitment process with AI-powered resume analysis
//             </p>
//           </div>
          
//           <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
//             <Card>
//               <CardHeader>
//                 <CardTitle>For Recruiters</CardTitle>
//                 <CardDescription>
//                   Create job postings and analyze candidates with AI
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {user ? (
//                   <Link to="/dashboard">
//                     <Button className="w-full">Go to Dashboard</Button>
//                   </Link>
//                 ) : (
//                   <div>
//                     <Button 
//                       className="w-full mb-3" 
//                       onClick={() => setShowLogin(!showLogin)}
//                     >
//                       {showLogin ? 'Cancel' : 'Sign In'}
//                     </Button>
//                     <Link to="/signup">
//                       <Button className="w-full" variant="outline">
//                         Sign Up
//                       </Button>
//                     </Link>
//                   </div>
//                 )}
                
//                 {showLogin && !user && (
//                   <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3">
//                     <div>
//                       <Input
//                         name="email"
//                         type="email"
//                         placeholder="Email address"
//                         value={loginForm.email}
//                         onChange={handleLoginChange}
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Input
//                         name="password"
//                         type="password"
//                         placeholder="Password"
//                         value={loginForm.password}
//                         onChange={handleLoginChange}
//                         required
//                       />
//                     </div>
//                     {error && (
//                       <div className="text-red-500 text-sm">{error}</div>
//                     )}
//                     <Button 
//                       type="submit" 
//                       className="w-full"
//                       disabled={loading}
//                     >
//                       {loading ? 'Signing in...' : 'Sign In'}
//                     </Button>
//                     <div className="text-center mt-2">
//                       <Link to="/signup" className="text-sm text-primary hover:underline">
//                         Don't have an account? Sign up
//                       </Link>
//                     </div>
//                   </form>
//                 )}
//               </CardContent>
//             </Card>
            
//             <Card>
//               <CardHeader>
//                 <CardTitle>For Candidates</CardTitle>
//                 <CardDescription>
//                   Apply for jobs without creating an account
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-sm text-gray-500 mb-4">
//                   Enter a job ID to apply:
//                 </div>
//                 <div className="flex">
//                   <input
//                     type="text"
//                     placeholder="Job ID"
//                     className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
//                   />
//                   <Button className="rounded-l-none">Apply</Button>
//                 </div>
//               </CardContent>
//             </Card>
            
//             <Card>
//               <CardHeader>
//                 <CardTitle>Check Status</CardTitle>
//                 <CardDescription>
//                   Track your application status
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Link to="/status">
//                   <Button className="w-full" variant="outline">Check Status</Button>
//                 </Link>
//               </CardContent>
//             </Card>
//           </div>
          
//           <div className="mt-16 max-w-3xl">
//             <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
//             <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
//               <div className="text-center">
//                 <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mx-auto mb-4">
//                   1
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">Create Job Posting</h3>
//                 <p className="text-gray-500">Recruiters create job postings with unique application forms</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mx-auto mb-4">
//                   2
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">Submit Application</h3>
//                 <p className="text-gray-500">Candidates apply without creating an account</p>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mx-auto mb-4">
//                   3
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">AI Analysis</h3>
//                 <p className="text-gray-500">Resumes are analyzed against job descriptions using AI</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useEffect } from 'react';
import Header from '../components/layout/Header';
import Hero from '../components/layout/Hero';
import HowItWorks from '../components/layout/HowItWorks';
import Features from '../components/layout/Features';
import Testimonials from '../components/layout/Testomonials';
import CallToAction from '../components/layout/CallToAction';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <>
      {/* <Header /> */}
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}