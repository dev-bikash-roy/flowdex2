# Supabase Database Setup for FlowdeX

This guide will help you configure the database connection for your FlowdeX application using Supabase.

## 🎯 Objective

Configure the DATABASE_URL in your [.env](file:///e:/flowdex2/flowdex2/.env) file to connect FlowdeX to your Supabase PostgreSQL database.

## 📋 Prerequisites

- Supabase project created
- Project URL: https://dcfavnetfqirooxhvqsy.supabase.co
- Service Role Key: Available in your [.env](file:///e:/flowdex2/flowdex2/.env) file

## 🔧 Step 1: Get Your Database Password

1. **Log in to your Supabase Dashboard**
   - Go to https://app.supabase.com/
   - Sign in with your credentials

2. **Navigate to Database Settings**
   - Select your "Flowdex" project
   - In the left sidebar, click on "Settings" (gear icon)
   - Click on "Database" under the Settings section

3. **Reset or Get Database Password**
   - Under the "Database" section, find "Reset Password"
   - Click "Reset Password" to generate a new database password
   - **Important**: Copy the new password immediately as it will only be shown once

## 🔧 Step 2: Update Your Environment Variables

1. **Open your [.env](file:///e:/flowdex2/flowdex2/.env) file**
   - Located in the root of your project directory

2. **Update the DATABASE_URL**
   - Find the line that starts with `DATABASE_URL=`
   - Replace `YOUR_ACTUAL_PASSWORD` with your actual database password
   - The final format should look like:
     ```
     DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.dcfavnetfqirooxhvqsy.supabase.co:5432/postgres
     ```

## 🧪 Step 3: Test the Connection

1. **Verify your configuration**:
   ```bash
   npm run verify:setup
   ```

2. **Expected output**:
   ```
   ✅ Database: Connected successfully
   ```

## 🚀 Step 4: Apply Database Schema

1. **Push the schema to your database**:
   ```bash
   npm run db:push
   ```

2. **This will create all necessary tables**:
   - users
   - trading_sessions
   - trades
   - journal_entries
   - sessions

## 🛠️ Troubleshooting

### Common Issues

1. **"getaddrinfo ENOTFOUND" Error**
   - **Cause**: Incorrect database password
   - **Solution**: Double-check your DATABASE_URL and ensure the password is correct

2. **"Password authentication failed" Error**
   - **Cause**: Wrong password in DATABASE_URL
   - **Solution**: Reset your database password in the Supabase dashboard and update your [.env](file:///e:/flowdex2/flowdex2/.env) file

3. **"Connection refused" Error**
   - **Cause**: Network or firewall issues
   - **Solution**: Ensure your network allows connections to Supabase

### Testing Database Connection Manually

You can test your database connection with this command:
```bash
npm run test:connection
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎉 Success!

Once your DATABASE_URL is correctly configured, your FlowdeX application will be able to:

- ✅ Create and manage trading sessions
- ✅ Store trades and journal entries
- ✅ Generate performance analytics
- ✅ Maintain user data securely

Your application is now ready for full functionality!