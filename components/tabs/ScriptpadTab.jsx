'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  PenTool, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Layers, 
  Grid, 
  Brain, 
  Star, 
  Volume2, 
  Check, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useApp } from '../../lib/AppContext';
import audioManager from '../../lib/audioManager';
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
      <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cargando lienzo táctil de escritura...</p>
    </div>
  )
});
const ScriptpadFlashcards = dynamic(() => import('../features/ScriptpadFlashcards'), { 
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cargando tarjetas Flashcards...</p>
    </div>
  )
});
const ScriptpadWordMatch = dynamic(() => import('../features/ScriptpadWordMatch'), { 
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cargando Word Match...</p>
    </div>
  )
});
const ScriptpadSrsReview = dynamic(() => import('../features/ScriptpadSrsReview'), { 
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cargando Repaso SRS...</p>
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

  // Unidad actualmente seleccionada
  const selectedUnit = useMemo(() => {
    if (!selectedUnitId) return null;
    const found = units.find(u => u.id === selectedUnitId);
    if (found) return found;

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

  // Finalizar lección y guardar progreso
  const handleCompleteStudy = (stats) => {
    if (activeLesson && onUpdateState) {
      recordLessonCompletion(activeLesson.id, stats, appState, onUpdateState);
    }
  };

  const handleCloseStudy = () => {
    setActiveMode(null);
    setActiveLesson(null);
  };

  // Reproducir audio de palabra
  const handlePlayWordAudio = (e, word) => {
    e.stopPropagation();
    if (!word) return;
    if (typeof audioManager?.playWord === 'function') {
      audioManager.playWord(word);
    } else if (typeof audioManager?.speak === 'function') {
      audioManager.speak(word.hiragana || word.kana || word.kanji || '', {
        audioUrl: word.audio_url
      });
    }
  };

  // ==========================================
  // RENDERIZADO DE MODOS DE ESTUDIO ACTIVOS
  // ==========================================
  if (activeMode === 'write' && activeLesson) {
    return (
      <div className="section-panel active" style={{ width: '100%', maxWidth: 620, margin: '0 auto', padding: '12px 4px 140px', boxSizing: 'border-box' }}>
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
      <div className="section-panel active" style={{ width: '100%', maxWidth: 500, margin: '0 auto', padding: '12px 4px 140px', boxSizing: 'border-box' }}>
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
      <div className="section-panel active" style={{ width: '100%', maxWidth: 580, margin: '0 auto', padding: '12px 4px 140px', boxSizing: 'border-box' }}>
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
      <div className="section-panel active" style={{ width: '100%', maxWidth: 580, margin: '0 auto', padding: '12px 4px 140px', boxSizing: 'border-box' }}>
        <ScriptpadSrsReview
          queue={queueToReview}
          onClose={handleCloseStudy}
          appState={appState}
          onUpdateState={onUpdateState}
          onComplete={handleCompleteStudy}
        />
      </div>
    );
  }

  // ==========================================
  // VISTA 2: DETALLE DE UNIDAD Y LECCIONES (ESTILO SCREENSHOTS)
  // ==========================================
  if (selectedUnit) {
    return (
      <div className="section-panel active" style={{ maxWidth: 620, margin: '0 auto', padding: '12px 6px' }}>
        {/* Barra superior con botón volver y título de unidad */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button
            type="button"
            onClick={() => setSelectedUnitId(null)}
            className="btn btn-outline btn-sm"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            aria-label="Volver a unidades"
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{ overflow: 'hidden' }}>
            <h2 style={{ 
              fontSize: '1.05rem', 
              fontWeight: 800, 
              margin: 0, 
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {selectedUnit.title}
            </h2>
          </div>
        </div>

        {/* Tarjeta Banner de la Unidad (Estilo Screenshots de Referencia) */}
        <div style={{
          background: selectedUnit.bg_gradient || 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          borderRadius: 18,
          padding: '14px 16px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 16,
          boxShadow: '0 6px 18px rgba(0,0,0,0.16)'
        }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.45rem',
            fontWeight: 900,
            flexShrink: 0
          }}>
            {selectedUnit.kanji_icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '0.68rem', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: 0.8,
              opacity: 0.85,
              marginBottom: 2
            }}>
              {selectedUnit.track === 'curriculum' ? 'Módulo de Currículum' : 'Unidad Temática'}
            </div>
            <h3 style={{ 
              fontSize: '0.98rem', 
              fontWeight: 800, 
              margin: '0 0 2px 0',
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {selectedUnit.title}
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '0.78rem', 
              opacity: 0.92, 
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {selectedUnit.subtitle}
            </p>
            <span style={{
              display: 'inline-block',
              marginTop: 6,
              fontSize: '0.7rem',
              fontWeight: 700,
              background: 'rgba(255,255,255,0.24)',
              padding: '2px 8px',
              borderRadius: 6
            }}>
              {selectedUnit.lessons.length} lecciones • {selectedUnit.total_words} palabras
            </span>
          </div>
        </div>

        {/* Lista de Lecciones Desplegables con TÍTULO DE CONTEXTO EXCLUSIVO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
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
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                  boxShadow: isExpanded ? '0 4px 14px rgba(99, 102, 241, 0.12)' : 'var(--shadow-sm)'
                }}
              >
                {/* Cabecera de la Lección */}
                <div 
                  onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)}
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    {/* Badge numérico o de completado */}
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: status.isCompleted 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                        : (isExpanded ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-main)'),
                      color: status.isCompleted ? '#fff' : (isExpanded ? 'var(--primary)' : 'var(--text-main)'),
                      border: status.isCompleted ? 'none' : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {status.isCompleted ? <Check size={16} strokeWidth={3} /> : lesson.number}
                    </div>

                    {/* TÍTULO DE CONTEXTO PURO (Requisito clave del usuario: solo contexto de las palabras) */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: 700, 
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          Lección {lesson.number}
                        </span>
                        {status.isCompleted && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            padding: '1px 6px',
                            borderRadius: 6,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3
                          }}>
                            <Check size={10} strokeWidth={3} /> Hecha
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        fontSize: '0.92rem', 
                        fontWeight: 800, 
                        color: 'var(--text-main)', 
                        lineHeight: 1.25,
                        marginTop: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {lesson.title}
                      </div>
                      <div style={{ 
                        fontSize: '0.74rem', 
                        color: 'var(--text-muted)',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {lesson.words.length} palabras • {lesson.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {status.isCompleted && (
                      <div style={{ display: 'flex', gap: 2, color: '#f59e0b' }}>
                        {[...Array(status.stars || 3)].map((_, i) => (
                          <Star key={i} size={12} fill="#f59e0b" />
                        ))}
                      </div>
                    )}
                    <ChevronRight 
                      size={18} 
                      style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s ease',
                        color: 'var(--text-muted)'
                      }} 
                    />
                  </div>
                </div>

                {/* Bloque expandido: Modos de Estudio y Previsualización de Vocabulario */}
                {isExpanded && (
                  <div style={{
                    padding: '8px 14px 16px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--bg-main)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      margin: '10px 0 10px'
                    }}>
                      <div style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 1
                      }}>
                        Modos de Estudio y Práctica
                      </div>
                      {completedModes.length > 0 && (
                        <div style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3
                        }}>
                          <CheckCircle2 size={12} />
                          <span>{completedModes.length}/4 completados</span>
                        </div>
                      )}
                    </div>

                    {/* Botones de acción compactos (optimizados para móvil) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 8,
                      marginBottom: 14
                    }}>
                      {/* 1. ESCRIBIR */}
                      <button
                        type="button"
                        onClick={() => handleStartStudy(lesson, 'write')}
                        style={{
                          position: 'relative',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                          border: isWriteDone ? '2px solid #10b981' : 'none',
                          borderRadius: 14,
                          padding: '10px 6px',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: isWriteDone ? '0 3px 10px rgba(16, 185, 129, 0.35)' : '0 3px 10px rgba(139, 92, 246, 0.3)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        {isWriteDone && (
                          <div style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: '#10b981',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #fff'
                          }}>
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.95rem',
                          fontWeight: 900
                        }}>
                          あ
                        </div>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800 }}>Escribir</span>
                      </button>

                      {/* 2. FLASHCARDS */}
                      <button
                        type="button"
                        onClick={() => handleStartStudy(lesson, 'flashcards')}
                        style={{
                          position: 'relative',
                          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                          border: isFlashDone ? '2px solid #10b981' : 'none',
                          borderRadius: 14,
                          padding: '10px 6px',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: isFlashDone ? '0 3px 10px rgba(16, 185, 129, 0.35)' : '0 3px 10px rgba(6, 182, 212, 0.3)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        {isFlashDone && (
                          <div style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: '#10b981',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #fff'
                          }}>
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Layers size={15} />
                        </div>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800 }}>Tarjetas</span>
                      </button>

                      {/* 3. WORD MATCH */}
                      <button
                        type="button"
                        onClick={() => handleStartStudy(lesson, 'match')}
                        style={{
                          position: 'relative',
                          background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                          border: isMatchDone ? '2px solid #10b981' : 'none',
                          borderRadius: 14,
                          padding: '10px 6px',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: isMatchDone ? '0 3px 10px rgba(16, 185, 129, 0.35)' : '0 3px 10px rgba(244, 63, 94, 0.3)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        {isMatchDone && (
                          <div style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: '#10b981',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #fff'
                          }}>
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Grid size={15} />
                        </div>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800 }}>Emparejar</span>
                      </button>

                      {/* 4. REPASO SRS */}
                      <button
                        type="button"
                        onClick={() => handleStartStudy(lesson, 'srs')}
                        style={{
                          position: 'relative',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          border: isSrsDone ? '2px solid #10b981' : 'none',
                          borderRadius: 14,
                          padding: '10px 6px',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: isSrsDone ? '0 3px 10px rgba(16, 185, 129, 0.35)' : '0 3px 10px rgba(245, 158, 11, 0.3)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        {isSrsDone && (
                          <div style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: '#10b981',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #fff'
                          }}>
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Brain size={15} />
                        </div>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800 }}>Repaso</span>
                      </button>
                    </div>

                    {/* Previsualización de Palabras de la Lección */}
                    <div style={{
                      background: 'var(--bg-surface)',
                      borderRadius: 14,
                      border: '1px solid var(--border)',
                      padding: '10px 12px'
                    }}>
                      <div style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        marginBottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>Vocabulario ({lesson.words.length} palabras)</span>
                        <span>Español / Kanji</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                        {lesson.words.map((w, wIdx) => (
                          <div 
                            key={w.id || wIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 8px',
                              borderRadius: 8,
                              background: 'var(--bg-main)',
                              border: '1px solid var(--border)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                              <button
                                type="button"
                                onClick={(e) => handlePlayWordAudio(e, w)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  color: 'var(--primary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                                title="Escuchar pronunciación"
                                aria-label="Escuchar pronunciación"
                              >
                                <Volume2 size={15} />
                              </button>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                    {w.kanji}
                                  </span>
                                  {w.hiragana && w.hiragana !== w.kanji && (
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                      {w.hiragana}
                                    </span>
                                  )}
                                </div>
                                <div style={{ 
                                  fontSize: '0.74rem', 
                                  color: 'var(--text-muted)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {w.meaning_es}
                                </div>
                              </div>
                            </div>

                            <span style={{
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              background: 'rgba(99, 102, 241, 0.12)',
                              color: 'var(--primary)',
                              padding: '1px 5px',
                              borderRadius: 4,
                              flexShrink: 0
                            }}>
                              {w.level || 'N5'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Botón rápido para empezar a escribir */}
                      <button
                        type="button"
                        onClick={() => handleStartStudy(lesson, 'write')}
                        className="btn btn-primary btn-sm"
                        style={{
                          width: '100%',
                          marginTop: 10,
                          padding: '7px 12px',
                          borderRadius: 10,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        <PenTool size={14} />
                        <span>Comenzar a escribir esta lección ✍️</span>
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
  // VISTA 1: CATÁLOGO DE UNIDADES PRINCIPALES (TOTALMENTE EN ESPAÑOL)
  // ==========================================
  return (
    <div className="section-panel active" style={{ maxWidth: 640, margin: '0 auto', padding: '12px 6px' }}>
      {/* Tarjeta de Encabezado */}
      <div className="module-hero-card" style={{ marginBottom: 14, padding: '14px 16px' }}>
        <div className="module-hero-content">
          <div className="module-hero-title-row" style={{ gap: 12 }}>
            <div 
              className="module-hero-icon-badge" 
              style={{ 
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <PenTool size={22} color="#fff" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span className="module-category-pill" style={{ 
                  color: '#8b5cf6', 
                  background: 'rgba(139, 92, 246, 0.12)',
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: 6
                }}>
                  Escritura & Vocabulario
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Caligrafía Táctil ✍️
                </span>
              </div>
              <h1 className="module-hero-title" style={{ fontSize: '1.2rem', fontWeight: 800, margin: '2px 0' }}>
                Scriptpad: Unidades y Caligrafía
              </h1>
              <p className="module-hero-subtitle" style={{ fontSize: '0.78rem', margin: 0, lineHeight: 1.35 }}>
                Escribe palabras y kanji a mano con trazos guiados, tarjetas flashcards y repaso espaciado FSRS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta de Repaso SRS de Escritura */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '10px 14px',
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 8px rgba(245, 158, 11, 0.25)',
            flexShrink: 0
          }}>
            <Brain size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Repaso SRS de Escritura (FSRS)
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {srsQueue.length > 0 
                ? `${srsQueue.length} palabras listas para practicar` 
                : '¡Al día con tus repasos de escritura!'}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setActiveMode('srs')}
          style={{ padding: '6px 12px', borderRadius: 10, fontSize: '0.76rem', fontWeight: 700 }}
        >
          <span>Practicar Repaso</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Pestañas de Track y Filtros de Nivel JLPT */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12
      }}>
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-surface)',
          padding: 2,
          borderRadius: 10,
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('thematic')}
            style={{
              padding: '5px 11px',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.78rem',
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
              padding: '5px 11px',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'curriculum' ? 700 : 500,
              background: activeTab === 'curriculum' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'curriculum' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Ruta del Currículum
          </button>
        </div>

        {/* Filtros por nivel JLPT */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Nivel:</span>
          {['all', 'N5', 'N4', 'N3'].map(lvl => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevelFilter(lvl)}
              className={`btn ${levelFilter === lvl ? 'btn-primary' : 'btn-outline'} btn-sm`}
              style={{ padding: '2px 7px', fontSize: '0.7rem', borderRadius: 6, minWidth: 30 }}
            >
              {lvl === 'all' ? 'Todos' : lvl}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        fontSize: '0.7rem',
        fontWeight: 800,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10
      }}>
        {activeTab === 'thematic' ? 'Unidades Temáticas de Vocabulario' : 'Módulos del Currículum para Escritura'}
      </div>

      {/* Lista de Unidades en Español con tipografía optimizada */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {units.map((unit) => (
          <div
            key={unit.id}
            onClick={() => setSelectedUnitId(unit.id)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: 'var(--shadow-sm)',
              gap: 12
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              {/* Badge con kanji temático */}
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: unit.color || '#6366f1',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 900,
                flexShrink: 0,
                boxShadow: `0 3px 10px ${unit.color ? unit.color + '33' : 'rgba(99, 102, 241, 0.25)'}`
              }}>
                {unit.kanji_icon}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ 
                  fontSize: '0.94rem', 
                  fontWeight: 800, 
                  margin: '0 0 2px 0', 
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {unit.title}
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.76rem', 
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {unit.subtitle}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 8,
                whiteSpace: 'nowrap'
              }}>
                {unit.lessons.length} lec • {unit.total_words} pal
              </span>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
