'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Volume2, CheckCircle2, Circle, Search, ArrowLeft, RotateCcw, PenTool, Info, Target } from 'lucide-react';
import audioManager from '../../lib/audioManager';
import particlesData from '../../data/particles.json';
import * as wanakana from 'wanakana';
import { useApp } from '../../lib/AppContext';
import { SRSRating, reviewCard, ensureFsrsCard } from '../../lib/srs';
import { recordActivity } from '../../lib/storage';

// Lazy loading con code-splitting
const SpeechPractice = dynamic(() => import('../features/SpeechPractice'), { ssr: false });

export default function GrammarTab({ 
  appState, 
  onUpdateState,
  initialParticle = null,
  initialSearch = null,
  initialQuiz = false,
  initialLevel = null,
  onParamsChange
}) {
  const contextApp = useApp();

  const [levelFilter, setLevelFilter] = useState(initialLevel || 'all');
  const [filterParticle, setFilterParticle] = useState(initialParticle || 'all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'mastered'
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [quizActive, setQuizActive] = useState(!!initialQuiz);
  const [quizFilter, setQuizFilter] = useState('all'); // 'all' | 'pending'
  const [quizLevelFilter, setQuizLevelFilter] = useState(initialLevel || 'all'); // 'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null); // { selected, isCorrect, correct, sentence, role }
  const [imeInput, setImeInput] = useState('');
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (initialLevel) {
      setLevelFilter(initialLevel);
      setQuizLevelFilter(initialLevel);
    }
  }, [initialLevel]);

  useEffect(() => {
    if (initialParticle) setFilterParticle(initialParticle);
  }, [initialParticle]);

  useEffect(() => {
    if (initialSearch !== null && initialSearch !== undefined) setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialQuiz !== undefined) setQuizActive(!!initialQuiz);
  }, [initialQuiz]);

  const updateParams = (newP, newSearch, newQuiz, newLevel) => {
    if (onParamsChange) {
      onParamsChange({
        particle: newP !== undefined ? newP : filterParticle,
        search: newSearch !== undefined ? newSearch : searchTerm,
        quiz: newQuiz !== undefined ? newQuiz : quizActive,
        level: newLevel !== undefined ? newLevel : levelFilter
      });
    }
  };

  const [visibleCount, setVisibleCount] = useState(30);

  // Progressive Disclosure: Examples toggle per particle
  const [expandedExamples, setExpandedExamples] = useState({});
  const toggleExpandExamples = (id) => {
    setExpandedExamples(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setVisibleCount(30);
  }, [levelFilter, filterParticle, filterStatus, searchTerm]);

  const levelCounts = useMemo(() => {
    const counts = { all: particlesData.length, N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
    particlesData.forEach(p => {
      const lvl = p.level || 'N5';
      if (counts[lvl] !== undefined) counts[lvl]++;
    });
    return counts;
  }, [particlesData]);

  // Unique particle symbols filtered by selected level
  const uniqueParticles = useMemo(() => {
    const pool = levelFilter === 'all'
      ? particlesData
      : particlesData.filter(p => (p.level || 'N5') === levelFilter);
    return ['all', ...new Set(pool.map(p => p.particle))];
  }, [particlesData, levelFilter]);

  const getLevelBadgeStyle = (level) => {
    switch (level) {
      case 'N5':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#059669', borderColor: 'rgba(16, 185, 129, 0.3)' };
      case 'N4':
        return { background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', borderColor: 'rgba(59, 130, 246, 0.3)' };
      case 'N3':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', borderColor: 'rgba(245, 158, 11, 0.3)' };
      case 'N2':
        return { background: 'rgba(139, 92, 246, 0.15)', color: '#7c3aed', borderColor: 'rgba(139, 92, 246, 0.3)' };
      case 'N1':
        return { background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { background: 'var(--primary-bg, rgba(59, 130, 246, 0.1))', color: 'var(--primary)', borderColor: 'rgba(59, 130, 246, 0.2)' };
    }
  };

  const filteredParticles = useMemo(() => {
    return particlesData.filter(p => {
      const isMastered = !!appState.masteredParticles?.[p.id];
      if (filterStatus === 'mastered' && !isMastered) return false;
      if (filterStatus === 'pending' && isMastered) return false;

      const pLevel = p.level || 'N5';
      if (levelFilter !== 'all' && pLevel !== levelFilter) return false;

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
  }, [particlesData, levelFilter, filterParticle, filterStatus, searchTerm, appState.masteredParticles]);

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

  // Compile quiz questions from particle quiz_items with level filtering
  const quizQuestions = useMemo(() => {
    const questions = [];
    particlesData.forEach(p => {
      const isMastered = !!appState.masteredParticles?.[p.id];
      if (quizFilter === 'pending' && isMastered) return;

      const pLevel = p.level || 'N5';
      if (quizLevelFilter !== 'all' && pLevel !== quizLevelFilter) return;

      if (p.quiz_items && p.quiz_items.length > 0) {
        p.quiz_items.forEach(q => {
          questions.push({
            ...q,
            particleLevel: pLevel,
            particleRole: p.role_es,
            particleName: p.particle,
            particleId: p.id
          });
        });
      }
    });
    return questions.sort(() => 0.5 - Math.random());
  }, [quizActive, particlesData, quizFilter, quizLevelFilter, appState.masteredParticles]);

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

    const exId = `PARTICLE-${currentQuiz.particleName}-${currentQuiz.sentence.slice(0, 10)}`;
    const rating = isCorrect ? SRSRating.GOOD : SRSRating.AGAIN;
    
    // Actualizar tarjeta FSRS para esta partícula
    const currentParticleCard = appState.masteredParticles?.[currentQuiz.particleName];
    const newParticleCard = reviewCard(ensureFsrsCard(currentParticleCard), rating);

    // Actualizar tarjeta FSRS para esta pregunta específica
    const currentQuestionCard = appState.srsQuestions?.[exId];
    const newQuestionCard = reviewCard(ensureFsrsCard(currentQuestionCard), rating);

    const updatedState = {
      ...appState,
      masteredParticles: {
        ...(appState.masteredParticles || {}),
        [currentQuiz.particleName]: newParticleCard
      },
      srsQuestions: {
        ...(appState.srsQuestions || {}),
        [exId]: newQuestionCard
      },
      completedExercises: {
        ...(appState.completedExercises || {}),
        [exId]: true
      }
    };

    const finalState = recordActivity(updatedState, isCorrect);
    onUpdateState(finalState);

    if (isCorrect) {
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
      <div className="module-hero-card">
        <div className="module-hero-content">
          <div className="module-hero-title-row">
            <div 
              className="module-hero-icon-badge" 
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
            >
              <Target size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <span className="module-category-pill" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.12)' }}>
                  Recursos & Práctica
                </span>
                <button
                  type="button"
                  className="tour-info-shortcut-btn"
                  onClick={() => {
                    if (contextApp?.openTour) {
                      contextApp.openTour('particles');
                    } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
                      window.__nihongoOpenTour('particles');
                    }
                  }}
                  title="Ver guía y explicación de Partículas y Gramática"
                  aria-label="Información de Partículas"
                >
                  <Info size={14} />
                  <span>Guía</span>
                </button>
              </div>
              <h1 className="module-hero-title">Partículas y Gramática</h1>
              <p className="module-hero-subtitle">
                Guía interactiva de partículas y estructuras gramaticales con explicaciones funcionales, oraciones de ejemplo y modo quiz.
              </p>
            </div>
          </div>
        </div>
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
                updateParams(filterParticle, searchTerm, true, levelFilter);
              }}
            >
              ⚡ Iniciar Quiz de Partículas
            </button>
          </div>

          {/* Filter Bar */}
          <div className="vocab-filter-bar" style={{ minWidth: 0, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Row 1: Search & Status */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: '100%' }}>
                <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ paddingLeft: 38 }}
                  placeholder="Buscar función, fórmula, ejemplo o traducción..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    updateParams(filterParticle, e.target.value, quizActive, levelFilter);
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
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

            {/* Row 2: JLPT Level Filters */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Nivel JLPT:</span>
              {['all', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => {
                const count = levelCounts[lvl] || 0;
                const isActive = levelFilter === lvl;
                const badgeStyle = lvl !== 'all' ? getLevelBadgeStyle(lvl) : null;
                return (
                  <button
                    key={lvl}
                    className={`btn ${isActive ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    style={{
                      minWidth: 44,
                      padding: '4px 10px',
                      ...(isActive && badgeStyle ? { background: badgeStyle.color, borderColor: badgeStyle.color, color: '#fff' } : {})
                    }}
                    onClick={() => {
                      setLevelFilter(lvl);
                      const pool = lvl === 'all' ? particlesData : particlesData.filter(p => (p.level || 'N5') === lvl);
                      const hasCurrent = pool.some(p => p.particle === filterParticle);
                      const nextPart = hasCurrent ? filterParticle : 'all';
                      if (nextPart !== filterParticle) {
                        setFilterParticle('all');
                      }
                      updateParams(nextPart, searchTerm, quizActive, lvl);
                    }}
                  >
                    {lvl === 'all' ? `Todas (${count})` : `${lvl} (${count})`}
                  </button>
                );
              })}
            </div>

            {/* Row 3: Particle Symbols Filter */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Partícula:</span>
              {uniqueParticles.map((p) => (
                <button
                  key={p}
                  className={`btn ${filterParticle === p ? 'btn-primary' : 'btn-outline'} btn-sm jp-text`}
                  onClick={() => {
                    setFilterParticle(p);
                    updateParams(p, searchTerm, quizActive, levelFilter);
                  }}
                >
                  {p === 'all' ? 'Todas' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Results count indicator */}
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span>Mostrando <strong>{filteredParticles.length}</strong> de {particlesData.length} partículas</span>
            {levelFilter !== 'all' && (
              <span 
                className="particle-level-tag" 
                style={{ ...getLevelBadgeStyle(levelFilter), borderWidth: 1, borderStyle: 'solid' }}
              >
                Nivel {levelFilter}
              </span>
            )}
            {filterParticle !== 'all' && <span>• Partícula: <strong className="jp-text">{filterParticle}</strong></span>}
            {filterStatus !== 'all' && <span>• {filterStatus === 'mastered' ? 'Dominadas' : 'Por aprender'}</span>}
            {searchTerm.trim() && <span>• Búsqueda: &quot;{searchTerm.trim()}&quot;</span>}
          </div>

          {/* Particles Grid */}
          <div className="particles-grid">
            {filteredParticles.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1rem', marginBottom: 12 }}>No se encontraron partículas con los filtros seleccionados.</p>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  onClick={() => {
                    setLevelFilter('all');
                    setFilterParticle('all');
                    setFilterStatus('all');
                    setSearchTerm('');
                    updateParams('all', '', quizActive, 'all');
                  }}
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              filteredParticles.slice(0, visibleCount).map((p) => {
                const isMastered = !!appState.masteredParticles?.[p.id];
                const pLevel = p.level || 'N5';
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
                          <span 
                            className="particle-level-tag"
                            style={{
                              ...getLevelBadgeStyle(pLevel),
                              borderWidth: 1,
                              borderStyle: 'solid'
                            }}
                          >
                            {pLevel}
                          </span>
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

                  {/* Examples Section with Progressive Disclosure */}
                  {p.examples && p.examples.length > 0 && (() => {
                    const isExpanded = Boolean(expandedExamples[p.id]);
                    const displayExamples = isExpanded || p.examples.length <= 2 ? p.examples : p.examples.slice(0, 2);
                    const remainingCount = p.examples.length - 2;

                    return (
                      <div className="particle-examples-section">
                        <div className="particle-examples-header">
                          <span>Ejemplos de uso ({p.examples.length})</span>
                          {p.examples.length > 2 && (
                            <button
                              type="button"
                              onClick={() => toggleExpandExamples(p.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--primary)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}
                            >
                              {isExpanded ? 'Ver menos' : `+ Ver ${remainingCount} más`}
                            </button>
                          )}
                        </div>

                        <div className="particle-examples-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {displayExamples.map((ex, idx) => {
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
                                    <button 
                                      type="button"
                                      className="audio-btn" 
                                      onClick={() => {
                                        if (contextApp?.openPracticePad) {
                                          contextApp.openPracticePad({
                                            text: exJa,
                                            kana: wanakana.toKana(exRomaji || ''),
                                            title: `Gramática: Partícula ${p.particle}`,
                                            source: 'grammar'
                                          });
                                        } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                                          window.__nihongoOpenPracticePad({
                                            text: exJa,
                                            kana: wanakana.toKana(exRomaji || ''),
                                            title: `Gramática: Partícula ${p.particle}`,
                                            source: 'grammar'
                                          });
                                        }
                                      }}
                                      title="Practicar caligrafía y trazos de este ejemplo en Cuaderno"
                                    >
                                      <PenTool size={15} />
                                    </button>
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
                    );
                  })()}
                </div>
              );
            }))}
          </div>

          {visibleCount < filteredParticles.length && (
            <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 20 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setVisibleCount((prev) => prev + 30)}
                style={{ padding: '10px 24px', fontWeight: 600 }}
              >
                Mostrar más partículas ({filteredParticles.length - visibleCount} restantes)
              </button>
            </div>
          )}
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
                    updateParams(filterParticle, searchTerm, false, levelFilter);
                  }}
                >
                  <ArrowLeft size={16} /> Volver al Checklist
                </button>

                {/* Level Filter for Quiz */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-main)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nivel:</span>
                  {['all', 'N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
                    <button
                      key={lvl}
                      className={`btn btn-sm ${quizLevelFilter === lvl ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => { setQuizLevelFilter(lvl); setQuizIndex(0); setQuizFeedback(null); }}
                      style={{ fontSize: '0.78rem', padding: '3px 7px', height: 'auto' }}
                    >
                      {lvl === 'all' ? 'Todos' : lvl}
                    </button>
                  ))}
                </div>

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span 
                    className="particle-level-tag" 
                    style={{ 
                      ...getLevelBadgeStyle(currentQuiz.particleLevel || 'N5'),
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      borderWidth: 1,
                      borderStyle: 'solid'
                    }}
                  >
                    {currentQuiz.particleLevel || 'N5'}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    Función: {currentQuiz.particleRole}
                  </span>
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
                      <button 
                        type="button"
                        className="audio-btn" 
                        style={{ width: 28, height: 28 }}
                        onClick={() => {
                          if (contextApp?.openPracticePad) {
                            contextApp.openPracticePad({
                              text: quizFeedback.sentence,
                              title: `Gramática: ${quizFeedback.role || 'Práctica'}`,
                              source: 'grammar'
                            });
                          } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                            window.__nihongoOpenPracticePad({
                              text: quizFeedback.sentence,
                              title: `Gramática: ${quizFeedback.role || 'Práctica'}`,
                              source: 'grammar'
                            });
                          }
                        }}
                        title="Practicar caligrafía y trazos de esta oración en Cuaderno"
                      >
                        <PenTool size={14} />
                      </button>
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
                    updateParams(filterParticle, searchTerm, false, levelFilter);
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
