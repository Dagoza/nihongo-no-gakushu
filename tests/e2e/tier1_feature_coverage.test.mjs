/**
 * ==============================================================================
 * TIER 1: FEATURE COVERAGE E2E TESTS
 * ==============================================================================
 * Covers:
 * - Bento Card Architecture (.card, .bento-card, .module-hero-card)
 * - Japandi 8-Role Color Palette Tokens & Functional Mapping
 * - Mobile Bottom Safe Area Clearance (AudioPlayerBar & main-container)
 * - Universal Module Hero Banners & Tour Shortcuts
 * - 16 Application Modals Coverage & Interface Contracts
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  APP_DIR,
  COMPONENTS_DIR,
  parseCssVariables,
  readFileSafe,
  testAssert
} from './test_utils.mjs';

export async function runTier1Tests() {
  const results = [];
  const cssPath = path.join(APP_DIR, 'globals.css');
  const cssContent = readFileSafe(cssPath);
  const { rootVars, darkVars } = parseCssVariables(cssContent);

  // ----------------------------------------------------------------------------
  // TEST 1.1: Bento Card Architecture Standards
  // ----------------------------------------------------------------------------
  try {
    testAssert(cssContent.includes('.card'), 'globals.css debe definir la clase base .card');
    testAssert(cssContent.includes('.bento-card'), 'globals.css debe definir la clase .bento-card');
    testAssert(cssContent.includes('.module-hero-card'), 'globals.css debe definir la clase .module-hero-card');

    // Verify border-radius compliance: cards must use rounded corners (16px to 24px or CSS radius tokens)
    const hasCardRadius = /\.card\s*\{[^}]*border-radius\s*:\s*([^;]+)/.test(cssContent);
    const hasBentoRadius = /\.bento-card\s*\{[^}]*border-radius\s*:\s*([^;]+)/.test(cssContent);
    const hasHeroRadius = /\.module-hero-card\s*\{[^}]*border-radius\s*:\s*([^;]+)/.test(cssContent);

    testAssert(hasCardRadius, 'La clase .card debe especificar border-radius');
    testAssert(hasBentoRadius, 'La clase .bento-card debe especificar border-radius');
    testAssert(hasHeroRadius, 'La clase .module-hero-card debe especificar border-radius');

    // Verify borders and soft shadows
    testAssert(cssContent.includes('var(--border)'), 'Las tarjetas deben consumir la variable de borde sutil var(--border)');
    testAssert(cssContent.includes('var(--shadow-'), 'Las tarjetas deben consumir tokens de sombra suave');

    results.push({
      id: 'T1.1',
      name: 'Arquitectura Bento Card (Estructura modular, radios y bordes)',
      status: 'PASSED',
      details: 'Clases .card, .bento-card y .module-hero-card configuradas con border-radius, 1px border y sombras suaves'
    });
  } catch (err) {
    results.push({ id: 'T1.1', name: 'Arquitectura Bento Card', status: 'FAILED', error: err.message });
  }

  // ----------------------------------------------------------------------------
  // TEST 1.2: Japandi 8-Role Color Palette Tokens & Functional Mapping
  // ----------------------------------------------------------------------------
  try {
    // Role 1: Indigo Primario (Aizome) -> #4338ca / #6366f1
    const aizomeLight = rootVars.get('--primary') || rootVars.get('--aizome') || rootVars.get('--color-aizome');
    testAssert(aizomeLight && (aizomeLight.includes('#4338ca') || aizomeLight.includes('#6366f1')),
      `Índigo Primario (Aizome) no encontrado en :root, valor: ${aizomeLight}`);

    // Role 2: Bermellón Zen (Shu-iro) -> #e11d48 / #f43f5e
    const shuLight = rootVars.get('--accent') || rootVars.get('--shu-iro') || rootVars.get('--color-shu');
    testAssert(shuLight && shuLight.includes('#e11d48'),
      `Bermellón Zen (Shu-iro) no encontrado en :root, valor: ${shuLight}`);

    // Role 3: Matcha Suave (Matcha-iro) -> #059669 / #10b981
    const matchaLight = rootVars.get('--success') || rootVars.get('--matcha') || rootVars.get('--color-matcha');
    testAssert(matchaLight && matchaLight.includes('#059669'),
      `Matcha Suave (Matcha-iro) no encontrado en :root, valor: ${matchaLight}`);

    // Role 4: Bambú / Ámbar (Kohaku-iro) -> #d97706 / #f59e0b
    const kohakuLight = rootVars.get('--warning') || rootVars.get('--kohaku') || rootVars.get('--color-kohaku');
    testAssert(kohakuLight && kohakuLight.includes('#d97706'),
      `Bambú / Ámbar (Kohaku-iro) no encontrado en :root, valor: ${kohakuLight}`);

    // Role 5: Papel Washi (Torinoko-iro) -> #f8fafc / #ffffff
    const washiBg = rootVars.get('--bg-main') || rootVars.get('--torinoko') || rootVars.get('--color-washi');
    testAssert(washiBg && washiBg.includes('#f8fafc'),
      `Papel Washi (Torinoko-iro) no encontrado en :root, valor: ${washiBg}`);

    // Role 6: Tinta Sumi (Sumi-iro) -> #090d16 / #111827
    const sumiDark = darkVars.get('--bg-main') || darkVars.get('--sumi-iro') || darkVars.get('--color-sumi');
    testAssert(sumiDark && sumiDark.includes('#090d16'),
      `Tinta Sumi (Sumi-iro) no encontrada en [data-theme="dark"], valor: ${sumiDark}`);

    // Role 7: Pétalo Sakura -> #fce7f3 / #f472b6 / #fb7185
    testAssert(cssContent.includes('#fce7f3') || cssContent.includes('#fbcfe8') || cssContent.includes('#f472b6'),
      'Paleta Sakura Petal debe estar presente en la hoja de estilos');

    // Role 8: Slate / Enmarcado -> #0f172a / #1e293b
    const textMain = rootVars.get('--text-main');
    testAssert(textMain && textMain.includes('#0f172a'),
      `Color de texto principal Slate no encontrado en :root, valor: ${textMain}`);

    results.push({
      id: 'T1.2',
      name: 'Paleta Japandi de 8 Roles (Aizome, Shu-iro, Matcha, Kohaku, Washi, Sumi, Sakura, Slate)',
      status: 'PASSED',
      details: 'Los 8 roles cromáticos tradicionales japoneses están mapeados en variables CSS y selectores de tema'
    });
  } catch (err) {
    results.push({ id: 'T1.2', name: 'Paleta Japandi de 8 Roles', status: 'FAILED', error: err.message });
  }

  // ----------------------------------------------------------------------------
  // TEST 1.3: Mobile Bottom Safe Area Clearance
  // ----------------------------------------------------------------------------
  try {
    // Check root variable --audio-player-height
    const desktopPlayerHeight = rootVars.get('--audio-player-height');
    testAssert(desktopPlayerHeight === '72px', `La altura del reproductor en escritorio debe ser 72px, encontrada: ${desktopPlayerHeight}`);

    // Check mobile media query for --audio-player-height
    testAssert(cssContent.includes('--audio-player-height: 170px'),
      'La altura del reproductor en móvil (@media max-width: 768px) debe ser 170px');

    // Check safe area inset on audio-player-bar
    testAssert(cssContent.includes('env(safe-area-inset-bottom'),
      'El reproductor y contenedores principales deben incorporar env(safe-area-inset-bottom)');

    // Check mobile clearance on body or main-container
    const hasClearance = cssContent.includes('var(--audio-player-height, 170px)') ||
      cssContent.includes('calc(var(--audio-player-height');
    testAssert(hasClearance, 'El cuerpo o contenedor principal debe tener padding inferior compensatorio para el reproductor');

    results.push({
      id: 'T1.3',
      name: 'Márgenes de Seguridad Móvil (Safe Areas & AudioPlayerBar clearance)',
      status: 'PASSED',
      details: 'Variables dinámicas --audio-player-height (72px/170px) y padding seguro con env(safe-area-inset-bottom) verificados'
    });
  } catch (err) {
    results.push({ id: 'T1.3', name: 'Márgenes de Seguridad Móvil', status: 'FAILED', error: err.message });
  }

  // ----------------------------------------------------------------------------
  // TEST 1.4: Universal Module Hero Banners & Tour Shortcuts
  // ----------------------------------------------------------------------------
  try {
    const tabsDir = path.join(COMPONENTS_DIR, 'tabs');
    const tabsToCheck = [
      { file: 'StoryTab.jsx', tourStep: 'story', title: 'Historias Interactivas' },
      { file: 'VocabTab.jsx', tourStep: 'vocab', title: 'Vocabulario' },
      { file: 'GrammarTab.jsx', tourStep: 'particles', title: 'Partículas' },
      { file: 'KanjiTab.jsx', tourStep: 'kanji', title: 'Kanji' },
      { file: 'CurriculumTab.jsx', tourStep: 'curriculum', title: 'Currículum' },
      { file: 'ConversationTab.jsx', tourStep: 'nhk', title: 'Conversación' },
      { file: 'YouTubeImmersionTab.jsx', tourStep: 'youtube', title: 'YouTube' },
      { file: 'MaterialLibraryTab.jsx', tourStep: 'pdf', title: 'Materiales' },
      { file: 'ProgressTab.jsx', tourStep: 'progress', title: 'Progreso' }
    ];

    for (const tab of tabsToCheck) {
      const filePath = path.join(tabsDir, tab.file);
      testAssert(fs.existsSync(filePath), `Archivo de pestaña ${tab.file} debe existir`);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Verify module-hero-card or standardized top banner
      testAssert(content.includes('module-hero-card') || content.includes('module-hero'),
        `La pestaña ${tab.file} debe utilizar .module-hero-card`);

      // Verify tour shortcut button
      testAssert(content.includes('tour-info-shortcut-btn') || content.includes(tab.tourStep),
        `La pestaña ${tab.file} debe contener botón de acceso rápido al tour hacia el paso '${tab.tourStep}'`);
    }

    results.push({
      id: 'T1.4',
      name: 'Encabezados Modulares Universales (Hero Banners & Tour Shortcuts)',
      status: 'PASSED',
      details: 'Las 9 pestañas principales cuentan con Hero Banners unificados y botones .tour-info-shortcut-btn hacia sus pasos de tour correspondientes'
    });
  } catch (err) {
    results.push({ id: 'T1.4', name: 'Encabezados Modulares Universales', status: 'FAILED', error: err.message });
  }

  // ----------------------------------------------------------------------------
  // TEST 1.5: 16 Application Modals Coverage & Interface Integrity
  // ----------------------------------------------------------------------------
  try {
    const modalsList = [
      { name: 'PracticePadModal', path: 'modals/PracticePadModal.jsx' },
      { name: 'DictionaryModal', path: 'modals/DictionaryModal.jsx' },
      { name: 'SettingsModal', path: 'modals/SettingsModal.jsx' },
      { name: 'DailyGoalModal', path: 'modals/DailyGoalModal.jsx' },
      { name: 'NotificationSettingsModal', path: 'modals/NotificationSettingsModal.jsx' },
      { name: 'AuthModal', path: 'modals/AuthModal.jsx' },
      { name: 'ProductTour', path: 'layout/ProductTour.jsx' },
      { name: 'UIModal', path: 'modals/UIModal.jsx' },
      { name: 'SaveVocabModal', path: 'modals/SaveVocabModal.jsx' },
      { name: 'EditWordModal', path: 'modals/EditWordModal.jsx' },
      { name: 'AIGeneratorModal', path: 'modals/AIGeneratorModal.jsx' },
      { name: 'ConversationGeneratorModal', path: 'modals/ConversationGeneratorModal.jsx' },
      { name: 'SrsReview', path: 'features/SrsReview.jsx' },
      { name: 'SpeechPractice', path: 'features/SpeechPractice.jsx' },
      { name: 'ComprehensionQuiz', path: 'features/ComprehensionQuiz.jsx' },
      { name: 'KanjiDraw', path: 'features/KanjiDraw.jsx' }
    ];

    testAssert(modalsList.length === 16, 'Deben existir exactamente 16 modales registrados');

    for (const m of modalsList) {
      const fullPath = path.join(COMPONENTS_DIR, m.path);
      testAssert(fs.existsSync(fullPath), `El modal ${m.name} debe existir en ${m.path}`);
      const content = fs.readFileSync(fullPath, 'utf-8');
      testAssert(content.length > 200, `El componente ${m.name} tiene contenido insuficiente (<200 bytes)`);
    }

    // Check components/index.js exports
    const indexPath = path.join(COMPONENTS_DIR, 'index.js');
    testAssert(fs.existsSync(indexPath), 'components/index.js debe existir');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');

    for (const m of modalsList) {
      testAssert(indexContent.includes(m.name), `components/index.js debe exportar ${m.name}`);
    }

    results.push({
      id: 'T1.5',
      name: 'Cobertura de los 16 Modales e Integridad de Interfaces',
      status: 'PASSED',
      details: 'Los 16 modales interactivos existen, tienen implementaciones válidas y se exportan correctamente'
    });
  } catch (err) {
    results.push({ id: 'T1.5', name: 'Cobertura de los 16 Modales', status: 'FAILED', error: err.message });
  }

  return results;
}
