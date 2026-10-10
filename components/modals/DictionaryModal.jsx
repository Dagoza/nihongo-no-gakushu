'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Volume2, BookmarkPlus, PenTool, BookOpen, Info, Check, Edit3, Sparkles, Layers } from 'lucide-react';
import audioManager from '../../lib/audioManager';
import { lookupJapaneseWord, analyzeJapaneseSentence, convertKanjiToKanaSync, hiraganaToKatakana, containsKanji, extractKanjis, cleanKanaOnly } from '../../lib/japaneseUtils';
import vocabularyData from '../../data/vocabulary.json';
import kanjiData from '../../data/kanji.json';
import { useApp } from '../../lib/AppContext';
import useFocusTrap from '../../lib/useFocusTrap';
import TerminologyTooltip from '../common/TerminologyTooltip';

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
  const [justSavedKey, setJustSavedKey] = useState(null);

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

  // Detalles de kanjis remotos resueltos en segundo plano si no están en catálogo
  const [remoteKanjiDetails, setRemoteKanjiDetails] = useState({});

  // Desglose de los kanjis que componen el término seleccionado
  const componentKanjis = useMemo(() => {
    const textToInspect = currentToken?.text || query || '';
    if (!textToInspect) return [];
    const chars = extractKanjis(textToInspect);
    if (chars.length === 0) return [];

    return chars.map(char => {
      const kInfo = kanjiData?.find(k => k.kanji === char);
      if (kInfo) {
        return {
          char,
          found: true,
          meaning_es: kInfo.meaning_es,
          meaning_en: kInfo.meaning_en || '',
          level: kInfo.level || 'N5',
          onyomi: kInfo.onyomi || '',
          kunyomi: kInfo.kunyomi || '',
          mnemonic: kInfo.mnemonic || '',
          strokes: kInfo.strokes || null,
          pronunciation: kInfo.pronunciation || ''
        };
      }
      const remote = remoteKanjiDetails[char];
      if (remote) {
        return {
          char,
          found: true,
          meaning_es: remote.meaning_es,
          meaning_en: remote.meaning_en || '',
          level: remote.level || 'N5',
          onyomi: remote.onyomi || '',
          kunyomi: remote.kunyomi || '',
          mnemonic: remote.mnemonic || '',
          strokes: remote.strokes || null,
          pronunciation: remote.pronunciation || ''
        };
      }
      return {
        char,
        found: false,
        meaning_es: '',
        meaning_en: '',
        level: 'N5',
        onyomi: '',
        kunyomi: '',
        mnemonic: '',
        strokes: null,
        pronunciation: ''
      };
    });
  }, [currentToken?.text, query, remoteKanjiDetails]);

  // Si hay kanjis sin información local, consultar endpoint /api/kanji/reading en segundo plano
  useEffect(() => {
    if (!componentKanjis || componentKanjis.length === 0) return;
    const missing = componentKanjis.filter(k => !k.found && !remoteKanjiDetails[k.char]);
    if (missing.length === 0) return;

    missing.forEach(async (k) => {
      try {
        const res = await fetch(`/api/kanji/reading?text=${encodeURIComponent(k.char)}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setRemoteKanjiDetails(prev => ({
              ...prev,
              [k.char]: {
                meaning_es: data.meaning_es || data.meaning_en || 'Ideograma kanji',
                meaning_en: data.meaning_en || '',
                level: data.level || 'N5',
                onyomi: data.katakana || '',
                kunyomi: data.hiragana || '',
                strokes: null
              }
            }));
          }
        }
      } catch (e) {
        console.warn('Error resolviendo kanji remoto:', e);
      }
    });
  }, [componentKanjis, remoteKanjiDetails]);

  if (!isOpen) return null;

  const handlePlayAudio = (text) => {
    if (!text) return;
    audioManager.speak(text);
  };

  const isWordSaved = (text) => {
    if (!text) return false;
    const clean = text.trim();
    return customVocab.some(v => 
      (v.kanji && v.kanji === clean) ||
      (v.hiragana && v.hiragana === clean) ||
      (v.text && v.text === clean)
    );
  };

  const savedPhrases = contextApp?.appState?.savedPhrases || [];
  const isPhraseSaved = (phraseText) => {
    if (!phraseText) return false;
    const clean = phraseText.trim();
    return isWordSaved(clean) || savedPhrases.some(p => p.japanese === clean);
  };

  const handleSaveToVocab = (wordItem, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!wordItem) return;

    const rawText = (wordItem.text || wordItem.kanji || query || '').trim();
    if (!rawText) return;

    const hasKanjis = containsKanji(rawText);
    const cleanKanji = hasKanjis ? rawText : '';
    let cleanHiragana = (wordItem.hiragana || wordItem.kana || '').trim();
    
    if (!cleanHiragana) {
      if (!hasKanjis) {
        cleanHiragana = rawText;
      } else {
        const syncMatch = convertKanjiToKanaSync(rawText, customVocab, externalVocab);
        if (syncMatch && syncMatch.hiragana && !containsKanji(syncMatch.hiragana)) {
          cleanHiragana = syncMatch.hiragana;
        }
      }
    }
    
    let cleanKatakana = (wordItem.katakana || '').trim();
    if (!cleanKatakana || containsKanji(cleanKatakana)) {
      cleanKatakana = hiraganaToKatakana(cleanHiragana || rawText);
    }
    if (containsKanji(cleanKatakana)) {
      cleanKatakana = cleanKanaOnly(cleanKatakana);
    }

    const meaning = (wordItem.meaning_es || '').trim();
    const level = wordItem.level || 'N5';
    const category = wordItem.category || 'Diccionario Rápido';
    const notes = (wordItem.notes || '').trim();

    if (onSaveWord) {
      onSaveWord({
        kanji: cleanKanji || rawText,
        hiragana: cleanHiragana,
        katakana: cleanKatakana,
        meaning_es: meaning,
        level: level,
        category: category,
        notes: notes
      });
    }

    if (contextApp?.handleUpdateState && contextApp?.appState) {
      const prevVocab = contextApp.appState.savedCustomVocab || [];
      const wordKey = cleanKanji || cleanHiragana || rawText;
      
      const newWord = {
        id: `v_custom_${Date.now()}`,
        kanji: cleanKanji || (hasKanjis ? rawText : ''),
        hiragana: cleanHiragana || rawText,
        katakana: cleanKatakana,
        kana: cleanHiragana || rawText,
        meaning_es: meaning || 'Guardado desde Diccionario',
        meaning_en: wordItem.meaning_en || '',
        category: category,
        level: level,
        notes: notes,
        source: 'Diccionario Rápido',
        date: new Date().toISOString()
      };

      let updatedPhrases = contextApp.appState.savedPhrases || [];
      if (rawText.length > 5 || rawText.includes(' ') || wordItem.category?.includes('Fórmula') || wordItem.category?.includes('Expresión')) {
        const newPhrase = {
          id: `phrase_${Date.now()}`,
          japanese: rawText,
          translation: meaning || 'Expresión guardada desde diccionario',
          source: 'Diccionario Rápido',
          date: new Date().toISOString()
        };
        updatedPhrases = [newPhrase, ...updatedPhrases.filter(p => p.japanese !== rawText)];
      }

      const updatedVocab = [newWord, ...prevVocab.filter(v => (v.kanji || v.hiragana) !== wordKey)];

      // Sincronización en memoria con catálogo de kanjis
      const detectedKanjis = extractKanjis(rawText);
      if (kanjiData && detectedKanjis.length > 0) {
        detectedKanjis.forEach(kChar => {
          const targetKanji = kanjiData.find(k => k.kanji === kChar);
          if (targetKanji) {
            if (!targetKanji.words) targetKanji.words = [];
            if (!targetKanji.words.some(w => w.word === newWord.kanji)) {
              targetKanji.words.push({
                word: newWord.kanji,
                reading: cleanHiragana,
                meaning: newWord.meaning_es
              });
            }
          }
        });
      }

      const updatedKanjiMap = { ...(contextApp.appState.masteredKanji || {}) };
      detectedKanjis.forEach(kChar => {
        if (updatedKanjiMap[kChar] === undefined) {
          updatedKanjiMap[kChar] = false;
        }
      });

      const newXp = (contextApp.appState.xp || 0) + 15;

      contextApp.handleUpdateState({
        ...contextApp.appState,
        savedCustomVocab: updatedVocab,
        savedPhrases: updatedPhrases,
        masteredKanji: updatedKanjiMap,
        xp: newXp
      });

      setJustSavedKey(rawText);
      setTimeout(() => setJustSavedKey(null), 3000);

      if (contextApp.showAlert) {
        contextApp.showAlert({
          type: 'success',
          title: '¡Guardada en tu Vocabulario! 🎉',
          message: `"${rawText}" se ha guardado correctamente (+15 XP).`
        });
      }
    } else if (contextApp?.openSaveModal) {
      contextApp.openSaveModal({
        type: (rawText.length > 15 || /[。！？]/.test(rawText)) ? 'phrase' : 'word',
        text: rawText,
        kanji: cleanKanji,
        hiragana: cleanHiragana,
        katakana: cleanKatakana,
        meaning_es: meaning,
        level: level,
        category: category,
        source: 'Diccionario Rápido'
      });
    }
  };

  const handleOpenEditModal = (wordItem, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!wordItem) return;
    const rawText = (wordItem.text || wordItem.kanji || query || '').trim();
    const hasKanjis = containsKanji(rawText);
    const cleanKanji = hasKanjis ? rawText : '';
    let cleanHiragana = (wordItem.hiragana || wordItem.kana || '').trim();
    if (!cleanHiragana && !hasKanjis) cleanHiragana = rawText;
    let cleanKatakana = (wordItem.katakana || '').trim() || hiraganaToKatakana(cleanHiragana || rawText);

    if (contextApp?.openSaveModal) {
      contextApp.openSaveModal({
        type: (rawText.length > 15 || /[。！？]/.test(rawText)) ? 'phrase' : 'word',
        text: rawText,
        kanji: cleanKanji,
        hiragana: cleanHiragana,
        katakana: cleanKatakana,
        meaning_es: wordItem.meaning_es || '',
        level: wordItem.level || 'N5',
        category: wordItem.category || 'Diccionario Rápido',
        notes: wordItem.notes || '',
        source: 'Diccionario Rápido'
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

              {/* Full Phrase / Expression Summary Card (When the whole search query is a known formula or set expression) */}
              {directLookup && directLookup.meaning_es && analysis.length > 1 && (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.06))',
                  border: '1.5px solid rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--primary)'
                      }}>
                        {directLookup.level || 'N5'}
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
                        {directLookup.category || 'Fórmula / Expresión Completa'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={(e) => handleSaveToVocab(directLookup, e)}
                        className="btn btn-sm"
                        style={{
                          padding: '4px 12px',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          gap: 5,
                          background: (isPhraseSaved(query) || justSavedKey === query) ? '#10b981' : 'var(--primary)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        title="Guardar expresión completa a mi vocabulario"
                      >
                        {(isPhraseSaved(query) || justSavedKey === query) ? (
                          <>
                            <Check size={14} />
                            <span>¡Frase Guardada!</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus size={14} />
                            <span>Guardar Frase (+15 XP)</span>
                          </>
                        )}
                      </button>
                      {contextApp?.openSaveModal && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(directLookup, e)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem', borderRadius: 6 }}
                          title="Personalizar detalles en cuaderno"
                        >
                          <Edit3 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 2 }}>
                      Significado Global de la Expresión:
                    </span>
                    <div style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35 }}>
                      {directLookup.meaning_es}
                    </div>
                  </div>

                  {directLookup.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border)', paddingTop: 6, lineHeight: 1.4 }}>
                      💡 {directLookup.notes}
                    </div>
                  )}
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
                            {(() => {
                              if (token.category === 'Prefijo de Cortesía' || token.category?.includes('Prefijo')) {
                                return 'Prefijo Keigo';
                              }
                              if (token.baseForm === 'する' || token.text === 'します') {
                                return 'hacer';
                              }
                              if (token.hasInferredKanjiMeaning && token.meaning_es) {
                                return token.meaning_es.split('+')[0].trim();
                              }
                              if (!token.meaning_es && containsKanji(token.text)) {
                                const kChars = extractKanjis(token.text);
                                const found = kChars.map(c => kanjiData?.find(k => k.kanji === c)?.meaning_es).filter(Boolean);
                                if (found.length > 0) {
                                  return found.map(m => m.split(',')[0].trim()).join('·');
                                }
                              }
                              const raw = token.meaning_es ? token.meaning_es.split('[')[0].split('/')[0].trim() : (token.category || 'Palabra');
                              if (raw === 'Texto' && containsKanji(token.text)) {
                                return 'Jukugo 熟語';
                              }
                              return raw || token.category || 'Palabra';
                            })()}
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
                          {(() => {
                            if (currentToken.level && currentToken.level !== 'N5') return currentToken.level;
                            const nonN5 = componentKanjis.find(k => k.level && k.level !== 'N5');
                            return nonN5?.level || currentToken.level || 'N5';
                          })()}
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
                          {(() => {
                            if ((currentToken.category === 'Texto' || !currentToken.category) && componentKanjis.length > 0) {
                              return (
                                <TerminologyTooltip termId="jukugo">
                                  <span>Palabra Compuesta (Jukugo 熟語)</span>
                                </TerminologyTooltip>
                              );
                            }
                            if (currentToken.category?.includes('Prefijo')) {
                              return (
                                <TerminologyTooltip termId="bikougo">
                                  <span>{currentToken.category}</span>
                                </TerminologyTooltip>
                              );
                            }
                            return currentToken.category || 'Vocabulario General';
                          })()}
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
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Significado en Español:
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.45 }}>
                      {currentToken.meaning_es ? (
                        currentToken.meaning_es
                      ) : componentKanjis.length > 0 && componentKanjis.some(k => k.meaning_es || k.meaning_en) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: '0.82rem', fontWeight: 700 }}>
                            <Sparkles size={14} color="#f59e0b" />
                            <span>Significado inferido por sus Kanjis:</span>
                          </div>
                          <div style={{ fontSize: '1.12rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35 }}>
                            {componentKanjis.map(k => `${k.char}「${k.meaning_es || k.meaning_en || 'ideograma'}」`).join(' + ')}
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                            Esta palabra no tiene entrada directa en el glosario base, pero se deduce de la suma de sus ideogramas componentes.
                          </p>
                        </div>
                      ) : (
                        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                          No se encontró definición directa. Puede ser un nombre propio o término no catalogado.
                        </span>
                      )}
                    </div>
                    {currentToken.notes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, borderTop: '1px dashed var(--border)', paddingTop: 6 }}>
                        💡 {currentToken.notes}
                      </div>
                    )}
                  </div>

                  {/* Component Kanjis Breakdown Section */}
                  {componentKanjis.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.03))',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Sparkles size={15} color="var(--primary)" />
                          <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)' }}>
                            Kanjis que componen esta palabra ({componentKanjis.length})
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Toca un kanji para consultarlo
                        </span>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: componentKanjis.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 10
                      }}>
                        {componentKanjis.map((k, kIdx) => (
                          <div
                            key={kIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                              padding: '10px 12px',
                              borderRadius: 8,
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                            }}
                          >
                            {/* Kanji Large Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setQuery(k.char);
                                setActiveTokenIndex(0);
                              }}
                              title={`Consultar kanji ${k.char}`}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 8,
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))',
                                border: '1.5px solid var(--primary)',
                                color: 'var(--primary)',
                                fontSize: '1.6rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexShrink: 0,
                                padding: 0
                              }}
                              className="jp-text"
                            >
                              {k.char}
                            </button>

                            {/* Kanji Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                <span style={{
                                  fontSize: '0.84rem',
                                  fontWeight: 700,
                                  color: 'var(--text-main)',
                                  lineHeight: 1.2
                                }}>
                                  {k.meaning_es || k.meaning_en || 'Ideograma'}
                                </span>
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  background: 'rgba(99, 102, 241, 0.12)',
                                  color: 'var(--primary)',
                                  flexShrink: 0
                                }}>
                                  {k.level || 'N5'}
                                </span>
                              </div>

                              {/* Readings On / Kun */}
                              {(k.onyomi || k.kunyomi) && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                                  {k.onyomi && <span><strong>On:</strong> {k.onyomi} </span>}
                                  {k.kunyomi && <span><strong>Kun:</strong> {k.kunyomi}</span>}
                                </div>
                              )}

                              {/* Mnemonic snippet if exists */}
                              {k.mnemonic && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.25, marginTop: 2 }}>
                                  💡 {k.mnemonic}
                                </div>
                              )}

                              {/* Quick actions */}
                              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenPracticePad({ text: k.char, hiragana: k.onyomi || k.kunyomi })}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3
                                  }}
                                >
                                  <span>✍️ Trazos</span>
                                </button>
                                <span style={{ color: 'var(--border)' }}>·</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuery(k.char);
                                    setActiveTokenIndex(0);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3
                                  }}
                                >
                                  <span>🔍 Ver kanji</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Bar for the Word */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={(e) => handleSaveToVocab(currentToken, e)}
                      className="btn btn-sm"
                      style={{
                        flex: 1.2,
                        justifyContent: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        borderRadius: 8,
                        border: (isWordSaved(currentToken.text) || justSavedKey === currentToken.text)
                          ? '1.5px solid #10b981'
                          : '1.5px solid var(--primary)',
                        background: (isWordSaved(currentToken.text) || justSavedKey === currentToken.text)
                          ? '#10b981'
                          : 'var(--primary)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
                      }}
                      title="Guardar palabra en tu vocabulario personal"
                    >
                      {(isWordSaved(currentToken.text) || justSavedKey === currentToken.text) ? (
                        <>
                          <Check size={16} />
                          <span>✓ ¡Guardada!</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus size={16} />
                          <span>Guardar Palabra (+15 XP)</span>
                        </>
                      )}
                    </button>

                    {contextApp?.openSaveModal && (
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(currentToken, e)}
                        className="btn btn-outline btn-sm"
                        style={{
                          padding: '8px 10px',
                          fontSize: '0.8rem',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4
                        }}
                        title="Personalizar categoría, notas o detalles"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenPracticePad(currentToken)}
                      className="btn btn-outline btn-sm"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        fontSize: '0.82rem',
                        borderRadius: 8
                      }}
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
