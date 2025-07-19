#!/usr/bin/env python3
"""
VitalMatrix Daytona SDK Deployment
Using the official Daytona Python SDK
"""

import os
import time

def deploy_with_sdk():
    """Deploy VitalMatrix using Daytona SDK"""
    
    print("VitalMatrix Daytona SDK Deployment")
    print("=" * 40)
    
    try:
        # Import the Daytona SDK
        from daytona import Daytona, DaytonaConfig
        
        # Configure Daytona
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        # Initialize Daytona client
        daytona = Daytona(config)
        
        print("Creating VitalMatrix sandbox...")
        
        # Create sandbox with VitalMatrix
        sandbox = daytona.create()
        
        print(f"Sandbox created: {sandbox.id}")
        
        # Clone the VitalMatrix repository
        print("Cloning VitalMatrix repository...")
        clone_result = sandbox.process.exec(
            "git clone https://github.com/JoeProAI/VitalMatrix.git ~/vitalmatrix"
        )
        
        if clone_result.exit_code != 0:
            print(f"Clone failed: {clone_result.result}")
            return None
            
        print("Repository cloned successfully!")
        
        # Change to project directory and install dependencies
        print("Installing dependencies...")
        install_result = sandbox.process.exec(
            "cd ~/vitalmatrix && npm install"
        )
        
        if install_result.exit_code != 0:
            print(f"Install failed: {install_result.result}")
            return None
            
        print("Dependencies installed!")
        
        # Build the project
        print("Building VitalMatrix...")
        build_result = sandbox.process.exec(
            "cd ~/vitalmatrix && npm run build"
        )
        
        if build_result.exit_code != 0:
            print(f"Build failed: {build_result.result}")
            return None
            
        print("Build successful!")
        
        # Start the application
        print("Starting VitalMatrix...")
        start_result = sandbox.process.exec(
            "cd ~/vitalmatrix && nohup npm run dev:full > ~/vitalmatrix.log 2>&1 &"
        )
        
        print("VitalMatrix is starting...")
        print(f"Sandbox ID: {sandbox.id}")
        print("Access your application through the Daytona dashboard")
        
        return sandbox
        
    except ImportError:
        print("Daytona SDK not found. Installing...")
        os.system("pip install daytona")
        print("Please run the script again after installation.")
        return None
        
    except Exception as e:
        print(f"Deployment error: {e}")
        return None

if __name__ == "__main__":
    result = deploy_with_sdk()
    if result:
        print("Deployment successful!")
        print("Check the Daytona dashboard for your running application.")
    else:
        print("Deployment failed. Check the logs above.")
