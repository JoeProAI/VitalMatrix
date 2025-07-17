import React from 'react';
import Head from 'next/head';
import NutriLensPage from '../features/NutriLens/NutriLensPage';
import { ScanSearch, Apple, Camera } from 'lucide-react';

const NutriLensRoute = () => {
  return (
    <>
      <Head>
        <title>NutriLens Scanner - Advanced Food Analysis</title>
        <meta name="description" content="Scan food items to get instant nutritional information with AI-powered analysis" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="nutrilens-container">
        <header className="app-header">
          <div className="app-logo">
            <ScanSearch size={28} />
            <span>NutriLens</span>
          </div>
          <div className="header-actions">
            <div className="badge badge-primary">AI Enhanced</div>
          </div>
        </header>
        
        <main className="main-container">
          <div className="intro-section mb-6">
            <h1 className="text-2xl font-bold mb-2">AI-Powered Food Scanner</h1>
            <p className="text-gray-600">Scan any food item to instantly analyze its nutritional content with our advanced AI technology.</p>
          </div>
          
          <NutriLensPage />
        </main>
      </div>
    </>
  );
};

export default NutriLensRoute;
