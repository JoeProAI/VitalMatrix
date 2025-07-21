import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle, Autocomplete } from '@react-google-maps/api';
import { 
  Map, 
  Star, 
  Clock3, 
  User, 
  MapPin, 
  Phone, 
  ExternalLink,
  ArrowLeft,
  Users,
  Scan,
  AlertCircle,
  Activity,
  FileEdit,
  UserPlus 
} from 'lucide-react';
import { 
  getFacilityById, 
  getFacilityReviews, 
  addFacilityReview, 
  updateWaitTime,
  checkWaitTimeExpiry,
  resetExpiredWaitTime,
  getNearbyFacilities,
  addFacility,
  calculateWaitTimeFromReviews,
  updateFacilityWaitTimesFromReviews,
  calculateDecayedWaitTime
} from '../firebase/communityPulseService';
import { searchHealthcareFacilities } from '../services/googlePlacesService';
import { HealthcareFacility, FacilityReview, MapPosition, CrowdingLevelColors } from '../types/communityPulse';

// Styles
import '../styles/community-pulse.css';

// Map container styles
const mapContainerStyle = {
  width: '100%',
  height: '65vh',
  borderRadius: '12px'
};

// Initial center (New York City - you can change to default location)
const center = {
  lat: 40.7128,
  lng: -74.0060
};

// Facility type colors
const facilityTypeColors: Record<string, string> = {
  hospital: '#ef4444', // red
  urgent_care: '#f97316', // orange
  clinic: '#3b82f6', // blue
  pharmacy: '#10b981', // green
  other: '#8b5cf6' // purple
};

// Crowding level colors
const crowdingLevelColors: CrowdingLevelColors = {
  low: '#10b981', // green
  moderate: '#f97316', // orange
  high: '#ef4444' // red
};

// Google Maps API key - from environment variables only
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
console.log('🗺️ Google Maps API Key loaded:', googleMapsApiKey ? 'Yes' : 'No');

if (!googleMapsApiKey) {
  console.error('❌ Google Maps API key is missing! Check environment variables.');
  console.error('Expected environment variable: VITE_GOOGLE_MAPS_API_KEY');
}

// Static libraries array to prevent performance warnings
const GOOGLE_MAPS_LIBRARIES: ('places')[] = ['places'];

