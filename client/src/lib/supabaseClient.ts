import { createClient } from '@supabase/supabase-js'

// Debug environment variables
console.log('All environment variables:', import.meta.env);
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);

// Get the Supabase URL and anon key (using only VITE_ prefixed variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that we have the required values
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
  console.error('Available environment variables:', Object.keys(import.meta.env));
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

console.log('Initializing Supabase client with:', { supabaseUrl, supabaseAnonKey });

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)