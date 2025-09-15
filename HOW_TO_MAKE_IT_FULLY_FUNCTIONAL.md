# How to Make FlowdeX Fully Functional

This guide explains how to connect FlowdeX with all required services to make it a fully functional SaaS application.

## Prerequisites

Before you begin, ensure you have:
1. Node.js (v16 or higher) installed
2. A code editor (VS Code recommended)
3. Git installed

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd flowdex

# Install dependencies
npm install
```

## Step 2: Configure Environment Variables

1. Copy the [.env](file:///e:/FlowdexTradeJournal/.env) file from [.env.example](file:///e:/FlowdexTradeJournal/.env.example) (if it exists) or create a new one:
   ```bash
   cp .env.example .env
   ```

2. Update the following variables in [.env](file:///e:/FlowdexTradeJournal/.env):

### Database Configuration
```env
DATABASE_URL=postgresql://username:password@localhost:5432/flowdex
```

### TwelveData API (Market Data)
```env
TWELVEDATA_API_KEY=your_twelvedata_api_key_here
```

### Stripe (Payments)
```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

### AWS S3 (File Storage)
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=flowdex-files
```

## Step 3: Set Up Database

### Option A: Local PostgreSQL Installation

1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create the database:
   ```sql
   CREATE DATABASE flowdex;
   ```
3. Update the DATABASE_URL in [.env](file:///e:/FlowdexTradeJournal/.env) with your credentials

### Option B: Cloud Database (Recommended)

1. Sign up for a service like NeonDB, Supabase, or AWS RDS
2. Get your connection string
3. Update the DATABASE_URL in [.env](file:///e:/FlowdexTradeJournal/.env)

### Run Database Migration

```bash
npm run db:push
```

## Step 4: Test Connections

Run the connection test script to verify all services are properly configured:

```bash
npm run test:connection
```

This script will test:
- Database connection
- TwelveData API connection
- Stripe service availability
- AWS S3 service availability

## Step 5: Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Step 6: Verify Functionality

### Test Database Operations
1. Navigate to the application in your browser
2. Create a trading session
3. Execute some trades
4. Verify data is saved to the database

### Test TwelveData Integration
1. Open the Backtest page
2. Select a trading pair and timeframe
3. Verify chart data loads correctly

### Test Subscription Management
1. Navigate to the subscription page (when implemented)
2. View available plans
3. Create a subscription (test mode)

### Test File Uploads
1. Use the file upload API endpoints
2. Generate presigned URLs
3. Upload and download files from S3

## Services Overview

### Database (PostgreSQL)
- **Purpose**: Store user data, trading sessions, trades, and journal entries
- **Technology**: PostgreSQL with Drizzle ORM
- **Files**: [db.ts](file:///e:/FlowdexTradeJournal/server/db.ts), [schema.ts](file:///e:/FlowdexTradeJournal/shared/schema.ts), [storage.ts](file:///e:/FlowdexTradeJournal/server/storage.ts)

### TwelveData API
- **Purpose**: Provide market data for charts and analysis
- **Technology**: TwelveData REST API
- **Files**: [twelveDataService.ts](file:///e:/FlowdexTradeJournal/server/services/twelveDataService.ts)
- **Endpoints**: `/api/chart-data`, `/api/price`

### Stripe
- **Purpose**: Handle subscription payments
- **Technology**: Stripe API
- **Files**: [stripeService.ts](file:///e:/FlowdexTradeJournal/server/services/stripeService.ts)
- **Endpoints**: `/api/subscription/*`

### AWS S3
- **Purpose**: Store user files (screenshots, documents)
- **Technology**: AWS S3 with presigned URLs
- **Files**: [s3Service.ts](file:///e:/FlowdexTradeJournal/server/services/s3Service.ts)
- **Endpoints**: `/api/file-upload-url`, `/api/file-download-url`

## Troubleshooting

### Database Connection Issues
1. Verify your DATABASE_URL is correct
2. Ensure PostgreSQL is running
3. Check firewall settings if using a remote database
4. Verify database credentials

### API Connection Issues
1. Verify API keys are correct and active
2. Check service status pages for outages
3. Ensure your account has necessary permissions

### Environment Variables
1. Make sure all required variables are set
2. Ensure there are no extra spaces or quotes
3. Restart the application after changing environment variables

## Security Considerations

1. Never commit actual API keys to version control
2. Use different keys for development and production
3. Rotate API keys regularly
4. Restrict permissions on AWS credentials to only what's needed
5. Use HTTPS in production

## Production Deployment

When deploying to production:

1. Update environment variables with production values
2. Change `NODE_ENV` to `production`
3. Use production database connection
4. Use production API keys for all services
5. Set strong session secrets
6. Configure proper SSL/HTTPS
7. Set up monitoring and logging

## Next Steps

To complete the application:

1. Implement frontend components for:
   - Subscription management
   - File upload UI
   - Payment forms

2. Add comprehensive testing:
   - Unit tests for services
   - Integration tests for API endpoints
   - End-to-end tests for user flows

3. Optimize performance:
   - Add caching layers
   - Implement database indexing
   - Optimize API response times

4. Enhance security:
   - Add rate limiting
   - Implement input validation
   - Add security headers

With these steps completed, FlowdeX will be a fully functional SaaS trading journal and backtesting platform ready for production use.