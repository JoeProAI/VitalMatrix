import React from 'react';
import { ArrowRightIcon, ChevronDownIcon, UsersIcon, ZapIcon, BrainIcon, ShieldIcon } from './icons';

const BoltHeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full opacity-30`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
              background: i % 3 === 0 ? '#00D4FF' : i % 3 === 1 ? '#B537F7' : '#FF3D8A',
              boxShadow: i % 3 === 0 ? '0 0 15px #00D4FF' : i % 3 === 1 ? '0 0 15px #B537F7' : '0 0 15px #FF3D8A',
              animation: 'float 8s ease-in-out infinite'
            }}
          />
        ))}
      </div>

      <div className="text-center max-w-4xl mx-auto animate-fade-in">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-electric-blue/20 to-neon-purple/20 border border-electric-blue/30 rounded-full text-sm font-medium text-electric-blue mb-8">
            🚀 Revolutionary Healthcare Navigation
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Transform Your{' '}
          <span className="bg-gradient-to-r from-electric-blue via-neon-purple to-hot-pink bg-clip-text text-transparent">
            Healthcare Decisions
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Make smarter healthcare choices with real-time community insights and AI-powered nutrition intelligence
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button className="group bg-gradient-to-r from-electric-blue to-neon-purple px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-electric-blue/30 transition-all duration-300 animate-pulse-gentle">
            Start Your Journey
            <ArrowRightIcon className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="border border-electric-blue/50 px-8 py-4 rounded-full font-semibold text-lg hover:bg-dark-bg/10 hover:border-electric-blue transition-all duration-300">
            Watch Demo
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto text-center">
          {[
            { icon: UsersIcon, label: 'Community Powered', value: '50K+' },
            { icon: ZapIcon, label: 'Real-Time Data', value: '24/7' },
            { icon: BrainIcon, label: 'AI Insights', value: '99.9%' },
            { icon: ShieldIcon, label: 'Privacy First', value: '100%' },
          ].map((stat, index) => (
            <div 
              key={index} 
              className="animate-slide-up" 
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animation: 'slideUp 0.5s ease-out forwards',
                opacity: 0,
                transform: 'translateY(20px)'
              }}
            >
              <stat.icon className="w-8 h-8 mx-auto mb-2 text-electric-blue" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDownIcon className="w-6 h-6 text-electric-blue" />
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-gentle {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.9;
          }
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default BoltHeroSection;
