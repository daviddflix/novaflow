import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Client for standard user operations. Uses the public anon key.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Client with service role key. Must only be used in trusted server-side code.
 * Exposing this key in the browser is a security risk.
 * Required for admin operations like inviteUserByEmail.
 */
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;
export const supabaseAdmin = createClient(supabaseUrl, serviceKey);
