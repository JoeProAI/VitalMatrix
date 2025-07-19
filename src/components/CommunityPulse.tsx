import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { Map, Clock3, Star, AlertCircle, User, Activity, UserPlus, FileEdit, Home, Scan, Users } from 'lucide-react';
import { 
  getNearbyFacilities, 
  getFacilityById, 
  getFacilityReviews, 
  addFacilityReview, 
  updateWaitTime 
} from '../firebase/communityPulseService';
import { searchHealthcareFacilities, getPlaceDetails } from '../services/googlePlacesService';
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

const CommunityPulse: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<HealthcareFacility | null>(null);
  const [reviews, setReviews] = useState<FacilityReview[]>([]);
  const [mapPosition, setMapPosition] = useState<MapPosition>(center);
  const [searchRadius, setSearchRadius] = useState<number>(5); // km
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
  const mapRef = useRef<google.maps.Map | null>(null);

  // Load Google Maps API (only if key is available)
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey || '',
    // Prevent loading if no API key
    preventGoogleFontsLoading: true
  });
  
  // Show error if API key is missing
  useEffect(() => {
    if (!googleMapsApiKey) {
      setError('Google Maps API key is not configured. Please contact support.');
    }
  }, [googleMapsApiKey]);

  // Load real healthcare facilities from Google Places API
  const loadRealFacilities = useCallback(async (position: MapPosition, radius: number = 5000) => {
    try {
      setLoading(true);
      setError('');
      
      // Search for different types of healthcare facilities
      const hospitalPromise = searchHealthcareFacilities(position.lat, position.lng, radius, 'hospital');
      const pharmacyPromise = searchHealthcareFacilities(position.lat, position.lng, radius, 'pharmacy');
      const clinicPromise = searchHealthcareFacilities(position.lat, position.lng, radius, 'doctor');
      
      const [hospitals, pharmacies, clinics] = await Promise.all([
        hospitalPromise,
        pharmacyPromise,
        clinicPromise
      ]);
      
      // Combine all facilities and remove duplicates
      const allFacilities = [...hospitals, ...pharmacies, ...clinics];
      const uniqueFacilities = allFacilities.filter((facility, index, self) => 
        index === self.findIndex(f => f.googlePlaceId === facility.googlePlaceId)
      );
      
      setFacilities(uniqueFacilities);
      console.log(`Loaded ${uniqueFacilities.length} real healthcare facilities:`, uniqueFacilities.map(f => f.name));
    } catch (err) {
      console.error('Error loading real facilities:', err);
      setError('Failed to load healthcare facilities. Please try again.');
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's current location and load nearby facilities
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

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapPosition(pos);
          loadRealFacilities(pos, searchRadius * 1000); // Convert km to meters
        },
        () => {
          setError('Error: Location service failed. Using default location.');
          loadRealFacilities(center, searchRadius * 1000); // Convert km to meters
        }
      );
    } else {
      setError('Error: Your browser doesn\'t support geolocation.');
      loadRealFacilities(center, searchRadius * 1000); // Convert km to meters
    }
  }, [loadRealFacilities, searchRadius]);

  // Load nearby real facilities when component mounts
  useEffect(() => {
    if (isLoaded) {
      loadNearbyFacilities();
    }
  }, [isLoaded, loadNearbyFacilities]);

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
        // Removed automatic facility reloading to prevent glitchy behavior
        // loadNearbyFacilities(newPos, searchRadius);
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

  // Format wait time display
  const formatWaitTime = (minutes?: number): string => {
    if (!minutes && minutes !== 0) return 'Unknown';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Format time since last update
  const getTimeAgo = (date?: Date | any): string => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const updateTime = date instanceof Date ? date : date.toDate();
    const diffMs = now.getTime() - updateTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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
      <div className="community-pulse-header">
        <h1>Community Pulse</h1>
        <p className="subtitle">
          Find healthcare facilities near you, check wait times, and share your experiences
        </p>
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
        <div className="radius-controls" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          backgroundColor: '#1e293b',
          padding: '1rem',
          borderRadius: '8px',
          color: '#e2e8f0'
        }}>
          <label htmlFor="radius-slider" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
            Search radius: {searchRadius} km
          </label>
          <input
            id="radius-slider"
            type="range"
            min="1"
            max="25"
            value={searchRadius}
            onChange={(e) => {
              const newRadius = parseInt(e.target.value);
              setSearchRadius(newRadius);
              if (mapPosition.lat !== 40.7128 || mapPosition.lng !== -74.0060) {
                loadRealFacilities(mapPosition, newRadius * 1000);
              }
            }}
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: '#475569',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#94a3b8'
          }}>
            <span>1km</span>
            <span>Click map to search new areas</span>
            <span>25km</span>
          </div>
        </div>
        <div className="facilities-counter" style={{ 
          backgroundColor: '#1e293b', 
          color: '#94a3b8', 
          padding: '0.5rem 1rem', 
          borderRadius: '6px', 
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          <span>📍 {facilities.length} facilities loaded</span>
          {facilities.length === 0 && (
            <button 
              onClick={() => loadNearbyFacilities()}
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
          onClick={(event) => {
            if (event.latLng) {
              const newPosition = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
              };
              setMapPosition(newPosition);
              loadRealFacilities(newPosition, searchRadius * 1000);
            }
          }}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
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
        >
          {/* Display markers for each facility */}
          {facilities.map((facility) => (
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
            >
              <div className="facility-info-window">
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
                    <span>Wait: {formatWaitTime(selectedFacility.currentWaitTime)}</span>
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
                      onClick={() => setIsAddingReview(prev => !prev)}
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
                      <span>Wait: {formatWaitTime(review.waitTime)}</span>
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
