const axios = require('axios');

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

    console.log('Calling Grok API for image analysis...');

    const grokResponse = await axios({
      method: 'post',
      url: GROK_API_ENDPOINT,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      timeout: 30000,
      data: {
        model: GROK_MODEL,
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
      }
    }
  ],
  "totalNutrition": {
    "calories": "Total calories",
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
                  url: image,
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
      }
    } catch (parseError) {
      console.log('Could not parse JSON, extracting food items from text');
      
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
          });
        }
      });
    }

    if (foodItems.length === 0) {
      foodItems.push({
        name: "Unidentified food item",
        confidence: 0.5,
        portion: 'regular',
      });
    }

    const response = {
      success: true,
      foodItems,
      description: aiContent.substring(0, 200) + (aiContent.length > 200 ? '...' : ''),
      nutritionalData,
      detailedAnalysis: aiContent
    };

    console.log('Analysis complete, returning results');
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in AI analysis:', error);
    
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
}
