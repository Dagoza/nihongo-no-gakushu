'use client';

import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Target, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Layers, 
  BookOpen, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Info,
  Sliders
} from 'lucide-react';
import { 
  calculateRoadmapProjection, 
  getStudyPhase, 
  calculateReviewLoadForecast, 
  calculateBalancedDailyBudget,
  DEFAULT_SUSTAINABILITY_FACTOR,
  CRITICAL_REVIEW_GATE_THRESHOLD
} from '../../lib/roadmapLogic';

export default function StudyRoadmapModule({
  appState = {},
  onNavigate = null
}) {
  const [dailyPace, setDailyPace] = useState(10); // 5, 10, 15, 20
  const [targetLevel, setTargetLevel] = useState('N5'); // 'N5' | 'N4' | 'N3'

  // Métricas del usuario
  const masteredVocabCount = Object.values(appState?.masteredVocab || {}).filter(Boolean).length;
  const masteredKanjiCount = Object.values(appState?.masteredKanji || {}).filter(Boolean).length;
  const completedStepsCount = Object.values(appState?.completedSteps || {}).filter(Boolean).length;
  
  // Contar repasos vencidos reales
  const dueReviewsCount = useMemo(() => {
    let count = 0;
    const now = new Date();
    const srsQ = appState?.srsQuestions || {};
    Object.values(srsQ).forEach(card => {
      if (card && card.due && new Date(card.due) <= now) {
        count++;
      }
    });
    return count;
  }, [appState?.srsQuestions]);

  // Target word count por nivel JLPT
  const targetWords = useMemo(() => {
    switch (targetLevel) {
      case 'N4': return 1500;
      case 'N3': return 3000;
      case 'N5':
      default: return 800;
    }
  }, [targetLevel]);

  // Proyección con factor 0.8 y Review-First Gate
  const projection = useMemo(() => {
    return calculateRoadmapProjection({
      masteredWordsCount: masteredVocabCount,
      targetWordsCount: targetWords,
      dailyPace,
      sustainabilityFactor: DEFAULT_SUSTAINABILITY_FACTOR,
      dueReviewsCount,
      maxDailyReviewsThreshold: CRITICAL_REVIEW_GATE_THRESHOLD
    });
  }, [masteredVocabCount, targetWords, dailyPace, dueReviewsCount]);

  // Fase actual
  const currentPhase = useMemo(() => {
    return getStudyPhase(masteredVocabCount, masteredKanjiCount, completedStepsCount);
  }, [masteredVocabCount, masteredKanjiCount, completedStepsCount]);

  // Pronóstico de carga anti-burnout
  const loadForecast = useMemo(() => {
    return calculateReviewLoadForecast(dailyPace);
  }, [dailyPace]);

  // Presupuesto balanceado Estudio vs Habilidad
  const budget = useMemo(() => {
    return calculateBalancedDailyBudget(appState);
  }, [appState]);

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return '---';
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="study-roadmap-card" style={{
      background: 'var(--bg-main, #ffffff)',
      borderRadius: 16,
      border: '1px solid var(--border)',
      padding: '24px 20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      marginBottom: 24
    }}>
      {/* 1. CABECERA CON FASE ACTUAL */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${currentPhase.color}18`,
            color: currentPhase.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Compass size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 9999,
                background: `${currentPhase.color}15`,
                color: currentPhase.color,
                border: `1px solid ${currentPhase.color}35`
              }}>
                {currentPhase.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Meta actual: JLPT {targetLevel}
              </span>
            </div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>
              Hoja de Ruta Temporal & Proyección de Metas
            </h3>
          </div>
        </div>

        {/* Selector de nivel meta */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: 3, borderRadius: 10, border: '1px solid var(--border)', gap: 3 }}>
          {['N5', 'N4', 'N3'].map(lvl => (
            <button
              key={lvl}
              type="button"
              className={`btn btn-xs ${targetLevel === lvl ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTargetLevel(lvl)}
              style={{ fontWeight: 700, borderRadius: 8, padding: '4px 12px' }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ALERTA REVIEW-FIRST GATE SI SUPERA EL UMBRAL CRÍTICO */}
      {projection.isReviewGated && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1.5px solid rgba(239, 68, 68, 0.35)',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#ef4444',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.9rem', marginBottom: 2 }}>
              Compuerta Review-First Gate Activada
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.45, color: 'var(--text-main)' }}>
              {projection.gateReason}
            </p>
            {onNavigate && (
              <button
                type="button"
                className="btn btn-danger btn-xs"
                onClick={() => onNavigate('/srs')}
                style={{ marginTop: 8, gap: 4 }}
              >
                <span>Limpiar Repasos Pendientes ({projection.dueReviewsCount})</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. SELECTOR DE RITMO DIARIO & SIMULADOR */}
      <div style={{
        background: 'var(--bg-subtle, #f8fafc)',
        borderRadius: 12,
        padding: '16px',
        border: '1px solid var(--border)',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sliders size={14} /> Selecciona tu Ritmo Diario de Palabras Nuevas:
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Calcula días y tiempo de repaso estimado con factor de sostenibilidad real (0.8)
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { pace: 5, label: '5/día', desc: 'Relajado' },
              { pace: 10, label: '10/día', desc: 'Recomendado' },
              { pace: 15, label: '15/día', desc: 'Intensivo' },
              { pace: 20, label: '20/día', desc: 'Extremo' }
            ].map(item => (
              <button
                key={item.pace}
                type="button"
                className={`btn btn-xs ${dailyPace === item.pace ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setDailyPace(item.pace)}
                style={{ borderRadius: 8, padding: '5px 10px', fontSize: '0.76rem', fontWeight: 700 }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visualización de la Proyección Dual (Optimista vs Realista) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginTop: 12
        }}>
          {/* Tarjeta Optimista */}
          <div style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={12} color="#3b82f6" /> Ritmo Nominal Ciego
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3b82f6', margin: '4px 0' }}>
              {projection.optimisticDays} días
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Fecha proyectada: <strong>{formatDate(projection.optimisticDate)}</strong>
            </div>
          </div>

          {/* Tarjeta Realista Sostenible */}
          <div style={{
            background: 'var(--bg-main)',
            border: '2px solid var(--primary)',
            borderRadius: 10,
            padding: '12px 14px',
            position: 'relative'
          }}>
            <span style={{
              position: 'absolute',
              top: -9,
              right: 10,
              fontSize: '0.62rem',
              fontWeight: 900,
              background: 'var(--primary)',
              color: '#fff',
              padding: '1px 6px',
              borderRadius: 4
            }}>
              Factor 0.8 Sostenible
            </span>
            <div style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={13} /> Ritmo Real con Deuda de Repasos
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)', margin: '4px 0' }}>
              {projection.realisticDays} días
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Fecha sostenible: <strong>{formatDate(projection.realisticDate)}</strong> (~{projection.effectivePace} palabras/día reales)
            </div>
          </div>
        </div>

        {/* Alerta anti-burnout del simulador de carga */}
        {loadForecast.warning && (
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontSize: '0.76rem',
            color: '#b45309',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{loadForecast.warning}</span>
          </div>
        )}

        {/* Desglose de carga por semanas */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
            Carga esperada en tu sesión diaria de repaso FSRS:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {loadForecast.weeks.map(w => (
              <div key={w.week} style={{
                background: 'var(--bg-main)',
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{w.label}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                  ~{w.dailyReviews} repasos
                </div>
                <div style={{ fontSize: '0.68rem', color: w.dailyMinutes > 40 ? '#ef4444' : 'var(--text-muted)' }}>
                  ~{w.dailyMinutes} min/día
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. PRESUPUESTO BALANCEADO: ESTUDIO VS HABILIDAD (GUÍA MANABE) */}
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '16px',
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={16} color="var(--primary)" />
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800 }}>
              Presupuesto Diario Balanceado (Guía Manabe)
            </h4>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Estudio Teórico (SRS) vs Inmersión Práctica
          </span>
        </div>

        {/* Barra 1: Cuota de Estudio */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              📚 Cuota de Estudio (SRS + Gramática)
            </span>
            <span style={{ fontWeight: 800, color: '#3b82f6' }}>{budget.studyPercent}%</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${budget.studyPercent}%`, height: '100%', background: '#3b82f6', borderRadius: 999 }} />
          </div>
        </div>

        {/* Barra 2: Cuota de Habilidad */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              🎧 Cuota de Habilidad (Inmersión, Diálogos y Historias)
            </span>
            <span style={{ fontWeight: 800, color: '#10b981' }}>{budget.skillPercent}%</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${budget.skillPercent}%`, height: '100%', background: '#10b981', borderRadius: 999 }} />
          </div>
        </div>

        <p style={{ margin: '10px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {budget.recommendation}
        </p>
      </div>

      {/* 5. CHECKLIST DE HITOS DE LA FASE ACTUAL */}
      <div style={{
        background: 'var(--bg-subtle, #f8fafc)',
        borderRadius: 12,
        padding: '14px 16px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle2 size={15} color="var(--success)" /> Checklist de la {currentPhase.name}:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8, fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: masteredVocabCount >= 50 ? 'var(--success)' : 'var(--text-muted)' }}>
            <span>{masteredVocabCount >= 50 ? '✓' : '○'}</span>
            <span>Dominar las 5 vocales puras y Kana básico</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: masteredVocabCount >= 150 ? 'var(--success)' : 'var(--text-muted)' }}>
            <span>{masteredVocabCount >= 150 ? '✓' : '○'}</span>
            <span>150 palabras clave en FSRS v5 (partículas nucleares)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: masteredKanjiCount >= 30 ? 'var(--success)' : 'var(--text-muted)' }}>
            <span>{masteredKanjiCount >= 30 ? '✓' : '○'}</span>
            <span>Primeros 30-50 kanjis visuales con See-Link-Go</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: completedStepsCount >= 5 ? 'var(--success)' : 'var(--text-muted)' }}>
            <span>{completedStepsCount >= 5 ? '✓' : '○'}</span>
            <span>Primeras 5 lecciones de diálogo NHK con Raw Listening</span>
          </div>
        </div>
      </div>
    </div>
  );
}
