const axios = require('axios');

// Add more detailed error logging
const logError = (message, error) => {
  console.error(`[ERROR] ${message}:`, error);
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
  }
  if (error.request) {
    console.error('Request error:', error.request);
  }
  console.error('Error message:', error.message);
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received image analysis request');
    console.log('Environment check:', {
      hasGrokKey: !!process.env.GROK_API_KEY,
      grokEndpoint: process.env.GROK_API_ENDPOINT,
      grokModel: process.env.GROK_MODEL
    });
    
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Check image size (base64 encoded images are ~33% larger than original)
    const imageSizeBytes = (image.length * 3) / 4;
    const maxSizeMB = 5;
    if (imageSizeBytes > maxSizeMB * 1024 * 1024) {
      return res.status(413).json({ 
        error: `Image too large. Maximum size is ${maxSizeMB}MB. Please compress the image and try again.`,
        success: false
      });
    }

    const GROK_API_KEY = process.env.GROK_API_KEY;
    const GROK_API_ENDPOINT = process.env.GROK_API_ENDPOINT || 'https://api.x.ai/v1/chat/completions';
    const GROK_MODEL = process.env.GROK_MODEL || 'grok-2-vision-1212';

    if (!GROK_API_KEY) {
      return res.status(500).json({ error: 'Grok API key not configured' });
    }

    console.log('Calling Grok AI for image analysis...');

    // Convert data URL to proper base64 format for Grok AI
    let imageData = image;
    if (image.startsWith('data:image/')) {
      // Extract base64 data from data URL
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      imageData = `data:${mimeType};base64,${base64Data}`;
    }

    const grokResponse = await axios({
      method: 'post',
      url: GROK_API_ENDPOINT,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      data: {
        model: GROK_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Analyze this food image and provide detailed nutritional information. Return ONLY a JSON object with this exact structure:

{
  "foods": [
    {
      "name": "Specific food name",
      "portion": "serving description",
      "allergens": ["allergen1", "allergen2"]
    }
  ],
  "totalNutrition": {
    "calories": "Total calories as number",
    "protein": "Total protein in grams",
    "carbs": "Total carbs in grams", 
    "fat": "Total fat in grams"
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
                  url: imageData,
                  detail: "high"
                } 
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      }
    });

    const aiContent = grokResponse.data?.choices?.[0]?.message?.content || '';
    console.log('Grok AI Response:', aiContent.substring(0, 200) + '...');

    // Parse the response
    let foodItems = [];
    let nutritionalData = {
      nutritionalEstimate: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
      healthInsights: [],
      warnings: []
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
          portion: food.portion || 'regular'
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
      }
    } catch (parseError) {
      console.log('Could not parse JSON, extracting food items from text');
      
      // Fallback: extract food items from text
      const lines = aiContent.split('\n');
      let inFoodSection = false;
      const foodMatches = [];
      
      for (const line of lines) {
        if (line.toLowerCase().includes('food') || line.toLowerCase().includes('item')) {
          inFoodSection = true;
        }
        
        if (inFoodSection && line.trim()) {
          // Try to extract food names from various formats
          const foodMatch = line.match(/(?:name|food|item):\s*"?([^"]+)"?/i) || 
                           line.match(/^\s*-\s*([^,\n]+)/i) ||
                           line.match(/^\s*\d+\.\s*([^,\n]+)/i);
          
          if (foodMatch) {
            const foodName = foodMatch[1].trim();
            if (foodName && !foodName.toLowerCase().includes('json') && foodName.length > 2) {
              foodMatches.push(foodName);
            }
          }
        }
      }
      
      if (foodMatches.length > 0) {
        foodItems = foodMatches.slice(0, 3).map((name, index) => ({
          name: name,
          confidence: 0.8 - (index * 0.1),
          portion: 'regular'
        }));
      } else {
        // Last resort: generic food item
        foodItems = [{
          name: 'Food item',
          confidence: 0.7,
          portion: 'regular'
        }];
      }
      
      // Extract basic nutrition if available
      const calorieMatch = aiContent.match(/calories?:\s*(\d+)/i);
      if (calorieMatch) {
        nutritionalData.nutritionalEstimate.calories = parseInt(calorieMatch[1]);
      }
    }

    // Extract allergens from all food items
    const allAllergens = new Set();
    
    // Try to extract allergens from the AI response
    const allergenKeywords = ['wheat', 'gluten', 'dairy', 'milk', 'eggs', 'nuts', 'peanuts', 'soy', 'fish', 'shellfish', 'sesame'];
    const responseText = aiContent.toLowerCase();
    
    allergenKeywords.forEach(allergen => {
      if (responseText.includes(allergen)) {
        allAllergens.add(allergen);
      }
    });

    // Create response
    const response = {
      success: true,
      foodItems: foodItems,
      allergens: Array.from(allAllergens),
      nutritionalData: nutritionalData,
      timestamp: new Date().toISOString()
    };

    console.log('Analysis complete, returning results');
    return res.status(200).json(response);

  } catch (error) {
    logError('AI analysis failed', error);
    
    // Check if it's an environment variable issue
    if (!process.env.GROK_API_KEY) {
      return res.status(500).json({ error: 'Grok API key not found in environment variables' });
    }
    
    if (axios.isAxiosError && axios.isAxiosError(error)) {
      const axiosError = error;
      if (axiosError.response) {
        logError('Grok API response error', axiosError);
        return res.status(500).json({ 
          error: `Grok API error (${axiosError.response.status}): ${JSON.stringify(axiosError.response.data)}`,
          details: axiosError.response.data
        });
      } else if (axiosError.request) {
        logError('Grok API request error', axiosError);
        return res.status(500).json({ error: 'No response received from Grok API. Please check your network connection and API endpoint.' });
      }
    }
    
    return res.status(500).json({ 
      error: `API error: ${error.message || String(error)}`,
      stack: error.stack
    });
  }
};
