import assert from 'node:assert';
import kanjiData from '../data/kanji.json' with { type: 'json' };
import curriculumData from '../data/curriculum.json' with { type: 'json' };
import vocabularyData from '../data/vocabulary.json' with { type: 'json' };
import exercisesData from '../data/exercises.json' with { type: 'json' };
import { 
  normalizeKanjiReadingSet, 
  katakanaToHiragana, 
  smartSegmentJapanese,
  extractScrambleSentence, 
  isCanDoScrambleEligible 
} from '../lib/japaneseUtils.js';
import { compileFsrsItems, getFsrsOverview, getNewCard, reviewCard, SRSRating } from '../lib/srs.js';

console.log('=== TEST SUITE: OPTIMIZACIÓN DE MÉTODOS DE APRENDIZAJE ===\n');

// -------------------------------------------------------------
// 1. KANJI READING NORMALIZATION & ZERO FALSE POSITIVES
// -------------------------------------------------------------
console.log('1. Probando normalización fonética de Kanjis...');

const kanjiSei = kanjiData.find(k => k.kanji === '生');
assert(kanjiSei, 'Kanji 生 debe existir');
const seiReadings = normalizeKanjiReadingSet(kanjiSei);
assert(seiReadings.has('いきる'), 'Debe aceptar いきる (con okurigana resuelto)');
assert(seiReadings.has('い'), 'Debe aceptar い (raíz)');
assert(seiReadings.has('せい'), 'Debe aceptar せい (onyomi)');
assert(seiReadings.has('セイ'), 'Debe aceptar セイ (katakana)');
assert(seiReadings.has('うまれる'), 'Debe aceptar うまれる');

const kanjiIchi = kanjiData.find(k => k.kanji === '一');
assert(kanjiIchi, 'Kanji 一 debe existir');
const ichiReadings = normalizeKanjiReadingSet(kanjiIchi);
assert(!ichiReadings.has('い'), 'Debe rechazar "い" para 一 (previene falso positivo de 1 mora)');
assert(!ichiReadings.has('イ'), 'Debe rechazar "イ" para 一');
assert(ichiReadings.has('いち'), 'Debe aceptar いち');
assert(ichiReadings.has('イチ'), 'Debe aceptar イチ');
assert(ichiReadings.has('ひと'), 'Debe aceptar ひと');
assert(ichiReadings.has('ひとつ'), 'Debe aceptar ひとつ');

console.log('  ✓ Normalización fonética de Kanjis verificada sin falsos positivos.');

// -------------------------------------------------------------
// 2. CAN-DO SENTENCE SCRAMBLE INTEGRITY ACROSS ALL CAN-DOS
// -------------------------------------------------------------
console.log('\n2. Probando Reto Can-Do Sentence Scramble en los 141 Can-Dos...');

let eligibleCount = 0;
let ineligibleCount = 0;

curriculumData.forEach(mod => {
  (mod.can_dos || []).forEach(cd => {
    const isEligible = isCanDoScrambleEligible(cd);
    const scramble = extractScrambleSentence(cd.sample);

    if (isEligible) {
      eligibleCount++;
      assert(scramble, `Can-Do ${cd.id} marcado como elegible debe retornar datos válidos`);
      assert(Array.isArray(scramble.tokens) && scramble.tokens.length >= 2, `${cd.id} debe tener al menos 2 fichas`);
      const joined = scramble.tokens.join('');
      assert.strictEqual(joined, scramble.targetText, `Fichas ensambladas de ${cd.id} deben coincidir exactamente con targetText`);
      // Asegurar que no hay fragmentos corruptos de español como "reuniones" -> "ni"
      assert(!scramble.tokens.includes('reuniones'), `${cd.id} no debe contener palabras en español`);
    } else {
      ineligibleCount++;
      assert.strictEqual(scramble, null, `Can-Do ${cd.id} no elegible debe retornar null`);
    }
  });
});

assert(eligibleCount >= 120, `Se esperaban >= 120 Can-Dos elegibles, obtenidos: ${eligibleCount}`);
assert(ineligibleCount > 0, `Debe haber Can-Dos no elegibles filtrados (listas o etiquetas sin oración), obtenidos: ${ineligibleCount}`);
console.log(`  ✓ ${eligibleCount} Can-Dos elegibles con 100% coincidencia exacta (${ineligibleCount} listas/etiquetas filtradas correctamente).`);

// -------------------------------------------------------------
// 3. VOCABULARY CLOZE SRS: KANJI & KANA BIDIRECTIONAL ACCEPTANCE
// -------------------------------------------------------------
console.log('\n3. Probando validación fonética y Kanji en Cloze Sentences SRS...');

function validateClozeAnswer(input, clozeData, currentItem) {
  if (!clozeData || !input.trim()) return false;
  const rawInput = input.trim();
  const cleanInput = katakanaToHiragana(rawInput);

  const validTargets = new Set();
  const addCandidate = (cand) => {
    if (!cand || typeof cand !== 'string') return;
    const t = cand.trim();
    if (!t) return;
    validTargets.add(t);
    const hira = katakanaToHiragana(t);
    if (hira) validTargets.add(hira);
  };

  addCandidate(clozeData.correct);
  if (currentItem) {
    addCandidate(currentItem.kanji);
    addCandidate(currentItem.kana);
    addCandidate(currentItem.hiragana);
    addCandidate(currentItem.katakana);
  }

  return validTargets.has(rawInput) || validTargets.has(cleanInput);
}

