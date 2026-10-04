import { fsrs, createEmptyCard, Rating, State } from 'ts-fsrs';

const f = fsrs({
  maximum_interval: 36500,
});

export const FSRSState = {
  NEW: State.New,
  LEARNING: State.Learning,
  REVIEW: State.Review,
  RELEARNING: State.Relearning
};

export const SRSRating = {
  AGAIN: Rating.Again,
  HARD: Rating.Hard,
  GOOD: Rating.Good,
  EASY: Rating.Easy
};

export function getNewCard() {
  return createEmptyCard();
}

/**
 * Procesa la calificación de una tarjeta y devuelve la nueva tarjeta actualizada
 * @param {Object} card Tarjeta actual de FSRS
 * @param {number} rating Calificación (Rating.Again, Hard, Good, Easy)
 * @returns {Object} La nueva tarjeta
 */
export function reviewCard(card, rating) {
  const now = new Date();
  
  // ts-fsrs a veces maneja las fechas como Date object, necesitamos asegurar que sea Date.
  const currentCard = {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined
  };

  const schedulingCards = f.repeat(currentCard, now);
  // schedulingCards contiene { [Rating.Again]: RecordLog, [Rating.Hard]: RecordLog, ... }
  // RecordLog tiene { card: Card, log: ReviewLog }
  
  const recordLog = schedulingCards[rating];
  return recordLog.card;
}

export function isDue(card) {
  if (!card) return true;
  // Si es un booleano antiguo (true/false), se considera elegible para migración a FSRS
  if (typeof card === 'boolean') return true;
  if (!card.due) return true;
  const now = new Date();
  const dueDate = new Date(card.due);
  return now >= dueDate;
}

/**
 * Obtiene la tarjeta FSRS válida para cualquier entidad (pregunta, kanji, vocabulario, partícula)
 * @param {Object|boolean|null|undefined} cardData
 * @returns {Object} FSRS Card
 */
export function ensureFsrsCard(cardData) {
  if (cardData && typeof cardData === 'object' && cardData.due) {
    return cardData;
  }
  return getNewCard();
}

/**
 * Procesa la calificación de una pregunta o ejercicio y retorna el nuevo estado
 * @param {Object|null} currentCard Tarjeta FSRS previa de la pregunta (o null)
 * @param {number} rating Rating FSRS (Again, Hard, Good, Easy)
 * @returns {Object} Nueva tarjeta FSRS
 */
export function reviewQuestionCard(currentCard, rating) {
  const baseCard = ensureFsrsCard(currentCard);
  return reviewCard(baseCard, rating);
}

/**
 * Retorna estimaciones legibles de intervalo de repaso para cada calificación FSRS
 * @param {Object} [card]
 * @returns {{ [key: number]: string }}
 */
