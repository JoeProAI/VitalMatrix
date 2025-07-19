import React from 'react';

const MinimalTest: React.FC = () => {
  return (
    <div style={{ 
      backgroundColor: '#121827', 
      color: 'white', 
      padding: '20px',
      minHeight: '100vh',
      fontSize: '18px'
    }}>
      <h1 style={{ color: '#3b82f6' }}>Minimal Test Component</h1>
      <p>This is a minimal test to see if React is working at all.</p>
      <p>If you can see this text, React is rendering successfully.</p>
    </div>
  );
};

export default MinimalTest;
