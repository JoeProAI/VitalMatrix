import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      color: 'electric-blue',
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
      color: 'neon-purple',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg to-dark-bg-secondary text-white overflow-x-hidden">
      {/* Matrix Animation Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Animated circuit lines */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-electric-blue/20 to-transparent animate-circuit-flow"
              style={{
                top: `${20 + i * 15}%`,
                width: '100%',
                animationDelay: `${i * 2}s`,
                animationDuration: '8s'
              }}
            />
          ))}
          {[...Array(4)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute w-px bg-gradient-to-b from-transparent via-neon-purple/15 to-transparent animate-circuit-flow-vertical"
              style={{
                left: `${25 + i * 20}%`,
                height: '100%',
                animationDelay: `${i * 3}s`,
                animationDuration: '12s'
              }}
            />
          ))}
        </div>
        
      </div>
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-dark-bg/80 backdrop-blur-lg border-b border-electric-blue/20' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
                VitalMatrix
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-electric-blue transition-colors">Features</a>
              <a href="#community" className="hover:text-electric-blue transition-colors">Community</a>
              <a href="#about" className="hover:text-electric-blue transition-colors">About</a>
              <button className="bg-gradient-to-r from-electric-blue to-neon-purple px-6 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-300">
                Get Started
              </button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-dark-surface/95 backdrop-blur-lg border-t border-electric-blue/20">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block hover:text-electric-blue transition-colors">Features</a>
              <a href="#community" className="block hover:text-electric-blue transition-colors">Community</a>
              <a href="#about" className="block hover:text-electric-blue transition-colors">About</a>
              <button className="w-full bg-gradient-to-r from-electric-blue to-neon-purple px-6 py-2 rounded-full font-medium">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-electric-blue/20 to-neon-purple/20 border border-electric-blue/30 rounded-full text-sm font-medium text-electric-blue mb-8">
              🚀 Healthcare Navigation
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
              <ArrowRight className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border border-electric-blue/50 px-8 py-4 rounded-full font-semibold text-lg hover:bg-electric-blue/10 hover:border-electric-blue transition-all duration-300">
              Watch Demo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto text-center">
            {[
              { icon: Users, label: 'Community Powered', value: '50K+' },
              { icon: Zap, label: 'Real-Time Data', value: '24/7' },
              { icon: Brain, label: 'AI Insights', value: '99.9%' },
              { icon: Shield, label: 'Privacy First', value: '100%' },
            ].map((stat, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-electric-blue" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-electric-blue" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">
              Powered by{' '}
              <span className="bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
                Innovation
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Two revolutionary features that put the power of informed healthcare decisions in your hands
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-gradient-to-br from-dark-surface to-dark-bg border border-${feature.color}/30 rounded-2xl p-8 hover:border-${feature.color}/60 transition-all duration-500 hover:shadow-2xl hover:shadow-${feature.color}/20 cursor-pointer hover:-translate-y-2`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                {/* Community Pulse Animation */}
                {feature.title === 'Community Pulse' && (
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <div className="relative">
                      <div className="w-4 h-4 bg-electric-blue rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-4 h-4 bg-electric-blue rounded-full animate-pulse-ring" />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r from-${feature.color} to-${feature.color}/60 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{feature.title}</h3>
                    <p className={`text-${feature.color} font-medium`}>{feature.subtitle}</p>
                  </div>
                </div>

                {/* NutriLens Scanner Animation */}
                {feature.title === 'NutriLens Scanner' && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-barcode-scan shadow-lg shadow-red-500/50" 
                         style={{ boxShadow: '0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444' }} />
                  </div>
                )}

                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <ul className="space-y-3">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center text-gray-400">
                      <div className={`w-2 h-2 bg-${feature.color} rounded-full mr-3 group-hover:animate-pulse`} />
                      {detail}
                    </li>
                  ))}
                </ul>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className={`w-6 h-6 text-${feature.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Impact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-dark-bg to-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold mb-4">
                  Real-Time Community{' '}
                  <span className="text-electric-blue">Intelligence</span>
                </h3>
                <p className="text-gray-300 text-lg">
                  Get instant access to live healthcare facility data reported by real people in your community. No more guessing about wait times or facility conditions.
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'Average Wait Time Reduction', value: '45%' },
                  { label: 'Community Reports Daily', value: '2.3K' },
                  { label: 'Accuracy Rate', value: '96.8%' },
                ].map((metric, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-dark-bg/50 rounded-lg border border-electric-blue/20">
                    <span className="text-gray-300">{metric.label}</span>
                    <span className="text-2xl font-bold text-electric-blue">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-dark-surface to-dark-bg border border-neon-purple/30 rounded-2xl p-6 backdrop-blur-lg">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-neon-purple mb-2">NutriLens Analysis</h4>
                  <div className="bg-dark-bg rounded-lg p-4 border border-neon-purple/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Health Score</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-dark-bg-secondary rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-gradient-to-r from-hot-pink to-neon-purple rounded-full animate-pulse" />
                        </div>
                        <span className="text-neon-purple font-bold">B+</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Protein</span>
                        <span className="text-green-400">Excellent</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sugar Content</span>
                        <span className="text-yellow-400">Moderate</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Allergens</span>
                        <span className="text-red-400">Contains Nuts</span>
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
      <section id="community" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-electric-blue to-hot-pink bg-clip-text text-transparent">
              Communities
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join thousands of people making smarter healthcare decisions every day
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                quote: "VitalMatrix helped me avoid a 3-hour ER wait by showing real-time data from my community.",
                author: "Sarah M.",
                role: "Parent of two",
                rating: 5,
              },
              {
                quote: "The nutrition scanner is incredible. I finally understand what I'm really eating.",
                author: "David L.",
                role: "Fitness enthusiast",
                rating: 5,
              },
              {
                quote: "Privacy-first approach gives me confidence in sharing and accessing community health data.",
                author: "Maria K.",
                role: "Healthcare worker",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-dark-surface to-dark-bg border border-electric-blue/20 rounded-2xl p-6 hover:border-electric-blue/40 transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/10"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-hot-pink fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-dark-bg via-dark-surface to-dark-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Ready to Transform Your{' '}
            <span className="bg-gradient-to-r from-electric-blue via-neon-purple to-hot-pink bg-clip-text text-transparent">
              Healthcare Journey?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the revolution in healthcare navigation. Make informed decisions with real-time community insights and AI-powered nutrition intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="bg-gradient-to-r from-electric-blue to-neon-purple px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-electric-blue/30 transition-all duration-300 animate-pulse-gentle">
              Get Started Free
            </button>
            <button className="border border-electric-blue/50 px-8 py-4 rounded-full font-semibold text-lg hover:bg-electric-blue/10 hover:border-electric-blue transition-all duration-300">
              Schedule Demo
            </button>
          </div>

          <p className="text-gray-400 text-sm">
            Privacy-first • Community-driven • Always free for basic features
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-electric-blue/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
                VitalMatrix
              </span>
            </div>
            
            <div className="flex space-x-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-electric-blue transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-electric-blue transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-electric-blue transition-colors">Contact</a>
              <a href="#" className="hover:text-electric-blue transition-colors">Support</a>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm mt-8">
            © 2024 VitalMatrix. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;