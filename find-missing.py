#!/usr/bin/env python3
"""
Find Missing Components
"""

def find_missing():
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("=== FINDING YOUR MISSING COMPONENTS ===")
        
        # Search entire vitalmatrix directory for CommunityPulse
        print("1. Searching for CommunityPulse anywhere...")
        search_cp = sandbox.process.exec("find ~/vitalmatrix -name '*CommunityPulse*' -type f")
        if search_cp.exit_code == 0 and search_cp.result.strip():
            print("Found CommunityPulse files:")
            print(search_cp.result)
        else:
            print("CommunityPulse not found in vitalmatrix directory")
        
        # Search for any Firebase files
        print("\n2. Searching for Firebase files...")
        search_firebase = sandbox.process.exec("find ~/vitalmatrix -name '*firebase*' -type f")
        if search_firebase.exit_code == 0 and search_firebase.result.strip():
            print("Found Firebase files:")
            print(search_firebase.result)
        else:
            print("No Firebase files found")
        
        # Check if there's a backup or different structure
        print("\n3. Checking directory structure...")
        full_structure = sandbox.process.exec("find ~/vitalmatrix/src -type d")
        if full_structure.exit_code == 0:
            print("Directory structure:")
            print(full_structure.result)
        
        # Check if components are in archive
        print("\n4. Checking archive directory...")
        archive_check = sandbox.process.exec("ls -la ~/vitalmatrix/src/components/archive/")
        if archive_check.exit_code == 0:
            print("Archive contents:")
            print(archive_check.result)
        
        # Check if there are any TypeScript files with community or pulse
        print("\n5. Searching for community/pulse related files...")
        search_community = sandbox.process.exec("find ~/vitalmatrix -name '*.tsx' -o -name '*.ts' | xargs grep -l -i 'community\\|pulse' 2>/dev/null || echo 'No community/pulse files found'")
        if search_community.exit_code == 0:
            print("Files mentioning community/pulse:")
            print(search_community.result)
        
        # Check the git status to see what happened
        print("\n6. Checking git status...")
        git_status = sandbox.process.exec("cd ~/vitalmatrix && git status")
        if git_status.exit_code == 0:
            print("Git status:")
            print(git_status.result)
        
        # Check git log to see recent changes
        print("\n7. Checking recent git changes...")
        git_log = sandbox.process.exec("cd ~/vitalmatrix && git log --oneline -5")
        if git_log.exit_code == 0:
            print("Recent commits:")
            print(git_log.result)
        
        print("\n=== ANALYSIS ===")
        print("It looks like your original components may have been:")
        print("1. Moved to archive directory")
        print("2. Not included in the original GitHub repo")
        print("3. Lost during deployment")
        print("\nWe need to restore them from your local files!")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    find_missing()
