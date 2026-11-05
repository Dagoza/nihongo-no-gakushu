'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  Undo2, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  X, 
  PenTool, 
  ListChecks, 
  Layers, 
  Shuffle, 
  BookOpen, 
  Zap
} from 'lucide-react';
import * as wanakana from 'wanakana';
import audioManager from '../../lib/audioManager';
import { 
  SRSRating, 
  getIntervalPreviews, 
  getRatingInfoFromMistakes, 
  triggerSrsFeedback 
} from '../../lib/srs';
import { getPrimaryKanjiReading, getAllKanjiReadings, katakanaToHiragana } from '../../lib/japaneseUtils';
import { triggerCheerConfetti } from '../../lib/confetti';
import kanjiDataDefault from '../../data/kanji.json';
import KanjiDraw from './KanjiDraw';
import AudioPlayButton from '../common/AudioPlayButton';
import QuizOptionsGrid from '../common/QuizOptionsGrid';
import PitchAccent from './PitchAccent';
import SpeechPractice from './SpeechPractice';

// Clave de almacenamiento local para persistir la preferencia de modo de repaso
const KANJI_SRS_MODE_STORAGE_KEY = 'nihongo_kanji_srs_mode_v2';

// Modos de repaso generales
const REVIEW_MODES = [
  { id: 'mix', label: 'Mix Dinámico', icon: Shuffle, desc: 'Alterna entre dibujo, jukugo, test y memoria' },
  { id: 'choice', label: 'Selección Múltiple', icon: ListChecks, desc: 'Quiz interactivo de significado y kanji' },
  { id: 'jukugo', label: 'Jukugo Matrix', icon: Sparkles, desc: 'Lectura y significado de compuestos' },
  { id: 'draw', label: 'Dibujar Trazo', icon: PenTool, desc: 'Escribe el kanji con el componente KanjiDraw' },
  { id: 'flashcard', label: 'Flashcard Clásica', icon: Layers, desc: 'Tarjeta de memoria tradicional con volteo' },
];

// Tipos específicos de ejercicio por tarjeta
const EXERCISE_TYPES = {
  CHOICE_MEANING: 'choice_meaning', // Dado Kanji -> Elegir significado
  CHOICE_KANJI: 'choice_kanji',     // Dado significado -> Elegir Kanji
  DRAW: 'draw',                     // Dibujar Kanji con KanjiDraw
  FLASHCARD: 'flashcard',            // Tarjeta clásica de memoria
  JUKUGO_READING: 'jukugo_reading'  // Compuestos jukugo (Wanakana + Choice)
};

