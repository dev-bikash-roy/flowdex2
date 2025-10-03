# Supabase Troubleshooting Guide

This guide will help you troubleshoot common issues with your Supabase integration.

## Common Issues and Solutions

### 1. Data Not Appearing in Supabase Tables

**Problem**: Sessions or other data created in the application don't appear in Supabase tables.

**Possible Causes and Solutions**:

#### A. Row Level Security (RLS) Policies
The most common cause is incorrect RLS policies. The original policies required:
```sql
FOR INSERT WITH CHECK (user_id = auth.uid());
```

This is problematic because during an insert, `auth.uid()` refers to the currently authenticated user, but you're explicitly setting the `user_id`. 

**Solution**: Update your RLS policies to:
```sql
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### B. Authentication Issues
Make sure the user is properly authenticated before creating data.

1. Check that the user is logged in:
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

2. Verify the user ID is valid:
```javascript
if (!user || !user.id) {
  console.error('User not authenticated or invalid user ID');
  return;
}
```

### 2. Permission Denied Errors

**Problem**: "new row violates row-level security policy" errors.

**Solution**: 
1. Go to your Supabase dashboard
2. Navigate to Table Editor
3. For each table (users, trading_sessions, trades, journal_entries):
   - Click on the table name
   - Go to "RLS" tab
   - Update the INSERT policies to use `auth.role() = 'authenticated'` instead of `user_id = auth.uid()`

### 3. Testing Your Setup

#### Run the Full Test Script
```bash
npm run test:full
```

#### Manual Verification Steps
1. Log in to your Supabase dashboard
2. Go to Table Editor
3. Check each table to ensure RLS is enabled
4. Verify the policies are correctly set

### 4. Updating RLS Policies Manually

If you need to update the policies manually in the Supabase dashboard:

1. Go to Table Editor
2. Select the `trading_sessions` table
3. Click on "RLS" tab
4. Edit the "Users can insert trading sessions" policy
5. Change the CHECK condition from:
   ```
   user_id = auth.uid()
   ```
   to:
   ```
   auth.role() = 'authenticated'
   ```

6. Repeat for other tables:
   - `trades` table: Update "Users can insert trades" policy
   - `journal_entries` table: Update "Users can insert journal entries" policy
   - `users` table: Update "Users can insert their own data" policy

### 5. Debugging Steps

#### Check Browser Console
1. Open your application in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Look for any error messages when creating sessions

#### Add Logging to Your Code
Add console.log statements to see what's happening:

```javascript
console.log('User:', user);
console.log('User ID:', user?.id);
console.log('Session data:', sessionData);

const { data, error } = await supabase
  .from('trading_sessions')
  .insert(sessionData)
  .select()
  .single();

if (error) {
  console.error('Supabase error:', error);
  console.error('Error details:', error.message);
  console.error('Error code:', error.code);
}
```

### 6. Verification Checklist

Before testing again:

- [ ] Updated RLS policies in Supabase dashboard
- [ ] User is properly authenticated
- [ ] User ID is valid UUID
- [ ] Session data contains all required fields
- [ ] No errors in browser console
- [ ] Supabase client is properly configured with correct URL and key

### 7. Common Error Messages and Solutions

#### "new row violates row-level security policy"
**Solution**: Update RLS INSERT policies as described above.

#### "Invalid input syntax for type uuid"
**Solution**: Ensure the user ID is a valid UUID string.

#### "Permission denied for table"
**Solution**: Check that RLS is enabled and policies are correctly configured.

### 8. Additional Resources

- [Supabase Row Level Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client Documentation](https://supabase.com/docs/reference/javascript)
- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)

If you continue to experience issues after following these steps, please check the browser console for specific error messages and consult the Supabase documentation for more detailed troubleshooting.