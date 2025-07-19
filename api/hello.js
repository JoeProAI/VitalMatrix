module.exports = (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    res.status(200).json({
      message: 'Hello from Vercel!',
      method: req.method,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      env: {
        hasGrokKey: !!process.env.GROK_API_KEY,
        grokEndpoint: process.env.GROK_API_ENDPOINT || 'not set',
        grokModel: process.env.GROK_MODEL || 'not set'
      }
    });
  } catch (error) {
    console.error('Hello function error:', error);
    res.status(500).json({
      error: 'Function crashed',
      message: error.message,
      stack: error.stack
    });
  }
};
