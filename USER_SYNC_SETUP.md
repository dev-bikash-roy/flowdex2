# User Sync Setup

This document explains how to set up automatic user synchronization between Supabase Auth and your custom users table.

## Problem

When users sign up through `supabase.auth.signUp()`, they are created in Supabase's internal authentication system, but they are not automatically added to your custom `users` table. This is why you're not seeing new users in your Supabase dashboard when viewing the `users` table.

## Solution

The solution involves two parts:

1. **Database Triggers**: Automatically sync new users from the auth system to your custom users table
2. **Manual Sync Script**: Sync existing users that were created before the trigger was set up

## Implementation Steps

### 1. Apply the Updated Schema

Run the updated `supabase_schema.sql` file in your Supabase SQL editor. This will:

- Create a function `handle_new_user()` that inserts new users into your custom users table
- Create a trigger `on_auth_user_created` that calls this function whenever a new user is created
- Drop existing policies first to avoid conflicts

### 2. Test the Setup

After applying the schema changes, try creating a new user through your signup form. The user should now appear in both:
- Supabase Auth dashboard
- Your custom `users` table

### 3. Sync Existing Users (Optional)

If you have existing users that were created before applying these changes, run the sync script:

```bash
npm run sync:users
```

This will sync all existing users from the auth system to your custom users table.

## How It Works

1. When a user signs up through `supabase.auth.signUp()`, they are created in Supabase's internal `auth.users` table
2. The trigger `on_auth_user_created` detects this new user
3. The trigger calls the function `handle_new_user()`
4. The function inserts a corresponding record into your custom `users` table with the user's ID, email, and metadata (first name, last name)

## Verification

You can verify that the sync is working by:

1. Creating a new user through your signup form
2. Checking the Supabase Table Editor for your `users` table
3. The new user should appear in the table

You can also run the test script:

```bash
npm run test:user-sync
```

This will show you both the auth users and custom users tables for comparison.

## Troubleshooting

If you encounter errors when running the SQL script:

1. **Policy already exists errors**: The updated script now drops existing policies first
2. **Permission errors**: Make sure you're running the script as a user with sufficient privileges
3. **Function already exists**: The script uses `CREATE OR REPLACE FUNCTION` to handle this

If you continue to have issues, you can manually drop the policies and triggers first:

```sql
-- Drop policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
-- (repeat for all other policies)

-- Drop trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop function
DROP FUNCTION IF EXISTS public.handle_new_user();
```

Then run the updated schema script again.