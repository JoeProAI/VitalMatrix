import React from 'react';
// TODO: Replace with Card from @bolt/new when available
// import { Card } from '@bolt/new';

const Features = () => {
  const features = [
    {
      title: 'Community Pulse',
      description: 'Waze-like community insights for ER and urgent care facilities. Real-time user reports on wait times, crowding, and facility conditions.',
      icon: '🫀',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      title: 'NutriLens Scanner',
      description: 'AI-powered barcode nutrition analysis with instant health scores, ingredient insights, and personalized dietary recommendations.',
      icon: '🔍',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Smart Health Alerts',
      description: 'Personalized notifications based on your health profile, community updates, and real-time facility availability near you.',
      icon: '⚡',
      gradient: 'from-blue-500 to-cyan-500'
    },
  ];

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-20 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold mb-4 gradient-neon neon-text">
            Community Pulse
          </h3>
          <p className="text-gray-300 mb-4">
            Real-time, community-driven insights about ER wait times, crowding levels, and facility conditions from people who've been there.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 hover:border-cyan-500/50 text-white p-8 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
            >
              <div className="mb-6">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-2xl mb-4 mx-auto`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-center">{feature.description}</p>
              
              {/* Decorative pulse effect */}
              <div className="mt-6 flex justify-center">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient} animate-pulse`}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Community stats section */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
              <div className="text-3xl font-bold text-cyan-400 mb-2">10K+</div>
              <div className="text-gray-300">Community Reports</div>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">500+</div>
              <div className="text-gray-300">Healthcare Facilities</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-300">Real-Time Updates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;