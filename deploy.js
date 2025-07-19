#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 VitalMatrix Production Deployment Script');
console.log('==========================================');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI found');
} catch (error) {
  console.log('📦 Installing Vercel CLI...');
  execSync('npm install -g vercel', { stdio: 'inherit' });
}

// Build the project
console.log('🔨 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Check environment variables
console.log('🔍 Checking environment variables...');
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_GOOGLE_MAPS_API_KEY',
  'GOOGLE_MAPS_API_KEY'
];

const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = requiredEnvVars.filter(varName => 
    !envContent.includes(varName)
  );
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingVars.join(', '));
  } else {
    console.log('✅ All environment variables present');
  }
} else {
  console.warn('⚠️  No .env file found');
}

// Deploy to Vercel
console.log('🌐 Deploying to Vercel...');
try {
  // First deployment or link to existing project
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('✅ Deployment successful!');
  
  // Get deployment URL
  const deploymentInfo = execSync('vercel ls --limit 1', { encoding: 'utf8' });
  console.log('📋 Deployment Info:');
  console.log(deploymentInfo);
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('💡 Manual deployment steps:');
  console.log('1. Run: vercel');
  console.log('2. Follow the prompts to link/create project');
  console.log('3. Set environment variables in Vercel dashboard');
  console.log('4. Run: vercel --prod');
}

console.log('');
console.log('🎉 Deployment process complete!');
console.log('');
console.log('📝 Next steps:');
console.log('1. Set up custom domain in Vercel dashboard');
console.log('2. Configure environment variables in Vercel');
console.log('3. Test all features in production');
console.log('4. Set up monitoring and analytics');
console.log('');
console.log('🔗 Useful links:');
console.log('- Vercel Dashboard: https://vercel.com/dashboard');
console.log('- Firebase Console: https://console.firebase.google.com');
console.log('- Google Cloud Console: https://console.cloud.google.com');
