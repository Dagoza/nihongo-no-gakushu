'use client';

import { useEffect } from 'react';

// Conteo global de modales / capas activas para soportar modales anidados
let activeLocks = 0;
let previousBodyStyles = null;
let previousHtmlStyles = null;

/**
 * Previene el scroll del fondo de la página en dispositivos móviles (iOS Safari / Android Chrome)
 * permitiendo el scroll únicamente si el toque proviene de un contenedor interno con scroll propio.
 */
function preventBackgroundTouchMove(e) {
  if (!e.cancelable) return;

  let target = e.target;
  let isInsideScrollable = false;

  while (target && target !== document.body && target !== document.documentElement) {
    // Si el elemento o algún contenedor padre tiene touchAction = 'none' (como lienzos de dibujo),
    // cancelar el evento touchmove de inmediato para impedir cualquier scroll o gesto del navegador.
    const computed = window.getComputedStyle(target);
    if (computed.touchAction === 'none') {
      e.preventDefault();
      return;
    }

    const overflowY = computed.overflowY;
    const canScrollY = (overflowY === 'auto' || overflowY === 'scroll') && target.scrollHeight > target.clientHeight;
    const overflowX = computed.overflowX;
    const canScrollX = (overflowX === 'auto' || overflowX === 'scroll') && target.scrollWidth > target.clientWidth;

    if (canScrollY || canScrollX) {
      isInsideScrollable = true;
      break;
    }
    target = target.parentElement;
  }

  // Si no está dentro de un contenedor con scroll propio, cancelar el gesto
  if (!isInsideScrollable) {
    e.preventDefault();
  }
}

/**
 * Bloquea el scroll de la página preservando estilos y evitando layout shift.
 */
export function lockBodyScroll() {
  if (typeof document === 'undefined') return;

  if (activeLocks === 0) {
    const body = document.body;
    const html = document.documentElement;

    // Guardar estilos previos
    previousBodyStyles = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight
    };
    previousHtmlStyles = {
      overflow: html.style.overflow
    };

    // Compensar el ancho del scrollbar en desktop para prevenir saltos visuales (layout shift)
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    body.classList.add('modal-open');
    html.classList.add('modal-open');

    // Prevenir el scroll elástico y arrastre de fondo en dispositivos táctiles
    document.addEventListener('touchmove', preventBackgroundTouchMove, { passive: false });
  }

  activeLocks++;
}

/**
 * Desbloquea el scroll del fondo cuando todos los modales abiertos se han cerrado.
 */
export function unlockBodyScroll() {
  if (typeof document === 'undefined') return;

  activeLocks = Math.max(0, activeLocks - 1);

  if (activeLocks === 0) {
    const body = document.body;
    const html = document.documentElement;

    if (previousBodyStyles) {
      body.style.overflow = previousBodyStyles.overflow || '';
      body.style.paddingRight = previousBodyStyles.paddingRight || '';
      previousBodyStyles = null;
    } else {
      body.style.overflow = '';
      body.style.paddingRight = '';
    }

    if (previousHtmlStyles) {
      html.style.overflow = previousHtmlStyles.overflow || '';
      previousHtmlStyles = null;
    } else {
      html.style.overflow = '';
    }

    body.classList.remove('modal-open');
    html.classList.remove('modal-open');

    document.removeEventListener('touchmove', preventBackgroundTouchMove);
  }
}

/**
 * Hook para bloquear de forma segura el scroll de fondo cuando un modal está abierto.
 * @param {boolean} isLocked - Indica si el scroll debe estar bloqueado
 */
export function useBodyScrollLock(isLocked = true) {
  useEffect(() => {
    if (!isLocked) return;

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [isLocked]);
}

export default useBodyScrollLock;
