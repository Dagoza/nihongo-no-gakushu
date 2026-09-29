'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, CheckCircle2, Search, ArrowRight, ArrowLeft, Lightbulb, Keyboard, BookOpen, Layers } from 'lucide-react';
import audioManager from '../lib/audioManager';
import { dataStore } from '../lib/data';
import * as wanakana from 'wanakana';
import { SRSRating, getNewCard, reviewCard, isDue } from '../lib/srs';
import SrsReview from './SrsReview';
import SpeechPractice from './SpeechPractice';
import { getVocabularyFromSupabase } from '../lib/supabaseData';
import { useApp } from '../lib/AppContext';

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
  let contextApp = null;
  try {
    contextApp = useApp();
  } catch (e) {}
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

  const isMassive = Boolean(authUser && appState?.useMassiveDictionary);
  const [vocabularyList, setVocabularyList] = useState(dataStore.vocabulary || []);
  const [isLoading, setIsLoading] = useState(false);

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
      setVocabularyList(dataStore.vocabulary || []);
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

  const n4Exercises = dataStore.exercises || [];

  // Filter vocabulary
  const filteredVocab = vocabularyList.filter(item => {
    const matchLevel = level === 'all' || item.level === level;
    const matchCategory = category === 'all' || item.category === category;
    const search = searchTerm.trim().toLowerCase();
    const matchSearch = !search ||
      (item.kanji && item.kanji.toLowerCase().includes(search)) ||
      (item.kana && item.kana.toLowerCase().includes(search)) ||
      (item.meaning_es && item.meaning_es.toLowerCase().includes(search)) ||
      (item.meaning_en && item.meaning_en.toLowerCase().includes(search));
    return matchLevel && matchCategory && matchSearch;
  });

  // Extract unique categories based on current level
  const availableCategories = ['all', ...new Set(
    vocabularyList
      .filter(item => level === 'all' || item.level === level)
      .map(item => item.category)
      .filter(Boolean)
  )];

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
    const queue = vocabularyList.filter(item => {
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

  // Typing validation
  const currentTypingItem = filteredVocab[typingIndex] || filteredVocab[0];

  const handleValidateTyping = () => {
    if (!currentTypingItem || !typingInput.trim()) return;
    const inputVal = typingInput.trim();
    const targetKanji = (currentTypingItem.kanji || '').trim();
    const targetKana = (currentTypingItem.kana || '').trim();

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
  const currentExercise = n4Exercises[exerciseIndex];

  const handleSelectExerciseOption = (opt) => {
    if (!currentExercise || exerciseAnswer) return;
    const isCorrect = opt === currentExercise.correct;
    setExerciseAnswer({ selected: opt, isCorrect });

    if (isCorrect) {
      const newXp = (appState.xp || 0) + 15;
      onUpdateState({
        ...appState,
        xp: newXp
      });
      audioManager.speak(currentExercise.sentence);
    }
  };

  const handleNextExercise = () => {
    setExerciseAnswer(null);
    setExerciseIndex((prev) => (prev + 1) % n4Exercises.length);
  };

  const handlePrevExercise = () => {
    setExerciseAnswer(null);
    setExerciseIndex((prev) => (prev - 1 + n4Exercises.length) % n4Exercises.length);
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <span>📚</span> Entrenador de Vocabulario
        </h2>
        <p className="section-desc">
          Plataforma de vocabulario japonés organizada temáticamente. Explora tarjetas interactivas, practica la digitación con tu teclado en japonés (IME) y resuelve ejercicios de contexto real.
        </p>
      </div>

      {/* Selector de Fuente: Recursos Propios vs Catálogo Masivo API */}
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
            Fuente del Diccionario:
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
              <span>📖 Mis Recursos Propios</span>
              <span style={{
                background: !isMassive ? 'rgba(255,255,255,0.25)' : 'var(--surface)',
                color: !isMassive ? '#fff' : 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                187 palabras
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

          <div style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Mostrando <strong>{filteredVocab.length}</strong> palabras:</span>
            <span>
              Dominadas: <strong>{filteredVocab.filter(v => appState.masteredVocab?.[v.id]).length}</strong> de {filteredVocab.length}
            </span>
          </div>

          {/* Cards Grid */}
          <div className="vocab-grid">
            {filteredVocab.map((item) => {
              const isMastered = !!appState.masteredVocab?.[item.id];
              return (
                <div 
                  key={item.id} 
                  className="vocab-card"
                  style={{ borderColor: isMastered ? 'var(--success)' : 'var(--border)' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span className="vocab-tag">{item.level} · {item.category}</span>
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
                      <button 
                        className="audio-btn" 
                        style={{ width: 32, height: 32 }}
                        onClick={() => audioManager.speak(item.kana || item.kanji)}
                        title="Escuchar pronunciación"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                    <div className="vocab-kana jp-text">{item.kana || ''}</div>
                  </div>

                  <div className="vocab-meanings">
                    <div className="vocab-es">🇪🇸 {item.meaning_es}</div>
                    {item.meaning_en && <div className="vocab-en">🇬🇧 {item.meaning_en}</div>}
                    {item.polite_masu && (
                      <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--primary)', background: 'var(--primary-bg)', padding: '4px 8px', borderRadius: '4px' }}>
                        Forma ます: <strong className="jp-text">{item.polite_masu}</strong> | て: <strong className="jp-text">{item.te_form}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredVocab.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No se encontraron palabras con los filtros aplicados.
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
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => audioManager.speak(currentTypingItem.kana || currentTypingItem.kanji)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Volume2 size={16} /> Escuchar pronunciación
            </button>
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
          onExit={() => setMode('cards')}
          renderFront={(item) => (
            <div className="vocab-kanji" style={{ fontSize: '4rem', marginBottom: 16 }}>
              <span className="jp-text">{item.kanji}</span>
            </div>
          )}
          renderBack={(item) => (
            <>
              <div className="vocab-kana jp-text" style={{ fontSize: '1.5rem', marginBottom: 12, color: 'var(--primary)' }}>
                {item.kana || ''}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>
                🇪🇸 {item.meaning_es}
              </div>
              {item.meaning_en && (
                <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: 8 }}>
                  🇬🇧 {item.meaning_en}
                </div>
              )}

              {/* Tatoeba Sentences Integration */}
              {item.tatoeba_sentences && item.tatoeba_sentences.length > 0 && (
                <div style={{ marginTop: 24, textAlign: 'left', background: 'var(--bg-main)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: 8 }}>
                    📚 Ejemplos (Tatoeba):
                  </div>
                  {item.tatoeba_sentences.map((sentence, idx) => (
                    <div key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: idx === item.tatoeba_sentences.length - 1 ? 'none' : '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <button 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginTop: 2 }}
                          onClick={() => audioManager.speak(sentence.jp)}
                          title="Escuchar ejemplo"
                        >
                          <Volume2 size={16} />
                        </button>
                        <div>
                          <div className="jp-text" style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{sentence.jp}</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>🇪🇸 {sentence.es}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => audioManager.speak(item.kana || item.kanji)}
                >
                  <Volume2 size={16} /> Escuchar
                </button>
                <SpeechPractice targetText={item.kanji} targetKana={item.kana} />
              </div>
            </>
          )}
        />
      )}

      {/* MODE 3: N4 CONTEXT EXERCISES */}
      {mode === 'n4_exercises' && currentExercise && (
        <div className="quiz-container" style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span className="vocab-tag">N4 · Ejercicio en Contexto</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Ejercicio {exerciseIndex + 1} de {n4Exercises.length}
            </span>
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
              <div className="jp-text" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>{currentExercise.sentence}</span>
                <button 
                  className="audio-btn" 
                  style={{ width: 30, height: 30 }}
                  onClick={() => audioManager.speak(currentExercise.sentence)}
                >
                  <Volume2 size={16} />
                </button>
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
  );
}
