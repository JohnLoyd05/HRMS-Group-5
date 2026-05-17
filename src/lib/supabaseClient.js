import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

// In development, Vite HMR replaces modules on tab-switch/reconnect.
// Reusing the same client instance preserves the in-memory session so
// in-flight fetches don't hang waiting for rehydration from localStorage.
let client =
  import.meta.hot?.data.supabase ?? createClient(supabaseUrl, supabaseAnonKey)

if (import.meta.hot) {
  import.meta.hot.data.supabase = client
}

export const supabase = client