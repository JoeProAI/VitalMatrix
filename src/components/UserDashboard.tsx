import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserProfile, 
  getUserHealthInsights, 
  getUserHealthcareVisits, 
  getUserNutritionEntries,
  createUserProfile,
  UserProfile 
} from '../services/userProfileService';
import { 
  User, 
  Heart, 
  Activity, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  Utensils,
  Award,
  Target,
  Clock,
  Home,
  Scan,
  Users,
  ArrowLeft
} from 'lucide-react';

interface DashboardStats {
  healthScore: number;
  nutritionScore: number;
  totalVisits: number;
  totalScans: number;
  streakDays: number;
}

const UserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'insights'>('overview');

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const [userProfile, userInsights] = await Promise.all([
        getUserProfile(currentUser.uid),
        getUserHealthInsights(currentUser.uid)
      ]);

      setProfile(userProfile);
      setInsights(userInsights);
      
      if (userProfile) {
        setStats({
          healthScore: userInsights.healthScore,
          nutritionScore: userInsights.nutritionScore,
          totalVisits: userProfile.stats.totalFacilityVisits,
          totalScans: userProfile.stats.totalNutritionScans,
          streakDays: userProfile.stats.streakDays,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Create the user profile
      const newProfile = await createUserProfile(currentUser);
      setProfile(newProfile);
      
      // Load insights for the new profile
      const userInsights = await getUserHealthInsights(currentUser.uid);
      setInsights(userInsights);
      
      setStats({
        healthScore: userInsights.healthScore,
        nutritionScore: userInsights.nutritionScore,
        totalVisits: newProfile.stats.totalFacilityVisits,
        totalScans: newProfile.stats.totalNutritionScans,
        streakDays: newProfile.stats.streakDays,
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121827] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#3b82f6] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    // Temporary: Create a mock profile to bypass the blocking issue
    const mockProfile = {
      uid: currentUser?.uid || '',
      email: currentUser?.email || '',
      displayName: currentUser?.displayName || 'User',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      healthProfile: {},
      nutritionProfile: {},
      preferences: {
        maxTravelDistance: 25,
        notificationsEnabled: true,
        privacyLevel: 'friends' as const,
        shareHealthData: false,
        shareNutritionData: false,
      },
      stats: {
        totalReviews: 0,
        totalFacilityVisits: 0,
        totalNutritionScans: 0,
        averageRatingGiven: 0,
        helpfulVotes: 0,
        streakDays: 0,
      },
    };
    
    // Set the mock profile and continue
    setProfile(mockProfile);
    setStats({
      healthScore: 50,
      nutritionScore: 50,
      totalVisits: 0,
      totalScans: 0,
      streakDays: 0,
    });
    
    // Still show the create profile option but don't block access
    return (
      <div className="min-h-screen bg-[#121827] flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Welcome to VitalMatrix!</h2>
          <p className="text-gray-400 mb-4">Temporary access granted - profile creation in progress...</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#3b82f6] text-white px-6 py-2 rounded-lg hover:bg-[#2563eb] transition-colors mr-4"
          >
            Continue to Dashboard
          </button>
          <button 
            onClick={createProfile}
            className="bg-[#10b981] text-white px-6 py-2 rounded-lg hover:bg-[#059669] transition-colors"
          >
            Try Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121827] text-white">
      {/* Navigation Header */}
      <div className="bg-[#1e293b] border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 hover:shadow-lg hover:shadow-blue-500/20 p-2 rounded-lg"
              >
                <Home className="h-5 w-5" />
                <span className="hidden sm:block">Home</span>
              </button>
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-[#3b82f6] mr-3" />
                <h1 className="text-xl font-bold">VitalMatrix Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/nutrilens')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 p-2 rounded-lg"
              >
                <Scan className="h-5 w-5" />
                <span className="hidden sm:block">NutriLens</span>
              </button>
              <button
                onClick={() => navigate('/community-pulse')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 p-2 rounded-lg"
              >
                <Users className="h-5 w-5" />
                <span className="hidden sm:block">Community Pulse</span>
              </button>
              <div className="text-right">
                <p className="text-sm font-medium">{profile.displayName}</p>
                <p className="text-xs text-gray-400">{profile.email}</p>
              </div>
              {profile.photoURL && (
                <img 
                  src={profile.photoURL} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#1e293b] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 bg-[#1e293b] rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#233044]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'nutrition'
                  ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#233044]'
              }`}
            >
              Nutrition
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'insights'
                  ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#233044]'
              }`}
            >
              Insights
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="Health Score"
                value={stats?.healthScore || 0}
                suffix="/100"
                icon={Heart}
                color="text-green-400"
                bgColor="bg-green-400/10"
              />
              <StatCard
                title="Nutrition Score"
                value={stats?.nutritionScore || 0}
                suffix="/100"
                icon={Utensils}
                color="text-blue-400"
                bgColor="bg-blue-400/10"
              />
              <StatCard
                title="Facility Visits"
                value={stats?.totalVisits || 0}
                icon={MapPin}
                color="text-purple-400"
                bgColor="bg-purple-400/10"
              />
              <StatCard
                title="Nutrition Scans"
                value={stats?.totalScans || 0}
                icon={Activity}
                color="text-orange-400"
                bgColor="bg-orange-400/10"
              />
              <StatCard
                title="Streak Days"
                value={stats?.streakDays || 0}
                icon={Target}
                color="text-yellow-400"
                bgColor="bg-yellow-400/10"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1e293b] rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionCard
                  title="Find Healthcare"
                  description="Search for nearby facilities and check wait times"
                  icon={MapPin}
                  href="/community-pulse"
                />
                <QuickActionCard
                  title="Scan Nutrition"
                  description="Analyze food with AI or scan barcodes"
                  icon={Utensils}
                  href="/nutrilens"
                />
                <QuickActionCard
                  title="Health Profile"
                  description="Update your health information and preferences"
                  icon={User}
                  href="/profile"
                />
              </div>
            </div>

            {/* Recent Activity */}
            {insights && (
              <div className="bg-[#1e293b] rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Health Insights</h3>
                <div className="space-y-3">
                  {insights.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-[#3b82f6] rounded-full mt-2"></div>
                      <p className="text-gray-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}



        {activeTab === 'nutrition' && (
          <div className="space-y-6">
            <div className="bg-[#1e293b] rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Nutrition Overview</h3>
              {insights?.nutritionTrends && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#3b82f6]">{insights.nutritionTrends.avgDailyCalories}</p>
                    <p className="text-gray-400">Avg Daily Calories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#3b82f6]">{insights.nutritionTrends.avgDailyProtein}g</p>
                    <p className="text-gray-400">Avg Daily Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#3b82f6]">{insights.nutritionTrends.scanFrequency}</p>
                    <p className="text-gray-400">Scans This Week</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-[#1e293b] rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">AI Health Insights</h3>
              <div className="space-y-4">
                <div className="bg-[#121827] rounded-lg p-4">
                  <h4 className="font-medium text-[#3b82f6] mb-2">Health Score Analysis</h4>
                  <p className="text-gray-300">
                    Your health score of {stats?.healthScore}/100 is based on your activity, 
                    facility visits, and nutrition tracking consistency.
                  </p>
                </div>
                <div className="bg-[#121827] rounded-lg p-4">
                  <h4 className="font-medium text-[#3b82f6] mb-2">Personalized Recommendations</h4>
                  <ul className="space-y-2">
                    {insights?.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-gray-300 flex items-start">
                        <span className="text-[#3b82f6] mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, suffix, icon: Icon, color, bgColor }) => (
  <div className="bg-[#1e293b] rounded-lg p-6 hover:bg-[#233044] transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105 border border-transparent hover:border-blue-500/20">
    <div className="flex items-center">
      <div className={`${bgColor} rounded-lg p-3 transition-all duration-300 hover:shadow-lg hover:shadow-current/20`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
    <div className="mt-4">
      <p className="text-2xl font-bold text-white">
        {value}
        {suffix && <span className="text-lg text-gray-400">{suffix}</span>}
      </p>
      <p className="text-gray-400">{title}</p>
    </div>
  </div>
);

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon: Icon, href }) => (
  <a
    href={href}
    className="block bg-[#121827] rounded-lg p-4 hover:bg-[#0f172a] transition-all duration-300 border border-gray-700 hover:border-[#3b82f6] hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105 cursor-pointer"
  >
    <div className="flex items-center mb-2">
      <Icon className="h-5 w-5 text-[#3b82f6] mr-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20" />
      <h4 className="font-medium text-white">{title}</h4>
    </div>
    <p className="text-sm text-gray-400">{description}</p>
  </a>
);

export default UserDashboard;
