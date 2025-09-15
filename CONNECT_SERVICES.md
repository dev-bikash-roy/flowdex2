# How to Connect FlowdeX with Database and Other APIs

This document provides step-by-step instructions to connect FlowdeX with all required services to make it fully functional.

## 🎯 Objective

Connect FlowdeX with:
1. PostgreSQL Database
2. TwelveData API (Market Data)
3. Stripe (Payments)
4. AWS S3 (File Storage)

## 📋 Prerequisites

- Node.js installed (v16 or higher)
- Git installed
- Code editor (VS Code recommended)

## 🔧 Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd flowdex

# Install dependencies
npm install
```

## 🗄️ Step 2: Database Connection

### Option A: Local PostgreSQL

1. **Install PostgreSQL**:
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Follow installation instructions
   - Remember the password for the `postgres` user

2. **Create Database**:
   ```sql
   CREATE DATABASE flowdex;
   ```

3. **Update Environment Variables**:
   Edit [.env](file:///e:/FlowdexTradeJournal/.env) file:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/flowdex
   ```

### Option B: Cloud Database (Recommended)

1. **Choose a Provider**:
   - [NeonDB](https://neon.tech/) (Free tier available)
   - [Supabase](https://supabase.com/) (Free tier available)
   - AWS RDS
   - Google Cloud SQL

2. **Get Connection String** from your provider

3. **Update Environment Variables**:
   Edit [.env](file:///e:/FlowdexTradeJournal/.env) file:
   ```env
   DATABASE_URL=your_provider_connection_string
   ```

### Apply Database Schema

```bash
# Push schema to database
npm run db:push
```

## 📈 Step 3: TwelveData API (Market Data)

1. **Get API Key**:
   - Sign up at [twelvedata.com](https://twelvedata.com/)
   - Get your free API key from the dashboard

2. **Update Environment Variables**:
   Edit [.env](file:///e:/FlowdexTradeJournal/.env) file:
   ```env
   TWELVEDATA_API_KEY=your_twelvedata_api_key_here
   ```

## 💳 Step 4: Stripe (Payments)

1. **Get API Keys**:
   - Sign up at [stripe.com](https://stripe.com/)
   - Get publishable and secret keys from the dashboard

2. **Update Environment Variables**:
   Edit [.env](file:///e:/FlowdexTradeJournal/.env) file:
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   ```

## ☁️ Step 5: AWS S3 (File Storage)

1. **Set Up AWS**:
   - Sign up for AWS (if you don't have an account)
   - Create an S3 bucket:
     - Go to S3 service
     - Click "Create bucket"
     - Name it (e.g., `flowdex-files-12345`)
     - Keep default settings
   - Create credentials:
     - Go to IAM service
     - Create a new user with programmatic access
     - Attach S3 permissions
     - Save Access Key ID and Secret Access Key

2. **Update Environment Variables**:
   Edit [.env](file:///e:/FlowdexTradeJournal/.env) file:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your_bucket_name
   ```

## ✅ Step 6: Verify Connections

```bash
# Test all service connections
npm run verify:setup
```

Expected output:
```
✅ Database: Connected successfully
✅ TwelveData API: API key valid
✅ Stripe: Service loaded successfully
✅ AWS S3: Service loaded successfully

🎉 All services are properly configured!
```

## 🚀 Step 7: Start Application

```bash
# Start development server
npm run dev
```

Visit `http://localhost:5000` to see your fully functional FlowdeX application!

## 🧪 Testing Functionality

### Database Operations
1. Create a trading session
2. Execute some trades
3. Verify data is saved to the database

### TwelveData Integration
1. Open the Backtest page
2. Select a trading pair and timeframe
3. Verify chart data loads correctly

### Subscription Management
1. Navigate to subscription endpoints (when frontend is implemented)
2. View available plans
3. Create a subscription (test mode)

### File Uploads
1. Use the file upload API endpoints
2. Generate presigned URLs
3. Upload and download files from S3

## 🛠️ Troubleshooting

### Database Issues
- **Error**: "Connection refused"
  - Check if PostgreSQL is running
  - Verify DATABASE_URL credentials
  - Ensure database `flowdex` exists

- **Error**: "Authentication failed"
  - Double-check username/password in DATABASE_URL

### API Issues
- **Error**: "Invalid API key"
  - Verify API keys in [.env](file:///e:/FlowdexTradeJournal/.env)
  - Check service dashboards for key status

### Environment Variables
- **Issue**: Services not loading
  - Run `npm run verify:setup` to check configuration
  - Ensure no extra spaces in [.env](file:///e:/FlowdexTradeJournal/.env)

## 📚 Additional Resources

For detailed instructions, see:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Comprehensive setup guide
- [HOW_TO_MAKE_IT_FULLY_FUNCTIONAL.md](HOW_TO_MAKE_IT_FULLY_FUNCTIONAL.md) - Complete configuration walkthrough
- [STATUS.md](STATUS.md) - Current service status dashboard

## 🎉 Success!

Once all services are connected, FlowdeX will be a fully functional SaaS trading journal and backtesting platform with:

- ✅ Real-time market data
- ✅ Secure user authentication
- ✅ Database storage for all trading data
- ✅ Subscription payment processing
- ✅ File storage for screenshots and documents
- ✅ Professional charting interface
- ✅ Complete trading journal functionality

The application is now ready for frontend development to complete the user interface and for deployment to production environments.