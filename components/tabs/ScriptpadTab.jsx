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
  BookOpen,
  Compass
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
  const onTriggerSync = contextApp?.handleTriggerSync;
  const authUser = contextApp?.authUser;

  // Sincronizar automáticamente al abrir Scriptpad si hay un usuario autenticado
  useEffect(() => {
    if (authUser && onTriggerSync) {
      onTriggerSync();
    }
  }, [authUser, onTriggerSync]);

  // Filtros de navegación
  const [activeTab, setActiveTab] = useState('thematic'); // 'thematic' | 'curriculum' | 'fsrs'
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'N5' | 'N4' | 'N3'

  // Filtros para el panel de progreso FSRS
  const [fsrsFilterHealth, setFsrsFilterHealth] = useState('all'); // 'all' | 'due' | 'weak' | 'strong' | 'learning'
  const [fsrsSearch, setFsrsSearch] = useState('');
  const [fsrsLevel, setFsrsLevel] = useState('all');

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
    let targetId = selectedUnitId;
    if (targetId === 'unit-1-basics') targetId = 'unit-1-fundamentos';
    if (targetId === 'unit-2-everyday') targetId = 'unit-4-familia-hogar';

    const found = units.find(u => u.id === targetId);
    if (found) return found;

    const allUnits = getScriptpadUnits('all', targetId.startsWith('curriculum-mod-') ? 'curriculum' : 'all');
    return allUnits.find(u => u.id === targetId) || null;
  }, [units, selectedUnitId]);

  // Cola de repaso SRS de escritura
  const srsQueue = useMemo(() => {
    return getScriptpadSrsQueue(appState, 20);
  }, [appState]);

  // Palabras ya practicadas o en FSRS de Scriptpad
  const studiedWords = useMemo(() => {
    return getScriptpadStudiedWords(appState);
  }, [appState]);

  // Resumen estadístico FSRS de Scriptpad
  const fsrsSummary = useMemo(() => {
    let due = 0;
    let strong = 0;
    let weak = 0;
    let learning = 0;
    let totalRet = 0;
    let retCount = 0;

    studiedWords.forEach(w => {
      if (w.health === 'due') due++;
      else if (w.health === 'weak') weak++;
      else if (w.health === 'strong') strong++;
      else learning++;

      if (w.card && (w.card.reps > 0 || w.timesWritten > 0)) {
        totalRet += w.retrievability.percent;
        retCount++;
      }
    });

    return {
      total: studiedWords.length,
      due,
      strong,
      weak,
      learning,
      avgRetention: retCount > 0 ? Math.round(totalRet / retCount) : 0
    };
  }, [studiedWords]);

  // Palabras filtradas para el panel de progreso FSRS
  const filteredStudiedWords = useMemo(() => {
    return studiedWords.filter(w => {
      if (fsrsLevel !== 'all' && w.level !== fsrsLevel) return false;
      if (fsrsFilterHealth === 'due' && !w.isDue) return false;
      if (fsrsFilterHealth === 'strong' && w.health !== 'strong') return false;
      if (fsrsFilterHealth === 'weak' && w.health !== 'weak') return false;
      if (fsrsFilterHealth === 'learning' && w.health !== 'learning') return false;
      const q = fsrsSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        (w.kanji && w.kanji.toLowerCase().includes(q)) ||
        (w.hiragana && w.hiragana.toLowerCase().includes(q)) ||
        (w.meaning_es && w.meaning_es.toLowerCase().includes(q))
      );
    });
  }, [studiedWords, fsrsLevel, fsrsFilterHealth, fsrsSearch]);

  // Iniciar estudio de una lección en un modo específico
  const handleStartStudy = (lesson, mode) => {
    setActiveLesson(lesson);
    setActiveMode(mode);
    if (lesson?.unitId) {
      setSelectedUnitId(lesson.unitId);
    }
  };

  // Finalizar lección y guardar progreso (sincronizando de inmediato con la nube)
  const handleCompleteStudy = (stats) => {
    if (activeLesson && onUpdateState) {
      recordLessonCompletion(activeLesson.id, stats, appState, onUpdateState);
      if (onTriggerSync) {
        setTimeout(() => {
          onTriggerSync();
        }, 200);
      }
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
      <div className="section-panel active" style={{ width: '100%', maxWidth: 720, margin: '0 auto', boxSizing: 'border-box' }}>
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
      <div className="section-panel active" style={{ width: '100%', maxWidth: 580, margin: '0 auto', boxSizing: 'border-box' }}>
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
      <div className="section-panel active" style={{ width: '100%', maxWidth: 680, margin: '0 auto', boxSizing: 'border-box' }}>
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

    if (!queueToReview || queueToReview.length === 0) {
      return (
        <div className="section-panel active" style={{ 
          width: '100%', 
          maxWidth: 520, 
          margin: '40px auto', 
          padding: '36px 20px', 
          textAlign: 'center', 
          background: 'var(--bg-surface)', 
          borderRadius: 20, 
          border: '1px solid var(--border)' 
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle2 size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
            ¡Estás al día con tus repasos!
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 22, lineHeight: 1.5 }}>
            No tienes palabras pendientes de repaso en este momento. Completa nuevas lecciones de escritura o regresa cuando se cumpla el intervalo espaciado.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCloseStudy}
            style={{ padding: '9px 24px', borderRadius: 12, fontWeight: 700 }}
          >
            Volver a Unidades
          </button>
        </div>
      );
    }

    return (
      <div className="section-panel active" style={{ width: '100%', maxWidth: 680, margin: '0 auto', boxSizing: 'border-box' }}>
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
      <div className="section-panel active">
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
        <div 
          className="scriptpad-unit-banner"
          style={{
            background: selectedUnit.bg_gradient || 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            borderRadius: 18,
            padding: '14px 16px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 16,
            boxShadow: '0 6px 18px rgba(0,0,0,0.16)',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          <div 
            className="scriptpad-unit-banner-icon"
            style={{
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
            }}
          >
            {selectedUnit.kanji_icon}
          </div>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              <span style={{
                display: 'inline-block',
                fontSize: '0.7rem',
                fontWeight: 700,
                background: 'rgba(255,255,255,0.24)',
                padding: '2px 8px',
                borderRadius: 6
              }}>
                {selectedUnit.lessons.length} lecciones • {selectedUnit.total_words} palabras
              </span>
              {selectedUnit.track === 'curriculum' && (() => {
                const stepMatch = selectedUnit.id.match(/\d+/);
                const stepNum = stepMatch ? stepMatch[0] : 1;
                return (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof window !== 'undefined') {
                        window.location.href = `/curriculum?step=${stepNum}`;
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: 'rgba(255,255,255,0.32)',
                      color: '#fff',
                      padding: '2px 9px',
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title="Ver módulo homólogo en Currículum"
                  >
                    <Compass size={13} />
                    <span>Ver en Currículum (Paso {stepNum})</span>
                  </button>
                );
              })()}
            </div>
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
                className="scriptpad-lesson-card"
                style={{
                  background: 'var(--bg-surface)',
                  border: isExpanded ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                  boxShadow: isExpanded ? '0 4px 14px rgba(99, 102, 241, 0.12)' : 'var(--shadow-sm)',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {/* Cabecera de la Lección */}
                <div 
                  className="scriptpad-lesson-header"
                  onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)}
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    gap: 10,
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
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

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              {(() => {
                                const fStatus = getScriptpadWordFsrsStatus(w, appState);
                                if (!fStatus.hasCard && fStatus.timesWritten === 0) return null;
                                return (
                                  <span
                                    style={{
                                      fontSize: '0.62rem',
                                      fontWeight: 800,
                                      padding: '1px 6px',
                                      borderRadius: 4,
                                      background: fStatus.badgeBg,
                                      color: fStatus.badgeColor,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 3,
                                      whiteSpace: 'nowrap'
                                    }}
                                    title={`Retención FSRS: ${fStatus.retrievability.formatted} • Estado: ${fStatus.stateInfo?.name || 'Nuevo'} • Trazado: ${fStatus.timesWritten}x`}
                                  >
                                    <span>{fStatus.retrievability.percent > 0 ? fStatus.retrievability.formatted : fStatus.statusLabel}</span>
                                  </span>
                                );
                              })()}

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
                        <span>Comenzar a escribir</span>
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
    <div className="section-panel active">
      {/* Tarjeta de Encabezado */}
      <div className="module-hero-card">
        <div className="module-hero-content">
          <div className="module-hero-title-row">
            <div 
              className="module-hero-icon-badge" 
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)' 
              }}
            >
              <PenTool size={22} color="#fff" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="module-category-pill" style={{ 
                color: '#8b5cf6', 
                background: 'rgba(139, 92, 246, 0.12)' 
              }}>
                Escritura & Vocabulario
              </span>
              <h1 className="module-hero-title">
                Scriptpad: Unidades y Caligrafía
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta de Repaso SRS de Escritura */}
      <div 
        className="scriptpad-srs-banner"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '10px 14px',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
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
          <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Repaso SRS de Escritura (FSRS)
            </div>
            <div style={{ 
              fontSize: '0.74rem', 
              color: srsQueue.length > 0 ? 'var(--text-muted)' : 'var(--accent-matcha, #10b981)',
              fontWeight: srsQueue.length > 0 ? 500 : 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {srsQueue.length > 0 
                ? `${srsQueue.length} ${srsQueue.length === 1 ? 'palabra lista' : 'palabras listas'} para repasar` 
                : '¡Al día con tus repasos! (0 pendientes)'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setActiveTab('fsrs')}
            style={{
              padding: '7px 12px',
              borderRadius: 10,
              fontSize: '0.76rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}
            title="Ver todas las palabras estudiadas y su retención FSRS"
          >
            <Brain size={13} />
            <span>Ver Progreso</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={srsQueue.length === 0}
            onClick={() => {
              if (srsQueue.length > 0) setActiveMode('srs');
            }}
            style={{ 
              padding: '7px 14px', 
              borderRadius: 10, 
              fontSize: '0.76rem', 
              fontWeight: 700,
              opacity: srsQueue.length === 0 ? 0.55 : 1,
              cursor: srsQueue.length === 0 ? 'not-allowed' : 'pointer',
              pointerEvents: srsQueue.length === 0 ? 'none' : 'auto',
              background: srsQueue.length === 0 ? 'var(--bg-surface-elevated, #374151)' : undefined,
              borderColor: srsQueue.length === 0 ? 'transparent' : undefined,
              color: srsQueue.length === 0 ? 'var(--text-muted, #9ca3af)' : undefined,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0
            }}
          >
            {srsQueue.length === 0 ? (
              <>
                <CheckCircle2 size={13} />
                <span>Al día</span>
              </>
            ) : (
              <>
                <span>Practicar Repaso</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pestañas de Track y Filtros de Nivel JLPT */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div 
          className="scriptpad-track-switcher"
          style={{
            display: 'inline-flex',
            background: 'var(--bg-surface)',
            padding: 2,
            borderRadius: 10,
            border: '1px solid var(--border)',
            boxSizing: 'border-box',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            className="scriptpad-track-btn"
            onClick={() => setActiveTab('thematic')}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'thematic' ? 700 : 500,
              background: activeTab === 'thematic' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'thematic' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Ruta Unificada (10 Unidades)
          </button>
          <button
            type="button"
            className="scriptpad-track-btn"
            onClick={() => setActiveTab('curriculum')}
            style={{
              padding: '5px 12px',
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
          <button
            type="button"
            className="scriptpad-track-btn"
            onClick={() => setActiveTab('fsrs')}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'fsrs' ? 700 : 500,
              background: activeTab === 'fsrs' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
              color: activeTab === 'fsrs' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Brain size={13} />
            <span>Progreso FSRS ({studiedWords.length})</span>
          </button>
        </div>

        {/* Filtros por nivel JLPT */}
        {activeTab !== 'fsrs' && (
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
        )}
      </div>

      {activeTab === 'fsrs' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Métricas Generales FSRS de Scriptpad */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 10
          }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '12px 14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Palabras en FSRS
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)', marginTop: 4 }}>
                {fsrsSummary.total}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '12px 14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Retención Media
              </div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 900,
                color: fsrsSummary.avgRetention >= 80 ? '#10b981' : fsrsSummary.avgRetention >= 60 ? '#f59e0b' : '#ef4444',
                marginTop: 4
              }}>
                {fsrsSummary.avgRetention}%
              </div>
            </div>

            <div
              onClick={() => setFsrsFilterHealth(fsrsFilterHealth === 'due' ? 'all' : 'due')}
              style={{
                background: fsrsFilterHealth === 'due' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface)',
                border: `1px solid ${fsrsFilterHealth === 'due' ? '#f59e0b' : 'var(--border)'}`,
                borderRadius: 14,
                padding: '12px 14px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                🔔 Por repasar hoy
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', marginTop: 4 }}>
                {fsrsSummary.due}
              </div>
            </div>

            <div
              onClick={() => setFsrsFilterHealth(fsrsFilterHealth === 'strong' ? 'all' : 'strong')}
              style={{
                background: fsrsFilterHealth === 'strong' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                border: `1px solid ${fsrsFilterHealth === 'strong' ? '#10b981' : 'var(--border)'}`,
                borderRadius: 14,
                padding: '12px 14px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                🟢 Van bien
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', marginTop: 4 }}>
                {fsrsSummary.strong}
              </div>
            </div>

            <div
              onClick={() => setFsrsFilterHealth(fsrsFilterHealth === 'weak' ? 'all' : 'weak')}
              style={{
                background: fsrsFilterHealth === 'weak' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-surface)',
                border: `1px solid ${fsrsFilterHealth === 'weak' ? '#ef4444' : 'var(--border)'}`,
                borderRadius: 14,
                padding: '12px 14px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
                ⚠️ Repasar más
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444', marginTop: 4 }}>
                {fsrsSummary.weak}
              </div>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar palabra por kanji, hiragana o español..."
                  value={fsrsSearch}
                  onChange={(e) => setFsrsSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 32px 8px 36px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box'
                  }}
                />
                {fsrsSearch && (
                  <button
                    type="button"
                    onClick={() => setFsrsSearch('')}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filtro nivel */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Nivel:</span>
                {['all', 'N5', 'N4', 'N3'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFsrsLevel(lvl)}
                    className={`btn ${fsrsLevel === lvl ? 'btn-primary' : 'btn-outline'} btn-xs`}
                    style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: 6 }}
                  >
                    {lvl === 'all' ? 'Todos' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Chips de salud */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Estado:</span>
              <button
                type="button"
                onClick={() => setFsrsFilterHealth('all')}
                className={`btn ${fsrsFilterHealth === 'all' ? 'btn-primary' : 'btn-outline'} btn-xs`}
                style={{ borderRadius: 8, padding: '3px 10px', fontSize: '0.74rem' }}
              >
                Todos ({studiedWords.length})
              </button>
              <button
                type="button"
                onClick={() => setFsrsFilterHealth('due')}
                style={{
                  borderRadius: 8,
                  padding: '3px 10px',
                  fontSize: '0.74rem',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  background: fsrsFilterHealth === 'due' ? '#f59e0b' : 'transparent',
                  color: fsrsFilterHealth === 'due' ? '#fff' : '#f59e0b',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🔔 Repasar hoy ({fsrsSummary.due})
              </button>
              <button
                type="button"
                onClick={() => setFsrsFilterHealth('strong')}
                style={{
                  borderRadius: 8,
                  padding: '3px 10px',
                  fontSize: '0.74rem',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  background: fsrsFilterHealth === 'strong' ? '#10b981' : 'transparent',
                  color: fsrsFilterHealth === 'strong' ? '#fff' : '#10b981',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🟢 Van bien ({fsrsSummary.strong})
              </button>
              <button
                type="button"
                onClick={() => setFsrsFilterHealth('weak')}
                style={{
                  borderRadius: 8,
                  padding: '3px 10px',
                  fontSize: '0.74rem',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  background: fsrsFilterHealth === 'weak' ? '#ef4444' : 'transparent',
                  color: fsrsFilterHealth === 'weak' ? '#fff' : '#ef4444',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ⚠️ Repasar más ({fsrsSummary.weak})
              </button>
              {fsrsSummary.learning > 0 && (
                <button
                  type="button"
                  onClick={() => setFsrsFilterHealth('learning')}
                  style={{
                    borderRadius: 8,
                    padding: '3px 10px',
                    fontSize: '0.74rem',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    background: fsrsFilterHealth === 'learning' ? 'var(--primary)' : 'transparent',
                    color: fsrsFilterHealth === 'learning' ? '#fff' : 'var(--primary)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⏳ En aprendizaje ({fsrsSummary.learning})
                </button>
              )}
            </div>
          </div>

          {/* Lista o Grid de Palabras Estudiadas */}
          {studiedWords.length === 0 ? (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <Brain size={44} style={{ color: 'var(--primary)', margin: '0 auto 14px', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
                Aún no has registrado palabras en FSRS
              </h3>
              <p style={{ fontSize: '0.86rem', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Cada vez que practicas el trazo o completas una lección de escritura, las palabras se incorporan automáticamente a tu motor de Repetición Espaciada FSRS para optimizar tu memoria.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setActiveTab('thematic');
                  setSelectedUnitId('unit-1-fundamentos');
                }}
                style={{ padding: '8px 20px', borderRadius: 12, fontWeight: 700 }}
              >
                Comenzar Unidad 1: Fundamentos
              </button>
            </div>
          ) : filteredStudiedWords.length === 0 ? (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '36px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <p style={{ fontSize: '0.95rem', marginBottom: 12 }}>
                No se encontraron palabras con los filtros seleccionados.
              </p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setFsrsSearch('');
                  setFsrsFilterHealth('all');
                  setFsrsLevel('all');
                }}
                style={{ padding: '6px 16px', borderRadius: 10 }}
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12
            }}>
              {filteredStudiedWords.map((word) => {
                const ret = word.retrievability;
                const isDueNow = word.isDue;
                const isWeak = word.health === 'weak';
                const isStrong = word.health === 'strong';

                const badgeBg = isDueNow
                  ? 'rgba(245, 158, 11, 0.15)'
                  : isWeak
                  ? 'rgba(239, 68, 68, 0.15)'
                  : isStrong
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(99, 102, 241, 0.15)';

                const badgeColor = isDueNow
                  ? '#f59e0b'
                  : isWeak
                  ? '#ef4444'
                  : isStrong
                  ? '#10b981'
                  : 'var(--primary)';

                const badgeLabel = isDueNow
                  ? '🔔 Repasar hoy'
                  : isWeak
                  ? '⚠️ Repasar más'
                  : isStrong
                  ? '🟢 Va bien'
                  : '⏳ En aprendizaje';

                const barColor = isDueNow
                  ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                  : isWeak
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                  : isStrong
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'linear-gradient(90deg, #6366f1, #4f46e5)';

                return (
                  <div
                    key={word.wordKey}
                    style={{
                      background: 'var(--bg-surface)',
                      border: `1px solid ${isDueNow ? 'rgba(245, 158, 11, 0.4)' : isWeak ? 'rgba(239, 68, 68, 0.35)' : 'var(--border)'}`,
                      borderRadius: 16,
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Fila 1: Nivel, Badge de Salud y botón de audio */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          background: 'rgba(99, 102, 241, 0.12)',
                          color: 'var(--primary)',
                          padding: '1px 6px',
                          borderRadius: 4
                        }}>
                          {word.level || 'N5'}
                        </span>
                        <span style={{
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          padding: '1px 7px',
                          borderRadius: 4,
                          background: badgeBg,
                          color: badgeColor
                        }}>
                          {badgeLabel}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handlePlayWordAudio(e, word)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          padding: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Escuchar pronunciación"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                    {/* Fila 2: Palabra en grande y significado */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: 0.5 }}>
                          {word.kanji}
                        </span>
                        {word.hiragana && word.hiragana !== word.kanji && (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {word.hiragana}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>
                        {word.meaning_es}
                      </div>
                    </div>

                    {/* Fila 3: Porcentaje de Retención y Barra FSRS */}
                    <div style={{ background: 'var(--bg-main)', padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Retención esperada:</span>
                        <strong style={{ color: badgeColor }}>{ret.percent > 0 ? ret.formatted : (word.timesWritten > 0 ? 'Reciente' : 'Nueva')}</strong>
                      </div>
                      <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, Math.max(5, ret.percent))}%`, height: '100%', background: barColor, transition: 'width 0.3s' }} />
                      </div>
                    </div>

                    {/* Fila 4: Detalle de repeticiones y botón de práctica */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span>Trazada: <strong>{word.timesWritten}x</strong> • Reps SRS: <strong>{word.card?.reps || 0}</strong></span>
                        <span style={{ fontSize: '0.64rem' }}>{word.unitTitle ? `${word.unitTitle}` : ''}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleStartStudy({
                            id: `adhoc-${word.wordKey}`,
                            number: 1,
                            title: `Práctica: ${word.kanji || word.hiragana}`,
                            words: [word],
                            unitId: word.unitId
                          }, 'write');
                        }}
                        className="btn btn-outline btn-xs"
                        style={{
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          borderColor: isWeak ? '#ef4444' : isDueNow ? '#f59e0b' : 'var(--primary)',
                          color: isWeak ? '#ef4444' : isDueNow ? '#f59e0b' : 'var(--primary)'
                        }}
                      >
                        <PenTool size={11} />
                        <span>Trazar</span>
                      </button>
                    </div>

                    {word.isLeech && (
                      <div style={{ fontSize: '0.64rem', color: '#ef4444', fontWeight: 700, marginTop: -2 }}>
                        ⚠️ Punto débil (olvidos reiterados)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 10
          }}>
            {activeTab !== 'curriculum' 
              ? 'Ruta de Aprendizaje Unificada (95 Lecciones • 1,153 Palabras Únicas)' 
              : 'Módulos del Currículum para Escritura'}
          </div>

      {/* Lista de Unidades en Español con tipografía optimizada y grid responsivo */}
      <div className="scriptpad-units-grid">
        {units.map((unit) => (
          <div
            key={unit.id}
            onClick={() => setSelectedUnitId(unit.id)}
            className="scriptpad-unit-card"
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
              gap: 12,
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              overflow: 'hidden'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1, overflow: 'hidden' }}>
              {/* Badge con kanji temático */}
              <div 
                className="scriptpad-unit-kanji-badge"
                style={{
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
                }}
              >
                {unit.kanji_icon}
              </div>

              <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {unit.track === 'curriculum' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const stepMatch = unit.id.match(/\d+/);
                    const stepNum = stepMatch ? stepMatch[0] : 1;
                    if (typeof window !== 'undefined') {
                      window.location.href = `/curriculum?step=${stepNum}`;
                    }
                  }}
                  style={{
                    padding: '3px 7px',
                    fontSize: '0.68rem',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                  title="Ir al módulo en Currículum"
                >
                  <Compass size={11} />
                  <span>Módulo</span>
                </button>
              )}
              <span 
                className="scriptpad-unit-meta-badge"
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 8,
                  whiteSpace: 'nowrap'
                }}
              >
                {unit.lessons.length} lec • {unit.total_words} pal
              </span>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
}
