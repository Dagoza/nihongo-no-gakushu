#!/usr/bin/env node
/**
 * ==============================================================================
 * NIHONGO MASTER - CLI ENTRYPOINT FOR 4-TIER E2E TESTS
 * ==============================================================================
 * Runs the comprehensive 4-Tier E2E automated test suite:
 * - Tier 1: Feature Coverage
 * - Tier 2: Boundary & Corner Cases
 * - Tier 3: Cross-Feature Interactions
 * - Tier 4: Real-World Scenarios
 * ==============================================================================
 */

import { runAllTiers } from '../tests/e2e/e2e_runner.mjs';

runAllTiers().catch(err => {
  console.error('❌ Error fatal en suite E2E:', err);
  process.exit(1);
});
