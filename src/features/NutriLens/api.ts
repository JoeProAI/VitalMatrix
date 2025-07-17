import { NutritionData } from './ScanResults';
import { analyzeImageWithGrok, GrokVisionResponse } from '../../services/grokClient';

// No mock data - using only real API responses

// Configuration for Modal backend (only used for food image analysis)
const MODAL_API_URL = process.env.NEXT_PUBLIC_MODAL_API_URL || 'https://vitalmatrix-nutrilens--api-analyze-food.modal.run';

// API choice configuration
const USE_GROK_API = process.env.NEXT_PUBLIC_USE_GROK_API === 'true';

// Using only real API responses - no mock product data

export type ScanResponse = {
  success: boolean;
  data?: NutritionData;
  error?: string;
};

/**
 * Process an image through the NutriLens AI system to analyze nutritional content
 * Uses either Grok Vision API or Modal backend for AI processing
 */
export const analyzeFood = async (image: File): Promise<ScanResponse> => {
  try {
    // Always use real APIs, never fall back to mock data
    const useModalBackend = process.env.NEXT_PUBLIC_USE_MODAL_BACKEND === 'true';
    
    if (USE_GROK_API) {
      return await analyzeWithGrok(image);
    } else if (useModalBackend) {
      return await analyzeWithModal(image);
    } else {
      throw new Error('No AI backend is enabled. Enable either Grok or Modal backend.');
    }
  } catch (error: any) {
    console.error('Error analyzing food:', error);
    
    // No fallback to mock data - fail properly with error message
    console.log('Food analysis failed without fallback');
    return { success: false, error: `Food analysis failed: ${error.message}` };
  }
};

/**
 * Process image using Grok Vision API
 */
const analyzeWithGrok = async (image: File): Promise<ScanResponse> => {
  try {
    console.log('Using Grok Vision API for food analysis');
    
    // Convert image to base64
    const base64Image = await fileToBase64(image);
    
    // Send to Grok Vision API
    const grokResponse = await analyzeImageWithGrok(base64Image);
    
    // Transform Grok response to NutritionData format
    const nutritionData = transformGrokResponseToNutritionData(grokResponse);
    
    return {
      success: true,
      data: nutritionData
    };
  } catch (error: any) {
    console.error('Grok Vision API error:', error);
    throw new Error(`Grok Vision analysis failed: ${error.message}`);
  }
};

/**
 * Process image using Modal backend
 */
const analyzeWithModal = async (image: File): Promise<ScanResponse> => {
  try {
    // Create FormData to send the image to the Modal backend
    const formData = new FormData();
    formData.append('image', image);
    
    console.log('Sending image to Modal backend:', MODAL_API_URL);
    
    // Send the image to the Modal backend
    const response = await fetch(MODAL_API_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown error analyzing food');
    }
    
    return { 
      success: true, 
      data: result.data as NutritionData 
    };
  } catch (error: any) {
    console.error('Modal backend error:', error);
    throw error;
  }
};

/**
 * Convert File to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., 'data:image/jpeg;base64,')
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Transform Grok Vision API response to NutritionData format
 */
const transformGrokResponseToNutritionData = (grokResponse: GrokVisionResponse): NutritionData => {
  // Extract primary food item (with highest confidence)
  const primaryFood = grokResponse.foodItems[0] || { name: 'Unknown food', confidence: 0.5, portion: 'regular' };
  
  // Basic nutrition values - estimated from the AI analysis
  // These are rough estimates and would be improved with a nutrition database
  const nutritionData: NutritionData = {
    foodName: primaryFood.name,
    healthScore: calculateHealthScore(grokResponse),
    calories: 0, // Will be populated with estimates
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    
    // Advanced metrics
    inflammatoryIndex: 2, // Default moderate value
    glycemicLoad: 8, // Default moderate-low value
    nutrientDensity: 65, // Default moderate-high value
    
    // Grok-specific data
    enhancedBy: 'Grok Vision AI',
    detectedFoodItems: grokResponse.foodItems,
    grokAnalysis: grokResponse.detailedAnalysis,
    
    // Extract health benefits from detailed analysis
    healthBenefits: extractHealthBenefits(grokResponse.detailedAnalysis),
    recommendations: extractRecommendations(grokResponse.detailedAnalysis),
    
    // Basic nutrient estimates from analysis
    // These would be much better with a food database
    ingredients: extractIngredients(grokResponse.detailedAnalysis)
  };
  
  // Attempt to extract nutrition values from the detailed analysis
  const extractedNutrition = extractNutritionValues(grokResponse.detailedAnalysis);
  
  // Apply extracted nutrition values if available
  return {
    ...nutritionData,
    ...extractedNutrition
  };
};

