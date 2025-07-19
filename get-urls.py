#!/usr/bin/env python3
"""
Get VitalMatrix Daytona URLs and Status
"""

def get_sandbox_info():
    """Get sandbox information and URLs"""
    
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        
        # Get our specific sandbox
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        
        print(f"Getting info for sandbox: {sandbox_id}")
        
        # Get sandbox by ID
        sandbox = daytona.get(sandbox_id)
        
        print(f"Sandbox State: {sandbox.state}")
        print(f"Sandbox ID: {sandbox.id}")
        
        # Try to get preview link
        try:
            preview_link = sandbox.get_preview_link()
            if preview_link:
                print(f"Preview URL: {preview_link}")
            else:
                print("No preview link available yet")
        except Exception as e:
            print(f"Preview link error: {e}")
        
        # Check if services are running
        print("\nChecking running services...")
        status_result = sandbox.process.exec("ps aux | grep -E '(node|npm)' | grep -v grep")
        
        if status_result.exit_code == 0:
            print("Services status:")
            print(status_result.result)
        else:
            print("No Node.js services found running")
        
        # Check ports
        print("\nChecking open ports...")
        port_result = sandbox.process.exec("netstat -tlnp 2>/dev/null | grep -E ':(3000|3001)' || ss -tlnp | grep -E ':(3000|3001)'")
        
        if port_result.exit_code == 0:
            print("Open ports:")
            print(port_result.result)
        else:
            print("Ports 3000/3001 not found - services may need to be restarted")
            
            # Try to restart services
            print("\nRestarting VitalMatrix services...")
            
            # Kill any existing processes
            sandbox.process.exec("pkill -f 'npm run'")
            
            # Start frontend
            frontend_start = sandbox.process.exec("cd ~/vitalmatrix && nohup npm run preview > ~/frontend.log 2>&1 &")
            print(f"Frontend start: {frontend_start.exit_code}")
            
            # Start proxy
            proxy_start = sandbox.process.exec("cd ~/vitalmatrix && nohup npm run server > ~/proxy.log 2>&1 &")
            print(f"Proxy start: {proxy_start.exit_code}")
            
            # Wait and check again
            import time
            time.sleep(3)
            
            port_check = sandbox.process.exec("netstat -tlnp 2>/dev/null | grep -E ':(3000|3001)' || ss -tlnp | grep -E ':(3000|3001)'")
            if port_check.exit_code == 0:
                print("Services restarted successfully!")
                print(port_check.result)
        
        # Get sandbox details
        print(f"\nSandbox Details:")
        print(f"- CPU: {sandbox.cpu}")
        print(f"- Memory: {sandbox.memory}")
        print(f"- State: {sandbox.state}")
        
        # Try to get public URLs through sandbox properties
        if hasattr(sandbox, 'runner_domain') and sandbox.runner_domain:
            print(f"\nPossible URLs:")
            print(f"- Frontend: https://{sandbox.runner_domain}:3000")
            print(f"- Proxy: https://{sandbox.runner_domain}:3001")
        
        return sandbox
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    get_sandbox_info()
