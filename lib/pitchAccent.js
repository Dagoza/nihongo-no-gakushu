import pitchAccentsData from '../data/pitch_accents.json';

/**
 * Segmenta una cadena en hiragana o katakana en sus moras fonológicas.
 * Las moras combinadas (拗音: きゃ, しゅ, ちょ, etc.) forman una única mora.
 * El sokuon (っ) y el hatsuon (ん) cuentan cada uno como una mora independiente.
 */
export function getMoras(kana) {
  if (!kana) return [];
  const clean = String(kana)
    .replace(/<[^>]+>/g, '')
    .replace(/[・\s]/g, '')
    .trim();
  const matches = clean.match(/[\u3040-\u309F\u30A0-\u30FF][\u3041\u3043\u3045\u3047\u3049\u3083\u3085\u3087\u308E\u30A1\u30A3\u30A5\u30A7\u30A9\u30E3\u30E5\u30E7\u30EE]?/g);
  return matches || clean.split('');
}

/**
 * Busca la información de pitch accent para una palabra o lectura en el diccionario
 */
export function getPitchInfo(word, reading) {
  const w = word ? String(word).trim() : '';
  const r = reading ? String(reading).trim() : '';

  // 1. Búsqueda exacta por palabra o lectura
  let entry = pitchAccentsData[w] || pitchAccentsData[r];

  // 2. Si no se encuentra, buscar por kana limpio
  if (!entry && r) {
    const cleanReading = r.replace(/[・\s]/g, '');
    entry = pitchAccentsData[cleanReading];
  }

  const effectiveReading = r || w;
  const moras = getMoras(effectiveReading);
  const moraCount = moras.length;

  if (entry) {
    const pattern = parseInt(entry.pattern, 10) || 0;
    let type = entry.type;
    if (!type) {
      if (pattern === 0) type = 'heiban';
      else if (pattern === 1) type = 'atamadaka';
      else if (pattern === moraCount) type = 'odaka';
      else type = 'nakadaka';
    }
    return {
      word: w,
      reading: entry.reading || effectiveReading,
      pattern,
      type,
      moraCount
    };
  }

  // 3. Fallback heurístico: Por defecto en japonés moderno ~50% de sustantivos son Heiban (⓪)
  return {
    word: w,
    reading: effectiveReading,
    pattern: 0,
    type: 'heiban',
    moraCount
  };
}

/**
 * Calcula la trayectoria de alturas (High / Low) para cada mora y para la partícula de prueba
 */
export function calculatePitchLevels(moras, pattern, particle = 'が') {
  const count = moras.length;
  const p = parseInt(pattern, 10);
  const levels = [];

  if (count === 0) {
    return { moraLevels: [], particleLevel: 'H', type: 'heiban' };
  }

  // Patrón ⓪ Heiban (Plano): L-H-H... + partícula H
  if (p === 0) {
    if (count === 1) {
      levels.push({ mora: moras[0], level: 'L', isDownstep: false });
    } else {
      levels.push({ mora: moras[0], level: 'L', isDownstep: false });
      for (let i = 1; i < count; i++) {
        levels.push({ mora: moras[i], level: 'H', isDownstep: false });
      }
    }
    return {
      moraLevels: levels,
      particleLevel: 'H',
      type: 'heiban'
    };
  }

  // Patrón ① Atamadaka (Pico Inicial): H-L-L... + partícula L
  if (p === 1) {
    levels.push({ mora: moras[0], level: 'H', isDownstep: count > 1 || !!particle });
    for (let i = 1; i < count; i++) {
      levels.push({ mora: moras[i], level: 'L', isDownstep: false });
    }
    return {
      moraLevels: levels,
      particleLevel: 'L',
      type: 'atamadaka'
    };
  }

  // Patrón ㊵ Odaka (Pico Final en la última mora, la caída ocurre en la PARTÍCULA): L-H...H + partícula L
  if (p === count) {
    levels.push({ mora: moras[0], level: 'L', isDownstep: false });
    for (let i = 1; i < count; i++) {
      const isLast = (i === count - 1);
      levels.push({ mora: moras[i], level: 'H', isDownstep: isLast });
    }
    return {
      moraLevels: levels,
      particleLevel: 'L',
      type: 'odaka'
    };
  }

  // Patrón Nakadaka (Pico Intermedio): L-H...H-L... + partícula L (caída tras la mora p)
  levels.push({ mora: moras[0], level: 'L', isDownstep: false });
  for (let i = 1; i < count; i++) {
    const moraIndex = i + 1; // 1-based index
    if (moraIndex <= p) {
      levels.push({ mora: moras[i], level: 'H', isDownstep: moraIndex === p });
    } else {
      levels.push({ mora: moras[i], level: 'L', isDownstep: false });
    }
  }

  return {
    moraLevels: levels,
    particleLevel: 'L',
    type: 'nakadaka'
  };
}

/**
 * Metadatos estilísticos para los 4 patrones canónicos
 */
export const PITCH_TYPES = {
  heiban: {
    name: 'Heiban',
    jp: '平板型',
    code: '⓪',
    color: '#0284c7', // Sky / Cyan
    colorDark: '#38bdf8',
    bg: 'rgba(14, 165, 233, 0.12)',
    border: 'rgba(14, 165, 233, 0.35)',
    description: 'Plano (⓪): La voz sube en la 2ª mora y se mantiene alta. La partícula adjunta se pronuncia ALTA.'
  },
  atamadaka: {
    name: 'Atamadaka',
    jp: '頭高型',
    code: '①',
    color: '#e11d48', // Rose / Red
    colorDark: '#fb7185',
    bg: 'rgba(225, 29, 72, 0.12)',
    border: 'rgba(225, 29, 72, 0.35)',
    description: 'Pico inicial (①): La 1ª mora es ALTA y cae de inmediato. Todas las siguientes y la partícula son BAJAS.'
  },
  nakadaka: {
    name: 'Nakadaka',
    jp: '中高型',
    code: '②/③',
    color: '#d97706', // Amber
    colorDark: '#fbbf24',
    bg: 'rgba(217, 119, 6, 0.12)',
    border: 'rgba(217, 119, 6, 0.35)',
    description: 'Pico intermedio: La voz sube y cae después de la mora indicada. Las partículas son BAJAS.'
  },
  odaka: {
    name: 'Odaka',
    jp: '尾高型',
    code: '㊵',
    color: '#7c3aed', // Purple / Violet
    colorDark: '#a78bfa',
    bg: 'rgba(124, 58, 237, 0.12)',
    border: 'rgba(124, 58, 237, 0.35)',
    description: 'Pico final: La palabra se mantiene ALTA hasta el final, pero la PARTÍCULA adjunta (が) CAE a tono bajo.'
  }
};
