import React, { useEffect, useState } from 'react';
import { 
  ActivityIcon, 
  HeartIcon,
  ScanIcon,
  UsersIcon,
  ShieldIcon,
  ZapIcon,
  BrainIcon,
  StarIcon,
  ArrowRightIcon,
  MenuIcon,
  XIcon,
  ChevronDownIcon
} from './icons';

// Direct port of the original Bolt.new export to work with Next.js
function VitalMatrixApp() {
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
      icon: HeartIcon,
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
      icon: ScanIcon,
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
  
  // Simple check icon component
  const CheckIcon = ({ className = "" }) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  };

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
                <ActivityIcon className="w-5 h-5 text-white" />
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
              {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-dark-bg-secondary/95 backdrop-blur-lg border-t border-electric-blue/20">
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
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
                  VitalMatrix:
                </span>{' '}
                <span className="text-white">
                  Reinventing Healthcare Navigation
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Make informed healthcare decisions with real-time community insights and AI-powered nutrition intelligence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-electric-blue to-neon-purple px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-300 text-white">
                  Get Started
                </button>
                <button className="border border-electric-blue/50 px-8 py-3 rounded-full font-semibold hover:bg-electric-blue/10 transition-all duration-300 flex items-center justify-center">
                  <span>Watch Demo</span> 
                  <span className="ml-2 h-5 w-5 rounded-full bg-electric-blue flex items-center justify-center">
                    <ArrowRightIcon className="h-3 w-3 text-black" />
                  </span>
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-electric-blue/20 to-neon-purple/20 blur-xl opacity-70 animate-pulse-gentle" />
              <div className="relative bg-dark-surface border border-electric-blue/30 rounded-2xl overflow-hidden shadow-2xl shadow-electric-blue/20">
                <div className="p-4 bg-dark-bg-secondary border-b border-electric-blue/20 flex items-center">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-hot-pink/80" />
                    <div className="w-3 h-3 rounded-full bg-neon-purple/80" />
                    <div className="w-3 h-3 rounded-full bg-electric-blue/80" />
                  </div>
                </div>
                <div className="p-5">
                  {/* Mock UI */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Nearest Emergency Rooms</div>
                    <div className="space-y-3">
                      {[
                        { name: 'Metro General Hospital', wait: '25-35 min', status: 'Moderate' },
                        { name: 'Riverside Medical Center', wait: '10-15 min', status: 'Low' },
                        { name: 'Central Health ER', wait: '45-60 min', status: 'High' },
                      ].map((er, i) => (
                        <div key={i} className="bg-dark-bg rounded-lg p-3 flex justify-between">
                          <div>
                            <div className="font-medium">{er.name}</div>
                            <div className="text-sm text-gray-400">Wait: {er.wait}</div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                            er.status === 'Low' ? 'bg-green-500/20 text-green-400' :
                            er.status === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {er.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-electric-blue to-neon-purple p-2 rounded-lg text-sm font-medium">
                    View All Nearby Facilities
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-dark-bg to-dark-bg-secondary relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-electric-blue/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] bg-neon-purple/10 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
                Powerful Features
              </span>{' '}
              for Healthcare Navigation
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of healthcare decision-making with our innovative platform features.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="bg-dark-surface border border-electric-blue/30 rounded-xl p-4 h-full">
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <button 
                      key={index}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-300 flex items-center ${
                        activeFeature === index 
                          ? `bg-${feature.color}/10 border border-${feature.color}/30` 
                          : 'hover:bg-dark-bg-secondary'
                      }`}
                      onClick={() => setActiveFeature(index)}
                    >
                      <div className={`p-2 rounded-lg mr-4 ${
                        activeFeature === index 
                          ? `bg-${feature.color}/20` 
                          : 'bg-dark-bg'
                      }`}>
                        <feature.icon className={`h-5 w-5 ${
                          activeFeature === index 
                            ? `text-${feature.color}` 
                            : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`font-medium ${
                          activeFeature === index 
                            ? `text-${feature.color}` 
                            : 'text-white'
                        }`}>
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-400">{feature.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="bg-dark-surface border border-electric-blue/30 rounded-xl overflow-hidden h-full">
                <div className="p-6">
                  <h3 className={`text-2xl font-bold mb-2 text-${features[activeFeature].color}`}>
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-gray-300 mb-6">
                    {features[activeFeature].description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {features[activeFeature].details.map((detail, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`p-1 rounded-full bg-${features[activeFeature].color}/20 mr-2 mt-0.5`}>
                          <CheckIcon className={`h-4 w-4 text-${features[activeFeature].color}`} />
                        </div>
                        <span className="text-sm text-gray-300">{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-electric-blue/10">
                    <button className={`bg-${features[activeFeature].color}/20 text-${features[activeFeature].color} px-6 py-2 rounded-full text-sm font-medium hover:bg-${features[activeFeature].color}/30 transition-colors`}>
                      Learn More About {features[activeFeature].title}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Pulse Section */}
      <section id="community" className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-bg">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-electric-blue/10 rounded-full text-electric-blue text-sm font-semibold mb-4">
                Community-Driven Insights
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
                  Community Pulse:
                </span>{' '}
                Real People, Real Insights
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Our community-driven platform revolutionizes healthcare navigation by providing real-time insights from people just like you.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: UsersIcon,
                    title: 'Crowdsourced Updates',
                    description: 'Get real-time facility conditions, wait times, and experiences shared by community members.',
                  },
                  {
                    icon: ShieldIcon,
                    title: 'Verified Information',
                    description: 'Our verification system ensures information accuracy while maintaining anonymity.',
                  },
                  {
                    icon: ZapIcon,
                    title: 'Instant Notifications',
                    description: 'Receive alerts about changing conditions at your preferred healthcare facilities.',
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex">
                    <div className="p-3 rounded-lg bg-electric-blue/10 text-electric-blue mr-4 self-start">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="bg-gradient-to-r from-electric-blue to-neon-purple px-6 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-300">
                Join Our Community
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-electric-blue/20 to-neon-purple/20 blur-xl opacity-70 animate-pulse-gentle" />
              <div className="relative bg-dark-surface border border-electric-blue/30 rounded-2xl overflow-hidden shadow-2xl shadow-electric-blue/20">
                <div className="p-4 bg-dark-bg-secondary border-b border-electric-blue/20">
                  <h3 className="font-semibold">Community Reports</h3>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    {
                      facility: 'Metro General Hospital',
                      time: '10 min ago',
                      comment: 'Currently 25-30 min wait for non-urgent cases. 3 doctors on staff. Clean facilities.',
                      user: 'HealthcareParent22',
                      status: 'Moderate',
                    },
                    {
                      facility: 'Riverside Urgent Care',
                      time: '25 min ago',
                      comment: 'Very quick service today! In and out in 20 minutes for a minor injury. Friendly staff.',
                      user: 'ActiveSenior75',
                      status: 'Low',
                    },
                    {
                      facility: 'Central Health ER',
                      time: '45 min ago',
                      comment: 'Very busy tonight. Multiple ambulances arrived. Consider alternatives if non-emergency.',
                      user: 'NursePractitioner',
                      status: 'High',
                    },
                  ].map((report, i) => (
                    <div key={i} className="bg-dark-bg rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{report.facility}</div>
                          <div className="text-xs text-gray-400">{report.time} • {report.user}</div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'Low' ? 'bg-green-500/20 text-green-400' :
                          report.status === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {report.status}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">{report.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NutriLens Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-dark-bg-secondary to-dark-bg relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-neon-purple/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-1/4 w-[250px] h-[250px] bg-electric-blue/10 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-neon-purple/20 to-electric-blue/20 blur-xl opacity-70 animate-pulse-gentle" />
              <div className="relative bg-dark-surface border border-neon-purple/30 rounded-2xl overflow-hidden shadow-2xl shadow-neon-purple/20">
                <div className="p-4 bg-dark-bg-secondary border-b border-neon-purple/20 flex items-center">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-hot-pink/80" />
                    <div className="w-3 h-3 rounded-full bg-neon-purple/80" />
                    <div className="w-3 h-3 rounded-full bg-electric-blue/80" />
                  </div>
                </div>
                <div className="p-5 relative">
                  {/* Phone mockup */}
                  <div className="aspect-[9/16] bg-dark-bg rounded-lg overflow-hidden relative">
                    {/* Product image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3/4 h-3/4 bg-gradient-to-br from-dark-surface to-dark-bg-secondary rounded-lg flex items-center justify-center">
                        <div className="w-20 h-20 rounded-lg bg-dark-bg flex items-center justify-center">
                          <div className="text-neon-purple text-xs text-center">Product<br />Image</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Scanner animation */}
                    <div className="absolute left-0 right-0 h-1 top-1/2 transform -translate-y-1/2 scan-animation z-10" />

                    {/* UI Elements */}
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-dark-bg to-transparent">
                      <div className="mb-3 flex justify-between items-center">
                        <div>
                          <div className="text-sm font-semibold text-white">Scanning...</div>
                          <div className="text-xs text-gray-400">Analyzing nutritional content</div>
                        </div>
                        <div className="bg-neon-purple/20 p-1.5 rounded-full">
                          <ScanIcon className="h-5 w-5 text-neon-purple" />
                        </div>
                      </div>
                      <div className="w-full bg-dark-surface h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-electric-blue to-neon-purple w-2/3 animate-pulse-gentle" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="inline-block px-4 py-2 bg-neon-purple/10 rounded-full text-neon-purple text-sm font-semibold mb-4">
                AI-Powered Nutrition
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-neon-purple to-electric-blue bg-clip-text text-transparent">
                  NutriLens Scanner:
                </span>{' '}
                Intelligent Food Analysis
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Our advanced AI instantly analyzes any food product to provide comprehensive nutrition information and personalized health insights.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: ScanIcon,
                    title: 'Instant Barcode Scanning',
                    description: 'Point your camera at any product barcode for immediate nutritional information.',
                  },
                  {
                    icon: BrainIcon,
                    title: 'AI Ingredient Analysis',
                    description: 'Our AI breaks down complex ingredient lists into easy-to-understand health information.',
                  },
                  {
                    icon: HeartIcon,
                    title: 'Personalized Health Scores',
                    description: 'Get customized nutrition recommendations based on your health profile and goals.',
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex">
                    <div className="p-3 rounded-lg bg-neon-purple/10 text-neon-purple mr-4 self-start">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="bg-gradient-to-r from-neon-purple to-electric-blue px-6 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-neon-purple/25 transition-all duration-300">
                Try NutriLens Scanner
              </button>
            </div>
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
                <ActivityIcon className="w-5 h-5 text-white" />
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
            © 2025 VitalMatrix. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx>{`
        .scan-animation {
          background: linear-gradient(to bottom, transparent, rgba(181, 55, 247, 0.3), transparent);
          background-size: 100% 200%;
          animation: scan 2s ease-in-out infinite;
        }
        
        @keyframes scan {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 0% 200%;
          }
        }

        .animate-circuit-flow {
          animation: circuit-flow 8s linear infinite;
        }

        @keyframes circuit-flow {
          0% {
            opacity: 0;
            transform: translateX(-100%);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(100%);
          }
        }

        .animate-circuit-flow-vertical {
          animation: circuit-flow-vertical 12s linear infinite;
        }

        @keyframes circuit-flow-vertical {
          0% {
            opacity: 0;
            transform: translateY(-100%);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  );
}

export default VitalMatrixApp;
