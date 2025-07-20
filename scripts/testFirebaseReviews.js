// Test script to verify Firebase reviews are working
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';

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

async function testReviewSystem() {
  try {
    console.log('🧪 Testing Firebase review system...');
    
    // Test 1: Add a test review
    console.log('📝 Adding test review...');
    const testReview = {
      facilityId: 'test-facility-123',
      userId: 'test-user-123',
      userName: 'Test User',
      rating: 4,
      comment: 'Great service, quick wait time!',
      waitTime: 25,
      crowdingLevel: 'moderate',
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    const reviewRef = await addDoc(collection(db, 'facilityReviews'), testReview);
    console.log('✅ Test review added with ID:', reviewRef.id);
    
    // Test 2: Query reviews (this is where the index error occurs)
    console.log('🔍 Querying reviews...');
    const reviewsQuery = query(
      collection(db, 'facilityReviews'),
      where('facilityId', '==', 'test-facility-123'),
      orderBy('timestamp', 'desc')
    );
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    console.log('✅ Query successful! Found', reviewsSnapshot.size, 'reviews');
    
    reviewsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('📋 Review:', {
        id: doc.id,
        rating: data.rating,
        comment: data.comment,
        waitTime: data.waitTime
      });
    });
    
    console.log('🎉 Firebase review system is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing review system:', error);
    
    if (error.message.includes('index')) {
      console.log('🔧 Index issue detected. The composite index may still be building.');
      console.log('📝 Required index: facilityId (ASC) + timestamp (DESC) + __name__ (DESC)');
      console.log('🔗 Check Firebase Console: https://console.firebase.google.com/project/vitalmatrix-b09c8/firestore/indexes');
    }
  }
}

testReviewSystem();
