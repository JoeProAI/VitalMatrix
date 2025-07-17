import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    // Get barcode from the URL
    const { barcode } = req.query;
    if (!barcode || Array.isArray(barcode)) {
      return res.status(400).json({ error: 'Invalid barcode parameter' });
    }

    // Call Spoonacular API
    console.log(`Looking up product with barcode: ${barcode}`);
    const response = await fetch(`https://api.spoonacular.com/food/products/upc/${barcode}?apiKey=${apiKey}`);

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Product not found for this barcode' });
      } else if (response.status === 402) {
        return res.status(402).json({ error: 'API quota exceeded. Please check your Spoonacular API subscription.' });
      } else if (response.status === 401) {
        return res.status(401).json({ error: 'Invalid API key. Please check your Spoonacular API credentials.' });
      } else {
        return res.status(response.status).json({ error: `Spoonacular API error: ${response.status}` });
      }
    }

    // Get the response data
    const data = await response.json();

    // Return the data
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error looking up product by barcode:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
