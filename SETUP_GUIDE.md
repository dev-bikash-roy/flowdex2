# FlowdeX Setup Guide

This guide will help you connect your FlowdeX application with all required services to make it fully functional.

## Prerequisites

1. Node.js (version 16 or higher)
2. PostgreSQL database
3. Accounts for external services (TwelveData, Stripe, AWS)

## 1. Database Setup

### Option A: Local PostgreSQL Installation

1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. During installation, set a password for the default `postgres` user
3. After installation, open pgAdmin or use the command line to create a new database:
   ```sql
   CREATE DATABASE flowdex;
   ```
4. If you want to create a dedicated user (optional):
   ```sql
   CREATE USER flowdex_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE flowdex TO flowdex_user;
   ```

### Option B: Cloud Database (Recommended)

1. Sign up for a service like:
   - [NeonDB](https://neon.tech/)
   - [Supabase](https://supabase.com/)
   - [Railway](https://railway.app/)
   - AWS RDS

2. Get your connection string

### Configure Database Connection

1. Open the [.env](file:///e:/FlowdexTradeJournal/.env) file
2. Update the [DATABASE_URL](file:///e:/FlowdexTradeJournal/.env#L5-L5) with your actual connection string:
   
   If you're using the default PostgreSQL installation with the `postgres` user:
   ```
   DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/flowdex
   ```
   
   If you created a dedicated user:
   ```
   DATABASE_URL=postgresql://flowdex_user:your_password@localhost:5432/flowdex
   ```

3. Push the schema to your database:
   ```bash
   npm run db:push
   ```

## 2. TwelveData API Setup (Market Data)

1. Sign up at [TwelveData](https://twelvedata.com/)
2. Get your API key from the dashboard
3. Update the [TWELVEDATA_API_KEY](file:///e:/FlowdexTradeJournal/.env#L10-L10) in [.env](file:///e:/FlowdexTradeJournal/.env):
   ```
   TWELVEDATA_API_KEY=your_actual_api_key_here
   ```

## 3. Stripe Setup (Payments)

1. Sign up at [Stripe](https://stripe.com/)
2. Get your API keys from the dashboard:
   - Publishable key (for frontend)
   - Secret key (for backend)
3. Update the Stripe variables in [.env](file:///e:/FlowdexTradeJournal/.env):
   ```
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   ```

## 4. AWS S3 Setup (File Storage)

1. Sign up for AWS if you haven't already
2. Create an S3 bucket:
   - Go to S3 service in AWS console
   - Click "Create bucket"
   - Give it a unique name (e.g., `flowdex-files-12345`)
   - Keep default settings or adjust as needed
   - Click "Create bucket"

3. Create AWS credentials:
   - Go to IAM service
   - Create a new policy with S3 permissions for your bucket
   - Create a new user with programmatic access
   - Attach the S3 policy to the user
   - Save the Access Key ID and Secret Access Key

4. Update the AWS variables in [.env](file:///e:/FlowdexTradeJournal/.env):
   ```
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your_bucket_name
   ```

## 5. Testing the Connections

Run the connection test script to verify all services are properly configured:

```bash
npm run test:connection
```

## 6. Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 7. Production Deployment

When deploying to production:

1. Update environment variables with production values
2. Change `NODE_ENV` to `production`
3. Use production database connection
4. Use production API keys for all services
5. Set strong session secrets

## Troubleshooting

### Database Connection Issues

1. Verify your connection string is correct
2. Ensure your database is running and accessible
3. Check firewall settings if using a remote database

### API Connection Issues

1. Verify API keys are correct and active
2. Check service status pages for outages
3. Ensure your account has the necessary permissions

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