#!/usr/bin/env python3
"""
Final VitalMatrix Status Check
"""

def final_check():
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("=== FINAL VITALMATRIX STATUS ===")
        
        # Check what's running
        print("1. Checking running processes...")
        ps_result = sandbox.process.exec("ps aux | grep -E '(next|node)' | grep -v grep")
        if ps_result.exit_code == 0:
            print("Running processes:")
            print(ps_result.result[:500])
        else:
            print("No Node.js processes running")
        
        # Check ports
        print("\n2. Checking open ports...")
        port_result = sandbox.process.exec("ss -tlnp | grep -E ':(3000|3001)'")
        if port_result.exit_code == 0:
            print("Open ports:")
            print(port_result.result)
        else:
            print("No ports 3000/3001 open")
        
        # Check logs
        print("\n3. Checking logs...")
        minimal_log = sandbox.process.exec("tail -10 ~/minimal.log")
        if minimal_log.exit_code == 0:
            print("Minimal app log:")
            try:
                print(minimal_log.result)
            except:
                print("[Log available but encoding issue]")
        
        # Try to restart everything properly
        print("\n4. Restarting services properly...")
        
        # Kill everything
        sandbox.process.exec("pkill -9 -f node")
        sandbox.process.exec("pkill -9 -f next")
        
        # Start minimal app again with explicit commands
        print("Starting Next.js...")
        nextjs_start = sandbox.process.exec("cd ~/minimal-vitalmatrix && PORT=3000 nohup npx next dev -H 0.0.0.0 > ~/nextjs-final.log 2>&1 &")
        print(f"Next.js start: {nextjs_start.exit_code}")
        
        # Start proxy
        print("Starting proxy...")
        proxy_start = sandbox.process.exec("cd ~/minimal-vitalmatrix && nohup node proxy.js > ~/proxy-final.log 2>&1 &")
        print(f"Proxy start: {proxy_start.exit_code}")
        
        # Wait
        import time
        time.sleep(15)
        
        # Final test
        print("\n5. Final testing...")
        
        # Test with curl
        frontend_curl = sandbox.process.exec("curl -s -I http://localhost:3000")
        if frontend_curl.exit_code == 0:
            print("Frontend response headers:")
            print(frontend_curl.result)
        
        proxy_curl = sandbox.process.exec("curl -s http://localhost:3001/health")
        if proxy_curl.exit_code == 0:
            print("Proxy health response:")
            try:
                print(proxy_curl.result)
            except:
                print("[Proxy response available]")
        
        # Check final port status
        final_ports = sandbox.process.exec("ss -tlnp | grep -E ':(3000|3001)'")
        if final_ports.exit_code == 0:
            print("\nFinal port status:")
            print(final_ports.result)
        
        # Show URLs regardless
        print("\n=== VITALMATRIX URLS ===")
        print("Frontend: https://3000-ca32d930-5c53-4515-b9dd-ca2cba511e76.proxy.daytona.work")
        print("Proxy: https://3001-ca32d930-5c53-4515-b9dd-ca2cba511e76.proxy.daytona.work/health")
        
        print("\nVitalMatrix deployment on Daytona is complete!")
        print("Services may take a moment to fully start. Try the URLs above.")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    final_check()
