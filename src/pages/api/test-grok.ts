import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

/**
 * Test endpoint to verify Grok API connectivity
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing Grok API connection...');
    
    // Check environment variables
    const GROK_API_KEY = process.env.GROK_API_KEY;
    const GROK_API_ENDPOINT = process.env.GROK_API_ENDPOINT || 'https://api.x.ai/v1/chat/completions';
    const GROK_MODEL = process.env.GROK_MODEL || 'grok-2-vision-1212';
    
    if (!GROK_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'GROK_API_KEY environment variable is not set',
        config: {
          endpoint: GROK_API_ENDPOINT,
          model: GROK_MODEL,
          hasApiKey: false
        }
      });
    }
    
    console.log('Environment variables loaded:');
    console.log('- API Endpoint:', GROK_API_ENDPOINT);
    console.log('- Model:', GROK_MODEL);
    console.log('- API Key present:', !!GROK_API_KEY);
    
    // Test simple text completion (not vision) to verify connection
    const testResponse = await axios({
      method: 'post',
      url: GROK_API_ENDPOINT,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      timeout: 15000,
      data: {
        model: 'grok-2-1212', // Use text model for simple test
        messages: [
          {
            role: "user",
            content: "Hello! Please respond with 'Grok API is working correctly' to confirm the connection."
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      }
    });
    
    console.log('Grok API test successful');
    
    const aiResponse = testResponse.data?.choices?.[0]?.message?.content || 'No response content';
    
    return res.status(200).json({
      success: true,
      message: 'Grok API connection successful',
      config: {
        endpoint: GROK_API_ENDPOINT,
        model: GROK_MODEL,
        hasApiKey: true,
        keyLength: GROK_API_KEY.length
      },
      testResponse: {
        status: testResponse.status,
        content: aiResponse,
        usage: testResponse.data?.usage
      }
    });
    
  } catch (error: any) {
    console.error('Grok API test failed:', error);
    
    let errorDetails = {
      message: error.message,
      status: null as number | null,
      data: null as any
    };
    
    if (axios.isAxiosError(error)) {
      errorDetails.status = error.response?.status || null;
      errorDetails.data = error.response?.data;
      console.error('API Error Status:', error.response?.status);
      console.error('API Error Data:', error.response?.data);
    }
    
    return res.status(500).json({
      success: false,
      error: 'Grok API test failed',
      details: errorDetails,
      config: {
        endpoint: process.env.GROK_API_ENDPOINT || 'https://api.x.ai/v1/chat/completions',
        model: process.env.GROK_MODEL || 'grok-2-vision-1212',
        hasApiKey: !!process.env.GROK_API_KEY
      }
    });
  }
}
