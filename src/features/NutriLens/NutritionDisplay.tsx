import React from 'react';
import { ProductInfo, NutritionInfo } from '../../services/spoonacular';

interface NutritionDisplayProps {
  product: ProductInfo;
  loading?: boolean;
  error?: string;
}

const NutritionDisplay: React.FC<NutritionDisplayProps> = ({
  product,
  loading = false,
  error
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg text-gray-200">Loading nutrition information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-6 my-4">
        <h3 className="text-lg font-medium text-red-400 mb-2">Error</h3>
        <p className="text-red-200">{error}</p>
        <p className="text-sm text-red-300 mt-3">
          Try scanning again or manually search for this product
        </p>
      </div>
    );
  }

  const {
    title,
    imageUrl,
    nutrition,
    badges,
    importantBadges,
    generatedProduct,
    ingredientList,
    breadcrumbs,
    upc,
    aisle
  } = product;

  // Extract key nutrients for the summary panel
  const calories = nutrition?.calories || 0;
  const protein = nutrition?.protein || '0g';
  const carbs = nutrition?.carbs || '0g';
  const fat = nutrition?.fat || '0g';

  // Get important nutrients for detailed view
  const importantNutrients = nutrition?.nutrients?.filter(n => 
    ['Fiber', 'Sugar', 'Sodium', 'Calcium', 'Iron', 'Vitamin C', 'Vitamin D'].includes(n.name)
  ) || [];

  return (
    <div className="bg-gray-900/90 rounded-2xl overflow-hidden border border-gray-800">
      {/* Product header */}
      <div className="relative">
        {/* Product image with gradient overlay */}
        {imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
          </div>
        )}
        
        {/* Badges */}
        {importantBadges && importantBadges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {importantBadges.map((badge, i) => (
              <span 
                key={`important-${i}`} 
                className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        
        {/* Product metadata */}
        <div className={`p-6 ${imageUrl ? 'pt-2' : ''}`}>
          {generatedProduct && (
            <div className="mb-2 flex items-center">
              <span className="bg-yellow-600/30 text-yellow-300 text-xs px-2 py-1 rounded flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Best match (not exact)
              </span>
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          
          {breadcrumbs && breadcrumbs.length > 0 && (
            <p className="text-gray-400 text-sm mb-2">{breadcrumbs.join(' > ')}</p>
          )}
          
          {aisle && (
            <div className="text-sm text-gray-400 flex items-center mb-2">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h18v18H3V3z M16 3v18 M8 3v18 M3 16h18 M3 8h18" />
              </svg>
              Aisle: {aisle}
            </div>
          )}
          
          {upc && (
            <div className="text-sm text-gray-400 flex items-center mb-3">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6-3 6s-3-2.483-3-6c0-3.516 1.009-6 3-6s3 2.484 3 6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 11c0 3.517-1.009 6-3 6s-3-2.483-3-6c0-3.516 1.009-6 3-6s3 2.484 3 6zM12 11c0 3.517 1.009 6 3 6s3-2.483 3-6c0-3.516-1.009-6-3-6s-3 2.484-3 6z" />
              </svg>
              Barcode: {upc}
            </div>
          )}
        </div>
      </div>
      
      {/* Nutrition summary */}
      <div className="p-6 bg-black/20 border-y border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Nutrition Summary</h2>
        
        <div className="grid grid-cols-4 gap-3">
          {/* Calories */}
          <div className="bg-blue-900/30 rounded-lg p-3 text-center border border-blue-800/30">
            <div className="text-xl font-bold text-white">{calories}</div>
            <div className="text-xs text-blue-300">Calories</div>
          </div>
          
          {/* Protein */}
          <div className="bg-green-900/30 rounded-lg p-3 text-center border border-green-800/30">
            <div className="text-xl font-bold text-white">{protein}</div>
            <div className="text-xs text-green-300">Protein</div>
          </div>
          
          {/* Carbs */}
          <div className="bg-amber-900/30 rounded-lg p-3 text-center border border-amber-800/30">
            <div className="text-xl font-bold text-white">{carbs}</div>
            <div className="text-xs text-amber-300">Carbs</div>
          </div>
          
          {/* Fat */}
          <div className="bg-red-900/30 rounded-lg p-3 text-center border border-red-800/30">
            <div className="text-xl font-bold text-white">{fat}</div>
            <div className="text-xs text-red-300">Fat</div>
          </div>
        </div>
        
        {/* Serving size */}
        {nutrition?.servingSize && (
          <div className="mt-3 text-center text-gray-400 text-sm">
            Per serving: {nutrition.servingSize}
          </div>
        )}
      </div>
      
      {/* Detailed nutrition */}
      {importantNutrients.length > 0 && (
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Detailed Nutrition</h2>
          
          <div className="space-y-3">
            {importantNutrients.map((nutrient, i) => (
              <div key={`nutrient-${i}`} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-gray-300">{nutrient.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-white font-medium">{nutrient.amount}{nutrient.unit}</span>
                  {nutrient.percentOfDailyNeeds && (
                    <span className="text-sm text-gray-400 ml-2">
                      {Math.round(nutrient.percentOfDailyNeeds)}% DV
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Ingredients */}
      {ingredientList && (
        <div className="p-6 border-t border-gray-800">
          <h2 className="text-xl font-bold text-white mb-2">Ingredients</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{ingredientList}</p>
        </div>
      )}
      
      {/* Regular badges */}
      {badges && badges.length > 0 && (
        <div className="p-6 border-t border-gray-800">
          <h2 className="text-lg font-bold text-white mb-3">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, i) => (
              <span 
                key={`badge-${i}`} 
                className="bg-gray-700/70 text-gray-300 text-xs px-2.5 py-1.5 rounded-lg"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Data source disclaimer */}
      <div className="p-4 text-center bg-gray-900 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          Nutrition data provided by Spoonacular API
        </p>
      </div>
    </div>
  );
};

export default NutritionDisplay;
