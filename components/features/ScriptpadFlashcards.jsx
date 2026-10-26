'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Volume2, ChevronLeft, ChevronRight, RotateCcw, Check, ArrowRight, Layers, CheckCircle2, Award } from 'lucide-react';
import audioManager from '../../lib/audioManager';
import { triggerCheerConfetti } from '../../lib/confetti';

export default function ScriptpadFlashcards({
  lesson,
  onClose,
  onComplete,
  appState = {},
  onUpdateState
}) {
  const words = lesson?.words || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Inicializar palabras aprendidas desde el estado persistido (scriptpadWordProgress y masteredVocab)
  const initialKnown = useMemo(() => {
    const set = new Set();
    words.forEach(w => {
      const key = w.kanji || w.hiragana || w.id;
      if (
        appState?.scriptpadWordProgress?.[key]?.mastered ||
        appState?.masteredVocab?.[w.id] ||
        appState?.masteredVocab?.[key]
      ) {
        set.add(w.id);
      }
    });
    return set;
  }, [words, appState?.scriptpadWordProgress, appState?.masteredVocab]);

  const [knownWords, setKnownWords] = useState(initialKnown);

  useEffect(() => {
    setKnownWords(initialKnown);
  }, [initialKnown]);

  const currentWord = words[currentIndex] || words[0];

  const playAudio = useCallback(() => {
    if (!currentWord) return;
    try {
      if (typeof audioManager?.playWord === 'function') {
        audioManager.playWord(currentWord);
      } else if (typeof audioManager?.speak === 'function') {
        audioManager.speak(currentWord.hiragana || currentWord.kana || currentWord.kanji || '', {
          audioUrl: currentWord.audio_url
        });
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }, [currentWord]);

  useEffect(() => {
    setIsFlipped(false);
    playAudio();
  }, [currentIndex, playAudio]);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      triggerCheerConfetti();
      setIsFinished(true);
      if (onComplete) {
        onComplete({
          mode: 'flashcards',
          score: Math.round((knownWords.size / words.length) * 100) || 100,
          totalWords: words.length,
          knownCount: knownWords.size,
          wordsPracticed: words.filter(w => knownWords.has(w.id))
        });
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Alternar y persistir inmediatamente el estado de aprendizaje en appState y Supabase
  const toggleKnown = (word) => {
    if (!word) return;
    const isNowKnown = !knownWords.has(word.id);
    const nextSet = new Set(knownWords);
    if (isNowKnown) nextSet.add(word.id);
    else nextSet.delete(word.id);
    setKnownWords(nextSet);

    if (onUpdateState) {
      const key = word.kanji || word.hiragana || word.id;
      onUpdateState((prev) => {
        const base = prev || appState || {};
        const currentWordProgress = { ...(base?.scriptpadWordProgress || {}) };
        const currentMasteredVocab = { ...(base?.masteredVocab || {}) };

        if (isNowKnown) {
          currentWordProgress[key] = {
            timesPracticed: (currentWordProgress[key]?.timesPracticed || 0) + 1,
            lastPracticedAt: new Date().toISOString(),
            mastered: true
          };
          if (word.id) currentMasteredVocab[word.id] = true;
        } else {
          if (currentWordProgress[key]) delete currentWordProgress[key];
          if (word.id) delete currentMasteredVocab[word.id];
        }

        return {
          ...base,
          scriptpadWordProgress: currentWordProgress,
          masteredVocab: currentMasteredVocab
        };
      });
    }
  };

  if (!currentWord) return null;

  // ==========================================
  // PANTALLA DE FINALIZACIÓN
  // ==========================================
  if (isFinished) {
    return (
      <div className="scriptpad-finish-view" style={{
        width: '100%',
        maxWidth: 500,
        margin: '0 auto',
        padding: '28px 16px',
        textAlign: 'center',
        background: 'var(--bg-surface)',
        borderRadius: 24,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        boxSizing: 'border-box'
      }}>
        <div style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)'
        }}>
          <Layers size={40} />
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
          ¡Flashcards Completadas!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 20 }}>
          Has repasado las <strong>{words.length} tarjetas</strong> de {lesson?.title}.
        </p>

        <div style={{
          background: 'var(--bg-main)',
          padding: '12px 18px',
          borderRadius: 16,
          border: '1px solid var(--border)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
            {knownWords.size} / {words.length}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            palabras marcadas como aprendidas
          </span>
        </div>

        {/* Listado de palabras y su estado */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: 10,
          marginBottom: 28,
          textAlign: 'left'
        }}>
          {words.map((w, idx) => {
            const isWordLearned = knownWords.has(w.id);
            return (
              <div key={idx} style={{
                background: 'var(--bg-main)',
                border: isWordLearned ? '1.5px solid #10b981' : '1px solid var(--border)',
                borderRadius: 14,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                position: 'relative'
              }}>
                {isWordLearned && (
                  <span style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    color: '#10b981',
                    fontSize: '0.7rem'
                  }}>
                    ✓
                  </span>
                )}
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {w.kanji}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {w.hiragana}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {w.meaning_es}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ borderRadius: 12, padding: '10px 20px', fontWeight: 700 }}
            onClick={() => {
              setIsFinished(false);
              setCurrentIndex(0);
            }}
          >
            <RotateCcw size={16} />
            <span>Repasar Otra Vez</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ borderRadius: 12, padding: '10px 24px', fontWeight: 700 }}
            onClick={onClose}
          >
            <span>Volver a la Lección</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const isCurrentKnown = knownWords.has(currentWord.id);

  return (
    <div className="scriptpad-flashcards-container" style={{
      width: '100%',
      maxWidth: 480,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxSizing: 'border-box'
    }}>
      {/* Botón de Salir fuera y arriba de la card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%'
      }}>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-outline btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 12,
            padding: '7px 14px',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
          aria-label="Cerrar lección"
        >
          <ChevronLeft size={16} />
          <span>Salir</span>
        </button>
      </div>

      {/* Barra de progreso superior */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        padding: '12px 18px',
        borderRadius: 18,
        border: '1px solid var(--border)',
        width: '100%',
        boxSizing: 'border-box',
        gap: 12
      }}>
        <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            lineHeight: 1.3,
            wordBreak: 'break-word'
          }}>
            {lesson.title}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: 2
          }}>
            Flashcards · Tarjeta {currentIndex + 1} de {words.length}
          </div>
        </div>

        <button
          type="button"
          onClick={playAudio}
          className="btn btn-primary btn-sm"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
            flexShrink: 0
          }}
          title="Escuchar audio"
        >
          <Volume2 size={18} />
        </button>
      </div>

      {/* Tarjeta Flip 3D */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          perspective: 1000,
          cursor: 'pointer',
          minHeight: 280,
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: 280,
          textAlign: 'center',
          transition: 'transform 0.4s ease',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'none',
          background: 'var(--bg-surface)',
          border: '2px solid var(--border)',
          borderRadius: 24,
          padding: '28px 16px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box'
        }}>
          {/* LADO FRONTAL (Pregunta / Kanji) */}
          <div style={{
            backfaceVisibility: 'hidden',
            display: isFlipped ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <span style={{
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '2px 10px',
              borderRadius: 10
            }}>
              {currentWord.level || 'N5'}
            </span>
            <div style={{
              fontSize: 'clamp(2.4rem, 10vw, 3.2rem)',
              fontWeight: 900,
              color: 'var(--text-main)',
              letterSpacing: 2,
              wordBreak: 'break-word',
              maxWidth: '100%'
            }}>
              {currentWord.kanji}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Toca para voltear y ver significado ↺
            </div>
          </div>

          {/* LADO TRASERO (Respuesta / Significado) */}
          <div style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: isFlipped ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              fontSize: 'clamp(1.4rem, 6vw, 1.8rem)',
              fontWeight: 800,
              color: 'var(--primary)',
              wordBreak: 'break-word',
              maxWidth: '100%'
            }}>
              {currentWord.hiragana}
            </div>
            {currentWord.romaji && (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                {currentWord.romaji}
              </div>
            )}
            <div style={{
              fontSize: 'clamp(1.15rem, 5vw, 1.35rem)',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginTop: 6,
              wordBreak: 'break-word',
              maxWidth: '100%'
            }}>
              {currentWord.meaning_es}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10 }}>
              Toca para volver a voltear ↻
            </div>
          </div>
        </div>
      </div>

      {/* Controles de navegación en cuadrícula perfecta para móviles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
        gap: 8,
        alignItems: 'center',
        background: 'var(--bg-surface)',
        padding: '10px 12px',
        borderRadius: 18,
        border: '1px solid var(--border)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            borderRadius: 10,
            padding: '8px 8px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            width: '100%',
            minWidth: 0,
            whiteSpace: 'nowrap'
          }}
        >
          <ChevronLeft size={16} />
          <span>Anterior</span>
        </button>

        <button
          type="button"
          className="btn btn-sm"
          onClick={() => toggleKnown(currentWord)}
          style={{
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: '0.8rem',
            fontWeight: 800,
            background: isCurrentKnown ? '#10b981' : 'transparent',
            borderColor: isCurrentKnown ? '#10b981' : 'var(--border)',
            color: isCurrentKnown ? '#ffffff' : 'var(--text-main)',
            borderWidth: 1.5,
            borderStyle: 'solid',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
          title={isCurrentKnown ? 'Marcada como aprendida' : 'Marcar como aprendida'}
        >
          <Check size={15} strokeWidth={isCurrentKnown ? 3 : 2} />
          <span>{isCurrentKnown ? 'Aprendida' : 'Aprender'}</span>
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleNext}
          style={{
            borderRadius: 10,
            padding: '8px 8px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            width: '100%',
            minWidth: 0,
            whiteSpace: 'nowrap'
          }}
        >
          <span>{currentIndex === words.length - 1 ? 'Terminar' : 'Siguiente'}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
