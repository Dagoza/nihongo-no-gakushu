import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, getSupabaseConfig } from './supabaseSync';

let supabaseClient = null;

export function getSupabase() {
  if (typeof window === 'undefined') {
    return createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  const config = getSupabaseConfig();
  const url = config.url || DEFAULT_SUPABASE_URL;
  const anonKey = config.anonKey || DEFAULT_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  supabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'nihongo_auth_token'
    }
  });

  return supabaseClient;
}
