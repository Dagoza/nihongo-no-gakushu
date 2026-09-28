/**
 * Nihongo Master - Supabase Cloud Synchronization, Auth & Multi-Device Persistence
 *
 * Utiliza el cliente oficial de Supabase con persistencia de sesión segura,
 * soporte de autenticación por Email/Contraseña y políticas de Row Level Security (RLS).
 */

import { getSupabase } from './supabaseClient';

const SUPABASE_STORAGE_CONFIG_KEY = 'nihongo_supabase_config';
const SYNC_CODE_KEY = 'nihongo_sync_code';
const LAST_SYNC_KEY = 'nihongo_last_sync_time';

export const DEFAULT_SUPABASE_URL = 'https://ttlwngmidibgcuqsrvnb.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_E3Mz4l9IeI8BxTjVvKgapA_V9f_1ZyA';

let debouncePushTimer = null;

/**
 * Obtiene la configuración de Supabase desde variables de entorno, localStorage o valores predeterminados.
 */
export function getSupabaseConfig() {
  if (typeof window === 'undefined') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    return {
      url,
      anonKey,
      source: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'env' : 'default'
    };
  }

  // 1. Opción personalizada guardada en el navegador
  try {
    const custom = localStorage.getItem(SUPABASE_STORAGE_CONFIG_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url.trim().replace(/\/+$/, ''),
          anonKey: parsed.anonKey.trim(),
          source: 'custom'
        };
      }
    }
  } catch (e) {
    console.warn('Error leyendo configuración de Supabase:', e);
  }

  // 2. Variables de entorno o predeterminadas del proyecto
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  if (envUrl && envKey && envUrl.startsWith('http')) {
    return {
      url: envUrl.trim().replace(/\/+$/, ''),
      anonKey: envKey.trim(),
      source: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'env' : 'default'
    };
  }

  return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY, source: 'default' };
}

/**
 * Guarda o actualiza la configuración manual de Supabase en localStorage.
 */
export function saveSupabaseConfig(url, anonKey) {
  if (typeof window === 'undefined') return;
  if (!url || !anonKey) {
    localStorage.removeItem(SUPABASE_STORAGE_CONFIG_KEY);
    return;
  }
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = anonKey.trim();
  localStorage.setItem(
    SUPABASE_STORAGE_CONFIG_KEY,
    JSON.stringify({ url: cleanUrl, anonKey: cleanKey })
  );
}

/**
 * Elimina la configuración manual guardada.
 */
export function clearSupabaseConfig() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SUPABASE_STORAGE_CONFIG_KEY);
}

/**
 * Comprueba si Supabase está configurado y listo para sincronizar.
 */
export function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

/**
 * Genera un código de sincronización amigable para invitados (ej: NIH-7K2M-9P4W).
 */
export function generateSyncCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const getRandomSegment = (len) => {
    let result = '';
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  return `NIH-${getRandomSegment(4)}-${getRandomSegment(4)}`;
}

/**
 * Obtiene el código de sincronización actual o genera uno nuevo si no existe.
 */
export function getSyncCode() {
  if (typeof window === 'undefined') return 'NIH-DEFAULT-CODE';
  let code = localStorage.getItem(SYNC_CODE_KEY);
  if (!code) {
    code = generateSyncCode();
    localStorage.setItem(SYNC_CODE_KEY, code);
  }
  return code;
}

/**
 * Asigna un nuevo código de sincronización.
 */
export function setSyncCode(code) {
  if (typeof window === 'undefined') return;
  if (!code) return;
  const cleanCode = code.trim().toUpperCase();
  localStorage.setItem(SYNC_CODE_KEY, cleanCode);
  return cleanCode;
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

/**
 * Obtiene la sesión actual del usuario autenticado.
 */
export async function getAuthSession() {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data) return null;
    return data.session;
  } catch (e) {
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
 * Cierra la sesión activa del usuario.
 */
export async function signOutUser() {
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
    callback(event, session);
  });
}

/* ==========================================================================
   SINCRONIZACIÓN Y PERSISTENCIA DE PROGRESO
   ========================================================================== */

/**
 * Prueba la conexión con la base de datos de Supabase.
 */
export async function testSupabaseConnection(customConfig = null) {
  const config = customConfig || getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return {
      success: false,
      message: 'Falta la URL del proyecto o la Anon Key de Supabase.'
    };
  }

  try {
    const res = await fetch(`${config.url}/rest/v1/user_progress?select=id&limit=1`, {
      method: 'GET',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`
      }
    });

    if (res.ok) {
      return {
        success: true,
        message: '¡Conexión exitosa con la base de datos de Supabase!'
      };
    }

    if (res.status === 404 || res.status === 400) {
      const errText = await res.text();
      if (errText.includes('relation') || errText.includes('does not exist')) {
        return {
          success: false,
          needsMigration: true,
          message: 'La base de datos respondió, pero la tabla "user_progress" aún no existe. Ejecuta el script SQL en Supabase.'
        };
      }
    }

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: 'Credenciales inválidas. Verifica tu URL y la Anon Key pública en Supabase.'
      };
    }

    return {
      success: false,
      message: `Error de respuesta de Supabase (código ${res.status}).`
    };
  } catch (err) {
    return {
      success: false,
      message: `No se pudo conectar a Supabase: ${err.message || 'Verifica tu conexión a internet'}`
    };
  }
}

/**
 * Descarga el progreso del usuario desde Supabase.
 * - Si hay un usuario autenticado, busca sus datos privados por user_id bajo RLS.
 * - Si es una sesión anónima, busca por el código de sincronización.
 */
export async function fetchCloudProgress(targetId = null) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const session = await getAuthSession();

    if (session?.user) {
      // Usuario autenticado: protegido con RLS (auth.uid() = user_id)
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
    }

    // Usuario anónimo con código de dispositivo
    const id = targetId || getSyncCode();
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.warn('Error al consultar progreso anónimo:', error.message);
      return null;
    }

    if (data && data.data) {
      return {
        data: data.data,
        updated_at: data.updated_at
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
 */
export async function pushCloudProgress(appState, targetId = null) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, reason: 'unconfigured' };

  try {
    const session = await getAuthSession();
    const isAuthenticated = Boolean(session?.user);
    const id = isAuthenticated ? session.user.id : (targetId || getSyncCode());

    const payload = {
      id: id,
      user_id: isAuthenticated ? session.user.id : null,
      email: isAuthenticated ? session.user.email : null,
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
    completedConversations,
    savedCustomVocab: Array.from(vocabMap.values()),
    savedPhrases: Array.from(phraseMap.values()),
    savedCustomKanji: Array.from(kanjiMap.values()),
    savedCustomVideos: Array.from(videoMap.values()),
    favoriteVideos,
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
 * Ejecuta una sincronización bidireccional completa inmediata.
 */
export async function executeFullSync(localState, targetSyncCode = null) {
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
    const isAuthenticated = Boolean(session?.user);

    const cloudRecord = await fetchCloudProgress(targetSyncCode);
    let finalState = localState;

    if (cloudRecord && cloudRecord.data) {
      finalState = mergeProgressStates(localState, cloudRecord.data);
    }

    const pushResult = await pushCloudProgress(finalState, targetSyncCode);
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
      isAuthenticated,
      userEmail: session?.user?.email || null,
      message: isAuthenticated 
        ? `¡Sincronizado de forma segura con tu cuenta (${session.user.email})!` 
        : '¡Sincronizado con éxito con la nube!',
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
