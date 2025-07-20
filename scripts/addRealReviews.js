// Script to add realistic reviews to existing facilities
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: "vitalmatrix-b09c8.firebaseapp.com",
  projectId: "vitalmatrix-b09c8",
  storageBucket: "vitalmatrix-b09c8.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Realistic review templates
const reviewTemplates = [
  {
    rating: 5,
    comments: [
      "Excellent service! Staff was very professional and the wait time was shorter than expected.",
      "Great experience overall. Clean facility and friendly staff.",
      "Quick service and knowledgeable doctors. Highly recommend!",
      "Very satisfied with the care I received. Will definitely come back."
    ]
  },
  {
    rating: 4,
    comments: [
      "Good service but had to wait a bit longer than posted time.",
      "Professional staff and clean facility. Minor wait but worth it.",
      "Overall positive experience. Staff was helpful and courteous.",
      "Decent service, could improve on wait times but good care."
    ]
  },
  {
    rating: 3,
    comments: [
      "Average experience. Wait time was as expected but service could be better.",
      "Okay service, nothing exceptional but got the job done.",
      "Standard healthcare experience. Room for improvement in efficiency.",
      "Fair service, wait time was reasonable but staff seemed rushed."
    ]
  },
  {
    rating: 2,
    comments: [
      "Long wait time and staff seemed overwhelmed.",
      "Service was slow and facility could be cleaner.",
      "Had to wait much longer than the posted time. Disappointing.",
      "Below average experience. Hope they can improve their service."
    ]
  }
];

// Realistic user names and data
const sampleUsers = [
  { id: 'user1', name: 'Sarah M.', waitTime: 25, crowdingLevel: 'moderate' },
  { id: 'user2', name: 'Mike R.', waitTime: 35, crowdingLevel: 'high' },
  { id: 'user3', name: 'Jennifer L.', waitTime: 15, crowdingLevel: 'low' },
  { id: 'user4', name: 'David K.', waitTime: 45, crowdingLevel: 'high' },
  { id: 'user5', name: 'Lisa P.', waitTime: 20, crowdingLevel: 'moderate' },
  { id: 'user6', name: 'Robert T.', waitTime: 30, crowdingLevel: 'moderate' },
  { id: 'user7', name: 'Amanda S.', waitTime: 40, crowdingLevel: 'high' },
  { id: 'user8', name: 'Chris W.', waitTime: 12, crowdingLevel: 'low' }
];

function getRandomReview() {
  const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
  const comment = template.comments[Math.floor(Math.random() * template.comments.length)];
  const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
  
  return {
    rating: template.rating,
    comment: comment,
    userId: user.id,
    userName: user.name,
    waitTime: user.waitTime,
    crowdingLevel: user.crowdingLevel,
    timestamp: serverTimestamp(),
    createdAt: serverTimestamp()
  };
}

async function addRealReviews() {
  try {
    console.log('📝 Adding realistic reviews to existing facilities...');
    
    // Get all facilities from Firebase
    const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
    console.log(`📊 Found ${facilitiesSnapshot.size} facilities in Firebase`);
    
    if (facilitiesSnapshot.size === 0) {
      console.log('❌ No facilities found in Firebase. Make sure to load facilities first.');
      return;
    }
    
    let reviewCount = 0;
    
    for (const facilityDoc of facilitiesSnapshot.docs) {
      const facilityData = facilityDoc.data();
      const facilityId = facilityDoc.id;
      
      console.log(`📝 Adding reviews for: ${facilityData.name}`);
      
      // Add 2-4 reviews per facility
      const numReviews = Math.floor(Math.random() * 3) + 2; // 2-4 reviews
      
      for (let i = 0; i < numReviews; i++) {
        const review = getRandomReview();
        review.facilityId = facilityId;
        
        // Add review to facilityReviews collection
        await addDoc(collection(db, 'facilityReviews'), review);
        reviewCount++;
        
        console.log(`  ⭐ Added ${review.rating}-star review: "${review.comment.substring(0, 50)}..."`);
        
        // Small delay between reviews
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Delay between facilities
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`🎉 Successfully added ${reviewCount} realistic reviews!`);
    console.log('📱 Users can now see community reviews in Community Pulse');
    
  } catch (error) {
    console.error('❌ Error adding reviews:', error);
    
    if (error.message.includes('index')) {
      console.log('🔧 Index issue: The composite index may still be building');
      console.log('📝 Required index: facilityId (ASC) + timestamp (DESC) + __name__ (DESC)');
    }
    
    if (error.message.includes('permission')) {
      console.log('🔒 Permission error: Make sure Firebase rules allow review creation');
    }
  }
}

addRealReviews();
