'use client';

import React, { useState, useRef } from 'react';
import { Volume2, CheckCircle2, Search, ArrowRight, ArrowLeft, Play, Sparkles, Check, X, RotateCcw } from 'lucide-react';
import audioManager from '../lib/audioManager';
import { dataStore } from '../lib/data';
import * as wanakana from 'wanakana';
import SpeechPractice from './SpeechPractice';

export default function GrammarTab({ appState, onUpdateState }) {
  const [filterParticle, setFilterParticle] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quizActive, setQuizActive] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null); // { selected, isCorrect, correct, sentence, role }
  const [imeInput, setImeInput] = useState('');
  const isComposingRef = useRef(false);

  const particlesData = dataStore.particles || [];

  // Filter particles
  const uniqueParticles = ['all', ...new Set(particlesData.map(p => p.particle))];

  const filteredParticles = particlesData.filter(p => {
    const matchFilter = filterParticle === 'all' || p.particle === filterParticle;
    const search = searchTerm.trim().toLowerCase();
    const matchSearch = !search ||
      p.particle.toLowerCase().includes(search) ||
      (p.role_es && p.role_es.toLowerCase().includes(search)) ||
      (p.role_en && p.role_en.toLowerCase().includes(search)) ||
      (p.examples && p.examples.some(ex => ex.toLowerCase().includes(search)));
    return matchFilter && matchSearch;
  });

  const masteredCount = particlesData.filter(p => !!appState.masteredParticles?.[p.id]).length;
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
  const quizQuestions = React.useMemo(() => {
    const questions = [];
    particlesData.forEach(p => {
      if (p.quiz_items && p.quiz_items.length > 0) {
        p.quiz_items.forEach(q => {
          questions.push({
            ...q,
            particleRole: p.role_es,
            particleName: p.particle
          });
        });
      }
    });
    return questions.sort(() => 0.5 - Math.random());
  }, [quizActive]);

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
      const newXp = (appState.xp || 0) + 15;
      onUpdateState({
        ...appState,
        xp: newXp
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
    const pClean = particle.split('・')[0];
    const parts = sentence.split(pClean);
    if (parts.length === 1) return sentence;

    return parts.reduce((acc, part, i) => {
      if (i === 0) return [part];
      return [
        ...acc,
        <span key={i} style={{ color: 'var(--accent)', fontWeight: 800, borderBottom: '2px solid var(--accent)' }}>
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
          Guía y checklist interactivo con las 25 funciones fundamentales de las partículas japonesas extraídas de tus materiales de estudio, con explicaciones claras en español, pronunciación nativa y cuestionario de evaluación.
        </p>
      </div>

      {!quizActive ? (
        <div>
          {/* Progress Overview Card */}
          <div className="card" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                Tu Progreso del Checklist: <span style={{ color: 'var(--primary)' }}>{masteredCount} de {particlesData.length} dominadas</span> ({progressPercent}%)
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Marca las casillas conforme comprendas cada función y pon a prueba tu dominio en el Quiz.
              </div>
              <div style={{ width: 280, height: 8, background: 'var(--border)', borderRadius: 999, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.4s' }} />
              </div>
            </div>

            <button 
              className="btn btn-accent btn-lg"
              onClick={() => {
                setQuizIndex(0);
                setQuizFeedback(null);
                setQuizActive(true);
              }}
            >
              ⚡ Iniciar Quiz de Partículas
            </button>
          </div>

          {/* Filter Bar */}
          <div className="vocab-filter-bar">
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="search-input" 
                style={{ paddingLeft: 38 }}
                placeholder="Buscar función, ejemplo o partícula (ej. は, posesión, tiempo)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {uniqueParticles.map((p) => (
                <button
                  key={p}
                  className={`btn ${filterParticle === p ? 'btn-primary' : 'btn-outline'} btn-sm jp-text`}
                  onClick={() => setFilterParticle(p)}
                >
                  {p === 'all' ? 'Todas' : p}
                </button>
              ))}
            </div>
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
                  <div className="particle-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="particle-symbol jp-text">
                        {p.particle}
                      </div>
                      <div className="particle-role">
                        <h4>{p.role_es}</h4>
                        <p>{p.role_en}</p>
                      </div>
                    </div>

                    <label className="particle-check" title="Marcar función como dominada">
                      <input 
                        type="checkbox"
                        checked={isMastered}
                        onChange={() => toggleParticleMastery(p.id)}
                        style={{ width: 18, height: 18, accentColor: 'var(--success)', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.8rem', color: isMastered ? 'var(--success)' : 'var(--text-muted)', fontWeight: isMastered ? 700 : 500 }}>
                        {isMastered ? 'Dominada' : 'Aprender'}
                      </span>
                    </label>
                  </div>

                  {/* Examples */}
                  <div className="particle-examples">
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                      Ejemplos de Uso:
                    </div>
                    {p.examples.map((ex, idx) => (
                      <div key={idx} className="particle-example-row">
                        <span className="jp-text" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', flex: 1 }}>
                          {highlightParticle(ex, p.particle)}
                        </span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button 
                            className="audio-btn" 
                            style={{ width: 28, height: 28 }}
                            onClick={() => audioManager.speak(ex)}
                            title="Escuchar pronunciación"
                          >
                            <Volume2 size={15} />
                          </button>
                          <SpeechPractice targetText={ex} />
                        </div>
                      </div>
                    ))}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => setQuizActive(false)}
                >
                  <ArrowLeft size={16} /> Volver al Checklist
                </button>
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
                  <div className="jp-text" style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginTop: 4 }}>
                    {quizFeedback.sentence}
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
                  onClick={() => setQuizActive(false)}
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
