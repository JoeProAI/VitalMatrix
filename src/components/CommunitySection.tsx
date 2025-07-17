import React, { useEffect, useState } from 'react';

const CommunitySection = () => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Sample data for visualization
  const facilities = [
    { name: "Central Hospital", waitTime: "25 min", status: "Moderate", color: "from-yellow-500 to-orange-500" },
    { name: "Westside Urgent Care", waitTime: "10 min", status: "Low", color: "from-green-400 to-green-600" },
    { name: "Memorial Emergency", waitTime: "45 min", status: "High", color: "from-red-500 to-red-700" },
    { name: "Northgate Medical", waitTime: "15 min", status: "Low", color: "from-green-400 to-green-600" },
    { name: "Eastside Health Center", waitTime: "30 min", status: "Moderate", color: "from-yellow-500 to-orange-500" },
  ];
  
  const testimonials = [
    {
      content: "VitalMatrix saved me hours of waiting. I checked the Community Pulse and went to a facility with shorter wait times.",
      author: "Sarah K.",
      role: "Parent",
      avatar: "SK"
    },
    {
      content: "The real-time updates from other users helped me avoid a crowded ER and find a better option nearby.",
      author: "Michael T.",
      role: "Patient",
      avatar: "MT"
    },
    {
      content: "I love contributing to Community Pulse. It feels good knowing my updates help others make informed decisions.",
      author: "Jamie L.",
      role: "Nurse & User",
      avatar: "JL"
    }
  ];

  return (
    <section id="community" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Background accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-electric-blue to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-electric-blue/10 text-electric-blue text-sm font-medium mb-4">
            Community-Driven Healthcare
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
              Community Pulse
            </span> Insights
          </h2>
          
          <p className="text-gray-300 max-w-2xl mx-auto">
            Real people sharing real-time information about emergency rooms and urgent care facilities to help you make informed decisions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side: Features and Benefits */}
          <div className={`transition-all duration-1000 ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <h3 className="text-2xl font-bold mb-6">How Community Pulse Works</h3>
            
            <div className="space-y-6 mb-8">
              {[
                {
                  title: "Community Reports",
                  description: "Users report current wait times, crowding levels, and facility conditions in real-time.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  )
                },
                {
                  title: "Verification System",
                  description: "Multiple reports are verified and aggregated to provide accurate insights.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )
                },
                {
                  title: "Smart Recommendations",
                  description: "Get personalized facility recommendations based on your location and needs.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  )
                }
              ].map((item, i) => (
                <div key={i} className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-electric-blue/20 text-electric-blue">
                      {item.icon}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                    <p className="mt-1 text-gray-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 rounded-full bg-gradient-to-r from-electric-blue to-neon-purple text-white font-medium hover:shadow-glow transition-all duration-300">
                Share Your Experience
              </button>
              <button className="px-6 py-3 rounded-full border border-electric-blue/50 text-white font-medium hover:bg-electric-blue/10 transition-all duration-300">
                Explore Local Insights
              </button>
            </div>
          </div>
          
          {/* Right side: Live Visualization */}
          <div className={`transition-all duration-1000 delay-300 ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="bg-dark-surface border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h4 className="font-semibold">Live Community Pulse</h4>
                <div className="flex items-center text-sm text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  Live Data
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Facility Name</span>
                    <span>Wait Time</span>
                  </div>
                  
                  <div className="space-y-3">
                    {facilities.map((facility, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-dark-bg rounded-lg border border-gray-800">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${facility.color} mr-3`}></div>
                          <span>{facility.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold mr-2">{facility.waitTime}</span>
                          <span className={`
                            text-xs px-2 py-1 rounded-full 
                            ${facility.status === 'Low' ? 'bg-green-900/30 text-green-400' : 
                              facility.status === 'Moderate' ? 'bg-yellow-900/30 text-yellow-400' : 
                              'bg-red-900/30 text-red-400'}
                          `}>
                            {facility.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-400">
                  Last updated: Just now • Based on 43 community reports
                </div>
              </div>
            </div>
            
            {/* Testimonials */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {testimonials.map((testimonial, i) => (
                <div 
                  key={i} 
                  className="bg-dark-surface border border-gray-800 p-4 rounded-xl"
                  style={{ transitionDelay: `${i * 150 + 500}ms` }}
                >
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-electric-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-300 mb-3">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-electric-blue to-neon-purple flex items-center justify-center text-xs font-bold">
                      {testimonial.avatar}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium">{testimonial.author}</div>
                      <div className="text-xs text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
