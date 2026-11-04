/**
 * Utilidades para cálculo, posicionamiento y renderizado del orden de trazos (筆順 - Stroke Order)
 * y diagramas numerados para Kanjis.
 */

// Paleta cromática moderna y armónica con alto contraste y saturación vibrante
export const STROKE_COLORS = [
  '#ef4444', // 1: Rojo carmesí vivo
  '#3b82f6', // 2: Azul zafiro brillante
  '#10b981', // 3: Verde esmeralda fresco
  '#f59e0b', // 4: Ámbar cálido / Dorado
  '#8b5cf6', // 5: Púrpura violeta vivo
  '#06b6d4', // 6: Cian / Turquesa
  '#f43f5e', // 7: Rosa coral vibrante
  '#14b8a6', // 8: Verde azulado / Teal
  '#6366f1', // 9: Índigo real
  '#ea580c', // 10: Naranja fuego
  '#d946ef', // 11: Fucsia / Magenta
  '#0284c7', // 12: Azul cielo profundo
  '#16a34a', // 13: Verde hoja vivo
  '#e11d48', // 14: Rubí carmesí
  '#7c3aed', // 15: Violeta intenso
  '#0ea5e9', // 16: Azul eléctrico
  '#f97316', // 17: Naranja mandarina
  '#059669', // 18: Esmeralda intenso
  '#a855f7', // 19: Lila brillante
  '#475569'  // 20: Pizarra elegante
];

// URLs para resolución con fallback multi-CDN
export function getKanjiDataUrls(char) {
  if (!char) return [];
  const encoded = encodeURIComponent(char);
  return [
    `https://cdn.jsdelivr.net/npm/hanzi-writer-data-jp@0/${encoded}.json`,
    `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encoded}.json`,
    `https://unpkg.com/hanzi-writer-data-jp@0/${encoded}.json`,
    `https://unpkg.com/hanzi-writer-data@2.0/${encoded}.json`
  ];
}

// Caché en memoria para evitar descargas duplicadas de trazos
const strokeDataCache = new Map();

/**
 * Descarga y cachea la información vectorial de trazos de un Kanji
 */
export async function fetchKanjiStrokeData(char) {
  if (!char) return null;
  if (strokeDataCache.has(char)) {
    return strokeDataCache.get(char);
  }

  const urls = getKanjiDataUrls(char);
  let lastError = null;

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && Array.isArray(data.strokes) && Array.isArray(data.medians)) {
        strokeDataCache.set(char, data);
        return data;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error(`No se encontraron datos de trazos para el kanji ${char}`);
}

/**
 * Calcula la matriz y dimensiones de escalado SVG exactas para coordinar con HanziWriter
 * Límites del glifo: [ { x: 0, y: -124 }, { x: 1024, y: 900 } ] => 1024x1024
 */
export function getScalingTransform(size = 260, padding = 14) {
  const effectiveWidth = size - 2 * padding;
  const effectiveHeight = size - 2 * padding;
  const scale = Math.min(effectiveWidth / 1024, effectiveHeight / 1024);
  const xCenteringBuffer = padding + (effectiveWidth - scale * 1024) / 2;
  const yCenteringBuffer = padding + (effectiveHeight - scale * 1024) / 2;
  const xOffset = xCenteringBuffer;
  const yOffset = 124 * scale + yCenteringBuffer;

  return {
    scale,
    xOffset,
    yOffset,
    transform: `translate(${xOffset}, ${size - yOffset}) scale(${scale}, ${-scale})`
  };
}

/**
 * Calcula las coordenadas en pantalla, dirección y color para el número identificador
 * de cada trazo según el orden oficial de caligrafía japonesa.
 */
export function computeStrokeNumbers(charData, size = 260, padding = 14) {
  if (!charData || !Array.isArray(charData.strokes) || !Array.isArray(charData.medians)) {
    return [];
  }

  const { scale, xOffset, yOffset } = getScalingTransform(size, padding);
  const offsetDist = size >= 260 ? 15 : 12;
  const minBound = 14;
  const maxBound = size - 14;
  const result = [];

  for (let i = 0; i < charData.strokes.length; i++) {
    const strokePath = charData.strokes[i];
    const median = charData.medians[i];
    const color = STROKE_COLORS[i % STROKE_COLORS.length];

    if (!median || median.length === 0) continue;

    const p0 = median[0];
    const startX = xOffset + p0[0] * scale;
    const startY = (size - yOffset) - p0[1] * scale;

    let ux = 0.707;
    let uy = 0.707;

    if (median.length > 1) {
      const p1 = median[1];
      const dx = (p1[0] - p0[0]) * scale;
      const dy = - (p1[1] - p0[1]) * scale; // Invertido en pantalla porque Y crece hacia abajo
      const len = Math.hypot(dx, dy);
      if (len > 0.001) {
        ux = dx / len;
        uy = dy / len;
      }
    }

    // Coloca el número ligeramente atrás del vector de inicio del trazo para no tapar la tinta
    let numX = startX - ux * offsetDist;
    let numY = startY - uy * offsetDist;

    // Ajuste de límites para que no desborde el lienzo
    numX = Math.max(minBound, Math.min(maxBound, numX));
    numY = Math.max(minBound, Math.min(maxBound, numY));

    // Descongestión si dos números de inicio quedan demasiado juntos
    for (let j = 0; j < result.length; j++) {
      const prev = result[j];
      const dist = Math.hypot(numX - prev.numX, numY - prev.numY);
      if (dist < 15) {
        numX += (numX >= prev.numX ? 9 : -9);
        numY += (numY >= prev.numY ? 9 : -9);
        numX = Math.max(minBound, Math.min(maxBound, numX));
        numY = Math.max(minBound, Math.min(maxBound, numY));
      }
    }

    result.push({
      index: i,
      number: i + 1,
      path: strokePath,
      startX,
      startY,
      numX,
      numY,
      color,
      isRadical: charData.radStrokes ? charData.radStrokes.includes(i) : false
    });
  }

  return result;
}

