import axios, { AxiosError } from 'axios';
import https from 'https';

// Types for Grok API responses
export interface GrokVisionResponse {
  description: string;
  foodItems: {
    name: string;
    confidence: number;
    portion: string;
  }[];
  detailedAnalysis: string;
  // Comprehensive data from Grok AI
  allergens?: string[];
  nutritionalData?: any;
  healthBenefits?: string[];
  healthConcerns?: string[];
  concerns?: string[];
  alternatives?: string[];
  personalizedTips?: string[];
  warnings?: string[];
  dietaryFlags?: string[];
  rawGrokData?: any;
}

/**
 * Analyze an image using the Grok Vision API
 * @param imageDataUrl - Base64 encoded image data URL (data:image/jpeg;base64,xxxxx)
 */
export async function analyzeImageWithGrok(imageDataUrl: string): Promise<GrokVisionResponse> {
  try {
    console.log('Sending image to Grok Vision API for analysis');
    
    // This is a server-side function that will be called from the API route
    // Not from the client browser - this avoids CORS and SSL issues
    
    // For security, we'll get the API key from environment variables
    const GROK_API_KEY = process.env.GROK_API_KEY;
    if (!GROK_API_KEY) {
      throw new Error('GROK_API_KEY environment variable is not set');
    }
    
    // Use the correct API endpoint from the xAI documentation
    const GROK_API_ENDPOINT = process.env.GROK_API_ENDPOINT || 'https://api.x.ai/v1/chat/completions';
    
    // Use the appropriate model version
    const GROK_MODEL = process.env.GROK_MODEL || 'grok-2-vision-1212'; // Vision-capable model
    
    console.log('Using API endpoint:', GROK_API_ENDPOINT);
    console.log('Using model:', GROK_MODEL);
    
    // Validate that we have a proper data URL
    if (!imageDataUrl.startsWith('data:image')) {
      throw new Error('Invalid image format. Expected data URL format.');
    }
    
    // Format request according to the xAI API specification
    const response = await axios({
      method: 'post',
      url: GROK_API_ENDPOINT,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      timeout: 30000, // 30 second timeout
      // Configure axios with proper SSL handling
      httpsAgent: process.env.NODE_ENV === 'development' && process.env.ALLOW_INSECURE_SSL === 'true' 
        ? new https.Agent({ rejectUnauthorized: false }) // Only in development with explicit permission
        : undefined, // Use default secure settings in production
      data: {
        model: GROK_MODEL, // Using configurable model from environment or default
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
text: `Analyze this food image and provide comprehensive nutritional and allergen analysis. Return your response as a JSON object with the following EXACT structure:

{
  "success": true,
  "timestamp": "2025-07-20T05:32:04.917Z",
  "allergens": ["wheat", "gluten", "dairy", "milk", "eggs", "nuts", "peanuts", "soy", "sesame"],
  "foodItems": [
    {
      "name": "Food item name",
      "brand": "Brand if visible",
      "category": "Food category",
      "confidence": 0.9,
      "portion": "Estimated portion size",
      "servingSize": "1 serving",
      "calories": 250,
      "protein": 15,
      "carbs": 30,
      "fat": 10,
      "fiber": 5,
      "sugar": 8,
      "sodium": 400,
      "allergens": ["milk", "wheat"],
      "benefits": ["High in protein"],
      "concerns": ["High in sodium"],
      "alternatives": ["Low-sodium version"],
      "tips": ["Consume in moderation"]
    }
  ],
  "nutritionalData": {
    "calories": 250,
    "protein": 15,
    "carbohydrates": 30,
    "carbs": 30,
    "fat": 10,
    "fiber": 5,
    "sugar": 8,
    "sodium": 400,
    "healthScore": 75,
    "healthGrade": "B+",
    "allergens": ["milk", "wheat"],
    "warnings": ["High in sodium", "Contains allergens"],
    "dietaryFlags": ["vegetarian", "high-protein"],
    "healthInsights": ["Provides protein", "Contains fiber"],
    "nutritionalEstimate": {
      "calories": 250,
      "protein": 15,
      "carbs": 30,
      "fat": 10
    }
  },
  "healthBenefits": ["Good source of protein", "Contains essential nutrients"],
  "healthConcerns": ["High in sodium", "Contains processed ingredients"],
  "concerns": ["High sodium content", "Allergen exposure risk"],
  "alternatives": ["Choose low-sodium options", "Look for organic versions"],
  "personalizedTips": ["Pair with vegetables", "Drink water to offset sodium"],
  "warnings": ["High in calories and sodium", "Contains multiple allergens"],
  "dietaryFlags": ["processed", "high-sodium"]
}

IMPORTANT INSTRUCTIONS:
1. Identify ALL visible allergens: wheat, gluten, dairy, milk, eggs, nuts, peanuts, soy, sesame, shellfish, fish
2. Provide realistic calorie and macro estimates based on visible portions
3. Include comprehensive health insights and warnings
4. Return actual numbers, not strings for nutritional values
5. Be thorough in allergen detection - check ingredients, cooking methods, cross-contamination risks
6. Provide actionable health tips and alternatives` 
              },
              { 
                type: "image_url", 
                image_url: { 
                  url: imageDataUrl, // Use the complete data URL as provided
                  detail: "high" // Use high detail for better nutritional analysis
                } 
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      }
    });
    
    if (!response.data) {
      throw new Error('Received empty response from Grok API');
    }

    console.log('Received response from Grok API');
    console.log('Response usage:', response.data.usage); // Log token usage for monitoring

    // Process the AI response into our expected format
    if (!response.data.choices || !response.data.choices[0]?.message?.content) {
      console.error('Invalid response structure:', response.data);
      throw new Error('Unexpected response format from Grok API: missing choices or content');
    }

    const aiContent = response.data.choices[0].message.content;
    console.log('🤖 Grok AI Content received, length:', aiContent.length);
    console.log('📄 Raw Grok response:', aiContent.substring(0, 500) + '...');

    // Try to parse JSON response
    let grokData: any = {};
    
    try {
      // First try to parse as direct JSON
      try {
        grokData = JSON.parse(aiContent);
        console.log('✅ Successfully parsed direct JSON response');
      } catch {
        // Try to extract JSON from code blocks
        const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          grokData = JSON.parse(jsonMatch[1].trim());
          console.log('✅ Successfully parsed JSON from code block');
        } else {
          // Try to extract JSON from any curly braces
          const jsonBracesMatch = aiContent.match(/\{[\s\S]*\}/);
          if (jsonBracesMatch) {
            grokData = JSON.parse(jsonBracesMatch[0]);
            console.log('✅ Successfully parsed JSON from braces match');
          } else {
            throw new Error('No JSON found in response');
          }
        }
      }
      
      console.log('🎯 Parsed Grok data structure:', Object.keys(grokData));
      
      // Process food items
      const foodItems: Array<{name: string; confidence: number; portion: string}> = [];
      
      if (grokData.foodItems && Array.isArray(grokData.foodItems)) {
        grokData.foodItems.forEach((food: any) => {
          foodItems.push({
            name: food.name || 'Unknown food',
            confidence: food.confidence || 0.9,
            portion: food.portion || food.servingSize || 'regular',
          });
        });
        console.log(`🍽️ Processed ${foodItems.length} food items from Grok`);
      }
      
      // If no food items, try legacy 'foods' field
      if (foodItems.length === 0 && grokData.foods && Array.isArray(grokData.foods)) {
        grokData.foods.forEach((food: any) => {
          foodItems.push({
            name: food.name || 'Unknown food',
            confidence: food.confidence || 0.9,
            portion: food.portion || 'regular',
          });
        });
        console.log(`🍽️ Processed ${foodItems.length} food items from legacy 'foods' field`);
      }
      
      // Final fallback if no food items were extracted
      if (foodItems.length === 0) {
        console.log('⚠️ No food items found, creating fallback');
        foodItems.push({
          name: "Unidentified food item",
          confidence: 0.5,
          portion: 'regular',
        });
      }
      
      console.log('✨ Returning comprehensive Grok response with full data structure');
      
      // Return the complete Grok data structure for comprehensive processing
      return {
        description: grokData.description || aiContent.substring(0, 200) + (aiContent.length > 200 ? '...' : ''),
        foodItems,
        detailedAnalysis: aiContent,
        // Include all the comprehensive data from Grok
        allergens: grokData.allergens || [],
        nutritionalData: grokData.nutritionalData || {},
        healthBenefits: grokData.healthBenefits || [],
        healthConcerns: grokData.healthConcerns || grokData.concerns || [],
        concerns: grokData.concerns || [],
        alternatives: grokData.alternatives || [],
        personalizedTips: grokData.personalizedTips || [],
        warnings: grokData.warnings || [],
        dietaryFlags: grokData.dietaryFlags || [],
        // Store raw data for comprehensive extraction
        rawGrokData: grokData
      };
      
    } catch (parseError) {
      console.error('❌ Error parsing Grok response:', parseError);
      console.log('📝 Falling back to text analysis...');
      
      // Fallback: create basic response
      return {
        description: aiContent.substring(0, 200) + (aiContent.length > 200 ? '...' : ''),
        foodItems: [{
          name: "Unidentified food item",
          confidence: 0.5,
          portion: 'regular',
        }],
        detailedAnalysis: aiContent,
        allergens: [],
        nutritionalData: {},
        healthBenefits: [],
        healthConcerns: [],
        concerns: [],
        alternatives: [],
        personalizedTips: [],
        warnings: ['AI analysis parsing failed'],
        dietaryFlags: [],
        rawGrokData: { error: 'Parsing failed', rawContent: aiContent }
      };
    }
  } catch (error: any) {
    console.error('Error analyzing image with Grok:', error);
    
    // Handle specific API errors for better debugging
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // The request was made and the server responded with a status code outside of 2xx range
        console.error('API error response:', axiosError.response.status, axiosError.response.data);
        throw new Error(`Grok API error (${axiosError.response.status}): ${JSON.stringify(axiosError.response.data)}`);
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error('API request error - no response received');
        throw new Error('No response received from Grok API. Please check your network connection and API endpoint.');
      }
    }
    
    // Generic error fallback
    throw new Error(`Grok analysis failed: ${error.message || error}`);
  }
}
