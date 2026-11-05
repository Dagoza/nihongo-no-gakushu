/**
 * Lógica matemática, proyecciones temporales y evaluación de inmersión para Nihongo Master
 * Basado en los principios de TheMoeWay, Donkuri, Guía Manabe y Shinobi Japanese.
 */
import { smartSegmentJapanese, extractKanjis } from './japaneseUtils.js';

/**
 * Factor de sostenibilidad predeterminado (80% del ritmo nominal)
 * Descuenta la deuda de repasos acumulada y los días ocupados de mantenimiento.
 */
export const DEFAULT_SUSTAINABILITY_FACTOR = 0.8;

/**
 * Umbral crítico de repasos vencidos que activa la compuerta Review-First
 */
export const CRITICAL_REVIEW_GATE_THRESHOLD = 80;

/**
 * Calcula la proyección temporal para alcanzar una meta de vocabulario (ej. N5: 800, N4: 1500)
 * descontando la deuda de repasos y aplicando la compuerta Review-First Gate.
 * 
 * @param {Object} options
 * @param {number} options.masteredWordsCount Palabras actualmente dominadas
 * @param {number} options.targetWordsCount Meta de palabras (800 para N5, 1500 para N4, etc.)
 * @param {number} [options.dailyPace=10] Ritmo nominal elegido (5, 10, 15 tarjetas/día)
 * @param {number} [options.sustainabilityFactor=0.8] Factor de ajuste de días reales
 * @param {number} [options.dueReviewsCount=0] Repasos vencidos acumulados
 * @param {number} [options.maxDailyReviewsThreshold=80] Límite crítico de repasos
 * @returns {Object} Proyección completa
 */
export function calculateRoadmapProjection({
  masteredWordsCount = 0,
  targetWordsCount = 800,
  dailyPace = 10,
  sustainabilityFactor = DEFAULT_SUSTAINABILITY_FACTOR,
  dueReviewsCount = 0,
  maxDailyReviewsThreshold = CRITICAL_REVIEW_GATE_THRESHOLD
} = {}) {
  const safePace = Math.max(1, Number(dailyPace) || 10);
  const safeTarget = Math.max(1, Number(targetWordsCount) || 800);
  const safeMastered = Math.max(0, Number(masteredWordsCount) || 0);
  const remainingWords = Math.max(0, safeTarget - safeMastered);

  // Estimación optimista sin imprevistos ni limpieza de cola
  const optimisticDays = Math.ceil(remainingWords / safePace);

  // Estimación realista con factor de sostenibilidad (ej. 10/día -> 8 reales/día)
  const effectiveFactor = (typeof sustainabilityFactor === 'number' && sustainabilityFactor > 0 && sustainabilityFactor <= 1)
    ? sustainabilityFactor
    : DEFAULT_SUSTAINABILITY_FACTOR;
  const effectivePace = Math.max(0.5, safePace * effectiveFactor);
  const realisticDays = Math.ceil(remainingWords / effectivePace);

  // Compuerta Review-First Gate
  const isReviewGated = dueReviewsCount > maxDailyReviewsThreshold;
  const recommendedNewCards = isReviewGated ? 0 : safePace;

  // Fechas estimadas proyectadas
  const now = new Date();
  const optimisticDate = new Date(now.getTime() + optimisticDays * 86400000);
  const realisticDate = new Date(now.getTime() + realisticDays * 86400000);

  return {
    masteredWordsCount: safeMastered,
    targetWordsCount: safeTarget,
    remainingWords,
    dailyPace: safePace,
    effectivePace: +effectivePace.toFixed(1),
    sustainabilityFactor: effectiveFactor,
    optimisticDays,
    realisticDays,
    optimisticDate,
    realisticDate,
    dueReviewsCount,
    maxDailyReviewsThreshold,
    isReviewGated,
    recommendedNewCards,
    gateReason: isReviewGated
      ? `Tienes ${dueReviewsCount} repasos vencidos (supera el umbral de ${maxDailyReviewsThreshold}). Se recomienda pausar tarjetas nuevas hoy (0 nuevas) para despejar la cola acumulada y proteger tu retención.`
      : null
  };
}

/**
 * Determina en qué fase del aprendizaje se encuentra el usuario
 * @param {number} masteredVocabCount
 * @param {number} masteredKanjiCount
 * @param {number} completedModulesCount
 */
