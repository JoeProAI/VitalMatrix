// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore, GeoPoint } from 'firebase/firestore';

// Export GeoPoint for geolocation features
export { GeoPoint };

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDORZlT5gvr5gmwK1FKywNErqS5FQFkGwQ",
  authDomain: "vitalmatrix-b09c8.firebaseapp.com",
  projectId: "vitalmatrix-b09c8",
  storageBucket: "vitalmatrix-b09c8.appspot.com",
  messagingSenderId: "328594649065",
  appId: "1:328594649065:web:vitalmatrix-b09c8"
};

// Initialize Firebase
console.log('🔥 Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKeyPresent: !!firebaseConfig.apiKey
});

const app = initializeApp(firebaseConfig);
console.log('✅ Firebase app initialized');

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
console.log('🔐 Firebase Auth initialized');

// Set auth persistence to session only (clears on browser close)
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log('🔐 Auth persistence set to session only');
  })
  .catch((error) => {
    console.error('🚨 Error setting auth persistence:', error);
  });

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
console.log('💾 Firestore initialized');

// Add auth state debugging
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('🔐 Firebase Auth: User is signed in:', user.uid);
  } else {
    console.log('🔐 Firebase Auth: No user signed in');
  }
});

export default app;