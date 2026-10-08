'use client';

import React from 'react';
import { 
  Flame, 
  Sparkles, 
  Layers, 
  Target, 
  ArrowRight, 
  Compass,
  TrendingUp,
  Award
} from 'lucide-react';

export default function StudyStatusBento({ appState, onNavigate }) {
  const streak = appState?.streak || 1;
  const xp = appState?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;
  const xpProgressPercent = Math.min(100, xpInCurrentLevel);

  const masteredVocabCount = Object.values(appState?.masteredVocab || {}).filter(Boolean).length;
  const masteredKanjiCount = Object.values(appState?.masteredKanji || {}).filter(Boolean).length;
  const masteredParticlesCount = Object.values(appState?.masteredParticles || {}).filter(Boolean).length;
  const currentModuleStep = appState?.currentModuleStep || 1;

  return (
    <div className="bento-card">
      {/* Cabecera del Dashboard */}
      <div className="home-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div 
            style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 14, 
              background: 'rgba(99, 102, 241, 0.12)', 
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span className="home-section-label" style={{ margin: 0 }}>
                Estado de Aprendizaje
              </span>
              <span 
                style={{ 
                  fontSize: '0.68rem', 
                  fontWeight: 800, 
                  padding: '2px 8px', 
                  borderRadius: 9999, 
                  background: 'rgba(16, 185, 129, 0.15)', 
                  color: 'var(--success)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                Activo hoy
              </span>
            </div>
            <h3 className="home-section-title" style={{ fontSize: '1.25rem' }}>
              Tu Progreso y Métricas de Estudio
            </h3>
          </div>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('/curriculum')}
            className="home-btn-primary"
            style={{ padding: '9px 18px', fontSize: '0.82rem' }}
          >
            <Compass size={15} />
            <span>Continuar Ruta (Módulo {currentModuleStep})</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Grid de 4 Métricas */}
      <div className="study-stats-grid">
        {/* 1. Racha diaria */}
        <div className="study-stat-item">
          <div 
            className="study-stat-icon-wrap" 
            style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}
          >
            <Flame size={22} />
          </div>
          <div>
            <span className="study-stat-label">Racha Diaria</span>
            <span className="study-stat-value">
              {streak} {streak === 1 ? 'día' : 'días'} 🔥
            </span>
          </div>
        </div>

        {/* 2. Nivel y XP */}
        <div className="study-stat-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span className="study-stat-label">Nivel {level}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
              {xp} XP
            </span>
          </div>
          <div className="study-level-progress-bar">
            <div 
              className="study-level-progress-fill" 
              style={{ width: `${xpProgressPercent}%` }} 
            />
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {100 - xpInCurrentLevel} XP para Nivel {level + 1}
          </span>
        </div>

        {/* 3. Vocabulario y Kanjis */}
        <div className="study-stat-item">
          <div 
            className="study-stat-icon-wrap" 
            style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}
          >
            <Layers size={22} />
          </div>
          <div>
            <span className="study-stat-label">Vocabulario & Kanji</span>
            <span className="study-stat-value" style={{ fontSize: '1rem' }}>
              {masteredVocabCount} palabras · {masteredKanjiCount} kanjis
            </span>
          </div>
        </div>

        {/* 4. Partículas dominadas */}
        <div className="study-stat-item">
          <div 
            className="study-stat-icon-wrap" 
            style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}
          >
            <Target size={22} />
          </div>
          <div>
            <span className="study-stat-label">Partículas Clave</span>
            <span className="study-stat-value" style={{ fontSize: '1rem' }}>
              {masteredParticlesCount} / 99 dominadas
            </span>
          </div>
        </div>
      </div>

      {/* Pie con enlace a analítica completa */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>Datos guardados localmente y sincronizables con tu cuenta en la nube.</span>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('/progress')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.8rem'
            }}
          >
            <span>Ver analítica detallada</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
