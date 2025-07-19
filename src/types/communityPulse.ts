export type FacilityType = 'hospital' | 'urgent_care' | 'clinic' | 'pharmacy' | 'other';

export interface HealthcareFacility {
  id?: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  type: FacilityType;
  phone?: string;
  website?: string;
  hours?: Record<string, string>;
  averageRating?: number;
  totalReviews?: number;
  currentWaitTime?: number;
  waitTimeReports?: number;
  lastUpdated?: Date | any;
  isOpen?: boolean;
  crowdingLevel?: 'low' | 'moderate' | 'high';
  
  // Rating aggregation fields for Firebase
  ratingSum?: number;
  ratingCount?: number;
  lastWaitTimeUpdate?: any;
  
  // Google Places specific fields
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  photos?: Array<{
    reference: string;
    width: number;
    height: number;
  }>;
}

export interface FacilityReview {
  id?: string;
  facilityId: string;
  userId: string;
  userDisplayName: string; // Changed from optional to required
  rating: number; // 1-5
  waitTime?: number; // in minutes
  crowdingLevel?: 'low' | 'moderate' | 'high';
  comment?: string;
  timestamp?: any; // firebase.firestore.Timestamp
  createdAt?: Date;
}

export interface CrowdingLevelColors {
  low: string;
  moderate: string;
  high: string;
}

export interface MapPosition {
  lat: number;
  lng: number;
}

export interface MapBounds {
  ne: MapPosition;
  sw: MapPosition;
}

export interface ActivityLog {
  id?: string;
  userId: string;
  type: 'review' | 'waittime' | 'facility_view';
  facilityId: string;
  facilityName: string;
  timestamp: any; // firebase.firestore.Timestamp
  details?: {
    rating?: number;
    waitTime?: number;
    crowdingLevel?: 'low' | 'moderate' | 'high';
    comment?: string;
  };
  createdAt?: any;
}
