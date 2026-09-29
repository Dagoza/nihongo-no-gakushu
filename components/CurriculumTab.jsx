'use client';

import React, { useState } from 'react';
import dataStore from '../lib/data';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  Volume2, 
  HelpCircle, 
  FileText, 
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Layers,
  GraduationCap,
  Search,
  Filter,
  Target
} from 'lucide-react';
import audioManager from '../lib/audioManager';

export default function CurriculumTab({ onNavigate, userState, onUpdateState, initialStep = null, onStepChange }) {
  const steps = dataStore.curriculum || [];
  
  // State for active module detailed view
  const [selectedStepNum, setSelectedStepNum] = useState(initialStep);
  
  // Theme, Level and Status filter state
  const [selectedTheme, setSelectedTheme] = useState('all'); // 'all' | 'vida' | 'trabajo' | 'ciudad' | 'ocio'
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all' | 'A1' | 'N5' | 'N4'
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quiz interaction state for module view
  const [quizAnswers, setQuizAnswers] = useState({}); // { [exerciseId]: selectedOption }
  const [quizFeedback, setQuizFeedback] = useState({}); // { [exerciseId]: { isCorrect, explanation } }

  React.useEffect(() => {
    if (initialStep !== undefined) {
      setSelectedStepNum(initialStep);
    }
  }, [initialStep]);

  const selectedStep = steps.find(s => s.step === selectedStepNum) || null;

  // Theme step mapping
  const themeSteps = {
    vida: [1, 2, 3, 4, 6],
    trabajo: [7, 8, 9],
    ciudad: [5, 12, 13, 14, 15],
    ocio: [10, 11, 16, 17, 18, 19]
  };

  // Filtered steps
  const filteredSteps = steps.filter(step => {
    if (selectedTheme !== 'all') {
      const allowed = themeSteps[selectedTheme] || [];
      if (!allowed.includes(step.step)) return false;
    }
    if (selectedLevel !== 'all' && !(step.level || '').includes(selectedLevel)) return false;
    if (selectedStatus === 'completed' && !userState?.completedSteps?.[step.step]) return false;
    if (selectedStatus === 'pending' && !!userState?.completedSteps?.[step.step]) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (step.title || '').toLowerCase().includes(q);
      const matchSubtitle = (step.subtitle || '').toLowerCase().includes(q);
      const matchGuide = (step.detailed_guide || '').toLowerCase().includes(q);
      const matchGrammar = (step.grammar_focus || []).some(g => g.toLowerCase().includes(q));
      const matchVocab = (step.included_vocab || []).some(v => v.toLowerCase().includes(q));
      const matchCanDos = (step.can_dos || []).some(cd => (cd.task || '').toLowerCase().includes(q) || (cd.sample || '').toLowerCase().includes(q));
      if (!matchTitle && !matchSubtitle && !matchGuide && !matchGrammar && !matchVocab && !matchCanDos) return false;
    }
    return true;
  });

  const handleOpenModule = (stepNum) => {
    setSelectedStepNum(stepNum);
    if (onStepChange) onStepChange(stepNum);
    setQuizAnswers({});
    setQuizFeedback({});
    // Scroll smoothly to top
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCloseModule = () => {
    setSelectedStepNum(null);
    if (onStepChange) onStepChange(null);
  };

  const handlePlayAudio = (text, desc = '') => {
    audioManager.speak(text, desc);
  };

  const handleSelectOption = (exercise, option) => {
    const isCorrect = option === exercise.correct;
    setQuizAnswers(prev => ({ ...prev, [exercise.id]: option }));
    setQuizFeedback(prev => ({
      ...prev,
      [exercise.id]: {
        isCorrect,
        explanation: exercise.explanation
      }
    }));

    if (isCorrect && userState && onUpdateState) {
      // Award XP once and record exercise completion
      const alreadyDone = !!userState.completedExercises?.[exercise.id];
      const updatedExercises = {
        ...(userState.completedExercises || {}),
        [exercise.id]: true
      };
      onUpdateState({
        ...userState,
        completedExercises: updatedExercises,
        xp: (userState.xp || 0) + (!alreadyDone ? 5 : 0)
      });
    }
  };

  const toggleStepCompleted = (stepNum) => {
    if (!onUpdateState || !userState) return;
    const currentCompleted = userState.completedSteps || {};
    const isDone = !!currentCompleted[stepNum];
    const updated = {
      ...currentCompleted,
      [stepNum]: !isDone
    };
    onUpdateState({
      ...userState,
      completedSteps: updated,
      xp: (userState.xp || 0) + (!isDone ? 25 : 0)
    });
  };

  const toggleCanDoCompleted = (canDoId) => {
    if (!onUpdateState || !userState) return;
    const currentCanDos = userState.completedCanDos || {};
    const isDone = !!currentCanDos[canDoId];
    const updated = {
      ...currentCanDos,
      [canDoId]: !isDone
    };
    onUpdateState({
      ...userState,
      completedCanDos: updated,
      xp: (userState.xp || 0) + (!isDone ? 10 : 0)
    });
  };

  // If a specific module is selected, render the deep interactive view
  if (selectedStep) {
    const isDone = userState?.completedSteps?.[selectedStep.step];

    return (
      <div className="curriculum-detail-view animate-fade-in">
        {/* Navigation & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <button 
            className="btn btn-outline btn-sm"
            onClick={handleCloseModule}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={16} />
            <span>Volver a la Ruta</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className={`btn ${isDone ? 'btn-outline' : 'btn-success'} btn-sm`}
              onClick={() => toggleStepCompleted(selectedStep.step)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <CheckCircle2 size={16} color={isDone ? 'var(--success)' : '#fff'} />
              <span>{isDone ? 'Módulo Completado ✓' : 'Marcar como Completado (+25 XP)'}</span>
            </button>
          </div>
        </div>

        {/* Hero Card of the Module */}
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.04) 100%)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ 
              fontSize: '2.5rem', 
              width: 68, 
              height: 68, 
              background: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0
            }}>
              {selectedStep.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <span className="step-target-tag">{selectedStep.stage}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Nivel {selectedStep.step} de {steps.length}
                </span>
                {selectedStep.sourcePdf && (
                  <span style={{ fontSize: '0.78rem', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--primary)' }}>
                    📄 Extraído de: {selectedStep.sourcePdf}
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>
                {selectedStep.title}
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                {selectedStep.subtitle}
              </p>

              {/* Detailed Guide Narrative */}
              <div style={{ 
                background: 'var(--bg-surface)', 
                padding: '16px 20px', 
                borderRadius: 'var(--radius-md)', 
                borderLeft: '4px solid var(--primary)',
                fontSize: '0.98rem',
                lineHeight: 1.7,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <p><strong>📖 Guía Explicativa del Módulo:</strong></p>
                <p style={{ marginTop: 6 }}>{selectedStep.detailed_guide}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout for Objectives & Grammar Focus */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
          {/* Objectives Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={20} color="var(--primary)" />
              <span>Objetivos de Aprendizaje</span>
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedStep.objectives?.map((obj, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.95rem', lineHeight: 1.5 }}>
                  <CheckCircle2 size={16} color="var(--success)" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Grammar Points Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} color="var(--accent)" />
              <span>Puntos Clave de Gramática</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedStep.grammar_focus?.map((point, i) => (
                <div 
                  key={i} 
                  style={{ 
                    padding: '10px 14px', 
                    borderRadius: 'var(--radius-sm)', 
                    background: 'var(--primary-bg)', 
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    fontSize: '0.93rem',
                    fontWeight: 600,
                    color: 'var(--text-main)'
                  }}
                >
                  ⚡ {point}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Can-Do Objectives for Irodori */}
        {selectedStep.can_dos && selectedStep.can_dos.length > 0 && (() => {
          const completedInModule = selectedStep.can_dos.filter(cd => userState?.completedCanDos?.[cd.id]).length;
          const totalInModule = selectedStep.can_dos.length;
          const percentInModule = Math.round((completedInModule / totalInModule) * 100);

          return (
            <div className="card cando-section" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span>🎯</span>
                    <span>Competencias Can-Do (Fundación Japón / MCER A1)</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Autoevaluación práctica: valida las competencias comunicativas que puedas realizar en el mundo real (+10 XP cada una).
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ 
                    fontSize: '0.82rem', 
                    fontWeight: 700, 
                    padding: '4px 12px', 
                    borderRadius: 'var(--radius-full)', 
                    background: completedInModule === totalInModule ? 'rgba(16, 185, 129, 0.15)' : 'rgba(236, 72, 153, 0.15)', 
                    color: completedInModule === totalInModule ? 'var(--success)' : '#ec4899', 
                    border: `1px solid ${completedInModule === totalInModule ? 'rgba(16, 185, 129, 0.3)' : 'rgba(236, 72, 153, 0.3)'}` 
                  }}>
                    {completedInModule} / {totalInModule} dominadas ({percentInModule}%)
                  </span>
                </div>
              </div>

              {/* Progress Bar for Module's Can-Dos */}
              <div style={{ width: '100%', height: 6, background: 'var(--bg-main)', borderRadius: 10, overflow: 'hidden', marginBottom: 18, border: '1px solid var(--border)' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${percentInModule}%`, 
                  background: completedInModule === totalInModule ? 'var(--success)' : 'linear-gradient(90deg, #ec4899, #f43f5e)', 
                  transition: 'width 0.3s ease' 
                }} />
              </div>

              <div className="cando-grid">
                {selectedStep.can_dos.map((cd, idx) => {
                  const isCanDoDone = !!userState?.completedCanDos?.[cd.id];

                  return (
                    <div key={idx} className={`cando-card ${isCanDoDone ? 'completed-cando' : ''}`}>
                      <div className="cando-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className={`cando-badge ${isCanDoDone ? 'badge-completed' : ''}`}>
                            <Target size={13} />
                            {cd.id}
                          </span>
                          <span className="cando-tag">Irodori A1</span>
                        </div>

                        {/* Interactive Checkbox / Autoevaluación Button */}
                        <button
                          type="button"
                          onClick={() => toggleCanDoCompleted(cd.id)}
                          className={`cando-check-btn ${isCanDoDone ? 'checked' : ''}`}
                          title={isCanDoDone ? 'Desmarcar competencia' : 'Validar competencia como dominada (+10 XP)'}
                        >
                          <div className={`cando-checkbox-square ${isCanDoDone ? 'checked' : ''}`}>
                            {isCanDoDone && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span>{isCanDoDone ? 'Dominada ✓' : 'Autoevaluar'}</span>
                        </button>
                      </div>

                      <h4 className="cando-task">
                        {cd.task}
                      </h4>

                      {cd.sample && (
                        <div className="cando-expression-box">
                          <div className="cando-expression-content">
                            <span className="cando-expression-label">💬 Frase clave</span>
                            <div className="cando-expression-text jp-text">{cd.sample}</div>
                          </div>
                          <button 
                            className="cando-audio-btn" 
                            onClick={() => audioManager.speak(cd.sample.replace(/\//g, '、'))}
                            title="Escuchar pronunciación"
                            aria-label="Escuchar pronunciación"
                          >
                            <Volume2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Integrated Vocabulary Section */}
        {selectedStep.vocab_details && selectedStep.vocab_details.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={20} color="var(--primary)" />
                  <span>Vocabulario Esencial del Nivel</span>
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Haz clic en el altavoz o en la palabra para escuchar la pronunciación nativa.
                </p>
              </div>

              <button 
                className="btn btn-outline btn-sm"
                onClick={() => {
                  const playlist = selectedStep.vocab_details.map(v => ({ text: v.kanji, desc: `${v.kana} - ${v.meaning}` }));
                  audioManager.setPlaylist(playlist, 0);
                }}
              >
                <Volume2 size={16} />
                <span>Reproducir Todo el Léxico</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {selectedStep.vocab_details.map((v, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => handlePlayAudio(v.kanji, `${v.kana} (${v.meaning})`)}
                  title="Click para escuchar pronunciación"
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span className="jp-text" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {v.kanji}
                      </span>
                      <span className="jp-text" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {v.kana}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: 2, fontWeight: 500 }}>
                      {v.meaning}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: 2 }}>
                      {v.type}
                    </div>
                  </div>

                  <button 
                    className="btn btn-outline btn-sm"
                    style={{ padding: '6px', borderRadius: '50%', flexShrink: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayAudio(v.kanji, `${v.kana} (${v.meaning})`);
                    }}
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Examples with Audio & Breakdown */}
        {selectedStep.examples && selectedStep.examples.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>💬</span>
                <span>Ejemplos Reales en Contexto</span>
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Oraciones extraídas de diálogos y lecturas con traducción minuciosa y notas culturales.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {selectedStep.examples.map((ex, i) => (
                <div 
                  key={i} 
                  style={{ 
                    padding: 16, 
                    borderRadius: 'var(--radius-md)', 
                    background: 'var(--bg-surface)', 
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <div className="jp-text" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>
                        {ex.jp}
                      </div>
                      <div className="jp-text" style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                        {ex.kana} · <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-sans)' }}>{ex.romaji}</span>
                      </div>
                      <div style={{ fontSize: '1.02rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                        🇪🇸 {ex.es}
                      </div>
                    </div>

                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handlePlayAudio(ex.jp, ex.es)}
                      title="Escuchar oración completa"
                      style={{ flexShrink: 0 }}
                    >
                      <Volume2 size={16} />
                      <span>Audio</span>
                    </button>
                  </div>

                  {ex.explanation && (
                    <div style={{ 
                      fontSize: '0.86rem', 
                      background: 'var(--bg-main)', 
                      padding: '8px 12px', 
                      borderRadius: 'var(--radius-sm)', 
                      color: 'var(--text-muted)',
                      borderLeft: '3px solid var(--accent)'
                    }}>
                      💡 <strong>Análisis:</strong> {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practical Interactive Exercises */}
        {selectedStep.exercises && selectedStep.exercises.length > 0 && (() => {
          const completedExCount = selectedStep.exercises.filter(ex => userState?.completedExercises?.[ex.id]).length;
          const allCompleted = completedExCount === selectedStep.exercises.length;

          return (
            <div className="card" style={{ marginBottom: 30 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HelpCircle size={20} color="var(--warning)" />
                    <span>Ejercicios Prácticos del Módulo</span>
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Pon a prueba lo aprendido. Selecciona la opción correcta para ganar puntos de experiencia (+5 XP por acierto).
                  </p>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: allCompleted ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-main)',
                  border: allCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progreso:</span>
                  <span style={{ color: allCompleted ? 'var(--success)' : 'var(--primary)' }}>
                    {completedExCount} / {selectedStep.exercises.length} {allCompleted ? '✓ Completados' : 'superados'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {selectedStep.exercises.map((ex, idx) => {
                  const selected = quizAnswers[ex.id];
                  const feedback = quizFeedback[ex.id];
                  const isAlreadySolved = !!userState?.completedExercises?.[ex.id];

                  return (
                    <div 
                      key={ex.id || idx}
                      style={{
                        padding: 18,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-main)',
                        border: isAlreadySolved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '2px 8px', background: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: 4 }}>
                            Pregunta {idx + 1}
                          </span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                            {ex.question}
                          </span>
                        </div>
                        {isAlreadySolved && (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--success)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: 999,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <Check size={12} /> Superado (+5 XP)
                          </span>
                        )}
                      </div>

                    <div className="jp-text" style={{ fontSize: '1.3rem', fontWeight: 700, margin: '10px 0 14px', color: 'var(--text-main)' }}>
                      {ex.sentence}
                    </div>

                    {/* Options Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                      {ex.options.map((opt, optIdx) => {
                        let btnClass = 'btn-outline';
                        if (selected) {
                          if (opt === ex.correct) {
                            btnClass = 'btn-success';
                          } else if (opt === selected) {
                            btnClass = 'btn-danger';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            className={`btn ${btnClass}`}
                            disabled={!!selected}
                            onClick={() => handleSelectOption(ex, opt)}
                            style={{ 
                              fontSize: '1.05rem', 
                              padding: '10px 14px',
                              justifyContent: 'center',
                              fontWeight: 600
                            }}
                          >
                            <span className="jp-text">{opt}</span>
                            {selected && opt === ex.correct && <Check size={16} />}
                            {selected && opt === selected && opt !== ex.correct && <X size={16} />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback message */}
                    {feedback && (
                      <div style={{ 
                        marginTop: 12, 
                        padding: '10px 14px', 
                        borderRadius: 'var(--radius-sm)', 
                        background: feedback.isCorrect ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: feedback.isCorrect ? 'var(--success)' : 'var(--danger)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10
                      }}>
                        <div>
                          <strong>{feedback.isCorrect ? '¡Excelente! Correcto 🎉' : 'Incorrecto.'}</strong> {feedback.explanation}
                        </div>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                          onClick={() => {
                            setQuizAnswers(prev => ({ ...prev, [ex.id]: null }));
                            setQuizFeedback(prev => ({ ...prev, [ex.id]: null }));
                          }}
                        >
                          <RotateCcw size={13} />
                          <span>Reintentar</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

        {/* Temas y Módulos Relacionados Section */}
        {selectedStep.related_topics && selectedStep.related_topics.length > 0 && (
          <div className="card" style={{ marginBottom: 28, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.4rem' }}>🔗</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Temas y Módulos Relacionados
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Avanza o refuerza tu aprendizaje explorando los módulos consecutivos, precedentes o temáticamente afines:
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {selectedStep.related_topics.map((rel, rIdx) => (
                <div
                  key={rIdx}
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        padding: '3px 8px', 
                        borderRadius: 4, 
                        background: 'rgba(99, 102, 241, 0.12)', 
                        color: 'var(--primary)' 
                      }}>
                        {rel.relationship || 'Tema Relacionado'}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                        Módulo {rel.step}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '1.3rem' }}>{rel.icon || '📌'}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, lineHeight: 1.3 }}>
                        {rel.title}
                      </h4>
                    </div>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                      {rel.reason}
                    </p>
                  </div>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleOpenModule(rel.step)}
                    style={{ 
                      width: '100%', 
                      justifyContent: 'center', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6,
                      fontWeight: 600,
                      marginTop: 4
                    }}
                  >
                    <span>Ir al Módulo {rel.step}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          {selectedStep.step > 1 ? (
            <button 
              className="btn btn-outline"
              onClick={() => handleOpenModule(selectedStep.step - 1)}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <ArrowLeft size={16} />
              <span>Módulo Anterior (M{selectedStep.step - 1})</span>
            </button>
          ) : <div />}

          <button 
            className="btn btn-primary"
            onClick={() => {
              if (selectedStep.step < steps.length) {
                handleOpenModule(selectedStep.step + 1);
              } else {
                handleCloseModule();
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span>{selectedStep.step < steps.length ? `Siguiente Módulo (M${selectedStep.step + 1})` : 'Volver a la Ruta Principal'}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Overview of all Curriculum Steps
  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          <span>🗺️</span> Módulos Consolidados de Aprendizaje
        </h2>
        <p className="section-desc">
          Temario unificado y sin redundancias que consolida los <strong>79 Can-Dos de Irodori A1 (Fundación Japón)</strong>, las <strong>48 lecciones conversacionales de NHK World</strong> y la <strong>gramática progresiva JLPT N5/N4</strong>, interconectados mediante temas relacionados directos.
        </p>
      </div>

      {/* Overall Progress Banner */}
      {(() => {
        const totalModules = steps.length;
        const completedModulesCount = steps.filter(s => userState?.completedSteps?.[s.step]).length;
        const modulePercent = totalModules > 0 ? Math.round((completedModulesCount / totalModules) * 100) : 0;

        const allCanDos = steps.flatMap(s => s.can_dos || []);
        const totalCanDos = allCanDos.length;
        const completedCanDosCount = allCanDos.filter(cd => userState?.completedCanDos?.[cd.id]).length;
        const canDoPercent = totalCanDos > 0 ? Math.round((completedCanDosCount / totalCanDos) * 100) : 0;

        return (
          <div className="card ruta-progress-banner" style={{ marginBottom: 24, padding: '18px 22px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.07) 0%, rgba(236, 72, 153, 0.07) 100%)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.12rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <span>📊</span> Progreso de Ruta Consolidada y Competencias Can-Do
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
                  Valida los módulos completados y autoevalúa cada competencia comunicativa con los checkbox interactivos para acumular XP.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Ruta Consolidada</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {completedModulesCount}/{totalModules} ({modulePercent}%)
                  </div>
                </div>

                <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Can-Dos Validadas</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ec4899' }}>
                    {completedCanDosCount}/{totalCanDos} ({canDoPercent}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Dual visual progress bars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>🗺️ Módulos de la Ruta</span>
                  <span>{modulePercent}% completado</span>
                </div>
                <div style={{ width: '100%', height: 7, background: 'var(--bg-main)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ height: '100%', width: `${modulePercent}%`, background: 'var(--primary)', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>🎯 Competencias Can-Do</span>
                  <span>{canDoPercent}% dominado</span>
                </div>
                <div style={{ width: '100%', height: 7, background: 'var(--bg-main)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ height: '100%', width: `${canDoPercent}%`, background: 'linear-gradient(90deg, #ec4899, #f43f5e)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Theme & Level Filter Controls */}
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Theme Pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${selectedTheme === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedTheme('all')}
            style={{ fontWeight: 600, padding: '7px 14px' }}
          >
            🌐 Todos los Módulos ({steps.length})
          </button>
          <button
            className={`btn btn-sm ${selectedTheme === 'vida' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedTheme('vida')}
            style={{ fontWeight: 600, padding: '7px 14px' }}
          >
            🏠 Vida Cotidiana y Familia (5)
          </button>
          <button
            className={`btn btn-sm ${selectedTheme === 'trabajo' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedTheme('trabajo')}
            style={{ fontWeight: 600, padding: '7px 14px' }}
          >
            🏢 Trabajo, Horarios y Reglas (3)
          </button>
          <button
            className={`btn btn-sm ${selectedTheme === 'ciudad' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedTheme('ciudad')}
            style={{ fontWeight: 600, padding: '7px 14px' }}
          >
            🛍️ Ciudad, Tiendas y Transporte (5)
          </button>
          <button
            className={`btn btn-sm ${selectedTheme === 'ocio' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedTheme('ocio')}
            style={{ fontWeight: 600, padding: '7px 14px' }}
          >
            🎮 Ocio, Cultura, Salud y Metas (6)
          </button>
        </div>

        {/* Secondary filters: Level, Status and Search */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nivel:</span>
              {['all', 'A1', 'N5', 'N4'].map(lvl => (
                <button
                  key={lvl}
                  className={`btn btn-sm ${selectedLevel === lvl ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedLevel(lvl)}
                  style={{ fontSize: '0.8rem', padding: '4px 10px', height: 'auto' }}
                >
                  {lvl === 'all' ? 'Todos' : lvl}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado:</span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'pending', label: 'Pendientes' },
                { id: 'completed', label: 'Completados' }
              ].map(st => (
                <button
                  key={st.id}
                  className={`btn btn-sm ${selectedStatus === st.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedStatus(st.id)}
                  style={{ fontSize: '0.8rem', padding: '4px 10px', height: 'auto' }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', minWidth: 260, flex: '1 1 260px', maxWidth: 380 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar tema, kanji, gramática o Can-Do..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 32px 7px 36px',
                fontSize: '0.85rem',
                minWidth: 'unset',
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="clear-search-btn"
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="curriculum-list">
        {filteredSteps.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 12 }}>No se encontraron módulos con los filtros seleccionados.</p>
            <button className="btn btn-outline btn-sm" onClick={() => { setSelectedTheme('all'); setSelectedLevel('all'); setSelectedStatus('all'); setSearchQuery(''); }}>
              Restablecer filtros
            </button>
          </div>
        ) : (
          filteredSteps.map((step) => {
            const isDone = userState?.completedSteps?.[step.step];

            return (
              <div key={step.step} className={`curriculum-step-card ${isDone ? 'completed' : ''}`}>
                <div className="step-number-badge">
                  <span>{step.icon}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                    M{step.step}
                  </span>
                </div>

                <div className="step-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
                        <span className="step-target-tag">{step.stage}</span>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 700, 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          background: 'rgba(99, 102, 241, 0.12)', 
                          color: 'var(--primary)' 
                        }}>
                          {step.level}
                        </span>
                        {step.can_dos && step.can_dos.length > 0 && (() => {
                          const mTotal = step.can_dos.length;
                          const mDone = step.can_dos.filter(cd => userState?.completedCanDos?.[cd.id]).length;
                          const isAllDone = mDone === mTotal;

                          return (
                            <span style={{ 
                              fontSize: '0.72rem', 
                              fontWeight: 700, 
                              padding: '2px 8px', 
                              borderRadius: 4, 
                              background: isAllDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(236, 72, 153, 0.12)', 
                              color: isAllDone ? 'var(--success)' : '#db2777',
                              border: isAllDone ? '1px solid rgba(16, 185, 129, 0.3)' : 'none'
                            }}>
                              🎯 {mDone}/{mTotal} Can-Dos {isAllDone ? '✓' : ''}
                            </span>
                          );
                        })()}
                        {step.related_topics && step.related_topics.length > 0 && (
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 600, 
                            padding: '2px 8px', 
                            borderRadius: 4, 
                            background: 'var(--bg-surface)', 
                            border: '1px solid var(--border)', 
                            color: 'var(--text-muted)' 
                          }}>
                            🔗 {step.related_topics.length} temas relacionados
                          </span>
                        )}
                      </div>
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-subtitle">{step.subtitle}</p>
                    </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Direct Checkbox to Mark Module as Completed */}
                    <button 
                      type="button"
                      className={`step-card-check-btn ${isDone ? 'checked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStepCompleted(step.step);
                      }}
                      title={isDone ? 'Módulo completado (Clic para desmarcar)' : 'Marcar módulo como completado (+25 XP)'}
                    >
                      <div className={`step-checkbox-square ${isDone ? 'checked' : ''}`}>
                        {isDone ? <Check size={12} strokeWidth={3} /> : null}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                        {isDone ? 'Completado ✓' : 'Marcar'}
                      </span>
                    </button>

                    {/* Primary action: Open deep module view */}
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOpenModule(step.step)}
                      title="Ver guía completa, ejercicios, vocabulario con audio y temas relacionados"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>Ir al Módulo</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                <ul className="step-objectives">
                  {step.objectives?.slice(0, 3).map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <strong>Puntos Gramaticales:</strong> {step.grammar_focus?.join(' · ')}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Vocabulario Integrado ({step.included_vocab?.length} palabras):
                    </div>
                    <div className="step-chips">
                      {step.included_vocab?.map((w, idx) => (
                        <span 
                          key={idx} 
                          className="step-chip jp-text"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handlePlayAudio(w)}
                          title="Click para escuchar"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
