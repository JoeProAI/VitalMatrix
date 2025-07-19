import React from 'react';

const BasicTest: React.FC = () => {
  return (
    <div style={{
      background: '#121827', 
      color: 'white',
      padding: '20px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#3b82f6', marginBottom: '20px' }}>Basic Test Page</h1>
      <p>If you can see this, your React application is working correctly.</p>
      
      <div style={{ 
        background: '#1e293b', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>Environment Status</h2>
        <div>
          <p>NODE_ENV: {import.meta.env.MODE}</p>
          <p>DEV: {import.meta.env.DEV ? 'true' : 'false'}</p>
          <p>Current timestamp: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
};

export default BasicTest;
