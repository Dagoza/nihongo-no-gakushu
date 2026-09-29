/**
 * Nihongo Master - Supabase Cloud Synchronization, Auth & Multi-Device Persistence
 *
 * Utiliza el cliente oficial de Supabase con persistencia de sesión segura,
 * soporte de autenticación por Email/Contraseña y políticas de Row Level Security (RLS).
 */

import { getSupabase } from './supabaseClient';

const LAST_SYNC_KEY = 'nihongo_last_sync_time';

export const DEFAULT_SUPABASE_URL = 'https://ttlwngmidibgcuqsrvnb.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_E3Mz4l9IeI8BxTjVvKgapA_V9f_1ZyA';

let debouncePushTimer = null;

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

/**
 * Obtiene la fecha/hora de la última sincronización exitosa.
 */
export function getLastSyncTime() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_SYNC_KEY);
}

/**
 * Actualiza la marca de tiempo de la última sincronización.
 */
export function recordLastSyncTime() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
}

/* ==========================================================================
   AUTENTICACIÓN Y GESTIÓN DE SESIÓN DE USUARIO (SUPABASE AUTH)
   ========================================================================== */

let _cachedAuthSession = null;

/**
 * Comprueba de forma síncrona si hay una sesión activa de usuario.
 */
export function hasActiveUserSession() {
  return Boolean(_cachedAuthSession?.user);
}

/**
 * Obtiene la sesión actual del usuario autenticado.
 */
export async function getAuthSession() {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data) {
      _cachedAuthSession = null;
      return null;
    }
    _cachedAuthSession = data.session;
    return data.session;
  } catch (e) {
    _cachedAuthSession = null;
    return null;
  }
}

/**
 * Obtiene el usuario autenticado actual.
 */
export async function getAuthUser() {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data) return null;
    return data.user;
  } catch (e) {
    return null;
  }
}

/**
 * Registra un nuevo usuario con Email y Contraseña.
 */
export async function signUpWithEmail(email, password) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase no está configurado');
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password: password
  });
  if (error) throw error;
  return data;
}

/**
 * Inicia sesión con Email y Contraseña.
 */
export async function signInWithEmail(email, password) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase no está configurado');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password
  });
  if (error) throw error;
  return data;
}

/**
 * Inicia sesión utilizando Google OAuth a través de Supabase Auth.
 */
export async function signInWithGoogle() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase no está configurado');

  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Extrae y normaliza el perfil del usuario (compatible con Google Account y Email).
 */
export function extractUserProfile(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    name: meta.full_name || meta.name || user.email?.split('@')[0] || 'Estudiante',
    avatar: meta.avatar_url || meta.picture || null,
    provider: user.app_metadata?.provider || 'email',
    connectedAt: user.created_at || new Date().toISOString()
  };
}

/**
 * Cierra la sesión activa del usuario.
 */
export async function signOutUser() {
  _cachedAuthSession = null;
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Escucha cambios en el estado de autenticación (Login, Logout, Token Refresh).
 */
export function subscribeToAuthChanges(callback) {
  const supabase = getSupabase();
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange((event, session) => {
    _cachedAuthSession = session || null;
    callback(event, session);
  });
}

/* ==========================================================================
   SINCRONIZACIÓN Y PERSISTENCIA DE PROGRESO (SOLO USUARIOS AUTENTICADOS)
   ========================================================================== */

/**
 * Descarga el progreso del usuario desde Supabase.
 * - Requiere un usuario autenticado para acceder a sus datos privados bajo RLS.
 */
export async function fetchCloudProgress() {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const session = await getAuthSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      console.warn('Error al consultar progreso de usuario autenticado:', error.message);
      return null;
    }

    if (data && data.data) {
      return {
        data: data.data,
        updated_at: data.updated_at,
        user_id: data.user_id,
        email: data.email
      };
    }
    return null;
  } catch (err) {
    console.warn('Fallo al descargar de la nube:', err);
    return null;
  }
}

/**
 * Sube o actualiza el progreso a Supabase utilizando Row Level Security (RLS).
 * Solo se ejecuta si el usuario ha iniciado sesión.
 */
