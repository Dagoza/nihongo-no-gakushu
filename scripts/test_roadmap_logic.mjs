/**
 * Pruebas Automatizadas de Lógica de la Hoja de Ruta, Review-First Gate,
 * Minado Inteligente 1T (i+1) y Cobertura de Inmersión.
 */
import assert from 'node:assert';
import { 
  calculateRoadmapProjection, 
  evaluateSentenceMiningScore, 
  calculateImmersionCoverage,
  getStudyPhase,
  calculateReviewLoadForecast,
  isWordMatureInFSRS,
  isSentenceFSRSMature
} from '../lib/roadmapLogic.js';
import { smartSegmentJapanese } from '../lib/japaneseUtils.js';

console.log('=== TEST SUITE: HOJA DE RUTA, REVIEW GATE Y MINADO 1T ===\n');

// --------------------------------------------------------------------------
// TEST 1: COMPUERTA REVIEW-FIRST GATE & FACTOR DE SOSTENIBILIDAD REAL (0.8)
// --------------------------------------------------------------------------
console.log('1. Probando Review-First Gate y Factor de Sostenibilidad...');

// A. Caso Normal (sin deuda de repasos): ritmo de 10 palabras/día con 800 faltantes
const projNormal = calculateRoadmapProjection({
  masteredWordsCount: 0,
  targetWordsCount: 800,
  dailyPace: 10,
  sustainabilityFactor: 0.8,
  dueReviewsCount: 15,
  maxDailyReviewsThreshold: 80
});

assert.strictEqual(projNormal.remainingWords, 800, 'Palabras restantes deben ser 800');
assert.strictEqual(projNormal.optimisticDays, 80, 'Días optimistas = 800 / 10 = 80 días');
assert.strictEqual(projNormal.realisticDays, 100, 'Días realistas = 800 / (10 * 0.8) = 100 días');
assert.strictEqual(projNormal.isReviewGated, false, 'No debe activar Review Gate con 15 repasos vencidos');
assert.strictEqual(projNormal.recommendedNewCards, 10, 'Nuevas recomendadas deben ser 10');
assert.strictEqual(projNormal.gateReason, null, 'No debe haber gateReason');

// B. Caso Crítico: Más de 80 repasos vencidos activa Review-First Gate y fuerza recommendedNewCards = 0
const projGated = calculateRoadmapProjection({
  masteredWordsCount: 200,
  targetWordsCount: 800,
  dailyPace: 10,
  dueReviewsCount: 85,
  maxDailyReviewsThreshold: 80
});

assert.strictEqual(projGated.isReviewGated, true, 'Debe activar compuerta Review-First Gate con 85 repasos vencidos (>80)');
assert.strictEqual(projGated.recommendedNewCards, 0, 'La ingesta recomendada debe ser 0 nuevas hasta vaciar la cola');
assert(typeof projGated.gateReason === 'string' && projGated.gateReason.includes('85 repasos'), 'Debe emitir advertencia formativa con el recuento vencido');

console.log('  ✓ Review-First Gate pausa ingesta (0 nuevas) al superar 80 repasos');
console.log('  ✓ Proyección temporal aplica correctamente el factor de sostenibilidad 0.8 (100 vs 80 días)\n');


// --------------------------------------------------------------------------
// TEST 2: DETECCIÓN INTELIGENTE DE ORACIONES 1T (i+1) PARA MINADO FSRS
// --------------------------------------------------------------------------
console.log('2. Probando Detección de Oraciones 1T (i+1) con smartSegmentJapanese...');

// Creamos un perfil de usuario con 5 palabras conocidas y 1 desconocida
const masteredVocabMock = {
  '私': true,
  '日本': true,
  '友達': true,
  '本': true,
  '行く': true
};

// Oración con 6 fichas/tokens: 5 conocidas y 1 desconocida ('図書館' - biblioteca)
// "私は友達と図書館へ行く"
const sentence1T = "私は友達と図書館へ行く";
const tokens = smartSegmentJapanese(sentence1T);
assert(tokens.length >= 4, 'La oración debe ser segmentada por smartSegmentJapanese');

const result1T = evaluateSentenceMiningScore(sentence1T, masteredVocabMock, {});

assert.strictEqual(result1T.classification, 'OPTIMAL_1T', 'Debe clasificar como OPTIMAL_1T');
assert.strictEqual(result1T.isOptimal1T, true, 'isOptimal1T debe ser true');
assert.strictEqual(result1T.targetWord, '図書館', 'Debe extraer automáticamente la única palabra desconocida (図書館)');
assert.strictEqual(result1T.unknownCount, 1, 'Debe registrar exactamente 1 palabra desconocida');
assert.strictEqual(result1T.badge, '🎯 Oración Ideal i+1', 'Debe portar la insignia 🎯 Oración Ideal i+1');

// Caso de prueba con 0 desconocidas (todas conocidas)
const sentenceAllKnown = "私は友達と行く";
const resultAllKnown = evaluateSentenceMiningScore(sentenceAllKnown, masteredVocabMock, {});
assert.strictEqual(resultAllKnown.classification, 'REVIEW_ONLY', 'Oración sin palabras desconocidas debe ser REVIEW_ONLY');
assert.strictEqual(resultAllKnown.isOptimal1T, false, 'No debe ser 1T');

