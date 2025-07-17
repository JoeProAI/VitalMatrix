import React from 'react';
// TODO: Replace with Button from @bolt/new when available
// import { Button } from '@bolt/new';

const CTA = () => {
  return (
    <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-cyan-900 py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-400"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Ready to revolutionize your health journey?
          </h2>
          <p className="text-xl text-gray-300 mb-4 leading-relaxed">
            Join the community driving smarter healthcare decisions through real-time insights and AI-powered nutrition analysis.
          </p>
          <p className="text-lg text-cyan-400 mb-12 font-semibold">
            Be part of the Waze for healthcare - where every report helps save lives.
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {/* TODO: Replace with Button from @bolt/new when available */}
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg shadow-cyan-500/25 min-w-[200px]">
              Join Community Pulse
            </button>
            <button className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 font-bold py-4 px-8 rounded-lg transition-all duration-200 min-w-[200px]">
              Download NutriLens
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span>100% Free to Join</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Community Driven</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 gap-1 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-cyan-400"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CTA;