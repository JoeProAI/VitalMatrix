export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height?: number; // in cm
  weight?: number; // in kg
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  
  // Health Information
  allergies: string[];
  dietaryRestrictions: string[];
  medicalConditions: string[];
  medications: string[];
  
  // Goals and Preferences
  healthGoals: string[];
  nutritionGoals: {
    dailyCalories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  
  // Privacy Settings
  privacySettings: {
    shareProfile: boolean;
    shareHistory: boolean;
    allowAnalytics: boolean;
    marketingEmails: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserInteraction {
  id: string;
  userId: string;
  type: 'nutriscan' | 'community_pulse' | 'review' | 'wait_time_update' | 'profile_update';
  action: string;
  data: any;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: Date;
  sessionId?: string;
}

export interface NutriScanHistory {
  id: string;
  userId: string;
  productName: string;
  barcode?: string;
  imageUrl?: string;
  nutritionData: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    healthScore?: number;
    ingredients?: string[];
    allergens?: string[];
    warnings?: string[];
  };
  userRating?: number;
  userNotes?: string;
  scannedAt: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface HealthInsight {
  id: string;
  userId: string;
  type: 'nutrition' | 'activity' | 'health_trend' | 'goal_progress' | 'recommendation';
  title: string;
  description: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  generatedAt: Date;
  expiresAt?: Date;
}

export interface UserGoal {
  id: string;
  userId: string;
  type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'nutrition' | 'activity' | 'health_metric';
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  units: {
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft_in';
    temperature: 'celsius' | 'fahrenheit';
  };
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    healthInsights: boolean;
    communityUpdates: boolean;
    goalReminders: boolean;
  };
}
