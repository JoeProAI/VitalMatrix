import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import UserDashboard from './components/UserDashboard';
import NutriLens from './components/NutriLens';
import UserProfile from './components/UserProfile';
import { IntercomProvider } from './components/IntercomProvider';
import CommunityPulse from './components/CommunityPulse';
import TestCommunityPulse from './components/TestCommunityPulse';
import BasicTest from './components/BasicTest';
import SplashPage from './components/SplashPage';

function App() {
  return (
    <AuthProvider>
      <IntercomProvider>
        <Router>
          <Routes>
            <Route path="/" element={<SplashPage />} />
            <Route path="/login" element={<AuthForm mode="login" />} />
            <Route path="/signup" element={<AuthForm mode="signup" />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/old-dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community-pulse" 
              element={
                <ProtectedRoute>
                  <CommunityPulse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/nutrilens" 
              element={
                <ProtectedRoute>
                  <NutriLens />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test-community-pulse" 
              element={<TestCommunityPulse />}
            />
            <Route 
              path="/basic-test" 
              element={<BasicTest />}
            />
          </Routes>
        </Router>
      </IntercomProvider>
    </AuthProvider>
  );
}

export default App;
