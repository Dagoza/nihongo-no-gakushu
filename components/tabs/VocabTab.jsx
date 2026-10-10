'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, Search, ArrowRight, ArrowLeft, Lightbulb, Keyboard, BookOpen, Layers, Edit3, StickyNote, Plus, RotateCcw, Sparkles, MessageSquare, PenTool, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import audioManager from '../../lib/audioManager';
import vocabularyData from '../../data/vocabulary.json';
import exercisesData from '../../data/exercises.json';
import * as wanakana from 'wanakana';
import { getNewCard, reviewCard, isDue } from '../../lib/srs';
import PitchAccent from '../features/PitchAccent';
import { getVocabularyFromSupabase } from '../../lib/supabaseData';
import { useApp } from '../../lib/AppContext';
import { getAuthSession } from '../../lib/supabaseSync';

// Lazy loading con code-splitting para componentes de alto peso e interactividad
const SrsReview = dynamic(() => import('../features/SrsReview'), { ssr: false });
const SpeechPractice = dynamic(() => import('../features/SpeechPractice'), { ssr: false });
const EditWordModal = dynamic(() => import('../modals/EditWordModal'), { ssr: false });
const SaveVocabModal = dynamic(() => import('../modals/SaveVocabModal'), { ssr: false });
const AIGeneratorModal = dynamic(() => import('../modals/AIGeneratorModal'), { ssr: false });

