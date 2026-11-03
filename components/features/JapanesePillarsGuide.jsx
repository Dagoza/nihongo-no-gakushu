'use client';

import React, { useState } from 'react';
import { 
  Languages, 
  Target, 
  Award, 
  Sparkles, 
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  Layers,
  LayoutGrid
} from 'lucide-react';
import StickyScrollStage from '../scroll/StickyScrollStage';

export default function JapanesePillarsGuide({ onOpenPillar }) {
  const [viewMode, setViewMode] = useState('scrolly'); // 'scrolly' | 'grid'

  const pillars = [
    {
      id: 'writing',
      title: 'Sistemas de Escritura',
      badge: 'Bases Gráficas',
      watermark: 'あ',
      kanjiSample: 'あ · ア · 漢字',
      desc: 'Hiragana fonético, Katakana para extranjerismos y Kanjis conceptuales.',
      icon: Languages,
      color: '#6366f1',
      bgLight: 'rgba(99, 102, 241, 0.12)',
      tag: '46+46+2000+'
    },
    {
      id: 'particles',
      title: 'Estructura & Partículas',
      badge: 'Gramática SOV',
      watermark: 'は',
      kanjiSample: 'は · が · を · に',
      desc: 'El orden Sujeto-Objeto-Verbo y las partículas que definen el rol de cada elemento.',
      icon: Target,
      color: '#10b981',
      bgLight: 'rgba(16, 185, 129, 0.12)',
      tag: '99 Partículas'
    },
    {
      id: 'jlpt',
      title: 'Niveles Oficiales JLPT',
      badge: 'Estándar Oficial',
      watermark: '試',
      kanjiSample: 'N5 → N4 → N3 → N2 → N1',
      desc: 'Ruta certificada internacional desde principiante (N5) hasta fluidez nativa (N1).',
      icon: Award,
      color: '#f59e0b',
      bgLight: 'rgba(245, 158, 11, 0.12)',
      tag: '5 Niveles'
    },
    {
      id: 'phonetics',
      title: 'Fonética & Pitch Accent',
      badge: 'Ritmo & Melodía',
      watermark: '音',
      kanjiSample: '拍 · 雨 (lluvia) vs 飴 (dulce)',
      desc: 'El compás de las moras uniformes y la entonación tonal que evita confusiones.',
      icon: Sparkles,
      color: '#ec4899',
      bgLight: 'rgba(236, 72, 153, 0.12)',
      tag: 'Acento Tonal'
    },
    {
      id: 'glossary',
      title: 'Glosario Lingüístico',
      badge: 'Terminología Técnica',
      watermark: '語',
      kanjiSample: '敬語 · 和語 · 漢語 · 熟語',
      desc: 'Conceptos morfológicos y de registro: Keigo, Bikougo, Wago, Kango y verbos Godan/Ichidan.',
      icon: BookOpen,
      color: '#8b5cf6',
      bgLight: 'rgba(139, 92, 246, 0.12)',
      tag: '39 Términos'
    }
  ];

  return (
    <div className="home-section">
      {/* Cabecera de la sección */}
      <div className="home-section-header">
        <div>
          <span className="home-section-label">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />
            Arquitectura del Idioma
          </span>
          <h2 className="home-section-title">
            Los 5 Pilares del Japonés
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <p className="home-section-desc" style={{ margin: 0, display: 'none', maxWidth: 420 }}>
            Explora cada pilar de forma limpia y progresiva con audio neuronal, desgloses y ejemplos sin saturar la pantalla.
          </p>
          <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', borderRadius: 10, padding: 3, border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setViewMode('scrolly')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: viewMode === 'scrolly' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'scrolly' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: viewMode === 'scrolly' ? 750 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'scrolly' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <Layers size={14} />
              <span>Scroll-Craft</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: viewMode === 'grid' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: viewMode === 'grid' ? 750 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <LayoutGrid size={14} />
              <span>Cuadrícula</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODO SCROLLYTELLING (Sticky Stage en Desktop + Riel de Pasos) */}
      {viewMode === 'scrolly' ? (
        <StickyScrollStage
          steps={pillars.map((p) => ({
            ...p,
            description: p.desc,
            render: (step, isActive) => {
              const Icon = step.icon;
              return (
                <div 
                  className={`scroll-stage-step-inner ${isActive ? 'active' : ''}`}
                  onClick={() => onOpenPillar(step.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div 
                        className="pillar-icon-badge"
                        style={{ background: step.bgLight, color: step.color, width: 38, height: 38 }}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <span className="scroll-stage-step-badge">{step.badge}</span>
                        <h4 className="scroll-stage-step-title" style={{ marginTop: 2 }}>{step.title}</h4>
                      </div>
                    </div>
                    <span className="pillar-tag">{step.tag}</span>
                  </div>

                  <div className="pillar-sample" style={{ margin: '8px 0', fontSize: '0.98rem' }}>
                    {step.kanjiSample}
                  </div>

                  <p className="scroll-stage-step-desc">
                    {step.desc}
                  </p>

                  <div className="pillar-action-row" style={{ marginTop: 12 }}>
                    <span>Explorar guía didáctica en profundidad</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              );
            }
          }))}
          renderStickyContent={(activePillar) => {
            if (!activePillar) return null;
            const Icon = activePillar.icon;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div 
                    className="pillar-icon-badge"
                    style={{ background: activePillar.bgLight, color: activePillar.color, width: 52, height: 52 }}
                  >
                    <Icon size={26} />
                  </div>
                  <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--border)', lineHeight: 1, fontFamily: "'Noto Serif JP', serif" }}>
                    {activePillar.watermark}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: activePillar.color, letterSpacing: '0.04em' }}>
                    Pilar Activo en Visor
                  </span>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 8px' }}>
                    {activePillar.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    {activePillar.desc}
                  </p>
                </div>

                <div style={{ padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Muestrario de conceptos:
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-dark)', letterSpacing: '0.02em' }}>
                    {activePillar.kanjiSample}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenPillar(activePillar.id)}
                  className="home-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '0.85rem' }}
                >
                  <span>Abrir lección completa del Pilar</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          }}
        />
      ) : (
        /* MODO CUADRÍCULA CLÁSICA CON ANIMACIONES SCROLL-CRAFT REVEAL */
        <div className="pillars-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                onClick={() => onOpenPillar(pillar.id)}
                className="pillar-card scroll-craft-reveal"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onOpenPillar(pillar.id); }}
              >
                <div className="pillar-watermark">
                  {pillar.watermark}
                </div>

                <div>
                  <div className="pillar-header-row">
                    <div 
                      className="pillar-icon-badge"
                      style={{ background: pillar.bgLight, color: pillar.color }}
                    >
                      <Icon size={22} />
                    </div>
                    <span className="pillar-tag">
                      {pillar.tag}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {pillar.badge}
                  </span>
                  <h3 className="pillar-title">
                    {pillar.title}
                  </h3>

                  <div className="pillar-sample">
                    {pillar.kanjiSample}
                  </div>

                  <p className="pillar-desc">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pillar-action-row">
                  <span>Explorar guía didáctica</span>
                  <ArrowUpRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
