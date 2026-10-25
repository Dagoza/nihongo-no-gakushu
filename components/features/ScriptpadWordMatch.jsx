'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw, CheckCircle2, Sparkles, Volume2, ArrowRight, Grid } from 'lucide-react';
import audioManager from '../../lib/audioManager';
import { triggerCheerConfetti } from '../../lib/confetti';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function ScriptpadWordMatch({
  lesson,
  onClose,
  onComplete
}) {
  const allWords = lesson?.words || [];
  const [round, setRound] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const roundSize = 5;

  const currentBatch = React.useMemo(() => {
    const start = round * roundSize;
    return allWords.slice(start, start + roundSize);
  }, [allWords, round]);

  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [errorPair, setErrorPair] = useState(null);

  useEffect(() => {
    if (currentBatch.length === 0) return;
    setLeftItems(shuffle(currentBatch.map(w => ({ id: w.id, text: w.kanji, hiragana: w.hiragana, word: w }))));
    setRightItems(shuffle(currentBatch.map(w => ({ id: w.id, text: w.meaning_es, word: w }))));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedIds(new Set());
    setErrorPair(null);
  }, [currentBatch]);

  const handleSelectLeft = (item) => {
    if (matchedIds.has(item.id)) return;
    try {
      if (typeof audioManager?.playWord === 'function') {
        audioManager.playWord(item.word);
      } else if (typeof audioManager?.speak === 'function') {
        audioManager.speak(item.word?.hiragana || item.word?.kana || item.word?.kanji || '', {
          audioUrl: item.word?.audio_url
        });
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
    setSelectedLeft(item);
    if (selectedRight) {
      checkMatch(item, selectedRight);
    }
  };

  const handleSelectRight = (item) => {
    if (matchedIds.has(item.id)) return;
    setSelectedRight(item);
    if (selectedLeft) {
      checkMatch(selectedLeft, item);
    }
  };

  const checkMatch = (left, right) => {
    if (left.id === right.id) {
      // Correct match!
      setMatchedIds(prev => {
        const next = new Set(prev);
        next.add(left.id);
        if (next.size === currentBatch.length) {
          // Ronda completada
          setTimeout(() => {
            if ((round + 1) * roundSize < allWords.length) {
              setRound(r => r + 1);
            } else {
              triggerCheerConfetti();
              setIsFinished(true);
              if (onComplete) {
                onComplete({
                  mode: 'match',
                  score: 100,
                  totalWords: allWords.length,
                  wordsPracticed: allWords
                });
              }
            }
          }, 600);
        }
        return next;
      });
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Error
      setErrorPair({ leftId: left.id, rightId: right.id });
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setErrorPair(null);
      }, 500);
    }
  };

  // Pantalla de finalización
  if (isFinished) {
    return (
      <div className="scriptpad-finish-view" style={{
        maxWidth: 540,
        margin: '0 auto',
        padding: '32px 20px',
        paddingBottom: 140,
        textAlign: 'center',
        background: 'var(--bg-surface)',
        borderRadius: 24,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          boxShadow: '0 8px 24px rgba(244, 63, 94, 0.35)'
        }}>
          <Grid size={40} />
        </div>

        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 6, color: 'var(--text-main)' }}>
          ¡Word Match Completado!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 20 }}>
          Has emparejado con éxito todas las <strong>{allWords.length} palabras</strong> de {lesson?.title}.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ borderRadius: 12, padding: '10px 20px', fontWeight: 700 }}
            onClick={() => {
              setIsFinished(false);
              setRound(0);
            }}
          >
            <RotateCcw size={16} />
            <span>Jugar de Nuevo</span>
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

  return (
    <div className="scriptpad-match-container" style={{
      width: '100%',
      maxWidth: 580,
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

      {/* Header */}
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
            Word Match · Empareja palabras
          </div>
        </div>
      </div>

      {/* Grid de Emparejamiento */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        padding: '24px 18px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Columna Izquierda (Japonés) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>
            Japonés (日本語)
          </div>
          {leftItems.map(item => {
            const isMatched = matchedIds.has(item.id);
            const isSelected = selectedLeft?.id === item.id;
            const isError = errorPair?.leftId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectLeft(item)}
                disabled={isMatched}
                style={{
                  minHeight: 56,
                  padding: '8px 12px',
                  borderRadius: 14,
                  border: isMatched 
                    ? '1px solid rgba(16, 185, 129, 0.4)' 
                    : isError 
                    ? '2px solid #ef4444' 
                    : isSelected 
                    ? '2px solid var(--primary)' 
                    : '1px solid var(--border)',
                  background: isMatched 
                    ? 'rgba(16, 185, 129, 0.12)' 
                    : isSelected 
                    ? 'rgba(99, 102, 241, 0.15)' 
                    : 'var(--bg-main)',
                  color: isMatched ? '#10b981' : 'var(--text-main)',
                  cursor: isMatched ? 'default' : 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{item.text}</span>
                <span style={{ fontSize: '0.75rem', color: isMatched ? '#10b981' : 'var(--primary)' }}>{item.hiragana}</span>
              </button>
            );
          })}
        </div>

        {/* Columna Derecha (Español) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>
            Español (スペイン語)
          </div>
          {rightItems.map(item => {
            const isMatched = matchedIds.has(item.id);
            const isSelected = selectedRight?.id === item.id;
            const isError = errorPair?.rightId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectRight(item)}
                disabled={isMatched}
                style={{
                  minHeight: 56,
                  padding: '8px 12px',
                  borderRadius: 14,
                  border: isMatched 
                    ? '1px solid rgba(16, 185, 129, 0.4)' 
                    : isError 
                    ? '2px solid #ef4444' 
                    : isSelected 
                    ? '2px solid var(--primary)' 
                    : '1px solid var(--border)',
                  background: isMatched 
                    ? 'rgba(16, 185, 129, 0.12)' 
                    : isSelected 
                    ? 'rgba(99, 102, 241, 0.15)' 
                    : 'var(--bg-main)',
                  color: isMatched ? '#10b981' : 'var(--text-main)',
                  cursor: isMatched ? 'default' : 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
