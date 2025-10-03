import { supabase } from './client/src/lib/supabaseClient';

async function syncUsers() {
  console.log('Syncing users from auth system to custom users table...');
  
  try {
    // Get all users from auth system
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
      return;
    }
    
    console.log(`Found ${authUsers.users.length} users in auth system`);
    
    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // For each user, check if they exist in custom users table
    for (const authUser of authUsers.users) {
      try {
        // Check if user already exists in custom table
        const { data: existingUser, error: existingUserError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authUser.id)
          .single();
        
        if (existingUserError && existingUserError.code !== 'PGRST116') {
          console.error(`Error checking user ${authUser.email}:`, existingUserError);
          errorCount++;
          continue;
        }
        
        if (!existingUser) {
          // User doesn't exist in custom table, create them
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email,
              first_name: authUser.user_metadata?.first_name || '',
              last_name: authUser.user_metadata?.last_name || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error(`Error inserting user ${authUser.email}:`, insertError);
            errorCount++;
          } else {
            console.log(`Successfully synced user ${authUser.email}`);
            syncedCount++;
          }
        } else {
          console.log(`User ${authUser.email} already exists in custom table`);
          skippedCount++;
        }
      } catch (userError) {
        console.error(`Unexpected error processing user ${authUser.email}:`, userError);
        errorCount++;
      }
    }
    
    console.log(`\nUser sync completed:`);
    console.log(`- ${syncedCount} users synced`);
    console.log(`- ${skippedCount} users already existed`);
    console.log(`- ${errorCount} errors occurred`);
  } catch (error) {
    console.error('Error during user sync:', error);
  }
}

syncUsers();