#!/usr/bin/env python3
"""
Simple VitalMatrix URL getter
"""

def get_urls():
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("VitalMatrix Daytona URLs")
        print("=" * 30)
        
        # Get preview URLs
        try:
            frontend_url = sandbox.get_preview_link(3000)
            print(f"Frontend: {frontend_url}")
        except Exception as e:
            print(f"Frontend URL error: {e}")
            
        try:
            proxy_url = sandbox.get_preview_link(3001)
            print(f"Proxy: {proxy_url}")
        except Exception as e:
            print(f"Proxy URL error: {e}")
        
        # Show runner domain
        if hasattr(sandbox, 'runner_domain'):
            print(f"\nDomain: {sandbox.runner_domain}")
            print(f"Frontend: https://{sandbox.runner_domain}:3000")
            print(f"Proxy: https://{sandbox.runner_domain}:3001")
        
        # Start services
        print("\nStarting services...")
        sandbox.process.exec("cd ~/vitalmatrix && pkill -f npm")
        sandbox.process.exec("cd ~/vitalmatrix && nohup npm run preview -- --host 0.0.0.0 --port 3000 &")
        sandbox.process.exec("cd ~/vitalmatrix && PORT=3001 nohup npm run server &")
        
        print("Services started!")
        print("Check the URLs above to access VitalMatrix")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_urls()