export function getIntervalPreviews(card) {
  const baseCard = (card && typeof card === 'object' && card.due) 
    ? card 
    : getNewCard();
    
  const now = new Date();
  const currentCard = {
    ...baseCard,
    due: new Date(baseCard.due),
    last_review: baseCard.last_review ? new Date(baseCard.last_review) : undefined
  };

  try {
    const scheduling = f.repeat(currentCard, now);
    
    const formatInterval = (due) => {
      const diffMs = new Date(due).getTime() - now.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));
      if (diffMins < 60) return `< ${Math.max(1, diffMins)}m`;
      const diffHours = Math.round(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h`;
      const diffDays = Math.round(diffHours / 24);
      if (diffDays < 30) return `${diffDays}d`;
      const diffMonths = Math.round(diffDays / 30);
      return `${diffMonths}m`;
    };

    return {
      [SRSRating.AGAIN]: formatInterval(scheduling[Rating.Again].card.due),
      [SRSRating.HARD]: formatInterval(scheduling[Rating.Hard].card.due),
      [SRSRating.GOOD]: formatInterval(scheduling[Rating.Good].card.due),
      [SRSRating.EASY]: formatInterval(scheduling[Rating.Easy].card.due),
    };
  } catch (err) {
    return {
      [SRSRating.AGAIN]: '< 10m',
      [SRSRating.HARD]: '1d',
      [SRSRating.GOOD]: '3d',
      [SRSRating.EASY]: '7d',
    };
  }
}

/**
 * Cuenta cuántos elementos están pendientes de repaso (due) por categoría
 * @param {Object} appState
 * @returns {{ vocab: number, kanji: number, particles: number, questions: number, total: number }}
 */
export function getDueCounts(appState = {}) {
  const countDueInMap = (mapObj) => {
    if (!mapObj || typeof mapObj !== 'object') return 0;
    return Object.values(mapObj).filter(card => {
      if (!card) return false;
      return isDue(card);
    }).length;
  };

  const vocab = countDueInMap(appState.masteredVocab);
  const kanji = countDueInMap(appState.masteredKanji);
  const particles = countDueInMap(appState.masteredParticles);
  const questions = countDueInMap(appState.srsQuestions);

  return {
    vocab,
    kanji,
    particles,
    questions,
    total: vocab + kanji + particles + questions
  };
}

/**
 * Calcula la probabilidad estimada de recuerdo (Retrievability R) en tiempo real
 * @param {Object} card
 * @param {Date} [now]
 * @returns {{ raw: number, percent: number, formatted: string }}
 */
export function computeCardRetrievability(card, now = new Date()) {
  if (!card || typeof card !== 'object' || !card.due) {
    return { raw: 0, percent: 0, formatted: '0%' };
  }
  if (card.state === State.New || !card.last_review || card.reps === 0) {
    return { raw: 0, percent: 0, formatted: '0%' };
  }
  try {
    const raw = f.get_retrievability(card, now, false);
    const num = typeof raw === 'number' && !isNaN(raw) ? Math.min(1, Math.max(0, raw)) : 0;
    const percent = Math.round(num * 1000) / 10;
    return {
      raw: num,
      percent,
      formatted: `${percent.toFixed(1)}%`
    };
  } catch (e) {
    return { raw: 0, percent: 0, formatted: '0%' };
  }
}

/**
 * Retorna metadatos legibles y colores para el estado FSRS
 * @param {number} state
 * @returns {{ id: string, code: number, name: string, color: string, bg: string }}
 */
export function getCardStateInfo(state) {
  switch (Number(state)) {
    case State.New:
      return { id: 'new', code: 0, name: 'Nueva', color: 'var(--primary, #6366f1)', bg: 'rgba(99, 102, 241, 0.12)' };
    case State.Learning:
      return { id: 'learning', code: 1, name: 'Aprendizaje', color: 'var(--accent, #f59e0b)', bg: 'rgba(245, 158, 11, 0.12)' };
    case State.Review:
      return { id: 'review', code: 2, name: 'En Repaso', color: 'var(--success, #10b981)', bg: 'rgba(16, 185, 129, 0.12)' };
    case State.Relearning:
      return { id: 'relearning', code: 3, name: 'Reaprendizaje', color: 'var(--danger, #ef4444)', bg: 'rgba(239, 68, 68, 0.12)' };
    default:
      return { id: 'new', code: 0, name: 'Nueva', color: 'var(--primary, #6366f1)', bg: 'rgba(99, 102, 241, 0.12)' };
  }
}

/**
 * Determina si una tarjeta es un 'Leech' (punto débil con fallos reiterados)
 * @param {Object} card
 * @returns {boolean}
 */
export function isLeech(card) {
  if (!card || typeof card !== 'object') return false;
  const lapses = Number(card.lapses || 0);
  const diff = Number(card.difficulty || 0);
  return lapses >= 2 || (lapses >= 1 && diff >= 7.5);
}

/**
 * Genera el resumen analítico general y por segmentos del sistema FSRS
 * @param {Object} appState Estado de la aplicación
 * @param {Object} [catalogs] Catálogos de referencia { jlptExams, kanji, vocabulary, particles }
 * @returns {Object} Resumen detallado con métricas, temas, niveles JLPT y pronóstico
 */
export function getFsrsOverview(appState = {}, catalogs = {}) {
  const now = new Date();
  const allCards = [];

  // 1. Extraer tarjetas activas
  if (appState.srsQuestions && typeof appState.srsQuestions === 'object') {
    Object.entries(appState.srsQuestions).forEach(([id, card]) => {
      if (card && typeof card === 'object' && card.due) {
        allCards.push({ id, card, defaultCategory: 'jlpt' });
      }
    });
  }

  if (appState.masteredKanji && typeof appState.masteredKanji === 'object') {
    Object.entries(appState.masteredKanji).forEach(([id, card]) => {
      if (card && typeof card === 'object' && card.due) {
        allCards.push({ id, card, defaultCategory: 'kanji' });
      }
    });
  }

  if (appState.masteredVocab && typeof appState.masteredVocab === 'object') {
    Object.entries(appState.masteredVocab).forEach(([id, card]) => {
      if (card && typeof card === 'object' && card.due) {
        allCards.push({ id, card, defaultCategory: 'vocab' });
      }
    });
  }

  if (appState.masteredParticles && typeof appState.masteredParticles === 'object') {
    Object.entries(appState.masteredParticles).forEach(([id, card]) => {
      if (card && typeof card === 'object' && card.due) {
        allCards.push({ id, card, defaultCategory: 'grammar' });
      }
    });
  }

  // Mapas auxiliares para resolución de categoría y nivel JLPT
  const jlptMap = new Map((catalogs.jlptExams || []).map(q => [q.id, q]));
  const kanjiMap = new Map((catalogs.kanji || []).map(k => [k.kanji, k]));
  const vocabMap = new Map((catalogs.vocabulary || []).map(v => [String(v.id), v]));
  const particleMap = new Map((catalogs.particles || []).map(p => [p.particle || p.id, p]));

  // Contadores globales
  let totalCards = allCards.length;
  let dueCount = 0;
  let totalReps = 0;
  let totalLapses = 0;
  let leechesCount = 0;

  const stateCounts = {
    new: 0,
    learning: 0,
    review: 0,
    relearning: 0
  };

  const stabilityStages = {
    unstable: 0, // < 1d
    short: 0,    // 1-7d
    medium: 0,   // 8-30d
    long: 0,     // 31-90d
    mature: 0    // > 90d
  };

  let sumStability = 0;
  let sumDifficulty = 0;
  let sumRetrievability = 0;
  let reviewedCardsCount = 0;

  // Segmentación por temas
  const topicStats = {
    kanji: { id: 'kanji', label: 'Kanjis', icon: '漢', total: 0, due: 0, reps: 0, lapses: 0, sumRet: 0, sumDiff: 0, sumStab: 0, reviewed: 0 },
    vocab: { id: 'vocab', label: 'Vocabulario', icon: '📚', total: 0, due: 0, reps: 0, lapses: 0, sumRet: 0, sumDiff: 0, sumStab: 0, reviewed: 0 },
    jlpt: { id: 'jlpt', label: 'Exámenes JLPT', icon: '🎯', total: 0, due: 0, reps: 0, lapses: 0, sumRet: 0, sumDiff: 0, sumStab: 0, reviewed: 0 },
    grammar: { id: 'grammar', label: 'Gramática', icon: '🧩', total: 0, due: 0, reps: 0, lapses: 0, sumRet: 0, sumDiff: 0, sumStab: 0, reviewed: 0 }
  };

  // Segmentación por niveles oficiales JLPT
  const levelStats = {
    N5: { level: 'N5', total: 0, due: 0, reps: 0, lapses: 0, sumRet: 0, sumDiff: 0, sumStab: 0, reviewed: 0 },
    N4: { level: 'N4', total: 0, due: 0, reps: 0, lapses: 0, sumRet: 0, sumDiff: 0, sumStab: 0, reviewed: 0 },
    N3: { level: 'N3', total: 0, due: 0, reps: 0, lapses: 0, sumRet: 0, sumDiff: 0, sumStab: 0, reviewed: 0 },
    N2: { level: 'N2', total: 0, due: 0, reps: 0, lapses: 0, sumRet: 0, sumDiff: 0, sumStab: 0, reviewed: 0 },
    N1: { level: 'N1', total: 0, due: 0, reps: 0, lapses: 0, sumRet: 0, sumDiff: 0, sumStab: 0, reviewed: 0 }
  };

  // Pronóstico de repasos (14 días: hoy, +1, +2, +3, +4, +5, +6, +7, 8-14d, >14d)
  const forecastBuckets = [
    { key: 'today', label: 'Hoy / Vencidas', count: 0, isToday: true },
    { key: 'day1', label: 'Mañana', count: 0 },
    { key: 'day2', label: '+2 días', count: 0 },
    { key: 'day3', label: '+3 días', count: 0 },
    { key: 'day4', label: '+4 días', count: 0 },
    { key: 'day5', label: '+5 días', count: 0 },
    { key: 'day6', label: '+6 días', count: 0 },
    { key: 'day7', label: '+7 días', count: 0 },
    { key: 'week2', label: '8 a 14 días', count: 0 },
    { key: 'later', label: '> 14 días', count: 0 }
  ];

  allCards.forEach(({ id, card, defaultCategory }) => {
    const cardDue = isDue(card);
    if (cardDue) dueCount++;

    const reps = Number(card.reps || 0);
    const lapses = Number(card.lapses || 0);
    const stab = Number(card.stability || 0);
    const diff = Number(card.difficulty || 0);
    const state = Number(card.state || 0);

    totalReps += reps;
    totalLapses += lapses;

    if (isLeech(card)) {
      leechesCount++;
    }

    // Estados
    if (state === State.New) stateCounts.new++;
    else if (state === State.Learning) stateCounts.learning++;
    else if (state === State.Review) stateCounts.review++;
    else if (state === State.Relearning) stateCounts.relearning++;

    // Estabilidad
    if (stab < 1) stabilityStages.unstable++;
    else if (stab <= 7) stabilityStages.short++;
    else if (stab <= 30) stabilityStages.medium++;
    else if (stab <= 90) stabilityStages.long++;
    else stabilityStages.mature++;

    // Retención
    const ret = computeCardRetrievability(card, now);
    if (reps > 0) {
      sumStability += stab;
      sumDifficulty += diff;
      sumRetrievability += ret.percent;
      reviewedCardsCount++;
    }

    // Resolver tema
    let cat = defaultCategory;
    if (id.startsWith('kanji_q_')) cat = 'kanji';
    else if (id.startsWith('vocab_q_')) cat = 'vocab';
    else if (id.startsWith('PARTICLE-')) cat = 'grammar';
    else if (id.startsWith('jlpt_') || jlptMap.has(id)) cat = 'jlpt';

    if (!topicStats[cat]) cat = 'jlpt';
    const tStat = topicStats[cat];
    tStat.total++;
    if (cardDue) tStat.due++;
    tStat.reps += reps;
    tStat.lapses += lapses;
    if (reps > 0) {
      tStat.sumRet += ret.percent;
      tStat.sumDiff += diff;
      tStat.sumStab += stab;
      tStat.reviewed++;
    }

    // Resolver nivel JLPT
    let lvl = 'N5';
    if (jlptMap.has(id)) {
      lvl = jlptMap.get(id).level || 'N5';
    } else if (kanjiMap.has(id)) {
      lvl = kanjiMap.get(id).level || 'N5';
    } else if (vocabMap.has(id)) {
      lvl = vocabMap.get(id).level || 'N5';
    } else if (particleMap.has(id)) {
      lvl = particleMap.get(id).level || 'N5';
    } else {
      const match = id.match(/_n([1-5])_/i) || id.match(/n([1-5])/i);
      if (match) lvl = `N${match[1]}`;
    }

    if (!levelStats[lvl]) lvl = 'N5';
    const lStat = levelStats[lvl];
    lStat.total++;
    if (cardDue) lStat.due++;
    lStat.reps += reps;
    lStat.lapses += lapses;
    if (reps > 0) {
      lStat.sumRet += ret.percent;
      lStat.sumDiff += diff;
      lStat.sumStab += stab;
      lStat.reviewed++;
    }

    // Pronóstico de días
    const dueDate = new Date(card.due);
    const diffMs = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / 86400000);

    if (diffDays <= 0) forecastBuckets[0].count++;
    else if (diffDays === 1) forecastBuckets[1].count++;
    else if (diffDays === 2) forecastBuckets[2].count++;
    else if (diffDays === 3) forecastBuckets[3].count++;
    else if (diffDays === 4) forecastBuckets[4].count++;
    else if (diffDays === 5) forecastBuckets[5].count++;
    else if (diffDays === 6) forecastBuckets[6].count++;
    else if (diffDays === 7) forecastBuckets[7].count++;
    else if (diffDays <= 14) forecastBuckets[8].count++;
    else forecastBuckets[9].count++;
  });

  const avgStability = reviewedCardsCount > 0 ? (sumStability / reviewedCardsCount).toFixed(1) : '0';
  const avgDifficulty = reviewedCardsCount > 0 ? (sumDifficulty / reviewedCardsCount).toFixed(1) : '0';
  const avgRetrievability = reviewedCardsCount > 0 ? (sumRetrievability / reviewedCardsCount).toFixed(1) : '0';
  const retentionRate = totalReps > 0 ? Math.round(((totalReps - totalLapses) / totalReps) * 100) : 100;

  // Formatear estadísticas de temas
  const topicsArray = Object.values(topicStats).map(t => ({
    ...t,
    avgRetrievability: t.reviewed > 0 ? (t.sumRet / t.reviewed).toFixed(1) : '—',
    avgDifficulty: t.reviewed > 0 ? (t.sumDiff / t.reviewed).toFixed(1) : '—',
    avgStability: t.reviewed > 0 ? (t.sumStab / t.reviewed).toFixed(1) : '—',
    retentionRate: t.reps > 0 ? Math.round(((t.reps - t.lapses) / t.reps) * 100) : 100
  }));

  // Formatear estadísticas de niveles JLPT
  const levelsArray = Object.values(levelStats).map(l => ({
    ...l,
    avgRetrievability: l.reviewed > 0 ? (l.sumRet / l.reviewed).toFixed(1) : '—',
    avgDifficulty: l.reviewed > 0 ? (l.sumDiff / l.reviewed).toFixed(1) : '—',
    avgStability: l.reviewed > 0 ? (l.sumStab / l.reviewed).toFixed(1) : '—',
    retentionRate: l.reps > 0 ? Math.round(((l.reps - l.lapses) / l.reps) * 100) : 100
  }));

  return {
    totalCards,
    dueCount,
    totalReps,
    totalLapses,
    retentionRate,
    leechesCount,
    reviewedCardsCount,
    avgStability,
    avgDifficulty,
    avgRetrievability,
    stateCounts,
    stabilityStages,
    topics: topicsArray,
    levels: levelsArray,
    forecast: forecastBuckets
  };
}

/**
 * Compila una lista unificada de preguntas y tarjetas con su diagnóstico FSRS completo
 * @param {Object} appState
 * @param {Object} catalogs
 * @returns {Array<Object>} Lista de elementos enriquecidos con métricas FSRS
 */
export function compileFsrsItems(appState = {}, catalogs = {}) {
  const now = new Date();
  const items = [];
  const srsQuestions = appState.srsQuestions || {};
  const masteredKanji = appState.masteredKanji || {};
  const masteredVocab = appState.masteredVocab || {};
  const masteredParticles = appState.masteredParticles || {};

  // 1. Preguntas de Exámenes JLPT
  (catalogs.jlptExams || []).forEach(q => {
    const cardData = srsQuestions[q.id];
    const hasCard = Boolean(cardData && typeof cardData === 'object' && cardData.due);
    const card = hasCard ? cardData : getNewCard();
    const ret = computeCardRetrievability(card, now);
    const cardDue = hasCard ? isDue(card) : false;
    const daysUntil = card.due ? Math.ceil((new Date(card.due).getTime() - now.getTime()) / 86400000) : 0;

    let correctText = '';
    if (Array.isArray(q.options) && q.correctIndex !== undefined) {
      correctText = q.options[q.correctIndex] || '';
    }

    items.push({
      id: q.id,
      category: 'jlpt',
      categoryLabel: 'Examen JLPT',
      section: q.section || 'General',
      subType: q.subType || '',
      level: q.level || 'N5',
      title: q.question ? q.question.replace(/<[^>]*>/g, '') : 'Pregunta JLPT',
      titleHtml: q.question,
      subtitle: q.targetWord ? `Palabra clave: 「${q.targetWord}」` : (q.furigana ? `Lectura: ${q.furigana}` : ''),
      explanation: q.explanation || '',
      options: q.options || [],
      correctAnswer: correctText,
      card,
      hasCard,
      isDue: cardDue,
      state: card.state ?? 0,
      stateInfo: getCardStateInfo(card.state ?? 0),
      stability: Number((card.stability || 0).toFixed(2)),
      difficulty: Number((card.difficulty || 0).toFixed(2)),
      retrievability: ret,
      reps: Number(card.reps || 0),
      lapses: Number(card.lapses || 0),
      lastReview: card.last_review ? new Date(card.last_review).toISOString() : null,
      due: card.due ? new Date(card.due).toISOString() : null,
      daysUntilDue: daysUntil,
      isLeech: isLeech(card),
      rawItem: q
    });
  });

  // 2. Kanjis
  (catalogs.kanji || []).forEach(k => {
    const cardData = masteredKanji[k.kanji];
    const hasCard = Boolean(cardData && typeof cardData === 'object' && cardData.due);
    const card = hasCard ? cardData : getNewCard();
    const ret = computeCardRetrievability(card, now);
    const cardDue = hasCard ? isDue(card) : false;
    const daysUntil = card.due ? Math.ceil((new Date(card.due).getTime() - now.getTime()) / 86400000) : 0;

    const readings = [
      k.onyomi ? `On: ${k.onyomi}` : '',
      k.kunyomi ? `Kun: ${k.kunyomi}` : ''
    ].filter(Boolean).join(' | ');

    items.push({
      id: `kanji_${k.kanji}`,
      targetKey: k.kanji,
      category: 'kanji',
      categoryLabel: 'Kanji',
      section: 'Kanjis',
      subType: 'Trazos y Lectura',
      level: k.level || 'N5',
      title: k.kanji,
      subtitle: `${k.meaning_es || k.meaning_en || ''} (${readings})`,
      explanation: k.mnemonic || `Kanji de nivel ${k.level}. Significados y compuestos disponibles.`,
      options: [],
      correctAnswer: k.meaning_es || k.meaning_en || '',
      card,
      hasCard,
      isDue: cardDue,
      state: card.state ?? 0,
      stateInfo: getCardStateInfo(card.state ?? 0),
      stability: Number((card.stability || 0).toFixed(2)),
      difficulty: Number((card.difficulty || 0).toFixed(2)),
      retrievability: ret,
      reps: Number(card.reps || 0),
      lapses: Number(card.lapses || 0),
      lastReview: card.last_review ? new Date(card.last_review).toISOString() : null,
      due: card.due ? new Date(card.due).toISOString() : null,
      daysUntilDue: daysUntil,
      isLeech: isLeech(card),
      rawItem: k
    });
  });

  // 3. Vocabulario
  (catalogs.vocabulary || []).forEach(v => {
    const cardData = masteredVocab[v.id];
    const hasCard = Boolean(cardData && typeof cardData === 'object' && cardData.due);
    const card = hasCard ? cardData : getNewCard();
    const ret = computeCardRetrievability(card, now);
    const cardDue = hasCard ? isDue(card) : false;
    const daysUntil = card.due ? Math.ceil((new Date(card.due).getTime() - now.getTime()) / 86400000) : 0;

    items.push({
      id: `vocab_${v.id}`,
      targetKey: v.id,
      category: 'vocab',
      categoryLabel: 'Vocabulario',
      section: 'Vocabulario',
      subType: v.category || 'Palabra',
      level: v.level || 'N5',
      title: v.kanji ? `${v.kanji} (${v.hiragana || v.kana})` : (v.hiragana || v.kana || 'Palabra'),
      subtitle: v.meaning_es || v.meaning_en || '',
      explanation: v.notes || (v.tatoeba_sentences?.[0] ? `Ejemplo: 「${v.tatoeba_sentences[0].jp}」 → ${v.tatoeba_sentences[0].es}` : ''),
      options: [],
      correctAnswer: v.meaning_es || v.meaning_en || '',
      card,
      hasCard,
      isDue: cardDue,
      state: card.state ?? 0,
      stateInfo: getCardStateInfo(card.state ?? 0),
      stability: Number((card.stability || 0).toFixed(2)),
      difficulty: Number((card.difficulty || 0).toFixed(2)),
      retrievability: ret,
      reps: Number(card.reps || 0),
      lapses: Number(card.lapses || 0),
      lastReview: card.last_review ? new Date(card.last_review).toISOString() : null,
      due: card.due ? new Date(card.due).toISOString() : null,
      daysUntilDue: daysUntil,
      isLeech: isLeech(card),
      rawItem: v
    });
  });

  // 4. Partículas
  (catalogs.particles || []).forEach(p => {
    const cardData = masteredParticles[p.particle] || masteredParticles[p.id];
    const hasCard = Boolean(cardData && typeof cardData === 'object' && cardData.due);
    const card = hasCard ? cardData : getNewCard();
    const ret = computeCardRetrievability(card, now);
    const cardDue = hasCard ? isDue(card) : false;
    const daysUntil = card.due ? Math.ceil((new Date(card.due).getTime() - now.getTime()) / 86400000) : 0;

    items.push({
      id: `particle_${p.id || p.particle}`,
      targetKey: p.particle || p.id,
      category: 'grammar',
      categoryLabel: 'Gramática / Partícula',
      section: 'Partículas',
      subType: 'Uso Gramatical',
      level: p.level || 'N5',
      title: `Partícula 「${p.particle}」`,
      subtitle: p.meaning_es || '',
      explanation: p.examples?.[0] ? `Ejemplo: 「${p.examples[0].jp}」 → ${p.examples[0].es}` : 'Partícula gramatical esencial.',
      options: [],
      correctAnswer: p.particle,
      card,
      hasCard,
      isDue: cardDue,
      state: card.state ?? 0,
      stateInfo: getCardStateInfo(card.state ?? 0),
      stability: Number((card.stability || 0).toFixed(2)),
      difficulty: Number((card.difficulty || 0).toFixed(2)),
      retrievability: ret,
      reps: Number(card.reps || 0),
      lapses: Number(card.lapses || 0),
      lastReview: card.last_review ? new Date(card.last_review).toISOString() : null,
      due: card.due ? new Date(card.due).toISOString() : null,
      daysUntilDue: daysUntil,
      isLeech: isLeech(card),
      rawItem: p
    });
  });

  // 5. Preguntas dinámicas adicionales en srsQuestions (partículas, vocab_q, kanji_q)
  Object.entries(srsQuestions).forEach(([qId, card]) => {
    // Si ya fue procesado como JLPT, saltar
    if (items.some(x => x.id === qId)) return;
    if (!card || typeof card !== 'object' || !card.due) return;

    const ret = computeCardRetrievability(card, now);
    const cardDue = isDue(card);
    const daysUntil = card.due ? Math.ceil((new Date(card.due).getTime() - now.getTime()) / 86400000) : 0;

    let cat = 'grammar';
    let label = 'Gramática / Partícula';
    let title = qId;
    if (qId.startsWith('PARTICLE-')) {
      const parts = qId.split('-');
      title = `Partícula 「${parts[1] || ''}」 - ${parts[2] || ''}`;
    } else if (qId.startsWith('vocab_q_')) {
      cat = 'vocab';
      label = 'Pregunta Vocabulario';
      title = `Pregunta Vocabulario #${qId.replace('vocab_q_', '')}`;
    } else if (qId.startsWith('kanji_q_')) {
      cat = 'kanji';
      label = 'Pregunta Kanji';
      title = `Pregunta Kanji 「${qId.replace('kanji_q_', '')}」`;
    }

    items.push({
      id: qId,
      category: cat,
      categoryLabel: label,
      section: 'Práctica Rápida',
      subType: 'Ejercicio FSRS',
      level: 'N5',
      title,
      subtitle: 'Ejercicio interactivo programado',
      explanation: 'Tarjeta evaluada en sesión de repaso.',
      options: [],
      correctAnswer: '',
      card,
      hasCard: true,
      isDue: cardDue,
      state: card.state ?? 0,
      stateInfo: getCardStateInfo(card.state ?? 0),
      stability: Number((card.stability || 0).toFixed(2)),
      difficulty: Number((card.difficulty || 0).toFixed(2)),
      retrievability: ret,
      reps: Number(card.reps || 0),
      lapses: Number(card.lapses || 0),
      lastReview: card.last_review ? new Date(card.last_review).toISOString() : null,
      due: card.due ? new Date(card.due).toISOString() : null,
      daysUntilDue: daysUntil,
      isLeech: isLeech(card),
      rawItem: null
    });
  });

  // 6. Tarjetas adicionales activas en masteredVocab o masteredKanji que no coincidieron con ID de catálogo
  Object.entries(masteredKanji).forEach(([char, card]) => {
    if (!card || typeof card !== 'object' || !card.due) return;
    if (items.some(x => x.targetKey === char || x.id === `kanji_${char}`)) return;

    const ret = computeCardRetrievability(card, now);
    const cardDue = isDue(card);
    const daysUntil = Math.ceil((new Date(card.due).getTime() - now.getTime()) / 86400000);

    items.push({
      id: `kanji_${char}`,
      targetKey: char,
      category: 'kanji',
      categoryLabel: 'Kanji Personalizado',
      section: 'Kanjis',
      subType: 'Kanji',
      level: 'N5',
      title: char,
      subtitle: 'Kanji en estudio',
      explanation: 'Tarjeta activa en FSRS.',
      options: [],
      correctAnswer: '',
      card,
      hasCard: true,
      isDue: cardDue,
      state: card.state ?? 0,
      stateInfo: getCardStateInfo(card.state ?? 0),
      stability: Number((card.stability || 0).toFixed(2)),
      difficulty: Number((card.difficulty || 0).toFixed(2)),
      retrievability: ret,
      reps: Number(card.reps || 0),
      lapses: Number(card.lapses || 0),
      lastReview: card.last_review ? new Date(card.last_review).toISOString() : null,
      due: card.due ? new Date(card.due).toISOString() : null,
      daysUntilDue: daysUntil,
      isLeech: isLeech(card),
      rawItem: null
    });
  });

  Object.entries(masteredVocab).forEach(([vId, card]) => {
    if (!card || typeof card !== 'object' || !card.due) return;
    if (items.some(x => x.targetKey === vId || x.id === `vocab_${vId}`)) return;

    const ret = computeCardRetrievability(card, now);
    const cardDue = isDue(card);
    const daysUntil = Math.ceil((new Date(card.due).getTime() - now.getTime()) / 86400000);

    items.push({
      id: `vocab_${vId}`,
      targetKey: vId,
      category: 'vocab',
      categoryLabel: 'Vocabulario Personalizado',
      section: 'Vocabulario',
      subType: 'Palabra',
      level: 'N5',
      title: `Palabra #${vId}`,
      subtitle: 'Vocabulario en estudio',
      explanation: 'Tarjeta activa en FSRS.',
      options: [],
      correctAnswer: '',
      card,
      hasCard: true,
      isDue: cardDue,
      state: card.state ?? 0,
      stateInfo: getCardStateInfo(card.state ?? 0),
      stability: Number((card.stability || 0).toFixed(2)),
      difficulty: Number((card.difficulty || 0).toFixed(2)),
      retrievability: ret,
      reps: Number(card.reps || 0),
      lapses: Number(card.lapses || 0),
      lastReview: card.last_review ? new Date(card.last_review).toISOString() : null,
      due: card.due ? new Date(card.due).toISOString() : null,
      daysUntilDue: daysUntil,
      isLeech: isLeech(card),
      rawItem: null
    });
  });

  return items;
}

