#!/usr/bin/env python3
"""
VitalMatrix Daytona Deployment Script
Deploys VitalMatrix to Daytona cloud infrastructure for production use
"""

import os
import time
from daytona_sdk import Daytona
from daytona_api_client.models import CreateSandboxRequest, SandboxResources

def deploy_vitalmatrix_to_daytona():
    """Deploy VitalMatrix to Daytona cloud infrastructure"""
    
    print("🚀 VitalMatrix Daytona Cloud Deployment")
    print("=" * 50)
    
    # Initialize Daytona client
    # Get your API key from: https://app.daytona.io/dashboard/keys
    api_key = os.getenv('DAYTONA_API_KEY')
    if not api_key:
        print("❌ Error: DAYTONA_API_KEY environment variable not set")
        print("Get your API key from: https://app.daytona.io/dashboard/keys")
        return None
    
    config = DaytonaConfig(
        api_key=api_key,
        target="us"  # Use US region for optimal performance
    )
    
    daytona = Daytona(config)
    
    # Create production-ready image with all VitalMatrix dependencies
    print("🔨 Building VitalMatrix production image...")
    
    vitalmatrix_image = (
        Image.debian_slim("3.12")
        # Install Node.js and npm for frontend
        .run_commands(
            "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -",
            "apt-get install -y nodejs",
            "apt-get install -y git curl wget build-essential",
            "npm install -g pm2 concurrently"
        )
        # Install Python dependencies for backend services
        .pip_install([
            "flask",
            "flask-cors", 
            "requests",
            "python-dotenv",
            "firebase-admin",
            "google-cloud-firestore",
            "gunicorn"
        ])
        # Set up working directory
        .workdir("/home/daytona/vitalmatrix")
        # Environment variables for production
        .env({
            "NODE_ENV": "production",
            "PYTHONPATH": "/home/daytona/vitalmatrix",
            "PORT": "3000",
            "PROXY_PORT": "3001"
        })
        # Create necessary directories
        .run_commands(
            "mkdir -p /home/daytona/vitalmatrix/logs",
            "mkdir -p /home/daytona/vitalmatrix/uploads",
            "chown -R daytona:daytona /home/daytona/vitalmatrix"
        )
    )
    
    # Create production sandbox with enhanced resources
    print("🌐 Creating production sandbox...")
    
    sandbox = daytona.create(
        CreateSandboxFromImageParams(
            image=vitalmatrix_image,
            resources=Resources(
                cpu=4,      # 4 CPU cores for production workload
                memory=8,   # 8GB RAM for optimal performance
                disk=20,    # 20GB disk for application data
            ),
            auto_stop_interval=0,  # Keep running indefinitely
            auto_archive_interval=0,  # Disable auto-archive
            labels={
                "app": "vitalmatrix",
                "environment": "production",
                "version": "1.0.0",
                "deployment": "daytona-cloud"
            }
        ),
        timeout=0,
        on_snapshot_create_logs=print
    )
    
    print(f"✅ Sandbox created: {sandbox.id}")
    
    # Upload VitalMatrix source code
    print("📁 Uploading VitalMatrix source code...")
    
    # Upload package.json and install dependencies
    package_json = '''
{
  "name": "vitalmatrix",
  "version": "1.0.0",
  "description": "The future of healthcare and nutrition",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server": "node server.js",
    "start": "concurrently \\"npm run server\\" \\"npm run build && npm run preview\\"",
    "production": "npm run build && pm2 start ecosystem.config.js"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "firebase": "^10.7.1",
    "lucide-react": "^0.263.1",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
'''
    
    sandbox.fs.upload_file(package_json.encode(), "package.json")
    
    # Upload PM2 ecosystem config for production process management
    pm2_config = '''
module.exports = {
  apps: [
    {
      name: 'vitalmatrix-frontend',
      script: 'npm',
      args: 'run preview',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'vitalmatrix-proxy',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
}
'''
    
    sandbox.fs.upload_file(pm2_config.encode(), "ecosystem.config.js")
    
    # Upload production environment template
    env_template = '''
# VitalMatrix Production Environment Variables
# Copy this file to .env and fill in your actual values

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Google APIs
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Production Settings
NODE_ENV=production
PORT=3000
PROXY_PORT=3001

# Optional: Third-party services
OPENAI_API_KEY=your_openai_key_here
SPOONACULAR_API_KEY=your_spoonacular_key_here
'''
    
    sandbox.fs.upload_file(env_template.encode(), ".env.template")
    
    # Upload deployment script
    deploy_script = '''#!/bin/bash
set -e

echo "🚀 VitalMatrix Production Deployment"
echo "=================================="

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Start production services with PM2
echo "🌐 Starting production services..."
pm2 start ecosystem.config.js

# Show status
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
pm2 status

echo ""
echo "🌐 Application URLs:"
echo "Frontend: https://3000-$(hostname).daytona.work"
echo "API Proxy: https://3001-$(hostname).daytona.work"
echo ""
echo "📝 Logs:"
echo "pm2 logs vitalmatrix-frontend"
echo "pm2 logs vitalmatrix-proxy"
'''
    
    sandbox.fs.upload_file(deploy_script.encode(), "deploy.sh")
    sandbox.fs.set_file_permissions("deploy.sh", "755")
    
    # Install dependencies and build
    print("📦 Installing dependencies...")
    
    response = sandbox.process.exec("npm install", timeout=300)
    if response.exit_code != 0:
        print(f"❌ npm install failed: {response.result}")
        return None
    
    print("✅ Dependencies installed successfully")
    
    # Get preview URLs
    frontend_preview = sandbox.get_preview_link(3000)
    api_preview = sandbox.get_preview_link(3001)
    
    print("\n🎉 VitalMatrix Successfully Deployed to Daytona!")
    print("=" * 60)
    print(f"📱 Sandbox ID: {sandbox.id}")
    print(f"🌐 Frontend URL: {frontend_preview.url}")
    print(f"🔧 API Proxy URL: {api_preview.url}")
    print(f"🔑 Auth Token: {frontend_preview.token}")
    print("\n📋 Next Steps:")
    print("1. Copy .env.template to .env and add your API keys")
    print("2. Run: ./deploy.sh")
    print("3. Access your app at the Frontend URL")
    print("\n💡 Management Commands:")
    print("- View logs: pm2 logs")
    print("- Restart: pm2 restart all")
    print("- Stop: pm2 stop all")
    print("- Status: pm2 status")
    
    return {
        "sandbox_id": sandbox.id,
        "frontend_url": frontend_preview.url,
        "api_url": api_preview.url,
        "auth_token": frontend_preview.token,
        "sandbox": sandbox
    }

