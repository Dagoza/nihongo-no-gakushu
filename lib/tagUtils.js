/**
 * Sistema Unificado de Etiquetas (Tags) para Nihongo Master
 * Gestiona de forma polimórfica etiquetas para Kanjis y Vocabulario,
 * manteniendo compatibilidad total con appState.kanjiTags y appState.vocabTags.
 */

export const POPULAR_KANJI_TAGS = [
  'Números',
  'Tiempo',
  'Personas',
  'Naturaleza',
  'Acciones',
  'Direcciones',
  'Lugares',
  'Comida',
  'Cuerpo',
  'Educación',
  'Favoritos',
  'Difíciles'
];

export const POPULAR_VOCAB_TAGS = [
  'Verbos',
  'Adjetivos',
  'Comida',
  'Tiempo',
  'Saludos',
  'Vida Diaria',
  'Viajes',
  'Trabajo',
  'Lugares',
  'Personas',
  'Favoritas',
  'Difíciles'
];

export const POPULAR_TAG_SUGGESTIONS = POPULAR_KANJI_TAGS;
export const POPULAR_VOCAB_TAG_SUGGESTIONS = POPULAR_VOCAB_TAGS;

export const DEFAULT_KANJI_TAGS = {
  // Números y medidas
  '一': ['Números', 'Básico'],
  '二': ['Números', 'Básico'],
  '三': ['Números', 'Básico'],
  '四': ['Números', 'Básico'],
  '五': ['Números', 'Básico'],
  '六': ['Números', 'Básico'],
  '七': ['Números', 'Básico'],
  '八': ['Números', 'Básico'],
  '九': ['Números', 'Básico'],
  '十': ['Números', 'Básico'],
  '百': ['Números'],
  '千': ['Números'],
  '万': ['Números'],
  '円': ['Números', 'Dinero'],
  '半': ['Números', 'Tiempo'],

  // Tiempo y Calendario
  '日': ['Tiempo', 'Calendario'],
  '月': ['Tiempo', 'Calendario', 'Naturaleza'],
  '年': ['Tiempo', 'Calendario'],
  '時': ['Tiempo'],
  '分': ['Tiempo'],
  '今': ['Tiempo'],
  '朝': ['Tiempo'],
  '昼': ['Tiempo'],
  '夜': ['Tiempo'],
  '夕': ['Tiempo'],
  '週': ['Tiempo', 'Calendario'],
  '曜': ['Tiempo', 'Calendario'],
  '毎': ['Tiempo'],
  '間': ['Tiempo', 'Espacio'],
  '前': ['Tiempo', 'Direcciones'],
  '後': ['Tiempo', 'Direcciones'],

  // Personas, Relaciones y Sociedad
  '人': ['Personas', 'Básico'],
  '男': ['Personas'],
  '女': ['Personas'],
  '子': ['Personas', 'Familia'],
  '父': ['Personas', 'Familia'],
  '母': ['Personas', 'Familia'],
  '友': ['Personas'],
  '私': ['Personas'],
  '先': ['Personas', 'Educación'],
  '生': ['Personas', 'Vida'],
  '名': ['Personas', 'Sociedad'],

  // Naturaleza, Clima y Elementos
  '山': ['Naturaleza'],
  '川': ['Naturaleza'],
  '木': ['Naturaleza'],
  '森': ['Naturaleza'],
  '林': ['Naturaleza'],
  '花': ['Naturaleza'],
  '雨': ['Naturaleza', 'Clima'],
  '空': ['Naturaleza', 'Clima'],
  '天': ['Naturaleza', 'Clima'],
  '海': ['Naturaleza'],
  '水': ['Naturaleza', 'Elementos'],
  '火': ['Naturaleza', 'Elementos'],
  '土': ['Naturaleza', 'Elementos'],
  '金': ['Naturaleza', 'Elementos', 'Dinero'],
  '風': ['Naturaleza', 'Clima'],

  // Acciones y Verbos
  '行': ['Acciones'],
  '来': ['Acciones'],
  '見': ['Acciones'],
  '食': ['Acciones', 'Comida'],
  '飲': ['Acciones', 'Comida'],
  '書': ['Acciones'],
  '読': ['Acciones'],
  '話': ['Acciones'],
  '聞': ['Acciones'],
  '買': ['Acciones', 'Dinero'],
  '休': ['Acciones'],
  '立': ['Acciones'],
  '出': ['Acciones', 'Direcciones'],
  '入': ['Acciones', 'Direcciones'],
  '言': ['Acciones'],
  '会': ['Acciones', 'Personas'],
  '待': ['Acciones'],
  '持': ['Acciones'],

  // Direcciones y Lugares
  '上': ['Direcciones'],
  '下': ['Direcciones'],
  '左': ['Direcciones'],
  '右': ['Direcciones'],
  '中': ['Direcciones'],
  '北': ['Direcciones'],
  '南': ['Direcciones'],
  '東': ['Direcciones'],
  '西': ['Direcciones'],
  '校': ['Lugares', 'Educación'],
  '学': ['Educación'],
  '店': ['Lugares'],
  '駅': ['Lugares', 'Transporte'],
  '道': ['Lugares', 'Direcciones'],
  '国': ['Lugares', 'Sociedad'],
  '社': ['Lugares', 'Sociedad'],
  '車': ['Transporte', 'Objetos'],
  '本': ['Objetos', 'Educación'],
  '語': ['Idioma', 'Educación'],

  // Cuerpo Humano
  '目': ['Cuerpo'],
  '口': ['Cuerpo'],
  '耳': ['Cuerpo'],
  '手': ['Cuerpo'],
  '足': ['Cuerpo'],
  '心': ['Cuerpo']
};

