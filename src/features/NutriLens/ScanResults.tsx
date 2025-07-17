import React from 'react';
import { Heart, Shield, Star } from 'lucide-react';

export interface NutritionData {
  foodName: string;
  healthScore: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  ingredients?: string[];
  allergens?: string[];
  healthBenefits?: string[];
  recommendations?: string;
  // Advanced health metrics
  inflammatoryIndex?: number;
  glycemicLoad?: number;
  nutrientDensity?: number;
  // Grok AI analysis
  grokAnalysis?: string;
  enhancedBy?: string;
  detectedFoodItems?: Array<{name: string; confidence: number; portion?: string}>;
}

interface ScanResultsProps {
  data: NutritionData | null;
  onReset: () => void;
  imageUrl?: string;
  scanSource?: string;
  barcode?: string | null;
}

const ScanResults: React.FC<ScanResultsProps> = ({ data, onReset, imageUrl, scanSource, barcode }) => {
  if (!data) return null;
  
  const scoreColor = () => {
    if (data.healthScore >= 80) return 'text-green-400';
    if (data.healthScore >= 60) return 'text-yellow-400';
    return 'text-hot-pink';
  };
  
  const scoreGradient = () => {
    if (data.healthScore >= 80) return 'from-green-400 to-neon-green';
    if (data.healthScore >= 60) return 'from-yellow-400 to-amber-300';
    return 'from-hot-pink to-red-500';
  };
  
  const scoreProgress = {
    background: `conic-gradient(currentColor ${data.healthScore}%, transparent 0)`,
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dark-surface border border-electric-blue/20 rounded-xl overflow-hidden shadow-lg shadow-electric-blue/10">
        <div className="p-4 border-b border-electric-blue/20 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-electric-blue" />
            <span>Nutrition Analysis</span>
          </h2>
          
          <button 
            onClick={onReset}
            className="text-gray-400 hover:text-white px-2 py-1 rounded text-sm"
          >
            New Scan
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="col-span-1">
            {imageUrl && (
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                <img 
                  src={imageUrl} 
                  alt={data.foodName} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          
          <div className="col-span-2">
            <h3 className="text-xl font-bold text-white">{data.foodName}</h3>
            
            {barcode && (
              <div className="text-xs text-electric-blue mb-1">Barcode: {barcode}</div>
            )}
            
            {scanSource && (
              <div className="text-xs text-gray-400 mb-1">Source: {scanSource}</div>
            )}
            
            <div className="flex items-center mt-2">
              <div className={`relative w-14 h-14 flex items-center justify-center ${scoreColor()} rounded-full`} 
                style={scoreProgress as React.CSSProperties}>
                <div className="absolute inset-1 rounded-full bg-dark-surface flex items-center justify-center">
                  <span className="font-bold text-lg">{data.healthScore}</span>
                </div>
              </div>
              
              <div className="ml-3">
                <div className={`text-sm font-medium ${scoreColor()}`}>Health Score</div>
                <div className={`h-2 w-24 mt-1 rounded-full bg-gray-700 overflow-hidden`}>
                  <div 
                    className={`h-full bg-gradient-to-r ${scoreGradient()}`}
                    style={{ width: `${data.healthScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-electric-blue/20 bg-dark-bg/50">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="rounded-lg bg-dark-bg p-3">
              <div className="text-xs text-gray-400">Calories</div>
              <div className="text-lg font-bold text-white">{data.calories}</div>
            </div>
            <div className="rounded-lg bg-dark-bg p-3">
              <div className="text-xs text-gray-400">Protein</div>
              <div className="text-lg font-bold text-neon-purple">{data.protein}g</div>
            </div>
            <div className="rounded-lg bg-dark-bg p-3">
              <div className="text-xs text-gray-400">Carbs</div>
              <div className="text-lg font-bold text-electric-blue">{data.carbs}g</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg bg-dark-bg p-3">
              <div className="text-xs text-gray-400">Fat</div>
              <div className="text-sm font-bold text-white">{data.fat}g</div>
            </div>
            <div className="rounded-lg bg-dark-bg p-3">
              <div className="text-xs text-gray-400">Sugar</div>
              <div className="text-sm font-bold text-white">{data.sugar}g</div>
            </div>
            <div className="rounded-lg bg-dark-bg p-3">
              <div className="text-xs text-gray-400">Fiber</div>
              <div className="text-sm font-bold text-white">{data.fiber}g</div>
            </div>
            <div className="rounded-lg bg-dark-bg p-3">
              <div className="text-xs text-gray-400">Sodium</div>
              <div className="text-sm font-bold text-white">{data.sodium}mg</div>
            </div>
          </div>
          
          {data.allergens && data.allergens.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-1">
                <Shield className="h-4 w-4 text-hot-pink" />
                <span className="text-sm font-medium text-hot-pink">Allergen & Health Alerts</span>
              </div>
              <div className="text-sm bg-dark-bg rounded-lg p-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {data.allergens.map((allergen, i) => (
                    <span key={i} className="px-2 py-1 bg-hot-pink/10 border border-hot-pink/20 rounded text-hot-pink text-xs font-medium">
                      {allergen}
                    </span>
                  ))}
                </div>
                <p className="text-gray-300 text-xs mt-2">
                  People with food allergies or sensitivities should exercise caution with this food.
                </p>
              </div>
            </div>
          )}
          
          {/* Advanced Health Metrics Section */}
          {/* Grok AI Analysis Section */}
          {data.grokAnalysis && (
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-4 w-4 text-neon-purple" />
                <span className="text-sm font-medium text-neon-purple">Grok AI Analysis</span>
                {data.enhancedBy && (
                  <span className="text-xs bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded-full ml-auto">
                    Enhanced by {data.enhancedBy}
                  </span>
                )}
              </div>
              <div className="bg-dark-bg rounded-lg p-3">
                <p className="text-sm text-gray-300">{data.grokAnalysis}</p>
                
                {data.detectedFoodItems && data.detectedFoodItems.length > 1 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-400 mb-1">Detected Items:</div>
                    <div className="flex flex-wrap gap-2">
                      {data.detectedFoodItems.map((item, i) => (
                        <span key={i} 
                          className="px-2 py-1 bg-electric-blue/10 border border-electric-blue/20 rounded text-electric-blue text-xs font-medium flex items-center gap-1">
                          {item.name}
                          <span className="text-xxs bg-electric-blue/20 px-1 rounded">
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {(data.inflammatoryIndex !== undefined || data.glycemicLoad !== undefined || data.nutrientDensity !== undefined) && (
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-1">
                <Shield className="h-4 w-4 text-electric-blue" />
                <span className="text-sm font-medium text-electric-blue">Advanced Health Analysis</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {data.inflammatoryIndex !== undefined && (
                  <div className="bg-dark-bg rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">Inflammatory Index</div>
                    <div className="flex items-center justify-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${data.inflammatoryIndex > 3 ? 'bg-hot-pink/20 text-hot-pink' : 'bg-neon-green/20 text-neon-green'}`}>
                        {data.inflammatoryIndex}
                      </div>
                    </div>
                    <div className={`text-xs mt-1 ${data.inflammatoryIndex > 3 ? 'text-hot-pink' : 'text-neon-green'}`}>
                      {data.inflammatoryIndex > 3 ? 'High' : 'Low'}
                    </div>
                  </div>
                )}
                
                {data.glycemicLoad !== undefined && (
                  <div className="bg-dark-bg rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">Glycemic Load</div>
                    <div className="flex items-center justify-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${data.glycemicLoad > 10 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-neon-green/20 text-neon-green'}`}>
                        {data.glycemicLoad}
                      </div>
                    </div>
                    <div className="text-xs mt-1">
                      {data.glycemicLoad > 20 ? 'High' : data.glycemicLoad > 10 ? 'Medium' : 'Low'}
                    </div>
                  </div>
                )}
                
                {data.nutrientDensity !== undefined && (
                  <div className="bg-dark-bg rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">Nutrient Density</div>
                    <div className="flex items-center justify-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${data.nutrientDensity > 70 ? 'bg-neon-purple/20 text-neon-purple' : 'bg-electric-blue/20 text-electric-blue'}`}>
                        {data.nutrientDensity}
                      </div>
                    </div>
                    <div className="text-xs mt-1 text-neon-green">
                      {data.nutrientDensity > 70 ? 'Excellent' : data.nutrientDensity > 50 ? 'Good' : 'Average'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {data.healthBenefits && data.healthBenefits.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-1">
                <Heart className="h-4 w-4 text-neon-green" />
                <span className="text-sm font-medium text-neon-green">Health Benefits</span>
              </div>
              <div className="text-sm bg-dark-bg rounded-lg p-3">
                <ul className="list-disc ml-4 text-gray-300 space-y-1">
                  {data.healthBenefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {data.recommendations && (
            <div className="mb-2">
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-4 w-4 text-electric-blue" />
                <span className="text-sm font-medium text-electric-blue">Recommendations</span>
              </div>
              <div className="text-sm bg-dark-bg rounded-lg p-3 text-gray-300">
                {data.recommendations}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gradient-to-r from-dark-bg to-dark-bg-secondary border-t border-electric-blue/20">
          <p className="text-xs text-gray-400 text-center">
            NutriLens AI analysis is for informational purposes only and should not replace professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScanResults;
