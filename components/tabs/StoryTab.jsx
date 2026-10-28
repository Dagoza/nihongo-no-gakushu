'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import storiesData from '../../data/stories.json';
import furiganaDict from '../../data/furigana_dict.js';
import audioManager from '../../lib/audioManager';
import { Volume2, Sparkles, BookOpen, PenTool, Info, Search, ArrowRight, ArrowLeft, SlidersHorizontal, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, X, Check, CheckCircle2 } from 'lucide-react';
import * as wanakana from 'wanakana';
import { useApp } from '../../lib/AppContext';
import { triggerGrandConfetti } from '../../lib/confetti';

// Lazy loading con code-splitting
const SpeechPractice = dynamic(() => import('../features/SpeechPractice'), { ssr: false });
const ComprehensionQuiz = dynamic(() => import('../features/ComprehensionQuiz'), { ssr: false });

export default function StoryTab({ 
  userState, 
  onRecordActivity, 
  appState, 
  onUpdateState, 
  activeStoryId, 
  onSelectStory, 
  onNavigate,
  initialStoryId = null,
  initialChapter = null,
  initialMode = null,
  onParamsChange
}) {
  const contextApp = useApp();
  const showConfirm = contextApp?.showConfirm || (() => Promise.resolve(true));
  const allStories = useMemo(() => {
    const defaultStories = storiesData || [];
    const customStories = appState?.savedStories || [];
    return [...defaultStories, ...customStories];
  }, [appState?.savedStories]);

  const [selectedStoryId, setSelectedStoryId] = useState(initialStoryId || null);
  const [currentChapter, setCurrentChapter] = useState(initialChapter ? parseInt(initialChapter, 10) : 1);
  const [readingMode, setReadingMode] = useState(initialMode || 'natural'); // 'natural', 'hiragana', 'kanji_only'
  const [storyLevelFilter, setStoryLevelFilter] = useState('Todos'); // 'Todos', 'N5', 'N4', 'N3', 'N2', 'N1', 'Personalizadas'
  const [storyStatusFilter, setStoryStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [storySearch, setStorySearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = (storyLevelFilter !== 'Todos' ? 1 : 0) + (storyStatusFilter !== 'all' ? 1 : 0);
  const handleResetFilters = () => {
    setStoryLevelFilter('Todos');
    setStoryStatusFilter('all');
    setStorySearch('');
  };

  useEffect(() => {
    if (initialStoryId && allStories.some(s => s.id === initialStoryId)) {
      setSelectedStoryId(initialStoryId);
    } else if (activeStoryId && allStories.some(s => s.id === activeStoryId)) {
      setSelectedStoryId(activeStoryId);
    } else if (!initialStoryId && !activeStoryId) {
      setSelectedStoryId(null);
    }
  }, [initialStoryId, activeStoryId, allStories]);

  useEffect(() => {
    if (initialChapter !== null && initialChapter !== undefined) {
      const ch = parseInt(initialChapter, 10);
      if (ch) setCurrentChapter(ch);
    }
  }, [initialChapter]);

  useEffect(() => {
    if (initialMode && ['natural', 'hiragana', 'kanji_only'].includes(initialMode)) {
      setReadingMode(initialMode);
    }
  }, [initialMode]);

  // Handle browser Back/Forward navigation smoothly
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      const chapter = params.get('chapter');
      const mode = params.get('mode');
      if (id && allStories.some(s => s.id === id)) {
        setSelectedStoryId(id);
      } else {
        setSelectedStoryId(null);
      }
      if (chapter) {
        const ch = parseInt(chapter, 10);
        if (ch) setCurrentChapter(ch);
      }
      if (mode && ['natural', 'hiragana', 'kanji_only'].includes(mode)) {
        setReadingMode(mode);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allStories]);

  const completedStories = appState?.completedStories || userState?.completedStories || {};
  const isStoryCompleted = (s) => {
    if (!s) return false;
    return !!(completedStories[s.id] || (s.sentences && s.sentences.length > 0 && s.sentences.every(sent => userState?.completedSentences?.[sent.id])));
  };

  const toggleStoryCompleted = (storyId) => {
    if (!onUpdateState) return;
    const stateObj = appState || userState || {};
    const curCompleted = stateObj.completedStories || {};
    const isDone = !!curCompleted[storyId];
    const updated = {
      ...curCompleted,
      [storyId]: !isDone
    };
    if (!isDone) {
      triggerGrandConfetti();
    }
    onUpdateState({
      ...stateObj,
      completedStories: updated,
      xp: (stateObj.xp || 0) + (!isDone ? 30 : 0)
    });
  };

  const completedStoriesCount = allStories.filter(isStoryCompleted).length;
  const storyProgressPercent = allStories.length > 0 ? Math.round((completedStoriesCount / allStories.length) * 100) : 0;
  const totalMasteredSentences = Object.keys(userState?.completedSentences || {}).length;

  const handleOpenStory = (id) => {
    setSelectedStoryId(id);
    setCurrentChapter(1);
    if (onSelectStory) onSelectStory(id);
    if (onParamsChange) onParamsChange({ id, chapter: 1, mode: readingMode });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedStoryId(null);
    if (onSelectStory) onSelectStory(null);
    if (onParamsChange) onParamsChange({ id: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const story = useMemo(() => {
    if (!selectedStoryId) return null;
    return allStories.find(s => s.id === selectedStoryId) || null;
  }, [allStories, selectedStoryId]);

  const filteredStories = useMemo(() => {
    return allStories.filter(s => {
      const lvl = s.level || s.difficulty || 'N5';
      const matchesLevel = 
        storyLevelFilter === 'Todos' ? true :
        storyLevelFilter === 'Personalizadas' ? s.isCustom :
        lvl === storyLevelFilter;
      if (!matchesLevel) return false;

      const isDone = isStoryCompleted(s);
      if (storyStatusFilter === 'completed' && !isDone) return false;
      if (storyStatusFilter === 'pending' && isDone) return false;

      if (storySearch.trim()) {
        const q = storySearch.toLowerCase().trim();
        const titleJp = (s.title || '').toLowerCase();
        const titleEs = (s.title_es || s.title_en || s.description || '').toLowerCase();
        return titleJp.includes(q) || titleEs.includes(q);
      }
      return true;
    });
  }, [allStories, storyLevelFilter, storyStatusFilter, storySearch, completedStories, userState?.completedSentences]);

  const [selectedSentenceId, setSelectedSentenceId] = useState('sent_1');
  const [typingInput, setTypingInput] = useState('');
  const [typingFeedback, setTypingFeedback] = useState(null);

  const paragraphs = useMemo(() => {
    if (!story) return [];
    if (story.paragraphs && story.paragraphs.length > 0) return story.paragraphs;
    return [
      {
        chapter: 1,
        title: story.title || 'Capítulo 1',
        japanese: story.japanese || '',
        hiragana: story.hiragana || '',
        translation_es: story.translation_es || ''
      }
    ];
  }, [story]);

  const chapter = paragraphs.find(p => p.chapter === currentChapter) || paragraphs[0] || null;

  // Distribute sentences cleanly by chapter
  const storySentences = story?.sentences && story.sentences.length > 0 ? story.sentences : [];
  const chapterSentences = useMemo(() => {
    if (!story) return [];
    if (story.isCustom) return storySentences;
    const matching = storySentences.filter(s => s.chapter === currentChapter);
    if (matching.length > 0) return matching;

    const chapterRanges = {
      1: [0, 12],
      2: [12, 26],
      3: [26, 40],
      4: [40, 58]
    };
    const [start, end] = chapterRanges[currentChapter] || [0, 15];
    return storySentences.slice(start, end);
  }, [story, currentChapter, storySentences]);

  useEffect(() => {
    if (chapterSentences.length > 0 && !chapterSentences.some(s => s.id === selectedSentenceId)) {
      setSelectedSentenceId(chapterSentences[0].id);
      setTypingInput('');
      setTypingFeedback(null);
    }
  }, [chapterSentences, selectedSentenceId]);

  const activeSentence = chapterSentences.find(s => s.id === selectedSentenceId) || chapterSentences[0];

  const handlePlayChapter = () => {
    audioManager.setPlaylist(chapterSentences, 0);
    audioManager.speak(chapterSentences[0].japanese, { autoAdvance: true });
  };

  const handleSentenceClick = (sentence) => {
    setSelectedSentenceId(sentence.id);
    audioManager.speak(sentence.japanese);
  };

  const handleWordClick = (e, word) => {
    e.stopPropagation();
    audioManager.speak(word);
  };

  const handleCheckTyping = () => {
    if (!activeSentence) return;
    const cleanUser = typingInput.replace(/[、。！？「」\s]/g, '').trim();
    const cleanTarget = activeSentence.clean_target;

    if (!cleanUser) {
      setTypingFeedback({ type: 'warning', msg: 'Por favor escribe tu respuesta en japonés con tu teclado.' });
      return;
    }

    if (cleanUser === cleanTarget) {
      setTypingFeedback({ type: 'success', msg: '🎉 ¡Perfecto! Escritura en japonés completada correctamente (+30 XP).' });
      onRecordActivity(true, true, activeSentence.id);
      audioManager.speak(activeSentence.japanese);
    } else {
      setTypingFeedback({
        type: 'error',
        msg: `Casi lo tienes. Revisa caracteres o kanji. Tu entrada: "${typingInput}" vs Objetivo: "${activeSentence.japanese}"`
      });
      onRecordActivity(false, true);
    }
  };

  const handleHint = () => {
    if (!activeSentence) return;
    setTypingInput(activeSentence.japanese.slice(0, Math.ceil(activeSentence.japanese.length / 2)));
  };

  const renderRubyParagraph = (rawJp, chapterObj = null) => {
    if (!rawJp) return null;
    const chapterDict = chapterObj?.rubyDict || {};
    const mergedDict = { ...(furiganaDict || {}), ...chapterDict };

    // Sort keys by descending length to match compound kanji before individual characters
    const sortedKeys = Object.keys(mergedDict).sort((a, b) => b.length - a.length);
    if (sortedKeys.length === 0) return <div>{rawJp}</div>;

    const escapedKeys = sortedKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const reg = new RegExp(escapedKeys.join('|'), 'g');
    const html = rawJp.replace(reg, (k) => `<ruby class="ruby-clickable furigana-ruby" data-word="${k}">${k}<rt>${mergedDict[k]}</rt></ruby>`);

    return (
      <div 
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={(e) => {
          const ruby = e.target.closest('ruby');
          if (ruby) {
            const word = ruby.getAttribute('data-word') || ruby.innerText;
            handleWordClick(e, word);
          }
        }}
      />
    );
  };

  const currentStoryIndex = allStories.findIndex(s => s.id === story?.id);
  const prevStory = currentStoryIndex > 0 ? allStories[currentStoryIndex - 1] : null;
  const nextStory = currentStoryIndex >= 0 && currentStoryIndex < allStories.length - 1 ? allStories[currentStoryIndex + 1] : null;
  const isCurrentStoryDone = story ? isStoryCompleted(story) : false;

  // VIEW 1: OVERVIEW LIST OF ALL STORIES (when no story is selected)
  if (!story) {
    return (
      <div className="section-panel active curriculum-page-container">
        {/* Top Hero Banner */}
        <div className="module-hero-card">
          <div className="module-hero-content">
            <div className="module-hero-title-row">
              <div 
                className="module-hero-icon-badge" 
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)' }}
              >
                <BookOpen size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span className="module-category-pill" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.12)' }}>
                    Aprender & Lectura Graduada
                  </span>
                  <button
                    type="button"
                    className="tour-info-shortcut-btn"
                    onClick={() => {
                      if (contextApp?.openTour) {
                        contextApp.openTour('story');
                      } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
                        window.__nihongoOpenTour('story');
                      }
                    }}
                    title="Ver guía y explicación de Historias y Generador IA en el tour"
                    aria-label="Guía de Historias"
                  >
                    <Info size={14} />
                    <span>Guía</span>
                  </button>
                </div>
                <h1 className="module-hero-title">Historias Interactivas & Lectura Graduada</h1>
                <p className="module-hero-subtitle">
                  Lecturas inmersivas graduadas por nivel JLPT (N5 a N1) con audio sincronizado, furigana interactivo, práctica de caligrafía y creación con Inteligencia Artificial.
                </p>
              </div>
            </div>
            
            <div className="module-hero-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate && onNavigate('saved')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                title="Ir a Guardados para crear una nueva historia con tus palabras"
              >
                <Sparkles size={14} />
                <span>+ Crear Historia IA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overall Progress Banner */}
        <div className="card ruta-progress-banner" style={{ marginBottom: 24, padding: '16px 20px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <span>📖</span> Biblioteca de Historias & Progreso de Lectura
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Lee historias graduadas, practica escritura japonesa y evalúa tu comprensión lectora.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Historias Leídas</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#8b5cf6' }}>
                  {completedStoriesCount}/{allStories.length} ({storyProgressPercent}%)
                </div>
              </div>

              <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Oraciones Dominadas</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981' }}>
                  {totalMasteredSentences}
                </div>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 8, background: 'var(--bg-main)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div 
              style={{ 
                width: `${storyProgressPercent}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)', 
                borderRadius: 999, 
                transition: 'width 0.4s ease' 
              }} 
            />
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
                placeholder="Buscar historia por título en japonés o español..."
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
              />
              {storySearch && (
                <button
                  type="button"
                  onClick={() => setStorySearch('')}
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

        {/* Filtros Integrados (Colapsable) */}
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

            {/* Nivel / Dificultad */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                Nivel JLPT / Categoría:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Todos', 'N5', 'N4', 'N3', 'N2', 'N1', 'Personalizadas'].map((lvl) => {
                  const count = 
                    lvl === 'Todos' ? allStories.length :
                    lvl === 'Personalizadas' ? allStories.filter(s => s.isCustom).length :
                    allStories.filter(s => (s.level || s.difficulty) === lvl).length;
                  const isActive = storyLevelFilter === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      className={`btn btn-xs ${isActive ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setStoryLevelFilter(lvl)}
                      style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                    >
                      {lvl === 'Todos' ? `Todas (${count})` :
                       lvl === 'Personalizadas' ? `✨ Creadas (${count})` :
                       `${lvl} (${count})`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estado */}
            <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                Estado:
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: `Todas (${allStories.length})` },
                  { id: 'pending', label: `⏳ Pendientes (${allStories.length - completedStoriesCount})` },
                  { id: 'completed', label: `✓ Leídas (${completedStoriesCount})` }
                ].map(st => (
                  <button
                    key={st.id}
                    type="button"
                    className={`btn btn-xs ${storyStatusFilter === st.id ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setStoryStatusFilter(st.id)}
                    style={{ minWidth: 38, padding: '4px 10px', fontSize: '0.8rem' }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stories List - Curriculum Card Pattern */}
        <div className="curriculum-list">
          {filteredStories.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1rem', marginBottom: 12 }}>No se encontraron historias con los filtros seleccionados.</p>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                onClick={handleResetFilters}
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            filteredStories.map((s) => {
              const isDone = isStoryCompleted(s);
              const lvl = s.level || s.difficulty || 'N5';
              const lvlColor = 
                lvl === 'N5' ? '#059669' :
                lvl === 'N4' ? '#2563eb' :
                lvl === 'N3' ? '#d97706' : 'var(--primary)';
              const lvlBg = 
                lvl === 'N5' ? 'rgba(16, 185, 129, 0.12)' :
                lvl === 'N4' ? 'rgba(99, 102, 241, 0.12)' :
                lvl === 'N3' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(99, 102, 241, 0.12)';

              const totalChapters = s.paragraphs?.length || 1;
              const totalSentences = s.sentences?.length || 0;
              const hasQuiz = s.comprehension_questions && s.comprehension_questions.length > 0;

              return (
                <div 
                  key={s.id} 
                  className={`curriculum-step-card ${isDone ? 'completed' : ''}`}
                  onClick={() => handleOpenStory(s.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="step-card-header">
                    <div 
                      className="step-number-badge"
                      style={{ 
                        background: isDone ? 'rgba(16, 185, 129, 0.12)' : lvlBg, 
                        color: isDone ? 'var(--success)' : lvlColor 
                      }}
                    >
                      <BookOpen size={24} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                        {s.isCustom ? 'IA' : lvl}
                      </span>
                    </div>

                    <div className="step-header-content">
                      <div className="step-header-main">
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 800, 
                            padding: '2px 8px', 
                            borderRadius: 4, 
                            background: lvlBg, 
                            color: lvlColor 
                          }}>
                            {s.isCustom ? '✨ Creada con IA' : `Nivel ${lvl}`}
                          </span>

                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 700, 
                            padding: '2px 8px', 
                            borderRadius: 4, 
                            background: 'var(--bg-main)', 
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)' 
                          }}>
                            📑 {totalChapters} {totalChapters === 1 ? 'capítulo' : 'capítulos'}
                          </span>

                          {totalSentences > 0 && (
                            <span style={{ 
                              fontSize: '0.72rem', 
                              fontWeight: 700, 
                              padding: '2px 8px', 
                              borderRadius: 4, 
                              background: 'var(--bg-main)', 
                              border: '1px solid var(--border)',
                              color: 'var(--text-muted)' 
                            }}>
                              🔍 {totalSentences} oraciones desglosadas
                            </span>
                          )}

                          {hasQuiz && (
                            <span style={{ 
                              fontSize: '0.72rem', 
                              fontWeight: 700, 
                              padding: '2px 8px', 
                              borderRadius: 4, 
                              background: 'rgba(236, 72, 153, 0.12)', 
                              color: '#db2777' 
                            }}>
                              🎯 Quiz {s.comprehension_questions.length} preguntas
                            </span>
                          )}

                          {s.source_modules && s.source_modules.length > 0 && (
                            <span style={{ 
                              fontSize: '0.72rem', 
                              fontWeight: 600, 
                              padding: '2px 8px', 
                              borderRadius: 4, 
                              background: 'var(--bg-surface)', 
                              border: '1px solid var(--border)', 
                              color: 'var(--text-muted)' 
                            }}>
                              🔗 {s.source_modules.map(m => `M${m}`).join(', ')}
                            </span>
                          )}
                        </div>

                        <h3 className="step-title jp-text" style={{ fontSize: '1.25rem', marginBottom: 4 }}>
                          {s.title}
                        </h3>
                        <p className="step-subtitle" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
                          {s.title_es || s.description || 'Lectura graduada interactiva'}
                        </p>
                      </div>

                      <div className="step-card-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={`step-card-check-btn ${isDone ? 'checked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStoryCompleted(s.id);
                          }}
                          title={isDone ? 'Historia leída (Clic para desmarcar)' : 'Marcar historia como leída (+30 XP)'}
                        >
                          <div className={`step-checkbox-square ${isDone ? 'checked' : ''}`}>
                            {isDone ? <Check size={12} strokeWidth={3} /> : null}
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                            {isDone ? 'Leída ✓' : 'Marcar'}
                          </span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenStory(s.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                        >
                          <span>Leer Historia</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Excerpt preview */}
                  {s.paragraphs?.[0] && (
                    <div className="step-card-details" style={{ fontSize: '0.86rem' }}>
                      <div style={{ color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.5 }}>
                        «{s.paragraphs[0].japanese?.slice(0, 95)}...»
                      </div>
                      {s.paragraphs[0].translation_es && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {s.paragraphs[0].translation_es.slice(0, 110)}...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // VIEW 2: FULL DETAIL VIEW OF THE SELECTED STORY
  return (
    <div className="section-panel active curriculum-detail-view story-page-container">
      {/* Detail Top Navigation Toolbar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 12, 
        marginBottom: 18,
        paddingBottom: 14,
        borderBottom: '1px solid var(--border)'
      }}>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handleBackToList}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
        >
          <ArrowLeft size={16} />
          <span>Volver a la Biblioteca de Historias</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {prevStory && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleOpenStory(prevStory.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              title={`Historia anterior: ${prevStory.title}`}
            >
              <ChevronLeft size={14} />
              <span>Anterior</span>
            </button>
          )}

          {nextStory && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleOpenStory(nextStory.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              title={`Siguiente historia: ${nextStory.title}`}
            >
              <span>Siguiente</span>
              <ChevronRight size={14} />
            </button>
          )}

          <button
            type="button"
            className={`btn ${isCurrentStoryDone ? 'btn-outline' : 'btn-primary'} btn-sm`}
            onClick={() => toggleStoryCompleted(story.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <CheckCircle2 size={16} color={isCurrentStoryDone ? 'var(--success)' : '#fff'} />
            <span>{isCurrentStoryDone ? 'Historia Leída ✓' : 'Marcar como Leída (+30 XP)'}</span>
          </button>
        </div>
      </div>

      {story.isCustom && (
        <div className="custom-story-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} className="text-primary" />
            <div>
              <strong>Historia Personalizada:</strong> Creada a partir de tus palabras guardadas.
              {story.wordsUsed && story.wordsUsed.length > 0 && (
                <span className="words-snippet"> Palabras: {story.wordsUsed.join(', ')}</span>
              )}
            </div>
          </div>
          <button 
            className="btn btn-outline btn-sm" 
            style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
            onClick={async () => {
              const ok = await showConfirm({
                title: '¿Eliminar historia?',
                message: '¿Estás seguro de que deseas eliminar esta historia generada de tu biblioteca?',
                confirmText: 'Eliminar',
                isDestructive: true
              });
              if (ok) {
                const updatedStories = (appState?.savedStories || []).filter(s => s.id !== story.id);
                onUpdateState({ ...appState, savedStories: updatedStories });
                setSelectedStoryId(allStories[0]?.id || null);
              }
            }}
          >
            Eliminar
          </button>
        </div>
      )}

      {/* Active Story Header */}
      <div className="section-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              padding: '2px 8px', 
              borderRadius: 4, 
              background: (story.level || story.difficulty) === 'N5' ? 'rgba(16, 185, 129, 0.15)' : (story.level || story.difficulty) === 'N4' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: (story.level || story.difficulty) === 'N5' ? '#059669' : (story.level || story.difficulty) === 'N4' ? '#2563eb' : '#d97706'
            }}>
              Nivel {story.level || story.difficulty || 'JLPT'}
            </span>
            {story.category && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                • {story.category}
              </span>
            )}
          </div>

          <h2 className="section-title jp-text" style={{ margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📖</span>
            <span>{story.title}</span>
          </h2>

          {story.title_es && (
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
              🇪🇸 {story.title_es}
            </p>
          )}

          {/* Curriculum Modules Links */}
          {story.source_modules && story.source_modules.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                🔗 Módulos del Currículum Asociados:
              </span>
              {story.source_modules.map((modNum) => (
                <Link
                  key={modNum}
                  href={`/curriculum?step=${modNum}`}
                  className="btn btn-outline btn-xs"
                  style={{ fontSize: '0.75rem', padding: '2px 8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  title={`Ver teoría y ejercicios del Módulo ${modNum}`}
                >
                  <span>Módulo {modNum}</span>
                  <ArrowRight size={11} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="tour-info-shortcut-btn"
          onClick={() => {
            if (contextApp?.openTour) {
              contextApp.openTour('story');
            } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
              window.__nihongoOpenTour('story');
            }
          }}
          title="Ver guía de Historias y Generador IA"
          aria-label="Información de Historias"
        >
          <Info size={14} />
          <span>Guía</span>
        </button>
      </div>

      {/* Story Controls Bar */}
      <div className="story-controls">
        <div className="reading-mode-selector">
          <button 
            className={`mode-btn ${readingMode === 'natural' ? 'active' : ''}`}
            onClick={() => {
              setReadingMode('natural');
              if (onParamsChange) onParamsChange({ id: selectedStoryId, chapter: currentChapter, mode: 'natural' });
            }}
          >
            🎌 Kanji + Furigana
          </button>
          <button 
            className={`mode-btn ${readingMode === 'hiragana' ? 'active' : ''}`}
            onClick={() => {
              setReadingMode('hiragana');
              if (onParamsChange) onParamsChange({ id: selectedStoryId, chapter: currentChapter, mode: 'hiragana' });
            }}
          >
            あ Solo Hiragana
          </button>
          <button 
            className={`mode-btn ${readingMode === 'kanji_only' ? 'active' : ''}`}
            onClick={() => {
              setReadingMode('kanji_only');
              if (onParamsChange) onParamsChange({ id: selectedStoryId, chapter: currentChapter, mode: 'kanji_only' });
            }}
          >
            漢 Solo Kanji
          </button>
        </div>

        <button className="btn btn-outline btn-sm" onClick={handlePlayChapter}>
          <Volume2 size={16} />
          <span>Escuchar Capítulo Completo</span>
        </button>
      </div>

      {/* Chapter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {paragraphs.map(p => (
          <button
            key={p.chapter}
            className={`btn ${p.chapter === currentChapter ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => {
              setCurrentChapter(p.chapter);
              setTypingFeedback(null);
              if (onParamsChange) onParamsChange({ id: selectedStoryId, chapter: p.chapter, mode: readingMode });
            }}
          >
            Capítulo {p.chapter}: {p.title?.split(' ')?.[0] || `Capítulo ${p.chapter}`}
          </button>
        ))}
      </div>

      {/* Story Main Reader */}
      <div className={`story-content-box ${readingMode === 'kanji_only' ? 'hide-furigana' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
            Capítulo {chapter.chapter}: {chapter.title}
          </h3>
          <button 
            className="audio-btn" 
            title="Escuchar párrafo" 
            onClick={() => audioManager.speak(chapter.japanese)}
          >
            <Volume2 size={16} />
          </button>
        </div>

        <div className="jp-text" style={{ lineHeight: 2.3, fontSize: '1.35rem' }}>
          {readingMode === 'hiragana' ? (
            <p>{chapter.hiragana}</p>
          ) : (
            renderRubyParagraph(chapter.japanese, chapter)
          )}
        </div>

        <details style={{ marginTop: '24px', padding: '14px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <summary style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>
            🇪🇸 Ver traducción en español del Capítulo {chapter.chapter}
          </summary>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            {chapter.translation_es}
          </p>
        </details>
      </div>

      {/* Sentence Breakdown & IME Typing Practice */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔍</span> Desglose Oración por Oración y Práctica de Teclado
          </h3>
        </div>

        {activeSentence && (
          <div className="breakdown-card" style={{ borderLeft: '5px solid var(--primary)' }}>
            <div className="breakdown-header">
              <div className="breakdown-jp jp-text">
                {renderRubyParagraph(activeSentence.japanese, chapter)}
              </div>
              <div className="breakdown-actions">
                <button 
                  className="audio-btn"
                  onClick={() => audioManager.speak(activeSentence.japanese)}
                  title="Escuchar oración"
                >
                  <Volume2 size={16} />
                  <span className="breakdown-audio-label">Escuchar</span>
                </button>
                <SpeechPractice 
                  targetText={activeSentence.japanese} 
                  targetKana={activeSentence.clean_target}
                  onMatch={() => {
                    // Optional XP or celebration
                  }}
                />
                <button
                  type="button"
                  className="audio-btn"
                  onClick={() => {
                    if (contextApp?.openPracticePad) {
                      contextApp.openPracticePad({
                        text: activeSentence.japanese,
                        kana: activeSentence.clean_target,
                        title: `Historia: ${chapter?.title || 'Capítulo ' + chapter?.chapter}`,
                        source: 'story'
                      });
                    } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                      window.__nihongoOpenPracticePad({
                        text: activeSentence.japanese,
                        kana: activeSentence.clean_target,
                        title: `Historia: ${chapter?.title || 'Capítulo ' + chapter?.chapter}`,
                        source: 'story'
                      });
                    }
                  }}
                  title="Practicar caligrafía y trazos de esta oración en Cuaderno"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <PenTool size={16} />
                  <span className="breakdown-audio-label">Escribir ✍️</span>
                </button>
              </div>
            </div>

            <div className="breakdown-translations">
              <div className="trans-item">
                <strong>{activeSentence.translation_es ? '🇪🇸 Traducción:' : '🌐 Significado:'}</strong> {activeSentence.translation_es || activeSentence.spanish || activeSentence.english}
              </div>
            </div>

            {activeSentence.grammar_note && (
              <div className="grammar-note-box">
                <strong>💡 Explicación Gramatical:</strong><br />
                {activeSentence.grammar_note}
              </div>
            )}

            {/* IME Typing Exercise */}
            <div className="typing-box">
              <div className="typing-prompt">
                <span>✍️ Práctica de Escritura con Teclado Japonés:</span>
                <span className="ime-badge">🇯🇵 Teclado IME</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Teclea la oración en japonés con tu teclado. Presiona <strong>Enter</strong> para verificar:
              </p>

              <div className="typing-input-row">
                <input
                  type="text"
                  className="japanese-input jp-text"
                  placeholder="Escribe la frase en romaji (se convertirá a hiragana)..."
                  value={typingInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    const converted = wanakana.toKana(val, { IMEMode: true });
                    setTypingInput(converted);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheckTyping();
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <div className="typing-btn-group">
                  <button className="btn btn-primary" onClick={handleCheckTyping}>
                    Verificar
                  </button>
                  <button className="btn btn-outline" onClick={handleHint}>
                    Pista
                  </button>
                </div>
              </div>

              {typingFeedback && (
                <div className={`typing-feedback ${typingFeedback.type}`}>
                  {typingFeedback.msg}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sentences List for this Chapter */}
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>
            Selecciona una oración para desglosarla ({chapterSentences.length} oraciones):
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chapterSentences.map((s, idx) => {
              const isDone = userState?.completedSentences?.[s.id];
              const isSelected = s.id === selectedSentenceId;

              return (
                <div
                  key={s.id}
                  className="card"
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    background: isSelected ? 'var(--primary-bg)' : 'var(--bg-surface)'
                  }}
                  onClick={() => handleSentenceClick(s)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="jp-text" style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '2px', wordBreak: 'break-word' }}>
                        {idx + 1}. {s.japanese}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', wordBreak: 'break-word' }}>
                        {s.translation_es || s.spanish || s.english}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      {isDone && (
                        <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          ✓ Dominada
                        </span>
                      )}
                      <button
                        className="audio-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioManager.speak(s.japanese);
                        }}
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reading Comprehension Questions */}
      {story?.comprehension_questions && story.comprehension_questions.length > 0 && (
        <ComprehensionQuiz
          questions={story.comprehension_questions}
          appState={appState || userState}
          onUpdateState={onUpdateState}
          title="Preguntas de Comprensión de la Historia"
          subtitle="Demuestra tu comprensión del relato respondiendo estas 3 preguntas de opción múltiple:"
        />
      )}

      {/* Bottom Navigation Toolbar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 12, 
        marginTop: 36,
        paddingTop: 20,
        borderTop: '1px solid var(--border)'
      }}>
        {prevStory ? (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleOpenStory(prevStory.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ChevronLeft size={16} />
            <span>{prevStory.title?.slice(0, 24)}...</span>
          </button>
        ) : <div />}

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handleBackToList}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
        >
          <ArrowLeft size={16} />
          <span>Volver a la Biblioteca</span>
        </button>

        {nextStory ? (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenStory(nextStory.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <span>{nextStory.title?.slice(0, 24)}...</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleBackToList}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <span>Volver a la Biblioteca</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
