'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  Info,
  Search,
  Filter
} from 'lucide-react';
import dynamic from 'next/dynamic';
import audioManager from '../../lib/audioManager';
import nhkLessonsData from '../../data/nhk_lessons.json';
import irodoriDialoguesData from '../../data/irodori_dialogues.json';
import conversationExercisesData from '../../data/conversation_exercises.json';
import { useApp } from '../../lib/AppContext';

// Lazy loading con code-splitting para componentes pesados
const RoleplayChat = dynamic(() => import('../features/RoleplayChat'), { ssr: false });
const ConversationGeneratorModal = dynamic(() => import('../modals/ConversationGeneratorModal'), { ssr: false });
const SpeechPractice = dynamic(() => import('../features/SpeechPractice'), { ssr: false });
const ComprehensionQuiz = dynamic(() => import('../features/ComprehensionQuiz'), { ssr: false });

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

export function getSpeakerStyle(speakerName, isMuted, speakersList = []) {
  if (isMuted) {
    return {
      pillBg: 'rgba(139, 92, 246, 0.12)',
      pillBorder: 'rgba(139, 92, 246, 0.35)',
      color: '#8b5cf6',
      iconBg: 'rgba(139, 92, 246, 0.2)'
    };
  }
  const idx = speakersList.indexOf(speakerName);
  if (idx === 1) {
    return {
      pillBg: 'rgba(59, 130, 246, 0.1)',
      pillBorder: 'rgba(59, 130, 246, 0.28)',
      color: '#2563eb',
      iconBg: 'rgba(59, 130, 246, 0.18)'
    };
  }
  if (idx === 2) {
    return {
      pillBg: 'rgba(16, 185, 129, 0.1)',
      pillBorder: 'rgba(16, 185, 129, 0.28)',
      color: '#059669',
      iconBg: 'rgba(16, 185, 129, 0.18)'
    };
  }
  if (idx >= 3) {
    return {
      pillBg: 'rgba(245, 158, 11, 0.1)',
      pillBorder: 'rgba(245, 158, 11, 0.28)',
      color: '#d97706',
      iconBg: 'rgba(245, 158, 11, 0.18)'
    };
  }
  // Default / first speaker (e.g. 店員, Anna, or main speaker)
  return {
    pillBg: 'rgba(225, 29, 72, 0.08)',
    pillBorder: 'rgba(225, 29, 72, 0.24)',
    color: 'var(--accent)',
    iconBg: 'rgba(225, 29, 72, 0.16)'
  };
}

