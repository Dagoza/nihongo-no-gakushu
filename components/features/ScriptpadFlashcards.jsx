'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, ChevronLeft, ChevronRight, RotateCcw, Check, ArrowRight, Layers } from 'lucide-react';
import audioManager from '../../lib/audioManager';
import { triggerCheerConfetti } from '../../lib/confetti';

export default function ScriptpadFlashcards({
  lesson,
  onClose,
  onComplete
}) {
  const words = lesson?.words || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState(new Set());

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
      if (onComplete) {
        onComplete({
          score: Math.round((knownWords.size / words.length) * 100) || 100,
          totalWords: words.length
        });
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleKnown = (wordId) => {
    setKnownWords(prev => {
      const next = new Set(prev);
      if (next.has(wordId)) next.delete(wordId);
      else next.add(wordId);
      return next;
    });
  };

  if (!currentWord) return null;

  return (
    <div className="scriptpad-flashcards-container" style={{
      maxWidth: 500,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
      {/* Barra de progreso superior */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        padding: '12px 18px',
        borderRadius: 18,
        border: '1px solid var(--border)'
      }}>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10 }}
        >
          <ChevronLeft size={16} />
          <span>Salir</span>
        </button>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {lesson.title} - Flashcards
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tarjeta {currentIndex + 1} de {words.length}
          </div>
        </div>

        <button
          type="button"
          onClick={playAudio}
          className="btn btn-primary btn-sm"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Escuchar audio"
        >
          <Volume2 size={16} />
        </button>
      </div>

      {/* Tarjeta Flip 3D */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          perspective: 1000,
          cursor: 'pointer',
          minHeight: 280
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
          padding: '32px 20px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* LADO FRONTAL (Pregunta / Kanji) */}
          <div style={{
            backfaceVisibility: 'hidden',
            display: isFlipped ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
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
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: 2 }}>
              {currentWord.kanji}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
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
            gap: 10
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
              {currentWord.hiragana}
            </div>
            {currentWord.romaji && (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {currentWord.romaji}
              </div>
            )}
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 8 }}>
              {currentWord.meaning_es}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
              Toca para volver a voltear ↻
            </div>
          </div>
        </div>
      </div>

      {/* Controles de navegación */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        padding: '12px 18px',
        borderRadius: 18,
        border: '1px solid var(--border)'
      }}>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{ borderRadius: 10 }}
        >
          <ChevronLeft size={16} />
          <span>Anterior</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm ${knownWords.has(currentWord.id) ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => toggleKnown(currentWord.id)}
          style={{ borderRadius: 10 }}
        >
          <Check size={16} />
          <span>{knownWords.has(currentWord.id) ? 'Aprendida ✓' : 'Marcar aprendida'}</span>
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleNext}
          style={{ borderRadius: 10 }}
        >
          <span>{currentIndex === words.length - 1 ? 'Terminar' : 'Siguiente'}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
