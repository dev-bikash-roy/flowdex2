# How to Connect FlowdeX with Database and Other APIs

To make FlowdeX fully functional, you need to connect it with several services. Here's exactly how to do it:

## 🎯 Quick Answer

1. **Update your [.env](file:///e:/FlowdexTradeJournal/.env) file** with credentials for all services
2. **Run database migration**: `npm run db:push`
3. **Verify connections**: `npm run verify:setup`
4. **Start the application**: `npm run dev`

## 📋 Detailed Steps

### 1. Database Connection (PostgreSQL)

**Option A: Local Installation**
```bash
# 1. Install PostgreSQL from postgresql.org
# 2. Create database
psql -U postgres -c "CREATE DATABASE flowdex;"

# 3. Update .env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/flowdex
```

**Option B: Cloud Database**
```bash
# 1. Sign up for NeonDB, Supabase, or AWS RDS
# 2. Get connection string from provider
# 3. Update .env
DATABASE_URL=your_cloud_provider_connection_string
```

### 2. TwelveData API (Market Data)

```bash
# 1. Sign up at twelvedata.com
# 2. Get free API key from dashboard
# 3. Update .env
TWELVEDATA_API_KEY=your_api_key_here
```

### 3. Stripe (Payments)

```bash
# 1. Sign up at stripe.com
# 2. Get API keys from dashboard
# 3. Update .env
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

### 4. AWS S3 (File Storage)

```bash
# 1. Sign up for AWS
# 2. Create S3 bucket and IAM user
# 3. Get credentials
# 4. Update .env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
```

## 🚀 One-Command Setup

Use our setup wizard for guided configuration:
```bash
npm run setup:wizard
```

## ✅ Verification

Test all connections:
```bash
npm run verify:setup
```

Expected output when everything is working:
```
✅ Database: Connected successfully
✅ TwelveData API: API key valid
✅ Stripe: Service loaded successfully
✅ AWS S3: Service loaded successfully

🎉 All services are properly configured!
```

## 🎉 Result

Once connected, FlowdeX will have:
- ✅ Real-time market data from TwelveData
- ✅ Secure database storage with PostgreSQL
- ✅ Payment processing with Stripe
- ✅ File storage with AWS S3
- ✅ Complete trading journal functionality
- ✅ Professional charting interface

The application will be fully functional at `http://localhost:5000`