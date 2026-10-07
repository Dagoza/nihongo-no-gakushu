'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(',');

/**
 * Hook para atrapar el foco dentro de modales y restaurarlo al cerrar (WCAG 2.1 AA).
 * @param {boolean} isOpen - Estado de visibilidad del modal
 * @returns {React.RefObject} containerRef para asignar al contenedor del modal
 */
export function useFocusTrap(isOpen = false) {
  const containerRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        try {
          previousActiveElementRef.current.focus();
        } catch {
          // Element might be unmounted or detached
        }
      }
      return;
    }

    if (typeof document !== 'undefined') {
      previousActiveElementRef.current = document.activeElement;
    }

    const container = containerRef.current;
    if (!container) return;

    // Foco inicial accesible
    const focusTimer = setTimeout(() => {
      if (!container) return;
      const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length > 0) {
        const auto = container.querySelector('[data-autofocus]') || focusable[0];
        try {
          auto.focus();
        } catch {}
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter(el => el.offsetParent !== null || el.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return containerRef;
}

export default useFocusTrap;
