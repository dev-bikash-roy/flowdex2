import { config } from 'dotenv';
config(); // Load environment variables from .env file

console.log('Environment variables loaded:');
console.log('AUTH_MODE:', process.env.AUTH_MODE);
console.log('VITE_SUPABASE_URL exists:', !!process.env.VITE_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

if (process.env.AUTH_MODE === 'supabase') {
  console.log('Supabase authentication mode is enabled');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_service_role_key_here') {
    console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not properly configured!');
    console.error('Please update your .env file with the actual service role key from your Supabase dashboard.');
    process.exit(1);
  } else {
    console.log('Service role key is properly configured');
  }
} else {
  console.log('Authentication mode:', process.env.AUTH_MODE || 'default (local)');
}

console.log('Setup verification complete');