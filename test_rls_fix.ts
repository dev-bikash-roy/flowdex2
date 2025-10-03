import { createClient } from '@supabase/supabase-js';

// Create a client with service role key for admin operations
const supabaseAdmin = createClient(
  'https://dcfavnetfqirooxhvqsy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmF2bmV0ZnFpcm9veGh2cXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkyOTc5MSwiZXhwIjoyMDc0NTA1NzkxfQ.-ygKxfWNdhSll-zx0OWOfBep6jQn2GIAWkcKsSTqDic'
);

// Create a client with anon key for user operations
const supabaseAnon = createClient(
  'https://dcfavnetfqirooxhvqsy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmF2bmV0ZnFpcm9veGh2cXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Mjk3OTEsImV4cCI6MjA3NDUwNTc5MX0.CkuDMegvqToLrLtYsA9KBFeK-Rg_buvdvJ-HF2U5y_4'
);

async function testRLSFix() {
  console.log('Testing RLS policy fix...');
  
  try {
    // First, let's check the current RLS policies
    console.log('Checking current RLS policies...');
    
    // Sign up a test user with anon client
    console.log('Signing up test user...');
    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email: 'rls_test@example.com',
      password: 'testpassword123',
    });
    
    if (signUpError) {
      console.log('Sign up error:', signUpError.message);
      return;
    }
    
    console.log('Signed up user:', signUpData);
    
    // Sign in the user
    console.log('Signing in test user...');
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: 'rls_test@example.com',
      password: 'testpassword123',
    });
    
    if (signInError) {
      console.log('Sign in error:', signInError.message);
      return;
    }
    
    console.log('Signed in user:', signInData);
    
    // Get the user ID
    const { data: { user } } = await supabaseAnon.auth.getUser();
    console.log('Current user ID:', user?.id);
    
    if (!user?.id) {
      console.log('No user ID found');
      return;
    }
    
    // Test creating a session with the current user
    console.log('Testing session creation...');
    const testSession = {
      name: 'RLS Test Session',
      starting_balance: '20000',
      current_balance: '20000',
      pair: 'EURUSD',
      start_date: new Date().toISOString(),
      description: 'RLS test session',
      user_id: user.id, // Explicitly set user_id
      is_active: true,
    };
    
    const { data: createdSession, error: insertError } = await supabaseAnon
      .from('trading_sessions')
      .insert(testSession)
      .select()
      .single();
    
    if (insertError) {
      console.log('Insert error:', insertError.message);
      console.log('Error code:', insertError.code);
      console.log('Error details:', insertError);
      
      // Try with admin client to see if it works
      console.log('Trying with admin client...');
      const { data: adminCreatedSession, error: adminInsertError } = await supabaseAdmin
        .from('trading_sessions')
        .insert(testSession)
        .select()
        .single();
      
      if (adminInsertError) {
        console.log('Admin insert error:', adminInsertError.message);
      } else {
        console.log('Admin insert successful:', adminCreatedSession);
        
        // Clean up
        if (adminCreatedSession) {
          await supabaseAdmin
            .from('trading_sessions')
            .delete()
            .eq('id', adminCreatedSession.id);
        }
      }
    } else {
      console.log('Session created successfully:', createdSession);
      
      // Clean up
      if (createdSession) {
        await supabaseAnon
          .from('trading_sessions')
          .delete()
          .eq('id', createdSession.id);
        console.log('Test session cleaned up');
      }
    }
    
    // Sign out
    await supabaseAnon.auth.signOut();
    console.log('Signed out');
    
    // Clean up test user (admin only)
    console.log('Test completed');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRLSFix();