import { createClient } from '@supabase/supabase-js';

// Create a client with service role key for admin operations
const supabase = createClient(
  'https://dcfavnetfqirooxhvqsy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmF2bmV0ZnFpcm9veGh2cXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkyOTc5MSwiZXhwIjoyMDc0NTA1NzkxfQ.-ygKxfWNdhSll-zx0OWOfBep6jQn2GIAWkcKsSTqDic'
);

async function fixRLSPolicies() {
  console.log('Fixing RLS policies...');
  
  try {
    // Note: RLS policy changes need to be done through the Supabase SQL editor
    // This script will output the SQL commands you need to run
    
    console.log('Please execute the following SQL commands in your Supabase SQL editor:\n');
    
    // Drop existing policies
    console.log('-- Drop existing policies --');
    console.log('DROP POLICY IF EXISTS "Users can view their own data" ON users;');
    console.log('DROP POLICY IF EXISTS "Users can insert their own data" ON users;');
    console.log('DROP POLICY IF EXISTS "Users can update their own data" ON users;');
    console.log('DROP POLICY IF EXISTS "Users can view their own trading sessions" ON trading_sessions;');
    console.log('DROP POLICY IF EXISTS "Users can insert their own trading sessions" ON trading_sessions;');
    console.log('DROP POLICY IF EXISTS "Users can update their own trading sessions" ON trading_sessions;');
    console.log('DROP POLICY IF EXISTS "Users can delete their own trading sessions" ON trading_sessions;');
    console.log('DROP POLICY IF EXISTS "Users can view their own trades" ON trades;');
    console.log('DROP POLICY IF EXISTS "Users can insert their own trades" ON trades;');
    console.log('DROP POLICY IF EXISTS "Users can update their own trades" ON trades;');
    console.log('DROP POLICY IF EXISTS "Users can delete their own trades" ON trades;');
    console.log('DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;');
    console.log('DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;');
    console.log('DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;');
    console.log('DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;');
    console.log('');
    
    // Create new policies with correct RLS
    console.log('-- Create new policies --');
    
    // Users table policies
    console.log('-- Users table policies --');
    console.log('CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (id = auth.uid());');
    console.log('CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (auth.role() = \'authenticated\');');
    console.log('CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (id = auth.uid());');
    console.log('');
    
    // Trading sessions policies
    console.log('-- Trading sessions table policies --');
    console.log('CREATE POLICY "Users can view their own trading sessions" ON trading_sessions FOR SELECT USING (user_id = auth.uid());');
    console.log('CREATE POLICY "Users can insert trading sessions" ON trading_sessions FOR INSERT WITH CHECK (auth.role() = \'authenticated\');');
    console.log('CREATE POLICY "Users can update their own trading sessions" ON trading_sessions FOR UPDATE USING (user_id = auth.uid());');
    console.log('CREATE POLICY "Users can delete their own trading sessions" ON trading_sessions FOR DELETE USING (user_id = auth.uid());');
    console.log('');
    
    // Trades policies
    console.log('-- Trades table policies --');
    console.log('CREATE POLICY "Users can view their own trades" ON trades FOR SELECT USING (user_id = auth.uid());');
    console.log('CREATE POLICY "Users can insert trades" ON trades FOR INSERT WITH CHECK (auth.role() = \'authenticated\');');
    console.log('CREATE POLICY "Users can update their own trades" ON trades FOR UPDATE USING (user_id = auth.uid());');
    console.log('CREATE POLICY "Users can delete their own trades" ON trades FOR DELETE USING (user_id = auth.uid());');
    console.log('');
    
    // Journal entries policies
    console.log('-- Journal entries table policies --');
    console.log('CREATE POLICY "Users can view their own journal entries" ON journal_entries FOR SELECT USING (user_id = auth.uid());');
    console.log('CREATE POLICY "Users can insert journal entries" ON journal_entries FOR INSERT WITH CHECK (auth.role() = \'authenticated\');');
    console.log('CREATE POLICY "Users can update their own journal entries" ON journal_entries FOR UPDATE USING (user_id = auth.uid());');
    console.log('CREATE POLICY "Users can delete their own journal entries" ON journal_entries FOR DELETE USING (user_id = auth.uid());');
    console.log('');
    
    console.log('After executing these commands, your RLS policies will be correctly configured.');
    console.log('The key change is using "auth.role() = \'authenticated\'" for INSERT operations instead of "user_id = auth.uid()".');
  } catch (error) {
    console.error('Failed to generate RLS policy fix:', error);
  }
}

fixRLSPolicies();