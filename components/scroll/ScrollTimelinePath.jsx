'use client';

import React, { useRef, useEffect, useState } from 'react';

/**
 * ScrollTimelinePath
 * Componente visual que dibuja un trazo caligráfico continuo (SVG)
 * a lo largo de un contenedor a medida que el usuario hace scroll.
 */
export default function ScrollTimelinePath({
  containerRef,
  milestones = [],
  activeMilestoneId = null,
  color = 'var(--color-aizome)',
  activeColor = 'var(--color-shu)'
}) {
  const [fillPercent, setFillPercent] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFillPercent(100);
      return;
    }

    const container = containerRef?.current;
    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          // El trazo comienza a llenarse cuando la parte superior del contenedor entra a 30% del viewport
          const startOffset = windowHeight * 0.7;
          const totalDistance = rect.height;
          const currentProgress = (startOffset - rect.top) / totalDistance;
          
          const clamped = Math.min(100, Math.max(0, currentProgress * 100));
          setFillPercent(clamped);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  return (
    <div className="scroll-timeline-path-track" aria-hidden="true">
      {/* Línea de fondo tenue */}
      <div className="scroll-timeline-line-bg" />
      
      {/* Línea activa con pincelada caligráfica rellena */}
      <div 
        className="scroll-timeline-line-fill" 
        style={{ 
          height: `${fillPercent}%`,
          background: `linear-gradient(180deg, ${color} 0%, ${activeColor} 100%)`
        }} 
      />

      {/* Nodos de hitos (Torii / Estaciones) */}
      {milestones.map((milestone, idx) => {
        const topPos = milestone.percent !== undefined ? milestone.percent : (idx / (milestones.length - 1 || 1)) * 100;
        const isReached = fillPercent >= topPos - 2;
        const isActive = activeMilestoneId === milestone.id;

        return (
          <div
            key={milestone.id || idx}
            className={`scroll-timeline-node ${isReached ? 'reached' : ''} ${isActive ? 'active' : ''}`}
            style={{ top: `${topPos}%` }}
            title={milestone.label}
          >
            <div className="scroll-timeline-node-core">
              {milestone.badge || (idx + 1)}
            </div>
            {milestone.label && (
              <span className="scroll-timeline-node-label">
                {milestone.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