export function getStudyPhase(masteredVocabCount = 0, masteredKanjiCount = 0, completedModulesCount = 0) {
  const v = Number(masteredVocabCount) || 0;
  const k = Number(masteredKanjiCount) || 0;

  if (v < 300) {
    return {
      phase: 1,
      name: 'Fase 1: Cimientos y Despegue',
      subtitle: 'Días 1 a 30 · Silabarios, partículas nucleares y despegue FSRS',
      targetVocab: 300,
      targetKanji: 50,
      currentVocab: v,
      currentKanji: k,
      progressPercent: Math.min(100, Math.round((v / 300) * 100)),
      color: '#6366f1'
    };
  }

  if (v < 1500) {
    return {
      phase: 2,
      name: 'Fase 2: Consolidación e Inmersión',
      subtitle: 'Meses 2 a 6 · Hitos JLPT N5 a N4, minado de oraciones 1T y lecturas graduadas',
      targetVocab: 1500,
      targetKanji: 282,
      currentVocab: v,
      currentKanji: k,
      progressPercent: Math.min(100, Math.round(((v - 300) / 1200) * 100)),
      color: '#8b5cf6'
    };
  }

  return {
    phase: 3,
    name: 'Fase 3: Expansión y Fluidez',
    subtitle: 'Meses 6 a 24+ · JLPT N3 a N1, inmersión nativa continua y comprensión auditiva pura',
    targetVocab: 3500,
    targetKanji: 650,
    currentVocab: v,
    currentKanji: k,
    progressPercent: Math.min(100, Math.round((v / 3500) * 100)),
    color: '#10b981'
  };
}

/**
 * Simulador de carga de repasos (Anti-Burnout) para las semanas 1 a 4 según ritmo diario elegido
 * @param {number} dailyPace Tarjetas nuevas por día
 */
export function calculateReviewLoadForecast(dailyPace = 10) {
  const pace = Math.max(1, Number(dailyPace) || 10);
  
  // Proyección empírica de repasos diarios esperados
  const week1Reviews = Math.round(pace * 1.5);
  const week2Reviews = Math.round(pace * 2.8);
  const week3Reviews = Math.round(pace * 4.2);
  const week4Reviews = Math.round(pace * 5.8);

  const week1Minutes = Math.round(week1Reviews * 0.25);
  const week2Minutes = Math.round(week2Reviews * 0.28);
  const week3Minutes = Math.round(week3Reviews * 0.32);
  const week4Minutes = Math.round(week4Reviews * 0.35);

  const isIntensive = pace >= 15;
  const isExtreme = pace >= 20;

  return {
    dailyPace: pace,
    weeks: [
      { week: 1, label: 'Semana 1', dailyReviews: week1Reviews, dailyMinutes: Math.max(5, week1Minutes) },
      { week: 2, label: 'Semana 2', dailyReviews: week2Reviews, dailyMinutes: Math.max(10, week2Minutes) },
      { week: 3, label: 'Semana 3', dailyReviews: week3Reviews, dailyMinutes: Math.max(15, week3Minutes) },
      { week: 4, label: 'Semana 4 (Estable)', dailyReviews: week4Reviews, dailyMinutes: Math.max(20, week4Minutes) }
    ],
    warning: isExtreme
      ? '⚠️ Alerta de Sobrecarga: 20 nuevas/día puede exigir más de 1.5 - 2 horas diarias solo en repasos acumulados para la semana 4.'
      : (isIntensive ? '⚡ Ritmo Intensivo: Mantener 15 nuevas/día requerirá sesiones de más de 45-60 min/día de repasos FSRS.' : null)
  };
}

/**
 * Evalúa el Presupuesto Balanceado de Estudio vs. Habilidad (Guía Manabe)
 * Divide la cuota entre 'Estudio Teórico/SRS' e 'Inmersión Práctica'
 */
export function calculateBalancedDailyBudget(appState = {}) {
  // Cuota de Estudio: SRS + Gramática
  const dueCount = Object.keys(appState?.srsQuestions || {}).length;
  const completedSteps = Object.keys(appState?.completedSteps || {}).length;
  const studyScore = Math.min(100, (completedSteps * 3) + Math.min(70, dueCount * 2));

  // Cuota de Habilidad: Inmersión (diálogos, historias, shadowing)
  const completedDialogues = Object.keys(appState?.completedConversations || {}).length;
  const completedStories = Object.keys(appState?.completedStories || {}).length;
  const skillScore = Math.min(100, (completedDialogues * 8) + (completedStories * 12));

  return {
    studyPercent: studyScore,
    skillPercent: skillScore,
    isBalanced: Math.abs(studyScore - skillScore) < 40,
    recommendation: studyScore > skillScore + 40
      ? '💡 Estás dedicando mucho tiempo a memorizar y poco a inmersión. Lee una historia o escucha un diálogo NHK hoy.'
      : (skillScore > studyScore + 40
        ? '💡 Buena inmersión, pero no descuides tus repasos FSRS para fijar vocabulario a largo plazo.'
        : '✨ ¡Excelente equilibrio entre Cuota de Estudio y Cuota de Inmersión!')
  };
}

