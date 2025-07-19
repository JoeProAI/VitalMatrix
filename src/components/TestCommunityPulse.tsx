import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { addFacility } from '../firebase/communityPulseService';
import { HealthcareFacility } from '../types/communityPulse';
import UserProfileHelper from './UserProfileHelper';

const TestCommunityPulse: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const facilitiesCollection = collection(db, 'facilities');
        const facilitiesSnapshot = await getDocs(facilitiesCollection);
        const facilitiesList = facilitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFacilities(facilitiesList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching facilities:', err);
        setError('Failed to fetch facilities. Check console for details.');
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const sampleFacilities: Omit<HealthcareFacility, 'id'>[] = [
    {
      name: "City General Hospital",
      address: "123 Main Street, New York, NY 10001",
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      type: "hospital",
      phoneNumber: "(555) 123-4567",
      website: "https://citygeneral.com",
      hours: { monday: "24/7", tuesday: "24/7", wednesday: "24/7", thursday: "24/7", friday: "24/7", saturday: "24/7", sunday: "24/7" },
      averageRating: 4.2,
      ratingCount: 156,
      ratingSum: 655,
      currentWaitTime: 45,
      waitTimeReports: 23,
      crowdingLevel: "moderate"
    },
    {
      name: "Urgent Care Plus",
      address: "456 Oak Avenue, New York, NY 10016",
      location: {
        latitude: 40.7589,
        longitude: -73.9851
      },
      type: "urgent_care",
      phoneNumber: "(555) 987-6543",
      website: "https://urgentcareplus.com",
      hours: { monday: "7 AM - 11 PM", tuesday: "7 AM - 11 PM", wednesday: "7 AM - 11 PM", thursday: "7 AM - 11 PM", friday: "7 AM - 11 PM", saturday: "7 AM - 11 PM", sunday: "7 AM - 11 PM" },
      averageRating: 4.5,
      ratingCount: 89,
      ratingSum: 401,
      currentWaitTime: 20,
      waitTimeReports: 15,
      crowdingLevel: "low"
    },
    {
      name: "Metro Emergency Center",
      address: "789 Pine Street, New York, NY 10025",
      location: {
        latitude: 40.7831,
        longitude: -73.9712
      },
      type: "hospital",
      phoneNumber: "(555) 456-7890",
      website: "https://metroemergency.com",
      hours: { monday: "24/7", tuesday: "24/7", wednesday: "24/7", thursday: "24/7", friday: "24/7", saturday: "24/7", sunday: "24/7" },
      averageRating: 3.8,
      ratingCount: 234,
      ratingSum: 889,
      currentWaitTime: 75,
      waitTimeReports: 45,
      crowdingLevel: "high"
    }
  ];

  const seedDatabase = async () => {
    if (!currentUser) {
      setSeedMessage('❌ Please log in first to seed the database');
      return;
    }

    setSeeding(true);
    setSeedMessage('🏥 Adding sample facilities...');
    
    try {
      let successCount = 0;
      for (const facility of sampleFacilities) {
        try {
          const id = await addFacility(facility as HealthcareFacility);
          console.log(`✅ Added facility: ${facility.name} with ID: ${id}`);
          successCount++;
        } catch (error) {
          console.error(`❌ Error adding facility ${facility.name}:`, error);
        }
      }
      
      setSeedMessage(`🎉 Successfully added ${successCount} facilities!`);
      
      // Refresh the facilities list
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error during database seeding:', error);
      setSeedMessage('❌ Error seeding database. Check console for details.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121827] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#3b82f6]">Community Pulse Test</h1>
        
        {currentUser ? (
          <div className="mb-4 p-4 bg-slate-800 rounded-lg">
            <p className="text-green-400">✓ Authenticated as: {currentUser.email}</p>
          </div>
        ) : (
          <div className="mb-4 p-4 bg-slate-800 rounded-lg">
            <p className="text-yellow-400">⚠ Not authenticated</p>
          </div>
        )}
        
        <UserProfileHelper />

        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#3b82f6]">Firebase Connection Test</h2>
          
          {loading ? (
            <p className="text-gray-400">Loading facilities data...</p>
          ) : error ? (
            <div className="p-4 bg-red-900/30 border border-red-700 rounded">
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <div>
              <p className="text-green-400 mb-4">✓ Successfully connected to Firestore</p>
              <p className="mb-2">Found {facilities.length} facilities:</p>
              <ul className="list-disc pl-5 space-y-1">
                {facilities.length > 0 ? (
                  facilities.map(facility => (
                    <li key={facility.id} className="text-gray-300">
                      {facility.name || 'Unnamed facility'} (ID: {facility.id})
                    </li>
                  ))
                ) : (
                  <li className="text-yellow-400">No facilities found in the database</li>
                )}
              </ul>
            </div>
          )}
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#3b82f6]">Database Actions</h2>
          <div className="space-y-4">
            <button
              onClick={seedDatabase}
              disabled={seeding || !currentUser}
              className="w-full bg-[#3b82f6] hover:bg-blue-600 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {seeding ? '🔄 Adding Facilities...' : '🏥 Add Sample Facilities'}
            </button>
            {seedMessage && (
              <div className="p-3 bg-slate-700 rounded border-l-4 border-[#3b82f6]">
                <p className="text-gray-300">{seedMessage}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#3b82f6]">Environment Variables</h2>
          <ul className="space-y-2">
            <li>
              <span className="text-gray-400">VITE_GOOGLE_MAPS_API_KEY: </span>
              {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                <span className="text-green-400">✓ Set</span>
              ) : (
                <span className="text-red-400">✗ Not set</span>
              )}
            </li>
            <li>
              <span className="text-gray-400">Firebase API Key: </span>
              {import.meta.env.VITE_FIREBASE_API_KEY ? (
                <span className="text-green-400">✓ Set</span>
              ) : (
                <span className="text-red-400">✗ Not set</span>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestCommunityPulse;
