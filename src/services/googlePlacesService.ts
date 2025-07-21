import { HealthcareFacility, FacilityType } from '../types/communityPulse';

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  formatted_phone_number?: string;
  website?: string;
}

export interface PlacesSearchResponse {
  results: GooglePlace[];
  status: string;
  next_page_token?: string;
}

// Map Google Places types to our facility types
const mapGoogleTypeToFacilityType = (types: string[]): FacilityType => {
  // Check for specific types first (most specific to least specific)
  if (types.includes('hospital')) return 'hospital';
  if (types.includes('pharmacy') || types.includes('drugstore')) return 'pharmacy';
  if (types.includes('emergency_room') || types.includes('urgent_care')) return 'urgent_care';
  
  // Check for clinic-related types
  if (types.includes('dentist') || types.includes('dental_clinic')) return 'clinic';
  if (types.includes('physiotherapist') || types.includes('physical_therapy')) return 'clinic';
  if (types.includes('doctor') || types.includes('medical_clinic')) return 'clinic';
  if (types.includes('veterinary_care')) return 'other';
  
  // Check for general health types
  if (types.includes('health') || types.includes('medical_center')) return 'urgent_care';
  
  // Default based on common patterns
  const typeString = types.join(' ').toLowerCase();
  if (typeString.includes('hospital')) return 'hospital';
  if (typeString.includes('pharmacy') || typeString.includes('drug')) return 'pharmacy';
  if (typeString.includes('urgent') || typeString.includes('emergency')) return 'urgent_care';
  
  return 'clinic'; // default
};

// Convert Google Place to our HealthcareFacility format
export const convertGooglePlaceToFacility = (place: GooglePlace): HealthcareFacility => {
  return {
    id: place.place_id,
    name: place.name,
    address: place.formatted_address,
    type: mapGoogleTypeToFacilityType(place.types),
    location: {
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
    },
    phone: place.formatted_phone_number || '',
    website: place.website || '',
    averageRating: place.rating || 0,
    totalReviews: place.user_ratings_total || 0,
    currentWaitTime: 0, // Will be populated from our Firebase reviews
    isOpen: place.opening_hours?.open_now || true,
    lastUpdated: new Date(),
    // Google Places specific data
    googlePlaceId: place.place_id,
    googleRating: place.rating,
    googleReviewCount: place.user_ratings_total,
    photos: place.photos?.map(photo => ({
      reference: photo.photo_reference,
      width: photo.width,
      height: photo.height,
    })) || [],
  };
};

// Search for healthcare facilities near a location
export const searchHealthcareFacilities = async (
  lat: number,
  lng: number,
  radius: number = 5000, // 5km default
  type?: string
): Promise<HealthcareFacility[]> => {
  try {
    // Healthcare related place types
    const healthcareTypes = [
      'hospital',
      'pharmacy',
      'dentist',
      'physiotherapist',
      'doctor',
      'health'
    ];
    
    const searchType = type || 'health';
    
    // Use appropriate API endpoint based on environment
    const isProduction = window.location.hostname !== 'localhost';
    const baseUrl = isProduction ? '' : 'http://localhost:3001';
    const url = `${baseUrl}/api/places/search?lat=${lat}&lng=${lng}&radius=${radius}&type=${searchType}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    const data: PlacesSearchResponse = await response.json();
    
    console.log(`📍 Frontend received: ${data.status}, ${data.results?.length || 0} results`);
    
    if (data.status !== 'OK') {
      throw new Error(`Places API status: ${data.status}`);
    }

    if (!data.results || data.results.length === 0) {
      console.log(`⚠️ No ${searchType} facilities found in this area`);
      return [];
    }
    
    // Filter for healthcare-related places and convert to our format
    const healthcareFacilities = data.results
      .filter(place => 
        place.types.some(type => 
          healthcareTypes.some(healthType => 
            type.toLowerCase().includes(healthType)
          )
        )
      )
      .map(convertGooglePlaceToFacility);

    return healthcareFacilities;
  } catch (error) {
    console.error('Error searching healthcare facilities:', error);
    throw error;
  }
};

// Get detailed information about a specific place
export const getPlaceDetails = async (placeId: string): Promise<GooglePlace | null> => {
  try {
    // Use appropriate API endpoint based on environment
    const isProduction = window.location.hostname !== 'localhost';
    const baseUrl = isProduction ? '' : 'http://localhost:3001';
    const url = `${baseUrl}/api/places/details?placeId=${placeId}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Places API status: ${data.status}`);
    }

    return data.result;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

// Get photo URL from Google Places photo reference
export const getPlacePhotoUrl = (
  photoReference: string,
  maxWidth: number = 400
): string => {
  return `https://maps.googleapis.com/maps/api/place/photo?` +
    `maxwidth=${maxWidth}&` +
    `photoreference=${photoReference}&` +
    `key=${GOOGLE_PLACES_API_KEY}`;
};

// Search for healthcare facilities by text query
export const searchHealthcareFacilitiesByText = async (
  query: string,
  lat?: number,
  lng?: number,
  radius?: number
): Promise<HealthcareFacility[]> => {
  try {
    // Note: Text search would need a separate API route
    // For now, we'll use the nearby search with a generic health type
    if (lat && lng) {
      return await searchHealthcareFacilities(lat, lng, radius || 5000, 'health');
    }
    
    // Fallback to NYC if no location provided
    return await searchHealthcareFacilities(40.7128, -74.0060, 10000, 'health');
  } catch (error) {
    console.error('Error searching healthcare facilities by text:', error);
    throw error;
  }
};
