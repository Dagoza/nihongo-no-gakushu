import * as wanakana from 'wanakana';
import { AIFacade } from '../../../../lib/ai/AIFacade.js';
import { convertKanjiToKanaSync, extractKanjis, containsKanji } from '../../../../lib/japaneseUtils.js';
import vocabularyData from '../../../../data/vocabulary.json';
import kanjiData from '../../../../data/kanji.json';
import pitchAccentsData from '../../../../data/pitch_accents.json';

const analyzeCache = new Map();
const MAX_CACHE_SIZE = 1500;

// Expresiones canónicas curadas de altísima frecuencia en la vida diaria
const CURATED_ANALYSIS = {
  'お先': {
    kanji: 'お先',
    hiragana: 'おさき',
    katakana: 'オサキ',
    romaji: 'osaki',
    meaning_es: 'Antes / Me adelanto / Por delante (despedida o acción anticipada)',
    literal_translation: 'Lo previo / el frente con prefijo de cortesía (お)',
    breakdown: 'お (prefijo honorífico de cortesía) + 先 (delante, anterior, previo)',
    example_sentence: 'お先に失礼します。',
    example_reading: 'おさきにしつれいします。',
    example_translation: 'Con su permiso, me retiro antes / Hasta mañana (despedida laboral cotidiana)',
    nuance_notes: 'Fórmula de cortesía o abreviatura coloquial de "お先に失礼します". En el trabajo en Japón se utiliza para avisar que uno se marcha antes que los compañeros. La respuesta estándar es "お疲れ様でした".',
    level: 'N5',
    category: 'Saludos y Cortesía',
    pitch: { pattern: 0, type: 'heiban' }
  },
  'お先に': {
    kanji: 'お先に',
    hiragana: 'おさきに',
    katakana: 'オサキニ',
    romaji: 'osaki ni',
    meaning_es: 'Antes / Por adelantado / Con su permiso me adelanto',
    literal_translation: 'Hacia adelante / previamente con cortesía',
    breakdown: 'お先 (antes, por delante) + に (partícula adverbial hacia)',
    example_sentence: 'お先にどうぞ。',
    example_reading: 'おさきにどうぞ。',
    example_translation: 'Pase usted primero / Adelante por favor.',
    nuance_notes: 'Expresión cortés para ceder el turno, el paso en una fila o avisar que uno toma la delantera.',
    level: 'N5',
    category: 'Saludos y Cortesía',
    pitch: { pattern: 0, type: 'heiban' }
  },
  'お先に失礼します': {
    kanji: 'お先に失礼します',
    hiragana: 'おさきにしつれいします',
    katakana: 'オサキニシツレイシマス',
    romaji: 'osaki ni shitsurei shimasu',
    meaning_es: 'Con su permiso me retiro antes / Hasta mañana (despedida formal en el trabajo)',
    literal_translation: 'Cometo una falta de cortesía antes que ustedes',
    breakdown: 'お先 (antes, por delante) + に (partícula) + 失礼 (falta de cortesía) + します (hago / cometo cortésmente)',
    example_sentence: 'お先に失礼します。お疲れさまでした。',
    example_reading: 'おさきにしつれいします。おつかれさまでした。',
    example_translation: 'Con su permiso me retiro antes. ¡Buen trabajo a todos!',
    nuance_notes: 'Norma social obligatoria en la cultura corporativa de Japón. Al salir del trabajo antes que los compañeros, se pide disculpas por marcharse primero. Los compañeros responden reconociendo el esfuerzo.',
    level: 'N5',
    category: 'Saludos y Cortesía',
    pitch: { pattern: 0, type: 'heiban' }
  },
  '失礼': {
    kanji: '失礼',
    hiragana: 'しつれい',
    katakana: 'シツレイ',
    romaji: 'shitsurei',
    meaning_es: 'Disculpe / Con su permiso / Perdón (saludo formal o disculpa)',
    literal_translation: 'Pérdida o falta de cortesía / descortesía',
    breakdown: '失 (perder, errar) + 礼 (cortesía, modales, etiqueta, reverencia)',
    example_sentence: 'お先に失礼します。',
    example_reading: 'おさきにしつれいします。',
    example_translation: 'Con su permiso, me retiro antes (fórmula canónica de despedida laboral)',
    nuance_notes: 'Pilar de la etiqueta japonesa. Da origen a las fórmulas esenciales: "失礼します" (al entrar a una sala o despedirse) y "失礼しました" (en pasado, para disculparse formalmente).',
    level: 'N5',
    category: 'Saludos y Cortesía',
    pitch: { pattern: 2, type: 'nakadaka' }
  },
  '失礼します': {
    kanji: '失礼します',
    hiragana: 'しつれいします',
    katakana: 'シツレイシマス',
    romaji: 'shitsurei shimasu',
    meaning_es: 'Con su permiso / Disculpe la molestia (al entrar, interrumpir o retirarse)',
    literal_translation: 'Cometo una descortesía',
    breakdown: '失礼 (descortesía) + します (hacer cortés)',
    example_sentence: '失礼します。山田です。',
    example_reading: 'しつれいします。やまだです。',
    example_translation: 'Con su permiso. Soy Yamada.',
    nuance_notes: 'Imprescindible al tocar la puerta y entrar al despacho de un profesor o jefe, al tomar asiento en una entrevista o al colgar una llamada.',
    level: 'N5',
    category: 'Saludos y Cortesía',
    pitch: { pattern: 2, type: 'nakadaka' }
  },
  '失礼しました': {
    kanji: '失礼しました',
    hiragana: 'しつれいしました',
    katakana: 'シツレイシマシタ',
    romaji: 'shitsurei shimashita',
    meaning_es: 'Disculpe la molestia / Perdone (tras una acción, error o al retirarse)',
    literal_translation: 'Cometí una descortesía',
    breakdown: '失礼 (descortesía) + しました (hizo en pasado cortés)',
    example_sentence: '大変失礼しました。',
    example_reading: 'たいへんしつれいしました。',
    example_translation: 'Le pido una sincera disculpa por la molestia.',
    nuance_notes: 'Forma en pasado cortés para disculparse educadamente o al finalizar una reunión.',
    level: 'N5',
    category: 'Saludos y Cortesía',
    pitch: { pattern: 2, type: 'nakadaka' }
  },
  'お疲れ様': {
    kanji: 'お疲れ様',
    hiragana: 'おつかれさま',
    katakana: 'オツカレサマ',
    romaji: 'otsukaresama',
    meaning_es: 'Buen trabajo / Muchas gracias por su esfuerzo',
    literal_translation: 'Usted es una persona venerable que lleva cansancio honorable (con sufijo 様 y prefijo お)',
    breakdown: 'お (prefijo honorífico) + 疲れ (cansancio / fatiga) + 様 (sufijo de máximo respeto)',
    example_sentence: '今日もお疲れ様でした！',
    example_reading: 'きょうもおつかれさまでした！',
    example_translation: '¡Muchas gracias por su trabajo de hoy!',
    nuance_notes: 'Saludo habitual entre colegas de trabajo al cruzarse por los pasillos o al terminar la jornada laboral.',
    level: 'N5',
    category: 'Saludos y Cortesía',
    pitch: { pattern: 0, type: 'heiban' }
  }
};

