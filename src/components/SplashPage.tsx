import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CommunitySection from './CommunitySection';
import NutriLensSection from './NutriLensSection';
import CtaSection from './CtaSection';
import Footer from './Footer';

const SplashPage = () => {
  const [mounted, setMounted] = useState(false);
  
  // Handle client-side mounting for animations
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-bg to-dark-bg-secondary text-white">
      {/* Background effects - animated grid with neon accents */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(to right, rgba(57, 255, 20, 0.3) 1px, transparent 1px), 
                             linear-gradient(to bottom, rgba(57, 255, 20, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}>
        </div>
        
        {/* Animated accent lines */}
        {mounted && (
          <>
            <div className="absolute left-0 right-0 h-[1px] top-1/4 bg-gradient-to-r from-transparent via-electric-blue to-transparent opacity-30 animate-pulse-gentle"></div>
            <div className="absolute left-0 right-0 h-[1px] top-2/4 bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-30 animate-pulse-gentle delay-300"></div>
            <div className="absolute left-0 right-0 h-[1px] top-3/4 bg-gradient-to-r from-transparent via-hot-pink to-transparent opacity-30 animate-pulse-gentle delay-700"></div>
          </>
        )}
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-radial-gradient"></div>
        
        {/* Wide Screen Effects - Only visible on xl screens and larger */}
        {mounted && (
          <div className="hidden xl:block">
            {/* Floating Particles */}
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-electric-blue rounded-full opacity-20 animate-float"
                  style={{
                    left: `${10 + (i * 7) % 80}%`,
                    top: `${15 + (i * 11) % 70}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${3 + (i % 3)}s`
                  }}
                />
              ))}
            </div>
            
            {/* Geometric Shapes */}
            <div className="absolute top-20 right-20 w-32 h-32 border border-neon-purple/20 rotate-45 animate-spin-slow"></div>
            <div className="absolute bottom-40 left-20 w-24 h-24 border-2 border-hot-pink/15 rounded-full animate-pulse-gentle"></div>
            <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-electric-blue/10 to-transparent rotate-12 animate-bounce-gentle"></div>
            
            {/* Side Accent Lines */}
            <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-electric-blue/30 to-transparent"></div>
            <div className="absolute right-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-neon-purple/30 to-transparent"></div>
            
            {/* Corner Decorations */}
            <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-electric-blue/40"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-neon-purple/40"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-hot-pink/40"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-electric-blue/40"></div>
          </div>
        )}
      </div>
      
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CommunitySection />
      <NutriLensSection />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default SplashPage;
