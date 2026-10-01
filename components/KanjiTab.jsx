'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Search, ArrowRight, ArrowLeft, Lightbulb, CheckCircle2, RotateCcw, Sparkles, Check, MessageSquare, PenTool, Info } from 'lucide-react';
import audioManager from '../lib/audioManager';
import { dataStore } from '../lib/data';
import * as wanakana from 'wanakana';
import { SRSRating, getNewCard, reviewCard, isDue } from '../lib/srs';
import SrsReview from './SrsReview';
import KanjiDraw from './KanjiDraw';
import PitchAccent from './PitchAccent';
import SpeechPractice from './SpeechPractice';
import { getKanjiFromSupabase } from '../lib/supabaseData';
import { useApp } from '../lib/AppContext';
import AIGeneratorModal from './AIGeneratorModal';

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
  let contextApp = null;
  try {
    contextApp = useApp();
  } catch (e) {}
  const authUser = propAuthUser || contextApp?.authUser;
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [quizActive, setQuizActive] = useState(initialMode === 'quiz');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizInput, setQuizInput] = useState('');
  const [quizFeedback, setQuizFeedback] = useState(null); // { type: 'correct'|'wrong', msg, reading }
  const isComposingRef = useRef(false);

  // SRS State
  const [srsActive, setSrsActive] = useState(initialMode === 'srs');
  const [srsQueue, setSrsQueue] = useState([]);

  // Drawing Mode
  const [drawingKanji, setDrawingKanji] = useState(initialDraw || null);

  const updateParams = (newSearch, newMode, newDraw) => {
    if (onParamsChange) {
      const activeMode = newMode !== undefined 
        ? newMode 
        : (quizActive ? 'quiz' : (srsActive ? 'srs' : 'list'));
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
    if (initialMode === 'quiz') {
      setQuizActive(true);
      setSrsActive(false);
    } else if (initialMode === 'srs') {
      startSrsSession();
    } else if (initialMode === 'list') {
      setQuizActive(false);
      setSrsActive(false);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialDraw !== undefined && initialDraw !== drawingKanji) {
      setDrawingKanji(initialDraw);
    }
  }, [initialDraw]);

  const isMassive = Boolean(authUser && appState?.useMassiveKanji);
  const [level, setLevel] = useState('all');
  const [kanjiList, setKanjiList] = useState(dataStore.kanji || []);
  const [isLoading, setIsLoading] = useState(false);

  // AI Content Generator & Kanji Selection State
  const [selectedKanjiChars, setSelectedKanjiChars] = useState(new Set());
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [aiGenType, setAiGenType] = useState('story');

  const handleToggleSource = (enableMassive) => {
    if (enableMassive) {
      if (!authUser) {
        if (contextApp?.showAlert) {
          contextApp.showAlert({
            type: 'lock',
            title: 'Catálogo Masivo de Kanjis',
            message: 'Inicia sesión con tu cuenta de Google o correo para desbloquear el catálogo masivo con más de 2,100 kanjis.',
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
        useMassiveKanji: true
      });
    } else {
      onUpdateState({
        ...appState,
        useMassiveKanji: false
      });
    }
  };

  useEffect(() => {
    // Si está apagado el catálogo masivo o no hay sesión activa, usar estrictamente los kanjis propios
    if (!authUser || !appState?.useMassiveKanji) {
      setKanjiList(dataStore.kanji || []);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    getKanjiFromSupabase({ level, authUser })
      .then(data => {
        if (isMounted && data && data.length > 0) {
          setKanjiList(data);
        }
      })
      .catch(err => console.error("Error cargando kanjis masivos:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [level, authUser, appState?.useMassiveKanji]);

  // Filter kanji
  const filteredKanji = kanjiList.filter(k => {
    const matchLevel = level === 'all' || k.level === level;
    const search = searchTerm.trim().toLowerCase();
    if (!matchLevel) return false;
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

  const selectedKanjisForAI = React.useMemo(() => {
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

  const masteredCount = kanjiList.filter(k => !!appState.masteredKanji?.[k.kanji]).length;
  const progressPercent = Math.round((masteredCount / Math.max(1, kanjiList.length)) * 100);

  const toggleKanjiMastery = (char) => {
    const isMastered = !!appState.masteredKanji?.[char];
    const newMastered = {
      ...(appState.masteredKanji || {}),
      [char]: !isMastered
    };
    onUpdateState({
      ...appState,
      masteredKanji: newMastered
    });
  };

  const startSrsSession = () => {
    const queue = kanjiList.filter(item => {
      const card = appState.masteredKanji?.[item.kanji];
      if (!card) return true;
      if (typeof card === 'boolean') return true;
      return isDue(card);
    }).sort(() => Math.random() - 0.5);
    
    setSrsQueue(queue);
    setSrsActive(true);
    setQuizActive(false);
    updateParams(searchTerm, 'srs', drawingKanji);
  };

  const handleSrsReview = (item, rating) => {
    const currentCardData = appState.masteredKanji?.[item.kanji];
    const oldCard = (currentCardData && typeof currentCardData === 'object') 
      ? currentCardData 
      : getNewCard();
      
    const newCard = reviewCard(oldCard, rating);
    
    onUpdateState({
      ...appState,
      masteredKanji: {
        ...(appState.masteredKanji || {}),
        [item.kanji]: newCard
      }
    });
  };

  // Compile quiz items
  const quizItems = React.useMemo(() => {
    const items = [];
    kanjiList.forEach(k => {
      let primaryReading = '';
      if (k.kunyomi && k.kunyomi.includes('[')) {
        primaryReading = k.kunyomi.split('[')[1]?.replace(']', '').trim();
      } else if (k.kunyomi) {
        primaryReading = k.kunyomi.split(',')[0].trim();
      } else if (k.pronunciation) {
        primaryReading = k.pronunciation.split(',')[0].trim();
      } else if (k.onyomi) {
        primaryReading = k.onyomi.split(',')[0].trim();
      }

      if (primaryReading) {
        items.push({
          kanji: k.kanji,
          meaning: k.meaning_es,
          reading: primaryReading,
          words: k.words || []
        });
      }
    });
    return items.sort(() => 0.5 - Math.random());
  }, [quizActive]);

  const currentQuizItem = quizItems[quizIndex];

  const handleValidateReading = (forcedValue = null) => {
    if (!currentQuizItem) return;
    const inputVal = (typeof forcedValue === 'string' ? forcedValue : quizInput).trim();
    if (!inputVal) return;
    const expected = currentQuizItem.reading.trim();

    // Check if input matches primary reading or any compound word reading
    const isMatch = inputVal === expected || (currentQuizItem.words && currentQuizItem.words.some(w => w.reading === inputVal));

    if (isMatch) {
      setQuizFeedback({
        type: 'correct',
        msg: `🎉 ¡Correcto! (+20 XP)`,
        reading: `${currentQuizItem.kanji} = ${expected}`
      });
      audioManager.speak(expected);

      const newXp = (appState.xp || 0) + 20;
      onUpdateState({
        ...appState,
        xp: newXp
      });

      setTimeout(() => {
        setQuizFeedback(null);
        setQuizInput('');
        setQuizIndex((prev) => prev + 1);
      }, 1600);
    } else {
      setQuizFeedback({
        type: 'wrong',
        msg: `Lectura esperada en Hiragana:`,
        reading: expected
      });
    }
  };

  const handleShowHint = () => {
    if (!currentQuizItem) return;
    setQuizInput(currentQuizItem.reading.charAt(0));
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>漢</span>
            <span>Biblioteca de Kanji</span>
          </h2>
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
      </div>

      {/* Selector de Fuente: Kanjis Propios vs Catálogo Masivo API */}
      <div className="source-selector-bar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Fuente de Kanjis:
          </span>
          <div style={{
            display: 'inline-flex',
            background: 'var(--background)',
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
              <span>📖 Mis Kanjis Propios</span>
              <span style={{
                background: !isMassive ? 'rgba(255,255,255,0.25)' : 'var(--surface)',
                color: !isMassive ? '#fff' : 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                134 kanjis
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
                background: isMassive ? 'rgba(255,255,255,0.25)' : 'var(--surface)',
                color: isMassive ? '#fff' : 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                +2,100 kanjis
              </span>
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isMassive ? (
            <span>✨ Mostrando kanjis propios curados de libros con mnemotécnicas.</span>
          ) : (
            <span>🚀 Mostrando base de datos masiva poblada en Supabase ({kanjiList.length} kanjis).</span>
          )}
        </div>
      </div>

      {!quizActive && !srsActive ? (
        <div>
          {/* Overview Stats Bar */}
          <div className="card" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                Kanjis Dominados: <span style={{ color: 'var(--primary)' }}>{masteredCount} de {kanjiList.length}</span> ({progressPercent}%)
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Aprende la composición, significado y practica escribir la lectura en Hiragana.
              </div>
              <div style={{ width: 280, height: 8, background: 'var(--border)', borderRadius: 999, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.4s' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                className="btn btn-outline btn-lg"
                onClick={startSrsSession}
              >
                🧠 Repaso SRS
              </button>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => {
                  setQuizIndex(0);
                  setQuizFeedback(null);
                  setQuizInput('');
                  setQuizActive(true);
                  setSrsActive(false);
                  updateParams(searchTerm, 'quiz', drawingKanji);
                }}
              >
                ✍️ Practicar Lecturas
              </button>
            </div>
          </div>

          {/* Level Selector */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Nivel:</span>
            {['all', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
              <button
                key={lvl}
                className={`btn ${level === lvl ? 'btn-primary' : 'btn-outline'} btn-sm`}
                style={{ minWidth: 42, padding: '4px 10px' }}
                onClick={() => setLevel(lvl)}
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

          {/* Search Bar */}
          <div className="vocab-filter-bar">
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="search-input" 
                style={{ paddingLeft: 38 }}
                placeholder="Buscar kanji por carácter, lectura (いち, に) o significado (persona, norte, agua)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateParams(e.target.value, undefined, drawingKanji);
                }}
              />
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {filteredKanji.length} kanjis
            </div>
          </div>

          {/* Quick AI & Selection Helper Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
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

            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Dominados: <strong>{masteredCount}</strong> de {kanjiList.length}
            </div>
          </div>

          {/* Kanji Cards Grid */}
          <div className="kanji-grid">
            {filteredKanji.map((k) => {
              const isMastered = !!appState.masteredKanji?.[k.kanji];
              const isSelected = selectedKanjiChars.has(k.kanji);
              return (
                <div 
                  key={k.kanji} 
                  className={`kanji-card ${isSelected ? 'selected-card' : ''}`}
                  style={{ 
                    borderColor: isSelected 
                      ? 'var(--primary)' 
                      : (isMastered ? 'var(--success)' : 'var(--border)'),
                    background: isSelected ? 'var(--primary-bg, rgba(99, 102, 241, 0.04))' : undefined,
                    boxShadow: isSelected ? '0 0 0 1px var(--primary)' : undefined
                  }}
                >
                  {/* Top Bar: Tag & Actions */}
                  <div className="kanji-card-topbar">
                    <span className="vocab-tag">
                      {k.strokes ? `${k.strokes} trazo${k.strokes === 1 ? '' : 's'}` : 'General'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Botón elegante de Selección */}
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
                        title={isSelected ? "Deseleccionar kanji" : "Seleccionar kanji para generar historia u oraciones con IA"}
                        aria-pressed={isSelected}
                      >
                        {isSelected ? (
                          <Check size={12} strokeWidth={2.5} />
                        ) : (
                          <Sparkles size={12} />
                        )}
                        <span>{isSelected ? 'Seleccionado' : 'Seleccionar'}</span>
                      </button>

                      {/* Checkbox de Dominado / Aprender */}
                      <label 
                        className="kanji-mastery-label"
                        style={{ 
                          cursor: 'pointer', 
                          fontSize: '0.8rem', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 5,
                          userSelect: 'none'
                        }}
                      >
                        <input 
                          type="checkbox"
                          checked={isMastered}
                          onChange={() => toggleKanjiMastery(k.kanji)}
                          style={{ accentColor: 'var(--success)', cursor: 'pointer', width: 14, height: 14 }}
                        />
                        <span style={{ color: isMastered ? 'var(--success)' : 'var(--text-muted)', fontWeight: isMastered ? 700 : 500 }}>
                          {isMastered ? 'Dominado' : 'Aprender'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="kanji-header" style={{ alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <div className="kanji-big-char jp-text">
                        {k.kanji}
                      </div>
                      <button 
                        className="btn btn-outline btn-xs" 
                        onClick={() => {
                          setDrawingKanji(k.kanji);
                          updateParams(searchTerm, undefined, k.kanji);
                        }}
                        title="Practicar orden de trazos"
                      >
                        ✍️ Trazos
                      </button>
                    </div>

                    <div className="kanji-meta" style={{ marginTop: 2 }}>
                      <div className="kanji-meaning">
                        {k.meaning_es}
                      </div>
                      {k.meaning_en && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          ({k.meaning_en})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Readings */}
                  <div style={{ background: 'var(--bg-main)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        {k.kunyomi && (
                          <div><strong>Kun (japonesa):</strong> <span className="jp-text" style={{ color: 'var(--accent)', fontWeight: 600 }}>{k.kunyomi}</span></div>
                        )}
                        {k.onyomi && (
                          <div><strong>On (china):</strong> <span className="jp-text" style={{ color: 'var(--primary)', fontWeight: 600 }}>{k.onyomi}</span></div>
                        )}
                        {!k.kunyomi && !k.onyomi && k.pronunciation && (
                          <div><strong>Lectura:</strong> <span className="jp-text" style={{ color: 'var(--primary)', fontWeight: 600 }}>{k.pronunciation}</span></div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginTop: 2 }}>
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

                  {/* Compound Words */}
                  {k.words && k.words.length > 0 && (
                    <div className="kanji-words-list">
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Palabras Compuestas:
                      </div>
                      {k.words.map((w, idx) => (
                        <div key={idx} className="kanji-word-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6, padding: '8px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <span className="jp-text" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {w.word} <small style={{ color: 'var(--primary)', fontWeight: 'normal' }}>({w.reading})</small>
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
                          {/* Curva visual de Pitch Accent */}
                          <div style={{ marginTop: 2, display: 'flex', justifyContent: 'flex-start' }}>
                            <PitchAccent word={w.word} reading={w.reading} mode="compact" size="sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : srsActive ? (
        <SrsReview 
          queue={srsQueue}
          onRate={handleSrsReview}
          onExit={() => {
            setSrsActive(false);
            updateParams(searchTerm, 'list', drawingKanji);
          }}
          renderFront={(item) => (
            <div className="kanji-big-char jp-text" style={{ fontSize: '5rem', marginBottom: 16 }}>
              {item.kanji}
            </div>
          )}
          renderBack={(item) => (
            <>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 12 }}>
                🇪🇸 {item.meaning_es}
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '1rem', textAlign: 'left', marginBottom: 16 }}>
                {item.kunyomi && (
                  <div><strong>Kun:</strong> <span className="jp-text" style={{ color: 'var(--accent)', fontWeight: 600 }}>{item.kunyomi}</span></div>
                )}
                {item.onyomi && (
                  <div><strong>On:</strong> <span className="jp-text" style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.onyomi}</span></div>
                )}
                {item.pronunciation && !item.kunyomi && !item.onyomi && (
                  <div><strong>Lectura:</strong> <span className="jp-text" style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.pronunciation}</span></div>
                )}
              </div>
              {item.mnemonic && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'left', fontStyle: 'italic', marginBottom: 16 }}>
                  💡 {item.mnemonic}
                </div>
              )}

              {/* Curva de Pitch Accent para lectura o palabra principal del Kanji */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <PitchAccent 
                  word={item.words?.[0]?.word || item.kanji} 
                  reading={item.words?.[0]?.reading || (item.pronunciation ? item.pronunciation.split(',')[0].trim() : '')} 
                  mode="full" 
                  size="md" 
                  showAudio={true} 
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
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
                <button 
                  type="button"
                  className="btn btn-outline btn-sm" 
                  onClick={() => {
                    if (contextApp?.openPracticePad) {
                      contextApp.openPracticePad({
                        text: item.kanji,
                        kana: getPrimaryKanjiReading(item),
                        title: `Kanji: ${item.kanji} (${item.meaning_es})`,
                        source: 'kanji',
                        initialChar: item.kanji
                      });
                    } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                      window.__nihongoOpenPracticePad({
                        text: item.kanji,
                        kana: getPrimaryKanjiReading(item),
                        title: `Kanji: ${item.kanji} (${item.meaning_es})`,
                        source: 'kanji',
                        initialChar: item.kanji
                      });
                    }
                  }}
                  title="Abrir en Cuaderno de Cuadrícula y Caligrafía"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <PenTool size={14} /> Cuaderno
                </button>
              </div>
            </>
          )}
        />
      ) : (
        /* QUIZ MODE */
        <div className="quiz-container" style={{ maxWidth: 640 }}>
          {currentQuizItem ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <button className="btn btn-outline btn-sm" onClick={() => {
                  setQuizActive(false);
                  updateParams(searchTerm, 'list', drawingKanji);
                }}>
                  <ArrowLeft size={16} /> Volver a Kanjis
                </button>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Kanji {quizIndex + 1} de {quizItems.length}
                </span>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div 
                  className="kanji-big-char jp-text"
                  style={{ width: 100, height: 100, fontSize: '3.8rem', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {currentQuizItem.kanji}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Significado: {currentQuizItem.meaning}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  Escribe la lectura en Hiragana usando tu teclado en japonés:
                </p>
              </div>

              <div className="typing-box">
                <div className="typing-prompt">
                  <span>✍️ Lectura en Hiragana:</span>
                  <span className="ime-badge">🇯🇵 Teclado IME</span>
                </div>

                <div className="typing-input-row">
                  <input 
                    type="text" 
                    className="japanese-input jp-text"
                    placeholder="Escribe la lectura en romaji (se convierte a hiragana)..."
                    value={quizInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      const converted = wanakana.toKana(val, { IMEMode: true });
                      setQuizInput(converted);
                    }}
                    onCompositionStart={() => { isComposingRef.current = true; }}
                    onCompositionEnd={() => { isComposingRef.current = false; }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isComposingRef.current) {
                        handleValidateReading();
                      }
                    }}
                    autoFocus
                  />
                  <button className="btn btn-primary" onClick={handleValidateReading}>
                    Validar
                  </button>
                  <button className="btn btn-outline" onClick={handleShowHint} title="Revelar primer kana">
                    <Lightbulb size={16} /> Pista
                  </button>
                </div>

                <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>O practica diciendo la lectura:</span>
                  <SpeechPractice 
                    targetText={currentQuizItem.kanji} 
                    targetKana={currentQuizItem.reading} 
                    acceptableReadings={currentQuizItem.words?.map(w => w.reading)}
                    onMatch={(spoken) => {
                      setQuizInput(currentQuizItem.reading);
                      handleValidateReading(currentQuizItem.reading);
                    }}
                  />
                </div>

                {quizFeedback && (
                  <div className={`typing-feedback ${quizFeedback.type}`}>
                    <div>{quizFeedback.msg}</div>
                    <div className="jp-text" style={{ fontSize: '1.2rem', marginTop: 4 }}>
                      {quizFeedback.reading}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setQuizFeedback(null);
                    setQuizInput('');
                    setQuizIndex((prev) => Math.max(0, prev - 1));
                  }}
                >
                  <ArrowLeft size={16} /> Anterior
                </button>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setQuizFeedback(null);
                    setQuizInput('');
                    setQuizIndex((prev) => prev + 1);
                  }}
                >
                  Siguiente <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🏆</div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12 }}>¡Práctica de Kanji Completada!</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Has repasado la lectura y escritura de tus Kanjis. ¡Gran trabajo!</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => { setQuizIndex(0); setQuizFeedback(null); }}>
                  <RotateCcw size={16} /> Repetir Práctica
                </button>
                <button className="btn btn-outline" onClick={() => {
                  setQuizActive(false);
                  updateParams(searchTerm, 'list', drawingKanji);
                }}>
                  Volver a la Biblioteca
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DRAWING MODAL */}
      {drawingKanji && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{ maxWidth: 400, width: '100%', position: 'relative', textAlign: 'center' }}>
            <button 
              className="btn btn-outline btn-sm"
              style={{ position: 'absolute', top: 12, right: 12, borderRadius: '50%', width: 32, height: 32, padding: 0 }}
              onClick={() => {
                setDrawingKanji(null);
                updateParams(searchTerm, undefined, null);
              }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>Práctica de Trazos</h3>
            {(() => {
              const currentK = kanjiList.find(k => k.kanji === drawingKanji);
              return (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)' }}>
                    {drawingKanji} {currentK?.meaning_es ? `— ${currentK.meaning_es}` : ''}
                  </div>
                  {currentK?.strokes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {currentK.strokes} trazo{currentK.strokes === 1 ? '' : 's'} • Dibuja los trazos en el orden y dirección correctos.
                    </div>
                  )}
                </div>
              );
            })()}
            
            <KanjiDraw 
              character={drawingKanji} 
              size={250} 
              onQuizComplete={() => {
                // Optional: add XP or mark as practiced
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
                  color: 'var(--primary)'
                }}
              >
                <PenTool size={14} />
                <span>Abrir en Cuaderno Avanzado (Cuadrícula & Estilos)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Bar para Kanjis Seleccionados */}
      {selectedKanjiChars.size > 0 && (
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
              {selectedKanjiChars.size}
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {selectedKanjiChars.size === 1 ? 'kanji seleccionado' : 'kanjis seleccionados'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 280, overflow: 'hidden' }}>
            {Array.from(selectedKanjiChars).slice(0, 6).map(char => (
              <span key={char} className="jp-text" style={{ fontSize: '1rem', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 6, fontWeight: 800 }}>
                {char}
              </span>
            ))}
            {selectedKanjiChars.size > 6 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>+{selectedKanjiChars.size - 6} más</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
              title="Generar historia con los kanjis seleccionados"
            >
              <Sparkles size={15} />
              <span>Historia</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedKanjiChars(new Set())}
              style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}
            >
              Limpiar
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