/**
 * Normaliza un conjunto o mapa de vocabulario conocido por el usuario
 */
function buildKnownWordSet(masteredVocab = {}, srsQuestions = {}) {
  const set = new Set();

  if (masteredVocab && typeof masteredVocab === 'object') {
    Object.entries(masteredVocab).forEach(([k, val]) => {
      if (val) {
        set.add(String(k).trim());
      }
    });
  }

  if (srsQuestions && typeof srsQuestions === 'object') {
    Object.entries(srsQuestions).forEach(([k, card]) => {
      if (card && typeof card === 'object') {
        const reps = Number(card.reps || 0);
        const consecutive = Number(card.consecutive_reps || 0);
        if (reps > 0 && consecutive > 0) {
          const cleanKey = k.replace(/^(mined_sent_|vocab_|kanji_)/, '').trim();
          set.add(cleanKey);
          if (card.targetWord) set.add(String(card.targetWord).trim());
        }
      }
    });
  }

  return set;
}

/**
 * Evalúa si una oración es una oración ideal 1T (One Target Word / i+1)
 * para minado inteligente hacia FSRS.
 * 
 * Regla pedagógica:
 * - Si tiene exactamente 1 palabra desconocida: OPTIMAL_1T (insignia '🎯 Oración Ideal i+1')
 * - Si tiene 0 palabras desconocidas: REVIEW_ONLY
 * - Si tiene >1 palabras desconocidas: TOO_DENSE
 * 
 * @param {string|Array} sentence Oración en japonés o array de tokens ya procesados
 * @param {Object} [masteredVocab={}] Estado de palabras dominadas
 * @param {Object} [srsQuestions={}] Estado de preguntas/tarjetas FSRS
 * @returns {Object}
 */
