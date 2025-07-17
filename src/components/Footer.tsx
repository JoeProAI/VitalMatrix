import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark-bg border-t border-electric-blue/20 relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-electric-blue to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center">
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
              <h3 className="text-2xl font-bold bg-gradient-to-r from-electric-blue via-neon-purple to-hot-pink bg-clip-text text-transparent">
                VitalMatrix
              </h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Revolutionizing healthcare through community-driven insights and AI-powered nutrition analysis.
            </p>
            <div className="flex space-x-4">
              {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:border-electric-blue hover:bg-dark-surface transition-colors duration-300"
                >
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 text-gray-400 hover:text-electric-blue transition-colors duration-300">
                    {/* Simple placeholder icons */}
                    {index === 0 && (
                      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
                    )}
                    {index === 1 && (
                      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/></svg>
                    )}
                    {index === 2 && (
                      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    )}
                    {index === 3 && (
                      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19.7 3H4.3A1.3 1.3 0 003 4.3v15.4A1.3 1.3 0 004.3 21h15.4a1.3 1.3 0 001.3-1.3V4.3A1.3 1.3 0 0019.7 3zM8.339 18.338H5.667v-8.59h2.672v8.59zM7.004 8.574a1.548 1.548 0 11-.002-3.096 1.548 1.548 0 01.002 3.096zm11.335 9.764H15.67v-4.177c0-.996-.017-2.278-1.387-2.278-1.389 0-1.601 1.086-1.601 2.206v4.249h-2.667v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.779 3.203 4.092v4.711z"/></svg>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 bg-gradient-to-r from-electric-blue to-white bg-clip-text text-transparent">
              Quick Links
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-electric-blue transition-colors duration-300">About Us</a></li>
              <li><a href="#" className="hover:text-electric-blue transition-colors duration-300">Features</a></li>
              <li><a href="#" className="hover:text-electric-blue transition-colors duration-300">Testimonials</a></li>
              <li><a href="#" className="hover:text-electric-blue transition-colors duration-300">Contact</a></li>
            </ul>
          </div>
          
          {/* Community Pulse */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 bg-gradient-to-r from-electric-blue to-white bg-clip-text text-transparent">
              Community Pulse
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-electric-blue transition-colors duration-300">Real-time Reports</a></li>
              <li><a href="#" className="hover:text-electric-blue transition-colors duration-300">ER Wait Times</a></li>
              <li><a href="#" className="hover:text-electric-blue transition-colors duration-300">Facility Reviews</a></li>
              <li><a href="#" className="hover:text-electric-blue transition-colors duration-300">Dashboard</a></li>
            </ul>
          </div>
          
          {/* NutriLens */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 bg-gradient-to-r from-neon-purple to-hot-pink bg-clip-text text-transparent">
              NutriLens
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-neon-purple transition-colors duration-300">Barcode Scanner</a></li>
              <li><a href="#" className="hover:text-neon-purple transition-colors duration-300">Nutrition Scores</a></li>
              <li><a href="#" className="hover:text-neon-purple transition-colors duration-300">Health Insights</a></li>
              <li><a href="#" className="hover:text-neon-purple transition-colors duration-300">Meal Tracker</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse mr-2"></div>
            <p className="text-gray-400 text-sm">
              © 2025 VitalMatrix. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
            <a href="#" className="hover:text-electric-blue transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-electric-blue transition-colors duration-300">Terms of Service</a>
            <a href="#" className="hover:text-electric-blue transition-colors duration-300">Cookie Policy</a>
            <a href="#" className="hover:text-electric-blue transition-colors duration-300">Support</a>
          </div>
        </div>
      </div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}></div>
      </div>
    </footer>
  );
};

export default Footer;