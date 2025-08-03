import { createClient } from '@supabase/supabase-js';

// Supabase client configured via environment variables.
// These values should be defined in `.env` or similar and
// must not be committed to the repository.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
