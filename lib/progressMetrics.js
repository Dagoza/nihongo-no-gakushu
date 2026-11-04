/**
 * Métrica Central de Progreso Ponderado con Techos de Completación (Mastery Ceilings)
 * 
 * Reemplaza el cálculo arcade lineal (Math.floor(xp / 100) + 1) por un modelo pedagógico
 * de 0% a 100% que premia armónicamente el uso aplicado de la lengua (conversaciones,
 * historias y caligrafía motora) junto con la estructura troncal y el léxico.
 */

import curriculumData from '../data/curriculum.json' with { type: 'json' };
import nhkLessonsData from '../data/nhk_lessons.json' with { type: 'json' };
import irodoriDialoguesData from '../data/irodori_dialogues.json' with { type: 'json' };
import storiesData from '../data/stories.json' with { type: 'json' };
import scriptpadUnitsData from '../data/scriptpad_units.json' with { type: 'json' };
import jlptKanjiCatalog from '../data/jlpt_kanji_catalog.json' with { type: 'json' };
import vocabularyData from '../data/vocabulary.json' with { type: 'json' };
import particlesData from '../data/particles.json' with { type: 'json' };

/**
 * Ponderaciones oficiales (Suma estricta: 100%)
 * 50% Habilidades Aplicadas (Conversaciones 20% + Historias 15% + Scriptpad 15%)
 * 30% Estructura y Método (Módulos 25% + Partículas 5%)
 * 20% Léxico y Caracteres (Kanjis 10% + Vocabulario 10%)
 */
export const WEIGHTS = {
  modules: 25,
  conversations: 20,
  stories: 15,
  scriptpad: 15,
  kanji: 10,
  vocab: 10,
  particles: 5
};

export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

/**
 * Total de lecciones en Scriptpad temático
 */
const TOTAL_SCRIPTPAD_LESSONS = (scriptpadUnitsData || []).reduce(
  (acc, u) => acc + (u.lessons || []).length, 
  0
) || 95;

/**
 * Catálogo consolidado de Kanjis por nivel
 */
const ALL_KANJIS_SET = new Set([
  ...(jlptKanjiCatalog.N5 || []),
  ...(jlptKanjiCatalog.N4 || []),
  ...(jlptKanjiCatalog.N3 || []),
  ...(jlptKanjiCatalog.N2 || []),
  ...(jlptKanjiCatalog.N1 || [])
]);

/**
 * Formatea cantidades de XP de forma compacta (ej: 61455 -> 61.5k XP)
 */
export function formatXpCompact(xp = 0) {
  const num = Number(xp) || 0;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M XP`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k XP`;
  }
  return `${num} XP`;
}

/**
 * Función genérica de cálculo de progreso acotado por techo
 */
function calculateSection(completedCount, totalCount, weight) {
  const safeTotal = Math.max(1, Number(totalCount) || 1);
  const safeCompleted = Math.max(0, Math.min(safeTotal, Number(completedCount) || 0));
  const rawRatio = safeCompleted / safeTotal;
  const rawPercent = Math.min(100, Math.round(rawRatio * 1000) / 10);
  const contributedPercent = Math.min(weight, Math.round(rawRatio * weight * 10) / 10);

  return {
    completed: safeCompleted,
    total: safeTotal,
    rawPercent,
    weight,
    contributedPercent
  };
}

/**
 * Calcula el progreso global ponderado (0 - 100%) y el avance por nivel JLPT
 */
