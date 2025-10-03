import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  'https://dcfavnetfqirooxhvqsy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmF2bmV0ZnFpcm9veGh2cXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Mjk3OTEsImV4cCI6MjA3NDUwNTc5MX0.CkuDMegvqToLrLtYsA9KBFeK-Rg_buvdvJ-HF2U5y_4'
);

async function testFullSupabase() {
  console.log('Testing full Supabase integration...');
  
  try {
    // Test authentication by signing up a test user
    console.log('Signing up test user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123',
    });
    
    if (authError) {
      console.log('Sign up error:', authError.message);
      // Try to sign in instead if user already exists
      console.log('Trying to sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123',
      });
      
      if (signInError) {
        console.log('Sign in error:', signInError.message);
        return;
      }
      
      console.log('Signed in successfully:', signInData);
    } else {
      console.log('Signed up successfully:', authData);
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log('Get user error:', userError.message);
      return;
    }
    
    console.log('Current user:', user);
    
    if (!user) {
      console.log('No user found');
      return;
    }
    
    // Test creating a session with the real user ID
    console.log('Creating test session with real user ID...');
    const testSession = {
      name: 'Full Test Session',
      starting_balance: '15000',
      current_balance: '15000',
      pair: 'GBPUSD',
      start_date: new Date().toISOString(),
      description: 'Full test session with real authentication',
      user_id: user.id, // Use the real user ID
      is_active: true,
    };
    
    const { data: createdSession, error: insertError } = await supabase
      .from('trading_sessions')
      .insert(testSession)
      .select()
      .single();
    
    if (insertError) {
      console.log('Insert error:', insertError.message);
      console.log('Error details:', insertError);
    } else {
      console.log('Session created successfully:', createdSession);
      
      // Test fetching sessions
      console.log('Fetching sessions...');
      const { data: sessions, error: fetchError } = await supabase
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
        const { error: deleteError } = await supabase
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
    
    // Sign out
    console.log('Signing out...');
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.log('Sign out error:', signOutError.message);
    } else {
      console.log('Signed out successfully');
    }
    
    console.log('Full Supabase test completed');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testFullSupabase();