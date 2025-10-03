# Supabase Authentication Setup Guide

This guide explains how to properly configure Supabase authentication for FlowdeX.

## Prerequisites

1. A Supabase account
2. A Supabase project (you already have one configured)
3. Access to your Supabase project dashboard

## Configuration Steps

### 1. Get Your Supabase Service Role Key

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your FlowdeX project
3. Navigate to **Settings** > **API**
4. Scroll down to the **Service Role** section
5. Copy the service role key (it starts with `eyJhbGci...`)

### 2. Update Your Environment Variables

Open your `.env` file and update the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://dcfavnetfqirooxhvqsy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmF2bmV0ZnFpcm9veGh2cXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Mjk3OTEsImV4cCI6MjA3NDUwNTc5MX0.CkuDMegvqToLrLtYsA9KBFeK-Rg_buvdvJ-HF2U5y_4
NEXT_PUBLIC_SUPABASE_URL=https://dcfavnetfqirooxhvqsy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_8Of1sSwiY3Gj8WXb0WedSw_KiBwcBQQ
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
AUTH_MODE=supabase

# Session Secret (for local auth if needed)
SESSION_SECRET=flowdex-session-secret-key-change-in-production
```

Replace `your_actual_service_role_key_here` with the service role key you copied from the Supabase dashboard.

### 3. Enable Email Authentication in Supabase

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Email** in the list of providers
3. Toggle it to **Enabled**
4. Save your changes

### 4. Test the Authentication

Start your development server:

```bash
npm run dev
```

Then try to:
1. Sign up for a new account
2. Log in with your credentials
3. Access protected routes

### 5. Troubleshooting

#### Common Issues

1. **Invalid API key error**: Make sure you're using the service role key, not the anon key
2. **CORS errors**: Ensure your domain is added to the Supabase URL configuration
3. **Signup successful but login failed**: Check that the session secret is properly configured
4. **Logout shows success but user remains authenticated**: The authentication validation has been improved to properly check token validity and clear stale sessions. Both the backend middleware and frontend components now properly handle session state.
5. **Database query errors**: Fixed Drizzle ORM query chaining issues in the storage implementation.

#### Testing Authentication

You can test the authentication by running:

```bash
npm run test:supabase
```

This will verify that your Supabase connection is working correctly.

## How It Works

The FlowdeX application now supports Supabase authentication through the following flow:

1. **Signup**: Creates a user in Supabase Auth and also adds them to the `users` table
2. **Login**: Authenticates the user with Supabase Auth and sets a session
3. **Session Management**: Uses Passport.js to manage user sessions
4. **Protected Routes**: Uses the `isAuthenticated` middleware to protect API routes

## Security Considerations

1. **Service Role Key**: Never expose your service role key in client-side code
2. **Session Secret**: Change the session secret in production
3. **Environment Variables**: Never commit your `.env` file to version control

## Switching Authentication Modes

You can switch between authentication modes by changing the `AUTH_MODE` environment variable:

- `AUTH_MODE=supabase` - Use Supabase authentication (recommended)
- `AUTH_MODE=local` - Use local authentication with database storage
- `AUTH_MODE=replit` - Use Replit authentication (for Replit deployments)

If `AUTH_MODE` is not set, the application will default to local authentication in development and Replit authentication in production.