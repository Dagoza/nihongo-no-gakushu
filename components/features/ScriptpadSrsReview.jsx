'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Volume2, 
  ChevronLeft, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  PenTool, 
  Eye, 
  Layers,
  ArrowRight
} from 'lucide-react';
import audioManager from '../../lib/audioManager';
import { triggerCheerConfetti } from '../../lib/confetti';
import { SRSRating, reviewCard, getIntervalPreviews } from '../../lib/srs';

export default function ScriptpadSrsReview({
  queue = [],
  onClose,
  appState = {},
  onUpdateState,
  onComplete
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const isDark = (typeof document !== 'undefined' && document.body?.getAttribute('data-theme') === 'dark') || appState?.theme === 'dark';

  const currentItem = queue[currentIndex];

  // Lienzo de escritura táctil para el repaso
  const canvasRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef([]);

  const playAudio = useCallback(() => {
    if (!currentItem) return;
    try {
      if (typeof audioManager?.playWord === 'function') {
        audioManager.playWord(currentItem);
      } else if (typeof audioManager?.speak === 'function') {
        audioManager.speak(currentItem.hiragana || currentItem.kana || currentItem.kanji || '', {
          audioUrl: currentItem.audio_url
        });
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }, [currentItem]);

  useEffect(() => {
    setIsRevealed(false);
    setStrokes([]);
    if (currentItem) {
      playAudio();
    }
  }, [currentIndex, currentItem, playAudio]);

  // Dibujar lienzo con cuadrícula
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = (typeof document !== 'undefined' && document.body?.getAttribute('data-theme') === 'dark') || appState?.theme === 'dark';
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Cuadrícula cruzada
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(99, 102, 241, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeStyle = isDark ? 'rgba(129, 140, 248, 0.45)' : 'rgba(99, 102, 241, 0.25)';
    ctx.strokeRect(1, 1, width - 2, height - 2);
    ctx.restore();

    // Si está revelado, mostrar el modelo en transparencia suave para comparar
    if (isRevealed && currentItem) {
      ctx.save();
      ctx.font = `bold ${Math.floor(height * 0.65)}px "Noto Sans JP", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isDark ? 'rgba(224, 231, 255, 0.35)' : 'rgba(99, 102, 241, 0.2)';
      ctx.fillText(currentItem.kanji || currentItem.hiragana, width / 2, height / 2 + 6);
      ctx.restore();
    }

    // Trazos del usuario
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isDark ? '#ffffff' : '#0f172a';

    strokes.forEach(stroke => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.lineWidth = stroke[0].w || 12;
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });
    ctx.restore();
  }, [strokes, isRevealed, currentItem, appState?.theme]);

  // Manejadores Pointer para dibujar de memoria
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    currentStrokeRef.current = [{ x, y, w: 10 }];
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStrokeRef.current.push({ x, y, w: 10 });
    setStrokes([...strokes, [...currentStrokeRef.current]]);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStrokeRef.current.length > 0) {
      setStrokes(prev => [...prev, currentStrokeRef.current]);
      currentStrokeRef.current = [];
    }
  };

  // Calificar tarjeta con FSRS
  const handleRate = (rating) => {
    if (!currentItem) return;

    const currentCard = currentItem.card;
    const updatedCard = reviewCard(currentCard, rating);

    // Guardar en srsQuestions
    if (onUpdateState) {
      const nextQuestions = {
        ...(appState?.srsQuestions || {}),
        [currentItem.cardKey]: updatedCard
      };

      onUpdateState({
        ...appState,
        srsQuestions: nextQuestions
      });
    }

    setReviewHistory(prev => [...prev, { item: currentItem, rating }]);

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      triggerCheerConfetti();
      setIsFinished(true);
      if (onComplete) {
        onComplete({
          mode: 'srs',
          totalWords: queue.length,
          wordsPracticed: queue
        });
      }
    }
  };

  // Previsualizaciones de intervalos FSRS
  const intervals = React.useMemo(() => {
    if (!currentItem?.card) return { 1: '1m', 2: '10m', 3: '1d', 4: '4d' };
    return getIntervalPreviews(currentItem.card);
  }, [currentItem]);

  // Pantalla de finalización
  if (isFinished || (currentIndex >= queue.length && reviewHistory.length > 0)) {
    return (
      <div className="srs-finish-card" style={{
        maxWidth: 500,
        margin: '0 auto',
        padding: '32px 20px',
        paddingBottom: 140,
        textAlign: 'center',
        background: 'var(--bg-surface)',
        borderRadius: 24,
        border: '1px solid var(--border)'
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <CheckCircle2 size={40} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
          ¡Repaso Completado!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 24 }}>
          Has repasado {reviewHistory.length} palabras de escritura a mano con el algoritmo FSRS.
        </p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onClose}
          style={{ padding: '12px 28px', borderRadius: 14, fontWeight: 700 }}
        >
          Volver al Scriptpad
        </button>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg-surface)', borderRadius: 20 }}>
        <h3>No hay palabras pendientes para repasar ahora 🎉</h3>
        <p style={{ color: 'var(--text-muted)' }}>¡Estás al día con tus repasos de escritura!</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={onClose} style={{ marginTop: 12 }}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="scriptpad-srs-container" style={{
      maxWidth: 580,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      paddingBottom: 140
    }}>
      {/* Header superior */}
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
            Repaso SRS de Escritura (FSRS)
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Palabra {currentIndex + 1} de {queue.length}
          </div>
        </div>

        <button
          type="button"
          onClick={playAudio}
          className="btn btn-primary btn-sm"
          style={{ width: 36, height: 36, borderRadius: '50%', padding: 0 }}
          title="Escuchar"
        >
          <Volume2 size={16} />
        </button>
      </div>

      {/* Tarjeta de Pregunta */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 22,
        padding: '18px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
          Escribe de memoria en japonés:
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
          {currentItem.meaning_es}
        </div>
        {isRevealed && (
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginTop: 8 }}>
            {currentItem.kanji} <span style={{ fontSize: '1rem', opacity: 0.75 }}>({currentItem.hiragana})</span>
          </div>
        )}
      </div>

      {/* Lienzo táctil para trazar la palabra */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '2px solid var(--border)',
        borderRadius: 24,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            width: 280,
            height: 280,
            borderRadius: 20,
            background: isDark ? '#070b14' : '#faf6ee',
            border: `2px solid ${isDark ? 'rgba(129, 140, 248, 0.45)' : 'rgba(99, 102, 241, 0.25)'}`,
            boxShadow: isDark ? 'inset 0 2px 14px rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.4)' : 'inset 0 1px 4px rgba(0,0,0,0.04)',
            cursor: 'crosshair',
            touchAction: 'none'
          }}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setStrokes([])}
            style={{ borderRadius: 10 }}
          >
            <RotateCcw size={14} />
            <span>Borrar</span>
          </button>
        </div>
      </div>

      {/* Botón Revelar o Botones de Calificación FSRS */}
      {!isRevealed ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsRevealed(true)}
          style={{
            padding: '14px 20px',
            borderRadius: 16,
            fontSize: '1rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Sparkles size={18} />
          <span>Comprobar y Revelar Modelo</span>
        </button>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8
        }}>
          <button
            type="button"
            onClick={() => handleRate(SRSRating.Again)}
            style={{
              padding: '10px 4px',
              borderRadius: 14,
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Otra vez</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{intervals[1] || '1m'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRate(SRSRating.Hard)}
            style={{
              padding: '10px 4px',
              borderRadius: 14,
              border: '1px solid rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Difícil</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{intervals[2] || '10m'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRate(SRSRating.Good)}
            style={{
              padding: '10px 4px',
              borderRadius: 14,
              border: '1px solid rgba(59, 130, 246, 0.4)',
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Bueno</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{intervals[3] || '1d'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRate(SRSRating.Easy)}
            style={{
              padding: '10px 4px',
              borderRadius: 14,
              border: '1px solid rgba(16, 185, 129, 0.4)',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Fácil</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{intervals[4] || '4d'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
