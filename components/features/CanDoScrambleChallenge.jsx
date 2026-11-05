'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, Check, RotateCcw, Volume2, X, ChevronRight, Zap } from 'lucide-react';
import { smartSegmentJapanese, containsKanji } from '../../lib/japaneseUtils';
import audioManager from '../../lib/audioManager';
import { triggerCheerConfetti } from '../../lib/confetti';
import FuriganaText from './FuriganaText';

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function CanDoScrambleChallenge({
  canDo,
  onComplete,
  onClose,
  showFurigana = true
}) {
  // Extraer oración japonesa modelo del Can-Do
  const targetSentence = useMemo(() => {
    if (!canDo?.sample) return '';
    const parts = canDo.sample.split(/[/／]/).map(p => p.trim()).filter(Boolean);
    const jpPart = parts.find(p => /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(p));
    return jpPart || parts[0] || '';
  }, [canDo]);

  // Segmentación morfológica pedagógica con smartSegmentJapanese
  const originalTokens = useMemo(() => {
    if (!targetSentence) return [];
    // Limpiar puntuación final para segmentar las fichas activas
    const clean = targetSentence.replace(/[。、！？!?…「」『』\n\r]/g, '').trim();
    const segments = smartSegmentJapanese(clean);
    const rawTokens = segments.map(s => s.text).filter(Boolean);

    // Si la oración arrojó un solo bloque monolítico pero tiene longitud > 4, desglosar en partes lógicas
    if (rawTokens.length <= 1 && clean.length > 4) {
      // Intento con partículas comunes
      const splitted = clean.split(/(は|が|を|に|で|へ|と|も|から|まで|です|だ)/g).filter(Boolean);
      return splitted.length > 1 ? splitted : [clean];
    }
    return rawTokens.length > 0 ? rawTokens : [clean];
  }, [targetSentence]);

  // Fichas disponibles y fichas seleccionadas
  const [availableTiles, setAvailableTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', msg: string }
  const [isCompleted, setIsCompleted] = useState(false);

  // Inicializar y mezclar fichas al abrir o cambiar de Can-Do
  useEffect(() => {
    if (originalTokens.length === 0) return;
    const tiles = originalTokens.map((tok, idx) => ({
      id: `${tok}_${idx}_${Math.random()}`,
      text: tok
    }));
    setAvailableTiles(shuffleArray(tiles));
    setSelectedTiles([]);
    setFeedback(null);
    setIsCompleted(false);
  }, [originalTokens]);

  const handleSelectAvailable = (tile) => {
    if (isCompleted) return;
    setAvailableTiles(prev => prev.filter(t => t.id !== tile.id));
    setSelectedTiles(prev => [...prev, tile]);
    setFeedback(null);
  };

  const handleDeselect = (tile) => {
    if (isCompleted) return;
    setSelectedTiles(prev => prev.filter(t => t.id !== tile.id));
    setAvailableTiles(prev => [...prev, tile]);
    setFeedback(null);
  };

  const handleReset = () => {
    const all = [...availableTiles, ...selectedTiles];
    setAvailableTiles(shuffleArray(all));
    setSelectedTiles([]);
    setFeedback(null);
    setIsCompleted(false);
  };

  const handleVerify = () => {
    const constructed = selectedTiles.map(t => t.text).join('');
    const targetClean = targetSentence.replace(/[。、！？!?…「」『』\s]/g, '');

    if (constructed === targetClean) {
      setIsCompleted(true);
      setFeedback({
        type: 'success',
        msg: '🎉 ¡Excelente! Estructura sintáctica construida correctamente (+10 XP).'
      });
      triggerCheerConfetti();
      audioManager.speak(targetSentence);
      if (typeof onComplete === 'function') {
        onComplete(canDo.id);
      }
    } else {
      setFeedback({
        type: 'error',
        msg: '❌ El orden no es el correcto. En japonés el verbo o cópula (です / ます) va al final (Sintaxis SOV).'
      });
    }
  };

  if (!targetSentence) return null;

  return (
    <div 
      className="cando-scramble-box"
      style={{
        marginTop: 14,
        padding: '16px 18px',
        borderRadius: 16,
        background: 'var(--bg-main)',
        border: '1.5px solid var(--primary)',
        boxShadow: 'var(--shadow-md)',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, padding: '2px 8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', borderRadius: 6 }}>
            ⚡ Reto Can-Do: Construir Oración
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Ordena las fichas según la sintaxis japonesa
          </span>
        </div>
        {onClose && (
          <button 
            type="button" 
            className="btn btn-ghost btn-xs" 
            onClick={onClose}
            title="Cerrar reto"
            style={{ padding: 4 }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 10 }}>
        Objetivo comunicativo: <strong>{canDo.task}</strong>
      </div>

      {/* ÁREA DE ENSAMBLAJE (SLOT DE ORACIÓN EN CONSTRUCCIÓN) */}
      <div 
        style={{
          minHeight: 56,
          padding: '10px 14px',
          background: 'var(--bg-surface)',
          borderRadius: 12,
          border: isCompleted ? '2px solid #10b981' : '2px dashed var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 14,
          transition: 'all 0.2s ease'
        }}
      >
        {selectedTiles.length === 0 ? (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Toca las fichas inferiores para ensamblar la oración aquí...
          </span>
        ) : (
          selectedTiles.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              className="btn btn-primary btn-sm jp-text"
              onClick={() => handleDeselect(t)}
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 8,
                background: isCompleted ? '#10b981' : undefined,
                borderColor: isCompleted ? '#10b981' : undefined,
                cursor: isCompleted ? 'default' : 'pointer'
              }}
              title="Toca para devolver a la bandeja"
            >
              <FuriganaText text={t.text} showFurigana={showFurigana} />
            </button>
          ))
        )}
      </div>

      {/* BANDEJA DE FICHAS DISPONIBLES */}
      {!isCompleted && availableTiles.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {availableTiles.map((t) => (
            <button
              key={t.id}
              type="button"
              className="btn btn-outline btn-sm jp-text"
              onClick={() => handleSelectAvailable(t)}
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'var(--bg-main)'
              }}
            >
              <FuriganaText text={t.text} showFurigana={showFurigana} />
            </button>
          ))}
        </div>
      )}

      {/* ACCIONES Y VERIFICACIÓN */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isCompleted && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleVerify}
              disabled={selectedTiles.length === 0}
              style={{ fontWeight: 700, padding: '6px 14px' }}
            >
              <Check size={14} /> Comprobar Orden
            </button>
          )}

          {!isCompleted && selectedTiles.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleReset}
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
            >
              <RotateCcw size={13} /> Reiniciar
            </button>
          )}

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => audioManager.speak(targetSentence)}
            title="Escuchar frase modelo"
            style={{ padding: '6px 10px' }}
          >
            <Volume2 size={14} /> Pista Sonora
          </button>
        </div>

        {isCompleted && (
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            ✓ Can-Do Validado
          </span>
        )}
      </div>

      {/* FEEDBACK DE VALIDACIÓN */}
      {feedback && (
        <div 
          style={{
            marginTop: 12,
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.88rem',
            fontWeight: 600,
            background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: feedback.type === 'success' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}
        >
          {feedback.msg}
        </div>
      )}
    </div>
  );
}
