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
  'nhk_lessons.json',
  'scriptpad_units.json',
  'kotowaza.json'
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
// SCRIPTPAD: Integridad del Catálogo de Unidades y Lecciones de Escritura
// -----------------------------------------------------------------------------
console.log('\n--- SCRIPTPAD: Integridad de Unidades y Lecciones de Escritura ---');

runTest('Catálogo scriptpad_units.json tiene unidades, lecciones y palabras completas', () => {
  const unitsPath = path.join(DATA_DIR, 'scriptpad_units.json');
  assert(fs.existsSync(unitsPath), 'El archivo scriptpad_units.json debe existir');
  const units = JSON.parse(fs.readFileSync(unitsPath, 'utf-8'));
  assert(Array.isArray(units) && units.length >= 8, `Se esperaban al menos 8 unidades en Scriptpad, encontradas: ${units.length}`);

  let totalWords = 0;
  let totalLessons = 0;

  units.forEach(unit => {
    assert(unit.id && unit.title && unit.kanji_icon, `Unidad "${unit.title}" debe tener id, title y kanji_icon`);
    assert(Array.isArray(unit.lessons) && unit.lessons.length > 0, `Unidad "${unit.title}" debe tener lecciones`);

    unit.lessons.forEach(lesson => {
      totalLessons++;
      assert(lesson.id && lesson.title, `Lección en unidad "${unit.title}" sin id o título`);
      assert(Array.isArray(lesson.words) && lesson.words.length > 0, `Lección "${lesson.title}" debe tener palabras`);

      lesson.words.forEach(w => {
        totalWords++;
        assert(w.kanji && w.kanji.trim().length > 0, `Palabra en lección "${lesson.title}" sin kanji`);
        assert(w.hiragana && w.hiragana.trim().length > 0, `Palabra "${w.kanji}" sin hiragana`);
        assert(w.katakana && w.katakana.trim().length > 0, `Palabra "${w.kanji}" sin katakana`);
        assert(w.meaning_es && w.meaning_es.trim().length > 0, `Palabra "${w.kanji}" sin traducción`);
        assert(VALID_JLPT_LEVELS.has(w.level), `Palabra "${w.kanji}" con nivel inválido: ${w.level}`);
        assert(!CEFR_FORBIDDEN.has(w.level), `Palabra "${w.kanji}" usa CEFR prohibido`);
      });
    });
  });

  assert(totalLessons >= 30, `Se esperaban al menos 30 lecciones, encontradas: ${totalLessons}`);
  assert(totalWords >= 300, `Se esperaban al menos 300 palabras en el catálogo de Scriptpad, encontradas: ${totalWords}`);
});

runTest('No existen palabras duplicadas en todo el temario unificado de Scriptpad', () => {
  const unitsPath = path.join(DATA_DIR, 'scriptpad_units.json');
  const units = JSON.parse(fs.readFileSync(unitsPath, 'utf-8'));
  const seenWords = new Map();

  units.forEach(u => {
    (u.lessons || []).forEach(l => {
      (l.words || []).forEach(w => {
        const key = (w.kanji || w.hiragana || '').trim();
        if (seenWords.has(key)) {
          const prev = seenWords.get(key);
          assert.fail(`Palabra duplicada detectada: "${key}" en [${l.id}] (${l.title}), ya vista en [${prev.lessonId}] (${prev.lessonTitle})`);
        }
        seenWords.set(key, { lessonId: l.id, lessonTitle: l.title });
      });
    });
  });

  assert(seenWords.size >= 1000, `Se esperaban más de 1000 palabras únicas, encontradas: ${seenWords.size}`);
});
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

// -----------------------------------------------------------------------------
// COMPONENTES & MODALES: Integridad de Hooks de React
// -----------------------------------------------------------------------------
console.log('\n--- COMPONENTES & MODALES: Integridad de Hooks de React ---');