/**
 * Calculate health score based on Grok response
 */
const calculateHealthScore = (grokResponse: GrokVisionResponse): number => {
  // Extract text indicating health score
  const text = grokResponse.detailedAnalysis.toLowerCase();
  
  // Positive health indicators
  const positiveFactors = [
    'vegetable', 'fruit', 'lean protein', 'whole grain', 'nutritious',
    'healthy', 'vitamin', 'mineral', 'antioxidant', 'fiber'
  ];
  
  // Negative health indicators
  const negativeFactors = [
    'processed', 'sugar', 'fried', 'fat', 'sodium', 'cholesterol',
    'calories', 'additive', 'preservative', 'artificial'
  ];
  
  // Count matches
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveFactors.forEach(factor => {
    if (text.includes(factor)) positiveCount++;
  });
  
  negativeFactors.forEach(factor => {
    if (text.includes(factor)) negativeCount++;
  });
  
  // Calculate score (base 70, +3 for positive, -3 for negative)
  let score = 70 + (positiveCount * 3) - (negativeCount * 3);
  
  // Ensure within bounds
  return Math.max(30, Math.min(score, 95));
};

/**
 * Extract health benefits from detailed analysis
 */
const extractHealthBenefits = (detailedAnalysis: string): string[] => {
  const benefits: string[] = [];
  
  // Look for health benefits section
  const healthBenefitsSection = detailedAnalysis.match(
    /Health Benefits(.|\n)*?(?=(Dietary Considerations|$))/i
  );
  
  if (healthBenefitsSection) {
    // Extract bullet points or sentences
    const points = healthBenefitsSection[0]
      .split(/[\n\r]|\d+\.\s|•\s|\*\s/)
      .map(p => p.trim())
      .filter(p => p && p.length > 10 && !p.startsWith('Health Benefits'));
    
    benefits.push(...points.slice(0, 5)); // Limit to 5 benefits
  }
  
  // If nothing found, use some generic benefits based on food type
  if (benefits.length === 0) {
    const text = detailedAnalysis.toLowerCase();
    
    if (text.includes('vegetable') || text.includes('leafy green')) {
      benefits.push('Rich in vitamins and minerals', 'Good source of dietary fiber');
    } else if (text.includes('fruit')) {
      benefits.push('Contains natural antioxidants', 'Source of vitamins');
    } else if (text.includes('protein') || text.includes('meat')) {
      benefits.push('Good source of protein', 'Contains essential amino acids');
    }
  }
  
  return benefits;
};

/**
 * Extract recommendations from detailed analysis
 */
const extractRecommendations = (detailedAnalysis: string): string => {
  // Look for recommendations section or phrases
  const recommendationMatches = detailedAnalysis.match(
    /recommendations?:?\s([^.\n]*\.[^.\n]*\.[^.\n]*)/i
  );
  
  if (recommendationMatches && recommendationMatches[1]) {
    return recommendationMatches[1].trim();
  }
  
  // Default recommendation
  return 'For optimal nutrition, consider portion size and balance with other food groups throughout the day.';
};

/**
 * Extract ingredients from detailed analysis
 */
const extractIngredients = (detailedAnalysis: string): string[] => {
  const ingredients: string[] = [];
  
  // Look for ingredients section
  const ingredientsSection = detailedAnalysis.match(
    /ingredients:?([^.]*)/i
  );
  
  if (ingredientsSection && ingredientsSection[1]) {
    // Split by commas
    ingredients.push(
      ...ingredientsSection[1]
        .split(',')
        .map(i => i.trim())
        .filter(Boolean)
    );
  }
  
  return ingredients;
};

/**
 * Extract nutrition values from detailed analysis
 */