/**
 * Reinicia el estado FSRS de un ítem a una tarjeta limpia
 * @param {Object} appState
 * @param {string} itemId
 * @param {string} category
 * @returns {Object} Nuevo appState
 */
export function resetFsrsCard(appState, itemId, category) {
  if (!appState) return appState;
  const next = { ...appState };

  if (category === 'kanji') {
    const rawKey = itemId.replace('kanji_', '');
    if (next.masteredKanji && next.masteredKanji[rawKey]) {
      const copy = { ...next.masteredKanji };
      delete copy[rawKey];
      next.masteredKanji = copy;
    }
    if (next.srsQuestions && next.srsQuestions[`kanji_q_${rawKey}`]) {
      const copyQ = { ...next.srsQuestions };
      delete copyQ[`kanji_q_${rawKey}`];
      next.srsQuestions = copyQ;
    }
  } else if (category === 'vocab') {
    const rawKey = itemId.replace('vocab_', '');
    if (next.masteredVocab && next.masteredVocab[rawKey]) {
      const copy = { ...next.masteredVocab };
      delete copy[rawKey];
      next.masteredVocab = copy;
    }
    if (next.srsQuestions && next.srsQuestions[`vocab_q_${rawKey}`]) {
      const copyQ = { ...next.srsQuestions };
      delete copyQ[`vocab_q_${rawKey}`];
      next.srsQuestions = copyQ;
    }
  } else if (category === 'grammar') {
    const rawKey = itemId.replace('particle_', '');
    if (next.masteredParticles && next.masteredParticles[rawKey]) {
      const copy = { ...next.masteredParticles };
      delete copy[rawKey];
      next.masteredParticles = copy;
    }
    if (next.srsQuestions && next.srsQuestions[itemId]) {
      const copyQ = { ...next.srsQuestions };
      delete copyQ[itemId];
      next.srsQuestions = copyQ;
    }
  } else {
    // JLPT o pregunta general
    if (next.srsQuestions && next.srsQuestions[itemId]) {
      const copyQ = { ...next.srsQuestions };
      delete copyQ[itemId];
      next.srsQuestions = copyQ;
    }
  }

  return next;
}


