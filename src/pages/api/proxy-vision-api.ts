import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * NOTE: This proxy API route is now deprecated.
 * Direct API access has been implemented in the grokClient.ts service.
 * This file is kept for backward compatibility during transition.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.warn('The proxy-vision-api route is deprecated. Please use the direct Grok API implementation');
  
  return res.status(410).json({ 
    error: 'This API route is deprecated', 
    message: 'The proxy API has been replaced with direct API access in grokClient.ts',
    solution: 'Update your code to use the analyzeImageWithGrok function directly'
  });
}
