import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-dark-bg/90 backdrop-blur-lg shadow-lg shadow-electric-blue/10' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="w-5 h-5 text-white"
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-electric-blue via-neon-purple to-hot-pink bg-clip-text text-transparent">
              VitalMatrix
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">Features</a>
              <a href="#community" className="text-gray-300 hover:text-white transition-colors duration-200">Community Pulse</a>
              <a href="#nutrilens" className="text-gray-300 hover:text-white transition-colors duration-200">NutriLens</a>
              <button className="px-4 py-2 rounded-full bg-gradient-to-r from-electric-blue to-neon-purple text-white font-medium hover:shadow-glow transition-all duration-300">
                Get Started
              </button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-dark-bg/95 backdrop-blur-lg border-b border-electric-blue/20">
          <a 
            href="#features" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-bg-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </a>
          <a 
            href="#community" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-bg-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Community Pulse
          </a>
          <a 
            href="#nutrilens" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-bg-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            NutriLens
          </a>
          <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-electric-blue to-neon-purple text-white">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
