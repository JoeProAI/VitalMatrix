import React from 'react';
import { UsersIcon, MessageSquareIcon, AlertCircleIcon, ClockIcon, ThumbsUpIcon, StarIcon } from './icons';

const BoltCommunitySection: React.FC = () => {
  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Healthcare Professional',
      content: 'Community Pulse has transformed how we communicate wait times and facility conditions to patients.',
      avatar: '👩‍⚕️',
      rating: 5,
    },
    {
      name: 'Jordan Taylor',
      role: 'Parent of Three',
      content: 'Saved us hours of waiting with real-time updates from other parents. Game-changer for family health!',
      avatar: '👨‍👩‍👧',
      rating: 5,
    },
    {
      name: 'Samira Patel',
      role: 'Chronic Condition Patient',
      content: 'I rely on Community Pulse for making informed decisions about which facility to visit.',
      avatar: '🧠',
      rating: 4,
    },
  ];

  const insights = [
    { 
      icon: ClockIcon, 
      label: 'Wait Time', 
      value: '45 min', 
      delta: '-15 min', 
      trend: 'down',
      facility: 'City General Hospital'
    },
    { 
      icon: UsersIcon, 
      label: 'Crowding', 
      value: 'Moderate', 
      delta: '+5%', 
      trend: 'up',
      facility: 'Westside Urgent Care'
    },
    { 
      icon: AlertCircleIcon, 
      label: 'Alert', 
      value: 'Staff Shortage', 
      delta: 'New', 
      trend: 'neutral',
      facility: 'Eastview Medical Center'
    }
  ];

  return (
    <section id="community" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-electric-blue/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-neon-purple/20 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
              Community Pulse
            </span>{' '}
            in Action
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real-time insights from real people, creating a community-powered healthcare navigation system
          </p>
        </div>

        {/* Live Insights Display */}
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-6 text-center">Live Community Insights</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {insights.map((insight, i) => (
              <div 
                key={i} 
                className="bg-dark-surface/80 border border-white/10 rounded-xl p-6 backdrop-blur-sm overflow-hidden relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-electric-blue/20 mr-3">
                      <insight.icon className="w-5 h-5 text-electric-blue" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{insight.label}</p>
                      <p className="text-lg font-bold text-white">{insight.value}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium
                    ${insight.trend === 'down' ? 'bg-green-500/20 text-green-400' : 
                      insight.trend === 'up' ? 'bg-red-500/20 text-red-400' : 
                      'bg-gray-500/20 text-gray-400'}
                  `}>
                    {insight.delta}
                  </div>
                </div>
                <p className="text-gray-400 text-sm">{insight.facility}</p>
                
                {/* Live pulse animation */}
                <div className="absolute bottom-0 left-0 right-0 h-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent opacity-70 pulse-animation"></div>
                </div>

                {/* Recent updates */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-via-neon-purple/30 flex items-center justify-center text-xs">👤</div>
                    <p className="text-xs text-gray-400">Updated 3 min ago by Community Member</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Testimonials */}
        <div>
          <h3 className="text-2xl font-semibold mb-8 text-center">Community Voices</h3>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-gradient-to-br from-dark-surface/90 to-dark-surface/70 border border-white/10 p-6 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center mr-3 text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-sm text-electric-blue">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{testimonial.content}</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mt-12">
          {[
            { label: 'Active Users', value: '50K+', icon: UsersIcon },
            { label: 'Daily Reports', value: '3,720', icon: MessageSquareIcon },
            { label: 'Facilities Covered', value: '1,245', icon: AlertCircleIcon },
            { label: 'User Satisfaction', value: '96%', icon: ThumbsUpIcon },
          ].map((stat, i) => (
            <div key={i} className="bg-dark-surface/50 p-6 rounded-xl border border-white/5">
              <div className="inline-block p-3 rounded-full bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 mb-3">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </section>
  );
};

export default BoltCommunitySection;
