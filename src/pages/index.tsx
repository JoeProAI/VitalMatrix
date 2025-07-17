import React from 'react';
import dynamic from 'next/dynamic';

// Import NutriLensPage with dynamic import to avoid SSR issues with browser APIs
const NutriLensPage = dynamic(
  () => import('../pages/nutrilens'),
  { ssr: false }
);

const Home = () => {
  return (
    <NutriLensPage />
  );
};

export default Home;