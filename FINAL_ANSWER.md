# How to Connect FlowdeX with Database and Other APIs - Complete Guide

To make FlowdeX fully functional, you need to connect it with several services. Here's exactly how to do it:

## 🎯 Quick Answer

Run the setup wizard for guided configuration:
```bash
npm run setup:wizard
```

Or manually configure all services by updating your [.env](file:///e:/FlowdexTradeJournal/.env) file and then:
1. Run database migration: `npm run db:push`
2. Verify connections: `npm run verify:setup`
3. Start the application: `npm run dev`

## 📋 Step-by-Step Instructions

### 1. Database Connection (PostgreSQL)

**Option A: Local Installation**
1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create database:
   ```sql
   CREATE DATABASE flowdex;
   ```
3. Update [.env](file:///e:/FlowdexTradeJournal/.env):
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/flowdex
   ```

**Option B: Cloud Database**
1. Sign up for [NeonDB](https://neon.tech/) or [Supabase](https://supabase.com/)
2. Get connection string from provider
3. Update [.env](file:///e:/FlowdexTradeJournal/.env):
   ```env
   DATABASE_URL=your_cloud_provider_connection_string
   ```

### 2. TwelveData API (Market Data)

1. Sign up at [twelvedata.com](https://twelvedata.com/)
2. Get free API key from dashboard
3. Update [.env](file:///e:/FlowdexTradeJournal/.env):
   ```env
   TWELVEDATA_API_KEY=your_api_key_here
   ```

### 3. Stripe (Payments)

1. Sign up at [stripe.com](https://stripe.com/)
2. Get API keys from dashboard
3. Update [.env](file:///e:/FlowdexTradeJournal/.env):
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   ```

### 4. AWS S3 (File Storage)

1. Sign up for [AWS](https://aws.amazon.com/)
2. Create S3 bucket and IAM user
3. Get credentials
4. Update [.env](file:///e:/FlowdexTradeJournal/.env):
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your_bucket_name
   ```

## 🚀 One-Command Setup

Use our interactive setup wizard:
```bash
npm run setup:wizard
```

This will guide you through configuring all services step by step.

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

## 🧪 Health Check

Run a quick health check to see what's configured:
```bash
npm run health:check
```

## 📚 Additional Resources

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions
- [HOW_TO_MAKE_IT_FULLY_FUNCTIONAL.md](HOW_TO_MAKE_IT_FULLY_FUNCTIONAL.md) - Complete configuration guide
- [STATUS.md](STATUS.md) - Current service status dashboard

## 🎉 Result

Once connected, FlowdeX will have:
- ✅ Real-time market data from TwelveData
- ✅ Secure database storage with PostgreSQL
- ✅ Payment processing with Stripe
- ✅ File storage with AWS S3
- ✅ Complete trading journal functionality
- ✅ Professional charting interface

The application will be fully functional at `http://localhost:5000`

## 🛠️ Troubleshooting

If you encounter issues:

1. **Database Connection Failed**:
   - Verify DATABASE_URL credentials
   - Ensure PostgreSQL is running
   - Check firewall settings

2. **API Key Errors**:
   - Verify API keys in [.env](file:///e:/FlowdexTradeJournal/.env)
   - Check service dashboards for key status

3. **Environment Variables Not Loading**:
   - Ensure no extra spaces in [.env](file:///e:/FlowdexTradeJournal/.env)
   - Restart the application after changes

4. **Services Not Loading**:
   - Run `npm run verify:setup` to check configuration
   - Check service-specific error messages