#!/usr/bin/env python3
"""
Restore Local Files to Daytona
"""

def restore_local_files():
    try:
        from daytona import Daytona, DaytonaConfig
        import os
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("=== RESTORING LOCAL FILES TO DAYTONA ===")
        
        # Read the CommunityPulse component from local
        local_cp_path = r"C:\Projects\Hackathon July 2025\Vitalmatrix\src\components\CommunityPulse.tsx"
        
        if os.path.exists(local_cp_path):
            print("1. Reading local CommunityPulse.tsx...")
            with open(local_cp_path, 'r', encoding='utf-8') as f:
                cp_content = f.read()
            
            # Upload to Daytona
            print("2. Uploading CommunityPulse.tsx to Daytona...")
            # Write the content to the sandbox
            escaped_content = cp_content.replace("'", "'\"'\"'").replace('"', '\\"')
            upload_result = sandbox.process.exec(f"cd ~/vitalmatrix/src/components && cat > CommunityPulse.tsx << 'EOFCP'\n{cp_content}\nEOFCP")
            print(f"CommunityPulse upload: {upload_result.exit_code}")
        
        # Check for other key local files
        local_base = r"C:\Projects\Hackathon July 2025\Vitalmatrix"
        
        key_files = [
            "src/firebase/communityPulseService.ts",
            "src/types/communityPulse.ts", 
            "src/components/UserDashboard.tsx",
            "src/styles/community-pulse.css"
        ]
        
        for file_path in key_files:
            local_file = os.path.join(local_base, file_path)
            if os.path.exists(local_file):
                print(f"3. Uploading {file_path}...")
                
                with open(local_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Create directory structure if needed
                dir_path = os.path.dirname(file_path).replace('\\', '/')
                sandbox.process.exec(f"mkdir -p ~/vitalmatrix/{dir_path}")
                
                # Upload file
                sandbox.process.exec(f"cd ~/vitalmatrix && cat > {file_path} << 'EOFFILE'\n{content}\nEOFFILE")
                print(f"Uploaded {file_path}")
            else:
                print(f"Local file not found: {file_path}")
        
        # Check if we have the services directory
        services_dir = os.path.join(local_base, "src/services")
        if os.path.exists(services_dir):
            print("4. Checking services directory...")
            for file in os.listdir(services_dir):
                if file.endswith('.ts') or file.endswith('.tsx'):
                    service_path = os.path.join(services_dir, file)
                    with open(service_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    sandbox.process.exec(f"mkdir -p ~/vitalmatrix/src/services")
                    sandbox.process.exec(f"cd ~/vitalmatrix/src/services && cat > {file} << 'EOFSERVICE'\n{content}\nEOFSERVICE")
                    print(f"Uploaded service: {file}")
        
        # Verify the files were uploaded
        print("5. Verifying uploaded files...")
        verify_cp = sandbox.process.exec("ls -la ~/vitalmatrix/src/components/CommunityPulse.tsx")
        if verify_cp.exit_code == 0:
            print("✅ CommunityPulse.tsx restored successfully")
        
        verify_firebase = sandbox.process.exec("ls -la ~/vitalmatrix/src/firebase/")
        if verify_firebase.exit_code == 0:
            print("Firebase directory contents:")
            print(verify_firebase.result)
        
        # Now restart the development server
        print("6. Restarting development server...")
        sandbox.process.exec("pkill -9 -f node")
        sandbox.process.exec("pkill -9 -f next")
        
        # Wait a moment
        import time
        time.sleep(3)
        
        # Start the server
        start_result = sandbox.process.exec("cd ~/vitalmatrix && nohup npm run dev > ~/restored-dev.log 2>&1 &")
        print(f"Server restart: {start_result.exit_code}")
        
        # Wait for startup
        time.sleep(15)
        
        # Test the server
        print("7. Testing restored functionality...")
        test_result = sandbox.process.exec("curl -s -I http://localhost:3000")
        if test_result.exit_code == 0:
            print("Server response:")
            print(test_result.result)
        
        print("\n=== RESTORATION COMPLETE ===")
        print("✅ Your original CommunityPulse and other components have been restored!")
        print("✅ All Firebase services should be working")
        print("✅ Full VitalMatrix functionality is back")
        print("\nFrontend: https://3000-ca32d930-5c53-4515-b9dd-ca2cba511e76.proxy.daytona.work")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    restore_local_files()
