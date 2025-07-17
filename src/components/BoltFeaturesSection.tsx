import React, { useState } from 'react';
import { HeartIcon, ScanIcon } from './icons';

const BoltFeaturesSection: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    {
      icon: HeartIcon,
      title: 'Community Pulse',
      subtitle: 'Real-Time Healthcare Insights',
      description: 'Get live updates on emergency room wait times, staff availability, and facility conditions from real people in your community.',
      details: [
        'Live wait time tracking',
        'Community-verified reviews',
        'Real-time crowding levels',
        'Safety alerts and updates',
      ],
      color: 'electric-blue',
    },
    {
      icon: ScanIcon,
      title: 'NutriLens Scanner',
      subtitle: 'AI-Powered Nutrition Intelligence',
      description: 'Instantly analyze any food product with our AI scanner for health scores, ingredient insights, and personalized recommendations.',
      details: [
        'Instant barcode scanning',
        'Health score analysis',
        'Allergen warnings',
        'Personalized recommendations',
      ],
      color: 'neon-purple',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Powered by{' '}
            <span className="bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
              Innovation
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Two revolutionary features that put the power of informed healthcare decisions in your hands
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 transform transition-all duration-500 hover:scale-[1.02] cursor-pointer ${
                activeFeature === index
                  ? index === 0
                    ? 'bg-gradient-to-br from-electric-blue/20 to-electric-blue/5 border border-electric-blue/30'
                    : 'bg-gradient-to-br from-neon-purple/20 to-neon-purple/5 border border-neon-purple/30'
                  : 'bg-dark-bg-secondary/50 border border-white/5'
              }`}
              onClick={() => setActiveFeature(index)}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className="flex items-center mb-6">
                <div
                  className={`p-4 rounded-lg mr-4 ${
                    index === 0
                      ? 'bg-electric-blue/20 text-electric-blue'
                      : 'bg-neon-purple/20 text-neon-purple'
                  }`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p
                    className={`${
                      index === 0 ? 'text-electric-blue' : 'text-dark-surface'
                    }`}
                  >
                    {feature.subtitle}
                  </p>
                </div>
              </div>
              <p className="text-gray-300 mb-6">{feature.description}</p>
              <ul className="space-y-3">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-3 ${
                        index === 0 ? 'bg-electric-blue' : 'bg-dark-surface'
                      }`}
                    />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    index === 0
                      ? 'bg-electric-blue/20 hover:bg-electric-blue/40 text-electric-blue'
                      : 'bg-neon-purple/20 hover:bg-neon-purple/40 text-neon-purple'
                  }`}
                >
                  Learn more
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Enhanced visual elements */}
      <div className="relative mt-20">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-r from-electric-blue/10 to-neon-purple/10 blur-3xl opacity-30" />
        </div>
        
        <div className="relative grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: 'Privacy First',
              description: 'Your data is always encrypted and never shared without your explicit permission',
              highlight: '#00D4FF'
            },
            {
              title: 'Community Driven',
              description: 'Powered by real people sharing real experiences in real-time',
              highlight: '#B537F7'
            },
            {
              title: 'AI Enhanced',
              description: 'Advanced algorithms ensure accurate and personalized insights',
              highlight: '#FF3D8A'
            }
          ].map((item, index) => (
            <div 
              key={index}
              className="bg-dark-bg-secondary/60 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
              style={{
                boxShadow: `0 5px 20px ${item.highlight}10`
              }}
            >
              <h3 
                className="text-xl font-bold mb-3" 
                style={{color: item.highlight}}
              >
                {item.title}
              </h3>
              <p className="text-gray-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BoltFeaturesSection;
