import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config(); // Load environment variables from .env file

// Test Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getDbConnectionInfo() {
  try {
    // Try to get database connection info
    console.log('Attempting to get database connection information...');
    
    // Test database connection by querying a simple table
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      process.exit(1);
    }

    console.log('Supabase connection successful!');
    console.log('Sample data:', data);
    
    // Try to get project information
    console.log('\nProject information:');
    console.log('- Project URL:', supabaseUrl);
    console.log('- Project Reference:', supabaseUrl.replace('https://', '').replace('.supabase.co', ''));
    
    process.exit(0);
  } catch (error) {
    console.error('Connection test failed:', error);
    process.exit(1);
  }
}

getDbConnectionInfo();