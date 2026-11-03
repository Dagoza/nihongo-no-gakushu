'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useScrollCraft
 * Hook de alto rendimiento para experiencias de scroll-craft.
 * Proporciona:
 * - progress: número normalizado de 0 a 1
 * - velocity: velocidad instantánea de desplazamiento (px/ms suavizado)
 * - direction: 'down' | 'up' | 'idle'
 * - isScrolled: booleano si ha comenzado a scrollear (offset > threshold)
 * - reducedMotion: booleano si el usuario tiene activado prefers-reduced-motion
 * - supportsScrollTimeline: booleano si el navegador soporta CSS Scroll-Driven Animations
 */
export function useScrollCraft({ 
  targetRef = null, 
  threshold = 10,
  decayRate = 0.88
} = {}) {
  const [scrollState, setScrollState] = useState({
    progress: 0,
    velocity: 0,
    direction: 'idle',
    isScrolled: false,
    scrollY: 0,
    reducedMotion: false,
    supportsScrollTimeline: false
  });

  const lastScrollY = useRef(0);
  const lastTime = useRef(0);
  const velocityRef = useRef(0);
  const rafId = useRef(null);
  const decayRafId = useRef(null);

  // Comprobar soporte nativo de CSS scroll-timeline y prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReduced = reducedMotionQuery.matches;

    let supportsCSS = false;
    try {
      if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
        supportsCSS = CSS.supports('animation-timeline', 'scroll()') || CSS.supports('animation-timeline', 'view()');
      }
    } catch {
      supportsCSS = false;
    }

    setScrollState(prev => ({
      ...prev,
      reducedMotion: isReduced,
      supportsScrollTimeline: supportsCSS
    }));

    const handleMotionChange = (e) => {
      setScrollState(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    reducedMotionQuery.addEventListener('change', handleMotionChange);
    return () => reducedMotionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Manejador rAF de scroll
  useEffect(() => {
    if (typeof window === 'undefined') return;

    lastTime.current = performance.now();
    lastScrollY.current = targetRef?.current ? targetRef.current.scrollTop : window.scrollY;

    let isTicking = false;

    const updateScrollMetrics = () => {
      const now = performance.now();
      const currentY = targetRef?.current ? targetRef.current.scrollTop : window.scrollY;
      
      let maxScroll = 0;
      if (targetRef?.current) {
        maxScroll = targetRef.current.scrollHeight - targetRef.current.clientHeight;
      } else {
        maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      }

      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, currentY / maxScroll)) : 0;
      const dt = Math.max(1, now - lastTime.current);
      const dy = currentY - lastScrollY.current;
      
      // Velocidad instantánea en px/ms suavizada
      const instantVelocity = Math.abs(dy) / dt;
      velocityRef.current = velocityRef.current * 0.4 + instantVelocity * 0.6;

      const direction = dy > 0.5 ? 'down' : dy < -0.5 ? 'up' : 'idle';

      setScrollState(prev => ({
        ...prev,
        progress,
        velocity: velocityRef.current,
        direction,
        isScrolled: currentY > threshold,
        scrollY: currentY
      }));

      lastScrollY.current = currentY;
      lastTime.current = now;
      isTicking = false;

      // Iniciar amortiguación de inercia si el scroll se detuvo
      cancelAnimationFrame(decayRafId.current);
      const decayVelocity = () => {
        if (velocityRef.current > 0.01) {
          velocityRef.current *= decayRate;
          setScrollState(prev => ({
            ...prev,
            velocity: velocityRef.current,
            direction: velocityRef.current < 0.05 ? 'idle' : prev.direction
          }));
          decayRafId.current = requestAnimationFrame(decayVelocity);
        } else {
          velocityRef.current = 0;
          setScrollState(prev => ({ ...prev, velocity: 0, direction: 'idle' }));
        }
      };
      decayRafId.current = requestAnimationFrame(decayVelocity);
    };

    const handleScroll = () => {
      if (!isTicking) {
        rafId.current = requestAnimationFrame(updateScrollMetrics);
        isTicking = true;
      }
    };

    const scrollTarget = targetRef?.current || window;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

    // Ejecución inicial para calcular el estado en carga
    handleScroll();

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (decayRafId.current) cancelAnimationFrame(decayRafId.current);
    };
  }, [targetRef, threshold, decayRate]);

  return scrollState;
}

export default useScrollCraft;