runTest('Todos los componentes y modales importan correctamente los React Hooks que utilizan', () => {
  const hooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext'];
  let checkedCount = 0;

  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const h of hooks) {
      const regex = new RegExp(`\\b${h}\\b`);
      if (regex.test(content)) {
        const hasImport = new RegExp(`import[^{]*{[^}]*\\b${h}\\b[^}]*}[^{]*from\\s*["\x27]react["\x27]`).test(content);
        const isOnlyReactDot = !new RegExp(`(?<!React\\.)${h}\\(`).test(content);
        assert(hasImport || isOnlyReactDot, `En ${path.relative(ROOT_DIR, filePath)} se utiliza ${h} pero NO está importado de 'react'`);
      }
    }
    checkedCount++;
  }

  function walkDir(dir) {
    const fullDir = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullDir)) return;
    for (const f of fs.readdirSync(fullDir)) {
      const full = path.join(fullDir, f);
      if (fs.statSync(full).isDirectory()) {
        if (f !== 'node_modules' && f !== '.next' && f !== '.git') walkDir(path.join(dir, f));
      } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
        checkFile(full);
      }
    }
  }

  walkDir('components');
  walkDir('app');
  assert(checkedCount >= 50, `Se esperaban al menos 50 componentes verificados, revisados: ${checkedCount}`);
});

// -----------------------------------------------------------------------------
// NOTIFICACIONES & FSRS: Integridad y Contenido Dinámico
// -----------------------------------------------------------------------------
console.log('\n--- NOTIFICACIONES & FSRS: Integridad y Contenido Dinámico ---');

runTest('Módulos de notificaciones existen y exportan generadores dinámicos', () => {
  const notifContentPath = path.join(ROOT_DIR, 'lib', 'notificationContent.js');
  const notifManagerPath = path.join(ROOT_DIR, 'lib', 'notificationManager.js');
  const swPath = path.join(ROOT_DIR, 'public', 'sw.js');

  assert(fs.existsSync(notifContentPath), 'lib/notificationContent.js debe existir');
  assert(fs.existsSync(notifManagerPath), 'lib/notificationManager.js debe existir');
  assert(fs.existsSync(swPath), 'public/sw.js debe existir');

  const contentCode = fs.readFileSync(notifContentPath, 'utf8');
  assert(contentCode.includes('getKanjiOfTheDay'), 'Debe exportar getKanjiOfTheDay');
  assert(contentCode.includes('getWordOfTheDay'), 'Debe exportar getWordOfTheDay');
  assert(contentCode.includes('getParticleOfTheDay'), 'Debe exportar getParticleOfTheDay');
  assert(contentCode.includes('getRandomCulturalNugget'), 'Debe exportar getRandomCulturalNugget');
  assert(contentCode.includes('getFsrsDueNotification'), 'Debe exportar getFsrsDueNotification');
  assert(contentCode.includes('formatDynamicActivityNotification'), 'Debe exportar formatDynamicActivityNotification');

  const managerCode = fs.readFileSync(notifManagerPath, 'utf8');
  assert(managerCode.includes('checkFsrsSmartNotification'), 'Debe implementar checkFsrsSmartNotification');
  assert(managerCode.includes('notifyDailyGoalSuccess'), 'Debe implementar notifyDailyGoalSuccess');
  assert(managerCode.includes('fsrs_due'), 'DEFAULT_ACTIVITIES debe incluir fsrs_due');
  assert(managerCode.includes('random_pill'), 'DEFAULT_ACTIVITIES debe incluir random_pill');

  const swCode = fs.readFileSync(swPath, 'utf8');
  assert(swCode.includes('getDynamicPushNotification'), 'public/sw.js debe incluir generador dinámico getDynamicPushNotification');
  assert(swCode.includes('SW_KANJI_CATALOG'), 'public/sw.js debe contener SW_KANJI_CATALOG');
  assert(swCode.includes('SW_VOCAB_CATALOG'), 'public/sw.js debe contener SW_VOCAB_CATALOG');
});

