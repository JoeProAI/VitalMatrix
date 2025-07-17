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
