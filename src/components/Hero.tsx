import React from 'react';
// TODO: Replace with Button and Navbar from @bolt/new when available
// import { Button, Navbar } from '@bolt/new';

const Hero = () => {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0A0F 0%, #050508 100%)' }}>
      {/* Animated neon background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 neon-glow" style={{ background: 'linear-gradient(90deg, #00D4FF, #B537F7, #FF3D8A)' }}></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full neon-glow" style={{ background: 'radial-gradient(circle, #00D4FF33, transparent)' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full neon-glow" style={{ background: 'radial-gradient(circle, #B537F733, transparent)' }}></div>
        </div>
      </div>
      
      {/* <Navbar /> */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <div className="text-3xl font-bold gradient-neon neon-text">
          VitalMatrix
        </div>
        <div className="space-x-8">
          <a href="#" className="text-white hover:text-[#00D4FF] transition-all duration-300 font-medium">Features</a>
          <a href="#" className="text-white hover:text-[#B537F7] transition-all duration-300 font-medium">Community</a>
          <a href="#" className="text-white hover:text-[#FF3D8A] transition-all duration-300 font-medium">Docs</a>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <h1 className="text-7xl font-bold mb-8 gradient-neon pulse-neon leading-tight">
          Community Care Meets Smart Nutrition
        </h1>
        <p className="text-xl mb-4 text-gray-300 max-w-3xl mx-auto">
          Your health, optimized by the community. 
        </p>
        <p className="text-lg mb-8 neon-text font-semibold" style={{ color: '#00D4FF' }}>
          Community-driven ER insights, AI nutrition scanning, and personalized alerts.
        </p>
        
        {/* Feature highlights */}
        <div className="flex justify-center space-x-8 mb-12 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Live Community Updates</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300">AI Nutrition Scanner</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Smart Alerts</span>
          </div>
        </div>

        {/* CTA Button */}
        <button className="neon-border neon-glow px-8 py-4 rounded-lg font-bold text-white transform hover:scale-105 transition-all duration-300" style={{ background: 'linear-gradient(45deg, #00D4FF, #B537F7)' }}>
          Join the Community
        </button>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
    </div>
  );
};

export default Hero;