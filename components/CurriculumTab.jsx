'use client';

import React from 'react';
import dataStore from '../lib/data';
import { ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';

export default function CurriculumTab({ onNavigate, userState, onCompleteStep }) {
  const steps = dataStore.curriculum;

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          <span>🗺️</span> Ruta de Aprendizaje Incremental
        </h2>
        <p className="section-desc">
          Plan de estudio progresivo para aprender japonés general paso a paso. Cada nivel reutiliza y expande lo aprendido en los niveles anteriores.
        </p>
      </div>

      <div className="curriculum-list">
        {steps.map((step) => {
          const isDone = userState?.completedSteps?.[step.step];

          return (
            <div key={step.step} className={`curriculum-step-card ${isDone ? 'completed' : ''}`}>
              <div className="step-number-badge">
                <span>{step.icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>L{step.step}</span>
              </div>

              <div className="step-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span className="step-target-tag">{step.stage}</span>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-subtitle">{step.subtitle}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className={`btn ${isDone ? 'btn-outline' : 'btn-primary'} btn-sm`}
                      onClick={() => onNavigate(step.tab)}
                    >
                      <span>Ir al Módulo</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                <ul className="step-objectives">
                  {step.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <strong>Puntos Gramaticales:</strong> {step.grammar_focus.join(' · ')}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Vocabulario Integrado:
                    </div>
                    <div className="step-chips">
                      {step.included_vocab.map((w, idx) => (
                        <span key={idx} className="step-chip jp-text">{w}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
