import React from 'react';
import { ArrowRightIcon, HeartIcon, ScanIcon } from './icons';

const BoltCtaSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-cyber-grid bg-grid opacity-10"></div>
        
        {/* Neon circles */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full border border-electric-blue/30 opacity-30"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full border border-[#B537F7]/30 opacity-20"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/3 right-1/3 w-4 h-4 rounded-full bg-[#00D4FF]/70 blur-sm"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-[#FF3D8A]/70 blur-sm"></div>
      </div>
      
      <div className="max-w-5xl mx-auto relative">
        <div className="bg-gradient-to-br from-dark-bg to-dark-bg-secondary border border-white/10 rounded-2xl p-8 sm:p-12 overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/5 via-neon-purple/5 to-hot-pink/5"></div>
          
          <div className="relative text-center">
            <div className="inline-flex mb-8">
              <div className="flex items-center space-x-1 bg-dark-bg-secondary px-4 py-2 rounded-full border border-electric-blue/30">
                <HeartIcon />
                <span className="text-electric-blue font-medium">Community Pulse</span>
                <span className="mx-2 text-gray-500">+</span>
                <ScanIcon />
                <span className="text-[#B537F7] font-medium">NutriLens</span>
              </div>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">
              Ready to Transform Your
              <span className="block bg-gradient-to-r from-electric-blue via-[#B537F7] to-[#FF3D8A] bg-clip-text text-transparent mt-2">
                Healthcare Experience?
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users making smarter healthcare decisions with 
              real-time insights and AI-powered nutrition intelligence.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto mb-12">
              {[
                {
                  title: 'For Healthcare Consumers',
                  features: [
                    'Access real-time facility conditions',
                    'Make informed decisions',
                    'Analyze nutrition with AI',
                    'Free community account'
                  ],
                  cta: 'Create Free Account',
                  color: '#00D4FF'
                },
                {
                  title: 'For Healthcare Providers',
                  features: [
                    'Partner with community insights',
                    'Improve patient experience',
                    'Access aggregated insights',
                    'Premium features'
                  ],
                  cta: 'Partner With Us',
                  color: '#B537F7'
                }
              ].map((plan, i) => (
                <div 
                  key={i} 
                  className="bg-dark-bg/70 border border-white/10 rounded-xl p-6 backdrop-blur"
                >
                  <h3 
                    className="text-xl font-bold mb-4" 
                    style={{ color: plan.color }}
                  >
                    {plan.title}
                  </h3>
                  
                  <ul className="mb-6 space-y-2 text-left">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start">
                        <div 
                          className="mr-2 mt-1 w-4 h-4 rounded-full"
                          style={{ backgroundColor: `${plan.color}30` }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full mx-auto mt-1"
                            style={{ backgroundColor: plan.color }}
                          ></div>
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className="w-full py-2.5 rounded-full font-medium flex items-center justify-center group"
                    style={{ 
                      background: `linear-gradient(to right, ${plan.color}20, ${plan.color}40)`,
                      color: plan.color 
                    }}
                  >
                    {plan.cta}
                    <ArrowRightIcon />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Animated divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-12"></div>
            
            {/* Newsletter */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Stay Updated</h3>
              <p className="text-gray-400 mb-6">
                Get the latest features and updates delivered to your inbox
              </p>
              
              <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-dark-bg/70 border border-white/10 rounded-full px-5 py-3 flex-grow focus:outline-none focus:border-electric-blue/50 transition-colors"
                />
                <button 
                  className="bg-gradient-to-r from-electric-blue to-neon-purple rounded-full px-6 py-3 font-medium hover:shadow-lg hover:shadow-electric-blue/20 transition-all duration-300"
                >
                  Subscribe
                </button>
              </form>
              
              <p className="text-gray-500 text-sm mt-4">
                By subscribing you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        </div>
        
        {/* Final trust elements */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-12">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm text-gray-400">End-to-end encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <span className="text-sm text-gray-400">HIPAA compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            </div>
            <span className="text-sm text-gray-400">Data ownership</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            </div>
            <span className="text-sm text-gray-400">Privacy-first design</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoltCtaSection;
