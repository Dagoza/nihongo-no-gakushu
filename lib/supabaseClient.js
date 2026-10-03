import { createClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://ttlwngmidibgcuqsrvnb.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_E3Mz4l9IeI8BxTjVvKgapA_V9f_1ZyA';

let supabaseClient = null;

/**
 * Obtiene la configuración de Supabase desde variables de entorno o valores predeterminados fijos.
 */
export function getSupabaseConfig() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY || '').trim();
  return {
    url,
    anonKey,
    source: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'env' : 'default'
  };
}

/**
 * Comprueba si Supabase está configurado y listo para sincronizar.
 */
export function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

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
