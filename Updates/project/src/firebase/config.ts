// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;