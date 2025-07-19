import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import UserDashboard from './components/UserDashboard';
import NutriLens from './components/NutriLens';
import { IntercomProvider } from './components/IntercomProvider';
import CommunityPulse from './components/CommunityPulse';
import TestCommunityPulse from './components/TestCommunityPulse';
import BasicTest from './components/BasicTest';
import SplashPage from './components/SplashPage';
import {
  Heart,
  Scan,
  Users,
  Shield,
  Zap,
  Brain,
  Activity,
  Star,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Hexagon,
  Clock,
  MapPin,
  TrendingUp,
  Sun,
  Moon,
} from 'lucide-react';

const HomePageContent: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
      // Set dark mode as default
      document.documentElement.classList.add('dark');
    }, []);

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);
      document.documentElement.classList.toggle('dark');
    };

    // Handle CTA button clicks
    const handleGetStarted = () => {
      if (currentUser) {
        navigate('/dashboard');
      } else {
        navigate('/signup');
      }
    };

    const handleTryNutriLens = () => {
      if (currentUser) {
        navigate('/nutrilens');
      } else {
        navigate('/signup');
      }
    };

    const features = [
      {
        icon: Heart,
        title: 'Community Pulse',
        subtitle: 'Real-Time Healthcare Insights',
        description: 'Get live updates on emergency room wait times, staff availability, and facility conditions from real people in your community.',
        details: [
          'Live wait time tracking',
          'Community-verified reviews',
          'Real-time crowding levels',
          'Safety alerts and updates',
        ],
      },
      {
        icon: Scan,
        title: 'NutriLens Scanner',
        subtitle: 'AI-Powered Nutrition Intelligence',
        description: 'Instantly analyze any food product with our AI scanner for health scores, ingredient insights, and personalized recommendations.',
        details: [
          'Instant barcode scanning',
          'Health score analysis',
          'Allergen warnings',
          'Personalized recommendations',
        ],
      },
    ];

    return (
      <>
      <div className="min-h-screen bg-pearl dark:bg-midnight text-midnight dark:text-pearl font-body transition-colors duration-300">
        {/* Background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-20" />
          <div className="absolute top-32 left-16 w-64 h-32 bg-ocean/5 dark:bg-ocean/10 transform rotate-12 animate-float-slow" />
          <div className="absolute top-64 right-24 w-48 h-48 bg-coral/5 dark:bg-coral/10 transform -rotate-6 animate-float-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-48 left-1/4 w-56 h-28 bg-forest/5 dark:bg-forest/10 transform rotate-3 animate-float-slow" style={{ animationDelay: '4s' }} />
        </div>
        
        {/* Floating Bottom Left Banner */}
        <div className="fixed bottom-6 left-6 z-30 pointer-events-auto">
          <div className="group bg-gradient-to-br from-ocean via-ocean-light to-lavender text-pearl p-3 shadow-2xl hover:shadow-3xl max-w-56 transition-all duration-700 hover:scale-105 hover:-translate-y-3 hover:rotate-1 border-l-4 border-coral animate-pulse-soft relative overflow-hidden">
            {/* Cool background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-coral/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-coral/30 rounded-full blur-sm group-hover:blur-none transition-all duration-500" />
            
            <div className="text-left">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-7 h-7 bg-coral/20 border-l-4 border-coral flex items-center justify-center transform rotate-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                  <Scan className="w-4 h-4 text-coral group-hover:animate-pulse" />
                </div>
                <span className="font-mono text-xs text-coral uppercase tracking-wide font-bold bg-coral/20 px-2 py-0.5 group-hover:bg-coral/30 transition-colors duration-300">
                  🔥 NEW
                </span>
              </div>
              <h3 className="font-display font-bold text-base mb-1 text-pearl group-hover:text-coral-light transition-colors duration-300">
                NutriLens Scanner
              </h3>
              <p className="text-pearl/90 text-xs mb-3 leading-relaxed">
                AI-powered nutrition analysis
              </p>
              <button 
                onClick={handleTryNutriLens}
                className="inline-flex items-center bg-coral text-pearl px-3 py-1.5 font-bold text-xs hover:bg-coral-dark transition-all duration-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 font-mono uppercase tracking-wide relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                TRY NOW
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
              </button>
            </div>
            
            {/* Enhanced pulsing indicators */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-coral rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-coral rounded-full animate-pulse" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-coral-light rounded-full" />
          </div>
        </div>

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled 
            ? 'bg-pearl/95 dark:bg-midnight/95 backdrop-blur-sm border-b border-steel/10 dark:border-steel/20 shadow-sm' 
            : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-18">
              <div className="flex items-center space-x-4">
                {/* Heartbeat line logo */}
                <div className="relative">
                  <svg width="48" height="24" viewBox="0 0 48 24">
                    <defs>
                      <linearGradient id="heartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2b6cb0" />
                        <stop offset="50%" stopColor="#3182ce" />
                        <stop offset="100%" stopColor="#d69e2e" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 12 L8 12 L10 8 L12 16 L14 4 L16 20 L18 12 L48 12"
                      stroke="url(#heartbeatGradient)"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-pulse drop-shadow-sm"
                    />
                  </svg>
                </div>
                <span className="text-xl font-display font-bold text-midnight tracking-tight">
                  <span className="text-xl font-display font-bold text-midnight dark:text-pearl tracking-tight">
                    VitalMatrix
                  </span>
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-steel dark:text-mist hover:text-ocean transition-colors duration-300 font-medium">Features</a>
                <a href="#community" className="text-steel dark:text-mist hover:text-ocean transition-colors duration-300 font-medium">Community</a>
                <a href="#about" className="text-steel dark:text-mist hover:text-ocean transition-colors duration-300 font-medium">About</a>
                
                {/* Dark mode toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-steel dark:text-mist hover:text-ocean transition-colors duration-300"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                
                {/* Unique angular button */}
                <a href="/login" className="relative bg-ocean text-pearl px-8 py-3 font-medium hover:bg-ocean-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-block" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)' }}>
                  Get Started
                </a>
              </div>

              <button
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-pearl/98 dark:bg-midnight/98 backdrop-blur-lg border-t border-steel/10 dark:border-steel/20">
              <div className="px-6 py-6 space-y-4">
                <a href="#features" className="block text-steel dark:text-mist hover:text-ocean transition-colors font-medium">Features</a>
                <a href="#community" className="block text-steel dark:text-mist hover:text-ocean transition-colors font-medium">Community</a>
                <a href="#about" className="block text-steel dark:text-mist hover:text-ocean transition-colors font-medium">About</a>
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center text-steel dark:text-mist hover:text-ocean transition-colors font-medium"
                >
                  {isDarkMode ? <Sun className="w-5 h-5 mr-2" /> : <Moon className="w-5 h-5 mr-2" />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <a href="/login" className="w-full bg-ocean text-pearl px-6 py-3 font-medium inline-block text-center" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)' }}>
                  Get Started
                </a>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-8 pt-24">
          <div className="text-center max-w-6xl mx-auto animate-slide-up">
            <div className="mb-8">
              <span className="inline-flex items-center px-6 py-2 bg-ocean/10 border-l-4 border-ocean text-sm font-mono font-medium text-ocean mb-8">
                <Activity className="w-4 h-4 mr-2" />
                HEALTHCARE.NAVIGATION.REIMAGINED
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-8 leading-tight text-midnight dark:text-pearl">
              Make Healthcare{' '}
              <span className="italic text-ocean relative">
                Personal
                <div className="absolute -bottom-3 left-0 right-0 h-2 bg-coral/40 transform -skew-x-12" />
              </span>
              {' '}Again
            </h1>
            
            <p className="text-lg sm:text-xl text-steel dark:text-mist mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Connect with your community for real-time healthcare insights and make informed nutrition choices with AI-powered analysis
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              {/* Unique angular buttons */}
              <a href="/signup" className="group relative bg-ocean text-pearl px-8 py-3 font-semibold text-base hover:bg-ocean-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block text-center" style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 16px 100%)' }}>
                Start Your Journey
                <ArrowRight className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <button className="relative border-2 border-ocean text-ocean px-8 py-3 font-semibold text-base hover:bg-ocean/5 transition-all duration-300 transform hover:-translate-y-1" style={{ clipPath: 'polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%)' }}>
                Learn More
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { icon: Users, label: 'Active Communities', value: '50K+', color: 'ocean' },
                { icon: Clock, label: 'Real-Time Updates', value: '24/7', color: 'coral' },
                { icon: Brain, label: 'AI Accuracy', value: '99.9%', color: 'forest' },
                { icon: Shield, label: 'Privacy Protected', value: '100%', color: 'lavender' },
              ].map((stat, index) => (
                <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className={`w-14 h-14 mx-auto mb-4 bg-${stat.color}/10 dark:bg-${stat.color}/20 border-l-4 border-${stat.color} flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
                    <stat.icon className={`w-7 h-7 text-${stat.color}`} />
                  </div>
                  <div className="text-2xl font-display font-bold text-midnight dark:text-pearl mb-1">{stat.value}</div>
                  <div className="text-sm text-steel dark:text-mist font-medium uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-pulse-soft">
            <ChevronDown className="w-6 h-6 text-ocean" />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 lg:px-8 bg-mist/30 dark:bg-slate-blue/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6 text-midnight dark:text-pearl">
                Two Powerful{' '}
                <span className="italic text-ocean relative">
                  Tools
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-coral/60 transform -skew-x-12" />
                </span>
              </h2>
              <p className="text-lg text-steel dark:text-mist max-w-3xl mx-auto font-light leading-relaxed">
                Designed to put meaningful healthcare information directly in your hands
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-pearl dark:bg-slate-blue border-l-4 border-ocean/20 hover:border-ocean transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 relative overflow-hidden"
                  style={{ clipPath: index === 0 ? 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)' : 'polygon(20px 0, 100% 0, 100% 100%, 0 100%)' }}
                >
                  {/* Scanner animation only for NutriLens Scanner */}
                  {index === 1 && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute top-4 right-4 text-xs font-mono text-coral opacity-70 animate-pulse">
                        SCANNING...
                      </div>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-coral to-transparent animate-pulse" />
                      <div className="absolute left-0 right-0 h-1 bg-coral/80 shadow-lg" style={{ 
                        animation: 'scan-line 2.5s linear infinite',
                        boxShadow: '0 0 10px rgba(237, 137, 54, 0.6)' 
                      }} />
                    </div>
                  )}

                  <div className="p-10">
                    <div className="flex items-start mb-8">
                      <div className="w-16 h-16 bg-ocean/10 dark:bg-ocean/20 border-l-4 border-ocean flex items-center justify-center mr-6 group-hover:bg-ocean/20 dark:group-hover:bg-ocean/30 transition-colors duration-300 transform rotate-3 group-hover:rotate-0">
                        <feature.icon className="w-8 h-8 text-ocean" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-display font-bold text-midnight dark:text-pearl mb-2">{feature.title}</h3>
                        <p className="text-ocean font-mono text-sm uppercase tracking-wide">{feature.subtitle}</p>
                      </div>
                    </div>

                    <p className="text-steel dark:text-mist text-base mb-8 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="space-y-4">
                      {feature.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center text-steel dark:text-mist">
                          <div className="w-3 h-3 bg-coral mr-4 transform rotate-45 group-hover:animate-pulse-soft" />
                          <span className="font-medium">{detail}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-steel/10 dark:border-steel/20">
                      {index === 1 ? (
                        <a 
                          href="https://vitalmatrix-app.vercel.app/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center bg-coral text-pearl px-6 py-3 font-semibold hover:bg-coral-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-mono uppercase tracking-wide text-sm"
                          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)' }}
                        >
                          TRY.NOW
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </a>
                      ) : (
                        <button className="text-ocean font-semibold hover:text-ocean-dark transition-colors duration-300 flex items-center font-mono uppercase tracking-wide text-sm">
                          LEARN.MORE
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Impact Section */}
        <section className="py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-display font-bold mb-6 text-midnight dark:text-pearl">
                    Community-Driven{' '}
                    <span className="italic text-ocean">Intelligence</span>
                  </h3>
                  <p className="text-steel dark:text-mist text-base leading-relaxed">
                    Real people sharing real experiences to help you make better healthcare decisions. No corporate filters, just authentic community insights.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: 'Average Wait Time Reduction', value: '45%', icon: Clock, color: 'coral' },
                    { label: 'Daily Community Reports', value: '2.3K', icon: Users, color: 'forest' },
                    { label: 'Verified Accuracy Rate', value: '96.8%', icon: Shield, color: 'lavender' },
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-6 bg-mist/50 dark:bg-slate-blue/30 border-l-4 border-steel/20 hover:border-ocean transition-all duration-300 transform hover:translate-x-2">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 bg-${metric.color}/10 dark:bg-${metric.color}/20 border-l-4 border-${metric.color} flex items-center justify-center mr-4 transform rotate-3`}>
                          <metric.icon className={`w-6 h-6 text-${metric.color}`} />
                        </div>
                        <span className="text-steel dark:text-mist font-medium">{metric.label}</span>
                      </div>
                      <span className={`text-2xl font-display font-bold text-${metric.color}`}>{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-pearl dark:bg-slate-blue border-l-4 border-ocean shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500" style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 100%, 0 100%)' }}>
                  <div className="p-8">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-coral/10 dark:bg-coral/20 border-l-4 border-coral flex items-center justify-center mr-3 transform rotate-3">
                        <Scan className="w-6 h-6 text-coral" />
                      </div>
                      <h4 className="text-lg font-display font-bold text-midnight dark:text-pearl">Health Analysis Results</h4>
                    </div>
                    
                    <div className="bg-mist/50 dark:bg-midnight/30 border-l-4 border-steel/20 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-steel dark:text-mist font-medium font-mono uppercase tracking-wide text-sm">Health Score</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 h-4 bg-mist dark:bg-midnight border border-steel/20 overflow-hidden">
                            <div className="w-3/4 h-full bg-forest transition-all duration-1000" />
                          </div>
                          <span className="text-forest font-display font-bold text-lg">B+</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-steel dark:text-mist font-mono text-sm">PROTEIN.CONTENT</span>
                          <span className="text-forest font-semibold">Excellent</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-steel dark:text-mist font-mono text-sm">SUGAR.LEVEL</span>
                          <span className="text-coral font-semibold">Moderate</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-steel dark:text-mist font-mono text-sm">ALLERGEN.ALERT</span>
                          <span className="text-amber font-semibold">Contains Nuts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Community Section */}
        <section id="community" className="py-24 px-6 lg:px-8 bg-mist/30 dark:bg-slate-blue/20">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6 text-midnight dark:text-pearl">
              Trusted by{' '}
              <span className="italic text-ocean relative">
                Real People
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-coral/60 transform -skew-x-12" />
              </span>
            </h2>
            <p className="text-lg text-steel dark:text-mist mb-16 max-w-3xl mx-auto leading-relaxed">
              Join thousands making informed healthcare decisions every day
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  quote: "VitalMatrix helped me avoid a 3-hour ER wait by showing real-time data from my community.",
                  author: "Sarah M.",
                  role: "Parent of two",
                  location: "Portland, OR",
                },
                {
                  quote: "The nutrition scanner is incredible. I finally understand what I'm really eating.",
                  author: "David L.",
                  role: "Fitness enthusiast",
                  location: "Austin, TX",
                },
                {
                  quote: "Privacy-first approach gives me confidence in sharing and accessing community health data.",
                  author: "Maria K.",
                  role: "Healthcare worker",
                  location: "Boston, MA",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-pearl dark:bg-slate-blue border-l-4 border-steel/20 hover:border-ocean transition-all duration-300 shadow-lg hover:shadow-xl text-left transform hover:-translate-y-1"
                  style={{ clipPath: index % 2 === 0 ? 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' : 'polygon(16px 0, 100% 0, 100% 100%, 0 100%)' }}
                >
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-coral fill-current" />
                      ))}
                    </div>
                    <p className="text-steel dark:text-mist mb-6 italic text-lg leading-relaxed">"{testimonial.quote}"</p>
                    <div className="border-t border-steel/10 dark:border-steel/20 pt-4">
                      <div className="font-display font-bold text-midnight dark:text-pearl">{testimonial.author}</div>
                      <div className="text-xs text-steel dark:text-mist">{testimonial.role}</div>
                      <div className="text-xs text-ocean flex items-center mt-1 font-mono">
                        <MapPin className="w-3 h-3 mr-1" />
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


          <div className="max-w-7xl mx-auto mb-24">
            {/* Loud but Sleek Docs Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-midnight via-slate-blue to-ocean text-pearl shadow-2xl transform hover:scale-[1.02] transition-all duration-700 group border-l-8 border-coral" style={{ clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 100%, 40px 100%)' }}>
              {/* Animated background elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-coral via-amber to-forest animate-pulse" />
                <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-coral via-amber to-forest animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-8 right-8 w-32 h-32 bg-coral/10 transform rotate-12 animate-float-slow border-l-4 border-coral/30" />
                <div className="absolute bottom-8 left-8 w-24 h-24 bg-forest/10 transform -rotate-12 animate-float-slow border-l-4 border-forest/30" style={{ animationDelay: '2s' }} />
                
                {/* Hexagonal tech pattern */}
                <div className="absolute top-16 left-1/4 w-16 h-16 bg-ocean/10 transform rotate-45 animate-pulse border-2 border-ocean/20" />
                <div className="absolute bottom-20 right-1/3 w-12 h-12 bg-amber/10 transform -rotate-45 animate-pulse border-2 border-amber/20" style={{ animationDelay: '1.5s' }} />
                
                {/* Circuit board lines */}
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 200">
                  <defs>
                    <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M0 20h40M20 0v40" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
                      <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#circuit)" />
                </svg>
              </div>
              
              {/* Matrix-style digital rain effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-coral via-transparent to-transparent opacity-60 animate-pulse shadow-lg shadow-coral/20" />
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-ocean via-transparent to-transparent opacity-40 animate-pulse shadow-lg shadow-ocean/20" style={{ animationDelay: '1s' }} />
                <div className="absolute top-0 left-3/4 w-0.5 h-full bg-gradient-to-b from-forest via-transparent to-transparent opacity-50 animate-pulse shadow-lg shadow-forest/20" style={{ animationDelay: '2s' }} />
                
                {/* Floating code symbols */}
                <div className="absolute top-16 left-16 text-coral/40 font-mono text-sm animate-float-slow bg-coral/5 px-2 py-1 border border-coral/20">{'{ API }'}</div>
                <div className="absolute top-32 right-24 text-ocean/40 font-mono text-sm animate-float-slow bg-ocean/5 px-2 py-1 border border-ocean/20" style={{ animationDelay: '1s' }}>{'< SDK />'}</div>
                <div className="absolute bottom-24 left-32 text-forest/40 font-mono text-sm animate-float-slow bg-forest/5 px-2 py-1 border border-forest/20" style={{ animationDelay: '2s' }}>{'[ DOCS ]'}</div>
                <div className="absolute top-1/2 right-16 text-amber/40 font-mono text-xs animate-float-slow bg-amber/5 px-1 py-0.5 border border-amber/20" style={{ animationDelay: '3s' }}>{'npm i'}</div>
                
                {/* Animated data flow */}
                <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-coral to-transparent opacity-30 animate-pulse" />
                <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-ocean to-transparent opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
              </div>

              <div className="relative z-10 p-12 lg:p-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="relative w-20 h-20 bg-gradient-to-br from-coral/20 to-coral/10 border-l-4 border-coral flex items-center justify-center mr-4 transform rotate-3 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500 shadow-lg">
                        <Brain className="w-10 h-10 text-coral animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-coral rounded-full animate-ping" />
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-ocean rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                      </div>
                      <div>
                        <span className="inline-flex items-center px-4 py-1 bg-gradient-to-r from-coral/20 to-coral/10 text-coral text-xs font-mono font-bold uppercase tracking-wider mb-2 animate-pulse border border-coral/30">
                          <span className="w-2 h-2 bg-coral rounded-full mr-2 animate-pulse" />
                          🚀 DEVELOPER.PORTAL
                        </span>
                        <h3 className="text-3xl lg:text-4xl font-display font-bold text-pearl group-hover:text-coral-light transition-colors duration-500">
                          Build with VitalMatrix
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-mist text-lg mb-8 leading-relaxed">
                      Comprehensive API documentation, integration guides, and developer resources to build the future of healthcare technology.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      {[
                        { icon: Zap, label: 'Quick Start', desc: '5-min setup', color: 'amber' },
                        { icon: Shield, label: 'Secure APIs', desc: 'Enterprise-grade', color: 'forest' },
                        { icon: Activity, label: 'Real-time', desc: 'Live updates', color: 'coral' },
                        { icon: Users, label: 'Community', desc: 'Active support', color: 'ocean' },
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3 group/item">
                          <div className={`w-12 h-12 bg-${feature.color}/20 border-l-4 border-${feature.color} flex items-center justify-center transform rotate-3 group-hover/item:rotate-0 group-hover/item:scale-110 transition-all duration-300 shadow-md relative`}>
                            <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                            <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 bg-${feature.color}/60 rounded-full animate-pulse`} />
                          </div>
                          <div>
                            <div className="text-pearl font-semibold text-sm">{feature.label}</div>
                            <div className="text-mist text-xs">{feature.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <a 
                      href="https://joeproai.mintlify.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group/btn inline-flex items-center bg-coral text-pearl px-8 py-4 font-bold text-lg hover:bg-coral-dark transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 font-mono uppercase tracking-wide relative overflow-hidden"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 16px 100%)' }}
                    >
                      {/* Button shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                      <Brain className="w-6 h-6 mr-3 group-hover/btn:animate-spin" />
                      EXPLORE DOCS
                      <ArrowRight className="w-5 h-5 ml-3 group-hover/btn:translate-x-2 group-hover/btn:scale-125 transition-all duration-300" />
                    </a>
                  </div>
                  
                  <div className="relative">
                    {/* Code preview mockup */}
                    <div className="bg-gradient-to-br from-midnight/90 to-slate-blue/80 border-l-4 border-coral shadow-2xl transform rotate-1 group-hover:rotate-0 transition-transform duration-500 backdrop-blur-sm" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)' }}>
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="flex space-x-2 mr-4">
                            <div className="w-3 h-3 bg-ruby rounded-full animate-pulse" />
                            <div className="w-3 h-3 bg-amber rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                            <div className="w-3 h-3 bg-forest rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                          </div>
                          <span className="text-mist font-mono text-sm mr-4">vitalmatrix-api.js</span>
                          <div className="flex items-center space-x-2 ml-auto">
                            <div className="w-2 h-2 bg-forest rounded-full animate-pulse" />
                            <span className="text-forest font-mono text-xs">CONNECTED</span>
                          </div>
                        </div>
                        
                        <div className="font-mono text-sm space-y-2">
                          <div className="text-lavender">import <span className="text-coral">{'{ VitalMatrix }'}</span> from <span className="text-forest">'@vitalmatrix/sdk'</span>;</div>
                          <div className="text-mist">// Initialize with your API key</div>
                          <div><span className="text-ocean">const</span> <span className="text-pearl">{'client'}</span> = <span className="text-coral">new</span> <span className="text-amber">{'VitalMatrix'}</span>{'('}{'{'};</div>
                          <div className="text-pearl ml-4">apiKey: <span className="text-forest">'your-api-key'</span>,</div>
                          <div className="text-pearl">{'}'});</div>
                          <div className="text-mist">// Get real-time health data</div>
                          <div><span className="text-ocean">const</span> <span className="text-pearl">{'data'}</span> = <span className="text-ocean">await</span> <span className="text-pearl">{'client'}</span>.<span className="text-coral">{'getHealthInsights'}</span>();</div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-steel/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-mist font-mono text-xs">API.STATUS:</span>
                              <span className="text-forest font-mono text-xs font-bold">ONLINE</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-coral rounded-full animate-pulse" />
                              <span className="text-coral font-mono text-xs">REAL-TIME</span>
                            </div>
                          </div>
                          <div className="mt-2 w-full h-1 bg-midnight/50 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-r from-coral via-ocean to-forest animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-coral/30 rounded-full animate-ping" />
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-ocean/30 rounded-full animate-pulse" />
                    <div className="absolute top-1/2 -left-6 w-4 h-4 bg-forest/40 transform rotate-45 animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/4 -right-6 w-3 h-3 bg-amber/40 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                  </div>
                </div>
                
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-coral via-ocean to-forest opacity-60" />
              </div>
              
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-coral/30 to-transparent" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-ocean/30 to-transparent" />
            </div>
          </div>

        {/* Final CTA Section */}
        <section className="py-24 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-8 text-midnight dark:text-pearl">
              Ready to Transform Your{' '}
              <span className="italic text-ocean relative">
                Healthcare Journey?
                <div className="absolute -bottom-3 left-0 right-0 h-2 bg-coral/40 transform -skew-x-12" />
              </span>
            </h2>
            <p className="text-lg text-steel dark:text-mist mb-12 leading-relaxed">
              Join a community that believes healthcare decisions should be informed, personal, and empowering.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <button 
                onClick={handleGetStarted}
                className="bg-ocean text-pearl px-8 py-3 font-semibold text-base hover:bg-ocean-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1" 
                style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 16px 100%)' }}
              >
                {currentUser ? 'Go to Dashboard' : 'Get Started Free'}
              </button>
              <button 
                onClick={handleTryNutriLens}
                className="border-2 border-ocean text-ocean px-8 py-3 font-semibold text-base hover:bg-ocean/5 transition-all duration-300 transform hover:-translate-y-1" 
                style={{ clipPath: 'polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%)' }}
              >
                {currentUser ? 'Try NutriLens' : 'Try NutriLens Free'}
              </button>
            </div>

            <p className="text-steel dark:text-mist text-sm font-mono uppercase tracking-wide">
              Privacy-first • Community-driven • Always free for basic features
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-steel/20 dark:border-steel/30 py-16 px-6 lg:px-8 bg-mist/20 dark:bg-slate-blue/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-6 md:mb-0">
                <svg width="40" height="20" viewBox="0 0 48 24">
                  <defs>
                    <linearGradient id="footerHeartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2b6cb0" />
                      <stop offset="50%" stopColor="#3182ce" />
                      <stop offset="100%" stopColor="#d69e2e" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 12 L8 12 L10 8 L12 16 L14 4 L16 20 L18 12 L48 12"
                    stroke="url(#footerHeartbeatGradient)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                  />
                </svg>
                <span className="text-xl font-display font-bold text-midnight dark:text-pearl tracking-tight">
                  VitalMatrix
                </span>
              </div>
              
              <div className="flex space-x-8 text-steel dark:text-mist text-sm font-medium font-mono uppercase tracking-wide">
                <a href="#" className="hover:text-ocean transition-colors duration-300">Privacy</a>
                <a href="#" className="hover:text-ocean transition-colors duration-300">Terms</a>
                <a href="#" className="hover:text-ocean transition-colors duration-300">Contact</a>
                <a href="#" className="hover:text-ocean transition-colors duration-300">Support</a>
              </div>
            </div>
            <div className="text-center text-steel dark:text-mist text-sm mt-12 font-mono">
              © 2024 VitalMatrix. Crafted with precision for better healthcare decisions.
            </div>
          </div>
        </footer>
      </div>
      </>
    );
};

const HomePage: React.FC = () => {
  return <HomePageContent />;
};

function App() {
  return (
    <AuthProvider>
      <IntercomProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthForm mode="login" />} />
            <Route path="/signup" element={<AuthForm mode="signup" />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/old-dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community-pulse" 
              element={
                <ProtectedRoute>
                  <CommunityPulse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/nutrilens" 
              element={
                <ProtectedRoute>
                  <NutriLens />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test-community-pulse" 
              element={<TestCommunityPulse />}
            />
            <Route 
              path="/basic-test" 
              element={<BasicTest />}
            />
          </Routes>
        </Router>
      </IntercomProvider>
    </AuthProvider>
  );
}

export default App;