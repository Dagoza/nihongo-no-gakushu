'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Volume2, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Bookmark, 
  BookmarkCheck, 
  Play, 
  Pause, 
  Layers, 
  Target, 
  BookOpen, 
  Headphones, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle,
  Check,
  Filter
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import audioManager from '../lib/audioManager';
import { SRSRating, reviewQuestionCard, ensureFsrsCard } from '../lib/srs';
import { saveState, recordActivity } from '../lib/storage';
import jlptExamsData from '../data/jlpt_exams.json';

const SECTIONS = [
  { id: 'all', label: 'Todo el Examen', icon: Award },
  { id: 'vocabulary', label: '文字・語彙 (Vocabulario)', icon: Layers },
  { id: 'grammar', label: '文法 (Gramática)', icon: Target },
  { id: 'reading', label: '読解 (Lectura)', icon: BookOpen },
  { id: 'listening', label: '聴解 (Audio)', icon: Headphones }
];

const JLPT_LEVELS = [
  { id: 'N5', name: 'N5', desc: 'Principiante', passScore: 80, maxScore: 180, timeMins: 30 },
  { id: 'N4', name: 'N4', desc: 'Básico', passScore: 90, maxScore: 180, timeMins: 35 },
  { id: 'N3', name: 'N3', desc: 'Intermedio', passScore: 95, maxScore: 180, timeMins: 45 },
  { id: 'N2', name: 'N2', desc: 'Intermedio Alto', passScore: 90, maxScore: 180, timeMins: 55 },
  { id: 'N1', name: 'N1', desc: 'Avanzado', passScore: 100, maxScore: 180, timeMins: 60 }
];

