/**
 * Utilidades para cálculo, posicionamiento y renderizado del orden de trazos (筆順 - Stroke Order)
 * y diagramas numerados para Kanjis.
 */

// Paleta cromática oficial de trazos con alto contraste (estándar para diagramas de caligrafía y orden de trazos)
export const STROKE_COLORS = [
  '#d32f2f', // 1: Rojo vivo
  '#5c4d32', // 2: Marrón cálido / Ocre
  '#8da571', // 3: Verde salvia
  '#6ab334', // 4: Verde lima
  '#2a9d8f', // 5: Verde azulado / Teal
  '#238636', // 6: Verde bosque profundo
  '#4f46e5', // 7: Índigo / Púrpura real
  '#65a30d', // 8: Verde oliva
  '#1d4ed8', // 9: Azul real
  '#1e3f20', // 10: Verde oscuro / Pizarra
  '#b91c1c', // 11: Carmesí profundo
  '#c026d3', // 12: Fucsia / Magenta
  '#0284c7', // 13: Azul cielo
  '#d97706', // 14: Ámbar / Dorado
  '#7c3aed', // 15: Violeta
  '#059669', // 16: Esmeralda
  '#ea580c', // 17: Naranja
  '#3b82f6', // 18: Azul primario
  '#047857', // 19: Verde pino
  '#be185d'  // 20: Rosa oscuro
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
export function getScalingTransform(size = 260, padding = 12) {
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
export function computeStrokeNumbers(charData, size = 260, padding = 12) {
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
