import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-white p-8">
      <h1 className="text-4xl font-bold text-electric-blue mb-4">Test Page</h1>
      <p className="mb-4">This is a simple test page to verify styling and rendering.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        <div className="bg-dark-bg-secondary p-6 rounded-lg border border-neon-purple/30">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
            Test Card 1
          </h2>
          <p className="text-gray-300">
            This card uses Tailwind classes and theme colors to verify styling works.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-dark-bg to-dark-bg-secondary p-6 rounded-lg border border-electric-blue/30">
          <h2 className="text-2xl font-bold mb-2 text-hot-pink">
            Test Card 2
          </h2>
          <p className="text-gray-300">
            This card uses different gradient and theme colors.
          </p>
        </div>
      </div>
      
      <button className="bg-gradient-to-r from-electric-blue to-neon-purple px-6 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-300">
        Test Button
      </button>
    </div>
  );
};

export default TestPage;
