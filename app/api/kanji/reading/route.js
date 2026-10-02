// Endpoint API para resolución y conversión morfológica precisa de kanji a hiragana y katakana
import fs from 'fs';
import path from 'path';
import * as kdModule from 'kanji-data';
import * as wanakana from 'wanakana';
import { convertKanjiToKanaSync } from '../../../../lib/japaneseUtils';

const kd = kdModule.default || kdModule;

// Memoria caché para respuestas inmediatas
const readingCache = new Map();
const MAX_CACHE_SIZE = 2000;

// Carga perezosa de datasets locales
let localDict = null;
let pitchAccents = null;

function getLocalData() {
  if (localDict && pitchAccents) return { localDict, pitchAccents };

  localDict = new Map();
  pitchAccents = {};

  try {
    const dataDir = path.resolve(process.cwd(), 'data');

    // 1. Frases y expresiones esenciales curadas en español
    const CURATED_LIST = {
      'お疲れ様': { reading: 'おつかれさま', meaning_es: 'Muchas gracias por su trabajo / Buen trabajo', level: 'N5', category: 'Saludos y Cortesía' },
      'お疲れ様です': { reading: 'おつかれさまです', meaning_es: 'Muchas gracias por su trabajo / Buen trabajo (saludo formal habitual)', level: 'N5', category: 'Saludos y Cortesía' },
      'お疲れ様でした': { reading: 'おつかれさまでした', meaning_es: 'Muchas gracias por su trabajo / Buen trabajo (al finalizar jornada o tarea)', level: 'N5', category: 'Saludos y Cortesía' },
      'お疲れさまでした': { reading: 'おつかれさまでした', meaning_es: 'Muchas gracias por su trabajo (al finalizar)', level: 'N5', category: 'Saludos y Cortesía' },
      'お疲れ': { reading: 'おつかれ', meaning_es: 'Buen trabajo / Cansancio (informal)', level: 'N5', category: 'Saludos y Cortesía' },
      'よろしく': { reading: 'よろしく', meaning_es: 'Mucho gusto / Cuento contigo', level: 'N5', category: 'Saludos y Cortesía' },
      'よろしくお願いします': { reading: 'よろしくおねがいします', meaning_es: 'Por favor cuide de mí / Encantado de colaborar con usted', level: 'N5', category: 'Saludos y Cortesía' },
      'よろしくお願いいたします': { reading: 'よろしくおねがいいたします', meaning_es: 'Por favor cuide de mí (máxima cortesía Keigo)', level: 'N4', category: 'Saludos y Cortesía' },
      'どうぞよろしく': { reading: 'どうぞよろしく', meaning_es: 'Un gran placer / Cuento con usted', level: 'N5', category: 'Saludos y Cortesía' },
      '初めまして': { reading: 'はじめまして', meaning_es: 'Mucho gusto / Encantado de conocerte', level: 'N5', category: 'Saludos y Cortesía' },
      '失礼します': { reading: 'しつれいします', meaning_es: 'Con su permiso / Disculpe la molestia (al entrar o despedirse)', level: 'N5', category: 'Saludos y Cortesía' },
      '失礼しました': { reading: 'しつれいしました', meaning_es: 'Disculpe la molestia (al retirarse o tras un error)', level: 'N5', category: 'Saludos y Cortesía' },
      'お世話になっております': { reading: 'おせわになっております', meaning_es: 'Agradezco sinceramente su continuo apoyo', level: 'N4', category: 'Saludos y Cortesía' },
      'いってきます': { reading: 'いってきます', meaning_es: 'Ya me voy / Salgo y regreso', level: 'N5', category: 'Saludos y Cortesía' },
      '行ってきます': { reading: 'いってきます', meaning_es: 'Ya me voy / Salgo y regreso', level: 'N5', category: 'Saludos y Cortesía' },
      'いってらっしゃい': { reading: 'いってらっしゃい', meaning_es: 'Que te vaya bien / Cuídate mucho', level: 'N5', category: 'Saludos y Cortesía' },
      '行ってらっしゃい': { reading: 'いってらっしゃい', meaning_es: 'Que te vaya bien / Cuídate mucho', level: 'N5', category: 'Saludos y Cortesía' },
      'ただいま': { reading: 'ただいま', meaning_es: 'Ya llegué / He vuelto a casa', level: 'N5', category: 'Saludos y Cortesía' },
      'おかえりなさい': { reading: 'おかえりなさい', meaning_es: 'Bienvenido de vuelta a casa', level: 'N5', category: 'Saludos y Cortesía' },
      'お帰りなさい': { reading: 'おかえりなさい', meaning_es: 'Bienvenido de vuelta a casa', level: 'N5', category: 'Saludos y Cortesía' },
      'いただきます': { reading: 'いただきます', meaning_es: 'Buen provecho / Agradezco los alimentos', level: 'N5', category: 'Comida y Bebida' },
      'ごちそうさまでした': { reading: 'ごちそうさまでした', meaning_es: 'Muchas gracias por la comida / Estuvo delicioso', level: 'N5', category: 'Comida y Bebida' },
      'ご馳走様でした': { reading: 'ごちそうさまでした', meaning_es: 'Muchas gracias por la comida / Estuvo delicioso', level: 'N5', category: 'Comida y Bebida' },
      'おはようございます': { reading: 'おはようございます', meaning_es: 'Buenos días (formal)', level: 'N5', category: 'Saludos y Cortesía' },
      'お早うございます': { reading: 'おはようございます', meaning_es: 'Buenos días (formal)', level: 'N5', category: 'Saludos y Cortesía' },
      'ありがとうございます': { reading: 'ありがとうございます', meaning_es: 'Muchas gracias (formal)', level: 'N5', category: 'Saludos y Cortesía' },
      '有難うございます': { reading: 'ありがとうございます', meaning_es: 'Muchas gracias (formal)', level: 'N5', category: 'Saludos y Cortesía' },
      'すみません': { reading: 'すみません', meaning_es: 'Disculpe / Perdón / Gracias por la molestia', level: 'N5', category: 'Expresiones' },
      '済みません': { reading: 'すみません', meaning_es: 'Disculpe / Perdón', level: 'N5', category: 'Expresiones' },
      'ごめんなさい': { reading: 'ごめんなさい', meaning_es: 'Lo siento / Perdón', level: 'N5', category: 'Expresiones' },
      '御免なさい': { reading: 'ごめんなさい', meaning_es: 'Lo siento / Perdón', level: 'N5', category: 'Expresiones' }
    };

    for (const [k, v] of Object.entries(CURATED_LIST)) {
      localDict.set(k, v);
    }

    // 2. Vocabulario del catálogo
    const vocabPath = path.join(dataDir, 'vocabulary.json');
    if (fs.existsSync(vocabPath)) {
      const vocabList = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
      vocabList.forEach(v => {
        const kanji = (v.kanji || '').trim();
        const reading = (v.hiragana || v.kana || '').trim();
        if (kanji && reading && !localDict.has(kanji) && !/[\u4e00-\u9faf]/.test(reading)) {
          localDict.set(kanji, {
            reading,
            meaning_es: v.meaning_es || '',
            level: v.level || 'N5',
            category: v.category || 'Vocabulario General'
          });
        }
      });
    }

    // 3. Vocabulario N5 y N4
    const v5Path = path.join(dataDir, 'vocabulary_n5.json');
    if (fs.existsSync(v5Path)) {
      const v5List = JSON.parse(fs.readFileSync(v5Path, 'utf8'));
      v5List.forEach(v => {
        const kanji = (v.kanji || '').trim();
        const reading = (v.hiragana || v.kana || '').trim();
        if (kanji && reading && !localDict.has(kanji) && !/[\u4e00-\u9faf]/.test(reading)) {
          localDict.set(kanji, {
            reading,
            meaning_es: v.meaning_es || '',
            level: v.level || 'N5',
            category: v.category || 'Vocabulario General'
          });
        }
      });
    }

    // 4. Kanjis del catálogo
    const kanjiPath = path.join(dataDir, 'kanji.json');
    if (fs.existsSync(kanjiPath)) {
      const kanjiList = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));
      kanjiList.forEach(k => {
        if (k.words && Array.isArray(k.words)) {
          k.words.forEach(w => {
            const word = (w.word || '').trim();
            const reading = (w.reading || '').trim();
            if (word && reading && !localDict.has(word) && !/[\u4e00-\u9faf]/.test(reading)) {
              localDict.set(word, {
                reading,
                meaning_es: w.meaning || '',
                level: k.level || 'N5',
                category: 'Kanji'
              });
            }
          });
        }
      });
    }

    // 5. Diccionario de Pitch Accents
    const pitchPath = path.join(dataDir, 'pitch_accents.json');
    if (fs.existsSync(pitchPath)) {
      pitchAccents = JSON.parse(fs.readFileSync(pitchPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error cargando datasets locales para lecturas:', err);
  }

  return { localDict, pitchAccents };
}

// Cópulas
const COPULAS = [
  'ではありませんでした', 'じゃありませんでした', 'ではありません', 'じゃありません',
  'ではなかった', 'じゃなかった', 'ではない', 'じゃない',
  'でした', 'だった', 'でしょう', 'だろう', 'です', 'だ'
];

// Sufijos de verbo する
const SURU_FORMS = [
  'しませんでした', 'しました', 'しません', 'します',
  'したくないです', 'したくない', 'したいです', 'したい',
  'している', 'しています', 'してください', 'した', 'して', 'する', 'できる'
];

// Inflexiones verbales y adjetivales
const VERB_INFLECTIONS = [
  { form: 'ませんでした', replacement: 'る', alt: 'う' },
  { form: 'ました', replacement: 'る', alt: 'う' },
  { form: 'ません', replacement: 'る', alt: 'う' },
  { form: 'ます', replacement: 'る', alt: 'う' },
  { form: 'たくないです', replacement: 'る', alt: 'う' },
  { form: 'たくない', replacement: 'る', alt: 'う' },
  { form: 'たいです', replacement: 'る', alt: 'う' },
  { form: 'たい', replacement: 'る', alt: 'う' },
  { form: 'てください', replacement: 'る', alt: 'う' },
  { form: 'ています', replacement: 'る', alt: 'う' },
  { form: 'ている', replacement: 'る', alt: 'う' },
  { form: 'くないです', isAdj: true },
  { form: 'くない', isAdj: true },
  { form: 'かったです', isAdj: true },
  { form: 'かった', isAdj: true },
  { form: 'くて', isAdj: true }
];

// Verbos irregulares frecuentes
const IRREGULAR_VERBS = {
  '行った': 'いった',
  '行って': 'いって',
  '行きます': 'いきます',
  '来た': 'きた',
  '来て': 'きて',
  '来ます': 'きます',
  '来ない': 'こない',
  'こない': 'こない',
  '持ってきた': 'もってきた',
  '連れてきた': 'つれてきた'
};

// Sufijos de cortesía y plurales comunes
const SUFFIXES = [
  { suffix: '様', reading: 'さま' },
  { suffix: 'さん', reading: 'さん' },
  { suffix: '方', reading: 'がた' },
  { suffix: '達', reading: 'たち' },
  { suffix: 'たち', reading: 'たち' },
  { suffix: '君', reading: 'くん' },
  { suffix: 'ちゃん', reading: 'ちゃん' }
];

/**
 * Busca una palabra exacta en kanji-data evaluando prioridades (ichi1, news1, etc.)
 */
function findInKanjiData(word) {
  const kanjis = word.match(/[\u4e00-\u9faf\u3400-\u4dbf]/g);
  if (!kanjis) return null;

  const candidates = [];
  for (const k of kanjis) {
    const words = kd.getWords(k) || [];
    for (const w of words) {
      for (const v of w.variants) {
        if (v.written === word) {
          candidates.push({
            reading: v.pronounced,
            priorities: v.priorities || [],
            meanings: w.meanings || []
          });
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  const scorePriority = (pList) => {
    let s = 0;
    for (const p of pList) {
      if (p.startsWith('ichi1') || p.startsWith('news1') || p.startsWith('spec1')) s += 15;
      else if (p.startsWith('gai1') || p.startsWith('nf0')) s += 8;
      else s += 2;
    }
    return s;
  };

  candidates.sort((a, b) => scorePriority(b.priorities) - scorePriority(a.priorities));
  const best = candidates[0];

  const glosses = (best.meanings || []).flatMap(m => m.glosses || []);
  return {
    reading: best.reading,
    meaning_en: glosses.slice(0, 3).join(', ')
  };
}

/**
 * Resuelve la forma pasada o te-form de verbos Godan e Ichidan
 */
function resolveTaTeForm(term) {
  // Ichidan: 食べた -> 食べる
  if (term.endsWith('た') || term.endsWith('て')) {
    const ending = term.slice(-1);
    const stem = term.slice(0, -1);
    const ichidan = stem + 'る';
    const r = findWordReading(ichidan);
    if (r && r.reading && r.reading.endsWith('る')) {
      return {
        reading: r.reading.slice(0, -1) + ending,
        meaning_es: r.meaning_es,
        meaning_en: r.meaning_en
      };
    }
  }

  // Godan った / って -> う, つ, る
  if (term.endsWith('った') || term.endsWith('って')) {
    const ending = term.slice(-2);
    const prefix = term.slice(0, -2);
    for (const endChar of ['う', 'つ', 'る']) {
      const cand = prefix + endChar;
      const r = findWordReading(cand);
      if (r && r.reading) {
        return {
          reading: r.reading.slice(0, -1) + ending,
          meaning_es: r.meaning_es,
          meaning_en: r.meaning_en
        };
      }
    }
  }

  // Godan んだ / んで -> む, ぶ, ぬ
  if (term.endsWith('んだ') || term.endsWith('んで')) {
    const ending = term.slice(-2);
    const prefix = term.slice(0, -2);
    for (const endChar of ['む', 'ぶ', 'ぬ']) {
      const cand = prefix + endChar;
      const r = findWordReading(cand);
      if (r && r.reading) {
        return {
          reading: r.reading.slice(0, -1) + ending,
          meaning_es: r.meaning_es,
          meaning_en: r.meaning_en
        };
      }
    }
  }

  // Godan いた / いて -> く
  if (term.endsWith('いた') || term.endsWith('いて')) {
    const ending = term.slice(-2);
    const prefix = term.slice(0, -2);
    const cand = prefix + 'く';
    const r = findWordReading(cand);
    if (r && r.reading) {
      return {
        reading: r.reading.slice(0, -1) + ending,
        meaning_es: r.meaning_es,
        meaning_en: r.meaning_en
      };
    }
  }

  // Godan いだ / いで -> ぐ
  if (term.endsWith('いだ') || term.endsWith('いで')) {
    const ending = term.slice(-2);
    const prefix = term.slice(0, -2);
    const cand = prefix + 'ぐ';
    const r = findWordReading(cand);
    if (r && r.reading) {
      return {
        reading: r.reading.slice(0, -1) + ending,
        meaning_es: r.meaning_es,
        meaning_en: r.meaning_en
      };
    }
  }

  // Godan した / して -> す
  if (term.endsWith('した') || term.endsWith('して')) {
    const ending = term.slice(-2);
    const prefix = term.slice(0, -2);
    const cand = prefix + 'す';
    const r = findWordReading(cand);
    if (r && r.reading) {
      return {
        reading: r.reading.slice(0, -1) + ending,
        meaning_es: r.meaning_es,
        meaning_en: r.meaning_en
      };
    }
  }

  return null;
}

/**
 * Resuelve la lectura fonética de una sola palabra o token con kanji
 */
function findWordReading(term) {
  if (!term) return null;
  const clean = term.trim();
  if (!/[\u4e00-\u9faf\u3400-\u4dbf]/.test(clean)) {
    return {
      reading: wanakana.toHiragana(clean),
      meaning_es: '',
      meaning_en: ''
    };
  }

  const { localDict: dict } = getLocalData();

  // 1. Verbos irregulares rápidos (ej. 行った, 来た)
  if (IRREGULAR_VERBS[clean]) {
    return { reading: IRREGULAR_VERBS[clean], meaning_es: '', meaning_en: '' };
  }

  // 2. Diccionario local (curado, catálogo, kanji words)
  if (dict.has(clean)) {
    const l = dict.get(clean);
    return {
      reading: l.reading,
      meaning_es: l.meaning_es || '',
      level: l.level || 'N5',
      category: l.category || 'Vocabulario General'
    };
  }

  // 3. Búsqueda exacta en kanji-data JMDict
  const kdExact = findInKanjiData(clean);
  if (kdExact && kdExact.reading) {
    return {
      reading: kdExact.reading,
      meaning_es: '',
      meaning_en: kdExact.meaning_en
    };
  }

  // 4. Cópulas compuestas (ej. お疲れ様です -> お疲れ様 + です)
  for (const c of COPULAS) {
    if (clean.endsWith(c) && clean.length > c.length) {
      const stem = clean.slice(0, -c.length);
      const stemRes = findWordReading(stem);
      if (stemRes && stemRes.reading) {
        return {
          reading: stemRes.reading + c,
          meaning_es: stemRes.meaning_es,
          meaning_en: stemRes.meaning_en,
          level: stemRes.level
        };
      }
    }
  }

  // 5. Compuestos con する (ej. 勉強する -> 勉強 + する)
  for (const sf of SURU_FORMS) {
    if (clean.endsWith(sf) && clean.length > sf.length) {
      const stem = clean.slice(0, -sf.length);
      const stemRes = findWordReading(stem);
      if (stemRes && stemRes.reading) {
        return {
          reading: stemRes.reading + sf,
          meaning_es: stemRes.meaning_es,
          meaning_en: stemRes.meaning_en,
          level: stemRes.level
        };
      }
    }
  }

  // 6. Sufijos de cortesía o personas (ej. 先生方 -> 先生 + 方, 山田様 -> 山田 + 様)
  for (const item of SUFFIXES) {
    if (clean.endsWith(item.suffix) && clean.length > item.suffix.length) {
      const stem = clean.slice(0, -item.suffix.length);
      const stemRes = findWordReading(stem);
      if (stemRes && stemRes.reading) {
        return {
          reading: stemRes.reading + item.reading,
          meaning_es: stemRes.meaning_es,
          meaning_en: stemRes.meaning_en
        };
      }
    }
  }

  // 7. Prefijo honorífico お〜 o ご〜 (ej. お金 -> 金, ご飯 -> 飯, お名前 -> 名前)
  if (clean.startsWith('お') && clean.length > 1) {
    const base = clean.slice(1);
    const baseRes = findWordReading(base);
    if (baseRes && baseRes.reading) {
      return {
        reading: 'お' + baseRes.reading,
        meaning_es: baseRes.meaning_es,
        meaning_en: baseRes.meaning_en
      };
    }
  }
  if (clean.startsWith('ご') && clean.length > 1) {
    const base = clean.slice(1);
    const baseRes = findWordReading(base);
    if (baseRes && baseRes.reading) {
      return {
        reading: 'ご' + baseRes.reading,
        meaning_es: baseRes.meaning_es,
        meaning_en: baseRes.meaning_en
      };
    }
  }

  // 8. Inflexiones regulares verbales / adjetivales (ます, ました, ません, たい, くない, etc.)
  for (const inf of VERB_INFLECTIONS) {
    if (clean.endsWith(inf.form) && clean.length > inf.form.length) {
      const stem = clean.slice(0, -inf.form.length);
      if (inf.isAdj) {
        const adj = stem + 'い';
        const rAdj = findWordReading(adj);
        if (rAdj && rAdj.reading && rAdj.reading.endsWith('い')) {
          return {
            reading: rAdj.reading.slice(0, -1) + inf.form,
            meaning_es: rAdj.meaning_es,
            meaning_en: rAdj.meaning_en
          };
        }
      } else {
        // Verbos Ichidan (ej. 食べました -> 食べる -> たべました)
        const ichidan = stem + 'る';
        const r1 = findWordReading(ichidan);
        if (r1 && r1.reading && r1.reading.endsWith('る')) {
          return {
            reading: r1.reading.slice(0, -1) + inf.form,
            meaning_es: r1.meaning_es,
            meaning_en: r1.meaning_en
          };
        }
        // Verbos Godan (ej. 行きます -> 行く -> いきます, 飲みます -> 飲む -> のみます)
        const lastChar = stem.slice(-1);
        const prefix = stem.slice(0, -1);
        const godanMap = {
          'い': 'う', 'き': 'く', 'ぎ': 'ぐ', 'し': 'す',
          'ち': 'つ', 'に': 'ぬ', 'び': 'ぶ', 'み': 'む', 'り': 'る'
        };
        if (godanMap[lastChar]) {
          const godan = prefix + godanMap[lastChar];
          const r2 = findWordReading(godan);
          if (r2 && r2.reading) {
            const rLast = r2.reading.slice(-1);
            const rPrefix = r2.reading.slice(0, -1);
            const revMap = {
              'う': 'い', 'く': 'き', 'ぐ': 'ぎ', 'す': 'し',
              'つ': 'ち', 'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'る': 'り'
            };
            if (revMap[rLast]) {
              return {
                reading: rPrefix + revMap[rLast] + inf.form,
                meaning_es: r2.meaning_es,
                meaning_en: r2.meaning_en
              };
            }
          }
        }
      }
    }
  }

  // 9. Pasado o te-form de verbos Godan (ej. 食べた, 飲んだ, 話した, 泳いだ, 買った)
  const taTeRes = resolveTaTeForm(clean);
  if (taTeRes && taTeRes.reading) {
    return taTeRes;
  }

  return null;
}

/**
 * Resuelve la lectura para cualquier texto, palabra o frase larga con kanji.
 * Si es una frase compuesta, usa segmentación morfológica.
 */
function resolveFullTextReading(rawText) {
  const clean = String(rawText || '')
    .replace(/<rt>.*?<\/rt>/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();

  if (!clean) {
    return {
      text: '',
      hiragana: '',
      katakana: '',
      romaji: '',
      kanjis: []
    };
  }

  // Si no contiene kanji, convertir directamente
  const hasKanji = /[\u4e00-\u9faf\u3400-\u4dbf]/.test(clean);
  if (!hasKanji) {
    const hira = wanakana.toHiragana(clean);
    const kata = wanakana.toKatakana(clean);
    const rom = wanakana.toRomaji(clean);
    return {
      text: clean,
      hiragana: hira,
      katakana: kata,
      romaji: rom,
      meaning_es: '',
      meaning_en: '',
      kanjis: []
    };
  }

  // 1. Usar resolución morfológica síncrona avanzada (diccionario de 1500+ palabras, lematizador de verbos, adjetivos, partículas y cópulas)
  const syncRes = convertKanjiToKanaSync(clean);
  if (syncRes && syncRes.isResolved && syncRes.hiragana && !/[\u4e00-\u9faf\u3400-\u4dbf]/.test(syncRes.hiragana)) {
    const finalHira = syncRes.hiragana;
    const finalKata = syncRes.katakana || wanakana.toKatakana(finalHira);
    const finalRom = wanakana.toRomaji(finalHira);
    return {
      text: clean,
      hiragana: finalHira,
      katakana: finalKata,
      romaji: finalRom,
      meaning_es: syncRes.meaning_es || '',
      meaning_en: '',
      level: syncRes.level || 'N5',
      kanjis: Array.from(new Set(clean.match(/[\u4e00-\u9faf\u3400-\u4dbf]/g) || []))
    };
  }

  // 2. Intentar resolver como término o compuesto único secundario
  const direct = findWordReading(clean);
  if (direct && direct.reading && !/[\u4e00-\u9faf]/.test(direct.reading)) {
    const finalHira = direct.reading;
    const finalKata = wanakana.toKatakana(finalHira);
    const finalRom = wanakana.toRomaji(finalHira);
    return {
      text: clean,
      hiragana: finalHira,
      katakana: finalKata,
      romaji: finalRom,
      meaning_es: direct.meaning_es || '',
      meaning_en: direct.meaning_en || '',
      level: direct.level || 'N5',
      kanjis: Array.from(new Set(clean.match(/[\u4e00-\u9faf\u3400-\u4dbf]/g) || []))
    };
  }

  // 2. Segmentar con Intl.Segmenter si es una frase o contiene múltiples palabras
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
      const segments = Array.from(segmenter.segment(clean)).map(s => s.segment);
      if (segments.length > 1) {
        let fullHira = '';
        let meaningsEs = [];
        let meaningsEn = [];

        for (const seg of segments) {
          if (!/[\u4e00-\u9faf]/.test(seg)) {
            fullHira += wanakana.toHiragana(seg);
          } else {
            const segRes = findWordReading(seg);
            if (segRes && segRes.reading) {
              fullHira += segRes.reading;
              if (segRes.meaning_es) meaningsEs.push(segRes.meaning_es);
              if (segRes.meaning_en) meaningsEn.push(segRes.meaning_en);
            } else {
              // Fallback por carácter kanji
              let segHira = '';
              for (const ch of seg) {
                if (/[\u4e00-\u9faf]/.test(ch)) {
                  const meta = kd.get(ch);
                  const charReading = meta?.kun_readings?.[0]?.replace(/[.-]/g, '') ||
                                      meta?.on_readings?.[0] || '';
                  segHira += wanakana.toHiragana(charReading) || ch;
                } else {
                  segHira += wanakana.toHiragana(ch);
                }
              }
              fullHira += segHira;
            }
          }
        }

        const finalKata = wanakana.toKatakana(fullHira);
        const finalRom = wanakana.toRomaji(fullHira);
        return {
          text: clean,
          hiragana: fullHira,
          katakana: finalKata,
          romaji: finalRom,
          meaning_es: meaningsEs.join(' / '),
          meaning_en: meaningsEn.join('; '),
          level: 'N5',
          kanjis: Array.from(new Set(clean.match(/[\u4e00-\u9faf\u3400-\u4dbf]/g) || []))
        };
      }
    } catch (e) {
      console.warn('Segmenter fallback en reading API:', e);
    }
  }

  // 3. Fallback carácter a carácter usando on/kun readings de kanji-data
  let fallbackHira = '';
  for (const ch of clean) {
    if (/[\u4e00-\u9faf]/.test(ch)) {
      const meta = kd.get(ch);
      const r = meta?.kun_readings?.[0]?.replace(/[.-]/g, '') ||
                meta?.on_readings?.[0] || '';
      fallbackHira += wanakana.toHiragana(r) || ch;
    } else {
      fallbackHira += wanakana.toHiragana(ch);
    }
  }

  const kata = wanakana.toKatakana(fallbackHira);
  const rom = wanakana.toRomaji(fallbackHira);

  return {
    text: clean,
    hiragana: fallbackHira,
    katakana: kata,
    romaji: rom,
    meaning_es: '',
    meaning_en: '',
    level: 'N5',
    kanjis: Array.from(new Set(clean.match(/[\u4e00-\u9faf\u3400-\u4dbf]/g) || []))
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const textRaw = searchParams.get('text');

    if (!textRaw) {
      return Response.json({ error: 'Parámetro "text" requerido' }, { status: 400 });
    }

    const cacheKey = textRaw.trim();
    if (readingCache.has(cacheKey)) {
      return Response.json(readingCache.get(cacheKey), {
        headers: { 'Cache-Control': 'public, max-age=86400, immutable' }
      });
    }

    const result = resolveFullTextReading(textRaw);

    // Adjuntar pitch accent si está registrado
    const { pitchAccents: pitchMap } = getLocalData();
    const pEntry = pitchMap[result.text] || pitchMap[result.hiragana];
    if (pEntry) {
      result.pitch = {
        pattern: parseInt(pEntry.pattern, 10) || 0,
        type: pEntry.type || 'heiban',
        moraCount: pEntry.moraCount || 0
      };
    } else {
      result.pitch = { pattern: 0, type: 'heiban' };
    }

    // Guardar en caché
    if (readingCache.size >= MAX_CACHE_SIZE) {
      const firstKey = readingCache.keys().next().value;
      readingCache.delete(firstKey);
    }
    readingCache.set(cacheKey, result);

    return Response.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=86400, immutable',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('API Kanji Reading Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const textRaw = body?.text;

    if (!textRaw) {
      return Response.json({ error: 'Campo "text" requerido en JSON' }, { status: 400 });
    }

    const result = resolveFullTextReading(textRaw);

    const { pitchAccents: pitchMap } = getLocalData();
    const pEntry = pitchMap[result.text] || pitchMap[result.hiragana];
    if (pEntry) {
      result.pitch = {
        pattern: parseInt(pEntry.pattern, 10) || 0,
        type: pEntry.type || 'heiban'
      };
    } else {
      result.pitch = { pattern: 0, type: 'heiban' };
    }

    return Response.json(result);
  } catch (error) {
    console.error('API Kanji Reading Error (POST):', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
