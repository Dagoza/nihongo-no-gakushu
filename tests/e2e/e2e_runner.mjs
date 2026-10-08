/**
 * ==============================================================================
 * NIHONGO MASTER - 4-TIER E2E TEST SUITE RUNNER
 * ==============================================================================
 * Orchestrates:
 * - Tier 1: Feature Coverage (Bento cards, Japandi tokens, safe areas, tour shortcuts, 16 modals)
 * - Tier 2: Boundary & Corner Cases (Dark contrast WCAG AA, furigana line-height, mobile 390px, JLPT badges)
 * - Tier 3: Cross-Feature Interactions (Dark mode + Audio player bar + Modal interaction)
 * - Tier 4: Real-World Scenarios (Full learning journeys, quiz sessions, SRS reviews)
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR, REPORTS_DIR } from './test_utils.mjs';
import { runTier1Tests } from './tier1_feature_coverage.test.mjs';
import { runTier2Tests } from './tier2_boundary_corner.test.mjs';
import { runTier3Tests } from './tier3_cross_feature.test.mjs';
import { runTier4Tests } from './tier4_real_world.test.mjs';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const match = args.find(a => a.startsWith(`--${name}=`));
  if (match) return match.split('=')[1];
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return fallback;
};
const hasFlag = (name) => args.includes(`--${name}`);

const TARGET_TIER = getArg('tier', 'all');
const IS_JSON = hasFlag('json');
const WRITE_REPORT = hasFlag('report') || true;

export async function runAllTiers() {
  const startTime = Date.now();
  console.log('\n======================================================');
  console.log('🇯🇵  NIHONGO MASTER - SUITE AUTOMATIZADA E2E (4 TIERS)');
  console.log('======================================================\n');

  const allResults = [];
  const tiersToRun = [];

  if (TARGET_TIER === 'all' || TARGET_TIER === '1') {
    tiersToRun.push({ tier: 1, name: 'Tier 1: Feature Coverage', fn: runTier1Tests });
  }
  if (TARGET_TIER === 'all' || TARGET_TIER === '2') {
    tiersToRun.push({ tier: 2, name: 'Tier 2: Boundary & Corner Cases', fn: runTier2Tests });
  }
  if (TARGET_TIER === 'all' || TARGET_TIER === '3') {
    tiersToRun.push({ tier: 3, name: 'Tier 3: Cross-Feature Interactions', fn: runTier3Tests });
  }
  if (TARGET_TIER === 'all' || TARGET_TIER === '4') {
    tiersToRun.push({ tier: 4, name: 'Tier 4: Real-World Scenarios', fn: runTier4Tests });
  }

  for (const t of tiersToRun) {
    console.log(`--- ${t.name.toUpperCase()} ---`);
    const tierResults = await t.fn();
    for (const r of tierResults) {
      if (r.status === 'PASSED') {
        console.log(`  ✓ [${r.id}] ${r.name}`);
        if (r.details) console.log(`      ${r.details}`);
      } else {
        console.error(`  ✗ [${r.id}] ${r.name}`);
        if (r.error) console.error(`      Error: ${r.error}`);
      }
      allResults.push({ ...r, tier: t.tier });
    }
    console.log('');
  }

  const durationMs = Date.now() - startTime;
  const total = allResults.length;
  const passed = allResults.filter(r => r.status === 'PASSED').length;
  const failed = allResults.filter(r => r.status === 'FAILED').length;

  console.log('======================================================');
  console.log(`RESUMEN E2E: ${passed}/${total} pruebas superadas (${((passed / total) * 100).toFixed(0)}%) en ${durationMs}ms`);
  if (failed === 0) {
    console.log('ESTADO: ✅ TODAS LAS PRUEBAS E2E SUPERADAS CON ÉXITO');
  } else {
    console.log(`ESTADO: ❌ ${failed} PRUEBAS FALLIDAS`);
  }
  console.log('======================================================\n');

  const summary = {
    timestamp: new Date().toISOString(),
    durationMs,
    total,
    passed,
    failed,
    overallStatus: failed === 0 ? 'PASSED' : 'FAILED',
    results: allResults
  };

  // Ensure reports directory exists
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const jsonPath = path.join(REPORTS_DIR, 'e2e_summary.json');
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`✓ Resumen E2E exportado a: ${path.relative(ROOT_DIR, jsonPath)}`);

  if (IS_JSON) {
    console.log(JSON.stringify(summary));
  }

  if (failed > 0) {
    process.exitCode = 1;
  }

  return summary;
}

if (process.argv[1] && process.argv[1].endsWith('e2e_runner.mjs')) {
  runAllTiers().catch(err => {
    console.error('Error fatal ejecutando suite E2E:', err);
    process.exit(1);
  });
}
