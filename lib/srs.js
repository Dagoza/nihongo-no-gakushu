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
  const now = new Date();
  const dueDate = new Date(card.due);
  return now >= dueDate;
}
