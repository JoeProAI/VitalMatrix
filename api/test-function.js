module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Test function called');
    console.log('Method:', req.method);
    console.log('Environment variables check:', {
      hasGrokKey: !!process.env.GROK_API_KEY,
      grokEndpoint: process.env.GROK_API_ENDPOINT,
      grokModel: process.env.GROK_MODEL,
      nodeVersion: process.version
    });

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Test axios import
    let axios;
    try {
      axios = require('axios');
      console.log('Axios imported successfully');
    } catch (axiosError) {
      console.error('Failed to import axios:', axiosError);
      return res.status(500).json({ 
        error: 'Failed to import axios', 
        details: axiosError.message 
      });
    }

    // Test environment variables
    const GROK_API_KEY = process.env.GROK_API_KEY;
    if (!GROK_API_KEY) {
      return res.status(500).json({ 
        error: 'Grok API key not found',
        env: Object.keys(process.env).filter(key => key.includes('GROK'))
      });
    }

    // Return success with debug info
    return res.status(200).json({
      success: true,
      message: 'Test function working',
      imageSize: image.length,
      hasAxios: !!axios,
      hasApiKey: !!GROK_API_KEY,
      nodeVersion: process.version
    });

  } catch (error) {
    console.error('Test function error:', error);
    return res.status(500).json({
      error: 'Test function failed',
      message: error.message,
      stack: error.stack
    });
  }
};
