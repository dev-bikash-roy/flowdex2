import { supabase } from './client/src/lib/supabaseClient';

async function testUserSync() {
  console.log('Testing user sync functionality...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return;
    }
    
    if (!user) {
      console.log('No user is currently logged in');
      return;
    }
    
    console.log('Current user:', user);
    
    // Check if user exists in custom users table
    const { data: customUser, error: customUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (customUserError && customUserError.code !== 'PGRST116') {
      console.error('Error fetching custom user:', customUserError);
    } else if (customUserError && customUserError.code === 'PGRST116') {
      console.log('User not found in custom users table');
    } else {
      console.log('Custom user record:', customUser);
    }
    
    // List all users in auth system
    console.log('\n--- All Auth Users ---');
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error('Error listing auth users:', authUsersError);
    } else {
      console.log(`Found ${authUsers.users.length} users in auth system:`);
      authUsers.users.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email} (ID: ${u.id})`);
      });
    }
    
    // List all users in custom table
    console.log('\n--- All Custom Users ---');
    const { data: customUsers, error: customUsersError } = await supabase
      .from('users')
      .select('*');
    
    if (customUsersError) {
      console.error('Error listing custom users:', customUsersError);
    } else {
      console.log(`Found ${customUsers.length} users in custom table:`);
      customUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email} (ID: ${u.id})`);
      });
    }
  } catch (error) {
    console.error('Unexpected error during user sync test:', error);
  }
}

testUserSync();