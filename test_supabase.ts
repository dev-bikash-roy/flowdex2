import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient(
  'https://dcfavnetfqirooxhvqsy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmF2bmV0ZnFpcm9veGh2cXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Mjk3OTEsImV4cCI6MjA3NDUwNTc5MX0.CkuDMegvqToLrLtYsA9KBFeK-Rg_buvdvJ-HF2U5y_4'
)

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.log('Authentication error:', authError.message)
    } else {
      console.log('Authentication successful')
    }
    
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count()')
      .limit(1)
    
    if (error) {
      console.log('Database connection error:', error.message)
    } else {
      console.log('Database connection successful')
    }
    
    console.log('Supabase integration test completed')
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testSupabaseConnection()