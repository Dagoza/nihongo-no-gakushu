/**
 * Nihongo Master - Supabase Cloud Synchronization, Auth & Multi-Device Persistence
 *
 * Utiliza el cliente oficial de Supabase con persistencia de sesión segura,
 * soporte de autenticación por Email/Contraseña y políticas de Row Level Security (RLS).
 */

import { 
  getSupabase, 
  DEFAULT_SUPABASE_URL, 
  DEFAULT_SUPABASE_ANON_KEY, 
  getSupabaseConfig, 
  isSupabaseConfigured 
} from './supabaseClient.js';
import { LESSON_ID_ALIASES } from './scriptpadData.js';

export { 
  DEFAULT_SUPABASE_URL, 
  DEFAULT_SUPABASE_ANON_KEY, 
  getSupabaseConfig, 
  isSupabaseConfigured 
};

const LAST_SYNC_KEY = 'nihongo_last_sync_time';

let debouncePushTimer = null;

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
  } catch {
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
    const session = await getAuthSession();
    if (session?.user) {
      _cachedAuthSession = session;
      return session.user;
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data) return null;
    return data.user;
  } catch {
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
 * Combina el estado local y el de la nube asegurando que NUNCA se desmarquen ni
 * se pierdan lecciones de Scriptpad, progreso de palabras, SRS, XP ni módulos.
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
  const completedSubSteps = { ...(cloud.completedSubSteps || {}), ...(local.completedSubSteps || {}) };
  const completedCanDos = { ...(cloud.completedCanDos || {}), ...(local.completedCanDos || {}) };
  const completedExercises = { ...(cloud.completedExercises || {}), ...(local.completedExercises || {}) };
  const completedConversations = { ...(cloud.completedConversations || {}), ...(local.completedConversations || {}) };

  // Fusión de moduleProgress (paso curricular)
  const localModProg = local.moduleProgress || {};
  const cloudModProg = cloud.moduleProgress || {};
  const mergedModuleProgress = { ...cloudModProg };
  Object.entries(localModProg).forEach(([step, val]) => {
    if (!mergedModuleProgress[step]) {
      mergedModuleProgress[step] = val;
    } else {
      mergedModuleProgress[step] = {
        ...mergedModuleProgress[step],
        ...val,
        currentSubStep: Math.max(
          Number(val?.currentSubStep) || 0,
          Number(mergedModuleProgress[step]?.currentSubStep) || 0
        )
      };
    }
  });

  // Fusión inteligente y bidireccional de lecciones de Scriptpad
  const localScriptpad = (local.completedScriptpadLessons && typeof local.completedScriptpadLessons === 'object')
    ? local.completedScriptpadLessons
    : {};
  const cloudScriptpad = (cloud.completedScriptpadLessons && typeof cloud.completedScriptpadLessons === 'object')
    ? cloud.completedScriptpadLessons
    : {};
  
  const mergedScriptpad = { ...cloudScriptpad };

  Object.entries(localScriptpad).forEach(([lessonId, rawLocal]) => {
    if (!rawLocal) return;
    const localData = rawLocal === true 
      ? { completedAt: new Date().toISOString(), score: 100, stars: 3, totalWords: 10, completedModes: ['write'] }
      : rawLocal;
    const rawCloud = mergedScriptpad[lessonId];
    const cloudData = rawCloud === true
      ? { completedAt: new Date().toISOString(), score: 100, stars: 3, totalWords: 10, completedModes: ['write'] }
      : rawCloud;

    if (!cloudData) {
      mergedScriptpad[lessonId] = { ...localData };
    } else {
      const localModes = Array.isArray(localData.completedModes) ? localData.completedModes : (localData.completedAt ? ['write'] : []);
      const cloudModes = Array.isArray(cloudData.completedModes) ? cloudData.completedModes : (cloudData.completedAt ? ['write'] : []);
      const allModes = Array.from(new Set([...cloudModes, ...localModes]));

      const localTime = localData.completedAt ? new Date(localData.completedAt).getTime() : 0;
      const cloudTime = cloudData.completedAt ? new Date(cloudData.completedAt).getTime() : 0;
      const latestDate = (localTime >= cloudTime && localData.completedAt)
        ? localData.completedAt
        : (cloudData.completedAt || localData.completedAt || new Date().toISOString());

      mergedScriptpad[lessonId] = {
        ...cloudData,
        ...localData,
        completedAt: latestDate,
        score: Math.max(Number(localData.score) || 0, Number(cloudData.score) || 0),
        stars: Math.max(Number(localData.stars) || 0, Number(cloudData.stars) || 0),
        totalWords: Math.max(Number(localData.totalWords) || 0, Number(cloudData.totalWords) || 0),
        completedModes: allModes
      };
    }
  });

  // Replicar en aliases conocidos de Scriptpad para consistencia absoluta entre dispositivos
  if (LESSON_ID_ALIASES && typeof LESSON_ID_ALIASES === 'object') {
    Object.entries(LESSON_ID_ALIASES).forEach(([canon, alts]) => {
      if (mergedScriptpad[canon]) {
        (alts || []).forEach(alt => {
          if (!mergedScriptpad[alt]) mergedScriptpad[alt] = { ...mergedScriptpad[canon] };
        });
      } else {
        for (const alt of (alts || [])) {
          if (mergedScriptpad[alt]) {
            mergedScriptpad[canon] = { ...mergedScriptpad[alt] };
            break;
          }
        }
      }
    });
  }

  // Fusión de progreso individual de palabras de Scriptpad
  const localWordProgress = (local.scriptpadWordProgress && typeof local.scriptpadWordProgress === 'object')
    ? local.scriptpadWordProgress
    : {};
  const cloudWordProgress = (cloud.scriptpadWordProgress && typeof cloud.scriptpadWordProgress === 'object')
    ? cloud.scriptpadWordProgress
    : {};

  const mergedWordProgress = { ...cloudWordProgress };

  Object.entries(localWordProgress).forEach(([wordKey, localData]) => {
    if (!localData || typeof localData !== 'object') return;
    const cloudData = mergedWordProgress[wordKey];

    if (!cloudData) {
      mergedWordProgress[wordKey] = { ...localData };
    } else {
      const localTime = (localData.lastWrittenAt || localData.lastPracticedAt) ? new Date(localData.lastWrittenAt || localData.lastPracticedAt).getTime() : 0;
      const cloudTime = (cloudData.lastWrittenAt || cloudData.lastPracticedAt) ? new Date(cloudData.lastWrittenAt || cloudData.lastPracticedAt).getTime() : 0;
      const lastDate = (localTime >= cloudTime && (localData.lastWrittenAt || localData.lastPracticedAt))
        ? (localData.lastWrittenAt || localData.lastPracticedAt)
        : (cloudData.lastWrittenAt || cloudData.lastPracticedAt || new Date().toISOString());

      mergedWordProgress[wordKey] = {
        timesWritten: Math.max(Number(localData.timesWritten) || 0, Number(cloudData.timesWritten) || 0),
        timesPracticed: Math.max(Number(localData.timesPracticed) || 0, Number(cloudData.timesPracticed) || 0),
        lastWrittenAt: lastDate,
        lastPracticedAt: lastDate,
        mastered: Boolean(localData.mastered || cloudData.mastered)
      };
    }
  });

  // Fusión de tarjetas SRS (FSRS)
  const localSrs = (local.srsQuestions && typeof local.srsQuestions === 'object') ? local.srsQuestions : {};
  const cloudSrs = (cloud.srsQuestions && typeof cloud.srsQuestions === 'object') ? cloud.srsQuestions : {};
  const mergedSrs = { ...cloudSrs };

  Object.entries(localSrs).forEach(([qKey, localCard]) => {
    if (!localCard) return;
    const cloudCard = mergedSrs[qKey];
    if (!cloudCard) {
      mergedSrs[qKey] = localCard;
    } else {
      const localReps = Number(localCard.reps || localCard.repetitions || 0);
      const cloudReps = Number(cloudCard.reps || cloudCard.repetitions || 0);
      const localLast = localCard.last_review ? new Date(localCard.last_review).getTime() : 0;
      const cloudLast = cloudCard.last_review ? new Date(cloudCard.last_review).getTime() : 0;

      if (localLast > cloudLast || (localLast === cloudLast && localReps >= cloudReps)) {
        mergedSrs[qKey] = localCard;
      } else {
        mergedSrs[qKey] = cloudCard;
      }
    }
  });

  // Fusión de exámenes JLPT
  const jlptExamResults = {
    ...(cloud.jlptExamResults || {}),
    ...(local.jlptExamResults || {})
  };

  // Fusión de Daily Goal
  const localGoal = local.dailyGoal || {};
  const cloudGoal = cloud.dailyGoal || {};
  const today = new Date().toISOString().split('T')[0];
  let mergedDailyGoal = { ...localGoal };

  if (cloudGoal.date === today && localGoal.date === today) {
    mergedDailyGoal = {
      ...localGoal,
      ...cloudGoal,
      answeredToday: Math.max(Number(localGoal.answeredToday) || 0, Number(cloudGoal.answeredToday) || 0),
      completed: Boolean(localGoal.completed || cloudGoal.completed)
    };
  } else if (cloudGoal.date === today) {
    mergedDailyGoal = { ...cloudGoal };
  } else {
    mergedDailyGoal = { ...localGoal, date: today };
  }

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

  // Fusión y deduplicación de historias guardadas
  const storyMap = new Map();
  [...(cloud.savedStories || []), ...(local.savedStories || [])].forEach((item) => {
    if (!item) return;
    const key = item.id || item.title;
    if (!storyMap.has(key)) storyMap.set(key, item);
  });

  // Fusión y deduplicación de conversaciones guardadas
  const convMap = new Map();
  [...(cloud.savedConversations || []), ...(local.savedConversations || [])].forEach((item) => {
    if (!item) return;
    const key = item.id || item.title_jp;
    if (!convMap.has(key)) convMap.set(key, item);
  });

  // Fusión y deduplicación de cuadernos de práctica y caligrafía guardados
  const sheetMap = new Map();
  [...(cloud.savedPracticeSheets || []), ...(local.savedPracticeSheets || [])].forEach((item) => {
    if (!item || !item.id) return;
    const key = item.id;
    if (!sheetMap.has(key)) {
      sheetMap.set(key, item);
    } else {
      const existing = sheetMap.get(key);
      const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const itemTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
      if (itemTime > existingTime) {
        sheetMap.set(key, item);
      }
    }
  });

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
    completedSubSteps,
    moduleProgress: mergedModuleProgress,
    completedCanDos,
    completedExercises,
    completedConversations,
    completedScriptpadLessons: mergedScriptpad,
    scriptpadWordProgress: mergedWordProgress,
    srsQuestions: mergedSrs,
    jlptExamResults,
    dailyGoal: mergedDailyGoal,
    savedCustomVocab: Array.from(vocabMap.values()),
    savedPhrases: Array.from(phraseMap.values()),
    savedCustomKanji: Array.from(kanjiMap.values()),
    savedCustomVideos: Array.from(videoMap.values()),
    savedStories: Array.from(storyMap.values()),
    savedConversations: Array.from(convMap.values()),
    savedPracticeSheets: Array.from(sheetMap.values()),
    favoriteVideos,
    vocabCustomizations: {
      ...(cloud.vocabCustomizations || {}),
      ...(local.vocabCustomizations || {})
    },
    kanjiTags: {
      ...(cloud.kanjiTags || {}),
      ...(local.kanjiTags || {})
    },
    vocabTags: {
      ...(cloud.vocabTags || {}),
      ...(local.vocabTags || {})
    },
    useMassiveDictionary: local.useMassiveDictionary ?? cloud.useMassiveDictionary ?? false,
    useMassiveKanji: local.useMassiveKanji ?? cloud.useMassiveKanji ?? false,
    confettiEnabled: local.confettiEnabled ?? cloud.confettiEnabled ?? true,
    theme: local.theme || cloud.theme || 'light',
    lastSyncTimestamp: new Date().toISOString()
  };
}

