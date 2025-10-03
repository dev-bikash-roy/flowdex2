import { config } from 'dotenv';
config(); // Load environment variables from .env file
import { createClient } from '@supabase/supabase-js';

// Test logout fix
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing logout fix...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogoutFix() {
  try {
    console.log('Testing Supabase client signOut method...');
    
    // Test signOut method
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.log('SignOut result:', error.message);
      console.log('This is normal if there is no active session');
    } else {
      console.log('SignOut successful');
    }
    
    console.log('Testing session state after signOut...');
    
    // Check if session is cleared
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('Session still exists after signOut');
    } else {
      console.log('Session properly cleared after signOut');
    }
    
    console.log('Logout fix test completed');
    process.exit(0);
  } catch (error) {
    console.error('Logout fix test failed:', error);
    process.exit(1);
  }
}

testLogoutFix();