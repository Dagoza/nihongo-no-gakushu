import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Undo2, RotateCcw, AlertCircle, Check, Zap, CheckCircle2 } from 'lucide-react';
import { SRSRating, getIntervalPreviews } from '../../lib/srs';

export default function SrsReview({ 
  queue = [], 
  onRate, 
  onUndo, 
  getCurrentCard, 
  onExit, 
  backLabel = 'Volver',
  renderFront, 
  renderBack 
}) {
  const [srsReviewIndex, setSrsReviewIndex] = useState(0);
  const [srsRevealed, setSrsRevealed] = useState(false);
  const [reviewHistory, setReviewHistory] = useState([]);

  const currentItem = queue[srsReviewIndex];

  // Retroalimentación háptica y auditiva sutil para calificaciones FSRS (REC-02)
  const triggerSrsFeedback = useCallback((rating) => {
    if (typeof window === 'undefined') return;

    // 1. Feedback háptico en móviles
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        if (rating === SRSRating.EASY) navigator.vibrate([15, 30, 20]);
        else if (rating === SRSRating.GOOD) navigator.vibrate(20);
        else if (rating === SRSRating.HARD) navigator.vibrate(30);
        else navigator.vibrate([40, 40, 40]);
      } catch {}
    }

    // 2. Tono auditivo sintetizado mediante Web Audio API
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      if (rating === SRSRating.EASY) {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (rating === SRSRating.GOOD) {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.10); // E5
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (rating === SRSRating.HARD) {
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else { // AGAIN
        osc.frequency.setValueAtTime(330, ctx.currentTime); // E4
        osc.frequency.setValueAtTime(261.63, ctx.currentTime + 0.08); // C4
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      }
    } catch {}
  }, []);

  // Calificación de tarjeta
  const handleRate = useCallback((rating) => {
    if (!currentItem) return;
    triggerSrsFeedback(rating);
    const prevCard = getCurrentCard ? getCurrentCard(currentItem) : null;
    
    setReviewHistory(prev => [
      ...prev,
      {
        index: srsReviewIndex,
        item: currentItem,
        rating,
        prevCard
      }
    ]);

    if (onRate) {
      onRate(currentItem, rating);
    }
    setSrsRevealed(false);
    setSrsReviewIndex(prev => prev + 1);
  }, [currentItem, getCurrentCard, onRate, srsReviewIndex]);

  // Deshacer / Devolver tarjeta anterior
  const handleUndo = useCallback(() => {
    if (reviewHistory.length === 0) return;
    const last = reviewHistory[reviewHistory.length - 1];
    setReviewHistory(prev => prev.slice(0, -1));

    if (onUndo) {
      onUndo(last.item, last.prevCard);
    }

    setSrsReviewIndex(last.index);
    setSrsRevealed(true); // Se muestra la respuesta de la tarjeta recuperada
  }, [reviewHistory, onUndo]);

  // Atajos de teclado para repaso ágil tipo Anki
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar si el usuario está escribiendo en un input o textarea
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (onExit) onExit();
        return;
      }

      if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey) {
        if (reviewHistory.length > 0) {
          e.preventDefault();
          handleUndo();
        }
        return;
      }

      if (srsReviewIndex < queue.length) {
        if (!srsRevealed) {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            setSrsRevealed(true);
          }
        } else {
          if (e.key === '1') {
            e.preventDefault();
            handleRate(SRSRating.AGAIN);
          } else if (e.key === '2') {
            e.preventDefault();
            handleRate(SRSRating.HARD);
          } else if (e.key === '3') {
            e.preventDefault();
            handleRate(SRSRating.GOOD);
          } else if (e.key === '4') {
            e.preventDefault();
            handleRate(SRSRating.EASY);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [srsRevealed, srsReviewIndex, queue.length, reviewHistory.length, handleRate, handleUndo, onExit]);

  // Pantalla cuando el repaso está terminado o no hay tarjetas
  if (queue.length === 0 || srsReviewIndex >= queue.length) {
    const completedCount = reviewHistory.length;
    return (
      <div className="quiz-container" style={{ maxWidth: 720 }}>
        {/* Barra superior con botón de salida */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
          <button 
            type="button" 
            className="btn btn-outline btn-sm" 
            onClick={onExit}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={16} /> {backLabel}
          </button>
          {reviewHistory.length > 0 && (
            <button 
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleUndo}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}
              title="Deshacer y volver a la última tarjeta calificada [Z]"
            >
              <Undo2 size={15} /> Deshacer última tarjeta
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div style={{ fontSize: '3.6rem', marginBottom: 16 }}>🎉</div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
            {completedCount > 0 ? '¡Sesión de Repaso Completada!' : '¡Estás al día!'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto 24px auto', lineHeight: 1.6 }}>
            {completedCount > 0 
              ? `Has repasado ${completedCount} ${completedCount === 1 ? 'tarjeta' : 'tarjetas'} exitosamente con el algoritmo FSRS.`
              : 'No tienes más tarjetas pendientes para repasar hoy en este mazo.'}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className="btn btn-primary btn-lg" 
              onClick={onExit}
              style={{ minWidth: 180, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <CheckCircle2 size={18} /> {backLabel}
            </button>
            {reviewHistory.length > 0 && (
              <button 
                type="button"
                className="btn btn-outline btn-lg"
                onClick={handleUndo}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Undo2 size={18} /> Deshacer última
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Previsualización de intervalos calculados con FSRS
  const currentCardData = getCurrentCard ? getCurrentCard(currentItem) : null;
  const intervalPreviews = getIntervalPreviews(currentCardData);
  const progressPercent = Math.round((srsReviewIndex / queue.length) * 100);

  return (
    <div className="quiz-container" style={{ maxWidth: 720, padding: '24px 28px' }}>
      
      {/* HEADER DE CONTROL Y NAVEGACIÓN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button 
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onExit}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
            title="Salir del repaso y volver [Esc]"
          >
            <ArrowLeft size={16} /> {backLabel}
          </button>

          <button 
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleUndo}
            disabled={reviewHistory.length === 0}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6,
              opacity: reviewHistory.length === 0 ? 0.45 : 1,
              cursor: reviewHistory.length === 0 ? 'not-allowed' : 'pointer'
            }}
            title={reviewHistory.length > 0 ? "Volver y deshacer tarjeta anterior [Tecla Z]" : "No hay tarjetas anteriores para deshacer"}
          >
            <Undo2 size={15} /> Deshacer
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="vocab-tag" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
            🧠 Repaso Espaciado (SRS)
          </span>
          <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            {srsReviewIndex + 1} <span style={{ opacity: 0.6 }}>/</span> {queue.length}
          </span>
        </div>
      </div>

      {/* BARRA DE PROGRESO */}
      <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden', marginBottom: 24 }}>
        <div 
          style={{ 
            width: `${progressPercent}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, var(--primary), var(--accent))', 
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
          }} 
        />
      </div>

      {/* TARJETA PRINCIPAL (PREGUNTA / RESPUESTA) */}
      <div 
        style={{ 
          background: 'var(--bg-main)', 
          borderRadius: 16, 
          border: '1px solid var(--border)', 
          padding: '36px 24px', 
          textAlign: 'center', 
          boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* CARA FRONTAL */}
        <div className="srs-card-front">
          {renderFront ? renderFront(currentItem) : (
            <div style={{ fontSize: '4.5rem', fontWeight: 800 }}>
              {currentItem.kanji || currentItem.word}
            </div>
          )}
        </div>

        {/* ACCIÓN: MOSTRAR RESPUESTA (SI NO ESTÁ REVELADA) */}
        {!srsRevealed ? (
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <button 
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => setSrsRevealed(true)}
              style={{ minWidth: 240, padding: '14px 28px', fontSize: '1.05rem', fontWeight: 700, boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' }}
            >
              Mostrar Respuesta
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Presiona <kbd style={{ padding: '2px 6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'monospace' }}>Espacio</kbd> o clic para voltear
            </span>
          </div>
        ) : (
          /* CARA POSTERIOR REVELADA */
          <div 
            className="srs-revealed-content" 
            style={{ 
              marginTop: 28, 
              paddingTop: 28, 
              borderTop: '2px dashed var(--border)',
              animation: 'fadeIn 0.25s ease'
            }}
          >
            {renderBack && renderBack(currentItem)}
          </div>
        )}
      </div>

      {/* BOTONES DE CALIFICACIÓN FSRS (CUANDO ESTÁ REVELADA) */}
      {srsRevealed && (
        <div style={{ marginTop: 24, animation: 'fadeIn 0.25s ease' }}>
          <p style={{ textAlign: 'center', marginBottom: 12, fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            ¿Qué tan bien lo recordaste?
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {/* 1. AGAIN / OLVIDÉ */}
            <button 
              type="button"
              className="btn btn-danger" 
              onClick={() => handleRate(SRSRating.AGAIN)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 6px',
                gap: 4,
                borderRadius: 12,
                transition: 'all 0.15s ease'
              }}
              title="Atajo: Tecla [1]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: '0.95rem' }}>
                <RotateCcw size={15} /> Olvidé
              </div>
              <span style={{ fontSize: '0.74rem', opacity: 0.9, fontWeight: 600 }}>
                {intervalPreviews[SRSRating.AGAIN]} <span style={{ opacity: 0.65, fontSize: '0.68rem' }}>[1]</span>
              </span>
            </button>

            {/* 2. HARD / DIFÍCIL */}
            <button 
              type="button"
              className="btn btn-warning" 
              onClick={() => handleRate(SRSRating.HARD)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 6px',
                gap: 4,
                borderRadius: 12,
                color: '#fff',
                transition: 'all 0.15s ease'
              }}
              title="Atajo: Tecla [2]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: '0.95rem' }}>
                <AlertCircle size={15} /> Difícil
              </div>
              <span style={{ fontSize: '0.74rem', opacity: 0.9, fontWeight: 600 }}>
                {intervalPreviews[SRSRating.HARD]} <span style={{ opacity: 0.65, fontSize: '0.68rem' }}>[2]</span>
              </span>
            </button>

            {/* 3. GOOD / BIEN */}
            <button 
              type="button"
              className="btn btn-success" 
              onClick={() => handleRate(SRSRating.GOOD)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 6px',
                gap: 4,
                borderRadius: 12,
                transition: 'all 0.15s ease'
              }}
              title="Atajo: Tecla [3]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: '0.95rem' }}>
                <Check size={15} /> Bien
              </div>
              <span style={{ fontSize: '0.74rem', opacity: 0.9, fontWeight: 600 }}>
                {intervalPreviews[SRSRating.GOOD]} <span style={{ opacity: 0.65, fontSize: '0.68rem' }}>[3]</span>
              </span>
            </button>

            {/* 4. EASY / FÁCIL */}
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={() => handleRate(SRSRating.EASY)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 6px',
                gap: 4,
                borderRadius: 12,
                transition: 'all 0.15s ease'
              }}
              title="Atajo: Tecla [4]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: '0.95rem' }}>
                <Zap size={15} /> Fácil
              </div>
              <span style={{ fontSize: '0.74rem', opacity: 0.9, fontWeight: 600 }}>
                {intervalPreviews[SRSRating.EASY]} <span style={{ opacity: 0.65, fontSize: '0.68rem' }}>[4]</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* FOOTER CON ATAJOS DE TECLADO */}
      <div style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>⌨️ <strong>Atajos:</strong></span>
        <span><kbd style={{ padding: '2px 5px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 3 }}>Espacio</kbd> Voltear</span>
        <span><kbd style={{ padding: '2px 5px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 3 }}>1 - 4</kbd> Calificar</span>
        <span><kbd style={{ padding: '2px 5px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 3 }}>Z</kbd> Deshacer</span>
        <span><kbd style={{ padding: '2px 5px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 3 }}>Esc</kbd> Salir</span>
      </div>

    </div>
  );
}
