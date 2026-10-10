'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, BookOpen, ArrowRight } from 'lucide-react';
import terminologyList from '../../data/terminology.json';
import audioManager from '../../lib/audioManager';

// Build indexed map for O(1) lookup
const terminologyMap = new Map();
if (Array.isArray(terminologyList)) {
  terminologyList.forEach((item) => {
    if (item && item.id) {
      terminologyMap.set(item.id.toLowerCase().trim(), item);
    }
  });
}

/**
 * Normalizes Japanese text for speech synthesis by removing parenthetical readings
 * (e.g. "お茶 (おちゃ)" -> "お茶") so the TTS does not speak redundantly.
 */
function cleanTextForAudio(text) {
  if (!text || typeof text !== 'string') return '';
  const cleaned = text
    .replace(/\s*[\(\（][^\)\）]*[\)\）]/g, '')
    .trim();
  return cleaned || text.trim();
}

/**
 * TerminologyTooltip Component
 *
 * Provides contextual linguistic definitions across Nihongo Master.
 * Supports hover with debounce for desktop, tap toggle for mobile, audio playback,
 * and deep-linking to the full linguistic glossary modal.
 *
 * @param {Object} props
 * @param {string} props.termId - Unique slug ID in data/terminology.json (e.g. 'bikougo', 'wago')
 * @param {React.ReactNode} [props.children] - Trigger element or text. Defaults to term title if omitted.
 * @param {'top'|'bottom'} [props.position='top'] - Preferred placement for popover
 * @param {function} [props.onOpenFullGlossary] - Callback invoked when clicking "Ver en Glosario Completo"
 * @param {string} [props.className] - Additional class names for trigger
 */
export function TerminologyTooltip({
  termId,
  children,
  position = 'top',
  onOpenFullGlossary,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [horizontalShift, setHorizontalShift] = useState(0);

  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  const term = termId ? terminologyMap.get(termId.toLowerCase().trim()) : null;

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Clamping to prevent horizontal overflow outside viewport (especially on mobile)
  const adjustPosition = useCallback(() => {
    if (!popoverRef.current) return;
    const rect = popoverRef.current.getBoundingClientRect();
    const margin = 16;
    let shift = 0;

    if (rect.right > window.innerWidth - margin) {
      shift = window.innerWidth - margin - rect.right;
    } else if (rect.left < margin) {
      shift = margin - rect.left;
    }

    setHorizontalShift(shift);
  }, []);

  useEffect(() => {
    if (isOpen) {
      adjustPosition();
      const handleResize = () => adjustPosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    } else {
      setHorizontalShift(0);
    }
  }, [isOpen, adjustPosition]);

  // Handle outside click & Escape key dismiss
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Hover handlers with debounce (150ms open, 200ms close)
  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    openTimerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Toggle on click/tap
  const handleClick = (e) => {
    e.stopPropagation();
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsOpen((prev) => !prev);
  };

  const handleTriggerKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  // Safe audio playback
  const handlePlayAudio = (e, rawText) => {
    e.stopPropagation();
    const cleanText = cleanTextForAudio(rawText);
    if (!cleanText) return;

    setIsPlayingAudio(true);
    audioManager.speak(cleanText);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 1500);
  };

  // Navigate to full glossary
  const handleGlossaryLink = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (typeof onOpenFullGlossary === 'function') {
      onOpenFullGlossary(term?.id || termId);
    }
  };

  // Graceful fallback if termId does not exist in terminology.json
  if (!term) {
    return (
      <span className={className} style={{ display: 'inline' }}>
        {children || termId}
      </span>
    );
  }

  const triggerContent = children || term.term;
  const primaryExample = term.examples && term.examples.length > 0 ? term.examples[0] : null;

  return (
    <span
      ref={containerRef}
      className={`terminology-tooltip-container ${className}`.trim()}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'baseline',
        verticalAlign: 'baseline'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger element with dashed border & cursor */}
      <span
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Definición lingüística de ${term.term}`}
        onClick={handleClick}
        onKeyDown={handleTriggerKeyDown}
        className="terminology-tooltip-trigger"
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          borderBottom: '1.5px dashed var(--primary)',
          cursor: 'help',
          color: 'inherit',
          transition: 'border-color 0.2s ease, opacity 0.2s ease',
          lineHeight: 'inherit'
        }}
      >
        {triggerContent}
      </span>

      {/* Floating Popover Card */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Explicación de ${term.term}`}
          className="terminology-tooltip-popover"
          style={{
            position: 'absolute',
            zIndex: 1000,
            ...(position === 'bottom'
              ? { top: 'calc(100% + 10px)' }
              : { bottom: 'calc(100% + 10px)' }),
            left: '50%',
            transform: `translateX(calc(-50% + ${horizontalShift}px))`,
            width: 'max-content',
            minWidth: 260,
            maxWidth: 'min(320px, calc(100vw - 32px))',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.28), 0 4px 12px rgba(0, 0, 0, 0.08)',
            padding: '14px 16px',
            color: 'var(--text-main)',
            textAlign: 'left',
            cursor: 'default',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.18s ease-out',
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Category Badge & Kanji Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              marginBottom: 8
            }}
          >
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--primary)',
                background: 'var(--primary-bg)',
                padding: '2px 8px',
                borderRadius: 6
              }}
            >
              {term.category}
            </span>

            {term.kanji && (
              <span
                className="jp-text"
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 900,
                  color: 'var(--text-main)',
                  letterSpacing: '0.02em'
                }}
              >
                {term.kanji}
              </span>
            )}
          </div>

          {/* Term Title + Readings */}
          <div style={{ marginBottom: 6 }}>
            <h4
              style={{
                fontSize: '0.96rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0,
                lineHeight: 1.25
              }}
            >
              {term.term}
            </h4>
            {(term.kana || term.romaji) && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginTop: 2
                }}
              >
                {term.kana ? `「${term.kana}」` : ''} {term.romaji ? `(${term.romaji})` : ''}
              </span>
            )}
          </div>

          {/* Short Definition */}
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              lineHeight: 1.45,
              margin: '0 0 10px',
              fontWeight: 500
            }}
          >
            {term.short_definition}
          </p>

          {/* Contextual Audio Example (if available) */}
          {primaryExample && (
            <div
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                marginBottom: 10
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <span
                  className="jp-text"
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={primaryExample.jp}
                >
                  {primaryExample.jp}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={primaryExample.es}
                >
                  {primaryExample.es}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => handlePlayAudio(e, primaryExample.jp)}
                aria-label={`Reproducir pronunciación de ${primaryExample.jp}`}
                style={{
                  flexShrink: 0,
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: isPlayingAudio ? 'var(--primary)' : 'var(--bg-card)',
                  color: isPlayingAudio ? '#ffffff' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <Volume2 size={15} />
              </button>
            </div>
          )}

          {/* Link to Full Glossary */}
          {onOpenFullGlossary && (
            <div
              style={{
                paddingTop: 8,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button
                type="button"
                onClick={handleGlossaryLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <span>Ver en Glosario Completo</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </span>
  );
}

export default TerminologyTooltip;