/**
 * Motor de desglose lingüístico local de alta precisión en caso de no disponer de IA o estar offline
 */
function localAnalyze(term, targetLevel = 'N5') {
  const clean = String(term || '').trim();
  const kList = extractKanjis(clean);
  const syncRes = convertKanjiToKanaSync(clean, [], vocabularyData || []);
  const safePitchMap = pitchAccentsData || {};
  const pitchEntry = safePitchMap[clean] || safePitchMap[syncRes.hiragana] || { pattern: 0, type: 'heiban' };

  // 1. Extraer desglose morfológico a partir de los kanjis y prefijos
  const parts = [];
  if (clean.startsWith('お')) {
    parts.push('お [prefijo honorífico de cortesía (bikago)]');
  } else if (clean.startsWith('ご')) {
    parts.push('ご [prefijo de respeto formal (keigo)]');
  }

  const kanjiMeanings = [];
  kList.forEach(kChar => {
    const kMeta = kanjiData.find(item => item.kanji === kChar);
    if (kMeta) {
      parts.push(`${kChar} (${kMeta.meaning_es || kMeta.meaning_en || 'kanji'})`);
      if (kMeta.meaning_es) kanjiMeanings.push(kMeta.meaning_es);
    } else {
      parts.push(kChar);
    }
  });

  // Si tiene terminación ます, ました, など
  if (clean.endsWith('します')) parts.push('します [verbo auxiliar cortés: hacer]');
  if (clean.endsWith('しました')) parts.push('しました [verbo auxiliar en pasado cortés: hizo]');

  const breakdownStr = parts.length > 0 ? parts.join(' + ') : clean;

  // 2. Traducción literal construida
  let literalStr = '';
  if (clean.startsWith('お') || clean.startsWith('ご')) {
    literalStr = `Cortesía + ${kanjiMeanings.join(' / ') || 'expresión'}`;
  } else if (kanjiMeanings.length > 0) {
    literalStr = kanjiMeanings.join(' / ');
  } else {
    literalStr = syncRes.meaning_es || 'Traducción directa de la raíz';
  }

  // 3. Buscar oración de ejemplo en el catálogo de vocabulario o kanji
  let exSentence = '';
  let exReading = '';
  let exTrans = '';

  for (const v of vocabularyData) {
    if (v.kanji && v.kanji !== clean && (v.kanji.includes(clean) || clean.includes(v.kanji))) {
      exSentence = v.example_sentence || `${v.kanji}。`;
      exReading = v.example_reading || v.hiragana || '';
      exTrans = v.example_translation || v.meaning_es || '';
      break;
    }
  }

  if (!exSentence && kList.length > 0) {
    const kFirst = kanjiData.find(k => k.kanji === kList[0]);
    if (kFirst && kFirst.words && kFirst.words.length > 0) {
      const matchW = kFirst.words.find(w => w.word !== clean && (w.word.includes(clean) || clean.includes(w.word))) || kFirst.words[0];
      if (matchW) {
        exSentence = `${matchW.word}。`;
        exReading = `${matchW.reading}。`;
        exTrans = matchW.meaning || '';
      }
    }
  }

  const hira = syncRes.hiragana || wanakana.toHiragana(clean);
  const kata = syncRes.katakana || wanakana.toKatakana(hira);

  return {
    kanji: clean,
    hiragana: hira,
    katakana: kata,
    romaji: wanakana.toRomaji(hira),
    meaning_es: syncRes.meaning_es || (kanjiMeanings.length > 0 ? kanjiMeanings.join(' / ') : clean),
    literal_translation: literalStr,
    breakdown: breakdownStr,
    example_sentence: exSentence || (clean + 'です。'),
    example_reading: exReading || (hira + 'です。'),
    example_translation: exTrans || `Es ${syncRes.meaning_es || clean}.`,
    nuance_notes: clean.startsWith('お') || clean.startsWith('ご') 
      ? 'Expresión con prefijo de cortesía que eleva el grado de deferencia y elegancia en la conversación.' 
      : 'Término de uso cotidiano estándar para estudiantes de japonés.',
    level: syncRes.level || targetLevel || 'N5',
    category: syncRes.category || 'Vocabulario General',
    pitch: {
      pattern: parseInt(pitchEntry.pattern, 10) || 0,
      type: pitchEntry.type || 'heiban'
    }
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rawText = body?.text || '';
    const requestedLevel = body?.level || 'N5';
    const clean = String(rawText).trim();

    if (!clean) {
      return Response.json({ error: 'Texto requerido para análisis' }, { status: 400 });
    }

    // 1. Memoria caché
    const cacheKey = `${clean}_${requestedLevel}`;
    if (analyzeCache.has(cacheKey)) {
      return Response.json(analyzeCache.get(cacheKey));
    }

    // 2. Coincidencia directa con expresiones curadas canónicas
    if (CURATED_ANALYSIS[clean]) {
      const curated = { ...CURATED_ANALYSIS[clean] };
      analyzeCache.set(cacheKey, curated);
      return Response.json(curated);
    }

    // 3. Intentar análisis inteligente con IA (Groq / Qwen / Llama)
    let aiResult = null;
    try {
      const ai = new AIFacade();
      const rawAi = await ai.analyzeVocabulary(clean, { level: requestedLevel });
      if (rawAi && (rawAi.hiragana || rawAi.meaning_es)) {
        // Garantizar limpieza de campos
        const finalHira = rawAi.hiragana ? wanakana.toHiragana(rawAi.hiragana.replace(/[\u4e00-\u9faf]/g, '')) : '';
        const finalKata = rawAi.katakana ? wanakana.toKatakana(rawAi.katakana) : (finalHira ? wanakana.toKatakana(finalHira) : '');
        
        // Obtener pitch accent del catálogo si existe, o el estimado por IA
        const safePitchMap = pitchAccentsData || {};
        const registeredPitch = safePitchMap[clean] || safePitchMap[finalHira];
        const pitchObj = registeredPitch ? {
          pattern: parseInt(registeredPitch.pattern, 10) || 0,
          type: registeredPitch.type || 'heiban'
        } : (rawAi.pitch || { pattern: 0, type: 'heiban' });

        aiResult = {
          kanji: rawAi.kanji || clean,
          hiragana: finalHira || wanakana.toHiragana(clean),
          katakana: finalKata,
          romaji: rawAi.romaji || wanakana.toRomaji(finalHira || clean),
          meaning_es: rawAi.meaning_es || '',
          literal_translation: rawAi.literal_translation || '',
          breakdown: rawAi.breakdown || '',
          example_sentence: rawAi.example_sentence || '',
          example_reading: rawAi.example_reading ? wanakana.toHiragana(rawAi.example_reading) : '',
          example_translation: rawAi.example_translation || '',
          nuance_notes: rawAi.nuance_notes || '',
          level: ['N5', 'N4', 'N3', 'N2', 'N1'].includes(rawAi.level) ? rawAi.level : requestedLevel,
          category: rawAi.category || 'Vocabulario General',
          pitch: pitchObj,
          source: 'AI-Linguistic'
        };
      }
    } catch (aiErr) {
      console.warn('AI Vocab Analysis fallback activado:', aiErr.message);
    }

    // 4. Si la IA tuvo éxito, devolverlo
    if (aiResult) {
      if (analyzeCache.size >= MAX_CACHE_SIZE) {
        const first = analyzeCache.keys().next().value;
        analyzeCache.delete(first);
      }
      analyzeCache.set(cacheKey, aiResult);
      return Response.json(aiResult);
    }

    // 5. Fallback local algorítmico y morfológico
    const fallback = localAnalyze(clean, requestedLevel);
    if (analyzeCache.size >= MAX_CACHE_SIZE) {
      const first = analyzeCache.keys().next().value;
      analyzeCache.delete(first);
    }
    analyzeCache.set(cacheKey, fallback);

    return Response.json(fallback);
  } catch (error) {
    console.error('Error en /api/vocab/analyze:', error);
    const cleanText = '';
    return Response.json(localAnalyze(cleanText), { status: 200 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || '';
    const level = searchParams.get('level') || 'N5';

    if (!text.trim()) {
      return Response.json({ error: 'Parámetro "text" requerido' }, { status: 400 });
    }

    // Reusar lógica de POST
    return await POST(new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, level })
    }));
  } catch (err) {
    return Response.json(localAnalyze(''), { status: 200 });
  }
}
