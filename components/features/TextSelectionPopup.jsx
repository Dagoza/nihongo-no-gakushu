'use client';

import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Volume2, BookOpen, BookmarkPlus, PenTool, Copy, Check, Sparkles, X } from 'lucide-react';
import audioManager from '../../lib/audioManager';
import { AppContext } from '../../lib/AppContext';

export default function TextSelectionPopup() {
  const contextApp = useContext(AppContext);
  const [selectedText, setSelectedText] = useState('');
  const [coords, setCoords] = useState({ x: 0, y: 0, placement: 'top' });
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const popupRef = useRef(null);
  const selectionTimeoutRef = useRef(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const clearDomSelection = useCallback(() => {
    if (typeof window !== 'undefined' && window.getSelection) {
      try {
        window.getSelection().removeAllRanges();
      } catch (e) {}
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setSelectedText('');
    setIsCopied(false);
  }, []);

  // Listen to selection changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleSelectionUpdate = () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }

      selectionTimeoutRef.current = setTimeout(() => {
        try {
          const activeEl = document.activeElement;
          // Ignore inputs, textareas or contenteditable elements
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
            return;
          }

          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            // No selection
            return;
          }

          const rawText = selection.toString();
          const cleanText = rawText ? rawText.trim() : '';

          // Only trigger for meaningful text under 500 characters
          if (!cleanText || cleanText.length < 1 || cleanText.length > 500) {
            return;
          }

          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          // If the selection has no width or height, don't show
          if (rect.width === 0 && rect.height === 0) {
            return;
          }

          setSelectedText(cleanText);
          setIsCopied(false);

          if (window.innerWidth < 640) {
            // Mobile: dock at bottom
            setCoords({ x: 0, y: 0, placement: 'mobile-dock' });
          } else {
            // Desktop: compute floating coordinates above or below selection
            const popupHeight = 44;
            const popupWidth = 360;
            const scrollY = window.scrollY || window.pageYOffset || 0;
            const scrollX = window.scrollX || window.pageXOffset || 0;

            const centerX = rect.left + scrollX + rect.width / 2;
            let topY = rect.top + scrollY - popupHeight - 10;
            let placement = 'top';

            // If too close to viewport top, flip below selection
            if (rect.top < popupHeight + 16) {
              topY = rect.bottom + scrollY + 10;
              placement = 'bottom';
            }

            // Clamp horizontal position so popup stays fully visible
            const minX = popupWidth / 2 + 12;
            const maxX = window.innerWidth - popupWidth / 2 - 12;
            const clampedX = Math.max(minX, Math.min(centerX, maxX));

            setCoords({ x: clampedX, y: topY, placement });
          }

          setIsVisible(true);
        } catch (err) {
          console.warn('Error computing selection coords:', err);
        }
      }, 50);
    };

    const handlePointerUp = (e) => {
      // If clicking inside the popup, do not recalculate selection
      if (popupRef.current && popupRef.current.contains(e.target)) {
        return;
      }
      handleSelectionUpdate();
    };

    const handleDocumentMouseDown = (e) => {
      // Close popup if clicking anywhere outside of it
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        handleDismiss();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleDismiss();
        clearDomSelection();
      }
    };

    document.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('touchend', handlePointerUp);
    document.addEventListener('mousedown', handleDocumentMouseDown);
    document.addEventListener('touchstart', handleDocumentMouseDown, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (selectionTimeoutRef.current) clearTimeout(selectionTimeoutRef.current);
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchend', handlePointerUp);
      document.removeEventListener('mousedown', handleDocumentMouseDown);
      document.removeEventListener('touchstart', handleDocumentMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [clearDomSelection, handleDismiss]);

  // Actions
  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = selectedText;
    clearDomSelection();
    handleDismiss();
    if (text) {
      audioManager.speak(text);
    }
  };

  const handleDictionary = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = selectedText;
    clearDomSelection();
    handleDismiss();
    if (text && contextApp?.openDictionary) {
      contextApp.openDictionary(text);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = selectedText;
    clearDomSelection();
    handleDismiss();
    if (!text) return;

    const isPhrase = text.length > 15 || /[。！？\n]/.test(text);
    const modalData = {
      type: isPhrase ? 'phrase' : 'word',
      text: text,
      sentenceText: text,
      source: 'Selección de Texto'
    };

    if (contextApp?.openSaveModal) {
      contextApp.openSaveModal(modalData);
    }
  };

  const handlePracticePad = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = selectedText;
    clearDomSelection();
    handleDismiss();
    if (!text) return;

    const opts = {
      text: text,
      kana: '',
      title: `Práctica: ${text.length > 20 ? text.slice(0, 20) + '...' : text}`,
      source: 'selection'
    };

    if (contextApp?.openPracticePad) {
      contextApp.openPracticePad(opts);
    } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
      window.__nihongoOpenPracticePad(opts);
    }
  };

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = selectedText;
    if (text && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
      setIsCopied(true);
      setTimeout(() => {
        clearDomSelection();
        handleDismiss();
      }, 700);
    } else {
      clearDomSelection();
      handleDismiss();
    }
  };

  const handleAnalyzeAI = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = selectedText;
    clearDomSelection();
    handleDismiss();
    if (text && contextApp?.openDictionary) {
      // El diccionario realiza el análisis morfológico completo y desglose gramatical
      contextApp.openDictionary(text);
    }
  };

  if (!isVisible || !selectedText) {
    return null;
  }

  const isDock = coords.placement === 'mobile-dock';

  const style = isDock
    ? {}
    : {
        top: `${coords.y}px`,
        left: `${coords.x}px`,
        transform: 'translateX(-50%)'
      };

  return (
    <div
      ref={popupRef}
      className={`text-selection-popup ${isDock ? 'mobile-dock' : `floating-${coords.placement}`}`}
      style={style}
      role="toolbar"
      aria-label="Acciones de texto seleccionado"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="tsp-preview" title={selectedText}>
        <span className="tsp-preview-text jp-text">
          {selectedText.length > 18 ? `${selectedText.slice(0, 18)}…` : selectedText}
        </span>
      </div>

      <div className="tsp-divider" />

      <div className="tsp-actions">
        {/* Reproducir Audio */}
        <button
          type="button"
          className="tsp-btn tsp-btn-primary"
          onClick={handlePlay}
          title="Escuchar pronunciación (activa el reproductor)"
          aria-label="Reproducir audio"
        >
          <Volume2 size={14} className="tsp-icon" />
          <span className="tsp-label">Audio</span>
        </button>

        {/* Diccionario */}
        <button
          type="button"
          className="tsp-btn"
          onClick={handleDictionary}
          title="Consultar en el Diccionario"
          aria-label="Diccionario"
        >
          <BookOpen size={14} className="tsp-icon" />
          <span className="tsp-label">Diccionario</span>
        </button>

        {/* Guardar en Vocabulario */}
        <button
          type="button"
          className="tsp-btn"
          onClick={handleSave}
          title="Guardar palabra o frase en mi vocabulario"
          aria-label="Guardar"
        >
          <BookmarkPlus size={14} className="tsp-icon" />
          <span className="tsp-label">Guardar</span>
        </button>

        {/* Cuaderno de Práctica */}
        <button
          type="button"
          className="tsp-btn"
          onClick={handlePracticePad}
          title="Practicar trazos y caligrafía en el Cuaderno"
          aria-label="Cuaderno"
        >
          <PenTool size={14} className="tsp-icon" />
          <span className="tsp-label">Cuaderno</span>
        </button>

        {/* Copiar */}
        <button
          type="button"
          className={`tsp-btn ${isCopied ? 'tsp-btn-success' : ''}`}
          onClick={handleCopy}
          title={isCopied ? '¡Copiado!' : 'Copiar texto al portapapeles'}
          aria-label="Copiar"
        >
          {isCopied ? <Check size={14} className="tsp-icon text-success" /> : <Copy size={14} className="tsp-icon" />}
          <span className="tsp-label">{isCopied ? 'Listo' : 'Copiar'}</span>
        </button>

        {/* Desglose / Analizar con IA */}
        <button
          type="button"
          className="tsp-btn tsp-btn-accent"
          onClick={handleAnalyzeAI}
          title="Analizar desglose gramatical y morfológico"
          aria-label="Analizar gramática"
        >
          <Sparkles size={14} className="tsp-icon" />
          <span className="tsp-label">Analizar</span>
        </button>
      </div>

      <button
        type="button"
        className="tsp-close-btn"
        onClick={() => {
          handleDismiss();
          clearDomSelection();
        }}
        title="Cerrar menú"
        aria-label="Cerrar"
      >
        <X size={13} />
      </button>

      {/* Triángulo indicador en desktop */}
      {!isDock && <div className={`tsp-arrow tsp-arrow-${coords.placement}`} />}
    </div>
  );
}
