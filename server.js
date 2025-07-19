import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_ENDPOINT = process.env.GROK_API_ENDPOINT || 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = process.env.GROK_MODEL || 'grok-2-vision-1212';

// Places search endpoint
app.get('/api/places/search', async (req, res) => {
  try {
    const { lat, lng, radius = 5000, type = 'health' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng parameters are required' });
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ error: 'Google Places API key not configured' });
    }

    const location = `${lat},${lng}`;
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${location}&` +
      `radius=${radius}&` +
      `type=${type}&` +
      `key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API status: ${data.status}`);
    }

    res.json(data);
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({ 
      error: 'Failed to search places',
      details: error.message
    });
  }
});

// AI food analysis endpoint using Grok
app.post('/api/ai-analyze-food', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    console.log('🔍 Starting Grok AI food analysis...');
    console.log('📊 Image data length:', image.length);
    
    // Handle data URL format - extract base64 data if present
    let imageData = image;
    if (image.startsWith('data:image/')) {
      // Extract base64 data from data URL
      const base64Data = image.split(',')[1];
      if (base64Data) {
        imageData = `data:image/jpeg;base64,${base64Data}`;
        console.log('📸 Converted data URL to proper format');
      }
    }
    
    console.log('🔗 Image format:', imageData.substring(0, 50) + '...');
    
    if (!GROK_API_KEY) {
      return res.status(500).json({ error: 'GROK_API_KEY environment variable is not set' });
    }

    console.log('📤 Sending image to Grok AI for comprehensive food analysis...');
    
    const grokResponse = await axios({
      method: 'post',
      url: GROK_API_ENDPOINT,
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000, // 30 seconds timeout
      data: {
        model: GROK_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `🍽️ COMPREHENSIVE FOOD ANALYSIS REQUEST 🍽️

Analyze this food image and identify EVERY food item visible. Provide detailed nutritional analysis and COMPLETE ALLERGEN INFORMATION.

Return your response as a JSON object with this EXACT structure:

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
        "fiber": "X grams",
        "sugar": "X grams",
        "sodium": "X mg"
      },
      "micronutrients": {
        "vitaminC": "X mg",
        "calcium": "X mg",
        "iron": "X mg",
        "vitaminA": "X mcg",
        "vitaminD": "X mcg",
        "potassium": "X mg"
      },
      "allergens": ["List ALL potential allergens: milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soybeans, sesame, etc."],
      "ingredients": ["Likely ingredients in this food item"]
    }
  ],
  "totalNutrition": {
    "calories": "Total calories for all foods",
    "protein": "Total protein grams",
    "carbs": "Total carbs grams", 
    "fat": "Total fat grams"
  },
  "allergenWarnings": ["COMPREHENSIVE list of ALL potential allergens present in ANY of the foods"],
  "healthScore": "1-10 rating based on nutritional value",
  "benefits": ["Health benefits of these foods"],
  "concerns": ["Health concerns, allergen warnings, dietary restrictions"],
  "dietaryTags": ["vegetarian", "vegan", "gluten-free", "dairy-free", "keto-friendly", "high-protein", "low-carb", "nut-free", etc.]
}

