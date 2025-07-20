import { collection, doc, addDoc, getDocs, query, where, orderBy, limit, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { addNutritionEntry, updateUserProfile, getUserProfile } from './userProfileService';

// Enhanced nutrition interfaces for VitalMatrix integration
export interface NutritionScanResult {
  id?: string;
  userId: string;
  timestamp: Date;
  
  // Scan method and source
  scanMethod: 'barcode' | 'ai_vision' | 'manual' | 'voice_input';
  sourceImage?: string; // base64 or URL
  barcode?: string;
  confidence: number; // 0-1
  
  // Food identification
  foodItem: string;
  brand?: string;
  category: string;
  servingSize: string;
  servingsPerContainer?: number;
  
  // Nutritional data
  calories: number;
  macros: {
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    fiber?: number; // grams
    sugar?: number; // grams
    sodium?: number; // mg
  };
  
  // Micronutrients (per serving)
  micronutrients?: {
    vitaminA?: number; // IU
    vitaminC?: number; // mg
    vitaminD?: number; // IU
    calcium?: number; // mg
    iron?: number; // mg
    potassium?: number; // mg
    [key: string]: number | undefined;
  };
  
  // Health analysis
  healthScore: number; // 0-100
  healthGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';
  
  // Warnings and alerts
  allergens: string[];
  warnings: string[];
  dietaryFlags: string[]; // 'vegan', 'gluten-free', 'keto-friendly', etc.
  
  // AI insights
  aiInsights: {
    healthBenefits: string[];
    concerns: string[];
    alternatives: string[];
    personalizedTips: string[];
  };
  
  // Meal context
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  location?: string;
  notes?: string;
}

export interface NutritionGoal {
  id?: string;
  userId: string;
  type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance' | 'health_condition';
  targetCalories: number;
  macroTargets: {
    protein: number; // percentage
    carbs: number; // percentage
    fat: number; // percentage
  };
  micronutrientTargets?: Record<string, number>;
  restrictions: string[];
  preferences: string[];
  medicalConditions: string[];
  createdAt: Date;
  isActive: boolean;
}

export interface HealthInsight {
  id?: string;
  userId: string;
  type: 'nutrition_trend' | 'health_correlation' | 'recommendation' | 'warning';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionItems: string[];
  relatedScans: string[]; // scan IDs
  relatedHealthData?: string[]; // healthcare visit IDs
  generatedAt: Date;
  isRead: boolean;
}

// Temporary barcode scanning without Firebase (for testing)
export const scanBarcodeTemp = async (barcode: string): Promise<NutritionScanResult | null> => {
  try {
    console.log('🔍 Scanning barcode:', barcode);
    
    // Try external API first (no Firebase required)
    const apiResult = await fetchBarcodeFromAPI(barcode);
    if (apiResult) {
      console.log('✅ Barcode found in API:', apiResult.foodItem);
      return {
        ...apiResult,
        userId: 'temp',
        timestamp: new Date(),
        scanMethod: 'barcode',
        barcode,
      };
    }
    
    console.log('❌ Barcode not found in API');
    return null;
  } catch (error) {
    console.error('Error scanning barcode:', error);
    return null;
  }
};

// Helper function to filter out undefined values from micronutrients
const filterMicronutrients = (micronutrients?: { [key: string]: number | undefined }): Record<string, number> => {
  if (!micronutrients) return {};
  const filtered: Record<string, number> = {};
  Object.entries(micronutrients).forEach(([key, value]) => {
    if (value !== undefined && typeof value === 'number') {
      filtered[key] = value;
    }
  });
  return filtered; // Always return an object, never undefined
};

// Barcode scanning with enhanced database
export const scanBarcode = async (barcode: string, userId: string): Promise<NutritionScanResult | null> => {
  try {
    // First check our local database for cached results
    const cachedResult = await getCachedBarcodeResult(barcode);
    if (cachedResult) {
      // Create user-specific scan record
      const scanResult: NutritionScanResult = {
        ...cachedResult,
        id: undefined, // Remove cached ID
        userId,
        timestamp: new Date(),
        scanMethod: 'barcode',
        barcode,
      };
      
      // Save to user's nutrition entries
      await addNutritionEntry({
        userId,
        timestamp: new Date(),
        foodItem: scanResult.foodItem,
        calories: scanResult.calories,
        macros: scanResult.macros,
        micronutrients: filterMicronutrients(scanResult.micronutrients),
        scanMethod: 'barcode',
        confidence: scanResult.confidence,
      });
      
      return scanResult;
    }
    
    // If not cached, call external API (OpenFoodFacts, Spoonacular, etc.)
    const apiResult = await fetchBarcodeFromAPI(barcode);
    if (apiResult) {
      // Cache the result for future use
      await cacheBarcodeResult(barcode, apiResult);
      
      // Create user scan record
      const scanResult: NutritionScanResult = {
        ...apiResult,
        userId,
        timestamp: new Date(),
        scanMethod: 'barcode',
        barcode,
      };
      
      // Save to user's nutrition entries
      await addNutritionEntry({
        userId,
        timestamp: new Date(),
        foodItem: scanResult.foodItem,
        calories: scanResult.calories,
        macros: scanResult.macros,
        micronutrients: filterMicronutrients(scanResult.micronutrients),
        scanMethod: 'barcode',
        confidence: scanResult.confidence,
      });
      
      return scanResult;
    }
    
    return null;
  } catch (error) {
    console.error('Error scanning barcode:', error);
    throw error;
  }
};

// AI-powered image analysis
export const analyzeFood = async (imageData: string, userId: string): Promise<NutritionScanResult | null> => {
  try {
    // This would integrate with OpenAI Vision, Google Vision, or custom AI model
    const aiResult = await analyzeImageWithAI(imageData);
    
    if (aiResult) {
      const scanResult: NutritionScanResult = {
        ...aiResult,
        userId,
        timestamp: new Date(),
        scanMethod: 'ai_vision',
        sourceImage: imageData,
      };
      
      // Save to user's nutrition entries
      await addNutritionEntry({
        userId,
        timestamp: new Date(),
        foodItem: scanResult.foodItem,
        calories: scanResult.calories,
        macros: scanResult.macros,
        micronutrients: filterMicronutrients(scanResult.micronutrients),
        scanMethod: 'ai_vision',
        confidence: scanResult.confidence,
      });
      
      return scanResult;
    }
    
    return null;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw error;
  }
};

// Voice-powered nutrition logging
export const processVoiceInput = async (audioData: Blob, userId: string): Promise<NutritionScanResult | null> => {
  try {
    // Convert speech to text
    const transcript = await speechToText(audioData);
    
    // Parse nutrition information from text
    const nutritionData = await parseNutritionFromText(transcript);
    
    if (nutritionData) {
      const scanResult: NutritionScanResult = {
        ...nutritionData,
        userId,
        timestamp: new Date(),
        scanMethod: 'voice_input',
        notes: transcript,
      };
      
      // Save to user's nutrition entries
      await addNutritionEntry({
        userId,
        timestamp: new Date(),
        foodItem: scanResult.foodItem,
        calories: scanResult.calories,
        macros: scanResult.macros,
        micronutrients: filterMicronutrients(scanResult.micronutrients),
        scanMethod: 'manual',
        confidence: scanResult.confidence,
      });
      
      return scanResult;
    }
    
    return null;
  } catch (error) {
    console.error('Error processing voice input:', error);
    throw error;
  }
};

// Generate personalized health insights with Grok AI
export const generateHealthInsights = async (userId: string): Promise<HealthInsight[]> => {
  try {
    const [userProfile, recentScans, healthcareVisits] = await Promise.all([
      getUserProfile(userId),
      getUserRecentScans(userId, 30), // Last 30 days
      getUserHealthcareVisits(userId, 10) // Last 10 visits
    ]);
    
    const insights: HealthInsight[] = [];
    
    // 🤖 GROK AI ENHANCED INSIGHTS 🤖
    console.log('🧠 Generating Grok AI-powered health insights...');
    
    // Analyze nutrition trends with Grok AI
    if (recentScans.length > 0) {
      const grokNutritionInsights = await generateGrokNutritionInsights(recentScans, userProfile);
      insights.push(...grokNutritionInsights);
      
      const nutritionTrends = analyzeNutritionTrends(recentScans);
      insights.push(...nutritionTrends);
    }
    
    // Grok AI Pattern Recognition
    if (recentScans.length >= 5) {
      const patternInsights = await generateGrokPatternInsights(recentScans, userProfile);
      insights.push(...patternInsights);
    }
    
    // Correlate with healthcare data
    if (healthcareVisits.length > 0 && recentScans.length > 0) {
      const correlations = findHealthNutritionCorrelations(healthcareVisits, recentScans);
      insights.push(...correlations);
    }
    
    // Generate Grok AI personalized recommendations
    if (userProfile) {
      const grokRecommendations = await generateGrokPersonalizedRecommendations(userProfile, recentScans);
      insights.push(...grokRecommendations);
      
      const recommendations = generatePersonalizedRecommendations(userProfile, recentScans);
      insights.push(...recommendations);
    }
    
    // Save insights to database
    for (const insight of insights) {
      await addDoc(collection(db, 'healthInsights'), {
        ...insight,
        generatedAt: serverTimestamp(),
      });
    }
    
    console.log(`✅ Generated ${insights.length} Grok AI-enhanced insights`);
    return insights;
  } catch (error) {
    console.error('Error generating health insights:', error);
    throw error;
  }
};

// Helper functions
const getCachedBarcodeResult = async (barcode: string): Promise<NutritionScanResult | null> => {
  try {
    const q = query(
      collection(db, 'barcodeCache'),
      where('barcode', '==', barcode),
      limit(1)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as NutritionScanResult;
    }
    return null;
  } catch (error) {
    console.error('Error getting cached barcode result:', error);
    return null;
  }
};

const cacheBarcodeResult = async (barcode: string, result: NutritionScanResult): Promise<void> => {
  try {
    await addDoc(collection(db, 'barcodeCache'), {
      barcode,
      ...result,
      cachedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error caching barcode result:', error);
  }
};

const fetchBarcodeFromAPI = async (barcode: string): Promise<NutritionScanResult | null> => {
  try {
    // Integration with OpenFoodFacts API
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      const product = data.product;
      
      return {
        foodItem: product.product_name || 'Unknown Product',
        brand: product.brands || undefined,
        category: product.categories || 'Unknown',
        servingSize: product.serving_size || '100g',
        calories: parseFloat(product.nutriments?.['energy-kcal_100g']) || 0,
        macros: {
          protein: parseFloat(product.nutriments?.proteins_100g) || 0,
          carbs: parseFloat(product.nutriments?.carbohydrates_100g) || 0,
          fat: parseFloat(product.nutriments?.fat_100g) || 0,
          ...(product.nutriments?.fiber_100g && { fiber: parseFloat(product.nutriments.fiber_100g) }),
          ...(product.nutriments?.sugars_100g && { sugar: parseFloat(product.nutriments.sugars_100g) }),
          ...(product.nutriments?.sodium_100g && { sodium: parseFloat(product.nutriments.sodium_100g) }),
        },
        micronutrients: {
          ...(product.nutriments?.['vitamin-a_100g'] && { vitaminA: parseFloat(product.nutriments['vitamin-a_100g']) }),
          ...(product.nutriments?.['vitamin-c_100g'] && { vitaminC: parseFloat(product.nutriments['vitamin-c_100g']) }),
          ...(product.nutriments?.['vitamin-d_100g'] && { vitaminD: parseFloat(product.nutriments['vitamin-d_100g']) }),
          ...(product.nutriments?.calcium_100g && { calcium: parseFloat(product.nutriments.calcium_100g) }),
          ...(product.nutriments?.iron_100g && { iron: parseFloat(product.nutriments.iron_100g) }),
          ...(product.nutriments?.potassium_100g && { potassium: parseFloat(product.nutriments.potassium_100g) }),
        },
        healthScore: calculateHealthScore(product),
        healthGrade: calculateHealthGrade(product),
        allergens: product.allergens_tags || [],
        warnings: [],
        dietaryFlags: extractDietaryFlags(product),
        aiInsights: {
          healthBenefits: [],
          concerns: [],
          alternatives: [],
          personalizedTips: [],
        },
        confidence: 0.9,
        userId: '',
        timestamp: new Date(),
        scanMethod: 'barcode',
      } as NutritionScanResult;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching from OpenFoodFacts:', error);
    return null;
  }
};

const analyzeImageWithAI = async (imageData: string): Promise<NutritionScanResult | null> => {
  try {
    console.log('Analyzing image with Grok AI...');
    
    // Call our API endpoint (Vercel function in production, local server in development)
    const isProduction = window.location.hostname !== 'localhost';
    const apiUrl = isProduction 
      ? '/api/ai-analyze-food' // Use relative URL for Vercel functions
      : 'http://localhost:3001/api/ai-analyze-food'; // Use local server in development
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });
    
    if (!response.ok) {
      let errorMessage = `API error (${response.status}): ${response.statusText}`;
      
      // Handle specific error cases
      if (response.status === 413) {
        errorMessage = 'Image too large. Please try a smaller image or the app will compress it automatically.';
      }
      
      // Try to parse error response, but handle HTML responses
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = `API error: ${errorData.error || errorMessage}`;
        } else {
          // Handle HTML error responses (like 413 from server)
          const textResponse = await response.text();
          if (textResponse.includes('413') || textResponse.includes('Payload Too Large')) {
            errorMessage = 'Image file is too large. Please try a smaller image.';
          }
        }
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
        // Use the default error message
      }
      
      throw new Error(errorMessage);
    }
    
    // Safely parse JSON response
    let result;
    try {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please try again.');
      }
      result = await response.json();
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Invalid response from server. Please try again.');
    }
    
    if (!result.success || !result.foodItems || result.foodItems.length === 0) {
      throw new Error('No food items detected in the image');
    }
    
    // Convert Grok response to NutritionScanResult format
    const primaryFood = result.foodItems[0];
    const nutritionalData = result.nutritionalData || {};
    const nutritionalEstimate = nutritionalData.nutritionalEstimate || {};
    
    // Extract comprehensive allergen information
    const allergenList = [
      ...(primaryFood.allergens || []),
      ...(nutritionalData.allergens || [])
    ];
    
    // Combine all food items for comprehensive analysis
    const allFoods = result.foodItems || [primaryFood];
    const foodNames = allFoods.map((food: any) => food.name).join(', ');
    
    // Extract all allergens from all foods
    const allAllergens = allFoods.reduce((acc: string[], food: any) => {
      if (food.allergens && Array.isArray(food.allergens)) {
        acc.push(...food.allergens);
      }
      return acc;
    }, allergenList);
    
    // Remove duplicates and clean up allergen list
    const uniqueAllergens = [...new Set(allAllergens)]
      .filter((allergen: any) => allergen && typeof allergen === 'string' && allergen.length > 0)
      .map((allergen: any) => (allergen as string).toLowerCase().trim());
    
    console.log('🚨 Detected allergens:', uniqueAllergens);
    
    return {
      foodItem: allFoods.length > 1 ? `${primaryFood.name} + ${allFoods.length - 1} other items` : (primaryFood.name || 'Unknown Food Item'),
      brand: 'Fresh/Homemade',
      category: 'Food',
      servingSize: primaryFood.portion || '1 serving',
      calories: nutritionalEstimate.calories || 0,
      macros: {
        protein: nutritionalEstimate.protein || 0,
        carbs: nutritionalEstimate.carbs || 0,
        fat: nutritionalEstimate.fat || 0,
        fiber: nutritionalEstimate.fiber || 0,
        sugar: 0,
        sodium: 0,
      },
      healthScore: Math.round((primaryFood.confidence || 0.5) * 100),
      healthGrade: calculateHealthGradeFromScore(Math.round((primaryFood.confidence || 0.5) * 100)),
      allergens: uniqueAllergens,
      warnings: [
        ...(nutritionalData.warnings || []),
        ...(uniqueAllergens.length > 0 ? [`⚠️ ALLERGEN WARNING: Contains ${uniqueAllergens.join(', ')}`] : [])
      ],
      dietaryFlags: [],
      aiInsights: {
        healthBenefits: nutritionalData.healthInsights || [],
        concerns: [
          ...(nutritionalData.warnings || []),
          ...(uniqueAllergens.length > 0 ? [`Contains allergens: ${uniqueAllergens.join(', ')}`] : [])
        ],
        alternatives: [],
        personalizedTips: [
          `Identified foods: ${foodNames}`,
          ...(uniqueAllergens.length > 0 ? [`⚠️ Check ingredients for: ${uniqueAllergens.join(', ')}`] : [])
        ],
      },
      confidence: primaryFood.confidence || 0.7,
      userId: '',
      timestamp: new Date(),
      scanMethod: 'ai_vision',
      sourceImage: imageData,
    } as NutritionScanResult;
  } catch (error) {
    console.error('Error analyzing image with Grok AI:', error);
    return null;
  }
};