export default function JlptExamTab() {
  const { appState, onUpdateState } = useApp();

  // Filters
  const [level, setLevel] = useState('N5');
  const [section, setSection] = useState('all');
  const [mode, setMode] = useState('practice'); // 'practice' | 'timed'

  // Exam state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: selectedIndex }
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showFurigana, setShowFurigana] = useState(true);
  const [examFinished, setExamFinished] = useState(false);
  const [practiceFeedback, setPracticeFeedback] = useState({}); // { [qId]: { isCorrect, selectedIndex } }

  // Timed mode state
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Filter questions by level and section
  const filteredQuestions = useMemo(() => {
    return (jlptExamsData || []).filter(q => {
      if (q.level !== level) return false;
      if (section !== 'all' && q.section !== section) return false;
      return true;
    });
  }, [level, section]);

  const currentLevelConfig = useMemo(() => {
    return JLPT_LEVELS.find(l => l.id === level) || JLPT_LEVELS[0];
  }, [level]);

  // Reset exam on level or section change
  const handleResetExam = (newLevel = level, newSection = section) => {
    setLevel(newLevel);
    setSection(newSection);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestions(new Set());
    setPracticeFeedback({});
    setExamFinished(false);

    const cfg = JLPT_LEVELS.find(l => l.id === newLevel) || JLPT_LEVELS[0];
    const allocatedMinutes = newSection === 'all' 
      ? cfg.timeMins 
      : Math.max(15, Math.round(cfg.timeMins * 0.4));
      
    setTimeLeft(allocatedMinutes * 60);
    setIsTimerRunning(mode === 'timed');
  };

  // Timer countdown
  useEffect(() => {
    if (mode === 'timed' && isTimerRunning && !examFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setExamFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [mode, isTimerRunning, examFinished]);

  const currentQuestion = filteredQuestions[currentIndex];

  // Handle answering in practice or timed mode
  const handleSelectOption = (optIndex) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    if (mode === 'practice') {
      const isCorrect = optIndex === currentQuestion.correctIndex;
      setPracticeFeedback(prev => ({
        ...prev,
        [qId]: { isCorrect, selectedIndex: optIndex }
      }));
      setUserAnswers(prev => ({ ...prev, [qId]: optIndex }));

      // Record Activity and FSRS
      const card = appState?.srsQuestions?.[qId];
      const rating = isCorrect ? SRSRating.GOOD : SRSRating.AGAIN;
      const newCard = reviewQuestionCard(card, rating);
      const updated = {
        ...appState,
        srsQuestions: {
          ...(appState?.srsQuestions || {}),
          [qId]: newCard
        }
      };
      const finalState = recordActivity(updated, isCorrect);
      if (onUpdateState) onUpdateState(finalState);

      if (isCorrect) {
        audioManager.playSfx('correct');
      } else {
        audioManager.playSfx('wrong');
      }
    } else {
      // Timed mode: record answer without giving immediate feedback
      setUserAnswers(prev => ({ ...prev, [qId]: optIndex }));
    }
  };

  // Toggle flag on question
  const toggleFlag = (qId) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Finish exam (timed mode)
  const handleFinishExam = () => {
    setIsTimerRunning(false);
    setExamFinished(true);
    audioManager.playSfx('complete');

    // Calculate score and persist exam result in storage
    const total = filteredQuestions.length;
    let correct = 0;
    filteredQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const scaledScore = total > 0 ? Math.round((correct / total) * currentLevelConfig.maxScore) : 0;
    const passed = scaledScore >= currentLevelConfig.passScore;

    const examRecord = {
      date: new Date().toISOString(),
      level,
      section,
      score: scaledScore,
      maxScore: currentLevelConfig.maxScore,
      correctCount: correct,
      totalQuestions: total,
      passed
    };

    const examKey = `exam_${level}_${section}_${Date.now()}`;
    const updated = {
      ...appState,
      jlptExamResults: {
        ...(appState?.jlptExamResults || {}),
        [examKey]: examRecord
      }
    };
    saveState(updated);
    if (onUpdateState) onUpdateState(updated);
  };

  // Format time MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Compute final score breakdown
  const examResults = useMemo(() => {
    if (!examFinished) return null;
    const total = filteredQuestions.length;
    let correct = 0;
    const sectionsBreakdown = {};

    filteredQuestions.forEach(q => {
      const isCorr = userAnswers[q.id] === q.correctIndex;
      if (isCorr) correct++;

      const sec = q.section || 'other';
      if (!sectionsBreakdown[sec]) {
        sectionsBreakdown[sec] = { total: 0, correct: 0 };
      }
      sectionsBreakdown[sec].total++;
      if (isCorr) sectionsBreakdown[sec].correct++;
    });

    const scaledScore = total > 0 ? Math.round((correct / total) * currentLevelConfig.maxScore) : 0;
    const passed = scaledScore >= currentLevelConfig.passScore;

    return {
      correct,
      total,
      scaledScore,
      maxScore: currentLevelConfig.maxScore,
      passScore: currentLevelConfig.passScore,
      passed,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      sectionsBreakdown
    };
  }, [examFinished, filteredQuestions, userAnswers, currentLevelConfig]);

  return (
    <div className="tab-pane active" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: 20,
        padding: '28px 24px',
        color: '#ffffff',
        marginBottom: 24,
        boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Award size={26} color="#fbbf24" />
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Simulacros Oficiales JLPT
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.92rem', opacity: 0.9, maxWidth: 620, lineHeight: 1.5 }}>
              Banco oficial de exámenes por cada nivel (N5 a N1). Practica en modo simulacro cronometrado con temporizador real o en modo práctica guiada con explicaciones en español y FSRS.
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: 4,
            borderRadius: 12,
            display: 'flex',
            gap: 4
          }}>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'practice' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                borderRadius: 8,
                background: mode === 'practice' ? '#ffffff' : 'transparent',
                color: mode === 'practice' ? '#4f46e5' : '#ffffff',
                border: 'none',
                fontWeight: 700
              }}
              onClick={() => {
                setMode('practice');
                setIsTimerRunning(false);
              }}
            >
              <HelpCircle size={15} />
              <span>Práctica Guiada</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'timed' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                borderRadius: 8,
                background: mode === 'timed' ? '#ffffff' : 'transparent',
                color: mode === 'timed' ? '#4f46e5' : '#ffffff',
                border: 'none',
                fontWeight: 700
              }}
              onClick={() => {
                setMode('timed');
                setIsTimerRunning(true);
              }}
            >
              <Clock size={15} />
              <span>Simulacro Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Level Selection Pills (Rule 6: JLPT N5-N1 strictly) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {JLPT_LEVELS.map(lvl => {
            const active = level === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                className={`btn ${active ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  borderRadius: 12,
                  padding: '8px 18px',
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onClick={() => handleResetExam(lvl.id, section)}
              >
                <span>{lvl.name}</span>
                <span style={{
                  fontSize: '0.72rem',
                  opacity: 0.8,
                  padding: '2px 6px',
                  borderRadius: 999,
                  background: active ? 'rgba(255,255,255,0.2)' : 'var(--bg-subtle)'
                }}>
                  {lvl.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timed Mode Active Clock Banner */}
        {mode === 'timed' && !examFinished && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-surface)',
            border: `1px solid ${timeLeft < 300 ? 'var(--danger)' : 'var(--border)'}`,
            padding: '6px 14px',
            borderRadius: 12
          }}>
            <Clock size={18} color={timeLeft < 300 ? 'var(--danger)' : 'var(--primary)'} />
            <span style={{
              fontWeight: 800,
              fontSize: '1.1rem',
              color: timeLeft < 300 ? 'var(--danger)' : 'var(--text-main)',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {formatTime(timeLeft)}
            </span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: 8 }}
              onClick={handleFinishExam}
            >
              Terminar Examen
            </button>
          </div>
        )}
      </div>

      {/* Section Filter Pills */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 10,
        marginBottom: 20,
        borderBottom: '1px solid var(--border)'
      }}>
        {SECTIONS.map(sec => {
          const Icon = sec.icon;
          const active = section === sec.id;
          const count = (jlptExamsData || []).filter(q => q.level === level && (sec.id === 'all' || q.section === sec.id)).length;

          return (
            <button
              key={sec.id}
              type="button"
              className={`btn btn-sm ${active ? 'btn-secondary' : 'btn-outline'}`}
              style={{
                borderRadius: 10,
                fontSize: '0.82rem',
                gap: 6,
                whiteSpace: 'nowrap'
              }}
              onClick={() => handleResetExam(level, sec.id)}
            >
              <Icon size={14} />
              <span>{sec.label}</span>
              <span style={{
                fontSize: '0.7rem',
                opacity: 0.75,
                background: active ? 'rgba(255,255,255,0.25)' : 'var(--bg-subtle)',
                padding: '1px 6px',
                borderRadius: 999
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {filteredQuestions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
          <AlertTriangle size={36} color="var(--accent)" style={{ margin: '0 auto 12px' }} />
          <h3>No hay preguntas disponibles para esta sección en {level}</h3>
          <p>Selecciona otra sección o nivel para practicar.</p>
        </div>
      ) : examFinished && examResults ? (
        /* Results View */
        <div className="card" style={{ padding: '32px 24px', borderRadius: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: examResults.passed ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: examResults.passed ? '0 8px 24px rgba(16, 185, 129, 0.3)' : '0 8px 24px rgba(239, 68, 68, 0.3)'
            }}>
              {examResults.passed ? <Check size={36} strokeWidth={3} /> : <XCircle size={36} />}
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-main)' }}>
              {examResults.passed ? '¡APROBADO! (合格)' : 'NO APROBADO (不合格)'}
            </h2>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
              Simulacro Oficial JLPT {level} · {SECTIONS.find(s => s.id === section)?.label}
            </div>
          </div>

          {/* Scores Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            marginBottom: 28
          }}>
            <div style={{
              padding: '16px',
              borderRadius: 14,
              background: 'var(--bg-subtle)',
              textAlign: 'center',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PUNTAJE ESCALADO</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: examResults.passed ? 'var(--success)' : 'var(--danger)' }}>
                {examResults.scaledScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {examResults.maxScore}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Mínimo para aprobar: {examResults.passScore} pts
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 14,
              background: 'var(--bg-subtle)',
              textAlign: 'center',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACIERTOS TOTALES</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {examResults.correct} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {examResults.total}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {examResults.percentage}% de precisión
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 14,
              background: 'var(--bg-subtle)',
              textAlign: 'center',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TIEMPO EMPLEADO</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {formatTime((currentLevelConfig.timeMins * 60) - timeLeft)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Límite: {currentLevelConfig.timeMins} min
              </div>
            </div>
          </div>

          {/* Review of all questions with explanations */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14, color: 'var(--text-main)' }}>
            Revisión Detallada de Preguntas & Explicaciones:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredQuestions.map((q, idx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns === q.correctIndex;

              return (
                <div 
                  key={q.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    background: isCorrect ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                        #{idx + 1}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'var(--bg-subtle)'
                      }}>
                        {q.section}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isCorrect ? (
                        <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={16} /> Correcto
                        </span>
                      ) : (
                        <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <XCircle size={16} /> Incorrecto (Tuya: {userAns !== undefined ? q.options[userAns] : 'Sin responder'})
                        </span>
                      )}
                    </div>
                  </div>

                  <div 
                    className="jp-text"
                    style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}
                    dangerouslySetInnerHTML={{ __html: q.question }}
                  />

                  <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: 8 }}>
                    <strong>Respuesta correcta:</strong> <span className="jp-text" style={{ color: 'var(--success)', fontWeight: 700 }}>{q.options[q.correctIndex]}</span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    💡 <em>{q.explanation}</em>
                  </div>

                  {/* Add to FSRS Button */}
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', borderRadius: 8 }}
                      onClick={() => {
                        const card = appState?.srsQuestions?.[q.id];
                        const newCard = reviewQuestionCard(card, isCorrect ? SRSRating.GOOD : SRSRating.AGAIN);
                        const updated = {
                          ...appState,
                          srsQuestions: {
                            ...(appState?.srsQuestions || {}),
                            [q.id]: newCard
                          }
                        };
                        saveState(updated);
                        if (onUpdateState) onUpdateState(updated);
                        alert(`Pregunta añadida al repaso espaciado FSRS (${isCorrect ? 'Repaso en 3 días' : 'Repaso pronto'}).`);
                      }}
                    >
                      <RotateCcw size={13} />
                      <span>Programar en FSRS</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ borderRadius: 12, padding: '12px 28px' }}
              onClick={() => handleResetExam(level, section)}
            >
              <RotateCcw size={18} />
              <span>Realizar Otro Examen</span>
            </button>
          </div>
        </div>
      ) : (
        /* Question Card & Interaction View */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
          {/* Main Question Panel */}
          <div className="card" style={{ padding: '24px', borderRadius: 16 }}>
            {/* Question Header Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary)'
                }}>
                  Pregunta {currentIndex + 1} de {filteredQuestions.length}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {currentQuestion.subType?.replace(/_/g, ' ')}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${flaggedQuestions.has(currentQuestion.id) ? 'btn-danger' : 'btn-outline'}`}
                  style={{ padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem' }}
                  onClick={() => toggleFlag(currentQuestion.id)}
                  title="Marcar pregunta para revisar luego"
                >
                  <Flag size={14} />
                  <span className="hidden-xs">Marcar</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem' }}
                  onClick={() => setShowFurigana(prev => !prev)}
                >
                  {showFurigana ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span className="hidden-xs">Furigana</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 8px', borderRadius: 6 }}
                  onClick={() => {
                    const text = currentQuestion.furigana || currentQuestion.question;
                    audioManager.speak(text.replace(/<[^>]*>/g, ''));
                  }}
                  title="Escuchar audio"
                >
                  <Volume2 size={15} />
                </button>
              </div>
            </div>

            {/* Passage for reading/listening */}
            {currentQuestion.passage && (
              <div style={{
                padding: '16px',
                borderRadius: 12,
                background: 'var(--bg-subtle)',
                borderLeft: '4px solid var(--primary)',
                marginBottom: 16,
                fontSize: '0.94rem',
                lineHeight: 1.65,
                color: 'var(--text-main)'
              }}>
                {currentQuestion.passage}
              </div>
            )}

            {/* Question Stem */}
            <div 
              className="jp-text"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                lineHeight: 1.6,
                marginBottom: 12
              }}
              dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
            />

            {showFurigana && currentQuestion.furigana && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                {currentQuestion.furigana}
              </div>
            )}

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 24 }}>
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQuestion.id] === optIdx;
                const feedback = practiceFeedback[currentQuestion.id];

                let optStyle = {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: '2px solid var(--border)',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  transition: 'all 0.15s ease'
                };

                if (mode === 'practice' && feedback) {
                  if (optIdx === currentQuestion.correctIndex) {
                    optStyle.borderColor = 'var(--success, #10b981)';
                    optStyle.background = 'rgba(16, 185, 129, 0.1)';
                    optStyle.color = 'var(--success, #10b981)';
                  } else if (optIdx === feedback.selectedIndex) {
                    optStyle.borderColor = 'var(--danger, #ef4444)';
                    optStyle.background = 'rgba(239, 68, 68, 0.1)';
                    optStyle.color = 'var(--danger, #ef4444)';
                  }
                } else if (isSelected) {
                  optStyle.borderColor = 'var(--primary)';
                  optStyle.background = 'rgba(99, 102, 241, 0.08)';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    style={optStyle}
                    onClick={() => handleSelectOption(optIdx)}
                  >
                    <span className="jp-text" style={{ flex: 1, textAlign: 'left' }}>
                      <span style={{ opacity: 0.5, marginRight: 10 }}>{optIdx + 1}.</span>
                      {opt}
                    </span>
                    {mode === 'practice' && feedback && optIdx === currentQuestion.correctIndex && (
                      <CheckCircle2 size={18} color="var(--success)" />
                    )}
                    {mode === 'practice' && feedback && optIdx === feedback.selectedIndex && !feedback.isCorrect && (
                      <XCircle size={18} color="var(--danger)" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Practice Mode Explanation Box */}
            {mode === 'practice' && practiceFeedback[currentQuestion.id] && (
              <div style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: practiceFeedback[currentQuestion.id].isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${practiceFeedback[currentQuestion.id].isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                marginBottom: 20
              }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: practiceFeedback[currentQuestion.id].isCorrect ? 'var(--success)' : 'var(--danger)',
                  marginBottom: 6
                }}>
                  {practiceFeedback[currentQuestion.id].isCorrect ? '🎉 ¡Respuesta Correcta!' : '❌ Respuesta Incorrecta'}
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <button
                type="button"
                className="btn btn-outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              >
                <ChevronLeft size={16} />
                <span>Anterior</span>
              </button>

              {currentIndex + 1 < filteredQuestions.length ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                >
                  <span>Siguiente</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleFinishExam}
                >
                  <Check size={16} />
                  <span>Finalizar Examen</span>
                </button>
              )}
            </div>
          </div>

          {/* Question Grid Navigator (Sidebar) */}
          <div className="card" style={{ padding: '18px', borderRadius: 16 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              PANEL DE PREGUNTAS ({Object.keys(userAnswers).length}/{filteredQuestions.length})
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 8,
              maxHeight: 360,
              overflowY: 'auto',
              padding: 2
            }}>
              {filteredQuestions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isFlagged = flaggedQuestions.has(q.id);
                const isCurrent = currentIndex === idx;

                let bg = 'var(--bg-subtle)';
                let color = 'var(--text-main)';
                let border = '1px solid var(--border)';

                if (isCurrent) {
                  border = '2px solid var(--primary)';
                }
                if (isAnswered) {
                  bg = 'rgba(99, 102, 241, 0.15)';
                  color = 'var(--primary)';
                }
                if (isFlagged) {
                  border = '2px solid var(--danger)';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    style={{
                      height: 38,
                      borderRadius: 8,
                      border,
                      background: bg,
                      color,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--danger)'
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(99, 102, 241, 0.2)' }} />
                <span>Respondida</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, border: '2px solid var(--primary)' }} />
                <span>Actual</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, border: '2px solid var(--danger)' }} />
                <span>Marcada para revisión</span>
              </div>
            </div>

            {mode === 'timed' && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
                onClick={handleFinishExam}
              >
                Finalizar y Calificar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
