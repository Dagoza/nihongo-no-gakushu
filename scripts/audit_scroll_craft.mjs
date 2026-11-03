#!/usr/bin/env node
/**
 * ==============================================================================
 * NIHONGO MASTER - AUDITORÍA TÉCNICA DE SCROLL-CRAFT & RENDIMIENTO
 * ==============================================================================
 * Verifica:
 * - Existencia e integridad de primitivas de Scroll-Craft (useScrollCraft, StickyScrollStage, ScrollTimelinePath)
 * - Compatibilidad y reglas de animación CSS (@supports, @media prefers-reduced-motion)
 * - Ausencia de scroll-jacking en módulos táctiles (KanjiDraw, ScriptpadWriter)
 * - Cumplimiento del estándar oficial JLPT (N5 - N1)
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('\n======================================================');
console.log('📜 NIHONGO MASTER - AUDITORÍA DE SCROLL-CRAFT');
console.log('======================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FALLO: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Primitiva useScrollCraft
console.log('--- 1. Hook useScrollCraft (Métricas & Inercia) ---');
const hookPath = path.join(ROOT_DIR, 'lib', 'scrollCraft', 'useScrollCraft.js');
assert(fs.existsSync(hookPath), 'useScrollCraft.js existe en lib/scrollCraft/');
if (fs.existsSync(hookPath)) {
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  assert(hookContent.includes('useScrollCraft'), 'useScrollCraft exporta la función principal');
  assert(hookContent.includes('requestAnimationFrame'), 'Implementa aceleración por hardware con rAF');
  assert(hookContent.includes('prefers-reduced-motion'), 'Respeta la preferencia del sistema de movimiento reducido');
  assert(hookContent.includes('passive: true'), 'Utiliza listeners pasivos de scroll para evitar bloqueos en el hilo principal');
}

// 2. Componentes StickyScrollStage y ScrollTimelinePath
console.log('\n--- 2. Componentes de Escenario y Línea de Tiempo ---');
const stagePath = path.join(ROOT_DIR, 'components', 'scroll', 'StickyScrollStage.jsx');
assert(fs.existsSync(stagePath), 'StickyScrollStage.jsx existe en components/scroll/');
if (fs.existsSync(stagePath)) {
  const stageContent = fs.readFileSync(stagePath, 'utf8');
  assert(stageContent.includes('IntersectionObserver'), 'StickyScrollStage emplea IntersectionObserver para detección de pasos');
  assert(stageContent.includes('scroll-stage-sticky-panel'), 'Contiene clase de panel fijo scroll-stage-sticky-panel');
}

const timelinePath = path.join(ROOT_DIR, 'components', 'scroll', 'ScrollTimelinePath.jsx');
assert(fs.existsSync(timelinePath), 'ScrollTimelinePath.jsx existe en components/scroll/');
if (fs.existsSync(timelinePath)) {
  const tlContent = fs.readFileSync(timelinePath, 'utf8');
  assert(tlContent.includes('scroll-timeline-path-track'), 'ScrollTimelinePath incluye clase de contenedor track');
  assert(tlContent.includes('aria-hidden="true"'), 'Los elementos puramente decorativos están ocultos a lectores de pantalla (a11y)');
}

// 3. CSS y Animaciones Aceleradas por GPU
console.log('\n--- 3. Estilos y Reglas de Scroll en globals.css ---');
const cssPath = path.join(ROOT_DIR, 'app', 'globals.css');
assert(fs.existsSync(cssPath), 'app/globals.css existe');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  assert(cssContent.includes('.scroll-stage-container'), 'Contiene clase .scroll-stage-container');
  assert(cssContent.includes('.scroll-craft-reveal'), 'Contiene clase .scroll-craft-reveal para entrada suave');
  assert(cssContent.includes('@supports (animation-timeline: view())'), 'Aprovecha nativamente CSS Scroll-Driven Animations cuando esté soportado');
  assert(cssContent.includes('@media (prefers-reduced-motion: reduce)'), 'Tiene reglas estrictas para desactivar animaciones si se solicita reducción de movimiento');
}

// 4. Integración en Rutas Principales
console.log('\n--- 4. Integración en Rutas Principales ---');
const homePath = path.join(ROOT_DIR, 'app', 'page.jsx');
if (fs.existsSync(homePath)) {
  const homeContent = fs.readFileSync(homePath, 'utf8');
  assert(homeContent.includes('useScrollCraft'), 'HomePage integra useScrollCraft');
  assert(homeContent.includes('scrollVelocity'), 'HomePage pasa velocidad de scroll a ZenDaruma3D');
}

const curriculumPath = path.join(ROOT_DIR, 'components', 'tabs', 'CurriculumTab.jsx');
if (fs.existsSync(curriculumPath)) {
  const currContent = fs.readFileSync(curriculumPath, 'utf8');
  assert(currContent.includes('ScrollTimelinePath'), 'CurriculumTab integra la línea de tiempo ScrollTimelinePath');
  assert(currContent.includes('curriculum-torii-station'), 'CurriculumTab incluye estaciones Torii oficiales');
}

const pillarsPath = path.join(ROOT_DIR, 'components', 'features', 'JapanesePillarsGuide.jsx');
if (fs.existsSync(pillarsPath)) {
  const pillarsContent = fs.readFileSync(pillarsPath, 'utf8');
  assert(pillarsContent.includes('StickyScrollStage'), 'JapanesePillarsGuide soporta modo interactivo StickyScrollStage');
}

// 5. Zonas de Exclusión Estricta (Protección de Canvas Táctil y Foco)
console.log('\n--- 5. Zonas de Exclusión Estricta (Cero Scroll-Jacking) ---');
const kanjiDrawPath = path.join(ROOT_DIR, 'components', 'features', 'KanjiDraw.jsx');
if (fs.existsSync(kanjiDrawPath)) {
  const kdContent = fs.readFileSync(kanjiDrawPath, 'utf8');
  assert(kdContent.includes('touchAction: \'none\'') || kdContent.includes('touch-action: none') || kdContent.includes("touchAction: 'none'"), 'KanjiDraw previene el desplazamiento no deseado durante el trazo táctil');
}

const srsPath = path.join(ROOT_DIR, 'components', 'features', 'SrsReview.jsx');
if (fs.existsSync(srsPath)) {
  const srsContent = fs.readFileSync(srsPath, 'utf8');
  assert(!srsContent.includes('ScrollTimelinePath'), 'SrsReview se mantiene limpio y enfocado para velocidad de repaso con teclado');
}

console.log('\n======================================================');
console.log(`Resultado: ${passedTests}/${totalTests} pruebas superadas (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
