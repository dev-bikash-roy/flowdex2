# Supabase Setup Guide for FlowdeX

This guide will help you set up Supabase for your FlowdeX application using the provided credentials.

## Project Information

- **Project Name**: Flowdex
- **Project URL**: https://dcfavnetfqirooxhvqsy.supabase.co
- **API Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmF2bmV0ZnFpcm9veGh2cXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Mjk3OTEsImV4cCI6MjA3NDUwNTc5MX0.CkuDMegvqToLrLtYsA9KBFeK-Rg_buvdvJ-HF2U5y_4

## Setting up the Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase_schema.sql` into the editor
4. Run the SQL script to create all tables and set up Row Level Security

## Authentication Setup

The authentication is already configured in your Supabase project. The FlowdeX frontend uses the Supabase JavaScript client for authentication.

## Environment Variables

Your `.env` file has been configured with the correct Supabase credentials. Make sure this file is in the root of your project.

## Row Level Security (RLS)

The SQL script includes Row Level Security policies that ensure users can only access their own data. These policies are automatically enforced by Supabase.

## Testing the Setup

1. Start your development server:
   ```
   npm run dev
   ```

2. Navigate to the signup page and create a new account
3. Log in with your new account
4. Test creating trading sessions, trades, and journal entries

## Real-time Subscriptions

Supabase provides real-time capabilities that can be used to automatically update the UI when data changes. To implement real-time features:

```typescript
import { supabase } from '@/lib/supabaseClient'

// Subscribe to changes in trading sessions
const subscription = supabase
  .channel('trading-sessions-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'trading_sessions',
    },
    (payload) => {
      console.log('New trading session:', payload.new)
      // Update your UI here
    }
  )
  .subscribe()
```

## File Storage

To use Supabase Storage for file uploads (like trading screenshots):

1. Create a bucket in the Supabase Storage section
2. Set appropriate access policies
3. Use the Supabase client to upload files:

```typescript
const file = event.target.files[0]
const fileExt = file.name.split('.').pop()
const fileName = `${Math.random()}.${fileExt}`
const filePath = `${fileName}`

let { error: uploadError } = await supabase.storage
  .from('screenshots')
  .upload(filePath, file)
```

## Next Steps

1. Test all authentication flows (signup, login, logout)
2. Test data creation and retrieval
3. Implement real-time features where needed
4. Set up storage buckets for file uploads
5. Configure additional authentication providers if needed (Google, GitHub, etc.)