'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Bookmark, BookmarkCheck, Sparkles, Volume2, Trash2, Search, Layers, MessageSquare, BookOpen, Download, Copy, Check, ExternalLink, PlusCircle, ArrowRight, X, FileText, FileCode, StickyNote, PenTool, Info, Edit3 } from 'lucide-react';
import audioManager from '../../lib/audioManager';
import SaveVocabModal from '../modals/SaveVocabModal';
import EditWordModal from '../modals/EditWordModal';
import { 
  buildStoryPrompt, 
  exportVocabularyAsJson, 
  exportAsAnkiCsv, 
  exportAsMarkdown,
  formatTimestamp 
} from '../../lib/japaneseUtils';
import { getAuthSession } from '../../lib/supabaseSync';
import { useApp } from '../../lib/AppContext';

export default function SavedTab({ 
  appState, 
  onUpdateState, 
  onNavigate,
  authUser: propAuthUser = null,
  onOpenAuth: propOnOpenAuth = null,
  initialView = 'all',
  initialSearch = '',
  initialLevel = 'all',
  initialCategory = 'all',
  onParamsChange
}) {
  const contextApp = useApp();
  const authUser = propAuthUser || contextApp?.authUser;
  const onOpenAuth = propOnOpenAuth || (() => {
    if (contextApp?.setIsAuthModalOpen) {
      contextApp.setIsAuthModalOpen(true);
    }
  });
  const showAlert = contextApp?.showAlert || ((opts) => console.log(opts));
  const showConfirm = contextApp?.showConfirm || (() => Promise.resolve(true));
  // Subview tabs: 'all' | 'words' | 'phrases' | 'stories'
  const [subView, setSubView] = useState(initialView || 'all');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedLevel, setSelectedLevel] = useState(initialLevel || 'all'); // 'all' | 'N5' | 'N4' | 'N3'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');

  const updateParams = (newView, newSearch, newLevel, newCat) => {
    if (onParamsChange) {
      onParamsChange({
        view: newView !== undefined ? newView : subView,
        search: newSearch !== undefined ? newSearch : searchQuery,
        level: newLevel !== undefined ? newLevel : selectedLevel,
        category: newCat !== undefined ? newCat : selectedCategory
      });
    }
  };

  useEffect(() => {
    if (initialView && initialView !== subView) setSubView(initialView);
  }, [initialView]);

  useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== searchQuery) setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialLevel && initialLevel !== selectedLevel) setSelectedLevel(initialLevel);
  }, [initialLevel]);

  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);
  
  // Selection state for batch actions
  const [selectedWordIds, setSelectedWordIds] = useState(new Set());
  const [selectedPhraseIds, setSelectedPhraseIds] = useState(new Set());

  // Export / Story Generator Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('prompt'); // 'prompt' | 'create_story' | 'export_files'
  const [storyLevel, setStoryLevel] = useState('N5');
  const [storyTheme, setStoryTheme] = useState('daily');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // New Story Creator form state
  const [storyTitleJp, setStoryTitleJp] = useState('');
  const [storyTitleEs, setStoryTitleEs] = useState('');
  const [storyJapaneseText, setStoryJapaneseText] = useState('');
  const [storyHiraganaText, setStoryHiraganaText] = useState('');
  const [storySpanishText, setStorySpanishText] = useState('');
  const [storySavedSuccess, setStorySavedSuccess] = useState(false);

  // Manual Add Modal & Edit Modal
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);

  const savedWords = appState.savedCustomVocab || [];
  const savedPhrases = appState.savedPhrases || [];
  const customStories = appState.savedStories || [];

  const allCategories = useMemo(() => Array.from(new Set(savedWords.map(w => w.category).filter(Boolean))), [savedWords]);

  // Handle saving edited word
  const handleSaveEditedWord = (updated) => {
    const updatedWords = savedWords.map((w) => (w.id === updated.id ? updated : w));
    onUpdateState({
      ...appState,
      savedCustomVocab: updatedWords
    });
    setEditingWord(null);
  };

  // Filtered words
  const filteredWords = useMemo(() => {
    return savedWords.filter((w) => {
      const matchLevel = selectedLevel === 'all' || w.level === selectedLevel;
      const matchCat = selectedCategory === 'all' || w.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (w.kanji && w.kanji.toLowerCase().includes(q)) ||
        (w.hiragana && w.hiragana.toLowerCase().includes(q)) ||
        (w.katakana && w.katakana.toLowerCase().includes(q)) ||
        (w.meaning_es && w.meaning_es.toLowerCase().includes(q)) ||
        (w.literal_translation && w.literal_translation.toLowerCase().includes(q)) ||
        (w.breakdown && w.breakdown.toLowerCase().includes(q)) ||
        (w.example_sentence && w.example_sentence.toLowerCase().includes(q)) ||
        (w.example_translation && w.example_translation.toLowerCase().includes(q));
      return matchLevel && matchSearch && matchCat;
    });
  }, [savedWords, selectedLevel, selectedCategory, searchQuery]);

  // Filtered phrases
  const filteredPhrases = useMemo(() => {
    return savedPhrases.filter((p) => {
      const matchLevel = selectedLevel === 'all' || !p.level || p.level === selectedLevel;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (p.japanese && p.japanese.toLowerCase().includes(q)) ||
        (p.translation && p.translation.toLowerCase().includes(q)) ||
        (p.videoTitle && p.videoTitle.toLowerCase().includes(q));
      return matchLevel && matchSearch;
    });
  }, [savedPhrases, selectedLevel, searchQuery]);

  // Checkbox helpers
  const toggleSelectWord = (id) => {
    setSelectedWordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectPhrase = (id) => {
    setSelectedPhraseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const allWordIds = new Set(filteredWords.map((w) => w.id));
    const allPhraseIds = new Set(filteredPhrases.map((p) => p.id));
    if (selectedWordIds.size === filteredWords.length && selectedPhraseIds.size === filteredPhrases.length) {
      setSelectedWordIds(new Set());
      setSelectedPhraseIds(new Set());
    } else {
      setSelectedWordIds(allWordIds);
      setSelectedPhraseIds(allPhraseIds);
    }
  };

  const selectedWordsCount = selectedWordIds.size;
  const selectedPhrasesCount = selectedPhraseIds.size;
  const totalSelected = selectedWordsCount + selectedPhrasesCount;

  // Selected arrays for export
  const selectedWordsList = useMemo(() => {
    if (selectedWordIds.size === 0) return filteredWords;
    return savedWords.filter((w) => selectedWordIds.has(w.id));
  }, [savedWords, filteredWords, selectedWordIds]);

  const selectedPhrasesList = useMemo(() => {
    if (selectedPhraseIds.size === 0) return filteredPhrases;
    return savedPhrases.filter((p) => selectedPhraseIds.has(p.id));
  }, [savedPhrases, filteredPhrases, selectedPhraseIds]);

  // Delete handlers
  const handleDeleteWord = async (id) => {
    const ok = await showConfirm({
      title: '¿Eliminar palabra?',
      message: '¿Deseas eliminar esta palabra de tu cuaderno de estudio?',
      confirmText: 'Eliminar',
      isDestructive: true
    });
    if (!ok) return;
    const updated = savedWords.filter((w) => w.id !== id);
    onUpdateState({
      ...appState,
      savedCustomVocab: updated
    });
    setSelectedWordIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDeletePhrase = async (id) => {
    const ok = await showConfirm({
      title: '¿Eliminar frase?',
      message: '¿Deseas eliminar esta frase guardada de tu lista de estudio?',
      confirmText: 'Eliminar',
      isDestructive: true
    });
    if (!ok) return;
    const updated = savedPhrases.filter((p) => p.id !== id);
    onUpdateState({
      ...appState,
      savedPhrases: updated
    });
    setSelectedPhraseIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (totalSelected === 0) return;
    const ok = await showConfirm({
      title: '¿Eliminar elementos?',
      message: `¿Deseas eliminar los ${totalSelected} elementos seleccionados de tu cuaderno de estudio?`,
      confirmText: `Eliminar (${totalSelected})`,
      isDestructive: true
    });
    if (!ok) return;

    const updatedWords = savedWords.filter((w) => !selectedWordIds.has(w.id));
    const updatedPhrases = savedPhrases.filter((p) => !selectedPhraseIds.has(p.id));

    onUpdateState({
      ...appState,
      savedCustomVocab: updatedWords,
      savedPhrases: updatedPhrases
    });

    setSelectedWordIds(new Set());
    setSelectedPhraseIds(new Set());
  };

  const handleDeleteStory = async (storyId) => {
    const ok = await showConfirm({
      title: '¿Eliminar historia?',
      message: '¿Deseas eliminar esta historia personalizada de tu biblioteca?',
      confirmText: 'Eliminar',
      isDestructive: true
    });
    if (!ok) return;
    const updated = customStories.filter((s) => s.id !== storyId);
    onUpdateState({
      ...appState,
      savedStories: updated
    });
  };

  // AI Prompt generation
  const generatedPrompt = useMemo(() => {
    return buildStoryPrompt({
      words: selectedWordsList,
      phrases: selectedPhrasesList,
      level: storyLevel,
      theme: storyTheme
    });
  }, [selectedWordsList, selectedPhrasesList, storyLevel, storyTheme]);

  const handleGenerateAIStory = async () => {
    // Requerir inicio de sesión para generar historias con IA
    if (!authUser) {
      showAlert({
        type: 'lock',
        title: 'Generación con Inteligencia Artificial',
        message: 'Debes iniciar sesión con tu cuenta de Google o correo para generar historias personalizadas con IA.',
        actionLabel: 'Iniciar Sesión',
        onAction: () => {
          setIsExportModalOpen(false);
          if (onOpenAuth) onOpenAuth();
        }
      });
      return;
    }

    setIsGenerating(true);
    try {
      const vocabList = selectedWordsList.map(w => w.kanji || w.hiragana);
      if (vocabList.length === 0) {
        showAlert({
          type: 'warning',
          title: 'Vocabulario Requerido',
          message: 'Por favor selecciona al menos una palabra de tu cuaderno de estudio para generar la historia con IA.'
        });
        setIsGenerating(false);
        return;
      }

      // Obtener token de sesión activa de Supabase
      const session = await getAuthSession();
      const token = session?.access_token;

      if (!token) {
        showAlert({
          type: 'lock',
          title: 'Sesión Requerida',
          message: 'Tu sesión no está activa o ha expirado. Por favor vuelve a iniciar sesión.',
          actionLabel: 'Iniciar Sesión',
          onAction: () => {
            setIsExportModalOpen(false);
            if (onOpenAuth) onOpenAuth();
          }
        });
        setIsGenerating(false);
        return;
      }

      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vocabList,
          level: storyLevel,
          theme: storyTheme,
          provider: 'groq'
        })
      });

      const data = await response.json();
      if (data.error) {
        showAlert({
          type: 'error',
          title: 'Error al Generar con IA',
          message: data.error,
          actionLabel: response.status === 401 ? 'Iniciar Sesión' : undefined,
          onAction: response.status === 401 ? () => {
            setIsExportModalOpen(false);
            if (onOpenAuth) onOpenAuth();
          } : undefined
        });
        setIsGenerating(false);
        return;
      }

      const storyObj = data.story;
      // Añadir meta datos
      storyObj.id = `custom_${Date.now()}`;
      storyObj.isCustom = true;
      storyObj.wordsUsed = vocabList;
      
      const newStoriesList = [storyObj, ...(appState.savedStories || [])];
      onUpdateState({ 
        ...appState,
        savedStories: newStoriesList,
        xp: (appState.xp || 0) + 50
      });
      
      setIsExportModalOpen(false);
      setStorySavedSuccess(true);
      setTimeout(() => setStorySavedSuccess(false), 3000);
      showAlert({
        type: 'success',
        title: '¡Historia Generada!',
        message: '¡Tu historia personalizada ha sido creada y guardada con éxito en tu biblioteca! (+50 XP)'
      });

    } catch (error) {
      console.error(error);
      showAlert({
        type: 'error',
        title: 'Fallo de Red',
        message: 'Ocurrió un error inesperado al conectar con el servicio de IA. Por favor intenta de nuevo.'
      });
    }
    setIsGenerating(false);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyJson = () => {
    const jsonStr = exportVocabularyAsJson(selectedWordsList);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyMarkdown = () => {
    const mdStr = exportAsMarkdown(selectedWordsList, selectedPhrasesList);
    navigator.clipboard.writeText(mdStr);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = exportVocabularyAsJson(selectedWordsList);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nihongo_vocabulario_${storyLevel}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAnki = () => {
    const csvStr = exportAsAnkiCsv(selectedWordsList, selectedPhrasesList);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nihongo_anki_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save new custom story
  const handleSaveCustomStory = () => {
    if (!storyJapaneseText.trim()) {
      showAlert({
        type: 'warning',
        title: 'Texto Requerido',
        message: 'Por favor introduce al menos el texto en japonés de la historia para poder crearla.'
      });
      return;
    }

    const titleFull = storyTitleJp.trim() 
      ? (storyTitleEs.trim() ? `${storyTitleJp.trim()} (${storyTitleEs.trim()})` : storyTitleJp.trim())
      : (storyTitleEs.trim() || 'Nueva Historia Personalizada');

    // Parse sentences by splitting punctuation
    const rawSentences = storyJapaneseText
      .split(/(?<=[。！？\n])/)
      .map(s => s.trim())
      .filter(Boolean);

    const parsedSentences = rawSentences.map((st, idx) => ({
      id: `sent_custom_${Date.now()}_${idx + 1}`,
      japanese: st,
      clean_target: st.replace(/[、。！？「」\s]/g, '').trim(),
      english: '',
      translation_es: ''
    }));

    const newStory = {
      id: `story_custom_${Date.now()}`,
      title: titleFull,
      title_en: storyTitleEs.trim() || 'Custom Story',
      difficulty: `Nivel ${storyLevel} (Personalizada)`,
      description: `Historia interactiva creada a partir de ${selectedWordsList.length} palabras y frases seleccionadas de tu estudio.`,
      isCustom: true,
      createdAt: new Date().toISOString(),
      wordsUsed: selectedWordsList.map(w => w.kanji || w.text || w.hiragana),
      paragraphs: [
        {
          chapter: 1,
          title: storyTitleJp.trim() || 'Capítulo 1',
          japanese: storyJapaneseText.trim(),
          hiragana: storyHiraganaText.trim() || storyJapaneseText.trim(),
          translation_es: storySpanishText.trim() || 'Sin traducción',
          translation_en: ''
        }
      ],
      sentences: parsedSentences
    };

    const updated = [newStory, ...customStories];
    onUpdateState({
      ...appState,
      savedStories: updated,
      xp: (appState.xp || 0) + 50
    });

    setStorySavedSuccess(true);
    setTimeout(() => {
      setStorySavedSuccess(false);
      setIsExportModalOpen(false);
      // Reset form
      setStoryTitleJp('');
      setStoryTitleEs('');
      setStoryJapaneseText('');
      setStoryHiraganaText('');
      setStorySpanishText('');
      // Switch to stories subview
      setSubView('stories');
    }, 1200);
  };

  return (
    <div className="saved-tab-page">
      {/* Header Banner */}
      <div className="saved-header-card">
        <div className="saved-header-content">
          <div className="saved-title-row">
            <div className="saved-icon-badge">
              <BookmarkCheck size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <h2 className="saved-title" style={{ margin: 0 }}>Palabras y Frases Guardadas</h2>
                <button
                  type="button"
                  className="tour-info-shortcut-btn"
                  onClick={() => {
                    if (contextApp?.openTour) {
                      contextApp.openTour('saved');
                    } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
                      window.__nihongoOpenTour('saved');
                    }
                  }}
                  title="Ver guía y explicación del Banco de Guardados y FSRS en el tour"
                  aria-label="Guía de Guardados"
                >
                  <Info size={15} />
                  <span>Guía</span>
                </button>
              </div>
              <p className="saved-subtitle">
                Banco de vocabulario y expresiones extraídas desde el reproductor ya incorporado, lecturas de historias y videos de inmersión para exportar y crear nuevas historias interactivas.
              </p>
            </div>
          </div>

          <div className="saved-stats-pills">
            <div className="saved-stat-pill">
              <span className="stat-number">{savedWords.length}</span>
              <span className="stat-label">Palabras (単語)</span>
            </div>
            <div className="saved-stat-pill">
              <span className="stat-number">{savedPhrases.length}</span>
              <span className="stat-label">Frases (例文)</span>
            </div>
            <div className="saved-stat-pill highlight">
              <span className="stat-number">{customStories.length}</span>
              <span className="stat-label">Historias Creadas</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="saved-header-actions">
          <button
            className="btn btn-primary btn-sm header-action-btn"
            onClick={() => {
              setModalMode('prompt');
              setIsExportModalOpen(true);
            }}
            title="Crear o generar una nueva historia con las palabras seleccionadas"
          >
            <Sparkles size={16} />
            <span>Crear Nueva Historia</span>
          </button>

          <button
            className="btn btn-outline btn-sm header-action-btn"
            onClick={() => {
              setModalMode('export_files');
              setIsExportModalOpen(true);
            }}
            title="Exportar a Anki, JSON o Markdown"
          >
            <Download size={16} />
            <span>Exportar ({totalSelected > 0 ? totalSelected : 'Todo'})</span>
          </button>

          <button
            className="btn btn-outline btn-sm header-action-btn"
            onClick={() => setIsManualAddOpen(true)}
            title="Añadir nueva palabra manualmente según INSTRUCCIONES.md"
          >
            <PlusCircle size={16} />
            <span>Añadir Palabra</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Filter Controls */}
      <div className="saved-nav-toolbar">
        <div className="saved-subviews-tabs">
          <button
            className={`saved-subview-btn ${subView === 'all' ? 'active' : ''}`}
            onClick={() => {
              setSubView('all');
              updateParams('all', searchQuery, selectedLevel, selectedCategory);
            }}
          >
            <Bookmark size={15} />
            <span>Todo ({savedWords.length + savedPhrases.length})</span>
          </button>

          <button
            className={`saved-subview-btn ${subView === 'words' ? 'active' : ''}`}
            onClick={() => {
              setSubView('words');
              updateParams('words', searchQuery, selectedLevel, selectedCategory);
            }}
          >
            <Layers size={15} />
            <span>Palabras ({savedWords.length})</span>
          </button>

          <button
            className={`saved-subview-btn ${subView === 'phrases' ? 'active' : ''}`}
            onClick={() => {
              setSubView('phrases');
              updateParams('phrases', searchQuery, selectedLevel, selectedCategory);
            }}
          >
            <MessageSquare size={15} />
            <span>Frases ({savedPhrases.length})</span>
          </button>

          <button
            className={`saved-subview-btn ${subView === 'stories' ? 'active' : ''}`}
            onClick={() => {
              setSubView('stories');
              updateParams('stories', searchQuery, selectedLevel, selectedCategory);
            }}
          >
            <BookOpen size={15} />
            <span>Mis Historias ({customStories.length})</span>
          </button>
        </div>

        {subView !== 'stories' && (
          <div className="saved-filter-controls">
            {/* Search Input */}
            <div className="saved-search-wrapper">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por Kanji, Kana o significado..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  updateParams(subView, e.target.value, selectedLevel, selectedCategory);
                }}
                className="saved-search-input"
              />
              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={() => {
                    setSearchQuery('');
                    updateParams(subView, '', selectedLevel, selectedCategory);
                  }}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* JLPT Level Filter */}
            <div className="saved-level-filter" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {['all', 'N5', 'N4', 'N3'].map((lvl) => (
                <button
                  key={lvl}
                  className={`level-filter-pill ${selectedLevel === lvl ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedLevel(lvl);
                    updateParams(subView, searchQuery, lvl, selectedCategory);
                  }}
                >
                  {lvl === 'all' ? 'Todos' : lvl}
                </button>
              ))}
              
              <select 
                className="form-select" 
                style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  updateParams(subView, searchQuery, selectedLevel, e.target.value);
                }}
              >
                <option value="all">Todas las Categorías</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Floating Batch Selection Bar when items are selected */}
      {subView !== 'stories' && (filteredWords.length > 0 || filteredPhrases.length > 0) && (
        <div className="batch-action-bar">
          <label className="batch-select-all-label">
            <input
              type="checkbox"
              checked={
                filteredWords.length > 0 &&
                selectedWordIds.size === filteredWords.length &&
                selectedPhraseIds.size === filteredPhrases.length
              }
              onChange={handleSelectAll}
            />
            <span>Seleccionar todo ({filteredWords.length + filteredPhrases.length})</span>
          </label>

          {totalSelected > 0 && (
            <div className="batch-action-buttons">
              <span className="selected-count-badge">
                {totalSelected} seleccionado{totalSelected > 1 ? 's' : ''}
              </span>

              <button
                className="btn btn-primary btn-xs batch-btn"
                onClick={() => {
                  setModalMode('prompt');
                  setIsExportModalOpen(true);
                }}
              >
                <Sparkles size={13} />
                <span>Crear Historia con Selección</span>
              </button>

              <button
                className="btn btn-outline btn-xs batch-btn"
                onClick={() => {
                  setModalMode('export_files');
                  setIsExportModalOpen(true);
                }}
              >
                <Download size={13} />
                <span>Exportar Selección</span>
              </button>

              <button
                className="btn btn-danger btn-xs batch-btn"
                onClick={handleDeleteSelected}
              >
                <Trash2 size={13} />
                <span>Eliminar</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 1 & 2: PALABRAS Y FRASES GUARDADAS */}
      {/* ============================================================== */}
      {subView !== 'stories' && (
        <div className="saved-content-grid">
          {/* Columna de Palabras */}
          {(subView === 'all' || subView === 'words') && (
            <div className="saved-column">
              <div className="saved-column-header">
                <div className="column-title-group">
                  <Layers size={18} className="text-primary" />
                  <h3>Vocabulario ({filteredWords.length})</h3>
                </div>
                <span className="column-hint">Términos con Kanji, Hiragana y Katakana</span>
              </div>

              {filteredWords.length === 0 ? (
                <div className="empty-saved-box">
                  <Bookmark size={36} className="empty-icon" />
                  <h4>No hay palabras guardadas aún</h4>
                  <p>
                    Selecciona cualquier palabra en la historia, lección o subtítulo, y presiona el botón <strong>&quot;Guardar Selección&quot;</strong> en el reproductor de audio inferior.
                  </p>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => onNavigate && onNavigate('story')}
                  >
                    <BookOpen size={15} />
                    <span>Ir a Leer Historia</span>
                  </button>
                </div>
              ) : (
                <div className="saved-cards-list">
                  {filteredWords.map((w) => {
                    const isSelected = selectedWordIds.has(w.id);
                    return (
                      <div
                        key={w.id}
                        className={`saved-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="saved-card-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectWord(w.id)}
                            aria-label={`Seleccionar ${w.kanji}`}
                          />
                        </div>

                        <div className="saved-card-body">
                          <div className="saved-word-header">
                            <span className="saved-word-kanji jp-text">{w.kanji}</span>
                            <div className="saved-word-readings jp-text">
                              <span className="reading-hira">{w.hiragana}</span>
                              {w.katakana && w.katakana !== w.hiragana && (
                                <span className="reading-kata">({w.katakana})</span>
                              )}
                            </div>
                          </div>

                          <div className="saved-word-meaning">{w.meaning_es}</div>

                          {w.literal_translation && (
                            <div style={{
                              marginTop: 4,
                              fontSize: '0.82rem',
                              color: 'var(--text-secondary, #64748b)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}>
                              <span className="literal-tag">Literal</span>
                              <span>&ldquo;{w.literal_translation}&rdquo;</span>
                            </div>
                          )}

                          {w.breakdown && (
                            <div style={{
                              marginTop: 6,
                              fontSize: '0.8rem',
                              color: 'var(--text-muted, #94a3b8)',
                              background: 'rgba(255, 255, 255, 0.03)',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm, 6px)',
                              border: '1px dashed var(--border)'
                            }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>🧩 Desglose: </span>
                              <span>{w.breakdown}</span>
                            </div>
                          )}

                          {w.example_sentence && (
                            <div style={{
                              marginTop: 8,
                              padding: '8px 10px',
                              background: 'rgba(99, 102, 241, 0.05)',
                              borderRadius: 'var(--radius-sm, 8px)',
                              border: '1px solid rgba(99, 102, 241, 0.15)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                <span style={{ fontSize: '0.88rem', fontWeight: 600 }} className="jp-text">
                                  {w.example_sentence}
                                </span>
                                <button
                                  type="button"
                                  className="tts-btn-small"
                                  onClick={() => audioManager.speak(w.example_sentence)}
                                  title="Escuchar frase de ejemplo"
                                  style={{ padding: '2px 5px', height: 'auto', width: 'auto' }}
                                >
                                  <Volume2 size={13} />
                                </button>
                              </div>
                              {w.example_reading && (
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }} className="jp-text">
                                  {w.example_reading}
                                </div>
                              )}
                              {w.example_translation && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', marginTop: 2 }}>
                                  {w.example_translation}
                                </div>
                              )}
                            </div>
                          )}

                          {w.notes && (
                            <div style={{
                              marginTop: 6,
                              fontSize: '0.82rem',
                              color: 'var(--kohaku, #d97706)',
                              background: 'rgba(245, 158, 11, 0.1)',
                              padding: '5px 8px',
                              borderRadius: 'var(--radius-sm, 8px)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 6
                            }}>
                              <StickyNote size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                              <span>{w.notes}</span>
                            </div>
                          )}

                          <div className="saved-card-footer">
                            <div className="card-tags-row">
                              <span className={`level-pill level-${(w.level || 'n5').toLowerCase()}`}>
                                {w.level || 'N5'}
                              </span>
                              {w.category && (
                                <span className="category-tag">{w.category}</span>
                              )}
                              {w.source && (
                                <span className="source-tag">{w.source}</span>
                              )}
                            </div>

                            <div className="card-actions-row">
                              <button
                                className="tts-btn-small"
                                onClick={() => audioManager.speak(w.kanji || w.hiragana)}
                                title="Escuchar pronunciación"
                              >
                                <Volume2 size={16} />
                              </button>
                              <button
                                className="tts-btn-small"
                                onClick={() => setEditingWord(w)}
                                title="Editar palabra, notas y desglose"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                className="tts-btn-small"
                                onClick={() => {
                                  if (contextApp?.openPracticePad) {
                                    contextApp.openPracticePad({
                                      text: w.kanji || w.hiragana,
                                      kana: w.hiragana,
                                      title: `Palabra Guardada: ${w.kanji || w.hiragana} (${w.meaning_es})`,
                                      source: 'vocab'
                                    });
                                  } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                                    window.__nihongoOpenPracticePad({
                                      text: w.kanji || w.hiragana,
                                      kana: w.hiragana,
                                      title: `Palabra Guardada: ${w.kanji || w.hiragana} (${w.meaning_es})`,
                                      source: 'vocab'
                                    });
                                  }
                                }}
                                title="Practicar caligrafía y trazos en Cuaderno"
                              >
                                <PenTool size={15} />
                              </button>
                              <button
                                className="delete-btn-small"
                                onClick={() => handleDeleteWord(w.id)}
                                title="Eliminar palabra"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Columna de Frases */}
          {(subView === 'all' || subView === 'phrases') && (
            <div className="saved-column">
              <div className="saved-column-header">
                <div className="column-title-group">
                  <MessageSquare size={18} className="text-warning" />
                  <h3>Frases & Expresiones ({filteredPhrases.length})</h3>
                </div>
                <span className="column-hint">Oraciones contextuales con audio</span>
              </div>

              {filteredPhrases.length === 0 ? (
                <div className="empty-saved-box">
                  <MessageSquare size={36} className="empty-icon text-warning" />
                  <h4>No hay frases guardadas</h4>
                  <p>
                    En el reproductor de audio, haz clic en <strong>&quot;Guardar oración&quot;</strong> mientras se reproduce cualquier frase para añadirla a tu cuaderno.
                  </p>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => onNavigate && onNavigate('story')}
                  >
                    <BookOpen size={15} />
                    <span>Explorar historias y audio</span>
                  </button>
                </div>
              ) : (
                <div className="saved-cards-list">
                  {filteredPhrases.map((p) => {
                    const isSelected = selectedPhraseIds.has(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`saved-card phrase-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="saved-card-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectPhrase(p.id)}
                            aria-label={`Seleccionar frase ${p.japanese.slice(0, 10)}`}
                          />
                        </div>

                        <div className="saved-card-body">
                          <div className="saved-phrase-jp jp-text">{p.japanese}</div>
                          {p.translation && (
                            <div className="saved-phrase-es">{p.translation}</div>
                          )}

                          <div className="saved-card-footer">
                            <div className="card-tags-row">
                              <span className="source-tag">{p.source || p.videoTitle || 'Reproductor'}</span>
                              {p.timestamp > 0 && p.youtubeUrl && (
                                <a
                                  href={p.youtubeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="yt-timestamp-btn"
                                  title="Ver momento exacto en YouTube"
                                >
                                  <span>{formatTimestamp(p.timestamp)}</span>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>

                            <div className="card-actions-row">
                              <button
                                className="tts-btn-small"
                                onClick={() => audioManager.speak(p.japanese)}
                                title="Escuchar pronunciación de la oración"
                              >
                                <Volume2 size={16} />
                              </button>
                              <button
                                className="tts-btn-small"
                                onClick={() => {
                                  if (contextApp?.openPracticePad) {
                                    contextApp.openPracticePad({
                                      text: p.japanese,
                                      title: `Frase Guardada: ${p.translation || ''}`,
                                      source: 'story'
                                    });
                                  } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                                    window.__nihongoOpenPracticePad({
                                      text: p.japanese,
                                      title: `Frase Guardada: ${p.translation || ''}`,
                                      source: 'story'
                                    });
                                  }
                                }}
                                title="Practicar caligrafía y trazos de esta frase en Cuaderno"
                              >
                                <PenTool size={15} />
                              </button>
                              <button
                                className="delete-btn-small"
                                onClick={() => handleDeletePhrase(p.id)}
                                title="Eliminar frase"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 3: MIS HISTORIAS CREADAS */}
      {/* ============================================================== */}
      {subView === 'stories' && (
        <div className="custom-stories-view">
          <div className="custom-stories-header">
            <div>
              <h3>Biblioteca de Historias Personalizadas</h3>
              <p>
                Lecturas generadas con el vocabulario que has extraído. Puedes leerlas con furigana, escucharlas con audio interactivo y practicar escritura IME.
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setModalMode('create_story');
                setIsExportModalOpen(true);
              }}
            >
              <Sparkles size={16} />
              <span>Redactar / Pegar Nueva Historia</span>
            </button>
          </div>

          {customStories.length === 0 ? (
            <div className="empty-stories-box">
              <BookOpen size={48} className="empty-icon text-primary" />
              <h3>Aún no has creado historias con tus palabras</h3>
              <p>
                Selecciona palabras de tu cuaderno de estudio, presiona <strong>&quot;Crear Nueva Historia&quot;</strong>, y genera una lectura personalizada con IA para practicar tu comprensión lectora.
              </p>
              <div className="empty-stories-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setModalMode('prompt');
                    setIsExportModalOpen(true);
                  }}
                >
                  <Sparkles size={16} />
                  <span>{authUser ? 'Generar Historia con IA' : '🔒 Generar Historia con IA (Requiere sesión)'}</span>
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setSubView('words')}
                >
                  <Layers size={16} />
                  <span>Ver mis palabras guardadas</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="custom-stories-grid">
              {customStories.map((story) => (
                <div key={story.id} className="custom-story-card">
                  <div className="custom-story-top">
                    <div>
                      <span className="story-difficulty-pill">{story.difficulty || 'JLPT'}</span>
                      <h4 className="custom-story-title">{story.title}</h4>
                    </div>
                    <button
                      className="delete-story-btn"
                      onClick={() => handleDeleteStory(story.id)}
                      title="Eliminar historia"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="custom-story-desc">{story.description}</p>

                  {story.wordsUsed && story.wordsUsed.length > 0 && (
                    <div className="story-words-used">
                      <span className="words-label">Vocabulario incluido:</span>
                      <div className="words-pill-list">
                        {story.wordsUsed.map((w, i) => (
                          <span key={i} className="word-used-pill">{w}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extracto de texto */}
                  {story.paragraphs?.[0]?.japanese && (
                    <div className="story-snippet jp-text">
                      &quot;{story.paragraphs[0].japanese.slice(0, 110)}...&quot;
                    </div>
                  )}

                  <div className="custom-story-footer">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('story', story.id);
                        }
                      }}
                    >
                      <BookOpen size={15} />
                      <span>Abrir en Lector de Historias</span>
                    </button>

                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        const jp = story.paragraphs?.[0]?.japanese;
                        if (jp) audioManager.speak(jp);
                      }}
                      title="Escuchar audio de la historia"
                    >
                      <Volume2 size={16} />
                      <span>Escuchar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: GENERADOR DE PROMPT, CREADOR DE HISTORIAS Y EXPORTACIÓN */}
      {/* ============================================================== */}
      {isExportModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsExportModalOpen(false)}>
          <div className="export-story-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Sparkles className="text-primary" size={22} />
                <div>
                  <h3 className="modal-title">Exportar y Crear Nuevas Historias</h3>
                  <p className="modal-subtitle">
                    {selectedWordsList.length} palabras y {selectedPhrasesList.length} frases listas para procesar
                  </p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsExportModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="modal-tabs">
              <button
                className={`modal-tab-btn ${modalMode === 'prompt' ? 'active' : ''}`}
                onClick={() => setModalMode('prompt')}
              >
                <Sparkles size={16} />
                <span>1. Prompt IA (Generador)</span>
              </button>

              <button
                className={`modal-tab-btn ${modalMode === 'create_story' ? 'active' : ''}`}
                onClick={() => setModalMode('create_story')}
              >
                <BookOpen size={16} />
                <span>2. Guardar Historia en App</span>
              </button>

              <button
                className={`modal-tab-btn ${modalMode === 'export_files' ? 'active' : ''}`}
                onClick={() => setModalMode('export_files')}
              >
                <Download size={16} />
                <span>3. Descargar Archivos (JSON/Anki)</span>
              </button>
            </div>

            {/* TAB 1: PROMPT PARA IA */}
            {modalMode === 'prompt' && (
              <div className="modal-tab-content">
                <div className="generator-settings-grid">
                  <div className="form-group">
                    <label className="form-label">Nivel de Dificultad JLPT</label>
                    <div className="select-pill-group">
                      {['N5', 'N4', 'N3'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          className={`select-pill ${storyLevel === lvl ? 'active' : ''}`}
                          onClick={() => setStoryLevel(lvl)}
                        >
                          Nivel {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Temática de la Historia</label>
                    <select
                      className="form-select"
                      value={storyTheme}
                      onChange={(e) => setStoryTheme(e.target.value)}
                    >
                      <option value="daily">☕ Vida diaria y rutina en Tokio</option>
                      <option value="cafe">🍵 Tarde en una cafetería tradicional</option>
                      <option value="travel">🚅 Viaje en Shinkansen hacia Kioto</option>
                      <option value="school">🏫 Día en la escuela con profesores y amigos</option>
                      <option value="food">🍜 Comida callejera y ramen artesanal</option>
                      <option value="fantasy">⛩️ Misterio tradicional cerca de un santuario</option>
                    </select>
                  </div>
                </div>

                <div className="included-words-summary">
                  <span className="summary-title">Palabras obligatorias en el prompt:</span>
                  <div className="summary-words-pills">
                    {selectedWordsList.map((w, idx) => (
                      <span key={idx} className="word-tag-pill">
                        {w.kanji} {w.hiragana ? `(${w.hiragana})` : ''}
                      </span>
                    ))}
                    {selectedWordsList.length === 0 && (
                      <span className="no-words-text">No has seleccionado palabras específicas. Se usarán todas las guardadas.</span>
                    )}
                  </div>
                </div>

                <div className="prompt-preview-container">
                  <div className="prompt-preview-header">
                    <span>Prompt generado listo para copiar a ChatGPT, Claude o Gemini:</span>
                    <button
                      className="btn btn-accent btn-xs"
                      onClick={handleCopyPrompt}
                    >
                      {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedPrompt ? '¡Prompt Copiado!' : 'Copiar Prompt'}</span>
                    </button>
                  </div>
                  <textarea
                    className="prompt-textarea"
                    value={generatedPrompt}
                    readOnly
                    rows={8}
                  />
                </div>

                <div className="generator-footer-help" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p>
                    💡 <strong>Nueva IA Integrada:</strong> Haz clic en el botón de abajo para que Nihongo Master genere automáticamente esta historia usando <strong>Groq Llama-3</strong>, y la guarde en tu biblioteca de historias.
                  </p>

                  {!authUser && (
                    <div style={{
                      background: 'rgba(234, 179, 8, 0.12)',
                      border: '1px solid rgba(234, 179, 8, 0.35)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔒</span>
                        <span>
                          Para generar historias automáticas con IA debes <strong>iniciar sesión</strong> con tu cuenta.
                        </span>
                      </div>
                      <button 
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setIsExportModalOpen(false);
                          if (onOpenAuth) onOpenAuth();
                        }}
                      >
                        Iniciar Sesión
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '12px' }}
                      onClick={handleGenerateAIStory}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generando Historia...' : !authUser ? '🔒 Inicia sesión para Generar con IA' : '✨ Auto-Generar con IA (Groq)'}
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setModalMode('create_story')}
                    >
                      Manual <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GUARDAR HISTORIA EN LA APP */}
            {modalMode === 'create_story' && (
              <div className="modal-tab-content">
                {storySavedSuccess && (
                  <div className="success-banner">
                    <Check size={18} />
                    <span>¡Historia guardada con éxito en tu biblioteca! (+50 XP)</span>
                  </div>
                )}

                <div className="create-story-form">
                  <div className="form-group-row">
                    <div className="form-group flex-1">
                      <label className="form-label">Título en Japonés (Kanji / Kana)</label>
                      <input
                        type="text"
                        className="form-input jp-text"
                        placeholder="ej: 東京のカフェでの出会い"
                        value={storyTitleJp}
                        onChange={(e) => setStoryTitleJp(e.target.value)}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Título en Español</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="ej: Un encuentro en un café de Tokio"
                        value={storyTitleEs}
                        onChange={(e) => setStoryTitleEs(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="label-with-action">
                      <label className="form-label">Texto de la Historia en Japonés (con Kanji)</label>
                      {storyJapaneseText && (
                        <button
                          type="button"
                          className="tts-mini-btn"
                          onClick={() => audioManager.speak(storyJapaneseText)}
                          title="Probar audio de la historia"
                        >
                          <Volume2 size={14} />
                          <span>Probar Audio</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      className="form-textarea jp-text"
                      rows={5}
                      placeholder="Pega aquí el texto en japonés generado por la IA..."
                      value={storyJapaneseText}
                      onChange={(e) => setStoryJapaneseText(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lectura en Hiragana (Opcional para furigana)</label>
                    <textarea
                      className="form-textarea jp-text"
                      rows={3}
                      placeholder="Pega la transcripción en hiragana si la tienes..."
                      value={storyHiraganaText}
                      onChange={(e) => setStoryHiraganaText(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Traducción al Español</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Traducción al español de los párrafos..."
                      value={storySpanishText}
                      onChange={(e) => setStorySpanishText(e.target.value)}
                    />
                  </div>

                  <div className="form-actions-bar">
                    <button
                      className="btn btn-outline"
                      onClick={() => setIsExportModalOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveCustomStory}
                    >
                      <BookOpen size={16} />
                      <span>Guardar Historia en Mi Biblioteca</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: EXPORTAR ARCHIVOS */}
            {modalMode === 'export_files' && (
              <div className="modal-tab-content">
                <div className="export-options-grid">
                  {/* Formato JSON Oficial */}
                  <div className="export-option-card">
                    <div className="option-header">
                      <FileCode size={20} className="text-primary" />
                      <h4>Formato Vocabulario JSON</h4>
                    </div>
                    <p>
                      JSON con estructura obligatoria de <strong>INSTRUCCIONES.md</strong> (Kanji, Hiragana, Katakana, significado en español y nivel JLPT).
                    </p>
                    <div className="option-buttons-row">
                      <button className="btn btn-primary btn-sm" onClick={handleDownloadJson}>
                        <Download size={15} />
                        <span>Descargar JSON</span>
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={handleCopyJson}>
                        {copiedJson ? <Check size={15} /> : <Copy size={15} />}
                        <span>{copiedJson ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Formato Anki CSV */}
                  <div className="export-option-card">
                    <div className="option-header">
                      <Layers size={20} className="text-warning" />
                      <h4>Tarjetas de Anki (CSV)</h4>
                    </div>
                    <p>
                      Exporta tus palabras y oraciones en un archivo delimitado por tabulaciones listo para importar directamente en tus barajas de Anki.
                    </p>
                    <div className="option-buttons-row">
                      <button className="btn btn-primary btn-sm" onClick={handleDownloadAnki}>
                        <Download size={15} />
                        <span>Descargar CSV para Anki</span>
                      </button>
                    </div>
                  </div>

                  {/* Formato Markdown */}
                  <div className="export-option-card">
                    <div className="option-header">
                      <FileText size={20} className="text-blue-500" />
                      <h4>Apuntes en Markdown</h4>
                    </div>
                    <p>
                      Tablas estructuradas en Markdown para pegar en Notion, Obsidian o tus notas de estudio personales.
                    </p>
                    <div className="option-buttons-row">
                      <button className="btn btn-outline btn-sm" onClick={handleCopyMarkdown}>
                        {copiedMarkdown ? <Check size={15} /> : <Copy size={15} />}
                        <span>{copiedMarkdown ? '¡Markdown Copiado!' : 'Copiar Markdown'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Vocab Modal for manual addition */}
      <SaveVocabModal
        isOpen={isManualAddOpen}
        onClose={() => setIsManualAddOpen(false)}
        initialData={{ source: 'Guardado Manual' }}
        appState={appState}
        onUpdateState={onUpdateState}
      />

      {/* Edit Word Modal for editing existing saved words */}
      {editingWord && (
        <EditWordModal
          isOpen={!!editingWord}
          onClose={() => setEditingWord(null)}
          word={editingWord}
          onSave={handleSaveEditedWord}
          isCustomized={true}
        />
      )}
    </div>
  );
}