export default function VocabTab({ 
  appState, 
  onUpdateState,
  authUser: propAuthUser = null,
  initialMode = null,
  initialLevel = null,
  initialCategory = null,
  initialSearch = null,
  onParamsChange
}) {
  const contextApp = useApp();
  const authUser = propAuthUser || contextApp?.authUser;
  const [mode, setMode] = useState(initialMode || 'cards'); // 'cards' | 'typing' | 'n4_exercises' | 'srs'
  const [level, setLevel] = useState(initialLevel || 'all'); // 'all' | 'N5' | 'N4'
  const [category, setCategory] = useState(initialCategory || 'all');
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');

  useEffect(() => {
    if (initialMode && ['cards', 'typing', 'n4_exercises', 'srs'].includes(initialMode)) {
      setMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialLevel && ['all', 'N5', 'N4', 'N3', 'N2', 'N1'].includes(initialLevel)) {
      setLevel(initialLevel);
    }
  }, [initialLevel]);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch !== null && initialSearch !== undefined) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const updateParams = (newMode, newLevel, newCat, newSearch) => {
    if (onParamsChange) {
      onParamsChange({
        mode: newMode !== undefined ? newMode : mode,
        level: newLevel !== undefined ? newLevel : level,
        category: newCat !== undefined ? newCat : category,
        search: newSearch !== undefined ? newSearch : searchTerm
      });
    }
  };

  // Typing practice state
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingInput, setTypingInput] = useState('');
  const [typingFeedback, setTypingFeedback] = useState(null); // { type: 'correct'|'wrong', msg, target }
  const isComposingRef = useRef(false);

  // N4 Exercises state
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [exerciseAnswer, setExerciseAnswer] = useState(null); // { selected, isCorrect }

  // SRS state
  const [srsQueue, setSrsQueue] = useState([]);

  // Word Editing & Notes State
  const [editingWord, setEditingWord] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterOnlyWithNotes, setFilterOnlyWithNotes] = useState(false);
  const [filterOnlyCustomized, setFilterOnlyCustomized] = useState(false);

  // AI Content Generator & Multi-selection State
  const [selectedWordIds, setSelectedWordIds] = useState(new Set());
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [aiGenType, setAiGenType] = useState('story');

  const isMassive = Boolean(authUser && appState?.useMassiveDictionary);
  const [vocabularyList, setVocabularyList] = useState(vocabularyData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(36);

  const handleToggleSource = (enableMassive) => {
    if (enableMassive) {
      if (!authUser) {
        if (contextApp?.showAlert) {
          contextApp.showAlert({
            type: 'lock',
            title: 'Diccionario Masivo en la Nube',
            message: 'Inicia sesión con tu cuenta de Google o correo para desbloquear el diccionario masivo con más de 2,000 palabras.',
            actionLabel: 'Iniciar Sesión',
            onAction: () => {
              if (contextApp?.setIsAuthModalOpen) {
                contextApp.setIsAuthModalOpen(true);
              }
            }
          });
        } else if (contextApp?.setIsAuthModalOpen) {
          contextApp.setIsAuthModalOpen(true);
        }
        return;
      }
      onUpdateState({
        ...appState,
        useMassiveDictionary: true
      });
    } else {
      onUpdateState({
        ...appState,
        useMassiveDictionary: false
      });
    }
  };

  useEffect(() => {
    // Si está apagado el catálogo masivo o no hay sesión activa, usar estrictamente los recursos propios
    if (!authUser || !appState?.useMassiveDictionary) {
      setVocabularyList(vocabularyData || []);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    getVocabularyFromSupabase({ level, authUser })
      .then(data => {
        if (isMounted && data && data.length > 0) {
          setVocabularyList(data);
        }
      })
      .catch(err => console.error("Error cargando vocabulario masivo:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [level, authUser, appState?.useMassiveDictionary]);

  // Reset de ventana visible cuando cambian filtros o búsqueda
  useEffect(() => {
    setVisibleCount(36);
  }, [searchTerm, level, category, mode, isMassive]);

  const n4Exercises = exercisesData || [];

  // Merge vocabulary with user customizations and saved custom words
  const effectiveVocabList = useMemo(() => {
    const customizations = appState?.vocabCustomizations || {};
    const baseList = (vocabularyList || []).map(item => {
      const override = customizations[item.id] || customizations[item.kanji] || customizations[item.kana];
      if (override) {
        return {
          ...item,
          ...override,
          isCustomized: true
        };
      }
      return item;
    });

    const existingKanjis = new Set(baseList.map(v => v.kanji));
    const extraCustom = (appState?.savedCustomVocab || [])
      .filter(v => !existingKanjis.has(v.kanji))
      .map(v => ({
        ...v,
        isCustomized: true
      }));

    return [...extraCustom, ...baseList];
  }, [vocabularyList, appState?.vocabCustomizations, appState?.savedCustomVocab]);

  // Filter vocabulary
  const filteredVocab = effectiveVocabList.filter(item => {
    const matchLevel = level === 'all' || item.level === level;
    const matchCategory = category === 'all' || item.category === category;
    const search = searchTerm.trim().toLowerCase();
    const matchSearch = !search ||
      (item.kanji && item.kanji.toLowerCase().includes(search)) ||
      (item.kana && item.kana.toLowerCase().includes(search)) ||
      (item.hiragana && item.hiragana.toLowerCase().includes(search)) ||
      (item.katakana && item.katakana.toLowerCase().includes(search)) ||
      (item.meaning_es && item.meaning_es.toLowerCase().includes(search)) ||
      (item.meaning_en && item.meaning_en.toLowerCase().includes(search)) ||
      (item.literal_translation && item.literal_translation.toLowerCase().includes(search)) ||
      (item.breakdown && item.breakdown.toLowerCase().includes(search)) ||
      (item.example_sentence && item.example_sentence.toLowerCase().includes(search)) ||
      (item.example_translation && item.example_translation.toLowerCase().includes(search)) ||
      (item.notes && item.notes.toLowerCase().includes(search));

    const matchNotesOnly = !filterOnlyWithNotes || Boolean(item.notes && item.notes.trim());
    const matchCustomOnly = !filterOnlyCustomized || Boolean(item.isCustomized);

    return matchLevel && matchCategory && matchSearch && matchNotesOnly && matchCustomOnly;
  });

  // Extract unique categories based on current level
  const availableCategories = ['all', ...new Set(
    effectiveVocabList
      .filter(item => level === 'all' || item.level === level)
      .map(item => item.category)
      .filter(Boolean)
  )];

  const selectedWordsForAI = useMemo(() => {
    if (selectedWordIds.size === 0) {
      return filteredVocab.slice(0, 5);
    }
    return Array.from(selectedWordIds).map(id => {
      return effectiveVocabList.find(x => (x.id === id || x.kanji === id)) || { kanji: id, kana: '', meaning_es: '' };
    });
  }, [selectedWordIds, effectiveVocabList, filteredVocab]);

  const handleSaveWordEdit = async (updatedWord) => {
    const wordKey = updatedWord.id || updatedWord.kanji;
    const prevCustomizations = appState?.vocabCustomizations || {};
    const newCustomizations = {
      ...prevCustomizations,
      [wordKey]: {
        ...updatedWord,
        isCustomized: true,
        updatedAt: new Date().toISOString()
      },
      [updatedWord.kanji]: {
        ...updatedWord,
        isCustomized: true,
        updatedAt: new Date().toISOString()
      }
    };

    const prevCustomVocab = appState?.savedCustomVocab || [];
    const updatedCustomVocab = prevCustomVocab.map(v => 
      (v.id === updatedWord.id || v.kanji === updatedWord.kanji) ? { ...v, ...updatedWord } : v
    );

    const newXp = (appState?.xp || 0) + 15;
    onUpdateState({
      ...appState,
      vocabCustomizations: newCustomizations,
      savedCustomVocab: updatedCustomVocab,
      xp: newXp
    });

    try {
      const session = await getAuthSession();
      if (session?.access_token) {
        fetch('/api/data/vocabulary', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            id: updatedWord.id,
            kanji: updatedWord.kanji,
            kana: updatedWord.kana || updatedWord.hiragana,
            meaning_es: updatedWord.meaning_es,
            meaning_en: updatedWord.meaning_en,
            level: updatedWord.level,
            category: updatedWord.category
          })
        }).catch(e => console.warn('Supabase background update error:', e));
      }
    } catch {}
  };

  const handleResetWordEdit = (wordKey) => {
    const prevCustomizations = { ...(appState?.vocabCustomizations || {}) };
    delete prevCustomizations[wordKey];
    if (editingWord) {
      if (editingWord.id) delete prevCustomizations[editingWord.id];
      if (editingWord.kanji) delete prevCustomizations[editingWord.kanji];
    }
    onUpdateState({
      ...appState,
      vocabCustomizations: prevCustomizations
    });
  };

  const toggleVocabMastery = (id) => {
    const isMastered = !!appState.masteredVocab?.[id];
    const newMastered = {
      ...(appState.masteredVocab || {}),
      [id]: !isMastered
    };
    onUpdateState({
      ...appState,
      masteredVocab: newMastered
    });
  };

  const startSrsSession = () => {
    const queue = effectiveVocabList.filter(item => {
      const card = appState.masteredVocab?.[item.id];
      if (!card) return true; // aprender nueva
      if (typeof card === 'boolean') return true; // migrar
      return isDue(card); // repasar
    }).sort(() => Math.random() - 0.5); // barajar
    
    setSrsQueue(queue);
    setMode('srs');
  };

  const handleSrsReview = (item, rating) => {
    const currentCardData = appState.masteredVocab?.[item.id];
    const oldCard = (currentCardData && typeof currentCardData === 'object') 
      ? currentCardData 
      : getNewCard();
      
    const newCard = reviewCard(oldCard, rating);
    
    onUpdateState({
      ...appState,
      masteredVocab: {
        ...(appState.masteredVocab || {}),
        [item.id]: newCard
      }
    });
  };

  const handleSrsUndo = (item, prevCardData) => {
    const updated = { ...(appState.masteredVocab || {}) };
    if (prevCardData === undefined || prevCardData === null) {
      delete updated[item.id];
    } else {
      updated[item.id] = prevCardData;
    }
    onUpdateState({
      ...appState,
      masteredVocab: updated
    });
  };

  // Typing validation
  const currentTypingItem = filteredVocab[typingIndex] || filteredVocab[0];

  const handleValidateTyping = (forcedValue = null) => {
    if (!currentTypingItem) return;
    const inputVal = (typeof forcedValue === 'string' ? forcedValue : typingInput).trim();
    if (!inputVal) return;
    const targetKanji = (currentTypingItem.kanji || '').trim();
    const targetKana = (currentTypingItem.kana || currentTypingItem.hiragana || '').trim();

    const isMatch = inputVal === targetKanji || inputVal === targetKana;

    if (isMatch) {
      setTypingFeedback({
        type: 'correct',
        msg: `🎉 ¡Correcto! (+20 XP)`,
        target: `${targetKanji} (${targetKana})`
      });
      audioManager.speak(targetKana || targetKanji);

      // Record XP and streak
      const newXp = (appState.xp || 0) + 20;
      onUpdateState({
        ...appState,
        xp: newXp
      });

      setTimeout(() => {
        setTypingFeedback(null);
        setTypingInput('');
        setTypingIndex((prev) => (prev + 1) % Math.max(1, filteredVocab.length));
      }, 1600);
    } else {
      setTypingFeedback({
        type: 'wrong',
        msg: `Revisa la ortografía.`,
        target: `Respuesta esperada: ${targetKanji || targetKana} (${targetKana})`
      });
    }
  };

  const handleShowHint = () => {
    if (!currentTypingItem) return;
    const target = currentTypingItem.kana || currentTypingItem.kanji;
    if (target) {
      setTypingInput(target.charAt(0));
    }
  };

  // N4 Exercise Handler
  const [exerciseStatusFilter, setExerciseStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  const filteredN4Exercises = useMemo(() => {
    return n4Exercises.filter(ex => {
      const isCompleted = !!appState?.completedExercises?.[ex.id];
      if (exerciseStatusFilter === 'completed') return isCompleted;
      if (exerciseStatusFilter === 'pending') return !isCompleted;
      return true;
    });
  }, [n4Exercises, exerciseStatusFilter, appState?.completedExercises]);

  const n4CompletedCount = n4Exercises.filter(ex => !!appState?.completedExercises?.[ex.id]).length;
  const n4PendingCount = n4Exercises.length - n4CompletedCount;

  const currentExercise = filteredN4Exercises[exerciseIndex] || filteredN4Exercises[0] || null;

  const handleSelectExerciseOption = (opt) => {
    if (!currentExercise || exerciseAnswer) return;
    const isCorrect = opt === currentExercise.correct;
    setExerciseAnswer({ selected: opt, isCorrect });

    if (isCorrect) {
      const alreadyDone = !!appState?.completedExercises?.[currentExercise.id];
      const newXp = (appState.xp || 0) + (!alreadyDone ? 15 : 0);
      onUpdateState({
        ...appState,
        xp: newXp,
        completedExercises: {
          ...(appState.completedExercises || {}),
          [currentExercise.id]: true
        }
      });
      audioManager.speak(currentExercise.sentence);
    }
  };

  const handleNextExercise = () => {
    setExerciseAnswer(null);
    setExerciseIndex((prev) => (prev + 1) % Math.max(1, filteredN4Exercises.length));
  };

  const handlePrevExercise = () => {
    setExerciseAnswer(null);
    setExerciseIndex((prev) => (prev - 1 + Math.max(1, filteredN4Exercises.length)) % Math.max(1, filteredN4Exercises.length));
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="module-hero-card">
        <div className="module-hero-content">
          <div className="module-hero-title-row">
            <div 
              className="module-hero-icon-badge" 
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}
            >
              <Layers size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <span className="module-category-pill" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.12)' }}>
                  Recursos & Práctica
                </span>
                <button
                  type="button"
                  className="tour-info-shortcut-btn"
                  onClick={() => {
                    if (contextApp?.openTour) {
                      contextApp.openTour('vocab');
                    } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
                      window.__nihongoOpenTour('vocab');
                    }
                  }}
                  title="Ver guía y explicación del Banco Léxico y Pitch Accent"
                  aria-label="Información de Vocabulario"
                >
                  <Info size={14} />
                  <span>Guía</span>
                </button>
              </div>
              <h1 className="module-hero-title">Entrenador de Vocabulario</h1>
              <p className="module-hero-subtitle">
                Catálogo léxico con Pitch Accent, audio neuronal y ejercicios interactivos para dominar el vocabulario en todos los niveles JLPT.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Fuente: Recursos Propios vs Catálogo Masivo API */}
      <div className="source-selector-bar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-bento, 20px)',
        padding: '12px 18px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Fuente del Diccionario:
          </span>
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-main)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => handleToggleSource(false)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: !isMassive ? 700 : 500,
                background: !isMassive ? 'var(--primary)' : 'transparent',
                color: !isMassive ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>📖 Mis Recursos Propios</span>
              <span style={{
                background: !isMassive ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface)',
                color: !isMassive ? '#fff' : 'var(--text-muted)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {(vocabularyData || []).length} palabras
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleSource(true)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: isMassive ? 700 : 500,
                background: isMassive ? 'var(--primary)' : 'transparent',
                color: isMassive ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{authUser ? '🌐 Catálogo Masivo (API)' : '🔒 Catálogo Masivo (API)'}</span>
              <span style={{
                background: isMassive ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface)',
                color: isMassive ? '#fff' : 'var(--text-muted)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                +2,000 palabras
              </span>
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isMassive ? (
            <span>✨ Mostrando vocabulario curado de libros y cuadernos propios de estudio.</span>
          ) : (
            <span>🚀 Mostrando base de datos masiva poblada en Supabase ({vocabularyList.length} palabras).</span>
          )}
        </div>
      </div>

      {/* Main Mode Selector & Level Filter */}
      <div className="story-controls" style={{ marginBottom: 20 }}>
        <div className="reading-mode-selector">
          <button 
            className={`mode-btn ${mode === 'cards' ? 'active' : ''}`}
            onClick={() => {
              setMode('cards');
              updateParams('cards', level, category, searchTerm);
            }}
          >
            <Layers size={16} /> 🗂️ Tarjetas ({filteredVocab.length})
          </button>
          <button 
            className={`mode-btn ${mode === 'typing' ? 'active' : ''}`}
            onClick={() => {
              setMode('typing');
              setTypingFeedback(null);
              setTypingInput('');
              updateParams('typing', level, category, searchTerm);
            }}
          >
            <Keyboard size={16} /> ⌨️ Práctica Teclado IME
          </button>
          <button 
            className={`mode-btn ${mode === 'srs' ? 'active' : ''}`}
            onClick={() => {
              startSrsSession();
              updateParams('srs', level, category, searchTerm);
            }}
          >
            🧠 Repaso Espaciado (SRS)
          </button>
          <button 
            className={`mode-btn ${mode === 'n4_exercises' ? 'active' : ''}`}
            onClick={() => {
              setMode('n4_exercises');
              setExerciseAnswer(null);
              updateParams('n4_exercises', level, category, searchTerm);
            }}
          >
            <BookOpen size={16} /> 📝 Ejercicios de Contexto ({n4Exercises.length})
          </button>
        </div>

        {/* Level Filters */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Nivel:</span>
          {['all', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
            <button
              key={lvl}
              className={`btn ${level === lvl ? 'btn-primary' : 'btn-outline'} btn-sm`}
              style={{ minWidth: 42, padding: '4px 10px' }}
              onClick={() => {
                setLevel(lvl);
                setCategory('all');
                updateParams(mode, lvl, 'all', searchTerm);
              }}
            >
              {lvl === 'all' ? 'Todos' : lvl}
            </button>
          ))}
          {isLoading && (
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginLeft: 8 }}>
              ⚡ Cargando Supabase...
            </span>
          )}
        </div>
      </div>

      {/* MODE 1: VOCABULARY CARDS */}
      {mode === 'cards' && (
        <div>
          {/* Filter Bar */}
          <div className="vocab-filter-bar">
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="search-input" 
                style={{ paddingLeft: 38 }}
                placeholder="Buscar por kanji, kana, español o inglés..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateParams(mode, level, category, e.target.value);
                }}
              />
            </div>

            <select 
              className="filter-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                updateParams(mode, level, e.target.value, searchTerm);
              }}
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Todas las Categorías' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Chips & Action Row */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <button
              type="button"
              className={`btn btn-xs ${filterOnlyWithNotes ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterOnlyWithNotes(!filterOnlyWithNotes)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: '20px', padding: '4px 12px' }}
              title="Ver únicamente palabras que contienen notas de estudio personales"
            >
              <StickyNote size={13} />
              <span>Con Notas ({effectiveVocabList.filter(v => v.notes && v.notes.trim()).length})</span>
            </button>

            <button
              type="button"
              className={`btn btn-xs ${filterOnlyCustomized ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterOnlyCustomized(!filterOnlyCustomized)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: '20px', padding: '4px 12px' }}
              title="Ver palabras modificadas o personalizadas"
            >
              <Edit3 size={13} />
              <span>Personalizadas ({effectiveVocabList.filter(v => v.isCustomized).length})</span>
            </button>

            <button
              type="button"
              className={`btn btn-xs ${selectedWordIds.size > 0 ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setIsAIGeneratorOpen(true)}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 5, 
                borderRadius: '20px', 
                padding: '4px 12px',
                borderColor: 'var(--primary)',
                color: selectedWordIds.size > 0 ? '#fff' : 'var(--primary)',
                fontWeight: 600
              }}
              title="Generar historias u oraciones de ejemplo con IA usando palabras seleccionadas"
            >
              <Sparkles size={13} />
              <span>Generar con IA {selectedWordIds.size > 0 ? `(${selectedWordIds.size})` : ''}</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => setIsCreateModalOpen(true)}
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, borderColor: 'var(--primary)', color: 'var(--primary-light)' }}
              title="Registrar una nueva palabra con Kanji, Hiragana, Katakana y notas"
            >
              <Plus size={14} />
              <span>Nueva Palabra</span>
            </button>
          </div>

          <div style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>Mostrando <strong>{filteredVocab.length}</strong> palabras:</span>
              {selectedWordIds.size > 0 ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setSelectedWordIds(new Set())}
                  style={{ color: 'var(--danger)', fontSize: '0.8rem', padding: '2px 6px' }}
                >
                  Deseleccionar ({selectedWordIds.size})
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    const first5 = new Set(filteredVocab.slice(0, 5).map(v => v.id || v.kanji));
                    setSelectedWordIds(first5);
                  }}
                  style={{ color: 'var(--primary)', fontSize: '0.8rem', padding: '2px 6px' }}
                  title="Seleccionar rápidamente las primeras 5 palabras para IA"
                >
                  + Seleccionar 5 para IA
                </button>
              )}
            </div>
            <span>
              Dominadas: <strong>{filteredVocab.filter(v => appState.masteredVocab?.[v.id]).length}</strong> de {filteredVocab.length}
            </span>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="vocab-grid">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="vocab-card skeleton-shimmer skeleton-card" style={{ opacity: 0.75 }} />
              ))}
            </div>
          ) : (
            <div className="vocab-grid">
              {filteredVocab.slice(0, visibleCount).map((item) => {
              const isMastered = !!appState.masteredVocab?.[item.id];
              const wordKey = item.id || item.kanji;
              const isSelected = selectedWordIds.has(wordKey);
              return (
                <div 
                  key={item.id} 
                  className={`vocab-card ${isSelected ? 'selected-card' : ''}`}
                  style={{ 
                    borderColor: isSelected 
                      ? 'var(--primary)' 
                      : (isMastered ? 'var(--success)' : (item.isCustomized ? 'rgba(99, 102, 241, 0.4)' : 'var(--border)')),
                    background: isSelected ? 'var(--primary-bg, rgba(99, 102, 241, 0.04))' : undefined,
                    boxShadow: isSelected ? '0 0 0 1px var(--primary)' : undefined
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {/* Selector para Generador IA */}
                        <label 
                          style={{ 
                            cursor: 'pointer', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 4, 
                            padding: '1px 6px', 
                            borderRadius: '4px',
                            background: isSelected ? 'var(--primary)' : 'rgba(99, 102, 241, 0.08)',
                            color: isSelected ? '#fff' : 'var(--primary)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(99, 102, 241, 0.2)'
                          }}
                          title="Seleccionar para generar historia u oraciones con IA"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const next = new Set(selectedWordIds);
                              if (next.has(wordKey)) next.delete(wordKey);
                              else next.add(wordKey);
                              setSelectedWordIds(next);
                            }}
                            style={{ accentColor: 'var(--primary)', width: 13, height: 13, cursor: 'pointer' }}
                          />
                          <span>IA</span>
                        </label>

                        <span className="vocab-tag">{item.level} · {item.category}</span>
                        {item.isCustomized && (
                          <span 
                            style={{ 
                              fontSize: '0.72rem', 
                              background: 'rgba(99, 102, 241, 0.15)', 
                              color: 'var(--primary-light)', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontWeight: 600,
                              border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}
                            title="Esta palabra tiene modificaciones personalizadas"
                          >
                            ✏️ Editado
                          </span>
                        )}
                      </div>
                      <label style={{ cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <input 
                          type="checkbox"
                          checked={isMastered}
                          onChange={() => toggleVocabMastery(item.id)}
                          style={{ accentColor: 'var(--success)' }}
                        />
                        <span style={{ color: isMastered ? 'var(--success)' : 'var(--text-muted)', fontWeight: isMastered ? 700 : 500 }}>
                          {isMastered ? 'Dominada' : 'Repasar'}
                        </span>
                      </label>
                    </div>

                    <div className="vocab-kanji">
                      <span className="jp-text">{item.kanji}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button 
                          type="button"
                          className="audio-btn" 
                          style={{ width: 32, height: 32 }}
                          onClick={() => audioManager.speak(item.kana || item.hiragana || item.kanji)}
                          title="Escuchar pronunciación"
                        >
                          <Volume2 size={16} />
                        </button>
                        <SpeechPractice 
                          targetText={item.kanji} 
                          targetKana={item.kana || item.hiragana} 
                          compact={true} 
                        />
                        <button
                          type="button"
                          className="audio-btn"
                          style={{ width: 32, height: 32 }}
                          onClick={() => {
                            if (contextApp?.openPracticePad) {
                              contextApp.openPracticePad({
                                text: item.kanji,
                                kana: item.kana || item.hiragana,
                                title: `Vocabulario: ${item.kanji} (${item.meaning_es})`,
                                source: 'vocab'
                              });
                            } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                              window.__nihongoOpenPracticePad({
                                text: item.kanji,
                                kana: item.kana || item.hiragana,
                                title: `Vocabulario: ${item.kanji} (${item.meaning_es})`,
                                source: 'vocab'
                              });
                            }
                          }}
                          title="Practicar caligrafía y trazos en el Cuaderno"
                        >
                          <PenTool size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="vocab-kana jp-text">
                      {item.kana || item.hiragana || ''}
                      {item.katakana && item.katakana !== (item.kana || item.hiragana) && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 8, fontWeight: 400 }}>
                          · {item.katakana}
                        </span>
                      )}
                    </div>

                    {/* Curva Visual SVG de Pitch Accent */}
                    <div style={{ marginTop: 8, marginBottom: 4 }}>
                      <PitchAccent 
                        word={item.kanji} 
                        reading={item.kana || item.hiragana} 
                        mode="full" 
                        size="sm" 
                      />
                    </div>
                  </div>

                  <div className="vocab-meanings">
                    <div className="vocab-es">🇪🇸 {item.meaning_es}</div>
                    {item.meaning_en && <div className="vocab-en">🇬🇧 {item.meaning_en}</div>}

                    {item.literal_translation && (
                      <div style={{ marginTop: 4, fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="literal-tag">Literal</span>
                        <span>&ldquo;{item.literal_translation}&rdquo;</span>
                      </div>
                    )}

                    {item.breakdown && (
                      <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', background: 'rgba(255, 255, 255, 0.03)', padding: '4px 8px', borderRadius: '6px', border: '1px dashed var(--border)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>🧩 Desglose: </span>
                        <span>{item.breakdown}</span>
                      </div>
                    )}

                    {item.example_sentence && (
                      <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600 }} className="jp-text">
                            {item.example_sentence}
                          </span>
                          <button
                            type="button"
                            className="tts-btn-small"
                            onClick={() => audioManager.speak(item.example_sentence)}
                            title="Escuchar frase de ejemplo"
                            style={{ padding: '2px 5px', height: 'auto', width: 'auto' }}
                          >
                            <Volume2 size={13} />
                          </button>
                        </div>
                        {item.example_reading && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }} className="jp-text">
                            {item.example_reading}
                          </div>
                        )}
                        {item.example_translation && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', marginTop: 2 }}>
                            {item.example_translation}
                          </div>
                        )}
                      </div>
                    )}

                    {item.polite_masu && (
                      <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--primary)', background: 'var(--primary-bg)', padding: '4px 8px', borderRadius: '4px' }}>
                        Forma ます: <strong className="jp-text">{item.polite_masu}</strong> | て: <strong className="jp-text">{item.te_form}</strong>
                      </div>
                    )}

                    {/* Nota de Estudio Personal */}
                    {item.notes && (
                      <div style={{
                        marginTop: 10,
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        fontSize: '0.84rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--amber-700, #b45309)', fontWeight: 700, fontSize: '0.78rem', marginBottom: 3 }}>
                          <StickyNote size={13} />
                          <span>Nota de Estudio:</span>
                        </div>
                        <div style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                          {item.notes}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Action Row */}
                  <div style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      onClick={() => setEditingWord(item)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', padding: '4px 8px' }}
                      title="Modificar cómo se escribe esta palabra o agregar/editar notas"
                    >
                      <Edit3 size={13} />
                      <span>{item.notes ? 'Editar / Notas' : '+ Nota / Editar'}</span>
                    </button>

                    {item.isCustomized && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleResetWordEdit(item.id || item.kanji)}
                        style={{ color: 'var(--text-muted)', fontSize: '0.75rem', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        title="Restablecer palabra a su valor original"
                      >
                        <RotateCcw size={12} />
                        <span>Restaurar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

          {visibleCount < filteredVocab.length && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 16 }}>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => setVisibleCount(prev => Math.min(prev + 36, filteredVocab.length))}
                style={{ padding: '8px 24px', borderRadius: '24px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                <span>Mostrar más palabras ({visibleCount} de {filteredVocab.length})</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {filteredVocab.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1rem', marginBottom: 12 }}>No se encontraron palabras con los filtros aplicados.</p>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                onClick={() => {
                  setLevel('all');
                  setCategory('all');
                  setSearchTerm('');
                  setFilterOnlyWithNotes(false);
                  setFilterOnlyCustomized(false);
                  updateParams(mode, 'all', 'all', '');
                }}
              >
                Restablecer filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: JAPANESE IME TYPING CHALLENGE */}
      {mode === 'typing' && currentTypingItem && (
        <div className="quiz-container" style={{ maxWidth: 680 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span className="vocab-tag">{currentTypingItem.level} · {currentTypingItem.category}</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Palabra {typingIndex + 1} de {filteredVocab.length}
            </span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              {currentTypingItem.meaning_es}
            </div>
            {currentTypingItem.meaning_en && (
              <div style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                ({currentTypingItem.meaning_en})
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              <button 
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => audioManager.speak(currentTypingItem.kana || currentTypingItem.hiragana || currentTypingItem.kanji)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Volume2 size={16} /> Escuchar
              </button>
              <SpeechPractice 
                targetText={currentTypingItem.kanji} 
                targetKana={currentTypingItem.kana || currentTypingItem.hiragana} 
                onMatch={() => {
                  const targetVal = currentTypingItem.kana || currentTypingItem.hiragana || currentTypingItem.kanji;
                  if (targetVal) {
                    setTypingInput(targetVal);
                    handleValidateTyping(targetVal);
                  }
                }}
              />
            </div>
          </div>

          <div className="typing-box" style={{ marginTop: 16 }}>
            <div className="typing-prompt">
              <span>🇯🇵 Escribe en japonés (Hiragana o Kanji):</span>
              <span className="ime-badge">Teclado IME Activo</span>
            </div>

            <div className="typing-input-row">
              <input 
                type="text" 
                className="japanese-input jp-text"
                placeholder="Escribe en romaji (se convertirá a hiragana)..."
                value={typingInput}
                onChange={(e) => {
                  const val = e.target.value;
                  const converted = wanakana.toKana(val, { IMEMode: true });
                  setTypingInput(converted);
                }}
                onCompositionStart={() => { isComposingRef.current = true; }}
                onCompositionEnd={() => { isComposingRef.current = false; }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isComposingRef.current) {
                    handleValidateTyping();
                  }
                }}
                autoFocus
              />
              <button className="btn btn-primary" onClick={handleValidateTyping}>
                Validar
              </button>
              <button className="btn btn-outline" onClick={handleShowHint} title="Revelar primer carácter">
                <Lightbulb size={16} /> Pista
              </button>
            </div>

            {typingFeedback && (
              <div className={`typing-feedback ${typingFeedback.type}`}>
                <div>{typingFeedback.msg}</div>
                {typingFeedback.target && (
                  <div className="jp-text" style={{ fontSize: '1.15rem', marginTop: 4 }}>
                    {typingFeedback.target}
                  </div>
                )}
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                  <PitchAccent 
                    word={currentTypingItem.kanji} 
                    reading={currentTypingItem.kana} 
                    mode="compact" 
                    size="sm" 
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => {
                setTypingFeedback(null);
                setTypingInput('');
                setTypingIndex((prev) => (prev - 1 + filteredVocab.length) % filteredVocab.length);
              }}
            >
              <ArrowLeft size={16} /> Anterior
            </button>

            <button 
              className="btn btn-outline btn-sm"
              onClick={() => {
                setTypingFeedback(null);
                setTypingInput('');
                setTypingIndex((prev) => (prev + 1) % filteredVocab.length);
              }}
            >
              Siguiente <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* MODE: SRS REVIEW */}
      {mode === 'srs' && (
        <SrsReview 
          queue={srsQueue}
          onRate={handleSrsReview}
          onUndo={handleSrsUndo}
          getCurrentCard={(item) => appState.masteredVocab?.[item.id]}
          onExit={() => {
            setMode('cards');
            updateParams('cards', level, category, searchTerm);
          }}
          backLabel="Volver a Vocabulario"
          renderFront={(item) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="vocab-tag" style={{ fontWeight: 700 }}>{item.level || 'N5'}</span>
                {item.category && (
                  <span style={{ fontSize: '0.78rem', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {item.category}
                  </span>
                )}
                {item.type && (
                  <span style={{ fontSize: '0.78rem', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    {item.type}
                  </span>
                )}
              </div>

              <div className="vocab-kanji" style={{ fontSize: '4.8rem', lineHeight: 1.15, margin: '8px 0 16px 0' }}>
                <span className="jp-text">{item.kanji}</span>
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                ¿Recuerdas la lectura en Kana y el significado en español?
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                <button 
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioManager.speak(item.kana || item.hiragana || item.kanji);
                  }}
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                  title="Escuchar audio de lectura"
                >
                  <Volume2 size={14} /> Pista de Audio
                </button>
              </div>
            </div>
          )}
          renderBack={(item) => (
            <>
              <div className="vocab-kana jp-text" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 12, color: 'var(--primary)' }}>
                {item.kana || item.hiragana || ''}
                {item.romaji && (
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 8 }}>
                    ({item.romaji})
                  </span>
                )}
              </div>

              {/* Pitch Accent Visual Curve en SRS */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <PitchAccent 
                  word={item.kanji} 
                  reading={item.kana || item.hiragana} 
                  mode="full" 
                  size="md" 
                  showAudio={true} 
                />
              </div>

              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                🇪🇸 {item.meaning_es}
              </div>
              {item.meaning_en && (
                <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  🇬🇧 {item.meaning_en}
                </div>
              )}

              {/* Herramientas de audio y pronunciación */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 16, marginBottom: 16 }}>
                <button 
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => audioManager.speak(item.kana || item.hiragana || item.kanji)}
                >
                  <Volume2 size={16} /> Escuchar
                </button>
                <SpeechPractice 
                  targetText={item.kanji} 
                  targetKana={item.kana || item.hiragana} 
                  acceptableReadings={[item.kana, item.hiragana, item.katakana].filter(Boolean)}
                />
                {contextApp?.openPracticePad && (
                  <button 
                    type="button"
                    className="btn btn-outline btn-sm" 
                    onClick={() => {
                      contextApp.openPracticePad({
                        text: item.kanji,
                        kana: item.kana || item.hiragana,
                        title: `Palabra: ${item.kanji} (${item.meaning_es})`,
                        source: 'vocab',
                        initialChar: item.kanji?.[0]
                      });
                    }}
                    title="Abrir en Cuaderno de Cuadrícula y Caligrafía"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <PenTool size={14} /> Cuaderno
                  </button>
                )}
              </div>

              {/* Tatoeba Sentences Integration */}
              {item.tatoeba_sentences && item.tatoeba_sentences.length > 0 && (
                <div style={{ marginTop: 20, textAlign: 'left', background: 'var(--bg-surface)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    📚 Ejemplos en Contexto (Tatoeba):
                  </div>
                  {item.tatoeba_sentences.map((sentence, idx) => (
                    <div key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: idx === item.tatoeba_sentences.length - 1 ? 'none' : '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, flexShrink: 0 }}>
                          <button 
                            type="button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            onClick={() => audioManager.speak(sentence.jp)}
                            title="Escuchar ejemplo"
                          >
                            <Volume2 size={16} />
                          </button>
                          <SpeechPractice 
                            targetText={sentence.jp} 
                            compact={true} 
                          />
                        </div>
                        <div>
                          <div className="jp-text" style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 600 }}>{sentence.jp}</div>
                          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>🇪🇸 {sentence.es}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        />
      )}

      {/* MODE 3: N4 CONTEXT EXERCISES */}
      {mode === 'n4_exercises' && (
        <div className="quiz-container" style={{ maxWidth: 720 }}>
          {/* Status filter bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado:</span>
              {[
                { id: 'all', label: `Todos (${n4Exercises.length})` },
                { id: 'pending', label: `Pendientes (${n4PendingCount})` },
                { id: 'completed', label: `Superados (${n4CompletedCount})` }
              ].map(st => (
                <button
                  key={st.id}
                  className={`btn btn-sm ${exerciseStatusFilter === st.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setExerciseStatusFilter(st.id);
                    setExerciseIndex(0);
                    setExerciseAnswer(null);
                  }}
                  style={{ fontSize: '0.8rem', padding: '4px 10px', height: 'auto' }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {currentExercise && (
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Ejercicio {exerciseIndex + 1} de {filteredN4Exercises.length}
              </span>
            )}
          </div>

          {!currentExercise ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🎉</div>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                {exerciseStatusFilter === 'pending'
                  ? '¡Excelente trabajo! Has completado todos los ejercicios de contexto N4.'
                  : 'No hay ejercicios en esta categoría.'}
              </p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setExerciseStatusFilter('all');
                  setExerciseIndex(0);
                  setExerciseAnswer(null);
                }}
              >
                Ver todos los ejercicios
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="vocab-tag">N4 · Ejercicio en Contexto</span>
                {appState?.completedExercises?.[currentExercise.id] && (
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
                    ✓ Superado (+15 XP)
                  </span>
                )}
              </div>

              <div className="quiz-question-box">
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  🇪🇸 {currentExercise.prompt_es}
                </p>

                <div className="quiz-sentence jp-text" style={{ fontSize: '1.4rem', lineHeight: 2, marginBottom: 14 }}>
                  {currentExercise.masked}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Elige la opción correcta para completar la oración:
                </p>
              </div>

              {/* Options Grid */}
              <div className="quiz-options-grid">
                {currentExercise.options.map((opt) => {
                  const isSelected = exerciseAnswer?.selected === opt;
                  const isCorrectTarget = opt === currentExercise.correct;
                  let btnClass = 'quiz-option-btn jp-text';
                  if (exerciseAnswer) {
                    if (isCorrectTarget) btnClass += ' correct';
                    else if (isSelected && !exerciseAnswer.isCorrect) btnClass += ' wrong';
                  }

                  return (
                    <button
                      key={opt}
                      className={btnClass}
                      onClick={() => handleSelectExerciseOption(opt)}
                      disabled={!!exerciseAnswer}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Explanation */}
              {exerciseAnswer && (
                <div 
                  style={{ 
                    marginTop: 20, 
                    padding: '16px 20px', 
                    borderRadius: 'var(--radius-md)', 
                    background: exerciseAnswer.isCorrect ? 'var(--success-bg)' : 'var(--danger-bg)',
                    border: `1px solid ${exerciseAnswer.isCorrect ? 'var(--success)' : 'var(--danger)'}`
                  }}
                >
                  <div style={{ fontWeight: 700, color: exerciseAnswer.isCorrect ? 'var(--success)' : 'var(--danger)', marginBottom: 6 }}>
                    {exerciseAnswer.isCorrect ? '🎉 ¡Excelente! (+15 XP)' : `❌ Respuesta correcta: ${currentExercise.correct}`}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: 8 }}>
                    {currentExercise.explanation}
                  </div>
                  <div className="jp-text" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span>{currentExercise.sentence}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button 
                        type="button"
                        className="audio-btn" 
                        style={{ width: 30, height: 30 }}
                        onClick={() => audioManager.speak(currentExercise.sentence)}
                        title="Escuchar oración completa"
                      >
                        <Volume2 size={16} />
                      </button>
                      <SpeechPractice 
                        targetText={currentExercise.sentence} 
                        compact={true} 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button className="btn btn-outline btn-sm" onClick={handlePrevExercise}>
                  <ArrowLeft size={16} /> Anterior
                </button>
                <button className="btn btn-outline btn-sm" onClick={handleNextExercise}>
                  Siguiente <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para Editar Palabra y Agregar Notas */}
      {editingWord && (
        <EditWordModal
          isOpen={Boolean(editingWord)}
          onClose={() => setEditingWord(null)}
          word={editingWord}
          onSave={handleSaveWordEdit}
          onReset={handleResetWordEdit}
          isCustomized={Boolean(editingWord.isCustomized)}
        />
      )}

      {/* Modal para Crear Nueva Palabra */}
      <SaveVocabModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialData={{ type: 'word', source: 'Entrenador de Vocabulario' }}
        appState={appState}
        onUpdateState={onUpdateState}
      />

      {/* Floating Action Bar cuando hay palabras seleccionadas */}
      {selectedWordIds.size > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 900,
          background: 'var(--surface)',
          border: '2px solid var(--primary)',
          borderRadius: 16,
          padding: '10px 18px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.28)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          backdropFilter: 'blur(12px)',
          maxWidth: '92%',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: 'var(--primary)',
              color: '#fff',
              borderRadius: 999,
              padding: '2px 9px',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              {selectedWordIds.size}
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {selectedWordIds.size === 1 ? 'palabra seleccionada' : 'palabras seleccionadas'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 280, overflow: 'hidden' }}>
            {Array.from(selectedWordIds).slice(0, 4).map(id => {
              const w = effectiveVocabList.find(x => (x.id === id || x.kanji === id));
              return w ? (
                <span key={id} className="jp-text" style={{ fontSize: '0.82rem', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                  {w.kanji}
                </span>
              ) : null;
            })}
            {selectedWordIds.size > 4 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>+{selectedWordIds.size - 4} más</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setAiGenType('conversation');
                setIsAIGeneratorOpen(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              title="Generar un diálogo personalizado con las palabras seleccionadas"
            >
              <MessageSquare size={14} />
              <span>Diálogo</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setAiGenType('story');
                setIsAIGeneratorOpen(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
              title="Generar historia con las palabras seleccionadas"
            >
              <Sparkles size={15} />
              <span>Historia</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedWordIds(new Set())}
              style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Modal Generador con IA */}
      <AIGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        initialType={aiGenType}
        initialItems={selectedWordsForAI}
        itemType="vocab"
        defaultLevel={level}
        appState={appState}
        onUpdateState={onUpdateState}
        authUser={authUser}
      />
    </div>
  );
}
