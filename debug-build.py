#!/usr/bin/env python3
"""
Debug VitalMatrix Build Issues
"""

def debug_build():
    try:
        from daytona import Daytona, DaytonaConfig
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("=== DEBUGGING BUILD ISSUES ===")
        
        # Stop everything first
        sandbox.process.exec("pkill -9 -f node")
        sandbox.process.exec("pkill -9 -f next")
        
        # Check the build error in detail
        print("1. Checking build error...")
        build_error = sandbox.process.exec("cd ~/vitalmatrix && npm run build 2>&1")
        if build_error.exit_code != 0:
            print("Build error details:")
            try:
                print(build_error.result)
            except:
                print("[Build error details available but encoding issue]")
        
        # Check the specific error from the logs
        print("2. Checking development logs...")
        dev_log = sandbox.process.exec("tail -20 ~/vitalmatrix-dev.log")
        if dev_log.exit_code == 0:
            print("Dev log:")
            try:
                print(dev_log.result)
            except:
                print("[Dev log available but encoding issue]")
        
        # Check what pages exist
        print("3. Checking pages structure...")
        pages_structure = sandbox.process.exec("find ~/vitalmatrix/src/pages -type f -name '*.tsx' -o -name '*.ts' -o -name '*.js'")
        if pages_structure.exit_code == 0:
            print("Pages found:")
            print(pages_structure.result)
        
        # Check for _app.tsx content
        print("4. Checking _app.tsx...")
        app_content = sandbox.process.exec("cat ~/vitalmatrix/src/pages/_app.tsx")
        if app_content.exit_code == 0:
            print("_app.tsx content:")
            try:
                print(app_content.result[:500])
            except:
                print("[_app.tsx content available]")
        
        # Check for index page
        print("5. Checking for index page...")
        index_check = sandbox.process.exec("find ~/vitalmatrix/src/pages -name 'index.*'")
        if index_check.exit_code == 0:
            print("Index pages found:")
            print(index_check.result)
        else:
            print("No index page found - this is the problem!")
            
            # Create a proper index page that imports your components
            print("Creating index page...")
            
            index_content = '''import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import your existing components
const BoltSplashPage = dynamic(() => import('../components/BoltSplashPage'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>VitalMatrix - Healthcare & Nutrition Platform</title>
        <meta name="description" content="VitalMatrix healthcare and nutrition platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <BoltSplashPage />
    </>
  );
}'''
            
            sandbox.process.exec(f"cd ~/vitalmatrix/src/pages && cat > index.tsx << 'EOF'\n{index_content}\nEOF")
            print("Index page created")
        
        # Check for any CSS import issues
        print("6. Checking for CSS import issues...")
        css_issues = sandbox.process.exec("grep -r 'import.*\\.css' ~/vitalmatrix/src/pages/ || echo 'No CSS imports in pages'")
        if css_issues.exit_code == 0:
            print("CSS imports in pages:")
            print(css_issues.result)
        
        # Check next.config.js
        print("7. Checking next.config.js...")
        next_config = sandbox.process.exec("cat ~/vitalmatrix/next.config.js")
        if next_config.exit_code == 0:
            print("Next.js config:")
            try:
                print(next_config.result)
            except:
                print("[Next.js config available]")
        
        # Try to start in development mode with verbose logging
        print("8. Starting with verbose logging...")
        start_verbose = sandbox.process.exec("cd ~/vitalmatrix && nohup npm run dev -- --verbose > ~/vitalmatrix-verbose.log 2>&1 &")
        print(f"Verbose start: {start_verbose.exit_code}")
        
        # Wait and check
        import time
        time.sleep(15)
        
        # Check verbose logs
        verbose_log = sandbox.process.exec("tail -30 ~/vitalmatrix-verbose.log")
        if verbose_log.exit_code == 0:
            print("Verbose logs:")
            try:
                print(verbose_log.result)
            except:
                print("[Verbose logs available]")
        
        # Test the frontend
        print("9. Testing frontend...")
        frontend_test = sandbox.process.exec("curl -s -I http://localhost:3000")
        if frontend_test.exit_code == 0:
            print("Frontend response:")
            print(frontend_test.result)
            
            # If still 404, check what Next.js is serving
            if "404" in frontend_test.result:
                print("Still getting 404, checking what Next.js is serving...")
                content_check = sandbox.process.exec("curl -s http://localhost:3000")
                if content_check.exit_code == 0:
                    print("404 page content (first 200 chars):")
                    try:
                        print(content_check.result[:200])
                    except:
                        print("[404 content available]")
        
        # Check if processes are actually running
        print("10. Checking running processes...")
        ps_check = sandbox.process.exec("ps aux | grep next | grep -v grep")
        if ps_check.exit_code == 0:
            print("Next.js processes:")
            print(ps_check.result)
        
        print("\n=== DIAGNOSIS COMPLETE ===")
        print("Frontend: https://3000-ca32d930-5c53-4515-b9dd-ca2cba511e76.proxy.daytona.work")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    debug_build()