export function calculateOverallProgress(appState = {}) {
  const safeState = appState || {};

  // 1. Módulos del Currículum (Peso: 25%)
  const completedStepsMap = safeState.completedSteps || {};
  const completedModulesCount = (curriculumData || []).filter(
    mod => Boolean(completedStepsMap[mod.step] || completedStepsMap[String(mod.step)])
  ).length;
  const modulesProgress = calculateSection(completedModulesCount, (curriculumData || []).length || 37, WEIGHTS.modules);

  // 2. Conversaciones (Peso: 20%)
  const completedConversationsMap = safeState.completedConversations || {};
  const allConversations = [
    ...(nhkLessonsData || []).map(l => ({ ...l, convId: l.id || `nhk_${l.lessonNum}` })),
    ...(irodoriDialoguesData || []).map(d => ({ ...d, convId: d.id || `iro_${d.lessonNum}` }))
  ];
  const completedConversationsCount = allConversations.filter(
    c => Boolean(completedConversationsMap[c.id] || completedConversationsMap[c.convId] || (c.lessonNum && completedConversationsMap[c.lessonNum]))
  ).length;
  const conversationsProgress = calculateSection(completedConversationsCount, allConversations.length || 70, WEIGHTS.conversations);

  // 3. Historias (Peso: 15%)
  const completedStoriesMap = safeState.completedStories || {};
  const completedSentencesMap = safeState.completedSentences || {};
  const completedStoriesCount = (storiesData || []).filter(s => {
    if (completedStoriesMap[s.id]) return true;
    if (s.sentences && s.sentences.length > 0) {
      return s.sentences.every(sent => Boolean(completedSentencesMap[sent.id]));
    }
    return false;
  }).length;
  const storiesProgress = calculateSection(completedStoriesCount, (storiesData || []).length || 10, WEIGHTS.stories);

  // 4. Scriptpad (Peso: 15%)
  const completedScriptpadLessonsMap = safeState.completedScriptpadLessons || {};
  const completedScriptpadCount = Object.keys(completedScriptpadLessonsMap).filter(
    k => Boolean(completedScriptpadLessonsMap[k])
  ).length;
  const scriptpadProgress = calculateSection(completedScriptpadCount, TOTAL_SCRIPTPAD_LESSONS, WEIGHTS.scriptpad);

  // 5. Kanjis (Peso: 10%)
  const masteredKanjiMap = safeState.masteredKanji || {};
  let masteredKanjisCount = 0;
  ALL_KANJIS_SET.forEach(char => {
    if (masteredKanjiMap[char]) masteredKanjisCount++;
  });
  const kanjiProgress = calculateSection(masteredKanjisCount, ALL_KANJIS_SET.size || 2213, WEIGHTS.kanji);

  // 6. Vocabulario (Peso: 10%)
  const masteredVocabMap = safeState.masteredVocab || {};
  const completedVocabCount = (vocabularyData || []).filter(v => {
    const key = v.id || v.kanji || v.hiragana;
    return Boolean(masteredVocabMap[key] || (v.id && masteredVocabMap[v.id]) || (v.kanji && masteredVocabMap[v.kanji]));
  }).length;
  const vocabProgress = calculateSection(completedVocabCount, (vocabularyData || []).length || 1687, WEIGHTS.vocab);

  // 7. Partículas (Peso: 5%)
  const masteredParticlesMap = safeState.masteredParticles || {};
  const completedParticlesCount = (particlesData || []).filter(p => {
    return Boolean(masteredParticlesMap[p.id] || (p.particle && masteredParticlesMap[p.particle]));
  }).length;
  const particlesProgress = calculateSection(completedParticlesCount, (particlesData || []).length || 99, WEIGHTS.particles);

  // Suma ponderada global (Techo estricto: 100%)
  const rawSum = 
    modulesProgress.contributedPercent +
    conversationsProgress.contributedPercent +
    storiesProgress.contributedPercent +
    scriptpadProgress.contributedPercent +
    kanjiProgress.contributedPercent +
    vocabProgress.contributedPercent +
    particlesProgress.contributedPercent;

  const overallPercent = Math.min(100, Math.round(rawSum * 10) / 10);
  const overallInteger = Math.min(100, Math.round(overallPercent));

  // Desglose por niveles JLPT (N5, N4, N3, N2, N1)
  const byLevel = {};
  JLPT_LEVELS.forEach(lvl => {
    byLevel[lvl] = calculateLevelProgress(lvl, safeState);
  });

  return {
    overallPercent,
    overallInteger,
    xp: safeState.xp || 0,
    xpFormatted: formatXpCompact(safeState.xp || 0),
    breakdown: {
      modules: { ...modulesProgress, label: 'Módulos Curriculares', icon: '🗺️', desc: 'Ruta de aprendizaje paso a paso' },
      conversations: { ...conversationsProgress, label: 'Conversaciones', icon: '📻', desc: 'Diálogos de audio y listening' },
      stories: { ...storiesProgress, label: 'Historias y Lectura', icon: '📖', desc: 'Lectura graduada y comprensión' },
      scriptpad: { ...scriptpadProgress, label: 'Scriptpad (Escritura)', icon: '✍️', desc: 'Caligrafía y trazo a mano' },
      kanji: { ...kanjiProgress, label: 'Kanjis (N5 a N1)', icon: '漢', desc: 'Ideogramas del catálogo' },
      vocab: { ...vocabProgress, label: 'Vocabulario', icon: '📚', desc: 'Léxico oficial dominado' },
      particles: { ...particlesProgress, label: 'Partículas & Gramática', icon: '🎯', desc: 'Estructuras y conectores' }
    },
    byLevel
  };
}

/**
 * Calcula el avance y porcentaje de completación de un nivel JLPT específico
 */
