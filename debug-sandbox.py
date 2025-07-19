#!/usr/bin/env python3
"""
Debug VitalMatrix Sandbox
"""

def debug_sandbox():
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("=== SANDBOX DEBUG ===")
        print(f"Sandbox ID: {sandbox.id}")
        print(f"State: {sandbox.state}")
        
        # Check if project exists
        print("\n=== PROJECT CHECK ===")
        ls_result = sandbox.process.exec("ls -la ~/")
        print("Home directory:")
        print(ls_result.result)
        
        vitalmatrix_check = sandbox.process.exec("ls -la ~/vitalmatrix/")
        if vitalmatrix_check.exit_code == 0:
            print("\nVitalMatrix directory:")
            print(vitalmatrix_check.result)
        else:
            print("VitalMatrix directory not found!")
            
        # Check package.json
        package_check = sandbox.process.exec("cat ~/vitalmatrix/package.json")
        if package_check.exit_code == 0:
            print("\nPackage.json found")
        else:
            print("Package.json missing!")
            
        # Check if node_modules exists
        modules_check = sandbox.process.exec("ls ~/vitalmatrix/node_modules/ | head -5")
        if modules_check.exit_code == 0:
            print("Node modules installed")
        else:
            print("Node modules missing!")
            
        # Check running processes
        print("\n=== PROCESS CHECK ===")
        ps_result = sandbox.process.exec("ps aux | grep -v grep")
        print("All processes:")
        print(ps_result.result)
        
        # Check ports
        print("\n=== PORT CHECK ===")
        port_result = sandbox.process.exec("ss -tlnp")
        print("Open ports:")
        print(port_result.result)
        
        # Try to manually start services
        print("\n=== MANUAL START ===")
        
        # Kill any existing processes
        sandbox.process.exec("pkill -f node")
        sandbox.process.exec("pkill -f npm")
        
        # Install dependencies if missing
        print("Installing dependencies...")
        install_result = sandbox.process.exec("cd ~/vitalmatrix && npm install")
        print(f"Install result: {install_result.exit_code}")
        
        # Build the project
        print("Building project...")
        build_result = sandbox.process.exec("cd ~/vitalmatrix && npm run build")
        print(f"Build result: {build_result.exit_code}")
        
        # Start preview server (Vite)
        print("Starting preview server...")
        preview_result = sandbox.process.exec("cd ~/vitalmatrix && nohup npm run preview -- --host 0.0.0.0 --port 3000 > ~/preview.log 2>&1 &")
        print(f"Preview start: {preview_result.exit_code}")
        
        # Start proxy server
        print("Starting proxy server...")
        proxy_result = sandbox.process.exec("cd ~/vitalmatrix && PORT=3001 nohup node server.js > ~/proxy.log 2>&1 &")
        print(f"Proxy start: {proxy_result.exit_code}")
        
        # Wait a moment
        import time
        time.sleep(5)
        
        # Check if services are now running
        print("\n=== FINAL CHECK ===")
        final_ps = sandbox.process.exec("ps aux | grep -E '(node|npm)' | grep -v grep")
        print("Running services:")
        print(final_ps.result)
        
        final_ports = sandbox.process.exec("ss -tlnp | grep -E ':(3000|3001)'")
        print("Open ports:")
        print(final_ports.result)
        
        # Check logs
        print("\n=== LOGS ===")
        preview_log = sandbox.process.exec("tail -10 ~/preview.log")
        if preview_log.exit_code == 0:
            print("Preview log:")
            print(preview_log.result)
            
        proxy_log = sandbox.process.exec("tail -10 ~/proxy.log")
        if proxy_log.exit_code == 0:
            print("Proxy log:")
            print(proxy_log.result)
        
        # Try URLs again
        print("\n=== URLS ===")
        try:
            frontend_url = sandbox.get_preview_link(3000)
            print(f"Frontend URL: {frontend_url.url}")
        except Exception as e:
            print(f"Frontend URL error: {e}")
            
        try:
            proxy_url = sandbox.get_preview_link(3001)
            print(f"Proxy URL: {proxy_url.url}")
        except Exception as e:
            print(f"Proxy URL error: {e}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_sandbox()
