/**
 * Nihongo Master - Supabase Cloud Synchronization & Multi-Device Persistence
 *
 * Utiliza la API REST nativa de Supabase (PostgREST) vía fetch.
 * No requiere librerías pesadas externas, es 100% resiliente y compatible con Vercel.
 */

const SUPABASE_STORAGE_CONFIG_KEY = 'nihongo_supabase_config';
const SYNC_CODE_KEY = 'nihongo_sync_code';
const LAST_SYNC_KEY = 'nihongo_last_sync_time';

let debouncePushTimer = null;

/**
 * Obtiene la configuración de Supabase desde variables de entorno o localStorage.
 */
export function getSupabaseConfig() {
  if (typeof window === 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      source: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'env' : 'none'
    };
  }

  // 1. Prioridad: Variables de entorno del proyecto
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (envUrl && envKey && envUrl.startsWith('http')) {
    return {
      url: envUrl.trim().replace(/\/+$/, ''),
      anonKey: envKey.trim(),
      source: 'env'
    };
  }

  // 2. Segunda opción: Configuración manual guardada en el navegador
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

  return { url: '', anonKey: '', source: 'none' };
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
 * Genera un código de sincronización amigable y fácil de copiar entre dispositivos.
 * Ejemplo: NIH-7K2M-9P4W
 */
export function generateSyncCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Caracteres sin ambigüedades (sin 0, O, 1, I)
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
 * Asigna un nuevo código de sincronización (para vincular este dispositivo con otro).
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
    const res = await fetch(`${config.url}/rest/v1/user_progress?select=sync_id&limit=1`, {
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
 * Descarga el progreso del usuario desde Supabase por sync_id.
 */
export async function fetchCloudProgress(syncId = null, customConfig = null) {
  const config = customConfig || getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;

  const targetId = syncId || getSyncCode();
  if (!targetId) return null;

  try {
    const res = await fetch(
      `${config.url}/rest/v1/user_progress?sync_id=eq.${encodeURIComponent(targetId)}&select=*`,
      {
        method: 'GET',
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`
        }
      }
    );

    if (!res.ok) {
      console.warn('Error al consultar nube:', res.status);
      return null;
    }

    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0) {
      return {
        data: rows[0].data,
        updated_at: rows[0].updated_at
      };
    }

    return null;
  } catch (err) {
    console.warn('Fallo de red al descargar de la nube:', err);
    return null;
  }
}

/**
 * Sube o actualiza el progreso a Supabase utilizando resolución de duplicados (Upsert).
 */
export async function pushCloudProgress(appState, syncId = null, customConfig = null) {
  const config = customConfig || getSupabaseConfig();
  if (!config.url || !config.anonKey) return { success: false, reason: 'unconfigured' };

  const targetId = syncId || getSyncCode();
  if (!targetId) return { success: false, reason: 'missing_sync_id' };

  const payload = {
    sync_id: targetId,
    data: appState,
    device_info: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 100) : 'Web Client',
    client_version: 2,
    updated_at: new Date().toISOString()
  };

  try {
    const res = await fetch(`${config.url}/rest/v1/user_progress?on_conflict=sync_id`, {
      method: 'POST',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      recordLastSyncTime();
      return { success: true, timestamp: payload.updated_at };
    }

    const err = await res.text();
    console.error('Error al subir a Supabase:', err);
    return { success: false, error: err };
  } catch (err) {
    console.warn('Fallo de red al subir a Supabase:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Algoritmo de Fusión Inteligente (Smart Convergent Merge).
 *
 * Combina el progreso local con el de la nube sin sobrescribir ni perder
 * datos de ninguno de los dispositivos:
 * - Toma el mayor XP y racha acumulada.
 * - Une los diccionarios de partículas, vocabulario, kanjis y oraciones completadas.
 * - Fusiona y deduplica frases guardadas y videos favoritos.
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
 * Evita llamadas excesivas al contestar ejercicios seguidos.
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
 * 1. Descarga el progreso de la nube.
 * 2. Si existe, lo combina inteligentemente con el local.
 * 3. Sube el estado unificado resultante a la nube y lo persiste localmente.
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

  const syncCode = targetSyncCode || getSyncCode();

  try {
    const cloudRecord = await fetchCloudProgress(syncCode);
    let finalState = localState;

    if (cloudRecord && cloudRecord.data) {
      finalState = mergeProgressStates(localState, cloudRecord.data);
    }

    const pushResult = await pushCloudProgress(finalState, syncCode);
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
      message: '¡Sincronizado con éxito con la nube!',
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
