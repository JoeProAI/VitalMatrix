// Script to add test wait times to facilities for demo purposes
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFaFPJWjNYfKWKqEhPOqhJHBFJqKWKqEh",
  authDomain: "vitalmatrix-b09c8.firebaseapp.com",
  projectId: "vitalmatrix-b09c8",
  storageBucket: "vitalmatrix-b09c8.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestWaitTimes() {
  try {
    console.log('🏥 Adding test wait times to facilities...');
    
    // Get all facilities
    const facilitiesQuery = query(collection(db, 'facilities'));
    const facilitiesSnapshot = await getDocs(facilitiesQuery);
    
    const testWaitTimes = [15, 30, 45, 60, 20, 35, 50, 25, 40, 55];
    const crowdingLevels = ['low', 'moderate', 'high'];
    
    let count = 0;
    for (const facilityDoc of facilitiesSnapshot.docs) {
      if (count >= 10) break; // Only update first 10 facilities
      
      const waitTime = testWaitTimes[count % testWaitTimes.length];
      const crowdingLevel = crowdingLevels[count % crowdingLevels.length];
      
      await updateDoc(doc(db, 'facilities', facilityDoc.id), {
        currentWaitTime: waitTime,
        lastWaitTimeUpdate: new Date(),
        crowdingLevel: crowdingLevel,
        waitTimeReports: 1,
        updatedAt: new Date()
      });
      
      console.log(`✅ Updated ${facilityDoc.data().name}: ${waitTime} min wait, ${crowdingLevel} crowding`);
      count++;
    }
    
    console.log(`🎉 Successfully added test wait times to ${count} facilities!`);
  } catch (error) {
    console.error('❌ Error adding test wait times:', error);
  }
}

addTestWaitTimes();
