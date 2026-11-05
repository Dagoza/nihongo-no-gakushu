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
import { calculateOverallProgress } from '../../lib/progressMetrics';
import { getStudyPhase, calculateBalancedDailyBudget } from '../../lib/roadmapLogic';

export default function StudyStatusBento({ appState, onNavigate }) {
  const streak = appState?.streak || 1;
  const xp = appState?.xp || 0;
  const progressMetrics = React.useMemo(() => calculateOverallProgress(appState), [appState]);
  const dominioPercent = progressMetrics.overallInteger;
  const nextMilestone = Math.min(100, (Math.floor(dominioPercent / 10) + 1) * 10);

  const masteredVocabCount = Object.values(appState?.masteredVocab || {}).filter(Boolean).length;
  const masteredKanjiCount = Object.values(appState?.masteredKanji || {}).filter(Boolean).length;
  const masteredParticlesCount = Object.values(appState?.masteredParticles || {}).filter(Boolean).length;
  const currentModuleStep = appState?.currentModuleStep || 1;
  const completedStepsCount = Object.values(appState?.completedSteps || {}).filter(Boolean).length;

  const currentPhase = React.useMemo(() => {
    return getStudyPhase(masteredVocabCount, masteredKanjiCount, completedStepsCount);
  }, [masteredVocabCount, masteredKanjiCount, completedStepsCount]);

  const budget = React.useMemo(() => {
    return calculateBalancedDailyBudget(appState);
  }, [appState]);

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
              <span 
                style={{ 
                  fontSize: '0.68rem', 
                  fontWeight: 800, 
                  padding: '2px 8px', 
                  borderRadius: 9999, 
                  background: `${currentPhase.color}15`, 
                  color: currentPhase.color,
                  border: `1px solid ${currentPhase.color}35`,
                  cursor: 'pointer'
                }}
                onClick={() => onNavigate?.('/progress?section=roadmap')}
                title="Ver tu hoja de ruta completa en Progreso"
              >
                {currentPhase.name} · {masteredVocabCount}/{currentPhase.targetVocab} voc
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

        {/* 2. Dominio General (Techos de Completación) */}
        <div 
          className="study-stat-item" 
          style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6, cursor: 'pointer' }}
          onClick={() => onNavigate?.('/progress')}
          title="Dominio integral del curso. Clic para ver desglose por techos y niveles."
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span className="study-stat-label">Dominio General</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
              {dominioPercent}%
            </span>
          </div>
          <div className="study-level-progress-bar">
            <div 
              className="study-level-progress-fill" 
              style={{ width: `${dominioPercent}%` }} 
            />
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {dominioPercent >= 100 ? '¡Curso 100% completado! 🏆' : `Próximo hito: ${nextMilestone}% · Techos ponderados`}
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

      {/* Presupuesto Balanceado: Estudio Teórico vs Inmersión Práctica (Guía Manabe) */}
      <div style={{
        marginTop: 16,
        marginBottom: 16,
        padding: '12px 14px',
        borderRadius: 12,
        background: 'var(--bg-subtle, #f8fafc)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: '0.78rem' }}>
          <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} color="var(--primary)" /> Presupuesto Balanceado Diario (Guía Manabe)
          </span>
          <span 
            style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.74rem' }}
            onClick={() => onNavigate?.('/progress?section=roadmap')}
          >
            Ver Hoja de Ruta →
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Cuota Estudio */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3 }}>
              <span>📚 Cuota Estudio (SRS)</span>
              <strong style={{ color: '#3b82f6' }}>{budget.studyPercent}%</strong>
            </div>
            <div style={{ width: '100%', height: 5, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${budget.studyPercent}%`, height: '100%', background: '#3b82f6' }} />
            </div>
          </div>

          {/* Cuota Habilidad */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3 }}>
              <span>🎧 Cuota Inmersión</span>
              <strong style={{ color: '#10b981' }}>{budget.skillPercent}%</strong>
            </div>
            <div style={{ width: '100%', height: 5, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${budget.skillPercent}%`, height: '100%', background: '#10b981' }} />
            </div>
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
