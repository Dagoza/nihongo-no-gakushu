'use client';

import React, { useState, useRef } from 'react';
import { Volume2, Search, ArrowRight, ArrowLeft, Lightbulb, CheckCircle2, RotateCcw } from 'lucide-react';
import audioManager from '../lib/audioManager';
import { dataStore } from '../lib/data';

export default function KanjiTab({ appState, onUpdateState }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [quizActive, setQuizActive] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizInput, setQuizInput] = useState('');
  const [quizFeedback, setQuizFeedback] = useState(null); // { type: 'correct'|'wrong', msg, reading }
  const isComposingRef = useRef(false);

  const kanjiList = dataStore.kanji || [];

  // Filter kanji
  const filteredKanji = kanjiList.filter(k => {
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

      {!quizActive ? (
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

            <button 
              className="btn btn-primary btn-lg"
              onClick={() => {
                setQuizIndex(0);
                setQuizFeedback(null);
                setQuizInput('');
                setQuizActive(true);
              }}
            >
              ✍️ Practicar Lecturas de Kanji
            </button>
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                    <div className="kanji-big-char jp-text">
                      {k.kanji}
                    </div>

                    <div className="kanji-meta">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="vocab-tag">{k.strokes ? `${k.strokes} trazos` : 'General'}</span>
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
      ) : (
        /* QUIZ MODE */
        <div className="quiz-container" style={{ maxWidth: 640 }}>
          {currentQuizItem ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setQuizActive(false)}>
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
                    placeholder="Escribe la lectura (ej. ひと, いち)..."
                    value={quizInput}
                    onChange={(e) => setQuizInput(e.target.value)}
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
                <button className="btn btn-outline" onClick={() => setQuizActive(false)}>
                  Volver a la Biblioteca
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