// Helper function to calculate health grade from score
const calculateHealthGradeFromScore = (score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F' => {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 65) return 'D+';
  if (score >= 60) return 'D';
  return 'F';
};

const speechToText = async (audioData: Blob): Promise<string> => {
  // Integration with speech recognition API
  return 'I ate a banana and some yogurt for breakfast';
};

const parseNutritionFromText = async (text: string): Promise<NutritionScanResult | null> => {
  // AI-powered text parsing for nutrition information
  return null;
};

const getUserRecentScans = async (userId: string, days: number): Promise<NutritionScanResult[]> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const q = query(
      collection(db, 'nutritionEntries'),  // Fixed: Use nutritionEntries instead of nutritionScans
      where('userId', '==', userId),
      where('timestamp', '>=', cutoffDate),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NutritionScanResult));
  } catch (error) {
    console.error('Error getting recent scans:', error);
    return [];
  }
};

const getUserHealthcareVisits = async (userId: string, limit: number): Promise<any[]> => {
  // This would integrate with the healthcare visits from userProfileService
  return [];
};

const analyzeNutritionTrends = (scans: NutritionScanResult[]): HealthInsight[] => {
  const insights: HealthInsight[] = [];
  
  // Analyze calorie trends
  const avgCalories = scans.reduce((sum, scan) => sum + scan.calories, 0) / scans.length;
  if (avgCalories > 2500) {
    insights.push({
      userId: scans[0].userId,
      type: 'nutrition_trend',
      title: 'High Calorie Intake Detected',
      description: `Your average daily calorie intake is ${Math.round(avgCalories)} calories, which may be higher than recommended.`,
      severity: 'medium',
      actionItems: [
        'Consider reducing portion sizes',
        'Focus on nutrient-dense, lower-calorie foods',
        'Consult with a nutritionist'
      ],
      relatedScans: scans.map(s => s.id!),
      generatedAt: new Date(),
      isRead: false,
    });
  }
  
  return insights;
};

const findHealthNutritionCorrelations = (visits: any[], scans: NutritionScanResult[]): HealthInsight[] => {
  // Analyze correlations between healthcare visits and nutrition patterns
  return [];
};

const generatePersonalizedRecommendations = (profile: any, scans: NutritionScanResult[]): HealthInsight[] => {
  // Generate AI-powered personalized recommendations
  return [];
};

// 🤖 GROK AI ENHANCED FUNCTIONS 🤖

// Generate Grok AI-powered nutrition insights
const generateGrokNutritionInsights = async (scans: NutritionScanResult[], userProfile: any): Promise<HealthInsight[]> => {
  const insights: HealthInsight[] = [];
  
  try {
    console.log('🧠 Grok AI analyzing nutrition patterns...');
    
    // Analyze macro balance patterns
    const macroAnalysis = analyzeGrokMacroPatterns(scans);
    if (macroAnalysis) {
      insights.push(macroAnalysis);
    }
    
    // Analyze ingredient quality trends
    const ingredientAnalysis = analyzeGrokIngredientQuality(scans);
    if (ingredientAnalysis) {
      insights.push(ingredientAnalysis);
    }
    
    // Analyze health score trends with AI
    const healthTrends = analyzeGrokHealthTrends(scans);
    if (healthTrends) {
      insights.push(healthTrends);
    }
    
    console.log(`🎯 Grok generated ${insights.length} nutrition insights`);
    return insights;
  } catch (error) {
    console.error('Error generating Grok nutrition insights:', error);
    return [];
  }
};

// Generate Grok AI pattern recognition insights
const generateGrokPatternInsights = async (scans: NutritionScanResult[], userProfile: any): Promise<HealthInsight[]> => {
  const insights: HealthInsight[] = [];
  
  try {
    console.log('🔍 Grok AI detecting eating patterns...');
    
    // Detect meal timing patterns
    const timingPatterns = detectGrokMealTimingPatterns(scans);
    if (timingPatterns) {
      insights.push(timingPatterns);
    }
    
    // Detect food category preferences
    const categoryPatterns = detectGrokCategoryPatterns(scans);
    if (categoryPatterns) {
      insights.push(categoryPatterns);
    }
    
    // Detect nutritional gaps
    const nutritionalGaps = detectGrokNutritionalGaps(scans);
    if (nutritionalGaps) {
      insights.push(nutritionalGaps);
    }
    
    console.log(`📊 Grok detected ${insights.length} behavioral patterns`);
    return insights;
  } catch (error) {
    console.error('Error generating Grok pattern insights:', error);
    return [];
  }
};

// Generate Grok AI personalized recommendations
const generateGrokPersonalizedRecommendations = async (userProfile: any, scans: NutritionScanResult[]): Promise<HealthInsight[]> => {
  const insights: HealthInsight[] = [];
  
  try {
    console.log('💡 Grok AI generating personalized recommendations...');
    
    // Smart food swaps based on current choices
    const smartSwaps = generateGrokSmartSwaps(scans);
    if (smartSwaps) {
      insights.push(smartSwaps);
    }
    
    // Personalized meal planning suggestions
    const mealPlanning = generateGrokMealPlanning(scans, userProfile);
    if (mealPlanning) {
      insights.push(mealPlanning);
    }
    
    // Advanced health optimization tips
    const optimizationTips = generateGrokOptimizationTips(scans, userProfile);
    if (optimizationTips) {
      insights.push(optimizationTips);
    }
    
    console.log(`🚀 Grok generated ${insights.length} personalized recommendations`);
    return insights;
  } catch (error) {
    console.error('Error generating Grok recommendations:', error);
    return [];
  }
};

const calculateHealthScore = (product: any): number => {
  // Calculate health score based on nutritional content
  let score = 50; // Base score
  
  // Positive factors
  if (product.nutriments?.proteins_100g > 10) score += 15;
  if (product.nutriments?.fiber_100g > 5) score += 15;
  if (product.nutriments?.['energy-kcal_100g'] < 200) score += 10;
  
  // Negative factors
  if (product.nutriments?.sugars_100g > 20) score -= 20;
  if (product.nutriments?.sodium_100g > 1000) score -= 15;
  if (product.nutriments?.['saturated-fat_100g'] > 10) score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

// Re-export addNutritionEntry from userProfileService for convenience
export { addNutritionEntry } from './userProfileService';

const calculateHealthGrade = (product: any): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F' => {
  const score = calculateHealthScore(product);
  
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 65) return 'D+';
  if (score >= 60) return 'D';
  return 'F';
};

const extractDietaryFlags = (product: any): string[] => {
  const flags: string[] = [];
  
  if (product.labels_tags?.includes('en:organic')) flags.push('organic');
  if (product.labels_tags?.includes('en:vegan')) flags.push('vegan');
  if (product.labels_tags?.includes('en:vegetarian')) flags.push('vegetarian');
  if (product.labels_tags?.includes('en:gluten-free')) flags.push('gluten-free');
  
  return flags;
};

// 🤖 GROK AI IMPLEMENTATION FUNCTIONS 🤖

// Analyze macro balance patterns with Grok AI intelligence
const analyzeGrokMacroPatterns = (scans: NutritionScanResult[]): HealthInsight | null => {
  if (scans.length < 3) return null;
  
  const avgProtein = scans.reduce((sum, scan) => sum + scan.macros.protein, 0) / scans.length;
  const avgCarbs = scans.reduce((sum, scan) => sum + scan.macros.carbs, 0) / scans.length;
  const avgFat = scans.reduce((sum, scan) => sum + scan.macros.fat, 0) / scans.length;
  
  const totalMacros = avgProtein + avgCarbs + avgFat;
  const proteinPercent = (avgProtein * 4 / (totalMacros * 4)) * 100;
  const carbPercent = (avgCarbs * 4 / (totalMacros * 4)) * 100;
  const fatPercent = (avgFat * 9 / (totalMacros * 4)) * 100;
  
  let severity: 'low' | 'medium' | 'high' = 'low';
  let title = '🤖 Grok AI: Macro Balance Analysis';
  let description = '';
  const actionItems: string[] = [];
  
  if (proteinPercent < 15) {
    severity = 'medium';
    description = `Grok AI detected low protein intake (${proteinPercent.toFixed(1)}%). Optimal protein supports muscle health and satiety.`;
    actionItems.push('Add lean proteins like chicken, fish, or legumes to meals');
    actionItems.push('Consider protein-rich snacks like Greek yogurt or nuts');
  } else if (carbPercent > 60) {
    severity = 'medium';
    description = `Grok AI identified high carbohydrate intake (${carbPercent.toFixed(1)}%). Consider balancing with more protein and healthy fats.`;
    actionItems.push('Replace refined carbs with complex carbohydrates');
    actionItems.push('Add more vegetables and fiber-rich foods');
  } else {
    description = `Grok AI analysis shows balanced macros: ${proteinPercent.toFixed(1)}% protein, ${carbPercent.toFixed(1)}% carbs, ${fatPercent.toFixed(1)}% fat. Great work!`;
    actionItems.push('Maintain your current macro balance');
    actionItems.push('Continue monitoring portion sizes');
  }
  
  return {
    userId: scans[0].userId,
    type: 'recommendation',
    title,
    description,
    severity,
    actionItems,
    relatedScans: scans.map(s => s.id!),
    generatedAt: new Date(),
    isRead: false
  };
};

// Analyze ingredient quality with Grok AI
const analyzeGrokIngredientQuality = (scans: NutritionScanResult[]): HealthInsight | null => {
  if (scans.length < 2) return null;
  
  const processedFoods = scans.filter(scan => 
    scan.aiInsights.concerns.some(concern => 
      concern.toLowerCase().includes('processed') || 
      concern.toLowerCase().includes('artificial') ||
      concern.toLowerCase().includes('preservative')
    )
  );
  
  if (processedFoods.length === 0) return null;
  
  const processedPercentage = (processedFoods.length / scans.length) * 100;
  
  return {
    userId: scans[0].userId,
    type: 'warning',
    title: '🤖 Grok AI: Processed Food Alert',
    description: `Grok AI detected ${processedPercentage.toFixed(1)}% of your scanned foods contain processed ingredients. Whole foods provide better nutrition.`,
    severity: processedPercentage > 50 ? 'high' : 'medium',
    actionItems: [
      'Choose whole, unprocessed foods when possible',
      'Read ingredient lists and avoid items with many additives',
      'Focus on fresh fruits, vegetables, and lean proteins',
      'Cook more meals at home to control ingredients'
    ],
    relatedScans: processedFoods.map(s => s.id!),
    generatedAt: new Date(),
    isRead: false
  };
};

