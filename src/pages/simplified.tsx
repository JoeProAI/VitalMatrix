import React from 'react';
import { ActivityIcon } from '../components/icons';

const SimplifiedSplashPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="mb-10 flex items-center">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
          <ActivityIcon className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-blue-400">
          VitalMatrix
        </span>
      </header>

      <main>
        <section className="mb-16">
          <h1 className="text-4xl font-bold mb-6 text-blue-400">
            VitalMatrix: Healthcare Insights Platform
          </h1>
          <p className="text-xl mb-8">
            Transforming healthcare decisions with community insights and AI nutrition intelligence.
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-medium transition-colors">
            Get Started
          </button>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">Community Pulse</h2>
          <p className="mb-6">
            Real-time insights on ER and urgent care facilities, powered by community reports.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Real-Time Updates</h3>
              <p>View current wait times and facility conditions reported by the community.</p>
            </div>
            <div className="border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Contribute Insights</h3>
              <p>Share your experiences to help others make informed healthcare decisions.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-blue-400">NutriLens Scanner</h2>
          <p className="mb-6">
            AI-powered nutrition analysis that transforms how you make food decisions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Instant Analysis</h3>
              <p>Scan any product barcode for comprehensive nutrition insights in seconds.</p>
            </div>
            <div className="border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Health Scoring</h3>
              <p>Proprietary algorithm rates products based on nutritional value and ingredients.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 pt-10 border-t border-blue-500/30">
        <p className="text-center text-gray-400">
          © 2025 VitalMatrix. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default SimplifiedSplashPage;
