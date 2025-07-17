// Test script to verify Grok API integration
const axios = require('axios');

async function testGrokAPI() {
  console.log('Testing Grok API integration...');
  
  // Create a larger test image (32x32 pixel PNG as base64) to meet Grok's minimum requirements
  const testImageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAEklEQVR42mP8//8/Ay0BIwCCdgGAIEcAFwAAAABJRU5ErkJggg==';
  
  try {
    const response = await axios.post('http://localhost:3000/api/ai-analyze-food', {
      image: testImageDataUrl
    });
    
    console.log('✅ Grok API test successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Grok API test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      console.error('Error details:', error.response.data.error);
    }
  }
}

// Run the test
testGrokAPI();
