import React, { useState } from 'react';
import { ZapIcon, ShieldIcon, AlertTriangleIcon, AwardIcon, ScanIcon } from './icons';

const BoltNutriLensSection: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  
  const handleScanClick = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <section id="nutrilens" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-neon-purple/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/3 left-1/4 w-[250px] h-[250px] bg-hot-pink/20 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-neon-purple to-hot-pink bg-clip-text text-transparent">
              NutriLens Scanner
            </span>{' '}
            Technology
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            AI-powered nutrition analysis that transforms how you make food decisions
          </p>
        </div>

        {/* Interactive Scanner Demo */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="bg-dark-bg-secondary/80 border border-neon-purple/30 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent"></div>
            
            {/* Scanner Interface */}
            <div className="relative">
              <div className="mb-8 text-center">
                <button 
                  onClick={handleScanClick}
                  disabled={isScanning}
                  className={`px-8 py-3 rounded-full font-semibold flex items-center justify-center mx-auto
                    ${isScanning 
                      ? 'bg-neon-purple/50 text-white cursor-not-allowed' 
                      : 'bg-gradient-to-r from-neon-purple to-hot-pink text-white hover:shadow-lg hover:shadow-neon-purple/30 transition-all duration-300'
                    }
                  `}
                >
                  <ScanIcon className="w-5 h-5 mr-2" />
                  {isScanning ? 'Scanning...' : 'Scan Barcode'}
                </button>
              </div>
              
              <div className="bg-dark-bg border border-neon-purple/20 rounded-xl p-6 relative">
                <div className={`absolute inset-0 ${isScanning ? 'scan-animation' : ''}`}></div>
                
                <div className="space-y-4">
                  {/* Product Info */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Organic Whole Grain Cereal</h4>
                    <div className="flex items-center space-x-3">
                      <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Organic</div>
                      <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">Vegan</div>
                      <div className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">Contains Gluten</div>
                    </div>
                  </div>
                  
                  {/* Health Score */}
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold mr-4">
                      78
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Health Score</p>
                      <p className="text-white font-medium">Very Good</p>
                    </div>
                  </div>
                  
                  {/* Nutrition Highlights */}
                  <div className="grid grid-cols-3 gap-4 border-t border-neon-purple/20 pt-4 mt-4">
                    <div>
                      <p className="text-gray-400 text-sm">Protein</p>
                      <p className="text-white font-medium">8g</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Fiber</p>
                      <p className="text-white font-medium">12g</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Added Sugar</p>
                      <p className="text-white font-medium">2g</p>
                    </div>
                  </div>
                  
                  {/* AI Insights */}
                  <div className="border-t border-neon-purple/20 pt-4 mt-4">
                    <p className="text-sm text-neon-purple flex items-center">
                      <ZapIcon className="w-4 h-4 mr-1" />
                      AI Insights
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-300">
                      <li>• High in fiber and protein</li>
                      <li>• Low added sugar content</li>
                      <li>• Contains essential B vitamins</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Features */}
          <div className="space-y-8">
            {[
              {
                icon: ShieldIcon,
                title: 'Allergen Detection',
                description: 'Automatic alerts for ingredients that could trigger your allergies or don\'t match your dietary preferences.',
                color: 'text-electric-blue'
              },
              {
                icon: ZapIcon,
                title: 'Instant Analysis',
                description: 'Get comprehensive nutrition insights within seconds of scanning any product barcode.',
                color: 'text-neon-purple'
              },
              {
                icon: AlertTriangleIcon,
                title: 'Ingredient Warnings',
                description: 'Identifies potentially harmful additives, excessive sugar, or concerning ingredients.',
                color: 'text-hot-pink'
              },
              {
                icon: AwardIcon,
                title: 'Health Scoring',
                description: 'Proprietary algorithm rates products on a 0-100 scale based on nutritional value and ingredients.',
                color: 'text-electric-blue'
              }
            ].map((feature, i) => (
              <div key={i} className="flex">
                <div 
                  className="p-3 rounded-lg mr-4 self-start"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon style={{ color: feature.color }} className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: feature.color }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Personalization Engine */}
        <div className="bg-gradient-to-br from-dark-bg to-dark-bg-secondary border border-white/10 rounded-2xl p-8 mt-12">
          <h3 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-neon-purple to-hot-pink bg-clip-text text-transparent">
            AI Personalization Engine
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              {
                title: 'Health Profiles',
                content: 'Set dietary restrictions, health goals, and preferences for personalized recommendations.',
                icon: '👤'
              },
              {
                title: 'Smart Alternatives',
                content: 'Discover healthier product options that match your personal nutrition goals.',
                icon: '🔄'
              },
              {
                title: 'Learning Algorithm',
                content: 'Our AI learns from your scans and preferences to provide increasingly accurate insights.',
                icon: '🧠'
              },
            ].map((feature, i) => (
              <div key={i} className="bg-dark-bg-secondary/50 border border-white/5 p-6 rounded-xl">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-300 text-sm">{feature.content}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-neon-purple to-hot-pink px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-neon-purple/30 transition-all duration-300">
              Try NutriLens Scanner
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scan-animation {
          background: linear-gradient(to bottom, transparent, rgba(181, 55, 247, 0.3), transparent);
          background-size: 100% 200%;
          animation: scan 2s ease-in-out infinite;
        }
        
        @keyframes scan {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 0% 200%;
          }
        }
      `}</style>
    </section>
  );
};

export default BoltNutriLensSection;
