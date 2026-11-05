'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  Undo2, 
  RotateCcw, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  X, 
  Headphones, 
  ListChecks, 
  Layers, 
  Shuffle, 
  Volume2
} from 'lucide-react';
import * as wanakana from 'wanakana';
import exercisesData from '../../data/exercises.json';
import { katakanaToHiragana } from '../../lib/japaneseUtils';
import audioManager from '../../lib/audioManager';
import { 
  SRSRating, 
  getIntervalPreviews, 
  getRatingInfoFromMistakes, 
  triggerSrsFeedback 
} from '../../lib/srs';
import { triggerCheerConfetti } from '../../lib/confetti';
import AudioPlayButton from '../common/AudioPlayButton';
import QuizOptionsGrid from '../common/QuizOptionsGrid';
import PitchAccent from './PitchAccent';
import SpeechPractice from './SpeechPractice';

export const VOCAB_SRS_MODES = {
  DYNAMIC_MIX: 'mix',         // Alterna automáticamente entre Quiz, Audio y Flashcard
  QUIZ_MEANING: 'meaning',     // Kanji/Kana -> 4 significados en español
  QUIZ_REVERSE: 'reverse',     // Español -> 4 palabras en japonés
  LISTENING: 'listening',      // Audio -> Identificar significado
  FLASHCARD: 'flashcard',      // Tarjeta mnemotécnica clásica
  CLOZE_SENTENCE: 'cloze'      // Oraciones en contexto con huecos 【 ？ 】
};

/**
 * Sistema Interactivo y Adaptativo de Repaso Espaciado (SRS) para Vocabulario.
 * Soporta selección múltiple bidireccional, reconocimiento auditivo y flashcards clásicas,
 * con atajos de teclado completos (1-4, Espacio, Z, Esc) y retroalimentación háptica/audio.
 */