export function evaluateSentenceMiningScore(sentence = '', masteredVocab = {}, srsQuestions = {}) {
  const knownSet = buildKnownWordSet(masteredVocab, srsQuestions);

  let tokens = [];
  if (Array.isArray(sentence)) {
    tokens = sentence;
  } else if (typeof sentence === 'string') {
    tokens = smartSegmentJapanese(sentence);
  }

  // Filtrar tokens de contenido (palabras relevantes, no partículas puras sueltas)
  const ignoredParticles = new Set(['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'から', 'まで', 'より', 'の', 'ね', 'よ', 'か', 'や', 'です', 'だ']);
  
  const contentTokens = tokens.filter(tok => {
    const txt = (tok.text || tok.word || tok.form || '').trim();
    if (!txt) return false;
    // Si es pura partícula común no lo contamos como palabra de contenido
    if (ignoredParticles.has(txt) && (!tok.type || tok.type === 'particle')) {
      return false;
    }
    return true;
  });

  const unknownTokens = [];
  const knownTokens = [];

  contentTokens.forEach(tok => {
    const txt = (tok.text || tok.word || tok.form || '').trim();
    const entryKanji = tok.entry?.kanji || '';
    const entryKana = tok.entry?.hiragana || tok.entry?.kana || '';

    const isKnown = knownSet.has(txt) ||
      (entryKanji && knownSet.has(entryKanji)) ||
      (entryKana && knownSet.has(entryKana));

    if (isKnown) {
      knownTokens.push(tok);
    } else {
      unknownTokens.push(tok);
    }
  });

  const unknownCount = unknownTokens.length;
  const totalCount = contentTokens.length;

  if (unknownCount === 1) {
    const target = unknownTokens[0];
    const targetWord = (target.text || target.word || target.form || '').trim();
    return {
      classification: 'OPTIMAL_1T',
      isOptimal1T: true,
      targetWord,
      targetToken: target,
      unknownCount: 1,
      totalWords: totalCount,
      badge: '🎯 Oración Ideal i+1',
      badgeClass: 'badge-optimal-1t',
      reason: `Presupuesto cognitivo perfecto: 1 sola palabra desconocida ("${targetWord}"). Ideal para minar a FSRS.`
    };
  }

  if (unknownCount === 0) {
    return {
      classification: 'REVIEW_ONLY',
      isOptimal1T: false,
      targetWord: null,
      unknownCount: 0,
      totalWords: totalCount,
      badge: '✓ 100% Conocida',
      badgeClass: 'badge-known-sentence',
      reason: 'Todas las palabras de esta oración ya están en tu inventario activo.'
    };
  }

  // Multi-target (>1 desconocidas)
  const firstTarget = (unknownTokens[0]?.text || unknownTokens[0]?.word || '').trim();
  return {
    classification: 'TOO_DENSE',
    isOptimal1T: false,
    targetWord: firstTarget,
    unknownCount,
    totalWords: totalCount,
    unknownWords: unknownTokens.map(t => (t.text || t.word || '').trim()),
    badge: '⚠️ Múltiples Desconocidas',
    badgeClass: 'badge-dense-sentence',
    reason: `Contiene ${unknownCount} palabras desconocidas. Puede sobrecargar la memoria si se mina como tarjeta única.`
  };
}

/**
 * Calcula el Medidor de Cobertura Pre-Inmersión (% conocido) para historias y diálogos
 * Clasifica según el estándar de Input Comprensible (90% - 98%)
 * 
 * @param {string|Array} content Texto completo o lista de oraciones/tokens
 * @param {Object} [masteredVocab={}]
 * @param {Object} [srsQuestions={}]
 * @returns {Object}
 */
export function calculateImmersionCoverage(content = '', masteredVocab = {}, srsQuestions = {}) {
  const knownSet = buildKnownWordSet(masteredVocab, srsQuestions);

  let tokens = [];
  if (Array.isArray(content) && content.length > 0 && typeof content[0] === 'object' && (content[0].text || content[0].word)) {
    tokens = content;
  } else {
    let fullText = '';
    if (Array.isArray(content)) {
      fullText = content.map(item => (typeof item === 'string' ? item : (item.japanese || item.jp || item.text || ''))).join(' ');
    } else {
      fullText = String(content || '');
    }
    tokens = smartSegmentJapanese(fullText);
  }
  if (!tokens || tokens.length === 0) {
    return {
      coveragePercent: 100,
      knownCount: 0,
      totalWords: 0,
      tier: 'OPTIMAL_INPUT',
      label: 'Zona Óptima (Comprensible i+1)',
      color: 'var(--success, #10b981)',
      description: 'Texto accesible para tu perfil de vocabulario.'
    };
  }

  let totalWords = 0;
  let knownWords = 0;

  tokens.forEach(tok => {
    const txt = (tok.text || tok.word || '').trim();
    if (!txt) return;
    totalWords++;
    const entryKanji = tok.entry?.kanji || '';
    const entryKana = tok.entry?.hiragana || tok.entry?.kana || '';

    const isKnown = knownSet.has(txt) ||
      (entryKanji && knownSet.has(entryKanji)) ||
      (entryKana && knownSet.has(entryKana));

    if (isKnown) {
      knownWords++;
    }
  });

  const coveragePercent = totalWords > 0 ? Math.round((knownWords / totalWords) * 100) : 100;

  // Clasificación pedagógica moderna (TheMoeWay / Krashen i+1)
  if (coveragePercent >= 90 && coveragePercent <= 98) {
    return {
      coveragePercent,
      knownCount: knownWords,
      totalWords,
      tier: 'OPTIMAL_INPUT',
      label: 'Zona Óptima (Comprensible i+1)',
      badge: '🎯 Zona Óptima',
      color: 'var(--success, #10b981)',
      description: `Conoces el ${coveragePercent}% de las palabras. Nivel ideal para adquisición natural sin frustración.`
    };
  }

  if (coveragePercent > 98) {
    return {
      coveragePercent,
      knownCount: knownWords,
      totalWords,
      tier: 'EASY_REVIEW',
      label: 'Lectura Fluida / Repaso',
      badge: '⚡ Fluido',
      color: '#3b82f6',
      description: `Conoces el ${coveragePercent}% de las palabras. Excelente para velocidad de lectura y consolidación.`
    };
  }

  return {
    coveragePercent,
    knownCount: knownWords,
    totalWords,
    tier: 'CHALLENGE',
    label: 'Zona de Desafío (Ruido Potencial)',
    badge: '⚠️ Desafío',
    color: '#f59e0b',
    description: `Conoces el ${coveragePercent}%. Puede presentar fricción léxica; activa el furigana inteligente para apoyarte.`
  };
}
