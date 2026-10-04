import { fsrs, createEmptyCard, Rating } from 'ts-fsrs';

const f = fsrs({
  maximum_interval: 36500,
});

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

