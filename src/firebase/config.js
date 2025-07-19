// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDORZlT5gvr5gmwK1FKywNErqS5FQFkGwQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vitalmatrix-b09c8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vitalmatrix-b09c8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vitalmatrix-b09c8.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "328594649065",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:328594649065:web:vitalmatrix-b09c8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };