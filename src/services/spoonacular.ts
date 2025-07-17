/**
 * Spoonacular API Service
 * 
 * This service handles all interactions with the Spoonacular API for nutrition data
 * and food information lookup based on barcodes, food names, and other queries.
 * 
 * Note: We use a Modal proxy to avoid CORS issues with direct API access.
 */

// API configuration
// Use Next.js API routes to avoid CORS issues - most reliable option for the hackathon
const PROXY_API_BASE_URL = '/api/spoonacular';
const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || '';

// Type definitions
export interface NutritionInfo {
  calories?: number;
  carbs?: string;
  fat?: string;
  protein?: string;
  servingSize?: string;
  nutrients?: Array<{
    name: string;
    amount: number;
    unit: string;
    percentOfDailyNeeds?: number;
  }>;
  ingredients?: Array<{
    name: string;
    amount?: number;
    unit?: string;
  }>;
}

export interface ProductInfo {
  id: number;
  title: string;
  imageUrl?: string;
  nutrition?: NutritionInfo;
  badges?: string[];
  importantBadges?: string[];
  generatedProduct?: boolean;
  ingredientList?: string;
  breadcrumbs?: string[];
  upc?: string;
  aisle?: string;
}

/**
 * Lookup a food product by UPC/EAN barcode
 * @param barcode UPC/EAN barcode number
 * @returns Product information with nutrition data
 */
export async function getProductByBarcode(barcode: string): Promise<ProductInfo> {
  try {
    // Make API request through our proxy
    const response = await fetch(
      `${PROXY_API_BASE_URL}/product/${barcode}`
    );
    
    if (!response.ok) {
      // Handle various error conditions
      if (response.status === 404) {
        throw new Error('Product not found for this barcode');
      } else if (response.status === 402) {
        throw new Error('API quota exceeded');
      } else {
        throw new Error(`Spoonacular API error: ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    // Transform the response into our ProductInfo format
    const product: ProductInfo = {
      id: data.id,
      title: data.title,
      imageUrl: data.image,
      upc: barcode,
      aisle: data.aisle,
      ingredientList: data.ingredientList,
      badges: data.badges || [],
      importantBadges: data.importantBadges || [],
      breadcrumbs: data.breadcrumbs || [],
      nutrition: transformNutrition(data.nutrition)
    };
    
    return product;
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    
    if ((error as Error).message === 'Product not found for this barcode') {
      // Fall back to product search API if the exact UPC isn't found
      return searchProductByKeyword(barcode);
    }
    
    throw error;
  }
}

/**
 * Search for products using keywords
 * @param query Search query or keywords
 * @returns List of matching products
 */
export async function searchProductByKeyword(query: string): Promise<ProductInfo> {
  try {
    // First search for products matching the query
    const searchResponse = await fetch(
      `${PROXY_API_BASE_URL}/products/search?query=${encodeURIComponent(query)}&number=1`
    );
    
    if (!searchResponse.ok) {
      throw new Error(`Spoonacular API error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.products || searchData.products.length === 0) {
      throw new Error('No products found matching the query');
    }
    
    const topProduct = searchData.products[0];
    
    // Then get detailed information for the top product
    const detailsResponse = await fetch(
      `${PROXY_API_BASE_URL}/products/${topProduct.id}`
    );
    
    if (!detailsResponse.ok) {
      throw new Error(`Spoonacular API error: ${detailsResponse.status}`);
    }
    
    const detailsData = await detailsResponse.json();
    
    // Transform the response into our ProductInfo format
    const product: ProductInfo = {
      id: detailsData.id,
      title: detailsData.title,
      imageUrl: detailsData.image,
      aisle: detailsData.aisle,
      ingredientList: detailsData.ingredientList,
      badges: detailsData.badges || [],
      importantBadges: detailsData.importantBadges || [],
      breadcrumbs: detailsData.breadcrumbs || [],
      nutrition: transformNutrition(detailsData.nutrition),
      // Mark as generated since it wasn't a direct barcode match
      generatedProduct: true
    };
    
    return product;
  } catch (error) {
    console.error('Error searching for product:', error);
    throw error;
  }
}

/**
 * Get nutritional information for a food item by name
 * @param query Food item name or description
 * @returns Detailed nutrition information
 */
export async function getNutritionByFoodName(query: string): Promise<NutritionInfo> {
  try {
    const response = await fetch(
      `${PROXY_API_BASE_URL}/recipes/guessNutrition?title=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the response into our NutritionInfo format
    const nutritionInfo: NutritionInfo = {
      calories: data.calories?.value || 0,
      carbs: data.carbs?.value ? `${data.carbs.value}${data.carbs.unit}` : undefined,
      fat: data.fat?.value ? `${data.fat.value}${data.fat.unit}` : undefined,
      protein: data.protein?.value ? `${data.protein.value}${data.protein.unit}` : undefined
    };
    
    return nutritionInfo;
  } catch (error) {
    console.error('Error getting nutrition by food name:', error);
    throw error;
  }
}

/**
 * Transform Spoonacular nutrition data into our standardized format
 */
function transformNutrition(nutritionData: any): NutritionInfo {
  if (!nutritionData) {
    return {};
  }
  
  const nutrients = nutritionData.nutrients?.map((nutrient: any) => ({
    name: nutrient.name,
    amount: nutrient.amount,
    unit: nutrient.unit,
    percentOfDailyNeeds: nutrient.percentOfDailyNeeds
  }));
  
  return {
    calories: nutrients?.find(n => n.name === 'Calories')?.amount,
    carbs: nutrients?.find(n => n.name === 'Carbohydrates')?.amount + 'g',
    fat: nutrients?.find(n => n.name === 'Fat')?.amount + 'g',
    protein: nutrients?.find(n => n.name === 'Protein')?.amount + 'g',
    servingSize: nutritionData.servingSize,
    nutrients
  };
}

/**
 * Get ingredient information by ID
 * @param id Ingredient ID
 * @returns Detailed ingredient information
 */
export async function getIngredientInformation(id: number): Promise<any> {
  try {
    const response = await fetch(`${PROXY_API_BASE_URL}/food/ingredients/${id}/information?amount=1`);
    
    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting ingredient information:', error);
    throw error;
  }
}

/**
 * Analyze a food image and extract nutritional information
 * @param imageFile The image file to analyze
 * @returns Nutrition information
 */
export async function analyzeFood(imageFile: File): Promise<any> {
  try {
    // Convert the file to a base64 string
    const base64Image = await fileToBase64(imageFile);
    
    // First try our local AI-powered analysis which is more reliable for the hackathon
    console.log('Analyzing food image with AI analysis');
    try {
      const aiResponse = await fetch('/api/ai-analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Image }),
      });
      
      if (aiResponse.ok) {
        console.log('Successfully analyzed image with AI');
        return await aiResponse.json();
      } else {
        console.warn(`AI analysis failed with status: ${aiResponse.status}, falling back to Spoonacular`);
      }
    } catch (aiError) {
      console.warn('Error during AI analysis, falling back to Spoonacular:', aiError);
    }
    
    // Fall back to Spoonacular if AI analysis fails
    console.log(`Falling back to Spoonacular API: ${PROXY_API_BASE_URL}/analyze-food`);
    
    const response = await fetch(
      `${PROXY_API_BASE_URL}/analyze-food`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Image }),
      }
    );
    
    if (!response.ok) {
      if (response.status === 402) {
        throw new Error('API quota exceeded. Please check your Spoonacular API subscription.');
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('API authorization error. Using fallback data for hackathon demo.');
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    // No fallback to simulated data - fail properly
    console.error('Food analysis failed completely:', error);
    throw new Error(`API authorization error: ${error.message}`);
  }
}

/**
 * Helper function to convert a file to base64
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Get recipe suggestions based on ingredients
 * @param ingredients List of ingredients
 * @returns List of matching recipes
 */
export async function findRecipesByIngredients(ingredients: string[]): Promise<any> {
  try {
    const ingredientsParam = ingredients.join(',');
    const response = await fetch(
      `${PROXY_API_BASE_URL}/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientsParam)}&number=5`
    );
    
    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error finding recipes by ingredients:', error);
    throw error;
  }
}
