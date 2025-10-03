import { config } from 'dotenv';
config(); // Load environment variables from .env file
import { createClient } from '@supabase/supabase-js';

// Test API session creation through the API route
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing API session creation through API route...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testApiSessionCreation() {
  try {
    // First, let's get a user and sign in to get a session token
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);
    
    if (userError) {
      console.error('Error fetching users:', userError.message);
      process.exit(1);
    }
    
    if (users.length === 0) {
      console.log('No users found in database');
      process.exit(1);
    }
    
    const userId = users[0].id;
    const userEmail = users[0].email;
    console.log('Using user ID:', userId);
    console.log('User email:', userEmail);
    
    // Sign in the user to get a session token
    // Note: You'll need to know the user's password for this to work
    // For testing purposes, you might want to create a test user with a known password
    
    // For now, let's just test the data format that would be sent to the API
    const sessionData = {
      name: "Test API Session",
      startingBalance: "10000",
      currentBalance: "10000", // Include currentBalance explicitly
      pair: "EURUSD",
      startDate: new Date().toISOString(),
      description: "Test session from API"
    };
    
    console.log('Session data to send:', sessionData);
    
    console.log('To test the actual API endpoint, you would need to:');
    console.log('1. Sign in to get a valid session token');
    console.log('2. Make a POST request to http://localhost:5000/api/trading-sessions');
    console.log('3. Include the Authorization header with the Bearer token');
    console.log('4. Include the session data in the request body');
    
    process.exit(0);
  } catch (error) {
    console.error('API session creation test failed:', error);
    process.exit(1);
  }
}

testApiSessionCreation();