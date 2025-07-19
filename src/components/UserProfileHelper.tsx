import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';

const UserProfileHelper: React.FC = () => {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const updateDisplayName = async () => {
    if (!currentUser || !displayName.trim()) return;

    setUpdating(true);
    try {
      await updateProfile(currentUser, {
        displayName: displayName.trim()
      });
      setMessage('✅ Display name updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('❌ Failed to update display name');
    } finally {
      setUpdating(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#3b82f6] mb-4">User Profile</h3>
        <p className="text-yellow-400">Please log in to manage your profile</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-[#3b82f6] mb-4">User Profile</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-gray-400 text-sm">Email</p>
          <p className="text-white">{currentUser.email}</p>
        </div>
        
        <div>
          <p className="text-gray-400 text-sm">Display Name</p>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-[#3b82f6] focus:outline-none"
            />
            <button
              onClick={updateDisplayName}
              disabled={updating || !displayName.trim()}
              className="bg-[#3b82f6] hover:bg-blue-600 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              {updating ? '⏳' : '💾'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This name will appear on your reviews and community posts
          </p>
        </div>
        
        {message && (
          <div className="p-3 bg-slate-700 rounded border-l-4 border-[#3b82f6]">
            <p className="text-gray-300">{message}</p>
          </div>
        )}
        
        <div className="border-t border-slate-600 pt-4">
          <h4 className="text-sm font-semibold text-[#3b82f6] mb-2">Review System Status</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>✅ Account linked to reviews</li>
            <li>✅ Activity logging enabled</li>
            <li>✅ Dashboard integration active</li>
            <li>✅ Real-time rating updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHelper;
