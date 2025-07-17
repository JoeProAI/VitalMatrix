import React, { useState, useEffect } from 'react';
import { ActivityIcon, MenuIcon, XIcon } from './icons';
import Link from 'next/link';

const BoltNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-dark-bg/80 backdrop-blur-lg border-b border-electric-blue/20' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg flex items-center justify-center">
              <ActivityIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
              VitalMatrix
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="hover:text-electric-blue transition-colors">
              Features
            </Link>
            <Link href="#community" className="hover:text-electric-blue transition-colors">
              Community
            </Link>
            <Link href="#about" className="hover:text-electric-blue transition-colors">
              About
            </Link>
            <button className="bg-gradient-to-r from-electric-blue to-neon-purple px-6 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-300">
              Get Started
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-bg-secondary/95 backdrop-blur-lg border-t border-electric-blue/20">
          <div className="px-4 py-4 space-y-4">
            <Link href="#features" className="block hover:text-electric-blue transition-colors">Features</Link>
            <Link href="#community" className="block hover:text-electric-blue transition-colors">Community</Link>
            <Link href="#about" className="block hover:text-electric-blue transition-colors">About</Link>
            <button className="w-full bg-gradient-to-r from-electric-blue to-neon-purple px-6 py-2 rounded-full font-medium">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default BoltNavbar;
