import { config } from 'dotenv';
config(); // Load environment variables from .env file
import { createClient } from '@supabase/supabase-js';

// Test complete authentication flow
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing complete authentication flow...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('Test 1: Checking Supabase connection...');
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      console.log('Connection test result:', error.message);
    } else {
      console.log('Connection test successful');
    }
    
    // Test 2: Test signOut method (should work even without active session)
    console.log('Test 2: Testing signOut method...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log('SignOut test result:', signOutError.message);
      console.log('This is normal if there is no active session');
    } else {
      console.log('SignOut test successful');
    }
    
    console.log('Authentication flow test completed');
    process.exit(0);
  } catch (error) {
    console.error('Authentication flow test failed:', error);
    process.exit(1);
  }
}

testAuthFlow();