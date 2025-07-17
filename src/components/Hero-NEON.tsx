import React from 'react';

const HeroNeon = () => {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #0A0A0F 0%, #050508 100%)',
      minHeight: '100vh'
    }}>
      {/* Animated neon background effects */}
      <div className="absolute inset-0">
        {/* Top neon line */}
        <div 
          className="absolute top-0 left-0 w-full h-1" 
          style={{ 
            background: 'linear-gradient(90deg, #00D4FF, #B537F7, #FF3D8A)',
            boxShadow: '0 0 20px #00D4FF, 0 0 40px #B537F7, 0 0 60px #FF3D8A'
          }}
        ></div>
        
        {/* Floating neon orbs */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full animate-pulse" 
            style={{ 
              background: 'radial-gradient(circle, rgba(0, 212, 255, 0.3), transparent)',
              boxShadow: '0 0 100px rgba(0, 212, 255, 0.3)'
            }}
          ></div>
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full animate-pulse" 
            style={{ 
              background: 'radial-gradient(circle, rgba(181, 55, 247, 0.3), transparent)',
              boxShadow: '0 0 120px rgba(181, 55, 247, 0.3)',
              animationDelay: '1s'
            }}
          ></div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <div 
          className="text-3xl font-bold"
          style={{
            background: 'linear-gradient(45deg, #00D4FF, #B537F7, #FF3D8A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px #00D4FF'
          }}
        >
          VitalMatrix
        </div>
        <div className="space-x-8">
          <a 
            href="#" 
            className="text-white font-medium transition-all duration-300 hover:scale-110"
            style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}
            onMouseEnter={(e) => {
              e.target.style.color = '#00D4FF';
              e.target.style.textShadow = '0 0 20px #00D4FF';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'white';
              e.target.style.textShadow = '0 0 10px rgba(255,255,255,0.5)';
            }}
          >
            Features
          </a>
          <a 
            href="#" 
            className="text-white font-medium transition-all duration-300 hover:scale-110"
            style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}
            onMouseEnter={(e) => {
              e.target.style.color = '#B537F7';
              e.target.style.textShadow = '0 0 20px #B537F7';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'white';
              e.target.style.textShadow = '0 0 10px rgba(255,255,255,0.5)';
            }}
          >
            Community
          </a>
          <a 
            href="#" 
            className="text-white font-medium transition-all duration-300 hover:scale-110"
            style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}
            onMouseEnter={(e) => {
              e.target.style.color = '#FF3D8A';
              e.target.style.textShadow = '0 0 20px #FF3D8A';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'white';
              e.target.style.textShadow = '0 0 10px rgba(255,255,255,0.5)';
            }}
          >
            Docs
          </a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <h1 
          className="text-7xl font-bold mb-8 leading-tight animate-pulse"
          style={{
            background: 'linear-gradient(45deg, #00D4FF, #B537F7, #FF3D8A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px #00D4FF, 0 0 60px #B537F7, 0 0 90px #FF3D8A'
          }}
        >
          Community Care Meets Smart Nutrition
        </h1>
        
        <p className="text-xl mb-4 text-gray-300 max-w-3xl mx-auto">
          Your health, optimized by the community.
        </p>
        
        <p 
          className="text-lg mb-8 font-semibold"
          style={{ 
            color: '#00D4FF',
            textShadow: '0 0 20px #00D4FF'
          }}
        >
          Community-driven ER insights, AI nutrition scanning, and personalized alerts.
        </p>
        
        {/* Feature highlights */}
        <div className="flex justify-center space-x-8 mb-12 text-sm">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ 
                backgroundColor: '#00D4FF',
                boxShadow: '0 0 10px #00D4FF'
              }}
            ></div>
            <span className="text-gray-300">Live Community Updates</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ 
                backgroundColor: '#B537F7',
                boxShadow: '0 0 10px #B537F7',
                animationDelay: '0.5s'
              }}
            ></div>
            <span className="text-gray-300">AI Nutrition Scanner</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ 
                backgroundColor: '#FF3D8A',
                boxShadow: '0 0 10px #FF3D8A',
                animationDelay: '1s'
              }}
            ></div>
            <span className="text-gray-300">Smart Alerts</span>
          </div>
        </div>

        {/* CTA Button */}
        <button 
          className="px-8 py-4 rounded-lg font-bold text-white transform transition-all duration-300 hover:scale-110"
          style={{
            background: 'linear-gradient(45deg, #00D4FF, #B537F7)',
            border: '2px solid #00D4FF',
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.5), inset 0 0 30px rgba(0, 212, 255, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 0 50px rgba(0, 212, 255, 0.8), inset 0 0 50px rgba(0, 212, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5), inset 0 0 30px rgba(0, 212, 255, 0.1)';
          }}
        >
          Join the Community
        </button>
      </div>
    </div>
  );
};

export default HeroNeon;