🚨 CRITICAL REQUIREMENTS:
- Identify ALL visible food items, not just the main one
- Be EXTREMELY thorough with allergen identification - include hidden allergens in processed foods  
- Consider cross-contamination risks
- Provide accurate nutritional estimates based on visible portions
- If unsure about allergens, err on the side of caution and include potential risks
- Look for ingredients that commonly contain allergens (sauces, breading, seasonings, etc.)` 
              },
              { 
                type: "image_url", 
                image_url: { 
                  url: imageData,
                  detail: "high"
                } 
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }
    });
    
    console.log('✅ Grok analysis complete');
    
    const aiContent = grokResponse.data?.choices?.[0]?.message?.content || '';
    console.log('🔍 AI Response length:', aiContent.length);
    console.log('📝 AI Response preview:', aiContent.substring(0, 500) + '...');
    
    // Parse the response and extract food items
    let foodItems = [];
    let nutritionalData = {
      nutritionalEstimate: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
      healthInsights: [],
      warnings: [],
      allergens: []
    };
    
    try {
      // Try to parse JSON response - handle markdown code blocks
      let jsonContent = aiContent;
      
      // Remove markdown code block formatting if present
      if (aiContent.includes('```json')) {
        const jsonStart = aiContent.indexOf('```json') + 7;
        const jsonEnd = aiContent.lastIndexOf('```');
        if (jsonEnd > jsonStart) {
          jsonContent = aiContent.substring(jsonStart, jsonEnd).trim();
        }
      }
      
      // Additional cleanup: remove any remaining markdown formatting
      jsonContent = jsonContent.replace(/^```json\s*/g, '').replace(/\s*```$/g, '').trim();
      
      // Fallback: extract JSON object if no markdown blocks found
      if (!jsonContent || jsonContent === aiContent) {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
      }
      
      console.log('🔧 Extracted JSON content:', jsonContent.substring(0, 200) + '...');
      const parsedData = JSON.parse(jsonContent);
        
        if (parsedData.foods && Array.isArray(parsedData.foods)) {
          foodItems = parsedData.foods.map((food, index) => ({
            name: food.name || `Food item ${index + 1}`,
            confidence: 0.9 - (index * 0.05),
            portion: food.portion || 'regular',
            allergens: food.allergens || [],
            ingredients: food.ingredients || []
          }));
          
          if (parsedData.totalNutrition) {
            nutritionalData.nutritionalEstimate = {
              calories: parseInt(parsedData.totalNutrition.calories) || 0,
              protein: parseInt(parsedData.totalNutrition.protein) || 0,
              carbs: parseInt(parsedData.totalNutrition.carbs) || 0,
              fat: parseInt(parsedData.totalNutrition.fat) || 0,
            };
          }
          
          if (parsedData.benefits) {
            nutritionalData.healthInsights = parsedData.benefits;
          }
          
          if (parsedData.concerns) {
            nutritionalData.warnings = parsedData.concerns;
          }
          
          if (parsedData.allergenWarnings) {
            nutritionalData.allergens = parsedData.allergenWarnings;
          }
        }
    } catch (parseError) {
      console.log('⚠️ Could not parse JSON, extracting food items from text');
      
      // Fallback: extract food items from text
      const lines = aiContent.split('\n');
      let inFoodSection = false;
      const foodMatches = [];
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        if (lowerLine.includes('food item') || lowerLine.includes('identified') || 
            lowerLine.match(/^\d+\.\s*identified/) || lowerLine.match(/^food items:/i)) {
          inFoodSection = true;
          continue;
        }
        
        if (inFoodSection && line) {
          if (lowerLine.includes('nutrition') || lowerLine.includes('health') || 
              lowerLine.includes('dietary') || lowerLine.match(/^\d+\.\s*(nutrition|health)/)) {
            inFoodSection = false;
            continue;
          }
          
          if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/) || 
              line.includes(':') || (line.length > 3 && !line.match(/^[#>]/))) {
            foodMatches.push(line);
          }
        }
      }
      
      foodMatches.forEach((match, index) => {
        let name = match;
        name = name.replace(/^[-•*\d\.\s]+/, '').trim();
        name = name.split(/[:–—]/)[0].trim();
        
        if (name && name.length > 2 && !name.toLowerCase().includes('could not identify')) {
          foodItems.push({
            name,
            confidence: 0.9 - (index * 0.05),
            portion: 'regular',
            allergens: [],
            ingredients: []
          });
        }
      });
    }
    
    if (foodItems.length === 0) {
      foodItems.push({
        name: "Unidentified food item",
        confidence: 0.5,
        portion: 'regular',
        allergens: [],
        ingredients: []
      });
    }
    
    const response = {
      success: true,
      foodItems,
      description: aiContent.substring(0, 200) + (aiContent.length > 200 ? '...' : ''),
      nutritionalData,
      detailedAnalysis: aiContent
    };
    
    console.log('📊 Analysis complete, returning results with allergen information');
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error in AI analysis:', error);
    
    if (axios.isAxiosError && axios.isAxiosError(error)) {
      const axiosError = error;
      if (axiosError.response) {
        console.error('API error response:', axiosError.response.status, axiosError.response.data);
        return res.status(500).json({ error: `Grok API error (${axiosError.response.status}): ${JSON.stringify(axiosError.response.data)}` });
      } else if (axiosError.request) {
        console.error('API request error - no response received');
        return res.status(500).json({ error: 'No response received from Grok API. Please check your network connection and API endpoint.' });
      }
    }
    
    return res.status(500).json({ error: `API error: ${error.message || String(error)}` });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 VitalMatrix API server running on http://localhost:${PORT}`);
  console.log(`📍 Available endpoints:`);
  console.log(`   GET /api/places/search?lat=40.7128&lng=-74.0060&radius=5000&type=hospital`);
  console.log(`   POST /api/ai-analyze-food - Comprehensive food analysis with allergen detection`);
  console.log(`🧠 AI Model: ${GROK_MODEL}`);
  console.log(`🔑 API Keys configured: ${!!GROK_API_KEY ? '✅' : '❌'}`);
});
