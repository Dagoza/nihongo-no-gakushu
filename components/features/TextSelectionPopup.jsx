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

  // Check mobile viewport and touch capabilities
  useEffect(() => {
    const checkMobile = () => {
      const mobileWidth = typeof window !== 'undefined' && window.innerWidth < 640;
      const touchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      setIsMobile(mobileWidth || (touchDevice && window.innerWidth < 768));
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

  // Core selection inspector
  const inspectSelection = useCallback(() => {
    try {
      const activeEl = document.activeElement;
      // Ignore typing inside inputs, textareas or contenteditable fields
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }

      const selection = window.getSelection();
      const rawText = selection ? selection.toString() : '';
      const cleanText = rawText ? rawText.trim() : '';

      // If user cleared the selection (e.g. tapped elsewhere), dismiss popup
      if (!cleanText || cleanText.length < 1) {
        if (isVisible) {
          setIsVisible(false);
          setSelectedText('');
        }
        return;
      }

      // Ignore massive selections (> 500 chars)
      if (cleanText.length > 500) {
        return;
      }

      setSelectedText(cleanText);
      setIsCopied(false);

      const isMobileView = typeof window !== 'undefined' && (window.innerWidth < 640 || ('ontouchstart' in window && window.innerWidth < 768));

      if (isMobileView) {
        // Mobile: dock smoothly at bottom
        setCoords({ x: 0, y: 0, placement: 'mobile-dock' });
      } else {
        // Desktop: compute floating coordinates above or below selection
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          const popupHeight = 44;
          const popupWidth = 370;
          const scrollY = window.scrollY || window.pageYOffset || 0;
          const scrollX = window.scrollX || window.pageXOffset || 0;

          const centerX = rect.left + scrollX + rect.width / 2;
          let topY = rect.top + scrollY - popupHeight - 10;
          let placement = 'top';

          // Flip below selection if too close to viewport top
          if (rect.top < popupHeight + 16) {
            topY = rect.bottom + scrollY + 10;
            placement = 'bottom';
          }

          const minX = popupWidth / 2 + 12;
          const maxX = window.innerWidth - popupWidth / 2 - 12;
          const clampedX = Math.max(minX, Math.min(centerX, maxX));

          setCoords({ x: clampedX, y: topY, placement });
        }
      }

      setIsVisible(true);
    } catch (err) {
      console.warn('Error inspecting selection:', err);
    }
  }, [isVisible]);

  // Listen to selection events (selectionchange, touchend, mouseup)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const debouncedInspect = (delay = 80) => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      selectionTimeoutRef.current = setTimeout(() => {
        inspectSelection();
      }, delay);
    };

    // 1. Native selectionchange (Crucial for mobile iOS/Android & desktop)
    const handleSelectionChange = () => {
      debouncedInspect(100);
    };

    // 2. Touchend (When finger lifts after selecting on mobile)
    const handleTouchEnd = (e) => {
      if (popupRef.current && popupRef.current.contains(e.target)) {
        return;
      }
      debouncedInspect(140);
    };

    // 3. Mouseup (When mouse releases after drag-selection on desktop)
    const handleMouseUp = (e) => {
      if (popupRef.current && popupRef.current.contains(e.target)) {
        return;
      }
      debouncedInspect(40);
    };

    // 4. Desktop-only outside click detection
    const handleDesktopMouseDown = (e) => {
      // Only on desktop/non-touch to avoid interfering with mobile touch-selection
      if (window.innerWidth >= 640 && popupRef.current && !popupRef.current.contains(e.target)) {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          handleDismiss();
        }
      }
    };

    // 5. Escape key to close
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleDismiss();
        clearDomSelection();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleDesktopMouseDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (selectionTimeoutRef.current) clearTimeout(selectionTimeoutRef.current);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleDesktopMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inspectSelection, handleDismiss, clearDomSelection]);

  // Synchronize with audioManager's selectedText
  useEffect(() => {
    const unsubscribe = audioManager.subscribe((state) => {
      if (state.selectedText && state.selectedText.trim()) {
        const text = state.selectedText.trim();
        if (text !== selectedText && text.length > 0 && text.length <= 500) {
          setSelectedText(text);
          const isMobileView = typeof window !== 'undefined' && (window.innerWidth < 640 || ('ontouchstart' in window && window.innerWidth < 768));
          if (isMobileView) {
            setCoords({ x: 0, y: 0, placement: 'mobile-dock' });
            setIsVisible(true);
          }
        }
      }
    });
    return () => unsubscribe();
  }, [selectedText]);

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
      contextApp.openDictionary(text);
    }
  };

  if (!isVisible || !selectedText) {
    return null;
  }

  const isDock = coords.placement === 'mobile-dock' || isMobile;

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
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="tsp-preview" title={selectedText}>
        <span className="tsp-preview-text jp-text">
          {selectedText.length > (isDock ? 8 : 16) ? `${selectedText.slice(0, isDock ? 8 : 16)}…` : selectedText}
        </span>
      </div>

      <div className="tsp-divider" />

      <div className="tsp-actions">
        {/* Reproducir Audio */}
        <button
          type="button"
          className="tsp-btn tsp-btn-primary"
          onClick={handlePlay}
          onTouchEnd={handlePlay}
          title="Escuchar pronunciación (activa el reproductor)"
          aria-label="Reproducir audio"
        >
          <Volume2 size={13} className="tsp-icon" />
          <span className="tsp-label">Audio</span>
        </button>

        {/* Diccionario */}
        <button
          type="button"
          className="tsp-btn"
          onClick={handleDictionary}
          onTouchEnd={handleDictionary}
          title="Consultar en el Diccionario"
          aria-label="Diccionario"
        >
          <BookOpen size={13} className="tsp-icon" />
          <span className="tsp-label">{isDock ? 'Dict' : 'Diccionario'}</span>
        </button>

        {/* Guardar en Vocabulario */}
        <button
          type="button"
          className="tsp-btn"
          onClick={handleSave}
          onTouchEnd={handleSave}
          title="Guardar palabra o frase en mi vocabulario"
          aria-label="Guardar"
        >
          <BookmarkPlus size={13} className="tsp-icon" />
          <span className="tsp-label">Guardar</span>
        </button>

        {/* Cuaderno de Práctica */}
        <button
          type="button"
          className="tsp-btn"
          onClick={handlePracticePad}
          onTouchEnd={handlePracticePad}
          title="Practicar trazos y caligrafía en el Cuaderno"
          aria-label="Cuaderno"
        >
          <PenTool size={13} className="tsp-icon" />
          <span className="tsp-label">Cuaderno</span>
        </button>

        {/* Copiar */}
        <button
          type="button"
          className={`tsp-btn ${isCopied ? 'tsp-btn-success' : ''}`}
          onClick={handleCopy}
          onTouchEnd={handleCopy}
          title={isCopied ? '¡Copiado!' : 'Copiar texto al portapapeles'}
          aria-label="Copiar"
        >
          {isCopied ? <Check size={13} className="tsp-icon text-success" /> : <Copy size={13} className="tsp-icon" />}
          <span className="tsp-label">{isCopied ? 'Listo' : 'Copiar'}</span>
        </button>

        {/* Desglose / Analizar con IA */}
        <button
          type="button"
          className="tsp-btn tsp-btn-accent"
          onClick={handleAnalyzeAI}
          onTouchEnd={handleAnalyzeAI}
          title="Analizar desglose gramatical y morfológico"
          aria-label="Analizar gramática"
        >
          <Sparkles size={13} className="tsp-icon" />
          <span className="tsp-label">{isDock ? 'IA' : 'Analizar'}</span>
        </button>
      </div>

      <button
        type="button"
        className="tsp-close-btn"
        onClick={() => {
          handleDismiss();
          clearDomSelection();
        }}
        onTouchEnd={() => {
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
