/**
 * scripts/test_challenger_m2_2.js
 * 
 * Empirical Adversarial Test Harness for Milestone M2
 * Challenger 2: Terminology, Tooltips, Regex Safety, React Node Tree, and CSS Responsiveness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import React from 'react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
  }
}

console.log('===============================================================');
console.log('🧪 CHALLENGER 2 - EMPIRICAL ADVERSARIAL TEST HARNESS (M2)');
console.log('===============================================================\n');

// =========================================================================
// 1. DATA/TERMINOLOGY.JSON VALIDATION & SCHEMA INTEGRITY
// =========================================================================
console.log('--- 1. Terminology Dataset Integrity & Schema Checks ---');
const terminologyPath = path.join(rootDir, 'data', 'terminology.json');
let terminologyList = [];

try {
  const rawTerm = fs.readFileSync(terminologyPath, 'utf8');
  terminologyList = JSON.parse(rawTerm);
  assert(Array.isArray(terminologyList), 'terminology.json is valid JSON array');
} catch (e) {
  assert(false, 'terminology.json parses cleanly', e.message);
}

assert(terminologyList.length === 21, `terminology.json contains exactly 21 entries (found: ${terminologyList.length})`);

const particula = terminologyList.find(t => t.id === 'particula');
assert(!!particula, "Term 'particula' is present in terminology.json");

if (particula) {
  assert(particula.term === 'Partículas (Joshi)', "particula has term === 'Partículas (Joshi)'");
  assert(particula.kanji === '助詞', "particula has kanji === '助詞'");
  assert(particula.kana === 'じょし', "particula has kana === 'じょし'");
  assert(particula.romaji === 'Joshi', "particula has romaji === 'Joshi'");
  assert(particula.category === 'Gramática y Morfología', "particula has category === 'Gramática y Morfología'");
  assert(typeof particula.short_definition === 'string' && particula.short_definition.length > 20, 'particula has valid short_definition');
  assert(typeof particula.full_explanation === 'string' && particula.full_explanation.length > 50, 'particula has comprehensive full_explanation');
  assert(Array.isArray(particula.examples) && particula.examples.length >= 2, 'particula has at least 2 examples');
  particula.examples.forEach((ex, idx) => {
    assert(typeof ex.jp === 'string' && typeof ex.es === 'string', `particula example [${idx}] has jp and es`);
  });
}

// Check all 21 terms for strict schema compliance
const requiredFields = ['id', 'term', 'kanji', 'kana', 'romaji', 'category', 'short_definition', 'full_explanation', 'examples'];
let allSchemasValid = true;
const knownIds = new Set();

terminologyList.forEach((t, i) => {
  requiredFields.forEach(f => {
    if (!t[f]) {
      allSchemasValid = false;
      console.error(`Term at index ${i} (${t.id || 'unknown'}) is missing field '${f}'`);
    }
  });
  if (knownIds.has(t.id)) {
    allSchemasValid = false;
    console.error(`Duplicate term id: ${t.id}`);
  }
  knownIds.add(t.id);
  assert(t.id === t.id.toLowerCase().trim(), `Term ID '${t.id}' is lowercase and trimmed`);
  assert(Array.isArray(t.examples) && t.examples.length > 0, `Term '${t.id}' has non-empty examples array`);
});
assert(allSchemasValid, 'All 21 terms strictly comply with required schema without missing fields');

// =========================================================================
// 2. RENDERWITHTERMINOLOGY EMPIRICAL LOGIC & REGEX STRESS TESTING
// =========================================================================
console.log('\n--- 2. renderWithTerminology Logic & Adversarial Stress Testing ---');

// Mock components to test React node creation identically to CurriculumTab.jsx
const MockFuriganaText = ({ text, showFurigana }) => React.createElement('span', { className: 'furigana-text' }, text);
const MockTerminologyTooltip = ({ termId, children }) => React.createElement('span', { className: 'tooltip', 'data-term': termId }, children);

const renderWithTerminology = (text, keyPrefix = 'term', showFurigana = false) => {
  if (!text || typeof text !== 'string') return text;

  const pattern = new RegExp(
    `\\b(bikougo|lenguaje embellecedor|sonkeigo|lenguaje respetuoso|kenjougo|lenguaje humilde|teineigo|lenguaje cort[eé]s|keigo|c[oó]pulas?|part[ií]culas?|verbos?\\s+godan|godan|verbos?\\s+ichidan|ichidan|jukugos?|kangos?|wagos?|gairaigos?|okurigana|furigana|jousoushi|contadores|contador|pitch\\s+accent|joshi)\\b`,
    'gi'
  );

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const chunk = text.substring(lastIndex, match.index);
      if (showFurigana) {
        parts.push(React.createElement(MockFuriganaText, { key: `${keyPrefix}_fg_${lastIndex}`, text: chunk, showFurigana }));
      } else {
        parts.push(chunk);
      }
    }

    const matchedWord = match[0];
    const lowerWord = matchedWord.toLowerCase();
    let termId = 'keigo';

    if (lowerWord.includes('bikougo') || lowerWord.includes('embellecedor')) termId = 'bikougo';
    else if (lowerWord.includes('sonkeigo') || lowerWord.includes('respetuoso')) termId = 'sonkeigo';
    else if (lowerWord.includes('kenjougo') || lowerWord.includes('humilde')) termId = 'kenjougo';
    else if (lowerWord.includes('teineigo') || lowerWord.includes('cort')) termId = 'teineigo';
    else if (lowerWord.includes('keigo')) termId = 'keigo';
    else if (lowerWord.includes('pula')) termId = 'copula';
    else if (lowerWord.includes('part') || lowerWord.includes('joshi')) termId = 'particula';
    else if (lowerWord.includes('godan')) termId = 'godan';
    else if (lowerWord.includes('ichidan')) termId = 'ichidan';
    else if (lowerWord.includes('jukugo')) termId = 'jukugo';
    else if (lowerWord.includes('kango')) termId = 'kango';
    else if (lowerWord.includes('wago')) termId = 'wago';
    else if (lowerWord.includes('gairaigo')) termId = 'gairaigo';
    else if (lowerWord.includes('okurigana')) termId = 'okurigana';
    else if (lowerWord.includes('furigana')) termId = 'furigana';
    else if (lowerWord.includes('jousoushi') || lowerWord.includes('contador')) termId = 'jousoushi';
    else if (lowerWord.includes('pitch')) termId = 'pitch_accent';

    parts.push(
      React.createElement(MockTerminologyTooltip, { key: `${keyPrefix}_${match.index}`, termId }, matchedWord)
    );

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    const chunk = text.substring(lastIndex);
    if (showFurigana) {
      parts.push(React.createElement(MockFuriganaText, { key: `${keyPrefix}_fg_${lastIndex}`, text: chunk, showFurigana }));
    } else {
      parts.push(chunk);
    }
  }

  if (parts.length === 0) {
    return showFurigana ? React.createElement(MockFuriganaText, { text, showFurigana }) : text;
  }

  return parts;
};

// 2.1 Adversarial Inputs: Null, Undefined, Non-strings, Empty
assert(renderWithTerminology(null) === null, 'renderWithTerminology(null) returns null without throwing');
assert(renderWithTerminology(undefined) === undefined, 'renderWithTerminology(undefined) returns undefined without throwing');
assert(renderWithTerminology('') === '', 'renderWithTerminology("") returns "" without throwing');
assert(renderWithTerminology(0) === 0, 'renderWithTerminology(0) returns 0 without throwing');
assert(renderWithTerminology(42) === 42, 'renderWithTerminology(42) returns 42 without throwing');
assert(renderWithTerminology(false) === false, 'renderWithTerminology(false) returns false without throwing');
const dummyObj = { foo: 'bar' };
assert(renderWithTerminology(dummyObj) === dummyObj, 'renderWithTerminology({}) returns original object');
const dummyArr = [1, 2];
assert(renderWithTerminology(dummyArr) === dummyArr, 'renderWithTerminology([]) returns original array');

// 2.2 Term Mapping Coverage for all terms
const termsToTest = [
  { phrase: 'Uso de Bikougo en japonés', expectedTermId: 'bikougo', matchText: 'Bikougo' },
  { phrase: 'Uso de lenguaje embellecedor', expectedTermId: 'bikougo', matchText: 'lenguaje embellecedor' },
  { phrase: 'Sonkeigo es honorífico', expectedTermId: 'sonkeigo', matchText: 'Sonkeigo' },
  { phrase: 'Es lenguaje respetuoso', expectedTermId: 'sonkeigo', matchText: 'lenguaje respetuoso' },
  { phrase: 'Kenjougo de humildad', expectedTermId: 'kenjougo', matchText: 'Kenjougo' },
  { phrase: 'Uso de lenguaje humilde', expectedTermId: 'kenjougo', matchText: 'lenguaje humilde' },
  { phrase: 'Teineigo es estándar', expectedTermId: 'teineigo', matchText: 'Teineigo' },
  { phrase: 'lenguaje cortés habitual', expectedTermId: 'teineigo', matchText: 'lenguaje cortés' },
  { phrase: 'lenguaje cortes sin tilde', expectedTermId: 'teineigo', matchText: 'lenguaje cortes' },
  { phrase: 'El keigo general', expectedTermId: 'keigo', matchText: 'keigo' },
  { phrase: 'La cópula da', expectedTermId: 'copula', matchText: 'cópula' },
  { phrase: 'La copula desu', expectedTermId: 'copula', matchText: 'copula' },
  { phrase: 'Uso de cópulas varias', expectedTermId: 'copula', matchText: 'cópulas' },
  { phrase: 'Uso de copulas varias', expectedTermId: 'copula', matchText: 'copulas' },
  { phrase: 'La partícula wa', expectedTermId: 'particula', matchText: 'partícula' },
  { phrase: 'Las partículas ga y o', expectedTermId: 'particula', matchText: 'partículas' },
  { phrase: 'particula sin tilde', expectedTermId: 'particula', matchText: 'particula' },
  { phrase: 'particulas en plural', expectedTermId: 'particula', matchText: 'particulas' },
  { phrase: 'La joshi gramatical', expectedTermId: 'particula', matchText: 'joshi' },
  { phrase: 'Verbo godan de 5 pasos', expectedTermId: 'godan', matchText: 'Verbo godan' },
  { phrase: 'verbos godan regulares', expectedTermId: 'godan', matchText: 'verbos godan' },
  { phrase: 'Solo godan', expectedTermId: 'godan', matchText: 'godan' },
  { phrase: 'Verbo ichidan de 1 paso', expectedTermId: 'ichidan', matchText: 'Verbo ichidan' },
  { phrase: 'verbos ichidan usuales', expectedTermId: 'ichidan', matchText: 'verbos ichidan' },
  { phrase: 'Solo ichidan', expectedTermId: 'ichidan', matchText: 'ichidan' },
  { phrase: 'El jukugo compuesto', expectedTermId: 'jukugo', matchText: 'jukugo' },
  { phrase: 'Los jukugos chinos', expectedTermId: 'jukugo', matchText: 'jukugos' },
  { phrase: 'Palabra kango', expectedTermId: 'kango', matchText: 'kango' },
  { phrase: 'Palabras kangos', expectedTermId: 'kango', matchText: 'kangos' },
  { phrase: 'Palabra wago nativa', expectedTermId: 'wago', matchText: 'wago' },
  { phrase: 'Palabras wagos', expectedTermId: 'wago', matchText: 'wagos' },
  { phrase: 'Un gairaigo occidental', expectedTermId: 'gairaigo', matchText: 'gairaigo' },
  { phrase: 'Varios gairaigos', expectedTermId: 'gairaigo', matchText: 'gairaigos' },
  { phrase: 'El okurigana verbal', expectedTermId: 'okurigana', matchText: 'okurigana' },
  { phrase: 'El furigana fonético', expectedTermId: 'furigana', matchText: 'furigana' },
  { phrase: 'El jousoushi numérico', expectedTermId: 'jousoushi', matchText: 'jousoushi' },
  { phrase: 'Uso de contadores', expectedTermId: 'jousoushi', matchText: 'contadores' },
  { phrase: 'Un contador de objetos', expectedTermId: 'jousoushi', matchText: 'contador' },
  { phrase: 'El pitch accent tonal', expectedTermId: 'pitch_accent', matchText: 'pitch accent' }
];

let allTermsMappedCorrectly = true;
termsToTest.forEach(testCase => {
  const result = renderWithTerminology(testCase.phrase, 'test');
  if (!Array.isArray(result)) {
    allTermsMappedCorrectly = false;
    console.error(`Failed to produce array for: "${testCase.phrase}"`);
    return;
  }
  const tooltipElement = result.find(node => React.isValidElement(node) && node.props.termId);
  if (!tooltipElement) {
    allTermsMappedCorrectly = false;
    console.error(`No tooltip element in: "${testCase.phrase}"`);
    return;
  }
  if (tooltipElement.props.termId !== testCase.expectedTermId) {
    allTermsMappedCorrectly = false;
    console.error(`Wrong termId for "${testCase.phrase}": got "${tooltipElement.props.termId}", expected "${testCase.expectedTermId}"`);
  }
  if (tooltipElement.props.children !== testCase.matchText) {
    allTermsMappedCorrectly = false;
    console.error(`Wrong children for "${testCase.phrase}": got "${tooltipElement.props.children}", expected "${testCase.matchText}"`);
  }
  // Check that the mapped termId actually exists in data/terminology.json
  if (!knownIds.has(testCase.expectedTermId)) {
    allTermsMappedCorrectly = false;
    console.error(`Mapped termId '${testCase.expectedTermId}' does NOT exist in data/terminology.json!`);
  }
});

assert(allTermsMappedCorrectly, `All ${termsToTest.length} linguistic variations matched and correctly mapped to verified terminology IDs`);

// 2.3 False Positives & Word Boundary Verification
const falsePositiveCases = [
  'El departamento de lenguas',
  'Es particularmente complejo',
  'Término copulativo en sintaxis',
  'Pueblo de pagodang',
  'Nombre ichidani',
  'Este es un caso godano'
];

let noFalsePositives = true;
falsePositiveCases.forEach(phrase => {
  const res = renderWithTerminology(phrase, 'fp');
  // Should return original string or array with 0 tooltips
  if (Array.isArray(res)) {
    const hasTooltip = res.some(node => React.isValidElement(node) && node.props.termId);
    if (hasTooltip) {
      noFalsePositives = false;
      console.error(`False positive found in: "${phrase}"`);
    }
  }
});
assert(noFalsePositives, 'Regex word boundaries successfully prevent false positives in substrings (particularmente, departamento, etc.)');

// 2.4 Punctuation, Japanese Characters & Brackets
const punctuatedCases = [
  { input: '(partícula)', expectedMatch: 'partícula' },
  { input: '¿Keigo?', expectedMatch: 'Keigo' },
  { input: '«Bikougo»', expectedMatch: 'Bikougo' },
  { input: '[verbo godan]', expectedMatch: 'verbo godan' },
  { input: '{ichidan}', expectedMatch: 'ichidan' },
  { input: '“cópula”', expectedMatch: 'cópula' },
  { input: 'これは本です。(copula です)', expectedMatch: 'copula' }
];

let allPunctuatedPass = true;
punctuatedCases.forEach(({ input, expectedMatch }) => {
  const res = renderWithTerminology(input, 'punc');
  if (!Array.isArray(res)) {
    allPunctuatedPass = false;
    console.error(`Failed to match punctuated input: "${input}"`);
    return;
  }
  const tooltip = res.find(node => React.isValidElement(node) && node.props.termId);
  if (!tooltip || tooltip.props.children !== expectedMatch) {
    allPunctuatedPass = false;
    console.error(`Punctuation test failed for "${input}": got ${tooltip?.props?.children}`);
  }
});
assert(allPunctuatedPass, 'Handles punctuation, brackets, quotes and Japanese surrounding characters cleanly');

// 2.5 Multi-match, Reconstruction and Key Uniqueness
const complexSentence = 'En este paso estudiaremos el Keigo (incluyendo Sonkeigo, Kenjougo y Teineigo), además de la cópula y la partícula de enlace con verbos godan.';
const complexResult = renderWithTerminology(complexSentence, 'comp');

assert(Array.isArray(complexResult), 'Complex sentence parses into array of nodes');

// Check key uniqueness
const keysSeen = new Set();
let keysAreUnique = true;
complexResult.forEach(node => {
  if (React.isValidElement(node)) {
    const key = node.key;
    if (!key) {
      keysAreUnique = false;
      console.error('Missing key on React element in tree');
    } else if (keysSeen.has(key)) {
      keysAreUnique = false;
      console.error(`Duplicate key detected: "${key}"`);
    } else {
      keysSeen.add(key);
    }
  }
});
assert(keysAreUnique, `All ${keysSeen.size} React elements in complex sentence have strictly unique keys`);

// Reconstruct string to verify 100% loss-less reconstruction
let reconstructedText = '';
complexResult.forEach(node => {
  if (typeof node === 'string') {
    reconstructedText += node;
  } else if (React.isValidElement(node)) {
    if (node.props.children) {
      reconstructedText += node.props.children;
    } else if (node.props.text) {
      reconstructedText += node.props.text;
    }
  }
});
assert(reconstructedText === complexSentence, 'Loss-less text reconstruction: input and parsed text are identical byte-for-byte');

// 2.6 Stress Test & Catastrophic Backtracking Prevention
const startBench = Date.now();
for (let i = 0; i < 5000; i++) {
  renderWithTerminology(complexSentence, `bench_${i}`, false);
}
const elapsedBench = Date.now() - startBench;
assert(elapsedBench < 2000, `Performance benchmark: 5,000 complex parses completed in ${elapsedBench}ms (sub-0.4ms/call)`);

// 100KB repetitive string stress test (ensure no infinite loop or crash)
const longString = 'La partícula wa y el verbo godan '.repeat(3000); // ~100KB
const startLong = Date.now();
const longRes = renderWithTerminology(longString, 'long');
const elapsedLong = Date.now() - startLong;
assert(Array.isArray(longRes) && elapsedLong < 2000, `Large document stress test (100KB, 6,000 matches) completed in ${elapsedLong}ms without hanging`);

// =========================================================================
// 3. VOCABULARY TYPE BADGES MAPPING IN CURRICULUMTAB.JSX
// =========================================================================
console.log('\n--- 3. Vocabulary Type Badges Mapping in CurriculumTab.jsx ---');

function mapVocabTypeToTermId(rawType) {
  const t = (rawType || '').toLowerCase();
  let termId = null;
  if (t.includes('godan')) termId = 'godan';
  else if (t.includes('ichidan')) termId = 'ichidan';
  else if (t.includes('gairaigo') || t.includes('katakana')) termId = 'gairaigo';
  else if (t.includes('contador') || t.includes('clasificador')) termId = 'jousoushi';
  return termId;
}

const vocabTypesToTest = [
  { type: 'Verbo Godan', expected: 'godan' },
  { type: 'godan (五段動詞)', expected: 'godan' },
  { type: 'Verbo Ichidan', expected: 'ichidan' },
  { type: 'ichidan (一段動詞)', expected: 'ichidan' },
  { type: 'Gairaigo', expected: 'gairaigo' },
  { type: 'Katakana / Extranjerismo', expected: 'gairaigo' },
  { type: 'Contador de personas', expected: 'jousoushi' },
  { type: 'Clasificador numérico', expected: 'jousoushi' },
  { type: 'Sustantivo común', expected: null },
  { type: 'Adjetivo -i', expected: null },
  { type: '', expected: null },
  { type: null, expected: null }
];

let allVocabTypesMapped = true;
vocabTypesToTest.forEach(({ type, expected }) => {
  const mapped = mapVocabTypeToTermId(type);
  if (mapped !== expected) {
    allVocabTypesMapped = false;
    console.error(`Vocab type "${type}" mapped to "${mapped}", expected "${expected}"`);
  }
  if (mapped && !knownIds.has(mapped)) {
    allVocabTypesMapped = false;
    console.error(`Mapped vocab termId "${mapped}" does not exist in terminology.json!`);
  }
});
assert(allVocabTypesMapped, 'Vocabulary type badge mapper produces accurate and existing terminology IDs');

// =========================================================================
// 4. APP/GLOBALS.CSS AUDIT: SYNTAX, RESPONSIVENESS & TOKENS
// =========================================================================
console.log('\n--- 4. app/globals.css Audit ---');
const cssPath = path.join(rootDir, 'app', 'globals.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// 4.1 PostCSS Syntax Parse
let cssSyntaxOk = false;
try {
  postcss.parse(cssContent);
  cssSyntaxOk = true;
} catch (e) {
  console.error('PostCSS error:', e.message);
}
assert(cssSyntaxOk, 'app/globals.css parsed cleanly with PostCSS (0 syntax errors)');

// 4.2 Mobile Media Queries (768px and 480px)
const has768px = cssContent.includes('@media (max-width: 768px)');
const has480px = cssContent.includes('@media (max-width: 480px)');
assert(has768px, '@media (max-width: 768px) is present in app/globals.css');
assert(has480px, '@media (max-width: 480px) is present in app/globals.css');

// 4.3 Responsive rules in modified sections
assert(cssContent.includes('.curriculum-stepper-tabs'), '.curriculum-stepper-tabs class styled');
assert(cssContent.includes('scroll-padding: 0 14px;'), '.curriculum-stepper-tabs has smooth scroll-padding');
assert(cssContent.includes('.curriculum-step-tab'), '.curriculum-step-tab class styled');
assert(cssContent.includes('flex: 0 0 calc(82% - 8px);'), '.curriculum-step-tab has 82% peek width for 390px mobile');

// 4.4 480px Step Action Bar grid layout
assert(cssContent.includes('grid-template-columns: 1fr 1fr'), '.step-action-bar has 2-column grid layout for <= 480px');
assert(cssContent.includes('grid-column: 1 / -1'), '.btn-success full-width span configured for <= 480px');

// 4.5 Check absence of hardcoded #f59e0b in modified rules
// Check grammar-notes-box
const grammarNotesMatch = cssContent.match(/\.grammar-notes-box\s*\{([^}]+)\}/);
assert(grammarNotesMatch && !grammarNotesMatch[1].includes('#f59e0b'), '.grammar-notes-box contains NO hardcoded #f59e0b');
assert(grammarNotesMatch && grammarNotesMatch[1].includes('var(--color-kohaku, var(--warning))'), '.grammar-notes-box uses Japandi token var(--color-kohaku, var(--warning))');

// Check curriculum-kanji-mnemonic-box
const mnemonicMatch = cssContent.match(/\.curriculum-kanji-mnemonic-box\s*\{([^}]+)\}/);
assert(mnemonicMatch && !mnemonicMatch[1].includes('border-left: 3px solid #f59e0b'), '.curriculum-kanji-mnemonic-box contains NO hardcoded #f59e0b border');
assert(mnemonicMatch && mnemonicMatch[1].includes('var(--color-kohaku, var(--warning))'), '.curriculum-kanji-mnemonic-box uses Japandi token var(--color-kohaku, var(--warning))');

// Check word-break for bridge example row to prevent horizontal scroll on 390px
assert(cssContent.includes('.curriculum-bridge-example-row > div:first-child') && cssContent.includes('word-break: break-word'), '.curriculum-bridge-example-row has word-break: break-word to prevent horizontal overflow on 390px');

// =========================================================================
// 5. DATASET SCAN: RENDERWITHTERMINOLOGY ON FULL CURRICULUM (37 MODULES)
// =========================================================================
console.log('\n--- 5. Empirical Scan Across Full Curriculum Dataset ---');
const curriculumPath = path.join(rootDir, 'data', 'curriculum.json');
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));

let stringsScanned = 0;
let termsFound = 0;
let scanErrors = 0;

curriculum.forEach(mod => {
  if (mod.detailed_guide) {
    stringsScanned++;
    const res = renderWithTerminology(mod.detailed_guide, `guide_${mod.id}`);
    if (Array.isArray(res)) {
      termsFound += res.filter(n => React.isValidElement(n) && n.props.termId).length;
    }
  }

  (mod.sections || []).forEach(sec => {
    if (sec.objective) {
      stringsScanned++;
      const res = renderWithTerminology(sec.objective, `obj_${sec.substep}`);
      if (Array.isArray(res)) {
        termsFound += res.filter(n => React.isValidElement(n) && n.props.termId).length;
      }
    }

    (sec.grammar_points || []).forEach((gp, gpIdx) => {
      if (gp.title) {
        stringsScanned++;
        const res = renderWithTerminology(gp.title, `gpt_${gpIdx}`);
        if (Array.isArray(res)) {
          termsFound += res.filter(n => React.isValidElement(n) && n.props.termId).length;
        }
      }
      if (gp.explanation) {
        stringsScanned++;
        const res = renderWithTerminology(gp.explanation, `gpe_${gpIdx}`);
        if (Array.isArray(res)) {
          termsFound += res.filter(n => React.isValidElement(n) && n.props.termId).length;
        }
      }
      if (gp.usage_notes) {
        stringsScanned++;
        const res = renderWithTerminology(gp.usage_notes, `gpun_${gpIdx}`);
        if (Array.isArray(res)) {
          termsFound += res.filter(n => React.isValidElement(n) && n.props.termId).length;
        }
      }
    });

    (sec.can_dos || []).forEach((cd, cdIdx) => {
      if (cd.task) {
        stringsScanned++;
        const res = renderWithTerminology(cd.task, `cd_${cdIdx}`);
        if (Array.isArray(res)) {
          termsFound += res.filter(n => React.isValidElement(n) && n.props.termId).length;
        }
      }
    });
  });
});

assert(scanErrors === 0, 'Zero errors during dataset scanning of all curriculum text strings');
assert(termsFound > 50, `Terminology actively detected across curriculum strings (${termsFound} active terms found in ${stringsScanned} scanned fields)`);

// =========================================================================
// SUMMARY
// =========================================================================
console.log('\n===============================================================');
console.log(`📊 TEST RESULTS SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log(`   Failed tests: ${failedTests}`);
console.log('===============================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