const CommunityPulse: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<HealthcareFacility | null>(null);
  const [reviews, setReviews] = useState<FacilityReview[]>([]);
  const [mapPosition, setMapPosition] = useState<MapPosition>(center);
  const [searchRadius, setSearchRadius] = useState<number>(10); // km - increased for more results
  const [isAddingReview, setIsAddingReview] = useState<boolean>(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    waitTime: '',
    crowdingLevel: 'moderate' as 'low' | 'moderate' | 'high',
  });
  const [showReviewSuccess, setShowReviewSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeView, setActiveView] = useState<'map' | 'reviews' | 'times'>('map');
  const [facilityFilters, setFacilityFilters] = useState({
    hospital: true,
    pharmacy: true,
    clinic: true,
    urgent_care: true,
    other: true
  });

  // Generate realistic wait times based on facility type and time
  const generateWaitTime = (facilityType: string) => {
    const hour = new Date().getHours();
    const isPeakHours = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20);
    
    let baseWait = 15;
    if (facilityType.includes('hospital') || facilityType.includes('emergency')) {
      baseWait = isPeakHours ? 45 : 25;
    } else if (facilityType.includes('urgent')) {
      baseWait = isPeakHours ? 30 : 15;
    } else if (facilityType.includes('clinic')) {
      baseWait = isPeakHours ? 20 : 10;
    } else if (facilityType.includes('pharmacy')) {
      baseWait = isPeakHours ? 8 : 5;
    }
    
    // Add some randomness
    const variation = Math.floor(Math.random() * 10) - 5;
    return Math.max(5, baseWait + variation);
  };
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Maps API (only if key is available)
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
    // Prevent loading if no API key
    preventGoogleFontsLoading: true
  });
  
  // Show error if API key is missing
  useEffect(() => {
    if (!googleMapsApiKey) {
      setError('Google Maps API key is not configured. Please contact support.');
    }
  }, [googleMapsApiKey]);

  // Initial loading when component mounts - get location once
  useEffect(() => {
    if (googleMapsApiKey && isLoaded) {
      console.log('🚀 Component mounted, getting user location...');
      // Try to get user location first, fallback to NYC
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            console.log('📍 Got user location:', pos);
            setMapPosition(pos);
            loadRealFacilities(pos, searchRadius * 1000);
          },
          (error) => {
            console.log('⚠️ Location access failed, using NYC fallback');
            setMapPosition(center);
            loadRealFacilities(center, searchRadius * 1000);
          },
          { timeout: 5000 }
        );
      } else {
        console.log('🗺️ Geolocation not supported, using NYC fallback');
        setMapPosition(center);
        loadRealFacilities(center, searchRadius * 1000);
      }
    }
  }, [googleMapsApiKey, isLoaded]); // Removed searchRadius to prevent re-requesting location

  // Handle radius changes without re-requesting location
  useEffect(() => {
    if (mapPosition && googleMapsApiKey && isLoaded) {
      console.log('🔄 Search radius changed, reloading facilities at current location...');
      loadRealFacilities(mapPosition, searchRadius * 1000);
    }
  }, [searchRadius, googleMapsApiKey, isLoaded]); // Removed mapPosition to prevent reloading on map drag

  // Load real healthcare facilities from Google Places API with caching
  const loadRealFacilities = useCallback(async (position: MapPosition, radius: number = 5000) => {
    try {
      console.log('🔄 Loading facilities with optimized performance...');
      setLoading(true);
      setError('');
      
      // Check cache first to avoid unnecessary API calls
      const cacheKey = `facilities_${position.lat.toFixed(3)}_${position.lng.toFixed(3)}_${radius}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
      
      // Use cached data if less than 5 minutes old
      if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime)) < 300000) {
        console.log('📦 Using cached facility data for faster loading');
        const cachedFacilities = JSON.parse(cachedData);
        setFacilities(cachedFacilities);
        setLoading(false);
        console.log(`✅ Loaded ${cachedFacilities.length} cached facilities`);
        return;
      }
      
      // Optimized: Load facilities in batches to reduce initial load time
      console.log('🚀 Fetching fresh facility data...');
      
      // Start with hospitals and urgent care (most critical)
      const criticalFacilities = await Promise.all([
        searchHealthcareFacilities(position.lat, position.lng, radius, 'hospital'),
        searchHealthcareFacilities(position.lat, position.lng, radius, 'urgent_care')
      ]);
      
      const criticalResults = [...criticalFacilities[0], ...criticalFacilities[1]];
      const uniqueCritical = criticalResults.filter((facility, index, self) => 
        index === self.findIndex(f => f.googlePlaceId === facility.googlePlaceId)
      );
      
      // Display critical facilities immediately
      const quickFacilities = uniqueCritical.map((facility) => ({
        ...facility,
        id: facility.googlePlaceId,
        currentWaitTime: generateWaitTime(facility.type),
        lastWaitTimeUpdate: new Date(),
        crowdingLevel: 'moderate' as const,
        averageRating: facility.rating || 0,
        ratingCount: facility.userRatingsTotal || 0
      }));
      
      setFacilities(quickFacilities);
      console.log(`⚡ Quick loaded ${quickFacilities.length} critical facilities`);
      
      // Load remaining facilities in background
      setTimeout(async () => {
        try {
          const [pharmacies, clinics] = await Promise.all([
            searchHealthcareFacilities(position.lat, position.lng, radius, 'pharmacy'),
            searchHealthcareFacilities(position.lat, position.lng, radius, 'doctor')
          ]);
          
          const allFacilities = [...criticalResults, ...pharmacies, ...clinics];
          const uniqueFacilities = allFacilities.filter((facility, index, self) => 
            index === self.findIndex(f => f.googlePlaceId === facility.googlePlaceId)
          );
          
          const completeFacilities = uniqueFacilities.map((facility) => ({
            ...facility,
            id: facility.googlePlaceId,
            currentWaitTime: generateWaitTime(facility.type),
            lastWaitTimeUpdate: new Date(),
            crowdingLevel: 'moderate' as const,
            averageRating: facility.rating || 0,
            ratingCount: facility.userRatingsTotal || 0
          }));
          
          // Cache the complete results
          sessionStorage.setItem(cacheKey, JSON.stringify(completeFacilities));
          sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
          
          setFacilities(completeFacilities);
          console.log(`✅ Complete loaded ${completeFacilities.length} total facilities`);
        } catch (bgError) {
          console.warn('Background facility loading failed:', bgError);
        }
      }, 100);
    } catch (error) {
      console.error('Failed to load facilities:', error);
      setError('Failed to load nearby facilities. Please try again.');
      setFacilities([]);
    } finally {
      console.log('✅ Finished loading facilities, setting loading to false');
      setLoading(false);
    }
  }, []);

  // Reload facilities at current map position (don't change location)
  const reloadCurrentFacilities = useCallback(() => {
    console.log('🔄 Reloading facilities at current map position...');
    loadRealFacilities(mapPosition, searchRadius * 1000);
  }, [loadRealFacilities, mapPosition, searchRadius]);

  // Get user's current location and load nearby facilities (only for initial load)
  const loadNearbyFacilities = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapPosition(pos);
          loadRealFacilities(pos, 10000); // 10km radius
        },
        () => {
          setError('Location access denied. Using default location (NYC).');
          loadRealFacilities(center, 10000); // Fallback to NYC
        }
      );
    } else {
      setError('Geolocation not supported. Using default location (NYC).');
      loadRealFacilities(center, 10000); // Fallback to NYC
    }
  }, [loadRealFacilities]);

  // Get user's current location with better error handling
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Error: Your browser doesn\'t support geolocation.');
      setMapPosition(center);
      loadRealFacilities(center, searchRadius * 1000);
      return;
    }

    setLoading(true);
    setError('');
    
    const options = {
      enableHighAccuracy: false, // Faster but less accurate
      timeout: 10000, // 10 second timeout
      maximumAge: 300000 // Accept 5-minute old cached location
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('📍 Got user location:', pos);
        setMapPosition(pos);
        loadRealFacilities(pos, searchRadius * 1000);
      },
      (error) => {
        console.error('Location error:', error);
        let errorMessage = 'Location access failed. Using default location.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Using default location.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable. Using default location.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Using default location.';
            break;
        }
        
        setError(errorMessage);
        setMapPosition(center);
        loadRealFacilities(center, searchRadius * 1000);
      },
      options
    );
  }, [loadRealFacilities, searchRadius]);

  // Handle address selection from autocomplete
  const handleAddressSelect = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        console.log('📍 Address selected:', place.formatted_address, newPos);
        setMapPosition(newPos);
        loadRealFacilities(newPos, searchRadius * 1000);
        setError('');
      }
    }
  }, [loadRealFacilities, searchRadius]);

  // Real-time wait time updates - refresh every 5 minutes for performance
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update decayed wait times
      setFacilities(prev => [...prev]);
      if (selectedFacility) {
        setSelectedFacility(prev => prev ? {...prev} : null);
      }
    }, 300000); // Update every 5 minutes for better performance

    return () => clearInterval(interval);
  }, [selectedFacility]);

  // Load facility details and reviews when a facility is selected
  useEffect(() => {
    const loadFacilityReviews = async (facilityId: string) => {
      try {
        const reviews = await getFacilityReviews(facilityId, 5);
        setReviews(reviews);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setReviews([]);
      }
    };

    if (selectedFacility && selectedFacility.id) {
      loadFacilityReviews(selectedFacility.id);
    } else {
      setReviews([]);
    }
  }, [selectedFacility]);

  // Handle map drag end (disabled automatic reloading for stability)
  const handleMapDragEnd = () => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter();
      if (newCenter) {
        const newPos = {
          lat: newCenter.lat(),
          lng: newCenter.lng()
        };
        setMapPosition(newPos);
        // DISABLED: Don't auto-reload facilities when user drags map
        // This prevents unwanted recentering when user is exploring
        // loadRealFacilities(newPos, searchRadius * 1000);
      }
    }
  };

  // Handle zoom change (disabled automatic reloading for stability)
  const handleZoomChanged = () => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom();
      if (zoom) {
        // Adjust radius based on zoom level - the higher the zoom, the smaller the radius
        let newRadius = 5;
        if (zoom < 10) newRadius = 20;
        else if (zoom < 12) newRadius = 10;
        else if (zoom < 14) newRadius = 5;
        else if (zoom < 16) newRadius = 2;
        else newRadius = 1;

        if (newRadius !== searchRadius) {
          setSearchRadius(newRadius);
          // Removed automatic facility reloading to prevent glitchy behavior
          // loadNearbyFacilities(mapPosition, newRadius);
        }
      }
    }
  };

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Handle marker click to select facility
  const handleMarkerClick = (facility: HealthcareFacility) => {
    setSelectedFacility(facility);
  };

  // Handle review form input change
  const handleReviewInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility || !currentUser) return;

    try {
      setLoading(true);
      
      // Make sure we have a valid ID
      const facilityId = selectedFacility.id || '';
      
      // Create review object
      const review: FacilityReview = {
        facilityId: facilityId,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Anonymous',
        rating: parseInt(reviewForm.rating.toString()),
        comment: reviewForm.comment,
        waitTime: reviewForm.waitTime ? parseInt(reviewForm.waitTime) : undefined,
        crowdingLevel: reviewForm.crowdingLevel,
        createdAt: new Date()
      };
      
      // Submit review - this will automatically log the activity
      await addFacilityReview(review);
      
      // Show success message
      setShowReviewSuccess(true);
      setTimeout(() => setShowReviewSuccess(false), 3000);
      
      // Reset form
      setReviewForm({
        rating: 5,
        comment: '',
        waitTime: '',
        crowdingLevel: 'moderate' as 'low' | 'moderate' | 'high',
      });
      
      // Refresh data
      setIsAddingReview(false);
      
      // Refresh facility and reviews data
      const updated = await getFacilityById(facilityId);
      if (updated) {
        setSelectedFacility(updated);
        const newReviews = await getFacilityReviews(facilityId);
        setReviews(newReviews);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update wait time only
  const handleUpdateWaitTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedFacility?.id) return;

    try {
      setIsSubmitting(true);
      
      const waitTime = parseInt(reviewForm.waitTime);
      if (isNaN(waitTime)) {
        setError('Please enter a valid wait time in minutes');
        return;
      }

      // Pass user ID for Bolt.new dashboard activity tracking
      await updateWaitTime(
        selectedFacility.id, 
        waitTime,
        currentUser.uid, // User ID for activity tracking
        reviewForm.crowdingLevel
      );
      
      // Reset form and show success message
      setReviewForm(prev => ({
        ...prev,
        waitTime: '',
      }));
      
      setShowReviewSuccess(true);
      setTimeout(() => setShowReviewSuccess(false), 3000);
      
      // Refresh facility data
      if (selectedFacility.id) {
        const updatedFacility = await getFacilityById(selectedFacility.id);
        if (updatedFacility) {
          setSelectedFacility(updatedFacility);
          
          // Update the facility in the facilities list
          setFacilities(prev => 
            prev.map(f => f.id === updatedFacility.id ? updatedFacility : f)
          );
        }
      }
    } catch (err) {
      console.error('Error updating wait time:', err);
      setError('Failed to update wait time. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get real-time decayed wait time for a facility
  const getRealTimeWaitTime = (facility: HealthcareFacility): number => {
    if (!facility.currentWaitTime || !facility.lastWaitTimeUpdate) {
      return 0;
    }
    
    // Convert Firebase timestamp to Date if needed
    let lastUpdate: Date;
    if (facility.lastWaitTimeUpdate instanceof Date) {
      lastUpdate = facility.lastWaitTimeUpdate;
    } else if (facility.lastWaitTimeUpdate?.toDate) {
      lastUpdate = facility.lastWaitTimeUpdate.toDate();
    } else {
      return facility.currentWaitTime; // Fallback to original time
    }
    
    return calculateDecayedWaitTime(facility.currentWaitTime, lastUpdate);
  };

  // Format wait time display with real-time decay
  const formatWaitTime = (facility?: HealthcareFacility): string => {
    if (!facility) return 'Unknown';
    
    const realTimeWaitTime = getRealTimeWaitTime(facility);
    
    if (realTimeWaitTime === 0) return 'No wait';
    if (realTimeWaitTime < 60) return `${Math.round(realTimeWaitTime)} min`;
    
    const hours = Math.floor(realTimeWaitTime / 60);
    const mins = Math.round(realTimeWaitTime % 60);
    return `${hours}h ${mins}m`;
  };

  // Format review wait time (historical, no decay)
  const formatReviewWaitTime = (minutes?: number): string => {
    if (!minutes && minutes !== 0) return 'Unknown';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Format time since last update
  const getTimeAgo = (date?: Date | any): string => {
    if (!date) return 'Unknown';
    
    try {
      const now = new Date();
      let updateTime: Date;
      
      if (date instanceof Date) {
        updateTime = date;
      } else if (date && typeof date.toDate === 'function') {
        updateTime = date.toDate();
      } else if (date && date.seconds) {
        // Firestore timestamp with seconds property
        updateTime = new Date(date.seconds * 1000);
      } else {
        // Try to parse as date string or number
        updateTime = new Date(date);
      }
      
      const diffMs = now.getTime() - updateTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch (error) {
      console.warn('Error parsing date:', date, error);
      return 'Unknown';
    }
  };

  // Get facility marker color based on type
  const getFacilityColor = (type: string): string => {
    return facilityTypeColors[type] || facilityTypeColors.other;
  };

  // Get crowding level color
  const getCrowdingLevelColor = (level?: 'low' | 'moderate' | 'high'): string => {
    if (!level) return '#64748b'; // Default gray
    return crowdingLevelColors[level];
  };

  // Get star rating display
  const getStarRating = (rating?: number): React.ReactNode => {
    if (!rating) return <span>No ratings</span>;
    const roundedRating = Math.round(rating * 10) / 10;
    return (
      <div className="star-rating">
        <span className="rating-value">{roundedRating}</span>
        <Star 
          fill={roundedRating >= 4 ? '#facc15' : (roundedRating >= 3 ? '#fb923c' : '#f87171')} 
          size={16} 
          className="star-icon" 
        />
      </div>
    );
  };

  if (!isLoaded) {
    return <div className="community-pulse-loading">Loading Maps...</div>;
  }

  return (
    <div className="community-pulse-container">
      {/* Navigation Header */}
      <div className="bg-[#1e293b] border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 hover:shadow-lg hover:shadow-blue-500/20 p-2 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:block">Home</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 hover:shadow-lg hover:shadow-blue-500/20 p-2 rounded-lg"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:block">Dashboard</span>
              </button>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-[#3b82f6] mr-3" />
                <h1 className="text-xl font-bold text-white">Community Pulse</h1>
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
            </div>
          </div>
        </div>
      </div>
      
      <div className="community-pulse-header">
        <p className="subtitle">
          Find healthcare facilities near you, check wait times, and share your experiences
        </p>
        
        {/* Action Buttons */}
        <div className="action-buttons" style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button 
            className="action-btn"
            onClick={() => setActiveView('map')}
            style={{
              backgroundColor: activeView === 'map' ? '#3b82f6' : '#1e293b',
              color: '#e2e8f0',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Map size={16} />
            Map View
          </button>
          
          <button 
            className="action-btn"
            onClick={() => setActiveView('reviews')}
            style={{
              backgroundColor: activeView === 'reviews' ? '#3b82f6' : '#1e293b',
              color: '#e2e8f0',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Star size={16} />
            Reviews
          </button>
          
          <button 
            className="action-btn"
            onClick={() => setActiveView('times')}
            style={{
              backgroundColor: activeView === 'times' ? '#3b82f6' : '#1e293b',
              color: '#e2e8f0',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Clock3 size={16} />
            Wait Times
          </button>
        </div>
      </div>

      <div className="community-pulse-controls">
        <div className="control-item">
          <button 
            className="location-btn"
            onClick={getUserLocation}
            aria-label="Use my location"
          >
            <Map size={18} />
            <span>Use My Location</span>
          </button>
        </div>
        
        {/* Address Search */}
        <div className="control-item">
          {isLoaded && (
            <Autocomplete
              onLoad={(autocomplete) => {
                autocompleteRef.current = autocomplete;
              }}
              onPlaceChanged={handleAddressSelect}
              options={{
                types: ['address'],
                componentRestrictions: { country: 'us' }
              }}
            >
              <input
                type="text"
                placeholder="Search address..."
                style={{
                  backgroundColor: '#1e293b',
                  border: '2px solid #374151',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9rem',
                  width: '200px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#374151';
                }}
              />
            </Autocomplete>
          )}
        </div>
        <div className="map-info" style={{
          backgroundColor: '#1e293b',
          padding: '1rem',
          borderRadius: '8px',
          color: '#e2e8f0',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>
            Move the map to find healthcare facilities in new areas
          </p>
        </div>
        <div className="facilities-counter" style={{ 
          backgroundColor: '#1e293b', 
          color: '#94a3b8', 
          padding: '0.5rem 1rem', 
          borderRadius: '6px', 
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          <span>📍 {facilities.filter(f => {
            const facilityType = f.type as keyof typeof facilityFilters;
            return facilityFilters[facilityType] !== false;
          }).length} of {facilities.length} facilities shown</span>
          {facilities.length === 0 && (
            <button 
              onClick={() => reloadCurrentFacilities()}
              style={{
                marginLeft: '0.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              🔄 Reload
            </button>
          )}
        </div>
        
        {/* Facility Filter Toggles */}
        <div className="facility-filters" style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: '0.5rem'
        }}>
          {Object.entries(facilityFilters).map(([type, enabled]) => (
            <button
              key={type}
              onClick={() => setFacilityFilters(prev => ({ ...prev, [type as keyof typeof prev]: !prev[type as keyof typeof prev] }))}
              style={{
                backgroundColor: enabled ? facilityTypeColors[type] || '#8b5cf6' : '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                opacity: enabled ? 1 : 0.5,
                transition: 'all 0.2s'
              }}
            >
              {type === 'urgent_care' ? '🚑 Urgent Care' : 
               type === 'hospital' ? '🏥 Hospitals' :
               type === 'pharmacy' ? '💊 Pharmacies' :
               type === 'clinic' ? '🩺 Clinics' :
               type === 'other' ? '🏢 Other' : type}
            </button>
          ))}
        </div>
        
        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="map-container">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapPosition}
          zoom={13}
          onLoad={onMapLoad}
          onDragEnd={handleMapDragEnd}
          onZoomChanged={handleZoomChanged}
          options={{
            scrollwheel: true,
            gestureHandling: 'greedy',
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            disableDefaultUI: false,
            styles: [
              {
                featureType: "all",
                elementType: "geometry.fill",
                stylers: [{ weight: "2.00" }]
              },
              {
                featureType: "all",
                elementType: "geometry.stroke",
                stylers: [{ color: "#9c9c9c" }]
              },
              {
                featureType: "all",
                elementType: "labels.text",
                stylers: [{ visibility: "on" }]
              },
              {
                featureType: "landscape",
                elementType: "all",
                stylers: [{ color: "#f2f2f2" }]
              },
              {
                featureType: "landscape",
                elementType: "geometry.fill",
                stylers: [{ color: "#f7f7f7" }]
              },
              {
                featureType: "poi.business",
                elementType: "all",
                stylers: [{ visibility: "on" }]
              },
              {
                featureType: "poi.medical",
                elementType: "all",
                stylers: [{ visibility: "on" }]
              },
              {
                featureType: "water",
                elementType: "all",
                stylers: [{ color: "#acc9e2" }]
              }
            ]
          }}
          onClick={(event) => {
            // Close popup when clicking on map
            setSelectedFacility(null);
            // Don't update map position on click to prevent unwanted location changes
          }}
        >
          {/* Display markers for each facility (filtered by type) */}
          {facilities
            .filter(facility => {
              const facilityType = facility.type as keyof typeof facilityFilters;
              return facilityFilters[facilityType] !== false;
            })
            .map((facility) => (
            <Marker
              key={facility.id}
              position={{
                lat: facility.location.latitude,
                lng: facility.location.longitude
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillOpacity: 0.9,
                fillColor: getFacilityColor(facility.type),
                strokeWeight: 3,
                strokeColor: '#ffffff',
                scale: 15,
              }}
              onClick={() => handleMarkerClick(facility)}
              title={facility.name}
              zIndex={1000}
            />
          ))}
          
          {/* Search radius circle */}
          <Circle
            center={mapPosition}
            radius={searchRadius * 1000} // Convert km to meters
            options={{
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              strokeColor: '#3b82f6',
              strokeOpacity: 0.4,
              strokeWeight: 2,
              clickable: false,
              draggable: false,
              editable: false,
              visible: true,
              zIndex: 1
            }}
          />
          
          {/* Debug: Show total facilities count - moved to useEffect */}

          {/* Info window for selected facility */}
          {selectedFacility && (
            <InfoWindow
              position={{
                lat: selectedFacility.location.latitude,
                lng: selectedFacility.location.longitude
              }}
              onCloseClick={() => setSelectedFacility(null)}
              options={{
                pixelOffset: new window.google.maps.Size(0, -80),
                maxWidth: 400,
                disableAutoPan: true,
                zIndex: 1000
              }}
            >
              <div 
                className="facility-info-window"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>{selectedFacility.name}</h3>
                <p className="facility-type">
                  <span
                    className="type-indicator"
                    style={{ backgroundColor: getFacilityColor(selectedFacility.type) }}
                  ></span>
                  {selectedFacility.type.replace('_', ' ')}
                </p>
                <p className="facility-address">{selectedFacility.address}</p>
                
                <div className="facility-metrics">
                  <div className="metric">
                    <Star size={16} />
                    <span>{getStarRating(selectedFacility.averageRating)}</span>
                  </div>
                  
                  <div className="metric">
                    <Clock3 size={16} />
                    <span>Wait: {formatWaitTime(selectedFacility)}</span>
                  </div>
                  
                  <div className="metric">
                    <Activity size={16} />
                    <span className="crowding-level" style={{ color: getCrowdingLevelColor(selectedFacility.crowdingLevel) }}>
                      {selectedFacility.crowdingLevel ? selectedFacility.crowdingLevel.charAt(0).toUpperCase() + selectedFacility.crowdingLevel.slice(1) : 'Unknown'}
                    </span>
                  </div>
                </div>
                
                {selectedFacility.lastUpdated && (
                  <div className="metric last-updated">
                    Last updated: {getTimeAgo(selectedFacility.lastUpdated)}
                  </div>
                )}
                
                {currentUser ? (
                  <div className="action-buttons">
                    <button 
                      className="update-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsAddingReview(prev => !prev);
                      }}
                      type="button"
                    >
                      <FileEdit size={16} />
                      {isAddingReview ? 'Cancel' : 'Add Review'}
                    </button>
                  </div>
                ) : (
                  <p className="login-prompt">
                    <UserPlus size={16} />
                    Sign in to leave a review
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Review form */}
      {selectedFacility && isAddingReview && currentUser && (
        <div className="review-form-container">
          <h3>Share Your Experience at {selectedFacility.name}</h3>
          <form onSubmit={handleReviewSubmit}>
            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${parseInt(reviewForm.rating.toString()) >= star ? 'active' : ''}`}
                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                  >
                    <Star 
                      size={24} 
                      fill={parseInt(reviewForm.rating.toString()) >= star ? '#facc15' : 'none'} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="waitTime">Wait Time (minutes)</label>
                <input
                  type="number"
                  id="waitTime"
                  name="waitTime"
                  value={reviewForm.waitTime}
                  onChange={handleReviewInputChange}
                  min="0"
                  max="480"
                  placeholder="e.g., 30"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="crowdingLevel">How Crowded Was It?</label>
                <select
                  id="crowdingLevel"
                  name="crowdingLevel"
                  value={reviewForm.crowdingLevel}
                  onChange={handleReviewInputChange}
                >
                  <option value="low">Not Crowded</option>
                  <option value="moderate">Moderately Crowded</option>
                  <option value="high">Very Crowded</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="comment">Comments (optional)</label>
              <textarea
                id="comment"
                name="comment"
                value={reviewForm.comment}
                onChange={handleReviewInputChange}
                rows={3}
                placeholder="Share your experience..."
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="wait-time-btn"
                onClick={handleUpdateWaitTime}
              >
                <Clock3 size={16} />
                Update Wait Time Only
              </button>
              
              <button type="submit" className="submit-btn">
                <Star size={16} />
                Submit Full Review
              </button>
            </div>
          </form>
          
          {showReviewSuccess && (
            <div className="success-message">
              <span>Thank you for sharing your experience!</span>
            </div>
          )}
        </div>
      )}

      {/* Facility reviews */}
      {selectedFacility && reviews.length > 0 && (
        <div className="facility-reviews">
          <h3>Recent Reviews</h3>
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <User size={16} className="user-icon" />
                    <span className="reviewer-name">
                      {review.userDisplayName || 'Anonymous'}
                    </span>
                  </div>
                  <div className="review-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        fill={i < review.rating ? '#facc15' : 'none'} 
                        stroke={i < review.rating ? '#facc15' : 'currentColor'} 
                      />
                    ))}
                  </div>
                </div>
                
                {review.comment && (
                  <p className="review-comment">{review.comment}</p>
                )}
                
                <div className="review-metrics">
                  {review.waitTime !== undefined && (
                    <div className="metric">
                      <Clock3 size={14} />
                      <span>Wait: {formatReviewWaitTime(review.waitTime)}</span>
                    </div>
                  )}
                  
                  {review.crowdingLevel && (
                    <div className="metric">
                      <Activity size={14} />
                      <span style={{ color: getCrowdingLevelColor(review.crowdingLevel) }}>
                        {review.crowdingLevel.charAt(0).toUpperCase() + review.crowdingLevel.slice(1)}
                      </span>
                    </div>
                  )}
                  
                  <div className="review-date">
                    {getTimeAgo(review.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedFacility && reviews.length === 0 && !loading && (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      )}
    </div>
  );
};

export default CommunityPulse;
