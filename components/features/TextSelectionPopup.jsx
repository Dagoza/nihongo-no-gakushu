'use client';

import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Volume2, BookOpen, BookmarkPlus, PenTool, Copy, Check, Sparkles, X } from 'lucide-react';
import audioManager from '../../lib/audioManager';
import { AppContext } from '../../lib/AppContext';

export default function TextSelectionPopup() {
  const contextApp = useContext(AppContext);
  const [selectedText, setSelectedText] = useState('');
  const [coords, setCoords] = useState({ x: 0, y: 0, placement: 'bottom' });
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const popupRef = useRef(null);
  const persistedTextRef = useRef('');
  const isInteractingRef = useRef(false);
  const selectionTimeoutRef = useRef(null);

  const clearDomSelection = useCallback(() => {
    persistedTextRef.current = '';
    if (typeof window !== 'undefined' && window.getSelection) {
      try {
        window.getSelection().removeAllRanges();
      } catch (e) {}
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setSelectedText('');
    persistedTextRef.current = '';
    setIsCopied(false);
  }, []);

  // Inspect selection on document
  const inspectSelection = useCallback(() => {
    // If the user is currently tapping/clicking an action in the popup, do not dismiss
    if (isInteractingRef.current) return;

    try {
      const activeEl = document.activeElement;
      // Do not popup inside inputs, textareas or editable fields
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }

      const selection = window.getSelection();
      const rawText = selection ? selection.toString() : '';
      const cleanText = rawText ? rawText.trim() : '';

      // If user cleared the selection (e.g. tapped elsewhere on blank space)
      if (!cleanText || cleanText.length < 1) {
        if (isVisible && !isInteractingRef.current) {
          setIsVisible(false);
          setSelectedText('');
          persistedTextRef.current = '';
        }
        return;
      }

      // Ignore huge selections
      if (cleanText.length > 500) {
        return;
      }

      // Persist text so that even if touch collapses the selection, the action executes reliably
      persistedTextRef.current = cleanText;
      setSelectedText(cleanText);
      setIsCopied(false);

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const popupHeight = 44;
        const estimatedWidth = Math.min(380, (typeof window !== 'undefined' ? window.innerWidth : 400) - 24);
        const scrollY = window.scrollY || window.pageYOffset || 0;
        const scrollX = window.scrollX || window.pageXOffset || 0;

        const centerX = rect.left + scrollX + rect.width / 2;
        
        // On mobile & desktop, default to placing comfortably BELOW the selected line
        // to avoid clashing with native top toolbars (Android & iOS)
        let targetY = rect.bottom + scrollY + 10;
        let placement = 'bottom';

        // If selection is too close to bottom of the viewport, place above
        if (rect.bottom + popupHeight + 20 > (window.innerHeight || 800)) {
          targetY = Math.max(scrollY + 10, rect.top + scrollY - popupHeight - 10);
          placement = 'top';
        }

        // Clamp horizontal position so the popup never clips off-screen
        const halfWidth = estimatedWidth / 2;
        const minX = halfWidth + 12;
        const maxX = (window.innerWidth || 400) - halfWidth - 12;
        const clampedX = Math.max(minX, Math.min(centerX, maxX));

        setCoords({ x: clampedX, y: targetY, placement });
        setIsVisible(true);
      }
    } catch (err) {
      console.warn('Error inspecting selection:', err);
    }
  }, [isVisible]);

  // Event listeners
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const debouncedInspect = (delay = 120) => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      selectionTimeoutRef.current = setTimeout(() => {
        inspectSelection();
      }, delay);
    };

    // Native selection change
    const handleSelectionChange = () => {
      debouncedInspect(140);
    };

    // End of drag or touch selection
    const handlePointerUp = (e) => {
      if (popupRef.current && popupRef.current.contains(e.target)) {
        return;
      }
      debouncedInspect(80);
    };

    // Outside click detection (desktop/non-touch)
    const handleOutsideClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        const sel = window.getSelection();
        if (!sel || !sel.toString().trim()) {
          handleDismiss();
        }
      }
    };

    // Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleDismiss();
        clearDomSelection();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('touchend', handlePointerUp, { passive: true });
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (selectionTimeoutRef.current) clearTimeout(selectionTimeoutRef.current);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchend', handlePointerUp);
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inspectSelection, handleDismiss, clearDomSelection]);

  // Robust Action Dispatcher: Reads persisted text and guarantees execution
  const executeAction = (actionCallback) => {
    isInteractingRef.current = true;
    const textToUse = (persistedTextRef.current || selectedText || '').trim();

    // Clear selection from DOM visually and close popup
    clearDomSelection();
    handleDismiss();

    setTimeout(() => {
      isInteractingRef.current = false;
    }, 300);

    if (textToUse && typeof actionCallback === 'function') {
      actionCallback(textToUse);
    }
  };

  // Action handlers
  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    executeAction((text) => {
      audioManager.speak(text);
    });
  };

  const handleDictionary = (e) => {
    e.preventDefault();
    e.stopPropagation();
    executeAction((text) => {
      if (contextApp?.openDictionary) {
        contextApp.openDictionary(text);
      }
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    executeAction((text) => {
      const isPhrase = text.length > 15 || /[。！？\n]/.test(text);
      if (contextApp?.openSaveModal) {
        contextApp.openSaveModal({
          type: isPhrase ? 'phrase' : 'word',
          text: text,
          sentenceText: text,
          source: 'Selección de Texto'
        });
      }
    });
  };

  const handlePracticePad = (e) => {
    e.preventDefault();
    e.stopPropagation();
    executeAction((text) => {
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
    });
  };

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const textToCopy = (persistedTextRef.current || selectedText || '').trim();
    if (textToCopy && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
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
    executeAction((text) => {
      if (contextApp?.openDictionary) {
        contextApp.openDictionary(text);
      }
    });
  };

  if (!isVisible || !selectedText) {
    return null;
  }

  const displayText = selectedText.length > 10 ? `${selectedText.slice(0, 10)}…` : selectedText;

  // Crucial: onPointerDown preventDefault on buttons prevents touch focus change from wiping DOM selection
  const buttonProps = {
    onPointerDown: (e) => {
      isInteractingRef.current = true;
      e.preventDefault();
      e.stopPropagation();
    },
    onTouchStart: (e) => {
      isInteractingRef.current = true;
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={popupRef}
      className={`text-selection-popup floating-${coords.placement}`}
      style={{
        top: `${coords.y}px`,
        left: `${coords.x}px`,
        transform: 'translateX(-50%)'
      }}
      role="toolbar"
      aria-label="Acciones de texto seleccionado"
    >
      <div className="tsp-preview" title={selectedText}>
        <span className="tsp-preview-text jp-text">{displayText}</span>
      </div>

      <div className="tsp-divider" />

      <div className="tsp-actions">
        {/* Reproducir Audio */}
        <button
          type="button"
          className="tsp-btn tsp-btn-primary"
          onClick={handlePlay}
          {...buttonProps}
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
          {...buttonProps}
          title="Consultar en el Diccionario"
          aria-label="Diccionario"
        >
          <BookOpen size={13} className="tsp-icon" />
          <span className="tsp-label">Dict</span>
        </button>

        {/* Guardar en Vocabulario */}
        <button
          type="button"
          className="tsp-btn"
          onClick={handleSave}
          {...buttonProps}
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
          {...buttonProps}
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
          {...buttonProps}
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
          {...buttonProps}
          title="Analizar desglose gramatical y morfológico"
          aria-label="Analizar gramática"
        >
          <Sparkles size={13} className="tsp-icon" />
          <span className="tsp-label">IA</span>
        </button>
      </div>

      <button
        type="button"
        className="tsp-close-btn"
        onClick={() => {
          handleDismiss();
          clearDomSelection();
        }}
        {...buttonProps}
        title="Cerrar menú"
        aria-label="Cerrar"
      >
        <X size={13} />
      </button>

      {/* Triángulo indicador */}
      <div className={`tsp-arrow tsp-arrow-${coords.placement}`} />
    </div>
  );
}
