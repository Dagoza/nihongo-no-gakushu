'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Brain,
  Sparkles,
  Layers,
  Languages,
  BookOpen,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Flame,
  Zap,
  ShieldAlert,
  Info,
  ExternalLink,
  X,
  Play,
  TrendingUp,
  BarChart2,
  Calendar,
  Eye
} from 'lucide-react';
import {
  getFsrsOverview,
  compileFsrsItems,
  getIntervalPreviews,
  resetFsrsCard,
  getCardStateInfo,
  SRSRating,
  FSRSState
} from '../lib/srs';
import jlptExamsData from '../data/jlpt_exams.json';
import kanjiData from '../data/kanji.json';
import vocabularyData from '../data/vocabulary.json';
import particlesData from '../data/particles.json';

const ITEMS_PER_PAGE = 20;

export default function FsrsStatsModule({
  appState = {},
  onUpdateState,
  onOpenDailyGoal = null,
  onNavigate = null,
  showConfirm = null,
  showAlert = null
}) {
  // Pestaña activa dentro del módulo de FSRS
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'topics' | 'explorer'

  // Filtros del explorador de preguntas
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'jlpt' | 'kanji' | 'vocab' | 'grammar'
  const [filterLevel, setFilterLevel] = useState('all');       // 'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  const [filterState, setFilterState] = useState('all');       // 'all' | 'due' | 'new' | 'learning' | 'review' | 'relearning' | 'leech'
  const [filterScope, setFilterScope] = useState('all');       // 'all' (todo el catálogo) | 'active' (solo tarjetas en FSRS)
  const [sortBy, setSortBy] = useState('urgent');             // 'urgent' | 'ret_asc' | 'diff_desc' | 'lapses_desc' | 'stab_desc' | 'recent'
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Inspector de tarjeta
  const [inspectingItem, setInspectingItem] = useState(null);

  // Catálogos consolidados
  const catalogs = useMemo(() => ({
    jlptExams: jlptExamsData || [],
    kanji: kanjiData || [],
    vocabulary: vocabularyData || [],
    particles: particlesData || []
  }), []);

  // Resumen analítico global de FSRS
  const overview = useMemo(() => {
    return getFsrsOverview(appState, catalogs);
  }, [appState, catalogs]);

  // Lista compilada de preguntas y tarjetas
  const allCompiledItems = useMemo(() => {
    return compileFsrsItems(appState, catalogs);
  }, [appState, catalogs]);

  // Filtrado y ordenación para el explorador
  const filteredItems = useMemo(() => {
    let result = allCompiledItems;

    // Filtro de alcance (activas vs todo)
    if (filterScope === 'active') {
      result = result.filter(item => item.hasCard);
    }

    // Filtro de categoría
    if (filterCategory !== 'all') {
      result = result.filter(item => item.category === filterCategory);
    }

    // Filtro de nivel JLPT
    if (filterLevel !== 'all') {
      result = result.filter(item => item.level === filterLevel);
    }

    // Filtro de estado FSRS
    if (filterState === 'due') {
      result = result.filter(item => item.isDue);
    } else if (filterState === 'new') {
      result = result.filter(item => item.state === FSRSState.NEW);
    } else if (filterState === 'learning') {
      result = result.filter(item => item.state === FSRSState.LEARNING);
    } else if (filterState === 'review') {
      result = result.filter(item => item.state === FSRSState.REVIEW);
    } else if (filterState === 'relearning') {
      result = result.filter(item => item.state === FSRSState.RELEARNING);
    } else if (filterState === 'leech') {
      result = result.filter(item => item.isLeech);
    }

    // Búsqueda por texto libre
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        return (
          item.title?.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.explanation?.toLowerCase().includes(q) ||
          item.id?.toLowerCase().includes(q) ||
          item.correctAnswer?.toLowerCase().includes(q)
        );
      });
    }

    // Ordenación
    result = [...result].sort((a, b) => {
      if (sortBy === 'urgent') {
        // Primero vencidas hoy
        if (a.isDue && !b.isDue) return -1;
        if (!a.isDue && b.isDue) return 1;
        // Luego por días hasta vencer
        return a.daysUntilDue - b.daysUntilDue;
      }
      if (sortBy === 'ret_asc') {
        // Menor retención primero (prioriza olvidadas)
        return a.retrievability.percent - b.retrievability.percent;
      }
      if (sortBy === 'diff_desc') {
        // Mayor dificultad primero
        return b.difficulty - a.difficulty;
      }
      if (sortBy === 'lapses_desc') {
        // Mayor número de fallos primero
        return b.lapses - a.lapses;
      }
      if (sortBy === 'stab_desc') {
        // Mayor estabilidad primero
        return b.stability - a.stability;
      }
      if (sortBy === 'recent') {
        const dateA = a.lastReview ? new Date(a.lastReview).getTime() : 0;
        const dateB = b.lastReview ? new Date(b.lastReview).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [allCompiledItems, filterScope, filterCategory, filterLevel, filterState, searchQuery, sortBy]);

  // Paginación
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Cálculo en vivo de intervalos simulados para el item inspeccionado
  const inspectorIntervals = useMemo(() => {
    if (!inspectingItem || !inspectingItem.card) return null;
    return getIntervalPreviews(inspectingItem.card);
  }, [inspectingItem]);

  // Reiniciar tarjeta FSRS individual
  const handleResetCard = async (item) => {
    if (!item) return;
    const confirmFn = showConfirm || (() => Promise.resolve(window.confirm('¿Reiniciar el progreso FSRS de esta tarjeta a cero?')));
    const ok = await confirmFn({
      title: '¿Reiniciar tarjeta FSRS?',
      message: `Esta acción restablecerá la estabilidad, dificultad y repasos acumulados para "${item.title}". Volverá al estado Nueva.`,
      confirmText: 'Reiniciar a Nueva',
      cancelText: 'Cancelar',
      isDestructive: true
    });

    if (ok) {
      const nextState = resetFsrsCard(appState, item.id, item.category);
      if (onUpdateState) {
        onUpdateState(nextState);
      }
      // Actualizar tarjeta inspeccionada con estado limpio
      setInspectingItem(prev => prev ? {
        ...prev,
        hasCard: false,
        state: FSRSState.NEW,
        stateInfo: getCardStateInfo(FSRSState.NEW),
        reps: 0,
        lapses: 0,
        stability: 0,
        difficulty: 0,
        retrievability: { raw: 0, percent: 0, formatted: '0%' },
        card: { due: new Date().toISOString(), stability: 0, difficulty: 0, reps: 0, lapses: 0, state: 0 }
      } : null);

      if (showAlert) {
        showAlert({
          title: 'Tarjeta Reiniciada',
          message: 'La tarjeta ha sido restablecida al estado inicial con éxito.',
          type: 'success'
        });
      }
    }
  };

  // Acción rápida para practicar item inspeccionado
  const handlePracticeItem = (item) => {
    if (!item) return;
    setInspectingItem(null);
    if (item.category === 'kanji' && onNavigate) {
      const rawKanji = item.id.replace('kanji_', '');
      onNavigate('kanji', rawKanji);
    } else if (item.category === 'jlpt' && onNavigate) {
      onNavigate('jlpt');
    } else if (item.category === 'vocab' && onNavigate) {
      onNavigate('vocab');
    } else if (onOpenDailyGoal) {
      onOpenDailyGoal();
    }
  };

  // Color dinámico de retención
  const getRetrievabilityColor = (percent) => {
    if (percent >= 85) return 'var(--success, #10b981)';
    if (percent >= 70) return 'var(--accent, #f59e0b)';
    return 'var(--danger, #ef4444)';
  };

  // Color dinámico de dificultad FSRS (1 a 10)
  const getDifficultyColor = (diff) => {
    if (diff < 4) return 'var(--success, #10b981)';
    if (diff <= 7) return 'var(--accent, #f59e0b)';
    return 'var(--danger, #ef4444)';
  };

  return (
    <div className="fsrs-stats-module" style={{ marginBottom: 32 }}>
      {/* HEADER DEL MÓDULO FSRS */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div 
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(168, 85, 247, 0.18) 100%)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)'
            }}
          >
            <Brain size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Motor de Repaso Espaciado FSRS</span>
              <span 
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary)',
                  fontWeight: 700
                }}
              >
                FSRS v5 Algorithm
              </span>
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Seguimiento científico de la memoria, curvas de olvido y programación inteligente de repasos.
            </p>
          </div>
        </div>

        {/* Botón de acción rápida: Repasar tarjetas pendientes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {overview.dueCount > 0 && onOpenDailyGoal && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenDailyGoal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.28)'
              }}
            >
              <Zap size={16} />
              <span>Repasar {overview.dueCount} Pendientes</span>
            </button>
          )}
        </div>
      </div>

      {/* METRIC KPIS GRID */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 24
        }}
      >
        {/* Retención Promedio R */}
        <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Retención Estimada (R)
            </span>
            <TrendingUp size={16} style={{ color: getRetrievabilityColor(Number(overview.avgRetrievability)) }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: getRetrievabilityColor(Number(overview.avgRetrievability)) }}>
            {overview.reviewedCardsCount > 0 ? `${overview.avgRetrievability}%` : '—'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Probabilidad de recuerdo actual
          </div>
        </div>

        {/* Estabilidad Promedio S */}
        <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Estabilidad Media (S)
            </span>
            <Clock size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
            {overview.reviewedCardsCount > 0 ? `${overview.avgStability} d` : '—'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Vida media del recuerdo
          </div>
        </div>

        {/* Dificultad Media D */}
        <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Dificultad Media (D)
            </span>
            <BarChart2 size={16} style={{ color: getDifficultyColor(Number(overview.avgDifficulty)) }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: getDifficultyColor(Number(overview.avgDifficulty)) }}>
            {overview.reviewedCardsCount > 0 ? `${overview.avgDifficulty}/10` : '—'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Esfuerzo promedio de retención
          </div>
        </div>

        {/* Tarjetas Pendientes Hoy */}
        <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Pendientes Hoy (Due)
            </span>
            <Calendar size={16} style={{ color: overview.dueCount > 0 ? 'var(--accent)' : 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: overview.dueCount > 0 ? 'var(--accent)' : 'var(--success)' }}>
            {overview.dueCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
            De {overview.totalCards} tarjetas en FSRS
          </div>
        </div>

        {/* Tasa de Acierto / Fallos */}
        <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Tasa de Éxito
            </span>
            <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {overview.retentionRate}%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {overview.totalReps} repasos · {overview.totalLapses} olvidos
          </div>
        </div>

        {/* Puntos Débiles (Leeches) */}
        <div className="card" style={{ padding: '16px 18px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Leeches (Puntos Débiles)
            </span>
            <ShieldAlert size={16} style={{ color: overview.leechesCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: overview.leechesCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
            {overview.leechesCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {overview.leechesCount > 0 ? 'Preguntas con tropiezos frecuentes' : 'Sin fallos reiterados'}
          </div>
        </div>
      </div>

      {/* PESTAÑAS DE SUB-SECCIÓN */}
      <div 
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--border)',
          marginBottom: 20,
          overflowX: 'auto',
          paddingBottom: 4
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeSubTab === 'overview' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
            color: activeSubTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <BarChart2 size={16} />
          <span>Resumen & Gráficos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('topics')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeSubTab === 'topics' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
            color: activeSubTab === 'topics' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Layers size={16} />
          <span>Por Temas & Niveles JLPT</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('explorer')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeSubTab === 'explorer' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
            color: activeSubTab === 'explorer' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Search size={16} />
          <span>Listado & Análisis de Preguntas ({allCompiledItems.length})</span>
        </button>
      </div>

      {/* SUB-VISTA 1: RESUMEN GENERAL & GRÁFICOS */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Distribución de Estados FSRS */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🧠 Distribución de Estados en Memoria</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                ({overview.totalCards} tarjetas registradas)
              </span>
            </h4>

            {/* Barra de progreso combinada */}
            <div 
              style={{
                height: 12,
                borderRadius: 6,
                background: 'var(--border)',
                display: 'flex',
                overflow: 'hidden',
                marginBottom: 16
              }}
            >
              {overview.totalCards > 0 ? (
                <>
                  <div 
                    style={{ 
                      width: `${(overview.stateCounts.new / overview.totalCards) * 100}%`, 
                      background: 'var(--primary, #6366f1)' 
                    }} 
                    title={`Nuevas: ${overview.stateCounts.new}`}
                  />
                  <div 
                    style={{ 
                      width: `${(overview.stateCounts.learning / overview.totalCards) * 100}%`, 
                      background: 'var(--accent, #f59e0b)' 
                    }} 
                    title={`Aprendizaje: ${overview.stateCounts.learning}`}
                  />
                  <div 
                    style={{ 
                      width: `${(overview.stateCounts.review / overview.totalCards) * 100}%`, 
                      background: 'var(--success, #10b981)' 
                    }} 
                    title={`En Repaso: ${overview.stateCounts.review}`}
                  />
                  <div 
                    style={{ 
                      width: `${(overview.stateCounts.relearning / overview.totalCards) * 100}%`, 
                      background: 'var(--danger, #ef4444)' 
                    }} 
                    title={`Reaprendizaje: ${overview.stateCounts.relearning}`}
                  />
                </>
              ) : (
                <div style={{ width: '100%', background: 'var(--border)' }} />
              )}
            </div>

            {/* Badges de desglose */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>🆕 Nuevas</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 2 }}>{overview.stateCounts.new}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sin repasar aún</div>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>🧠 Aprendiendo</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 2 }}>{overview.stateCounts.learning}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fase inicial</div>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>🔄 En Repaso</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 2 }}>{overview.stateCounts.review}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Memoria a largo plazo</div>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 600 }}>⚠️ Reaprendizaje</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 2 }}>{overview.stateCounts.relearning}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Reiniciadas tras olvido</div>
              </div>
            </div>
          </div>

          {/* Pronóstico de Repasos a 14 Días (Forecast) */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📅 Pronóstico de Carga de Repaso (Próximos 14 Días)</span>
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Distribución temporal programada por el algoritmo FSRS.
                </div>
              </div>
            </div>

            {/* Gráfico de barras horizontal/vertical CSS */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(10, 1fr)',
                gap: 8,
                alignItems: 'flex-end',
                minHeight: 140,
                paddingTop: 24,
                paddingBottom: 8,
                borderBottom: '1px solid var(--border)'
              }}
            >
              {(() => {
                const maxCount = Math.max(...overview.forecast.map(f => f.count), 1);
                return overview.forecast.map((b) => {
                  const heightPercent = Math.max((b.count / maxCount) * 100, 6);
                  return (
                    <div 
                      key={b.key} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: 6,
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: b.isToday && b.count > 0 ? 'var(--accent)' : 'var(--text-main)' }}>
                        {b.count}
                      </span>
                      <div 
                        style={{
                          width: '100%',
                          maxWidth: 32,
                          height: `${heightPercent}%`,
                          borderRadius: '4px 4px 0 0',
                          background: b.isToday 
                            ? (b.count > 0 ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)' : 'var(--border)')
                            : 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)',
                          boxShadow: b.count > 0 ? '0 2px 6px rgba(99, 102, 241, 0.2)' : 'none',
                          transition: 'height 0.3s ease'
                        }}
                      />
                      <span 
                        style={{ 
                          fontSize: '0.68rem', 
                          color: b.isToday ? 'var(--accent)' : 'var(--text-muted)', 
                          fontWeight: b.isToday ? 800 : 500,
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%'
                        }}
                      >
                        {b.label}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Distribución de la Estabilidad (Vida del recuerdo) */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⏳ Salud y Madurez de la Memoria (Estabilidad S)</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <div style={{ padding: '12px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Inestable (&lt; 1 día)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 2, color: 'var(--danger)' }}>
                  {overview.stabilityStages.unstable}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Requiere repaso inmediato</div>
              </div>

              <div style={{ padding: '12px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Corto Plazo (1-7 días)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 2, color: 'var(--accent)' }}>
                  {overview.stabilityStages.short}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Afianzando recuerdo</div>
              </div>

              <div style={{ padding: '12px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mediano Plazo (8-30 días)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 2, color: 'var(--primary)' }}>
                  {overview.stabilityStages.medium}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Memoria sólida</div>
              </div>

              <div style={{ padding: '12px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Largo Plazo (31-90 días)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 2, color: 'var(--success)' }}>
                  {overview.stabilityStages.long}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Excelente retención</div>
              </div>

              <div style={{ padding: '12px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Consolidada (&gt; 90 días)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 2, color: '#8b5cf6' }}>
                  {overview.stabilityStages.mature}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Memoria permanente</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VISTA 2: POR TEMAS & NIVELES JLPT */}
      {activeSubTab === 'topics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Tarjetas por Temas */}
          <div>
            <h4 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏷️ Rendimiento FSRS por Áreas de Estudio</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              {overview.topics.map(t => (
                <div 
                  key={t.id} 
                  className="card" 
                  style={{ 
                    padding: '16px 18px', 
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.3rem' }}>{t.icon}</span>
                        <strong style={{ fontSize: '1rem' }}>{t.label}</strong>
                      </div>
                      <span 
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontWeight: 700,
                          background: t.due > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: t.due > 0 ? 'var(--accent)' : 'var(--success)'
                        }}
                      >
                        {t.due > 0 ? `${t.due} pendientes` : 'Al día'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tarjetas en FSRS</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{t.total}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Retención Media</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: t.avgRetrievability !== '—' ? getRetrievabilityColor(Number(t.avgRetrievability)) : 'var(--text-muted)' }}>
                          {t.avgRetrievability !== '—' ? `${t.avgRetrievability}%` : '—'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Estabilidad (S)</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                          {t.avgStability !== '—' ? `${t.avgStability} d` : '—'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tasa de Acierto</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                          {t.reps > 0 ? `${t.retentionRate}%` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setFilterCategory(t.id);
                      setActiveSubTab('explorer');
                    }}
                    style={{ marginTop: 14, width: '100%', fontSize: '0.82rem' }}
                  >
                    Ver preguntas de {t.label} →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla Comparativa de Niveles Oficiales JLPT (N5 a N1) */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🎯 Desglose por Estándar Oficial de Niveles JLPT (N5 a N1)</span>
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>Nivel JLPT</th>
                    <th style={{ padding: '10px 12px' }}>Tarjetas FSRS</th>
                    <th style={{ padding: '10px 12px' }}>Pendientes Hoy</th>
                    <th style={{ padding: '10px 12px' }}>Retención Media (R)</th>
                    <th style={{ padding: '10px 12px' }}>Dificultad (D)</th>
                    <th style={{ padding: '10px 12px' }}>Estabilidad (S)</th>
                    <th style={{ padding: '10px 12px' }}>Tasa Éxito</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.levels.map(l => (
                    <tr key={l.level} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}>
                        <span 
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            background: l.level === 'N5' ? 'rgba(16, 185, 129, 0.15)' : l.level === 'N4' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                            color: l.level === 'N5' ? 'var(--success)' : l.level === 'N4' ? '#3b82f6' : 'var(--primary)'
                          }}
                        >
                          {l.level}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>{l.total}</td>
                      <td style={{ padding: '12px' }}>
                        {l.due > 0 ? (
                          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{l.due}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>0</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: l.avgRetrievability !== '—' ? getRetrievabilityColor(Number(l.avgRetrievability)) : 'var(--text-muted)' }}>
                        {l.avgRetrievability !== '—' ? `${l.avgRetrievability}%` : '—'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {l.avgDifficulty !== '—' ? `${l.avgDifficulty}/10` : '—'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {l.avgStability !== '—' ? `${l.avgStability} d` : '—'}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>
                        {l.reps > 0 ? `${l.retentionRate}%` : '—'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setFilterLevel(l.level);
                            setActiveSubTab('explorer');
                          }}
                          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                        >
                          Explorar {l.level}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VISTA 3: LISTADO & ANÁLISIS DE PREGUNTAS */}
      {activeSubTab === 'explorer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* BARRA DE FILTROS Y CONTROLES */}
          <div 
            className="card" 
            style={{ 
              padding: '16px', 
              background: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            {/* Buscador y alcance */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar por pregunta, kanji, palabra o significado..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filtro de Alcance: Solo activas vs Todo */}
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-main)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => { setFilterScope('all'); setCurrentPage(1); }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: filterScope === 'all' ? 'var(--primary)' : 'transparent',
                    color: filterScope === 'all' ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Todo el Catálogo ({allCompiledItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterScope('active'); setCurrentPage(1); }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: filterScope === 'active' ? 'var(--primary)' : 'transparent',
                    color: filterScope === 'active' ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  En FSRS ({overview.totalCards})
                </button>
              </div>
            </div>

            {/* Selectores de filtrado rápido */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Tema */}
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem'
                }}
              >
                <option value="all">Todos los Temas</option>
                <option value="jlpt">Exámenes JLPT</option>
                <option value="kanji">Kanjis</option>
                <option value="vocab">Vocabulario</option>
                <option value="grammar">Gramática</option>
              </select>

              {/* Nivel JLPT (estándar oficial N5 a N1) */}
              <select
                value={filterLevel}
                onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem'
                }}
              >
                <option value="all">Todos los Niveles</option>
                <option value="N5">Nivel N5</option>
                <option value="N4">Nivel N4</option>
                <option value="N3">Nivel N3</option>
                <option value="N2">Nivel N2</option>
                <option value="N1">Nivel N1</option>
              </select>

              {/* Estado FSRS */}
              <select
                value={filterState}
                onChange={(e) => { setFilterState(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem'
                }}
              >
                <option value="all">Todos los Estados</option>
                <option value="due">⏰ Vencidas Hoy (Due)</option>
                <option value="learning">🧠 Aprendizaje</option>
                <option value="review">🔄 En Repaso</option>
                <option value="relearning">⚠️ Reaprendizaje</option>
                <option value="leech">🚨 Leeches (Críticas)</option>
                <option value="new">🆕 Nuevas</option>
              </select>

              {/* Ordenación */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ArrowUpDown size={15} style={{ color: 'var(--text-muted)' }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.84rem'
                  }}
                >
                  <option value="urgent">Más urgentes / Vencimiento</option>
                  <option value="ret_asc">Menor probabilidad de recuerdo (R)</option>
                  <option value="diff_desc">Mayor dificultad (D)</option>
                  <option value="lapses_desc">Más fallos acumulados</option>
                  <option value="stab_desc">Mayor estabilidad (S)</option>
                  <option value="recent">Repasadas recientemente</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLA / LISTA DE PREGUNTAS */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>Pregunta / Ítem</th>
                    <th style={{ padding: '12px 12px' }}>Tema & Nivel</th>
                    <th style={{ padding: '12px 12px' }}>Estado FSRS</th>
                    <th style={{ padding: '12px 12px' }}>Retención (R)</th>
                    <th style={{ padding: '12px 12px' }}>Estabilidad (S)</th>
                    <th style={{ padding: '12px 12px' }}>Dificultad (D)</th>
                    <th style={{ padding: '12px 12px' }}>Repasos / Fallos</th>
                    <th style={{ padding: '12px 12px' }}>Próximo Repaso</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🔍</div>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>No se encontraron preguntas con estos filtros</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '0.84rem' }}>
                          Intenta ajustar la búsqueda, nivel JLPT o estado FSRS seleccionado.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map(item => (
                      <tr 
                        key={item.id} 
                        style={{ 
                          borderBottom: '1px solid var(--border)',
                          transition: 'background 0.15s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => setInspectingItem(item)}
                        className="fsrs-table-row"
                      >
                        {/* Pregunta / Título */}
                        <td style={{ padding: '12px 16px', maxWidth: 300 }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35 }}>
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {item.subtitle}
                            </div>
                          )}
                        </td>

                        {/* Tema & Nivel */}
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span 
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontWeight: 700,
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: 'var(--primary)'
                              }}
                            >
                              {item.categoryLabel}
                            </span>
                            <span 
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontWeight: 800,
                                background: item.level === 'N5' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                color: item.level === 'N5' ? 'var(--success)' : '#3b82f6'
                              }}
                            >
                              {item.level}
                            </span>
                          </div>
                        </td>

                        {/* Estado FSRS */}
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '0.74rem',
                                padding: '3px 8px',
                                borderRadius: 6,
                                fontWeight: 700,
                                background: item.stateInfo.bg,
                                color: item.stateInfo.color
                              }}
                            >
                              {item.stateInfo.name}
                            </span>
                            {item.isDue && (
                              <span 
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  fontWeight: 800,
                                  background: 'rgba(245, 158, 11, 0.2)',
                                  color: 'var(--accent)'
                                }}
                              >
                                VENCE HOY
                              </span>
                            )}
                            {item.isLeech && (
                              <span 
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  fontWeight: 800,
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  color: 'var(--danger)'
                                }}
                              >
                                LEECH
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Retención R */}
                        <td style={{ padding: '12px 12px' }}>
                          {item.hasCard && item.reps > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 800, color: getRetrievabilityColor(item.retrievability.percent) }}>
                                {item.retrievability.formatted}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Estabilidad S */}
                        <td style={{ padding: '12px 12px' }}>
                          {item.hasCard && item.reps > 0 ? (
                            <span style={{ fontWeight: 600 }}>{item.stability} d</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Dificultad D */}
                        <td style={{ padding: '12px 12px' }}>
                          {item.hasCard && item.reps > 0 ? (
                            <span style={{ fontWeight: 600, color: getDifficultyColor(item.difficulty) }}>
                              {item.difficulty}/10
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Repasos / Fallos */}
                        <td style={{ padding: '12px 12px' }}>
                          {item.hasCard ? (
                            <span style={{ fontSize: '0.82rem' }}>
                              <strong>{item.reps}</strong> rep · <span style={{ color: item.lapses > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{item.lapses} err</span>
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Sin repasar</span>
                          )}
                        </td>

                        {/* Próximo Repaso */}
                        <td style={{ padding: '12px 12px' }}>
                          {item.hasCard ? (
                            <div style={{ fontSize: '0.82rem' }}>
                              {item.isDue ? (
                                <strong style={{ color: 'var(--accent)' }}>Hoy / Pendiente</strong>
                              ) : item.daysUntilDue === 1 ? (
                                <span>Mañana</span>
                              ) : item.daysUntilDue > 1 ? (
                                <span>En {item.daysUntilDue} días</span>
                              ) : (
                                <span>Hoy</span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>No programada</span>
                          )}
                        </td>

                        {/* Botón Acción */}
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingItem(item);
                            }}
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          >
                            <Eye size={13} />
                            <span>Inspeccionar</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginador */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-main)',
                flexWrap: 'wrap',
                gap: 12
              }}
            >
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Mostrando {filteredItems.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} de {filteredItems.length} ítems
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  style={{ padding: '4px 8px' }}
                >
                  <ChevronLeft size={16} />
                </button>

                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  style={{ padding: '4px 8px' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSPECTOR FSRS */}
      {inspectingItem && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
          onClick={() => setInspectingItem(null)}
        >
          <div 
            className="card"
            style={{
              width: '100%',
              maxWidth: 620,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
              borderRadius: 16,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span 
                    style={{
                      fontSize: '0.74rem',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontWeight: 800,
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary)'
                    }}
                  >
                    {inspectingItem.categoryLabel}
                  </span>
                  <span 
                    style={{
                      fontSize: '0.74rem',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontWeight: 800,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--success)'
                    }}
                  >
                    {inspectingItem.level}
                  </span>
                  <span 
                    style={{
                      fontSize: '0.74rem',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontWeight: 700,
                      background: inspectingItem.stateInfo.bg,
                      color: inspectingItem.stateInfo.color
                    }}
                  >
                    {inspectingItem.stateInfo.name}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  Inspector de Tarjeta FSRS
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido / Pregunta completa */}
            <div 
              style={{
                padding: '16px',
                borderRadius: 12,
                background: 'var(--bg-main)',
                border: '1px solid var(--border)',
                marginBottom: 18
              }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>
                {inspectingItem.title}
              </div>

              {inspectingItem.subtitle && (
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  {inspectingItem.subtitle}
                </div>
              )}

              {/* Opciones si es pregunta */}
              {Array.isArray(inspectingItem.options) && inspectingItem.options.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {inspectingItem.options.map((opt, i) => {
                    const isCorrect = opt === inspectingItem.correctAnswer;
                    return (
                      <div 
                        key={i} 
                        style={{
                          padding: '8px 12px',
                          borderRadius: 6,
                          fontSize: '0.86rem',
                          background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                          border: `1px solid ${isCorrect ? 'var(--success)' : 'var(--border)'}`,
                          fontWeight: isCorrect ? 700 : 500,
                          color: isCorrect ? 'var(--success)' : 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{i + 1}. {opt}</span>
                        {isCorrect && <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Explicación didáctica */}
              {inspectingItem.explanation && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--text-main)' }}>Explicación:</strong> {inspectingItem.explanation}
                </div>
              )}
            </div>

            {/* Diagnóstico Matemático FSRS */}
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                📊 Estado de Memoria y Algoritmo
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div style={{ padding: '10px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Retención (R)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: getRetrievabilityColor(inspectingItem.retrievability.percent), marginTop: 2 }}>
                    {inspectingItem.hasCard && inspectingItem.reps > 0 ? inspectingItem.retrievability.formatted : '—'}
                  </div>
                </div>

                <div style={{ padding: '10px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Estabilidad (S)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                    {inspectingItem.hasCard && inspectingItem.reps > 0 ? `${inspectingItem.stability} d` : '—'}
                  </div>
                </div>

                <div style={{ padding: '10px', borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dificultad (D)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: getDifficultyColor(inspectingItem.difficulty), marginTop: 2 }}>
                    {inspectingItem.hasCard && inspectingItem.reps > 0 ? `${inspectingItem.difficulty}/10` : '—'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: 8 }}>
                <div>Repasos realizados: <strong>{inspectingItem.reps}</strong></div>
                <div>Lapsos / Olvidos: <strong style={{ color: inspectingItem.lapses > 0 ? 'var(--danger)' : 'inherit' }}>{inspectingItem.lapses}</strong></div>
                <div>Próxima revisión: <strong>{inspectingItem.isDue ? 'Hoy' : (inspectingItem.daysUntilDue > 0 ? `En ${inspectingItem.daysUntilDue} días` : 'No programada')}</strong></div>
              </div>
            </div>

            {/* SIMULADOR EN VIVO DE PRÓXIMO REPASO */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={15} style={{ color: 'var(--accent)' }} />
                <span>Simulador de Intervalos FSRS (Próximo Salto)</span>
              </h4>
              <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Si calificaras esta tarjeta hoy, FSRS programaría el siguiente repaso en:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <div style={{ padding: '10px 8px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 700 }}>Otra vez</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: 2 }}>
                    {inspectorIntervals?.[SRSRating.AGAIN] || '< 10m'}
                  </div>
                </div>

                <div style={{ padding: '10px 8px', borderRadius: 8, background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700 }}>Difícil</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: 2 }}>
                    {inspectorIntervals?.[SRSRating.HARD] || '1d'}
                  </div>
                </div>

                <div style={{ padding: '10px 8px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700 }}>Bien</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: 2 }}>
                    {inspectorIntervals?.[SRSRating.GOOD] || '3d'}
                  </div>
                </div>

                <div style={{ padding: '10px 8px', borderRadius: 8, background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 700 }}>Fácil</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: 2 }}>
                    {inspectorIntervals?.[SRSRating.EASY] || '7d'}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTONES DE GESTIÓN DEL MODAL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              {inspectingItem.hasCard ? (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleResetCard(inspectingItem)}
                  style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <RotateCcw size={14} />
                  <span>Reiniciar Tarjeta a Nueva</span>
                </button>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Aún no tiene historial de repaso
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setInspectingItem(null)}
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handlePracticeItem(inspectingItem)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Play size={14} />
                  <span>Practicar Ahora</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
