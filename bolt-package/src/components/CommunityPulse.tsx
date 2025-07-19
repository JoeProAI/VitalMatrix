import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Map, Clock3, Star, AlertCircle, User, Activity, UserPlus, FileEdit } from 'lucide-react';
import { 
  getNearbyFacilities, 
  getFacilityById, 
  getFacilityReviews, 
  addReview, 
  updateWaitTime 
} from '../firebase/communityPulseService';
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

// Google Maps API key - ideally, this should be in an environment variable
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

const CommunityPulse: React.FC = () => {
  const { currentUser } = useAuth();
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
  const [error, setError] = useState<string>('');
  const mapRef = useRef<google.maps.Map | null>(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey
  });

  // Function to load facilities near a location
  const loadNearbyFacilities = useCallback(async (position: MapPosition, radius: number) => {
    try {
      setLoading(true);
      const facilities = await getNearbyFacilities(position, radius);
      setFacilities(facilities);
      setError('');
    } catch (err) {
      console.error('Error loading facilities:', err);
      setError('Failed to load healthcare facilities. Please try again.');
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
          loadNearbyFacilities(pos, searchRadius);
        },
        () => {
          setError('Error: Location service failed. Using default location.');
          loadNearbyFacilities(center, searchRadius);
        }
      );
    } else {
      setError('Error: Your browser doesn\'t support geolocation.');
      loadNearbyFacilities(center, searchRadius);
    }
  }, [loadNearbyFacilities, searchRadius]);

  // Load facilities when component mounts
  useEffect(() => {
    if (isLoaded) {
      getUserLocation();
    }
  }, [isLoaded, getUserLocation]);

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

  // Handle map drag end to update search area
  const handleMapDragEnd = () => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter();
      if (newCenter) {
        const newPos = {
          lat: newCenter.lat(),
          lng: newCenter.lng()
        };
        setMapPosition(newPos);
        loadNearbyFacilities(newPos, searchRadius);
      }
    }
  };

  // Handle zoom change to adjust search radius
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
          loadNearbyFacilities(mapPosition, newRadius);
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
    if (!currentUser || !selectedFacility?.id) return;

    try {
      const waitTime = reviewForm.waitTime ? parseInt(reviewForm.waitTime) : undefined;
      const review: FacilityReview = {
        facilityId: selectedFacility.id,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || currentUser.email || 'Anonymous',
        rating: parseInt(reviewForm.rating.toString()),
        comment: reviewForm.comment,
        waitTime,
        crowdingLevel: reviewForm.crowdingLevel,
        timestamp: new Date()
      };

      await addReview(review);
      
      // Update the reviews list
      setReviews(prev => [review, ...prev]);
      
      // Reset form and show success message
      setReviewForm({
        rating: 5,
        comment: '',
        waitTime: '',
        crowdingLevel: 'moderate'
      });
      
      setShowReviewSuccess(true);
      setTimeout(() => setShowReviewSuccess(false), 3000);
      setIsAddingReview(false);
      
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
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    }
  };

  // Update wait time only
  const handleUpdateWaitTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedFacility?.id) return;

    try {
      const waitTime = parseInt(reviewForm.waitTime);
      if (isNaN(waitTime)) {
        setError('Please enter a valid wait time in minutes');
        return;
      }

      await updateWaitTime(selectedFacility.id, waitTime, reviewForm.crowdingLevel);
      
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
        <div className="radius-display">
          <span>Search radius: {searchRadius} km</span>
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
                fillOpacity: 1,
                fillColor: getFacilityColor(facility.type),
                strokeWeight: 1,
                strokeColor: '#ffffff',
                scale: 10,
              }}
              onClick={() => handleMarkerClick(facility)}
            />
          ))}

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
                
                {selectedFacility.lastWaitTimeUpdate && (
                  <p className="last-update">
                    Last updated: {getTimeAgo(selectedFacility.lastWaitTimeUpdate)}
                  </p>
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
