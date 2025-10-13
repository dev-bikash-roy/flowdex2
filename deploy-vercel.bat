@echo off
echo 🚀 Deploying FlowdeX to Vercel...
echo.

echo ✅ Step 1: Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Vercel CLI. Please install manually:
        echo    npm install -g vercel
        pause
        exit /b 1
    )
) else (
    echo ✅ Vercel CLI is installed
)

echo.
echo ✅ Step 2: Building the project...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix build errors and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Step 3: Deploying to Vercel...
echo.
echo 📋 IMPORTANT: When prompted, configure these settings:
echo    - Set up and deploy: Y
echo    - Which scope: Choose your account
echo    - Link to existing project: N (for first deployment)
echo    - Project name: flowdex (or your preferred name)
echo    - Directory: ./ (current directory)
echo.
echo 🔑 REMEMBER: Add environment variables in Vercel dashboard after deployment!
echo.
pause

vercel

echo.
echo 🎉 Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Go to your Vercel dashboard
echo 2. Add environment variables (see deploy-to-vercel.md)
echo 3. Test your deployed app
echo.
echo 🌐 Your app will be available at: https://your-project-name.vercel.app
echo.
pause