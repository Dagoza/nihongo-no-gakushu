'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
  Volume2, Search, ArrowRight, ArrowLeft, Lightbulb, RotateCcw, 
  Sparkles, Check, MessageSquare, PenTool, Info, Languages, 
  Tag, Plus, X, CheckCircle2, BookOpen, Brain, Sparkle, Filter,
  SlidersHorizontal, ChevronDown, ChevronUp
} from 'lucide-react';
import audioManager from '../../lib/audioManager';
import kanjiData from '../../data/kanji.json';
import * as wanakana from 'wanakana';
import { getNewCard, reviewCard, isDue, ensureFsrsCard } from '../../lib/srs';
import { triggerCheerConfetti } from '../../lib/confetti';
import { 
  getKanjiTags, 
  addTagToKanji, 
  removeTagFromKanji, 
  getAllUniqueTags, 
  POPULAR_TAG_SUGGESTIONS 
} from '../../lib/kanjiTags';
import PitchAccent from '../features/PitchAccent';
import { getKanjiFromSupabase } from '../../lib/supabaseData';
import { useApp } from '../../lib/AppContext';
import TerminologyTooltip from '../common/TerminologyTooltip';

// Lazy loading con code-splitting para componentes interactivos de alto impacto
const SrsReview = dynamic(() => import('../features/SrsReview'), { ssr: false });
const KanjiDraw = dynamic(() => import('../features/KanjiDraw'), { ssr: false });
const SpeechPractice = dynamic(() => import('../features/SpeechPractice'), { ssr: false });
const AIGeneratorModal = dynamic(() => import('../modals/AIGeneratorModal'), { ssr: false });

export function getPrimaryKanjiReading(k) {
  if (!k) return '';
  if (k.kunyomi && k.kunyomi.includes('[')) {
    const inside = k.kunyomi.split('[')[1]?.replace(']', '').trim();
    if (inside) return inside.split(/[,、]/)[0]?.replace(/[(（].*?[)）]/g, '').trim();
  }
  if (k.kunyomi) {
    return k.kunyomi.split(/[,、]/)[0]?.replace(/[(（].*?[)）]/g, '').trim();
  }
  if (k.onyomi && k.onyomi.includes('[')) {
    const inside = k.onyomi.split('[')[1]?.replace(']', '').trim();
    if (inside) return inside.split(/[,、]/)[0]?.trim();
  }
  if (k.onyomi) {
    return k.onyomi.split(/[,、]/)[0]?.trim();
  }
  if (k.pronunciation) {
    return k.pronunciation.split(/[,、]/)[0]?.trim();
  }
  return '';
}

export function getAllKanjiReadings(k) {
  if (!k) return [];
  const list = [];
  if (k.kunyomi) list.push(k.kunyomi);
  if (k.onyomi) list.push(k.onyomi);
  if (k.pronunciation) list.push(k.pronunciation);
  if (k.words && Array.isArray(k.words)) {
    k.words.forEach(w => {
      if (w.reading) list.push(w.reading);
    });
  }
  return list;
}

