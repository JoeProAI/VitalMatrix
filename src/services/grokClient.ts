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
text: `Analyze this food image and provide a detailed nutritional analysis. Return your response as a JSON object with the following structure:

{
  "foods": [
    {
      "name": "Food item name",
      "portion": "Estimated portion size",
      "calories": "Estimated calories per serving",
      "macros": {
        "protein": "X grams",
        "carbs": "X grams",
        "fat": "X grams",
        "fiber": "X grams"
      },
      "vitamins": ["Key vitamins present"],
      "minerals": ["Key minerals present"]
    }
  ],
  "totalNutrition": {
    "calories": "Total estimated calories",
    "protein": "Total protein",
    "carbs": "Total carbohydrates",
    "fat": "Total fat"
  },
  "healthScore": "1-10 rating",
  "benefits": ["Health benefits"],
  "concerns": ["Health concerns if any"],
  "dietaryTags": ["vegetarian", "vegan", "gluten-free", "dairy-free", "keto-friendly", "high-protein", "low-carb", etc.]
}

Provide accurate nutritional estimates based on visible portions and typical serving sizes.` 
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
    console.log('AI Content received, length:', aiContent.length);

    // Extract food items and other details
    const foodItems: Array<{name: string; confidence: number; portion: string}> = [];
    
    // Try to parse the response based on formatting
    try {
      // First check if there are JSON blocks in the response
      const jsonMatch = aiContent.match(/```json([\s\S]*?)```/);
      
      if (jsonMatch && jsonMatch[1]) {
        // Parse any JSON data in the response
        const jsonData = JSON.parse(jsonMatch[1].trim());
        if (jsonData.foods && Array.isArray(jsonData.foods)) {
          jsonData.foods.forEach((food: any) => {
            foodItems.push({
              name: food.name || 'Unknown food',
              confidence: food.confidence || 0.9,
              portion: food.portion || 'regular',
            });
          });
        }
      } else {
        // Extract food items by parsing text sections
        const lines = aiContent.split('\n');
        let inFoodSection = false;
        const foodMatches: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          const lowerLine = line.toLowerCase();
          
          // Identify food item sections
          if (lowerLine.includes('food item') || lowerLine.includes('identified') || 
              lowerLine.match(/^\d+\.\s*identified/) || lowerLine.match(/^food items:/i)) {
            inFoodSection = true;
            continue;
          }
          
          if (inFoodSection && line) {
            // Check for section transitions
            if (lowerLine.includes('nutrition') || lowerLine.includes('health') || 
                lowerLine.includes('dietary') || lowerLine.match(/^\d+\.\s*(nutrition|health)/)) {
              inFoodSection = false;
              continue;
            }
            
            // Identify food items (usually formatted as lists or with colons)
            if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/) || 
                line.includes(':') || (line.length > 3 && !line.match(/^[#>]/))) {
              foodMatches.push(line);
            }
          }
        }
        
        // Process the identified food items
        foodMatches.forEach((match: string, index: number) => {
          // Clean up the text and extract the food name
          let name = match;
          name = name.replace(/^[-•*\d\.\s]+/, '').trim(); // Remove list markers
          name = name.split(/[:–—]/)[0].trim(); // Take part before colon or dash
          
          if (name && name.length > 2 && !name.toLowerCase().includes('could not identify')) {
            foodItems.push({
              name,
              confidence: 0.9 - (index * 0.05), // Decrease confidence for later items
              portion: 'regular',
            });
          }
        });
      }
      
      // If no food items were found, extract potential mentions from the text
      if (foodItems.length === 0) {
        // Look for food item mentions using common patterns
        const foodMentionMatches = aiContent.match(/\b(apple|banana|orange|pizza|burger|sandwich|salad|pasta|rice|chicken|beef|fish)\b/ig);
        if (foodMentionMatches && foodMentionMatches.length > 0) {
          // Deduplicate
          const uniqueFoods = [...new Set(foodMentionMatches.map(item => {
            return item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
          }))];
          
          uniqueFoods.forEach((food, index: number) => {
            foodItems.push({
              name: typeof food === 'string' ? food : String(food),
              confidence: 0.8 - (index * 0.1),
              portion: 'regular',
            });
          });
        }
      }
    } catch (parseError) {
      console.error('Error parsing Grok response:', parseError);
    }
    
    // Final fallback if no food items were extracted
    if (foodItems.length === 0) {
      foodItems.push({
        name: "Unidentified food item",
        confidence: 0.5,
        portion: 'regular',
      });
    }
    
    // Create and return the formatted response
    return {
      description: aiContent.substring(0, 200) + (aiContent.length > 200 ? '...' : ''), // Truncated description
      foodItems,
      detailedAnalysis: aiContent
    };
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
