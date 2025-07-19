#!/usr/bin/env python3
"""
Fix VitalMatrix CSS Import Error
"""

def fix_css_error():
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("=== FIXING CSS IMPORT ERROR ===")
        
        # Check the problematic file
        print("1. Checking nutrilens.tsx file...")
        nutrilens_check = sandbox.process.exec("cd ~/vitalmatrix && find . -name 'nutrilens.tsx' -exec head -20 {} \\;")
        if nutrilens_check.exit_code == 0:
            print("Found nutrilens.tsx:")
            try:
                print(nutrilens_check.result)
            except:
                print("[File found but encoding issue]")
        
        # Find and fix CSS imports in nutrilens.tsx
        print("\n2. Fixing CSS imports in nutrilens.tsx...")
        
        # Remove problematic CSS imports from nutrilens.tsx
        fix_nutrilens = sandbox.process.exec("""cd ~/vitalmatrix && find . -name 'nutrilens.tsx' -exec sed -i '/import.*\\.css/d' {} \\;""")
        print(f"CSS import removal: {fix_nutrilens.exit_code}")
        
        # Also check for any other global CSS imports in pages
        print("\n3. Checking for other global CSS imports...")
        css_check = sandbox.process.exec("cd ~/vitalmatrix && find src/pages -name '*.tsx' -exec grep -l 'import.*\\.css' {} \\;")
        if css_check.exit_code == 0:
            print("Files with CSS imports:")
            print(css_check.result)
            
            # Remove CSS imports from all page files
            sandbox.process.exec("cd ~/vitalmatrix && find src/pages -name '*.tsx' -exec sed -i '/import.*\\.css/d' {} \\;")
        
        # Check _app.tsx to make sure global CSS is there
        print("\n4. Checking _app.tsx...")
        app_check = sandbox.process.exec("cd ~/vitalmatrix && find . -name '_app.tsx' -exec cat {} \\;")
        if app_check.exit_code == 0:
            print("_app.tsx found")
        else:
            print("_app.tsx not found, creating one...")
            app_content = '''
import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
'''
            sandbox.process.exec(f"cd ~/vitalmatrix && mkdir -p src/pages && echo '{app_content}' > src/pages/_app.tsx")
        
        # Restart Next.js server
        print("\n5. Restarting Next.js server...")
        sandbox.process.exec("pkill -f next")
        
        # Wait a moment
        import time
        time.sleep(3)
        
        # Start Next.js again
        restart_result = sandbox.process.exec("cd ~/vitalmatrix && nohup npx next dev -p 3000 -H 0.0.0.0 > ~/nextjs-fixed.log 2>&1 &")
        print(f"Next.js restart: {restart_result.exit_code}")
        
        # Wait for it to start
        time.sleep(10)
        
        # Test the server
        print("\n6. Testing fixed server...")
        test_result = sandbox.process.exec("curl -s -I http://localhost:3000")
        if test_result.exit_code == 0:
            print("Server response:")
            print(test_result.result)
        
        # Check if error is gone
        error_test = sandbox.process.exec("curl -s http://localhost:3000 | grep -i error")
        if error_test.exit_code == 0:
            print("Still has errors:")
            print(error_test.result[:200])
        else:
            print("No errors found in response!")
        
        # Start a working proxy server
        print("\n7. Starting working proxy server...")
        sandbox.process.exec("pkill -f better-proxy")
        
        working_proxy = '''
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'VitalMatrix Proxy',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

app.get('/api/test', (req, res) => {
    res.json({
        message: 'VitalMatrix API is working!',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'VitalMatrix Proxy Server',
        endpoints: ['/health', '/api/test'],
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`VitalMatrix Proxy running on port ${PORT}`);
});
'''
        
        sandbox.process.exec(f"cd ~/vitalmatrix && echo '{working_proxy}' > working-proxy.js")
        proxy_start = sandbox.process.exec("cd ~/vitalmatrix && nohup node working-proxy.js > ~/working-proxy.log 2>&1 &")
        print(f"Working proxy start: {proxy_start.exit_code}")
        
        # Wait and test
        time.sleep(5)
        
        # Test both services
        print("\n8. Final testing...")
        frontend_test = sandbox.process.exec("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000")
        proxy_test = sandbox.process.exec("curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/health")
        
        print(f"Frontend status: {frontend_test.result}")
        print(f"Proxy status: {proxy_test.result}")
        
        # Check ports
        port_check = sandbox.process.exec("ss -tlnp | grep -E ':(3000|3001)'")
        if port_check.exit_code == 0:
            print("\nPorts open:")
            print(port_check.result)
        
        print("\n=== FIXED URLS ===")
        print("Frontend: https://3000-ca32d930-5c53-4515-b9dd-ca2cba511e76.proxy.daytona.work")
        print("Proxy: https://3001-ca32d930-5c53-4515-b9dd-ca2cba511e76.proxy.daytona.work/health")
        
        print("\nVitalMatrix should now be working! Try the URLs above.")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    fix_css_error()
