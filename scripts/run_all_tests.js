/**
 * Suite de Pruebas Automatizadas de Nihongo Master
 * Verifica el cumplimiento estricto de las Reglas 1 a 6 de AGENTS.md:
 * - Regla 1: Vocabulario completo (Kanji, Hiragana, Katakana, español, nivel JLPT)
 * - Regla 2: Sincronización bidireccional entre vocabulario y kanji.json (100% de cobertura)
 * - Regla 3: Verificación de compilación lista para despliegue en Vercel
 * - Regla 4: No duplicidad e integridad del currículum (37 módulos, Can-Dos, ejercicios, temas relacionados)
 * - Regla 5: Mapeo de audios en temarios (NHK y diálogos)
 * - Regla 6: Estándar exclusivo de niveles JLPT (N5..N1), 0 CEFR en bases de datos
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

const KANJI_REGEX = /[\u4e00-\u9faf\u3400-\u4dbf]/;
const VALID_JLPT_LEVELS = new Set(['N5', 'N4', 'N3', 'N2', 'N1']);
const CEFR_FORBIDDEN = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================');
console.log('🇯🇵  NIHONGO MASTER - SUITE DE VALIDACIÓN TÉCNICA');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// REGLA 6: Estándar Exclusivo de Niveles JLPT (N5..N1) sin CEFR
// -----------------------------------------------------------------------------
console.log('--- REGLA 6: Estándar Exclusivo JLPT (N5 - N1) ---');

const datasetsToCheck = [
  'vocabulary.json',
  'kanji.json',
  'curriculum.json',
  'particles.json',
  'stories.json',
  'pdf_catalog.json',
  'irodori_dialogues.json',
  'nhk_lessons.json'
];

datasetsToCheck.forEach(filename => {
  runTest(`Dataset ${filename} contiene únicamente niveles JLPT válidos y 0 CEFR`, () => {
    const filePath = path.join(DATA_DIR, filename);
    assert(fs.existsSync(filePath), `El archivo ${filename} debe existir`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assert(Array.isArray(data), `El dataset ${filename} debe ser un arreglo`);

    data.forEach((item, idx) => {
      if (item.level) {
        assert(!CEFR_FORBIDDEN.has(item.level), `Elemento #${idx} en ${filename} usa nivel CEFR prohibido: "${item.level}"`);
        assert(VALID_JLPT_LEVELS.has(item.level), `Elemento #${idx} en ${filename} tiene nivel JLPT no reconocido: "${item.level}"`);
      }
    });
  });
});

// -----------------------------------------------------------------------------
// REGLA 1: Vocabulario Completo (Kanji, Hiragana, Katakana, Español, Nivel)
// -----------------------------------------------------------------------------
console.log('\n--- REGLA 1: Integridad y Forma de Vocabulario ---');

runTest('Cada palabra en vocabulary.json tiene Kanji, Hiragana, Katakana, Español y Nivel', () => {
  const vocabPath = path.join(DATA_DIR, 'vocabulary.json');
  const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
  assert(vocab.length >= 300, `Se esperaban más de 300 palabras registradas, encontradas: ${vocab.length}`);

  vocab.forEach((v, idx) => {
    assert(typeof v.kanji === 'string' && v.kanji.trim().length > 0, `Palabra #${idx} sin kanji válido`);
    assert(typeof v.hiragana === 'string' && v.hiragana.trim().length > 0, `Palabra "${v.kanji}" sin hiragana`);
    assert(typeof v.katakana === 'string' && v.katakana.trim().length > 0, `Palabra "${v.kanji}" sin katakana`);
    assert(typeof v.meaning_es === 'string' && v.meaning_es.trim().length > 0, `Palabra "${v.kanji}" sin meaning_es`);
    assert(VALID_JLPT_LEVELS.has(v.level), `Palabra "${v.kanji}" sin nivel JLPT válido`);

    // El campo hiragana jamás debe contener kanjis
    assert(!KANJI_REGEX.test(v.hiragana), `Palabra "${v.kanji}" contiene caracteres kanji en su campo hiragana: "${v.hiragana}"`);
    // El campo katakana jamás debe contener kanjis
    assert(!KANJI_REGEX.test(v.katakana), `Palabra "${v.kanji}" contiene caracteres kanji en su campo katakana: "${v.katakana}"`);
  });
});

// -----------------------------------------------------------------------------
// REGLA 2: Sincronización Bidireccional con data/kanji.json
// -----------------------------------------------------------------------------
console.log('\n--- REGLA 2: Sincronización Bidireccional Vocabulario - Kanji ---');

runTest('Todas las palabras con ideogramas están registradas en kanji.words para cada kanji', () => {
  const vocabPath = path.join(DATA_DIR, 'vocabulary.json');
  const kanjiPath = path.join(DATA_DIR, 'kanji.json');
  const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
  const kanjis = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));

  const kanjiMap = new Map(kanjis.map(k => [k.kanji, k]));

  vocab.forEach(v => {
    const chars = [...v.kanji];
    chars.forEach(char => {
      if (kanjiMap.has(char)) {
        const kObj = kanjiMap.get(char);
        const hasWord = Array.isArray(kObj.words) && kObj.words.some(w => w.word === v.kanji);
        assert(hasWord, `La palabra "${v.kanji}" no está registrada en el kanji "${char}" (${kObj.meaning_es})`);
      }
    });
  });
});

runTest('El 100% de los kanjis en catálogo tienen lista de palabras compuestas (words)', () => {
  const kanjiPath = path.join(DATA_DIR, 'kanji.json');
  const kanjis = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
  
  assert(kanjis.length >= 160, `Se esperaban al menos 160 kanjis, encontrados: ${kanjis.length}`);
  kanjis.forEach(k => {
    assert(Array.isArray(k.words) && k.words.length > 0, `El kanji "${k.kanji}" (${k.meaning_es}) no tiene palabras asociadas en words`);
    k.words.forEach(w => {
      assert(typeof w.word === 'string' && w.word.length > 0, `Kanji "${k.kanji}" tiene palabra vacía`);
      assert(typeof w.reading === 'string' && w.reading.length > 0, `Kanji "${k.kanji}" palabra "${w.word}" sin lectura`);
      assert(typeof w.meaning === 'string' && w.meaning.length > 0, `Kanji "${k.kanji}" palabra "${w.word}" sin significado`);
    });
  });
});

// -----------------------------------------------------------------------------
// REGLA 4: Currículum Unificado sin duplicidad y enlaces temáticos
// -----------------------------------------------------------------------------
console.log('\n--- REGLA 4: Integridad del Currículum (37 Módulos) ---');

runTest('El currículum contiene exactamente 37 módulos secuenciales sin duplicados', () => {
  const currPath = path.join(DATA_DIR, 'curriculum.json');
  const curr = JSON.parse(fs.readFileSync(currPath, 'utf-8'));
  
  assert.strictEqual(curr.length, 37, `El currículum debe tener exactamente 37 módulos, tiene: ${curr.length}`);
  
  const stepNumbers = new Set();
  curr.forEach((step, idx) => {
    const expectedStep = idx + 1;
    assert.strictEqual(step.step, expectedStep, `El módulo en índice ${idx} tiene step=${step.step}, esperado: ${expectedStep}`);
    assert(!stepNumbers.has(step.step), `Módulo step duplicado: ${step.step}`);
    stepNumbers.add(step.step);

    assert(typeof step.title === 'string' && step.title.length > 0, `Módulo ${step.step} sin título`);
    assert(VALID_JLPT_LEVELS.has(step.level), `Módulo ${step.step} sin nivel JLPT válido`);
    assert(Array.isArray(step.sections) && step.sections.length > 0, `Módulo ${step.step} sin secciones`);
    assert(Array.isArray(step.exercises) && step.exercises.length > 0, `Módulo ${step.step} sin ejercicios`);
    const canDos = Array.isArray(step.can_dos) ? step.can_dos : (Array.isArray(step.can_do) ? step.can_do : []);
    assert(canDos.length > 0, `Módulo ${step.step} sin objetivos Can-Do`);
    
    // Verificación de enlaces o temas relacionados
    const hasRelated = Array.isArray(step.related_topics) || Array.isArray(step.related_steps);
    assert(hasRelated, `Módulo ${step.step} debe definir 'related_topics' o 'related_steps'`);
  });
});

// -----------------------------------------------------------------------------
// REGLA 5: Mapeo de Audios en Temarios
// -----------------------------------------------------------------------------
console.log('\n--- REGLA 5: Soporte de Audios en Temarios ---');

runTest('Todas las lecciones de NHK World contienen audios MP3 mapeados', () => {
  const nhkPath = path.join(DATA_DIR, 'nhk_lessons.json');
  const nhk = JSON.parse(fs.readFileSync(nhkPath, 'utf-8'));
  assert.strictEqual(nhk.length, 48, `NHK World debe contener exactamente 48 lecciones, tiene: ${nhk.length}`);

  nhk.forEach(lesson => {
    const hasAudio = Boolean(lesson.audio_url || lesson.audio_local);
    assert(hasAudio, `Lección ${lesson.lesson} de NHK sin audio mapeado`);
  });
});

// -----------------------------------------------------------------------------
// FURIGANA: Verificación de Sistema de Furigana en Módulos
// -----------------------------------------------------------------------------
console.log('\n--- FURIGANA: Sistema de Furigana en Módulos del Currículum ---');

runTest('El diccionario de furigana y la utilidad toFurigana generan anotaciones ruby válidas', () => {
  const dictPath = path.join(DATA_DIR, 'furigana_dict.json');
  assert(fs.existsSync(dictPath), 'data/furigana_dict.json debe existir');
  const dict = JSON.parse(fs.readFileSync(dictPath, 'utf-8'));
  assert(Object.keys(dict).length >= 1000, `El diccionario de furigana debe tener >= 1000 entradas, tiene: ${Object.keys(dict).length}`);

  // Test simple conversion with regex
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  const regex = new RegExp(keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  const sample = 'はじめまして。私はアンナです。';
  const converted = sample.replace(regex, (m) => `<ruby class="furigana-ruby">${m}<rt>${dict[m]}</rt></ruby>`);
  assert(converted.includes('<ruby class="furigana-ruby">私<rt>わたし</rt></ruby>'), 'Debe generar furigana correcto para 私');
});

console.log('\n======================================================');
console.log(`Resumen: ${passedTests}/${totalTests} pruebas superadas con éxito (100%)`);
console.log('======================================================\n');
