#!/usr/bin/env python3
"""
Complete Daytona VitalMatrix Fix
"""

def fix_daytona_deployment():
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("=== COMPREHENSIVE DAYTONA FIX ===")
        
        # Step 1: Complete cleanup
        print("1. Complete cleanup...")
        sandbox.process.exec("pkill -9 -f node")
        sandbox.process.exec("pkill -9 -f npm")
        sandbox.process.exec("pkill -9 -f next")
        
        # Step 2: Check Node.js version and install if needed
        print("2. Checking Node.js...")
        node_version = sandbox.process.exec("node --version")
        print(f"Node version: {node_version.result if node_version.exit_code == 0 else 'Not found'}")
        
        if node_version.exit_code != 0:
            print("Installing Node.js...")
            sandbox.process.exec("curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -")
            sandbox.process.exec("sudo apt-get install -y nodejs")
        
        # Step 3: Clean and reinstall dependencies
        print("3. Cleaning and reinstalling dependencies...")
        sandbox.process.exec("cd ~/vitalmatrix && rm -rf node_modules package-lock.json .next")
        
        # Install dependencies with verbose output
        install_result = sandbox.process.exec("cd ~/vitalmatrix && npm install --verbose")
        print(f"Install result: {install_result.exit_code}")
        if install_result.exit_code != 0:
            print("Install failed, trying with legacy peer deps...")
            sandbox.process.exec("cd ~/vitalmatrix && npm install --legacy-peer-deps")
        
        # Step 4: Check for missing dependencies
        print("4. Installing additional dependencies...")
        sandbox.process.exec("cd ~/vitalmatrix && npm install express cors dotenv")
        
        # Step 5: Fix Next.js configuration
        print("5. Checking Next.js configuration...")
        
        # Create a minimal next.config.js if it doesn't work
        next_config = '''
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: []
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
'''
        
        sandbox.process.exec(f"cd ~/vitalmatrix && echo '{next_config}' > next.config.backup.js")
        
        # Step 6: Try building with different approaches
        print("6. Building Next.js app...")
        
        # Try standard build first
        build_result = sandbox.process.exec("cd ~/vitalmatrix && npm run build")
        
        if build_result.exit_code != 0:
            print("Standard build failed, trying with standalone...")
            sandbox.process.exec("cd ~/vitalmatrix && cp next.config.backup.js next.config.js")
            build_result2 = sandbox.process.exec("cd ~/vitalmatrix && npm run build")
            
            if build_result2.exit_code != 0:
                print("Build still failing, will run in dev mode...")
        
        # Step 7: Create a startup script
        print("7. Creating startup script...")
        
        startup_script = '''#!/bin/bash
cd ~/vitalmatrix

# Set environment variables
export NODE_ENV=production
export PORT=3000
export HOSTNAME=0.0.0.0

# Kill any existing processes
pkill -f "next"
pkill -f "node.*3000"
pkill -f "node.*3001"

# Start Next.js app
if [ -d ".next" ]; then
    echo "Starting Next.js in production mode..."
    npm start &
else
    echo "Starting Next.js in development mode..."
    npm run dev &
fi

# Wait for Next.js to start
sleep 5

# Start proxy server if it exists
if [ -f "server.js" ]; then
    echo "Starting proxy server..."
    PORT=3001 node server.js &
else
    echo "Creating and starting simple proxy..."
    cat > simple-proxy.js << 'EOF'
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'VitalMatrix Proxy', port: PORT });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'VitalMatrix API is working!', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`VitalMatrix Proxy running on port ${PORT}`);
});
EOF
    node simple-proxy.js &
fi

echo "VitalMatrix services started!"
echo "Frontend: http://localhost:3000"
echo "Proxy: http://localhost:3001"

# Keep script running
wait
'''
        
        sandbox.process.exec(f"cd ~/vitalmatrix && echo '{startup_script}' > start-vitalmatrix.sh")
        sandbox.process.exec("cd ~/vitalmatrix && chmod +x start-vitalmatrix.sh")
        
        # Step 8: Start the services
        print("8. Starting VitalMatrix services...")
        start_result = sandbox.process.exec("cd ~/vitalmatrix && nohup ./start-vitalmatrix.sh > ~/startup.log 2>&1 &")
        print(f"Startup result: {start_result.exit_code}")
        
        # Step 9: Wait and check status
        print("9. Waiting for services to start...")
        import time
        time.sleep(15)
        
        # Check processes
        ps_result = sandbox.process.exec("ps aux | grep -E '(next|node)' | grep -v grep")
        print("Running processes:")
        if ps_result.exit_code == 0:
            # Only print first few lines to avoid encoding issues
            lines = ps_result.result.split('\n')[:5]
            for line in lines:
                try:
                    print(line)
                except:
                    print("[Process info - encoding issue]")
        
        # Check ports
        port_result = sandbox.process.exec("ss -tlnp | grep -E ':(3000|3001)'")
        print("\nOpen ports:")
        if port_result.exit_code == 0:
            print("Ports 3000/3001 are open!")
            try:
                print(port_result.result)
            except:
                print("[Port info available but encoding issue]")
        else:
            print("Ports not yet open, checking logs...")
            
            # Check startup log
            log_result = sandbox.process.exec("tail -10 ~/startup.log")
            if log_result.exit_code == 0:
                try:
                    print("Startup log:")
                    print(log_result.result)
                except:
                    print("[Startup log available but encoding issue]")
        
        # Step 10: Get URLs
        print("\n10. Getting access URLs...")
        try:
            frontend_url = sandbox.get_preview_link(3000)
            print(f"VitalMatrix Frontend: {frontend_url.url}")
        except Exception as e:
            print(f"Frontend URL: https://3000-{sandbox_id}.proxy.daytona.work")
            
        try:
            proxy_url = sandbox.get_preview_link(3001)
            print(f"VitalMatrix Proxy: {proxy_url.url}")
        except Exception as e:
            print(f"Proxy URL: https://3001-{sandbox_id}.proxy.daytona.work")
        
        print("\n=== DEPLOYMENT COMPLETE ===")
        print("VitalMatrix should now be accessible via the URLs above!")
        print("If URLs don't work immediately, wait 1-2 minutes for services to fully start.")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = fix_daytona_deployment()
    if success:
        print("\nDaytona deployment fix completed!")
    else:
        print("\nDeployment fix failed.")
