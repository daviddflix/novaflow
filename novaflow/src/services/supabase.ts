import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

// Supabase client configured from environment variables.
// Keys are not hardcoded to avoid leaking credentials.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

