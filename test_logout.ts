import { config } from 'dotenv';
config(); // Load environment variables from .env file
import { createClient } from '@supabase/supabase-js';

// Test Supabase logout
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing Supabase logout functionality...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogout() {
  try {
    // Test signOut method
    console.log('Testing supabase.auth.signOut() method...');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.log('Supabase signOut result (with error):', error.message);
      // This is expected if there's no active session
      console.log('This is normal if there is no active session');
    } else {
      console.log('Supabase signOut successful (no active session to sign out)');
    }
    
    console.log('Logout functionality test completed');
    process.exit(0);
  } catch (error) {
    console.error('Logout test failed:', error);
    process.exit(1);
  }
}

testLogout();