export default function KanjiTab({ 
  appState, 
  onUpdateState,
  authUser: propAuthUser = null,
  initialSearch = '',
  initialMode = 'list',
  initialDraw = null,
  onParamsChange
}) {
  const contextApp = useApp();
  const authUser = propAuthUser || contextApp?.authUser;
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  
  // Study Mode State (sustituye el antiguo quiz de lecturas)
  const [studyActive, setStudyActive] = useState(initialMode === 'study' || initialMode === 'quiz');
  const [studyIndex, setStudyIndex] = useState(0);
  const [studyInput, setStudyInput] = useState('');
  const [studyFeedback, setStudyFeedback] = useState(null);
  const isComposingRef = useRef(false);

  // SRS State
  const [srsActive, setSrsActive] = useState(initialMode === 'srs');
  const [srsQueue, setSrsQueue] = useState([]);

  // Drawing Mode
  const [drawingKanji, setDrawingKanji] = useState(initialDraw || null);

  // Tag Editor Modal
  const [tagEditorKanji, setTagEditorKanji] = useState(null);
  const [newTagInput, setNewTagInput] = useState('');

  // Filters State
  const [level, setLevel] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'learned' | 'unlearned'
  const [selectedTag, setSelectedTag] = useState('all'); // 'all' | tagString
  const [areTagsExpanded, setAreTagsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (level !== 'all') count++;
    if (selectedTag !== 'all') count++;
    return count;
  }, [statusFilter, level, selectedTag]);

  const handleResetFilters = () => {
    setStatusFilter('all');
    setLevel('all');
    setSelectedTag('all');
  };

  // Kanji List State (carga unificada del catálogo global)
  const [kanjiList, setKanjiList] = useState(kanjiData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(32);

  // Progressive Disclosure: Compound words toggle per kanji
  const [expandedCompoundKanji, setExpandedCompoundKanji] = useState({});
  const toggleExpandWords = (kanjiChar) => {
    setExpandedCompoundKanji(prev => ({ ...prev, [kanjiChar]: !prev[kanjiChar] }));
  };

  // AI Content Generator & Kanji Selection State
  const [selectedKanjiChars, setSelectedKanjiChars] = useState(new Set());
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [aiGenType, setAiGenType] = useState('story');

  const updateParams = (newSearch, newMode, newDraw) => {
    if (onParamsChange) {
      const activeMode = newMode !== undefined 
        ? newMode 
        : (studyActive ? 'study' : (srsActive ? 'srs' : 'list'));
      onParamsChange({
        search: newSearch !== undefined ? newSearch : searchTerm,
        mode: activeMode,
        draw: newDraw !== undefined ? newDraw : drawingKanji
      });
    }
  };

  useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== searchTerm) {
      setSearchTerm(initialSearch || '');
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialMode === 'study' || initialMode === 'quiz') {
      setStudyActive(true);
      setSrsActive(false);
    } else if (initialMode === 'srs') {
      startSrsSession();
    } else if (initialMode === 'list') {
      setStudyActive(false);
      setSrsActive(false);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialDraw !== undefined && initialDraw !== drawingKanji) {
      setDrawingKanji(initialDraw);
    }
  }, [initialDraw]);

  // Carga unificada de kanjis globales
  useEffect(() => {
    let isMounted = true;
    if (authUser) {
      setIsLoading(true);
      getKanjiFromSupabase({ level, authUser })
        .then(data => {
          if (isMounted && data && data.length > 0) {
            setKanjiList(data);
          }
        })
        .catch(err => console.error("Error cargando kanjis globales:", err))
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      const list = kanjiData || [];
      setKanjiList(level === 'all' ? list : list.filter(k => k.level === level));
      setIsLoading(false);
    }
    return () => { isMounted = false; };
  }, [level, authUser]);

  // Reset de ventana visible cuando cambian filtros o búsqueda
  useEffect(() => {
    setVisibleCount(32);
  }, [searchTerm, level, statusFilter, selectedTag]);

  // Kanjis aprendidos y pendientes
  const masteredCount = useMemo(() => {
    return kanjiList.filter(k => Boolean(appState.masteredKanji?.[k.kanji])).length;
  }, [kanjiList, appState.masteredKanji]);

  const unlearnedCount = useMemo(() => {
    return Math.max(0, kanjiList.length - masteredCount);
  }, [kanjiList.length, masteredCount]);

  const progressPercent = Math.round((masteredCount / Math.max(1, kanjiList.length)) * 100);

  // Kanjis aprendidos que están pendientes de repaso según repetición espaciada FSRS
  const dueLearnedKanjis = useMemo(() => {
    return kanjiList.filter(k => {
      const card = appState.masteredKanji?.[k.kanji];
      if (!card) return false;
      return isDue(card);
    });
  }, [kanjiList, appState.masteredKanji]);

  // Todas las etiquetas únicas disponibles
  const availableTags = useMemo(() => {
    return getAllUniqueTags(kanjiList, appState.kanjiTags);
  }, [kanjiList, appState.kanjiTags]);

  // Filtrado de kanjis para la vista de tarjetas
  const filteredKanji = useMemo(() => {
    return kanjiList.filter(k => {
      // Filtro de Nivel JLPT
      if (level !== 'all' && k.level !== level) return false;

      // Filtro por Estado: Aprendidos o Por aprender
      const isMastered = Boolean(appState.masteredKanji?.[k.kanji]);
      if (statusFilter === 'learned' && !isMastered) return false;
      if (statusFilter === 'unlearned' && isMastered) return false;

      // Filtro por Etiqueta personalizada
      if (selectedTag !== 'all') {
        const tags = getKanjiTags(k.kanji, appState.kanjiTags);
        if (!tags.includes(selectedTag)) return false;
      }

      // Filtro de Búsqueda
      const search = searchTerm.trim().toLowerCase();
      if (!search) return true;
      return (
        k.kanji.includes(search) ||
        (k.meaning_es && k.meaning_es.toLowerCase().includes(search)) ||
        (k.meaning_en && k.meaning_en.toLowerCase().includes(search)) ||
        (k.pronunciation && k.pronunciation.toLowerCase().includes(search)) ||
        (k.onyomi && k.onyomi.toLowerCase().includes(search)) ||
        (k.kunyomi && k.kunyomi.toLowerCase().includes(search))
      );
    });
  }, [kanjiList, level, statusFilter, selectedTag, searchTerm, appState.masteredKanji, appState.kanjiTags]);

  const selectedKanjisForAI = useMemo(() => {
    if (selectedKanjiChars.size === 0) {
      return filteredKanji.slice(0, 5).map(k => ({
        text: k.kanji,
        reading: getPrimaryKanjiReading(k),
        meaning: k.meaning_es
      }));
    }
    return Array.from(selectedKanjiChars).map(char => {
      const found = kanjiList.find(k => k.kanji === char);
      return {
        text: char,
        reading: found ? getPrimaryKanjiReading(found) : '',
        meaning: found ? found.meaning_es : ''
      };
    });
  }, [selectedKanjiChars, filteredKanji, kanjiList]);

  // Alternar kanji como aprendido / por aprender desde las cards
  const toggleKanjiMastery = (char) => {
    const isMastered = Boolean(appState.masteredKanji?.[char]);
    const updatedMastered = { ...(appState.masteredKanji || {}) };
    
    if (isMastered) {
      delete updatedMastered[char];
      onUpdateState({
        ...appState,
        masteredKanji: updatedMastered
      });
    } else {
      updatedMastered[char] = getNewCard();
      const newXp = (appState.xp || 0) + 20;
      triggerCheerConfetti();
      onUpdateState({
        ...appState,
        xp: newXp,
        masteredKanji: updatedMastered
      });
    }
  };

  // Iniciar Repaso SRS (solo con kanjis aprendidos)
  const startSrsSession = (forceAll = false) => {
    const learnedKanjis = kanjiList.filter(item => Boolean(appState.masteredKanji?.[item.kanji]));
    
    if (learnedKanjis.length === 0) {
      if (contextApp?.showAlert) {
        contextApp.showAlert({
          type: 'info',
          title: 'Sin Kanjis Aprendidos',
          message: 'Aún no has marcado kanjis como aprendidos. Ve a "Estudiar Kanjis" para aprender tus primeros caracteres y programar sus repasos con repetición espaciada.'
        });
      }
      return;
    }

    const queue = forceAll
      ? [...learnedKanjis].sort(() => Math.random() - 0.5)
      : learnedKanjis.filter(item => isDue(appState.masteredKanji[item.kanji])).sort(() => Math.random() - 0.5);

    if (queue.length === 0) {
      if (contextApp?.showAlert) {
        contextApp.showAlert({
          type: 'success',
          title: '¡Estás al día con el SRS!',
          message: `Has repasado todos tus ${learnedKanjis.length} kanjis aprendidos. El algoritmo FSRS avisará cuando toque repasar. ¿Deseas repasarlos todos de todos modos?`,
          actionLabel: 'Repasar de todos modos',
          onAction: () => startSrsSession(true)
        });
      } else {
        setSrsQueue(learnedKanjis.sort(() => Math.random() - 0.5));
        setSrsActive(true);
        setStudyActive(false);
        updateParams(searchTerm, 'srs', drawingKanji);
      }
      return;
    }

    setSrsQueue(queue);
    setSrsActive(true);
    setStudyActive(false);
    updateParams(searchTerm, 'srs', drawingKanji);
  };

  const handleSrsReview = (item, rating) => {
    const currentCardData = appState.masteredKanji?.[item.kanji];
    const oldCard = (currentCardData && typeof currentCardData === 'object') 
      ? currentCardData 
      : getNewCard();
      
    const newCard = reviewCard(oldCard, rating);
    const newXp = (appState.xp || 0) + 10;
    
    onUpdateState({
      ...appState,
      xp: newXp,
      masteredKanji: {
        ...(appState.masteredKanji || {}),
        [item.kanji]: newCard
      }
    });
  };

  const handleSrsUndo = (item, prevCardData) => {
    const updated = { ...(appState.masteredKanji || {}) };
    if (prevCardData === undefined || prevCardData === null) {
      delete updated[item.kanji];
    } else {
      updated[item.kanji] = prevCardData;
    }
    onUpdateState({
      ...appState,
      masteredKanji: updated
    });
  };

  // MODO ESTUDIAR KANJIS (Solo los que faltan por aprender)
  const studyItems = useMemo(() => {
    return kanjiList.filter(k => {
      // Filtrar estrictamente solo los que faltan por aprender
      const isMastered = Boolean(appState.masteredKanji?.[k.kanji]);
      if (isMastered) return false;

      // Respetar nivel y etiqueta seleccionados si aplican
      if (level !== 'all' && k.level !== level) return false;
      if (selectedTag !== 'all') {
        const tags = getKanjiTags(k.kanji, appState.kanjiTags);
        if (!tags.includes(selectedTag)) return false;
      }
      return true;
    });
  }, [kanjiList, appState.masteredKanji, level, selectedTag, studyActive]);

  const currentStudyItem = studyItems[studyIndex];

  // Marcar como aprendido directamente dentro del modo estudio
  const handleMarkLearnedFromStudy = (kanjiChar) => {
    if (!kanjiChar) return;
    const newMastered = {
      ...(appState.masteredKanji || {}),
      [kanjiChar]: getNewCard()
    };
    const newXp = (appState.xp || 0) + 20;
    triggerCheerConfetti();
    onUpdateState({
      ...appState,
      xp: newXp,
      masteredKanji: newMastered
    });

    setStudyFeedback({
      type: 'correct',
      msg: '🎉 ¡Kanji aprendido! Añadido a tu cola de Repaso SRS (+20 XP)',
      reading: kanjiChar
    });

    setTimeout(() => {
      setStudyFeedback(null);
      setStudyInput('');
      if (studyIndex >= studyItems.length - 1) {
        setStudyIndex(0);
      }
    }, 1200);
  };

  const handleValidateStudyReading = (forcedValue = null) => {
    if (!currentStudyItem) return;
    const inputVal = (typeof forcedValue === 'string' ? forcedValue : studyInput).trim();
    if (!inputVal) return;
    
    const expectedPrimary = getPrimaryKanjiReading(currentStudyItem);
    const allReadings = getAllKanjiReadings(currentStudyItem);

    const isMatch = inputVal === expectedPrimary || allReadings.some(r => r.includes(inputVal)) || 
      (currentStudyItem.words && currentStudyItem.words.some(w => w.reading === inputVal));

    if (isMatch) {
      setStudyFeedback({
        type: 'correct',
        msg: `🎉 ¡Correcto! (+20 XP)`,
        reading: `${currentStudyItem.kanji} = ${expectedPrimary || inputVal}`
      });
      audioManager.speak(expectedPrimary || inputVal);

      // Marcar automáticamente como aprendido al acertar la lectura
      const newMastered = {
        ...(appState.masteredKanji || {}),
        [currentStudyItem.kanji]: getNewCard()
      };
      const newXp = (appState.xp || 0) + 20;
      triggerCheerConfetti();
      onUpdateState({
        ...appState,
        xp: newXp,
        masteredKanji: newMastered
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
        msg: `Lectura esperada en Hiragana:`,
        reading: expectedPrimary || currentStudyItem.pronunciation || '—'
      });
    }
  };

  const handleStudyHint = () => {
    if (!currentStudyItem) return;
    const expected = getPrimaryKanjiReading(currentStudyItem);
    if (expected) {
      setStudyInput(expected.charAt(0));
    }
  };

  // Gestión de Etiquetas (Tags)
  const handleAddTagToCurrent = (tag) => {
    if (!tagEditorKanji || !tag || !tag.trim()) return;
    const updated = addTagToKanji(tagEditorKanji.kanji, tag, appState.kanjiTags);
    onUpdateState({
      ...appState,
      kanjiTags: updated
    });
    setNewTagInput('');
  };

  const handleRemoveTagFromCurrent = (tag) => {
    if (!tagEditorKanji || !tag) return;
    const updated = removeTagFromKanji(tagEditorKanji.kanji, tag, appState.kanjiTags);
    onUpdateState({
      ...appState,
      kanjiTags: updated
    });
  };

  return (
    <div className="section-panel active">
      {/* Header Limpio sin exceso de texto */}
      <div className="module-hero-card">
        <div className="module-hero-content">
          <div className="module-hero-title-row">
            <div 
              className="module-hero-icon-badge" 
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)' }}
            >
              <Languages size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <span className="module-category-pill" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)' }}>
                  Recursos & Práctica
                </span>
                <button
                  type="button"
                  className="tour-info-shortcut-btn"
                  onClick={() => {
                    if (contextApp?.openTour) {
                      contextApp.openTour('kanji');
                    } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
                      window.__nihongoOpenTour('kanji');
                    }
                  }}
                  title="Ver guía y explicación de Kanjis y Trazos"
                  aria-label="Información de Kanjis"
                >
                  <Info size={14} />
                  <span>Guía</span>
                </button>
              </div>
              <h1 className="module-hero-title">Biblioteca de Kanji</h1>
            </div>
          </div>
        </div>
      </div>

      {!studyActive && !srsActive ? (
        <div style={{ paddingBottom: selectedKanjiChars.size > 0 ? 110 : 30 }}>
          {/* Overview Stats Bar: Concisa, sin texto redundante */}
          <div className="card" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: '1 1 260px' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                Kanjis Dominados: <span style={{ color: 'var(--primary)' }}>{masteredCount} de {kanjiList.length}</span> ({progressPercent}%)
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
                title="Repasar kanjis aprendidos usando repetición espaciada"
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
                {dueLearnedKanjis.length > 0 && (
                  <span style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: 999,
                    padding: '1px 6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    marginLeft: 2
                  }}>
                    {dueLearnedKanjis.length}
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
                  setStudyActive(true);
                  setSrsActive(false);
                  updateParams(searchTerm, 'study', drawingKanji);
                }}
                title="Estudiar los kanjis que faltan por aprender"
                style={{
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <BookOpen size={15} />
                <span>Estudiar Kanjis</span>
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

          {/* Search Bar & Botón de Filtros */}
          <div className="vocab-filter-bar" style={{ marginBottom: 14 }}>
            <div className="filter-search-row">
              <div className="filter-input-wrapper">
                <Search size={18} className="filter-search-icon" />
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ paddingLeft: 38, width: '100%' }}
                  placeholder="Buscar por kanji, lectura o significado..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    updateParams(e.target.value, undefined, drawingKanji);
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      updateParams('', undefined, drawingKanji);
                    }}
                    aria-label="Limpiar búsqueda"
                    className="clear-search-btn"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'} filter-toggle-btn`}
                onClick={() => setShowFilters(prev => !prev)}
                aria-expanded={showFilters}
                title={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              >
                <SlidersHorizontal size={15} />
                <span className="filter-toggle-text">Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="filter-toggle-badge">
                    {activeFilterCount}
                  </span>
                )}
                <span className="filter-toggle-chevron">
                  {showFilters ? <ChevronUp size={13} style={{ marginLeft: 2 }} /> : <ChevronDown size={13} style={{ marginLeft: 2 }} />}
                </span>
              </button>
            </div>
          </div>

          {/* Filtros Integrados: Estado, Nivel JLPT y Etiquetas (Colapsable) */}
          {showFilters && (
            <div className="card filter-card-animated" style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeFilterCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {activeFilterCount} {activeFilterCount === 1 ? 'filtro activo' : 'filtros activos'}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '2px 4px'
                    }}
                  >
                    Limpiar todos
                  </button>
                </div>
              )}

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
                    Todos ({kanjiList.length})
                  </button>
                  <button
                    type="button"
                    className={`btn ${statusFilter === 'learned' ? 'btn-primary' : 'btn-outline'} btn-xs`}
                    style={{ minWidth: 38, padding: '4px 10px', fontSize: '0.8rem' }}
                    onClick={() => setStatusFilter('learned')}
                  >
                    ✓ Aprendidos ({masteredCount})
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
                      onClick={() => setLevel(lvl)}
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
                        className={`kanji-tag-pill ${selectedTag === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedTag('all')}
                      >
                        Todas
                      </button>
                      {displayedTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          className={`kanji-tag-pill ${selectedTag === tag ? 'active' : ''}`}
                          onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
                        >
                          #{tag}
                        </button>
                      ))}
                      {!areTagsExpanded && availableTags.length > FIRST_LINE_TAGS_LIMIT && (
                        <button
                          type="button"
                          className="kanji-tag-pill"
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
          )}

          {/* Quick AI & Selection Helper Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className={`btn btn-xs ${selectedKanjiChars.size > 0 ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setIsAIGeneratorOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  borderRadius: '20px',
                  padding: '4px 12px',
                  borderColor: 'var(--primary)',
                  color: selectedKanjiChars.size > 0 ? '#fff' : 'var(--primary)',
                  fontWeight: 600
                }}
                title="Generar historias u oraciones de ejemplo con IA usando kanjis seleccionados"
              >
                <Sparkles size={13} />
                <span>Generar con IA {selectedKanjiChars.size > 0 ? `(${selectedKanjiChars.size})` : ''}</span>
              </button>

              {selectedKanjiChars.size > 0 ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setSelectedKanjiChars(new Set())}
                  style={{ color: 'var(--danger)', fontSize: '0.8rem', padding: '2px 6px' }}
                >
                  Deseleccionar ({selectedKanjiChars.size})
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    const first5 = new Set(filteredKanji.slice(0, 5).map(k => k.kanji));
                    setSelectedKanjiChars(first5);
                  }}
                  style={{ color: 'var(--primary)', fontSize: '0.8rem', padding: '2px 6px' }}
                  title="Seleccionar rápidamente los primeros 5 kanjis para IA"
                >
                  + Seleccionar 5 para IA
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Mostrando: <strong>{filteredKanji.length}</strong> de {kanjiList.length}
            </div>
          </div>

          {/* Kanji Cards Grid */}
          <div className="kanji-grid">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="kanji-card skeleton-shimmer skeleton-card" style={{ opacity: 0.75 }} />
              ))
            ) : filteredKanji.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1rem', marginBottom: 12 }}>No se encontraron kanjis con los filtros seleccionados.</p>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  onClick={() => {
                    setLevel('all');
                    setStatusFilter('all');
                    setSelectedTag('all');
                    setSearchTerm('');
                    updateParams('', 'list', drawingKanji);
                  }}
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              filteredKanji.slice(0, visibleCount).map((k) => {
                const isMastered = Boolean(appState.masteredKanji?.[k.kanji]);
                const isSelected = selectedKanjiChars.has(k.kanji);
                const tags = getKanjiTags(k.kanji, appState.kanjiTags);

                return (
                  <div 
                    key={k.kanji} 
                    className={`kanji-card ${isSelected ? 'selected-card' : ''}`}
                    style={{ 
                      borderColor: isSelected 
                        ? 'var(--primary)' 
                        : (isMastered ? 'rgba(34, 197, 94, 0.45)' : 'var(--border)'),
                      background: isSelected ? 'var(--primary-bg, rgba(99, 102, 241, 0.04))' : undefined,
                      boxShadow: isSelected ? '0 0 0 1px var(--primary)' : undefined
                    }}
                  >
                    {/* Línea 1: # trazos a la izq, Icono IA y botón Por aprender/aprendido a la der */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span className="vocab-tag" style={{ fontWeight: 700, margin: 0 }}>
                        {k.strokes ? `${k.strokes} trazos` : 'General'}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* Botón de Selección para IA */}
                        <button
                          type="button"
                          className={`kanji-select-btn ${isSelected ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = new Set(selectedKanjiChars);
                            if (next.has(k.kanji)) next.delete(k.kanji);
                            else next.add(k.kanji);
                            setSelectedKanjiChars(next);
                          }}
                          title={isSelected ? "Deseleccionar kanji" : "Seleccionar kanji para IA"}
                          aria-pressed={isSelected}
                        >
                          {isSelected ? (
                            <Check size={12} strokeWidth={2.5} />
                          ) : (
                            <Sparkles size={12} />
                          )}
                        </button>

                        {/* Botón claro de Estado: Aprendido / Por Aprender */}
                        <button
                          type="button"
                          className={`kanji-status-pill ${isMastered ? 'learned' : 'unlearned'}`}
                          onClick={() => toggleKanjiMastery(k.kanji)}
                          title={isMastered ? "Marcar como pendiente de aprender" : "Marcar como aprendido (+20 XP)"}
                        >
                          {isMastered ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>Aprendido</span>
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
                          className="kanji-tag-pill"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(tag);
                          }}
                          title={`Filtrar por #${tag}`}
                        >
                          #{tag}
                        </span>
                      ))}
                      <button
                        type="button"
                        className="kanji-add-tag-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTagEditorKanji(k);
                        }}
                        title="Gestionar etiquetas personalizadas de este kanji"
                      >
                        <Tag size={10} />
                        <span>Tag</span>
                      </button>
                    </div>

                    {/* Línea 3: Y después centrado en la card el resto */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, marginBottom: 12 }}>
                      <div className="kanji-big-char jp-text" style={{ margin: '0 auto', width: 78, height: 78, fontSize: '3.5rem' }}>
                        {k.kanji}
                      </div>
                      <button 
                        type="button"
                        className="btn btn-outline btn-xs" 
                        onClick={() => {
                          setDrawingKanji(k.kanji);
                          updateParams(searchTerm, undefined, k.kanji);
                        }}
                        title="Practicar orden de trazos"
                        style={{ borderRadius: 999, padding: '3px 12px' }}
                      >
                        ✍️ Trazos
                      </button>

                      <div style={{ marginTop: 4 }}>
                        <div className="kanji-meaning" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                          {k.meaning_es}
                        </div>
                        {k.meaning_en && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            ({k.meaning_en})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Readings centradas con audios */}
                    <div style={{ background: 'var(--bg-main)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', marginTop: 4, textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        {k.kunyomi && (
                          <div><strong><TerminologyTooltip termId="wago">Kun (japonesa):</TerminologyTooltip></strong> <span className="jp-text" style={{ color: 'var(--accent)', fontWeight: 600 }}>{k.kunyomi}</span></div>
                        )}
                        {k.onyomi && (
                          <div><strong><TerminologyTooltip termId="kango">On (china):</TerminologyTooltip></strong> <span className="jp-text" style={{ color: 'var(--primary)', fontWeight: 600 }}>{k.onyomi}</span></div>
                        )}
                        {!k.kunyomi && !k.onyomi && k.pronunciation && (
                          <div><strong>Lectura:</strong> <span className="jp-text" style={{ color: 'var(--primary)', fontWeight: 600 }}>{k.pronunciation}</span></div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                          <button 
                            type="button"
                            className="audio-btn" 
                            style={{ width: 28, height: 28 }}
                            onClick={() => audioManager.speak(getPrimaryKanjiReading(k) || k.kanji)}
                            title="Escuchar pronunciación del kanji"
                          >
                            <Volume2 size={14} />
                          </button>
                          <SpeechPractice 
                            targetText={k.kanji} 
                            targetKana={getPrimaryKanjiReading(k)} 
                            acceptableReadings={getAllKanjiReadings(k)}
                            compact={true} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mnemonic */}
                    {k.mnemonic && (
                      <div className="kanji-mnemonic">
                        💡 <strong>Mnemotecnia:</strong> {k.mnemonic}
                      </div>
                    )}

                    {/* Compound Words with Progressive Disclosure */}
                    {k.words && k.words.length > 0 && (() => {
                      const isExpanded = Boolean(expandedCompoundKanji[k.kanji]);
                      const displayWords = isExpanded || k.words.length <= 2 ? k.words : k.words.slice(0, 2);
                      const remainingCount = k.words.length - 2;

                      return (
                        <div className="kanji-words-list">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                              <TerminologyTooltip termId="jukugo">
                                <span>Palabras Compuestas ({k.words.length}):</span>
                              </TerminologyTooltip>
                            </span>
                            {k.words.length > 2 && (
                              <button
                                type="button"
                                onClick={() => toggleExpandWords(k.kanji)}
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
                          {displayWords.map((w, idx) => (
                            <div key={idx} className="kanji-word-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6, padding: '8px 10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                <span className="jp-text" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                  {w.word}{' '}
                                  <small style={{ color: 'var(--primary)', fontWeight: 'normal' }}>({w.reading})</small>
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, marginLeft: 8 }}>{w.meaning}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                  <button 
                                    type="button"
                                    className="audio-btn" 
                                    style={{ width: 26, height: 26, flexShrink: 0 }}
                                    onClick={() => audioManager.speak(w.reading || w.word)}
                                    title="Escuchar palabra"
                                  >
                                    <Volume2 size={13} />
                                  </button>
                                  <SpeechPractice 
                                    targetText={w.word} 
                                    targetKana={w.reading} 
                                    compact={true} 
                                  />
                                </div>
                              </div>
                              <div style={{ marginTop: 2, display: 'flex', justifyContent: 'flex-start' }}>
                                <PitchAccent word={w.word} reading={w.reading} mode="compact" size="sm" />
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                );
              })
            )}
          </div>

          {visibleCount < filteredKanji.length && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => setVisibleCount(prev => Math.min(prev + 32, filteredKanji.length))}
                style={{ padding: '8px 24px', borderRadius: '24px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                <span>Mostrar más kanjis ({visibleCount} de {filteredKanji.length})</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      ) : srsActive ? (
        /* MODO REPASO SRS: Solo kanjis aprendidos con espaciado FSRS */
        <SrsReview 
          queue={srsQueue}
          onRate={handleSrsReview}
          onUndo={handleSrsUndo}
          getCurrentCard={(item) => appState.masteredKanji?.[item.kanji]}
          onExit={() => {
            setSrsActive(false);
            updateParams(searchTerm, 'list', drawingKanji);
          }}
          backLabel="Volver a Kanjis"
          renderFront={(item) => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="vocab-tag" style={{ fontWeight: 700 }}>{item.level || 'N5'}</span>
                {item.strokes && (
                  <span style={{ fontSize: '0.78rem', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {item.strokes} trazos
                  </span>
                )}
                {item.radical && (
                  <span style={{ fontSize: '0.78rem', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    Radical: <strong className="jp-text">{item.radical}</strong>
                  </span>
                )}
              </div>

              <div 
                className="kanji-big-char jp-text" 
                style={{ 
                  width: 124, 
                  height: 124, 
                  fontSize: '4.8rem', 
                  lineHeight: 1, 
                  margin: '12px auto 18px auto',
                  borderRadius: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.12)',
                  flexShrink: 0
                }}
              >
                {item.kanji}
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: '0 0 16px 0', maxWidth: 420 }}>
                ¿Recuerdas las lecturas (Kun/On) y el significado en español?
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                <button 
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioManager.speak(getPrimaryKanjiReading(item) || item.kanji);
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
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 16 }}>
                🇪🇸 {item.meaning_es}
              </div>

              {/* Bloque ordenado de lecturas Kun y On */}
              <div style={{ 
                background: 'var(--bg-surface)', 
                padding: '16px', 
                borderRadius: 'var(--radius-md, 12px)', 
                border: '1px solid var(--border)',
                fontSize: '0.95rem', 
                textAlign: 'left', 
                marginBottom: 18,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12
              }}>
                {item.kunyomi && (
                  <div style={{ padding: '8px 12px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 2 }}>
                      Kun'yomi (Lectura Japonesa)
                    </div>
                    <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                      {item.kunyomi}
                    </div>
                  </div>
                )}
                {item.onyomi && (
                  <div style={{ padding: '8px 12px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 2 }}>
                      On'yomi (Lectura China)
                    </div>
                    <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {item.onyomi}
                    </div>
                  </div>
                )}
                {item.pronunciation && !item.kunyomi && !item.onyomi && (
                  <div style={{ padding: '8px 12px', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 2 }}>
                      Lectura
                    </div>
                    <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {item.pronunciation}
                    </div>
                  </div>
                )}
              </div>

              {item.mnemonic && (
                <div style={{ 
                  fontSize: '0.92rem', 
                  color: 'var(--text-main)', 
                  background: 'rgba(234, 179, 8, 0.08)', 
                  border: '1px solid rgba(234, 179, 8, 0.25)', 
                  padding: '12px 16px', 
                  borderRadius: 10, 
                  textAlign: 'left', 
                  marginBottom: 18,
                  lineHeight: 1.5
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--warning, #eab308)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                    💡 Mnemotécnica para recordar:
                  </div>
                  <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    {item.mnemonic}
                  </div>
                </div>
              )}

              {/* Pitch Accent */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <PitchAccent 
                  word={item.words?.[0]?.word || item.kanji} 
                  reading={item.words?.[0]?.reading || (item.pronunciation ? item.pronunciation.split(',')[0].trim() : '')} 
                  mode="full" 
                  size="md" 
                  showAudio={true} 
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
                <button 
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => audioManager.speak(getPrimaryKanjiReading(item) || item.kanji)}
                >
                  <Volume2 size={16} /> Escuchar
                </button>
                <SpeechPractice 
                  targetText={item.kanji} 
                  targetKana={getPrimaryKanjiReading(item)} 
                  acceptableReadings={getAllKanjiReadings(item)}
                />
                <button 
                  type="button"
                  className="btn btn-outline btn-sm" 
                  onClick={() => setDrawingKanji(item.kanji)}
                >
                  ✍️ Practicar Trazos
                </button>
              </div>

              {/* Vocabulario contextual */}
              {item.words && item.words.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>
                    📖 Vocabulario con este Kanji:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                    {item.words.slice(0, 4).map((w, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          background: 'var(--bg-surface)', 
                          padding: '8px 12px', 
                          borderRadius: 8, 
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8
                        }}
                      >
                        <div>
                          <div className="jp-text" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                            {w.word} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>({w.reading})</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {w.meaning}
                          </div>
                        </div>
                        <button 
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => audioManager.speak(w.reading || w.word)}
                          style={{ padding: 4, color: 'var(--text-muted)' }}
                          title="Escuchar palabra"
                        >
                          <Volume2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        />
      ) : (
        /* MODO ESTUDIAR KANJIS (Muestra solo los que faltan por aprender) */
        <div className="quiz-container" style={{ maxWidth: 680 }}>
          {currentStudyItem ? (
            <div>
              {/* Barra superior del modo Estudio */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <button 
                  type="button"
                  className="btn btn-outline btn-sm" 
                  onClick={() => {
                    setStudyActive(false);
                    updateParams(searchTerm, 'list', drawingKanji);
                  }}
                >
                  <ArrowLeft size={16} /> Volver a Kanjis
                </button>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Kanji {studyIndex + 1} de {studyItems.length} por aprender
                </span>
              </div>

              {/* Tarjeta de Estudio Focalizada */}
              <div className="card" style={{ padding: '24px 20px', textAlign: 'center', marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className="vocab-tag" style={{ fontWeight: 700 }}>{currentStudyItem.level || 'N5'}</span>
                  {currentStudyItem.strokes && (
                    <span style={{ fontSize: '0.78rem', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {currentStudyItem.strokes} trazos
                    </span>
                  )}
                </div>

                <div 
                  className="kanji-big-char jp-text"
                  style={{ width: 110, height: 110, fontSize: '4.5rem', margin: '0 auto 12px auto' }}
                >
                  {currentStudyItem.kanji}
                </div>

                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
                  {currentStudyItem.meaning_es}
                </div>

                {/* Lecturas Kun y On */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 16, 
                  flexWrap: 'wrap', 
                  background: 'var(--bg-main)', 
                  padding: '10px 14px', 
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  marginBottom: 14,
                  fontSize: '0.9rem'
                }}>
                  {currentStudyItem.kunyomi && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginRight: 6 }}>Kun:</span>
                      <strong className="jp-text" style={{ color: 'var(--accent)' }}>{currentStudyItem.kunyomi}</strong>
                    </div>
                  )}
                  {currentStudyItem.onyomi && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginRight: 6 }}>On:</span>
                      <strong className="jp-text" style={{ color: 'var(--primary)' }}>{currentStudyItem.onyomi}</strong>
                    </div>
                  )}
                </div>

                {/* Mnemotecnia */}
                {currentStudyItem.mnemonic && (
                  <div style={{ 
                    fontSize: '0.88rem', 
                    background: 'rgba(234, 179, 8, 0.08)', 
                    border: '1px solid rgba(234, 179, 8, 0.25)', 
                    padding: '8px 12px', 
                    borderRadius: 8, 
                    color: 'var(--text-muted)',
                    marginBottom: 14,
                    textAlign: 'left'
                  }}>
                    💡 <strong>Mnemotecnia:</strong> {currentStudyItem.mnemonic}
                  </div>
                )}

                {/* Acciones de trazos y audio */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                  <button 
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => audioManager.speak(getPrimaryKanjiReading(currentStudyItem) || currentStudyItem.kanji)}
                  >
                    <Volume2 size={15} /> Escuchar
                  </button>
                  <button 
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setDrawingKanji(currentStudyItem.kanji)}
                  >
                    ✍️ Practicar Trazos
                  </button>
                </div>

                {/* Botón directo de "Marcar como Aprendido" */}
                <div style={{ paddingTop: 14, borderTop: '1px dashed var(--border)' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', maxWidth: 320, margin: '0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={() => handleMarkLearnedFromStudy(currentStudyItem.kanji)}
                  >
                    <CheckCircle2 size={18} />
                    <span>✓ Marcar como Aprendido (+20 XP)</span>
                  </button>
                </div>
              </div>

              {/* Caja de validación interactiva de lectura */}
              <div className="typing-box">
                <div className="typing-prompt">
                  <span>O escribe la lectura para validar y aprender:</span>
                  <span className="ime-badge">🇯🇵 IME Romaji → Kana</span>
                </div>

                <div className="typing-input-row">
                  <input 
                    type="text" 
                    className="japanese-input jp-text"
                    placeholder="Escribe la lectura en hiragana..."
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
                        handleValidateStudyReading();
                      }
                    }}
                    autoFocus
                  />
                  <button type="button" className="btn btn-primary" onClick={() => handleValidateStudyReading()}>
                    Validar
                  </button>
                  <button type="button" className="btn btn-outline" onClick={handleStudyHint} title="Revelar primer kana">
                    <Lightbulb size={16} /> Pista
                  </button>
                </div>

                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>O practica pronunciando:</span>
                  <SpeechPractice 
                    targetText={currentStudyItem.kanji} 
                    targetKana={getPrimaryKanjiReading(currentStudyItem)} 
                    acceptableReadings={getAllKanjiReadings(currentStudyItem)}
                    onMatch={() => {
                      handleMarkLearnedFromStudy(currentStudyItem.kanji);
                    }}
                  />
                </div>

                {studyFeedback && (
                  <div className={`typing-feedback ${studyFeedback.type}`} style={{ marginTop: 12 }}>
                    <div>{studyFeedback.msg}</div>
                    {studyFeedback.reading && (
                      <div className="jp-text" style={{ fontSize: '1.2rem', marginTop: 4 }}>
                        {studyFeedback.reading}
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
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏆</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
                ¡Todos los kanjis aprendidos!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 20, maxWidth: 440, margin: '0 auto 20px auto', lineHeight: 1.45 }}>
                No quedan más kanjis por aprender con los filtros actuales. Pásate al Repaso SRS para consolidarlos en tu memoria a largo plazo.
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
                    setStudyActive(false);
                    updateParams(searchTerm, 'list', drawingKanji);
                  }}
                >
                  Volver a la Biblioteca
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL GESTOR DE ETIQUETAS (TAGS) PERSONALIZADAS */}
      {tagEditorKanji && (
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
                setTagEditorKanji(null);
                setNewTagInput('');
              }}
              title="Cerrar"
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="kanji-big-char jp-text" style={{ width: 50, height: 50, fontSize: '2rem' }}>
                {tagEditorKanji.kanji}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Etiquetas de 【{tagEditorKanji.kanji}】
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {tagEditorKanji.meaning_es}
                </div>
              </div>
            </div>

            {/* Etiquetas activas */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                Etiquetas asignadas:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {getKanjiTags(tagEditorKanji.kanji, appState.kanjiTags).map(tag => (
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
                {getKanjiTags(tagEditorKanji.kanji, appState.kanjiTags).length === 0 && (
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
                {POPULAR_TAG_SUGGESTIONS.map(sugg => {
                  const currentTags = getKanjiTags(tagEditorKanji.kanji, appState.kanjiTags);
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
                  setTagEditorKanji(null);
                  setNewTagInput('');
                }}
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWING MODAL - 筆順 STROKE ORDER */}
      {drawingKanji && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ maxWidth: 420, width: '100%', position: 'relative', textAlign: 'center', padding: '22px 20px 18px 20px', maxHeight: '94vh', overflowY: 'auto' }}>
            <button 
              type="button"
              className="btn btn-outline btn-sm" 
              style={{ position: 'absolute', top: 12, right: 12, borderRadius: '50%', width: 32, height: 32, padding: 0 }}
              onClick={() => {
                setDrawingKanji(null);
                updateParams(searchTerm, undefined, null);
              }}
              title="Cerrar ventana de trazos"
            >
              ✕
            </button>
            {(() => {
              const currentK = kanjiList.find(k => k.kanji === drawingKanji);
              return (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span className="jp-text" style={{ fontSize: '1.6rem', color: 'var(--primary)', lineHeight: 1 }}>{drawingKanji}</span>
                    <span>{currentK?.meaning_es ? `— ${currentK.meaning_es}` : ''}</span>
                  </div>
                  {(currentK?.kunyomi || currentK?.onyomi) && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {currentK.kunyomi && (
                        <span>Kun: <strong className="jp-text" style={{ color: 'var(--accent)' }}>{currentK.kunyomi}</strong></span>
                      )}
                      {currentK.kunyomi && currentK.onyomi && <span> • </span>}
                      {currentK.onyomi && (
                        <span>On: <strong className="jp-text" style={{ color: 'var(--primary)' }}>{currentK.onyomi}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
            
            <KanjiDraw 
              character={drawingKanji} 
              size={260} 
              initialMode="order"
              onQuizComplete={() => {
                const newXp = (appState.xp || 0) + 10;
                onUpdateState({
                  ...appState,
                  xp: newXp
                });
              }} 
            />

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  const targetK = drawingKanji;
                  setDrawingKanji(null);
                  if (contextApp?.openPracticePad) {
                    contextApp.openPracticePad({
                      text: targetK,
                      title: `Kanji: ${targetK}`,
                      source: 'kanji',
                      initialChar: targetK
                    });
                  } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                    window.__nihongoOpenPracticePad({
                      text: targetK,
                      title: `Kanji: ${targetK}`,
                      source: 'kanji',
                      initialChar: targetK
                    });
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  fontSize: '0.82rem'
                }}
              >
                <PenTool size={14} />
                <span>Abrir en Cuaderno Avanzado</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Bar para Kanjis Seleccionados */}
      {selectedKanjiChars.size > 0 && (
        <div className="selection-floating-bar" role="region" aria-label="Acciones para kanjis seleccionados">
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
                {selectedKanjiChars.size}
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                {selectedKanjiChars.size === 1 ? 'kanji seleccionado' : 'kanjis seleccionados'}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setSelectedKanjiChars(new Set())}
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
            {Array.from(selectedKanjiChars).slice(0, 10).map(char => (
              <span key={char} className="jp-text selection-floating-chip">
                {char}
              </span>
            ))}
            {selectedKanjiChars.size > 10 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center', paddingLeft: 4 }}>
                +{selectedKanjiChars.size - 10} más
              </span>
            )}
          </div>

          <div className="selection-floating-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                const combinedText = Array.from(selectedKanjiChars).join('');
                if (contextApp?.openPracticePad) {
                  contextApp.openPracticePad({
                    text: combinedText,
                    title: `Práctica de Kanjis Seleccionados (${selectedKanjiChars.size})`,
                    source: 'kanji'
                  });
                } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                  window.__nihongoOpenPracticePad({
                    text: combinedText,
                    title: `Práctica de Kanjis Seleccionados (${selectedKanjiChars.size})`,
                    source: 'kanji'
                  });
                }
              }}
              title="Abrir cuaderno con todos los kanjis seleccionados"
            >
              <PenTool size={14} />
              <span>Cuaderno</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setAiGenType('conversation');
                setIsAIGeneratorOpen(true);
              }}
              title="Generar un diálogo personalizado con los kanjis seleccionados"
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
              title="Generar historia con los kanjis seleccionados"
            >
              <Sparkles size={14} />
              <span>Historia</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Generador con IA para Kanjis */}
      <AIGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        initialType={aiGenType}
        initialItems={selectedKanjisForAI}
        itemType="kanji"
        defaultLevel={level}
        appState={appState}
        onUpdateState={onUpdateState}
        authUser={authUser}
      />
    </div>
  );
}