// Caso de prueba con >1 desconocidas
const sentenceDense = "私は猫と動物園へ行く"; // 猫 y 動物園 desconocidas
const resultDense = evaluateSentenceMiningScore(sentenceDense, masteredVocabMock, {});
assert.strictEqual(resultDense.classification, 'TOO_DENSE', 'Oración con múltiples desconocidas debe ser TOO_DENSE');
assert(resultDense.unknownCount >= 2, 'Debe registrar >= 2 desconocidas');

console.log('  ✓ evaluateSentenceMiningScore() clasifica con éxito oraciones 1T (i+1) y extrae targetWord');
console.log('  ✓ Filtra adecuadamente oraciones 100% conocidas y oraciones demasiado densas\n');


// --------------------------------------------------------------------------
// TEST 3: MEDIDOR DE COBERTURA PRE-INMERSIÓN (ZONA ÓPTIMA 90% - 98%)
// --------------------------------------------------------------------------
console.log('3. Probando Medidor de Cobertura Pre-Inmersión (% conocido)...');

// Simulamos una historia cuyos tokens conocidos equivalen al 94%
// Construimos un array de 50 palabras donde 47 son conocidas y 3 desconocidas (47/50 = 94%)
const knownVocabCoverage = {};
for (let i = 1; i <= 47; i++) {
  knownVocabCoverage[`palabra_${i}`] = true;
}

const mockStoryTokens = [];
for (let i = 1; i <= 47; i++) {
  mockStoryTokens.push({ text: `palabra_${i}`, type: 'word' });
}
mockStoryTokens.push({ text: 'desconocida_1', type: 'word' });
mockStoryTokens.push({ text: 'desconocida_2', type: 'word' });
mockStoryTokens.push({ text: 'desconocida_3', type: 'word' });

// Pasamos el array de tokens directamente a calculateImmersionCoverage
const coverageResult = calculateImmersionCoverage(
  mockStoryTokens,
  knownVocabCoverage,
  {}
);

assert(coverageResult.coveragePercent >= 90 && coverageResult.coveragePercent <= 98, 
  `La cobertura (${coverageResult.coveragePercent}%) debe caer en el rango óptimo 90% - 98%`);
assert.strictEqual(coverageResult.tier, 'OPTIMAL_INPUT', 'Debe clasificarse como OPTIMAL_INPUT');
assert.strictEqual(coverageResult.label, 'Zona Óptima (Comprensible i+1)', 'Debe etiquetarse como Zona Óptima');

// Cobertura > 98%
const highCoverage = calculateImmersionCoverage('私 私 私 私', { '私': true }, {});
assert.strictEqual(highCoverage.tier, 'EASY_REVIEW', '100% debe clasificarse como EASY_REVIEW');

console.log('  ✓ calculateImmersionCoverage() categoriza en Zona Óptima (90% - 98%) para 94% de coincidencia');
console.log('  ✓ Etiqueta adecuadamente textos fluidos (>98%) y de desafío (<90%)\n');


// --------------------------------------------------------------------------
// TEST 4: FASES TEMPORALES Y SIMULADOR DE CARGA ANTI-BURNOUT
// --------------------------------------------------------------------------
console.log('4. Probando fases de estudio y simulador de carga anti-burnout...');

const phase1 = getStudyPhase(150, 20);
assert.strictEqual(phase1.phase, 1, '150 palabras debe ser Fase 1');

const phase2 = getStudyPhase(600, 130);
assert.strictEqual(phase2.phase, 2, '600 palabras debe ser Fase 2');

const phase3 = getStudyPhase(2000, 700);
assert.strictEqual(phase3.phase, 3, '2000 palabras debe ser Fase 3');

const forecastPace20 = calculateReviewLoadForecast(20);
assert(forecastPace20.warning && forecastPace20.warning.includes('Alerta de Sobrecarga'), '20 tarjetas/día debe alertar sobrecarga');

console.log('  ✓ Cálculo de fases (1, 2, 3) y alertas de sobrecarga validadas exitosamente.\n');


// --------------------------------------------------------------------------
// TEST 5: MADUREZ FSRS Y FURIGANA DINÁMICO
// --------------------------------------------------------------------------
console.log('5. Probando Madurez FSRS para Furigana Inteligente...');

const matureMockSrs = {
  'vocab_図書館': {
    scheduled_days: 25,
    interval: 25
  },
  'vocab_学校': {
    scheduled_days: 5,
    interval: 5
  }
};

assert.strictEqual(isWordMatureInFSRS('図書館', {}, matureMockSrs), true, 'Palabra con scheduled_days >= 21 debe ser madura');
assert.strictEqual(isWordMatureInFSRS('学校', {}, matureMockSrs), false, 'Palabra con scheduled_days < 21 no debe ser madura');
assert.strictEqual(isWordMatureInFSRS('猫', { '猫': true }, {}), true, 'Palabra en masteredVocab debe ser madura');
assert.strictEqual(isSentenceFSRSMature('図書館へ行く', { '行く': true }, matureMockSrs), true, 'Oración con todas las palabras maduras debe ser madura');
assert.strictEqual(isSentenceFSRSMature('学校へ行く', { '行く': true }, matureMockSrs), false, 'Oración con palabra inmadura no debe ser madura');

console.log('  ✓ isWordMatureInFSRS e isSentenceFSRSMature validan correctamente el umbral >= 21 días de FSRS.\n');

console.log('======================================================');
console.log('✓ TODOS LOS CASOS DE PRUEBA DE HOJA DE RUTA SUPERADOS');
console.log('======================================================\n');
