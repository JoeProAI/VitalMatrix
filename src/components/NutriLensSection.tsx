import React, { useState, useEffect } from 'react';

const NutriLensSection = () => {
  const [animate, setAnimate] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Simulate scanning animation
  const startScan = () => {
    setScanActive(true);
    setTimeout(() => setScanActive(false), 3000);
  };
  
  // Nutrition data for demo
  const nutritionData = {
    name: "Protein Bar",
    calories: 240,
    protein: 20,
    carbs: 30,
    fat: 8,
    sugar: 6,
    fiber: 9,
    healthScore: 78,
    ingredients: [
      { name: "Whey Protein", safe: true },
      { name: "Almonds", safe: true },
      { name: "Honey", safe: true },
      { name: "Natural Flavors", safe: true },
      { name: "Soy Lecithin", safe: false },
    ],
    allergens: ["Soy", "Milk", "Tree Nuts"]
  };

  return (
    <section id="nutrilens" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-dark-bg-secondary to-dark-bg">
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side: Scanner visualization */}
          <div className={`relative transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-dark-surface border border-neon-purple/30 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg bg-gradient-to-r from-neon-purple to-hot-pink bg-clip-text text-transparent">
                    NutriLens™ Scanner
                  </h3>
                </div>
                <div className="flex items-center text-xs bg-neon-purple/20 text-neon-purple px-2 py-1 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${scanActive ? 'bg-neon-purple animate-pulse' : 'bg-gray-500'} mr-2`}></div>
                  {scanActive ? 'Scanning...' : 'Ready'}
                </div>
              </div>
              
              {/* Scanner preview area */}
              <div className="relative aspect-video bg-dark-bg flex items-center justify-center overflow-hidden">
                {/* Camera frame visual */}
                <div className="absolute inset-4 border-2 border-dashed border-neon-purple/30 rounded-lg"></div>
                
                {/* Scan animation */}
                {scanActive && (
                  <div className="absolute inset-0 z-10">
                    <div className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-neon-purple/20 to-transparent animate-scan"></div>
                  </div>
                )}
                
                {/* Sample product image */}
                <div className="relative w-1/2 h-4/5 bg-gradient-to-b from-dark-surface to-dark-bg-secondary rounded-lg flex items-center justify-center">
                  <div className="w-full h-full rounded-lg flex items-center justify-center text-2xl font-bold text-gray-600">
                    PROTEIN BAR
                  </div>
                  
                  {/* Scan results overlay */}
                  {scanActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full bg-dark-bg/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                        <div className="w-12 h-12 rounded-full border-2 border-neon-purple border-t-transparent animate-spin mb-4"></div>
                        <p className="text-neon-purple">Analyzing nutritional content...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Scanning points */}
                {scanActive && (
                  <>
                    {[...Array(8)].map((_, i) => {
                      const size = Math.random() * 6 + 4;
                      const x = (Math.random() - 0.5) * 240;
                      const y = (Math.random() - 0.5) * 160;
                      
                      return (
                        <div 
                          key={i} 
                          className="absolute bg-neon-purple rounded-full animate-ping opacity-70" 
                          style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            animationDuration: `${Math.random() * 3 + 1}s`,
                            animationDelay: `${i * 0.2}s`
                          }}
                        />
                      );
                    })}
                  </>
                )}
              </div>
              
              {/* Controls */}
              <div className="p-4 flex justify-center">
                <button
                  onClick={startScan}
                  disabled={scanActive}
                  className={`px-6 py-3 rounded-full ${
                    scanActive 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-neon-purple to-hot-pink text-white hover:shadow-lg hover:shadow-neon-purple/20'
                  } transition-all duration-300 flex items-center space-x-2`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{scanActive ? 'Scanning...' : 'Scan Food Item'}</span>
                </button>
              </div>
              
              {/* Nutrition analysis */}
              <div className="p-4 border-t border-gray-800">
                <h4 className="font-semibold mb-3">Scan Analysis</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-dark-bg rounded-lg">
                    <div className="text-2xl font-bold text-neon-purple">{nutritionData.calories}</div>
                    <div className="text-xs text-gray-400">Calories</div>
                  </div>
                  <div className="p-3 bg-dark-bg rounded-lg">
                    <div className="text-2xl font-bold text-neon-purple">{nutritionData.protein}g</div>
                    <div className="text-xs text-gray-400">Protein</div>
                  </div>
                  <div className="p-3 bg-dark-bg rounded-lg">
                    <div className="text-2xl font-bold text-neon-purple">{nutritionData.healthScore}</div>
                    <div className="text-xs text-gray-400">Health Score</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Analysis Card */}
            <div className="mt-6 bg-dark-surface border border-neon-purple/20 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-purple to-hot-pink flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold">AI Nutrition Assistant</h4>
              </div>
              <p className="text-sm text-gray-300">
                "This protein bar has a good nutritional profile with high protein and fiber content. 
                However, I noticed it contains soy lecithin which is on your allergen watch list. 
                Based on your health goals, I'd recommend alternatives with similar protein content but without soy."
              </p>
            </div>
          </div>
          
          {/* Right side: Content */}
          <div className={`transition-all duration-1000 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-block px-4 py-2 rounded-full bg-neon-purple/10 text-neon-purple text-sm font-medium mb-4">
              AI-Powered Nutrition Analysis
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-neon-purple to-hot-pink bg-clip-text text-transparent">
                NutriLens
              </span> Scanner
            </h2>
            
            <p className="text-gray-300 text-lg mb-8">
              Make informed nutritional choices with our advanced AI scanner that instantly analyzes any food product and provides personalized insights.
            </p>
            
            <div className="space-y-6 mb-8">
              {[
                {
                  title: "Instant Nutritional Analysis",
                  description: "Simply point your camera at any food item or barcode to get detailed nutritional information instantly.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                {
                  title: "Personalized Health Insights",
                  description: "Receive tailored recommendations based on your dietary preferences, allergies, and health goals.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )
                },
                {
                  title: "Allergen Alerts & Warnings",
                  description: "Get immediate notifications about potential allergens and ingredients you should avoid.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )
                },
                {
                  title: "Smart Meal Tracking",
                  description: "Effortlessly track your daily nutrition and build a comprehensive food diary with scan history.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  )
                }
              ].map((item, i) => (
                <div key={i} className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neon-purple/20 text-neon-purple">
                      {item.icon}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                    <p className="mt-1 text-gray-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 rounded-full bg-gradient-to-r from-neon-purple to-hot-pink text-white font-medium hover:shadow-glow hover:shadow-neon-purple/30 transition-all duration-300">
                Try NutriLens Now
              </button>
              <button className="px-6 py-3 rounded-full border border-neon-purple/50 text-white font-medium hover:bg-neon-purple/10 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NutriLensSection;
