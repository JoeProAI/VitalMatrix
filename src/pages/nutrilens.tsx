import React from 'react';
import Head from 'next/head';
import CleanNutriLensPage from '../features/NutriLens/CleanNutriLensPage';
import { ScanSearch } from 'lucide-react';
import '../styles/nutrilens-clean.css';

const NutriLensRoute = () => {
  return (
    <>
      <Head>
        <title>NutriLens Scanner - Advanced Food Analysis</title>
        <meta name="description" content="Scan food items to get instant nutritional information with AI-powered analysis" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="app-wrapper">
        <header className="app-header">
          <div className="app-logo">
            <ScanSearch size={24} />
            <span>NutriLens</span>
          </div>
          <div className="header-actions">
            <div className="badge badge-primary">AI Enhanced</div>
          </div>
        </header>
        
        <main className="main-container">
          <div className="intro-section">
            <h1 className="text-2xl font-bold mb-2">Food Nutrition Scanner</h1>
            <p className="text-gray-600">Analyze nutritional content of any food item with our advanced AI technology.</p>
          </div>
          
          <CleanNutriLensPage />
        </main>
      </div>
    </>
  );
};

export default NutriLensRoute;
