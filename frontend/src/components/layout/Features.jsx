// import React from 'react';
// import { Zap, Target, UserX, ListChecks, Clock, ShieldCheck } from 'lucide-react';

// const features = [
//   {
//     icon: Zap,
//     title: 'Instant AI Analysis',
//     description: 'Powered by Google\'s Gemini AI to provide deep, contextual analysis of resumes against your job descriptions in seconds.',
//     color: 'blue',
//   },
//   {
//     icon: Target,
//     title: 'Similarity Scoring',
//     description: 'Our pgvector-powered similarity search ranks candidates by how closely their skills and experience match your requirements.',
//     color: 'green',
//   },
//   {
//     icon: UserX,
//     title: 'Anonymous Applications',
//     description: 'Reduce unconscious bias and increase your applicant pool by allowing candidates to apply without creating an account.',
//     color: 'purple',
//   },
//   {
//     icon: ListChecks,
//     title: 'Detailed Insights',
//     description: 'Get a breakdown of strengths, weaknesses, and suggested interview questions for every candidate.',
//     color: 'yellow',
//   },
//   {
//     icon: Clock,
//     title: 'Save Time & Money',
//     description: 'Drastically reduce the time spent on initial screening, allowing your team to focus on high-value activities.',
//     color: 'red',
//   },
//   {
//     icon: ShieldCheck,
//     title: 'Secure & Reliable',
//     description: 'Built on a secure, modern stack to ensure your data is safe and the platform is always available.',
//     color: 'indigo',
//   },
// ];

// export default function Features() {
//   return (
//     <section id="features" className="py-20 bg-gray-50">
//       <div className="container mx-auto px-6">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl font-bold text-gray-900">Powerful Features for Smart Recruiters</h2>
//           <p className="mt-4 text-lg text-gray-600">Leverage the power of AI to make faster, more informed hiring decisions.</p>
//         </div>
//         <div className="grid md:grid-cols-3 gap-8">
//           {features.map((feature, index) => {
//             const Icon = feature.icon;
//             const colorClasses = {
//               blue: 'text-blue-600',
//               green: 'text-green-600',
//               purple: 'text-purple-600',
//               yellow: 'text-yellow-600',
//               red: 'text-red-600',
//               indigo: 'text-indigo-600',
//             };
//             return (
//               <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
//                 <Icon className={`w-10 h-10 ${colorClasses[feature.color]} mb-4`} />
//                 <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
//                 <p className="text-gray-600">{feature.description}</p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }



import React from 'react';
import { Zap, Target, UserX, ListChecks, Clock, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant AI Analysis',
    description: 'Powered by Google\'s Gemini AI to provide deep, contextual analysis of resumes against your job descriptions in seconds.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Target,
    title: 'Similarity Scoring',
    description: 'Our pgvector-powered similarity search ranks candidates by how closely their skills and experience match your requirements.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: UserX,
    title: 'Anonymous Applications',
    description: 'Reduce unconscious bias and increase your applicant pool by allowing candidates to apply without creating an account.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: ListChecks,
    title: 'Detailed Insights',
    description: 'Get a breakdown of strengths, weaknesses, and suggested interview questions for every candidate.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Clock,
    title: 'Save Time & Money',
    description: 'Drastically reduce the time spent on initial screening, allowing your team to focus on high-value activities.',
    gradient: 'from-red-500 to-rose-500',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Reliable',
    description: 'Built on a secure, modern stack to ensure your data is safe and the platform is always available.',
    gradient: 'from-indigo-500 to-purple-500',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-100 mb-4">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-bold text-purple-600">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Hire Smarter
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Leverage the power of AI to make faster, more informed hiring decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="group bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}