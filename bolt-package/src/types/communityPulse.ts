export interface HealthcareFacility {
  id?: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  type: 'hospital' | 'urgent_care' | 'clinic' | 'pharmacy' | 'other';
  phoneNumber?: string;
  website?: string;
  hours?: Record<string, string>;
  averageRating?: number;
  ratingCount?: number;
  ratingSum?: number;
  currentWaitTime?: number;
  waitTimeReports?: number;
  lastWaitTimeUpdate?: Date | any;
  crowdingLevel?: 'low' | 'moderate' | 'high';
}

export interface FacilityReview {
  id?: string;
  facilityId: string;
  userId: string;
  userDisplayName?: string;
  rating: number; // 1-5
  waitTime?: number; // in minutes
  crowdingLevel?: 'low' | 'moderate' | 'high';
  comment?: string;
  timestamp: any; // firebase.firestore.Timestamp
  createdAt?: any;
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
