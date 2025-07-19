#!/usr/bin/env python3
"""
Fix VitalMatrix Deployment
"""

def fix_deployment():
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("=== FIXING VITALMATRIX ===")
        
        # Kill all existing processes
        print("Cleaning up processes...")
        sandbox.process.exec("pkill -f node")
        sandbox.process.exec("pkill -f npm")
        
        # Check available scripts
        print("Checking available scripts...")
        scripts_result = sandbox.process.exec("cd ~/vitalmatrix && npm run")
        print("Available scripts:")
        print(scripts_result.result)
        
        # Check if it's a Next.js or Vite project
        package_check = sandbox.process.exec("cd ~/vitalmatrix && grep -E '(next|vite)' package.json")
        print("Package type:")
        print(package_check.result)
        
        # Install missing dependencies for server
        print("Installing server dependencies...")
        server_deps = sandbox.process.exec("cd ~/vitalmatrix && npm install express cors dotenv")
        print(f"Server deps install: {server_deps.exit_code}")
        
        # Try to build the project properly
        print("Building project...")
        build_result = sandbox.process.exec("cd ~/vitalmatrix && npm run build")
        if build_result.exit_code != 0:
            print("Build failed, trying dev build...")
            dev_build = sandbox.process.exec("cd ~/vitalmatrix && npm run dev -- --build")
            print(f"Dev build: {dev_build.exit_code}")
        
        # Start Next.js in production mode
        print("Starting Next.js app...")
        nextjs_start = sandbox.process.exec("cd ~/vitalmatrix && PORT=3000 nohup npm start > ~/nextjs.log 2>&1 &")
        print(f"Next.js start: {nextjs_start.exit_code}")
        
        # If npm start doesn't work, try dev mode
        if nextjs_start.exit_code != 0:
            print("Trying dev mode...")
            dev_start = sandbox.process.exec("cd ~/vitalmatrix && PORT=3000 nohup npm run dev > ~/nextjs.log 2>&1 &")
            print(f"Dev start: {dev_start.exit_code}")
        
        # Start the proxy server (if server.js exists)
        print("Starting proxy server...")
        proxy_start = sandbox.process.exec("cd ~/vitalmatrix && PORT=3001 nohup node server.js > ~/proxy.log 2>&1 &")
        if proxy_start.exit_code != 0:
            print("Server.js failed, creating simple proxy...")
            # Create a simple proxy server
            simple_proxy = '''
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'VitalMatrix Proxy' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy server running on port ${PORT}`);
});
'''
            # Write simple proxy
            sandbox.process.exec(f"cd ~/vitalmatrix && echo '{simple_proxy}' > simple-proxy.js")
            sandbox.process.exec("cd ~/vitalmatrix && PORT=3001 nohup node simple-proxy.js > ~/proxy.log 2>&1 &")
        
        # Wait for services to start
        import time
        time.sleep(10)
        
        # Check final status
        print("\n=== FINAL STATUS ===")
        ps_result = sandbox.process.exec("ps aux | grep -E '(node|npm)' | grep -v grep")
        print("Running processes:")
        print(ps_result.result)
        
        port_result = sandbox.process.exec("ss -tlnp | grep -E ':(3000|3001)'")
        print("Open ports:")
        print(port_result.result)
        
        # Check logs
        print("\n=== LOGS ===")
        nextjs_log = sandbox.process.exec("tail -5 ~/nextjs.log")
        if nextjs_log.exit_code == 0:
            print("Next.js log:")
            print(nextjs_log.result)
            
        proxy_log = sandbox.process.exec("tail -5 ~/proxy.log")
        if proxy_log.exit_code == 0:
            print("Proxy log:")
            print(proxy_log.result)
        
        # Get working URLs
        print("\n=== WORKING URLS ===")
        try:
            frontend_url = sandbox.get_preview_link(3000)
            print(f"VitalMatrix App: {frontend_url.url}")
        except Exception as e:
            print(f"Frontend URL error: {e}")
            
        try:
            proxy_url = sandbox.get_preview_link(3001)
            print(f"Proxy API: {proxy_url.url}")
        except Exception as e:
            print(f"Proxy URL error: {e}")
        
        print("\nVitalMatrix should now be accessible!")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fix_deployment()
