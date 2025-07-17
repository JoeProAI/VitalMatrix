/**
 * Modal AI Client for NutriLens
 * 
 * This service handles communication with Modal's serverless AI infrastructure
 * to perform advanced food image analysis and nutrition data extraction.
 */

interface ModalAnalysisResponse {
  foodItems: {
    name: string;
    confidence: number;
    portion?: string;
  }[];
  nutritionalEstimate: {
    calories: number;
    protein: string;
    fat: string;
    carbs: string;
    nutrients: {
      name: string;
      amount: number;
      unit: string;
      percentOfDailyNeeds?: number;
    }[];
  };
  healthInsights: string[];
  warnings: string[];
  enhancedBy?: string; // Indicates if analysis was enhanced by another AI system
}

import axios from 'axios';

/**
 * Analyze food image using Modal's advanced vision models
 * @param imageBase64 Base64 encoded image
 * @param grokAnalysis Optional Grok analysis to enhance food recognition
 * @returns Advanced food analysis results
 */
export async function analyzeImageWithModal(
  imageBase64: string,
  grokAnalysis?: any
): Promise<ModalAnalysisResponse> {
  try {
    const MODAL_API_KEY = process.env.MODAL_API_KEY;
    if (!MODAL_API_KEY) {
      throw new Error('MODAL_API_KEY environment variable is not set');
    }
    
    const MODAL_API_ENDPOINT = process.env.MODAL_API_ENDPOINT || 'https://api.modal.com/v1/nutrilens/analyze';
    
    console.log('Sending image to Modal API for nutritional analysis');
    
    // Prepare request payload, including Grok analysis if available
    const requestPayload: any = {
      image: imageBase64,
      detectionMode: 'food',
      includeNutrition: true
    };
    
    // If we have Grok analysis, include it to improve Modal's results
    if (grokAnalysis && grokAnalysis.foodItems && grokAnalysis.foodItems.length > 0) {
      requestPayload.externalAnalysis = {
        provider: 'grok',
        detectedItems: grokAnalysis.foodItems.map((item: any) => ({
          name: item.name,
          confidence: item.confidence
        }))
      };
    }
    
    // Call the Modal API
    const response = await axios.post(
      MODAL_API_ENDPOINT,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MODAL_API_KEY}`,
        },
      }
    );
    
    if (!response.data) {
      throw new Error('Received empty response from Modal API');
    }
    
    // Process the real Modal response
    const modalAnalysis = response.data;
    
    // If we enhanced with Grok, add that to the response
    if (grokAnalysis) {
      modalAnalysis.enhancedBy = 'Grok Vision AI';
    }
    
    console.log('Successfully received Modal nutritional analysis');
    return modalAnalysis;
  } catch (error) {
    console.error('Error in Modal AI analysis:', error);
    throw error;
  }
}

// All simulation code has been removed
