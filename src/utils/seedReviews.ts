// Utility to seed initial reviews for demonstration
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

interface SeedReview {
  rating: number;
  comment: string;
  userName: string;
  waitTime: number;
  crowdingLevel: 'low' | 'moderate' | 'high';
}

// Sample realistic reviews
const sampleReviews: SeedReview[] = [
  {
    rating: 5,
    comment: "Excellent service! Staff was very professional and the wait time was shorter than expected.",
    userName: "Sarah M.",
    waitTime: 25,
    crowdingLevel: 'moderate'
  },
  {
    rating: 4,
    comment: "Good service but had to wait a bit longer than posted time. Overall positive experience.",
    userName: "Mike R.",
    waitTime: 35,
    crowdingLevel: 'high'
  },
  {
    rating: 5,
    comment: "Great experience overall. Clean facility and friendly staff. Highly recommend!",
    userName: "Jennifer L.",
    waitTime: 15,
    crowdingLevel: 'low'
  },
  {
    rating: 3,
    comment: "Average experience. Wait time was as expected but service could be better.",
    userName: "David K.",
    waitTime: 45,
    crowdingLevel: 'high'
  },
  {
    rating: 4,
    comment: "Professional staff and clean facility. Minor wait but worth it for the quality of care.",
    userName: "Lisa P.",
    waitTime: 20,
    crowdingLevel: 'moderate'
  },
  {
    rating: 2,
    comment: "Long wait time and staff seemed overwhelmed. Hope they can improve their service.",
    userName: "Robert T.",
    waitTime: 60,
    crowdingLevel: 'high'
  }
];

export const seedFacilityReviews = async (facilityId: string, userId: string, numReviews: number = 3): Promise<void> => {
  try {
    // Select random reviews
    const selectedReviews = sampleReviews
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(numReviews, sampleReviews.length));

    for (const review of selectedReviews) {
      await addDoc(collection(db, 'facilityReviews'), {
        facilityId,
        userId: `seed_${Math.random().toString(36).substr(2, 9)}`, // Generate fake user ID
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
        waitTime: review.waitTime,
        crowdingLevel: review.crowdingLevel,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      });
    }

    console.log(`✅ Seeded ${selectedReviews.length} reviews for facility ${facilityId}`);
  } catch (error) {
    console.error('Error seeding reviews:', error);
    throw error;
  }
};

export const shouldSeedReviews = (facilityId: string): boolean => {
  // Check if we've already seeded reviews for this facility
  const seededFacilities = JSON.parse(localStorage.getItem('seededFacilities') || '[]');
  return !seededFacilities.includes(facilityId);
};

export const markFacilityAsSeeded = (facilityId: string): void => {
  const seededFacilities = JSON.parse(localStorage.getItem('seededFacilities') || '[]');
  if (!seededFacilities.includes(facilityId)) {
    seededFacilities.push(facilityId);
    localStorage.setItem('seededFacilities', JSON.stringify(seededFacilities));
  }
};
