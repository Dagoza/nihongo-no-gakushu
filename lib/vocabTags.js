/**
 * Sistema de Etiquetas (Tags) para Vocabulario en Nihongo Master
 * Permite categorización por defecto (categoría del diccionario) y seccionado personalizado por usuario.
 */

export const POPULAR_VOCAB_TAG_SUGGESTIONS = [
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

/**
 * Obtiene la clave única para una palabra
 */
export function getWordKey(item) {
  if (!item) return '';
  return item.id || item.kanji || item.kana || '';
}

/**
 * Obtiene las etiquetas de una palabra (categoría por defecto + etiquetas personalizadas del usuario)
 * @param {Object} item Objeto palabra
 * @param {Object} userVocabTags Mapa appState.vocabTags
 * @returns {string[]} Lista de etiquetas sin duplicados
 */
export function getVocabTags(item, userVocabTags = {}) {
  if (!item) return [];
  const key = getWordKey(item);
  const userList = userVocabTags?.[key] || (item.kanji ? userVocabTags?.[item.kanji] : null);

  const tags = new Set();
  
  // Si el usuario definió una lista personalizada de etiquetas para este ítem
  if (Array.isArray(userList)) {
    userList.forEach(t => tags.add(t));
  } else {
    // Si no ha personalizado, incluir su categoría original por defecto
    if (item.category && item.category.trim()) {
      tags.add(item.category.trim());
    }
  }

  return Array.from(tags);
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
 * Recopila todas las etiquetas únicas presentes en el catálogo y estado
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
