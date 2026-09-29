'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Search, ArrowRight, ArrowLeft, Lightbulb, CheckCircle2, RotateCcw } from 'lucide-react';
import audioManager from '../lib/audioManager';
import { dataStore } from '../lib/data';
import * as wanakana from 'wanakana';
import { SRSRating, getNewCard, reviewCard, isDue } from '../lib/srs';
import SrsReview from './SrsReview';
import KanjiDraw from './KanjiDraw';
import { getKanjiFromSupabase } from '../lib/supabaseData';
import { useApp } from '../lib/AppContext';

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

  const [level, setLevel] = useState('all');
  const [kanjiList, setKanjiList] = useState(dataStore.kanji || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Si no ha iniciado sesión, mostrar exclusivamente los datos locales guardados sin consultar la BD
    if (!authUser) {
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
      .catch(err => console.error("Error cargando kanjis:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [level, authUser]);

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

  const handleValidateReading = () => {
    if (!currentQuizItem || !quizInput.trim()) return;
    const inputVal = quizInput.trim();
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
      <div className="section-header">
        <h2 className="section-title">
          <span>漢</span> Biblioteca de Kanji Interactiva
        </h2>
        <p className="section-desc">
          {kanjiList.length} caracteres kanji extraídos de tus libros de estudio y fichas mnemotécnicas con orden de trazos, lecturas On'yomi, Kun'yomi, vocabulario compuesto y práctica de lectura en Hiragana.
        </p>
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

          {/* Kanji Cards Grid */}
          <div className="kanji-grid">
            {filteredKanji.map((k) => {
              const isMastered = !!appState.masteredKanji?.[k.kanji];
              return (
                <div 
                  key={k.kanji} 
                  className="kanji-card"
                  style={{ borderColor: isMastered ? 'var(--success)' : 'var(--border)' }}
                >
                  <div className="kanji-header">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
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

                    <div className="kanji-meta">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="vocab-tag">{k.strokes ? `${k.strokes} trazo${k.strokes === 1 ? '' : 's'}` : 'General'}</span>
                        <label style={{ cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <input 
                            type="checkbox"
                            checked={isMastered}
                            onChange={() => toggleKanjiMastery(k.kanji)}
                            style={{ accentColor: 'var(--success)' }}
                          />
                          <span style={{ color: isMastered ? 'var(--success)' : 'var(--text-muted)', fontWeight: isMastered ? 700 : 500 }}>
                            {isMastered ? 'Dominado' : 'Aprender'}
                          </span>
                        </label>
                      </div>

                      <div className="kanji-meaning" style={{ marginTop: 4 }}>
                        {k.meaning_es}
                      </div>
                      {k.meaning_en && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          ({k.meaning_en})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Readings */}
                  <div style={{ background: 'var(--bg-main)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', marginTop: 12 }}>
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
                        <div key={idx} className="kanji-word-item">
                          <span className="jp-text" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            {w.word} <small style={{ color: 'var(--primary)', fontWeight: 'normal' }}>({w.reading})</small>
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>{w.meaning}</span>
                          <button 
                            className="audio-btn" 
                            style={{ width: 26, height: 26 }}
                            onClick={() => audioManager.speak(w.reading || w.word)}
                            title="Escuchar palabra"
                          >
                            <Volume2 size={13} />
                          </button>
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
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={() => setDrawingKanji(item.kanji)}
                >
                  ✍️ Practicar Trazos
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
          </div>
        </div>
      )}
    </div>
  );
}
