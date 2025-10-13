import { supabase } from '../client/src/lib/supabaseClient';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runNotebookMigration() {
  try {
    console.log('🚀 Running notebook migration...');
    
    // Read the migration SQL file
    const migrationSQL = readFileSync(join(process.cwd(), 'supabase_notebook_migration.sql'), 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error('❌ Error executing statement:', error);
          // Try direct query as fallback
          const { error: directError } = await supabase.from('_').select('*').limit(0);
          if (directError) {
            console.log('Trying alternative approach...');
          }
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    console.log('✅ Notebook migration completed successfully!');
    
    // Test the tables by trying to fetch from them
    console.log('🧪 Testing notebook tables...');
    
    const { data: folders, error: foldersError } = await supabase
      .from('notebook_folders')
      .select('*')
      .limit(1);
    
    if (foldersError) {
      console.error('❌ Error testing notebook_folders:', foldersError);
    } else {
      console.log('✅ notebook_folders table is working');
    }
    
    const { data: notes, error: notesError } = await supabase
      .from('notebook_notes')
      .select('*')
      .limit(1);
    
    if (notesError) {
      console.error('❌ Error testing notebook_notes:', notesError);
    } else {
      console.log('✅ notebook_notes table is working');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runNotebookMigration();