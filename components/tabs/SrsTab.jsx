'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Brain, 
  Sparkles, 
  Target, 
  Flame, 
  RotateCcw, 
  Volume2, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Award, 
  Languages, 
  Layers, 
  BarChart2, 
  BookOpen, 
  PenTool,
  Clock,
  Compass,
  Settings2
} from 'lucide-react';
import { useApp } from '../../lib/AppContext';
import { 
  SRSRating, 
  isDue, 
  reviewQuestionCard, 
  getDueCounts, 
  getIntervalPreviews 
} from '../../lib/srs';
import { recordDailyGoalActivity, saveState } from '../../lib/storage';
import audioManager from '../../lib/audioManager';

import jlptExamsData from '../../data/jlpt_exams.json';
import particlesData from '../../data/particles.json';
import vocabularyData from '../../data/vocabulary.json';
import kanjiData from '../../data/kanji.json';

const FsrsStatsModule = dynamic(() => import('../features/FsrsStatsModule'), { ssr: false });

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const CATEGORIES = [
  { id: 'all', label: 'Mix Inteligente', shortLabel: 'Mix', icon: Sparkles, desc: 'Prioriza repaso FSRS y combina todos los temas' },
  { id: 'kanji', label: 'Kanji', shortLabel: 'Kanji', icon: Languages, desc: 'Lectura On/Kun, trazos y significado' },
  { id: 'vocab', label: 'Vocabulario', shortLabel: 'Vocab', icon: Layers, desc: 'Significado, contexto y lectura en kana' },
  { id: 'grammar', label: 'Gramática', shortLabel: 'Gramática', icon: Target, desc: 'Partículas y estructuras esenciales' },
  { id: 'jlpt', label: 'Examen JLPT', shortLabel: 'JLPT', icon: Award, desc: 'Preguntas oficiales de simulacro por nivel' }
];

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function SrsTab({ onNavigate }) {
  const contextApp = useApp();
  const { appState, onUpdateState, openDailyGoalModal, openTour } = contextApp;

  // Active section in SRS tab: 'quiz' | 'analytics'
  const [activeSection, setActiveSection] = useState('quiz');

  // Quiz parameters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [targetCount, setTargetCount] = useState(5);

  // Quiz state
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showFurigana, setShowFurigana] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [statsGained, setStatsGained] = useState({ xp: 0, correct: 0 });

  const appStateRef = useRef(appState);
  appStateRef.current = appState;

  // Due counts from FSRS
  const dueCounts = useMemo(() => {
    return getDueCounts(appState || {});
  }, [appState]);

  // Build the questions queue
  const generateQueue = useCallback((cat = selectedCategory, lvl = selectedLevel, tgt = targetCount) => {
    // 1. Preguntas oficiales JLPT
    const filteredJlpt = (jlptExamsData || []).filter(q => {
      if (cat !== 'all' && cat !== 'jlpt') return false;
      return q.level === lvl;
    }).map(q => ({ ...q, category: 'jlpt' }));

    // 2. Preguntas de gramática / partículas
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

    // 3. Vocabulario
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

    // 4. Kanji
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

    let pool = [];
    if (cat === 'jlpt') pool = filteredJlpt;
    else if (cat === 'grammar') pool = filteredParticles;
    else if (cat === 'vocab') pool = filteredVocab;
    else if (cat === 'kanji') pool = filteredKanji;
    else pool = [...filteredJlpt, ...filteredParticles, ...filteredVocab, ...filteredKanji];

    if (pool.length === 0) {
      pool = (jlptExamsData || []).map(q => ({ ...q, category: 'jlpt' }));
    }

    // Priorizar tarjetas pendientes en FSRS
    const srsDue = [];
    const newItems = [];
    const futureDue = [];

    pool.forEach(item => {
      const card = appStateRef.current?.srsQuestions?.[item.id];
      if (card) {
        if (isDue(card)) {
          srsDue.push(item);
        } else {
          futureDue.push(item);
        }
      } else {
        newItems.push(item);
      }
    });

    const finalQueue = [
      ...shuffleArray(srsDue),
      ...shuffleArray(newItems),
      ...shuffleArray(futureDue)
    ].slice(0, tgt);
    setQueue(finalQueue);
    setCurrentIndex(0);
    setSelectedOption(null);
    setFeedback(null);
    setSessionCompleted(false);
    setStatsGained({ xp: 0, correct: 0 });
  }, [selectedCategory, selectedLevel, targetCount]);

  // Initial queue load
  useEffect(() => {
    generateQueue(selectedCategory, selectedLevel, targetCount);
  }, [generateQueue, selectedCategory, selectedLevel, targetCount]);

  const currentQuestion = queue[currentIndex];

  // Previsualización dinámica de intervalos FSRS para la pregunta activa
  const questionIntervals = useMemo(() => {
    if (!currentQuestion) return { 1: '1d', 2: '2d', 3: '3d', 4: '8d' };
    const baseCard = feedback?.prevCard !== undefined 
      ? feedback.prevCard 
      : appState?.srsQuestions?.[currentQuestion.id];
    return getIntervalPreviews(baseCard);
  }, [currentQuestion, feedback, appState]);

  // Answering option
  const handleSelectOption = (index) => {
    if (feedback || !currentQuestion) return;

    setSelectedOption(index);
    const isCorrect = index === currentQuestion.correctIndex;

    const currentCard = appState?.srsQuestions?.[currentQuestion.id];
    const rating = isCorrect ? SRSRating.GOOD : SRSRating.AGAIN;
    const newCard = reviewQuestionCard(currentCard, rating);

    const updatedState = {
      ...appState,
      srsQuestions: {
        ...(appState.srsQuestions || {}),
        [currentQuestion.id]: newCard
      }
    };

    const savedState = recordDailyGoalActivity(updatedState, isCorrect);
    if (onUpdateState) {
      onUpdateState(savedState);
    }

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
      rating,
      prevCard: currentCard
    });

    setStatsGained(prev => ({
      xp: prev.xp + (isCorrect ? 15 : 5),
      correct: prev.correct + (isCorrect ? 1 : 0)
    }));
  };

  // Next question
  const handleNext = () => {
    setSelectedOption(null);
    setFeedback(null);
    const nextIdx = currentIndex + 1;
    if (nextIdx < queue.length) {
      setCurrentIndex(nextIdx);
    } else {
      setSessionCompleted(true);
      try {
        audioManager.playSfx?.('complete');
      } catch {}
    }
  };

  // Manual rating adjustment
  const handleManualRating = (customRating) => {
    if (!currentQuestion) return;
    const baseCard = feedback?.prevCard !== undefined 
      ? feedback.prevCard 
      : appState?.srsQuestions?.[currentQuestion.id];
    const newCard = reviewQuestionCard(baseCard, customRating);
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

  const streak = appState?.streak || 1;
  const dailyGoal = appState?.dailyGoal || {};
  const todayProgress = dailyGoal.answeredToday || 0;
  const isGoalReached = dailyGoal.completed || todayProgress >= (dailyGoal.target || 5);

  return (
    <div className="srs-tab-container" style={{ maxWidth: 960, margin: '0 auto', padding: '16px 20px 48px' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(245, 158, 11, 0.08))',
        border: '1.5px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 20,
        padding: '24px 28px',
        marginBottom: 24,
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: 999,
                background: 'rgba(99, 102, 241, 0.18)',
                color: 'var(--primary, #6366f1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}>
                <Brain size={13} />
                <span>Motor FSRS v5 · Repaso Espaciado</span>
              </span>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 999,
                background: isGoalReached ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isGoalReached ? 'var(--success, #10b981)' : 'var(--accent, #f59e0b)'
              }}>
                {isGoalReached ? '✓ Meta Diaria Cumplida' : `${todayProgress}/${dailyGoal.target || 5} Hoy`}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-main)' }}>
              Centro de Preguntas & Repaso Espaciado (SRS)
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0, maxWidth: 620, lineHeight: 1.5 }}>
              Practica preguntas inteligentes de Kanji, Vocabulario, Gramática y Examen JLPT optimizadas por el algoritmo matemático FSRS v5 para consolidar tu memoria antes del olvido.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ borderRadius: 12, padding: '10px 18px', fontWeight: 700, gap: 8 }}
              onClick={() => {
                if (openDailyGoalModal) {
                  openDailyGoalModal();
                } else if (contextApp?.openDailyGoalModal) {
                  contextApp.openDailyGoalModal();
                }
              }}
            >
              <Target size={16} />
              <span>Modal Meta Diaria</span>
            </button>

            <button
              type="button"
              className="btn btn-outline"
              style={{ borderRadius: 12, padding: '10px 14px', gap: 6 }}
              onClick={() => {
                if (openTour) openTour('daily_goal');
                else if (contextApp?.openTour) contextApp.openTour('daily_goal');
              }}
              title="Ver tour de FSRS y repetición espaciada"
            >
              <Compass size={16} />
              <span>Guía</span>
            </button>
          </div>
        </div>

        {/* Quick Due Cards Counters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 12,
          marginTop: 20,
          paddingTop: 18,
          borderTop: '1px solid rgba(99, 102, 241, 0.15)'
        }}>
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>PREGUNTAS FSRS</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>{dueCounts.questions}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>pendientes</div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>VOCABULARIO</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#3b82f6' }}>{dueCounts.vocab}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>por repasar</div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>KANJI</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b' }}>{dueCounts.kanji}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>por repasar</div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>GRAMÁTICA</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>{dueCounts.particles}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>por repasar</div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>ESCRITURA</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ec4899' }}>{dueCounts.scriptpad || 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>en Scriptpad</div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL REPASO</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent, #f59e0b)' }}>{dueCounts.total}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>tarjetas listas</div>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <button
          type="button"
          className={`btn ${activeSection === 'quiz' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 10, padding: '8px 16px', fontWeight: 700, gap: 8 }}
          onClick={() => setActiveSection('quiz')}
        >
          <Target size={15} />
          <span>Preguntas FSRS en Vivo</span>
        </button>

        <button
          type="button"
          className={`btn ${activeSection === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 10, padding: '8px 16px', fontWeight: 700, gap: 8 }}
          onClick={() => setActiveSection('analytics')}
        >
          <BarChart2 size={15} />
          <span>Análisis & Curvas del Algoritmo</span>
        </button>

        <button
          type="button"
          className="btn btn-outline"
          style={{ borderRadius: 10, padding: '8px 14px', gap: 6, marginLeft: 'auto' }}
          onClick={() => onNavigate?.('vocab', 'srs')}
        >
          <BookOpen size={15} />
          <span>Tarjetas de Vocabulario</span>
        </button>

        <button
          type="button"
          className="btn btn-outline"
          style={{ borderRadius: 10, padding: '8px 14px', gap: 6 }}
          onClick={() => onNavigate?.('scriptpad')}
        >
          <PenTool size={15} />
          <span>Scriptpad Escritura</span>
        </button>
      </div>

      {/* SECTION 1: INTERACTIVE QUIZ ENGINE */}
      {activeSection === 'quiz' && (
        <div>
          {/* Controls Bar: Category & JLPT Level */}
          <div style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 20
          }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>
                CATEGORÍA TEMÁTICA
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`}
                      style={{ borderRadius: 8, fontSize: '0.82rem', gap: 6 }}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        generateQueue(cat.id, selectedLevel, targetCount);
                      }}
                    >
                      <Icon size={14} />
                      <span>{cat.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>
                  NIVEL JLPT (ESTÁNDAR N5 A N1)
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {JLPT_LEVELS.map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      className={`btn btn-sm ${selectedLevel === lvl ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: 6, fontWeight: 700 }}
                      onClick={() => {
                        setSelectedLevel(lvl);
                        generateQueue(selectedCategory, lvl, targetCount);
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>
                  PREGUNTAS EN ESTA TANDA
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[3, 5, 10].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      className={`btn btn-sm ${targetCount === cnt ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: 6 }}
                      onClick={() => {
                        setTargetCount(cnt);
                        generateQueue(selectedCategory, selectedLevel, cnt);
                      }}
                    >
                      {cnt} preguntas
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginLeft: 'auto', marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 6 }}
                  onClick={() => generateQueue(selectedCategory, selectedLevel, targetCount)}
                >
                  <RotateCcw size={14} />
                  <span>Reiniciar Tanda</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Question Box */}
          {!sessionCompleted && currentQuestion ? (
            <div className="card" style={{ padding: '24px 28px', borderRadius: 18, border: '1.5px solid var(--border)' }}>
              {/* Question metadata & utility buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '3px 12px',
                    borderRadius: 999,
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--primary, #6366f1)'
                  }}>
                    {currentQuestion.category === 'kanji' ? '🈸 Kanji' :
                     currentQuestion.category === 'vocab' ? '📖 Vocabulario' :
                     currentQuestion.category === 'grammar' ? '⚡ Gramática' :
                     `🎯 JLPT ${currentQuestion.level}`}
                  </span>
                  {appState?.srsQuestions?.[currentQuestion.id] && isDue(appState.srsQuestions[currentQuestion.id]) && (
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Clock size={12} />
                      <span>Por Repasar</span>
                    </span>
                  )}
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Pregunta {currentIndex + 1} de {queue.length}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '5px 10px', fontSize: '0.78rem', borderRadius: 8 }}
                    onClick={() => setShowFurigana(prev => !prev)}
                    title={showFurigana ? 'Ocultar Furigana' : 'Mostrar Furigana'}
                  >
                    {showFurigana ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>Furigana</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '5px 10px', borderRadius: 8 }}
                    onClick={() => {
                      const textToSpeak = currentQuestion.furigana || currentQuestion.question;
                      audioManager.speak(textToSpeak.replace(/<[^>]*>/g, ''));
                    }}
                    title="Escuchar locución neuronal"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, width: '100%', background: 'var(--border)', borderRadius: 999, overflow: 'hidden', marginBottom: 24 }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round(((currentIndex + (feedback ? 1 : 0)) / queue.length) * 100)}%`,
                  background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {/* Question Text Box */}
              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '22px',
                marginBottom: 20
              }}>
                <div 
                  className="jp-text"
                  style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.6, color: 'var(--text-main)', marginBottom: 8 }}
                  dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                />

                {showFurigana && currentQuestion.furigana && (
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    {currentQuestion.furigana}
                  </div>
                )}
              </div>

              {/* Options Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 20 }}>
                {currentQuestion.options.map((opt, oIdx) => {
                  let optStyle = {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderRadius: 12,
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg-surface)',
                    cursor: feedback ? 'default' : 'pointer',
                    fontSize: '1rem',
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
                  padding: '18px 22px',
                  borderRadius: 14,
                  background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${feedback.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: feedback.isCorrect ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)'
                    }}>
                      {feedback.isCorrect ? '🎉 ¡Respuesta Correcta! (+15 XP)' : '❌ Respuesta Incorrecta (+5 XP)'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Algoritmo FSRS actualizado
                    </span>
                  </div>

                  <div style={{
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                    margin: '0 0 14px',
                    whiteSpace: 'pre-line'
                  }}>
                    {feedback.explanation}
                  </div>

                  {/* FSRS Rating Adjustment Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    flexWrap: 'wrap',
                    gap: 8
                  }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Calificar dificultad en memoria:
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${feedback.rating === SRSRating.AGAIN ? 'btn-danger' : 'btn-outline'}`}
                        style={{ padding: '3px 10px', fontSize: '0.75rem', borderRadius: 6 }}
                        onClick={() => handleManualRating(SRSRating.AGAIN)}
                      >
                        Repetir ({questionIntervals[1] || '1d'})
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${feedback.rating === SRSRating.HARD ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '3px 10px', fontSize: '0.75rem', borderRadius: 6 }}
                        onClick={() => handleManualRating(SRSRating.HARD)}
                      >
                        Difícil ({questionIntervals[2] || '2d'})
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${feedback.rating === SRSRating.GOOD ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '3px 10px', fontSize: '0.75rem', borderRadius: 6 }}
                        onClick={() => handleManualRating(SRSRating.GOOD)}
                      >
                        Bien ({questionIntervals[3] || '3d'})
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${feedback.rating === SRSRating.EASY ? 'btn-success' : 'btn-outline'}`}
                        style={{ padding: '3px 10px', fontSize: '0.75rem', borderRadius: 6 }}
                        onClick={() => handleManualRating(SRSRating.EASY)}
                      >
                        Fácil ({questionIntervals[4] || '8d'})
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
                    <span>{currentIndex + 1 < queue.length ? 'Siguiente Pregunta' : 'Completar Tanda'}</span>
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          ) : sessionCompleted ? (
            /* Completed Screen */
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', borderRadius: 20 }}>
              <div style={{
                width: 68,
                height: 68,
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
                ¡Tanda FSRS Completada! 🎉
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 24px' }}>
                Has respondido tus preguntas del algoritmo FSRS. Las tarjetas han sido reprogramadas para tus próximas sesiones de repaso.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{ padding: '14px 20px', borderRadius: 14, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>+{statsGained.xp} XP</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Experiencia</div>
                </div>
                <div style={{ padding: '14px 20px', borderRadius: 14, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success, #10b981)' }}>{statsGained.correct}/{queue.length}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Aciertos</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ borderRadius: 10, padding: '10px 20px' }}
                  onClick={() => generateQueue(selectedCategory, selectedLevel, targetCount)}
                >
                  <RotateCcw size={16} />
                  <span>Practicar Otra Tanda (+{targetCount})</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ borderRadius: 10, padding: '10px 24px' }}
                  onClick={() => onNavigate?.('progress')}
                >
                  <span>Ver Progreso General</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Cargando preguntas de práctica FSRS...
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: FSRS ANALYTICS & CURVE MODULE */}
      {activeSection === 'analytics' && (
        <FsrsStatsModule 
          appState={appState}
          onUpdateState={onUpdateState}
          onOpenDailyGoal={openDailyGoalModal}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}