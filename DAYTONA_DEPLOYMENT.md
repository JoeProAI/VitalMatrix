# VitalMatrix Daytona Deployment Guide

## Quick Deployment Steps

### 1. Access Daytona Dashboard
- Go to: https://app.daytona.io/dashboard
- Login with your account

### 2. Create New Workspace
- Click "Create Workspace"
- Repository URL: `https://github.com/JoeProAI/VitalMatrix.git`
- Branch: `main`
- Workspace Name: `vitalmatrix-production`

### 3. Configure Resources
```yaml
CPU: 4 cores
Memory: 8 GB
Storage: 20 GB
```

### 4. Environment Variables
Set these in the Daytona workspace environment:

```bash
NODE_ENV=production
PORT=3000
PROXY_PORT=3001
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 5. Deployment Commands
Once the workspace is created, run these commands in the terminal:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the production server
npm run dev:full
```

### 6. Access Your App
- Frontend: Port 3000
- API Proxy: Port 3001
- The workspace will provide public URLs for both ports

## Alternative: Using Dockerfile

If you prefer container deployment, use the included `Dockerfile`:

```bash
# Build the Docker image
docker build -t vitalmatrix .

# Run the container
docker run -p 3000:3000 -p 3001:3001 vitalmatrix
```

## Production Checklist

✅ **Environment Variables Set**
- All Firebase config variables
- Google Maps API keys
- Production environment flags

✅ **Build Successful**
- `npm run build` completes without errors
- Static files generated in `dist/` directory

✅ **Services Running**
- Frontend server on port 3000
- API proxy server on port 3001
- Both accessible via public URLs

✅ **Features Working**
- User authentication (Firebase)
- Community Pulse (Google Places API)
- NutriLens scanner
- User dashboard and profiles

## Monitoring

Monitor your deployment:
- Check Daytona workspace logs
- Monitor resource usage (CPU, Memory)
- Test all API endpoints
- Verify Firebase connections

## Scaling

For production scaling:
- Increase CPU/Memory as needed
- Enable auto-scaling if available
- Set up monitoring and alerts
- Configure backup strategies

## Support

If you encounter issues:
1. Check Daytona workspace logs
2. Verify environment variables
3. Test API connections
4. Contact Daytona support if needed

Your API Key: `dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a`
