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
  Radio,
  Eye,
  EyeOff,
  UserX,
  BookmarkCheck,
  Trash2,
  Mic,
  Plus,
  Bookmark,
  Users,
  User,
  Bot,
  Calendar,
  Tag,
  PenTool,
  Info
} from 'lucide-react';
import audioManager from '../lib/audioManager';
import { dataStore } from '../lib/data';
import RoleplayChat from './RoleplayChat';
import ConversationGeneratorModal from './ConversationGeneratorModal';
import SpeechPractice from './SpeechPractice';
import ComprehensionQuiz from './ComprehensionQuiz';
import { useApp } from '../lib/AppContext';

export function getSpeakerVoice(speakerName, speakerIndex = 0) {
  if (!speakerName) {
    return (speakerIndex % 2 === 0) ? 'ja-JP-NanamiNeural' : 'ja-JP-KeitaNeural';
  }
  const s = String(speakerName).toLowerCase().trim();
  // Personajes femeninos
  if (/(anna|sakura|yuka|elena|maria|hanako|abuela|encargada|vendedora|camarera|mujer|madre|chica|chicas|hermana|señora|senora|\ba\b)/i.test(s)) {
    return 'ja-JP-NanamiNeural';
  }
  // Personajes masculinos
  if (/(profesor|rodrigo|kenta|ken|takeshi|tarou|yamada|vendedor|cajero|taxista|médico|medico|hombre|padre|chico|chicos|hermano|señor|senor|\bb\b)/i.test(s)) {
    return 'ja-JP-KeitaNeural';
  }
  // Alternar por índice de hablante
  return (speakerIndex % 2 === 0) ? 'ja-JP-NanamiNeural' : 'ja-JP-KeitaNeural';
}