export function calculateLevelProgress(level = 'N5', appState = {}) {
  const normLvl = (level || 'N5').toUpperCase();
  const safeState = appState || {};

  // 1. Módulos del nivel
  const levelModules = (curriculumData || []).filter(m => (m.level || 'N5').toUpperCase() === normLvl);
  const completedStepsMap = safeState.completedSteps || {};
  const compModules = levelModules.filter(m => Boolean(completedStepsMap[m.step] || completedStepsMap[String(m.step)])).length;

  // 2. Conversaciones del nivel
  const levelConvs = [
    ...(nhkLessonsData || []).filter(l => (l.level || 'N5').toUpperCase() === normLvl),
    ...(irodoriDialoguesData || []).filter(d => (d.level || 'N5').toUpperCase() === normLvl)
  ];
  const completedConversationsMap = safeState.completedConversations || {};
  const compConvs = levelConvs.filter(c => Boolean(completedConversationsMap[c.id] || (c.lessonNum && completedConversationsMap[c.lessonNum]))).length;

  // 3. Historias del nivel
  const levelStories = (storiesData || []).filter(s => (s.level || 'N5').toUpperCase() === normLvl);
  const completedStoriesMap = safeState.completedStories || {};
  const completedSentencesMap = safeState.completedSentences || {};
  const compStories = levelStories.filter(s => {
    if (completedStoriesMap[s.id]) return true;
    if (s.sentences && s.sentences.length > 0) {
      return s.sentences.every(sent => Boolean(completedSentencesMap[sent.id]));
    }
    return false;
  }).length;

  // 4. Scriptpad del nivel (lecciones con palabras de este nivel)
  const levelScriptpadWords = [];
  (scriptpadUnitsData || []).forEach(u => {
    (u.lessons || []).forEach(l => {
      (l.words || []).forEach(w => {
        if ((w.level || 'N5').toUpperCase() === normLvl) {
          levelScriptpadWords.push({ lessonId: l.id, wordKey: w.kanji || w.hiragana });
        }
      });
    });
  });
  const wordProg = safeState.scriptpadWordProgress || {};
  const compScriptpadWords = levelScriptpadWords.filter(w => Boolean(wordProg[w.wordKey]?.timesWritten >= 1 || wordProg[w.wordKey]?.mastered)).length;

  // 5. Kanjis del nivel
  const levelKanjis = jlptKanjiCatalog[normLvl] || [];
  const masteredKanjiMap = safeState.masteredKanji || {};
  const compKanjis = levelKanjis.filter(ch => Boolean(masteredKanjiMap[ch])).length;

  // 6. Vocabulario del nivel
  const levelVocab = (vocabularyData || []).filter(v => (v.level || 'N5').toUpperCase() === normLvl);
  const masteredVocabMap = safeState.masteredVocab || {};
  const compVocab = levelVocab.filter(v => Boolean(masteredVocabMap[v.id] || (v.kanji && masteredVocabMap[v.kanji]))).length;

  // 7. Partículas del nivel
  const levelParticles = (particlesData || []).filter(p => (p.level || 'N5').toUpperCase() === normLvl);
  const masteredParticlesMap = safeState.masteredParticles || {};
  const compParticles = levelParticles.filter(p => Boolean(masteredParticlesMap[p.id] || (p.particle && masteredParticlesMap[p.particle]))).length;

  // Ponderación dinámica basada en las secciones que existen en este nivel
  const sections = [
    { key: 'modules', completed: compModules, total: levelModules.length, weight: WEIGHTS.modules, label: 'Módulos', icon: '🗺️' },
    { key: 'conversations', completed: compConvs, total: levelConvs.length, weight: WEIGHTS.conversations, label: 'Conversaciones', icon: '📻' },
    { key: 'stories', completed: compStories, total: levelStories.length, weight: WEIGHTS.stories, label: 'Historias', icon: '📖' },
    { key: 'scriptpad', completed: compScriptpadWords, total: levelScriptpadWords.length, weight: WEIGHTS.scriptpad, label: 'Scriptpad', icon: '✍️' },
    { key: 'kanji', completed: compKanjis, total: levelKanjis.length, weight: WEIGHTS.kanji, label: 'Kanjis', icon: '漢' },
    { key: 'vocab', completed: compVocab, total: levelVocab.length, weight: WEIGHTS.vocab, label: 'Vocabulario', icon: '📚' },
    { key: 'particles', completed: compParticles, total: levelParticles.length, weight: WEIGHTS.particles, label: 'Partículas', icon: '🎯' }
  ].filter(sec => sec.total > 0);

  const totalLevelWeight = sections.reduce((acc, s) => acc + s.weight, 0) || 100;
  let levelRawScore = 0;

  const sectionDetails = {};
  sections.forEach(sec => {
    const ratio = sec.completed / sec.total;
    const normalizedWeight = (sec.weight / totalLevelWeight) * 100;
    const cont = ratio * normalizedWeight;
    levelRawScore += cont;
    sectionDetails[sec.key] = {
      completed: sec.completed,
      total: sec.total,
      percent: Math.min(100, Math.round(ratio * 1000) / 10),
      label: sec.label,
      icon: sec.icon
    };
  });

  const levelPercent = Math.min(100, Math.round(levelRawScore * 10) / 10);
  const levelInteger = Math.min(100, Math.round(levelPercent));

  return {
    level: normLvl,
    percent: levelPercent,
    integer: levelInteger,
    sections: sectionDetails
  };
}