export default function ConversationTab({ 
  appState, 
  onUpdateState,
  initialLesson = null,
  initialDialogue = null,
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

  const nhkLessons = nhkLessonsData || [];
  const irodoriDialogues = irodoriDialoguesData || [];
  const allExercises = conversationExercisesData || [];
  const savedConversations = appState?.savedConversations || [];
  const completedConversations = appState?.completedConversations || {};

  // Build unified dialogue list from Irodori and NHK World
  const allDialogues = useMemo(() => {
    const list = [];
    // Irodori Dialogues (22)
    irodoriDialogues.forEach(d => {
      list.push({
        id: d.id,
        lessonNum: null,
        dialogueNum: d.dialogue_num,
        title_jp: d.title_jp,
        title_es: d.title_es,
        level: d.level || 'N5',
        topic: d.topic || 'Vida Cotidiana',
        series: d.series || 'Irodori (Fundación Japón)',
        seriesKey: 'irodori',
        related_step: d.related_step,
        situation: d.situation,
        characters: d.characters || [],
        dialogue: d.dialogue || [],
        grammar_notes: Array.isArray(d.grammar_notes) ? d.grammar_notes : [d.grammar_notes].filter(Boolean),
        audio_url: null,
        audio_local: null
      });
    });
    // NHK Lessons (48)
    nhkLessons.forEach(l => {
      list.push({
        id: `nhk_l_${l.lesson}`,
        lessonNum: l.lesson,
        dialogueNum: l.lesson,
        title_jp: l.title_jp,
        title_es: l.title_es,
        level: l.level || 'N5',
        topic: l.topic || 'General',
        series: 'NHK World: Hablemos en Japonés',
        seriesKey: 'nhk',
        related_step: l.related_step || null,
        situation: null,
        characters: Array.from(new Set((l.dialogue || []).map(d => d.speaker))).filter(Boolean),
        dialogue: l.dialogue || [],
        grammar_notes: Array.isArray(l.grammar_notes) ? l.grammar_notes : [l.grammar_notes].filter(Boolean),
        audio_url: l.audio_url || null,
        audio_local: l.audio_local || null
      });
    });
    return list;
  }, [nhkLessons, irodoriDialogues]);

  const [selectedDialogueId, setSelectedDialogueId] = useState(() => {
    if (initialDialogue) return initialDialogue;
    if (initialLesson) return `nhk_l_${initialLesson}`;
    return 'iro_diag_1';
  });

  const [activeSubTab, setActiveSubTab] = useState(initialTab || 'dialogue'); // 'dialogue' | 'roleplay' | 'saved' | 'practice'
  const [seriesFilter, setSeriesFilter] = useState('all'); // 'all' | 'irodori' | 'nhk'
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'N5' | 'N4' | 'N3'
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all'); // 'all' | 'completed' | 'pending'
  const [searchDialogueQuery, setSearchDialogueQuery] = useState('');
  
  // Exercise practice state
  const [filterType, setFilterType] = useState(initialType || 'all'); // 'all' | 'reply' | 'missing_word' | 'missing_kanji'
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [exerciseStatusFilter, setExerciseStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  // Shadowing / Ocultar Personaje state for active Dialogue
  const [mutedSpeaker, setMutedSpeaker] = useState('');
  const [revealedLineIndices, setRevealedLineIndices] = useState({});

  // Shadowing / Ocultar Personaje state for Saved Conversations
  const [savedMutedSpeaker, setSavedMutedSpeaker] = useState('');
  const [savedRevealedLineIndices, setSavedRevealedLineIndices] = useState({});
  const [selectedSavedConvId, setSelectedSavedConvId] = useState(null);

  // Active Recall: Hide/Show Furigana (reading) & Spanish Translation
  const [showFurigana, setShowFurigana] = useState(true);
  const [showSpanish, setShowSpanish] = useState(true);
  const [revealedKanaIndices, setRevealedKanaIndices] = useState({});
  const [revealedEsIndices, setRevealedEsIndices] = useState({});

  // Modal for AI Conversation Generation
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);

  const updateParams = (newDialogueId, newTab, newStatus, newType) => {
    if (onParamsChange) {
      const targetId = newDialogueId !== undefined ? newDialogueId : selectedDialogueId;
      const targetObj = allDialogues.find(d => d.id === targetId);
      onParamsChange({
        dialogue: targetId,
        lesson: targetObj?.lessonNum || undefined,
        tab: newTab !== undefined ? newTab : activeSubTab,
        status: newStatus !== undefined ? newStatus : statusFilter,
        type: newType !== undefined ? newType : filterType
      });
    }
  };

  useEffect(() => {
    if (initialDialogue && allDialogues.some(d => d.id === initialDialogue)) {
      setSelectedDialogueId(initialDialogue);
    } else if (initialLesson) {
      const match = allDialogues.find(d => d.lessonNum === parseInt(initialLesson, 10));
      if (match) setSelectedDialogueId(match.id);
    }
  }, [initialDialogue, initialLesson, allDialogues]);

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

  useEffect(() => {
    setRevealedKanaIndices({});
    setRevealedEsIndices({});
  }, [selectedDialogueId, selectedSavedConvId]);

  const isDialogueCompleted = (d) => {
    if (!d) return false;
    return !!(completedConversations[d.id] || (d.lessonNum && completedConversations[d.lessonNum]));
  };

  const currentDialogue = useMemo(() => {
    return allDialogues.find(d => d.id === selectedDialogueId) || allDialogues[0] || null;
  }, [allDialogues, selectedDialogueId]);

  const isCurrentDialogueCompleted = isDialogueCompleted(currentDialogue);

  const completedCount = allDialogues.filter(isDialogueCompleted).length;
  const progressPercent = allDialogues.length > 0 ? Math.round((completedCount / allDialogues.length) * 100) : 0;

  // Distinct speakers in the current dialogue
  const currentSpeakers = useMemo(() => {
    if (!currentDialogue) return [];
    if (currentDialogue.characters && currentDialogue.characters.length > 0) {
      return currentDialogue.characters;
    }
    return Array.from(new Set((currentDialogue.dialogue || []).map(d => d.speaker))).filter(Boolean);
  }, [currentDialogue]);

  // Currently selected saved conversation
  const selectedSavedConv = savedConversations.find(c => c.id === selectedSavedConvId) || savedConversations[0] || null;
  const savedSpeakers = selectedSavedConv?.dialogue 
    ? Array.from(new Set(selectedSavedConv.dialogue.map(d => d.speaker))).filter(Boolean)
    : [];

  // Filter dialogues
  const visibleDialogues = useMemo(() => {
    return allDialogues.filter(d => {
      if (seriesFilter !== 'all' && d.seriesKey !== seriesFilter) return false;
      if (levelFilter !== 'all' && d.level !== levelFilter) return false;

      const isDone = isDialogueCompleted(d);
      if (statusFilter === 'completed' && !isDone) return false;
      if (statusFilter === 'pending' && isDone) return false;

      if (searchDialogueQuery.trim()) {
        const q = searchDialogueQuery.toLowerCase().trim();
        const matchTitle = (d.title_jp || '').toLowerCase().includes(q) || (d.title_es || '').toLowerCase().includes(q);
        const matchTopic = (d.topic || '').toLowerCase().includes(q);
        const matchCharacters = (d.characters || []).some(c => c.toLowerCase().includes(q));
        const matchDialogue = (d.dialogue || []).some(line => 
          (line.jp || line.japanese || '').toLowerCase().includes(q) ||
          (line.es || line.spanish || '').toLowerCase().includes(q)
        );
        if (!matchTitle && !matchTopic && !matchCharacters && !matchDialogue) return false;
      }
      return true;
    });
  }, [allDialogues, seriesFilter, levelFilter, statusFilter, searchDialogueQuery, completedConversations]);

  // Dialogue-specific exercises state & practice filter
  const [dialogueAnswers, setDialogueAnswers] = useState({}); // { [exId]: { chosen, isCorrect } }
  const [practiceDialogueFilter, setPracticeDialogueFilter] = useState('all'); // 'all' | dialogueId

  useEffect(() => {
    setDialogueAnswers({});
  }, [selectedDialogueId]);

  const currentDialogueExercises = useMemo(() => {
    if (!currentDialogue) return [];
    return allExercises.filter(ex => {
      if (ex.dialogue_id && ex.dialogue_id === currentDialogue.id) return true;
      if (currentDialogue.lessonNum && ex.lesson === currentDialogue.lessonNum) return true;
      return false;
    });
  }, [allExercises, currentDialogue]);

  const handleSelectDialogueExerciseOption = (exercise, option) => {
    if (dialogueAnswers[exercise.id]) return; // already answered in this session
    const isCorrect = option === exercise.correct;
    setDialogueAnswers(prev => ({
      ...prev,
      [exercise.id]: {
        chosen: option,
        isCorrect
      }
    }));

    if (isCorrect) {
      audioManager.speak(option);
      if (onUpdateState && appState) {
        const alreadyDone = !!appState.completedExercises?.[exercise.id];
        onUpdateState({
          ...appState,
          xp: (appState.xp || 0) + (!alreadyDone ? 10 : 0),
          completedExercises: {
            ...(appState.completedExercises || {}),
            [exercise.id]: true
          }
        });
      }
    }
  };

  const handleResetDialogueExercises = () => {
    setDialogueAnswers({});
  };

  const convCompletedCount = allExercises.filter(ex => !!appState?.completedExercises?.[ex.id]).length;
  const convPendingCount = allExercises.length - convCompletedCount;

  // Exercises filtered by current active dialogue, category and status
  const filteredExercises = useMemo(() => {
    return allExercises.filter(ex => {
      if (practiceDialogueFilter !== 'all') {
        const targetDiag = allDialogues.find(d => d.id === practiceDialogueFilter);
        const matchDiag = (ex.dialogue_id && ex.dialogue_id === practiceDialogueFilter) ||
          (targetDiag?.lessonNum && ex.lesson === targetDiag.lessonNum);
        if (!matchDiag) return false;
      }
      const matchType = filterType === 'all' || ex.type === filterType;
      const isCompleted = !!appState?.completedExercises?.[ex.id];
      if (exerciseStatusFilter === 'completed' && !isCompleted) return false;
      if (exerciseStatusFilter === 'pending' && isCompleted) return false;
      return matchType;
    });
  }, [allExercises, practiceDialogueFilter, filterType, exerciseStatusFilter, appState?.completedExercises, allDialogues]);

  const currentExercise = filteredExercises[currentExIndex] || filteredExercises[0] || null;

  const toggleDialogueCompletion = (item) => {
    if (!onUpdateState || !appState || !item) return;
    const isDone = isDialogueCompleted(item);
    const newCompleted = { ...completedConversations };

    if (isDone) {
      delete newCompleted[item.id];
      if (item.lessonNum) delete newCompleted[item.lessonNum];
    } else {
      newCompleted[item.id] = true;
      if (item.lessonNum) newCompleted[item.lessonNum] = true;
    }

    const xpBonus = !isDone ? 30 : 0;
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
    const nextPending = allDialogues.find(d => !isDialogueCompleted(d));
    if (nextPending) {
      setSelectedDialogueId(nextPending.id);
      setMutedSpeaker('');
      setRevealedLineIndices({});
      updateParams(nextPending.id, activeSubTab, statusFilter, filterType);
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
            <span>Conversación, Diálogos Irodori & NHK</span>
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
          {/* Subtab 1: Unified Dialogues */}
          <button
            className={`btn ${activeSubTab === 'dialogue' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setActiveSubTab('dialogue');
              updateParams(selectedDialogueId, 'dialogue', statusFilter, filterType);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 700 }}
          >
            <Radio size={18} /> Diálogos y Conversaciones ({allDialogues.length})
          </button>

          {/* Subtab 2: AI Roleplay Mode */}
          <button
            className={`btn ${activeSubTab === 'roleplay' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setActiveSubTab('roleplay');
              updateParams(selectedDialogueId, 'roleplay', statusFilter, filterType);
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
              updateParams(selectedDialogueId, 'saved', statusFilter, filterType);
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
              updateParams(selectedDialogueId, 'practice', statusFilter, filterType);
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
      {/* SUBTAB 1: UNIFIED DIALOGUES LIBRARY (IRODORI & NHK WORLD)                 */}
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
                    Progreso de Estudio: {completedCount} de {allDialogues.length} conversaciones completadas
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {progressPercent}% del catálogo completado · +30 XP por cada diálogo estudiado
                  </div>
                </div>
              </div>

              {/* Status Filters & Jump */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setStatusFilter('all');
                    updateParams(selectedDialogueId, activeSubTab, 'all', filterType);
                  }}
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                >
                  Todas ({allDialogues.length})
                </button>
                <button
                  className={`btn btn-sm ${statusFilter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setStatusFilter('completed');
                    updateParams(selectedDialogueId, activeSubTab, 'completed', filterType);
                  }}
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                >
                  ✓ Estudiadas ({completedCount})
                </button>
                <button
                  className={`btn btn-sm ${statusFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setStatusFilter('pending');
                    updateParams(selectedDialogueId, activeSubTab, 'pending', filterType);
                  }}
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                >
                  Pendientes ({allDialogues.length - completedCount})
                </button>

                {completedCount < allDialogues.length && (
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

          {/* Filtering & Search Controls Bar */}
          <div className="card" style={{ marginBottom: 18, padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              {/* Collection Tabs */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>Colección:</span>
                <button
                  className={`btn btn-sm ${seriesFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSeriesFilter('all')}
                  style={{ fontSize: '0.78rem', padding: '3px 10px' }}
                >
                  Todas ({allDialogues.length})
                </button>
                <button
                  className={`btn btn-sm ${seriesFilter === 'irodori' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSeriesFilter('irodori')}
                  style={{ 
                    fontSize: '0.78rem', 
                    padding: '3px 10px', 
                    borderColor: seriesFilter === 'irodori' ? '#2563eb' : undefined,
                    background: seriesFilter === 'irodori' ? '#2563eb' : undefined,
                    color: seriesFilter === 'irodori' ? '#fff' : undefined
                  }}
                >
                  🏙️ Irodori Situacional ({irodoriDialogues.length})
                </button>
                <button
                  className={`btn btn-sm ${seriesFilter === 'nhk' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSeriesFilter('nhk')}
                  style={{ 
                    fontSize: '0.78rem', 
                    padding: '3px 10px', 
                    borderColor: seriesFilter === 'nhk' ? '#dc2626' : undefined,
                    background: seriesFilter === 'nhk' ? '#dc2626' : undefined,
                    color: seriesFilter === 'nhk' ? '#fff' : undefined
                  }}
                >
                  📻 NHK World ({nhkLessons.length})
                </button>
              </div>

              {/* JLPT Level Tabs */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>Nivel:</span>
                {['all', 'N5', 'N4', 'N3'].map(lvl => {
                  const count = lvl === 'all' ? allDialogues.length : allDialogues.filter(d => d.level === lvl).length;
                  const isSelected = levelFilter === lvl;
                  return (
                    <button
                      key={lvl}
                      className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setLevelFilter(lvl)}
                      style={{ fontSize: '0.78rem', padding: '3px 10px' }}
                    >
                      {lvl === 'all' ? 'Todos' : lvl} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '4px 10px', gap: 6, minWidth: 200, flex: '1 1 200px', maxWidth: 300 }}>
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar por tema, frase o personaje..."
                  value={searchDialogueQuery}
                  onChange={(e) => setSearchDialogueQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '0.85rem', width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Dialogue Selector Pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', maxHeight: 180, overflowY: 'auto', padding: '4px 0' }}>
            {visibleDialogues.length === 0 ? (
              <div style={{ padding: '16px 20px', textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>No se encontraron diálogos con los filtros seleccionados.</p>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  onClick={() => { setSeriesFilter('all'); setLevelFilter('all'); setStatusFilter('all'); setSearchDialogueQuery(''); }}
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              visibleDialogues.map(d => {
                const isDone = isDialogueCompleted(d);
                const isSelected = d.id === selectedDialogueId;

                return (
                  <button
                    key={d.id}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => {
                      setSelectedDialogueId(d.id);
                      setMutedSpeaker('');
                      setRevealedLineIndices({});
                      updateParams(d.id, activeSubTab, statusFilter, filterType);
                    }}
                    style={{ 
                      fontSize: '0.82rem', 
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      borderColor: isDone ? (isSelected ? 'var(--primary)' : '#22c55e') : undefined,
                      background: isDone && !isSelected ? 'rgba(34, 197, 94, 0.08)' : undefined
                    }}
                    title={`${d.series} · Nivel ${d.level} · ${d.title_es}`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={13} color={isSelected ? '#fff' : '#22c55e'} />
                    ) : (
                      <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>○</span>
                    )}
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 800, 
                      padding: '1px 5px', 
                      borderRadius: 3, 
                      background: isSelected ? 'rgba(255, 255, 255, 0.25)' : (d.level === 'N5' ? 'rgba(16, 185, 129, 0.15)' : d.level === 'N4' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)'),
                      color: isSelected ? '#fff' : (d.level === 'N5' ? '#059669' : d.level === 'N4' ? '#2563eb' : '#d97706')
                    }}>
                      {d.level}
                    </span>
                    <span>
                      {d.seriesKey === 'irodori' ? `Irodori ${d.dialogueNum}` : `L${d.dialogueNum}`}: {d.title_jp.slice(0, 16)}...
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {currentDialogue && (
            <div className="card" style={{ marginBottom: 24, border: isCurrentDialogueCompleted ? '1.5px solid rgba(34, 197, 94, 0.4)' : undefined }}>
              {/* Top Info Bar */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        padding: '3px 8px', 
                        borderRadius: 4, 
                        background: currentDialogue.seriesKey === 'irodori' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(239, 68, 68, 0.12)', 
                        color: currentDialogue.seriesKey === 'irodori' ? '#2563eb' : '#dc2626' 
                      }}
                    >
                      {currentDialogue.series}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        padding: '3px 8px', 
                        borderRadius: 4, 
                        background: currentDialogue.level === 'N5' ? 'rgba(16, 185, 129, 0.15)' : currentDialogue.level === 'N4' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                        color: currentDialogue.level === 'N5' ? '#059669' : currentDialogue.level === 'N4' ? '#2563eb' : '#d97706' 
                      }}
                    >
                      {currentDialogue.level}
                    </span>
                    <span className="vocab-tag">
                      {currentDialogue.topic}
                    </span>
                    {isCurrentDialogueCompleted ? (
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
                    {currentDialogue.title_jp}
                  </h3>
                  <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    🇪🇸 {currentDialogue.title_es}
                  </p>

                  {/* Real-life Situation Context Box (Irodori) */}
                  {currentDialogue.situation && (
                    <div style={{ marginTop: 10, background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                      <strong style={{ color: '#2563eb', fontSize: '0.82rem' }}>🏙️ Situación real:</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                        {currentDialogue.situation}
                      </p>
                    </div>
                  )}

                  {/* Related Curriculum Module Link */}
                  {currentDialogue.related_step && (
                    <div style={{ marginTop: 10 }}>
                      <Link
                        href={`/curriculum?step=${currentDialogue.related_step}`}
                        className="btn btn-outline btn-xs"
                        style={{ fontSize: '0.78rem', padding: '3px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 600 }}
                        title={`Ir al Módulo ${currentDialogue.related_step} del currículum`}
                      >
                        <span>🔗 Módulo {currentDialogue.related_step} del Currículum</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Header Action Buttons */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {/* Mark Completed Toggle Button */}
                  <button 
                    className="btn"
                    onClick={() => toggleDialogueCompletion(currentDialogue)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: isCurrentDialogueCompleted ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-card)',
                      color: isCurrentDialogueCompleted ? '#15803d' : 'var(--text-main)',
                      borderColor: isCurrentDialogueCompleted ? '#22c55e' : 'var(--border)',
                      fontWeight: 700
                    }}
                    title={isCurrentDialogueCompleted ? 'Hacer clic para marcar como pendiente' : 'Hacer clic para marcar como completada (+30 XP)'}
                  >
                    {isCurrentDialogueCompleted ? (
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
                    onClick={() => handlePlayFullDialogue(currentDialogue.dialogue, mutedSpeaker)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    title={mutedSpeaker ? `Reproducir solo la voz de tu contraparte (silenciando a ${mutedSpeaker})` : "Reproducir el diálogo línea a línea con voz neuronal"}
                  >
                    <Play size={16} /> {mutedSpeaker ? `Reproducir sin ${mutedSpeaker}` : 'Diálogo Línea a Línea'}
                  </button>

                  {(currentDialogue.audio_url || currentDialogue.audio_local) && (
                    <button 
                      className="btn btn-outline"
                      onClick={() => audioManager.playAudioUrl(currentDialogue.audio_local || currentDialogue.audio_url, `Radio NHK · Lección ${currentDialogue.dialogueNum}: ${currentDialogue.title_jp}`)}
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
                          (currentDialogue.dialogue || []).forEach((_, i) => { allRev[i] = true; });
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

              {/* Dialogue Lines Header with Active Recall Toggles */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={18} color="var(--primary)" /> Diálogo de la Lección ({currentDialogue.dialogue?.length || 0} líneas):
                </h4>

                {/* Active Recall Controls: Furigana / Kana & Spanish Translation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${showFurigana ? 'btn-outline' : 'btn-ghost'}`}
                    onClick={() => {
                      setShowFurigana(!showFurigana);
                      setRevealedKanaIndices({});
                    }}
                    style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    title={showFurigana ? "Ocultar pronunciación kana para practicar kanji" : "Mostrar pronunciación kana"}
                  >
                    {showFurigana ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{showFurigana ? 'Pronunciación (Kana)' : 'Kana Oculto'}</span>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm ${showSpanish ? 'btn-outline' : 'btn-ghost'}`}
                    onClick={() => {
                      setShowSpanish(!showSpanish);
                      setRevealedEsIndices({});
                    }}
                    style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    title={showSpanish ? "Ocultar traducción español para practicar comprensión" : "Mostrar traducción español"}
                  >
                    {showSpanish ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{showSpanish ? 'Traducción 🇪🇸' : 'Traducción Oculta'}</span>
                  </button>
                </div>
              </div>

              {/* Chat-style Dialogue Stream */}
              <div className="dialogue-chat-stream">
                {currentDialogue.dialogue.map((d, idx) => {
                  const lineJp = d.jp || d.japanese || '';
                  const lineEs = d.es || d.spanish || '';
                  const lineKana = d.furigana || d.kana || '';
                  const isMuted = mutedSpeaker && d.speaker === mutedSpeaker;
                  const isRevealed = !!revealedLineIndices[idx];
                  const spkStyle = getSpeakerStyle(d.speaker, isMuted, currentSpeakers);
                  const speakerIdx = currentSpeakers.indexOf(d.speaker);
                  const isSecondSpeaker = speakerIdx % 2 === 1;
                  const bubbleAlignClass = isSecondSpeaker ? 'bubble-right' : 'bubble-left';
                  const isKanaRevealed = !!revealedKanaIndices[idx];
                  const isEsRevealed = !!revealedEsIndices[idx];

                  return (
                    <div 
                      key={idx}
                      className={`dialogue-card-item dialogue-chat-bubble ${bubbleAlignClass} ${isMuted ? 'is-roleplay-user' : ''}`}
                    >
                      {/* Top Header Row: Speaker Identification on Left, Action Buttons on Right */}
                      <div className="dialogue-card-header">
                        <div className="dialogue-speaker-wrap">
                          <div 
                            className="dialogue-speaker-pill"
                            style={{
                              background: spkStyle.pillBg,
                              borderColor: spkStyle.pillBorder,
                              color: spkStyle.color
                            }}
                          >
                            <span 
                              className="dialogue-speaker-avatar"
                              style={{
                                background: spkStyle.iconBg,
                                color: spkStyle.color
                              }}
                            >
                              {d.speaker ? d.speaker.slice(0, 1) : <User size={12} />}
                            </span>
                            <span>{d.speaker}</span>
                          </div>

                          {isMuted ? (
                            <span className="dialogue-role-badge">
                              🎙️ Tu papel
                            </span>
                          ) : (
                            <span className="dialogue-turn-tag">#{idx + 1}</span>
                          )}
                        </div>

                        {/* Action buttons toolbar: Audio, SpeechPractice & Handwriting practice */}
                        <div className="dialogue-card-actions" onClick={(e) => e.stopPropagation()}>
                          <button 
                            type="button"
                            className="audio-btn" 
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

                      {/* Main Body: Full-width Japanese dialogue, kana and Spanish translation */}
                      <div className="dialogue-card-body">
                        {/* Masked vs visible Japanese text */}
                        {isMuted && !isRevealed ? (
                          <div className="dialogue-card-prompt">
                            <span className="dialogue-card-prompt-text">
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
                        ) : (
                          <div>
                            <div className="dialogue-card-jp jp-text">
                              {lineJp}
                            </div>

                            {/* Pronunciation / Kana Reading with Active Recall toggle */}
                            {lineKana && lineKana !== lineJp && (
                              showFurigana ? (
                                <div className="dialogue-card-kana jp-text">
                                  {lineKana}
                                </div>
                              ) : isKanaRevealed ? (
                                <div style={{ marginTop: 2 }}>
                                  <div className="dialogue-card-kana jp-text" style={{ color: 'var(--primary)' }}>
                                    {lineKana}
                                  </div>
                                  <button
                                    type="button"
                                    className="dialogue-hide-btn"
                                    onClick={() => setRevealedKanaIndices(prev => ({ ...prev, [idx]: false }))}
                                  >
                                    <EyeOff size={11} /> Ocultar pronunciación
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="dialogue-peek-btn"
                                  onClick={() => setRevealedKanaIndices(prev => ({ ...prev, [idx]: true }))}
                                  title="Ver lectura en kana de esta frase"
                                >
                                  <Eye size={12} /> Ver pronunciación
                                </button>
                              )
                            )}

                            {isMuted && isRevealed && (
                              <button
                                type="button"
                                onClick={() => setRevealedLineIndices(prev => ({ ...prev, [idx]: false }))}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}
                              >
                                <EyeOff size={12} /> Ocultar pista
                              </button>
                            )}
                          </div>
                        )}

                        {/* Spanish Translation Prompt with Active Recall toggle */}
                        {showSpanish ? (
                          <div className="dialogue-card-es">
                            <span style={{ marginRight: 6 }}>🇪🇸</span>
                            <span>{lineEs}</span>
                          </div>
                        ) : isEsRevealed ? (
                          <div className="dialogue-card-es">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                              <div>
                                <span style={{ marginRight: 6 }}>🇪🇸</span>
                                <span>{lineEs}</span>
                              </div>
                              <button
                                type="button"
                                className="dialogue-hide-btn"
                                onClick={() => setRevealedEsIndices(prev => ({ ...prev, [idx]: false }))}
                              >
                                <EyeOff size={11} /> Ocultar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="dialogue-peek-btn"
                            style={{ marginTop: 6 }}
                            onClick={() => setRevealedEsIndices(prev => ({ ...prev, [idx]: true }))}
                            title="Ver traducción al español de esta frase"
                          >
                            <Eye size={12} /> Ver traducción 🇪🇸
                          </button>
                        )}
                      </div>

                      {/* Interactive Pronunciation Evaluation Footer for Muted Character */}
                      {isMuted && (
                        <div className="dialogue-card-footer">
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
              {currentDialogue.grammar_notes && currentDialogue.grammar_notes.length > 0 && (
                <div style={{ background: 'var(--primary-bg)', borderLeft: '4px solid var(--primary)', padding: '18px 20px', borderRadius: '0 var(--radius-md) var(--radius-md) 0', marginBottom: 20 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={18} /> Puntos Clave de Gramática y Uso Cotidiano:
                  </h4>
                  <ul style={{ listStyleType: 'disc', paddingLeft: 22, fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-main)' }}>
                    {currentDialogue.grammar_notes.map((note, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dialogue-Specific Interactive Didactic Exercises */}
              {currentDialogueExercises.length > 0 && (
                <div 
                  className="card" 
                  style={{ 
                    marginBottom: 24, 
                    padding: '24px 26px', 
                    borderRadius: 'var(--radius-lg, 16px)',
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg-card)'
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '1.3rem' }}>📝</span>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                          Ejercicios Didácticos de este Diálogo
                        </h3>
                        <span className="vocab-tag" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', fontWeight: 700, fontSize: '0.75rem' }}>
                          {currentDialogueExercises.length} preguntas interactivas
                        </span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                        Pon a prueba tu comprensión y capacidad de respuesta en esta situación (+10 XP por acierto):
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {/* Score badge */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700, background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}>
                        <Award size={16} color="var(--primary)" />
                        <span>
                          Superadas: {currentDialogueExercises.filter(ex => !!appState?.completedExercises?.[ex.id] || dialogueAnswers[ex.id]?.isCorrect).length} de {currentDialogueExercises.length}
                        </span>
                      </div>

                      {/* Jump to full practice mode */}
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setPracticeDialogueFilter(currentDialogue.id);
                          setActiveSubTab('practice');
                          setCurrentExIndex(0);
                          setSelectedAnswer(null);
                          updateParams(currentDialogue.id, 'practice', statusFilter, filterType);
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', padding: '6px 12px' }}
                        title="Abrir estos ejercicios en el modo de práctica con carrusel y filtros"
                      >
                        <HelpCircle size={14} /> Modo Test Completo ↗
                      </button>

                      {/* Reset local session answers */}
                      {Object.keys(dialogueAnswers).length > 0 && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={handleResetDialogueExercises}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', padding: '6px 10px' }}
                          title="Reiniciar respuestas de esta sesión"
                        >
                          <RotateCcw size={13} /> Reiniciar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3 Questions List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {currentDialogueExercises.map((ex, exIdx) => {
                      const answerState = dialogueAnswers[ex.id];
                      const isCompletedInProfile = !!appState?.completedExercises?.[ex.id];
                      const hasAnswered = answerState !== undefined;
                      const isCorrect = answerState?.isCorrect;

                      return (
                        <div
                          key={ex.id || exIdx}
                          style={{
                            background: 'var(--bg-main)',
                            border: `1.5px solid ${hasAnswered ? (isCorrect ? '#10b981' : 'rgba(239, 68, 68, 0.4)') : 'var(--border)'}`,
                            borderRadius: 'var(--radius-md, 12px)',
                            padding: '18px 20px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* Question header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span 
                                style={{ 
                                  width: 24, 
                                  height: 24, 
                                  borderRadius: 999, 
                                  background: hasAnswered ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--primary)',
                                  color: '#fff', 
                                  fontSize: '0.8rem', 
                                  fontWeight: 800, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                {exIdx + 1}
                              </span>
                              <span className="vocab-tag" style={{ background: 'var(--primary-bg)', color: 'var(--primary-dark)', fontSize: '0.78rem', fontWeight: 700 }}>
                                {ex.type_label}
                              </span>
                            </div>

                            {isCompletedInProfile && (
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

                          {/* Prompt */}
                          <p style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 12, lineHeight: 1.5 }}>
                            {ex.prompt_es}
                          </p>

                          {/* Context box */}
                          {ex.context && (
                            <div 
                              className="jp-text" 
                              style={{ 
                                fontSize: '1.25rem', 
                                background: 'var(--bg-card)', 
                                padding: '12px 16px', 
                                borderRadius: 'var(--radius-sm, 8px)', 
                                borderLeft: '4px solid var(--primary)',
                                lineHeight: 1.8,
                                whiteSpace: 'pre-line',
                                color: 'var(--text-main)',
                                marginBottom: 16
                              }}
                            >
                              {ex.context}
                            </div>
                          )}

                          {/* Options grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: hasAnswered ? 14 : 0 }}>
                            {ex.options.map((option, optIdx) => {
                              const isSelected = answerState?.chosen === option;
                              const isThisCorrect = option === ex.correct;

                              let bg = 'var(--bg-card)';
                              let border = 'var(--border)';
                              let color = 'var(--text-main)';

                              if (hasAnswered) {
                                if (isThisCorrect) {
                                  bg = 'rgba(34, 197, 94, 0.12)';
                                  border = '#22c55e';
                                  color = '#15803d';
                                } else if (isSelected && !isCorrect) {
                                  bg = 'rgba(239, 68, 68, 0.12)';
                                  border = '#ef4444';
                                  color = '#b91c1c';
                                } else {
                                  color = 'var(--text-muted)';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={hasAnswered}
                                  onClick={() => handleSelectDialogueExerciseOption(ex, option)}
                                  className="jp-text"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 10,
                                    padding: '12px 14px',
                                    borderRadius: 'var(--radius-sm, 8px)',
                                    border: `1.5px solid ${border}`,
                                    background: bg,
                                    color: color,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: hasAnswered ? 'default' : 'pointer',
                                    textAlign: 'left',
                                    transition: 'transform 0.15s, border-color 0.2s',
                                    outline: 'none'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!hasAnswered) e.currentTarget.style.borderColor = 'var(--primary)';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!hasAnswered) e.currentTarget.style.borderColor = border;
                                  }}
                                >
                                  <span>{option}</span>
                                  {hasAnswered && isThisCorrect && <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0 }} />}
                                  {hasAnswered && isSelected && !isCorrect && <XCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Feedback & Explanation */}
                          {hasAnswered && (
                            <div 
                              style={{ 
                                marginTop: 12, 
                                padding: '14px 16px', 
                                borderRadius: 'var(--radius-sm, 8px)', 
                                background: isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                border: `1px solid ${isCorrect ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.95rem', color: isCorrect ? '#15803d' : '#b91c1c' }}>
                                  {isCorrect ? (
                                    <>
                                      <CheckCircle2 size={18} /> ¡Correcto! (+10 XP)
                                    </>
                                  ) : (
                                    <>
                                      <XCircle size={18} /> Respuesta adecuada: <span className="jp-text">{ex.correct}</span>
                                    </>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <button
                                    className="audio-btn"
                                    style={{ width: 28, height: 28 }}
                                    onClick={() => audioManager.speak(ex.correct)}
                                    title="Escuchar respuesta"
                                  >
                                    <Volume2 size={14} />
                                  </button>
                                  <SpeechPractice targetText={ex.correct} compact={true} />
                                </div>
                              </div>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
                                💡 <strong>Explicación:</strong> {ex.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Study Status & Next Lesson Callout */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '16px 20px', 
                  borderRadius: 'var(--radius-md)',
                  background: isCurrentDialogueCompleted ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-main)',
                  border: `1px solid ${isCurrentDialogueCompleted ? 'rgba(34, 197, 94, 0.25)' : 'var(--border)'}`,
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: isCurrentDialogueCompleted ? '#15803d' : 'var(--text-main)', fontSize: '0.95rem' }}>
                    {isCurrentDialogueCompleted 
                      ? '🎉 ¡Has estudiado esta conversación!' 
                      : '¿Ya escuchaste y comprendiste este diálogo?'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {isCurrentDialogueCompleted
                      ? 'El estado está registrado en tus estadísticas de progreso.'
                      : 'Márcala como estudiada para sumar +30 XP y avanzar en tu racha.'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => toggleDialogueCompletion(currentDialogue)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: isCurrentDialogueCompleted ? 'rgba(34, 197, 94, 0.2)' : 'var(--primary)',
                      color: isCurrentDialogueCompleted ? '#15803d' : '#fff',
                      fontWeight: 700
                    }}
                  >
                    {isCurrentDialogueCompleted ? (
                      <>
                        <CheckCircle2 size={16} /> Estudiada ✓
                      </>
                    ) : (
                      <>
                        <Check size={16} /> Marcar como Estudiada (+30 XP)
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={handleJumpToNextPending}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <span>Siguiente conversación</span>
                    <ChevronRight size={16} />
                  </button>
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
            <div className="saved-conversations-layout">
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

                  {/* Dialogue Lines Header with Active Recall Toggles */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MessageSquare size={18} color="var(--primary)" /> Diálogo ({selectedSavedConv.dialogue?.length || 0} líneas):
                    </h4>

                    {/* Active Recall Controls: Furigana / Kana & Spanish Translation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${showFurigana ? 'btn-outline' : 'btn-ghost'}`}
                        onClick={() => {
                          setShowFurigana(!showFurigana);
                          setRevealedKanaIndices({});
                        }}
                        style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        title={showFurigana ? "Ocultar pronunciación kana para practicar kanji" : "Mostrar pronunciación kana"}
                      >
                        {showFurigana ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{showFurigana ? 'Pronunciación (Kana)' : 'Kana Oculto'}</span>
                      </button>

                      <button
                        type="button"
                        className={`btn btn-sm ${showSpanish ? 'btn-outline' : 'btn-ghost'}`}
                        onClick={() => {
                          setShowSpanish(!showSpanish);
                          setRevealedEsIndices({});
                        }}
                        style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        title={showSpanish ? "Ocultar traducción español para practicar comprensión" : "Mostrar traducción español"}
                      >
                        {showSpanish ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{showSpanish ? 'Traducción 🇪🇸' : 'Traducción Oculta'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Chat-style Dialogue Stream */}
                  <div className="dialogue-chat-stream">
                    {(selectedSavedConv.dialogue || []).map((d, idx) => {
                      const lineJp = d.japanese || d.jp || '';
                      const lineEs = d.spanish || d.es || '';
                      const lineKana = d.furigana || d.kana || '';
                      const isMuted = savedMutedSpeaker && d.speaker === savedMutedSpeaker;
                      const isRevealed = !!savedRevealedLineIndices[idx];
                      const spkStyle = getSpeakerStyle(d.speaker, isMuted, savedSpeakers);
                      const speakerIdx = savedSpeakers.indexOf(d.speaker);
                      const isSecondSpeaker = speakerIdx % 2 === 1;
                      const bubbleAlignClass = isSecondSpeaker ? 'bubble-right' : 'bubble-left';
                      const isKanaRevealed = !!revealedKanaIndices[idx];
                      const isEsRevealed = !!revealedEsIndices[idx];

                      return (
                        <div 
                          key={idx}
                          className={`dialogue-card-item dialogue-chat-bubble ${bubbleAlignClass} ${isMuted ? 'is-roleplay-user' : ''}`}
                        >
                          {/* Top Header Row: Speaker Identification on Left, Action Buttons on Right */}
                          <div className="dialogue-card-header">
                            <div className="dialogue-speaker-wrap">
                              <div 
                                className="dialogue-speaker-pill"
                                style={{
                                  background: spkStyle.pillBg,
                                  borderColor: spkStyle.pillBorder,
                                  color: spkStyle.color
                                }}
                              >
                                <span 
                                  className="dialogue-speaker-avatar"
                                  style={{
                                    background: spkStyle.iconBg,
                                    color: spkStyle.color
                                  }}
                                >
                                  {d.speaker ? d.speaker.slice(0, 1) : <User size={12} />}
                                </span>
                                <span>{d.speaker}</span>
                              </div>

                              {isMuted ? (
                                <span className="dialogue-role-badge">
                                  🎙️ Tu papel
                                </span>
                              ) : (
                                <span className="dialogue-turn-tag">#{idx + 1}</span>
                              )}
                            </div>

                            {/* Action buttons: Audio, SpeechPractice & Cuaderno Canvas */}
                            <div className="dialogue-card-actions" onClick={(e) => e.stopPropagation()}>
                              <button 
                                type="button"
                                className="audio-btn" 
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

                          {/* Main Body: Full width dialogue content */}
                          <div className="dialogue-card-body">
                            {/* Masked vs visible Japanese text */}
                            {isMuted && !isRevealed ? (
                              <div className="dialogue-card-prompt">
                                <span className="dialogue-card-prompt-text">
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
                            ) : (
                              <div>
                                <div className="dialogue-card-jp jp-text">
                                  {lineJp}
                                </div>

                                {/* Pronunciation / Kana Reading with Active Recall toggle */}
                                {lineKana && lineKana !== lineJp && (
                                  showFurigana ? (
                                    <div className="dialogue-card-kana jp-text">
                                      {lineKana}
                                    </div>
                                  ) : isKanaRevealed ? (
                                    <div style={{ marginTop: 2 }}>
                                      <div className="dialogue-card-kana jp-text" style={{ color: 'var(--primary)' }}>
                                        {lineKana}
                                      </div>
                                      <button
                                        type="button"
                                        className="dialogue-hide-btn"
                                        onClick={() => setRevealedKanaIndices(prev => ({ ...prev, [idx]: false }))}
                                      >
                                        <EyeOff size={11} /> Ocultar pronunciación
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      className="dialogue-peek-btn"
                                      onClick={() => setRevealedKanaIndices(prev => ({ ...prev, [idx]: true }))}
                                      title="Ver lectura en kana de esta frase"
                                    >
                                      <Eye size={12} /> Ver pronunciación
                                    </button>
                                  )
                                )}

                                {isMuted && isRevealed && (
                                  <button
                                    type="button"
                                    onClick={() => setSavedRevealedLineIndices(prev => ({ ...prev, [idx]: false }))}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}
                                  >
                                    <EyeOff size={12} /> Ocultar pista
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Spanish Translation Prompt with Active Recall toggle */}
                            {showSpanish ? (
                              <div className="dialogue-card-es">
                                <span style={{ marginRight: 6 }}>🇪🇸</span>
                                <span>{lineEs}</span>
                              </div>
                            ) : isEsRevealed ? (
                              <div className="dialogue-card-es">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                                  <div>
                                    <span style={{ marginRight: 6 }}>🇪🇸</span>
                                    <span>{lineEs}</span>
                                  </div>
                                  <button
                                    type="button"
                                    className="dialogue-hide-btn"
                                    onClick={() => setRevealedEsIndices(prev => ({ ...prev, [idx]: false }))}
                                  >
                                    <EyeOff size={11} /> Ocultar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="dialogue-peek-btn"
                                style={{ marginTop: 6 }}
                                onClick={() => setRevealedEsIndices(prev => ({ ...prev, [idx]: true }))}
                                title="Ver traducción al español de esta frase"
                              >
                                <Eye size={12} /> Ver traducción 🇪🇸
                              </button>
                            )}
                          </div>

                          {/* Interactive Pronunciation Evaluation Footer for Muted Character */}
                          {isMuted && (
                            <div className="dialogue-card-footer">
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
        <div className="card" style={{ maxWidth: 860, margin: '0 auto', padding: '24px 28px' }}>
          {/* Dialogue selector filter bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18, background: 'var(--bg-main)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
              <Filter size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                Diálogo:
              </span>
              <select
                className="input"
                value={practiceDialogueFilter}
                onChange={(e) => {
                  setPracticeDialogueFilter(e.target.value);
                  setCurrentExIndex(0);
                  setSelectedAnswer(null);
                }}
                style={{ fontSize: '0.85rem', padding: '6px 10px', height: 'auto', flex: 1, minWidth: 200 }}
              >
                <option value="all">🌐 Todos los diálogos ({allExercises.length} ejercicios didácticos)</option>
                <optgroup label="NHK World: Hablemos en Japonés (48 lecciones)">
                  {allDialogues.filter(d => d.seriesKey === 'nhk').map(d => (
                    <option key={d.id} value={d.id}>
                      Lección {d.lessonNum}: {d.title_jp} — {d.title_es}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Irodori: Vida Cotidiana en Japón (22 diálogos)">
                  {allDialogues.filter(d => d.seriesKey === 'irodori').map(d => (
                    <option key={d.id} value={d.id}>
                      Irodori {d.dialogueNum}: {d.title_jp} — {d.title_es}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {practiceDialogueFilter !== 'all' && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setPracticeDialogueFilter('all');
                  setCurrentExIndex(0);
                  setSelectedAnswer(null);
                }}
                style={{ fontSize: '0.8rem', padding: '4px 10px' }}
              >
                ✕ Ver todos los diálogos
              </button>
            )}
          </div>

          {/* Practice Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { 
                  setFilterType('all'); 
                  setCurrentExIndex(0); 
                  setSelectedAnswer(null); 
                  updateParams(selectedDialogueId, activeSubTab, statusFilter, 'all');
                }}
              >
                Todos ({filteredExercises.length})
              </button>
              <button
                className={`btn btn-sm ${filterType === 'reply' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { 
                  setFilterType('reply'); 
                  setCurrentExIndex(0); 
                  setSelectedAnswer(null); 
                  updateParams(selectedDialogueId, activeSubTab, statusFilter, 'reply');
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
                  updateParams(selectedDialogueId, activeSubTab, statusFilter, 'missing_word');
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
                  updateParams(selectedDialogueId, activeSubTab, statusFilter, 'missing_kanji');
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
              { id: 'all', label: `Todos (${filteredExercises.length})` },
              { id: 'pending', label: `Pendientes (${filteredExercises.filter(ex => !appState?.completedExercises?.[ex.id]).length})` },
              { id: 'completed', label: `Superados (${filteredExercises.filter(ex => !!appState?.completedExercises?.[ex.id]).length})` }
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
                  setPracticeDialogueFilter('all');
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
                  {(() => {
                    const relatedDiag = allDialogues.find(d => 
                      (currentExercise.dialogue_id && d.id === currentExercise.dialogue_id) || 
                      (currentExercise.lesson && d.lessonNum === currentExercise.lesson)
                    );
                    return (
                      <>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {relatedDiag ? `${relatedDiag.seriesKey === 'nhk' ? `Lección ${relatedDiag.lessonNum}` : `Irodori ${relatedDiag.dialogueNum}`}: ${relatedDiag.title_es}` : (currentExercise.lesson ? `Lección ${currentExercise.lesson}` : 'Diálogo')}
                        </span>
                        {(completedConversations[currentExercise.dialogue_id] || (currentExercise.lesson && completedConversations[currentExercise.lesson])) && (
                          <span style={{ fontSize: '0.75rem', color: '#15803d', background: 'rgba(34, 197, 94, 0.12)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                            ✓ Diálogo estudiado
                          </span>
                        )}
                      </>
                    );
                  })()}
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
      {isGenModalOpen && (
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
      )}
    </div>
  );
}
