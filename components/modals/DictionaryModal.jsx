'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Volume2, BookmarkPlus, PenTool, BookOpen, Info } from 'lucide-react';
import audioManager from '../../lib/audioManager';
import { lookupJapaneseWord, analyzeJapaneseSentence, convertKanjiToKanaSync, hiraganaToKatakana, containsKanji } from '../../lib/japaneseUtils';
import vocabularyData from '../../data/vocabulary.json';
import { useApp } from '../../lib/AppContext';
import useFocusTrap from '../../lib/useFocusTrap';

export default function DictionaryModal({
  isOpen,
  onClose,
  initialSearch = '',
  onSaveWord = null
}) {
  const contextApp = useApp();
  const inputRef = useRef(null);
  const modalCardRef = useFocusTrap(isOpen);

  const [query, setQuery] = useState(initialSearch || '');
  const [activeTokenIndex, setActiveTokenIndex] = useState(0);

  // Sync initialSearch when modal opens
  useEffect(() => {
    if (isOpen) {
      const text = (initialSearch || '').trim();
      setQuery(text);
      setActiveTokenIndex(0);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, initialSearch]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Combined vocabulary sources
  const customVocab = contextApp?.appState?.savedCustomVocab || [];
  const externalVocab = useMemo(() => {
    return vocabularyData || [];
  }, []);

  // Detectar si la búsqueda es en español
  const isSpanishQuery = useMemo(() => {
    const q = (query || '').trim();
    return Boolean(q && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(q));
  }, [query]);

  // Morphological analysis of the query
  const analysis = useMemo(() => {
    const clean = (query || '').trim();
    if (!clean) return [];
    return analyzeJapaneseSentence(clean, customVocab, externalVocab);
  }, [query, customVocab, externalVocab]);

  // Lectura completa en kana de toda la frase cuando tiene kanji
  const fullSentenceKana = useMemo(() => {
    const clean = (query || '').trim();
    if (!clean || isSpanishQuery || !containsKanji(clean)) return '';
    const res = convertKanjiToKanaSync(clean, customVocab, externalVocab);
    return (res && res.hiragana && res.hiragana !== clean) ? res.hiragana : '';
  }, [query, isSpanishQuery, customVocab, externalVocab]);

  // Selected token for detailed card view
  const currentToken = useMemo(() => {
    if (analysis.length === 0) return null;
    const idx = Math.min(activeTokenIndex, analysis.length - 1);
    return analysis[idx >= 0 ? idx : 0];
  }, [analysis, activeTokenIndex]);

  // Direct lookup of the query itself
  const directLookup = useMemo(() => {
    const clean = (query || '').trim();
    if (!clean) return null;
    return lookupJapaneseWord(clean, customVocab, externalVocab);
  }, [query, customVocab, externalVocab]);

  if (!isOpen) return null;

  const handlePlayAudio = (text) => {
    if (!text) return;
    audioManager.speak(text);
  };

  const handleSaveToVocab = (wordItem) => {
    if (!wordItem) return;
    const text = wordItem.text || wordItem.kanji || query;
    const hira = wordItem.hiragana || '';
    const kata = wordItem.katakana || hiraganaToKatakana(hira || text);
    const meaning = wordItem.meaning_es || '';

    if (contextApp?.openSaveModal) {
      contextApp.openSaveModal({
        type: 'word',
        text: text,
        kanji: containsKanji(text) ? text : '',
        hiragana: hira,
        katakana: kata,
        meaning_es: meaning,
        level: wordItem.level || 'N5',
        category: wordItem.category || 'Diccionario Rápido',
        source: 'Diccionario Rápido'
      });
    } else if (onSaveWord) {
      onSaveWord({
        kanji: text,
        hiragana: hira,
        katakana: kata,
        meaning_es: meaning,
        level: wordItem.level || 'N5',
        category: wordItem.category || 'Diccionario Rápido'
      });
    }
  };

  const handleOpenPracticePad = (wordItem) => {
    const text = wordItem?.text || wordItem?.kanji || query;
    const hira = wordItem?.hiragana || '';
    if (!text) return;

    if (contextApp?.openPracticePad) {
      contextApp.openPracticePad({
        text,
        kana: hira,
        title: `Práctica: ${text}`,
        source: 'dictionary'
      });
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="dict-modal-title">
      <div 
        ref={modalCardRef}
        tabIndex={-1}
        className="modal-content dictionary-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 620,
          width: '94%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-bento, 20px)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h3 id="dict-modal-title" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Diccionario Rápido & Análisis Morfológico
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Búsqueda en Español y Japonés · Segmentación morfológica, partículas y lematización
              </p>
            </div>
          </div>

          <button 
            type="button" 
            className="btn-modal-close" 
            onClick={onClose}
            title="Cerrar (Esc)"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 6,
              borderRadius: '50%',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar Input */}
        <div style={{ padding: '16px 20px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={18} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveTokenIndex(0);
              }}
              placeholder="Busca en Español, Kanji, Hiragana o Romaji (ej. comer, amigo, 食べました, 先生)..."
              style={{
                width: '100%',
                padding: '12px 38px 12px 42px',
                borderRadius: 10,
                border: '1.5px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setActiveTokenIndex(0);
                  if (inputRef.current) inputRef.current.focus();
                }}
                style={{
                  position: 'absolute',
                  right: 12,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: 4
                }}
                title="Borrar texto"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {!query.trim() ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🔍</div>
              <h4 style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                Consulta el significado de cualquier palabra o frase
              </h4>
              <p style={{ fontSize: '0.84rem', maxWidth: 420, margin: '0 auto', lineHeight: 1.45 }}>
                Toca cualquier palabra en la app o selecciona una oración para analizar su gramática, separar cópulas y conocer cada término al instante.
              </p>
            </div>
          ) : (
            <>
              {/* Full sentence reading banner if sentence contains kanji */}
              {fullSentenceKana && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.08))',
                  border: '1.5px solid rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Lectura Fonética Completa (Hiragana)
                    </span>
                    <span className="jp-text" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
                      {fullSentenceKana}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-audio-circle"
                    onClick={() => handlePlayAudio(query)}
                    title="Escuchar toda la frase"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--primary-bg)',
                      border: '1px solid var(--primary)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              )}

              {/* Morphological Breakdown Chips (When multiple words/tokens exist) */}
              {analysis.length > 0 && (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8
                  }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                      {isSpanishQuery 
                        ? `Resultados en Español (${analysis.length} palabras encontradas)` 
                        : `Desglose Morfológico (${analysis.length} ${analysis.length === 1 ? 'componente' : 'componentes'})`}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {isSpanishQuery ? 'Toca una palabra para ver detalles' : 'Haz clic en un token para ver detalles'}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    padding: '12px',
                    borderRadius: 10,
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)'
                  }}>
                    {analysis.map((token, idx) => {
                      const isActive = idx === activeTokenIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveTokenIndex(idx)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            textAlign: 'center'
                          }}
                        >
                          <span className="jp-text" style={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: isActive ? 'var(--primary)' : 'var(--text-main)'
                          }}>
                            {token.text}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                            marginTop: 2,
                            maxWidth: 100,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {token.meaning_es ? token.meaning_es.split('/')[0].trim() : (token.category || 'Palabra')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Token Detail Card */}
              {currentToken && (
                <div style={{
                  padding: '18px 20px',
                  borderRadius: 12,
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                        <span className="jp-text" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
                          {currentToken.text}
                        </span>
                        {currentToken.hiragana && currentToken.hiragana !== currentToken.text && (
                          <span className="jp-text" style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 600 }}>
                            【{currentToken.hiragana}】
                          </span>
                        )}
                        {currentToken.katakana && currentToken.katakana !== currentToken.hiragana && (
                          <span className="jp-text" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                            {currentToken.katakana}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'rgba(99, 102, 241, 0.12)',
                          color: 'var(--primary)'
                        }}>
                          {currentToken.level || 'N5'}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'var(--bg-main)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border)'
                        }}>
                          {currentToken.category || 'Vocabulario General'}
                        </span>
                        {currentToken.baseForm && currentToken.baseForm !== currentToken.text && (
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#059669',
                            border: '1px solid rgba(16, 185, 129, 0.25)'
                          }}>
                            Forma Base: {currentToken.baseForm}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-audio-circle"
                      onClick={() => handlePlayAudio(currentToken.text)}
                      title="Escuchar pronunciación nativa / neuronal"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'var(--primary-bg)',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>

                  {/* Meaning & Definition */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Significado en Español:
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {currentToken.meaning_es || (
                        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                          No se encontró definición directa. Puede ser un nombre propio o término no catalogado.
                        </span>
                      )}
                    </div>
                    {currentToken.notes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6, borderTop: '1px dashed var(--border)', paddingTop: 6 }}>
                        💡 {currentToken.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar for the Word */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => handleSaveToVocab(currentToken)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, justifyContent: 'center', gap: 6 }}
                      title="Guardar palabra en tu vocabulario personal"
                    >
                      <BookmarkPlus size={14} />
                      <span>Guardar Palabra</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPracticePad(currentToken)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, justifyContent: 'center', gap: 6 }}
                      title="Escribir caracteres en el cuaderno de práctica"
                    >
                      <PenTool size={14} />
                      <span>Cuaderno ✍️</span>
                    </button>
                  </div>
                </div>
              )}

              {/* In case of a compound ending that was decoupled */}
              {directLookup && directLookup.hasSeparatedEnding && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10
                }}>
                  <Info size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700, color: '#0284c7' }}>Desarticulación de Cópula / Flexión: </span>
                    La forma <strong>"{directLookup.originalText}"</strong> se compone de la raíz <strong>"{directLookup.compoundStem || directLookup.kanji}"</strong> unida a la terminación <strong>"[{directLookup.compoundEnding}]"</strong> ({directLookup.endingRole}).
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Nihongo Master · Diccionario Pedagógico Inteligente
          </span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
