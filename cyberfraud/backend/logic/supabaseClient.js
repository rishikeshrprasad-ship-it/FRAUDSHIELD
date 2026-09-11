import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://ucfguensnanhzpwyvxck.supabase.co';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Fallback dummy key to prevent startup crash if env is not configured yet
const effectiveSecret = supabaseSecretKey || 'dummy_secret_key_for_build';
const effectivePub = supabasePublishableKey || 'dummy_publishable_key';

// Secure server-side service-role client
export const supabase = createClient(supabaseUrl, effectiveSecret, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Public / Anon client if needed
export const supabasePublic = createClient(supabaseUrl, supabasePublishableKey);

console.log('? Supabase Server Client initialized for:', supabaseUrl);