// Analyze health score trends with Grok AI
const analyzeGrokHealthTrends = (scans: NutritionScanResult[]): HealthInsight | null => {
  if (scans.length < 5) return null;
  
  const recentScans = scans.slice(0, Math.floor(scans.length / 2));
  const olderScans = scans.slice(Math.floor(scans.length / 2));
  
  const recentAvgScore = recentScans.reduce((sum, scan) => sum + scan.healthScore, 0) / recentScans.length;
  const olderAvgScore = olderScans.reduce((sum, scan) => sum + scan.healthScore, 0) / olderScans.length;
  
  const improvement = recentAvgScore - olderAvgScore;
  
  if (Math.abs(improvement) < 5) return null; // No significant change
  
  const isImproving = improvement > 0;
  
  return {
    userId: scans[0].userId,
    type: 'nutrition_trend',
    title: `🤖 Grok AI: Health Score ${isImproving ? 'Improving' : 'Declining'} Trend`,
    description: `Grok AI detected your health scores are ${isImproving ? 'improving' : 'declining'} by ${Math.abs(improvement).toFixed(1)} points. ${isImproving ? 'Keep up the great work!' : 'Let\'s get back on track.'}`,
    severity: isImproving ? 'low' : 'medium',
    actionItems: isImproving ? [
      'Continue making healthy food choices',
      'Maintain your current eating patterns',
      'Consider setting new nutrition goals'
    ] : [
      'Review recent food choices for improvement opportunities',
      'Focus on whole foods and balanced meals',
      'Consider meal planning to stay consistent'
    ],
    relatedScans: scans.map(s => s.id!),
    generatedAt: new Date(),
    isRead: false
  };
};

