/**
 * Utilidades para procesamiento y tokenización del idioma japonés
 */
import dictionaryData from '../data/dictionary.json';

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

// Verifica si un carácter es Kanji (incluyendo marca de repetición 々)
export function isKanjiChar(char = '') {
  if (!char) return false;
  const code = char.charCodeAt(0);
  return (
    code === 0x3005 ||                    // Ideographic iteration mark 々
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
  return /[\u4e00-\u9faf\u3400-\u4dbf\u3005]/.test(text);
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

// Partículas gramaticales clave del japonés con sus explicaciones
export const PARTICLES = {
  'は': { name: 'Partícula は (wa)', meaning_es: 'Marcador de tema principal ("En cuanto a...")', level: 'N5', role: 'Partícula' },
  'が': { name: 'Partícula が (ga)', meaning_es: 'Marcador de sujeto específico o agente de la acción', level: 'N5', role: 'Partícula' },
  'を': { name: 'Partícula を (wo/o)', meaning_es: 'Marcador de objeto directo ("indica sobre qué recae el verbo")', level: 'N5', role: 'Partícula' },
  'に': { name: 'Partícula に (ni)', meaning_es: 'Destino, punto temporal específico o ubicación estática', level: 'N5', role: 'Partícula' },
  'で': { name: 'Partícula で (de)', meaning_es: 'Lugar donde ocurre una acción, medio o instrumento ("en / con / por medio de")', level: 'N5', role: 'Partícula' },
  'へ': { name: 'Partícula へ (e)', meaning_es: 'Dirección o rumbo de movimiento ("hacia")', level: 'N5', role: 'Partícula' },
  'と': { name: 'Partícula と (to)', meaning_es: 'Conector exhaustivo ("y") o marcador de compañía ("con")', level: 'N5', role: 'Partícula' },
  'も': { name: 'Partícula も (mo)', meaning_es: 'Inclusión ("también / tampoco")', level: 'N5', role: 'Partícula' },
  'から': { name: 'Partícula から (kara)', meaning_es: 'Origen temporal o espacial ("desde"), o causa ("porque")', level: 'N5', role: 'Partícula' },
  'まで': { name: 'Partícula まで (made)', meaning_es: 'Límite temporal o espacial ("hasta")', level: 'N5', role: 'Partícula' },
  'より': { name: 'Partícula より (yori)', meaning_es: 'Comparación ("más que / a partir de")', level: 'N5', role: 'Partícula' },
  'の': { name: 'Partícula の (no)', meaning_es: 'Posesión, pertenencia o modificación ("de")', level: 'N5', role: 'Partícula' },
  'ね': { name: 'Partícula final ね (ne)', meaning_es: 'Partícula de empatía o confirmación ("¿verdad? / ¿no?")', level: 'N5', role: 'Partícula' },
  'よ': { name: 'Partícula final よ (yo)', meaning_es: 'Partícula enfática de información nueva ("¡te aseguro que...!")', level: 'N5', role: 'Partícula' },
  'か': { name: 'Partícula interrogativa か (ka)', meaning_es: 'Signo de interrogación oral ("¿?")', level: 'N5', role: 'Partícula' },
  'や': { name: 'Partícula や (ya)', meaning_es: 'Conector no exhaustivo ("y tal como...")', level: 'N5', role: 'Partícula' }
};

// Cópulas en japonés ordenadas por longitud
export const COPULAS = [
  { form: 'ではありませんでした', base: 'です', formality: 'formal', polarity: 'negative', tense: 'past', meaning_es: 'Cópula negativa formal en pasado (No era / No fue)', role: 'Cópula' },
  { form: 'じゃありませんでした', base: 'です', formality: 'polite', polarity: 'negative', tense: 'past', meaning_es: 'Cópula negativa cortés en pasado (No era / No fue)', role: 'Cópula' },
  { form: 'ではありません', base: 'です', formality: 'formal', polarity: 'negative', tense: 'present', meaning_es: 'Cópula negativa formal (No es / No está)', role: 'Cópula' },
  { form: 'じゃありません', base: 'です', formality: 'polite', polarity: 'negative', tense: 'present', meaning_es: 'Cópula negativa cortés (No es / No está)', role: 'Cópula' },
  { form: 'ではなかった', base: 'だ', formality: 'plain', polarity: 'negative', tense: 'past', meaning_es: 'Cópula negativa informal en pasado (No era / No fue)', role: 'Cópula' },
  { form: 'じゃなかった', base: 'だ', formality: 'plain', polarity: 'negative', tense: 'past', meaning_es: 'Cópula negativa informal en pasado (No era / No fue)', role: 'Cópula' },
  { form: 'ではない', base: 'だ', formality: 'plain', polarity: 'negative', tense: 'present', meaning_es: 'Cópula negativa informal (No es / No está)', role: 'Cópula' },
  { form: 'じゃない', base: 'だ', formality: 'plain', polarity: 'negative', tense: 'present', meaning_es: 'Cópula negativa informal/coloquial (No es / No está)', role: 'Cópula' },
  { form: 'でした', base: 'です', formality: 'polite', polarity: 'affirmative', tense: 'past', meaning_es: 'Cópula afirmativa cortés en pasado (Era / Fue / Estuvo)', role: 'Cópula' },
  { form: 'だった', base: 'だ', formality: 'plain', polarity: 'affirmative', tense: 'past', meaning_es: 'Cópula afirmativa informal en pasado (Era / Fue / Estuvo)', role: 'Cópula' },
  { form: 'でしょう', base: 'です', formality: 'polite', polarity: 'conjectural', tense: 'future/present', meaning_es: 'Cópula conjetural cortés (Probablemente sea / ¿Verdad?)', role: 'Cópula' },
  { form: 'だろう', base: 'だ', formality: 'plain', polarity: 'conjectural', tense: 'future/present', meaning_es: 'Cópula conjetural informal (Probablemente sea / ¿Cierto?)', role: 'Cópula' },
  { form: 'です', base: 'です', formality: 'polite', polarity: 'affirmative', tense: 'present', meaning_es: 'Cópula afirmativa cortés (Es / Son / Está)', role: 'Cópula' },
  { form: 'だ', base: 'だ', formality: 'plain', polarity: 'affirmative', tense: 'present', meaning_es: 'Cópula afirmativa informal (Es / Son / Está)', role: 'Cópula' }
];

// Sufijos de cortesía y tratamiento de personas
export const SUFFIXES = [
  { form: 'さん', role: 'Sufijo Honorífico', meaning_es: 'Tratamiento de cortesía estándar (Sr. / Sra. / Don)' },
  { form: '様', role: 'Sufijo Honorífico', meaning_es: 'Tratamiento de máximo respeto / honorífico' },
  { form: 'さま', role: 'Sufijo Honorífico', meaning_es: 'Tratamiento de máximo respeto / honorífico' },
  { form: 'ちゃん', role: 'Sufijo Afectivo', meaning_es: 'Diminutivo cariñoso para niños o personas queridas' },
  { form: 'くん', role: 'Sufijo Familiar', meaning_es: 'Tratamiento familiar/masculino para jóvenes' },
  { form: '君', role: 'Sufijo Familiar', meaning_es: 'Tratamiento familiar/masculino para jóvenes' },
  { form: 'たち', role: 'Sufijo Plural', meaning_es: 'Pluralizador para personas ("y su grupo")' },
  { form: '達', role: 'Sufijo Plural', meaning_es: 'Pluralizador para personas ("y su grupo")' },
  { form: '方', role: 'Sufijo Plural', meaning_es: 'Pluralizador formal para personas ("las señoras/señores")' }
];

// Tokens gramaticales unificados ordenados por longitud descendente
export const GRAMMAR_TOKENS = [
  ...COPULAS.map(c => ({ form: c.form, role: 'Cópula', meaning_es: c.meaning_es, level: 'N5' })),
  { form: 'から', role: 'Partícula', meaning_es: 'Origen temporal o espacial ("desde"), o causa ("porque")', level: 'N5' },
  { form: 'まで', role: 'Partícula', meaning_es: 'Límite temporal o espacial ("hasta")', level: 'N5' },
  { form: 'より', role: 'Partícula', meaning_es: 'Comparación ("más que / a partir de")', level: 'N5' },
  { form: 'など', role: 'Partícula', meaning_es: 'Inclusión no exhaustiva ("etcétera / entre otros")', level: 'N5' },
  { form: 'は', role: 'Partícula', meaning_es: 'Marcador de tema principal ("En cuanto a...")', level: 'N5' },
  { form: 'が', role: 'Partícula', meaning_es: 'Marcador de sujeto específico o agente de la acción', level: 'N5' },
  { form: 'を', role: 'Partícula', meaning_es: 'Marcador de objeto directo ("indica sobre qué recae el verbo")', level: 'N5' },
  { form: 'に', role: 'Partícula', meaning_es: 'Destino, punto temporal específico o ubicación estática', level: 'N5' },
  { form: 'で', role: 'Partícula', meaning_es: 'Lugar donde ocurre una acción, medio o instrumento ("en / con / por medio de")', level: 'N5' },
  { form: 'へ', role: 'Partícula', meaning_es: 'Dirección o rumbo de movimiento ("hacia")', level: 'N5' },
  { form: 'と', role: 'Partícula', meaning_es: 'Conector exhaustivo ("y") o marcador de compañía ("con")', level: 'N5' },
  { form: 'も', role: 'Partícula', meaning_es: 'Inclusión ("también / tampoco")', level: 'N5' },
  { form: 'の', role: 'Partícula', meaning_es: 'Posesión, pertenencia o modificación ("de")', level: 'N5' },
  { form: 'ね', role: 'Partícula', meaning_es: 'Partícula de empatía o confirmación ("¿verdad? / ¿no?")', level: 'N5' },
  { form: 'よ', role: 'Partícula', meaning_es: 'Partícula enfática de información nueva ("¡te aseguro que...!")', level: 'N5' },
  { form: 'か', role: 'Partícula', meaning_es: 'Signo de interrogación oral ("¿?")', level: 'N5' },
  { form: 'や', role: 'Partícula', meaning_es: 'Conector no exhaustivo ("y tal como...")', level: 'N5' },
  { form: 'だ', role: 'Cópula', meaning_es: 'Cópula afirmativa informal (Es / Está)', level: 'N5' }
].sort((a, b) => b.form.length - a.form.length);

// Desinencias verbales progresivas y de estado continuo (Te-iru / De-iru)
export const TE_IRU_FORMS = [
  { suffix: 'ていませんでした', tense: 'progresivo pasado negativo cortés', meaning_es: 'No estaba haciendo' },
  { suffix: 'ていません', tense: 'progresivo negativo cortés', meaning_es: 'No está haciendo' },
  { suffix: 'ていました', tense: 'progresivo pasado cortés', meaning_es: 'Estaba haciendo' },
  { suffix: 'ています', tense: 'progresivo cortés', meaning_es: 'Está haciendo' },
  { suffix: 'ていない', tense: 'progresivo negativo informal', meaning_es: 'No está haciendo' },
  { suffix: 'ていた', tense: 'progresivo pasado informal', meaning_es: 'Estaba haciendo' },
  { suffix: 'ている', tense: 'progresivo informal', meaning_es: 'Está haciendo' },
  { suffix: 'てください', tense: 'petición cortés', meaning_es: 'Por favor haz' },
  { suffix: 'てはいけません', tense: 'prohibición formal', meaning_es: 'No se debe hacer' },
  { suffix: 'てもいいです', tense: 'permiso cortés', meaning_es: 'Se puede / está bien hacer' }
];

export const DE_IRU_FORMS = [
  { suffix: 'でいませんでした', tense: 'progresivo pasado negativo cortés', meaning_es: 'No estaba haciendo' },
  { suffix: 'でいません', tense: 'progresivo negativo cortés', meaning_es: 'No está haciendo' },
  { suffix: 'でいました', tense: 'progresivo pasado cortés', meaning_es: 'Estaba haciendo' },
  { suffix: 'でいます', tense: 'progresivo cortés', meaning_es: 'Está haciendo' },
  { suffix: 'でいない', tense: 'progresivo negativo informal', meaning_es: 'No está haciendo' },
  { suffix: 'でいた', tense: 'progresivo pasado informal', meaning_es: 'Estaba haciendo' },
  { suffix: 'でいる', tense: 'progresivo informal', meaning_es: 'Está haciendo' },
  { suffix: 'でください', tense: 'petición cortés', meaning_es: 'Por favor haz' },
  { suffix: 'ではいけません', tense: 'prohibición formal', meaning_es: 'No se debe hacer' },
  { suffix: 'でもいいです', tense: 'permiso cortés', meaning_es: 'Se puede / está bien hacer' }
];

// Desinencias verbales estándar para lematización (ordenadas de mayor a menor longitud)
export const VERB_INFLECTIONS = [
  { form: 'ませんでした', replacement: 'る', alt: 'う', tense: 'pasado negativo cortés', meaning_es: 'No [hizo]' },
  { form: 'ました', replacement: 'る', alt: 'う', tense: 'pasado afirmativo cortés', meaning_es: '[Hizo / Fue]' },
  { form: 'ません', replacement: 'る', alt: 'う', tense: 'presente negativo cortés', meaning_es: 'No [hace]' },
  { form: 'ます', replacement: 'る', alt: 'う', tense: 'presente afirmativo cortés', meaning_es: '[Hace / Hará]' },
  { form: 'ましょう', replacement: 'る', alt: 'う', tense: 'volitivo cortés', meaning_es: '¡Vamos a [hacer]!' },
  { form: 'たくないです', replacement: 'る', alt: 'う', tense: 'deseo negativo cortés', meaning_es: 'No querer [hacer]' },
  { form: 'たくない', replacement: 'る', alt: 'う', tense: 'deseo negativo informal', meaning_es: 'No querer [hacer]' },
  { form: 'たいです', replacement: 'る', alt: 'う', tense: 'deseo afirmativo cortés', meaning_es: 'Querer [hacer]' },
  { form: 'たい', replacement: 'る', alt: 'う', tense: 'deseo afirmativo informal', meaning_es: 'Querer [hacer]' },
  { form: 'くないです', replacement: 'い', tense: 'adjetivo negativo cortés', meaning_es: 'No es [adjetivo]' },
  { form: 'くない', replacement: 'い', tense: 'adjetivo negativo informal', meaning_es: 'No es [adjetivo]' },
  { form: 'かったです', replacement: 'い', tense: 'adjetivo pasado cortés', meaning_es: 'Era / Estaba [adjetivo]' },
  { form: 'かった', replacement: 'い', tense: 'adjetivo pasado informal', meaning_es: 'Era / Estaba [adjetivo]' },
  { form: 'くて', replacement: 'い', tense: 'adjetivo conectivo', meaning_es: 'Siendo [adjetivo] y...' }
];

// Desinencias de verbos する
export const SURU_INFLECTIONS = [
  { form: 'しませんでした', tense: 'pasado negativo cortés', meaning_es: 'no hizo' },
  { form: 'しました', tense: 'pasado afirmativo cortés', meaning_es: 'hizo' },
  { form: 'しません', tense: 'presente negativo cortés', meaning_es: 'no hace' },
  { form: 'します', tense: 'presente afirmativo cortés', meaning_es: 'hace / hará' },
  { form: 'したくないです', tense: 'deseo negativo cortés', meaning_es: 'no querer hacer' },
  { form: 'したくない', tense: 'deseo negativo informal', meaning_es: 'no querer hacer' },
  { form: 'たいです', tense: 'deseo afirmativo cortés', meaning_es: 'querer hacer' },
  { form: 'たい', tense: 'deseo afirmativo informal', meaning_es: 'querer hacer' },
  { form: 'てください', tense: 'petición cortés', meaning_es: 'por favor haz' },
  { form: 'ています', tense: 'progresivo cortés', meaning_es: 'está haciendo' },
  { form: 'ている', tense: 'progresivo informal', meaning_es: 'está haciendo' },
  { form: 'した', tense: 'pasado afirmativo informal', meaning_es: 'hizo' },
  { form: 'して', tense: 'forma te / conectiva', meaning_es: 'haciendo / haz' },
  { form: 'する', tense: 'forma diccionario', meaning_es: 'hacer' },
  { form: 'できる', tense: 'forma potencial', meaning_es: 'poder hacer / ser capaz' }
];

// Construir diccionarios indexados en memoria a partir de dictionary.json
const SINGLE_CHAR_GRAMMAR_SET = new Set(['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'の', 'ね', 'よ', 'か', 'や', 'だ']);

const dictByKanji = new Map();
const dictByHiragana = new Map();
const dictByRomaji = new Map();

(dictionaryData || []).forEach(e => {
  const k = (e.kanji || '').trim();
  const h = (e.hiragana || '').trim();
  const r = (e.romaji || '').trim().toLowerCase();

  if (k && !dictByKanji.has(k)) dictByKanji.set(k, e);
  if (h && !SINGLE_CHAR_GRAMMAR_SET.has(h) && !dictByHiragana.has(h)) {
    dictByHiragana.set(h, e);
  }
  if (r && !dictByRomaji.has(r)) dictByRomaji.set(r, e);
});

// Diccionario integrado para autocompletar lecturas y definiciones comunes (compatibilidad retroactiva)
export const COMMON_WORD_DICT = {};
(dictionaryData || []).forEach(e => {
  if (e.kanji) COMMON_WORD_DICT[e.kanji] = e;
  if (e.hiragana && !COMMON_WORD_DICT[e.hiragana]) COMMON_WORD_DICT[e.hiragana] = e;
});

/**
 * Busca coincidencia directa en el diccionario, vocabulario de usuario o catálogo
 */
export function lookupDirectWord(word = '', customVocab = [], externalVocab = []) {
  if (!word) return null;
  const clean = word.trim();
  if (!clean) return null;

  // A. Vocabulario personalizado del usuario
  if (customVocab && customVocab.length > 0) {
    const fromCustom = customVocab.find(
      v => v.kanji === clean || v.kana === clean || v.hiragana === clean || v.katakana === clean
    );
    if (fromCustom) {
      const hira = fromCustom.hiragana || fromCustom.kana || '';
      return {
        kanji: fromCustom.kanji || clean,
        hiragana: hira,
        katakana: fromCustom.katakana || hiraganaToKatakana(hira || clean),
        romaji: fromCustom.romaji || '',
        meaning_es: fromCustom.meaning_es || '',
        level: fromCustom.level || 'N5',
        category: fromCustom.category || 'Vocabulario Personal',
        source: 'Usuario'
      };
    }
  }

  // B. Diccionario por Kanji
  if (dictByKanji.has(clean)) {
    return dictByKanji.get(clean);
  }

  // C. Diccionario por Hiragana (si no es partícula de 1 carácter)
  if (!SINGLE_CHAR_GRAMMAR_SET.has(clean) && dictByHiragana.has(clean)) {
    return dictByHiragana.get(clean);
  }

  // D. Catálogo general externo
  if (externalVocab && externalVocab.length > 0) {
    const fromExternal = externalVocab.find(
      v => v.kanji === clean || v.kana === clean || v.hiragana === clean
    );
    if (fromExternal) {
      const hira = fromExternal.hiragana || fromExternal.kana || '';
      return {
        kanji: fromExternal.kanji || clean,
        hiragana: hira,
        katakana: fromExternal.katakana || hiraganaToKatakana(hira || clean),
        romaji: fromExternal.romaji || '',
        meaning_es: fromExternal.meaning_es || '',
        level: fromExternal.level || 'N5',
        category: fromExternal.category || 'Catálogo General',
        source: 'Catálogo Nihongo'
      };
    }
  }

  // E. Búsqueda por Romaji
  const cleanLower = clean.toLowerCase();
  if (dictByRomaji.has(cleanLower)) {
    return dictByRomaji.get(cleanLower);
  }

  return null;
}

/**
 * Búsqueda semántica por significado en español en todo el diccionario
 */
export function searchSpanishInDictionary(query = '', customVocab = [], externalVocab = [], limit = 15) {
  const norm = (query || '').trim().toLowerCase();
  if (!norm) return [];

  const seen = new Set();
  const results = [];

  const pool = [
    ...(customVocab || []).map(v => ({ ...v, source: 'Usuario' })),
    ...(dictionaryData || []),
    ...(externalVocab || []).map(v => ({ ...v, source: 'Catálogo' }))
  ];

  for (const item of pool) {
    if (!item.meaning_es) continue;
    const key = item.kanji || item.hiragana;
    if (!key || seen.has(key)) continue;

    const m = item.meaning_es.toLowerCase();
    let score = 0;

    const tokens = m.split(/[\/;,()]+/).map(t => t.trim());
    if (tokens.some(t => t === norm)) {
      score += 60;
    } else if (tokens.some(t => t.startsWith(norm))) {
      score += 35;
    } else if (new RegExp('\\b' + norm + '\\b', 'i').test(m)) {
      score += 25;
    } else if (m.includes(norm)) {
      score += 10;
    }

    if (score > 0) {
      seen.add(key);
      const hira = item.hiragana || item.kana || '';
      results.push({
        kanji: item.kanji || key,
        hiragana: hira,
        katakana: item.katakana || hiraganaToKatakana(hira || key),
        romaji: item.romaji || '',
        meaning_es: item.meaning_es,
        level: item.level || 'N5',
        category: item.category || 'Vocabulario',
        source: item.source || 'Diccionario',
        score
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

/**
 * Desarticula y lematiza cualquier verbo o adjetivo flexionado al infinitivo/forma base
 */
export function deinflectWord(rawWord = '', customVocab = [], externalVocab = []) {
  if (!rawWord) return null;
  const clean = rawWord.trim();
  if (!clean) return null;

  // 1. Desinencias continuas Te-iru (〜ています, 〜ていました, 〜ていない, etc.)
  for (const item of TE_IRU_FORMS) {
    if (clean.endsWith(item.suffix) && clean.length > item.suffix.length) {
      const stem = clean.slice(0, -item.suffix.length);

      // Verbos Godan con sokuon っ (待つ -> 待って, 買う -> 買って, 帰る -> 帰って)
      if (stem.endsWith('っ')) {
        const prefix = stem.slice(0, -1);
        for (const end of ['つ', 'う', 'る']) {
          const entry = lookupDirectWord(prefix + end, customVocab, externalVocab);
          if (entry) {
            return {
              base: prefix + end,
              entry,
              inflection: item,
              separatedEnding: item.suffix,
              resolvedReading: (entry.hiragana ? entry.hiragana.slice(0, -1) + 'っ' + item.suffix : '')
            };
          }
        }
      }

      // Verbos Godan con い (書く -> 書いて, 行く -> 行って)
      if (stem.endsWith('い')) {
        if (clean.startsWith('行っ')) {
          const entry = lookupDirectWord('行く', customVocab, externalVocab);
          if (entry) {
            return {
              base: '行く',
              entry,
              inflection: item,
              separatedEnding: item.suffix,
              resolvedReading: clean.startsWith('行って') ? 'いって' + item.suffix.slice(1) : 'いっ' + item.suffix
            };
          }
        }
        const prefix = stem.slice(0, -1);
        const entry = lookupDirectWord(prefix + 'く', customVocab, externalVocab);
        if (entry) {
          return {
            base: prefix + 'く',
            entry,
            inflection: item,
            separatedEnding: item.suffix,
            resolvedReading: (entry.hiragana ? entry.hiragana.slice(0, -1) + 'い' + item.suffix : '')
          };
        }
      }

      // Verbos Godan con し (話す -> 話して)
      if (stem.endsWith('し')) {
        const prefix = stem.slice(0, -1);
        const entry = lookupDirectWord(prefix + 'す', customVocab, externalVocab);
        if (entry) {
          return {
            base: prefix + 'す',
            entry,
            inflection: item,
            separatedEnding: item.suffix,
            resolvedReading: (entry.hiragana ? entry.hiragana.slice(0, -1) + 'し' + item.suffix : '')
          };
        }
      }

      // Verbos Ichidan (食べる -> 食べて, 見る -> 見て)
      const ichidan = stem + 'る';
      const entryIchidan = lookupDirectWord(ichidan, customVocab, externalVocab);
      if (entryIchidan) {
        return {
          base: ichidan,
          entry: entryIchidan,
          inflection: item,
          separatedEnding: item.suffix,
          resolvedReading: (entryIchidan.hiragana ? entryIchidan.hiragana.slice(0, -1) + item.suffix : '')
        };
      }

      // Verbos する (勉強している, 運動しています)
      if (stem.endsWith('し')) {
        const suruStem = stem.slice(0, -1);
        const entrySuru = lookupDirectWord(suruStem + 'する', customVocab, externalVocab) ||
                          lookupDirectWord(suruStem, customVocab, externalVocab);
        if (entrySuru) {
          const baseHira = entrySuru.hiragana || '';
          return {
            base: suruStem + 'する',
            entry: entrySuru,
            inflection: item,
            separatedEnding: item.suffix,
            resolvedReading: baseHira ? baseHira.replace(/する$/, '') + 'し' + item.suffix : ''
          };
        }
      }
    }
  }

  // 2. Desinencias continuas De-iru (〜でいます, 〜でいました, etc.)
  for (const item of DE_IRU_FORMS) {
    if (clean.endsWith(item.suffix) && clean.length > item.suffix.length) {
      const stem = clean.slice(0, -item.suffix.length);
      // Godan con ん (飲む -> 飲んで, 読む -> 読んで, 遊ぶ -> 遊んで)
      if (stem.endsWith('ん')) {
        const prefix = stem.slice(0, -1);
        for (const end of ['む', 'ぶ', 'ぬ']) {
          const entry = lookupDirectWord(prefix + end, customVocab, externalVocab);
          if (entry) {
            return {
              base: prefix + end,
              entry,
              inflection: item,
              separatedEnding: item.suffix,
              resolvedReading: (entry.hiragana ? entry.hiragana.slice(0, -1) + 'ん' + item.suffix : '')
            };
          }
        }
      }
      // Godan con い (泳ぐ -> 泳いで)
      if (stem.endsWith('い')) {
        const prefix = stem.slice(0, -1);
        const entry = lookupDirectWord(prefix + 'ぐ', customVocab, externalVocab);
        if (entry) {
          return {
            base: prefix + 'ぐ',
            entry,
            inflection: item,
            separatedEnding: item.suffix,
            resolvedReading: (entry.hiragana ? entry.hiragana.slice(0, -1) + 'い' + item.suffix : '')
          };
        }
      }
    }
  }

  // 3. Desinencias verbales estándar (ました, ます, ません, ましょう, たい, etc.)
  for (const inf of VERB_INFLECTIONS) {
    if (clean.endsWith(inf.form) && clean.length > inf.form.length) {
      const stem = clean.slice(0, -inf.form.length);

      // Verbos Ichidan: stem + る (食べました -> 食べる, 見ました -> 見る)
      const ichidan = stem + 'る';
      const entryIchidan = lookupDirectWord(ichidan, customVocab, externalVocab);
      if (entryIchidan) {
        return {
          base: ichidan,
          entry: entryIchidan,
          inflection: inf,
          separatedEnding: inf.form,
          resolvedReading: (entryIchidan.hiragana ? entryIchidan.hiragana.slice(0, -1) + inf.form : '')
        };
      }

      // Adjetivos -i (美味しかった -> 美味しい, 高くない -> 高い)
      if (inf.form.startsWith('く') || inf.form.startsWith('かっ')) {
        const adj = stem + 'い';
        const entryAdj = lookupDirectWord(adj, customVocab, externalVocab);
        if (entryAdj) {
          return {
            base: adj,
            entry: entryAdj,
            inflection: inf,
            separatedEnding: inf.form,
            resolvedReading: (entryAdj.hiragana ? entryAdj.hiragana.slice(0, -1) + inf.form : '')
          };
        }
      }

      // Verbos Godan: stem termina en fila -i, cambiar a fila -u (行きます -> 行く, 飲みます -> 飲む)
      const godanMap = { 'い':'う', 'き':'く', 'ぎ':'ぐ', 'し':'す', 'ち':'つ', 'に':'ぬ', 'び':'ぶ', 'み':'む', 'り':'る' };
      const lastChar = stem.slice(-1);
      const prefix = stem.slice(0, -1);
      if (godanMap[lastChar]) {
        const godan = prefix + godanMap[lastChar];
        const entryGodan = lookupDirectWord(godan, customVocab, externalVocab);
        if (entryGodan) {
          const revMap = { 'う':'い', 'く':'き', 'ぐ':'ぎ', 'す':'し', 'つ':'ち', 'ぬ':'に', 'ぶ':'び', 'む':'み', 'る':'り' };
          const baseHira = entryGodan.hiragana || '';
          const hPrefix = baseHira.slice(0, -1);
          const hLast = baseHira.slice(-1);
          const okuri = revMap[hLast] || lastChar;
          return {
            base: godan,
            entry: entryGodan,
            inflection: inf,
            separatedEnding: inf.form,
            resolvedReading: hPrefix + okuri + inf.form
          };
        }
      }

      // Verbos する (勉強しました -> 勉強する)
      if (stem.endsWith('し')) {
        const suruStem = stem.slice(0, -1);
        const entrySuru = lookupDirectWord(suruStem + 'する', customVocab, externalVocab) ||
                          lookupDirectWord(suruStem, customVocab, externalVocab);
        if (entrySuru) {
          const baseHira = (entrySuru.hiragana || '').replace(/する$/, '');
          return {
            base: suruStem + 'する',
            entry: entrySuru,
            inflection: inf,
            separatedEnding: inf.form,
            resolvedReading: baseHira + 'し' + inf.form
          };
        }
      }
      const entrySuruDirect = lookupDirectWord(stem + 'する', customVocab, externalVocab) ||
                              lookupDirectWord(stem, customVocab, externalVocab);
      if (entrySuruDirect) {
        return {
          base: stem + 'する',
          entry: entrySuruDirect,
          inflection: inf,
          separatedEnding: inf.form,
          resolvedReading: (entrySuruDirect.hiragana || '').replace(/する$/, '') + inf.form
        };
      }
    }
  }

  // 4. Formas pasadas y te informales (〜った, 〜って, 〜んだ, 〜んで, etc.)
  if (clean.endsWith('った') || clean.endsWith('って')) {
    const p = clean.slice(0, -2);
    const suffix = { form: clean.slice(-2), tense: clean.endsWith('った') ? 'pasado informal' : 'forma conectiva te', meaning_es: clean.endsWith('った') ? 'Hizo' : 'Haciendo / Y' };
    for (const end of ['つ', 'う', 'る']) {
      const entry = lookupDirectWord(p + end, customVocab, externalVocab);
      if (entry) {
        return {
          base: p + end,
          entry,
          inflection: suffix,
          separatedEnding: clean.slice(-2),
          resolvedReading: (entry.hiragana ? entry.hiragana.slice(0, -1) + clean.slice(-2) : '')
        };
      }
    }
  }

  if (clean.endsWith('んだ') || clean.endsWith('んで')) {
    const p = clean.slice(0, -2);
    const suffix = { form: clean.slice(-2), tense: clean.endsWith('んだ') ? 'pasado informal' : 'forma conectiva te', meaning_es: clean.endsWith('んだ') ? 'Hizo' : 'Haciendo / Y' };
    for (const end of ['む', 'ぶ', 'ぬ']) {
      const entry = lookupDirectWord(p + end, customVocab, externalVocab);
      if (entry) {
        return {
          base: p + end,
          entry,
          inflection: suffix,
          separatedEnding: clean.slice(-2),
          resolvedReading: (entry.hiragana ? entry.hiragana.slice(0, -1) + clean.slice(-2) : '')
        };
      }
    }
  }

  if (clean.endsWith('いた') || clean.endsWith('いて')) {
    const p = clean.slice(0, -2);
    const suffix = { form: clean.slice(-2), tense: clean.endsWith('いた') ? 'pasado informal' : 'forma conectiva te', meaning_es: clean.endsWith('いた') ? 'Hizo' : 'Haciendo / Y' };
    if (clean === '行った' || clean === '行って') {
      const entry = lookupDirectWord('行く', customVocab, externalVocab);
      if (entry) {
        return {
          base: '行く',
          entry,
          inflection: suffix,
          separatedEnding: clean.slice(-2),
          resolvedReading: clean.endsWith('った') ? 'いった' : 'いって'
        };
      }
    }
    const entry = lookupDirectWord(p + 'く', customVocab, externalVocab);
    if (entry) {
      return {
        base: p + 'く',
        entry,
        inflection: suffix,
        separatedEnding: clean.slice(-2),
        resolvedReading: (entry.hiragana ? entry.hiragana.slice(0, -1) + clean.slice(-2) : '')
      };
    }
  }

  if (clean.endsWith('いだ') || clean.endsWith('いで')) {
    const p = clean.slice(0, -2);
    const suffix = { form: clean.slice(-2), tense: clean.endsWith('いだ') ? 'pasado informal' : 'forma conectiva te', meaning_es: clean.endsWith('いだ') ? 'Hizo' : 'Haciendo / Y' };
    const entry = lookupDirectWord(p + 'ぐ', customVocab, externalVocab);
    if (entry) {
      return {
        base: p + 'ぐ',
        entry,
        inflection: suffix,
        separatedEnding: clean.slice(-2),
        resolvedReading: (entry.hiragana ? entry.hiragana.slice(0, -1) + clean.slice(-2) : '')
      };
    }
  }

  if (clean.endsWith('した') || clean.endsWith('して')) {
    const p = clean.slice(0, -2);
    const suffix = { form: clean.slice(-2), tense: clean.endsWith('した') ? 'pasado informal' : 'forma conectiva te', meaning_es: clean.endsWith('した') ? 'Hizo' : 'Haciendo / Y' };
    const entry = lookupDirectWord(p + 'す', customVocab, externalVocab);
    if (entry) {
      return {
        base: p + 'す',
        entry,
        inflection: suffix,
        separatedEnding: clean.slice(-2),
        resolvedReading: (entry.hiragana ? entry.hiragana.slice(0, -1) + clean.slice(-2) : '')
      };
    }
    if (clean === 'して' || clean === 'した') {
      const entrySuru = lookupDirectWord('する', customVocab, externalVocab);
      if (entrySuru) {
        return {
          base: 'する',
          entry: entrySuru,
          inflection: suffix,
          separatedEnding: clean,
          resolvedReading: clean
        };
      }
    }
  }

  if (clean.endsWith('た') || clean.endsWith('て')) {
    const p = clean.slice(0, -1);
    const suffix = { form: clean.slice(-1), tense: clean.endsWith('た') ? 'pasado informal' : 'forma conectiva te', meaning_es: clean.endsWith('た') ? 'Hizo' : 'Haciendo / Y' };
    const entry = lookupDirectWord(p + 'る', customVocab, externalVocab);
    if (entry) {
      return {
        base: p + 'る',
        entry,
        inflection: suffix,
        separatedEnding: clean.slice(-1),
        resolvedReading: (entry.hiragana ? entry.hiragana.slice(0, -1) + clean.slice(-1) : '')
      };
    }
  }

  // 5. Cópulas al final de sustantivos (ej. 学生でした, アンナです)
  for (const c of COPULAS) {
    if (clean.endsWith(c.form) && clean.length > c.form.length) {
      const stem = clean.slice(0, -c.form.length);
      const entry = lookupDirectWord(stem, customVocab, externalVocab);
      if (entry) {
        return {
          base: stem,
          entry,
          inflection: { form: c.form, tense: 'cópula', meaning_es: c.meaning_es, role: 'Cópula' },
          separatedEnding: c.form,
          resolvedReading: (entry.hiragana ? entry.hiragana + c.form : '')
        };
      }
    }
  }

  return null;
}

/**
 * Función de compatibilidad splitCopulaAndInflection
 */
export function splitCopulaAndInflection(text = '') {
  const de = deinflectWord(text);
  if (de && de.inflection) {
    return {
      stem: de.base,
      type: de.inflection.role === 'Cópula' ? 'copula' : 'inflection',
      form: de.separatedEnding || de.inflection.form || '',
      base: de.base,
      tense: de.inflection.tense,
      meaning_es: de.inflection.meaning_es,
      role: de.inflection.role || 'Flexión Gramatical'
    };
  }
  return null;
}

/**
 * Segmentador morfológico inteligente que separa palabras, partículas, cópulas y sufijos
 */
export function smartSegmentJapanese(sentence = '', customVocab = [], externalVocab = []) {
  if (!sentence) return [];
  const tokens = [];
  let remaining = sentence.trim();

  while (remaining.length > 0) {
    // 0. Espacios y signos de puntuación
    const leadSpace = remaining.match(/^[\s,.!?。、！？\n「」『』()（）]+/);
    if (leadSpace) {
      remaining = remaining.slice(leadSpace[0].length);
      continue;
    }

    let foundMatch = null;

    // A. Búsqueda directa de palabras multicarácter (longitud >= 2)
    for (let len = Math.min(12, remaining.length); len >= 2; len--) {
      const sub = remaining.slice(0, len);
      const direct = lookupDirectWord(sub, customVocab, externalVocab);
      if (direct) {
        foundMatch = {
          text: sub,
          type: 'word',
          entry: direct,
          matchedLength: len
        };
        break;
      }
    }

    // B. Verificación de flexiones verbales y adjetivales (longitud >= 2)
    if (!foundMatch) {
      for (let len = Math.min(15, remaining.length); len >= 2; len--) {
        const sub = remaining.slice(0, len);
        const de = deinflectWord(sub, customVocab, externalVocab);
        if (de) {
          foundMatch = {
            text: sub,
            type: 'word',
            entry: de.entry,
            deinflection: de,
            matchedLength: len
          };
          break;
        }
      }
    }

    if (foundMatch) {
      tokens.push(foundMatch);
      remaining = remaining.slice(foundMatch.matchedLength);
      continue;
    }

    // C. Sufijos de cortesía (さん, ちゃん, 様, etc.)
    let isSuf = false;
    for (const suf of SUFFIXES) {
      if (remaining.startsWith(suf.form)) {
        tokens.push({
          text: suf.form,
          type: 'suffix',
          data: suf,
          matchedLength: suf.form.length
        });
        remaining = remaining.slice(suf.form.length);
        isSuf = true;
        break;
      }
    }
    if (isSuf) continue;

    // D. Tokens gramaticales (cópulas y partículas ordenadas de mayor a menor)
    let isGram = false;
    for (const g of GRAMMAR_TOKENS) {
      if (remaining.startsWith(g.form)) {
        tokens.push({
          text: g.form,
          type: g.role === 'Cópula' ? 'copula' : 'particle',
          data: g,
          matchedLength: g.form.length
        });
        remaining = remaining.slice(g.form.length);
        isGram = true;
        break;
      }
    }
    if (isGram) continue;

    // E. Coincidencia directa de carácter único o tallo verbal
    const firstChar = remaining[0];
    const directChar = lookupDirectWord(firstChar, customVocab, externalVocab);
    if (directChar) {
      tokens.push({
        text: firstChar,
        type: 'word',
        entry: directChar,
        matchedLength: 1
      });
      remaining = remaining.slice(1);
      continue;
    }

    // Tallo de verbo Ichidan (ej. 見 en 見に行く)
    const ichidanCandidate = lookupDirectWord(firstChar + 'る', customVocab, externalVocab);
    if (ichidanCandidate) {
      tokens.push({
        text: firstChar,
        type: 'word',
        entry: ichidanCandidate,
        deinflection: {
          base: firstChar + 'る',
          entry: ichidanCandidate,
          inflection: { tense: 'raíz verbal de propósito/conexión', meaning_es: ichidanCandidate.meaning_es },
          resolvedReading: (ichidanCandidate.hiragana || '').slice(0, -1)
        },
        matchedLength: 1
      });
      remaining = remaining.slice(1);
      continue;
    }

    // F. Carácter residual desconocido
    tokens.push({
      text: firstChar,
      type: 'char',
      matchedLength: 1
    });
    remaining = remaining.slice(1);
  }

  // Fusionar caracteres sueltos contiguos
  const merged = [];
  for (const t of tokens) {
    if (t.type === 'char') {
      const prev = merged[merged.length - 1];
      if (prev && prev.type === 'unknown_block') {
        prev.text += t.text;
      } else {
        merged.push({ text: t.text, type: 'unknown_block' });
      }
    } else {
      merged.push(t);
    }
  }

  return merged;
}

/**
 * Analiza una oración o consulta completa, devolviendo tokens detallados para DictionaryModal
 */
export function analyzeJapaneseSentence(rawText = '', customVocab = [], externalVocab = []) {
  if (!rawText || typeof rawText !== 'string') return [];

  const clean = rawText
    .replace(/<rt>.*?<\/rt>/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();

  if (!clean) return [];

  // Si la consulta es en español (contiene letras latinas y no kana/kanji)
  const isSpanishQuery = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(clean);
  if (isSpanishQuery) {
    const spanishMatches = searchSpanishInDictionary(clean, customVocab, externalVocab, 8);
    if (spanishMatches.length > 0) {
      return spanishMatches.map(m => ({
        text: m.kanji || m.hiragana,
        display: m.kanji || m.hiragana,
        meaning_es: m.meaning_es,
        hiragana: m.hiragana,
        katakana: m.katakana,
        romaji: m.romaji,
        level: m.level,
        category: m.category,
        isKnown: true,
        source: m.source
      }));
    }
  }

  // Segmentación morfológica avanzada
  const segments = smartSegmentJapanese(clean, customVocab, externalVocab);
  const results = [];

  for (const seg of segments) {
    if (seg.type === 'word') {
      const entry = seg.entry || {};
      const de = seg.deinflection;
      const baseForm = de ? de.base : (entry.kanji || seg.text);
      const isKataName = /^[\u30A0-\u30FFー]+$/.test(seg.text);

      let hira = entry.hiragana || '';
      if (de && de.resolvedReading) {
        hira = de.resolvedReading;
      } else if (!hira && !containsKanji(seg.text)) {
        hira = katakanaToHiragana(seg.text);
      }

      let explanation = entry.meaning_es || (isKataName ? 'Nombre o préstamo en Katakana' : '');
      if (de && de.inflection) {
        const t = de.inflection.tense || '';
        const m = de.inflection.meaning_es ? `: ${de.inflection.meaning_es}` : '';
        explanation = `${explanation} [${t}${m}]`;
      }

      results.push({
        text: seg.text,
        display: seg.text,
        baseForm: baseForm,
        meaning_es: explanation,
        hiragana: hira,
        katakana: entry.katakana || hiraganaToKatakana(hira || seg.text),
        romaji: entry.romaji || '',
        level: entry.level || 'N5',
        category: entry.category || (isKataName ? 'Nombre / Préstamo' : 'Palabra'),
        notes: de ? `Forma flexionada de: ${baseForm} (${de.inflection?.tense || ''})` : '',
        isKnown: Boolean(entry.meaning_es || isKataName),
        deinflection: de
      });
    } else if (seg.type === 'particle') {
      results.push({
        text: seg.text,
        display: seg.text,
        meaning_es: seg.data?.meaning_es || '',
        hiragana: seg.text,
        katakana: hiraganaToKatakana(seg.text),
        level: seg.data?.level || 'N5',
        category: 'Partícula Gramatical',
        isGrammar: true,
        isKnown: true
      });
    } else if (seg.type === 'copula') {
      results.push({
        text: seg.text,
        display: seg.text,
        meaning_es: seg.data?.meaning_es || '',
        hiragana: seg.text,
        katakana: hiraganaToKatakana(seg.text),
        level: seg.data?.level || 'N5',
        category: 'Cópula Gramatical',
        isGrammar: true,
        isKnown: true
      });
    } else if (seg.type === 'suffix') {
      results.push({
        text: seg.text,
        display: seg.text,
        meaning_es: seg.data?.meaning_es || '',
        hiragana: seg.text,
        katakana: hiraganaToKatakana(seg.text),
        level: 'N5',
        category: seg.data?.role || 'Sufijo Honorífico',
        isGrammar: true,
        isKnown: true
      });
    } else {
      // Bloque desconocido o caracteres
      results.push({
        text: seg.text,
        display: seg.text,
        meaning_es: '',
        hiragana: containsKanji(seg.text) ? '' : katakanaToHiragana(seg.text),
        katakana: hiraganaToKatakana(seg.text),
        level: 'N5',
        category: 'Texto',
        isKnown: false
      });
    }
  }

  return results;
}

/**
 * Busca detalles de una palabra o término individual
 */
export function lookupJapaneseWord(rawText = '', customVocab = [], externalVocab = []) {
  const clean = (rawText || '').trim();
  if (!clean) return null;

  // Si es consulta en español
  if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(clean)) {
    const spMatches = searchSpanishInDictionary(clean, customVocab, externalVocab, 1);
    if (spMatches.length > 0) {
      return spMatches[0];
    }
  }

  // 1. Coincidencia directa
  const direct = lookupDirectWord(clean, customVocab, externalVocab);
  if (direct) {
    return direct;
  }

  // 2. Desarticulación morfológica
  const de = deinflectWord(clean, customVocab, externalVocab);
  if (de) {
    const baseEntry = de.entry || {};
    return {
      ...baseEntry,
      originalText: clean,
      baseForm: de.base,
      compoundEnding: de.separatedEnding || '',
      endingRole: de.inflection?.meaning_es || de.inflection?.tense || '',
      hasSeparatedEnding: true,
      combinedExplanation: `${baseEntry.meaning_es} (${de.inflection?.tense || ''}: ${de.inflection?.meaning_es || ''})`
    };
  }

  // 3. Partícula aislada
  if (PARTICLES[clean]) {
    const p = PARTICLES[clean];
    return {
      kanji: clean,
      hiragana: clean,
      katakana: hiraganaToKatakana(clean),
      meaning_es: p.meaning_es,
      level: p.level || 'N5',
      category: p.role || 'Partícula',
      source: 'Gramática de Partículas'
    };
  }

  // 4. Cópula aislada
  const cop = COPULAS.find(c => c.form === clean);
  if (cop) {
    return {
      kanji: cop.form,
      hiragana: cop.form,
      katakana: hiraganaToKatakana(cop.form),
      meaning_es: cop.meaning_es,
      level: 'N5',
      category: cop.role,
      source: 'Gramática de Cópulas'
    };
  }

  // 5. Inferencia si no tiene kanji
  if (!containsKanji(clean)) {
    const hira = katakanaToHiragana(clean);
    return {
      kanji: clean,
      hiragana: hira,
      katakana: hiraganaToKatakana(hira),
      meaning_es: '',
      level: 'N5',
      category: 'Vocabulario',
      source: 'Inferencia Kana'
    };
  }

  return null;
}

/**
 * Limpia un texto para que contenga estrictamente caracteres Kana, romaji o signos de puntuación
 */
export function cleanKanaOnly(str = '') {
  if (!str) return '';
  return String(str)
    .replace(/[\u4e00-\u9faf\u3400-\u4dbf]/g, '')
    .trim();
}

/**
 * Resuelve y convierte de forma síncrona en cliente Kanji a Hiragana y Katakana
 * con precisión morfológica y sin dejar kanjis residuales
 */
export function convertKanjiToKanaSync(text = '', customVocab = [], externalVocab = []) {
  const clean = String(text || '').trim();
  if (!clean) {
    return { hiragana: '', katakana: '', isResolved: true, meaning_es: '', level: 'N5' };
  }

  // 1. Si no tiene kanji, es puramente kana/romaji
  if (!containsKanji(clean)) {
    const hira = katakanaToHiragana(clean);
    return {
      hiragana: hira,
      katakana: hiraganaToKatakana(hira),
      isResolved: true,
      meaning_es: '',
      level: 'N5'
    };
  }

  // 2. Coincidencia directa
  const direct = lookupDirectWord(clean, customVocab, externalVocab);
  if (direct && direct.hiragana && !containsKanji(direct.hiragana)) {
    return {
      hiragana: direct.hiragana,
      katakana: direct.katakana || hiraganaToKatakana(direct.hiragana),
      meaning_es: direct.meaning_es || '',
      level: direct.level || 'N5',
      isResolved: true
    };
  }

  // 3. Desinflección directa
  const de = deinflectWord(clean, customVocab, externalVocab);
  if (de && de.resolvedReading && !containsKanji(de.resolvedReading)) {
    return {
      hiragana: de.resolvedReading,
      katakana: hiraganaToKatakana(de.resolvedReading),
      meaning_es: de.entry?.meaning_es || '',
      level: de.entry?.level || 'N5',
      isResolved: true
    };
  }

  // 4. Segmentación inteligente de la oración o frase compuesta
  const segments = smartSegmentJapanese(clean, customVocab, externalVocab);
  let resolvedHira = '';
  let meanings = [];
  let allResolved = true;

  for (const seg of segments) {
    if (seg.type === 'particle' || seg.type === 'copula' || seg.type === 'suffix') {
      resolvedHira += seg.text;
    } else if (seg.deinflection && seg.deinflection.resolvedReading) {
      resolvedHira += seg.deinflection.resolvedReading;
      if (seg.entry?.meaning_es) meanings.push(seg.entry.meaning_es);
    } else if (seg.entry && seg.entry.hiragana && !containsKanji(seg.entry.hiragana)) {
      resolvedHira += seg.entry.hiragana;
      if (seg.entry.meaning_es) meanings.push(seg.entry.meaning_es);
    } else if (!containsKanji(seg.text)) {
      resolvedHira += katakanaToHiragana(seg.text);
    } else {
      allResolved = false;
      break;
    }
  }

  if (allResolved && resolvedHira && !containsKanji(resolvedHira)) {
    return {
      hiragana: resolvedHira,
      katakana: hiraganaToKatakana(resolvedHira),
      meaning_es: meanings.join(' / '),
      level: 'N5',
      isResolved: true
    };
  }

  return {
    hiragana: '',
    katakana: '',
    isResolved: false,
    meaning_es: '',
    level: 'N5'
  };
}

// Memoria caché en cliente para peticiones de lectura
const clientReadingCache = new Map();

/**
 * Función asíncrona de resolución de lectura que consulta el motor morfológico API
 * si no se resuelve localmente, garantizando 100% de conversión kana sin kanjis residuales
 */
export async function fetchKanjiReading(text = '', { customVocab = [], externalVocab = [] } = {}) {
  const clean = String(text || '').trim();
  if (!clean) {
    return { text: '', hiragana: '', katakana: '', romaji: '', kanjis: [] };
  }

  // 1. Si no tiene kanji, resolver al instante
  if (!containsKanji(clean)) {
    const hira = katakanaToHiragana(clean);
    const kata = hiraganaToKatakana(hira);
    return {
      text: clean,
      hiragana: hira,
      katakana: kata,
      romaji: '',
      meaning_es: '',
      level: 'N5',
      kanjis: []
    };
  }

  // 2. Caché local
  if (clientReadingCache.has(clean)) {
    return clientReadingCache.get(clean);
  }

  // 3. Resolución síncrona inmediata con el motor integrado
  const syncRes = convertKanjiToKanaSync(clean, customVocab, externalVocab);
  if (syncRes.isResolved && syncRes.hiragana && !containsKanji(syncRes.hiragana)) {
    const item = {
      text: clean,
      hiragana: syncRes.hiragana,
      katakana: syncRes.katakana || hiraganaToKatakana(syncRes.hiragana),
      romaji: '',
      meaning_es: syncRes.meaning_es || '',
      level: syncRes.level || 'N5',
      kanjis: extractKanjis(clean)
    };
    clientReadingCache.set(clean, item);
    return item;
  }

  // 4. Consultar endpoint API /api/kanji/reading
  try {
    const res = await fetch(`/api/kanji/reading?text=${encodeURIComponent(clean)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.hiragana && !containsKanji(data.hiragana)) {
        clientReadingCache.set(clean, data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Lectura remota fallback:', err);
  }

  // 5. Fallback limpio
  const fallbackHira = syncRes.hiragana || '';
  const fallbackKata = syncRes.katakana || (fallbackHira ? hiraganaToKatakana(fallbackHira) : '');

  const result = {
    text: clean,
    hiragana: fallbackHira,
    katakana: fallbackKata,
    romaji: '',
    meaning_es: syncRes.meaning_es || '',
    level: syncRes.level || 'N5',
    kanjis: extractKanjis(clean)
  };

  return result;
}

// Tokenizador básico para historias
export function tokenizeJapanese(text = '') {
  if (!text) return [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
      const segments = Array.from(segmenter.segment(text));
      return segments.map(s => ({
        text: s.segment,
        isWordLike: s.isWordLike,
        index: s.index
      }));
    } catch (_) {}
  }
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

/**
 * Genera un prompt estructurado para IA para crear una historia pedagógica
 */
export function buildStoryPrompt({
  words = [],
  phrases = [],
  level = 'N5',
  theme = 'daily'
}) {
  const themeLabels = {
    daily: 'Vida diaria y rutina en Tokio',
    cafe: 'Una tarde en una cafetería japonesa tradicional y moderna',
    travel: 'Un viaje en tren bala (Shinkansen) hacia Kioto',
    school: 'Un día de clases de japonés con amigos y profesores',
    food: 'Descubriendo comida callejera y un puesto de ramen artesanal',
    fantasy: 'Un misterio tradicional cerca de un templo antiguo en la montaña'
  };

  const themeDesc = themeLabels[theme] || themeLabels.daily;

  let vocabListText = '';
  if (words.length > 0) {
    vocabListText += `\n【Palabras obligatorias a incluir】:\n`;
    words.forEach((w) => {
      const k = w.kanji || w.text;
      const h = w.hiragana ? ` (${w.hiragana})` : '';
      const m = w.meaning_es ? ` - ${w.meaning_es}` : '';
      vocabListText += `- ${k}${h}${m}\n`;
    });
  }

  if (phrases.length > 0) {
    vocabListText += `\n【Frases o expresiones a inspirar / incorporar】:\n`;
    phrases.forEach((p) => {
      const text = p.japanese || p.text;
      const tr = p.translation ? ` ("${p.translation}")` : '';
      vocabListText += `* "${text}"${tr}\n`;
    });
  }

  return `Actúa como un profesor nativo de japonés y autor pedagógico experto en la enseñanza del JLPT.

Por favor, escribe una historia interactiva breve, entretenida y estructurada en japonés para un estudiante de nivel JLPT ${level}.

Temática central: ${themeDesc}.
${vocabListText}

Requisitos obligatorios de la historia:
1. TÍTULO: Atractivo y con sentido (ejemplo: 日本語での一日 - Un día en japonés).
2. CONTENIDO (3 a 5 párrafos):
   - Redacción natural pero accesible al nivel ${level}.
   - Las palabras seleccionadas deben integrarse de forma fluida y destacarse en **negrita** la primera vez que aparecen.
   - Oraciones claras y gramática coherente con el nivel JLPT ${level}.
3. FORMATO DE ENTREGA:
   - Bloque 1: Texto completo en japonés (Kanji estándar + Kana).
   - Bloque 2: Transcripción completa en Hiragana / Furigana de cada párrafo.
   - Bloque 3: Traducción cuidada y natural al español.
   - Bloque 4: Glosario de vocabulario clave usado.
   - Bloque 5: Mini-cuestionario de 3 preguntas de comprensión lectora en japonés simple con opciones múltiple (A, B, C) y solución explicada.

Mantén un tono cálido, inmersivo y motivador para estudiantes de japonés.`;
}

/**
 * Exporta vocabulario en formato estricto JSON según INSTRUCCIONES.md
 */
export function exportVocabularyAsJson(words = []) {
  const formatted = words.map((w, index) => {
    const finalKatakana = w.katakana || hiraganaToKatakana(w.hiragana || w.kana || w.kanji || '');
    return {
      id: w.id || `v_custom_${index + 1}`,
      kanji: (w.kanji || w.text || '').trim(),
      hiragana: (w.hiragana || w.kana || '').trim(),
      katakana: finalKatakana.trim(),
      kana: (w.hiragana || w.kana || '').trim(),
      meaning_es: (w.meaning_es || w.translation || '').trim(),
      meaning_en: (w.meaning_en || '').trim(),
      category: w.category || 'Vocabulario General',
      level: w.level || 'N5'
    };
  });
  return JSON.stringify(formatted, null, 2);
}

/**
 * Exporta palabras y frases a formato CSV compatible con Anki
 */
export function exportAsAnkiCsv(words = [], phrases = []) {
  const lines = ['Kanji / Japonés\tHiragana\tKatakana\tSignificado (Español)\tNivel\tTipo / Origen'];

  words.forEach(w => {
    lines.push(
      `${w.kanji || ''}\t${w.hiragana || ''}\t${w.katakana || ''}\t${w.meaning_es || ''}\t${w.level || 'N5'}\tPalabra`
    );
  });

  phrases.forEach(p => {
    lines.push(
      `${p.japanese || ''}\t\t\t${p.translation || ''}\t${p.level || 'N5'}\tFrase (${p.source || 'Reproductor'})`
    );
  });

  return lines.join('\n');
}

/**
 * Exporta palabras y frases a Markdown para apuntes o Notion
 */
export function exportAsMarkdown(words = [], phrases = []) {
  let md = `# Cuaderno de Vocabulario y Frases — Nihongo Master\n\n`;
  md += `*Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}*\n\n`;

  if (words.length > 0) {
    md += `## 📚 Palabras Guardadas (${words.length})\n\n`;
    md += `| Kanji | Hiragana | Katakana | Significado | Nivel | Categoría |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    words.forEach(w => {
      md += `| **${w.kanji || ''}** | ${w.hiragana || ''} | ${w.katakana || ''} | ${w.meaning_es || ''} | ${w.level || 'N5'} | ${w.category || ''} |\n`;
    });
    md += `\n`;
  }

  if (phrases.length > 0) {
    md += `## 💬 Frases y Expresiones (${phrases.length})\n\n`;
    md += `| Expresión en Japonés | Traducción al Español | Origen |\n`;
    md += `| :--- | :--- | :--- |\n`;
    phrases.forEach(p => {
      md += `| **${p.japanese || ''}** | ${p.translation || ''} | ${p.source || 'Reproductor'} |\n`;
    });
    md += `\n`;
  }

  return md;
}
