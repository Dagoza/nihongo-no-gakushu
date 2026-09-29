'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, CheckCircle2, Circle, Search, ArrowRight, ArrowLeft, Sparkles, RotateCcw, HelpCircle, BookOpen } from 'lucide-react';
import audioManager from '../lib/audioManager';
import { dataStore } from '../lib/data';
import * as wanakana from 'wanakana';
import SpeechPractice from './SpeechPractice';

export default function GrammarTab({ 
  appState, 
  onUpdateState,
  initialParticle = null,
  initialSearch = null,
  initialQuiz = false,
  onParamsChange
}) {
  const [filterParticle, setFilterParticle] = useState(initialParticle || 'all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'mastered'
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [quizActive, setQuizActive] = useState(!!initialQuiz);
  const [quizFilter, setQuizFilter] = useState('all'); // 'all' | 'pending'
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null); // { selected, isCorrect, correct, sentence, role }
  const [imeInput, setImeInput] = useState('');
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (initialParticle) setFilterParticle(initialParticle);
  }, [initialParticle]);

  useEffect(() => {
    if (initialSearch !== null && initialSearch !== undefined) setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialQuiz !== undefined) setQuizActive(!!initialQuiz);
  }, [initialQuiz]);

  const updateParams = (newP, newSearch, newQuiz) => {
    if (onParamsChange) {
      onParamsChange({
        particle: newP !== undefined ? newP : filterParticle,
        search: newSearch !== undefined ? newSearch : searchTerm,
        quiz: newQuiz !== undefined ? newQuiz : quizActive
      });
    }
  };

  const particlesData = dataStore.particles || [];

  // Filter particles
  const uniqueParticles = ['all', ...new Set(particlesData.map(p => p.particle))];

  const filteredParticles = useMemo(() => {
    return particlesData.filter(p => {
      const isMastered = !!appState.masteredParticles?.[p.id];
      if (filterStatus === 'mastered' && !isMastered) return false;
      if (filterStatus === 'pending' && isMastered) return false;

      const matchFilter = filterParticle === 'all' || p.particle === filterParticle;
      const search = searchTerm.trim().toLowerCase();
      if (!search) return matchFilter;

      const matchParticle = p.particle.toLowerCase().includes(search);
      const matchRoleEs = p.role_es && p.role_es.toLowerCase().includes(search);
      const matchRoleEn = p.role_en && p.role_en.toLowerCase().includes(search);
      const matchFormula = p.formula && p.formula.toLowerCase().includes(search);
      const matchExamples = p.examples && p.examples.some(ex => {
        const ja = typeof ex === 'string' ? ex : (ex.ja || '');
        const es = typeof ex === 'string' ? '' : (ex.es || '');
        const romaji = typeof ex === 'string' ? '' : (ex.romaji || '');
        return ja.toLowerCase().includes(search) || es.toLowerCase().includes(search) || romaji.toLowerCase().includes(search);
      });

      return matchFilter && (matchParticle || matchRoleEs || matchRoleEn || matchFormula || matchExamples);
    });
  }, [particlesData, filterParticle, filterStatus, searchTerm, appState.masteredParticles]);

  const masteredCount = particlesData.filter(p => !!appState.masteredParticles?.[p.id]).length;
  const pendingCount = particlesData.length - masteredCount;
  const progressPercent = Math.round((masteredCount / Math.max(1, particlesData.length)) * 100);

  const toggleParticleMastery = (id) => {
    const isMastered = !!appState.masteredParticles?.[id];
    const newMastered = {
      ...(appState.masteredParticles || {}),
      [id]: !isMastered
    };
    onUpdateState({
      ...appState,
      masteredParticles: newMastered
    });
  };

  // Compile quiz questions from particle quiz_items
  const quizQuestions = useMemo(() => {
    const questions = [];
    particlesData.forEach(p => {
      const isMastered = !!appState.masteredParticles?.[p.id];
      if (quizFilter === 'pending' && isMastered) return;

      if (p.quiz_items && p.quiz_items.length > 0) {
        p.quiz_items.forEach(q => {
          questions.push({
            ...q,
            particleRole: p.role_es,
            particleName: p.particle,
            particleId: p.id
          });
        });
      }
    });
    return questions.sort(() => 0.5 - Math.random());
  }, [quizActive, particlesData, quizFilter, appState.masteredParticles]);

  const currentQuiz = quizQuestions[quizIndex];

  const handleAnswerQuiz = (selected) => {
    if (!currentQuiz || quizFeedback) return;
    const isCorrect = selected === currentQuiz.correct;
    setQuizFeedback({
      selected,
      isCorrect,
      correct: currentQuiz.correct,
      sentence: currentQuiz.sentence,
      role: currentQuiz.particleRole
    });

    if (isCorrect) {
      const exId = `PARTICLE-${currentQuiz.particleName}-${currentQuiz.sentence.slice(0, 10)}`;
      const alreadyDone = !!appState.completedExercises?.[exId];
      const newXp = (appState.xp || 0) + (!alreadyDone ? 15 : 0);
      onUpdateState({
        ...appState,
        xp: newXp,
        completedExercises: {
          ...(appState.completedExercises || {}),
          [exId]: true
        }
      });
      audioManager.speak(currentQuiz.sentence);
    }

    setTimeout(() => {
      setQuizFeedback(null);
      setImeInput('');
      setQuizIndex((prev) => prev + 1);
    }, 2200);
  };

  const highlightParticle = (sentence, particle) => {
    if (!sentence) return '';
    const pClean = particle.split('・')[0];
    const parts = sentence.split(pClean);
    if (parts.length === 1) return sentence;

    return parts.reduce((acc, part, i) => {
      if (i === 0) return [part];
      return [
        ...acc,
        <span key={i} className="particle-highlight">
          {pClean}
        </span>,
        part
      ];
    }, []);
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <span>🎯</span> Partículas y Gramática Japonesa
        </h2>
        <p className="section-desc">
          Guía y checklist interactivo con las 25 funciones fundamentales de las partículas japonesas de nivel N5. Incluye fórmulas gramaticales, ejemplos con pronunciación nativa, lectura en romaji y traducción detallada al español.
        </p>
      </div>

      {!quizActive ? (
        <div>
          {/* Progress Overview Card */}
          <div className="card grammar-progress-card" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, minWidth: 0, maxWidth: '100%' }}>
            <div style={{ flex: 1, minWidth: 220, maxWidth: '100%' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                Progreso del Checklist: <span style={{ color: 'var(--primary)' }}>{masteredCount} de {particlesData.length} dominadas</span> ({progressPercent}%)
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Marca las casillas conforme comprendas cada función y pon a prueba tu dominio en el Quiz.
              </div>
              <div style={{ width: '100%', maxWidth: 280, height: 8, background: 'var(--border)', borderRadius: 999, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.4s' }} />
              </div>
            </div>

            <button 
              className="btn btn-accent btn-lg grammar-quiz-btn"
              onClick={() => {
                setQuizIndex(0);
                setQuizFeedback(null);
                setQuizActive(true);
                updateParams(filterParticle, searchTerm, true);
              }}
            >
              ⚡ Iniciar Quiz de Partículas
            </button>
          </div>

          {/* Filter Bar */}
          <div className="vocab-filter-bar" style={{ minWidth: 0, maxWidth: '100%' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="search-input" 
                style={{ paddingLeft: 38 }}
                placeholder="Buscar función, fórmula, ejemplo o traducción..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateParams(filterParticle, e.target.value, quizActive);
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {uniqueParticles.map((p) => (
                <button
                  key={p}
                  className={`btn ${filterParticle === p ? 'btn-primary' : 'btn-outline'} btn-sm jp-text`}
                  onClick={() => {
                    setFilterParticle(p);
                    updateParams(p, searchTerm, quizActive);
                  }}
                >
                  {p === 'all' ? 'Todas' : p}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', borderLeft: '1px solid var(--border)', paddingLeft: 10 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado:</span>
              {[
                { id: 'all', label: `Todas (${particlesData.length})` },
                { id: 'pending', label: `Por aprender (${pendingCount})` },
                { id: 'mastered', label: `Dominadas (${masteredCount})` }
              ].map(st => (
                <button
                  key={st.id}
                  className={`btn ${filterStatus === st.id ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  onClick={() => setFilterStatus(st.id)}
                  style={{ fontSize: '0.8rem', padding: '4px 10px', height: 'auto' }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count indicator */}
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Mostrando <strong>{filteredParticles.length}</strong> de {particlesData.length} partículas
            {filterParticle !== 'all' && ` con filtro "${filterParticle}"`}
            {searchTerm.trim() && ` para "${searchTerm.trim()}"`}
          </div>

          {/* Particles Grid */}
          <div className="particles-grid">
            {filteredParticles.map((p) => {
              const isMastered = !!appState.masteredParticles?.[p.id];
              return (
                <div 
                  key={p.id}
                  className={`particle-card ${isMastered ? 'mastered' : ''}`}
                >
                  {/* Card Header */}
                  <div className="particle-header">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                      <div className="particle-symbol jp-text">
                        {p.particle}
                      </div>
                      <div className="particle-role">
                        <div className="particle-meta">
                          <span className="particle-level-tag">{p.level || 'N5'}</span>
                          <span className="particle-role-en">{p.role_en}</span>
                        </div>
                        <h4 className="particle-role-title">{p.role_es || 'Función gramatical'}</h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`particle-master-btn ${isMastered ? 'mastered' : ''}`}
                      onClick={() => toggleParticleMastery(p.id)}
                      title={isMastered ? "Marcar como por aprender" : "Marcar como dominada"}
                    >
                      {isMastered ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      <span>{isMastered ? 'Dominada' : 'Aprender'}</span>
                    </button>
                  </div>

                  {/* Grammar Formula / Structure */}
                  {p.formula && (
                    <div className="particle-formula-box">
                      <span className="particle-formula-tag">Fórmula</span>
                      <span className="particle-formula-code jp-text">{p.formula}</span>
                    </div>
                  )}

                  {/* Examples Section */}
                  <div className="particle-examples-section">
                    <div className="particle-examples-header">
                      <span>Ejemplos de uso ({p.examples?.length || 0})</span>
                    </div>

                    <div className="particle-examples-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {p.examples && p.examples.map((ex, idx) => {
                        const exJa = typeof ex === 'string' ? ex : ex.ja;
                        const exRomaji = typeof ex === 'string' ? '' : ex.romaji;
                        const exEs = typeof ex === 'string' ? '' : ex.es;

                        return (
                          <div key={idx} className="particle-example-card">
                            <div className="particle-example-main">
                              <div className="jp-text particle-example-sentence">
                                {highlightParticle(exJa, p.particle)}
                              </div>
                              <div className="particle-example-actions">
                                <button 
                                  type="button"
                                  className="audio-btn" 
                                  onClick={() => audioManager.speak(exJa)}
                                  title="Escuchar pronunciación nativa"
                                >
                                  <Volume2 size={15} />
                                </button>
                                <SpeechPractice 
                                  targetText={exJa} 
                                  targetKana={wanakana.toKana(exRomaji || '')}
                                  compact={true} 
                                />
                              </div>
                            </div>

                            {exRomaji && (
                              <div className="particle-example-romaji">
                                {exRomaji}
                              </div>
                            )}

                            {exEs && (
                              <div className="particle-example-trans">
                                <span style={{ opacity: 0.8, marginRight: 4 }}>🇪🇸</span>
                                <span>{exEs}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* QUIZ MODE */
        <div className="quiz-container" style={{ maxWidth: 700 }}>
          {currentQuiz ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setQuizActive(false);
                    updateParams(filterParticle, searchTerm, false);
                  }}
                >
                  <ArrowLeft size={16} /> Volver al Checklist
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-main)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Preguntas:</span>
                  <button
                    className={`btn btn-sm ${quizFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setQuizFilter('all'); setQuizIndex(0); setQuizFeedback(null); }}
                    style={{ fontSize: '0.78rem', padding: '3px 8px', height: 'auto' }}
                  >
                    Todas
                  </button>
                  <button
                    className={`btn btn-sm ${quizFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setQuizFilter('pending'); setQuizIndex(0); setQuizFeedback(null); }}
                    style={{ fontSize: '0.78rem', padding: '3px 8px', height: 'auto' }}
                  >
                    Por aprender ({pendingCount})
                  </button>
                </div>

                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Pregunta {quizIndex + 1} de {quizQuestions.length}
                </span>
              </div>

              <div className="quiz-question-box">
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Función: {currentQuiz.particleRole}
                </div>

                <div className="quiz-sentence jp-text" style={{ fontSize: '1.5rem', lineHeight: 2 }}>
                  {currentQuiz.masked}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: 10 }}>
                  ¿Qué partícula encaja correctamente en el espacio para completar la oración?
                </p>
              </div>

              {/* 4 Options Grid */}
              <div className="quiz-options-grid">
                {currentQuiz.options.map((opt) => {
                  let btnClass = 'quiz-option-btn jp-text';
                  if (quizFeedback) {
                    if (opt === currentQuiz.correct) btnClass += ' correct';
                    else if (opt === quizFeedback.selected && !quizFeedback.isCorrect) btnClass += ' wrong';
                  }

                  return (
                    <button
                      key={opt}
                      className={btnClass}
                      onClick={() => handleAnswerQuiz(opt)}
                      disabled={!!quizFeedback}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* IME Input Option */}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  O teclea la partícula directamente con tu teclado japonés IME:
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="text" 
                    className="japanese-input jp-text" 
                    placeholder="Escribe la partícula en romaji (ej. wa, o, ni)..."
                    value={imeInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      const converted = wanakana.toKana(val, { IMEMode: true });
                      setImeInput(converted);
                    }}
                    onCompositionStart={() => { isComposingRef.current = true; }}
                    onCompositionEnd={() => { isComposingRef.current = false; }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isComposingRef.current && imeInput.trim()) {
                        handleAnswerQuiz(imeInput.trim());
                      }
                    }}
                    style={{ fontSize: '1.1rem', padding: '8px 12px' }}
                    disabled={!!quizFeedback}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={() => imeInput.trim() && handleAnswerQuiz(imeInput.trim())}
                    disabled={!imeInput.trim() || !!quizFeedback}
                  >
                    Validar
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {quizFeedback && (
                <div 
                  style={{ 
                    marginTop: 18, 
                    padding: '14px 18px', 
                    borderRadius: 'var(--radius-md)',
                    background: quizFeedback.isCorrect ? 'var(--success-bg)' : 'var(--danger-bg)',
                    border: `1px solid ${quizFeedback.isCorrect ? 'var(--success)' : 'var(--danger)'}`
                  }}
                >
                  <div style={{ fontWeight: 700, color: quizFeedback.isCorrect ? 'var(--success)' : 'var(--danger)', marginBottom: 4 }}>
                    {quizFeedback.isCorrect ? `🎉 ¡Correcto! (+15 XP) Partícula: ${quizFeedback.correct}` : `❌ Incorrecto. La partícula correcta es: ${quizFeedback.correct} (${quizFeedback.role})`}
                  </div>
                  <div className="jp-text" style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>{quizFeedback.sentence}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button 
                        type="button"
                        className="audio-btn" 
                        style={{ width: 28, height: 28 }}
                        onClick={() => audioManager.speak(quizFeedback.sentence)}
                        title="Escuchar oración completa"
                      >
                        <Volume2 size={14} />
                      </button>
                      <SpeechPractice 
                        targetText={quizFeedback.sentence} 
                        compact={true} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed View */
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12 }}>
                ¡Quiz de Partículas Completado!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 24 }}>
                Has repasado las partículas fundamentales. Tu racha se mantiene y has ganado puntos de experiencia.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setQuizIndex(0);
                    setQuizFeedback(null);
                  }}
                >
                  <RotateCcw size={16} /> Repetir Quiz
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setQuizActive(false);
                    updateParams(filterParticle, searchTerm, false);
                  }}
                >
                  Volver al Checklist
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