// Detect meal timing patterns with Grok AI
const detectGrokMealTimingPatterns = (scans: NutritionScanResult[]): HealthInsight | null => {
  const scansWithTime = scans.filter(scan => scan.timestamp);
  if (scansWithTime.length < 5) return null;
  
  const hourCounts: { [hour: number]: number } = {};
  scansWithTime.forEach(scan => {
    const hour = new Date(scan.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const lateNightScans = Object.entries(hourCounts)
    .filter(([hour]) => parseInt(hour) >= 22 || parseInt(hour) <= 5)
    .reduce((sum, [, count]) => sum + count, 0);
  
  const lateNightPercentage = (lateNightScans / scansWithTime.length) * 100;
  
  if (lateNightPercentage < 20) return null;
  
  return {
    userId: scans[0].userId,
    type: 'recommendation',
    title: '🤖 Grok AI: Late Night Eating Pattern',
    description: `Grok AI detected ${lateNightPercentage.toFixed(1)}% of your food scans occur late at night. Late eating can affect sleep and metabolism.`,
    severity: 'medium',
    actionItems: [
      'Try to finish eating 2-3 hours before bedtime',
      'Plan satisfying dinners to reduce late-night cravings',
      'If hungry late, choose light, protein-rich snacks',
      'Consider adjusting meal timing throughout the day'
    ],
    relatedScans: scans.map(s => s.id!),
    generatedAt: new Date(),
    isRead: false
  };
};

// Detect food category patterns with Grok AI
const detectGrokCategoryPatterns = (scans: NutritionScanResult[]): HealthInsight | null => {
  if (scans.length < 5) return null;
  
  const categories: { [category: string]: number } = {};
  scans.forEach(scan => {
    categories[scan.category] = (categories[scan.category] || 0) + 1;
  });
  
  const topCategory = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)[0];
  
  const categoryPercentage = (topCategory[1] / scans.length) * 100;
  
  if (categoryPercentage < 40) return null;
  
  return {
    userId: scans[0].userId,
    type: 'recommendation',
    title: '🤖 Grok AI: Food Variety Analysis',
    description: `Grok AI noticed ${categoryPercentage.toFixed(1)}% of your scans are from "${topCategory[0]}" category. Diversifying food choices enhances nutrition.`,
    severity: 'low',
    actionItems: [
      'Explore foods from different categories',
      'Try new cuisines and cooking methods',
      'Add more variety to your weekly meal planning',
      'Consider seasonal fruits and vegetables'
    ],
    relatedScans: scans.map(s => s.id!),
    generatedAt: new Date(),
    isRead: false
  };
};

// Detect nutritional gaps with Grok AI
const detectGrokNutritionalGaps = (scans: NutritionScanResult[]): HealthInsight | null => {
  if (scans.length < 3) return null;
  
  const avgFiber = scans.reduce((sum, scan) => sum + (scan.macros.fiber || 0), 0) / scans.length;
  const hasLowFiber = avgFiber < 5;
  
  const vitaminCScans = scans.filter(scan => 
    scan.micronutrients?.vitaminC && scan.micronutrients.vitaminC > 0
  );
  const hasLowVitaminC = vitaminCScans.length < scans.length * 0.3;
  
  if (!hasLowFiber && !hasLowVitaminC) return null;
  
  const gaps = [];
  if (hasLowFiber) gaps.push('fiber');
  if (hasLowVitaminC) gaps.push('vitamin C');
  
  return {
    userId: scans[0].userId,
    type: 'recommendation',
    title: '🤖 Grok AI: Nutritional Gap Detection',
    description: `Grok AI identified potential gaps in ${gaps.join(' and ')}. These nutrients are important for optimal health.`,
    severity: 'medium',
    actionItems: [
      hasLowFiber ? 'Add more fruits, vegetables, and whole grains for fiber' : '',
      hasLowVitaminC ? 'Include citrus fruits, berries, or bell peppers for vitamin C' : '',
      'Consider a varied, colorful diet to cover all nutrients',
      'Track your nutrition to identify other potential gaps'
    ].filter(Boolean),
    relatedScans: scans.map(s => s.id!),
    generatedAt: new Date(),
    isRead: false
  };
};

// Generate smart food swaps with Grok AI
const generateGrokSmartSwaps = (scans: NutritionScanResult[]): HealthInsight | null => {
  const lowScoreScans = scans.filter(scan => scan.healthScore < 60);
  if (lowScoreScans.length === 0) return null;
  
  const swapSuggestions = [
    'Replace sugary drinks with sparkling water with fruit',
    'Swap white bread for whole grain alternatives',
    'Choose baked or grilled options instead of fried foods',
    'Try Greek yogurt instead of regular yogurt for more protein',
    'Replace candy with fresh fruit for natural sweetness'
  ];
  
  return {
    userId: scans[0].userId,
    type: 'recommendation',
    title: '🤖 Grok AI: Smart Food Swaps',
    description: `Grok AI suggests simple swaps to improve ${lowScoreScans.length} of your recent food choices.`,
    severity: 'low',
    actionItems: swapSuggestions.slice(0, 3),
    relatedScans: lowScoreScans.map(s => s.id!),
    generatedAt: new Date(),
    isRead: false
  };
};

// Generate meal planning with Grok AI
const generateGrokMealPlanning = (scans: NutritionScanResult[], userProfile: any): HealthInsight | null => {
  if (scans.length < 3) return null;
  
  const avgCalories = scans.reduce((sum, scan) => sum + scan.calories, 0) / scans.length;
  const isHighCalorie = avgCalories > 400; // Per item
  
  return {
    userId: scans[0].userId,
    type: 'recommendation',
    title: '🤖 Grok AI: Personalized Meal Planning',
    description: `Based on your scanning patterns, Grok AI suggests ${isHighCalorie ? 'portion-controlled' : 'nutrient-dense'} meal planning strategies.`,
    severity: 'low',
    actionItems: isHighCalorie ? [
      'Plan smaller, more frequent meals throughout the day',
      'Use smaller plates to help with portion control',
      'Include more vegetables to add volume with fewer calories',
      'Prepare healthy snacks in advance'
    ] : [
      'Add calorie-dense healthy foods like nuts and avocados',
      'Include protein with each meal for sustained energy',
      'Consider smoothies with fruits and protein powder',
      'Plan balanced meals with all food groups'
    ],
    relatedScans: scans.map(s => s.id!),
    generatedAt: new Date(),
    isRead: false
  };
};

// Generate optimization tips with Grok AI
const generateGrokOptimizationTips = (scans: NutritionScanResult[], userProfile: any): HealthInsight | null => {
  if (scans.length < 5) return null;
  
  const highScoreScans = scans.filter(scan => scan.healthScore >= 80);
  const successRate = (highScoreScans.length / scans.length) * 100;
  
  if (successRate < 30) {
    return {
      userId: scans[0].userId,
      type: 'recommendation',
      title: '🤖 Grok AI: Health Optimization Strategy',
      description: `Grok AI developed a personalized optimization plan based on your ${successRate.toFixed(1)}% healthy choice rate.`,
      severity: 'medium',
      actionItems: [
        'Start with one healthy meal per day and gradually increase',
        'Focus on whole foods: fruits, vegetables, lean proteins',
        'Stay hydrated with water throughout the day',
        'Plan your meals in advance to avoid impulsive choices',
        'Celebrate small wins to build sustainable habits'
      ],
      relatedScans: scans.map(s => s.id!),
      generatedAt: new Date(),
      isRead: false
    };
  }
  
  return {
    userId: scans[0].userId,
    type: 'recommendation',
    title: '🤖 Grok AI: Advanced Health Optimization',
    description: `Excellent work! Grok AI sees you\'re making healthy choices ${successRate.toFixed(1)}% of the time. Ready for advanced optimization?`,
    severity: 'low',
    actionItems: [
      'Fine-tune portion sizes based on your activity level',
      'Experiment with nutrient timing around workouts',
      'Consider micronutrient density in food choices',
      'Track how different foods affect your energy levels',
      'Set new challenging but achievable nutrition goals'
    ],
    relatedScans: scans.map(s => s.id!),
    generatedAt: new Date(),
    isRead: false
  };
};
