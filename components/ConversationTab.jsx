'use client';

import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Play, 
  BookOpen, 
  MessageSquare, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Layers,
  Award,
  Check,
  CheckCheck,
  ChevronRight,
  Radio
} from 'lucide-react';
import audioManager from '../lib/audioManager';
import { dataStore } from '../lib/data';

export default function ConversationTab({ 
  appState, 
  onUpdateState,
  initialLesson = null,
  initialTab = 'dialogue',
  initialStatus = 'all',
  initialType = 'all',
  onParamsChange
}) {
  const [currentLessonNum, setCurrentLessonNum] = useState(initialLesson ? parseInt(initialLesson, 10) : 1);
  const [activeSubTab, setActiveSubTab] = useState(initialTab || 'dialogue'); // 'dialogue' | 'practice'
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all'); // 'all' | 'completed' | 'pending'
  
  // Exercise practice state
  const [filterType, setFilterType] = useState(initialType || 'all'); // 'all' | 'reply' | 'missing_word' | 'missing_kanji'
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const updateParams = (newLesson, newTab, newStatus, newType) => {
    if (onParamsChange) {
      onParamsChange({
        lesson: newLesson !== undefined ? newLesson : currentLessonNum,
        tab: newTab !== undefined ? newTab : activeSubTab,
        status: newStatus !== undefined ? newStatus : statusFilter,
        type: newType !== undefined ? newType : filterType
      });
    }
  };

  useEffect(() => {
    if (initialLesson) {
      const parsed = parseInt(initialLesson, 10);
      if (!isNaN(parsed) && parsed !== currentLessonNum) setCurrentLessonNum(parsed);
    }
  }, [initialLesson]);

  useEffect(() => {
    if (initialTab && (initialTab === 'dialogue' || initialTab === 'practice')) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialStatus) setStatusFilter(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (initialType) setFilterType(initialType);
  }, [initialType]);

  const lessons = dataStore.nhkLessons || [];
  const allExercises = dataStore.conversationExercises || [];

  const completedConversations = appState?.completedConversations || {};
  const completedCount = Object.values(completedConversations).filter(Boolean).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const lesson = lessons.find(l => l.lesson === currentLessonNum) || lessons[0];
  const isCurrentLessonCompleted = !!completedConversations[lesson?.lesson];

  // Filter lessons by completion status if requested
  const visibleLessons = lessons.filter(l => {
    const isCompleted = !!completedConversations[l.lesson];
    if (statusFilter === 'completed') return isCompleted;
    if (statusFilter === 'pending') return !isCompleted;
    return true;
  });

  // Exercises filtered by current active category
  const filteredExercises = allExercises.filter(ex => {
    if (filterType === 'all') return true;
    return ex.type === filterType;
  });

  const currentExercise = filteredExercises[currentExIndex] || filteredExercises[0];

  const toggleLessonCompletion = (lessonNum) => {
    if (!onUpdateState || !appState) return;
    const isCompleted = !!completedConversations[lessonNum];
    const newCompleted = {
      ...completedConversations,
      [lessonNum]: !isCompleted
    };
    
    // Reward XP when newly completing a conversation
    const xpBonus = !isCompleted ? 30 : 0;
    
    onUpdateState({
      ...appState,
      xp: (appState.xp || 0) + xpBonus,
      completedConversations: newCompleted
    });
  };

  const handlePlayFullDialogue = () => {
    if (!lesson || !lesson.dialogue) return;
    const playlist = lesson.dialogue.map(d => ({
      text: d.jp,
      desc: `${d.speaker}: ${d.es}`
    }));
    audioManager.setPlaylist(playlist, 0);
    if (playlist.length > 0) {
      audioManager.speak(playlist[0].text, { autoAdvance: true });
    }
  };

  const handleSelectOption = (option) => {
    if (selectedAnswer !== null || !currentExercise) return;
    const isCorrect = option === currentExercise.correct;
    setSelectedAnswer({
      chosen: option,
      isCorrect
    });
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    if (isCorrect) {
      audioManager.speak(option);
      if (onUpdateState && appState) {
        onUpdateState({
          ...appState,
          xp: (appState.xp || 0) + 10
        });
      }
    }
  };

  const handleNextExercise = () => {
    setSelectedAnswer(null);
    if (currentExIndex < filteredExercises.length - 1) {
      setCurrentExIndex(prev => prev + 1);
    } else {
      setCurrentExIndex(0);
    }
  };

  const handleResetExercises = () => {
    setSelectedAnswer(null);
    setCurrentExIndex(0);
    setScore({ correct: 0, total: 0 });
  };

  const handleJumpToNextPending = () => {
    const nextPending = lessons.find(l => !completedConversations[l.lesson]);
    if (nextPending) {
      setCurrentLessonNum(nextPending.lesson);
      updateParams(nextPending.lesson, activeSubTab, statusFilter, filterType);
    }
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <span>📻</span> Conversaciones y Diálogos Cotidianos
        </h2>
        <p className="section-desc">
          Diálogos reales de la vida cotidiana en Japón extraídos del programa oficial de la NHK, con audio interactivo línea por línea, explicaciones gramaticales, seguimiento de lecciones estudiadas y ejercicios interactivos didácticos.
        </p>
      </div>

      {/* Main Mode Switcher: Dialogue vs Practice */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 12, flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeSubTab === 'dialogue' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => {
            setActiveSubTab('dialogue');
            updateParams(currentLessonNum, 'dialogue', statusFilter, filterType);
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 700 }}
        >
          <MessageSquare size={18} /> Diálogos y Lecciones ({lessons.length})
        </button>

        <button
          className={`btn ${activeSubTab === 'practice' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => {
            setActiveSubTab('practice');
            updateParams(currentLessonNum, 'practice', statusFilter, filterType);
          }}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '10px 18px', 
            fontWeight: 700,
            background: activeSubTab === 'practice' ? 'var(--accent)' : 'transparent',
            borderColor: activeSubTab === 'practice' ? 'var(--accent)' : 'var(--border)',
            color: activeSubTab === 'practice' ? '#fff' : 'var(--text-main)'
          }}
        >
          <HelpCircle size={18} /> Ejercicios Didácticos de Diálogo ({allExercises.length})
        </button>
      </div>

      {/* SUBTAB 1: DIALOGUES */}
      {activeSubTab === 'dialogue' && (
        <>
          {/* Progress Overview Card */}
          <div className="card" style={{ marginBottom: 18, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.2rem' }}>🎓</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                    Progreso de Estudio: {completedCount} de {lessons.length} conversaciones completadas
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {progressPercent}% del curso completado · +30 XP por cada lección estudiada
                  </div>
                </div>
              </div>

              {/* Status Filters & Jump */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setStatusFilter('all');
                    updateParams(currentLessonNum, activeSubTab, 'all', filterType);
                  }}
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                >
                  Todas ({lessons.length})
                </button>
                <button
                  className={`btn btn-sm ${statusFilter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setStatusFilter('completed');
                    updateParams(currentLessonNum, activeSubTab, 'completed', filterType);
                  }}
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                >
                  ✓ Estudiadas ({completedCount})
                </button>
                <button
                  className={`btn btn-sm ${statusFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setStatusFilter('pending');
                    updateParams(currentLessonNum, activeSubTab, 'pending', filterType);
                  }}
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                >
                  Pendientes ({lessons.length - completedCount})
                </button>

                {completedCount < lessons.length && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={handleJumpToNextPending}
                    style={{ fontSize: '0.8rem', padding: '4px 12px', borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  >
                    Siguiente pendiente ➔
                  </button>
                )}
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div style={{ width: '100%', height: 8, background: 'var(--bg-main)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div 
                style={{ 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)', 
                  borderRadius: 999,
                  transition: 'width 0.4s ease' 
                }} 
              />
            </div>
          </div>

          {/* Lesson Selector Bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', maxHeight: 150, overflowY: 'auto', padding: '4px 0' }}>
            {visibleLessons.map(l => {
              const isDone = !!completedConversations[l.lesson];
              const isSelected = l.lesson === currentLessonNum;

              let btnClass = `btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`;
              return (
                <button
                  key={l.lesson}
                  className={btnClass}
                  onClick={() => {
                    setCurrentLessonNum(l.lesson);
                    updateParams(l.lesson, activeSubTab, statusFilter, filterType);
                  }}
                  style={{ 
                    fontSize: '0.85rem', 
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    borderColor: isDone ? (isSelected ? 'var(--primary)' : '#22c55e') : undefined,
                    background: isDone && !isSelected ? 'rgba(34, 197, 94, 0.08)' : undefined
                  }}
                  title={isDone ? `Lección ${l.lesson} (Estudiada)` : `Lección ${l.lesson} (Pendiente)`}
                >
                  {isDone ? (
                    <CheckCircle2 size={14} color={isSelected ? '#fff' : '#22c55e'} />
                  ) : (
                    <span style={{ opacity: 0.5 }}>○</span>
                  )}
                  <span>L{l.lesson}: {l.title_es.split('.')[0].slice(0, 20)}...</span>
                </button>
              );
            })}
          </div>

          {lesson && (
            <div className="card" style={{ marginBottom: 24, border: isCurrentLessonCompleted ? '1.5px solid rgba(34, 197, 94, 0.4)' : undefined }}>
              {/* Top Info Bar */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="vocab-tag">Lección {lesson.lesson} de {lessons.length} · {lesson.topic}</span>
                    {isCurrentLessonCompleted ? (
                      <span 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 4, 
                          fontSize: '0.8rem', 
                          fontWeight: 700, 
                          color: '#15803d', 
                          background: 'rgba(34, 197, 94, 0.12)', 
                          padding: '3px 10px', 
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid rgba(34, 197, 94, 0.3)'
                        }}
                      >
                        <CheckCircle2 size={13} color="#22c55e" /> Estudiada
                      </span>
                    ) : (
                      <span 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 4, 
                          fontSize: '0.8rem', 
                          fontWeight: 600, 
                          color: 'var(--text-muted)', 
                          background: 'var(--bg-main)', 
                          padding: '3px 10px', 
                          borderRadius: 'var(--radius-full)' 
                        }}
                      >
                        Pendiente de estudio
                      </span>
                    )}
                  </div>

                  <h3 className="jp-text" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: 8 }}>
                    {lesson.title_jp}
                  </h3>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    🇪🇸 {lesson.title_es}
                  </p>
                </div>

                {/* Header Action Buttons */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {/* Mark Completed Toggle Button */}
                  <button 
                    className="btn"
                    onClick={() => toggleLessonCompletion(lesson.lesson)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: isCurrentLessonCompleted ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-card)',
                      color: isCurrentLessonCompleted ? '#15803d' : 'var(--text-main)',
                      borderColor: isCurrentLessonCompleted ? '#22c55e' : 'var(--border)',
                      fontWeight: 700
                    }}
                    title={isCurrentLessonCompleted ? 'Hacer clic para marcar como pendiente' : 'Hacer clic para marcar como completada (+30 XP)'}
                  >
                    {isCurrentLessonCompleted ? (
                      <>
                        <CheckCircle2 size={17} color="#22c55e" /> Estudiada ✓
                      </>
                    ) : (
                      <>
                        <Check size={17} color="var(--primary)" /> Marcar como Estudiada (+30 XP)
                      </>
                    )}
                  </button>

                  <button 
                    className="btn btn-primary"
                    onClick={handlePlayFullDialogue}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    title="Reproducir los diálogos línea por línea con voz neuronal japonesa de Tokio"
                  >
                    <Play size={16} /> Diálogo Línea a Línea
                  </button>

                  {(lesson.audio_url || lesson.audio_local) && (
                    <button 
                      className="btn btn-outline"
                      onClick={() => audioManager.playAudioUrl(lesson.audio_local || lesson.audio_url, `Radio NHK · Lección ${lesson.lesson}: ${lesson.title_jp}`)}
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 8, 
                        borderColor: '#ec4899', 
                        color: '#ec4899',
                        fontWeight: 600
                      }}
                      title="Escuchar la transmisión de radio original completa emitida por NHK World (Audio humano oficial)"
                    >
                      <Radio size={16} /> Radio NHK Oficial (MP3 Humano)
                    </button>
                  )}
                </div>
              </div>

              {/* Dialogue Lines */}
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={18} color="var(--primary)" /> Diálogo de la Lección:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {lesson.dialogue.map((d, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      display: 'flex', 
                      gap: 14, 
                      alignItems: 'flex-start', 
                      padding: '14px 16px', 
                      background: 'var(--bg-main)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background 0.2s, border-color 0.2s'
                    }}
                    onClick={() => audioManager.speak(d.jp)}
                    title="Toca para escuchar esta línea"
                  >
                    <div style={{ minWidth: 80, fontWeight: 700, color: 'var(--accent)', paddingTop: 2 }}>
                      {d.speaker}:
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                        {d.jp}
                      </div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                        {d.es}
                      </div>
                    </div>
                    <button 
                      className="audio-btn" 
                      style={{ width: 34, height: 34 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        audioManager.speak(d.jp);
                      }}
                      title="Escuchar"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Grammar Notes in Spanish */}
              <div style={{ background: 'var(--primary-bg)', borderLeft: '4px solid var(--primary)', padding: '18px 20px', borderRadius: '0 var(--radius-md) var(--radius-md) 0', marginBottom: 20 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={18} /> Puntos Clave de Gramática y Uso Cotidiano:
                </h4>
                <ul style={{ listStyleType: 'disc', paddingLeft: 22, fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-main)' }}>
                  {lesson.grammar_notes.map((note, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>{note}</li>
                  ))}
                </ul>
              </div>

              {/* Bottom Study Status & Next Lesson Callout */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '16px 20px', 
                  borderRadius: 'var(--radius-md)',
                  background: isCurrentLessonCompleted ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-main)',
                  border: `1px solid ${isCurrentLessonCompleted ? 'rgba(34, 197, 94, 0.25)' : 'var(--border)'}`,
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: isCurrentLessonCompleted ? '#15803d' : 'var(--text-main)', fontSize: '0.95rem' }}>
                    {isCurrentLessonCompleted 
                      ? '🎉 ¡Has estudiado esta conversación!' 
                      : '¿Ya escuchaste y comprendiste este diálogo?'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {isCurrentLessonCompleted
                      ? 'El estado está registrado en tus estadísticas de progreso.'
                      : 'Márcala como estudiada para sumar +30 XP y avanzar en tu racha.'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => toggleLessonCompletion(lesson.lesson)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: isCurrentLessonCompleted ? 'rgba(34, 197, 94, 0.2)' : 'var(--primary)',
                      color: isCurrentLessonCompleted ? '#15803d' : '#fff',
                      fontWeight: 700
                    }}
                  >
                    {isCurrentLessonCompleted ? (
                      <>
                        <CheckCircle2 size={16} /> Estudiada ✓
                      </>
                    ) : (
                      <>
                        <Check size={16} /> Marcar como Estudiada (+30 XP)
                      </>
                    )}
                  </button>

                  {lesson.lesson < lessons.length && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setCurrentLessonNum(lesson.lesson + 1)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      Lección {lesson.lesson + 1} <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* SUBTAB 2: INTERACTIVE EXERCISES */}
      {activeSubTab === 'practice' && currentExercise && (
        <div className="card" style={{ maxWidth: 820, margin: '0 auto', padding: '24px 28px' }}>
          {/* Practice Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { 
                  setFilterType('all'); 
                  setCurrentExIndex(0); 
                  setSelectedAnswer(null); 
                  updateParams(currentLessonNum, activeSubTab, statusFilter, 'all');
                }}
              >
                Todos ({allExercises.length})
              </button>
              <button
                className={`btn btn-sm ${filterType === 'reply' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { 
                  setFilterType('reply'); 
                  setCurrentExIndex(0); 
                  setSelectedAnswer(null); 
                  updateParams(currentLessonNum, activeSubTab, statusFilter, 'reply');
                }}
              >
                💬 ¿Qué responder?
              </button>
              <button
                className={`btn btn-sm ${filterType === 'missing_word' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { 
                  setFilterType('missing_word'); 
                  setCurrentExIndex(0); 
                  setSelectedAnswer(null); 
                  updateParams(currentLessonNum, activeSubTab, statusFilter, 'missing_word');
                }}
              >
                🧩 ¿Qué palabra falta?
              </button>
              <button
                className={`btn btn-sm ${filterType === 'missing_kanji' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { 
                  setFilterType('missing_kanji'); 
                  setCurrentExIndex(0); 
                  setSelectedAnswer(null); 
                  updateParams(currentLessonNum, activeSubTab, statusFilter, 'missing_kanji');
                }}
              >
                ㊗️ ¿Qué kanji corresponde?
              </button>
            </div>

            {/* Score pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, background: 'var(--bg-main)', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}>
              <Award size={16} color="var(--primary)" /> Aciertos: {score.correct} / {score.total}
            </div>
          </div>

          {/* Exercise Card Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="vocab-tag" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                {currentExercise.type_label}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Basado en la Lección {currentExercise.lesson}
              </span>
              {completedConversations[currentExercise.lesson] && (
                <span style={{ fontSize: '0.75rem', color: '#15803d', background: 'rgba(34, 197, 94, 0.12)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                  ✓ Lección estudiada
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {currentExIndex + 1} de {filteredExercises.length}
            </span>
          </div>

          {/* Question Box */}
          <div style={{ background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', border: '1px solid var(--border)', marginBottom: 22 }}>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: 16, lineHeight: 1.6, fontWeight: 500 }}>
              {currentExercise.prompt_es}
            </p>

            {/* Dialogue context / Masked text */}
            <div 
              className="jp-text" 
              style={{ 
                fontSize: '1.4rem', 
                background: 'var(--bg-card)', 
                padding: '16px 20px', 
                borderRadius: 'var(--radius-md)', 
                borderLeft: '4px solid var(--primary)',
                lineHeight: 1.9,
                whiteSpace: 'pre-line',
                color: 'var(--text-main)'
              }}
            >
              {currentExercise.context}
            </div>
          </div>

          {/* Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 22 }}>
            {currentExercise.options.map((option, idx) => {
              const isSelected = selectedAnswer?.chosen === option;
              const isCorrectTarget = option === currentExercise.correct;
              
              let bg = 'var(--bg-card)';
              let border = 'var(--border)';
              let color = 'var(--text-main)';

              if (selectedAnswer) {
                if (isCorrectTarget) {
                  bg = 'rgba(34, 197, 94, 0.12)';
                  border = '#22c55e';
                  color = '#15803d';
                } else if (isSelected && !selectedAnswer.isCorrect) {
                  bg = 'rgba(239, 68, 68, 0.12)';
                  border = '#ef4444';
                  color = '#b91c1c';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={selectedAnswer !== null}
                  className="jp-text"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${border}`,
                    background: bg,
                    color: color,
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    cursor: selectedAnswer === null ? 'pointer' : 'default',
                    textAlign: 'left',
                    transition: 'transform 0.15s, border-color 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedAnswer) e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedAnswer) e.currentTarget.style.borderColor = border;
                  }}
                >
                  <span>{option}</span>
                  {selectedAnswer && isCorrectTarget && <CheckCircle2 size={20} color="#22c55e" />}
                  {selectedAnswer && isSelected && !selectedAnswer.isCorrect && <XCircle size={20} color="#ef4444" />}
                </button>
              );
            })}
          </div>

          {/* Answer Feedback & Explanation */}
          {selectedAnswer && (
            <div 
              style={{ 
                padding: '18px 20px', 
                borderRadius: 'var(--radius-md)', 
                background: selectedAnswer.isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${selectedAnswer.isCorrect ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1.05rem', color: selectedAnswer.isCorrect ? '#15803d' : '#b91c1c', marginBottom: 6 }}>
                {selectedAnswer.isCorrect ? (
                  <>
                    <CheckCircle2 size={20} /> ¡Correcto! (+10 XP)
                  </>
                ) : (
                  <>
                    <XCircle size={20} /> Incorrecto. La respuesta adecuada es: <span className="jp-text">{currentExercise.correct}</span>
                  </>
                )}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
                💡 <strong>Explicación:</strong> {currentExercise.explanation}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleResetExercises}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={15} /> Reiniciar práctica
            </button>

            {selectedAnswer && (
              <button
                className="btn btn-primary"
                onClick={handleNextExercise}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px' }}
              >
                {currentExIndex < filteredExercises.length - 1 ? (
                  <>Siguiente Ejercicio <ArrowRight size={16} /></>
                ) : (
                  <>Comenzar de nuevo <RotateCcw size={16} /></>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