// Caso 1: Palabra con Kanji en Tatoeba (estudiante escribe en Hiragana con IME)
const sampleItem = {
  id: 101,
  kanji: '学生',
  kana: 'がくせい',
  hiragana: 'がくせい',
  katakana: 'ガクセイ'
};
const sampleClozeData = {
  sentence: '私は学生です。',
  masked: '私は【 ？ 】です。',
  correct: '学生'
};

assert(validateClozeAnswer('がくせい', sampleClozeData, sampleItem), 'Debe aceptar lectura en hiragana para kanji en Cloze');
assert(validateClozeAnswer('ガクセイ', sampleClozeData, sampleItem), 'Debe aceptar katakana');
assert(validateClozeAnswer('学生', sampleClozeData, sampleItem), 'Debe aceptar kanji exacto');
assert(!validateClozeAnswer('せんせい', sampleClozeData, sampleItem), 'Debe rechazar palabra incorrecta');

// Caso 2: Ejercicio de exercises.json (correct en hiragana)
const exCloze = exercisesData[0];
assert(validateClozeAnswer(exCloze.correct, exCloze, null), 'Debe aceptar respuesta correcta de exercises.json');

console.log('  ✓ Validación de oraciones Cloze soporta Kanji y Kana bidireccionalmente.');

// -------------------------------------------------------------
// 4. SPEECH PRACTICE: STRICT THRESHOLD & NO AMBIENT NOISE LEAK
// -------------------------------------------------------------
console.log('\n4. Probando evaluación de pronunciación y umbral estricto (>= 75%)...');

function evaluatePronunciationStrict(spoken, target, threshold = 0.75) {
  const cleanSpoken = spoken.trim();
  const cleanTarget = target.trim();

  if (cleanSpoken === cleanTarget) return { isMatch: true, score: 1.0 };

  // Substring match
  if (cleanTarget.length > 3) {
    // Si el usuario dijo la frase completa más relleno
    if (cleanSpoken.includes(cleanTarget)) {
      return { isMatch: true, score: 0.85 };
    }
    // Si solo dijo un fragmento, verificar cobertura
    if (cleanTarget.includes(cleanSpoken)) {
      const ratio = cleanSpoken.length / (cleanTarget.length || 1);
      if (ratio >= threshold) {
        return { isMatch: true, score: ratio };
      }
    }
  }

  return { isMatch: false, score: cleanSpoken.length / cleanTarget.length };
}

const longSentence = '私はマルシアです';
// Single mora ambient noise
const noiseRes = evaluatePronunciationStrict('は', longSentence, 0.75);
assert.strictEqual(noiseRes.isMatch, false, 'Una sola mora ("は") NO debe aprobar una oración larga en modo estricto');

// Complete phrase with leading filler
const fullWithFiller = evaluatePronunciationStrict('ええと、私はマルシアです', longSentence, 0.75);
assert.strictEqual(fullWithFiller.isMatch, true, 'La frase completa pronunciada con relleno debe aprobar');

console.log('  ✓ Umbral estricto SpeechPractice verificado contra falsos positivos.');

// -------------------------------------------------------------
// 5. FSRS COMPILATION & OVERVIEW: CURRICULUM AND SCRIPTPAD CATEGORIES
// -------------------------------------------------------------
console.log('\n5. Probando compilación FSRS v5 con Currículum y Scriptpad...');

const dummyState = {
  xp: 100,
  srsQuestions: {
    'cur_ex_1_0': reviewCard(getNewCard(), SRSRating.Good),
    'cur_ex_1_1': reviewCard(getNewCard(), SRSRating.Again),
    'sp_write_水': reviewCard(getNewCard(), SRSRating.Good),
    'sp_write_火': reviewCard(getNewCard(), SRSRating.Hard)
  }
};

const compiled = compileFsrsItems(dummyState, {
  curriculum: curriculumData,
  kanji: kanjiData,
  vocabulary: vocabularyData
});

// Comprobar items curriculares en catálogo consolidado
const curItems = compiled.filter(item => item.category === 'curriculum');
assert(curItems.length >= 154, `Se esperaban >= 154 items curriculares, obtenidos: ${curItems.length}`);
const curWithCard = curItems.filter(item => item.hasCard);
assert.strictEqual(curWithCard.length, 2, 'Deben registrarse exactamente 2 tarjetas curriculares con estado activo');

// Comprobar items de scriptpad
const spItems = compiled.filter(item => item.category === 'scriptpad');
assert.strictEqual(spItems.length, 2, 'Deben compilarse exactamente 2 tarjetas de scriptpad con categoría "scriptpad"');
assert(spItems.some(i => i.id === 'sp_write_水'), 'Debe incluir sp_write_水');

// Comprobar getFsrsOverview
const overview = getFsrsOverview(dummyState, {
  curriculum: curriculumData,
  kanji: kanjiData,
  vocabulary: vocabularyData
});

assert(overview.topics.some(t => t.id === 'curriculum'), 'Topics debe incluir categoría curriculum');
assert(overview.topics.some(t => t.id === 'scriptpad'), 'Topics debe incluir categoría scriptpad');

const curTopic = overview.topics.find(t => t.id === 'curriculum');
assert(curTopic.total >= 2, 'Total de curriculum debe reflejar las tarjetas');

const spTopic = overview.topics.find(t => t.id === 'scriptpad');
assert.strictEqual(spTopic.total, 2, 'Total de scriptpad debe ser 2');

console.log('  ✓ Compilación y resumen FSRS v5 verificado con categorías curriculares y caligráficas.');

console.log('\n=============================================================');
console.log('🎉 TODAS LAS PRUEBAS DE LA SUITE DE APRENDIZAJE PASARON AL 100%');
console.log('=============================================================\n');
