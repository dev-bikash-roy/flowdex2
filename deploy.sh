#!/bin/bash

echo "🚀 Deploying FlowdeX to Vercel..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - FlowdeX trading platform"
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project locally to check for errors
echo "Building project locally..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "Deploying to Vercel..."
    vercel --prod
    
    echo "🎉 Deployment complete!"
    echo "Don't forget to:"
    echo "1. Set up environment variables in Vercel dashboard"
    echo "2. Run the SQL migration in Supabase"
    echo "3. Test your deployed application"
else
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi