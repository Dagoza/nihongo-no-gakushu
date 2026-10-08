'use client';

import React from 'react';
import { 
  Languages, 
  Target, 
  Award, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';

export default function JapanesePillarsGuide({ onOpenPillar }) {
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
            Los 4 Pilares del Japonés
          </h2>
        </div>
        <p className="home-section-desc">
          Explora cada pilar de forma limpia y progresiva con audio neuronal, desgloses y ejemplos sin saturar la pantalla.
        </p>
      </div>

      {/* Grid de 4 Pilares */}
      <div className="pillars-grid">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              onClick={() => onOpenPillar(pillar.id)}
              className="pillar-card"
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
    </div>
  );
}
