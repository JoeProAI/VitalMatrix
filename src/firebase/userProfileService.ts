import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { 
  UserProfile, 
  UserInteraction, 
  NutriScanHistory, 
  HealthInsight, 
  UserGoal
} from '../types/userProfile';

// User Profile Management
export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    const defaultProfile: UserProfile = {
      id: userId,
      userId,
      email: profileData.email || '',
      displayName: profileData.displayName || '',
      allergies: [],
      dietaryRestrictions: [],
      medicalConditions: [],
      medications: [],
      healthGoals: [],
      nutritionGoals: {},
      privacySettings: {
        shareProfile: false,
        shareHistory: false,
        allowAnalytics: true,
        marketingEmails: false
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...profileData
    };
    
    await setDoc(userProfileRef, {
      ...defaultProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    const userProfileSnap = await getDoc(userProfileRef);
    
    if (userProfileSnap.exists()) {
      const data = userProfileSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate(),
        dateOfBirth: data.dateOfBirth?.toDate()
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    await updateDoc(userProfileRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    await updateDoc(userProfileRef, {
      lastLoginAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
};

// User Interaction Tracking
export const logUserInteraction = async (interaction: Omit<UserInteraction, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const interactionsRef = collection(db, 'userInteractions');
    await addDoc(interactionsRef, {
      ...interaction,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging user interaction:', error);
    throw error;
  }
};

export const getUserInteractions = async (
  userId: string, 
  limitCount: number = 50,
  type?: string
): Promise<UserInteraction[]> => {
  try {
    let q = query(
      collection(db, 'userInteractions'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    if (type) {
      q = query(
        collection(db, 'userInteractions'),
        where('userId', '==', userId),
        where('type', '==', type),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as UserInteraction[];
  } catch (error) {
    console.error('Error getting user interactions:', error);
    throw error;
  }
};

// NutriScan History
export const saveNutriScanHistory = async (scanData: Omit<NutriScanHistory, 'id'>): Promise<string> => {
  try {
    const historyRef = collection(db, 'nutriScanHistory');
    const docRef = await addDoc(historyRef, {
      ...scanData,
      scannedAt: serverTimestamp()
    });
    
    // Also log as user interaction
    await logUserInteraction({
      userId: scanData.userId,
      type: 'nutriscan',
      action: 'product_scanned',
      data: {
        productName: scanData.productName,
        barcode: scanData.barcode,
        healthScore: scanData.nutritionData.healthScore,
        allergens: scanData.nutritionData.allergens
      },
      location: scanData.location
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving NutriScan history:', error);
    throw error;
  }
};

export const getNutriScanHistory = async (
  userId: string, 
  limitCount: number = 50
): Promise<NutriScanHistory[]> => {
  try {
    const q = query(
      collection(db, 'nutriScanHistory'),
      where('userId', '==', userId),
      orderBy('scannedAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scannedAt: doc.data().scannedAt?.toDate() || new Date()
    })) as NutriScanHistory[];
  } catch (error) {
    console.error('Error getting NutriScan history:', error);
    throw error;
  }
};

// Health Insights
export const generateHealthInsight = async (insight: Omit<HealthInsight, 'id'>): Promise<string> => {
  try {
    const insightsRef = collection(db, 'healthInsights');
    const docRef = await addDoc(insightsRef, {
      ...insight,
      generatedAt: serverTimestamp(),
      expiresAt: insight.expiresAt ? Timestamp.fromDate(insight.expiresAt) : null
    });
    return docRef.id;
  } catch (error) {
    console.error('Error generating health insight:', error);
    throw error;
  }
};

export const getUserHealthInsights = async (
  userId: string, 
  limitCount: number = 20,
  unreadOnly: boolean = false
): Promise<HealthInsight[]> => {
  try {
    let q = query(
      collection(db, 'healthInsights'),
      where('userId', '==', userId),
      orderBy('generatedAt', 'desc'),
      limit(limitCount)
    );
    
    if (unreadOnly) {
      q = query(
        collection(db, 'healthInsights'),
        where('userId', '==', userId),
        where('isRead', '==', false),
        orderBy('generatedAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      generatedAt: doc.data().generatedAt?.toDate() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate()
    })) as HealthInsight[];
  } catch (error) {
    console.error('Error getting health insights:', error);
    throw error;
  }
};

export const markInsightAsRead = async (insightId: string): Promise<void> => {
  try {
    const insightRef = doc(db, 'healthInsights', insightId);
    await updateDoc(insightRef, {
      isRead: true
    });
  } catch (error) {
    console.error('Error marking insight as read:', error);
    throw error;
  }
};

// User Goals
export const createUserGoal = async (goal: Omit<UserGoal, 'id'>): Promise<string> => {
  try {
    const goalsRef = collection(db, 'userGoals');
    const docRef = await addDoc(goalsRef, {
      ...goal,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user goal:', error);
    throw error;
  }
};

export const getUserGoals = async (userId: string, activeOnly: boolean = true): Promise<UserGoal[]> => {
  try {
    let q = query(
      collection(db, 'userGoals'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (activeOnly) {
      q = query(
        collection(db, 'userGoals'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      targetDate: doc.data().targetDate?.toDate()
    })) as UserGoal[];
  } catch (error) {
    console.error('Error getting user goals:', error);
    throw error;
  }
};

export const updateUserGoal = async (goalId: string, updates: Partial<UserGoal>): Promise<void> => {
  try {
    const goalRef = doc(db, 'userGoals', goalId);
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user goal:', error);
    throw error;
  }
};

// Allergy and Warning System
export const checkAllergenWarnings = async (
  userId: string, 
  ingredients: string[], 
  allergens: string[]
): Promise<{ hasWarnings: boolean; warnings: string[] }> => {
  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return { hasWarnings: false, warnings: [] };
    }
    
    const userAllergies = userProfile.allergies.map(a => a.toLowerCase());
    const userRestrictions = userProfile.dietaryRestrictions.map(r => r.toLowerCase());
    
    const warnings: string[] = [];
    
    // Check for allergen matches
    allergens.forEach(allergen => {
      if (userAllergies.includes(allergen.toLowerCase())) {
        warnings.push(`⚠️ ALLERGEN ALERT: Contains ${allergen}`);
      }
    });
    
    // Check ingredients against allergies
    ingredients.forEach(ingredient => {
      userAllergies.forEach(allergy => {
        if (ingredient.toLowerCase().includes(allergy.toLowerCase())) {
          warnings.push(`⚠️ INGREDIENT ALERT: Contains ${ingredient} (${allergy} allergy)`);
        }
      });
    });
    
    // Check dietary restrictions
    ingredients.forEach(ingredient => {
      userRestrictions.forEach(restriction => {
        if (ingredient.toLowerCase().includes(restriction.toLowerCase())) {
          warnings.push(`ℹ️ DIETARY NOTICE: Contains ${ingredient} (${restriction} restriction)`);
        }
      });
    });
    
    return {
      hasWarnings: warnings.length > 0,
      warnings: [...new Set(warnings)] // Remove duplicates
    };
  } catch (error) {
    console.error('Error checking allergen warnings:', error);
    return { hasWarnings: false, warnings: [] };
  }
};

// Analytics and Insights Generation
export const generatePersonalizedInsights = async (userId: string): Promise<void> => {
  try {
    const userProfile = await getUserProfile(userId);
    const scanHistory = await getNutriScanHistory(userId, 30); // Last 30 scans
    
    if (!userProfile || scanHistory.length === 0) return;
    
    // Generate nutrition trend insights
    const avgCalories = scanHistory.reduce((sum, scan) => 
      sum + (scan.nutritionData.calories || 0), 0) / scanHistory.length;
    
    if (avgCalories > 0) {
      await generateHealthInsight({
        userId,
        type: 'nutrition',
        title: 'Weekly Nutrition Trend',
        description: `Your average scanned product contains ${Math.round(avgCalories)} calories. ${
          avgCalories > 300 ? 'Consider looking for lower-calorie alternatives.' : 
          'Great job choosing moderate-calorie options!'
        }`,
        data: { avgCalories, scanCount: scanHistory.length },
        priority: avgCalories > 400 ? 'medium' : 'low',
        isRead: false,
        generatedAt: new Date()
      });
    }
    
    // Generate goal progress insights
    const goals = await getUserGoals(userId);
    for (const goal of goals) {
      const progress = (goal.currentValue / goal.targetValue) * 100;
      if (progress >= 80) {
        await generateHealthInsight({
          userId,
          type: 'goal_progress',
          title: `${goal.title} - Almost There!`,
          description: `You're ${Math.round(progress)}% towards your goal. Keep it up!`,
          data: { goalId: goal.id, progress },
          priority: 'medium',
          isRead: false,
          generatedAt: new Date()
        });
      }
    }
    
  } catch (error) {
    console.error('Error generating personalized insights:', error);
  }
};
