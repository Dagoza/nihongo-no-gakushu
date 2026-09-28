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
  GraduationCap
} from 'lucide-react';
import audioManager from '../lib/audioManager';

export default function CurriculumTab({ onNavigate, userState, onUpdateState }) {
  const steps = dataStore.curriculum || [];
  
  // State for active module detailed view
  const [selectedStepNum, setSelectedStepNum] = useState(null);
  
  // Quiz interaction state for module view
  const [quizAnswers, setQuizAnswers] = useState({}); // { [exerciseId]: selectedOption }
  const [quizFeedback, setQuizFeedback] = useState({}); // { [exerciseId]: { isCorrect, explanation } }

  const selectedStep = steps.find(s => s.step === selectedStepNum) || null;

  const handleOpenModule = (stepNum) => {
    setSelectedStepNum(stepNum);
    setQuizAnswers({});
    setQuizFeedback({});
    // Scroll smoothly to top
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCloseModule = () => {
    setSelectedStepNum(null);
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
      // Award XP
      const currentXp = userState.xp || 0;
      onUpdateState({
        ...userState,
        xp: currentXp + 5
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

            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate(selectedStep.tab)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>Abrir en Pestaña {selectedStep.tab.toUpperCase()}</span>
              <ExternalLink size={14} />
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
        {selectedStep.exercises && selectedStep.exercises.length > 0 && (
          <div className="card" style={{ marginBottom: 30 }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <HelpCircle size={20} color="var(--warning)" />
                <span>Ejercicios Prácticos del Módulo</span>
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Pon a prueba lo aprendido. Selecciona la opción correcta para ganar puntos de experiencia (+5 XP por acierto).
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {selectedStep.exercises.map((ex, idx) => {
                const selected = quizAnswers[ex.id];
                const feedback = quizFeedback[ex.id];

                return (
                  <div 
                    key={ex.id || idx}
                    style={{
                      padding: 18,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '2px 8px', background: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: 4 }}>
                        Pregunta {idx + 1}
                      </span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                        {ex.question}
                      </span>
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
              <span>Nivel Anterior (L{selectedStep.step - 1})</span>
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
            <span>{selectedStep.step < steps.length ? `Siguiente Nivel (L${selectedStep.step + 1})` : 'Volver a la Ruta Principal'}</span>
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
          <span>🗺️</span> Ruta de Aprendizaje Incremental
        </h2>
        <p className="section-desc">
          Plan de estudio progresivo estructurado paso a paso con datos extraídos de tus PDFs oficiales. Cada módulo cuenta con explicaciones detalladas, vocabulario con audio nativo, ejemplos en contexto y ejercicios interactivos para evaluar tu avance.
        </p>
      </div>

      <div className="curriculum-list">
        {steps.map((step) => {
          const isDone = userState?.completedSteps?.[step.step];

          return (
            <div key={step.step} className={`curriculum-step-card ${isDone ? 'completed' : ''}`}>
              <div className="step-number-badge">
                <span>{step.icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>L{step.step}</span>
              </div>

              <div className="step-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span className="step-target-tag">{step.stage}</span>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-subtitle">{step.subtitle}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Primary action: Open deep module view */}
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOpenModule(step.step)}
                      title="Ver detalles completos, ejercicios, vocabulario y explicaciones"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>Ir al Módulo</span>
                      <ArrowRight size={14} />
                    </button>

                    {/* Secondary action: Jump directly to app tab */}
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onNavigate(step.tab)}
                      title={`Ir a la pestaña ${step.tab.toUpperCase()}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <ExternalLink size={13} />
                      <span>Pestaña</span>
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
        })}
      </div>
    </div>
  );
}
