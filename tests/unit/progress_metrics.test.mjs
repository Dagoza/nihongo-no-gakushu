import { calculateOverallProgress, calculateLevelProgress, WEIGHTS } from '../../lib/progressMetrics.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    process.exit(1);
  }
}

console.log('--- TEST 1: Progreso con estado vacío ---');
const emptyProgress = calculateOverallProgress({});
assert(emptyProgress.overallPercent === 0, `Progreso vacío debe ser 0%, obtenido: ${emptyProgress.overallPercent}`);
assert(emptyProgress.overallInteger === 0, `Integer vacío debe ser 0, obtenido: ${emptyProgress.overallInteger}`);

console.log('--- TEST 2: Suma de techos oficiales = 100% ---');
const totalWeight = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
assert(totalWeight === 100, `La suma de WEIGHTS debe ser estrictamente 100%, obtenido: ${totalWeight}`);

console.log('--- TEST 3: Ponderaciones individuales acordadas ---');
assert(WEIGHTS.modules === 25, 'Módulos debe ser 25%');
assert(WEIGHTS.conversations === 20, 'Conversaciones debe ser 20%');
assert(WEIGHTS.stories === 15, 'Historias debe ser 15%');
assert(WEIGHTS.scriptpad === 15, 'Scriptpad debe ser 15%');
assert(WEIGHTS.kanji === 10, 'Kanjis debe ser 10%');
assert(WEIGHTS.vocab === 10, 'Vocabulario debe ser 10%');
assert(WEIGHTS.particles === 5, 'Partículas debe ser 5%');

console.log('--- TEST 4: Progreso con items completados sin desbordar techo ---');
const partialState = {
  xp: 61455,
  completedSteps: { 1: true, 2: true, 3: true, 4: true, 5: true },
  completedConversations: { nhk_1: true, nhk_2: true, iro_1: true },
  masteredParticles: { particle_1: true, particle_2: true }
};
const partialProgress = calculateOverallProgress(partialState);
assert(partialProgress.overallPercent > 0 && partialProgress.overallPercent <= 100, `Progreso parcial válido: ${partialProgress.overallPercent}%`);
assert(partialProgress.breakdown.modules.contributedPercent <= 25, `Módulos no debe exceder su techo de 25%`);
assert(partialProgress.breakdown.conversations.contributedPercent <= 20, `Conversaciones no debe exceder su techo de 20%`);
assert(partialProgress.breakdown.particles.contributedPercent <= 5, `Partículas no debe exceder su techo de 5%`);

console.log('--- TEST 5: Avance por nivel JLPT (N5 a N1) ---');
const n5Prog = calculateLevelProgress('N5', partialState);
assert(typeof n5Prog.percent === 'number', 'N5 percent debe ser numérico');
assert(n5Prog.percent >= 0 && n5Prog.percent <= 100, `N5 percent dentro de rango 0-100: ${n5Prog.percent}%`);
assert(emptyProgress.byLevel.N5 !== undefined, 'byLevel.N5 debe existir');
assert(emptyProgress.byLevel.N4 !== undefined, 'byLevel.N4 debe existir');
assert(emptyProgress.byLevel.N3 !== undefined, 'byLevel.N3 debe existir');

console.log('✅ Todas las pruebas de progressMetrics pasaron exitosamente!');
