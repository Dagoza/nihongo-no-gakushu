'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  X, 
  Flame, 
  Star, 
  CheckCircle2, 
  RotateCcw, 
  Volume2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  Bell, 
  Award, 
  Languages, 
  Layers, 
  Target, 
  Check, 
  Settings2,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { 
  SRSRating, 
  getNewCard, 
  reviewCard, 
  isDue, 
  ensureFsrsCard, 
  reviewQuestionCard, 
  getIntervalPreviews,
  getDueCounts 
} from '../lib/srs';
import { recordDailyGoalActivity, saveState } from '../lib/storage';
import audioManager from '../lib/audioManager';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  isDailyReminderEnabled, 
  requestNotificationPermission 
} from '../lib/notificationManager';

import jlptExamsData from '../data/jlpt_exams.json';
import particlesData from '../data/particles.json';
import vocabularyData from '../data/vocabulary.json';
import kanjiData from '../data/kanji.json';

const CATEGORIES = [
  { id: 'all', label: 'Mix Inteligente', shortLabel: 'Mix', icon: Sparkles, desc: 'Prioriza repaso FSRS y combina todos los temas' },
  { id: 'kanji', label: 'Kanji', shortLabel: 'Kanji', icon: Languages, desc: 'Lectura On/Kun, trazos y significado' },
  { id: 'vocab', label: 'Vocabulario', shortLabel: 'Vocab', icon: Layers, desc: 'Significado, contexto y lectura en kana' },
  { id: 'grammar', label: 'Gramática', shortLabel: 'Gramática', icon: Target, desc: 'Partículas y estructuras esenciales' },
  { id: 'jlpt', label: 'Examen JLPT', shortLabel: 'JLPT', icon: Award, desc: 'Preguntas oficiales de simulacro por nivel' }
];

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function DailyGoalModal({ isOpen, onClose }) {
  const { appState, onUpdateState } = useApp();
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
  const [isNotifActive, setIsNotifActive] = useState(false);

  // Sync settings from appState on load
  useEffect(() => {
    if (appState?.dailyGoal) {
      if (appState.dailyGoal.category) setSelectedCategory(appState.dailyGoal.category);
      if (appState.dailyGoal.level) setSelectedLevel(appState.dailyGoal.level);
      if (appState.dailyGoal.target) setTargetCount(appState.dailyGoal.target);
    }
    if (typeof window !== 'undefined') {
      setNotifPermission(getNotificationPermission());
      setIsNotifActive(isDailyReminderEnabled());
    }
  }, [appState?.dailyGoal, isOpen]);

  // Build the questions queue based on preferences and FSRS due items
  const generateQueue = useCallback(() => {
    const questions = [];
    const today = new Date().toISOString().split('T')[0];

    // 1. Gather any JLPT Exam questions
    const filteredJlpt = (jlptExamsData || []).filter(q => {
      if (selectedCategory !== 'all' && selectedCategory !== 'jlpt') return false;
      return q.level === selectedLevel;
    });

    // 2. Gather Particle Quiz questions
    const filteredParticles = [];
    (particlesData || []).forEach(p => {
      if (selectedCategory !== 'all' && selectedCategory !== 'grammar') return false;
      if (p.level && p.level !== selectedLevel) return false;
      if (p.quiz_items && p.quiz_items.length > 0) {
        p.quiz_items.forEach((qi, qIdx) => {
          filteredParticles.push({
            id: `part_quiz_${p.particle}_${qIdx}`,
            category: 'grammar',
            level: p.level || 'N5',
            question: qi.sentence || `${p.particle}の文法`,
            options: qi.options || [p.particle, 'は', 'が', 'を'],
            correctIndex: (qi.options || []).indexOf(qi.correct || p.particle),
            explanation: `Partícula «${p.particle}»: ${p.meaning_es || p.role_es || 'Uso gramatical'}. ${qi.explanation || ''}`,
            furigana: qi.sentence || '',
            targetItem: p.particle
          });
        });
      }
    });

    // 3. Gather Vocabulary generated questions
    const filteredVocab = (vocabularyData || []).filter(v => {
      if (selectedCategory !== 'all' && selectedCategory !== 'vocab') return false;
      return v.level === selectedLevel;
    }).map(v => {
      const wrong = (vocabularyData || []).filter(x => x.id !== v.id && x.meaning_es).slice(0, 3).map(x => x.meaning_es);
      const allOpts = [v.meaning_es, ...wrong].sort(() => Math.random() - 0.5);
      return {
        id: `vocab_q_${v.id}`,
        category: 'vocab',
        level: v.level || 'N5',
        question: `¿Qué significa la palabra «${v.kanji || v.hiragana}» (${v.hiragana})?`,
        options: allOpts,
        correctIndex: allOpts.indexOf(v.meaning_es),
        explanation: `«${v.kanji || v.hiragana}» (${v.hiragana}) significa: ${v.meaning_es}.`,
        furigana: v.hiragana,
        targetItem: v.id
      };
    });

    // 4. Gather Kanji generated questions
    const filteredKanji = (kanjiData || []).filter(k => {
      if (selectedCategory !== 'all' && selectedCategory !== 'kanji') return false;
      return k.level === selectedLevel;
    }).map(k => {
      const wrong = (kanjiData || []).filter(x => x.kanji !== k.kanji && x.meaning_es).slice(0, 3).map(x => x.meaning_es);
      const allOpts = [k.meaning_es, ...wrong].sort(() => Math.random() - 0.5);
      return {
        id: `kanji_q_${k.kanji}`,
        category: 'kanji',
        level: k.level || 'N5',
        question: `¿Cuál es el significado principal del kanji 「${k.kanji}」?`,
        options: allOpts,
        correctIndex: allOpts.indexOf(k.meaning_es),
        explanation: `Kanji 「${k.kanji}」: Significa '${k.meaning_es}'. Lecturas: On: ${(k.on_readings || []).join('、 ')} | Kun: ${(k.kun_readings || []).join('、 ')}.`,
        furigana: (k.kun_readings || [])[0] || (k.on_readings || [])[0] || '',
        targetItem: k.kanji
      };
    });

    // Combine pool based on category
    let pool = [];
    if (selectedCategory === 'jlpt') {
      pool = filteredJlpt.map(q => ({ ...q, category: 'jlpt' }));
    } else if (selectedCategory === 'grammar') {
      pool = filteredParticles;
    } else if (selectedCategory === 'vocab') {
      pool = filteredVocab;
    } else if (selectedCategory === 'kanji') {
      pool = filteredKanji;
    } else {
      // 'all' Mix: combine from all pools
      pool = [
        ...filteredJlpt.map(q => ({ ...q, category: 'jlpt' })),
        ...filteredParticles,
        ...filteredVocab,
        ...filteredKanji
      ];
    }

    if (pool.length === 0) {
      // Fallback to all JLPT questions if filtered is empty
      pool = (jlptExamsData || []).map(q => ({ ...q, category: 'jlpt' }));
    }

    // Prioritize FSRS Due Items:
    // If a question card is stored in appState.srsQuestions and isDue(card) is true, prioritize it
    const srsDue = [];
    const nonDue = [];

    pool.forEach(item => {
      const card = appState?.srsQuestions?.[item.id];
      if (card && isDue(card)) {
        srsDue.push(item);
      } else {
        nonDue.push(item);
      }
    });

    srsDue.sort(() => Math.random() - 0.5);
    nonDue.sort(() => Math.random() - 0.5);

    const finalQueue = [...srsDue, ...nonDue].slice(0, targetCount);
    setQueue(finalQueue);
    setCurrentIndex(0);
    setSelectedOption(null);
    setFeedback(null);
    setSessionCompleted(false);
    setStatsGained({ xp: 0, correct: 0 });
  }, [selectedCategory, selectedLevel, targetCount, appState]);

  // Trigger queue generation when modal opens or settings change
  useEffect(() => {
    if (isOpen) {
      generateQueue();
    }
  }, [isOpen, generateQueue]);

  const currentQuestion = queue[currentIndex];

  // Handle answering an option
  const handleSelectOption = (index) => {
    if (feedback || !currentQuestion) return;

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

    // Play feedback audio if enabled
    if (isCorrect) {
      audioManager.playSfx('correct');
    } else {
      audioManager.playSfx('wrong');
    }

    setFeedback({
      isCorrect,
      explanation: currentQuestion.explanation,
      rating
    });

    setStatsGained(prev => ({
      xp: prev.xp + (isCorrect ? 15 : 5),
      correct: prev.correct + (isCorrect ? 1 : 0)
    }));
  };

  // Next question or complete
  const handleNext = () => {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setFeedback(null);
    } else {
      setSessionCompleted(true);
      audioManager.playSfx('complete');
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
        <div style={{
          padding: '16px 20px',
          background: 'var(--card-bg, #ffffff)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
            }}>
              <Flame size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Meta Diaria · Reto de Hoy
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: isGoalReached ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isGoalReached ? 'var(--success, #10b981)' : 'var(--accent, #f59e0b)'
                }}>
                  {isGoalReached ? '✓ Cumplida' : `${todayProgress}/${dailyGoal.target || 5} resueltas`}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Racha actual: <strong>{currentStreak} días 🔥</strong> · FSRS Spaced Repetition activo
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ padding: '6px 10px', borderRadius: 8 }}
              onClick={() => setShowConfig(prev => !prev)}
              title="Configurar tema, nivel y cantidad de preguntas"
            >
              <Settings2 size={16} />
              <span className="hidden-xs">Ajustes</span>
            </button>
            <button
              type="button"
              className="btn-icon"
              onClick={onClose}
              aria-label="Cerrar modal"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 6 }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Configuration Drawer / Settings Bar */}
        {showConfig && (
          <div style={{
            padding: '16px 20px',
            background: 'var(--bg-subtle, #f8fafc)',
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
                    generateQueue();
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
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
                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 6 }}
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
                    style={{ padding: '4px 8px', borderRadius: 6 }}
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
              <div style={{
                background: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px',
                marginBottom: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {currentQuestion.passage && (
                  <div style={{
                    padding: '12px 14px',
                    background: 'var(--bg-subtle, #f8fafc)',
                    borderRadius: 10,
                    marginBottom: 14,
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                    borderLeft: '4px solid var(--primary)'
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
                    border: '2px solid var(--border)',
                    background: 'var(--card-bg, #ffffff)',
                    cursor: feedback ? 'default' : 'pointer',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    transition: 'all 0.15s ease'
                  };

                  if (feedback) {
                    if (oIdx === currentQuestion.correctIndex) {
                      optStyle.borderColor = 'var(--success, #10b981)';
                      optStyle.background = 'rgba(16, 185, 129, 0.1)';
                      optStyle.color = 'var(--success, #10b981)';
                    } else if (oIdx === selectedOption) {
                      optStyle.borderColor = 'var(--danger, #ef4444)';
                      optStyle.background = 'rgba(239, 68, 68, 0.1)';
                      optStyle.color = 'var(--danger, #ef4444)';
                    } else {
                      optStyle.opacity = 0.5;
                    }
                  } else if (selectedOption === oIdx) {
                    optStyle.borderColor = 'var(--primary)';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      style={optStyle}
                      disabled={!!feedback}
                      onClick={() => handleSelectOption(oIdx)}
                    >
                      <span className="jp-text" style={{ flex: 1, textAlign: 'left' }}>
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

                  <p style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    color: 'var(--text-main)',
                    margin: '0 0 12px'
                  }}>
                    {feedback.explanation}
                  </p>

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
                  background: 'var(--bg-subtle, #f8fafc)',
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
                  background: 'var(--bg-subtle, #f8fafc)',
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
                  background: 'var(--bg-subtle, #f8fafc)',
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

              {/* Mobile Push Notification Opt-in Prompt */}
              {notifPermission !== 'granted' && isNotificationSupported() && (
                <div style={{
                  maxWidth: 480,
                  margin: '0 auto 28px',
                  padding: '16px',
                  borderRadius: 14,
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14
                }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: 'var(--primary, #6366f1)',
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
                      Recordatorios en Móvil y Navegador
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Recibe una notificación cada día para mantener tu racha sin olvidar practicar.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={handleEnableNotifications}
                  >
                    Activar
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
                    generateQueue();
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
