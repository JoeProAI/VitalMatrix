import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  
  // Health Profile
  healthProfile: {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    height?: number; // cm
    weight?: number; // kg
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  
  // Nutrition Profile
  nutritionProfile: {
    dietaryRestrictions?: string[];
    nutritionGoals?: string[];
    dailyCalorieTarget?: number;
    macroTargets?: {
      protein: number;
      carbs: number;
      fat: number;
    };
    waterIntakeGoal?: number; // ml
    preferredCuisines?: string[];
  };
  
  // Activity & Preferences
  preferences: {
    preferredFacilityTypes?: string[];
    maxTravelDistance?: number; // km
    notificationsEnabled?: boolean;
    privacyLevel?: 'public' | 'friends' | 'private';
    shareHealthData?: boolean;
    shareNutritionData?: boolean;
  };
  
  // Stats & Analytics
  stats: {
    totalReviews: number;
    totalFacilityVisits: number;
    totalNutritionScans: number;
    averageRatingGiven: number;
    helpfulVotes: number;
    streakDays: number;
  };
}

export interface HealthcareVisit {
  id?: string;
  userId: string;
  facilityId: string;
  facilityName: string;
  visitDate: Date;
  visitType: 'routine' | 'urgent' | 'emergency' | 'followup';
  waitTime?: number;
  rating?: number;
  notes?: string;
  nutritionRecommendations?: string[];
}

