// Simple test endpoint to verify AI functionality
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { testImage } = req.body;
    
    console.log('🧪 Test AI endpoint called');
    console.log('Environment check:', {
      hasGrokKey: !!process.env.GROK_API_KEY,
      grokEndpoint: process.env.GROK_API_ENDPOINT,
      grokModel: process.env.GROK_MODEL
    });

    // Create a small test image (1x1 pixel red PNG in base64)
    const testImageData = testImage || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const GROK_API_KEY = process.env.GROK_API_KEY;
    const GROK_API_ENDPOINT = process.env.GROK_API_ENDPOINT || 'https://api.x.ai/v1/chat/completions';
    const GROK_MODEL = process.env.GROK_MODEL || 'grok-2-vision-1212';

    if (!GROK_API_KEY) {
      return res.status(500).json({ 
        error: 'Grok API key not configured',
        success: false 
      });
    }

    console.log('🤖 Testing Grok AI connection...');

    const grokResponse = await fetch(GROK_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "This is a test. Please respond with a simple JSON object: {\"test\": \"success\", \"message\": \"AI is working\"}"
              },
              { 
                type: "image_url", 
                image_url: { 
                  url: testImageData,
                  detail: "low"
                } 
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 100
      })
    });

    if (!grokResponse.ok) {
      const errorText = await grokResponse.text();
      console.error('❌ Grok API error:', errorText);
      return res.status(grokResponse.status).json({
        error: `Grok API error: ${grokResponse.status} ${grokResponse.statusText}`,
        details: errorText,
        success: false
      });
    }

    const grokData = await grokResponse.json();
    const aiContent = grokData?.choices?.[0]?.message?.content || '';
    
    console.log('✅ Grok AI Response:', aiContent);

    return res.status(200).json({
      success: true,
      message: 'AI connection test successful',
      aiResponse: aiContent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test AI error:', error);
    return res.status(500).json({ 
      error: `Test failed: ${error.message}`,
      success: false
    });
  }
};
