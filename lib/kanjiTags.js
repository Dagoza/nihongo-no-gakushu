/**
 * Sistema de Etiquetas (Tags) para Kanjis en Nihongo Master
 * Permite categorización semántica por defecto y seccionado personalizado por usuario.
 */

export const POPULAR_TAG_SUGGESTIONS = [
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
 * Obtiene las etiquetas de un kanji (combina etiquetas de usuario con valores por defecto)
 * @param {string} char Carácter kanji
 * @param {Object} userKanjiTags Mapa de etiquetas de appState.kanjiTags
 * @returns {string[]} Lista de etiquetas sin duplicados
 */
export function getKanjiTags(char, userKanjiTags = {}) {
  if (!char) return [];
  const userList = userKanjiTags?.[char];
  if (Array.isArray(userList)) {
    return userList;
  }
  return DEFAULT_KANJI_TAGS[char] || [];
}

/**
 * Añade una etiqueta a un kanji en el estado del usuario
 */
export function addTagToKanji(char, newTag, currentKanjiTags = {}) {
  if (!char || !newTag || !newTag.trim()) return currentKanjiTags;
  const tag = newTag.trim();
  const current = getKanjiTags(char, currentKanjiTags);
  if (current.includes(tag)) return currentKanjiTags;

  return {
    ...currentKanjiTags,
    [char]: [...current, tag]
  };
}

/**
 * Elimina una etiqueta de un kanji en el estado del usuario
 */
export function removeTagFromKanji(char, tagToRemove, currentKanjiTags = {}) {
  if (!char || !tagToRemove) return currentKanjiTags;
  const current = getKanjiTags(char, currentKanjiTags);
  const updated = current.filter(t => t !== tagToRemove);

  return {
    ...currentKanjiTags,
    [char]: updated
  };
}

/**
 * Recopila todas las etiquetas únicas presentes en una lista de kanjis dada
 */
export function getAllUniqueTags(kanjiList = [], userKanjiTags = {}) {
  const tagSet = new Set();
  
  // Agregar sugerencias populares si están en uso
  kanjiList.forEach(item => {
    const tags = getKanjiTags(item.kanji, userKanjiTags);
    tags.forEach(t => tagSet.add(t));
  });

  // Si hay etiquetas de usuario adicionales
  Object.values(userKanjiTags || {}).forEach(arr => {
    if (Array.isArray(arr)) {
      arr.forEach(t => tagSet.add(t));
    }
  });

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'es'));
}
