'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  PenTool, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Grid, 
  Brain, 
  Star, 
  Volume2, 
  Check, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useApp } from '../../lib/AppContext';
import { 
  getScriptpadUnits, 
  getLessonById, 
  getLessonStatus, 
  recordLessonCompletion, 
  getScriptpadSrsQueue 
} from '../../lib/scriptpadData';
import { getNewCard } from '../../lib/srs';

// Modos de estudio con loading visual elegante
const ScriptpadWriter = dynamic(() => import('../features/ScriptpadWriter'), { 
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Cargando lienzo táctil de escritura...</p>
    </div>
  )
});
const ScriptpadFlashcards = dynamic(() => import('../features/ScriptpadFlashcards'), { 
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Cargando tarjetas Flashcards...</p>
    </div>
  )
});
const ScriptpadWordMatch = dynamic(() => import('../features/ScriptpadWordMatch'), { 
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Cargando Word Match...</p>
    </div>
  )
});
const ScriptpadSrsReview = dynamic(() => import('../features/ScriptpadSrsReview'), { 
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Cargando Repaso SRS...</p>
    </div>
  )
});

export default function ScriptpadTab({
  appState: propAppState,
  onUpdateState: propOnUpdateState,
  initialUnitId = null,
  initialLessonId = null,
  initialMode = null
}) {
  const contextApp = useApp();
  const appState = propAppState || contextApp?.appState || {};
  const onUpdateState = propOnUpdateState || contextApp?.handleUpdateState;

  // Filtros de navegación
  const [activeTab, setActiveTab] = useState('thematic'); // 'thematic' | 'curriculum'
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'N5' | 'N4' | 'N3'

  // Navegación de unidades y lecciones
  const [selectedUnitId, setSelectedUnitId] = useState(initialUnitId);
  const [expandedLessonId, setExpandedLessonId] = useState(initialLessonId);

  // Modo activo de estudio: null | 'write' | 'flashcards' | 'match' | 'srs'
  const [activeMode, setActiveMode] = useState(initialMode);
  const [activeLesson, setActiveLesson] = useState(null);

  // Restaurar estado si se recarga la página o se navega con query params
  useEffect(() => {
    let unitId = initialUnitId;
    let lessonId = initialLessonId;
    let mode = initialMode;

    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (!unitId && sp.get('unit')) unitId = sp.get('unit');
      if (!lessonId && sp.get('lesson')) lessonId = sp.get('lesson');
      if (!mode && sp.get('mode')) mode = sp.get('mode');

      // Si no hay parámetros en la URL, revisar localStorage por si hubo una recarga sin query
      if (!unitId && !lessonId && !mode) {
        try {
          const saved = JSON.parse(localStorage.getItem('nihongo_scriptpad_active') || '{}');
          if (saved.lessonId) lessonId = saved.lessonId;
          if (saved.unitId) unitId = saved.unitId;
          if (saved.mode) mode = saved.mode;
        } catch (e) {}
      }
    }

    if (lessonId) {
      const lesson = getLessonById(lessonId);
      if (lesson) {
        setActiveLesson(lesson);
        if (mode) setActiveMode(mode);
        if (lesson.unitId) {
          setSelectedUnitId(lesson.unitId);
          if (lesson.unitId.startsWith('curriculum-mod-')) {
            setActiveTab('curriculum');
          }
        }
        setExpandedLessonId(lesson.id);
        return;
      }
    }

    if (unitId) {
      setSelectedUnitId(unitId);
      if (unitId.startsWith('curriculum-mod-')) {
        setActiveTab('curriculum');
      }
    }

    if (mode === 'srs') {
      setActiveMode('srs');
    }
  }, [initialUnitId, initialLessonId, initialMode]);

  // Sincronizar URL y localStorage ante cualquier cambio de navegación
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (selectedUnitId) params.set('unit', selectedUnitId);
    if (activeLesson?.id) params.set('lesson', activeLesson.id);
    if (activeMode) params.set('mode', activeMode);

    const queryString = params.toString();
    const targetUrl = queryString ? `/scriptpad?${queryString}` : '/scriptpad';

    if (window.location.pathname + window.location.search !== targetUrl) {
      window.history.replaceState(null, '', targetUrl);
    }

    try {
      if (selectedUnitId || activeLesson?.id || activeMode) {
        localStorage.setItem('nihongo_scriptpad_active', JSON.stringify({
          unitId: selectedUnitId || null,
          lessonId: activeLesson?.id || null,
          mode: activeMode || null
        }));
      } else {
        localStorage.removeItem('nihongo_scriptpad_active');
      }
    } catch (e) {}
  }, [selectedUnitId, activeLesson, activeMode]);

  // Obtener unidades filtradas
  const units = useMemo(() => {
    return getScriptpadUnits(levelFilter, activeTab === 'curriculum' ? 'curriculum' : 'all');
  }, [levelFilter, activeTab]);

  // Unidad actualmente seleccionada (con fallback en caso de cambio de pestaña o filtro)
  const selectedUnit = useMemo(() => {
    if (!selectedUnitId) return null;
    const found = units.find(u => u.id === selectedUnitId);
    if (found) return found;

    // Búsqueda en todas las unidades si no coincide con los filtros actuales
    const allUnits = getScriptpadUnits('all', selectedUnitId.startsWith('curriculum-mod-') ? 'curriculum' : 'all');
    return allUnits.find(u => u.id === selectedUnitId) || null;
  }, [units, selectedUnitId]);

  // Cola de repaso SRS de escritura
  const srsQueue = useMemo(() => {
    return getScriptpadSrsQueue(appState, 20);
  }, [appState]);

  // Iniciar estudio de una lección en un modo específico
  const handleStartStudy = (lesson, mode) => {
    setActiveLesson(lesson);
    setActiveMode(mode);
    if (lesson?.unitId) {
      setSelectedUnitId(lesson.unitId);
    }
  };

  // Finalizar lección y guardar progreso en appState y Supabase
  const handleCompleteStudy = (stats) => {
    if (activeLesson && onUpdateState) {
      recordLessonCompletion(activeLesson.id, stats, appState, onUpdateState);
    }
  };

  const handleCloseStudy = () => {
    setActiveMode(null);
    setActiveLesson(null);
  };

  // ==========================================
  // RENDERIZADO DE MODOS DE ESTUDIO ACTIVOS
  // ==========================================
  if (activeMode === 'write' && activeLesson) {
    return (
      <div className="section-panel active" style={{ padding: '20px 12px 140px', overflowY: 'auto' }}>
        <ScriptpadWriter
          lesson={activeLesson}
          onClose={handleCloseStudy}
          onComplete={handleCompleteStudy}
          appState={appState}
          onUpdateState={onUpdateState}
        />
      </div>
    );
  }

  if (activeMode === 'flashcards' && activeLesson) {
    return (
      <div className="section-panel active" style={{ padding: '20px 12px 140px', overflowY: 'auto' }}>
        <ScriptpadFlashcards
          lesson={activeLesson}
          onClose={handleCloseStudy}
          onComplete={handleCompleteStudy}
          appState={appState}
          onUpdateState={onUpdateState}
        />
      </div>
    );
  }

  if (activeMode === 'match' && activeLesson) {
    return (
      <div className="section-panel active" style={{ padding: '20px 12px 140px', overflowY: 'auto' }}>
        <ScriptpadWordMatch
          lesson={activeLesson}
          onClose={handleCloseStudy}
          onComplete={handleCompleteStudy}
          appState={appState}
          onUpdateState={onUpdateState}
        />
      </div>
    );
  }

  if (activeMode === 'srs') {
    const queueToReview = (activeLesson && Array.isArray(activeLesson.words) && activeLesson.words.length > 0)
      ? activeLesson.words.map(w => ({
          ...w,
          cardKey: `sp_write_${w.kanji || w.hiragana || w.id}`,
          card: appState?.srsQuestions?.[`sp_write_${w.kanji || w.hiragana || w.id}`] || getNewCard(),
          isNew: !appState?.srsQuestions?.[`sp_write_${w.kanji || w.hiragana || w.id}`]
        }))
      : srsQueue;

    return (
      <div className="section-panel active" style={{ padding: '20px 12px 140px', overflowY: 'auto' }}>
        <ScriptpadSrsReview
          queue={queueToReview}
          onClose={handleCloseStudy}
          onComplete={handleCompleteStudy}
          appState={appState}
          onUpdateState={onUpdateState}
        />
      </div>
    );
  }

  // ==========================================
  // VISTA 2: DETALLE DE UNIDAD Y LECCIONES (ESTILO SCREENSHOTS 2, 3, 4)
  // ==========================================
  if (selectedUnit) {
    return (
      <div className="section-panel active" style={{ maxWidth: 650, margin: '0 auto', padding: '16px 8px' }}>
        {/* Barra de cabecera con botón de retorno */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setSelectedUnitId(null)}
            className="btn btn-outline btn-sm"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Volver a unidades"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            {selectedUnit.title}
          </h2>
        </div>

        {/* Tarjeta Banner de la Unidad (como en Screenshot 2) */}
        <div style={{
          background: selectedUnit.bg_gradient || 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          borderRadius: 22,
          padding: '20px 22px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          marginBottom: 20,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
        }}>
          <div style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 900,
            flexShrink: 0
          }}>
            {selectedUnit.kanji_icon}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0' }}>
              {selectedUnit.title}
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.35 }}>
              {selectedUnit.subtitle}
            </p>
            <span style={{
              display: 'inline-block',
              marginTop: 6,
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'rgba(255,255,255,0.25)',
              padding: '2px 8px',
              borderRadius: 8
            }}>
              {selectedUnit.lessons.length} lecciones • {selectedUnit.total_words} palabras
            </span>
          </div>
        </div>

        {/* Lista de Lecciones Desplegables (Acordeón) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {selectedUnit.lessons.map((lesson) => {
            const isExpanded = expandedLessonId === lesson.id;
            const status = getLessonStatus(lesson.id, appState);
            const completedModes = status.completedModes || [];
            const isWriteDone = completedModes.includes('write');
            const isFlashDone = completedModes.includes('flashcards');
            const isMatchDone = completedModes.includes('match');
            const isSrsDone = completedModes.includes('srs');

            return (
              <div 
                key={lesson.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: isExpanded ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 18,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  boxShadow: isExpanded ? '0 6px 20px rgba(99, 102, 241, 0.15)' : 'var(--shadow-sm)'
                }}
              >
                {/* Cabecera de la Lección */}
                <div 
                  onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)}
                  style={{
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Badge numérico o de completado */}
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: status.isCompleted 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                        : (isExpanded ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-main)'),
                      color: status.isCompleted ? '#fff' : (isExpanded ? 'var(--primary)' : 'var(--text-main)'),
                      border: status.isCompleted ? 'none' : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {status.isCompleted ? <Check size={20} strokeWidth={3} /> : lesson.number}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          Lesson {lesson.number}: {lesson.title}
                        </span>
                        {status.isCompleted && (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            padding: '2px 8px',
                            borderRadius: 8,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <Check size={12} strokeWidth={3} /> Completada
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {lesson.words.length} palabras • {lesson.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {status.isCompleted && (
                      <div style={{ display: 'flex', gap: 2, color: '#f59e0b' }}>
                        {[...Array(status.stars || 3)].map((_, i) => (
                          <Star key={i} size={14} fill="#f59e0b" />
                        ))}
                      </div>
                    )}
                    <ChevronRight 
                      size={20} 
                      style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s ease',
                        color: 'var(--text-muted)'
                      }} 
                    />
                  </div>
                </div>

                {/* Bloque expandido: LEARN (Estilo exacto de Screenshot 2) */}
                {isExpanded && (
                  <div style={{
                    padding: '8px 18px 20px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--bg-main)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      margin: '12px 0 12px'
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 1.2
                      }}>
                        LEARN • Modos de Estudio
                      </div>
                      {completedModes.length > 0 && (
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <CheckCircle2 size={14} />
                          <span>{completedModes.length}/4 modos completados</span>
                        </div>
                      )}
                    </div>

                    {/* Tarjetas cuadradas de acción LEARN */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
                      gap: 12
                    }}>
                      {/* 1. ESCRIBIR (Write - Scriptpad) */}
                      <button
                        type="button"
                        onClick={() => handleStartStudy(lesson, 'write')}
                        style={{
                          position: 'relative',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                          border: isWriteDone ? '2px solid #10b981' : 'none',
                          borderRadius: 16,
                          padding: '16px 12px',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                          boxShadow: isWriteDone ? '0 4px 14px rgba(16, 185, 129, 0.35)' : '0 4px 14px rgba(139, 92, 246, 0.3)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        {isWriteDone && (
                          <div 
                            title="Modo completado"
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              background: '#10b981',
                              color: '#fff',
                              borderRadius: '50%',
                              width: 22,
                              height: 22,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                              border: '1.5px solid #fff'
                            }}
                          >
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: 'rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 900
                        }}>
                          あ
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Escribir ✍️</span>
                          {isWriteDone && (
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a7f3d0', marginTop: 2 }}>
                              ✓ Completado
                            </div>
                          )}
                        </div>
                      </button>

                      {/* 2. FLASHCARDS */}
                      <button
                        type="button"
                        onClick={() => handleStartStudy(lesson, 'flashcards')}
                        style={{
                          position: 'relative',
                          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                          border: isFlashDone ? '2px solid #10b981' : 'none',
                          borderRadius: 16,
                          padding: '16px 12px',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                          boxShadow: isFlashDone ? '0 4px 14px rgba(16, 185, 129, 0.35)' : '0 4px 14px rgba(6, 182, 212, 0.3)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        {isFlashDone && (
                          <div 
                            title="Modo completado"
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              background: '#10b981',
                              color: '#fff',
                              borderRadius: '50%',
                              width: 22,
                              height: 22,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                              border: '1.5px solid #fff'
                            }}
                          >
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: 'rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Layers size={20} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Flashcards</span>
                          {isFlashDone && (
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a7f3d0', marginTop: 2 }}>
                              ✓ Completado
                            </div>
                          )}
                        </div>
                      </button>

                      {/* 3. WORD MATCH */}
                      <button
                        type="button"
                        onClick={() => handleStartStudy(lesson, 'match')}
                        style={{
                          position: 'relative',
                          background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                          border: isMatchDone ? '2px solid #10b981' : 'none',
                          borderRadius: 16,
                          padding: '16px 12px',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                          boxShadow: isMatchDone ? '0 4px 14px rgba(16, 185, 129, 0.35)' : '0 4px 14px rgba(244, 63, 94, 0.3)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        {isMatchDone && (
                          <div 
                            title="Modo completado"
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              background: '#10b981',
                              color: '#fff',
                              borderRadius: '50%',
                              width: 22,
                              height: 22,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                              border: '1.5px solid #fff'
                            }}
                          >
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: 'rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Grid size={20} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Word Match</span>
                          {isMatchDone && (
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a7f3d0', marginTop: 2 }}>
                              ✓ Completado
                            </div>
                          )}
                        </div>
                      </button>

                      {/* 4. REPASO SRS */}
                      <button
                        type="button"
                        onClick={() => handleStartStudy(lesson, 'srs')}
                        style={{
                          position: 'relative',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          border: isSrsDone ? '2px solid #10b981' : 'none',
                          borderRadius: 16,
                          padding: '16px 12px',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                          boxShadow: isSrsDone ? '0 4px 14px rgba(16, 185, 129, 0.35)' : '0 4px 14px rgba(245, 158, 11, 0.3)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        {isSrsDone && (
                          <div 
                            title="Modo completado"
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              background: '#10b981',
                              color: '#fff',
                              borderRadius: '50%',
                              width: 22,
                              height: 22,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                              border: '1.5px solid #fff'
                            }}
                          >
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: 'rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Brain size={20} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Repaso SRS</span>
                          {isSrsDone && (
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a7f3d0', marginTop: 2 }}>
                              ✓ Completado
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA 1: CATÁLOGO DE UNIDADES PRINCIPALES (ESTILO SCREENSHOT 1)
  // ==========================================
  return (
    <div className="section-panel active" style={{ maxWidth: 680, margin: '0 auto', padding: '16px 8px' }}>
      {/* Hero Card */}
      <div className="module-hero-card" style={{ marginBottom: 18 }}>
        <div className="module-hero-content">
          <div className="module-hero-title-row">
            <div 
              className="module-hero-icon-badge" 
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)' }}
            >
              <PenTool size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="module-category-pill" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.12)' }}>
                  Escritura & Vocabulario
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Mobile-First Touchscreen ✍️
                </span>
              </div>
              <h1 className="module-hero-title">Scriptpad & Unidades</h1>
              <p className="module-hero-subtitle">
                Escribe palabras y kanji a mano en pantalla táctil con trazos guiados, caligrafía libre y repaso espaciado FSRS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón Destacado de Repaso SRS Inteligente (si hay palabras pendientes) */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <Brain size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Repaso SRS de Escritura (FSRS)
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {srsQueue.length > 0 
                ? `${srsQueue.length} palabras listas para practicar de memoria` 
                : '¡Al día con tus repasos de escritura!'}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setActiveMode('srs')}
          style={{ padding: '8px 16px', borderRadius: 12, fontWeight: 700 }}
        >
          <span>Practicar Repaso</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Pestañas de Track: Unidades Temáticas vs Currículum */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16
      }}>
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-surface)',
          padding: 3,
          borderRadius: 12,
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('thematic')}
            style={{
              padding: '6px 14px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'thematic' ? 700 : 500,
              background: activeTab === 'thematic' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'thematic' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Unidades Temáticas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            style={{
              padding: '6px 14px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'curriculum' ? 700 : 500,
              background: activeTab === 'curriculum' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'curriculum' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Ruta del Currículum
          </button>
        </div>

        {/* Filtros rápidos por nivel JLPT */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Nivel:</span>
          {['all', 'N5', 'N4', 'N3'].map(lvl => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevelFilter(lvl)}
              className={`btn ${levelFilter === lvl ? 'btn-primary' : 'btn-outline'} btn-sm`}
              style={{ padding: '3px 9px', fontSize: '0.75rem', borderRadius: 8, minWidth: 36 }}
            >
              {lvl === 'all' ? 'Todos' : lvl}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        fontSize: '0.75rem',
        fontWeight: 800,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 12
      }}>
        {activeTab === 'thematic' ? 'Vocabulary Units — Learn • Write' : 'Módulos del Currículum — Práctica de Vocabulario'}
      </div>

      {/* Lista de Unidades (Estilo exacto de Screenshot 1) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {units.map((unit) => (
          <div
            key={unit.id}
            onClick={() => setSelectedUnitId(unit.id)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Badge con ideograma kanji numérico */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: unit.color || '#6366f1',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 900,
                flexShrink: 0,
                boxShadow: `0 4px 14px ${unit.color ? unit.color + '44' : 'rgba(99, 102, 241, 0.3)'}`
              }}>
                {unit.kanji_icon}
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 3px 0', color: 'var(--text-main)' }}>
                  {unit.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {unit.subtitle}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 12
              }}>
                {unit.total_words} words
              </span>
              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
