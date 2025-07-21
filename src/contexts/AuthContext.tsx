import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { createUserProfile } from '../services/userProfileService';

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
  // Session timeout (30 minutes of inactivity)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  const signup = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔐 Starting signup process...');
      console.log('📧 Email:', email);
      console.log('🔐 Auth state before signup:', auth.currentUser ? 'User signed in' : 'No user');
      
      // Clear any existing auth state first
      if (auth.currentUser) {
        console.log('🔄 Signing out existing user before signup...');
        await signOut(auth);
        console.log('✅ Existing user signed out');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ User created:', user.uid);
      
      // Store basic user data in Firestore
      console.log('💾 Creating user document...');
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
      });
      console.log('✅ User document created');
      
      // Create full user profile
      console.log('👤 Creating user profile...');
      await createUserProfile(user);
      console.log('✅ User profile created');
    } catch (error: any) {
      console.error('🚨 Signup error:', error);
      console.error('🚨 Error code:', error.code);
      console.error('🚨 Error message:', error.message);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔐 Starting login process...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User logged in:', userCredential.user.uid);
    } catch (error: any) {
      console.error('🚨 Login error:', error);
      
      // Handle specific case where user signed up with Google but trying to use email/password
      if (error.code === 'auth/invalid-credential') {
        // Check if this email exists with Google provider
        console.log('🔍 Checking if email exists with Google provider...');
        throw new Error('This email is associated with a Google account. Please use "Continue with Google" to sign in.');
      }
      
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      console.log('🔐 Starting Google Sign-In...');
      const provider = new GoogleAuthProvider();
      
      // Optional: Add additional scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      console.log('✅ Google Sign-In successful:', user.uid);
      
      // Check if this is a new user and create profile if needed
      const isNewUser = userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime;
      
      if (isNewUser) {
        console.log('👤 New Google user - creating profile...');
        
        // Store basic user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: 'google',
          createdAt: serverTimestamp(),
        });
        
        // Create full user profile
        await createUserProfile(user);
        console.log('✅ Google user profile created');
      }
    } catch (error: any) {
      console.error('🚨 Google Sign-In error:', error);
      
      // Handle specific Google Sign-In errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by browser. Please allow pop-ups and try again.');
      }
      
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🔐 Starting logout process...');
      
      // Clear all cached data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cached service worker data
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🗑️ Cache cleared');
      }
      
      // Sign out from Firebase
      await signOut(auth);
      console.log('✅ User signed out successfully');
      
      // Force reload to clear any remaining state
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('🚨 Logout error:', error);
      // Force reload even if logout fails
      window.location.reload();
    }
  };
  
  // Check for session timeout
  const checkSessionTimeout = () => {
    if (currentUser && Date.now() - lastActivity > SESSION_TIMEOUT) {
      console.log('⏰ Session timeout - logging out user');
      logout();
    }
  };
  
  // Update last activity time
  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state changed:', user ? 'User signed in' : 'User signed out');
      if (user) {
        console.log('👤 User ID:', user.uid);
        console.log('📧 User email:', user.email);
      }
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error('🚨 Auth state change error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);
  
  // Set up session timeout checking
  useEffect(() => {
    const interval = setInterval(checkSessionTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentUser, lastActivity]);
  
  // Set up activity tracking
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };
    
    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);
  
  // Clear cache on app start if no user is authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      // Clear any stale cache data when no user is authenticated
      localStorage.removeItem('firebase:authUser:' + auth.app.options.apiKey + ':[DEFAULT]');
      sessionStorage.clear();
    }
  }, [loading, currentUser]);

  const value: AuthContextType = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};