// Mezclador Fisher-Yates
function shuffleList(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function KanjiSrsReview({
  queue = [],
  allKanjis = kanjiDataDefault,
  onRate,
  onUndo,
  getCurrentCard,
  onExit,
  backLabel = 'Volver a Kanjis',
  appState = {}
}) {
  // Índice actual de la cola de repaso
  const [srsReviewIndex, setSrsReviewIndex] = useState(0);
  
  // Historial de tarjetas calificadas para botón "Deshacer"
  const [reviewHistory, setReviewHistory] = useState([]);

  // Modo global de la sesión
  const [activeMode, setActiveMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(KANJI_SRS_MODE_STORAGE_KEY);
        if (saved && ['mix', 'choice', 'jukugo', 'draw', 'flashcard'].includes(saved)) {
          return saved;
        }
      } catch {}
    }
    return 'mix';
  });

  // Sobrescritura manual de formato por kanji específico
  const [cardOverrideMap, setCardOverrideMap] = useState({});

  // Estados comunes de resolución de la tarjeta activa
  const [isRevealed, setIsRevealed] = useState(false);
  const [suggestedRating, setSuggestedRating] = useState(null);

  // Estados de Selección Múltiple (Quiz)
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizIsAnswered, setQuizIsAnswered] = useState(false);

  // Estados del Modo Jukugo Matrix Drill (Dual: tipeo directo + selección múltiple)
  const [jukugoSubMode, setJukugoSubMode] = useState('typing'); // 'typing' | 'choice'
  const [jukugoInput, setJukugoInput] = useState('');
  const [jukugoFeedback, setJukugoFeedback] = useState(null);

  // Caché de opciones generadas para evitar re-mezclar en cada render
  const optionsCacheRef = useRef({});

  // Elemento activo
  const currentItem = queue[srsReviewIndex];

  // Compuesto Jukugo activo para el kanji actual
  const targetJukugo = useMemo(() => {
    if (!currentItem || !currentItem.words || currentItem.words.length === 0) return null;
    const wordList = currentItem.words.filter(w => w.reading && (w.meaning || w.meaning_es));
    const listToUse = wordList.length > 0 ? wordList : currentItem.words;
    return listToUse[srsReviewIndex % listToUse.length];
  }, [currentItem, srsReviewIndex]);

  // Determinar el tipo de ejercicio para el kanji actual
  const currentExerciseType = useMemo(() => {
    if (!currentItem) return EXERCISE_TYPES.FLASHCARD;
    
    // Si el usuario forzó un tipo para este kanji específico:
    if (cardOverrideMap[currentItem.kanji]) {
      return cardOverrideMap[currentItem.kanji];
    }

    if (activeMode === 'choice') {
      // Alterna entre adivinar significado o adivinar kanji
      return srsReviewIndex % 2 === 0 ? EXERCISE_TYPES.CHOICE_MEANING : EXERCISE_TYPES.CHOICE_KANJI;
    }

    if (activeMode === 'jukugo') {
      if (currentItem.words && currentItem.words.length > 0) {
        return EXERCISE_TYPES.JUKUGO_READING;
      }
      return EXERCISE_TYPES.CHOICE_MEANING;
    }

    if (activeMode === 'draw') {
      return EXERCISE_TYPES.DRAW;
    }

    if (activeMode === 'flashcard') {
      return EXERCISE_TYPES.FLASHCARD;
    }

    // Modo MIX DINÁMICO: Distribución balanceada e interactiva
    // 0: Meaning Quiz -> 1: Dibujar Trazo -> 2: Jukugo Drill (si tiene words) -> 3: Kanji Quiz -> 4: Dibujar Trazo -> 5: Flashcard
    const cycle = srsReviewIndex % 6;
    if (cycle === 0) return EXERCISE_TYPES.CHOICE_MEANING;
    if (cycle === 1) return EXERCISE_TYPES.DRAW;
    if (cycle === 2 && currentItem.words && currentItem.words.length > 0) return EXERCISE_TYPES.JUKUGO_READING;
    if (cycle === 3) return EXERCISE_TYPES.CHOICE_KANJI;
    if (cycle === 4) return EXERCISE_TYPES.DRAW;
    return EXERCISE_TYPES.FLASHCARD;
  }, [currentItem, cardOverrideMap, activeMode, srsReviewIndex]);

  // Cambiar modo global
  const handleModeChange = (newMode) => {
    setActiveMode(newMode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(KANJI_SRS_MODE_STORAGE_KEY, newMode);
      } catch {}
    }
  };

  // Forzar tipo de ejercicio para el kanji actual
  const handleOverrideExercise = (newType) => {
    if (!currentItem) return;
    setCardOverrideMap(prev => ({
      ...prev,
      [currentItem.kanji]: newType
    }));
    // Reiniciar estados del kanji activo
    setIsRevealed(false);
    setSuggestedRating(null);
    setQuizSelectedOption(null);
    setQuizIsAnswered(false);
    setJukugoInput('');
    setJukugoFeedback(null);
  };

  // Generación inteligente de opciones para preguntas de selección múltiple
  const currentOptions = useMemo(() => {
    if (!currentItem) return [];
    const cacheKey = `${currentItem.kanji}_${currentExerciseType}`;
    if (optionsCacheRef.current[cacheKey]) {
      return optionsCacheRef.current[cacheKey];
    }

    const kanjiListPool = (allKanjis && allKanjis.length > 0) ? allKanjis : kanjiDataDefault;

    if (currentExerciseType === EXERCISE_TYPES.CHOICE_MEANING) {
      // Subtipo A: Reconocer significado y lectura a partir del Kanji
      const correctOption = {
        id: 'correct',
        meaning: currentItem.meaning_es,
        reading: getPrimaryKanjiReading(currentItem),
        kanji: currentItem.kanji,
        isCorrect: true
      };

      // Buscar distractores preferiblemente del mismo nivel JLPT y con significado distinto
      const candidates = kanjiListPool.filter(k => 
        k.kanji !== currentItem.kanji && 
        k.meaning_es && 
        k.meaning_es.trim().toLowerCase() !== currentItem.meaning_es.trim().toLowerCase()
      );

      const sameLevel = candidates.filter(k => k.level === currentItem.level);
      const pool = sameLevel.length >= 3 ? sameLevel : candidates;
      const shuffledDistractors = shuffleList(pool).slice(0, 3).map(k => ({
        id: `dist_${k.kanji}`,
        meaning: k.meaning_es,
        reading: getPrimaryKanjiReading(k),
        kanji: k.kanji,
        isCorrect: false
      }));

      const finalOptions = shuffleList([correctOption, ...shuffledDistractors]);
      optionsCacheRef.current[cacheKey] = finalOptions;
      return finalOptions;
    }

    if (currentExerciseType === EXERCISE_TYPES.CHOICE_KANJI) {
      // Subtipo B: Reconocer el Kanji correcto a partir del significado
      const correctOption = {
        id: 'correct',
        kanji: currentItem.kanji,
        meaning: currentItem.meaning_es,
        strokes: currentItem.strokes,
        isCorrect: true
      };

      const candidates = kanjiListPool.filter(k => k.kanji !== currentItem.kanji);
      // Priorizar mismo nivel o cantidad similar de trazos para mayor desafío visual
      const similarStrokes = candidates.filter(k => 
        Math.abs((k.strokes || 0) - (currentItem.strokes || 0)) <= 3 && 
        (!currentItem.level || k.level === currentItem.level)
      );
      const pool = similarStrokes.length >= 3 ? similarStrokes : candidates;
      const shuffledDistractors = shuffleList(pool).slice(0, 3).map(k => ({
        id: `dist_${k.kanji}`,
        kanji: k.kanji,
        meaning: k.meaning_es,
        strokes: k.strokes,
        isCorrect: false
      }));

      const finalOptions = shuffleList([correctOption, ...shuffledDistractors]);
      optionsCacheRef.current[cacheKey] = finalOptions;
      return finalOptions;
    }

    if (currentExerciseType === EXERCISE_TYPES.JUKUGO_READING && targetJukugo) {
      const correctOption = {
        id: 'correct',
        reading: targetJukugo.reading,
        meaning: targetJukugo.meaning || targetJukugo.meaning_es || '',
        kanji: targetJukugo.word,
        isCorrect: true
      };

      const allOtherWords = kanjiListPool
        .flatMap(k => k.words || [])
        .filter(w => w && w.reading && w.word !== targetJukugo.word && w.reading !== targetJukugo.reading);

      const shuffledDistractors = shuffleList(allOtherWords).slice(0, 3).map((w, i) => ({
        id: `dist_${w.word}_${i}`,
        reading: w.reading,
        meaning: w.meaning || w.meaning_es || '',
        kanji: w.word,
        isCorrect: false
      }));

      const finalOptions = shuffleList([correctOption, ...shuffledDistractors]);
      optionsCacheRef.current[cacheKey] = finalOptions;
      return finalOptions;
    }

    return [];
  }, [currentItem, currentExerciseType, allKanjis, targetJukugo]);

  // Limpiar y resetear estados al cambiar de tarjeta
  const resetCardState = useCallback(() => {
    setIsRevealed(false);
    setSuggestedRating(null);
    setQuizSelectedOption(null);
    setQuizIsAnswered(false);
    setJukugoInput('');
    setJukugoFeedback(null);
  }, []);

  // Manejo de Respuesta para Jukugo Matrix Drill (Tipeo)
  const handleValidateJukugoInput = useCallback(() => {
    if (!targetJukugo || !jukugoInput.trim()) return;
    const cleanInput = katakanaToHiragana(jukugoInput.trim());
    const expectedHira = katakanaToHiragana(targetJukugo.reading.trim());
    const isCorrect = cleanInput === expectedHira;

    setIsRevealed(true);
    setQuizIsAnswered(true);

    if (isCorrect) {
      setJukugoFeedback({
        type: 'correct',
        msg: '🎉 ¡Lectura contextual correcta!',
        reading: `${targetJukugo.word} = ${targetJukugo.reading}`
      });
      setSuggestedRating(SRSRating.GOOD);
      triggerCheerConfetti();
      triggerSrsFeedback(SRSRating.GOOD);
    } else {
      setJukugoFeedback({
        type: 'wrong',
        msg: `❌ Incorrecto. Lectura correcta: ${targetJukugo.reading}`,
        reading: `${targetJukugo.word} = ${targetJukugo.reading}`
      });
      setSuggestedRating(SRSRating.AGAIN);
      triggerSrsFeedback(SRSRating.AGAIN);
    }
    audioManager.speak(targetJukugo.reading);
  }, [targetJukugo, jukugoInput]);

  // Manejo de Respuesta para Jukugo Matrix Drill (Opción Múltiple)
  const handleSelectJukugoOption = useCallback((opt) => {
    if (quizIsAnswered || !targetJukugo) return;
    setIsRevealed(true);
    setQuizIsAnswered(true);
    setQuizSelectedOption(opt.id);

    if (opt.isCorrect) {
      setJukugoFeedback({
        type: 'correct',
        msg: '🎉 ¡Compuesto acertado!',
        reading: `${targetJukugo.word} = ${targetJukugo.reading}`
      });
      setSuggestedRating(SRSRating.GOOD);
      triggerCheerConfetti();
      triggerSrsFeedback(SRSRating.GOOD);
    } else {
      setJukugoFeedback({
        type: 'wrong',
        msg: `❌ Incorrecto. Lectura correcta: ${targetJukugo.reading}`,
        reading: `${targetJukugo.word} = ${targetJukugo.reading}`
      });
      setSuggestedRating(SRSRating.AGAIN);
      triggerSrsFeedback(SRSRating.AGAIN);
    }
    audioManager.speak(targetJukugo.reading);
  }, [quizIsAnswered, targetJukugo]);

  // Manejo de Respuesta en Selección Múltiple
  const handleSelectOption = useCallback((index) => {
    if (quizIsAnswered || !currentOptions[index]) return;

    setQuizSelectedOption(index);
    setQuizIsAnswered(true);
    setIsRevealed(true);

    const isRight = Boolean(currentOptions[index]?.isCorrect);
    const reading = getPrimaryKanjiReading(currentItem) || currentItem?.kanji;

    if (isRight) {
      audioManager.speak(reading);
      triggerSrsFeedback(SRSRating.GOOD);
      setSuggestedRating(SRSRating.GOOD);
    } else {
      triggerSrsFeedback(SRSRating.AGAIN);
      setSuggestedRating(SRSRating.AGAIN);
    }
  }, [quizIsAnswered, currentOptions, currentItem]);

  // Completitud al dibujar en el lienzo KanjiDraw (reutiliza lógica FSRS de Scriptpad)
  const handleDrawComplete = useCallback((summary) => {
    const mistakes = summary?.totalMistakes || 0;
    // Reutiliza la función central de cálculo FSRS según errores de Scriptpad
    const ratingInfo = getRatingInfoFromMistakes(mistakes, false);
    setSuggestedRating(ratingInfo.rating);
    setIsRevealed(true);
    triggerCheerConfetti();
    const reading = getPrimaryKanjiReading(currentItem) || currentItem?.kanji;
    audioManager.speak(reading);
  }, [currentItem]);

  // Manejo de Calificación FSRS y avance
  const handleRate = useCallback((rating) => {
    if (!currentItem) return;
    triggerSrsFeedback(rating);
    const prevCard = getCurrentCard ? getCurrentCard(currentItem) : null;

    setReviewHistory(prev => [
      ...prev,
      {
        index: srsReviewIndex,
        item: currentItem,
        rating,
        prevCard
      }
    ]);

    if (onRate) {
      onRate(currentItem, rating);
    }

    resetCardState();
    setSrsReviewIndex(prev => prev + 1);
  }, [currentItem, getCurrentCard, onRate, resetCardState, srsReviewIndex]);

  // Deshacer / Devolver tarjeta anterior
  const handleUndo = useCallback(() => {
    if (reviewHistory.length === 0) return;
    const last = reviewHistory[reviewHistory.length - 1];
    setReviewHistory(prev => prev.slice(0, -1));

    if (onUndo) {
      onUndo(last.item, last.prevCard);
    }

    resetCardState();
    setSrsReviewIndex(last.index);
    setIsRevealed(true);
  }, [reviewHistory, onUndo, resetCardState]);

  // Revelar respuesta manualmente (en modo dibujo o flashcard)
  const handleManualReveal = () => {
    setIsRevealed(true);
    if (!suggestedRating) {
      setSuggestedRating(SRSRating.GOOD);
    }
    const reading = getPrimaryKanjiReading(currentItem) || currentItem?.kanji;
    if (reading) {
      audioManager.speak(reading);
    }
  };

  // Atajos de teclado ágiles para estudio profesional
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (onExit) onExit();
        return;
      }

      if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey) {
        if (reviewHistory.length > 0) {
          e.preventDefault();
          handleUndo();
        }
        return;
      }

      if (srsReviewIndex < queue.length) {
        // 1. Fase Pre-Respuesta
        if (!isRevealed) {
          // Teclas A, B, C, D o 1, 2, 3, 4 en Modo Quiz
          if ((currentExerciseType === EXERCISE_TYPES.CHOICE_MEANING || currentExerciseType === EXERCISE_TYPES.CHOICE_KANJI) && !quizIsAnswered) {
            if (e.key === '1' || e.key === 'a' || e.key === 'A') {
              e.preventDefault();
              handleSelectOption(0);
              return;
            }
            if (e.key === '2' || e.key === 'b' || e.key === 'B') {
              e.preventDefault();
              handleSelectOption(1);
              return;
            }
            if (e.key === '3' || e.key === 'c' || e.key === 'C') {
              e.preventDefault();
              handleSelectOption(2);
              return;
            }
            if (e.key === '4' || e.key === 'd' || e.key === 'D') {
              e.preventDefault();
              handleSelectOption(3);
              return;
            }
          }

          // Tecla Espacio o Enter en Flashcard o Dibujo para revelar
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleManualReveal();
            return;
          }
        } else {
          // 2. Fase Post-Respuesta (Calificación FSRS)
          if (e.key === '1') {
            e.preventDefault();
            handleRate(SRSRating.AGAIN);
            return;
          }
          if (e.key === '2') {
            e.preventDefault();
            handleRate(SRSRating.HARD);
            return;
          }
          if (e.key === '3') {
            e.preventDefault();
            handleRate(SRSRating.GOOD);
            return;
          }
          if (e.key === '4') {
            e.preventDefault();
            handleRate(SRSRating.EASY);
            return;
          }
          // Enter o Espacio para continuar con la calificación sugerida
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRate(suggestedRating || SRSRating.GOOD);
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isRevealed, 
    quizIsAnswered, 
    currentExerciseType, 
    srsReviewIndex, 
    queue.length, 
    reviewHistory.length, 
    suggestedRating,
    handleSelectOption, 
    handleRate, 
    handleUndo, 
    onExit
  ]);

  // Celebración al terminar toda la tanda
  useEffect(() => {
    if (queue.length > 0 && srsReviewIndex >= queue.length && reviewHistory.length > 0) {
      triggerCheerConfetti();
    }
  }, [srsReviewIndex, queue.length, reviewHistory.length]);

  // Pantalla cuando el repaso está terminado o la cola está vacía
  if (queue.length === 0 || srsReviewIndex >= queue.length) {
    const completedCount = reviewHistory.length;
    return (
      <div className="quiz-container" style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
          <button 
            type="button" 
            className="btn btn-outline btn-sm" 
            onClick={onExit}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={16} /> {backLabel}
          </button>
          {reviewHistory.length > 0 && (
            <button 
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleUndo}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}
              title="Deshacer y volver a la última tarjeta calificada [Z]"
            >
              <Undo2 size={15} /> Deshacer última tarjeta
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div style={{ fontSize: '3.6rem', marginBottom: 16 }}>🎉</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
            {completedCount > 0 ? '¡Sesión de Kanjis Completada!' : '¡Estás al día con tus Kanjis!'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 480, margin: '0 auto 24px auto', lineHeight: 1.5 }}>
            {completedCount > 0 
              ? `Has repasado ${completedCount} ${completedCount === 1 ? 'kanji' : 'kanjis'} exitosamente combinando selección múltiple, trazo caligráfico y repetición espaciada FSRS.`
              : 'No tienes más kanjis pendientes de repaso en este momento. ¡Excelente constancia!'}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className="btn btn-primary btn-lg" 
              onClick={onExit}
              style={{ minWidth: 180, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <CheckCircle2 size={18} /> {backLabel}
            </button>
            {reviewHistory.length > 0 && (
              <button 
                type="button"
                className="btn btn-outline btn-lg"
                onClick={handleUndo}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Undo2 size={18} /> Deshacer última
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Previsualizaciones de intervalo FSRS para la tarjeta activa
  const currentCardData = getCurrentCard ? getCurrentCard(currentItem) : null;
  const intervalPreviews = getIntervalPreviews(currentCardData);
  const progressPercent = Math.round((srsReviewIndex / queue.length) * 100);
  const primaryReading = getPrimaryKanjiReading(currentItem);

  return (
    <div className="quiz-container" style={{ maxWidth: 720, padding: '24px 20px' }}>
      
      {/* 1. HEADER DE NAVEGACIÓN Y ATRIBUTOS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button 
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onExit}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
            title="Salir del repaso y volver [Esc]"
          >
            <ArrowLeft size={16} /> {backLabel}
          </button>

          <button 
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleUndo}
            disabled={reviewHistory.length === 0}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6,
              opacity: reviewHistory.length === 0 ? 0.45 : 1,
              cursor: reviewHistory.length === 0 ? 'not-allowed' : 'pointer'
            }}
            title={reviewHistory.length > 0 ? "Volver y deshacer tarjeta anterior [Tecla Z]" : "No hay tarjetas anteriores para deshacer"}
          >
            <Undo2 size={15} /> Deshacer
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="vocab-tag" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', borderColor: 'rgba(99, 102, 241, 0.3)', fontWeight: 700 }}>
            🧠 Repaso Espaciado (SRS)
          </span>
          <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            {srsReviewIndex + 1} <span style={{ opacity: 0.6 }}>/</span> {queue.length}
          </span>
        </div>
      </div>

      {/* 2. SELECTOR MODERNO DE MODOS DE REPASO */}
      <div 
        style={{ 
          display: 'flex', 
          background: 'var(--bg-main)', 
          padding: 4, 
          borderRadius: 14, 
          border: '1px solid var(--border)', 
          marginBottom: 16,
          gap: 4,
          overflowX: 'auto'
        }}
        role="tablist"
        aria-label="Modalidad de repaso SRS"
      >
        {REVIEW_MODES.map((m) => {
          const Icon = m.icon;
          const isSelected = activeMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => handleModeChange(m.id)}
              style={{
                flex: 1,
                minWidth: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 10px',
                borderRadius: 10,
                fontSize: '0.78rem',
                fontWeight: isSelected ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                background: isSelected ? 'var(--primary)' : 'transparent',
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap'
              }}
              title={m.desc}
            >
              <Icon size={14} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. BARRA DE PROGRESO */}
      <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden', marginBottom: 20 }}>
        <div 
          style={{ 
            width: `${progressPercent}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, var(--primary), var(--accent))', 
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
          }} 
        />
      </div>

      {/* 4. TARJETA PRINCIPAL DEL KANJI */}
      <div 
        style={{ 
          background: 'var(--bg-main)', 
          borderRadius: 18, 
          border: '1px solid var(--border)', 
          padding: '24px 20px', 
          textAlign: 'center', 
          boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* ENCABEZADO DE EJERCICIO Y SWITCH RÁPIDO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span className="vocab-tag" style={{ fontWeight: 700 }}>{currentItem.level || 'N5'}</span>
            {currentItem.strokes && (
              <span style={{ fontSize: '0.75rem', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>
                {currentItem.strokes} trazos
              </span>
            )}
            {currentItem.radical && (
              <span style={{ fontSize: '0.75rem', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Radical: <strong className="jp-text">{currentItem.radical}</strong>
              </span>
            )}
          </div>

          {/* Switch rápido de ejercicio para este kanji específico */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: 2 }}>Tipo:</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => handleOverrideExercise(EXERCISE_TYPES.CHOICE_MEANING)}
              style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: 6,
                fontWeight: currentExerciseType === EXERCISE_TYPES.CHOICE_MEANING || currentExerciseType === EXERCISE_TYPES.CHOICE_KANJI ? 700 : 400,
                color: currentExerciseType === EXERCISE_TYPES.CHOICE_MEANING || currentExerciseType === EXERCISE_TYPES.CHOICE_KANJI ? 'var(--primary)' : 'var(--text-muted)',
                background: currentExerciseType === EXERCISE_TYPES.CHOICE_MEANING || currentExerciseType === EXERCISE_TYPES.CHOICE_KANJI ? 'rgba(99, 102, 241, 0.12)' : 'transparent'
              }}
              title="Cambiar a Selección Múltiple"
            >
              📝 Test
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => handleOverrideExercise(EXERCISE_TYPES.DRAW)}
              style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: 6,
                fontWeight: currentExerciseType === EXERCISE_TYPES.DRAW ? 700 : 400,
                color: currentExerciseType === EXERCISE_TYPES.DRAW ? 'var(--primary)' : 'var(--text-muted)',
                background: currentExerciseType === EXERCISE_TYPES.DRAW ? 'rgba(99, 102, 241, 0.12)' : 'transparent'
              }}
              title="Cambiar a Dibujar Trazo"
            >
              ✍️ Dibujo
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => handleOverrideExercise(EXERCISE_TYPES.FLASHCARD)}
              style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: 6,
                fontWeight: currentExerciseType === EXERCISE_TYPES.FLASHCARD ? 700 : 400,
                color: currentExerciseType === EXERCISE_TYPES.FLASHCARD ? 'var(--primary)' : 'var(--text-muted)',
                background: currentExerciseType === EXERCISE_TYPES.FLASHCARD ? 'rgba(99, 102, 241, 0.12)' : 'transparent'
              }}
              title="Cambiar a Tarjeta Memoria"
            >
              🎴 Card
            </button>
            {currentItem?.words && currentItem.words.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => handleOverrideExercise(EXERCISE_TYPES.JUKUGO_READING)}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontWeight: currentExerciseType === EXERCISE_TYPES.JUKUGO_READING ? 700 : 400,
                  color: currentExerciseType === EXERCISE_TYPES.JUKUGO_READING ? 'var(--primary)' : 'var(--text-muted)',
                  background: currentExerciseType === EXERCISE_TYPES.JUKUGO_READING ? 'rgba(99, 102, 241, 0.12)' : 'transparent'
                }}
                title="Cambiar a Jukugo Matrix Drill"
              >
                🧩 Jukugo
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* FORMATO 1: SELECCIÓN MÚLTIPLE - KANJI -> SIGNIFICADO & LECTURA */}
        {/* ------------------------------------------------------------- */}
        {currentExerciseType === EXERCISE_TYPES.CHOICE_MEANING && (
          <div>
            <div 
              className="kanji-big-char jp-text" 
              style={{ 
                width: 115, 
                height: 115, 
                fontSize: '4.6rem', 
                lineHeight: 1, 
                margin: '8px auto 14px auto',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.12)',
                flexShrink: 0
              }}
            >
              {currentItem.kanji}
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
              ¿Cuál es el significado y lectura de este kanji?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
              <AudioPlayButton
                text={currentItem.kanji}
                reading={primaryReading}
                size="xs"
                variant="outline"
                label="Pista de Audio"
                title="Escuchar audio de lectura"
              />
            </div>

            {/* Grid de 4 opciones */}
            <QuizOptionsGrid
              options={currentOptions}
              selectedOption={quizSelectedOption}
              isAnswered={quizIsAnswered}
              onSelect={(idx) => handleSelectOption(idx)}
              layout="grid"
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* FORMATO 2: SELECCIÓN MÚLTIPLE - SIGNIFICADO -> KANJI CORRECTO */}
        {/* ------------------------------------------------------------- */}
        {currentExerciseType === EXERCISE_TYPES.CHOICE_KANJI && (
          <div>
            <div style={{ margin: '8px 0 16px 0' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Significado en Español
              </span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                🇪🇸 {currentItem.meaning_es}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {currentItem.onyomi && <span>On: <strong className="jp-text" style={{ color: 'var(--primary)' }}>{currentItem.onyomi.split('[')[0]}</strong></span>}
                {currentItem.kunyomi && <span>Kun: <strong className="jp-text" style={{ color: 'var(--accent)' }}>{currentItem.kunyomi.split('[')[0]}</strong></span>}
              </div>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
              ¿Cuál es el kanji que corresponde a este significado?
            </p>

            {/* Grid de 4 Kanjis */}
            <QuizOptionsGrid
              options={currentOptions}
              selectedOption={quizSelectedOption}
              isAnswered={quizIsAnswered}
              onSelect={(idx) => handleSelectOption(idx)}
              layout="kanji-cards"
              columns={2}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* FORMATO 3: DIBUJAR TRAZO (REUTILIZANDO KanjiDraw COMPONENTE)   */}
        {/* ------------------------------------------------------------- */}
        {currentExerciseType === EXERCISE_TYPES.DRAW && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ✍️ Práctica de Trazo
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                {currentItem.meaning_es}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={handleManualReveal}
                  style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  title="Revelar kanji si no recuerdas cómo escribirlo"
                >
                  💡 Revelar Respuesta
                </button>
              </div>
            </div>

            {/* Reutilización limpia del componente oficial KanjiDraw */}
            <KanjiDraw
              key={currentItem.kanji}
              character={currentItem.kanji}
              size={260}
              initialMode="quiz"
              onQuizComplete={handleDrawComplete}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* FORMATO 4: FLASHCARD TRADICIONAL (MEMORIA Y VOLTEO)           */}
        {/* ------------------------------------------------------------- */}
        {currentExerciseType === EXERCISE_TYPES.FLASHCARD && (
          <div>
            <div 
              className="kanji-big-char jp-text" 
              style={{ 
                width: 124, 
                height: 124, 
                fontSize: '4.8rem', 
                lineHeight: 1, 
                margin: '12px auto 18px auto',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.12)',
                flexShrink: 0
              }}
            >
              {currentItem.kanji}
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: '0 0 16px 0', maxWidth: 420 }}>
              ¿Recuerdas las lecturas (Kun/On) y el significado en español?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              <AudioPlayButton
                text={currentItem.kanji}
                reading={primaryReading}
                size="sm"
                variant="outline"
                label="Pista de Audio"
                title="Escuchar audio de lectura"
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* FORMATO 5: JUKUGO MATRIX DRILL - LECTURA & SIGNIFICADO DUAL   */}
        {/* ------------------------------------------------------------- */}
        {currentExerciseType === EXERCISE_TYPES.JUKUGO_READING && targetJukugo && (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, marginBottom: 12 }}>
              <Sparkles size={14} />
              <span>Jukugo Matrix Drill · Compuesto Contextual</span>
            </div>

            {/* Palabra Compuesta en Grande */}
            <div 
              className="kanji-big-char jp-text" 
              style={{ 
                minWidth: 160,
                padding: '12px 24px',
                height: 'auto', 
                fontSize: 'clamp(2.4rem, 8vw, 3.8rem)', 
                lineHeight: 1.2, 
                margin: '6px auto 12px auto',
                borderRadius: 20,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.12)',
                background: 'var(--bg-surface)',
                border: '1.5px solid var(--border)'
              }}
            >
              {targetJukugo.word}
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
              Kanji objetivo: <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{currentItem.kanji}</strong> · Significado del compuesto: <strong>「{targetJukugo.meaning || targetJukugo.meaning_es}」</strong>
            </p>

            {/* Alternador de Modo Dual: Tipeo directo Wanakana vs Opción Múltiple */}
            <div style={{ display: 'inline-flex', gap: 6, background: 'var(--bg-main)', padding: 4, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
              <button
                type="button"
                className={`btn btn-xs ${jukugoSubMode === 'typing' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setJukugoSubMode('typing')}
                style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: 8 }}
              >
                ⌨️ Tipear Lectura
              </button>
              <button
                type="button"
                className={`btn btn-xs ${jukugoSubMode === 'choice' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setJukugoSubMode('choice')}
                style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: 8 }}
              >
                🔘 Opción Múltiple
              </button>
            </div>

            {/* Modo Tipeo Directo con IME Wanakana */}
            {jukugoSubMode === 'typing' && !quizIsAnswered && (
              <div style={{ maxWidth: 360, margin: '0 auto 16px auto' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="japanese-input jp-text"
                    placeholder="Lectura en hiragana..."
                    value={jukugoInput}
                    onChange={(e) => {
                      const converted = wanakana.toKana(e.target.value, { IMEMode: true });
                      setJukugoInput(converted);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleValidateJukugoInput();
                    }}
                    autoFocus
                    style={{ flex: 1, padding: '10px 14px', fontSize: '1.1rem', textAlign: 'center', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleValidateJukugoInput}
                    style={{ padding: '10px 18px', borderRadius: 12, fontWeight: 700 }}
                  >
                    Validar
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  🇯🇵 IME Romaji → Kana activo (ej. gakusei → がくせい)
                </div>
              </div>
            )}

            {/* Modo Opción Múltiple */}
            {jukugoSubMode === 'choice' && !quizIsAnswered && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, maxWidth: 440, margin: '0 auto 16px auto' }}>
                {currentOptions.map((opt, i) => (
                  <button
                    key={opt.id || i}
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleSelectJukugoOption(opt)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span className="jp-text" style={{ fontSize: '1.15rem', fontWeight: 700 }}>{opt.reading}</span>
                    {opt.meaning && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.meaning}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Feedback del ejercicio Jukugo */}
            {jukugoFeedback && (
              <div 
                style={{ 
                  marginTop: 12, 
                  padding: '12px 16px', 
                  borderRadius: 12, 
                  background: jukugoFeedback.type === 'correct' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1.5px solid ${jukugoFeedback.type === 'correct' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  color: jukugoFeedback.type === 'correct' ? 'var(--success)' : 'var(--danger)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{jukugoFeedback.msg}</div>
                <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {jukugoFeedback.reading}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACCIÓN: BOTÓN MOSTRAR RESPUESTA (SI NO ESTÁ REVELADA Y NO ES QUIZ) */}
        {!isRevealed && (currentExerciseType === EXERCISE_TYPES.FLASHCARD || currentExerciseType === EXERCISE_TYPES.JUKUGO_READING) && (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <button 
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleManualReveal}
              style={{ minWidth: 240, padding: '14px 28px', fontSize: '1.05rem', fontWeight: 700, boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' }}
            >
              Mostrar Respuesta
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Presiona <kbd style={{ padding: '2px 6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'monospace' }}>Espacio</kbd> o clic para voltear
            </span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CARA POSTERIOR REVELADA (DATOS COMPLETOS DEL KANJI)           */}
        {/* ------------------------------------------------------------- */}
        {isRevealed && (
          <div 
            className="srs-revealed-content" 
            style={{ 
              marginTop: 24, 
              paddingTop: 24, 
              borderTop: '2px dashed var(--border)',
              animation: 'fadeIn 0.25s ease'
            }}
          >
            {/* Significado en Español */}
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 16 }}>
              🇪🇸 {currentItem.meaning_es}
            </div>

            {/* Bloque ordenado de lecturas Kun y On */}
            <div style={{ 
              background: 'var(--bg-surface)', 
              padding: '16px', 
              borderRadius: 'var(--radius-md, 12px)', 
              border: '1px solid var(--border)',
              fontSize: '0.95rem', 
              textAlign: 'left', 
              marginBottom: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12
            }}>
              {currentItem.kunyomi && (
                <div style={{ padding: '8px 12px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 2 }}>
                    Kun'yomi (Lectura Japonesa)
                  </div>
                  <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {currentItem.kunyomi}
                  </div>
                </div>
              )}
              {currentItem.onyomi && (
                <div style={{ padding: '8px 12px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 2 }}>
                    On'yomi (Lectura China)
                  </div>
                  <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {currentItem.onyomi}
                  </div>
                </div>
              )}
              {currentItem.pronunciation && !currentItem.kunyomi && !currentItem.onyomi && (
                <div style={{ padding: '8px 12px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 2 }}>
                    Lectura
                  </div>
                  <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {currentItem.pronunciation}
                  </div>
                </div>
              )}
            </div>

            {/* Mnemotécnica */}
            {currentItem.mnemonic && (
              <div style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-main)', 
                background: 'rgba(234, 179, 8, 0.08)', 
                border: '1px solid rgba(234, 179, 8, 0.25)', 
                padding: '12px 16px', 
                borderRadius: 10, 
                textAlign: 'left', 
                marginBottom: 16,
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 700, color: 'var(--warning, #eab308)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                  💡 Mnemotécnica para recordar:
                </div>
                <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  {currentItem.mnemonic}
                </div>
              </div>
            )}

            {/* Pitch Accent */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <PitchAccent 
                word={currentItem.words?.[0]?.word || currentItem.kanji} 
                reading={currentItem.words?.[0]?.reading || primaryReading} 
                mode="full" 
                size="md" 
                showAudio={true} 
              />
            </div>

            {/* Botones de Audio y Pronunciación */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <AudioPlayButton
                text={currentItem.kanji}
                reading={primaryReading}
                size="sm"
                variant="outline"
                label="Escuchar"
              />
              <SpeechPractice 
                targetText={currentItem.kanji} 
                targetKana={primaryReading} 
                acceptableReadings={getAllKanjiReadings(currentItem)}
              />
            </div>

            {/* Vocabulario contextual con este kanji */}
            {currentItem.words && currentItem.words.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={14} /> Vocabulario con este Kanji:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                  {currentItem.words.slice(0, 4).map((w, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        background: 'var(--bg-surface)', 
                        padding: '8px 12px', 
                        borderRadius: 8, 
                        border: '1px solid var(--border)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: 8
                      }}
                    >
                      <div>
                        <div className="jp-text" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                          {w.word} <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>({w.reading})</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {w.meaning}
                        </div>
                      </div>
                      <AudioPlayButton
                        text={w.word}
                        reading={w.reading}
                        size="xs"
                        variant="ghost"
                        title="Escuchar palabra"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. BOTONES DE CALIFICACIÓN FSRS */}
      {isRevealed && (
        <div style={{ marginTop: 22, animation: 'fadeIn 0.25s ease' }}>
          
          {/* Botón de Avance Directo con la calificación recomendada */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => handleRate(suggestedRating || SRSRating.GOOD)}
              style={{
                minWidth: 260,
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
              }}
            >
              <span>Continuar</span>
              <kbd style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.25)', borderRadius: 4, color: '#fff' }}>
                Espacio / Enter
              </kbd>
            </button>
          </div>

          <p style={{ textAlign: 'center', marginBottom: 10, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            O ajusta tu calificación FSRS según tu recuerdo:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {/* 1. AGAIN / OLVIDÉ */}
            <button 
              type="button"
              className="btn btn-danger" 
              onClick={() => handleRate(SRSRating.AGAIN)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 4px',
                gap: 3,
                borderRadius: 12,
                transition: 'all 0.15s ease',
                position: 'relative',
                boxShadow: suggestedRating === SRSRating.AGAIN ? '0 0 0 2.5px #ef4444' : 'none'
              }}
              title="Atajo: Tecla [1]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.88rem' }}>
                <RotateCcw size={14} /> Olvidé
              </div>
              <span style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: 600 }}>
                {intervalPreviews[SRSRating.AGAIN]} <span style={{ opacity: 0.65, fontSize: '0.65rem' }}>[1]</span>
              </span>
            </button>

            {/* 2. HARD / DIFÍCIL */}
            <button 
              type="button"
              className="btn btn-outline" 
              onClick={() => handleRate(SRSRating.HARD)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 4px',
                gap: 3,
                borderRadius: 12,
                borderColor: 'var(--warning, #eab308)',
                color: 'var(--warning, #eab308)',
                transition: 'all 0.15s ease',
                boxShadow: suggestedRating === SRSRating.HARD ? '0 0 0 2.5px #eab308' : 'none'
              }}
              title="Atajo: Tecla [2]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.88rem' }}>
                <Zap size={14} /> Difícil
              </div>
              <span style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: 600 }}>
                {intervalPreviews[SRSRating.HARD]} <span style={{ opacity: 0.65, fontSize: '0.65rem' }}>[2]</span>
              </span>
            </button>

            {/* 3. GOOD / BUENO */}
            <button 
              type="button"
              className="btn btn-outline" 
              onClick={() => handleRate(SRSRating.GOOD)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 4px',
                gap: 3,
                borderRadius: 12,
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                transition: 'all 0.15s ease',
                boxShadow: suggestedRating === SRSRating.GOOD ? '0 0 0 2.5px var(--primary)' : 'none'
              }}
              title="Atajo: Tecla [3]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.88rem' }}>
                <Check size={14} /> Bueno
              </div>
              <span style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: 600 }}>
                {intervalPreviews[SRSRating.GOOD]} <span style={{ opacity: 0.65, fontSize: '0.65rem' }}>[3]</span>
              </span>
            </button>

            {/* 4. EASY / FÁCIL */}
            <button 
              type="button"
              className="btn btn-success" 
              onClick={() => handleRate(SRSRating.EASY)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 4px',
                gap: 3,
                borderRadius: 12,
                transition: 'all 0.15s ease',
                boxShadow: suggestedRating === SRSRating.EASY ? '0 0 0 2.5px #10b981' : 'none'
              }}
              title="Atajo: Tecla [4]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.88rem' }}>
                <Sparkles size={14} /> Fácil
              </div>
              <span style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: 600 }}>
                {intervalPreviews[SRSRating.EASY]} <span style={{ opacity: 0.65, fontSize: '0.65rem' }}>[4]</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 6. PIE DE ATAJOS DE TECLADO */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 18, fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        <span>⌨️ <strong>Atajos:</strong></span>
        <span><kbd style={{ padding: '1px 5px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 3 }}>1 - 4</kbd> Opción o Calificar</span>
        <span><kbd style={{ padding: '1px 5px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 3 }}>Espacio</kbd> Revelar / Avanzar</span>
        <span><kbd style={{ padding: '1px 5px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 3 }}>Z</kbd> Deshacer</span>
        <span><kbd style={{ padding: '1px 5px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 3 }}>Esc</kbd> Salir</span>
      </div>

    </div>
  );
}