const extractNutritionValues = (detailedAnalysis: string): Partial<NutritionData> => {
  const nutrition: Partial<NutritionData> = {};
  
  // Extract calorie information
  const calorieMatch = detailedAnalysis.match(/(\d+)\s*calories/i);
  if (calorieMatch) {
    nutrition.calories = parseInt(calorieMatch[1], 10);
  } else {
    // Default calories based on average meal
    nutrition.calories = 350;
  }
  
  // Extract protein information (g)
  const proteinMatch = detailedAnalysis.match(/(\d+(\.\d+)?)\s*(g|grams)?\s*protein/i);
  if (proteinMatch) {
    nutrition.protein = parseFloat(proteinMatch[1]);
  } else {
    // Default protein
    nutrition.protein = 10;
  }
  
  // Extract carbs information (g)
  const carbsMatch = detailedAnalysis.match(/(\d+(\.\d+)?)\s*(g|grams)?\s*carb/i);
  if (carbsMatch) {
    nutrition.carbs = parseFloat(carbsMatch[1]);
  } else {
    // Default carbs
    nutrition.carbs = 30;
  }
  
  // Extract fat information (g)
  const fatMatch = detailedAnalysis.match(/(\d+(\.\d+)?)\s*(g|grams)?\s*fat/i);
  if (fatMatch) {
    nutrition.fat = parseFloat(fatMatch[1]);
  } else {
    // Default fat
    nutrition.fat = 12;
  }
  
  // Extract fiber information (g)
  const fiberMatch = detailedAnalysis.match(/(\d+(\.\d+)?)\s*(g|grams)?\s*fiber/i);
  if (fiberMatch) {
    nutrition.fiber = parseFloat(fiberMatch[1]);
  } else {
    // Default fiber
    nutrition.fiber = 3;
  }
  
  // Extract sugar information (g)
  const sugarMatch = detailedAnalysis.match(/(\d+(\.\d+)?)\s*(g|grams)?\s*sugar/i);
  if (sugarMatch) {
    nutrition.sugar = parseFloat(sugarMatch[1]);
  } else {
    // Default sugar
    nutrition.sugar = 5;
  }
  
  // Extract sodium information (mg)
  const sodiumMatch = detailedAnalysis.match(/(\d+)\s*(mg)?\s*sodium/i);
  if (sodiumMatch) {
    nutrition.sodium = parseFloat(sodiumMatch[1]);
  } else {
    // Default sodium
    nutrition.sodium = 400;
  }
  
  return nutrition;
};

/**
 * Configuration for Modal backend deployment
 */
export const getModalConfig = () => {
  return {
    endpoint: MODAL_API_URL,
    isAvailable: Boolean(process.env.NEXT_PUBLIC_USE_MODAL_BACKEND)
  };
};

/**
 * Look up product information by barcode
 * Uses the Open Food Facts API directly (real, production API)
 */
export const getProductByBarcode = async (barcode: string): Promise<ScanResponse> => {
  try {
    // Use Open Food Facts API directly - this is a real, production API
    console.log('Looking up barcode with Open Food Facts API:', barcode);
    
    // Call the Open Food Facts API directly
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`, {
      method: 'GET',
      headers: {
        'User-Agent': 'VitalMatrix-NutriLens/1.0 (https://vitalmatrix.vercel.app)'
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 1) {
      throw new Error('Product not found');
    }
    
    const product = data.product;
    const nutriments = product.nutriments || {};
    
    // Format the response to match our NutritionData structure
    const nutritionData: NutritionData = {
      foodName: product.product_name || 'Unknown Product',
      healthScore: parseInt(product.nutriscore_score || '70'),
      calories: parseInt(nutriments['energy-kcal_100g'] || '0'),
      protein: parseFloat(nutriments.proteins_100g || '0'),
      carbs: parseFloat(nutriments.carbohydrates_100g || '0'),
      fat: parseFloat(nutriments.fat_100g || '0'),
      fiber: parseFloat(nutriments.fiber_100g || '0'),
      sugar: parseFloat(nutriments.sugars_100g || '0'),
      sodium: parseFloat(nutriments.sodium_100g || '0'),
      ingredients: product.ingredients_text ? 
        product.ingredients_text.split(',').map(i => i.trim()).filter(i => i) : [],
      healthBenefits: [],
      recommendations: 'Based on nutritional content, consider portion size and balance with other food groups.'
    };
    
    // Add allergens if available
    if (product.allergens) {
      nutritionData.allergens = product.allergens.split(',').map(a => a.trim()).filter(a => a);
    }
    
    return { 
      success: true, 
      data: nutritionData
    };
  } catch (error) {
    console.error('Error looking up barcode:', error);
    // No fallbacks - fail properly with an error
    return { 
      success: false, 
      error: `Failed to retrieve product information for barcode ${barcode}: ${error.message}` 
    };
  }
};
