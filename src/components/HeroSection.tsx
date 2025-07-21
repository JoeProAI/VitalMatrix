import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6 lg:px-8">
      {/* Demo Content Notice */}
      <div className="fixed top-20 left-4 right-4 z-50 max-w-4xl mx-auto">
        <div className="bg-yellow-500/90 backdrop-blur-sm text-black p-3 rounded-lg shadow-lg border border-yellow-400">
          <p className="text-center font-bold text-sm">
            🚨 DEMO APPLICATION: All content, reviews, and data shown are for demonstration purposes only
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className={`transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block">Transform Your</span>
              <span className="bg-gradient-to-r from-electric-blue via-neon-purple to-hot-pink bg-clip-text text-transparent">
                Healthcare Experience
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl">
              Empowering communities with real-time healthcare insights and personalized nutrition intelligence.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button className="px-8 py-4 rounded-full bg-gradient-to-r from-electric-blue to-neon-purple text-white font-medium hover:shadow-glow transition-all duration-300">
                Get Started
              </button>
              <button className="px-8 py-4 rounded-full border border-electric-blue/50 text-white font-medium hover:bg-electric-blue/10 transition-all duration-300">
                Watch Demo
              </button>
            </div>
            <div className="mt-12">
              <p className="text-gray-400 mb-4">Trusted by healthcare communities nationwide</p>
              <div className="flex flex-wrap gap-8 items-center">
                {['Community Badge', 'HealthTech Award', 'Innovation Prize'].map((item, index) => (
                  <div 
                    key={index} 
                    className="inline-flex items-center px-4 py-2 rounded-full bg-dark-surface border border-electric-blue/20"
                  >
                    <span className="w-3 h-3 rounded-full bg-neon-green mr-2"></span>
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Hero Visualization */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative h-80 sm:h-96 lg:h-[32rem]">
              {/* Abstract Matrix Visualization */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-bg-secondary to-dark-surface"></div>
                
                {/* Animated grid */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(0, 212, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}></div>
                
                {/* Pulsing core */}
                <div className="absolute w-32 h-32 bg-electric-blue/10 rounded-full filter blur-xl animate-pulse-gentle"></div>
                <div className="absolute w-24 h-24 bg-neon-purple/15 rounded-full filter blur-lg animate-pulse-gentle delay-500"></div>
                <div className="absolute w-16 h-16 bg-hot-pink/20 rounded-full filter blur-md animate-pulse-gentle delay-1000"></div>
                
                {/* Connection nodes */}
                {[...Array(10)].map((_, i) => {
                  const size = Math.random() * 5 + 3;
                  const x = (Math.random() - 0.5) * 280;
                  const y = (Math.random() - 0.5) * 280;
                  const color = i % 3 === 0 ? '#00D4FF' : i % 3 === 1 ? '#B537F7' : '#FF3D8A';
                  
                  return (
                    <div 
                      key={i} 
                      className="absolute rounded-full animate-pulse-gentle" 
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        backgroundColor: color,
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        boxShadow: `0 0 10px ${color}`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    />
                  );
                })}
                
                {/* Animated visualization frame */}
                <div className="absolute inset-0 border border-electric-blue/30 rounded-2xl"></div>
                <div className="absolute top-4 left-4 right-4 h-8 flex items-center border-b border-electric-blue/20">
                  <div className="w-3 h-3 rounded-full bg-hot-pink ml-2"></div>
                  <div className="text-xs text-gray-400 ml-3">VitalMatrix™ Data Visualization</div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-6">
              {[
                { label: 'Facilities', value: '2,500+' },
                { label: 'Daily Users', value: '120K+' },
                { label: 'Wait Time Accuracy', value: '97%' }
              ].map((stat, i) => (
                <div key={i} className="bg-dark-surface border border-electric-blue/20 rounded-lg p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric-blue/50 to-transparent"></div>
    </section>
  );
};

export default HeroSection;
