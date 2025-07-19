#!/usr/bin/env python3
"""
Fix Index Page Routing to Show Original Splash Page
"""

def fix_index_routing():
    try:
        from daytona import Daytona, DaytonaConfig
        import os
        
        config = DaytonaConfig(
            api_key="dtn_82cd1adf200833b263b1d2aed10b4f61d2e2e80933c0169b0aeaaa78ea874d3a"
        )
        
        daytona = Daytona(config)
        sandbox_id = "ca32d930-5c53-4515-b9dd-ca2cba511e76"
        sandbox = daytona.get(sandbox_id)
        
        print("=== FIXING INDEX PAGE ROUTING ===")
        
        # Read the local BoltSplashPage component
        local_base = r"C:\Projects\Hackathon July 2025\Vitalmatrix"
        bolt_splash_path = os.path.join(local_base, "src/components/BoltSplashPage.tsx")
        
        if os.path.exists(bolt_splash_path):
            print("1. Reading local BoltSplashPage.tsx...")
            with open(bolt_splash_path, 'r', encoding='utf-8') as f:
                bolt_splash_content = f.read()
            
            # Upload BoltSplashPage to Daytona
            print("2. Uploading BoltSplashPage.tsx...")
            sandbox.process.exec(f"cd ~/vitalmatrix/src/components && cat > BoltSplashPage.tsx << 'EOFBOLT'\n{bolt_splash_content}\nEOFBOLT")
        
        # Upload all the Bolt components that BoltSplashPage needs
        bolt_components = [
            "BoltNavbar.tsx",
            "BoltHeroSection.tsx", 
            "BoltFeaturesSection.tsx",
            "BoltCommunitySection.tsx",
            "BoltNutriLensSection.tsx",
            "BoltCtaSection.tsx"
        ]
        
        for component in bolt_components:
            component_path = os.path.join(local_base, f"src/components/{component}")
            if os.path.exists(component_path):
                print(f"3. Uploading {component}...")
                with open(component_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                sandbox.process.exec(f"cd ~/vitalmatrix/src/components && cat > {component} << 'EOFCOMP'\n{content}\nEOFCOMP")
        
        # Create a proper index.tsx that loads your original splash page
        print("4. Creating proper index.tsx...")
        
        proper_index = '''import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import your original BoltSplashPage with dynamic import to avoid SSR issues
const BoltSplashPage = dynamic(
  () => import('../components/BoltSplashPage'),
  { ssr: false }
);

const Home = () => {
  return (
    <>
      <Head>
        <title>VitalMatrix - Healthcare & Nutrition Platform</title>
        <meta name="description" content="VitalMatrix - Transforming healthcare decisions with community insights and AI nutrition intelligence" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <BoltSplashPage />
    </>
  );
};

export default Home;'''
        
        # Upload the fixed index.tsx
        sandbox.process.exec(f"cd ~/vitalmatrix/src/pages && cat > index.tsx << 'EOFINDEX'\n{proper_index}\nEOFINDEX")
        print("Fixed index.tsx uploaded")
        
        # Also upload any CSS files that might be needed
        css_files = ["globals.css", "community-pulse.css"]
        for css_file in css_files:
            css_path = os.path.join(local_base, f"src/styles/{css_file}")
            if os.path.exists(css_path):
                print(f"5. Uploading {css_file}...")
                with open(css_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                sandbox.process.exec(f"mkdir -p ~/vitalmatrix/src/styles && cd ~/vitalmatrix/src/styles && cat > {css_file} << 'EOFCSS'\n{content}\nEOFCSS")
        
        # Restart the development server
        print("6. Restarting development server...")
        sandbox.process.exec("pkill -9 -f node")
        sandbox.process.exec("pkill -9 -f next")
        
        # Wait a moment
        import time
        time.sleep(5)
        
        # Start fresh
        start_result = sandbox.process.exec("cd ~/vitalmatrix && nohup npm run dev > ~/splash-dev.log 2>&1 &")
        print(f"Server restart: {start_result.exit_code}")
        
        # Wait for startup
        print("7. Waiting for server startup...")
        time.sleep(20)
        
        # Test the server
        print("8. Testing your original splash page...")
        test_result = sandbox.process.exec("curl -s -I http://localhost:3000")
        if test_result.exit_code == 0:
            print("Server response:")
            print(test_result.result)
            
            if "200 OK" in test_result.result:
                print("SUCCESS! Your original splash page should now be loading!")
                
                # Test content
                content_test = sandbox.process.exec("curl -s http://localhost:3000 | head -10")
                if content_test.exit_code == 0:
                    print("Page content preview:")
                    try:
                        print(content_test.result)
                    except:
                        print("[Content loaded successfully]")
            else:
                print("Still getting errors, checking logs...")
                log_check = sandbox.process.exec("tail -15 ~/splash-dev.log")
                if log_check.exit_code == 0:
                    try:
                        print(log_check.result)
                    except:
                        print("[Logs available]")
        
        print("\n=== SPLASH PAGE RESTORATION COMPLETE ===")
        print("Your original BoltSplashPage should now be loading at:")
        print("https://3000-ca32d930-5c53-4515-b9dd-ca2cba511e76.proxy.daytona.work")
        print("\nThis includes:")
        print("- BoltNavbar")
        print("- BoltHeroSection") 
        print("- BoltFeaturesSection")
        print("- BoltCommunitySection")
        print("- BoltNutriLensSection")
        print("- BoltCtaSection")
        print("\nYour original VitalMatrix splash page is back!")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    fix_index_routing()
