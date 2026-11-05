/**
 * Re-exportador de compatibilidad para Etiquetas de Vocabulario
 * Toda la lógica central reside en lib/tagUtils.js
 */
export {
  POPULAR_VOCAB_TAGS,
  POPULAR_VOCAB_TAG_SUGGESTIONS,
  getWordKey,
  getVocabTags,
  addTagToVocab,
  removeTagFromVocab,
  getAllUniqueVocabTags
} from './tagUtils';
