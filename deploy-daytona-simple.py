#!/usr/bin/env python3
"""
VitalMatrix Daytona Deployment Script
"""

import requests
import json
import time

def deploy_to_daytona():
    """Deploy VitalMatrix to Daytona"""
    
    print("VitalMatrix Daytona Deployment")
    print("=" * 40)
    
    api_key = "dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
    base_url = "https://app.daytona.io/api/v1"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    print("Testing API connection...")
    
    try:
        # Test with different endpoints
        endpoints = [
            f"{base_url}/health",
            f"{base_url}/workspaces",
            "https://app.daytona.io/api/health"
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(endpoint, headers=headers, timeout=10)
                print(f"Endpoint {endpoint}: {response.status_code}")
                
                if response.status_code == 200:
                    print("API connection successful!")
                    
                    # Create workspace
                    workspace_config = {
                        "name": "vitalmatrix-prod",
                        "repository": "https://github.com/JoeProAI/VitalMatrix.git",
                        "image": "node:18"
                    }
                    
                    create_response = requests.post(
                        f"{base_url}/workspaces",
                        headers=headers,
                        json=workspace_config,
                        timeout=30
                    )
                    
                    print(f"Create workspace response: {create_response.status_code}")
                    print(f"Response body: {create_response.text}")
                    
                    return create_response.json() if create_response.status_code in [200, 201] else None
                    
            except Exception as e:
                print(f"Endpoint {endpoint} failed: {e}")
                continue
                
        print("All endpoints failed")
        return None
        
    except Exception as e:
        print(f"Deployment error: {e}")
        return None

if __name__ == "__main__":
    result = deploy_to_daytona()
    if result:
        print("Deployment successful!")
        print(f"Result: {result}")
    else:
        print("Deployment failed")
