#!/bin/bash

echo "🚀 Starting VitalMatrix Production Deployment"
echo "=============================================="

# Set production environment
export NODE_ENV=production
export PORT=3000
export PROXY_PORT=3001

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building VitalMatrix..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Start the production servers
echo "🌐 Starting production servers..."
echo "Frontend: http://localhost:3000"
echo "API Proxy: http://localhost:3001"

# Use PM2 for process management if available
if command -v pm2 &> /dev/null; then
    echo "Using PM2 for process management..."
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'vitalmatrix-frontend',
      script: 'npm',
      args: 'run preview',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'vitalmatrix-proxy',
      script: 'npm',
      args: 'run server',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
EOF
    
    # Start with PM2
    pm2 start ecosystem.config.js
    pm2 logs
else
    # Fallback to npm script
    echo "Using npm scripts..."
    npm run dev:full
fi
