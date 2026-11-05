/**
 * Re-exportador de compatibilidad para Etiquetas de Kanjis
 * Toda la lógica central reside en lib/tagUtils.js
 */
export {
  POPULAR_KANJI_TAGS,
  POPULAR_TAG_SUGGESTIONS,
  DEFAULT_KANJI_TAGS,
  getKanjiTags,
  addTagToKanji,
  removeTagFromKanji,
  getAllUniqueTags
} from './tagUtils';
