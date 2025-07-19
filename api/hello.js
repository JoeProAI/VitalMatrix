module.exports = (req, res) => {
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
      grokEndpoint: process.env.GROK_API_ENDPOINT
    }
  });
};
