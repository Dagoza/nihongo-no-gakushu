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
 * Alinea texto con kanjis (jp) y su lectura en kana (kana) para extraer anotaciones precisas
 */
export function alignFurigana(jp, kana) {
  if (!jp || !kana || typeof jp !== 'string' || typeof kana !== 'string') return jp || '';
  if (!containsKanji(jp)) return jp;

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
      result += `<ruby class="furigana-ruby">${kanjiRun}<rt>${rt}</rt></ruby>`;
      break;
    }

    // Encontrar ancla en jp
    let anchor = jp[i];
    let nextJ = kana.indexOf(anchor, j);

    if (nextJ === -1 || nextJ < j) {
      // Si el ancla no coincide exactamente en kana, usar diccionario
      const fallbackRt = furiganaDict[kanjiRun] || '';
      result += fallbackRt 
        ? `<ruby class="furigana-ruby">${kanjiRun}<rt>${fallbackRt}</rt></ruby>`
        : kanjiRun;
    } else {
      const rt = kana.slice(j, nextJ);
      result += `<ruby class="furigana-ruby">${kanjiRun}<rt>${rt}</rt></ruby>`;
      j = nextJ;
    }
  }

  return result;
}

/**
 * Convierte cualquier texto en japonés a HTML con etiquetas <ruby> para los kanjis
 * @param {string} text - Texto en japonés (puede contener kanjis)
 * @param {string|null} kana - Lectura completa opcional en kana para alineación de precisión
 * @returns {string} - Cadena HTML con <ruby class="furigana-ruby">kanji<rt>lectura</rt></ruby>
 */
export function toFurigana(text, kana = null) {
  if (!text || typeof text !== 'string') return text || '';
  if (!containsKanji(text)) return text;

  // 1. Si tenemos kana explícito (ej: en ejemplos reales de gramática y contexto)
  if (kana && typeof kana === 'string' && kana.trim()) {
    const aligned = alignFurigana(text, kana);
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
    return `<ruby class="furigana-ruby">${match}<rt>${reading}</rt></ruby>`;
  });
}