let pendingAppStateToPush = null;

/**
 * Programa una subida a la nube con "debounce" (espera 600ms sin actividad).
 */
export function scheduleDebouncedCloudPush(appState, delayMs = 600) {
  if (typeof window === 'undefined') return;
  if (!isSupabaseConfigured()) return;

  pendingAppStateToPush = appState;

  if (debouncePushTimer) {
    clearTimeout(debouncePushTimer);
  }

  debouncePushTimer = setTimeout(async () => {
    try {
      const stateToPush = pendingAppStateToPush;
      pendingAppStateToPush = null;
      debouncePushTimer = null;
      if (stateToPush) {
        await pushCloudProgress(stateToPush);
      }
    } catch (e) {
      console.warn('Debounced push failed:', e);
    }
  }, delayMs);
}

/**
 * Fuerza el envío inmediato de cualquier cambio pendiente a la nube.
 * Crucial para dispositivos móviles cuando el usuario cambia de app o bloquea el teléfono.
 */
export async function flushPendingCloudPush() {
  if (debouncePushTimer && pendingAppStateToPush) {
    clearTimeout(debouncePushTimer);
    debouncePushTimer = null;
    const stateToPush = pendingAppStateToPush;
    pendingAppStateToPush = null;
    try {
      return await pushCloudProgress(stateToPush);
    } catch (e) {
      console.warn('Flush push failed:', e);
    }
  }
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