export default function ConversationTab({ 
  appState, 
  onUpdateState,
  initialLesson = null,
  initialTab = 'dialogue',
  initialStatus = 'all',
  initialType = 'all',
  onParamsChange,
  authUser: propAuthUser = null
}) {
  let contextApp = null;
  try {
    contextApp = useApp();
  } catch (e) {}

  const authUser = propAuthUser || contextApp?.authUser;
  const showAlert = contextApp?.showAlert || ((opts) => alert(opts.message || opts.title));
  const showConfirm = contextApp?.showConfirm || ((opts) => Promise.resolve(window.confirm(opts.message || opts.title)));

  const [currentLessonNum, setCurrentLessonNum] = useState(initialLesson ? parseInt(initialLesson, 10) : 1);
  const [activeSubTab, setActiveSubTab] = useState(initialTab || 'dialogue'); // 'dialogue' | 'roleplay' | 'saved' | 'practice'
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all'); // 'all' | 'completed' | 'pending'
  
  // Exercise practice state
  const [filterType, setFilterType] = useState(initialType || 'all'); // 'all' | 'reply' | 'missing_word' | 'missing_kanji'
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [exerciseStatusFilter, setExerciseStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  // Shadowing / Ocultar Personaje state for NHK Lessons
  const [mutedSpeaker, setMutedSpeaker] = useState('');
  const [revealedLineIndices, setRevealedLineIndices] = useState({});

  // Shadowing / Ocultar Personaje state for Saved Conversations
  const [savedMutedSpeaker, setSavedMutedSpeaker] = useState('');
  const [savedRevealedLineIndices, setSavedRevealedLineIndices] = useState({});
  const [selectedSavedConvId, setSelectedSavedConvId] = useState(null);

  // Modal for AI Conversation Generation
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);

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
    if (initialTab && ['dialogue', 'roleplay', 'saved', 'practice'].includes(initialTab)) {
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
  const savedConversations = appState?.savedConversations || [];

  const completedConversations = appState?.completedConversations || {};
  const completedCount = Object.values(completedConversations).filter(Boolean).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const lesson = lessons.find(l => l.lesson === currentLessonNum) || lessons[0];
  const isCurrentLessonCompleted = !!completedConversations[lesson?.lesson];

  // Distinct speakers in the current NHK lesson
  const currentSpeakers = lesson?.dialogue 
    ? Array.from(new Set(lesson.dialogue.map(d => d.speaker))).filter(Boolean)
    : [];

  // Currently selected saved conversation
  const selectedSavedConv = savedConversations.find(c => c.id === selectedSavedConvId) || savedConversations[0] || null;
  const savedSpeakers = selectedSavedConv?.dialogue 
    ? Array.from(new Set(selectedSavedConv.dialogue.map(d => d.speaker))).filter(Boolean)
    : [];

  // Filter lessons by completion status if requested
  const visibleLessons = lessons.filter(l => {
    const isCompleted = !!completedConversations[l.lesson];
    if (statusFilter === 'completed') return isCompleted;
    if (statusFilter === 'pending') return !isCompleted;
    return true;
  });

  const convCompletedCount = allExercises.filter(ex => !!appState?.completedExercises?.[ex.id]).length;
  const convPendingCount = allExercises.length - convCompletedCount;

  // Exercises filtered by current active category and status
  const filteredExercises = allExercises.filter(ex => {
    const matchType = filterType === 'all' || ex.type === filterType;
    const isCompleted = !!appState?.completedExercises?.[ex.id];
    if (exerciseStatusFilter === 'completed' && !isCompleted) return false;
    if (exerciseStatusFilter === 'pending' && isCompleted) return false;
    return matchType;
  });

  const currentExercise = filteredExercises[currentExIndex] || filteredExercises[0] || null;

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

  /**
   * Reproduce el diálogo completo línea a línea.
   * Si un personaje está silenciado (Ocultar Personaje), se omiten sus líneas
   * para que el estudiante las diga en voz alta durante el intercambio.
   */
  const handlePlayFullDialogue = (targetDialogueList, currentMuted = '') => {
    if (!targetDialogueList || targetDialogueList.length === 0) return;
    
    // Si hay un personaje silenciado, solo reproducir las líneas de su contraparte
    const playlist = targetDialogueList
      .filter(d => !currentMuted || d.speaker !== currentMuted)
      .map((d, idx) => ({
        text: d.jp || d.japanese,
        desc: `${d.speaker}: ${d.es || d.spanish || ''}`,
        voice: getSpeakerVoice(d.speaker, idx)
      }));

    if (playlist.length === 0) {
      showAlert({
        title: 'Modo Práctica Oral',
        message: `Has silenciado todas las líneas correspondientes a "${currentMuted}". ¡Es tu turno de decirlas en voz alta!`
      });
      return;
    }

    audioManager.setPlaylist(playlist, 0);
    audioManager.speak(playlist[0].text, { voice: playlist[0].voice, autoAdvance: true });
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
        const alreadyDone = !!appState.completedExercises?.[currentExercise.id];
        onUpdateState({
          ...appState,
          xp: (appState.xp || 0) + (!alreadyDone ? 10 : 0),
          completedExercises: {
            ...(appState.completedExercises || {}),
            [currentExercise.id]: true
          }
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

  const handleDeleteSavedConversation = async (convId) => {
    const confirmDelete = await showConfirm({
      title: '¿Eliminar conversación?',
      message: 'Esta conversación se eliminará de tu almacenamiento local y de Supabase.'
    });
    if (!confirmDelete) return;

    const currentSaved = appState?.savedConversations || [];
    const updatedSaved = currentSaved.filter(c => c.id !== convId);
    
    if (onUpdateState && appState) {
      onUpdateState({
        ...appState,
        savedConversations: updatedSaved
      });
    }

    if (selectedSavedConvId === convId) {
      setSelectedSavedConvId(updatedSaved[0]?.id || null);
    }
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📻</span>
            <span>Conversación NHK & Diálogos</span>
          </h2>
          <button
            type="button"
            className="tour-info-shortcut-btn"
            onClick={() => {
              if (contextApp?.openTour) {
                contextApp.openTour('nhk');
              } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
                window.__nihongoOpenTour('nhk');
              }
            }}
            title="Ver guía y explicación de Conversaciones y Roleplay de Voz"
            aria-label="Información de Conversaciones"
          >
            <Info size={14} />
            <span>Guía</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Subtabs + AI Generator Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 14, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Subtab 1: NHK Lessons */}
          <button
            className={`btn ${activeSubTab === 'dialogue' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setActiveSubTab('dialogue');
              updateParams(currentLessonNum, 'dialogue', statusFilter, filterType);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 700 }}
          >
            <Radio size={18} /> Diálogos NHK ({lessons.length})
          </button>

          {/* Subtab 2: AI Roleplay Mode */}
          <button
            className={`btn ${activeSubTab === 'roleplay' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setActiveSubTab('roleplay');
              updateParams(currentLessonNum, 'roleplay', statusFilter, filterType);
            }}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              padding: '10px 18px', 
              fontWeight: 700,
              borderColor: activeSubTab === 'roleplay' ? 'var(--accent)' : 'var(--border)',
              background: activeSubTab === 'roleplay' ? 'var(--accent)' : 'transparent',
              color: activeSubTab === 'roleplay' ? '#fff' : 'var(--text-main)'
            }}
          >
            <Bot size={18} /> Modo Roleplay con IA
            <span style={{ fontSize: '0.7rem', background: '#ec4899', color: '#fff', padding: '1px 6px', borderRadius: 999, fontWeight: 800 }}>
              VOZ / TEXTO
            </span>
          </button>

          {/* Subtab 3: Saved Conversations */}
          <button
            className={`btn ${activeSubTab === 'saved' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setActiveSubTab('saved');
              updateParams(currentLessonNum, 'saved', statusFilter, filterType);
            }}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              padding: '10px 18px', 
              fontWeight: 700,
              borderColor: activeSubTab === 'saved' ? '#10b981' : 'var(--border)',
              background: activeSubTab === 'saved' ? '#10b981' : 'transparent',
              color: activeSubTab === 'saved' ? '#fff' : 'var(--text-main)'
            }}
          >
            <BookmarkCheck size={18} /> Mis Conversaciones ({savedConversations.length})
          </button>

          {/* Subtab 4: Exercises */}
          <button
            className={`btn ${activeSubTab === 'practice' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setActiveSubTab('practice');
              updateParams(currentLessonNum, 'practice', statusFilter, filterType);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 700 }}
          >
            <HelpCircle size={18} /> Ejercicios Didácticos ({allExercises.length})
          </button>
        </div>

        {/* Generate AI Conversation Action Button */}
        <button
          className="btn btn-primary"
          onClick={() => setIsGenModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            borderColor: 'transparent',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
          }}
          title="Generar un diálogo personalizado por tema, palabras clave y nivel JLPT con guardado en Supabase"
        >
          <Sparkles size={18} /> Generar Diálogo IA
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: NHK LESSONS & DIALOGUES                                         */}
      {/* ========================================================================= */}
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
                    setMutedSpeaker('');
                    setRevealedLineIndices({});
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
                    onClick={() => handlePlayFullDialogue(lesson.dialogue, mutedSpeaker)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    title={mutedSpeaker ? `Reproducir solo la voz de tu contraparte (silenciando a ${mutedSpeaker})` : "Reproducir el diálogo línea a línea con voz neuronal"}
                  >
                    <Play size={16} /> {mutedSpeaker ? `Reproducir sin ${mutedSpeaker}` : 'Diálogo Línea a Línea'}
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
                      <Radio size={16} /> Radio NHK Oficial (MP3)
                    </button>
                  )}
                </div>
              </div>

              {/* Modo Shadowing / Ocultar Personaje Control Bar */}
              <div style={{
                background: mutedSpeaker ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-main)',
                border: `1.5px solid ${mutedSpeaker ? '#8b5cf6' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                marginBottom: 22,
                transition: 'all 0.25s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 'var(--radius-full)', 
                      background: mutedSpeaker ? '#8b5cf6' : 'var(--bg-card)', 
                      color: mutedSpeaker ? '#fff' : 'var(--text-muted)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid var(--border)'
                    }}>
                      {mutedSpeaker ? <UserX size={18} /> : <Users size={18} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Modo Oral: Ocultar y Silenciar Personaje</span>
                        {mutedSpeaker && (
                          <span style={{ fontSize: '0.75rem', background: '#8b5cf6', color: '#fff', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                            Tu Papel: {mutedSpeaker}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Silencia las líneas de un personaje para decirlas tú en voz alta. El texto se oculta para retarte y puedes evaluarlo con el micrófono.
                      </div>
                    </div>
                  </div>

                  {mutedSpeaker && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        const anyRevealed = Object.values(revealedLineIndices).some(Boolean);
                        if (anyRevealed) {
                          setRevealedLineIndices({});
                        } else {
                          const allRev = {};
                          (lesson.dialogue || []).forEach((_, i) => { allRev[i] = true; });
                          setRevealedLineIndices(allRev);
                        }
                      }}
                      style={{ fontSize: '0.8rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      {Object.values(revealedLineIndices).some(Boolean) ? (
                        <><EyeOff size={14} /> Ocultar pistas de {mutedSpeaker}</>
                      ) : (
                        <><Eye size={14} /> Revelar pistas de {mutedSpeaker}</>
                      )}
                    </button>
                  )}
                </div>

                {/* Speaker Selector Buttons */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Selecciona tu papel:</span>
                  <button
                    className={`btn btn-sm ${!mutedSpeaker ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => {
                      setMutedSpeaker('');
                      setRevealedLineIndices({});
                    }}
                    style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                  >
                    Escuchar a todos (Normal)
                  </button>
                  {currentSpeakers.map(spk => {
                    const isSelected = mutedSpeaker === spk;
                    return (
                      <button
                        key={spk}
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => {
                          setMutedSpeaker(isSelected ? '' : spk);
                          setRevealedLineIndices({});
                        }}
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '4px 14px',
                          borderColor: isSelected ? '#8b5cf6' : undefined,
                          background: isSelected ? '#8b5cf6' : undefined,
                          color: isSelected ? '#fff' : undefined,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <User size={13} /> Interpretar a <strong>{spk}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dialogue Lines */}
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={18} color="var(--primary)" /> Diálogo de la Lección:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {lesson.dialogue.map((d, idx) => {
                  const lineJp = d.jp || d.japanese || '';
                  const lineEs = d.es || d.spanish || '';
                  const lineKana = d.furigana || d.kana || '';
                  const isMuted = mutedSpeaker && d.speaker === mutedSpeaker;
                  const isRevealed = !!revealedLineIndices[idx];

                  return (
                    <div 
                      key={idx}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 8, 
                        padding: '16px 18px', 
                        background: isMuted ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-main)', 
                        borderRadius: 'var(--radius-md)', 
                        border: `1.5px solid ${isMuted ? '#8b5cf6' : 'var(--border)'}`,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        {/* Speaker column */}
                        <div style={{ minWidth: 80, fontWeight: 700, color: isMuted ? '#8b5cf6' : 'var(--accent)', paddingTop: 2 }}>
                          {d.speaker}:
                          {isMuted && (
                            <div style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 700, marginTop: 2 }}>
                              🎙️ Tu papel
                            </div>
                          )}
                        </div>

                        {/* Dialogue content */}
                        <div style={{ flex: 1 }}>
                          {/* Masked vs visible Japanese text */}
                          {isMuted && !isRevealed ? (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{
                                background: 'rgba(139, 92, 246, 0.12)',
                                border: '1px dashed #8b5cf6',
                                borderRadius: 'var(--radius-sm)',
                                padding: '10px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 8
                              }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#8b5cf6' }}>
                                  🎙️ ¡Tu turno! Di esta frase en japonés en voz alta...
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline"
                                  onClick={() => setRevealedLineIndices(prev => ({ ...prev, [idx]: true }))}
                                  style={{ fontSize: '0.75rem', padding: '3px 8px', borderColor: '#8b5cf6', color: '#8b5cf6', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                >
                                  <Eye size={13} /> Ver pista japonesa
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ marginBottom: 4 }}>
                              <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                                {lineJp}
                              </div>
                              {lineKana && lineKana !== lineJp && (
                                <div className="jp-text" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                                  {lineKana}
                                </div>
                              )}
                              {isMuted && isRevealed && (
                                <button
                                  type="button"
                                  onClick={() => setRevealedLineIndices(prev => ({ ...prev, [idx]: false }))}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                                >
                                  <EyeOff size={12} /> Ocultar pista
                                </button>
                              )}
                            </div>
                          )}

                          {/* Spanish Translation Prompt */}
                          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                            🇪🇸 {lineEs}
                          </div>
                        </div>

                        {/* Line Audio Playback & Speech Practice */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="audio-btn" 
                            style={{ width: 34, height: 34, flexShrink: 0 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              audioManager.speak(lineJp, { voice: getSpeakerVoice(d.speaker, idx) });
                            }}
                            title={isMuted ? "Escuchar modelo de pronunciación (Tokio)" : "Escuchar audio"}
                          >
                            <Volume2 size={16} />
                          </button>
                          <SpeechPractice 
                            targetText={lineJp} 
                            targetKana={lineKana} 
                            compact={true} 
                            onMatch={() => {
                              if (onUpdateState && appState) {
                                onUpdateState({
                                  ...appState,
                                  xp: (appState.xp || 0) + 5
                                });
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="audio-btn"
                            style={{ width: 34, height: 34, flexShrink: 0 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (contextApp?.openPracticePad) {
                                contextApp.openPracticePad({
                                  text: lineJp,
                                  kana: lineKana,
                                  title: `Diálogo: ${d.speaker || 'Personaje'}`,
                                  source: 'conversation'
                                });
                              } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                                window.__nihongoOpenPracticePad({
                                  text: lineJp,
                                  kana: lineKana,
                                  title: `Diálogo: ${d.speaker || 'Personaje'}`,
                                  source: 'conversation'
                                });
                              }
                            }}
                            title="Practicar trazos y caligrafía de este diálogo en Cuaderno"
                          >
                            <PenTool size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Interactive Pronunciation Evaluation for the Muted Character */}
                      {isMuted && (
                        <div style={{ borderTop: '1px solid rgba(139, 92, 246, 0.25)', paddingTop: 8, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b5cf6', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <Mic size={14} /> ¡Tu turno de hablar! Presiona el micrófono arriba para evaluar tu dicción en japonés.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
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

      {/* ========================================================================= */}
      {/* SUBTAB 2: AI ROLEPLAY INTERACTIVE MODE                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'roleplay' && (
        <RoleplayChat appState={appState} onUpdateState={onUpdateState} authUser={authUser} />
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: SAVED CONVERSATIONS IN SUPABASE & LOCAL                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'saved' && (
        <div>
          {savedConversations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '50px 24px', maxWidth: 640, margin: '0 auto' }}>
              <div style={{ fontSize: '3rem', marginBottom: 14 }}>📚</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
                Aún no tienes conversaciones guardadas
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                Genera conversaciones personalizadas con IA seleccionando palabras de tu vocabulario, nivel JLPT y tema, o guarda tus sesiones de Roleplay interactivo. Se sincronizan en la nube con Supabase para practicar cuando quieras.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsGenModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontWeight: 700 }}
                >
                  <Sparkles size={16} /> Generar Diálogo con IA
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveSubTab('roleplay')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontWeight: 700 }}
                >
                  <Bot size={16} /> Ir a Modo Roleplay
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: 20, alignItems: 'flex-start' }}>
              {/* Left Column: Saved Conversations List */}
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookmarkCheck size={16} color="#10b981" /> Guardadas ({savedConversations.length})
                  </h4>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setIsGenModalOpen(true)}
                    style={{ fontSize: '0.75rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={12} /> Nueva
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 600, overflowY: 'auto' }}>
                  {savedConversations.map(conv => {
                    const isSelected = selectedSavedConv?.id === conv.id;
                    const dateFormatted = conv.date ? new Date(conv.date).toLocaleDateString() : '';

                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setSelectedSavedConvId(conv.id);
                          setSavedMutedSpeaker('');
                          setSavedRevealedLineIndices({});
                        }}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-main)',
                          border: `1.5px solid ${isSelected ? '#10b981' : 'var(--border)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? '#047857' : 'var(--text-main)', lineHeight: 1.3 }}>
                            {conv.title}
                          </span>
                          <span className="vocab-tag" style={{ fontSize: '0.7rem', padding: '1px 6px', background: isSelected ? '#10b981' : undefined, color: isSelected ? '#fff' : undefined }}>
                            {conv.level || 'N5'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span>{conv.topic || 'General'} · {conv.dialogue?.length || 0} líneas</span>
                          <span>{dateFormatted}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Saved Conversation View & Practice */}
              {selectedSavedConv && (
                <div className="card">
                  {/* Top Bar */}
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span className="vocab-tag" style={{ background: '#10b981', color: '#fff' }}>
                          {selectedSavedConv.level || 'N5'}
                        </span>
                        <span className="vocab-tag">
                          {selectedSavedConv.topic || 'General'}
                        </span>
                        {selectedSavedConv.date && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={13} /> {new Date(selectedSavedConv.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h3 className="jp-text" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                        {selectedSavedConv.title}
                      </h3>

                      {selectedSavedConv.target_words && selectedSavedConv.target_words.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Palabras clave:</span>
                          {selectedSavedConv.target_words.map((w, idx) => (
                            <span key={idx} className="vocab-tag" style={{ fontSize: '0.75rem', background: 'var(--bg-main)' }}>
                              {w}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handlePlayFullDialogue(selectedSavedConv.dialogue, savedMutedSpeaker)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                      >
                        <Play size={16} /> {savedMutedSpeaker ? `Reproducir sin ${savedMutedSpeaker}` : 'Diálogo Línea a Línea'}
                      </button>

                      <button
                        className="btn btn-outline"
                        onClick={() => handleDeleteSavedConversation(selectedSavedConv.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                        title="Eliminar de Supabase y de tu dispositivo"
                      >
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Modo Shadowing / Ocultar Personaje Control Bar for Saved Conv */}
                  <div style={{
                    background: savedMutedSpeaker ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-main)',
                    border: `1.5px solid ${savedMutedSpeaker ? '#8b5cf6' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 20px',
                    marginBottom: 22,
                    transition: 'all 0.25s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: 'var(--radius-full)', 
                          background: savedMutedSpeaker ? '#8b5cf6' : 'var(--bg-card)', 
                          color: savedMutedSpeaker ? '#fff' : 'var(--text-muted)',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: '1px solid var(--border)'
                        }}>
                          {savedMutedSpeaker ? <UserX size={18} /> : <Users size={18} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>Modo Oral: Ocultar y Silenciar Personaje</span>
                            {savedMutedSpeaker && (
                              <span style={{ fontSize: '0.75rem', background: '#8b5cf6', color: '#fff', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                                Tu Papel: {savedMutedSpeaker}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Silencia las líneas de un interlocutor para decirlas tú en voz alta y evaluar tu pronunciación.
                          </div>
                        </div>
                      </div>

                      {savedMutedSpeaker && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            const anyRevealed = Object.values(savedRevealedLineIndices).some(Boolean);
                            if (anyRevealed) {
                              setSavedRevealedLineIndices({});
                            } else {
                              const allRev = {};
                              (selectedSavedConv.dialogue || []).forEach((_, i) => { allRev[i] = true; });
                              setSavedRevealedLineIndices(allRev);
                            }
                          }}
                          style={{ fontSize: '0.8rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          {Object.values(savedRevealedLineIndices).some(Boolean) ? (
                            <><EyeOff size={14} /> Ocultar pistas de {savedMutedSpeaker}</>
                          ) : (
                            <><Eye size={14} /> Revelar pistas de {savedMutedSpeaker}</>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Speaker Selector Buttons */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Selecciona tu papel:</span>
                      <button
                        className={`btn btn-sm ${!savedMutedSpeaker ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => {
                          setSavedMutedSpeaker('');
                          setSavedRevealedLineIndices({});
                        }}
                        style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                      >
                        Escuchar a todos (Normal)
                      </button>
                      {savedSpeakers.map(spk => {
                        const isSelected = savedMutedSpeaker === spk;
                        return (
                          <button
                            key={spk}
                            className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => {
                              setSavedMutedSpeaker(isSelected ? '' : spk);
                              setSavedRevealedLineIndices({});
                            }}
                            style={{ 
                              fontSize: '0.8rem', 
                              padding: '4px 14px',
                              borderColor: isSelected ? '#8b5cf6' : undefined,
                              background: isSelected ? '#8b5cf6' : undefined,
                              color: isSelected ? '#fff' : undefined,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <User size={13} /> Interpretar a <strong>{spk}</strong>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dialogue Lines */}
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageSquare size={18} color="var(--primary)" /> Diálogo:
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                    {(selectedSavedConv.dialogue || []).map((d, idx) => {
                      const lineJp = d.japanese || d.jp || '';
                      const lineEs = d.spanish || d.es || '';
                      const lineKana = d.furigana || d.kana || '';
                      const isMuted = savedMutedSpeaker && d.speaker === savedMutedSpeaker;
                      const isRevealed = !!savedRevealedLineIndices[idx];

                      return (
                        <div 
                          key={idx}
                          style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: 8, 
                            padding: '16px 18px', 
                            background: isMuted ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-main)', 
                            borderRadius: 'var(--radius-md)', 
                            border: `1.5px solid ${isMuted ? '#8b5cf6' : 'var(--border)'}`,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ minWidth: 80, fontWeight: 700, color: isMuted ? '#8b5cf6' : 'var(--accent)', paddingTop: 2 }}>
                              {d.speaker}:
                              {isMuted && (
                                <div style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 700, marginTop: 2 }}>
                                  🎙️ Tu papel
                                </div>
                              )}
                            </div>

                            <div style={{ flex: 1 }}>
                              {isMuted && !isRevealed ? (
                                <div style={{ marginBottom: 8 }}>
                                  <div style={{
                                    background: 'rgba(139, 92, 246, 0.12)',
                                    border: '1px dashed #8b5cf6',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '10px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: 8
                                  }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#8b5cf6' }}>
                                      🎙️ ¡Tu turno! Di esta frase en japonés en voz alta...
                                    </span>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline"
                                      onClick={() => setSavedRevealedLineIndices(prev => ({ ...prev, [idx]: true }))}
                                      style={{ fontSize: '0.75rem', padding: '3px 8px', borderColor: '#8b5cf6', color: '#8b5cf6', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                    >
                                      <Eye size={13} /> Ver pista japonesa
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ marginBottom: 4 }}>
                                  <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                                    {lineJp}
                                  </div>
                                  {lineKana && lineKana !== lineJp && (
                                    <div className="jp-text" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                                      {lineKana}
                                    </div>
                                  )}
                                  {isMuted && isRevealed && (
                                    <button
                                      type="button"
                                      onClick={() => setSavedRevealedLineIndices(prev => ({ ...prev, [idx]: false }))}
                                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                                    >
                                      <EyeOff size={12} /> Ocultar pista
                                    </button>
                                  )}
                                </div>
                              )}

                              <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                🇪🇸 {lineEs}
                              </div>
                            </div>

                            {/* Line Audio Playback & Speech Practice */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="audio-btn" 
                                style={{ width: 34, height: 34, flexShrink: 0 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  audioManager.speak(lineJp, { voice: getSpeakerVoice(d.speaker, idx) });
                                }}
                                title={isMuted ? "Escuchar modelo" : "Escuchar audio"}
                              >
                                <Volume2 size={16} />
                              </button>
                              <SpeechPractice 
                                targetText={lineJp} 
                                targetKana={lineKana} 
                                compact={true} 
                                onMatch={() => {
                                  if (onUpdateState && appState) {
                                    onUpdateState({
                                      ...appState,
                                      xp: (appState.xp || 0) + 5
                                    });
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="audio-btn"
                                style={{ width: 34, height: 34, flexShrink: 0 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (contextApp?.openPracticePad) {
                                    contextApp.openPracticePad({
                                      text: lineJp,
                                      kana: lineKana,
                                      title: `Diálogo: ${d.speaker || 'Personaje'}`,
                                      source: 'conversation'
                                    });
                                  } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                                    window.__nihongoOpenPracticePad({
                                      text: lineJp,
                                      kana: lineKana,
                                      title: `Diálogo: ${d.speaker || 'Personaje'}`,
                                      source: 'conversation'
                                    });
                                  }
                                }}
                                title="Practicar trazos y caligrafía de este diálogo en Cuaderno"
                              >
                                <PenTool size={15} />
                              </button>
                            </div>
                          </div>

                          {isMuted && (
                            <div style={{ borderTop: '1px solid rgba(139, 92, 246, 0.25)', paddingTop: 8, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b5cf6', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                <Mic size={14} /> ¡Tu turno de hablar! Presiona el micrófono arriba para evaluar tu pronunciación.
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Grammar Notes if available */}
                  {selectedSavedConv.grammar_notes && selectedSavedConv.grammar_notes.length > 0 && (
                    <div style={{ background: 'var(--primary-bg)', borderLeft: '4px solid var(--primary)', padding: '18px 20px', borderRadius: '0 var(--radius-md) var(--radius-md) 0', marginBottom: 20 }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOpen size={18} /> Puntos Clave de Gramática y Uso Cotidiano:
                      </h4>
                      <ul style={{ listStyleType: 'disc', paddingLeft: 22, fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-main)' }}>
                        {selectedSavedConv.grammar_notes.map((note, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Reading Comprehension Quiz for saved conversation */}
                  {selectedSavedConv.comprehension_questions && selectedSavedConv.comprehension_questions.length > 0 && (
                    <ComprehensionQuiz
                      questions={selectedSavedConv.comprehension_questions}
                      appState={appState}
                      onUpdateState={onUpdateState}
                      title="Preguntas de Comprensión del Diálogo"
                      subtitle="Demuestra tu comprensión respondiendo estas 3 preguntas generadas por IA sobre la conversación:"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: INTERACTIVE EXERCISES                                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'practice' && (
        <div className="card" style={{ maxWidth: 820, margin: '0 auto', padding: '24px 28px' }}>
          {/* Practice Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
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

          {/* Status filter row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 18, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado:</span>
            {[
              { id: 'all', label: `Todos (${allExercises.length})` },
              { id: 'pending', label: `Pendientes (${convPendingCount})` },
              { id: 'completed', label: `Superados (${convCompletedCount})` }
            ].map(st => (
              <button
                key={st.id}
                className={`btn btn-sm ${exerciseStatusFilter === st.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setExerciseStatusFilter(st.id);
                  setCurrentExIndex(0);
                  setSelectedAnswer(null);
                }}
                style={{ fontSize: '0.8rem', padding: '4px 10px', height: 'auto' }}
              >
                {st.label}
              </button>
            ))}
          </div>

          {!currentExercise ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🎉</div>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                {exerciseStatusFilter === 'pending'
                  ? '¡Excelente trabajo! Has completado todos los ejercicios de conversación en esta categoría.'
                  : 'No hay ejercicios disponibles con este filtro.'}
              </p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setExerciseStatusFilter('all');
                  setFilterType('all');
                  setCurrentExIndex(0);
                  setSelectedAnswer(null);
                }}
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div>
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
                  {appState?.completedExercises?.[currentExercise.id] && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--success, #10b981)',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Check size={12} /> Superado (+10 XP)
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

                {/* Dialogue context */}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1.05rem', color: selectedAnswer.isCorrect ? '#15803d' : '#b91c1c' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        className="audio-btn"
                        style={{ width: 28, height: 28 }}
                        onClick={() => audioManager.speak(currentExercise.correct)}
                        title="Escuchar respuesta"
                      >
                        <Volume2 size={14} />
                      </button>
                      <SpeechPractice targetText={currentExercise.correct} compact={true} />
                    </div>
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
      )}

      {/* ========================================================================= */}
      {/* MODAL: AI CONVERSATION GENERATOR                                          */}
      {/* ========================================================================= */}
      <ConversationGeneratorModal
        isOpen={isGenModalOpen}
        onClose={() => setIsGenModalOpen(false)}
        defaultLevel="N5"
        appState={appState}
        onUpdateState={onUpdateState}
        authUser={authUser}
        onSelectConversation={(newConv) => {
          setIsGenModalOpen(false);
          setActiveSubTab('saved');
          setSelectedSavedConvId(newConv.id);
        }}
      />
    </div>
  );
}
