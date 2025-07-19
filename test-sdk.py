#!/usr/bin/env python3
"""
Test Daytona SDK methods
"""

def test_sdk():
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox = daytona.create()
        
        print(f"Sandbox created: {sandbox.id}")
        print(f"Sandbox attributes: {dir(sandbox)}")
        
        if hasattr(sandbox, 'process'):
            print(f"Process attributes: {dir(sandbox.process)}")
        
        if hasattr(sandbox, 'exec'):
            print(f"Exec attributes: {dir(sandbox.exec)}")
            
        # Try a simple command
        if hasattr(sandbox, 'exec'):
            result = sandbox.exec("echo 'Hello from Daytona!'")
            print(f"Exec result: {result}")
        elif hasattr(sandbox.process, 'exec'):
            result = sandbox.process.exec("echo 'Hello from Daytona!'")
            print(f"Process exec result: {result}")
        elif hasattr(sandbox.process, 'run'):
            result = sandbox.process.run("echo 'Hello from Daytona!'")
            print(f"Process run result: {result}")
            
        return sandbox
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    test_sdk()
