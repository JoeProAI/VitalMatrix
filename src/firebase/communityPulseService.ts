import { db, auth } from './config';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, limit as firestoreLimit, serverTimestamp, runTransaction } from 'firebase/firestore';
import { GeoPoint } from 'firebase/firestore';
import { HealthcareFacility, FacilityReview, MapPosition, ActivityLog } from '../types/communityPulse';

// Collection references
const facilitiesCollection = collection(db, 'facilities');
const activityLogsCollection = collection(db, 'user_activity_logs');
const userDashboardCollection = collection(db, 'user_dashboard');

// Helper function to calculate distance between two points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Add a new healthcare facility to the database
 */
export const addFacility = async (facility: HealthcareFacility): Promise<string> => {
  try {
    const docRef = await addDoc(facilitiesCollection, {
      ...facility,
      // Store location as GeoPoint for future geospatial queries
      location: {
        ...facility.location,
        geopoint: new GeoPoint(
          facility.location.latitude, 
          facility.location.longitude
        )
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ratingCount: 0,
      ratingSum: 0,
      averageRating: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding facility:', error);
    throw error;
  }
};

/**
 * Get a facility by ID
 */
export const getFacilityById = async (id: string): Promise<HealthcareFacility | null> => {
  try {
    const docRef = doc(db, 'facilities', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as HealthcareFacility;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting facility:', error);
    throw error;
  }
};

/**
 * Get facilities near a location within a specified radius
 */
export const getNearbyFacilities = async (center: MapPosition, radiusKm: number): Promise<HealthcareFacility[]> => {
  try {
    // Get all facilities and filter by distance
    const snapshot = await getDocs(facilitiesCollection);
    const facilities: HealthcareFacility[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const facility = {
        id: doc.id,
        name: data.name,
        address: data.address,
        location: data.location,
        type: data.type,
        phoneNumber: data.phoneNumber,
        website: data.website,
        hours: data.hours,
        averageRating: data.averageRating || 0,
        ratingCount: data.ratingCount || 0,
        ratingSum: data.ratingSum || 0,
        currentWaitTime: data.currentWaitTime,
        waitTimeReports: data.waitTimeReports || 0,
        lastWaitTimeUpdate: data.lastWaitTimeUpdate,
        crowdingLevel: data.crowdingLevel
      } as HealthcareFacility;
      
      // Calculate distance and filter
      const distance = calculateDistance(
        center.lat, 
        center.lng, 
        facility.location.latitude, 
        facility.location.longitude
      );
      
      if (distance <= radiusKm) {
        facilities.push(facility);
      }
    });
    
    // Sort by distance
    facilities.sort((a, b) => {
      const distA = calculateDistance(center.lat, center.lng, a.location.latitude, a.location.longitude);
      const distB = calculateDistance(center.lat, center.lng, b.location.latitude, b.location.longitude);
      return distA - distB;
    });
    
    return facilities;
  } catch (error) {
    console.error('Error getting nearby facilities:', error);
    throw error;
  }
};

/**
 * Add a review for a healthcare facility
 * @param review The review to add
 * @returns The ID of the new review
 */
export const addFacilityReview = async (review: FacilityReview): Promise<string> => {
  try {
    // Add review timestamp
    review.timestamp = serverTimestamp();
    review.createdAt = new Date();

    // Add the review to facilityReviews collection (matches our security rules)
    const reviewRef = await addDoc(collection(db, 'facilityReviews'), {
      ...review,
      timestamp: serverTimestamp()
    });
    
    // Try to update facility stats if it exists in our facilities collection
    // If not, we'll just store the review (for Google Places facilities)
    try {
      const facilityRef = doc(db, 'facilities', review.facilityId);
      await runTransaction(db, async (transaction) => {
        const facilityDoc = await transaction.get(facilityRef);
        
        if (facilityDoc.exists()) {
          const facilityData = facilityDoc.data() as HealthcareFacility;
          
          // Calculate new average
          const oldRatingSum = facilityData.ratingSum || 0;
          const oldRatingCount = facilityData.ratingCount || 0;
          
          const newRatingSum = oldRatingSum + review.rating;
          const newRatingCount = oldRatingCount + 1;
          const newAverageRating = newRatingSum / newRatingCount;
          
          // Update the facility
          transaction.update(facilityRef, {
            ratingSum: newRatingSum,
            ratingCount: newRatingCount,
            averageRating: newAverageRating,
            updatedAt: serverTimestamp()
          });

          // If wait time was provided, update that too
          if (review.waitTime) {
            const currentWaitTimeReports = facilityData.waitTimeReports || 0;
            const currentWaitTime = facilityData.currentWaitTime || 0;
            
            const newWaitTimeReports = currentWaitTimeReports + 1;
            // Weight more recent reports more heavily
            const newWaitTime = (currentWaitTime * 0.7) + (review.waitTime * 0.3);
            
            transaction.update(facilityRef, {
              waitTimeReports: newWaitTimeReports,
              currentWaitTime: newWaitTime,
              lastWaitTimeUpdate: serverTimestamp(),
              crowdingLevel: review.crowdingLevel || facilityData.crowdingLevel
            });
          }
        }
        // If facility doesn't exist in our collection (Google Places facility),
        // we still save the review but don't update facility stats
      });
    } catch (facilityError) {
      console.log('Facility not in our database (likely Google Places facility), review saved anyway');
    }

    // Log this activity for dashboard integration
    await logUserActivity(review);
    
    return reviewRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

/**
 * Get reviews for a specific facility
 */
export const getFacilityReviews = async (facilityId: string, maxResults = 10): Promise<FacilityReview[]> => {
  try {
    const q = query(
      collection(db, 'facilityReviews'),
      where('facilityId', '==', facilityId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(maxResults)
    );
    
    const snapshot = await getDocs(q);
    const reviews: FacilityReview[] = [];
    
    snapshot.forEach(doc => {
      reviews.push({ id: doc.id, ...doc.data() } as FacilityReview);
    });
    
    return reviews;
  } catch (error) {
    console.error('Error getting facility reviews:', error);
    throw error;
  }
};

/**
 * Check if a wait time has expired and should be reset to 0
 * Wait times expire after twice the posted wait time unless updated
 */
export const checkWaitTimeExpiry = (lastUpdate: any, currentWaitTime: number): boolean => {
  if (!lastUpdate || !currentWaitTime) return false;
  
  // Convert Firestore timestamp to Date
  const lastUpdateTime = lastUpdate.toDate ? lastUpdate.toDate() : new Date(lastUpdate);
  const now = new Date();
  const timeDiffMinutes = (now.getTime() - lastUpdateTime.getTime()) / (1000 * 60);
  
  // Reset if time elapsed is more than twice the posted wait time
  return timeDiffMinutes > (currentWaitTime * 2);
};

/**
 * Reset expired wait times to 0 for a facility
 */
export const resetExpiredWaitTime = async (facilityId: string): Promise<void> => {
  try {
    const facilityRef = doc(db, 'facilities', facilityId);
    await updateDoc(facilityRef, {
      currentWaitTime: 0,
      lastWaitTimeUpdate: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error resetting expired wait time:', error);
    throw error;
  }
};

/**
 * Calculate average wait time from recent reviews
 */
export const calculateWaitTimeFromReviews = async (facilityId: string): Promise<number> => {
  try {
    const reviewsRef = collection(db, 'facilityReviews');
    const q = query(
      reviewsRef,
      where('facilityId', '==', facilityId),
      where('waitTime', '!=', null),
      orderBy('timestamp', 'desc'),
      firestoreLimit(10) // Get last 10 reviews with wait times
    );
    
    const snapshot = await getDocs(q);
    const reviews: FacilityReview[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.waitTime !== undefined && data.waitTime !== null) {
        reviews.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as FacilityReview);
      }
    });
    
    if (reviews.length === 0) {
      return 0; // No wait time data available
    }
    
    // Calculate weighted average - more recent reviews have higher weight
    let totalWeight = 0;
    let weightedSum = 0;
    const now = new Date();
    
    reviews.forEach((review, index) => {
      const hoursAgo = (now.getTime() - review.timestamp.getTime()) / (1000 * 60 * 60);
      // Weight decreases with age: recent reviews (0-2 hours) get full weight,
      // older reviews get progressively less weight
      const ageWeight = Math.max(0.1, 1 - (hoursAgo / 24)); // Minimum 10% weight
      const positionWeight = 1 / (index + 1); // First review gets full weight, others decrease
      const finalWeight = ageWeight * positionWeight;
      
      weightedSum += review.waitTime! * finalWeight;
      totalWeight += finalWeight;
    });
    
    return Math.round(weightedSum / totalWeight);
  } catch (error) {
    console.error('Error calculating wait time from reviews:', error);
    return 0;
  }
};

/**
 * Update facility wait times based on recent reviews
 */
export const updateFacilityWaitTimesFromReviews = async (facilityId: string): Promise<void> => {
  try {
    const calculatedWaitTime = await calculateWaitTimeFromReviews(facilityId);
    const facilityRef = doc(db, 'facilities', facilityId);
    
    await updateDoc(facilityRef, {
      currentWaitTime: calculatedWaitTime,
      lastWaitTimeUpdate: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`📊 Updated wait time for facility ${facilityId}: ${calculatedWaitTime} minutes`);
  } catch (error) {
    console.error('Error updating facility wait times from reviews:', error);
  }
};

/**
 * Update a facility's wait time
 */
export const updateWaitTime = async (
  facilityId: string, 
  waitTime: number, 
  userId: string,
  crowdingLevel?: 'low' | 'moderate' | 'high'
): Promise<void> => {
  try {
    const facilityRef = doc(db, 'facilities', facilityId);
    const facilitySnap = await getDoc(facilityRef);
    
    if (facilitySnap.exists()) {
      const data = facilitySnap.data();
      const currentWaitTimeReports = data.waitTimeReports || 0;
      const currentWaitTime = data.currentWaitTime || 0;
      
      const newWaitTimeReports = currentWaitTimeReports + 1;
      // Weight more recent reports more heavily
      const newWaitTime = (currentWaitTime * 0.7) + (waitTime * 0.3);
      
      await updateDoc(facilityRef, {
        waitTimeReports: newWaitTimeReports,
        currentWaitTime: newWaitTime,
        lastWaitTimeUpdate: serverTimestamp(),
        crowdingLevel: crowdingLevel || data.crowdingLevel,
        updatedAt: serverTimestamp()
      });
      
      // Log this activity for dashboard integration
      const facility = data as HealthcareFacility;
      await logUserActivity({
        userId,
        facilityId,
        facilityName: facility.name,
        waitTime,
        crowdingLevel
      });
    }
  } catch (error) {
    console.error('Error updating wait time:', error);
    throw error;
  }
};

/**
 * Log user activity for dashboard integration with Bolt.new
 * This enables a unified user experience by tracking Community Pulse 
 * interactions in the main dashboard
 */
export const logUserActivity = async (
  activity: FacilityReview | {
    userId: string;
    facilityId: string;
    facilityName?: string;
    waitTime?: number;
    crowdingLevel?: 'low' | 'moderate' | 'high';
  }
): Promise<void> => {
  try {
    // Determine activity type
    let activityType: 'review' | 'waittime' | 'facility_view';
    let facilityName: string;
    let details: any = {};
    
    if ('rating' in activity) {
      // This is a review
      activityType = 'review';
      details = {
        rating: activity.rating,
        waitTime: activity.waitTime,
        crowdingLevel: activity.crowdingLevel,
        comment: activity.comment
      };
      
      // Get facility name if needed
      if (!activity.userDisplayName) {
        const currentUser = auth.currentUser;
        if (currentUser?.displayName) {
          details.userDisplayName = currentUser.displayName;
        }
      }
      
      // Get facility name
      const facility = await getFacilityById(activity.facilityId);
      facilityName = facility?.name || 'Unknown Facility';
    } else {
      // This is a wait time update
      activityType = 'waittime';
      details = {
        waitTime: activity.waitTime,
        crowdingLevel: activity.crowdingLevel
      };
      facilityName = activity.facilityName || (await getFacilityById(activity.facilityId))?.name || 'Unknown Facility';
    }
    
    // Create the activity log entry
    const activityLog: ActivityLog = {
      userId: activity.userId,
      type: activityType,
      facilityId: activity.facilityId,
      facilityName,
      timestamp: serverTimestamp(),
      details,
      createdAt: new Date()
    };
    
    // Add to activity logs collection
    await addDoc(activityLogsCollection, activityLog);
    
    // Update user dashboard collection for quick access
    const dashboardRef = doc(userDashboardCollection, activity.userId);
    const dashboardSnap = await getDoc(dashboardRef);
    
    if (dashboardSnap.exists()) {
      // Add to existing dashboard
      const dashboardData = dashboardSnap.data();
      const activities = dashboardData.communityPulseActivities || [];
      activities.unshift({
        type: activityType,
        facilityName,
        timestamp: new Date(),
        details
      });
      
      // Limit to the latest 10 activities
      if (activities.length > 10) activities.length = 10;
      
      await updateDoc(dashboardRef, {
        communityPulseActivities: activities,
        lastCommunityPulseActivity: new Date()
      });
    } else {
      // Create new dashboard entry
      await addDoc(userDashboardCollection, {
        userId: activity.userId,
        communityPulseActivities: [{
          type: activityType,
          facilityName,
          timestamp: new Date(),
          details
        }],
        lastCommunityPulseActivity: new Date(),
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error logging user activity:', error);
    // Non-critical error, don't throw
  }
};
