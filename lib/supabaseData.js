import { dataStore } from './data';
import { getAuthSession } from './supabaseSync';

const memoryCache = {
  vocab: {},
  kanji: {}
};

/**
 * Obtiene vocabulario desde el API/Supabase únicamente si el usuario ha iniciado sesión.
 * Si no hay sesión activa, muestra solo los datos guardados locales sin llamar a la base de datos.
 * @param {Object} options
 * @param {string} options.level - 'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
 * @param {number} options.limit - Límite de registros
 */
export async function getVocabularyFromSupabase({ level = 'all', limit = 2000, authUser = null } = {}) {
  // Si no hay usuario autenticado, mostrar inmediatamente los datos guardados sin llamar a la BD
  let session = null;
  if (!authUser) {
    session = await getAuthSession();
  }
  const hasUser = Boolean(authUser || session?.user);
  if (!hasUser) {
    return filterLocalVocab(level);
  }

  const cacheKey = `${level}_${limit}`;
  if (memoryCache.vocab[cacheKey]) {
    return memoryCache.vocab[cacheKey];
  }

  try {
    if (!session) {
      session = await getAuthSession();
    }
    const token = session?.access_token;
    const url = `/api/data/vocabulary?level=${encodeURIComponent(level)}&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return filterLocalVocab(level);
    }

    const localMap = new Map((dataStore.vocabulary || []).map(v => [v.kanji, v]));
    const merged = data.map(item => {
      const local = localMap.get(item.kanji);
      return {
        ...item,
        tatoeba_sentences: local?.tatoeba_sentences || item.tatoeba_sentences || null,
        hiragana: item.kana,
        katakana: local?.katakana || ''
      };
    });

    memoryCache.vocab[cacheKey] = merged;
    return merged;
  } catch (err) {
    console.warn('Fallback a vocabulario local guardado:', err.message);
    return filterLocalVocab(level);
  }
}

/**
 * Obtiene Kanjis desde el API/Supabase únicamente si el usuario ha iniciado sesión.
 * Si no hay sesión activa, muestra solo los datos guardados locales sin llamar a la base de datos.
 * @param {Object} options
 * @param {string} options.level - 'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
 * @param {number} options.limit - Límite de kanjis
 */
export async function getKanjiFromSupabase({ level = 'all', limit = 2500, authUser = null } = {}) {
  // Si no hay usuario autenticado, mostrar inmediatamente los datos guardados sin llamar a la BD
  let session = null;
  if (!authUser) {
    session = await getAuthSession();
  }
  const hasUser = Boolean(authUser || session?.user);
  if (!hasUser) {
    return filterLocalKanji(level);
  }

  const cacheKey = `${level}_${limit}`;
  if (memoryCache.kanji[cacheKey]) {
    return memoryCache.kanji[cacheKey];
  }

  try {
    if (!session) {
      session = await getAuthSession();
    }
    const token = session?.access_token;
    const url = `/api/data/kanji?level=${encodeURIComponent(level)}&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return filterLocalKanji(level);
    }

    const localMap = new Map((dataStore.kanji || []).map(k => [k.kanji, k]));
    const merged = data.map(item => {
      const local = localMap.get(item.kanji);
      return {
        ...item,
        mnemonic: local?.mnemonic || item.mnemonic || '',
        words: local?.words || item.words || []
      };
    });

    memoryCache.kanji[cacheKey] = merged;
    return merged;
  } catch (err) {
    console.warn('Fallback a kanjis locales guardados:', err.message);
    return filterLocalKanji(level);
  }
}

function filterLocalVocab(level) {
  const list = dataStore.vocabulary || [];
  if (!level || level === 'all') return list;
  return list.filter(v => v.level === level);
}

function filterLocalKanji(level) {
  const list = dataStore.kanji || [];
  if (!level || level === 'all') return list;
  return list.filter(k => k.level === level);
}
