import { supabase } from './client/src/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const testSupabase = createClient(
  'https://dcfavnetfqirooxhvqsy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmF2bmV0ZnFpcm9veGh2cXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Mjk3OTEsImV4cCI6MjA3NDUwNTc5MX0.CkuDMegvqToLrLtYsA9KBFeK-Rg_buvdvJ-HF2U5y_4'
);

async function testSupabaseSessions() {
  console.log('Testing Supabase sessions...');
  
  try {
    // Test authentication
    const { data: { session }, error: authError } = await testSupabase.auth.getSession();
    if (authError) {
      console.log('Authentication error:', authError.message);
    } else {
      console.log('Authentication successful');
    }
    
    // Test creating a session
    console.log('Creating test session...');
    const testSession = {
      name: 'Test Session',
      starting_balance: '10000',
      current_balance: '10000',
      pair: 'EURUSD',
      start_date: new Date().toISOString(),
      description: 'Test session for debugging',
      user_id: 'test-user-id', // This would normally be the actual user ID
      is_active: true,
    };
    
    const { data: createdSession, error: insertError } = await testSupabase
      .from('trading_sessions')
      .insert(testSession)
      .select()
      .single();
    
    if (insertError) {
      console.log('Insert error:', insertError.message);
    } else {
      console.log('Session created successfully:', createdSession);
      
      // Test fetching sessions
      console.log('Fetching sessions...');
      const { data: sessions, error: fetchError } = await testSupabase
        .from('trading_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.log('Fetch error:', fetchError.message);
      } else {
        console.log('Sessions fetched successfully:', sessions);
      }
      
      // Clean up - delete the test session
      if (createdSession) {
        console.log('Deleting test session...');
        const { error: deleteError } = await testSupabase
          .from('trading_sessions')
          .delete()
          .eq('id', createdSession.id);
        
        if (deleteError) {
          console.log('Delete error:', deleteError.message);
        } else {
          console.log('Test session deleted successfully');
        }
      }
    }
    
    console.log('Supabase sessions test completed');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSupabaseSessions();