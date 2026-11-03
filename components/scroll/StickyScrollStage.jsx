'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * StickyScrollStage
 * Contenedor de escenario fijo (sticky) y riel narrativo scrolleable.
 * En desktop: Escenario fijo en un panel (ej. arte/mascota/concepto) y pasos scrolleables a su lado.
 * En mobile: Se adapta a una pila fluida y ergonómica sin bloquear el gesto táctil del pulgar.
 */
export default function StickyScrollStage({
  steps = [],
  renderStickyContent,
  className = '',
  onStepChange = null,
  initialStep = 0
}) {
  const [activeStepIndex, setActiveStepIndex] = useState(initialStep);
  const stepRefs = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !steps.length) return;

    // Observar cuál paso está en el centro visual del viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-step-index'));
            if (!isNaN(index)) {
              setActiveStepIndex(index);
              if (onStepChange) onStepChange(index, steps[index]);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-30% 0px -40% 0px', // Activar cuando esté en la franja central
        threshold: 0.1
      }
    );

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [steps, onStepChange]);

  return (
    <div className={`scroll-stage-container ${className}`}>
      {/* 1. Escenario Sticky (Fijo en Desktop) */}
      <div className="scroll-stage-sticky-panel">
        <div className="scroll-stage-sticky-content">
          {renderStickyContent(steps[activeStepIndex], activeStepIndex)}
        </div>
      </div>

      {/* 2. Riel de Pasos Scrolleables */}
      <div className="scroll-stage-rail">
        {steps.map((step, idx) => {
          const isActive = idx === activeStepIndex;
          return (
            <div
              key={step.id || idx}
              ref={(el) => { stepRefs.current[idx] = el; }}
              data-step-index={idx}
              className={`scroll-stage-step-card ${isActive ? 'active' : ''}`}
            >
              {typeof step.render === 'function' ? (
                step.render(step, isActive, idx)
              ) : (
                <div className="scroll-stage-step-inner">
                  {step.badge && (
                    <span className="scroll-stage-step-badge">{step.badge}</span>
                  )}
                  <h3 className="scroll-stage-step-title">{step.title}</h3>
                  {step.subtitle && (
                    <h4 className="scroll-stage-step-subtitle">{step.subtitle}</h4>
                  )}
                  <p className="scroll-stage-step-desc">{step.description}</p>
                  {step.extraContent}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
