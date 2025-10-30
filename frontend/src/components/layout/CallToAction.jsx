// import React from 'react';
// import { Link } from 'react-router-dom';

// export default function CallToAction() {
//   return (
//     <section className="bg-blue-600 py-16">
//       <div className="container mx-auto px-6 text-center">
//         <h2 className="text-3xl font-bold text-white">Ready to Revolutionize Your Hiring?</h2>
//         <p className="mt-4 text-xl text-blue-100">Join hundreds of recruiters who are already using AI to hire smarter and faster.</p>
//         <Link to="/signup" className="mt-8 inline-block bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg">
//           Get Started for Free Today
//         </Link>
//       </div>
//     </section>
//   );
// }


import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-24 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-8 animate-bounce">
            <Sparkles className="w-10 h-10 text-indigo-600" />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Revolutionize Your Hiring?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of recruiters who are already using AI to hire smarter and faster. Start your free trial today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              to="/signup" 
              className="group relative px-10 py-5 bg-white text-indigo-600 rounded-xl text-lg font-bold shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                Get Started for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              to="/demo" 
              className="px-10 py-5 border-2 border-white text-white rounded-xl text-lg font-bold hover:bg-white hover:text-indigo-600 transition-all duration-300 hover:shadow-2xl"
            >
              Watch Demo
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-blue-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}