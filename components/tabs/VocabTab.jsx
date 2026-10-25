'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  Volume2, Search, ArrowRight, ArrowLeft, Lightbulb, Keyboard, 
  BookOpen, Layers, Edit3, StickyNote, Plus, RotateCcw, Sparkles, 
  MessageSquare, PenTool, Info, CheckCircle2, Brain, Tag, X, Filter 
} from 'lucide-react';
import dynamic from 'next/dynamic';
import audioManager from '../../lib/audioManager';
import vocabularyData from '../../data/vocabulary.json';
import exercisesData from '../../data/exercises.json';
import * as wanakana from 'wanakana';
import { getNewCard, reviewCard, isDue, ensureFsrsCard } from '../../lib/srs';
import PitchAccent from '../features/PitchAccent';
import { getVocabularyFromSupabase } from '../../lib/supabaseData';
import { useApp } from '../../lib/AppContext';
import { getAuthSession } from '../../lib/supabaseSync';
import TerminologyTooltip from '../common/TerminologyTooltip';
import { triggerCheerConfetti } from '../../lib/confetti';
import { 
  getVocabTags, 
  addTagToVocab, 
  removeTagFromVocab, 
  getAllUniqueVocabTags, 
  POPULAR_VOCAB_TAG_SUGGESTIONS,
  getWordKey
} from '../../lib/vocabTags';

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
  
  // Normalizar modo inicial: 'study' o 'typing' abren el modo de estudio
  const resolvedInitialMode = (initialMode === 'typing' || initialMode === 'study') ? 'study' : (initialMode || 'cards');
  const [mode, setMode] = useState(resolvedInitialMode); // 'cards' | 'study' | 'srs' | 'n4_exercises'
  const [level, setLevel] = useState(initialLevel || 'all'); // 'all' | 'N5' | 'N4' | ...
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'learned' | 'unlearned'
  const [selectedTag, setSelectedTag] = useState(initialCategory || 'all');
  const [areTagsExpanded, setAreTagsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');

  useEffect(() => {
    if (initialMode) {
      if (initialMode === 'typing' || initialMode === 'study') setMode('study');
      else if (['cards', 'srs', 'n4_exercises'].includes(initialMode)) setMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialLevel && ['all', 'N5', 'N4', 'N3', 'N2', 'N1'].includes(initialLevel)) {
      setLevel(initialLevel);
    }
  }, [initialLevel]);

  useEffect(() => {
    if (initialCategory) {
      setSelectedTag(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch !== null && initialSearch !== undefined) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const updateParams = (newMode, newLevel, newTag, newSearch) => {
    if (onParamsChange) {
      onParamsChange({
        mode: newMode !== undefined ? newMode : mode,
        level: newLevel !== undefined ? newLevel : level,
        category: newTag !== undefined ? newTag : selectedTag,
        search: newSearch !== undefined ? newSearch : searchTerm
      });
    }
  };

  // Study Mode state (muestra solo palabras por aprender)
  const [studyIndex, setStudyIndex] = useState(0);
  const [studyInput, setStudyInput] = useState('');
  const [studyFeedback, setStudyFeedback] = useState(null);
  const isComposingRef = useRef(false);

  // N4 Exercises state
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [exerciseAnswer, setExerciseAnswer] = useState(null);
  const [exerciseStatusFilter, setExerciseStatusFilter] = useState('all');

  // SRS state
  const [srsQueue, setSrsQueue] = useState([]);

  // Word Editing & Notes State
  const [editingWord, setEditingWord] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterOnlyWithNotes, setFilterOnlyWithNotes] = useState(false);
  const [filterOnlyCustomized, setFilterOnlyCustomized] = useState(false);

  // Tag Editor Modal State
  const [tagEditorWord, setTagEditorWord] = useState(null);
  const [newTagInput, setNewTagInput] = useState('');

  // AI Content Generator & Multi-selection State
  const [selectedWordIds, setSelectedWordIds] = useState(new Set());
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [aiGenType, setAiGenType] = useState('story');

  // Carga unificada de catálogo global
  const [vocabularyList, setVocabularyList] = useState(vocabularyData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(36);

  useEffect(() => {
    let isMounted = true;
    if (authUser) {
      setIsLoading(true);
      getVocabularyFromSupabase({ level, authUser })
        .then(data => {
          if (isMounted && data && data.length > 0) {
            setVocabularyList(data);
          }
        })
        .catch(err => console.error("Error cargando vocabulario global:", err))
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      const list = vocabularyData || [];
      setVocabularyList(level === 'all' ? list : list.filter(k => k.level === level));
      setIsLoading(false);
    }
    return () => { isMounted = false; };
  }, [level, authUser]);

  // Reset de ventana visible cuando cambian filtros o búsqueda
  useEffect(() => {
    setVisibleCount(36);
  }, [searchTerm, level, statusFilter, selectedTag, mode]);

  const n4Exercises = exercisesData || [];

  // Merge vocabulary con personalizaciones y palabras agregadas por el usuario
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

  // Contadores de progreso y maestría
  const isWordMastered = (item) => {
    if (!item) return false;
    return Boolean(
      (item.id && appState.masteredVocab?.[item.id]) ||
      (item.kanji && appState.masteredVocab?.[item.kanji])
    );
  };

  const masteredCount = useMemo(() => {
    return effectiveVocabList.filter(item => isWordMastered(item)).length;
  }, [effectiveVocabList, appState.masteredVocab]);

  const unlearnedCount = useMemo(() => {
    return Math.max(0, effectiveVocabList.length - masteredCount);
  }, [effectiveVocabList.length, masteredCount]);

  const progressPercent = Math.round((masteredCount / Math.max(1, effectiveVocabList.length)) * 100);

  // Palabras aprendidas que están vencidas para repaso espaciado
  const dueLearnedVocab = useMemo(() => {
    return effectiveVocabList.filter(item => {
      const card = (item.id && appState.masteredVocab?.[item.id]) || (item.kanji && appState.masteredVocab?.[item.kanji]);
      if (!card) return false;
      return isDue(card);
    });
  }, [effectiveVocabList, appState.masteredVocab]);

  // Etiquetas disponibles (combina categorías nativas + etiquetas personalizadas)
  const availableTags = useMemo(() => {
    return getAllUniqueVocabTags(effectiveVocabList, appState?.vocabTags);
  }, [effectiveVocabList, appState?.vocabTags]);

  // Filtrado de vocabulario para la vista de tarjetas
  const filteredVocab = useMemo(() => {
    return effectiveVocabList.filter(item => {
      // Filtro de Nivel
      if (level !== 'all' && item.level !== level) return false;

      // Filtro por Estado: Aprendidas o Por Aprender
      const isMastered = isWordMastered(item);
      if (statusFilter === 'learned' && !isMastered) return false;
      if (statusFilter === 'unlearned' && isMastered) return false;

      // Filtro por Etiqueta
      if (selectedTag !== 'all') {
        const tags = getVocabTags(item, appState?.vocabTags);
        if (!tags.includes(selectedTag)) return false;
      }

      // Filtros rápidos
      if (filterOnlyWithNotes && (!item.notes || !item.notes.trim())) return false;
      if (filterOnlyCustomized && !item.isCustomized) return false;

      // Búsqueda
      const search = searchTerm.trim().toLowerCase();
      if (!search) return true;
      return (
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
        (item.notes && item.notes.toLowerCase().includes(search))
      );
    });
  }, [effectiveVocabList, level, statusFilter, selectedTag, filterOnlyWithNotes, filterOnlyCustomized, searchTerm, appState?.masteredVocab, appState?.vocabTags]);

  const selectedWordsForAI = useMemo(() => {
    if (selectedWordIds.size === 0) {
      return filteredVocab.slice(0, 5);
    }
    return Array.from(selectedWordIds).map(id => {
      return effectiveVocabList.find(x => (x.id === id || x.kanji === id)) || { kanji: id, kana: '', meaning_es: '' };
    });
  }, [selectedWordIds, effectiveVocabList, filteredVocab]);

  // Alternar palabra aprendida / por aprender
  const toggleVocabMastery = (item) => {
    const key = item.id || item.kanji;
    const isMastered = isWordMastered(item);
    const updatedMastered = { ...(appState.masteredVocab || {}) };

    if (isMastered) {
      if (item.id) delete updatedMastered[item.id];
      if (item.kanji) delete updatedMastered[item.kanji];
      onUpdateState({
        ...appState,
        masteredVocab: updatedMastered
      });
    } else {
      updatedMastered[key] = getNewCard();
      if (item.id && item.kanji && item.id !== item.kanji) {
        updatedMastered[item.kanji] = updatedMastered[key];
      }
      const newXp = (appState.xp || 0) + 20;
      triggerCheerConfetti();
      onUpdateState({
        ...appState,
        xp: newXp,
        masteredVocab: updatedMastered
      });
    }
  };

  // Iniciar Repaso SRS (solo con palabras aprendidas)
  const startSrsSession = (forceAll = false) => {
    const learnedWords = effectiveVocabList.filter(item => isWordMastered(item));

    if (learnedWords.length === 0) {
      if (contextApp?.showAlert) {
        contextApp.showAlert({
          type: 'info',
          title: 'Sin Vocabulario Aprendido',
          message: 'Aún no has marcado palabras como aprendidas. Usa "Estudiar Vocabulario" para aprender tus primeras palabras y sumarlas al repaso espaciado.'
        });
      }
      return;
    }

    const queue = forceAll
      ? [...learnedWords].sort(() => Math.random() - 0.5)
      : learnedWords.filter(item => {
          const card = (item.id && appState.masteredVocab?.[item.id]) || (item.kanji && appState.masteredVocab?.[item.kanji]);
          return isDue(card);
        }).sort(() => Math.random() - 0.5);

    if (queue.length === 0) {
      if (contextApp?.showAlert) {
        contextApp.showAlert({
          type: 'success',
          title: '¡Estás al día con el SRS!',
          message: `Has repasado todas tus ${learnedWords.length} palabras aprendidas. El algoritmo FSRS avisará cuando toque repasar. ¿Deseas repasarlas todas de todos modos?`,
          actionLabel: 'Repasar de todos modos',
          onAction: () => startSrsSession(true)
        });
      } else {
        setSrsQueue(learnedWords.sort(() => Math.random() - 0.5));
        setMode('srs');
        updateParams('srs', level, selectedTag, searchTerm);
      }
      return;
    }

    setSrsQueue(queue);
    setMode('srs');
    updateParams('srs', level, selectedTag, searchTerm);
  };

  const handleSrsReview = (item, rating) => {
    const key = item.id || item.kanji;
    const currentCardData = (item.id && appState.masteredVocab?.[item.id]) || (item.kanji && appState.masteredVocab?.[item.kanji]);
    const oldCard = (currentCardData && typeof currentCardData === 'object') 
      ? currentCardData 
      : getNewCard();
      
    const newCard = reviewCard(oldCard, rating);
    const newXp = (appState.xp || 0) + 10;
    
    onUpdateState({
      ...appState,
      xp: newXp,
      masteredVocab: {
        ...(appState.masteredVocab || {}),
        [key]: newCard
      }
    });
  };

  const handleSrsUndo = (item, prevCardData) => {
    const key = item.id || item.kanji;
    const updated = { ...(appState.masteredVocab || {}) };
    if (prevCardData === undefined || prevCardData === null) {
      delete updated[key];
      if (item.id) delete updated[item.id];
      if (item.kanji) delete updated[item.kanji];
    } else {
      updated[key] = prevCardData;
    }
    onUpdateState({
      ...appState,
      masteredVocab: updated
    });
  };

  // MODO ESTUDIAR VOCABULARIO (Solo las que faltan por aprender)
  const studyItems = useMemo(() => {
    return effectiveVocabList.filter(item => {
      // Filtrar estrictamente solo las palabras no aprendidas
      if (isWordMastered(item)) return false;

      // Respetar nivel y etiqueta seleccionados si aplican
      if (level !== 'all' && item.level !== level) return false;
      if (selectedTag !== 'all') {
        const tags = getVocabTags(item, appState?.vocabTags);
        if (!tags.includes(selectedTag)) return false;
      }
      return true;
    });
  }, [effectiveVocabList, appState?.masteredVocab, level, selectedTag]);

  const currentStudyItem = studyItems[studyIndex];

  // Marcar como aprendida directamente dentro del modo estudio
  const handleMarkLearnedFromStudy = (item) => {
    if (!item) return;
    const key = item.id || item.kanji;
    const updatedMastered = {
      ...(appState.masteredVocab || {}),
      [key]: getNewCard()
    };
    if (item.id && item.kanji && item.id !== item.kanji) {
      updatedMastered[item.kanji] = updatedMastered[key];
    }
    const newXp = (appState.xp || 0) + 20;
    triggerCheerConfetti();
    onUpdateState({
      ...appState,
      xp: newXp,
      masteredVocab: updatedMastered
    });

    setStudyFeedback({
      type: 'correct',
      msg: '🎉 ¡Palabra aprendida! Añadida a tu cola de Repaso SRS (+20 XP)',
      target: item.kanji || item.kana
    });

    setTimeout(() => {
      setStudyFeedback(null);
      setStudyInput('');
      if (studyIndex >= studyItems.length - 1) {
        setStudyIndex(0);
      }
    }, 1200);
  };

  const handleValidateStudyTyping = (forcedValue = null) => {
    if (!currentStudyItem) return;
    const inputVal = (typeof forcedValue === 'string' ? forcedValue : studyInput).trim();
    if (!inputVal) return;
    const targetKanji = (currentStudyItem.kanji || '').trim();
    const targetKana = (currentStudyItem.kana || currentStudyItem.hiragana || '').trim();

    const isMatch = inputVal === targetKanji || inputVal === targetKana;

    if (isMatch) {
      setStudyFeedback({
        type: 'correct',
        msg: `🎉 ¡Correcto! (+20 XP)`,
        target: `${targetKanji} (${targetKana})`
      });
      audioManager.speak(targetKana || targetKanji);

      // Marcar como aprendida automáticamente al acertar
      const key = currentStudyItem.id || currentStudyItem.kanji;
      const updatedMastered = {
        ...(appState.masteredVocab || {}),
        [key]: getNewCard()
      };
      if (currentStudyItem.id && currentStudyItem.kanji && currentStudyItem.id !== currentStudyItem.kanji) {
        updatedMastered[currentStudyItem.kanji] = updatedMastered[key];
      }
      const newXp = (appState.xp || 0) + 20;
      triggerCheerConfetti();
      onUpdateState({
        ...appState,
        xp: newXp,
        masteredVocab: updatedMastered
      });

      setTimeout(() => {
        setStudyFeedback(null);
        setStudyInput('');
        if (studyIndex >= studyItems.length - 1) {
          setStudyIndex(0);
        }
      }, 1500);
    } else {
      setStudyFeedback({
        type: 'wrong',
        msg: `Lectura esperada en japonés:`,
        target: `${targetKanji || targetKana} (${targetKana})`
      });
    }
  };

  const handleStudyHint = () => {
    if (!currentStudyItem) return;
    const target = currentStudyItem.kana || currentStudyItem.hiragana || currentStudyItem.kanji;
    if (target) {
      setStudyInput(target.charAt(0));
    }
  };

  // Gestión de Etiquetas (Tags)
  const handleAddTagToCurrent = (tag) => {
    if (!tagEditorWord || !tag || !tag.trim()) return;
    const updated = addTagToVocab(tagEditorWord, tag, appState?.vocabTags);
    onUpdateState({
      ...appState,
      vocabTags: updated
    });
    setNewTagInput('');
  };

  const handleRemoveTagFromCurrent = (tag) => {
    if (!tagEditorWord || !tag) return;
    const updated = removeTagFromVocab(tagEditorWord, tag, appState?.vocabTags);
    onUpdateState({
      ...appState,
      vocabTags: updated
    });
  };

  // Guardar edición de palabra
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

  // Manejador de Ejercicios N4
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

  return (
    <div className="section-panel active">
      {/* Header Limpio sin exceso de texto */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Modo Principal: Tarjetas, Estudiar, SRS y Ejercicios */}
      <div className="story-controls" style={{ marginBottom: 16 }}>
        <div className="reading-mode-selector">
          <button 
            type="button"
            className={`mode-btn ${mode === 'cards' ? 'active' : ''}`}
            onClick={() => {
              setMode('cards');
              updateParams('cards', level, selectedTag, searchTerm);
            }}
          >
            <Layers size={16} />
            <span>🗂️ Tarjetas ({filteredVocab.length})</span>
          </button>
          
          <button 
            type="button"
            className={`mode-btn ${mode === 'study' ? 'active' : ''}`}
            onClick={() => {
              setMode('study');
              setStudyFeedback(null);
              setStudyInput('');
              updateParams('study', level, selectedTag, searchTerm);
            }}
          >
            <BookOpen size={16} />
            <span>📖 Estudiar ({unlearnedCount})</span>
          </button>

          <button 
            type="button"
            className={`mode-btn ${mode === 'srs' ? 'active' : ''}`}
            onClick={() => {
              startSrsSession(false);
              updateParams('srs', level, selectedTag, searchTerm);
            }}
          >
            <Brain size={16} />
            <span>🧠 Repaso SRS {dueLearnedVocab.length > 0 ? `(${dueLearnedVocab.length})` : ''}</span>
          </button>

          <button 
            type="button"
            className={`mode-btn ${mode === 'n4_exercises' ? 'active' : ''}`}
            onClick={() => {
              setMode('n4_exercises');
              setExerciseAnswer(null);
              updateParams('n4_exercises', level, selectedTag, searchTerm);
            }}
          >
            <PenTool size={16} />
            <span>📝 Ejercicios ({n4Exercises.length})</span>
          </button>
        </div>
      </div>

      {/* MODE 1: VOCABULARY CARDS */}
      {mode === 'cards' && (
        <div style={{ paddingBottom: selectedWordIds.size > 0 ? 110 : 30 }}>
          {/* Overview Stats Bar: Concisa, sin texto redundante */}
          <div className="card" style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: '1 1 260px' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                Palabras Dominadas: <span style={{ color: 'var(--primary)' }}>{masteredCount} de {effectiveVocabList.length}</span> ({progressPercent}%)
              </div>
              <div style={{ width: '100%', maxWidth: 300, height: 8, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.4s' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => startSrsSession(false)}
                title="Repasar vocabulario aprendido usando repetición espaciada"
                style={{
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  position: 'relative'
                }}
              >
                <Brain size={15} />
                <span>Repaso SRS</span>
                {dueLearnedVocab.length > 0 && (
                  <span style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: 999,
                    padding: '1px 6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    marginLeft: 2
                  }}>
                    {dueLearnedVocab.length}
                  </span>
                )}
              </button>

              <button 
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setStudyIndex(0);
                  setStudyFeedback(null);
                  setStudyInput('');
                  setMode('study');
                  updateParams('study', level, selectedTag, searchTerm);
                }}
                title="Estudiar las palabras que faltan por aprender"
                style={{
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <BookOpen size={15} />
                <span>Estudiar Vocabulario</span>
                {unlearnedCount > 0 && (
                  <span style={{
                    background: 'rgba(255,255,255,0.25)',
                    color: '#fff',
                    borderRadius: 999,
                    padding: '1px 6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    marginLeft: 2
                  }}>
                    {unlearnedCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filtros Integrados: Estado, Nivel JLPT y Etiquetas */}
          <div className="card" style={{ padding: '14px 16px', marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Filtro de Estado: Título y botones en líneas separadas, mismo estilo de nivel */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                Estado:
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline'} btn-xs`}
                  style={{ minWidth: 38, padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={() => setStatusFilter('all')}
                >
                  Todas ({effectiveVocabList.length})
                </button>
                <button
                  type="button"
                  className={`btn ${statusFilter === 'learned' ? 'btn-primary' : 'btn-outline'} btn-xs`}
                  style={{ minWidth: 38, padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={() => setStatusFilter('learned')}
                >
                  ✓ Aprendidas ({masteredCount})
                </button>
                <button
                  type="button"
                  className={`btn ${statusFilter === 'unlearned' ? 'btn-primary' : 'btn-outline'} btn-xs`}
                  style={{ minWidth: 38, padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={() => setStatusFilter('unlearned')}
                >
                  ⏳ Por aprender ({unlearnedCount})
                </button>
              </div>
            </div>

            {/* Selector de Nivel JLPT: Título y botones en líneas separadas */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Nivel:
                </span>
                {isLoading && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>
                    ⚡ Cargando...
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                {['all', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`btn ${level === lvl ? 'btn-primary' : 'btn-outline'} btn-xs`}
                    style={{ minWidth: 38, padding: '4px 10px', fontSize: '0.8rem' }}
                    onClick={() => {
                      setLevel(lvl);
                      setSelectedTag('all');
                      updateParams(mode, lvl, 'all', searchTerm);
                    }}
                  >
                    {lvl === 'all' ? 'Todos' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Etiquetas (Tags) colapsable/expandible en una sola línea sin dropdown */}
            {availableTags.length > 0 && (() => {
              const FIRST_LINE_TAGS_LIMIT = 5;
              const displayedTags = areTagsExpanded
                ? availableTags
                : availableTags.slice(0, FIRST_LINE_TAGS_LIMIT);

              return (
                <div style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <Tag size={13} />
                      <span>Etiquetas:</span>
                    </div>
                    {availableTags.length > FIRST_LINE_TAGS_LIMIT && (
                      <button
                        type="button"
                        onClick={() => setAreTagsExpanded(!areTagsExpanded)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '2px 4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span>{areTagsExpanded ? 'Ver menos ▲' : `+ Ver más (${availableTags.length - FIRST_LINE_TAGS_LIMIT}) ▼`}</span>
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={`vocab-tag-pill ${selectedTag === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedTag('all');
                        updateParams(mode, level, 'all', searchTerm);
                      }}
                    >
                      Todas
                    </button>
                    {displayedTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={`vocab-tag-pill ${selectedTag === tag ? 'active' : ''}`}
                        onClick={() => {
                          const nextTag = selectedTag === tag ? 'all' : tag;
                          setSelectedTag(nextTag);
                          updateParams(mode, level, nextTag, searchTerm);
                        }}
                      >
                        #{tag}
                      </button>
                    ))}
                    {!areTagsExpanded && availableTags.length > FIRST_LINE_TAGS_LIMIT && (
                      <button
                        type="button"
                        className="vocab-tag-pill"
                        onClick={() => setAreTagsExpanded(true)}
                        style={{
                          color: 'var(--primary)',
                          borderColor: 'var(--primary)',
                          fontWeight: 700,
                          background: 'rgba(99, 102, 241, 0.08)'
                        }}
                      >
                        +{availableTags.length - FIRST_LINE_TAGS_LIMIT} más...
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Search Bar & Quick Tools */}
          <div className="vocab-filter-bar" style={{ marginBottom: 12 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="search-input" 
                style={{ paddingLeft: 38 }}
                placeholder="Buscar por kanji, kana, español..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateParams(mode, level, selectedTag, e.target.value);
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className={`btn btn-xs ${filterOnlyWithNotes ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterOnlyWithNotes(!filterOnlyWithNotes)}
                style={{ borderRadius: '20px', padding: '4px 10px', fontSize: '0.78rem' }}
                title="Ver palabras con notas personales"
              >
                <StickyNote size={12} />
                <span>Notas ({effectiveVocabList.filter(v => v.notes && v.notes.trim()).length})</span>
              </button>

              <button
                type="button"
                className={`btn btn-xs ${filterOnlyCustomized ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterOnlyCustomized(!filterOnlyCustomized)}
                style={{ borderRadius: '20px', padding: '4px 10px', fontSize: '0.78rem' }}
                title="Ver palabras personalizadas"
              >
                <Edit3 size={12} />
                <span>Editadas ({effectiveVocabList.filter(v => v.isCustomized).length})</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => setIsCreateModalOpen(true)}
                style={{ borderRadius: '20px', padding: '4px 10px', fontSize: '0.78rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                title="Registrar una nueva palabra"
              >
                <Plus size={12} />
                <span>Nueva</span>
              </button>
            </div>
          </div>

          {/* Quick AI & Selection Helper Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                title="Generar historias u oraciones con IA usando palabras seleccionadas"
              >
                <Sparkles size={13} />
                <span>Generar con IA {selectedWordIds.size > 0 ? `(${selectedWordIds.size})` : ''}</span>
              </button>

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

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Mostrando: <strong>{filteredVocab.length}</strong> de {effectiveVocabList.length}
            </div>
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
                const isMastered = isWordMastered(item);
                const wordKey = item.id || item.kanji;
                const isSelected = selectedWordIds.has(wordKey);
                const tags = getVocabTags(item, appState?.vocabTags);

                return (
                  <div 
                    key={item.id || item.kanji} 
                    className={`vocab-card ${isSelected ? 'selected-card' : ''}`}
                    style={{ 
                      borderColor: isSelected 
                        ? 'var(--primary)' 
                        : (isMastered ? 'rgba(34, 197, 94, 0.45)' : (item.isCustomized ? 'rgba(99, 102, 241, 0.4)' : 'var(--border)')),
                      background: isSelected ? 'var(--primary-bg, rgba(99, 102, 241, 0.04))' : undefined,
                      boxShadow: isSelected ? '0 0 0 1px var(--primary)' : undefined
                    }}
                  >
                    {/* Línea 1: Nivel a la izq, Icono IA y botón Por aprender/aprendida a la der */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="vocab-tag" style={{ fontWeight: 700, margin: 0 }}>
                          {item.level || 'N5'}
                        </span>
                        {item.isCustomized && (
                          <span 
                            style={{ 
                              fontSize: '0.7rem', 
                              background: 'rgba(99, 102, 241, 0.15)', 
                              color: 'var(--primary-light)', 
                              padding: '1px 5px', 
                              borderRadius: '4px', 
                              fontWeight: 600,
                              border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}
                            title="Palabra con personalizaciones"
                          >
                            ✏️
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* Botón Selección IA */}
                        <button
                          type="button"
                          className={`kanji-select-btn ${isSelected ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = new Set(selectedWordIds);
                            if (next.has(wordKey)) next.delete(wordKey);
                            else next.add(wordKey);
                            setSelectedWordIds(next);
                          }}
                          title={isSelected ? "Deseleccionar palabra" : "Seleccionar palabra para IA"}
                          aria-pressed={isSelected}
                        >
                          {isSelected ? <Check size={12} strokeWidth={2.5} /> : <Sparkles size={12} />}
                        </button>

                        {/* Botón claro de Estado: Aprendida / Por Aprender */}
                        <button
                          type="button"
                          className={`vocab-status-pill ${isMastered ? 'learned' : 'unlearned'}`}
                          onClick={() => toggleVocabMastery(item)}
                          title={isMastered ? "Marcar como pendiente de aprender" : "Marcar como aprendida (+20 XP)"}
                        >
                          {isMastered ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>Aprendida</span>
                            </>
                          ) : (
                            <>
                              <Plus size={13} />
                              <span>Por aprender</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Línea 2: Tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {tags.map(tag => (
                        <span 
                          key={tag}
                          className="vocab-tag-pill"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(tag);
                            updateParams(mode, level, tag, searchTerm);
                          }}
                          title={`Filtrar por #${tag}`}
                        >
                          #{tag}
                        </span>
                      ))}
                      <button
                        type="button"
                        className="vocab-add-tag-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTagEditorWord(item);
                        }}
                        title="Gestionar etiquetas personalizadas de esta palabra"
                      >
                        <Tag size={10} />
                        <span>Tag</span>
                      </button>
                    </div>

                    {/* Línea 3: Y después centrado en la card el resto */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span className="jp-text" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                          {item.kanji}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <button 
                            type="button"
                            className="audio-btn" 
                            style={{ width: 30, height: 30 }}
                            onClick={() => audioManager.speak(item.kana || item.hiragana || item.kanji)}
                            title="Escuchar pronunciación"
                          >
                            <Volume2 size={15} />
                          </button>
                          <SpeechPractice 
                            targetText={item.kanji} 
                            targetKana={item.kana || item.hiragana} 
                            compact={true} 
                          />
                          <button
                            type="button"
                            className="audio-btn" 
                            style={{ width: 30, height: 30 }}
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
                            title="Practicar en Cuaderno"
                          >
                            <PenTool size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="vocab-kana jp-text" style={{ fontSize: '1.05rem', color: 'var(--accent)', fontWeight: 600 }}>
                        {item.kana || item.hiragana || ''}
                        {item.katakana && item.katakana !== (item.kana || item.hiragana) && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 8, fontWeight: 400 }}>
                            · {item.katakana}
                          </span>
                        )}
                      </div>

                      {/* Pitch Accent */}
                      <div style={{ marginTop: 2, marginBottom: 2 }}>
                        <PitchAccent 
                          word={item.kanji} 
                          reading={item.kana || item.hiragana} 
                          mode="full" 
                          size="sm" 
                        />
                      </div>
                    </div>

                    <div className="vocab-meanings" style={{ textAlign: 'center' }}>
                      <div className="vocab-es" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        🇪🇸 {item.meaning_es}
                      </div>
                      {item.meaning_en && (
                        <div className="vocab-en" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          🇬🇧 {item.meaning_en}
                        </div>
                      )}

                      {item.literal_translation && (
                        <div style={{ marginTop: 4, fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <span className="literal-tag">Literal</span>
                          <span>&ldquo;{item.literal_translation}&rdquo;</span>
                        </div>
                      )}

                      {item.breakdown && (
                        <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '4px 8px', borderRadius: '6px', border: '1px dashed var(--border)', textAlign: 'center' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>🧩 Desglose: </span>
                          <span>{item.breakdown}</span>
                        </div>
                      )}

                      {item.example_sentence && (
                        <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.15)', textAlign: 'left' }}>
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

                      {/* Nota de Estudio Personal */}
                      {item.notes && (
                        <div style={{
                          marginTop: 8,
                          background: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          borderRadius: '8px',
                          padding: '6px 9px',
                          fontSize: '0.82rem',
                          textAlign: 'left'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--amber-700, #b45309)', fontWeight: 700, fontSize: '0.75rem', marginBottom: 2 }}>
                            <StickyNote size={12} />
                            <span>Nota:</span>
                          </div>
                          <div style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.35 }}>
                            {item.notes}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Action Row */}
                    <div style={{
                      marginTop: 'auto',
                      paddingTop: 8,
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => setEditingWord(item)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', padding: '3px 7px' }}
                        title="Modificar ortografía o agregar/editar notas"
                      >
                        <Edit3 size={12} />
                        <span>{item.notes ? 'Editar / Notas' : '+ Nota'}</span>
                      </button>

                      {item.isCustomized && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleResetWordEdit(item.id || item.kanji)}
                          style={{ color: 'var(--text-muted)', fontSize: '0.72rem', padding: '2px 5px', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                          title="Restablecer palabra a su valor original"
                        >
                          <RotateCcw size={11} />
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
                  setStatusFilter('all');
                  setSelectedTag('all');
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

      {/* MODE 2: ESTUDIAR VOCABULARIO (Solo las que faltan por aprender) */}
      {mode === 'study' && (
        <div className="quiz-container" style={{ maxWidth: 680 }}>
          {currentStudyItem ? (
            <div>
              {/* Barra superior de estudio */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <button 
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setMode('cards');
                    updateParams('cards', level, selectedTag, searchTerm);
                  }}
                >
                  <ArrowLeft size={16} /> Volver a Tarjetas
                </button>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Palabra {studyIndex + 1} de {studyItems.length} por aprender
                </span>
              </div>

              {/* Tarjeta de Estudio Focalizada */}
              <div className="card" style={{ padding: '24px 20px', textAlign: 'center', marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className="vocab-tag" style={{ fontWeight: 700 }}>{currentStudyItem.level || 'N5'}</span>
                  {currentStudyItem.category && (
                    <span style={{ fontSize: '0.78rem', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {currentStudyItem.category}
                    </span>
                  )}
                </div>

                <div className="jp-text" style={{ fontSize: '3.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
                  {currentStudyItem.kanji}
                </div>

                <div className="jp-text" style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 600, marginBottom: 8 }}>
                  {currentStudyItem.kana || currentStudyItem.hiragana}
                </div>

                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
                  {currentStudyItem.meaning_es}
                </div>

                {/* Pitch Accent */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                  <PitchAccent 
                    word={currentStudyItem.kanji} 
                    reading={currentStudyItem.kana || currentStudyItem.hiragana} 
                    mode="full" 
                    size="sm" 
                  />
                </div>

                {/* Frase de ejemplo si existe */}
                {currentStudyItem.example_sentence && (
                  <div style={{ 
                    fontSize: '0.9rem', 
                    background: 'var(--bg-main)', 
                    border: '1px solid var(--border)', 
                    padding: '10px 14px', 
                    borderRadius: 10, 
                    color: 'var(--text-muted)',
                    marginBottom: 14,
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                      <span className="jp-text" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {currentStudyItem.example_sentence}
                      </span>
                      <button 
                        type="button" 
                        className="tts-btn-small"
                        onClick={() => audioManager.speak(currentStudyItem.example_sentence)}
                        style={{ padding: '2px 6px' }}
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                    {currentStudyItem.example_translation && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)' }}>
                        {currentStudyItem.example_translation}
                      </div>
                    )}
                  </div>
                )}

                {/* Audio y práctica */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                  <button 
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => audioManager.speak(currentStudyItem.kana || currentStudyItem.hiragana || currentStudyItem.kanji)}
                  >
                    <Volume2 size={15} /> Escuchar
                  </button>
                </div>

                {/* Botón directo de "Marcar como Aprendida" */}
                <div style={{ paddingTop: 14, borderTop: '1px dashed var(--border)' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', maxWidth: 320, margin: '0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={() => handleMarkLearnedFromStudy(currentStudyItem)}
                  >
                    <CheckCircle2 size={18} />
                    <span>✓ Marcar como Aprendida (+20 XP)</span>
                  </button>
                </div>
              </div>

              {/* Caja de validación interactiva de escritura */}
              <div className="typing-box">
                <div className="typing-prompt">
                  <span>O escribe la palabra en japonés para validar y aprender:</span>
                  <span className="ime-badge">🇯🇵 IME Romaji → Kana</span>
                </div>

                <div className="typing-input-row">
                  <input 
                    type="text" 
                    className="japanese-input jp-text"
                    placeholder="Escribe en hiragana..."
                    value={studyInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      const converted = wanakana.toKana(val, { IMEMode: true });
                      setStudyInput(converted);
                    }}
                    onCompositionStart={() => { isComposingRef.current = true; }}
                    onCompositionEnd={() => { isComposingRef.current = false; }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isComposingRef.current) {
                        handleValidateStudyTyping();
                      }
                    }}
                    autoFocus
                  />
                  <button type="button" className="btn btn-primary" onClick={() => handleValidateStudyTyping()}>
                    Validar
                  </button>
                  <button type="button" className="btn btn-outline" onClick={handleStudyHint} title="Pista de primer carácter">
                    <Lightbulb size={16} /> Pista
                  </button>
                </div>

                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>O practica pronunciando:</span>
                  <SpeechPractice 
                    targetText={currentStudyItem.kanji} 
                    targetKana={currentStudyItem.kana || currentStudyItem.hiragana} 
                    onMatch={() => {
                      handleMarkLearnedFromStudy(currentStudyItem);
                    }}
                  />
                </div>

                {studyFeedback && (
                  <div className={`typing-feedback ${studyFeedback.type}`} style={{ marginTop: 12 }}>
                    <div>{studyFeedback.msg}</div>
                    {studyFeedback.target && (
                      <div className="jp-text" style={{ fontSize: '1.2rem', marginTop: 4 }}>
                        {studyFeedback.target}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botones de Navegación Anterior / Siguiente */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                <button 
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setStudyFeedback(null);
                    setStudyInput('');
                    setStudyIndex((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={studyIndex === 0}
                >
                  <ArrowLeft size={16} /> Anterior
                </button>
                <button 
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setStudyFeedback(null);
                    setStudyInput('');
                    setStudyIndex((prev) => Math.min(studyItems.length - 1, prev + 1));
                  }}
                  disabled={studyIndex >= studyItems.length - 1}
                >
                  Saltar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '3.6rem', marginBottom: 14 }}>🏆</div>
              <h3 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-main)' }}>
                ¡Todo el vocabulario aprendido!
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 440, margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                No quedan palabras por aprender con los filtros actuales. Pásate al Repaso SRS para consolidarlas en tu memoria a largo plazo.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={() => startSrsSession(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <Brain size={18} /> Ir al Repaso SRS
                </button>
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setMode('cards');
                    updateParams('cards', level, selectedTag, searchTerm);
                  }}
                >
                  Volver a Tarjetas
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE: SRS REVIEW (Solo palabras aprendidas con espaciado FSRS) */}
      {mode === 'srs' && (
        <SrsReview 
          queue={srsQueue}
          onRate={handleSrsReview}
          onUndo={handleSrsUndo}
          getCurrentCard={(item) => (item.id && appState.masteredVocab?.[item.id]) || (item.kanji && appState.masteredVocab?.[item.kanji])}
          onExit={() => {
            setMode('cards');
            updateParams('cards', level, selectedTag, searchTerm);
          }}
          backLabel="Volver a Vocabulario"
          renderFront={(item) => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="vocab-tag" style={{ fontWeight: 700 }}>{item.level || 'N5'}</span>
                {item.category && (
                  <span style={{ fontSize: '0.78rem', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {item.category}
                  </span>
                )}
              </div>

              <div 
                className="jp-text" 
                style={{ 
                  fontSize: '4.5rem', 
                  fontWeight: 800, 
                  lineHeight: 1.15, 
                  margin: '12px auto 18px auto',
                  textAlign: 'center',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {item.kanji}
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: '0 0 16px 0', maxWidth: 420 }}>
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

              {/* Pitch Accent en SRS */}
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

              {/* Herramientas de audio */}
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
              </div>

              {/* Tatoeba Sentences Integration */}
              {item.tatoeba_sentences && item.tatoeba_sentences.length > 0 && (
                <div style={{ marginTop: 20, textAlign: 'left', background: 'var(--bg-surface)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: 10 }}>
                    📚 Ejemplos en Contexto:
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
                <button className="btn btn-outline btn-sm" onClick={() => {
                  setExerciseAnswer(null);
                  setExerciseIndex((prev) => (prev - 1 + filteredN4Exercises.length) % filteredN4Exercises.length);
                }}>
                  <ArrowLeft size={16} /> Anterior
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => {
                  setExerciseAnswer(null);
                  setExerciseIndex((prev) => (prev + 1) % filteredN4Exercises.length);
                }}>
                  Siguiente <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL GESTOR DE ETIQUETAS (TAGS) PERSONALIZADAS PARA VOCABULARIO */}
      {tagEditorWord && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ maxWidth: 440, width: '100%', position: 'relative', padding: '24px 20px' }}>
            <button 
              type="button"
              className="btn btn-ghost btn-xs"
              style={{ position: 'absolute', top: 12, right: 12, borderRadius: '50%', width: 30, height: 30, padding: 0 }}
              onClick={() => {
                setTagEditorWord(null);
                setNewTagInput('');
              }}
              title="Cerrar"
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="jp-text" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                {tagEditorWord.kanji || tagEditorWord.kana}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Etiquetas de Vocabulario
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {tagEditorWord.meaning_es}
                </div>
              </div>
            </div>

            {/* Etiquetas activas */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                Etiquetas asignadas:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {getVocabTags(tagEditorWord, appState?.vocabTags).map(tag => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      padding: '3px 8px',
                      borderRadius: 12,
                      fontSize: '0.82rem',
                      fontWeight: 700
                    }}
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTagFromCurrent(tag)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Eliminar etiqueta"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
                {getVocabTags(tagEditorWord, appState?.vocabTags).length === 0 && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Sin etiquetas asignadas.
                  </span>
                )}
              </div>
            </div>

            {/* Sugerencias populares */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                Sugerencias populares (haz clic para agregar):
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {POPULAR_VOCAB_TAG_SUGGESTIONS.map(sugg => {
                  const currentTags = getVocabTags(tagEditorWord, appState?.vocabTags);
                  const isPresent = currentTags.includes(sugg);
                  return (
                    <button
                      key={sugg}
                      type="button"
                      className={`btn btn-xs ${isPresent ? 'btn-primary' : 'btn-outline'}`}
                      style={{ borderRadius: 12, fontSize: '0.75rem', padding: '2px 8px' }}
                      onClick={() => {
                        if (isPresent) handleRemoveTagFromCurrent(sugg);
                        else handleAddTagToCurrent(sugg);
                      }}
                    >
                      {isPresent ? `✓ ${sugg}` : `+ ${sugg}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input para nueva etiqueta personalizada */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input 
                type="text" 
                className="input-text" 
                style={{ flex: 1, fontSize: '0.88rem' }}
                placeholder="Crear nueva etiqueta (ej. Trabajo, Viaje)..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTagToCurrent(newTagInput);
                  }
                }}
              />
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={() => handleAddTagToCurrent(newTagInput)}
                disabled={!newTagInput.trim()}
              >
                Añadir
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setTagEditorWord(null);
                  setNewTagInput('');
                }}
              >
                Listo
              </button>
            </div>
          </div>
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
        <div className="selection-floating-bar" role="region" aria-label="Acciones para palabras seleccionadas">
          <div className="selection-floating-header">
            <div className="selection-floating-info">
              <span style={{
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: 999,
                padding: '2px 9px',
                fontSize: '0.8rem',
                fontWeight: 800,
                flexShrink: 0
              }}>
                {selectedWordIds.size}
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                {selectedWordIds.size === 1 ? 'palabra seleccionada' : 'palabras seleccionadas'}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setSelectedWordIds(new Set())}
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                padding: '3px 8px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Deseleccionar y limpiar"
            >
              <X size={13} />
              <span>Limpiar</span>
            </button>
          </div>

          <div className="selection-floating-chips">
            {Array.from(selectedWordIds).slice(0, 6).map(id => {
              const w = effectiveVocabList.find(x => (x.id === id || x.kanji === id));
              return w ? (
                <span key={id} className="jp-text selection-floating-chip" style={{ fontSize: '0.84rem' }}>
                  {w.kanji}
                </span>
              ) : null;
            })}
            {selectedWordIds.size > 6 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center', paddingLeft: 4 }}>
                +{selectedWordIds.size - 6} más
              </span>
            )}
          </div>

          <div className="selection-floating-actions two-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setAiGenType('conversation');
                setIsAIGeneratorOpen(true);
              }}
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
              style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
              title="Generar historia con las palabras seleccionadas"
            >
              <Sparkles size={14} />
              <span>Historia</span>
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
