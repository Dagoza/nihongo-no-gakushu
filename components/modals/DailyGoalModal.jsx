'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Flame, Star, CheckCircle2, RotateCcw, Volume2, Eye, EyeOff, Sparkles, ArrowRight, Bell, Award, Languages, Layers, Target, Check, Settings2, Info } from 'lucide-react';
import { useApp } from '../../lib/AppContext';
import { SRSRating, isDue, reviewQuestionCard } from '../../lib/srs';
import { recordDailyGoalActivity, saveState } from '../../lib/storage';
import audioManager from '../../lib/audioManager';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  isDailyReminderEnabled, 
  requestNotificationPermission 
} from '../../lib/notificationManager';

import jlptExamsData from '../../data/jlpt_exams.json';
import particlesData from '../../data/particles.json';
import vocabularyData from '../../data/vocabulary.json';
import kanjiData from '../../data/kanji.json';

const SESSION_STORAGE_KEY = 'nihongo_daily_goal_active_session';

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getSavedQuizSession(cat, lvl, tgt) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];
    if (
      parsed.date === today &&
      parsed.category === cat &&
      parsed.level === lvl &&
      parsed.target === tgt &&
      Array.isArray(parsed.queue) &&
      parsed.queue.length > 0 &&
      !parsed.completed
    ) {
      return parsed;
    }
  } catch {}
  return null;
}

function saveQuizSession(sessionData) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  } catch {}
}

function clearQuizSession() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
}