export default function VocabSrsReview({
  queue = [],
  allVocab = [],
  onRate,
  onUndo,
  getCurrentCard,
  onExit,
  backLabel = 'Volver a Vocabulario'
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [globalMode, setGlobalMode] = useState(VOCAB_SRS_MODES.DYNAMIC_MIX);
  const [cardOverrideMode, setCardOverrideMode] = useState(null);

  // Estados de Quiz
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizIsAnswered, setQuizIsAnswered] = useState(false);
  const [quizWasCorrect, setQuizWasCorrect] = useState(null);

  // Estados de Cloze Sentences SRS
  const [clozeInput, setClozeInput] = useState('');
  const [clozeFeedback, setClozeFeedback] = useState(null);

  // Historial de respuestas para deshacer
  const [reviewHistory, setReviewHistory] = useState([]);

  // Ítem actual
  const currentItem = queue[currentIndex] || null;
  const isFinished = queue.length > 0 && currentIndex >= queue.length;

  // Resolvedor contextual de oraciones Cloze (data/exercises.json + data/vocabulary.json tatoeba)
  const clozeData = useMemo(() => {
    if (!currentItem) return null;
    const cTarget = currentItem.kanji || currentItem.kana || currentItem.hiragana;

    // 1. Buscar en data/exercises.json (35 ejercicios cloze N4)
    const matchedEx = exercisesData.find(ex => 
      (ex.correct && (ex.correct === currentItem.kanji || ex.correct === currentItem.kana || ex.correct === currentItem.hiragana)) ||
      (ex.sentence && cTarget && ex.sentence.includes(cTarget))
    );
    if (matchedEx) {
      return {
        sentence: matchedEx.sentence,
        masked: matchedEx.masked,
        correct: matchedEx.correct,
        options: matchedEx.options || [],
        prompt_es: matchedEx.prompt_es,
        explanation: matchedEx.explanation
      };
    }

    // 2. Buscar en tatoeba_sentences de vocabulary.json (116 oraciones)
    if (currentItem.tatoeba_sentences && currentItem.tatoeba_sentences.length > 0) {
      const tato = currentItem.tatoeba_sentences[0];
      const jp = tato.jp || '';
      const es = tato.es || currentItem.meaning_es || '';
      let target = currentItem.kanji || currentItem.kana;
      let masked = jp;

      if (target && jp.includes(target)) {
        masked = jp.replace(target, '【 ？ 】');
      } else if (currentItem.kana && jp.includes(currentItem.kana)) {
        target = currentItem.kana;
        masked = jp.replace(currentItem.kana, '【 ？ 】');
      } else if (currentItem.hiragana && jp.includes(currentItem.hiragana)) {
        target = currentItem.hiragana;
        masked = jp.replace(currentItem.hiragana, '【 ？ 】');
      }

      if (masked !== jp) {
        const pool = (allVocab && allVocab.length > 10) ? allVocab : queue;
        const otherWords = pool.filter(v => (v.id || v.kanji) !== (currentItem.id || currentItem.kanji));
        const dist = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 3).map(v => v.kanji || v.kana || v.hiragana);
        const options = [target, ...dist].sort(() => 0.5 - Math.random());

        return {
          sentence: jp,
          masked,
          correct: target,
          options,
          prompt_es: es,
          explanation: `Palabra objetivo: ${target} (${currentItem.meaning_es || ''})`
        };
      }
    }

    // 3. Buscar en example_sentence
    if (currentItem.example_sentence) {
      const jp = currentItem.example_sentence;
      const es = currentItem.example_translation || currentItem.meaning_es || '';
      let target = currentItem.kanji || currentItem.kana;
      let masked = jp;
      if (target && jp.includes(target)) {
        masked = jp.replace(target, '【 ？ 】');
      }
      if (masked !== jp) {
        const pool = (allVocab && allVocab.length > 10) ? allVocab : queue;
        const otherWords = pool.filter(v => (v.id || v.kanji) !== (currentItem.id || currentItem.kanji));
        const dist = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 3).map(v => v.kanji || v.kana || v.hiragana);
        const options = [target, ...dist].sort(() => 0.5 - Math.random());

        return {
          sentence: jp,
          masked,
          correct: target,
          options,
          prompt_es: es,
          explanation: `Palabra objetivo: ${target}`
        };
      }
    }

    return null;
  }, [currentItem, allVocab, queue]);

  // Determinar el modo activo para este ítem
  const activeExerciseType = useMemo(() => {
    if (cardOverrideMode) return cardOverrideMode;
    if (globalMode !== VOCAB_SRS_MODES.DYNAMIC_MIX) {
      if (globalMode === VOCAB_SRS_MODES.CLOZE_SENTENCE && !clozeData) {
        return VOCAB_SRS_MODES.QUIZ_MEANING;
      }
      return globalMode;
    }

    // Si tiene oración cloze, intercalarla dinámicamente en el ciclo
    if (clozeData && currentIndex % 2 === 0) {
      return VOCAB_SRS_MODES.CLOZE_SENTENCE;
    }

    // Mix dinámico basado en índice o características de la palabra
    const cycle = [
      VOCAB_SRS_MODES.QUIZ_MEANING,
      VOCAB_SRS_MODES.LISTENING,
      VOCAB_SRS_MODES.QUIZ_REVERSE,
      VOCAB_SRS_MODES.FLASHCARD
    ];
    return cycle[currentIndex % cycle.length];
  }, [cardOverrideMode, globalMode, currentIndex, clozeData]);

  // Generar 4 opciones para el modo Quiz
  const currentOptions = useMemo(() => {
    if (!currentItem) return [];
    
    // Si no es un modo que requiera opciones, omitir
    if (activeExerciseType === VOCAB_SRS_MODES.FLASHCARD) return [];

    const pool = (allVocab && allVocab.length > 10) ? allVocab : queue;
    const distractors = pool.filter(v => {
      const vKey = v.id || v.kanji || v.kana;
      const cKey = currentItem.id || currentItem.kanji || currentItem.kana;
      return vKey !== cKey && v.meaning_es !== currentItem.meaning_es;
    });

    // Mezclar distractores y tomar 3
    const shuffledDistractors = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3);

    const isReverse = activeExerciseType === VOCAB_SRS_MODES.QUIZ_REVERSE;

    const correctOption = {
      id: currentItem.id || currentItem.kanji || 'correct',
      isCorrect: true,
      label: isReverse 
        ? (currentItem.kanji || currentItem.kana) 
        : currentItem.meaning_es,
      sublabel: isReverse 
        ? (currentItem.kanji ? currentItem.kana : '') 
        : (currentItem.romaji ? `(${currentItem.romaji})` : ''),
      item: currentItem
    };

    const wrongOptions = shuffledDistractors.map((d, idx) => ({
      id: d.id || d.kanji || `wrong_${idx}`,
      isCorrect: false,
      label: isReverse ? (d.kanji || d.kana) : d.meaning_es,
      sublabel: isReverse ? (d.kanji ? d.kana : '') : (d.romaji ? `(${d.romaji})` : ''),
      item: d
    }));

    // Combinar y mezclar las 4 opciones
    return [correctOption, ...wrongOptions].sort(() => 0.5 - Math.random());
  }, [currentItem, activeExerciseType, allVocab, queue]);

  // Al cambiar de ítem, reiniciar estados
  useEffect(() => {
    setIsRevealed(false);
    setQuizSelectedOption(null);
    setQuizIsAnswered(false);
    setQuizWasCorrect(null);
    setCardOverrideMode(null);
    setClozeInput('');
    setClozeFeedback(null);

    // Si es modo listening, reproducir audio automáticamente
    if (activeExerciseType === VOCAB_SRS_MODES.LISTENING && currentItem) {
      const timer = setTimeout(() => {
        if (currentItem.audio_url || currentItem.audio_local) {
          audioManager.playWord(currentItem);
        } else {
          audioManager.speak(currentItem.kana || currentItem.hiragana || currentItem.kanji);
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentItem, activeExerciseType]);

  // Obtener tarjeta FSRS actual y previsualizaciones de intervalos
  const currentCard = useMemo(() => {
    if (!currentItem) return null;
    return typeof getCurrentCard === 'function' ? getCurrentCard(currentItem) : null;
  }, [currentItem, getCurrentCard]);

  const intervals = useMemo(() => {
    return getIntervalPreviews(currentCard);
  }, [currentCard]);

  // Manejador de validación de Cloze por tipeo
  const handleValidateClozeInput = useCallback(() => {
    if (!clozeData || !clozeInput.trim()) return;
    const rawInput = clozeInput.trim();
    const cleanInput = katakanaToHiragana(rawInput);

    // Conjunto de respuestas válidas: objetivo exacto, lecturas en kana y variantes
    const validTargets = new Set();
    const addCandidate = (cand) => {
      if (!cand || typeof cand !== 'string') return;
      const t = cand.trim();
      if (!t) return;
      validTargets.add(t);
      const hira = katakanaToHiragana(t);
      if (hira) validTargets.add(hira);
    };

    addCandidate(clozeData.correct);
    if (currentItem) {
      addCandidate(currentItem.kanji);
      addCandidate(currentItem.kana);
      addCandidate(currentItem.hiragana);
      addCandidate(currentItem.katakana);
    }

    const isCorrect = validTargets.has(rawInput) || validTargets.has(cleanInput);

    setIsRevealed(true);
    setQuizIsAnswered(true);
    setQuizWasCorrect(isCorrect);

    if (isCorrect) {
      triggerCheerConfetti();
      triggerSrsFeedback(SRSRating.Good);
      setClozeFeedback({
        type: 'correct',
        msg: `🎉 ¡Correcto! 「${clozeData.correct}」`
      });
    } else {
      triggerSrsFeedback(SRSRating.Again);
      setClozeFeedback({
        type: 'wrong',
        msg: `❌ Respuesta correcta: 「${clozeData.correct}」`
      });
    }
    audioManager.speak(clozeData.sentence);
  }, [clozeData, clozeInput, currentItem]);

  // Manejador de selección de opción en Cloze
  const handleSelectClozeOption = useCallback((option) => {
    if (quizIsAnswered || !clozeData) return;
    const isCorrect = option === clozeData.correct || 
      (currentItem && (option === currentItem.kanji || option === currentItem.kana || option === currentItem.hiragana));

    setIsRevealed(true);
    setQuizIsAnswered(true);
    setQuizWasCorrect(isCorrect);
    setQuizSelectedOption(option);

    if (isCorrect) {
      triggerCheerConfetti();
      triggerSrsFeedback(SRSRating.Good);
      setClozeFeedback({
        type: 'correct',
        msg: `🎉 ¡Correcto! 「${clozeData.correct}」`
      });
    } else {
      triggerSrsFeedback(SRSRating.Again);
      setClozeFeedback({
        type: 'wrong',
        msg: `❌ Respuesta correcta: 「${clozeData.correct}」`
      });
    }
    audioManager.speak(clozeData.sentence);
  }, [quizIsAnswered, clozeData, currentItem]);

  // Manejador de selección de opción en quiz
  const handleSelectOption = useCallback((optionIdx) => {
    if (quizIsAnswered || !currentOptions[optionIdx]) return;

    const selected = currentOptions[optionIdx];
    const isCorrect = Boolean(selected.isCorrect);

    setQuizSelectedOption(optionIdx);
    setQuizIsAnswered(true);
    setQuizWasCorrect(isCorrect);
    setIsRevealed(true);

    // Retroalimentación háptica y acústica
    triggerSrsFeedback(isCorrect ? SRSRating.Good : SRSRating.Again);
  }, [quizIsAnswered, currentOptions]);

  // Manejador de calificación FSRS
  const handleRate = useCallback((rating) => {
    if (!currentItem) return;

    triggerSrsFeedback(rating);

    // Guardar para deshacer
    setReviewHistory(prev => [...prev, {
      item: currentItem,
      index: currentIndex,
      rating
    }]);

    onRate?.(currentItem, rating);

    if (currentIndex + 1 >= queue.length) {
      triggerCheerConfetti();
    }

    setCurrentIndex(prev => prev + 1);
  }, [currentItem, currentIndex, queue.length, onRate]);

  // Deshacer última revisión
  const handleUndo = useCallback(() => {
    if (reviewHistory.length === 0) return;

    const last = reviewHistory[reviewHistory.length - 1];
    setReviewHistory(prev => prev.slice(0, -1));
    setCurrentIndex(last.index);
    setIsRevealed(false);
    setQuizIsAnswered(false);
    setQuizSelectedOption(null);
    setQuizWasCorrect(null);

    onUndo?.();
  }, [reviewHistory, onUndo]);

  // Manejo de atajos de teclado globales
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }

      // Deshacer con Z
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Salir con Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit?.();
        return;
      }

      // Voltear con Espacio si es flashcard y no está revelada
      if (e.key === ' ' || e.code === 'Space') {
        if (!isRevealed && activeExerciseType === VOCAB_SRS_MODES.FLASHCARD) {
          e.preventDefault();
          setIsRevealed(true);
          return;
        }
      }

      // Teclas 1 - 4
      if (['1', '2', '3', '4'].includes(e.key)) {
        const num = parseInt(e.key, 10);

        // Si la tarjeta está revelada, califica SRS (1: Again, 2: Hard, 3: Good, 4: Easy)
        if (isRevealed) {
          e.preventDefault();
          const ratingMap = {
            1: SRSRating.Again,
            2: SRSRating.Hard,
            3: SRSRating.Good,
            4: SRSRating.Easy
          };
          handleRate(ratingMap[num]);
          return;
        }

        // Si es un quiz o cloze no respondido, selecciona opción (1-4)
        if (!quizIsAnswered) {
          if (activeExerciseType === VOCAB_SRS_MODES.CLOZE_SENTENCE) {
            const clozeOpts = clozeData?.options || [];
            if (clozeOpts.length >= num) {
              e.preventDefault();
              handleSelectClozeOption(clozeOpts[num - 1]);
              return;
            }
          } else if (currentOptions.length >= num) {
            e.preventDefault();
            handleSelectOption(num - 1);
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, quizIsAnswered, activeExerciseType, currentOptions, handleRate, handleSelectOption, handleUndo, onExit]);

  // Pantalla de sesión completada
  if (isFinished || queue.length === 0) {
    return (
      <div className="card text-center" style={{ maxWidth: 520, margin: '40px auto', padding: '40px 24px' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🎉</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
          ¡Sesión de Vocabulario Completada!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.5 }}>
          Has repasado todas las palabras pendientes programadas para hoy con el algoritmo FSRS.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-md"
          onClick={onExit}
          style={{ minWidth: 200 }}
        >
          {backLabel}
        </button>
      </div>
    );
  }

  const primaryPronunciation = currentItem.kana || currentItem.hiragana || currentItem.katakana || currentItem.kanji;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 12px 32px 12px' }}>
      {/* 1. BARRA SUPERIOR DE CONTROL */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onExit}
          style={{ gap: 6, padding: '4px 10px' }}
        >
          <ArrowLeft size={16} />
          <span>{backLabel}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {reviewHistory.length > 0 && (
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={handleUndo}
              title="Deshacer última revisión (Z)"
              style={{ gap: 4 }}
            >
              <Undo2 size={13} /> Deshacer
            </button>
          )}
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {currentIndex + 1} / {queue.length}
          </span>
        </div>
      </div>

      {/* 2. SELECTOR DE MODALIDAD SRS */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 6, 
          marginBottom: 16, 
          flexWrap: 'wrap' 
        }}
      >
        <button
          type="button"
          className={`btn btn-xs ${globalMode === VOCAB_SRS_MODES.DYNAMIC_MIX ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setGlobalMode(VOCAB_SRS_MODES.DYNAMIC_MIX); setCardOverrideMode(null); }}
          style={{ borderRadius: 14, padding: '3px 10px' }}
        >
          <Shuffle size={12} style={{ marginRight: 4 }} /> Mix Dinámico
        </button>
        <button
          type="button"
          className={`btn btn-xs ${globalMode === VOCAB_SRS_MODES.QUIZ_MEANING ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setGlobalMode(VOCAB_SRS_MODES.QUIZ_MEANING); setCardOverrideMode(null); }}
          style={{ borderRadius: 14, padding: '3px 10px' }}
        >
          <ListChecks size={12} style={{ marginRight: 4 }} /> Test Significado
        </button>
        <button
          type="button"
          className={`btn btn-xs ${globalMode === VOCAB_SRS_MODES.LISTENING ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setGlobalMode(VOCAB_SRS_MODES.LISTENING); setCardOverrideMode(null); }}
          style={{ borderRadius: 14, padding: '3px 10px' }}
        >
          <Headphones size={12} style={{ marginRight: 4 }} /> Comprensión Auditiva
        </button>
        <button
          type="button"
          className={`btn btn-xs ${globalMode === VOCAB_SRS_MODES.FLASHCARD ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setGlobalMode(VOCAB_SRS_MODES.FLASHCARD); setCardOverrideMode(null); }}
          style={{ borderRadius: 14, padding: '3px 10px' }}
        >
          <Layers size={12} style={{ marginRight: 4 }} /> Flashcard
        </button>
        <button
          type="button"
          className={`btn btn-xs ${globalMode === VOCAB_SRS_MODES.CLOZE_SENTENCE ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setGlobalMode(VOCAB_SRS_MODES.CLOZE_SENTENCE); setCardOverrideMode(null); }}
          style={{ borderRadius: 14, padding: '3px 10px' }}
        >
          <Sparkles size={12} style={{ marginRight: 4 }} /> Oraciones Cloze
        </button>
      </div>

      {/* 3. TARJETA PRINCIPAL DE REPASO */}
      <div 
        className="card" 
        style={{ 
          padding: '24px 20px', 
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Badges de nivel y categoría */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <span className="vocab-tag" style={{ fontWeight: 700 }}>{currentItem.level || 'N5'}</span>
          {currentItem.category && (
            <span style={{ fontSize: '0.78rem', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>
              {currentItem.category}
            </span>
          )}
          {/* Indicador de modalidad activa */}
          <span style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {activeExerciseType === VOCAB_SRS_MODES.LISTENING && '🎧 Auditivo'}
            {activeExerciseType === VOCAB_SRS_MODES.QUIZ_MEANING && '📝 Selección Múltiple'}
            {activeExerciseType === VOCAB_SRS_MODES.QUIZ_REVERSE && '🔁 Selección Inversa'}
            {activeExerciseType === VOCAB_SRS_MODES.FLASHCARD && '🎴 Flashcard'}
            {activeExerciseType === VOCAB_SRS_MODES.CLOZE_SENTENCE && '🧩 Oración Cloze'}
          </span>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MODO 1: TEST DE SIGNIFICADO (PALABRA -> 4 SIGNIFICADOS EN ESPAÑOL) */}
        {/* ------------------------------------------------------------------ */}
        {activeExerciseType === VOCAB_SRS_MODES.QUIZ_MEANING && (
          <div>
            <div 
              className="jp-text" 
              style={{ 
                fontSize: currentItem.kanji ? '3.6rem' : '2.8rem', 
                fontWeight: 800, 
                color: 'var(--text-main)', 
                margin: '8px 0 12px 0',
                lineHeight: 1.2
              }}
            >
              {currentItem.kanji || currentItem.kana}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <AudioPlayButton
                wordObj={currentItem}
                text={currentItem.kanji}
                reading={primaryPronunciation}
                size="xs"
                variant="outline"
                label="Pista de Audio"
              />
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
              ¿Cuál es el significado correcto en español?
            </p>

            <QuizOptionsGrid
              options={currentOptions}
              selectedOption={quizSelectedOption}
              isAnswered={quizIsAnswered}
              onSelect={(idx) => handleSelectOption(idx)}
              layout="grid"
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* MODO 2: RECONOCIMIENTO AUDITIVO (LISTENING)                        */}
        {/* ------------------------------------------------------------------ */}
        {activeExerciseType === VOCAB_SRS_MODES.LISTENING && (
          <div>
            <div style={{ margin: '14px 0 20px 0' }}>
              <AudioPlayButton
                wordObj={currentItem}
                text={currentItem.kanji}
                reading={primaryPronunciation}
                size="lg"
                variant="pill"
                label="Reproducir Audio"
                style={{ fontSize: '1.05rem', padding: '12px 28px' }}
              />
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
              Escucha atentamente e identifica el significado de la palabra:
            </p>

            <QuizOptionsGrid
              options={currentOptions}
              selectedOption={quizSelectedOption}
              isAnswered={quizIsAnswered}
              onSelect={(idx) => handleSelectOption(idx)}
              layout="grid"
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* MODO 3: SELECCIÓN INVERSA (ESPAÑOL -> PALABRA EN JAPONÉS)         */}
        {/* ------------------------------------------------------------------ */}
        {activeExerciseType === VOCAB_SRS_MODES.QUIZ_REVERSE && (
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '12px 0 6px 0' }}>
              🇪🇸 {currentItem.meaning_es}
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
              ¿Cuál es la palabra japonesa correspondiente?
            </p>

            <QuizOptionsGrid
              options={currentOptions}
              selectedOption={quizSelectedOption}
              isAnswered={quizIsAnswered}
              onSelect={(idx) => handleSelectOption(idx)}
              layout="grid"
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* MODO 4: FLASHCARD CLÁSICA (CARA FRONTAL)                          */}
        {/* ------------------------------------------------------------------ */}
        {activeExerciseType === VOCAB_SRS_MODES.FLASHCARD && !isRevealed && (
          <div>
            <div 
              className="jp-text" 
              style={{ 
                fontSize: currentItem.kanji ? '4rem' : '3rem', 
                fontWeight: 800, 
                color: 'var(--text-main)', 
                margin: '12px 0 16px 0',
                lineHeight: 1.2
              }}
            >
              {currentItem.kanji || currentItem.kana}
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
              ¿Recuerdas la lectura en Kana y el significado en español?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <AudioPlayButton
                wordObj={currentItem}
                text={currentItem.kanji}
                reading={primaryPronunciation}
                size="sm"
                variant="outline"
                label="Pista de Audio"
              />
            </div>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => setIsRevealed(true)}
                style={{ minWidth: 230, padding: '12px 24px', fontWeight: 700 }}
              >
                Mostrar Respuesta
              </button>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Presiona <kbd style={{ padding: '2px 6px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 4 }}>Espacio</kbd> o clic para voltear
              </span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* MODO 5: CLOZE SENTENCES SRS (ORACIÓN CON HUECO 【 ？ 】 EN CONTEXTO) */}
        {/* ------------------------------------------------------------------ */}
        {activeExerciseType === VOCAB_SRS_MODES.CLOZE_SENTENCE && clozeData && (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, marginBottom: 12 }}>
              <Sparkles size={13} />
              <span>Vocabulario en Contexto · Oración Cloze</span>
            </div>

            {/* Traducción en español como prompt contextual */}
            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 14 }}>
              🇪🇸 {clozeData.prompt_es}
            </p>

            {/* Oración con máscara 【 ？ 】 */}
            <div 
              className="jp-text" 
              style={{ 
                fontSize: 'clamp(1.4rem, 5vw, 1.9rem)', 
                fontWeight: 700, 
                lineHeight: 1.6, 
                margin: '12px auto 18px',
                padding: '14px 18px',
                background: 'var(--bg-main)',
                borderRadius: 14,
                border: '1.5px solid var(--border)',
                maxWidth: 540
              }}
            >
              {clozeData.masked}
            </div>

            {/* Alternador o input directo con Wanakana */}
            {!quizIsAnswered && (
              <div style={{ maxWidth: 360, margin: '0 auto 16px auto' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="japanese-input jp-text"
                    placeholder="Escribe la palabra en kana..."
                    value={clozeInput}
                    onChange={(e) => {
                      const converted = wanakana.toKana(e.target.value, { IMEMode: true });
                      setClozeInput(converted);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleValidateClozeInput();
                    }}
                    autoFocus
                    style={{ flex: 1, padding: '10px 14px', fontSize: '1.1rem', textAlign: 'center', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleValidateClozeInput}
                    style={{ padding: '10px 18px', borderRadius: 12, fontWeight: 700 }}
                  >
                    Validar
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  🇯🇵 IME Romaji → Kana activo
                </div>
              </div>
            )}

            {/* Opciones múltiples si el ejercicio tiene options */}
            {clozeData.options && clozeData.options.length > 0 && !quizIsAnswered && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, maxWidth: 440, margin: '0 auto 16px auto' }}>
                {clozeData.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleSelectClozeOption(opt)}
                    style={{ padding: '10px 14px', borderRadius: 10, fontSize: '1.1rem', fontWeight: 700 }}
                  >
                    <span className="jp-text">{opt}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Feedback */}
            {clozeFeedback && (
              <div 
                style={{ 
                  marginTop: 12, 
                  padding: '12px 16px', 
                  borderRadius: 12, 
                  background: clozeFeedback.type === 'correct' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1.5px solid ${clozeFeedback.type === 'correct' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  color: clozeFeedback.type === 'correct' ? 'var(--success)' : 'var(--danger)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{clozeFeedback.msg}</div>
                <div className="jp-text" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {clozeData.sentence}
                </div>
                {clozeData.explanation && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {clozeData.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* CARA POSTERIOR REVELADA (DETALLE COMPLETO Y HERRAMIENTAS)         */}
        {/* ------------------------------------------------------------------ */}
        {isRevealed && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', animation: 'fadeIn 0.22s ease' }}>
            {/* Si fue quiz, mostrar mensaje de acierto/error */}
            {quizIsAnswered && (
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 6, 
                  padding: '4px 12px', 
                  borderRadius: 16, 
                  fontSize: '0.85rem', 
                  fontWeight: 700, 
                  marginBottom: 14,
                  background: quizWasCorrect ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
                  color: quizWasCorrect ? '#10b981' : '#ef4444',
                  border: `1px solid ${quizWasCorrect ? '#10b981' : '#ef4444'}`
                }}
              >
                {quizWasCorrect ? <Check size={14} /> : <X size={14} />}
                <span>{quizWasCorrect ? '¡Correcto!' : '¡Incorrecto! Repásalo a continuación'}</span>
              </div>
            )}

            {/* Kanji Principal (si existe) */}
            {currentItem.kanji && (
              <div className="jp-text" style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
                {currentItem.kanji}
              </div>
            )}

            {/* Lectura Kana y Romaji */}
            <div className="jp-text" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>
              {currentItem.kana || currentItem.hiragana || ''}
              {currentItem.romaji && (
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 8 }}>
                  ({currentItem.romaji})
                </span>
              )}
            </div>

            {/* Pitch Accent */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <PitchAccent
                word={currentItem.kanji || currentItem.kana}
                reading={currentItem.kana || currentItem.hiragana}
                mode="full"
                size="md"
                showAudio={true}
              />
            </div>

            {/* Significados */}
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
              🇪🇸 {currentItem.meaning_es}
            </div>
            {currentItem.meaning_en && (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                🇬🇧 {currentItem.meaning_en}
              </div>
            )}

            {/* Herramientas de audio y pronunciación */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 14, marginBottom: 8 }}>
              <AudioPlayButton
                wordObj={currentItem}
                text={currentItem.kanji}
                reading={primaryPronunciation}
                size="sm"
                variant="outline"
                label="Escuchar"
              />
              <SpeechPractice
                targetText={currentItem.kanji || currentItem.kana}
                targetKana={currentItem.kana || currentItem.hiragana}
                acceptableReadings={[currentItem.kana, currentItem.hiragana, currentItem.katakana].filter(Boolean)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTONES DE CALIFICACIÓN FSRS */}
      {isRevealed && (
        <div style={{ marginTop: 20, animation: 'fadeIn 0.25s ease' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ¿Qué tan bien lo recordaste?
          </div>
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: 8, 
              maxWidth: 580, 
              margin: '0 auto' 
            }}
          >
            {/* Otra vez (1) */}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleRate(SRSRating.Again)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px',
                borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.06)', borderRadius: 10
              }}
            >
              <span style={{ fontSize: '0.74rem', color: '#ef4444', fontWeight: 800 }}>1 · Otra vez</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444', marginTop: 2 }}>
                {intervals[SRSRating.Again] || '<10m'}
              </span>
            </button>

            {/* Difícil (2) */}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleRate(SRSRating.Hard)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px',
                borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.06)', borderRadius: 10
              }}
            >
              <span style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 800 }}>2 · Difícil</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>
                {intervals[SRSRating.Hard] || '1d'}
              </span>
            </button>

            {/* Bien (3) */}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleRate(SRSRating.Good)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px',
                borderColor: 'rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.06)', borderRadius: 10
              }}
            >
              <span style={{ fontSize: '0.74rem', color: '#3b82f6', fontWeight: 800 }}>3 · Bien</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3b82f6', marginTop: 2 }}>
                {intervals[SRSRating.Good] || '3d'}
              </span>
            </button>

            {/* Fácil (4) */}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleRate(SRSRating.Easy)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px',
                borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.06)', borderRadius: 10
              }}
            >
              <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 800 }}>4 · Fácil</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                {intervals[SRSRating.Easy] || '7d'}
              </span>
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Atajos: <kbd style={{ padding: '1px 5px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 3 }}>1 - 4</kbd> Calificar · <kbd style={{ padding: '1px 5px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 3 }}>Z</kbd> Deshacer · <kbd style={{ padding: '1px 5px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 3 }}>Esc</kbd> Salir
          </div>
        </div>
      )}
    </div>
  );
}