export async function pushCloudProgress(appState) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, reason: 'unconfigured' };

  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return { success: false, reason: 'unauthenticated' };
    }

    const payload = {
      id: session.user.id,
      user_id: session.user.id,
      email: session.user.email,
      data: appState,
      device_info: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 100) : 'Web Client',
      client_version: 2,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_progress')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Error al subir a Supabase:', error.message);
      return { success: false, error: error.message };
    }

    recordLastSyncTime();
    return { success: true, timestamp: payload.updated_at };
  } catch (err) {
    console.warn('Fallo de red al subir a Supabase:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Algoritmo de Fusión Inteligente (Smart Convergent Merge).
 */
export function mergeProgressStates(local, cloud) {
  if (!cloud) return local;
  if (!local) return cloud;

  const xp = Math.max(Number(local.xp) || 0, Number(cloud.xp) || 0);
  const streak = Math.max(Number(local.streak) || 1, Number(cloud.streak) || 1);

  const localDate = local.lastStudyDate || '2000-01-01';
  const cloudDate = cloud.lastStudyDate || '2000-01-01';
  const lastStudyDate = localDate >= cloudDate ? localDate : cloudDate;

  // Fusión de diccionarios de progreso booleano
  const masteredParticles = { ...(cloud.masteredParticles || {}), ...(local.masteredParticles || {}) };
  const masteredVocab = { ...(cloud.masteredVocab || {}), ...(local.masteredVocab || {}) };
  const masteredKanji = { ...(cloud.masteredKanji || {}), ...(local.masteredKanji || {}) };
  const completedSentences = { ...(cloud.completedSentences || {}), ...(local.completedSentences || {}) };
  const completedSteps = { ...(cloud.completedSteps || {}), ...(local.completedSteps || {}) };
  const completedCanDos = { ...(cloud.completedCanDos || {}), ...(local.completedCanDos || {}) };
  const completedConversations = { ...(cloud.completedConversations || {}), ...(local.completedConversations || {}) };

  // Fusión y deduplicación de vocabulario personalizado
  const vocabMap = new Map();
  [...(cloud.savedCustomVocab || []), ...(local.savedCustomVocab || [])].forEach((item) => {
    if (!item) return;
    const key = item.id || `${item.kanji || ''}_${item.hiragana || ''}`;
    if (!vocabMap.has(key)) vocabMap.set(key, item);
  });

  // Fusión y deduplicación de frases guardadas
  const phraseMap = new Map();
  [...(cloud.savedPhrases || []), ...(local.savedPhrases || [])].forEach((item) => {
    if (!item) return;
    const key = item.id || item.japanese;
    if (!phraseMap.has(key)) phraseMap.set(key, item);
  });

  // Fusión y deduplicación de kanjis personalizados
  const kanjiMap = new Map();
  [...(cloud.savedCustomKanji || []), ...(local.savedCustomKanji || [])].forEach((item) => {
    if (!item) return;
    const key = item.char;
    if (!kanjiMap.has(key)) kanjiMap.set(key, item);
  });

  // Fusión y deduplicación de videos guardados
  const videoMap = new Map();
  [...(cloud.savedCustomVideos || []), ...(local.savedCustomVideos || [])].forEach((item) => {
    if (!item) return;
    const key = item.youtubeId;
    if (!videoMap.has(key)) videoMap.set(key, item);
  });

  // Fusión de favoritos
  const favoriteVideos = Array.from(new Set([
    ...(cloud.favoriteVideos || []),
    ...(local.favoriteVideos || [])
  ]));

  return {
    ...cloud,
    ...local,
    xp,
    streak,
    lastStudyDate,
    masteredParticles,
    masteredVocab,
    masteredKanji,
    completedSentences,
    completedSteps,
    completedCanDos,
    completedConversations,
    savedCustomVocab: Array.from(vocabMap.values()),
    savedPhrases: Array.from(phraseMap.values()),
    savedCustomKanji: Array.from(kanjiMap.values()),
    savedCustomVideos: Array.from(videoMap.values()),
    favoriteVideos,
    vocabCustomizations: {
      ...(cloud.vocabCustomizations || {}),
      ...(local.vocabCustomizations || {})
    },
    useMassiveDictionary: local.useMassiveDictionary ?? cloud.useMassiveDictionary ?? false,
    useMassiveKanji: local.useMassiveKanji ?? cloud.useMassiveKanji ?? false,
    theme: local.theme || cloud.theme || 'light',
    lastSyncTimestamp: new Date().toISOString()
  };
}

/**
 * Programa una subida a la nube con "debounce" (espera 1.5s sin actividad).
 */
export function scheduleDebouncedCloudPush(appState, delayMs = 1500) {
  if (typeof window === 'undefined') return;
  if (!isSupabaseConfigured()) return;
  // Solo sincronizar con la base de datos si el usuario ha iniciado sesión
  if (!_cachedAuthSession?.user) return;

  if (debouncePushTimer) {
    clearTimeout(debouncePushTimer);
  }

  debouncePushTimer = setTimeout(async () => {
    try {
      await pushCloudProgress(appState);
    } catch (e) {
      console.warn('Debounced push failed:', e);
    }
  }, delayMs);
}

/**
 * Ejecuta una sincronización bidireccional completa para el usuario autenticado.
 */
export async function executeFullSync(localState) {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      reason: 'unconfigured',
      mergedState: localState,
      message: 'Supabase no está configurado.'
    };
  }

  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return {
        success: false,
        reason: 'unauthenticated',
        mergedState: localState,
        message: 'Inicia sesión con Google o correo para sincronizar en la nube.'
      };
    }

    const cloudRecord = await fetchCloudProgress();
    let finalState = localState;

    if (cloudRecord && cloudRecord.data) {
      finalState = mergeProgressStates(localState, cloudRecord.data);
    }

    const pushResult = await pushCloudProgress(finalState);
    if (!pushResult.success) {
      return {
        success: false,
        reason: 'push_failed',
        mergedState: finalState,
        message: 'No se pudo guardar en la nube. Verifica tu conexión.'
      };
    }

    return {
      success: true,
      mergedState: finalState,
      isAuthenticated: true,
      userEmail: session.user.email,
      message: `¡Progreso sincronizado de forma segura con tu cuenta (${session.user.email})!`,
      updatedAt: pushResult.timestamp || new Date().toISOString()
    };
  } catch (err) {
    return {
      success: false,
      reason: 'error',
      mergedState: localState,
      message: err.message || 'Error durante la sincronización.'
    };
  }
}