const CATEGORIES = [
  { id: 'all', label: 'Mix Inteligente', shortLabel: 'Mix', icon: Sparkles, desc: 'Prioriza repaso FSRS y combina todos los temas' },
  { id: 'kanji', label: 'Kanji', shortLabel: 'Kanji', icon: Languages, desc: 'Lectura On/Kun, trazos y significado' },
  { id: 'vocab', label: 'Vocabulario', shortLabel: 'Vocab', icon: Layers, desc: 'Significado, contexto y lectura en kana' },
  { id: 'grammar', label: 'Gramática', shortLabel: 'Gramática', icon: Target, desc: 'Partículas y estructuras esenciales' },
  { id: 'jlpt', label: 'Examen JLPT', shortLabel: 'JLPT', icon: Award, desc: 'Preguntas oficiales de simulacro por nivel' }
];

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function DailyGoalModal({ isOpen, onClose }) {
  const { appState, onUpdateState, openTour, openNotificationSettings } = useApp();
  const appStateRef = useRef(appState);

  appStateRef.current = appState;
  const wasOpenRef = useRef(false);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [targetCount, setTargetCount] = useState(5);
  const [showConfig, setShowConfig] = useState(false);

  // Quiz execution state
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); // { isCorrect, explanation, userRating }
  const [showFurigana, setShowFurigana] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [statsGained, setStatsGained] = useState({ xp: 0, correct: 0 });

  // Notification state
  const [notifPermission, setNotifPermission] = useState('default');

  // Build the questions queue based on preferences and FSRS due items
  const generateQueue = useCallback((cat = selectedCategory, lvl = selectedLevel, tgt = targetCount, forceNew = false) => {
    // Si no se fuerza una nueva tanda, verificar si ya hay una sesión activa para hoy
    if (!forceNew) {
      const saved = getSavedQuizSession(cat, lvl, tgt);
      if (saved) {
        setQueue(saved.queue);
        setCurrentIndex(saved.currentIndex || 0);
        setSelectedOption(null);
        setFeedback(null);
        setSessionCompleted(false);
        setStatsGained(saved.statsGained || { xp: 0, correct: 0 });
        setShowConfig(false);
        return;
      }
    }

    // 1. Preguntas oficiales de examen JLPT
    const filteredJlpt = (jlptExamsData || []).filter(q => {
      if (cat !== 'all' && cat !== 'jlpt') return false;
      return q.level === lvl;
    }).map(q => ({
      ...q,
      category: 'jlpt'
    }));

    // 2. Preguntas de gramática y partículas bien estructuradas
    const filteredParticles = [];
    (particlesData || []).forEach(p => {
      if (cat !== 'all' && cat !== 'grammar') return false;
      if (p.level && p.level !== lvl) return false;
      if (p.quiz_items && p.quiz_items.length > 0) {
        p.quiz_items.forEach((qi, qIdx) => {
          const correctOpt = qi.correct || p.particle;
          const example = (p.examples || []).find(e => e.ja === qi.sentence) || p.examples?.[qIdx] || p.examples?.[0];
          const esTrans = example?.es ? `Traducción: «${example.es}»` : '';
          const roleDesc = p.role_es || p.meaning_es || 'Función gramatical';
          const formulaDesc = p.formula ? `• Estructura: ${p.formula}` : '';
          const noteDesc = qi.explanation ? `• Nota: ${qi.explanation}` : '';

          let rawOpts = Array.isArray(qi.options) && qi.options.length >= 2 
            ? qi.options 
            : [correctOpt, 'は', 'が', 'を', 'に', 'で'];
          const uniqueOpts = Array.from(new Set([correctOpt, ...rawOpts]));
          let shuffledOpts = shuffleArray(uniqueOpts).slice(0, 4);
          if (!shuffledOpts.includes(correctOpt)) {
            shuffledOpts[0] = correctOpt;
          }
          const finalOpts = shuffleArray(shuffledOpts);
          const correctIndex = finalOpts.indexOf(correctOpt);

          const maskedDisplay = qi.masked 
            ? qi.masked.replace(/【\s*？\s*】/g, '<span style="color: var(--primary); text-decoration: underline; font-weight: 800;">【 ？ 】</span>')
            : qi.sentence;

          filteredParticles.push({
            id: `part_quiz_${p.id || p.particle}_${qIdx}`,
            category: 'grammar',
            level: p.level || 'N5',
            question: `¿Qué partícula completa correctamente la oración?<br/><div style="margin-top: 10px; font-size: 1.25rem; letter-spacing: 0.5px;">${maskedDisplay}</div>`,
            options: finalOpts,
            correctIndex,
            explanation: `• Oración: 「${qi.sentence}」\n${esTrans ? '• ' + esTrans + '\n' : ''}• Partícula correcta: 「${correctOpt}」 (${roleDesc}).\n${formulaDesc ? formulaDesc + '\n' : ''}${noteDesc}`.trim(),
            furigana: qi.sentence || '',
            targetItem: p.particle
          });
        });
      }
    });

    // 3. Preguntas de vocabulario con distractores aleatorios
    const filteredVocab = (vocabularyData || []).filter(v => {
      if (cat !== 'all' && cat !== 'vocab') return false;
      return v.level === lvl && (v.meaning_es || v.meaning_en);
    }).map(v => {
      const correctMeaning = v.meaning_es || v.meaning_en;
      const wrongPool = shuffleArray((vocabularyData || []).filter(x => x.id !== v.id && (x.meaning_es || x.meaning_en) && (x.meaning_es || x.meaning_en) !== correctMeaning));
      const wrong = wrongPool.slice(0, 3).map(x => x.meaning_es || x.meaning_en);
      const allOpts = shuffleArray([correctMeaning, ...wrong]);
      const ex = v.tatoeba_sentences?.[0];
      const exLine = ex ? `\n• Ejemplo: 「${ex.jp}」 → «${ex.es}»` : '';

      return {
        id: `vocab_q_${v.id}`,
        category: 'vocab',
        level: v.level || 'N5',
        question: `¿Cuál es el significado de la palabra 「<span style="color: var(--primary); font-weight: 700;">${v.kanji || v.hiragana}</span>」?<br/><span style="font-size: 0.95rem; font-weight: 500; color: var(--text-muted);">Lectura: ${v.hiragana}</span>`,
        options: allOpts,
        correctIndex: allOpts.indexOf(correctMeaning),
        explanation: `• Palabra: 「${v.kanji || v.hiragana}」 (${v.hiragana})\n• Significado: ${correctMeaning}${exLine}`.trim(),
        furigana: v.hiragana,
        targetItem: v.id
      };
    });

    // 4. Preguntas de kanji con distractores aleatorios
    const filteredKanji = (kanjiData || []).filter(k => {
      if (cat !== 'all' && cat !== 'kanji') return false;
      return k.level === lvl && (k.meaning_es || k.meaning_en);
    }).map(k => {
      const correctMeaning = k.meaning_es || k.meaning_en;
      const wrongPool = shuffleArray((kanjiData || []).filter(x => x.kanji !== k.kanji && (x.meaning_es || x.meaning_en) && (x.meaning_es || x.meaning_en) !== correctMeaning));
      const wrong = wrongPool.slice(0, 3).map(x => x.meaning_es || x.meaning_en);
      const allOpts = shuffleArray([correctMeaning, ...wrong]);
      const wordEx = k.words?.[0] ? `\n• Compuesto: 「${k.words[0].word}」 (${k.words[0].reading}) = ${k.words[0].meaning}` : '';
      const mnem = k.mnemonic ? `\n• Mnemotecnia: ${k.mnemonic}` : '';

      return {
        id: `kanji_q_${k.kanji}`,
        category: 'kanji',
        level: k.level || 'N5',
        question: `¿Cuál es el significado principal del kanji 「<span style="font-size: 1.45rem; color: var(--primary); font-weight: 800;">${k.kanji}</span>」?`,
        options: allOpts,
        correctIndex: allOpts.indexOf(correctMeaning),
        explanation: `• Kanji: 「${k.kanji}」\n• Significado: ${correctMeaning}\n• Lecturas: Onyomi: ${k.onyomi || '—'} | Kunyomi: ${k.kunyomi || '—'}${mnem}${wordEx}`.trim(),
        furigana: (k.kun_readings || [])[0] || (k.on_readings || [])[0] || '',
        targetItem: k.kanji
      };
    });

    // Combinar pool según categoría
    let pool = [];
    if (cat === 'jlpt') {
      pool = filteredJlpt;
    } else if (cat === 'grammar') {
      pool = filteredParticles;
    } else if (cat === 'vocab') {
      pool = filteredVocab;
    } else if (cat === 'kanji') {
      pool = filteredKanji;
    } else {
      pool = [
        ...filteredJlpt,
        ...filteredParticles,
        ...filteredVocab,
        ...filteredKanji
      ];
    }

    if (pool.length === 0) {
      pool = (jlptExamsData || []).map(q => ({ ...q, category: 'jlpt' }));
    }

    // Priorizar tarjetas FSRS pendientes de repaso
    const srsDue = [];
    const nonDue = [];

    pool.forEach(item => {
      const card = appStateRef.current?.srsQuestions?.[item.id];
      if (card && isDue(card)) {
        srsDue.push(item);
      } else {
        nonDue.push(item);
      }
    });

    const finalQueue = [...shuffleArray(srsDue), ...shuffleArray(nonDue)].slice(0, tgt);

    // Guardar sesión activa en storage para persistencia ante bloqueos de pantalla o idles
    const today = new Date().toISOString().split('T')[0];
    saveQuizSession({
      date: today,
      category: cat,
      level: lvl,
      target: tgt,
      queue: finalQueue,
      currentIndex: 0,
      statsGained: { xp: 0, correct: 0 },
      completed: false
    });

    setQueue(finalQueue);
    setCurrentIndex(0);
    setSelectedOption(null);
    setFeedback(null);
    setSessionCompleted(false);
    setStatsGained({ xp: 0, correct: 0 });
    setShowConfig(false);
  }, [selectedCategory, selectedLevel, targetCount]);

  // Generate queue only on modal open transition (false -> true), NOT on internal state updates
  useEffect(() => {
    if (isOpen) {
      if (!wasOpenRef.current) {
        const goal = appStateRef.current?.dailyGoal || {};
        const cat = goal.category || selectedCategory;
        const lvl = goal.level || selectedLevel;
        const tgt = goal.target || targetCount;
        if (goal.category) setSelectedCategory(goal.category);
        if (goal.level) setSelectedLevel(goal.level);
        if (goal.target) setTargetCount(goal.target);
        if (typeof window !== 'undefined') {
          setNotifPermission(getNotificationPermission());
          setIsNotifActive(isDailyReminderEnabled());
        }
        generateQueue(cat, lvl, tgt);
      }
    } else {
      setShowConfig(false);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, generateQueue, selectedCategory, selectedLevel, targetCount]);

  // Clean option selection and feedback whenever question index changes
  useEffect(() => {
    setSelectedOption(null);
    setFeedback(null);
  }, [currentIndex]);

  const currentQuestion = queue[currentIndex];
  const canShowSettings = currentIndex === 0 && selectedOption === null && !feedback && !sessionCompleted;

  // Handle answering an option
  const handleSelectOption = (index) => {
    if (feedback || !currentQuestion) return;

    setShowConfig(false);
    setSelectedOption(index);
    const isCorrect = index === currentQuestion.correctIndex;

    // Process FSRS review for this question
    const currentCard = appState?.srsQuestions?.[currentQuestion.id];
    const rating = isCorrect ? SRSRating.GOOD : SRSRating.AGAIN;
    const newCard = reviewQuestionCard(currentCard, rating);

    // Save question card in appState.srsQuestions
    const updatedState = {
      ...appState,
      srsQuestions: {
        ...(appState.srsQuestions || {}),
        [currentQuestion.id]: newCard
      }
    };

    // Record daily goal progress and XP
    const savedState = recordDailyGoalActivity(updatedState, isCorrect);
    if (onUpdateState) {
      onUpdateState(savedState);
    }

    // Play feedback audio if enabled (safely wrapped)
    try {
      if (isCorrect) {
        audioManager.playSfx?.('correct');
      } else {
        audioManager.playSfx?.('wrong');
      }
    } catch {}

    setFeedback({
      isCorrect,
      explanation: currentQuestion.explanation,
      rating
    });

    setStatsGained(prev => {
      const nextStats = {
        xp: prev.xp + (isCorrect ? 15 : 5),
        correct: prev.correct + (isCorrect ? 1 : 0)
      };
      const saved = getSavedQuizSession(selectedCategory, selectedLevel, targetCount);
      if (saved) {
        saveQuizSession({
          ...saved,
          currentIndex,
          statsGained: nextStats
        });
      }
      return nextStats;
    });
  };

  // Next question or complete
  const handleNext = () => {
    setSelectedOption(null);
    setFeedback(null);
    const nextIdx = currentIndex + 1;
    if (nextIdx < queue.length) {
      setCurrentIndex(nextIdx);
      const saved = getSavedQuizSession(selectedCategory, selectedLevel, targetCount);
      if (saved) {
        saveQuizSession({
          ...saved,
          currentIndex: nextIdx,
          statsGained
        });
      }
    } else {
      setSessionCompleted(true);
      clearQuizSession();
      try {
        audioManager.playSfx?.('complete');
      } catch {}
    }
  };

  // Allow manual rating override with FSRS (Again, Hard, Good, Easy)
  const handleManualRating = (customRating) => {
    if (!currentQuestion) return;
    const currentCard = appState?.srsQuestions?.[currentQuestion.id];
    const newCard = reviewQuestionCard(currentCard, customRating);
    const updated = {
      ...appState,
      srsQuestions: {
        ...(appState.srsQuestions || {}),
        [currentQuestion.id]: newCard
      }
    };
    saveState(updated);
    if (onUpdateState) onUpdateState(updated);
    setFeedback(prev => ({ ...prev, rating: customRating }));
  };

  // Mobile / Web Notification opt-in handler
  const handleEnableNotifications = async () => {
    const success = await requestNotificationPermission();
    if (success) {
      setNotifPermission('granted');
      setIsNotifActive(true);
    }
  };

  if (!isOpen) return null;

  const dailyGoal = appState?.dailyGoal || {};
  const todayProgress = dailyGoal.answeredToday || 0;
  const isGoalReached = dailyGoal.completed || todayProgress >= (dailyGoal.target || 5);
  const currentStreak = appState?.streak || 1;

  return (
    <div className="modal-backdrop" style={{ zIndex: 1200 }}>
      <div 
        className="modal-content daily-goal-modal"
        style={{ 
          maxWidth: 680, 
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 20
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Meta Diaria de Práctica"
      >
        {/* Header Bar */}
        <div className="daily-goal-header">
          <div className="daily-goal-header-top">
            <div className="daily-goal-title-group">
              <div className="daily-goal-flame-icon">
                <Flame size={18} />
              </div>
              <div className="daily-goal-title-wrap">
                <h3 className="daily-goal-title">
                  Meta Diaria <span className="daily-goal-title-sub">· Reto de Hoy</span>
                </h3>
                <span className={`daily-goal-status-badge ${isGoalReached ? 'reached' : ''}`}>
                  {isGoalReached ? '✓ Cumplida' : `${todayProgress}/${dailyGoal.target || 5} resueltas`}
                </span>
              </div>
            </div>

            <div className="daily-goal-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="tour-info-shortcut-btn"
                onClick={() => {
                  onClose();
                  if (openTour) {
                    openTour('daily_goal');
                  } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
                    window.__nihongoOpenTour('daily_goal');
                  }
                }}
                title="Ver guía y explicación de la Meta Diaria en el tour"
                aria-label="Guía de Meta Diaria"
                style={{ padding: '3px 8px', fontSize: '0.74rem' }}
              >
                <Info size={13} />
                <span>Guía</span>
              </button>

              <button
                type="button"
                className="btn-icon daily-goal-close-btn"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="daily-goal-header-sub">
            <span>Racha actual: <strong style={{ color: 'var(--text-main)' }}>{currentStreak} días 🔥</strong></span>
            {canShowSettings && (
              <button
                type="button"
                className="btn btn-outline btn-sm daily-goal-settings-btn"
                onClick={() => setShowConfig(prev => !prev)}
                title="Configurar tema, nivel y cantidad de preguntas"
              >
                <Settings2 size={13} />
                <span>Ajustes</span>
              </button>
            )}
          </div>
        </div>

        {/* Configuration Drawer / Settings Bar */}
        {showConfig && (
          <div style={{
            padding: '16px 20px',
            background: 'var(--bg-main)',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                CATEGORÍA TEMÁTICA
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`}
                      style={{ borderRadius: 8, fontSize: '0.8rem', gap: 6 }}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        const updated = {
                          ...appState,
                          dailyGoal: { ...(appState.dailyGoal || {}), category: cat.id }
                        };
                        saveState(updated);
                        if (onUpdateState) onUpdateState(updated);
                      }}
                    >
                      <Icon size={14} />
                      <span>{cat.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  NIVEL JLPT
                </label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {JLPT_LEVELS.map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      className={`btn btn-sm ${selectedLevel === lvl ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: 6 }}
                      onClick={() => {
                        setSelectedLevel(lvl);
                        const updated = {
                          ...appState,
                          dailyGoal: { ...(appState.dailyGoal || {}), level: lvl }
                        };
                        saveState(updated);
                        if (onUpdateState) onUpdateState(updated);
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  PREGUNTAS POR DÍA
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[3, 5, 10].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      className={`btn btn-sm ${targetCount === cnt ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: 6 }}
                      onClick={() => {
                        setTargetCount(cnt);
                        const updated = {
                          ...appState,
                          dailyGoal: { ...(appState.dailyGoal || {}), target: cnt }
                        };
                        saveState(updated);
                        if (onUpdateState) onUpdateState(updated);
                      }}
                    >
                      {cnt} preguntas
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginLeft: 'auto', marginTop: 14 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowConfig(false);
                    clearQuizSession();
                    generateQueue(selectedCategory, selectedLevel, targetCount, true);
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Aplicar & Reiniciar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
          {!sessionCompleted && currentQuestion ? (
            <div>
              {/* Progress and Topic Chips */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--primary, #6366f1)'
                  }}>
                    {currentQuestion.category === 'kanji' ? '🈸 Kanji' :
                     currentQuestion.category === 'vocab' ? '📖 Vocabulario' :
                     currentQuestion.category === 'grammar' ? '⚡ Gramática' :
                     `🎯 JLPT ${currentQuestion.level}`}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Pregunta {currentIndex + 1} de {queue.length}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Furigana toggle */}
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 6, color: 'var(--text-main)', borderColor: 'var(--border)' }}
                    onClick={() => setShowFurigana(prev => !prev)}
                    title={showFurigana ? 'Ocultar Furigana' : 'Mostrar Furigana'}
                  >
                    {showFurigana ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span className="hidden-xs">Furigana</span>
                  </button>

                  {/* Audio speech button */}
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px', borderRadius: 6, color: 'var(--text-main)', borderColor: 'var(--border)' }}
                    onClick={() => {
                      const textToSpeak = currentQuestion.furigana || currentQuestion.question;
                      audioManager.speak(textToSpeak.replace(/<[^>]*>/g, ''));
                    }}
                    title="Escuchar audio de la pregunta"
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, width: '100%', background: 'var(--border)', borderRadius: 999, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round(((currentIndex + (feedback ? 1 : 0)) / queue.length) * 100)}%`,
                  background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {/* Question Text Box */}
              <div 
                className="daily-goal-question-card"
                style={{
                  background: 'var(--bg-main)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 14,
                  padding: '20px',
                  marginBottom: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                {currentQuestion.passage && (
                  <div style={{
                    padding: '12px 14px',
                    background: 'var(--bg-surface)',
                    borderRadius: 10,
                    marginBottom: 14,
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                    borderLeft: '4px solid var(--primary)',
                    border: '1px solid var(--border)'
                  }}>
                    {currentQuestion.passage}
                  </div>
                )}

                <div 
                  className="jp-text"
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                    marginBottom: 8
                  }}
                  dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                />

                {showFurigana && currentQuestion.furigana && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {currentQuestion.furigana}
                  </div>
                )}
              </div>

              {/* Options Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 20 }}>
                {currentQuestion.options.map((opt, oIdx) => {
                  let optStyle = {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg-surface)',
                    cursor: feedback ? 'default' : 'pointer',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    transition: 'all 0.15s ease'
                  };

                  if (feedback) {
                    if (oIdx === currentQuestion.correctIndex) {
                      optStyle.borderColor = 'var(--success, #10b981)';
                      optStyle.background = 'rgba(16, 185, 129, 0.15)';
                      optStyle.color = 'var(--success, #10b981)';
                    } else if (oIdx === selectedOption) {
                      optStyle.borderColor = 'var(--danger, #ef4444)';
                      optStyle.background = 'rgba(239, 68, 68, 0.15)';
                      optStyle.color = 'var(--danger, #ef4444)';
                    } else {
                      optStyle.opacity = 0.5;
                    }
                  } else if (selectedOption === oIdx) {
                    optStyle.borderColor = 'var(--primary)';
                    optStyle.background = 'var(--primary-bg)';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      className="daily-goal-opt-btn"
                      style={optStyle}
                      disabled={!!feedback}
                      onClick={() => handleSelectOption(oIdx)}
                    >
                      <span className="jp-text" style={{ flex: 1, textAlign: 'left', color: optStyle.color || 'var(--text-main)' }}>
                        {opt}
                      </span>
                      {feedback && oIdx === currentQuestion.correctIndex && (
                        <CheckCircle2 size={18} color="var(--success, #10b981)" />
                      )}
                      {feedback && oIdx === selectedOption && oIdx !== currentQuestion.correctIndex && (
                        <X size={18} color="var(--danger, #ef4444)" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Pedagogical Explanation Box */}
              {feedback && (
                <div style={{
                  padding: '16px 20px',
                  borderRadius: 14,
                  background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${feedback.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  marginBottom: 20
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8
                  }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: feedback.isCorrect ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)'
                    }}>
                      {feedback.isCorrect ? '🎉 ¡Respuesta Correcta! (+15 XP)' : '❌ Respuesta Incorrecta (+5 XP)'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Algoritmo FSRS actualizado
                    </span>
                  </div>

                  <div style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                    margin: '0 0 12px',
                    whiteSpace: 'pre-line'
                  }}>
                    {feedback.explanation}
                  </div>

                  {/* FSRS Rating Adjustment Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 10,
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    flexWrap: 'wrap',
                    gap: 8
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Calificar dificultad en memoria:
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${feedback.rating === SRSRating.AGAIN ? 'btn-danger' : 'btn-outline'}`}
                        style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: 6 }}
                        onClick={() => handleManualRating(SRSRating.AGAIN)}
                      >
                        Repetir (&lt;10m)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${feedback.rating === SRSRating.HARD ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: 6 }}
                        onClick={() => handleManualRating(SRSRating.HARD)}
                      >
                        Difícil (1d)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${feedback.rating === SRSRating.GOOD ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: 6 }}
                        onClick={() => handleManualRating(SRSRating.GOOD)}
                      >
                        Bien (3d)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${feedback.rating === SRSRating.EASY ? 'btn-success' : 'btn-outline'}`}
                        style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: 6 }}
                        onClick={() => handleManualRating(SRSRating.EASY)}
                      >
                        Fácil (7d)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                {feedback && (
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    style={{ borderRadius: 12, padding: '12px 24px', fontWeight: 700 }}
                    onClick={handleNext}
                  >
                    <span>{currentIndex + 1 < queue.length ? 'Siguiente Pregunta' : 'Completar Meta'}</span>
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          ) : sessionCompleted ? (
            /* Celebration / Completion Screen */
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
              }}>
                <Check size={36} strokeWidth={3} />
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>
                ¡Meta Diaria Cumplida! 🎉
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 24px' }}>
                Has completado tu cuota de práctica para hoy. Tu racha de estudio se ha mantenido y los intervalos de repetición FSRS se han reprogramado con éxito.
              </p>

              {/* Stats Highlights */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                maxWidth: 440,
                margin: '0 auto 28px'
              }}>
                <div style={{
                  padding: '16px 12px',
                  borderRadius: 14,
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ color: 'var(--accent, #f59e0b)', marginBottom: 4 }}>
                    <Flame size={22} style={{ margin: '0 auto' }} />
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {currentStreak} días
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Racha Activa</div>
                </div>

                <div style={{
                  padding: '16px 12px',
                  borderRadius: 14,
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ color: 'var(--primary, #6366f1)', marginBottom: 4 }}>
                    <Star size={22} style={{ margin: '0 auto' }} />
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    +{statsGained.xp} XP
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ganados Hoy</div>
                </div>

                <div style={{
                  padding: '16px 12px',
                  borderRadius: 14,
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ color: 'var(--success, #10b981)', marginBottom: 4 }}>
                    <CheckCircle2 size={22} style={{ margin: '0 auto' }} />
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {statsGained.correct}/{queue.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aciertos</div>
                </div>
              </div>

              {/* Mobile Push Notification Opt-in or Configure Prompt */}
              {isNotificationSupported() && (
                <div style={{
                  maxWidth: 480,
                  margin: '0 auto 28px',
                  padding: '16px',
                  borderRadius: 14,
                  background: notifPermission === 'granted' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                  border: `1px solid ${notifPermission === 'granted' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.25)'}`,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14
                }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: notifPermission === 'granted' ? '#10b981' : 'var(--primary, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0
                  }}>
                    <Bell size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      {notifPermission === 'granted' ? 'Recordatorios Diarios Activos' : 'Recordatorios en Móvil y Navegador'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {notifPermission === 'granted'
                        ? 'Tienes avisos programados a lo largo del día para Kanji, Vocabulario y tu Racha.'
                        : 'Recibe avisos para tus actividades a lo largo del día sin olvidar practicar.'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`btn ${notifPermission === 'granted' ? 'btn-outline' : 'btn-primary'} btn-sm`}
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => {
                      if (notifPermission === 'granted') {
                        if (openNotificationSettings) openNotificationSettings();
                        else if (typeof window !== 'undefined' && window.__nihongoOpenNotifications) window.__nihongoOpenNotifications();
                      } else {
                        handleEnableNotifications();
                      }
                    }}
                  >
                    {notifPermission === 'granted' ? 'Horarios' : 'Activar'}
                  </button>
                </div>
              )}


              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ borderRadius: 10, padding: '10px 20px' }}
                  onClick={() => {
                    clearQuizSession();
                    generateQueue(selectedCategory, selectedLevel, targetCount, true);
                  }}
                >
                  <RotateCcw size={16} />
                  <span>Seguir Practicando (+{targetCount})</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ borderRadius: 10, padding: '10px 24px' }}
                  onClick={onClose}
                >
                  <Check size={16} />
                  <span>Listo por Hoy</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p>Cargando preguntas de práctica...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