/**
 * Mapeo exhaustivo del número oficial de trazos para todos los Hiragana y Katakana.
 */
export const KANA_STROKE_COUNTS = {
  // Hiragana Gojūon
  'あ': 3, 'い': 2, 'う': 2, 'え': 2, 'お': 3,
  'か': 3, 'き': 4, 'く': 1, 'け': 3, 'こ': 2,
  'さ': 3, 'し': 1, 'す': 2, 'せ': 3, 'そ': 1,
  'た': 4, 'ち': 2, 'つ': 1, 'て': 1, 'と': 2,
  'な': 4, 'に': 3, 'ぬ': 2, 'ね': 2, 'の': 1,
  'は': 3, 'ひ': 1, 'ふ': 4, 'へ': 1, 'ほ': 4,
  'ま': 3, 'み': 2, 'む': 3, 'め': 2, 'も': 3,
  'や': 3, 'ゆ': 2, 'よ': 2,
  'ら': 2, 'り': 2, 'る': 1, 'れ': 2, 'ろ': 1,
  'わ': 2, 'を': 3, 'ん': 1,
  // Hiragana Dakuten
  'が': 5, 'ぎ': 6, 'ぐ': 3, 'げ': 5, 'ご': 4,
  'ざ': 5, 'じ': 3, 'ず': 4, 'ぜ': 5, 'ぞ': 3,
  'だ': 6, 'ぢ': 4, 'づ': 3, 'で': 3, 'ど': 4,
  'ば': 5, 'び': 3, 'ぶ': 6, 'べ': 3, 'ぼ': 6,
  // Hiragana Handakuten
  'ぱ': 4, 'ぴ': 2, 'ぷ': 5, 'ぺ': 2, 'ぽ': 5,
  // Hiragana Pequeños y Arcaicos
  'ぁ': 3, 'ぃ': 2, 'ぅ': 2, 'ぇ': 2, 'ぉ': 3,
  'っ': 1, 'ゃ': 3, 'ゅ': 2, 'ょ': 2, 'ゎ': 2,
  'ゐ': 1, 'ゑ': 1, 'ゔ': 4,

  // Katakana Gojūon
  'ア': 2, 'イ': 2, 'ウ': 3, 'エ': 3, 'オ': 3,
  'カ': 2, 'キ': 3, 'ク': 2, 'ケ': 3, 'コ': 2,
  'サ': 3, 'シ': 3, 'ス': 2, 'セ': 2, 'ソ': 2,
  'タ': 3, 'チ': 3, 'ツ': 3, 'テ': 3, 'ト': 2,
  'ナ': 2, 'ニ': 2, 'ヌ': 2, 'ネ': 4, 'ノ': 1,
  'ハ': 2, 'ヒ': 2, 'フ': 1, 'ヘ': 1, 'ホ': 4,
  'マ': 2, 'ミ': 3, 'ム': 2, 'メ': 2, 'モ': 3,
  'ヤ': 2, 'ユ': 2, 'ヨ': 3,
  'ラ': 2, 'リ': 2, 'ル': 2, 'レ': 1, 'ロ': 3,
  'ワ': 2, 'ヲ': 3, 'ン': 2,
  // Katakana Dakuten
  'ガ': 4, 'ギ': 5, 'グ': 4, 'ゲ': 5, 'ゴ': 4,
  'ザ': 5, 'ジ': 5, 'ズ': 4, 'ゼ': 4, 'ゾ': 4,
  'ダ': 5, 'ヂ': 5, 'ヅ': 5, 'デ': 5, 'ド': 4,
  'バ': 4, 'ビ': 4, 'ブ': 3, 'ベ': 3, 'ボ': 6,
  // Katakana Handakuten
  'パ': 3, 'ピ': 3, 'プ': 2, 'ペ': 2, 'ポ': 5,
  // Katakana Pequeños, Especiales y Chōonpu
  'ァ': 2, 'ィ': 2, 'ゥ': 3, 'ェ': 3, 'ォ': 3,
  'ッ': 3, 'ャ': 2, 'ュ': 2, 'ョ': 3, 'ヮ': 2,
  'ヴ': 5, 'ヰ': 4, 'ヱ': 3, 'ヵ': 2, 'ヶ': 3, 'ー': 1
};

/**
 * Obtiene el número esperado de trazos para cualquier carácter japonés (Kanji, Hiragana o Katakana).
 */
export function getCharacterStrokeCount(char, kanjiList = null) {
  if (!char) return null;
  const singleChar = Array.from(char)[0];
  if (!singleChar) return null;

  // 1. Búsqueda en Kana
  if (KANA_STROKE_COUNTS[singleChar]) {
    return KANA_STROKE_COUNTS[singleChar];
  }

  // 2. Búsqueda en Caché vectorial de HanziWriter
  if (strokeDataCache.has(singleChar)) {
    const data = strokeDataCache.get(singleChar);
    if (data && Array.isArray(data.strokes) && data.strokes.length > 0) {
      return data.strokes.length;
    }
  }

  // 3. Búsqueda en listado de Kanjis (kanji.json)
  if (Array.isArray(kanjiList)) {
    const found = kanjiList.find(k => k.kanji === singleChar);
    if (found && typeof found.strokes === 'number' && found.strokes > 0) {
      return found.strokes;
    }
  }

  return null;
}

