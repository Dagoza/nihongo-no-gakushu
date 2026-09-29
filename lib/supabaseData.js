import { getSupabase } from './supabaseClient';
import { dataStore } from './data';

const memoryCache = {
  vocab: {},
  kanji: {}
};

/**
 * Obtiene vocabulario desde Supabase con caché en memoria y fallback a datos locales.
 * @param {Object} options
 * @param {string} options.level - 'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
 * @param {number} options.limit - Número máximo de registros a traer (default: 2000)
 */
export async function getVocabularyFromSupabase({ level = 'all', limit = 2000 } = {}) {
  const cacheKey = `${level}_${limit}`;
  if (memoryCache.vocab[cacheKey]) {
    return memoryCache.vocab[cacheKey];
  }

  const supabase = getSupabase();
  if (!supabase) {
    return filterLocalVocab(level);
  }

  try {
    let query = supabase.from('vocabulary').select('*');
    if (level && level !== 'all') {
      query = query.eq('level', level);
    }
    query = query.order('id', { ascending: true }).limit(limit);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      console.warn('Fallback a vocabulario local:', error?.message);
      return filterLocalVocab(level);
    }

    // Combinar con los datos locales para asegurar que las palabras con tatoeba o personalizadas se mantengan
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
    console.error('Error cargando vocabulario desde Supabase:', err);
    return filterLocalVocab(level);
  }
}

/**
 * Obtiene Kanjis desde Supabase con caché en memoria y fallback a datos locales.
 * @param {Object} options
 * @param {string} options.level - 'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
 * @param {number} options.limit - Límite de kanjis (default: 2500)
 */
export async function getKanjiFromSupabase({ level = 'all', limit = 2500 } = {}) {
  const cacheKey = `${level}_${limit}`;
  if (memoryCache.kanji[cacheKey]) {
    return memoryCache.kanji[cacheKey];
  }

  const supabase = getSupabase();
  if (!supabase) {
    return filterLocalKanji(level);
  }

  try {
    let query = supabase.from('kanji').select('*');
    if (level && level !== 'all') {
      query = query.eq('level', level);
    }
    query = query.order('strokes', { ascending: true }).limit(limit);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      console.warn('Fallback a kanjis locales:', error?.message);
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
    console.error('Error cargando kanjis desde Supabase:', err);
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
