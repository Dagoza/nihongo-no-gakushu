'use client';

import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';

/**
 * Componente unificado para cuadrícula o lista de opciones de selección múltiple (Quiz Grid)
 * Soporta navegación por teclado (1-4 y A-D), estados de respuesta (correcto/incorrecto),
 * diseño responsive y modos especializados (texto/significado y kanji/ideogramas).
 * 
 * @param {Object} props
 * @param {Array<Object>} props.options - Lista de opciones a presentar
 * @param {number|string|null} props.selectedOption - Índice o ID de la opción seleccionada
 * @param {boolean} props.isAnswered - Indica si ya se respondió la pregunta
 * @param {Function} props.onSelect - Callback al seleccionar: (index, option) => void
 * @param {'grid'|'list'|'kanji-cards'} [props.layout='grid'] - Disposición visual
 * @param {number} [props.columns=2] - Número de columnas en layout grid
 * @param {boolean} [props.enableKeyboardShortcuts=true] - Activa atajos de teclado A-D y 1-4
 * @param {string[]} [props.letters=['A', 'B', 'C', 'D']] - Etiquetas de letra para las opciones
 * @param {Function} [props.renderOption] - Renderizador personalizado opcional
 * @param {string} [props.className] - Clases CSS adicionales
 * @param {Object} [props.style] - Estilos CSS inline adicionales
 */
export default function QuizOptionsGrid({
  options = [],
  selectedOption = null,
  isAnswered = false,
  onSelect,
  layout = 'grid',
  columns = 2,
  enableKeyboardShortcuts = true,
  letters = ['A', 'B', 'C', 'D'],
  renderOption = null,
  className = '',
  style = {}
}) {
  // Manejo de atajos de teclado (1-4, a-d, A-D)
  useEffect(() => {
    if (!enableKeyboardShortcuts || isAnswered || !options.length) return;

    const handleKeyDown = (e) => {
      // Ignorar si el usuario está escribiendo en un input
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }

      const key = e.key.toUpperCase();
      let selectedIdx = -1;

      if (key >= '1' && key <= String(options.length)) {
        selectedIdx = parseInt(key, 10) - 1;
      } else {
        const letterIdx = letters.indexOf(key);
        if (letterIdx >= 0 && letterIdx < options.length) {
          selectedIdx = letterIdx;
        }
      }

      if (selectedIdx >= 0 && selectedIdx < options.length) {
        e.preventDefault();
        onSelect?.(selectedIdx, options[selectedIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, isAnswered, options, letters, onSelect]);

  if (!options || options.length === 0) return null;

  // Determinar estilos de contenedor según layout
  const getContainerStyle = () => {
    if (layout === 'list') {
      return {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: '100%',
        margin: '0 auto 16px auto'
      };
    }

    if (layout === 'kanji-cards') {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 12,
        maxWidth: 440,
        width: '100%',
        margin: '0 auto 16px auto'
      };
    }

    // 'grid' por defecto
    return {
      display: 'grid',
      gridTemplateColumns: columns === 1 ? '1fr' : 'repeat(auto-fit, minmax(230px, 1fr))',
      gap: 10,
      width: '100%',
      marginTop: 8,
      marginBottom: 16
    };
  };

  return (
    <div 
      className={`quiz-options-container quiz-${layout} ${className}`}
      style={{
        ...getContainerStyle(),
        ...style
      }}
      role="group"
      aria-label="Opciones de respuesta"
    >
      {options.map((opt, idx) => {
        const isSelected = selectedOption === idx || selectedOption === opt.id;
        const isCorrect = Boolean(opt.isCorrect);

        // Si se provee un renderizador personalizado, delegarlo
        if (typeof renderOption === 'function') {
          return renderOption(opt, idx, { isSelected, isCorrect, isAnswered, letter: letters[idx] || String(idx + 1) });
        }

        // Variaciones visuales de respuesta
        let btnBg = 'var(--bg-surface)';
        let btnBorder = '1.5px solid var(--border)';
        let btnColor = 'var(--text-main)';
        let btnOpacity = 1;

        if (isAnswered) {
          if (isCorrect) {
            btnBg = 'rgba(16, 185, 129, 0.14)';
            btnBorder = '2px solid #10b981';
            btnColor = '#10b981';
          } else if (isSelected && !isCorrect) {
            btnBg = 'rgba(239, 68, 68, 0.14)';
            btnBorder = '2px solid #ef4444';
            btnColor = '#ef4444';
          } else {
            btnOpacity = 0.5;
          }
        }

        const isKanjiLayout = layout === 'kanji-cards' || opt.kanji;

        return (
          <button
            key={opt.id || idx}
            type="button"
            onClick={() => onSelect?.(idx, opt)}
            disabled={isAnswered}
            aria-pressed={isSelected}
            aria-disabled={isAnswered}
            style={{
              display: 'flex',
              flexDirection: isKanjiLayout ? 'column' : 'row',
              alignItems: isKanjiLayout ? 'center' : 'center',
              justifyContent: isKanjiLayout ? 'center' : 'flex-start',
              padding: isKanjiLayout ? '16px 12px' : '12px 14px',
              borderRadius: 12,
              border: btnBorder,
              background: btnBg,
              color: btnColor,
              opacity: btnOpacity,
              cursor: isAnswered ? 'default' : 'pointer',
              textAlign: isKanjiLayout ? 'center' : 'left',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              gap: isKanjiLayout ? 4 : 10,
              boxShadow: isSelected && !isAnswered ? '0 0 0 2px var(--primary)' : 'none'
            }}
          >
            {/* Badge de letra o icono de verificación */}
            <span 
              style={{
                ...(isKanjiLayout ? {
                  position: 'absolute',
                  top: 8,
                  left: 8
                } : {}),
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: isAnswered 
                  ? (isCorrect ? '#10b981' : (isSelected && !isCorrect ? '#ef4444' : 'var(--bg-main)'))
                  : 'var(--bg-main)',
                color: isAnswered && (isCorrect || (isSelected && !isCorrect)) 
                  ? '#ffffff' 
                  : 'var(--text-muted)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 700,
                flexShrink: 0
              }}
              aria-hidden="true"
            >
              {isAnswered && isCorrect ? (
                <Check size={14} />
              ) : isAnswered && isSelected && !isCorrect ? (
                <X size={14} />
              ) : (
                letters[idx] || String(idx + 1)
              )}
            </span>

            {/* Contenido en tarjeta Kanji */}
            {isKanjiLayout && (
              <>
                <span className="jp-text" style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1 }}>
                  {opt.kanji || opt.char}
                </span>
                {opt.strokes && (
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {opt.strokes} trazos
                  </span>
                )}
                {opt.sublabel && !opt.strokes && (
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {opt.sublabel}
                  </span>
                )}
              </>
            )}

            {/* Contenido en lista/grid estándar (texto y lecturas) */}
            {!isKanjiLayout && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ 
                  fontWeight: 700, 
                  fontSize: '0.92rem', 
                  lineHeight: 1.3,
                  textDecoration: isAnswered && isSelected && !isCorrect ? 'line-through' : 'none'
                }}>
                  {opt.label || opt.meaning || opt.text || opt.es}
                </div>
                {(opt.sublabel || opt.reading || opt.kana) && (
                  <div className="jp-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {opt.sublabel || opt.reading || opt.kana}
                  </div>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
