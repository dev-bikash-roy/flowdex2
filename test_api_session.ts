import { config } from 'dotenv';
config(); // Load environment variables from .env file
import express from 'express';
import { createClient } from '@supabase/supabase-js';

// Test API session creation
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing API session creation...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testApiSessionCreation() {
  try {
    // First, let's get a user ID
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
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
    console.log('Using user ID:', userId);
    
    // Test the session data format that the frontend sends
    const sessionData = {
      name: "Test API Session",
      startingBalance: "10000",
      pair: "EURUSD",
      startDate: new Date().toISOString().split('T')[0],
      description: "Test session from API"
    };
    
    console.log('Session data to send:', sessionData);
    
    console.log('API session creation test completed');
    console.log('You can now test the actual API endpoint with a tool like curl or Postman');
    console.log('Make sure the server is running and send a POST request to /api/trading-sessions');
    console.log('with the above data and proper authentication headers');
    
    process.exit(0);
  } catch (error) {
    console.error('API session creation test failed:', error);
    process.exit(1);
  }
}

testApiSessionCreation();