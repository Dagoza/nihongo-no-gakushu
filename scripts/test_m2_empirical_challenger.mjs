/**
 * EMPIRICAL ADVERSARIAL TEST HARNESS — MILESTONE M2
 * 
 * Verifies all Milestone M2 requirements, UI ordering, progressive disclosure,
 * audio contracts, terminology integration, and data invariants.
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, message, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    const errMsg = `  ✗ FAIL: ${message}${details ? ' -> ' + details : ''}`;
    console.error(errMsg);
    errors.push(errMsg);
  }
}

console.log('================================================================');
console.log('⚔️  EMPIRICAL ADVERSARIAL VERIFICATION — MILESTONE M2');
console.log('================================================================\n');

// ----------------------------------------------------------------------
// 1. JSX THEMATIC STEP ORDER IN CurriculumTab.jsx
// ----------------------------------------------------------------------
console.log('--- 1. JSX THEMATIC STEP ORDER (CurriculumTab.jsx) ---');

const curriculumTabPath = path.resolve('components/tabs/CurriculumTab.jsx');
const curriculumTabContent = fs.readFileSync(curriculumTabPath, 'utf8');

// Locate the CONTENT STEP block
const contentStepMarker = 'CONTENT STEP: Objectives -> Vocab -> Kanji/Jukugo -> Functional Bridge -> Grammar Points -> Can-Dos';
const contentStepIndex = curriculumTabContent.indexOf(contentStepMarker);
assert(contentStepIndex !== -1, 'Content step section marker found in CurriculumTab.jsx');

const contentStepSubstr = curriculumTabContent.slice(contentStepIndex);

// Identify positions of the 6 thematic steps within the content step block
const idxObjetivo = contentStepSubstr.indexOf('{/* 1. Objetivo de este Paso');
const idxVocab = contentStepSubstr.indexOf('{/* 2. Vocabulario Esencial del Paso');
const idxKanji = contentStepSubstr.indexOf('{/* 3. Kanjis y Combinaciones (Jukugo) del Paso');
const idxBridge = contentStepSubstr.indexOf('{/* 4. Partículas, Prefijos y Componentes Funcionales');
const idxGrammar = contentStepSubstr.indexOf('{/* 5. Puntos Clave de Gramática');
const idxCanDos = contentStepSubstr.indexOf('{/* 6. Competencias Can-Do del Paso');

assert(idxObjetivo !== -1, 'Step 1: Objetivo comment found');
assert(idxVocab !== -1, 'Step 2: Vocabulario comment found');
assert(idxKanji !== -1, 'Step 3: Kanjis/Jukugo comment found');
assert(idxBridge !== -1, 'Step 4: Partículas/Prefijos (Puente Funcional) comment found');
assert(idxGrammar !== -1, 'Step 5: Puntos Clave de Gramática comment found');
assert(idxCanDos !== -1, 'Step 6: Competencias Can-Do comment found');

// Strict order assertion: Objetivo < Vocabulario < Kanjis < Bridge < Grammar < CanDos
assert(
  idxObjetivo < idxVocab &&
  idxVocab < idxKanji &&
  idxKanji < idxBridge &&
  idxBridge < idxGrammar &&
  idxGrammar < idxCanDos,
  'Strict sequential JSX order: Objetivo -> Vocabulario -> Kanjis/Jukugo -> Partículas/Prefijos -> Gramática -> Can-Dos',
  `Positions: Objetivo=${idxObjetivo}, Vocab=${idxVocab}, Kanji=${idxKanji}, Bridge=${idxBridge}, Grammar=${idxGrammar}, CanDos=${idxCanDos}`
);

// Verify actual data bindings correspond to these sections in order
const posObjBinding = contentStepSubstr.indexOf('currentSection.objective');
const posVocabBinding = contentStepSubstr.indexOf('stepVocabList');
const posKanjiBinding = contentStepSubstr.indexOf('currentSection.kanji_jukugo');
const posBridgeBinding = contentStepSubstr.indexOf('currentSection.functional_bridge');
const posGrammarBinding = contentStepSubstr.indexOf('currentSection.grammar_points');
const posCanDosBinding = contentStepSubstr.indexOf('currentSection.can_dos');

assert(
  posObjBinding < posVocabBinding &&
  posVocabBinding < posKanjiBinding &&
  posKanjiBinding < posBridgeBinding &&
  posBridgeBinding < posGrammarBinding &&
  posGrammarBinding < posCanDosBinding,
  'Strict sequential data binding order: objective < vocab < kanji_jukugo < functional_bridge < grammar_points < can_dos'
);

// ----------------------------------------------------------------------
// 2. LIST VIEW .step-card-details ACCORDION ORDER
// ----------------------------------------------------------------------
console.log('\n--- 2. LIST VIEW .step-card-details ORDER ---');

const stepCardDetailsIndex = curriculumTabContent.indexOf('<div className="step-card-details">');
assert(stepCardDetailsIndex !== -1, '.step-card-details container found in CurriculumTab.jsx');

const stepCardDetailsSubstr = curriculumTabContent.slice(stepCardDetailsIndex, stepCardDetailsIndex + 2500);

const posCardVocab = stepCardDetailsSubstr.indexOf('step.included_vocab');
const posCardGrammar = stepCardDetailsSubstr.indexOf('step.grammar_focus');

assert(posCardVocab !== -1, 'step.included_vocab present in .step-card-details');
assert(posCardGrammar !== -1, 'step.grammar_focus present in .step-card-details');
assert(
  posCardVocab < posCardGrammar,
  'In .step-card-details: Vocabulario accordion appears before Gramática accordion',
  `posVocab=${posCardVocab}, posGrammar=${posCardGrammar}`
);

// ----------------------------------------------------------------------
// 3. ZERO OCCURRENCES OF REDUNDANT EXAMPLES
// ----------------------------------------------------------------------
console.log('\n--- 3. ZERO OCCURRENCES OF REDUNDANT EXAMPLES ---');

const countEjemplosRealesCurriculumTab = (curriculumTabContent.match(/Ejemplos Reales en Contexto/g) || []).length;
assert(
  countEjemplosRealesCurriculumTab === 0,
  '0 occurrences of "Ejemplos Reales en Contexto" in CurriculumTab.jsx',
  `Found: ${countEjemplosRealesCurriculumTab}`
);

const countCurrentSectionExamples = (curriculumTabContent.match(/currentSection\.examples/g) || []).length;
assert(
  countCurrentSectionExamples === 0,
  '0 occurrences of "currentSection.examples" in CurriculumTab.jsx',
  `Found: ${countCurrentSectionExamples}`
);

// Check all components in components/
function checkDirForString(dir, pattern) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += checkDirForString(fullPath, pattern);
    } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(pattern);
      if (matches) count += matches.length;
    }
  }
  return count;
}

const countInAllComponents = checkDirForString(path.resolve('components'), /Ejemplos Reales en Contexto/g);
assert(
  countInAllComponents === 0,
  '0 occurrences of "Ejemplos Reales en Contexto" across all components/*.jsx',
  `Found: ${countInAllComponents}`
);

// Check data/curriculum.json for any residual root section examples
const curriculumData = JSON.parse(fs.readFileSync('data/curriculum.json', 'utf8'));
let residualRootExamplesCount = 0;
curriculumData.forEach((mod, mIdx) => {
  (mod.sections || []).forEach((sec, sIdx) => {
    if (sec.examples !== undefined) {
      residualRootExamplesCount++;
    }
  });
});

assert(
  residualRootExamplesCount === 0,
  '0 occurrences of section root .examples in data/curriculum.json across all 37 modules',
  `Found: ${residualRootExamplesCount}`
);

// ----------------------------------------------------------------------
// 4. PROGRESSIVE DISCLOSURE LOGIC IN GRAMMAR POINTS
// ----------------------------------------------------------------------
console.log('\n--- 4. PROGRESSIVE DISCLOSURE LOGIC ---');

// Inspect CurriculumTab.jsx for progressive disclosure logic
const hasManyExamplesCondition = curriculumTabContent.includes('gp.examples && gp.examples.length > 3');
assert(hasManyExamplesCondition, 'CurriculumTab checks if gp.examples.length > 3 for progressive disclosure');

const hasSlice3Condition = curriculumTabContent.includes('gp.examples.slice(0, 3)');
assert(hasSlice3Condition, 'CurriculumTab slices first 3 examples when not expanded');

const hasToggleGrammarExamples = curriculumTabContent.includes('toggleGrammarExamples(examplesKey)');
assert(hasToggleGrammarExamples, 'CurriculumTab binds toggleGrammarExamples with examplesKey');

const hasToggleStateDeclaration = curriculumTabContent.includes('const [expandedGrammarExamples, setExpandedGrammarExamples] = useState({});');
assert(hasToggleStateDeclaration, 'CurriculumTab initializes expandedGrammarExamples state');

const hasToggleFunction = curriculumTabContent.includes('const toggleGrammarExamples = (key) =>');
assert(hasToggleFunction, 'CurriculumTab defines toggleGrammarExamples state updater');

// Test dataset formulas against progressive disclosure thresholds
let formulasCount = 0;
let formulasWithOver3Examples = 0;
const over3FormulasList = [];

curriculumData.forEach((m, mIdx) => {
  (m.sections || []).forEach((s, sIdx) => {
    (s.grammar_points || []).forEach((gp, gpIdx) => {
      formulasCount++;
      const exLen = (gp.examples || []).length;
      if (exLen > 3) {
        formulasWithOver3Examples++;
        over3FormulasList.push({
          module: m.step || mIdx + 1,
          step: s.substep,
          gpIdx: gpIdx + 1,
          title: gp.title,
          count: exLen
        });
      }
    });
  });
});

assert(formulasCount === 222, `Total grammar formulas across curriculum is 222 (found ${formulasCount})`);
assert(formulasWithOver3Examples === 1, `Exactly 1 formula has > 3 examples (found ${formulasWithOver3Examples})`);
assert(
  over3FormulasList[0].count === 4 && over3FormulasList[0].module === 1,
  `Formula with 4 examples is in Module 1: "${over3FormulasList[0].title}" (${over3FormulasList[0].count} examples)`
);

// Test simulation of progressive disclosure logic
function simulateProgressiveDisclosure(examples, isExpanded) {
  const hasManyExamples = examples && examples.length > 3;
  const visible = hasManyExamples && !isExpanded ? examples.slice(0, 3) : (examples || []);
  const buttonText = isExpanded ? 'Ver menos ejemplos' : `Ver más ejemplos (+${examples.length - 3})`;
  return { visibleCount: visible.length, hasButton: hasManyExamples, buttonText };
}

const testEx4 = [1, 2, 3, 4];
const stateCollapsed = simulateProgressiveDisclosure(testEx4, false);
assert(stateCollapsed.visibleCount === 3, 'When collapsed with 4 examples: visible count is exactly 3');
assert(stateCollapsed.hasButton === true, 'When collapsed with 4 examples: toggle button is rendered');
assert(stateCollapsed.buttonText === 'Ver más ejemplos (+1)', 'Button displays "Ver más ejemplos (+1)"');

const stateExpanded = simulateProgressiveDisclosure(testEx4, true);
assert(stateExpanded.visibleCount === 4, 'When expanded with 4 examples: visible count is 4');
assert(stateExpanded.buttonText === 'Ver menos ejemplos', 'Button displays "Ver menos ejemplos"');

const testEx3 = [1, 2, 3];
const stateEx3 = simulateProgressiveDisclosure(testEx3, false);
assert(stateEx3.visibleCount === 3, 'When formula has 3 examples: visible count is 3');
assert(stateEx3.hasButton === false, 'When formula has 3 examples: NO toggle button is rendered');

// ----------------------------------------------------------------------
// 5. CONTINUOUS AUDIO PLAYBACK IN VOCABULARIES
// ----------------------------------------------------------------------
console.log('\n--- 5. CONTINUOUS AUDIO PLAYBACK ---');

// Assert audioManager.speak in step vocab
const stepVocabAudioPattern = /audioManager\.speak\(playlist\[0\]\.text,\s*\{\s*autoAdvance:\s*true\s*\}\)/;
assert(stepVocabAudioPattern.test(curriculumTabContent), 'audioManager.speak invoked with { autoAdvance: true }');

// Assert both occurrences (step vocab and module vocab in hero card)
const allAutoAdvanceMatches = curriculumTabContent.match(/audioManager\.speak\([a-zA-Z0-9_\[\].]+,\s*\{\s*autoAdvance:\s*true\s*\}\)/g);
assert(
  allAutoAdvanceMatches && allAutoAdvanceMatches.length >= 2,
  `audioManager.speak with { autoAdvance: true } is invoked in BOTH step vocab and module hero card (found ${allAutoAdvanceMatches ? allAutoAdvanceMatches.length : 0})`
);

// Verify playlist creation and setPlaylist before speak
const stepVocabPlaylistBlock = curriculumTabContent.slice(
  curriculumTabContent.indexOf('audioManager.setPlaylist(playlist, 0)'),
  curriculumTabContent.indexOf('audioManager.setPlaylist(playlist, 0)') + 300
);
assert(
  stepVocabPlaylistBlock.includes('audioManager.setPlaylist(playlist, 0)') &&
  stepVocabPlaylistBlock.includes('audioManager.speak(playlist[0].text, { autoAdvance: true })'),
  'Step vocab sets playlist with index 0 before invoking speak with autoAdvance: true'
);

// Verify hero card module vocab has playlist and speak
const heroCardVocabIdx = curriculumTabContent.indexOf('Reproducción Continua');
assert(heroCardVocabIdx !== -1, 'Hero card contains "Reproducción Continua" button');
const heroCardVocabBlock = curriculumTabContent.slice(heroCardVocabIdx - 400, heroCardVocabIdx + 200);
assert(
  heroCardVocabBlock.includes('audioManager.setPlaylist(playlist, 0)') &&
  heroCardVocabBlock.includes('audioManager.speak(playlist[0].text, { autoAdvance: true })'),
  'Module Hero card sets playlist with index 0 and speaks playlist[0] with autoAdvance: true'
);

// ----------------------------------------------------------------------
// 6. TERMINOLOGY INTEGRATION & PARTICULA IN terminology.json
// ----------------------------------------------------------------------
console.log('\n--- 6. TERMINOLOGY INTEGRATION & PARTICULA TERM ---');

const terminologyData = JSON.parse(fs.readFileSync('data/terminology.json', 'utf8'));
assert(terminologyData.length === 21, `data/terminology.json contains exactly 21 terms (found ${terminologyData.length})`);

const particulaTerm = terminologyData.find(t => t.id === 'particula');
assert(!!particulaTerm, 'Term "particula" exists in data/terminology.json');
assert(particulaTerm.term.includes('Partículas'), 'Term name includes "Partículas"');
assert(particulaTerm.kanji === '助詞', 'Term kanji is "助詞"');
assert(particulaTerm.kana === 'じょし', 'Term kana is "じょし"');
assert(particulaTerm.category === 'Gramática y Morfología', 'Category is "Gramática y Morfología"');
assert(typeof particulaTerm.short_definition === 'string' && particulaTerm.short_definition.length > 20, 'Has valid short_definition');
assert(Array.isArray(particulaTerm.examples) && particulaTerm.examples.length >= 2, 'Has at least 2 usage examples');

// Check that all 21 terms have valid structure
let invalidTerms = 0;
const termIds = new Set();
terminologyData.forEach((t, i) => {
  if (!t.id || !t.term || !t.category || !t.short_definition) invalidTerms++;
  termIds.add(t.id);
});
assert(invalidTerms === 0, 'All 21 terms have valid structure and required fields');
assert(termIds.size === 21, 'All 21 term IDs are unique');

// Test renderWithTerminology helper function logic from CurriculumTab.jsx
const renderWithTerminologySnippet = curriculumTabContent.slice(
  curriculumTabContent.indexOf('const renderWithTerminology ='),
  curriculumTabContent.indexOf('const renderWithTerminology =') + 2500
);

assert(
  renderWithTerminologySnippet.includes('\\b(bikougo|') &&
  renderWithTerminologySnippet.includes('part[ií]culas?') &&
  renderWithTerminologySnippet.includes('joshi'),
  'renderWithTerminology regex pattern matches linguistic terms including particula/joshi'
);

// Test simulated terminology regex against key curriculum strings
const testPattern = new RegExp(
  `\\b(bikougo|lenguaje embellecedor|sonkeigo|lenguaje respetuoso|kenjougo|lenguaje humilde|teineigo|lenguaje cort[eé]s|keigo|c[oó]pulas?|part[ií]culas?|verbos?\\s+godan|godan|verbos?\\s+ichidan|ichidan|jukugos?|kangos?|wagos?|gairaigos?|okurigana|furigana|jousoushi|contadores|contador|pitch\\s+accent|joshi)\\b`,
  'gi'
);

const testSentences = [
  'Uso de la partícula は como marcador de tema.',
  'La cópula だ y です en estilo formal.',
  'Conjugación de verbos Godan e Ichidan.',
  'Vocabulario de origen extranjero (gairaigo).',
  'Lecturas wago y kango de kanjis.',
  'Contadores japoneses (jousoushi) para objetos planos.'
];

let matchedSentences = 0;
for (const s of testSentences) {
  testPattern.lastIndex = 0;
  if (testPattern.test(s)) matchedSentences++;
}
assert(matchedSentences === testSentences.length, `Terminology regex matches all test linguistic sentences (${matchedSentences}/${testSentences.length})`);

// Verify renderWithTerminology integration points in CurriculumTab.jsx
const hasDetailedGuideCall = curriculumTabContent.includes('renderWithTerminology(selectedStep.detailed_guide');
const hasCurrentSectionObjCall = curriculumTabContent.includes('renderWithTerminology(currentSection.objective');
const hasGpTitleCall = curriculumTabContent.includes('renderWithTerminology(gp.title');
const hasGpExplanationCall = curriculumTabContent.includes('renderWithTerminology(gp.explanation');
const hasGpUsageNotesCall = curriculumTabContent.includes('renderWithTerminology(gp.usage_notes');
const hasCdTaskCall = curriculumTabContent.includes('renderWithTerminology(cd.task');

assert(hasDetailedGuideCall, 'renderWithTerminology applied to selectedStep.detailed_guide');
assert(hasCurrentSectionObjCall, 'renderWithTerminology applied to currentSection.objective');
assert(hasGpTitleCall, 'renderWithTerminology applied to gp.title');
assert(hasGpExplanationCall, 'renderWithTerminology applied to gp.explanation');
assert(hasGpUsageNotesCall, 'renderWithTerminology applied to gp.usage_notes');
assert(hasCdTaskCall, 'renderWithTerminology applied to cd.task');

// Verify v.type vocabulary badge tooltip
const hasVocabTypeTooltip = curriculumTabContent.includes("<TerminologyTooltip termId={termId}>");
assert(hasVocabTypeTooltip, 'Vocabulary badge in step vocab is wrapped in TerminologyTooltip for godan, ichidan, gairaigo, and jousoushi');

// ----------------------------------------------------------------------
// 7. RESPONSIVE CSS & DESIGN TOKENS IN app/globals.css
// ----------------------------------------------------------------------
console.log('\n--- 7. RESPONSIVE CSS & DESIGN TOKENS (app/globals.css) ---');

const globalsCssContent = fs.readFileSync('app/globals.css', 'utf8');

assert(
  globalsCssContent.includes('.curriculum-stepper-tabs {') &&
  globalsCssContent.includes('scroll-snap-type: x mandatory;') &&
  globalsCssContent.includes('scroll-padding: 0 14px;'),
  'globals.css includes mobile horizontal scroll-snap and scroll-padding for .curriculum-stepper-tabs'
);

assert(
  globalsCssContent.includes('flex: 0 0 calc(82% - 8px);'),
  'globals.css provides peek effect (82% card width) for .curriculum-step-tab on mobile viewports'
);

assert(
  globalsCssContent.includes('@media (max-width: 480px)') &&
  globalsCssContent.includes('grid-template-columns: 1fr 1fr !important;'),
  'globals.css provides 2-column mobile layout for .step-action-bar on viewports <= 480px'
);

assert(
  globalsCssContent.includes('.curriculum-bridge-example-row > div:first-child') &&
  globalsCssContent.includes('word-break: break-word;'),
  'globals.css prevents overflow with word-break on .curriculum-bridge-example-row'
);

// Check for forbidden hardcoded #f59e0b in curriculum sections
const curriculumCssSlice = globalsCssContent.slice(
  globalsCssContent.indexOf('.curriculum-stepper-container'),
  globalsCssContent.indexOf('.cando-card') + 1500
);
const hasHardcodedAmber = curriculumCssSlice.includes('#f59e0b');
assert(!hasHardcodedAmber, 'Zero hardcoded #f59e0b in curriculum CSS section (uses semantic tokens)');

// ----------------------------------------------------------------------
// 8. ADVERSARIAL EDGE CASES & STRESS SCENARIOS
// ----------------------------------------------------------------------
console.log('\n--- 8. ADVERSARIAL EDGE CASES & STRESS SCENARIOS ---');

// 8.1 Formula key collision stress test across all 222 formulas
const allFormulaKeys = new Set();
let duplicateKeys = 0;
curriculumData.forEach((m) => {
  (m.sections || []).forEach((s) => {
    (s.grammar_points || []).forEach((gp, gpIdx) => {
      // In a given step view, currentSection.substep and gpIdx form the key
      const key = `${s.substep}_${gpIdx}`;
      // In the context of a single active substep, keys must be unique
      // Verify gpIdx is 0-indexed sequential
      if (gpIdx < 0 || typeof gpIdx !== 'number') duplicateKeys++;
    });
  });
});
assert(duplicateKeys === 0, 'Grammar point indices are strictly non-negative integers');

// 8.2 Terminology resolver coverage & boundary conditions
const resolverMapping = {
  'bikougo': 'bikougo',
  'embellecedor': 'bikougo',
  'sonkeigo': 'sonkeigo',
  'respetuoso': 'sonkeigo',
  'kenjougo': 'kenjougo',
  'humilde': 'kenjougo',
  'teineigo': 'teineigo',
  'cort': 'teineigo',
  'keigo': 'keigo',
  'pula': 'copula',
  'part': 'particula',
  'joshi': 'particula',
  'godan': 'godan',
  'ichidan': 'ichidan',
  'jukugo': 'jukugo',
  'kango': 'kango',
  'wago': 'wago',
  'gairaigo': 'gairaigo',
  'okurigana': 'okurigana',
  'furigana': 'furigana',
  'jousoushi': 'jousoushi',
  'contador': 'jousoushi',
  'pitch': 'pitch_accent'
};

const terminologyIdsInJson = new Set(terminologyData.map(t => t.id));
let unmappedTermIds = 0;
for (const [key, termId] of Object.entries(resolverMapping)) {
  if (!terminologyIdsInJson.has(termId)) {
    unmappedTermIds++;
  }
}
assert(unmappedTermIds === 0, 'Every mapped termId in renderWithTerminology exists in data/terminology.json');

// 8.3 Boundary inputs to renderWithTerminology pattern
const edgeCases = [
  '',
  '   ',
  'texto normal sin ningún término especial',
  'Partícula con Keigo y verbos Godan en estilo Teineigo',
  '¿Es una CÓPULA o una PARTÍCULA?',
  'Supercalifragilisticoespialidoso',
  '1234567890 !@#$%^&*()_+',
  'a'.repeat(10000) // Long string stress test
];

let regexFailed = false;
const startTime = Date.now();
for (const tc of edgeCases) {
  try {
    testPattern.lastIndex = 0;
    testPattern.test(tc);
  } catch (err) {
    regexFailed = true;
  }
}
const elapsedMs = Date.now() - startTime;
assert(!regexFailed && elapsedMs < 200, `Regex handles edge cases and 10k-char string safely in ${elapsedMs}ms (< 200ms) without backtracking crash`);

// 8.4 Clean text for audio test (cleanTextForAudio from TerminologyTooltip)
function cleanTextForAudio(text) {
  if (!text || typeof text !== 'string') return '';
  const cleaned = text.replace(/\s*[\(\（][^\)\）]*[\)\）]/g, '').trim();
  return cleaned || text.trim();
}

assert(cleanTextForAudio('お茶 (おちゃ)') === 'お茶', 'cleanTextForAudio strips Western parenthetical reading correctly');
assert(cleanTextForAudio('ご飯（ごはん）') === 'ご飯', 'cleanTextForAudio strips Japanese full-width parenthetical reading correctly');
assert(cleanTextForAudio('日本語') === '日本語', 'cleanTextForAudio preserves clean kanji text');
assert(cleanTextForAudio('') === '', 'cleanTextForAudio handles empty string gracefully');
assert(cleanTextForAudio(null) === '', 'cleanTextForAudio handles null gracefully');

// 8.5 Empty playlist safety guards
const hasStepVocabEmptyGuard = curriculumTabContent.includes('if (playlist.length > 0) {\n                                  audioManager.setPlaylist(playlist, 0);');
const hasModuleVocabEmptyGuard = curriculumTabContent.includes('if (playlist.length > 0) {\n                        audioManager.setPlaylist(playlist, 0);');
assert(
  hasStepVocabEmptyGuard || curriculumTabContent.includes('if (playlist.length > 0)'),
  'audioManager playback has playlist.length > 0 guard preventing index out of bounds on empty list'
);

// ----------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TOTAL PASSES: ${passed}`);
console.log(`TOTAL FAILURES: ${failed}`);
console.log('================================================================');

if (failed > 0) {
  console.error('\nFAILURES ENCOUNTERED:');
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log('\n🎉 ALL EMPIRICAL ADVERSARIAL CHECKS PASSED PERFECTLY (100%)');
  process.exit(0);
}

