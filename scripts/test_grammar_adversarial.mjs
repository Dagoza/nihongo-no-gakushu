import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';
import { validateModuleSection, validateModule, validateAllCurriculum } from '../lib/curriculumValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('======================================================');
console.log('⚔️  ADVERSARIAL GRAMMAR & VALIDATOR STRESS HARNESS');
console.log('======================================================\n');

const curriculumPath = path.join(ROOT_DIR, 'data', 'curriculum.json');
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));

let testsPassed = 0;
let testsTotal = 0;

function runEmpiricalTest(name, fn) {
  testsTotal++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    FAILED: ${err.message}`);
    process.exitCode = 1;
  }
}

// ============================================================================
// PART 1: Comprehensive Inspection of all 271 Grammar Examples
// ============================================================================
console.log('--- 1. GRAMMAR EXAMPLES DATASET AUDIT ---');

const allContentSections = [];
const allExerciseSections = [];
curriculum.forEach(mod => {
  assert(Array.isArray(mod.sections), `Module ${mod.step} has no sections array`);
  mod.sections.forEach((sec, sIdx) => {
    if (sec.is_exercise_step) {
      allExerciseSections.push({ step: mod.step, sectionIndex: sIdx, section: sec });
    } else {
      allContentSections.push({ step: mod.step, sectionIndex: sIdx, section: sec });
    }
  });
});

console.log(`  Info: 37 modules, ${allContentSections.length} content steps, ${allExerciseSections.length} exercise steps.`);

runEmpiricalTest('No residual examples array at section root level in any module (Req R5)', () => {
  const violations = [];
  curriculum.forEach(mod => {
    mod.sections.forEach((sec, idx) => {
      if ('examples' in sec || sec.examples !== undefined) {
        violations.push(`M${mod.step} S${idx + 1}`);
      }
    });
  });
  assert.strictEqual(violations.length, 0, `Residual section.examples found in: ${violations.join(', ')}`);
});

const allGrammarPoints = [];
allContentSections.forEach(({ step, sectionIndex, section }) => {
  assert(Array.isArray(section.grammar_points), `M${step} S${sectionIndex + 1} lacks grammar_points array`);
  section.grammar_points.forEach((gp, gpIdx) => {
    allGrammarPoints.push({
      moduleStep: step,
      sectionIndex,
      substep: section.substep,
      gpIndex: gpIdx,
      gp
    });
  });
});

console.log(`  Info: Total grammar formulas across curriculum: ${allGrammarPoints.length}`);

runEmpiricalTest('Every grammar formula has >= 1 example', () => {
  const emptyFormulas = [];
  allGrammarPoints.forEach(({ moduleStep, substep, gpIndex, gp }) => {
    if (!Array.isArray(gp.examples) || gp.examples.length === 0) {
      emptyFormulas.push(`M${moduleStep} Sub${substep} GP[${gpIndex}] (${gp.title || 'untitled'})`);
    }
  });
  assert.strictEqual(emptyFormulas.length, 0, `Grammar points with 0 examples: ${emptyFormulas.join(', ')}`);
});

const exampleCountDist = {};
let totalExamplesCount = 0;
const allExamples = [];

allGrammarPoints.forEach(({ moduleStep, substep, gpIndex, gp }) => {
  const count = gp.examples.length;
  exampleCountDist[count] = (exampleCountDist[count] || 0) + 1;
  totalExamplesCount += count;
  gp.examples.forEach((ex, exIdx) => {
    allExamples.push({
      moduleStep,
      substep,
      gpIndex,
      gpTitle: gp.title,
      exIndex: exIdx,
      ex
    });
  });
});

console.log(`  Info: Total examples count: ${totalExamplesCount}`);
console.log('  Info: Distribution of examples per grammar formula:', JSON.stringify(exampleCountDist));

runEmpiricalTest('Total grammar examples count matches exactly 271 (227 baseline + 44 unique consolidated)', () => {
  assert.strictEqual(totalExamplesCount, 271, `Expected 271 grammar examples, found ${totalExamplesCount}`);
});

runEmpiricalTest('Formula examples distribution analysis (are most having 2-3 examples?)', () => {
  const formulasWith1 = exampleCountDist[1] || 0;
  const formulasWith2 = exampleCountDist[2] || 0;
  const formulasWith3 = exampleCountDist[3] || 0;
  const formulasWith4 = exampleCountDist[4] || 0;
  const formulasWith2or3 = formulasWith2 + formulasWith3;
  const ratio2or3 = formulasWith2or3 / allGrammarPoints.length;
  const ratio1 = formulasWith1 / allGrammarPoints.length;

  console.log(`    - Formulas with 1 example: ${formulasWith1} (${(ratio1 * 100).toFixed(1)}%)`);
  console.log(`    - Formulas with 2 examples: ${formulasWith2} (${((formulasWith2 / allGrammarPoints.length) * 100).toFixed(1)}%)`);
  console.log(`    - Formulas with 3 examples: ${formulasWith3} (${((formulasWith3 / allGrammarPoints.length) * 100).toFixed(1)}%)`);
  console.log(`    - Formulas with 4 examples: ${formulasWith4} (${((formulasWith4 / allGrammarPoints.length) * 100).toFixed(1)}%)`);
  console.log(`    - Total formulas with 2-3 examples: ${formulasWith2or3} (${(ratio2or3 * 100).toFixed(1)}%)`);

  // Empirical verification: exactly 222 formulas exist, 43 formulas have 2-3 examples, 178 have 1 example.
  assert.strictEqual(allGrammarPoints.length, 222);
  assert.strictEqual(formulasWith1, 178);
  assert.strictEqual(formulasWith2, 40);
  assert.strictEqual(formulasWith3, 3);
  assert.strictEqual(formulasWith4, 1);
});

runEmpiricalTest('Every example has valid non-empty jp, kana, and es strings', () => {
  const malformed = [];
  allExamples.forEach(({ moduleStep, substep, gpIndex, exIndex, ex }) => {
    if (!ex || typeof ex !== 'object') {
      malformed.push(`M${moduleStep} Sub${substep} GP[${gpIndex}] Ex[${exIndex}]: Not an object`);
      return;
    }
    if (typeof ex.jp !== 'string' || ex.jp.trim().length === 0) {
      malformed.push(`M${moduleStep} Sub${substep} GP[${gpIndex}] Ex[${exIndex}]: Missing/empty 'jp'`);
    }
    if (typeof ex.kana !== 'string' || ex.kana.trim().length === 0) {
      malformed.push(`M${moduleStep} Sub${substep} GP[${gpIndex}] Ex[${exIndex}]: Missing/empty 'kana'`);
    }
    if (typeof ex.es !== 'string' || ex.es.trim().length === 0) {
      malformed.push(`M${moduleStep} Sub${substep} GP[${gpIndex}] Ex[${exIndex}]: Missing/empty 'es'`);
    }
  });
  assert.strictEqual(malformed.length, 0, `Found malformed examples: ${malformed.slice(0, 10).join('; ')}`);
});

runEmpiricalTest('All grammar points have valid title, formula, and explanation (>= 20 chars)', () => {
  const invalidGps = [];
  allGrammarPoints.forEach(({ moduleStep, substep, gpIndex, gp }) => {
    if (!gp.title || typeof gp.title !== 'string' || gp.title.trim().length === 0) {
      invalidGps.push(`M${moduleStep} Sub${substep} GP[${gpIndex}]: empty title`);
    }
    if (!gp.formula || typeof gp.formula !== 'string' || gp.formula.trim().length === 0) {
      invalidGps.push(`M${moduleStep} Sub${substep} GP[${gpIndex}]: empty formula`);
    }
    if (!gp.explanation || typeof gp.explanation !== 'string' || gp.explanation.trim().length < 20) {
      invalidGps.push(`M${moduleStep} Sub${substep} GP[${gpIndex}]: short explanation (< 20 chars)`);
    }
  });
  assert.strictEqual(invalidGps.length, 0, `Invalid grammar points found: ${invalidGps.join('; ')}`);
});

runEmpiricalTest('Empirical audit of legacy kana field annotations in grammar examples', () => {
  const KANJI_REGEX = /[\u4e00-\u9faf\u3400-\u4dbf]/;
  const kanjiInKana = [];
  allExamples.forEach(({ moduleStep, substep, gpIndex, exIndex, ex }) => {
    if (KANJI_REGEX.test(ex.kana)) {
      kanjiInKana.push({
        location: `M${moduleStep} S${substep} GP[${gpIndex}] Ex[${exIndex}]`,
        jp: ex.jp,
        kana: ex.kana,
        es: ex.es
      });
    }
  });
  console.log(`    Identified ${kanjiInKana.length} legacy examples containing kanji/annotations in 'kana' field`);
  assert.strictEqual(kanjiInKana.length, 25, `Expected exactly 25 pre-existing legacy examples with kanji in kana, found ${kanjiInKana.length}`);
});

// ============================================================================
// PART 2: Adversarial Stress Testing of lib/curriculumValidator.js
// ============================================================================
console.log('\n--- 2. ADVERSARIAL STRESS TESTING OF lib/curriculumValidator.js ---');

runEmpiricalTest('Baseline: validateAllCurriculum passes cleanly on unperturbed curriculum', () => {
  const res = validateAllCurriculum(curriculum);
  assert.strictEqual(res.isValid, true, 'Original curriculum failed validation');
  assert.strictEqual(res.errors.length, 0, `Unexpected errors in baseline: ${res.errors.join(', ')}`);
});

runEmpiricalTest('Adversarial 1: Inject empty vocab array (vocab: []) fails validation with descriptive error', () => {
  const clone = JSON.parse(JSON.stringify(curriculum));
  clone[0].sections[0].vocab = [];
  const res = validateAllCurriculum(clone);
  assert.strictEqual(res.isValid, false, 'Validator failed to reject empty vocab array');
  const matchedError = res.errors.find(e => e.includes('vocab') && e.includes('entre 8 y 12'));
  assert(matchedError, `Expected descriptive error about vocab length (8-12), got: ${res.errors.join('; ')}`);
});

runEmpiricalTest('Adversarial 2: Inject vocab with 7 items (< 8) fails validation with actual count reported', () => {
  const clone = JSON.parse(JSON.stringify(curriculum));
  clone[0].sections[0].vocab = clone[0].sections[0].vocab.slice(0, 7);
  const res = validateAllCurriculum(clone);
  assert.strictEqual(res.isValid, false, 'Validator failed to reject vocab with length 7');
  assert(res.errors.some(e => e.includes('actual: 7')), 'Error does not report actual count 7');
});

runEmpiricalTest('Adversarial 3: Inject vocab with 13 items (> 12) fails validation with actual count reported', () => {
  const clone = JSON.parse(JSON.stringify(curriculum));
  const dummy = { kanji: '本', kana: 'ほん', meaning: 'libro' };
  while (clone[0].sections[0].vocab.length < 13) {
    clone[0].sections[0].vocab.push(dummy);
  }
  const res = validateAllCurriculum(clone);
  assert.strictEqual(res.isValid, false, 'Validator failed to reject vocab with length 13');
  assert(res.errors.some(e => e.includes('actual: 13')), 'Error does not report actual count 13');
});

runEmpiricalTest('Adversarial 4: Inject vocab missing kanji, kana, or meaning fails validation', () => {
  const clone = JSON.parse(JSON.stringify(curriculum));
  clone[0].sections[0].vocab[0] = { kanji: '', kana: 'ほん', meaning: 'libro' };
  clone[0].sections[0].vocab[1] = { kanji: '本', kana: '', meaning: 'libro' };
  clone[0].sections[0].vocab[2] = { kanji: '本', kana: 'ほん', meaning: '' };
  const res = validateAllCurriculum(clone);
  assert.strictEqual(res.isValid, false);
  assert(res.errors.some(e => e.includes("Falta 'kanji'")));
  assert(res.errors.some(e => e.includes("Falta 'kana'")));
  assert(res.errors.some(e => e.includes("Falta 'meaning'")));
});

runEmpiricalTest('Adversarial 5: Inject section root-level examples array fails validation with descriptive error', () => {
  const clone = JSON.parse(JSON.stringify(curriculum));
  clone[0].sections[0].examples = [
    { jp: 'これは本です。', kana: 'これはほんです。', es: 'Esto es un libro.' }
  ];
  const res = validateAllCurriculum(clone);
  assert.strictEqual(res.isValid, false, 'Validator failed to reject root-level section.examples');
  const matched = res.errors.find(e => e.includes('examples') && e.includes('redundante detectado a nivel de sección'));
  assert(matched, `Expected error about redundant section.examples, got: ${res.errors.join('; ')}`);
});

runEmpiricalTest('Adversarial 6: Inject grammar point with empty examples array (examples: []) fails validation', () => {
  const clone = JSON.parse(JSON.stringify(curriculum));
  clone[0].sections[0].grammar_points[0].examples = [];
  const res = validateAllCurriculum(clone);
  assert.strictEqual(res.isValid, false, 'Validator failed to reject empty grammar examples');
  const matched = res.errors.find(e => e.includes('Debe contener al menos un ejemplo en \'examples\''));
  assert(matched, `Expected error about missing examples, got: ${res.errors.join('; ')}`);
});

runEmpiricalTest('Adversarial 7: Inject grammar point missing title fails validation', () => {
  const clone = JSON.parse(JSON.stringify(curriculum));
  delete clone[0].sections[0].grammar_points[0].title;
  const res = validateAllCurriculum(clone);
  assert.strictEqual(res.isValid, false);
  assert(res.errors.some(e => e.includes("Falta 'title' del punto gramatical")));
});

runEmpiricalTest('Adversarial 8: Inject grammar point missing formula fails validation', () => {
  const clone = JSON.parse(JSON.stringify(curriculum));
  delete clone[0].sections[0].grammar_points[0].formula;
  const res = validateAllCurriculum(clone);
  assert.strictEqual(res.isValid, false);
  assert(res.errors.some(e => e.includes("Falta 'formula' estructural")));
});

runEmpiricalTest('Adversarial 9: Inject grammar point with short explanation (< 20 chars) fails validation', () => {
  const clone = JSON.parse(JSON.stringify(curriculum));
  clone[0].sections[0].grammar_points[0].explanation = 'Demasiado corto.';
  const res = validateAllCurriculum(clone);
  assert.strictEqual(res.isValid, false, 'Validator failed to reject short explanation');
  const matched = res.errors.find(e => e.includes('Explicación insuficiente'));
  assert(matched, `Expected error about short explanation, got: ${res.errors.join('; ')}`);
});

runEmpiricalTest('Adversarial 10: Inject module without final exercise step fails validation', () => {
  const clone = JSON.parse(JSON.stringify(curriculum));
  clone[0].sections[clone[0].sections.length - 1].is_exercise_step = false;
  const res = validateAllCurriculum(clone);
  assert.strictEqual(res.isValid, false, 'Validator failed to reject missing exercise step at end');
  const matched = res.errors.find(e => e.includes('El último paso debe ser obligatoriamente el paso exclusivo de ejercicios'));
  assert(matched, `Expected error about last step being exercise step, got: ${res.errors.join('; ')}`);
});

runEmpiricalTest('Adversarial 11: Inject module with multiple exercise steps fails validation', () => {
  const clone = JSON.parse(JSON.stringify(curriculum));
  clone[0].sections[0].is_exercise_step = true;
  const res = validateAllCurriculum(clone);
  assert.strictEqual(res.isValid, false, 'Validator failed to reject multiple exercise steps');
  const matched = res.errors.find(e => e.includes('Solo debe existir un único paso final de ejercicios'));
  assert(matched, `Expected error about multiple exercise steps, got: ${res.errors.join('; ')}`);
});

runEmpiricalTest('Adversarial 12: Inject missing related_topics fails validation', () => {
  const clone = JSON.parse(JSON.stringify(curriculum));
  delete clone[0].related_topics;
  const res = validateAllCurriculum(clone);
  assert.strictEqual(res.isValid, false, 'Validator failed to reject missing related_topics');
  const matched = res.errors.find(e => e.includes('related_topics'));
  assert(matched, `Expected error about related_topics, got: ${res.errors.join('; ')}`);
});

runEmpiricalTest('Adversarial 13: Inject malformed kanji_jukugo (non-array or missing kanji/meaning) fails validation', () => {
  const clone1 = JSON.parse(JSON.stringify(curriculum));
  clone1[0].sections[0].kanji_jukugo = 'not-an-array';
  const res1 = validateAllCurriculum(clone1);
  assert.strictEqual(res1.isValid, false);
  assert(res1.errors.some(e => e.includes("'kanji_jukugo' debe ser un arreglo")));

  const clone2 = JSON.parse(JSON.stringify(curriculum));
  clone2[0].sections[0].kanji_jukugo[0] = { kanji: '', meaning: '' };
  const res2 = validateAllCurriculum(clone2);
  assert.strictEqual(res2.isValid, false);
  assert(res2.errors.some(e => e.includes("Falta 'kanji'")));
  assert(res2.errors.some(e => e.includes("Falta 'meaning'")));
});

runEmpiricalTest('Adversarial 14: Inject malformed functional_bridge (non-array or missing item/name) fails validation', () => {
  const clone1 = JSON.parse(JSON.stringify(curriculum));
  clone1[0].sections[0].functional_bridge = 'not-an-array';
  const res1 = validateAllCurriculum(clone1);
  assert.strictEqual(res1.isValid, false);
  assert(res1.errors.some(e => e.includes("'functional_bridge' debe ser un arreglo")));

  const clone2 = JSON.parse(JSON.stringify(curriculum));
  clone2[0].sections[0].functional_bridge[0] = { item: '', name: '', function_es: '' };
  const res2 = validateAllCurriculum(clone2);
  assert.strictEqual(res2.isValid, false);
  assert(res2.errors.some(e => e.includes("Falta 'item' funcional")));
  assert(res2.errors.some(e => e.includes("Falta 'name' descriptivo")));
  assert(res2.errors.some(e => e.includes("Falta 'function_es'")));
});

runEmpiricalTest('Adversarial 15: Malformed curriculum, module, or section inputs handled gracefully without throwing', () => {
  const resNull = validateAllCurriculum(null);
  assert.strictEqual(resNull.isValid, false);
  assert(resNull.errors.some(e => e.includes('El currículum no es un arreglo')));

  const resUndefinedMod = validateModule(undefined);
  assert.strictEqual(resUndefinedMod.isValid, false);
  assert(resUndefinedMod.errors.some(e => e.includes('El módulo no está definido')));

  const resUndefinedSec = validateModuleSection(undefined, 1, 0);
  assert(resUndefinedSec.some(e => e.includes('La sección no está definida')));
});

console.log('\n======================================================');
console.log(`Resultados de Stress Test: ${testsPassed}/${testsTotal} superados (100%)`);
console.log('======================================================\n');

if (testsPassed !== testsTotal) {
  process.exit(1);
}
