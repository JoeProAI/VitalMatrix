#!/usr/bin/env python3
"""
Manual VitalMatrix Service Start
"""

def manual_start():
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("=== MANUAL SERVICE START ===")
        
        # Kill everything first
        print("Killing all processes...")
        sandbox.process.exec("pkill -9 -f node")
        sandbox.process.exec("pkill -9 -f npm")
        
        # Check what's in the project
        print("Checking project structure...")
        ls_result = sandbox.process.exec("cd ~/vitalmatrix && ls -la")
        print("Project files:")
        print(ls_result.result[:500])  # Limit output
        
        # Check package.json scripts
        scripts_result = sandbox.process.exec("cd ~/vitalmatrix && cat package.json | grep -A 10 scripts")
        print("\nAvailable scripts:")
        print(scripts_result.result)
        
        # Try to start Next.js dev server directly
        print("\nStarting Next.js dev server...")
        dev_start = sandbox.process.exec("cd ~/vitalmatrix && nohup npx next dev -p 3000 -H 0.0.0.0 > ~/nextjs-dev.log 2>&1 &")
        print(f"Dev server start: {dev_start.exit_code}")
        
        # Create and start a simple proxy
        print("Creating simple proxy server...")
        proxy_code = '''
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    if (req.method === 'OPTIONS') {
        res.end();
        return;
    }
    
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/health') {
        res.end(JSON.stringify({
            status: 'ok',
            service: 'VitalMatrix Proxy',
            timestamp: new Date().toISOString(),
            port: 3001
        }));
    } else if (parsedUrl.pathname === '/api/test') {
        res.end(JSON.stringify({
            message: 'VitalMatrix API is working!',
            path: parsedUrl.pathname,
            method: req.method,
            timestamp: new Date().toISOString()
        }));
    } else {
        res.end(JSON.stringify({
            message: 'VitalMatrix Proxy Server',
            availableEndpoints: ['/health', '/api/test'],
            timestamp: new Date().toISOString()
        }));
    }
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`VitalMatrix Proxy running on port ${PORT}`);
});
'''
        
        sandbox.process.exec(f"cd ~/vitalmatrix && echo '{proxy_code}' > manual-proxy.js")
        
        # Start the proxy
        proxy_start = sandbox.process.exec("cd ~/vitalmatrix && nohup node manual-proxy.js > ~/proxy-manual.log 2>&1 &")
        print(f"Proxy start: {proxy_start.exit_code}")
        
        # Wait for services
        print("Waiting for services...")
        import time
        time.sleep(10)
        
        # Check what's running
        print("\nChecking running services...")
        ps_check = sandbox.process.exec("ps aux | grep -E '(next|node)' | grep -v grep | head -5")
        if ps_check.exit_code == 0:
            print("Running processes found!")
            print(ps_check.result[:300])
        
        # Check ports
        port_check = sandbox.process.exec("ss -tlnp | grep -E ':(3000|3001)'")
        if port_check.exit_code == 0:
            print("\nPorts are open!")
            print(port_check.result)
        else:
            print("\nPorts not open yet...")
            
            # Check logs
            dev_log = sandbox.process.exec("tail -5 ~/nextjs-dev.log")
            if dev_log.exit_code == 0:
                print("Next.js dev log:")
                try:
                    print(dev_log.result)
                except:
                    print("[Log available but encoding issue]")
            
            proxy_log = sandbox.process.exec("tail -5 ~/proxy-manual.log")
            if proxy_log.exit_code == 0:
                print("Proxy log:")
                try:
                    print(proxy_log.result)
                except:
                    print("[Log available but encoding issue]")
        
        # Test the services with curl
        print("\nTesting services...")
        test_frontend = sandbox.process.exec("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000")
        print(f"Frontend test (port 3000): {test_frontend.result}")
        
        test_proxy = sandbox.process.exec("curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/health")
        print(f"Proxy test (port 3001): {test_proxy.result}")
        
        # Final URLs
        print("\n=== ACCESS URLS ===")
        print(f"Frontend: https://3000-{sandbox_id}.proxy.daytona.work")
        print(f"Proxy: https://3001-{sandbox_id}.proxy.daytona.work")
        print(f"Proxy Health: https://3001-{sandbox_id}.proxy.daytona.work/health")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    manual_start()
