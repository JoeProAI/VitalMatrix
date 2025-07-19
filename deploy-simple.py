#!/usr/bin/env python3
"""
VitalMatrix Simple Daytona Deployment Script
"""

import os
import requests
import json

def deploy_to_daytona():
    """Deploy VitalMatrix to Daytona using REST API"""
    
    print("🚀 VitalMatrix Daytona Deployment")
    print("=" * 40)
    
    # Your Daytona API key
    api_key = "dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
    base_url = "https://app.daytona.io/api"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Create a new sandbox
    print("🌐 Creating VitalMatrix sandbox...")
    
    sandbox_config = {
        "name": "vitalmatrix-production",
        "image": "node:18-slim",
        "resources": {
            "cpu": 2,
            "memory": 4,
            "disk": 10
        },
        "environment": {
            "NODE_ENV": "production",
            "PORT": "3000"
        }
    }
    
    try:
        # Create sandbox
        response = requests.post(
            f"{base_url}/sandboxes",
            headers=headers,
            json=sandbox_config,
            timeout=30
        )
        
        if response.status_code == 201:
            sandbox = response.json()
            print(f"✅ Sandbox created: {sandbox.get('id', 'unknown')}")
            print(f"🔗 Access URL: {sandbox.get('url', 'pending')}")
            return sandbox
        else:
            print(f"❌ Failed to create sandbox: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    deploy_to_daytona()
