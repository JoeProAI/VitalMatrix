import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Enable the body parser for JSON and increase the payload size
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Spoonacular API key is not configured. Please set NEXT_PUBLIC_SPOONACULAR_API_KEY in your environment.' 
      });
    }

    // Get the base64 encoded image from the request body
    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Convert base64 to binary
    const imageBuffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    // Create form data for Spoonacular API using node-fetch compatible FormData
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });

    // Call Spoonacular API
    console.log(`Calling Spoonacular API: https://api.spoonacular.com/food/images/analyze?apiKey=${apiKey}`);
    const response = await fetch(`https://api.spoonacular.com/food/images/analyze?apiKey=${apiKey}`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      console.error(`Spoonacular API error: ${response.status}`);
      
      if (response.status === 402) {
        return res.status(402).json({ error: 'API quota exceeded. Please check your Spoonacular API subscription.' });
      } else if (response.status === 401 || response.status === 403) {
        return res.status(response.status).json({ error: 'Invalid API key or unauthorized access. Please check your Spoonacular API credentials.' });
      } else {
        // Try to get more detailed error information
        let errorText = '';
        try {
          const errorData = await response.text();
          errorText = errorData;
          console.error('Error response from Spoonacular:', errorData);
        } catch (e) {
          console.error('Could not read error response body');
        }
        
        return res.status(response.status).json({ 
          error: `Spoonacular API error: ${response.status}`,
          details: errorText
        });
      }
    }

    // Get the response data
    const data = await response.json();

    // Return the data
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error analyzing food image:', error);
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}