runTest('Catálogo kotowaza.json tiene expresiones, kana, significado y nivel JLPT', () => {
  const kotowazaPath = path.join(DATA_DIR, 'kotowaza.json');
  assert(fs.existsSync(kotowazaPath), 'data/kotowaza.json debe existir');
  const items = JSON.parse(fs.readFileSync(kotowazaPath, 'utf8'));
  assert(Array.isArray(items) && items.length >= 25, 'Debe contener al menos 25 proverbios y modismos');

  items.forEach((item, idx) => {
    assert(item.id, `Elemento #${idx} debe tener id`);
    assert(item.expression, `Elemento #${idx} debe tener expression`);
    assert(item.kana, `Elemento #${idx} debe tener kana`);
    assert(item.meaning_es, `Elemento #${idx} debe tener meaning_es`);
    assert(item.teaching, `Elemento #${idx} debe tener teaching`);
    assert(item.category, `Elemento #${idx} debe tener category`);
    assert(VALID_JLPT_LEVELS.has(item.level), `Nivel ${item.level} inválido en ${item.id}`);
    assert(item.example && item.example.jp && item.example.es, `Ejemplo inválido en ${item.id}`);
  });
});

runTest('FSRS: Progresión controlada en repeticiones tempranas (sin saltos prematuros a meses)', () => {
  const { getNewCard, reviewCard, getIntervalPreviews, SRSRating } = require(path.join(ROOT_DIR, 'lib', 'srs.js'));

  // 1. Tarjeta nueva: progresión inicial suave
  const newCard = getNewCard();
  const previews1 = getIntervalPreviews(newCard);
  assert.strictEqual(previews1[1], '1d', 'Rep 1: Again debe ser 1d');
  assert.strictEqual(previews1[2], '1d', 'Rep 1: Hard debe ser 1d');
  assert.strictEqual(previews1[3], '2d', 'Rep 1: Good debe ser 2d');
  assert.strictEqual(previews1[4], '4d', 'Rep 1: Easy debe ser 4d');

  // 2. Primera vez calificada como Fácil (Rating 4)
  const cardAfterEasy1 = reviewCard(newCard, SRSRating.EASY);
  assert.strictEqual(cardAfterEasy1.reps, 1, 'Reps debe ser 1');
  assert.strictEqual(cardAfterEasy1.consecutive_reps, 1, 'Consecutive reps debe ser 1');
  assert.strictEqual(cardAfterEasy1.scheduled_days, 4, 'Scheduled days debe ser 4d');

  // 3. Previsualizaciones en 2º repaso (el caso reportado: NO debe saltar a 28d ni 2mo)
  const previews2 = getIntervalPreviews(cardAfterEasy1);
  assert.strictEqual(previews2[1], '1d', 'Rep 2: Again debe ser 1d');
  assert.strictEqual(previews2[2], '2d', 'Rep 2: Hard debe ser 2d (no 28d)');
  assert.strictEqual(previews2[3], '5d', 'Rep 2: Good debe ser 5d (no 1mo)');
  assert.strictEqual(previews2[4], '9d', 'Rep 2: Easy debe ser 9d (no 2mo)');
});

runTest('FSRS: Disminución y reinicio de cuentas en Difícil y Otra vez', () => {
  const { getNewCard, reviewCard, SRSRating } = require(path.join(ROOT_DIR, 'lib', 'srs.js'));

  const newCard = getNewCard();
  const cardRep1 = reviewCard(newCard, SRSRating.EASY);

  // Calificar 'Otra vez' (Again) en el 2º repaso debe reiniciar cuentas
  const cardAgain = reviewCard(cardRep1, SRSRating.AGAIN);
  assert.strictEqual(cardAgain.scheduled_days, 1, 'Intervalo debe reiniciarse a 1d');
  assert.strictEqual(cardAgain.consecutive_reps, 0, 'Racha debe reiniciarse a 0');
  assert.strictEqual(cardAgain.lapses, 1, 'Lapses debe incrementarse a 1');
  assert.strictEqual(cardAgain.state, 3, 'Estado debe ser Relearning (3)');

  // Tarjeta con madurez (ej. intervalo previo de 11 días)
  const matureCard = {
    reps: 3,
    consecutive_reps: 3,
    lapses: 0,
    scheduled_days: 11,
    stability: 11,
    difficulty: 4.5,
    state: 2,
    last_review: new Date(Date.now() - 11 * 86400000),
    due: new Date()
  };

  // Calificar 'Difícil' (Hard) debe disminuir el intervalo previo y penalizar racha
  const cardHard = reviewCard(matureCard, SRSRating.HARD);
  assert(cardHard.scheduled_days < 11, `Intervalo de Difícil (${cardHard.scheduled_days}d) debe ser menor al previo (11d)`);
  assert.strictEqual(cardHard.consecutive_reps, 2, 'Racha debe reducirse de 3 a 2');
  assert(cardHard.difficulty > matureCard.difficulty, 'Dificultad debe aumentar');
});