export interface NutritionEntry {
  id?: string;
  userId: string;
  timestamp: Date;
  foodItem: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  micronutrients?: Record<string, number>;
  scanMethod: 'barcode' | 'ai_vision' | 'manual';
  confidence?: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

// User Profile Management
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'userProfiles', uid));
    if (userDoc.exists()) {
      return { ...userDoc.data(), uid } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const createUserProfile = async (user: User): Promise<UserProfile> => {
  try {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Anonymous',
      ...(user.photoURL && { photoURL: user.photoURL }),
      createdAt: new Date(),
      lastLoginAt: new Date(),
      healthProfile: {},
      nutritionProfile: {},
      preferences: {
        maxTravelDistance: 25,
        notificationsEnabled: true,
        privacyLevel: 'friends',
        shareHealthData: false,
        shareNutritionData: false,
      },
      stats: {
        totalReviews: 0,
        totalFacilityVisits: 0,
        totalNutritionScans: 0,
        averageRatingGiven: 0,
        helpfulVotes: 0,
        streakDays: 0,
      },
    };

    await setDoc(doc(db, 'userProfiles', user.uid), profile);
    return profile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'userProfiles', uid), {
      ...updates,
      lastLoginAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Healthcare Visit Tracking
export const addHealthcareVisit = async (visit: Omit<HealthcareVisit, 'id'>): Promise<string> => {
  try {
    const visitRef = doc(collection(db, 'healthcareVisits'));
    await setDoc(visitRef, {
      ...visit,
      visitDate: visit.visitDate,
    });

    // Update user stats
    const userRef = doc(db, 'userProfiles', visit.userId);
    await updateDoc(userRef, {
      'stats.totalFacilityVisits': (await getUserProfile(visit.userId))?.stats.totalFacilityVisits + 1 || 1,
    });

    return visitRef.id;
  } catch (error) {
    console.error('Error adding healthcare visit:', error);
    throw error;
  }
};

export const getUserHealthcareVisits = async (uid: string, limitCount = 10): Promise<HealthcareVisit[]> => {
  try {
    const q = query(
      collection(db, 'healthcareVisits'),
      where('userId', '==', uid),
      orderBy('visitDate', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthcareVisit));
  } catch (error) {
    console.error('Error getting healthcare visits:', error);
    throw error;
  }
};

// Nutrition Tracking
export const addNutritionEntry = async (entry: Omit<NutritionEntry, 'id'>): Promise<string> => {
  try {
    const entryRef = doc(collection(db, 'nutritionEntries'));
    
    // Filter out undefined values to prevent Firestore errors
    const cleanEntry: any = {
      userId: entry.userId,
      timestamp: entry.timestamp,
      foodItem: entry.foodItem,
      calories: entry.calories,
      macros: entry.macros,
      scanMethod: entry.scanMethod,
    };
    
    // Only add optional fields if they have valid values
    if (entry.micronutrients && Object.keys(entry.micronutrients).length > 0) {
      cleanEntry.micronutrients = entry.micronutrients;
    }
    if (entry.confidence !== undefined) {
      cleanEntry.confidence = entry.confidence;
    }
    if (entry.mealType) {
      cleanEntry.mealType = entry.mealType;
    }
    
    await setDoc(entryRef, cleanEntry);

    // Update user stats - create profile if it doesn't exist
    const userRef = doc(db, 'userProfiles', entry.userId);
    try {
      const userProfile = await getUserProfile(entry.userId);
      if (userProfile) {
        // Update existing profile
        await updateDoc(userRef, {
          'stats.totalNutritionScans': (userProfile.stats?.totalNutritionScans || 0) + 1,
        });
      } else {
        // Create new profile
        await setDoc(userRef, {
          userId: entry.userId,
          createdAt: new Date(),
          stats: {
            totalNutritionScans: 1,
            totalHealthcareVisits: 0,
            totalActivityLogs: 0,
          },
          preferences: {
            notifications: true,
            dataSharing: false,
          },
        });
      }
    } catch (profileError) {
      console.warn('Could not update user stats:', profileError);
      // Don't fail the nutrition entry if profile update fails
    }

    return entryRef.id;
  } catch (error) {
    console.error('Error adding nutrition entry:', error);
    throw error;
  }
};

export const getUserNutritionEntries = async (
  uid: string, 
  startDate?: Date, 
  endDate?: Date,
  limitCount = 50
): Promise<NutritionEntry[]> => {
  try {
    let q = query(
      collection(db, 'nutritionEntries'),
      where('userId', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    let entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NutritionEntry));

    // Filter by date range if provided
    if (startDate || endDate) {
      entries = entries.filter(entry => {
        const entryDate = entry.timestamp;
        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
      });
    }

    return entries;
  } catch (error) {
    console.error('Error getting nutrition entries:', error);
    throw error;
  }
};

// Analytics & Insights
export const getUserHealthInsights = async (uid: string) => {
  try {
    const [profile, visits, nutrition] = await Promise.all([
      getUserProfile(uid),
      getUserHealthcareVisits(uid, 50),
      getUserNutritionEntries(uid, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Last 30 days
    ]);

    const insights = {
      healthScore: calculateHealthScore(profile, visits, nutrition),
      nutritionScore: calculateNutritionScore(nutrition),
      visitFrequency: calculateVisitFrequency(visits),
      topFacilityTypes: getTopFacilityTypes(visits),
      nutritionTrends: getNutritionTrends(nutrition),
      recommendations: generateRecommendations(profile, visits, nutrition),
    };

    return insights;
  } catch (error) {
    console.error('Error getting user health insights:', error);
    throw error;
  }
};

// Helper functions for analytics
const calculateHealthScore = (profile: UserProfile | null, visits: HealthcareVisit[], nutrition: NutritionEntry[]): number => {
  // Simple scoring algorithm - can be enhanced
  let score = 50; // Base score
  
  if (profile?.healthProfile?.age && profile.healthProfile.age < 65) score += 10;
  if (visits.length > 0 && visits[0].rating && visits[0].rating >= 4) score += 15;
  if (nutrition.length >= 7) score += 20; // Regular nutrition tracking
  if (profile?.stats?.streakDays && profile.stats.streakDays > 7) score += 5;
  
  return Math.min(100, Math.max(0, score));
};

const calculateNutritionScore = (nutrition: NutritionEntry[]): number => {
  if (nutrition.length === 0) return 0;
  
  const avgCalories = nutrition.reduce((sum, entry) => sum + entry.calories, 0) / nutrition.length;
  const proteinRatio = nutrition.reduce((sum, entry) => sum + entry.macros.protein, 0) / nutrition.length;
  
  // Simple scoring based on balanced nutrition
  let score = 50;
  if (avgCalories >= 1500 && avgCalories <= 2500) score += 25;
  if (proteinRatio >= 15) score += 25;
  
  return Math.min(100, Math.max(0, score));
};

const calculateVisitFrequency = (visits: HealthcareVisit[]): string => {
  if (visits.length === 0) return 'No visits';
  if (visits.length >= 4) return 'High';
  if (visits.length >= 2) return 'Moderate';
  return 'Low';
};

const getTopFacilityTypes = (visits: HealthcareVisit[]): string[] => {
  const types = visits.map(v => v.visitType);
  const counts = types.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);
};

const getNutritionTrends = (nutrition: NutritionEntry[]): any => {
  // Calculate weekly trends
  const weeklyCalories = nutrition.reduce((sum, entry) => sum + entry.calories, 0) / 7;
  const weeklyProtein = nutrition.reduce((sum, entry) => sum + entry.macros.protein, 0) / 7;
  
  return {
    avgDailyCalories: Math.round(weeklyCalories),
    avgDailyProtein: Math.round(weeklyProtein),
    scanFrequency: nutrition.length,
  };
};

const generateRecommendations = (profile: UserProfile | null, visits: HealthcareVisit[], nutrition: NutritionEntry[]): string[] => {
  const recommendations: string[] = [];
  
  if (visits.length === 0) {
    recommendations.push('Consider scheduling a routine health checkup');
  }
  
  if (nutrition.length < 7) {
    recommendations.push('Try tracking your nutrition more regularly for better insights');
  }
  
  if (profile && !profile.healthProfile.emergencyContact) {
    recommendations.push('Add an emergency contact to your health profile');
  }
  
  return recommendations;
};
