// import React from 'react';

// const testimonials = [
//   {
//     quote: "This tool saved our team over 20 hours a week on resume screening. The quality of our interviews has gone through the roof.",
//     author: 'Jane Doe',
//     role: 'Tech Recruiter',
//     avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c1ca?q=80&w=50&auto=format&fit=crop',
//   },
//   {
//     quote: "Finally, a tool that understands the nuances of a job description. The AI's insights are surprisingly accurate.",
//     author: 'John Smith',
//     role: 'HR Manager',
//     avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=50&auto=format&fit=crop',
//   },
//   {
//     quote: "The anonymous application feature doubled our applicant pool. We found candidates we would have never reached otherwise.",
//     author: 'Emily Jones',
//     role: 'Startup Founder',
//     avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=50&auto=format&fit=crop',
//   },
// ];

// export default function Testimonials() {
//   return (
//     <section id="testimonials" className="py-20 bg-white">
//       <div className="container mx-auto px-6">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl font-bold text-gray-900">Loved by Recruiters Everywhere</h2>
//           <p className="mt-4 text-lg text-gray-600">See what our customers have to say about transforming their hiring process.</p>
//         </div>
//         <div className="grid md:grid-cols-3 gap-8">
//           {testimonials.map((testimonial, index) => (
//             <div key={index} className="bg-gray-50 p-6 rounded-xl">
//               <p className="text-gray-700 italic">"{testimonial.quote}"</p>
//               <div className="mt-4 flex items-center">
//                 <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full mr-4" />
//                 <div>
//                   <p className="font-semibold">{testimonial.author}</p>
//                   <p className="text-sm text-gray-600">{testimonial.role}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }




import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "This tool saved our team over 20 hours a week on resume screening. The quality of our interviews has gone through the roof.",
    author: 'Jane Doe',
    role: 'Tech Recruiter',
    company: 'TechCorp',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c1ca?q=80&w=50&auto=format&fit=crop',
    rating: 5,
  },
  {
    quote: "Finally, a tool that understands the nuances of a job description. The AI's insights are surprisingly accurate.",
    author: 'John Smith',
    role: 'HR Manager',
    company: 'StartupXYZ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=50&auto=format&fit=crop',
    rating: 5,
  },
  {
    quote: "The anonymous application feature doubled our applicant pool. We found candidates we would have never reached otherwise.",
    author: 'Emily Jones',
    role: 'Startup Founder',
    company: 'InnovateCo',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=50&auto=format&fit=crop',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100 mb-4">
            <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
            <span className="text-sm font-bold text-amber-600">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by Recruiters Everywhere
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our customers have to say about transforming their hiring process.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="group bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-indigo-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Rating stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-gray-700 text-lg italic leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur opacity-50" />
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="relative w-14 h-14 rounded-full border-2 border-white shadow-md" 
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-xs text-gray-500">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}