/**
 * Utilidades para procesamiento y tokenización del idioma japonés
 */

// Rango Unicode de Hiragana a Katakana: shift de 0x60 (96)
export function hiraganaToKatakana(str = '') {
  if (!str) return '';
  return str.replace(/[\u3041-\u3096]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) + 0x60)
  );
}

export function katakanaToHiragana(str = '') {
  if (!str) return '';
  return str.replace(/[\u30a1-\u30f6]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60)
  );
}

// Verifica si un carácter es Kanji
export function isKanjiChar(char = '') {
  if (!char) return false;
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9faf) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf)    // CJK Extension A
  );
}

// Extrae todos los kanjis únicos de un texto
export function extractKanjis(text = '') {
  if (!text) return [];
  const chars = Array.from(text);
  const kanjis = chars.filter(isKanjiChar);
  return Array.from(new Set(kanjis));
}

// Verifica si una cadena contiene al menos un kanji
export function containsKanji(text = '') {
  return /[\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
}

// Segmentador nativo de japonés usando Intl.Segmenter
export function tokenizeJapanese(text = '') {
  if (!text) return [];

  // Usar Intl.Segmenter si está disponible en el navegador/entorno
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
      const segments = Array.from(segmenter.segment(text));
      return segments.map(s => ({
        text: s.segment,
        isWordLike: s.isWordLike,
        index: s.index
      }));
    } catch (e) {
      console.warn('Intl.Segmenter fallback:', e);
    }
  }

  // Fallback simple por caracteres y partículas si Intl.Segmenter no estuviera soportado
  const tokens = [];
  let current = '';
  for (const char of text) {
    if (/[\s,.!?。、！？]/.test(char)) {
      if (current) {
        tokens.push({ text: current, isWordLike: true });
        current = '';
      }
      tokens.push({ text: char, isWordLike: false });
    } else {
      current += char;
    }
  }
  if (current) tokens.push({ text: current, isWordLike: true });
  return tokens;
}

// Formateador de tiempo mm:ss o hh:mm:ss
export function formatTimestamp(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const pad = (n) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}
