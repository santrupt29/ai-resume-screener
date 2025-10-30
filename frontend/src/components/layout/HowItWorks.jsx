// import React from 'react';
// import { FileText, Users, Brain, Star } from 'lucide-react';

// const steps = [
//   {
//     icon: FileText,
//     title: '1. Post a Job',
//     description: 'Create a detailed job posting with the skills and experience you\'re looking for.',
//     color: 'blue',
//   },
//   {
//     icon: Users,
//     title: '2. Receive Applications',
//     description: 'Candidates apply anonymously without needing an account, removing barriers to entry.',
//     color: 'green',
//   },
//   {
//     icon: Brain,
//     title: '3. AI Analysis',
//     description: 'Our AI instantly analyzes each resume against the job description, providing a match score and detailed insights.',
//     color: 'purple',
//   },
//   {
//     icon: Star,
//     title: '4. Hire the Best',
//     description: 'Review the ranked list of candidates and focus your energy on interviewing the top contenders.',
//     color: 'yellow',
//   },
// ];

// export default function HowItWorks() {
//   return (
//     <section id="how-it-works" className="py-20 bg-white">
//       <div className="container mx-auto px-6">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
//           <p className="mt-4 text-lg text-gray-600">Get started in four simple steps and revolutionize your hiring process.</p>
//         </div>
//         <div className="grid md:grid-cols-4 gap-8 text-center">
//           {steps.map((step, index) => {
//             const Icon = step.icon;
//             const colorClasses = {
//               blue: 'bg-blue-100 text-blue-600',
//               green: 'bg-green-100 text-green-600',
//               purple: 'bg-purple-100 text-purple-600',
//               yellow: 'bg-yellow-100 text-yellow-600',
//             };
//             return (
//               <div key={index} className="flex flex-col items-center">
//                 <div className={`w-16 h-16 ${colorClasses[step.color]} rounded-full flex items-center justify-center mb-4`}>
//                   <Icon className="w-8 h-8" />
//                 </div>
//                 <h3 className="text-xl font-semibold">{step.title}</h3>
//                 <p className="mt-2 text-gray-600">{step.description}</p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }




import React from 'react';
import { FileText, Users, Brain, Star, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: 'Post a Job',
    description: 'Create a detailed job posting with the skills and experience you\'re looking for.',
    gradient: 'from-blue-500 to-cyan-500',
    delay: '0ms',
  },
  {
    icon: Users,
    title: 'Receive Applications',
    description: 'Candidates apply anonymously without needing an account, removing barriers to entry.',
    gradient: 'from-green-500 to-emerald-500',
    delay: '100ms',
  },
  {
    icon: Brain,
    title: 'AI Analysis',
    description: 'Our AI instantly analyzes each resume against the job description, providing a match score and detailed insights.',
    gradient: 'from-purple-500 to-pink-500',
    delay: '200ms',
  },
  {
    icon: Star,
    title: 'Hire the Best',
    description: 'Review the ranked list of candidates and focus your energy on interviewing the top contenders.',
    gradient: 'from-amber-500 to-orange-500',
    delay: '300ms',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100 mb-4">
            <span className="text-sm font-bold text-indigo-600">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get started in four simple steps and revolutionize your hiring process.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting lines - hidden on mobile */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-orange-200" style={{ width: 'calc(100% - 8rem)', left: '4rem' }} />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="relative group"
                style={{ animationDelay: step.delay }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-indigo-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative z-10">
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow between steps - only show on larger screens */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 -right-4 z-20">
                    <ArrowRight className="w-8 h-8 text-indigo-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}