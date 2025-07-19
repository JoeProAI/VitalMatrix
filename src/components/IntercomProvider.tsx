import React, { useEffect } from 'react';
import Intercom from '@intercom/messenger-js-sdk';

interface IntercomProviderProps {
  children: React.ReactNode;
}

export const IntercomProvider: React.FC<IntercomProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize Intercom
    Intercom({
      app_id: 'v09kgk9s',
      // For now, we'll use anonymous users since there's no auth system
      // When you add user authentication, replace these with actual user data
      user_id: 'anonymous_user', // Replace with actual user.id when auth is implemented
      name: 'VitalMatrix User', // Replace with actual user.name when auth is implemented
      email: 'user@example.com', // Replace with actual user.email when auth is implemented
      created_at: Math.floor(Date.now() / 1000), // Current timestamp as fallback
    });

    // Cleanup function to shutdown Intercom when component unmounts
    return () => {
      if (window.Intercom) {
        window.Intercom('shutdown');
      }
    };
  }, []);

  return <>{children}</>;
};