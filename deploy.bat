@echo off
echo 🚀 Deploying FlowdeX to Vercel...

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit - FlowdeX trading platform"
)

REM Check if vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

REM Build the project locally to check for errors
echo Building project locally...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    REM Deploy to Vercel
    echo Deploying to Vercel...
    vercel --prod
    
    echo 🎉 Deployment complete!
    echo Don't forget to:
    echo 1. Set up environment variables in Vercel dashboard
    echo 2. Run the SQL migration in Supabase
    echo 3. Test your deployed application
) else (
    echo ❌ Build failed. Please fix the errors before deploying.
    exit /b 1
)