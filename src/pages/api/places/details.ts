import { NextApiRequest, NextApiResponse } from 'next';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { placeId } = req.query;

  if (!placeId) {
    return res.status(400).json({ error: 'placeId parameter is required' });
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({ error: 'Google Places API key not configured' });
  }

  try {
    const fields = [
      'place_id',
      'name',
      'formatted_address',
      'geometry',
      'types',
      'rating',
      'user_ratings_total',
      'photos',
      'opening_hours',
      'formatted_phone_number',
      'website'
    ].join(',');

    const url = `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}&` +
      `fields=${fields}&` +
      `key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API status: ${data.status}`);
    }

    // Return the result
    res.status(200).json(data);
  } catch (error) {
    console.error('Error getting place details:', error);
    res.status(500).json({ 
      error: 'Failed to get place details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
