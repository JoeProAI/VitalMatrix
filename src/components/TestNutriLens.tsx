import React, { useState } from 'react';
import {
  Camera,
  Scan,
  Upload,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
  Heart,
  Activity,
  Target,
  Award,
  Brain,
  Utensils,
  BarChart3,
  Calendar,
  Clock,
  Info
} from 'lucide-react';

const TestNutriLens: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'history' | 'insights' | 'goals'>('scan');
  const [scanMode, setScanMode] = useState<'barcode' | 'camera' | 'voice'>('barcode');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert(`Scanning barcode: ${barcodeInput}`);
      setBarcodeInput('');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#2a2f3e] text-white">
      {/* Header */}
      <div className="bg-[#1e293b] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Scan className="h-8 w-8 text-[#3b82f6] mr-3" />
              <h1 className="text-xl font-bold">NutriLens AI Scanner</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-300">
                <Activity className="h-4 w-4 mr-1" />
                <span>Test Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#1e293b] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'scan', label: 'Scan Food', icon: Scan },
              { id: 'history', label: 'History', icon: Clock },
              { id: 'insights', label: 'AI Insights', icon: Brain },
              { id: 'goals', label: 'Health Goals', icon: Target }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-[#3b82f6] text-[#3b82f6]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scan' && (
          <div className="space-y-6">
            {/* Scan Mode Selector */}
            <div className="bg-[#1e293b] rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Choose Scan Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'barcode', label: 'Barcode Scanner', icon: Scan, desc: 'Scan product barcodes' },
                  { id: 'camera', label: 'Camera Analysis', icon: Camera, desc: 'Analyze food with AI' },
                  { id: 'voice', label: 'Voice Input', icon: Upload, desc: 'Describe your food' }
                ].map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => setScanMode(id as any)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      scanMode === id
                        ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <Icon className="h-8 w-8 mx-auto mb-2 text-[#3b82f6]" />
                    <h3 className="font-medium">{label}</h3>
                    <p className="text-sm text-gray-400 mt-1">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Barcode Input */}
            {scanMode === 'barcode' && (
              <div className="bg-[#1e293b] rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Barcode Scanner</h3>
                <form onSubmit={handleBarcodeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Enter Barcode Number
                    </label>
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="e.g., 123456789012"
                      className="w-full px-3 py-2 bg-[#121827] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center text-red-400 text-sm">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !barcodeInput.trim()}
                    className="w-full bg-[#3b82f6] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Scanning...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Scan className="h-4 w-4 mr-2" />
                        Scan Product
                      </div>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Camera Mode */}
            {scanMode === 'camera' && (
              <div className="bg-[#1e293b] rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Camera Food Analysis</h3>
                <div className="text-center py-8">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Camera functionality coming soon!</p>
                  <button className="bg-[#3b82f6] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#2563eb] transition-colors">
                    Enable Camera
                  </button>
                </div>
              </div>
            )}

            {/* Voice Mode */}
            {scanMode === 'voice' && (
              <div className="bg-[#1e293b] rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Voice Food Input</h3>
                <div className="text-center py-8">
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Voice input functionality coming soon!</p>
                  <button className="bg-[#3b82f6] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#2563eb] transition-colors">
                    Start Recording
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-[#1e293b] rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Scan History</h3>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No scan history yet. Start scanning to see your food analysis!</p>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="bg-[#1e293b] rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">AI Health Insights</h3>
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Start scanning foods to get personalized AI insights!</p>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="bg-[#1e293b] rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Health Goals</h3>
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Set your health goals to get personalized recommendations!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestNutriLens;
