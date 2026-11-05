/**
 * Utilidad de Furigana para renderizar kanjis con anotaciones ruby (<ruby>kanji<rt>lectura</rt></ruby>)
 */
import furiganaDict from '../data/furigana_dict.js';

// Regex para detectar caracteres Kanji (incluyendo marca de repetición 々)
export const KANJI_REGEX = /[\u4e00-\u9faf\u3400-\u4dbf\u3005]/;

export function containsKanji(text = '') {
  if (!text || typeof text !== 'string') return false;
  return KANJI_REGEX.test(text);
}

// Compilamos la expresión regular de palabras ordenadas por longitud descendente
let cachedRegex = null;
function getDictionaryRegex() {
  if (!cachedRegex) {
    const keys = Object.keys(furiganaDict).sort((a, b) => b.length - a.length);
    const escaped = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    cachedRegex = new RegExp(escaped.join('|'), 'g');
  }
  return cachedRegex;
}

/**
 * Verifica si todos los kanjis de una secuencia continua se encuentran dominados
 */
export function isKanjiRunMastered(kanjiRun, masteredKanjis) {
  if (!masteredKanjis || !kanjiRun) return false;
  const isSet = masteredKanjis instanceof Set;
  const isArr = Array.isArray(masteredKanjis);
  for (const char of kanjiRun) {
    if (isSet && !masteredKanjis.has(char)) return false;
    if (isArr && !masteredKanjis.includes(char)) return false;
    if (!isSet && !isArr && !masteredKanjis[char]) return false;
  }
  return true;
}

/**
 * Alinea texto con kanjis (jp) y su lectura en kana (kana) para extraer anotaciones precisas
 */
export function alignFurigana(jp, kana, options = {}) {
  if (!jp || !kana || typeof jp !== 'string' || typeof kana !== 'string') return jp || '';
  if (!containsKanji(jp)) return jp;

  const { masteredKanjis = null } = options;
  const buildRuby = (kanji, rt) => {
    const isMastered = isKanjiRunMastered(kanji, masteredKanjis);
    const cls = `furigana-ruby${isMastered ? ' rt-mastered-hidden' : ''}`;
    const extraAttrs = isMastered ? ' tabindex="0" title="Kanji dominado (Toca o pasa el cursor para ver lectura)"' : '';
    return `<ruby class="${cls}"${extraAttrs}>${kanji}<rt>${rt}</rt></ruby>`;
  };

  let i = 0;
  let j = 0;
  let result = '';

  while (i < jp.length) {
    const charJp = jp[i];

    // Carácter no-kanji (hiragana, katakana, signo, espacio)
    if (!KANJI_REGEX.test(charJp)) {
      result += charJp;
      i++;
      if (j < kana.length && (charJp === kana[j] || (charJp === '〜' && kana[j] === '〜') || (charJp === ' ' && kana[j] === ' '))) {
        j++;
      } else if (j < kana.length && /[\s,.!?。、！？・〜~「」()（）]/.test(kana[j]) && !/[\s,.!?。、！？・〜~「」()（）]/.test(charJp)) {
        j++;
        if (j < kana.length && charJp === kana[j]) j++;
      }
      continue;
    }

    // Secuencia continua de kanjis
    let kanjiRun = '';
    while (i < jp.length && KANJI_REGEX.test(jp[i])) {
      kanjiRun += jp[i];
      i++;
    }

    // Si los kanjis están al final de jp
    if (i >= jp.length) {
      const remainingKana = kana.slice(j);
      const rt = remainingKana || furiganaDict[kanjiRun] || '';
      result += buildRuby(kanjiRun, rt);
      break;
    }

    // Encontrar ancla en jp
    let anchor = jp[i];
    let nextJ = kana.indexOf(anchor, j);

    if (nextJ === -1 || nextJ < j) {
      // Si el ancla no coincide exactamente en kana, usar diccionario
      const fallbackRt = furiganaDict[kanjiRun] || '';
      result += fallbackRt 
        ? buildRuby(kanjiRun, fallbackRt)
        : kanjiRun;
    } else {
      const rt = kana.slice(j, nextJ);
      result += buildRuby(kanjiRun, rt);
      j = nextJ;
    }
  }

  return result;
}

/**
 * Convierte cualquier texto en japonés a HTML con etiquetas <ruby> para los kanjis
 * @param {string} text - Texto en japonés (puede contener kanjis)
 * @param {string|null} kana - Lectura completa opcional en kana para alineación de precisión
 * @param {object} options - Opciones de renderizado (masteredKanjis: set/map/array)
 * @returns {string} - Cadena HTML con <ruby class="furigana-ruby">kanji<rt>lectura</rt></ruby>
 */
export function toFurigana(text, kana = null, options = {}) {
  if (!text || typeof text !== 'string') return text || '';
  if (!containsKanji(text)) return text;

  const { masteredKanjis = null } = options;

  // 1. Si tenemos kana explícito (ej: en ejemplos reales de gramática y contexto)
  if (kana && typeof kana === 'string' && kana.trim()) {
    const aligned = alignFurigana(text, kana, options);
    // Verificar si todos los kanjis quedaron anotados
    const remainingKanjis = aligned
      .replace(/<ruby[^>]*>.*?<\/ruby>/g, '')
      .match(new RegExp(KANJI_REGEX.source, 'g'));
    if (!remainingKanjis || remainingKanjis.length === 0) {
      return aligned;
    }
  }

  // 2. Anotación basada en diccionario general de kanjis y compuestos
  const reg = getDictionaryRegex();
  return text.replace(reg, (match) => {
    const reading = furiganaDict[match];
    if (!reading) return match;
    const isMastered = isKanjiRunMastered(match, masteredKanjis);
    const cls = `furigana-ruby${isMastered ? ' rt-mastered-hidden' : ''}`;
    const extraAttrs = isMastered ? ' tabindex="0" title="Kanji dominado (Toca o pasa el cursor para ver lectura)"' : '';
    return `<ruby class="${cls}"${extraAttrs}>${match}<rt>${reading}</rt></ruby>`;
  });
}
