import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserProfile, 
  updateUserProfile, 
  createUserProfile,
  getUserGoals,
  createUserGoal,
  getUserHealthInsights,
  markInsightAsRead
} from '../firebase/userProfileService';
import { UserProfile as UserProfileType, UserGoal, HealthInsight } from '../types/userProfile';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Target, 
  AlertTriangle, 
  Info,
  Shield
} from 'lucide-react';

const UserProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'goals' | 'insights'>('profile');
  
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    allergies: [] as string[],
    dietaryRestrictions: [] as string[]
  });

  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      let userProfile = await getUserProfile(currentUser.uid);
      
      if (!userProfile) {
        await createUserProfile(currentUser.uid, {
          email: currentUser.email || '',
          displayName: currentUser.displayName || ''
        });
        userProfile = await getUserProfile(currentUser.uid);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        setEditForm({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          allergies: userProfile.allergies || [],
          dietaryRestrictions: userProfile.dietaryRestrictions || []
        });
      }
      
      const userGoals = await getUserGoals(currentUser.uid);
      setGoals(userGoals);
      
      const userInsights = await getUserHealthInsights(currentUser.uid, 10);
      setInsights(userInsights);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !profile) return;
    
    try {
      setSaving(true);
      const updates: Partial<UserProfileType> = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        allergies: editForm.allergies,
        dietaryRestrictions: editForm.dietaryRestrictions
      };
      
      await updateUserProfile(currentUser.uid, updates);
      await loadUserData();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !editForm.allergies.includes(newAllergy.trim())) {
      setEditForm(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setEditForm(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-midnight">
        <div className="text-pearl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight text-pearl p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-blue/20 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-ocean/20 rounded-full flex items-center justify-center">
                <User size={32} className="text-ocean" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {profile?.firstName && profile?.lastName 
                    ? `${profile.firstName} ${profile.lastName}` 
                    : profile?.displayName || 'User Profile'}
                </h1>
                <p className="text-mist">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-ocean/20 hover:bg-ocean/30 rounded-lg transition-colors"
            >
              {isEditing ? <X size={16} /> : <Edit3 size={16} />}
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-slate-blue/10 rounded-lg p-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'insights', label: 'Insights', icon: Info }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-ocean/20 text-ocean' 
                  : 'text-mist hover:text-pearl hover:bg-slate-blue/10'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-slate-blue/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 bg-midnight border border-steel/30 rounded-md focus:border-ocean focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 bg-midnight border border-steel/30 rounded-md focus:border-ocean focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 bg-ocean hover:bg-ocean/80 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 px-6 py-2 bg-steel/20 hover:bg-steel/30 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-mist">Name:</span>
                  <p className="font-medium">
                    {profile?.firstName && profile?.lastName 
                      ? `${profile.firstName} ${profile.lastName}` 
                      : 'Not provided'}
                  </p>
                </div>
                <div>
                  <span className="text-mist">Email:</span>
                  <p className="font-medium">{profile?.email}</p>
                </div>
              </div>
            )}
          </div>
        )}



        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="bg-slate-blue/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Health Goals</h2>
            <div className="text-center text-mist py-8">
              <Target size={48} className="mx-auto mb-4 opacity-50" />
              <p>Goals feature coming soon!</p>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="bg-slate-blue/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Health Insights</h2>
            <div className="text-center text-mist py-8">
              <Info size={48} className="mx-auto mb-4 opacity-50" />
              <p>Insights will appear here as you use VitalMatrix features!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
