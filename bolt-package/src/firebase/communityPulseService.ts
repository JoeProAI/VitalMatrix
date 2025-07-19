import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, limit as firestoreLimit, serverTimestamp, runTransaction } from 'firebase/firestore';
import { GeoFirestore } from 'geofirestore';
import { db, GeoPoint } from './config';
import { HealthcareFacility, FacilityReview, MapPosition } from '../types/communityPulse';

// Initialize GeoFirestore with workaround for Firebase v12
// @ts-ignore - GeoFirestore has compatibility issues with Firebase v12 types
const geofirestore = new GeoFirestore(db);
// @ts-ignore
const facilitiesCollection = geofirestore.collection('facilities');
const reviewsCollection = collection(db, 'reviews');

/**
 * Add a new healthcare facility to the database
 */
export const addFacility = async (facility: HealthcareFacility): Promise<string> => {
  try {
    const docRef = await facilitiesCollection.add({
      ...facility,
      // GeoFirestore requires this exact format for coordinates
      coordinates: new GeoPoint(
        facility.location.latitude, 
        facility.location.longitude
      ) as any,
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
    // @ts-ignore - GeoFirestore typing issue
    const geoQuery = facilitiesCollection.near({ 
      center: new GeoPoint(center.lat, center.lng) as any, 
      radius: radiusKm 
    });
    
    const snapshot = await geoQuery.get();
    // Transform GeoFirestore results to HealthcareFacility objects
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        address: data.address,
        location: data.location,
        type: data.type,
        phoneNumber: data.phoneNumber,
        website: data.website,
        hours: data.hours,
        averageRating: data.averageRating,
        ratingCount: data.ratingCount,
        ratingSum: data.ratingSum,
        currentWaitTime: data.currentWaitTime,
        waitTimeReports: data.waitTimeReports,
        lastWaitTimeUpdate: data.lastWaitTimeUpdate,
        crowdingLevel: data.crowdingLevel
      } as HealthcareFacility;
    });
  } catch (error) {
    console.error('Error getting nearby facilities:', error);
    throw error;
  }
};

/**
 * Add a review for a facility
 */
export const addReview = async (review: FacilityReview): Promise<string> => {
  try {
    // Add the review to the reviews collection
    const reviewData = {
      ...review,
      createdAt: serverTimestamp(),
      timestamp: serverTimestamp()
    };
    
    const reviewRef = await addDoc(reviewsCollection, reviewData);
    
    // Update the facility's rating information
    const facilityRef = doc(db, 'facilities', review.facilityId);
    
    await runTransaction(db, async (transaction) => {
      const facilityDoc = await transaction.get(facilityRef);
      
      if (!facilityDoc.exists()) {
        throw new Error("Facility does not exist!");
      }
      
      const facilityData = facilityDoc.data();
      const currentRatingCount = facilityData.ratingCount || 0;
      const currentRatingSum = facilityData.ratingSum || 0;
      
      transaction.update(facilityRef, {
        ratingCount: currentRatingCount + 1,
        ratingSum: currentRatingSum + review.rating,
        averageRating: (currentRatingSum + review.rating) / (currentRatingCount + 1),
        updatedAt: serverTimestamp()
      });
      
      // If a wait time was provided, update that as well
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
    });
    
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
      reviewsCollection,
      where("facilityId", "==", facilityId),
      orderBy("timestamp", "desc"),
      firestoreLimit(maxResults)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FacilityReview));
  } catch (error) {
    console.error('Error getting facility reviews:', error);
    throw error;
  }
};

/**
 * Update a facility's wait time
 */
export const updateWaitTime = async (
  facilityId: string, 
  waitTime: number, 
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
    }
  } catch (error) {
    console.error('Error updating wait time:', error);
    throw error;
  }
};
