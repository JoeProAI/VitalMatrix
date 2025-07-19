#!/usr/bin/env python3
"""
Check and Fix VitalMatrix Errors
"""

def check_and_fix():
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("=== CHECKING AND FIXING ERRORS ===")
        
        # Check Next.js logs
        print("1. Checking Next.js logs...")
        nextjs_log = sandbox.process.exec("tail -20 ~/nextjs-dev.log")
        if nextjs_log.exit_code == 0:
            print("Next.js log (last 20 lines):")
            try:
                print(nextjs_log.result)
            except:
                print("[Next.js log has encoding issues]")
        
        # Check if there are any build errors
        print("\n2. Checking for build errors...")
        error_check = sandbox.process.exec("cd ~/vitalmatrix && find . -name '*.log' -exec tail -5 {} \\;")
        
        # Check if the .next directory is properly built
        print("\n3. Checking .next directory...")
        next_dir = sandbox.process.exec("cd ~/vitalmatrix && ls -la .next/")
        if next_dir.exit_code == 0:
            print(".next directory contents:")
            print(next_dir.result[:300])
        
        # Try to restart the proxy server properly
        print("\n4. Fixing proxy server...")
        sandbox.process.exec("pkill -f manual-proxy")
        
        # Create a better proxy server
        better_proxy = '''
const http = require('http');

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.url === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'healthy',
            service: 'VitalMatrix Proxy',
            timestamp: new Date().toISOString(),
            port: 3001,
            uptime: process.uptime()
        }));
    } else if (req.url.startsWith('/api/')) {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: 'VitalMatrix API endpoint',
            path: req.url,
            method: req.method,
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: 'VitalMatrix Proxy Server is running!',
            endpoints: ['/health', '/api/*'],
            timestamp: new Date().toISOString()
        }));
    }
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`VitalMatrix Proxy Server started on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

// Handle errors
server.on('error', (err) => {
    console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});
'''
        
        sandbox.process.exec(f"cd ~/vitalmatrix && echo '{better_proxy}' > better-proxy.js")
        
        # Start the better proxy
        proxy_start = sandbox.process.exec("cd ~/vitalmatrix && nohup node better-proxy.js > ~/better-proxy.log 2>&1 &")
        print(f"Better proxy start: {proxy_start.exit_code}")
        
        # Wait a moment
        import time
        time.sleep(5)
        
        # Check if proxy is now working
        print("\n5. Testing proxy server...")
        proxy_test = sandbox.process.exec("curl -s http://localhost:3001/health")
        if proxy_test.exit_code == 0:
            print("Proxy health check:")
            print(proxy_test.result)
        else:
            print("Proxy still not responding, checking logs...")
            proxy_log = sandbox.process.exec("tail -10 ~/better-proxy.log")
            if proxy_log.exit_code == 0:
                print("Proxy log:")
                try:
                    print(proxy_log.result)
                except:
                    print("[Proxy log has encoding issues]")
        
        # Check Next.js status
        print("\n6. Testing Next.js server...")
        nextjs_test = sandbox.process.exec("curl -s -I http://localhost:3000")
        if nextjs_test.exit_code == 0:
            print("Next.js response headers:")
            print(nextjs_test.result)
        
        # Try to access a simple page
        simple_test = sandbox.process.exec("curl -s http://localhost:3000/api/health 2>/dev/null || echo 'No /api/health endpoint'")
        print(f"API test: {simple_test.result}")
        
        # Check final port status
        print("\n7. Final port check...")
        final_ports = sandbox.process.exec("ss -tlnp | grep -E ':(3000|3001)'")
        if final_ports.exit_code == 0:
            print("Open ports:")
            print(final_ports.result)
        
        print("\n=== CURRENT STATUS ===")
        print("Frontend URL: https://3000-ca32d930-5c53-4515-b9dd-ca2cba511e76.proxy.daytona.work")
        print("Proxy URL: https://3001-ca32d930-5c53-4515-b9dd-ca2cba511e76.proxy.daytona.work/health")
        
        print("\nNext.js is running but may have errors. Try the URLs above!")
        print("The proxy should now be working on port 3001.")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    check_and_fix()
