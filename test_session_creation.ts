import { config } from 'dotenv';
config(); // Load environment variables from .env file
import { createClient } from '@supabase/supabase-js';

// Test session creation
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing session creation...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSessionCreation() {
  try {
    // First, let's check if we can connect to the database
    console.log('Testing database connection...');
    const { data, error } = await supabase
      .from('trading_sessions')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection error:', error.message);
      process.exit(1);
    }
    
    console.log('Database connection successful');
    
    // Test creating a session (you'll need to replace the user_id with a valid one)
    console.log('Testing session creation...');
    
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
    
    // Create a test session
    const sessionData = {
      name: 'Test Session',
      starting_balance: '10000',
      current_balance: '10000',
      pair: 'EURUSD',
      start_date: new Date().toISOString(),
      description: 'Test session for debugging',
      user_id: userId,
      is_active: true,
    };
    
    console.log('Creating session with data:', sessionData);
    
    const { data: session, error: sessionError } = await supabase
      .from('trading_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (sessionError) {
      console.error('Session creation error:', sessionError.message);
      console.error('Error details:', sessionError);
      process.exit(1);
    }
    
    console.log('Session created successfully:', session);
    
    // Clean up - delete the test session
    const { error: deleteError } = await supabase
      .from('trading_sessions')
      .delete()
      .eq('id', session.id);
    
    if (deleteError) {
      console.error('Error deleting test session:', deleteError.message);
    } else {
      console.log('Test session deleted successfully');
    }
    
    console.log('Session creation test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Session creation test failed:', error);
    process.exit(1);
  }
}

testSessionCreation();