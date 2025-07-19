#!/usr/bin/env python3
"""
VitalMatrix Daytona API Deployment Script
"""

import requests
import json
import os
import time

def deploy_to_daytona():
    """Deploy VitalMatrix to Daytona using direct API calls"""
    
    print("🚀 VitalMatrix Daytona API Deployment")
    print("=" * 40)
    
    # Your Daytona API configuration
    api_key = "dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
    base_url = "https://app.daytona.io/api/v1"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    print("🔍 Testing API connection...")
    
    try:
        # Test API connection
        health_response = requests.get(f"{base_url}/health", headers=headers, timeout=10)
        print(f"API Health Status: {health_response.status_code}")
        
        if health_response.status_code != 200:
            print(f"❌ API health check failed: {health_response.text}")
            return None
            
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        return None
    
    # Create workspace configuration
    workspace_config = {
        "name": "vitalmatrix-production",
        "repository": {
            "url": "https://github.com/JoeProAI/VitalMatrix.git",
            "branch": "main"
        },
        "image": "node:18-slim",
        "resources": {
            "cpu": 4,
            "memory": 8192,  # 8GB in MB
            "storage": 20480  # 20GB in MB
        },
        "environment": {
            "NODE_ENV": "production",
            "PORT": "3000",
            "PROXY_PORT": "3001"
        },
        "ports": [3000, 3001],
        "autoStart": True,
        "autoStop": False
    }
    
    print("🌐 Creating VitalMatrix workspace...")
    
    try:
        # Create workspace
        create_response = requests.post(
            f"{base_url}/workspaces",
            headers=headers,
            json=workspace_config,
            timeout=60
        )
        
        print(f"Create response status: {create_response.status_code}")
        
        if create_response.status_code in [200, 201]:
            workspace = create_response.json()
            workspace_id = workspace.get('id')
            
            print(f"✅ Workspace created: {workspace_id}")
            print(f"🔗 Workspace URL: {workspace.get('url', 'pending')}")
            
            # Wait for workspace to be ready
            print("⏳ Waiting for workspace to initialize...")
            
            for i in range(30):  # Wait up to 5 minutes
                time.sleep(10)
                
                status_response = requests.get(
                    f"{base_url}/workspaces/{workspace_id}",
                    headers=headers,
                    timeout=10
                )
                
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    state = status_data.get('state', 'unknown')
                    
                    print(f"Workspace state: {state}")
                    
                    if state == 'running':
                        print("✅ Workspace is running!")
                        print(f"🌐 Access your app at: {status_data.get('url')}")
                        return workspace
                    elif state == 'failed':
                        print("❌ Workspace failed to start")
                        return None
                else:
                    print(f"Status check failed: {status_response.status_code}")
            
            print("⚠️ Workspace is still initializing...")
            return workspace
            
        else:
            print(f"❌ Failed to create workspace: {create_response.status_code}")
            print(f"Response: {create_response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Deployment error: {e}")
        return None

if __name__ == "__main__":
    result = deploy_to_daytona()
    if result:
        print("\n🎉 VitalMatrix deployment initiated!")
        print("Check the Daytona dashboard for deployment progress.")
    else:
        print("\n❌ Deployment failed. Check the logs above.")
