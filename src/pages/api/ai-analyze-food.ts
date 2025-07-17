import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeImageWithGrok } from '../../services/grokClient';
import { analyzeImageWithModal } from '../../services/modalClient';

interface FoodAnalysisRequest {
  image: string;
}

// Enable the body parser for JSON and increase the payload size
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

/**
 * Advanced AI food image analyzer using Grok and Modal APIs
 * Provides food detection and detailed nutritional analysis
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received image analysis request');
    const { image } = req.body as FoodAnalysisRequest;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    console.log('Image data received, length:', image.length);
    // Check if image is a base64 string
    if (!image.startsWith('data:image')) {
      return res.status(400).json({ error: 'Invalid image format. Image must be a base64 data URL' });
    }

    // Check for required environment variables
    if (!process.env.GROK_API_KEY) {
      console.error('GROK_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'API configuration is incomplete: GROK_API_KEY missing' });
    }
    
    if (!process.env.MODAL_API_KEY) {
      console.error('MODAL_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'API configuration is incomplete: MODAL_API_KEY missing' });
    }

    // Step 1: Analyze image with Grok to identify food items
    console.log('Calling Grok API for vision analysis');
    let grokResponse;
    try {
      grokResponse = await analyzeImageWithGrok(image);
      console.log('Grok analysis complete, identified food items:', grokResponse.foodItems.length);
    } catch (grokError: any) {
      console.error('Grok analysis failed:', grokError);
      return res.status(500).json({ error: `Grok analysis failed: ${grokError.message || String(grokError)}` });
    }

    if (!grokResponse.foodItems || grokResponse.foodItems.length === 0) {
      return res.status(400).json({ error: 'No food items detected in the image' });
    }

    // Step 2: Get nutritional analysis with Modal backend
    console.log('Calling Modal backend for nutritional analysis');
    let nutritionalData;
    try {
      nutritionalData = await analyzeImageWithModal(image, grokResponse);
      console.log('Modal analysis complete');
    } catch (modalError: any) {
      console.error('Modal analysis failed:', modalError);
      // Continue with partial results even if Modal analysis fails
      nutritionalData = {
        nutritionalEstimate: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
        healthInsights: [],
        warnings: ["Nutritional analysis failed: " + (modalError.message || String(modalError))]
      };
      console.log('Continuing with partial results after Modal API failure');
    }

    // Step 3: Return combined results
    const response = {
      success: true,
      foodItems: grokResponse.foodItems,
      description: grokResponse.description,
      nutritionalData,
      detailedAnalysis: grokResponse.detailedAnalysis
    };
    
    console.log('Analysis complete, returning results');
    return res.status(200).json(response);

  } catch (error: any) {
    console.error('Error in AI analysis:', error);
    return res.status(500).json({ error: `API error: ${error.message || String(error)}` });
  }
}
