#!/usr/bin/env python3
"""
Get VitalMatrix Preview URLs
"""

def get_preview_urls():
    """Get the actual preview URLs for VitalMatrix"""
    
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("🚀 VitalMatrix Daytona URLs")
        print("=" * 40)
        
        # Get preview URLs for both ports
        try:
            frontend_url = sandbox.get_preview_link(3000)
            print(f"✅ Frontend URL: {frontend_url}")
        except Exception as e:
            print(f"Frontend URL error: {e}")
            
        try:
            proxy_url = sandbox.get_preview_link(3001)
            print(f"✅ Proxy URL: {proxy_url}")
        except Exception as e:
            print(f"Proxy URL error: {e}")
        
        # Alternative URLs based on runner domain
        if hasattr(sandbox, 'runner_domain') and sandbox.runner_domain:
            print(f"\n🌐 Direct URLs:")
            print(f"Frontend: https://{sandbox.runner_domain}:3000")
            print(f"Proxy: https://{sandbox.runner_domain}:3001")
        
        # Check service status
        print(f"\n📊 Service Status:")
        port_check = sandbox.process.exec("ss -tlnp | grep -E ':(3000|3001)' || netstat -tlnp | grep -E ':(3000|3001)'")
        
        if port_check.exit_code == 0:
            print("✅ Services are running:")
            print(port_check.result)
        else:
            print("⚠️ Services not detected on ports 3000/3001")
            
            # Try to start services again
            print("🔄 Starting services...")
            
            # Start with explicit port binding
            frontend_cmd = "cd ~/vitalmatrix && npm run preview -- --host 0.0.0.0 --port 3000 > ~/frontend.log 2>&1 &"
            proxy_cmd = "cd ~/vitalmatrix && PORT=3001 npm run server > ~/proxy.log 2>&1 &"
            
            frontend_result = sandbox.process.exec(frontend_cmd)
            proxy_result = sandbox.process.exec(proxy_cmd)
            
            print(f"Frontend start: {frontend_result.exit_code}")
            print(f"Proxy start: {proxy_result.exit_code}")
            
            # Wait and check again
            import time
            time.sleep(5)
            
            final_check = sandbox.process.exec("ss -tlnp | grep -E ':(3000|3001)'")
            if final_check.exit_code == 0:
                print("✅ Services started successfully!")
                print(final_check.result)
                
                # Try preview URLs again
                try:
                    frontend_url = sandbox.get_preview_link(3000)
                    print(f"\n🎉 VitalMatrix Frontend: {frontend_url}")
                except:
                    print(f"\n🎉 VitalMatrix Frontend: https://{sandbox.runner_domain}:3000")
                    
                try:
                    proxy_url = sandbox.get_preview_link(3001)
                    print(f"🎉 VitalMatrix Proxy: {proxy_url}")
                except:
                    print(f"🎉 VitalMatrix Proxy: https://{sandbox.runner_domain}:3001")
            else:
                print("❌ Services failed to start")
        
        return sandbox
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    get_preview_urls()
