import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Heart, 
  Activity, 
  Clock, 
  Shield, 
  Bell,
  Settings,
  BarChart3,
  Calendar,
  MapPin,
  Scan,
  Users,
  TrendingUp,
  Sun,
  Moon
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set dark mode as default
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: Heart, label: 'Health Score', value: '92%', color: 'coral', trend: '+5%' },
    { icon: Activity, label: 'Active Days', value: '28', color: 'forest', trend: '+12%' },
    { icon: Clock, label: 'Avg Wait Time', value: '15min', color: 'ocean', trend: '-8min' },
    { icon: Users, label: 'Community Reports', value: '156', color: 'lavender', trend: '+23' },
  ];

  const recentActivity = [
    { icon: Scan, action: 'Scanned nutrition label', item: 'Organic Granola Bar', time: '2 hours ago', status: 'success' },
    { icon: MapPin, action: 'Checked ER wait time', item: 'City General Hospital', time: '5 hours ago', status: 'info' },
    { icon: Heart, action: 'Updated health profile', item: 'Added allergies', time: '1 day ago', status: 'success' },
    { icon: Users, action: 'Shared community report', item: 'Urgent Care Review', time: '2 days ago', status: 'info' },
  ];

  return (
    <div className="min-h-screen bg-pearl dark:bg-midnight text-midnight dark:text-pearl transition-colors duration-300">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-20" />
        <div className="absolute top-32 left-16 w-64 h-32 bg-ocean/5 dark:bg-ocean/10 transform rotate-12 animate-float-slow" />
        <div className="absolute top-64 right-24 w-48 h-48 bg-coral/5 dark:bg-coral/10 transform -rotate-6 animate-float-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-pearl/95 dark:bg-midnight/95 backdrop-blur-sm border-b border-steel/10 dark:border-steel/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            <div className="flex items-center space-x-4">
              <svg width="48" height="24" viewBox="0 0 48 24">
                <defs>
                  <linearGradient id="dashboardHeartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2b6cb0" />
                    <stop offset="50%" stopColor="#3182ce" />
                    <stop offset="100%" stopColor="#d69e2e" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 12 L8 12 L10 8 L12 16 L14 4 L16 20 L18 12 L48 12"
                  stroke="url(#dashboardHeartbeatGradient)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse drop-shadow-sm"
                />
              </svg>
              <span className="text-xl font-display font-bold text-midnight dark:text-pearl tracking-tight">
                VitalMatrix
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-steel dark:text-mist hover:text-ocean transition-colors duration-300"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-ocean/10 dark:bg-ocean/20 border-l-4 border-ocean flex items-center justify-center transform rotate-3">
                  <User className="w-6 h-6 text-ocean" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-midnight dark:text-pearl">
                    {currentUser?.email}
                  </p>
                  <p className="text-xs text-steel dark:text-mist">
                    Member since {currentUser?.metadata.creationTime ? 
                      new Date(currentUser.metadata.creationTime).toLocaleDateString() : 
                      'today'
                    }
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center space-x-2 bg-ruby/10 hover:bg-ruby/20 text-ruby px-4 py-2 font-medium transition-all duration-300 disabled:opacity-50"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)' }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-ruby border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-midnight dark:text-pearl mb-2">
            Welcome back to your{' '}
            <span className="italic text-ocean relative">
              Health Dashboard
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-coral/60 transform -skew-x-12" />
            </span>
          </h1>
          <p className="text-steel dark:text-mist">
            Track your health journey and stay connected with your community
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-pearl dark:bg-slate-blue border-l-4 border-steel/20 hover:border-ocean transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              style={{ clipPath: index % 2 === 0 ? 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' : 'polygon(16px 0, 100% 0, 100% 100%, 0 100%)' }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}/10 dark:bg-${stat.color}/20 border-l-4 border-${stat.color} flex items-center justify-center transform rotate-3`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <span className={`text-xs font-mono px-2 py-1 bg-${stat.color}/10 text-${stat.color} font-bold`}>
                    {stat.trend}
                  </span>
                </div>
                <div className="text-2xl font-display font-bold text-midnight dark:text-pearl mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-steel dark:text-mist font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-pearl dark:bg-slate-blue border-l-4 border-ocean shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)' }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-midnight dark:text-pearl">
                    Recent Activity
                  </h2>
                  <button className="text-ocean hover:text-ocean-dark font-medium text-sm">
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-mist/50 dark:bg-midnight/30 border-l-4 border-steel/20 hover:border-ocean transition-all duration-300"
                    >
                      <div className={`w-10 h-10 ${activity.status === 'success' ? 'bg-forest/10 border-forest' : 'bg-ocean/10 border-ocean'} border-l-4 flex items-center justify-center transform rotate-3`}>
                        <activity.icon className={`w-5 h-5 ${activity.status === 'success' ? 'text-forest' : 'text-ocean'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-midnight dark:text-pearl font-medium">
                          {activity.action}
                        </p>
                        <p className="text-steel dark:text-mist text-sm">
                          {activity.item}
                        </p>
                      </div>
                      <div className="text-xs text-steel dark:text-mist font-mono">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-pearl dark:bg-slate-blue border-l-4 border-coral shadow-lg" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%)' }}>
              <div className="p-6">
                <h3 className="text-lg font-display font-bold text-midnight dark:text-pearl mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <a 
                    href="https://vitalmatrix-app.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-coral/10 hover:bg-coral/20 text-coral transition-colors duration-300"
                  >
                    <Scan className="w-5 h-5" />
                    <span className="font-medium">Scan Nutrition</span>
                  </a>
                  <button className="w-full flex items-center space-x-3 p-3 bg-ocean/10 hover:bg-ocean/20 text-ocean transition-colors duration-300">
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">Find Healthcare</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 bg-forest/10 hover:bg-forest/20 text-forest transition-colors duration-300">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Community Reports</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Health Insights */}
            <div className="bg-pearl dark:bg-slate-blue border-l-4 border-lavender shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)' }}>
              <div className="p-6">
                <h3 className="text-lg font-display font-bold text-midnight dark:text-pearl mb-4">
                  Health Insights
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-steel dark:text-mist text-sm">Overall Health Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-mist dark:bg-midnight border border-steel/20 overflow-hidden">
                        <div className="w-4/5 h-full bg-forest transition-all duration-1000" />
                      </div>
                      <span className="text-forest font-bold text-sm">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-steel dark:text-mist text-sm">Nutrition Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-mist dark:bg-midnight border border-steel/20 overflow-hidden">
                        <div className="w-3/4 h-full bg-coral transition-all duration-1000" />
                      </div>
                      <span className="text-coral font-bold text-sm">B+</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-steel dark:text-mist text-sm">Community Engagement</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-mist dark:bg-midnight border border-steel/20 overflow-hidden">
                        <div className="w-5/6 h-full bg-ocean transition-all duration-1000" />
                      </div>
                      <span className="text-ocean font-bold text-sm">High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};