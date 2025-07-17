import React from 'react';

const CtaSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-electric-blue/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-neon-purple/10 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="max-w-5xl mx-auto relative">
        <div className="bg-gradient-to-r from-dark-bg-secondary to-dark-surface border border-gray-800 rounded-2xl p-8 sm:p-12 shadow-xl shadow-electric-blue/5">
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 212, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}></div>
          
          <div className="relative text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-electric-blue/20 to-neon-purple/20 text-white text-sm font-medium mb-4">
              Ready to Transform Healthcare?
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Join the <span className="bg-gradient-to-r from-electric-blue via-neon-purple to-hot-pink bg-clip-text text-transparent">VitalMatrix</span> Community
            </h2>
            
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Be part of the healthcare revolution. Get early access to our platform and help shape the future of community-powered healthcare insights.
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 px-6 py-4 rounded-full bg-dark-bg border border-gray-700 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 focus:outline-none text-white"
                />
                <button className="px-8 py-4 rounded-full bg-gradient-to-r from-electric-blue to-neon-purple text-white font-medium hover:shadow-glow transition-all duration-300 whitespace-nowrap">
                  Get Early Access
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Join 10,000+ healthcare professionals and patients. No spam, ever.
              </p>
            </div>
          </div>
          
          {/* Feature badges */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Community Insights", icon: "👥" },
              { name: "AI-Powered", icon: "🧠" },
              { name: "Privacy Focused", icon: "🔒" },
              { name: "Free Access", icon: "✨" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center justify-center sm:justify-start space-x-2 p-3 rounded-lg bg-dark-bg/50 border border-gray-800">
                <span className="text-xl">{feature.icon}</span>
                <span className="text-sm font-medium">{feature.name}</span>
              </div>
            ))}
          </div>
          
          {/* Corner accent */}
          <div className="absolute top-0 right-0 h-20 w-20 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-hot-pink to-neon-purple opacity-20 transform rotate-45 translate-x-10 -translate-y-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