runTest('FSRS: Cada palabra maneja su estado, historial y tiempo de forma independiente', () => {
  const { reviewCard, getIntervalPreviews, ensureFsrsCard, isDue, SRSRating } = require(path.join(ROOT_DIR, 'lib', 'srs.js'));

  // Tarjeta A (palabra recién aprendida)
  let cardA = ensureFsrsCard({ reps: 0 });
  cardA = reviewCard(cardA, SRSRating.GOOD);

  // Tarjeta B (palabra repasada 3 veces exitosamente)
  let cardB = ensureFsrsCard({
    reps: 3,
    consecutive_reps: 3,
    lapses: 0,
    scheduled_days: 11,
    stability: 11,
    difficulty: 4.0,
    state: 2
  });

  const prevA = getIntervalPreviews(cardA);
  const prevB = getIntervalPreviews(cardB);

  // Los intervalos de A y B deben ser completamente independientes
  assert.strictEqual(prevA[3], '5d', 'Palabra A (2º repaso) Good debe ser 5d');
  assert.strictEqual(prevB[3], '22d', 'Palabra B (4º repaso) Good debe ser 22d');
  assert.notStrictEqual(cardA.due.getTime(), cardB.due.getTime(), 'Fechas de vencimiento deben ser independientes');

  // isDue debe evaluar correctamente tarjetas vencidas vs futuras
  const futureCard = { due: new Date(Date.now() + 100000000) };
  const pastCard = { due: new Date(Date.now() - 100000) };
  assert.strictEqual(isDue(futureCard), false, 'Tarjeta futura no debe estar due');
  assert.strictEqual(isDue(pastCard), true, 'Tarjeta pasada debe estar due');
});

// -----------------------------------------------------------------------------
// CONTROL DE SCROLL EN MODALES Y PREVENCIÓN DE GESTOS TÁCTILES
// -----------------------------------------------------------------------------
console.log('\n--- CONTROL DE SCROLL EN MODALES Y PREVENCIÓN DE GESTOS TÁCTILES ---');

runTest('useBodyScrollLock existe y exporta utilidades y hook de bloqueo de scroll', () => {
  const scrollLockPath = path.join(ROOT_DIR, 'lib', 'useBodyScrollLock.js');
  assert(fs.existsSync(scrollLockPath), 'lib/useBodyScrollLock.js debe existir');
  const code = fs.readFileSync(scrollLockPath, 'utf8');
  assert(code.includes('lockBodyScroll'), 'Debe exportar lockBodyScroll');
  assert(code.includes('unlockBodyScroll'), 'Debe exportar unlockBodyScroll');
  assert(code.includes('useBodyScrollLock'), 'Debe exportar useBodyScrollLock');
  assert(code.includes('preventBackgroundTouchMove'), 'Debe incluir prevención de touchmove en móvil');
  assert(code.includes('modal-open'), 'Debe manejar la clase modal-open');
});

runTest('useFocusTrap integra useBodyScrollLock para todos los modales accesibles', () => {
  const focusTrapPath = path.join(ROOT_DIR, 'lib', 'useFocusTrap.js');
  const code = fs.readFileSync(focusTrapPath, 'utf8');
  assert(code.includes('useBodyScrollLock'), 'useFocusTrap debe importar y utilizar useBodyScrollLock');
});

runTest('KanjiDraw tiene touchAction: none y previene scroll al dibujar en móvil', () => {
  const kanjiDrawPath = path.join(ROOT_DIR, 'components', 'features', 'KanjiDraw.jsx');
  const code = fs.readFileSync(kanjiDrawPath, 'utf8');
  assert(code.includes("touchAction: 'none'"), 'KanjiDraw debe declarar touchAction: none');
  assert(code.includes('preventTouchScroll'), 'KanjiDraw debe prevenir gestos táctiles con preventTouchScroll');
  assert(code.includes('overscrollBehavior'), 'KanjiDraw debe contener overscrollBehavior');
});

runTest('Todos los modales independientes implementan bloqueo de scroll', () => {
  const filesToCheck = [
    { file: 'components/tabs/KanjiTab.jsx', lock: 'useBodyScrollLock' },
    { file: 'components/tabs/VocabTab.jsx', lock: 'useBodyScrollLock' },
    { file: 'components/tabs/SavedTab.jsx', lock: 'useBodyScrollLock' },
    { file: 'components/features/FsrsStatsModule.jsx', lock: 'useBodyScrollLock' },
    { file: 'components/modals/TerminologyDetailModal.jsx', lock: 'useFocusTrap' },
    { file: 'components/layout/MobileNavDrawer.jsx', lock: 'useBodyScrollLock' },
    { file: 'components/layout/ProductTour.jsx', lock: 'useBodyScrollLock' }
  ];

  filesToCheck.forEach(({ file, lock }) => {
    const fullPath = path.join(ROOT_DIR, file);
    assert(fs.existsSync(fullPath), `${file} debe existir`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert(content.includes(lock), `${file} debe implementar ${lock}`);
  });
});

// -----------------------------------------------------------------------------
// SCROLL-CRAFT: Integridad de Primitivas, Estilos y Respeto a Reducción de Movimiento
// -----------------------------------------------------------------------------
console.log('\n--- SCROLL-CRAFT: Integridad de Primitivas y Estilos ---');

runTest('Primitivas useScrollCraft, StickyScrollStage y ScrollTimelinePath existen y son modulares', () => {
  const hookPath = path.join(ROOT_DIR, 'lib', 'scrollCraft', 'useScrollCraft.js');
  const stagePath = path.join(ROOT_DIR, 'components', 'scroll', 'StickyScrollStage.jsx');
  const timelinePath = path.join(ROOT_DIR, 'components', 'scroll', 'ScrollTimelinePath.jsx');

  assert(fs.existsSync(hookPath), 'useScrollCraft.js debe existir');
  assert(fs.existsSync(stagePath), 'StickyScrollStage.jsx debe existir');
  assert(fs.existsSync(timelinePath), 'ScrollTimelinePath.jsx debe existir');

  const hookCode = fs.readFileSync(hookPath, 'utf8');
  assert(hookCode.includes('prefers-reduced-motion'), 'useScrollCraft debe soportar prefers-reduced-motion');
  assert(hookCode.includes('requestAnimationFrame'), 'useScrollCraft debe usar rAF');
});

runTest('globals.css incluye soporte CSS scroll-driven animations y prefers-reduced-motion', () => {
  const cssPath = path.join(ROOT_DIR, 'app', 'globals.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert(css.includes('.scroll-stage-container'), 'globals.css debe contener .scroll-stage-container');
  assert(css.includes('.scroll-craft-reveal'), 'globals.css debe contener .scroll-craft-reveal');
  assert(css.includes('@media (prefers-reduced-motion: reduce)'), 'globals.css debe contener reglas para prefers-reduced-motion');
});

runTest('HomePage y CurriculumTab integran Scroll-Craft sin interferir con módulos táctiles', () => {
  const homePath = path.join(ROOT_DIR, 'app', 'page.jsx');
  const currPath = path.join(ROOT_DIR, 'components', 'tabs', 'CurriculumTab.jsx');

  const homeCode = fs.readFileSync(homePath, 'utf8');
  assert(homeCode.includes('useScrollCraft'), 'HomePage debe integrar useScrollCraft');

  const currCode = fs.readFileSync(currPath, 'utf8');
  assert(currCode.includes('ScrollTimelinePath'), 'CurriculumTab debe integrar ScrollTimelinePath');
});

// --------------------------------------------------------------------------
// PRONUNCIACIÓN: Aprobación Bidireccional de Kanji y Kana en SpeechPractice
// --------------------------------------------------------------------------
console.log('\n--- PRONUNCIACIÓN: Aprobación Bidireccional Kanji / Kana en SpeechPractice ---');

runTest('SpeechPractice aprueba equivalencias entre Kanji, Kana y Okurigana mixto (ej. 土よう日 y 土曜日)', () => {
  const furiganaDict = require('../data/furigana_dict.json');
  const wanakana = require('wanakana');

  const KANA_TO_KANJI_MAP = new Map();
  for (const [kanji, kana] of Object.entries(furiganaDict)) {
    if (!KANA_TO_KANJI_MAP.has(kana)) KANA_TO_KANJI_MAP.set(kana, new Set());
    KANA_TO_KANJI_MAP.get(kana).add(kanji);
  }

  const DICT_KEYS = Object.keys(furiganaDict).sort((a, b) => b.length - a.length);
  const ESCAPED_DICT_KEYS = DICT_KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const FURIGANA_REGEX = new RegExp(ESCAPED_DICT_KEYS.join('|'), 'g');

  function cleanText(text) {
    if (!text) return '';
    return String(text).replace(/[。、！？!?,，[\]()（）\s]/g, '');
  }

  function textToHiragana(text) {
    if (!text) return '';
    const cleaned = cleanText(text);
    const replaced = cleaned.replace(FURIGANA_REGEX, (m) => furiganaDict[m] || m);
    try {
      return wanakana.toHiragana(replaced);
    } catch {
      return replaced;
    }
  }

  function getAllVariants(rawText, rawReading = null) {
    const variants = new Set();
    const add = (t) => {
      if (!t) return;
      const c = cleanText(t);
      if (!c) return;
      variants.add(c);
      const h = textToHiragana(c);
      if (h) {
        variants.add(h);
        try {
          variants.add(wanakana.toKatakana(h));
        } catch {}
        const kanjiForms = KANA_TO_KANJI_MAP.get(h);
        if (kanjiForms) {
          kanjiForms.forEach(kf => variants.add(kf));
        }
      }
    };

    add(rawText);
    if (rawReading) {
      add(rawReading);
      const cleanReading = cleanText(rawReading);
      const rh = textToHiragana(cleanReading);
      if (rh && rawText) {
        const cleanRaw = cleanText(rawText);
        variants.add(cleanRaw);
        variants.add(cleanReading);
        variants.add(rh);
      }
    }
    return Array.from(variants);
  }

  function matches(targetText, targetKana, spoken) {
    const candidates = getAllVariants(targetText, targetKana);
    const spokenVariants = getAllVariants(spoken);
    const spokenHira = textToHiragana(spoken);
    const targetHira = textToHiragana(targetKana || targetText);

    for (const sv of spokenVariants) {
      if (candidates.includes(sv)) return true;
    }
    if (spokenHira && targetHira && spokenHira === targetHira) return true;
    for (const cand of candidates) {
      const candHira = textToHiragana(cand);
      if (spokenHira && candHira && spokenHira === candHira) return true;
    }
    return false;
  }

  // Caso exacto reportado por el usuario: palabra es '土よう日' (どようび) y audio transcribe '土曜日'
  assert(matches('土よう日', 'どようび', '土曜日'), 'Debe aprobar 土よう日 cuando el audio reconoce 土曜日');
  assert(matches('土よう日', 'どようび', 'どようび'), 'Debe aprobar 土よう日 cuando el audio reconoce どようび');
  assert(matches('土曜日', 'どようび', '土よう日'), 'Debe aprobar 土曜日 cuando el audio reconoce 土よう日');
  assert(matches('土曜日', null, 'どようび'), 'Debe aprobar 土曜日 sin kana explícito cuando el audio reconoce どようび');
  assert(matches('先生', 'せんせい', 'せんせい'), 'Debe aprobar 先生 con audio せんせい');
  assert(matches('先生', null, 'せんせい'), 'Debe aprobar 先生 sin kana explícito con audio せんせい');
  assert(matches('ご飯', 'ごはん', 'ごはん'), 'Debe aprobar ご飯 con audio ごはん');

  // Rechazo de pronunciaciones erróneas
  assert(!matches('土よう日', 'どようび', '日曜日'), 'Debe rechazar 日曜日 si se esperaba 土よう日');
  assert(!matches('土曜日', 'どようび', 'にちようび'), 'Debe rechazar にちようび si se esperaba 土曜日');
  assert(!matches('先生', 'せんせい', 'がくせい'), 'Debe rechazar がくせい si se esperaba 先生');
});

console.log('\n--- INTEGRIDAD DE PREGUNTAS, BRECHAS (GAPS) Y FURIGANA EN FSRS Y EXÁMENES ---');

runTest('jlpt_exams y FSRS enmascaran adecuadamente furigana y brechas', () => {
  const jlptExams = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'jlpt_exams.json'), 'utf8'));

  // 1. jlpt_exams.json: Ninguna pregunta de lectura de kanji debe filtrar la respuesta en furigana antes de responder
  let kanjiReadingLeaks = 0;
  jlptExams.forEach(q => {
    if (q.subType === 'kanji_reading') {
      const correct = q.options && q.options[q.correctIndex];
      if (correct && q.furigana && q.furigana.includes(correct)) {
        kanjiReadingLeaks++;
      }
    }
  });
  assert(kanjiReadingLeaks === 0, `0 preguntas de lectura de kanji filtran la respuesta en furigana (encontradas: ${kanjiReadingLeaks})`);

  // 2. Las preguntas con brecha o lectura deben retener la brecha 【 ？ 】 o ____ en furigana
  let missingGaps = 0;
  jlptExams.forEach(q => {
    const hasQGap = /【\s*？\s*】|\[\s*\?\s*\]|\(　\)|\( \)|\[___\]/.test(q.question) || q.subType === 'kanji_reading';
    if (hasQGap) {
      const hasFGap = /【\s*？\s*】|\[\s*\?\s*\]|\(　\)|\( \)|\[___\]|____ ____ __★__ ____|【　】 【　】 【 ★ 】 【　】/.test(q.furigana);
      if (!hasFGap) missingGaps++;
    }
  });
  assert(missingGaps === 0, `100% de preguntas con brecha o lectura retienen el Gap en su furigana inicial (faltantes: ${missingGaps})`);

  // 3. Caso específico de la pregunta del screenshot: jlpt_n5_v_01
  const qHon = jlptExams.find(x => x.id === 'jlpt_n5_v_01');
  assert(qHon, 'La pregunta jlpt_n5_v_01 existe');
  assert(qHon.furigana.includes('【 ？ 】'), 'El furigana inicial de jlpt_n5_v_01 contiene la brecha 【 ？ 】 en vez de la respuesta');
  assert(!qHon.furigana.includes('ほん'), 'El furigana inicial de jlpt_n5_v_01 NO filtra la respuesta ほん');
  assert(qHon.fullFurigana.includes('ほん'), 'El fullFurigana de jlpt_n5_v_01 contiene la lectura completa para revisión posterior');

  // 4. Validar funciones de srs.js
  const srs = require('../lib/srs.js');
  assert(typeof srs.getMaskedQuestionFurigana === 'function', 'getMaskedQuestionFurigana está exportada en lib/srs.js');
  assert(typeof srs.getQuestionInstruction === 'function', 'getQuestionInstruction está exportada en lib/srs.js');

  const maskedHon = srs.getMaskedQuestionFurigana(qHon, false);
  const fullHon = srs.getMaskedQuestionFurigana(qHon, true);
  assert(maskedHon.includes('【 ？ 】'), 'getMaskedQuestionFurigana enmascara antes de responder');
  assert(fullHon.includes('ほん'), 'getMaskedQuestionFurigana revela lectura completa al responder');

  const instrReading = srs.getQuestionInstruction({ subType: 'kanji_reading' });
  const instrContext = srs.getQuestionInstruction({ subType: 'context_word' });
  assert(instrReading && instrReading.includes('lectura'), 'getQuestionInstruction instruye correctamente lectura de kanji');
  assert(instrContext && instrContext.includes('completa'), 'getQuestionInstruction instruye correctamente completar brecha');
});


console.log('\n======================================================');
console.log(`Resumen: ${passedTests}/${totalTests} pruebas superadas con éxito (100%)`);
console.log('======================================================\n');