/**
 * Obtiene la clave de identificación única para un elemento
 */
export function getItemKey(item, type = 'vocab') {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (type === 'kanji') return item.kanji || item.char || '';
  return item.id || item.kanji || item.hiragana || item.kana || '';
}

export function getWordKey(item) {
  return getItemKey(item, 'vocab');
}

/**
 * Obtiene las etiquetas de un kanji (combina etiquetas de usuario con valores por defecto)
 */
export function getKanjiTags(char, userKanjiTags = {}) {
  const k = typeof char === 'object' ? char?.kanji : char;
  if (!k) return [];
  const userList = userKanjiTags?.[k];
  if (Array.isArray(userList)) {
    return userList;
  }
  return DEFAULT_KANJI_TAGS[k] || [];
}

/**
 * Obtiene las etiquetas de una palabra (categoría por defecto + etiquetas personalizadas del usuario)
 */
export function getVocabTags(item, userVocabTags = {}) {
  if (!item) return [];
  const key = getWordKey(item);
  const userList = userVocabTags?.[key] || (item.kanji ? userVocabTags?.[item.kanji] : null);

  const tags = new Set();
  
  if (Array.isArray(userList)) {
    userList.forEach(t => tags.add(t));
  } else {
    if (item.category && item.category.trim()) {
      tags.add(item.category.trim());
    }
  }

  return Array.from(tags);
}

/**
 * Obtiene las etiquetas de forma unificada para cualquier ítem
 */
export function getItemTags(item, userTags = {}, type = 'vocab') {
  if (type === 'kanji') {
    return getKanjiTags(item, userTags);
  }
  return getVocabTags(item, userTags);
}

/**
 * Añade una etiqueta a un kanji en el estado del usuario
 */
export function addTagToKanji(char, newTag, currentKanjiTags = {}) {
  const k = typeof char === 'object' ? char?.kanji : char;
  if (!k || !newTag || !newTag.trim()) return currentKanjiTags;
  const tag = newTag.trim();
  const current = getKanjiTags(k, currentKanjiTags);
  if (current.includes(tag)) return currentKanjiTags;

  return {
    ...currentKanjiTags,
    [k]: [...current, tag]
  };
}

/**
 * Añade una etiqueta a una palabra en el estado del usuario
 */
export function addTagToVocab(item, newTag, currentVocabTags = {}) {
  if (!item || !newTag || !newTag.trim()) return currentVocabTags;
  const key = getWordKey(item);
  const tag = newTag.trim();
  const current = getVocabTags(item, currentVocabTags);
  if (current.includes(tag)) return currentVocabTags;

  return {
    ...currentVocabTags,
    [key]: [...current, tag]
  };
}

/**
 * Añade una etiqueta de forma unificada
 */
export function addItemTag(item, newTag, currentTags = {}, type = 'vocab') {
  if (type === 'kanji') {
    return addTagToKanji(item, newTag, currentTags);
  }
  return addTagToVocab(item, newTag, currentTags);
}

/**
 * Elimina una etiqueta de un kanji en el estado del usuario
 */
export function removeTagFromKanji(char, tagToRemove, currentKanjiTags = {}) {
  const k = typeof char === 'object' ? char?.kanji : char;
  if (!k || !tagToRemove) return currentKanjiTags;
  const current = getKanjiTags(k, currentKanjiTags);
  const updated = current.filter(t => t !== tagToRemove);

  return {
    ...currentKanjiTags,
    [k]: updated
  };
}

/**
 * Elimina una etiqueta de una palabra en el estado del usuario
 */
export function removeTagFromVocab(item, tagToRemove, currentVocabTags = {}) {
  if (!item || !tagToRemove) return currentVocabTags;
  const key = getWordKey(item);
  const current = getVocabTags(item, currentVocabTags);
  const updated = current.filter(t => t !== tagToRemove);

  return {
    ...currentVocabTags,
    [key]: updated
  };
}

/**
 * Elimina una etiqueta de forma unificada
 */
export function removeItemTag(item, tagToRemove, currentTags = {}, type = 'vocab') {
  if (type === 'kanji') {
    return removeTagFromKanji(item, tagToRemove, currentTags);
  }
  return removeTagFromVocab(item, tagToRemove, currentTags);
}

/**
 * Recopila todas las etiquetas únicas presentes en una lista de kanjis dada
 */
export function getAllUniqueTags(kanjiList = [], userKanjiTags = {}) {
  const tagSet = new Set();
  
  kanjiList.forEach(item => {
    const tags = getKanjiTags(item.kanji, userKanjiTags);
    tags.forEach(t => tagSet.add(t));
  });

  Object.values(userKanjiTags || {}).forEach(arr => {
    if (Array.isArray(arr)) {
      arr.forEach(t => tagSet.add(t));
    }
  });

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Recopila todas las etiquetas únicas presentes en el catálogo y estado de vocabulario
 */
export function getAllUniqueVocabTags(vocabList = [], userVocabTags = {}) {
  const tagSet = new Set();

  vocabList.forEach(item => {
    const tags = getVocabTags(item, userVocabTags);
    tags.forEach(t => tagSet.add(t));
  });

  Object.values(userVocabTags || {}).forEach(arr => {
    if (Array.isArray(arr)) {
      arr.forEach(t => tagSet.add(t));
    }
  });

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Recopila todas las etiquetas únicas de forma unificada
 */
export function getAllUniqueItemTags(list = [], userTags = {}, type = 'vocab') {
  if (type === 'kanji') {
    return getAllUniqueTags(list, userTags);
  }
  return getAllUniqueVocabTags(list, userTags);
}
