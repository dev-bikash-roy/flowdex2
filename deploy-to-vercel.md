# 🚀 Deploy FlowdeX to Vercel - Quick Guide

## Method 1: Using Vercel Dashboard (Recommended for first deployment)

### Step 1: Go to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"

### Step 2: Import Repository
1. Find your `flowdex2` repository
2. Click "Import"
3. Vercel will auto-detect the settings

### Step 3: Configure Environment Variables
Before deploying, add these environment variables in Vercel:

**Required Environment Variables:**
```
VITE_SUPABASE_URL = https://dcfavnetfqirooxhvqsy.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmF2bmV0ZnFpcm9veGh2cXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Mjk3OTEsImV4cCI6MjA3NDUwNTc5MX0.CkuDMegvqToLrLtYsA9KBFeK-Rg_buvdvJ-HF2U5y_4
NEXT_PUBLIC_SUPABASE_URL = https://dcfavnetfqirooxhvqsy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = sb_publishable_8Of1sSwiY3Gj8WXb0WedSw_KiBwcBQQ
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmF2bmV0ZnFpcm9veGh2cXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkyOTc5MSwiZXhwIjoyMDc0NTA1NzkxfQ.-ygKxfWNdhSll-zx0OWOfBep6jQn2GIAWkcKsSTqDic
AUTH_MODE = supabase
DATABASE_URL = postgresql://postgres:qVUf..w3dwYkHrP@dcfavnetfqirooxhvqsy.supabase.co:5432/postgres?sslmode=require&connect_timeout=30
SESSION_SECRET = flowdex-session-secret-key-change-in-production
TWELVEDATA_API_KEY = 466bab77034f4e5d8c0235f32130817b
VITE_TWELVEDATA_API_KEY = 466bab77034f4e5d8c0235f32130817b
NODE_ENV = production
```

### Step 4: Deploy Settings
Vercel should auto-detect these, but verify:
- **Framework Preset:** Other
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be live at: `https://your-project-name.vercel.app`

## Method 2: Using Vercel CLI (For future deployments)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login and Deploy
```bash
vercel login
vercel
```

## 🔧 Post-Deployment Checklist

### 1. Test Core Features
- [ ] User registration/login
- [ ] Dashboard loads correctly
- [ ] Backtest session creation
- [ ] Chart displays with real data
- [ ] Mobile responsiveness
- [ ] Hamburger menu works

### 2. Database Setup
Make sure you've run the SQL migration in Supabase:
1. Go to Supabase Dashboard > SQL Editor
2. Run the SQL from `RUN_THIS_SQL.sql`
3. Verify all tables are created

### 3. Custom Domain (Optional)
1. In Vercel Dashboard: Settings > Domains
2. Add your custom domain
3. Configure DNS as instructed

## 🎉 Your FlowdeX App Features

✅ **Professional Trading Platform**
- Real-time TradingView charts with Twelve Data
- Mobile-responsive design with hamburger menu
- Professional UI with dark theme
- Trading session management
- Advanced backtesting capabilities

✅ **Mobile Optimized**
- Responsive layout for all screen sizes
- Touch-friendly interface
- Slide-out navigation menu
- Optimized for mobile trading

✅ **Real Market Data**
- Twelve Data API integration
- Live price updates
- Professional trading charts
- News integration

✅ **User Management**
- Supabase authentication
- Secure user sessions
- Profile management
- Data persistence

## 🆘 Troubleshooting

### Build Fails?
1. Check environment variables are set correctly
2. Verify all dependencies are in package.json
3. Check build logs in Vercel dashboard

### App Not Loading?
1. Check browser console for errors
2. Verify Supabase connection
3. Ensure database tables exist

### Charts Not Working?
1. Verify TWELVEDATA_API_KEY is set
2. Check network requests in browser dev tools
3. Ensure API key is valid

## 🚀 Success!

Once deployed, your FlowdeX trading platform will be live with:
- Professional trading interface
- Real-time market data
- Mobile-responsive design
- Secure user authentication
- Advanced backtesting features

**Your app URL:** `https://your-project-name.vercel.app`

Congratulations on deploying your professional trading platform! 🎉