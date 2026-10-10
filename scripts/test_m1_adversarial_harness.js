/**
 * scripts/test_m1_adversarial_harness.js
 * Adversarial Challenge Test Harness for Milestone M1 (Data Layer & Sync)
 *
 * Authored by: orch3_challenger_m1_1 (EMPIRICAL CHALLENGER)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

const KANJI_REGEX = /[\u4e00-\u9faf\u3400-\u4dbf]/;
const VALID_JLPT_LEVELS = new Set(['N5', 'N4', 'N3', 'N2', 'N1']);
const CEFR_FORBIDDEN = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2']);

const results = {
  suite1_curriculum: { passed: 0, failed: 0, details: [] },
  suite2_kanji_vocab: { passed: 0, failed: 0, details: [] },
  suite3_cefr: { passed: 0, failed: 0, details: [] },
  suite4_validators: { passed: 0, failed: 0, details: [] }
};

function recordTest(suiteName, testName, passed, errorMsg = null, meta = null) {
  const suite = results[suiteName];
  if (passed) {
    suite.passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    suite.failed++;
    console.error(`  [FAIL] ${testName} - Error: ${errorMsg}`);
  }
  suite.details.push({ testName, passed, errorMsg, meta });
}

console.log('================================================================');
console.log('🔥 ADVERSARIAL STRESS TEST HARNESS — MILESTONE M1');
console.log('================================================================\n');

// =============================================================================
// SUITE 1: CURRICULUM BOUNDS & INVARIANTS (data/curriculum.json)
// =============================================================================
console.log('--- SUITE 1: Curriculum Invariants & Bounds (data/curriculum.json) ---');

try {
  const currPath = path.join(DATA_DIR, 'curriculum.json');
  const curr = JSON.parse(fs.readFileSync(currPath, 'utf8'));

  // 1.1 Module count
  const is37Modules = curr.length === 37;
  recordTest('suite1_curriculum', '1.1 Curriculum contains exactly 37 modules', is37Modules, 
    is37Modules ? null : `Expected 37 modules, got ${curr.length}`);

  // 1.2 Module step numbering sequence
  let seqOk = true;
  let seqErr = null;
  curr.forEach((m, idx) => {
    if (m.step !== idx + 1) {
      seqOk = false;
      seqErr = `Module index ${idx} has step ${m.step}, expected ${idx + 1}`;
    }
  });
  recordTest('suite1_curriculum', '1.2 Module steps are sequential 1..37', seqOk, seqErr);

  // 1.3 Total sections and content steps count
  const allSections = curr.flatMap(m => m.sections || []);
  const contentSteps = allSections.filter(s => !s.is_exercise_step);
  const exerciseSteps = allSections.filter(s => s.is_exercise_step);
  const expectedContentSteps = 69;
  const expectedExerciseSteps = 37;

  recordTest('suite1_curriculum', `1.3 Step counts match (69 content steps, 37 exercise steps)`, 
    contentSteps.length === expectedContentSteps && exerciseSteps.length === expectedExerciseSteps,
    `Got ${contentSteps.length} content steps (expected ${expectedContentSteps}), ${exerciseSteps.length} exercise steps (expected ${expectedExerciseSteps})`,
    { contentCount: contentSteps.length, exerciseCount: exerciseSteps.length });

  // 1.4 Invariant: NO section root has an "examples" key across ALL 106 sections
  let residualExamplesSections = [];
  allSections.forEach((s, idx) => {
    if ('examples' in s) {
      residualExamplesSections.push({ substep: s.substep, title: s.title, examples: s.examples });
    }
  });
  recordTest('suite1_curriculum', '1.4 Assert NO section root has an "examples" key (106 sections checked)',
    residualExamplesSections.length === 0,
    residualExamplesSections.length > 0 ? `Found ${residualExamplesSections.length} sections with root examples: ${JSON.stringify(residualExamplesSections)}` : null);

  // 1.5 Vocab bounds: 8 <= vocab.length <= 12 on EVERY content step
  const lengthDistribution = { 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, under8: [], over12: [] };
  let vocabBoundsOk = true;

  contentSteps.forEach((s) => {
    const vLen = Array.isArray(s.vocab) ? s.vocab.length : -1;
    if (vLen >= 8 && vLen <= 12) {
      lengthDistribution[vLen] = (lengthDistribution[vLen] || 0) + 1;
    } else {
      vocabBoundsOk = false;
      if (vLen < 8) lengthDistribution.under8.push({ title: s.title, length: vLen });
      if (vLen > 12) lengthDistribution.over12.push({ title: s.title, length: vLen });
    }
  });

  recordTest('suite1_curriculum', '1.5 All 69 content steps have 8 <= vocab.length <= 12 (Min=8, Max=12 bounds)',
    vocabBoundsOk,
    vocabBoundsOk ? null : `Violations: under 8: ${JSON.stringify(lengthDistribution.under8)}, over 12: ${JSON.stringify(lengthDistribution.over12)}`,
    lengthDistribution);
  console.log(`      -> Vocab distribution across 69 steps: [8: ${lengthDistribution[8]}, 9: ${lengthDistribution[9]}, 10: ${lengthDistribution[10]}, 11: ${lengthDistribution[11]}, 12: ${lengthDistribution[12]}]`);

  // 1.6 Vocab item schema and non-emptiness
  let malformedVocab = [];
  contentSteps.forEach((s) => {
    s.vocab.forEach((v, vIdx) => {
      if (!v.kanji || typeof v.kanji !== 'string' || v.kanji.trim() === '' ||
          !v.kana || typeof v.kana !== 'string' || v.kana.trim() === '' ||
          !v.meaning || typeof v.meaning !== 'string' || v.meaning.trim() === '') {
        malformedVocab.push({ stepTitle: s.title, vIdx, v });
      }
    });
  });
  recordTest('suite1_curriculum', '1.6 All vocab terms have valid non-empty kanji, kana, and meaning',
    malformedVocab.length === 0,
    malformedVocab.length > 0 ? `Found ${malformedVocab.length} malformed vocab items: ${JSON.stringify(malformedVocab.slice(0, 3))}` : null);

  // 1.7 Specific check on Module 19
  const m19 = curr.find(m => m.step === 19);
  let m19Ok = false;
  let m19Msg = null;
  if (!m19) {
    m19Msg = 'Module 19 not found';
  } else {
    const m19Content = m19.sections.filter(s => !s.is_exercise_step);
    const m19VocabTerms = m19Content.flatMap(s => s.vocab || []);
    if (m19VocabTerms.length === 10) {
      m19Ok = true;
    } else {
      m19Msg = `Expected M19 to have 10 vocab terms, got ${m19VocabTerms.length}`;
    }
  }
  recordTest('suite1_curriculum', '1.7 Assert M19 has 10 valid terms', m19Ok, m19Msg);

  // 1.8 Specific check on Modules 20 through 37
  let m20to37Violations = [];
  for (let sNum = 20; sNum <= 37; sNum++) {
    const mod = curr.find(m => m.step === sNum);
    if (!mod) {
      m20to37Violations.push({ step: sNum, error: 'Module not found' });
      continue;
    }
    const content = mod.sections.filter(s => !s.is_exercise_step);
    content.forEach((sec, idx) => {
      if (!Array.isArray(sec.vocab) || sec.vocab.length < 8 || sec.vocab.length > 12) {
        m20to37Violations.push({ step: sNum, section: idx + 1, vocabCount: sec.vocab ? sec.vocab.length : 0 });
      }
    });
  }
  recordTest('suite1_curriculum', '1.8 Assert M20-M37 have proper vocabulary (8-12 terms per step across all 18 modules)',
    m20to37Violations.length === 0,
    m20to37Violations.length > 0 ? `Violations in M20-M37: ${JSON.stringify(m20to37Violations)}` : null);

  // 1.9 Non-empty kanji_jukugo on every content step
  let emptyJukugo = [];
  contentSteps.forEach(s => {
    if (!Array.isArray(s.kanji_jukugo) || s.kanji_jukugo.length === 0) {
      emptyJukugo.push(s.title);
    } else {
      s.kanji_jukugo.forEach((kj, kjIdx) => {
        if (!kj.kanji || !kj.meaning) {
          emptyJukugo.push(`${s.title} jukugo[${kjIdx}] missing kanji/meaning`);
        }
      });
    }
  });
  recordTest('suite1_curriculum', '1.9 Assert every content step has non-empty kanji_jukugo (69 steps verified)',
    emptyJukugo.length === 0,
    emptyJukugo.length > 0 ? `Issues in kanji_jukugo: ${JSON.stringify(emptyJukugo)}` : null);

  // 1.10 Non-empty functional_bridge on every content step
  let emptyBridge = [];
  contentSteps.forEach(s => {
    if (!Array.isArray(s.functional_bridge) || s.functional_bridge.length === 0) {
      emptyBridge.push(s.title);
    } else {
      s.functional_bridge.forEach((fb, fbIdx) => {
        if (!fb.item || !fb.name || !fb.function_es) {
          emptyBridge.push(`${s.title} bridge[${fbIdx}] missing fields`);
        }
      });
    }
  });
  recordTest('suite1_curriculum', '1.10 Assert every content step has non-empty functional_bridge (69 steps verified)',
    emptyBridge.length === 0,
    emptyBridge.length > 0 ? `Issues in functional_bridge: ${JSON.stringify(emptyBridge)}` : null);

  // 1.11 Consolidated grammar examples count check
  let totalGrammarExamples = 0;
  let formulasWithoutExamples = [];
  contentSteps.forEach(s => {
    (s.grammar_points || []).forEach(gp => {
      const exLen = Array.isArray(gp.examples) ? gp.examples.length : 0;
      totalGrammarExamples += exLen;
      if (exLen === 0) {
        formulasWithoutExamples.push({ step: s.title, formula: gp.formula });
      }
    });
  });
  recordTest('suite1_curriculum', '1.11 Grammar points have consolidated examples (total = 271, 0 empty formulas)',
    formulasWithoutExamples.length === 0 && totalGrammarExamples === 271,
    formulasWithoutExamples.length > 0 ? `Formulas without examples: ${JSON.stringify(formulasWithoutExamples)}` : `Total examples: ${totalGrammarExamples}`,
    { totalGrammarExamples });

} catch (err) {
  recordTest('suite1_curriculum', 'Suite 1 execution error', false, err.message);
}

// =============================================================================
// SUITE 2: KANJI & VOCABULARY ADVERSARIAL SYNC (data/kanji.json, data/vocabulary.json)
// =============================================================================
console.log('\n--- SUITE 2: Kanji & Vocabulary Adversarial Verification ---');

try {
  const vocabPath = path.join(DATA_DIR, 'vocabulary.json');
  const kanjiPath = path.join(DATA_DIR, 'kanji.json');

  const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
  const kanjis = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

  // 2.1 Vocabulary completeness & field validation
  let malformedVocabEntries = [];
  let kanaContainsKanji = [];

  vocab.forEach((v, idx) => {
    if (!v.kanji || !v.hiragana || !v.katakana || !v.meaning_es || !VALID_JLPT_LEVELS.has(v.level)) {
      malformedVocabEntries.push({ idx, v });
    }
    if (KANJI_REGEX.test(v.hiragana) || KANJI_REGEX.test(v.katakana)) {
      kanaContainsKanji.push({ idx, kanji: v.kanji, hiragana: v.hiragana, katakana: v.katakana });
    }
  });

  recordTest('suite2_kanji_vocab', '2.1 Every word in vocabulary.json has complete fields (kanji, hiragana, katakana, meaning_es, valid JLPT level)',
    malformedVocabEntries.length === 0,
    malformedVocabEntries.length > 0 ? `Malformed entries count: ${malformedVocabEntries.length}` : null);

  recordTest('suite2_kanji_vocab', '2.2 Hiragana and Katakana fields strictly contain ZERO kanji characters',
    kanaContainsKanji.length === 0,
    kanaContainsKanji.length > 0 ? `Entries with kanji in kana: ${JSON.stringify(kanaContainsKanji)}` : null);

  // 2.3 Adversarial bidirectional sync:
  // For EVERY word in data/vocabulary.json: if it contains a kanji present in data/kanji.json, verify presence in kanji.words
  const kanjiMap = new Map();
  kanjis.forEach(k => {
    kanjiMap.set(k.kanji, k);
  });

  let syncChecksTotal = 0;
  let syncMissing = [];

  vocab.forEach(v => {
    const chars = [...v.kanji];
    const uniqueChars = [...new Set(chars)];
    uniqueChars.forEach(char => {
      if (kanjiMap.has(char)) {
        syncChecksTotal++;
        const kObj = kanjiMap.get(char);
        const wordsList = Array.isArray(kObj.words) ? kObj.words : [];
        const found = wordsList.some(w => w.word === v.kanji);
        if (!found) {
          syncMissing.push({
            word: v.kanji,
            kanji: char,
            kanjiMeaning: kObj.meaning_es
          });
        }
      }
    });
  });

  recordTest('suite2_kanji_vocab', `2.3 Every word in vocabulary.json containing a catalog kanji is in kanji.words (${syncChecksTotal} connections checked)`,
    syncMissing.length === 0,
    syncMissing.length > 0 ? `Missing sync connections (${syncMissing.length}): ${JSON.stringify(syncMissing.slice(0, 10))}` : null,
    { syncChecksTotal, missingCount: syncMissing.length });
  console.log(`      -> Total kanji-word links checked: ${syncChecksTotal}, Missing: ${syncMissing.length}`);

  // 2.4 Backward check: All kanjis in catalog have non-empty words with word, reading, meaning
  let invalidKanjiWords = [];
  kanjis.forEach(k => {
    if (!Array.isArray(k.words) || k.words.length === 0) {
      invalidKanjiWords.push({ kanji: k.kanji, reason: 'Empty words array' });
    } else {
      k.words.forEach((w, wIdx) => {
        if (!w.word || !w.reading || !w.meaning) {
          invalidKanjiWords.push({ kanji: k.kanji, wIdx, word: w });
        }
        if (!w.word.includes(k.kanji)) {
          invalidKanjiWords.push({ kanji: k.kanji, wIdx, word: w.word, reason: 'Word does not contain ideogram' });
        }
      });
    }
  });

  recordTest('suite2_kanji_vocab', '2.4 All 163 kanjis have valid words array and each word contains the kanji',
    invalidKanjiWords.length === 0,
    invalidKanjiWords.length > 0 ? `Invalid kanji words: ${JSON.stringify(invalidKanjiWords.slice(0, 5))}` : null);

  // 2.5 Duplicate ID check in vocabulary.json
  const vocabIds = new Set();
  let duplicateIds = [];
  vocab.forEach(v => {
    if (v.id) {
      if (vocabIds.has(v.id)) {
        duplicateIds.push(v.id);
      }
      vocabIds.add(v.id);
    }
  });
  recordTest('suite2_kanji_vocab', '2.5 Zero duplicate IDs in vocabulary.json',
    duplicateIds.length === 0,
    duplicateIds.length > 0 ? `Duplicate IDs found: ${duplicateIds.join(', ')}` : null);

} catch (err) {
  recordTest('suite2_kanji_vocab', 'Suite 2 execution error', false, err.message);
}

// =============================================================================
// SUITE 3: GLOBAL CEFR AUDIT ACROSS ALL APPLICATION DATASETS
// =============================================================================
console.log('\n--- SUITE 3: Global CEFR Audit Across All Application Datasets ---');

try {
  const dataFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  console.log(`      -> Total data JSON files checked: ${dataFiles.length}`);

  let cefrViolationsInData = [];

  function checkCefrValue(val, keyPath, fileName) {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (CEFR_FORBIDDEN.has(trimmed)) {
        cefrViolationsInData.push({ file: fileName, keyPath, value: val, issue: 'Exact CEFR code match' });
      } else if (/\b(A1|A2|B1|B2|C1|C2)\b/.test(val) && (keyPath.toLowerCase().includes('level') || keyPath.toLowerCase().includes('grade'))) {
        cefrViolationsInData.push({ file: fileName, keyPath, value: val, issue: 'CEFR level pattern in level key' });
      }
    } else if (Array.isArray(val)) {
      val.forEach((item, idx) => checkCefrValue(item, `${keyPath}[${idx}]`, fileName));
    } else if (val !== null && typeof val === 'object') {
      Object.keys(val).forEach(k => checkCefrValue(val[k], `${keyPath}.${k}`, fileName));
    }
  }

  dataFiles.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
    checkCefrValue(content, '$', file);
  });

  recordTest('suite3_cefr', `3.1 Zero CEFR levels or designations found across all ${dataFiles.length} dataset JSON files in data/`,
    cefrViolationsInData.length === 0,
    cefrViolationsInData.length > 0 ? `Found ${cefrViolationsInData.length} CEFR violations: ${JSON.stringify(cefrViolationsInData)}` : null,
    { violations: cefrViolationsInData });

} catch (err) {
  recordTest('suite3_cefr', 'Suite 3 execution error', false, err.message);
}

// =============================================================================
// SUITE 4: VALIDADOR CURRÍCULUM & SUITE TÉCNICA INTEGRATION
// =============================================================================
console.log('\n--- SUITE 4: curriculumValidator.js & run_all_tests.js ---');

async function runSuite4() {
  try {
    const validator = await import('../lib/curriculumValidator.js');
    const currPath = path.join(DATA_DIR, 'curriculum.json');
    const curr = JSON.parse(fs.readFileSync(currPath, 'utf8'));

    const valResult = validator.validateAllCurriculum(curr);
    recordTest('suite4_validators', '4.1 lib/curriculumValidator.js passes cleanly on all 37 modules (0 errors)',
      valResult.isValid && valResult.errors.length === 0,
      valResult.errors.length > 0 ? `Errors: ${JSON.stringify(valResult.errors)}` : null,
      { totalModules: valResult.totalModules, errorCount: valResult.errors.length });

  } catch (err) {
    recordTest('suite4_validators', '4.1 lib/curriculumValidator.js execution error', false, err.message);
  }

  console.log('\n================================================================');
  console.log('📊 RESUMEN FINAL DEL ARNÉS DE PRUEBAS ADVERSARIAL:');
  let totalPassed = 0;
  let totalFailed = 0;
  for (const [sName, sData] of Object.entries(results)) {
    totalPassed += sData.passed;
    totalFailed += sData.failed;
    console.log(`  - ${sName}: ${sData.passed} PASS, ${sData.failed} FAIL`);
  }
  console.log(`  TOTAL: ${totalPassed} PASS, ${totalFailed} FAIL`);
  console.log('================================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSuite4();