def setup_production_environment(sandbox, env_vars):
    """Set up production environment variables"""
    
    print("🔧 Setting up production environment...")
    
    env_content = ""
    for key, value in env_vars.items():
        env_content += f"{key}={value}\n"
    
    sandbox.fs.upload_file(env_content.encode(), ".env")
    print("✅ Environment variables configured")

def deploy_with_source_code(source_path=None):
    """Deploy VitalMatrix with local source code"""
    
    deployment = deploy_vitalmatrix_to_daytona()
    if not deployment:
        return None
    
    sandbox = deployment["sandbox"]
    
    # If source path provided, upload the actual source code
    if source_path and os.path.exists(source_path):
        print(f"📁 Uploading source code from {source_path}...")
        
        # Upload key files
        key_files = [
            "src/",
            "public/",
            "index.html",
            "vite.config.ts",
            "tailwind.config.js",
            "postcss.config.js",
            "tsconfig.json",
            "server.js",
            "firestore.rules"
        ]
        
        for file_path in key_files:
            full_path = os.path.join(source_path, file_path)
            if os.path.exists(full_path):
                if os.path.isfile(full_path):
                    with open(full_path, 'rb') as f:
                        content = f.read()
                    sandbox.fs.upload_file(content, file_path)
                    print(f"✅ Uploaded {file_path}")
    
    return deployment

if __name__ == "__main__":
    # Example usage
    print("VitalMatrix Daytona Deployment")
    print("Set DAYTONA_API_KEY environment variable and run this script")
    
    # Uncomment to deploy:
    # deployment = deploy_vitalmatrix_to_daytona()
    
    # Or deploy with local source:
    # deployment = deploy_with_source_code("./")
