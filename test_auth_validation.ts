import { config } from 'dotenv';
config(); // Load environment variables from .env file
import { createClient } from '@supabase/supabase-js';

// Test authentication validation fix
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing authentication validation fix...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthValidation() {
  try {
    console.log('Testing getUser with invalid token...');
    
    // Test with an invalid token
    const { data, error } = await supabase.auth.getUser('invalid-token');
    
    if (error) {
      console.log('getUser correctly rejected invalid token:', error.message);
    } else {
      console.log('Unexpected: getUser accepted invalid token');
    }
    
    console.log('Testing session state...');
    
    // Check current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('Current session exists');
    } else {
      console.log('No active session');
    }
    
    console.log('Authentication validation test completed');
    process.exit(0);
  } catch (error) {
    console.error('Authentication validation test failed:', error);
    process.exit(1);
  }
}

testAuthValidation();