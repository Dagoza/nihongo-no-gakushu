'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Target, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Grid,
  PenTool,
  Sparkles
} from 'lucide-react';
import { 
  fetchKanjiStrokeData, 
  computeStrokeNumbers, 
  getScalingTransform 
} from '../lib/kanjiStrokeUtils';

export default function KanjiDraw({ 
  character, 
  size = 260, 
  onQuizComplete,
  initialMode = 'order' // 'order' (筆順 - Stroke Order) | 'quiz' (Practicar y Animar)
}) {
  const containerRef = useRef(null);
  const writerRef = useRef(null);
  
  // 2 Modos principales: 'order' (筆順 Stroke Order) y 'quiz' (Practicar con Animar integrado)
  const [activeTab, setActiveTab] = useState(initialMode);
  
  // Datos vectoriales del Kanji
  const [charData, setCharData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Estados del Modo 'order' (筆順 Stroke Order)
  const [activeStep, setActiveStep] = useState(null); // null = todos los trazos; número = paso específico (1..total)
  const [showNumbers, setShowNumbers] = useState(true);
  const [isMultiColor, setIsMultiColor] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [hoveredStrokeIndex, setHoveredStrokeIndex] = useState(null);
  const [isPlayingSteps, setIsPlayingSteps] = useState(false);
  const stepTimerRef = useRef(null);

  // Estados del Modo 'quiz' (Practicar + Animar)
  const [currentQuizStroke, setCurrentQuizStroke] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [showQuizGuideNumbers, setShowQuizGuideNumbers] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1.4);

  // Carga de datos de trazos
  useEffect(() => {
    if (!character) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadingError(false);
    setActiveStep(null);
    setIsPlayingSteps(false);
    setCurrentQuizStroke(0);
    setErrorCount(0);
    setQuizSuccess(false);
    setIsAnimating(false);

    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
    }

    fetchKanjiStrokeData(character)
      .then((data) => {
        if (!isMounted) return;
        setCharData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(`Error al cargar datos de trazos para ${character}:`, err);
        if (!isMounted) return;
        setIsLoading(false);
        setLoadingError(true);
      });

    return () => {
      isMounted = false;
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [character, retryKey]);

  // Lista calculada de números y coordenadas de trazos
  const strokeItems = useMemo(() => {
    if (!charData) return [];
    return computeStrokeNumbers(charData, size, 14);
  }, [charData, size]);

  const totalStrokes = strokeItems.length;

  // Transformación SVG
  const transform = useMemo(() => {
    return getScalingTransform(size, 14);
  }, [size]);

  // Manejo de paso a paso automático en modo 筆順 Stroke Order
  useEffect(() => {
    if (isPlayingSteps && totalStrokes > 0) {
      stepTimerRef.current = setInterval(() => {
        setActiveStep((prev) => {
          if (prev === null) return 1;
          if (prev >= totalStrokes) {
            setIsPlayingSteps(false);
            return null; // vuelve a mostrar todos
          }
          return prev + 1;
        });
      }, 950);
    } else {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    }

    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [isPlayingSteps, totalStrokes]);

  // Inicialización de HanziWriter cuando se entra en 'quiz'
  const initHanziWriter = useCallback(() => {
    if (!containerRef.current || !character || !charData) return;

    try {
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch (e) {}
      }
      containerRef.current.innerHTML = '';

      writerRef.current = HanziWriter.create(containerRef.current, character, {
        width: size,
        height: size,
        padding: 14,
        showOutline: true,
        strokeAnimationSpeed: animationSpeed,
        delayBetweenStrokes: 180,
        strokeColor: '#3b82f6',
        radicalColor: '#10b981',
        outlineColor: '#e2e8f0',
        drawingColor: '#1e293b',
        drawingWidth: 16,
        showCharacter: false,
        charDataLoader: () => charData
      });

      startQuizSession();
    } catch (e) {
      console.error('Error inicializando HanziWriter:', e);
    }
  }, [character, charData, size, animationSpeed]);

  useEffect(() => {
    if (activeTab === 'quiz') {
      initHanziWriter();
    } else {
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch (e) {}
      }
    }

    return () => {
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch (e) {}
      }
    };
  }, [activeTab, initHanziWriter]);

  const startQuizSession = () => {
    if (!writerRef.current) return;
    setErrorCount(0);
    setQuizSuccess(false);
    setCurrentQuizStroke(0);
    setIsAnimating(false);

    try {
      writerRef.current.quiz({
        onCorrectStroke: (data) => {
          setCurrentQuizStroke(data.strokeNum + 1);
        },
        onMistake: () => {
          setErrorCount((prev) => prev + 1);
        },
        onComplete: (summary) => {
          setQuizSuccess(true);
          setCurrentQuizStroke(totalStrokes);
          if (onQuizComplete) onQuizComplete(summary);
        }
      });
    } catch (e) {
      console.error('Error iniciando quiz:', e);
    }
  };

  const handleAnimateInQuiz = () => {
    if (!writerRef.current) return;
    setIsAnimating(true);
    try {
      writerRef.current.cancelQuiz();
      writerRef.current.animateCharacter({
        onComplete: () => {
          setIsAnimating(false);
          startQuizSession();
        }
      });
    } catch (e) {
      console.error('Error en animación:', e);
      setIsAnimating(false);
    }
  };

  if (loadingError) {
    return (
      <div style={{
        width: size,
        minHeight: size + 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-surface)',
        borderRadius: '16px',
        border: '1px dashed var(--danger, #ef4444)',
        padding: 20,
        gap: 12
      }}>
        <p style={{ color: 'var(--danger, #ef4444)', fontSize: '0.88rem', textAlign: 'center', margin: 0 }}>
          No hay datos vectoriales disponibles para el carácter <strong>{character}</strong>.
        </p>
        <button 
          className="btn btn-outline btn-sm"
          onClick={() => setRetryKey((k) => k + 1)}
          style={{ fontSize: '0.82rem' }}
        >
          <RotateCcw size={14} /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="kanji-draw-wrapper" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      maxWidth: size + 36,
      margin: '0 auto'
    }}>
      {/* =========================================================================
          SELECTOR DE 2 TABS: [筆順 Stroke Order] y [✍️ Practicar]
         ========================================================================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-main, #f1f5f9)',
        padding: '4px',
        borderRadius: '12px',
        width: '100%',
        gap: '6px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '9px',
            border: 'none',
            fontSize: '0.86rem',
            fontWeight: activeTab === 'order' ? 800 : 600,
            background: activeTab === 'order' ? '#ffffff' : 'transparent',
            color: activeTab === 'order' ? '#be123c' : 'var(--text-muted, #64748b)',
            boxShadow: activeTab === 'order' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
          title="Ver orden oficial de trazos con números y colores armónicos"
        >
          <PenTool size={14} />
          <span>筆順 Stroke Order</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '9px',
            border: 'none',
            fontSize: '0.86rem',
            fontWeight: activeTab === 'quiz' ? 800 : 600,
            background: activeTab === 'quiz' ? '#ffffff' : 'transparent',
            color: activeTab === 'quiz' ? 'var(--primary, #3b82f6)' : 'var(--text-muted, #64748b)',
            boxShadow: activeTab === 'quiz' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
          title="Practicar trazo a mano y ver animación"
        >
          <Target size={14} />
          <span>✍️ Practicar</span>
        </button>
      </div>

      {/* =========================================================================
          LIENZO PRINCIPAL CON CUADRÍCULA BIEN MARCADA
         ========================================================================= */}
      <div style={{
        position: 'relative',
        width: size,
        height: size,
        background: '#ffffff',
        borderRadius: '18px',
        border: '1.5px solid #cbd5e1',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        userSelect: 'none'
      }}>
        {/* Cuadrícula tradicional Tianzige / Mizige bien visible y nítida */}
        {showGrid && (
          <svg
            width={size}
            height={size}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
          >
            {/* Cruz central punteada (bien marcada) */}
            <line 
              x1={size / 2} y1={0} 
              x2={size / 2} y2={size} 
              stroke="#94a3b8" 
              strokeWidth={1.3} 
              strokeDasharray="5 4" 
              opacity={0.75}
            />
            <line 
              x1={0} y1={size / 2} 
              x2={size} y2={size / 2} 
              stroke="#94a3b8" 
              strokeWidth={1.3} 
              strokeDasharray="5 4" 
              opacity={0.75}
            />
            {/* Diagonales suaves */}
            <line 
              x1={0} y1={0} 
              x2={size} y2={size} 
              stroke="#cbd5e1" 
              strokeWidth={1} 
              strokeDasharray="4 4" 
              opacity={0.7}
            />
            <line 
              x1={0} y1={size} 
              x2={size} y2={0} 
              stroke="#cbd5e1" 
              strokeWidth={1} 
              strokeDasharray="4 4" 
              opacity={0.7}
            />
          </svg>
        )}

        {/* -------------------------------------------------------------
            MODO 1: DIAGRAMA 筆順 STROKE ORDER CON PALETA VIBRANTE
           ------------------------------------------------------------- */}
        {activeTab === 'order' && charData && (
          <svg
            width={size}
            height={size}
            style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'block' }}
          >
            {/* Trazos en orden */}
            <g transform={transform.transform}>
              {strokeItems.map((st, idx) => {
                const isVisible = activeStep === null || idx < activeStep;
                const isCurrentStep = activeStep !== null && idx === activeStep - 1;
                const isHovered = hoveredStrokeIndex === idx;

                let strokeFill = isMultiColor ? st.color : '#334155';
                let opacity = 1;

                if (!isVisible) {
                  strokeFill = '#e2e8f0';
                  opacity = 0.45;
                } else if (isHovered || isCurrentStep) {
                  strokeFill = st.color;
                  opacity = 1;
                }

                return (
                  <path
                    key={`stroke-${idx}`}
                    d={st.path}
                    fill={strokeFill}
                    opacity={opacity}
                    style={{
                      transition: 'fill 0.2s, opacity 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredStrokeIndex(idx)}
                    onMouseLeave={() => setHoveredStrokeIndex(null)}
                  />
                );
              })}
            </g>

            {/* Números identificadores de cada trazo */}
            {showNumbers && (
              <g style={{ zIndex: 5 }}>
                {strokeItems.map((st, idx) => {
                  const isVisible = activeStep === null || idx < activeStep;
                  const isCurrent = activeStep !== null && idx === activeStep - 1;
                  const isHovered = hoveredStrokeIndex === idx;

                  if (!isVisible && activeStep !== null) return null;

                  const numColor = isMultiColor ? st.color : '#1e293b';

                  return (
                    <g 
                      key={`num-${idx}`}
                      onMouseEnter={() => setHoveredStrokeIndex(idx)}
                      onMouseLeave={() => setHoveredStrokeIndex(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {(isCurrent || isHovered) && (
                        <circle
                          cx={st.numX}
                          cy={st.numY}
                          r={10.5}
                          fill="#ffffff"
                          stroke={numColor}
                          strokeWidth={1.6}
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                        />
                      )}

                      <text
                        x={st.numX}
                        y={st.numY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={numColor}
                        stroke="#ffffff"
                        strokeWidth={2.8}
                        strokeLinejoin="round"
                        style={{
                          paintOrder: 'stroke fill',
                          fontWeight: (isCurrent || isHovered) ? 900 : 800,
                          fontSize: (isCurrent || isHovered) ? '15px' : '13px',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          transition: 'all 0.15s ease',
                          userSelect: 'none'
                        }}
                      >
                        {st.number}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        )}

        {/* -------------------------------------------------------------
            MODO 2: CONTENEDOR HANZIWRITER (Practicar y Animar)
           ------------------------------------------------------------- */}
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: activeTab === 'order' ? 'none' : 'block'
          }}
        />

        {/* Overlay de Números Guía en Modo 'Practicar' */}
        {activeTab === 'quiz' && showQuizGuideNumbers && strokeItems.length > 0 && (
          <svg
            width={size}
            height={size}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}
          >
            {strokeItems.map((st, idx) => {
              const isPast = idx < currentQuizStroke;
              const isCurrent = idx === currentQuizStroke;

              return (
                <g key={`quiz-num-${idx}`}>
                  {isPast ? (
                    <circle
                      cx={st.numX}
                      cy={st.numY}
                      r={7}
                      fill="var(--success, #10b981)"
                      opacity={0.85}
                    />
                  ) : isCurrent ? (
                    <circle
                      cx={st.numX}
                      cy={st.numY}
                      r={10}
                      fill="#ffffff"
                      stroke={st.color}
                      strokeWidth={2}
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                    />
                  ) : null}

                  <text
                    x={st.numX}
                    y={st.numY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isPast ? '#ffffff' : (isCurrent ? st.color : 'rgba(100, 116, 139, 0.75)')}
                    stroke={isPast ? 'transparent' : '#ffffff'}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    style={{
                      paintOrder: 'stroke fill',
                      fontWeight: isCurrent ? 900 : 700,
                      fontSize: isPast ? '9px' : (isCurrent ? '14px' : '11px'),
                      fontFamily: 'system-ui, sans-serif'
                    }}
                  >
                    {isPast ? '✓' : st.number}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {/* Spinner de Carga */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.94)',
            gap: 8,
            color: '#334155',
            fontSize: '0.85rem',
            zIndex: 10
          }}>
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary, #3b82f6)' }} />
            <span>Cargando trazos de {character}...</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          CONTROLES: 筆順 STROKE ORDER
         ========================================================================= */}
      {activeTab === 'order' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {/* Stepper con Badge limpia (ej. "3 trazos" o "Trazo 1 de 3") */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border, #e2e8f0)',
            padding: '6px 8px',
            gap: 6
          }}>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => {
                setIsPlayingSteps(false);
                setActiveStep((prev) => (prev === null ? totalStrokes - 1 : Math.max(1, prev - 1)));
              }}
              disabled={activeStep === 1}
              title="Trazo anterior"
              style={{ padding: '4px 10px', fontSize: '0.82rem' }}
            >
              <ChevronLeft size={15} />
              <span>Ant.</span>
            </button>

            {/* Badge de cantidad de trazos solicitada en Punto 5 */}
            <button
              type="button"
              onClick={() => {
                setIsPlayingSteps(false);
                setActiveStep(null); // Resetea a todos los trazos
              }}
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 999,
                background: activeStep === null ? 'rgba(225, 29, 72, 0.08)' : 'var(--bg-main, #f1f5f9)',
                color: activeStep === null ? '#be123c' : 'var(--text-main, #0f172a)',
                border: activeStep === null ? '1px solid rgba(225, 29, 72, 0.25)' : '1px solid var(--border, #e2e8f0)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={activeStep !== null ? "Haz clic para ver todos los trazos" : `${totalStrokes} trazos en total`}
            >
              {activeStep === null 
                ? `${totalStrokes} trazos` 
                : `Trazo ${activeStep} de ${totalStrokes}`}
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => {
                setIsPlayingSteps(false);
                setActiveStep((prev) => (prev === null ? 1 : Math.min(totalStrokes, prev + 1)));
              }}
              disabled={activeStep === totalStrokes}
              title="Siguiente trazo"
              style={{ padding: '4px 10px', fontSize: '0.82rem' }}
            >
              <span>Sig.</span>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Fila 1: Paso a paso & Números */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button
              type="button"
              className={`btn btn-xs ${isPlayingSteps ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setIsPlayingSteps(!isPlayingSteps)}
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
            >
              {isPlayingSteps ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlayingSteps ? 'Pausar' : 'Paso a paso'}</span>
            </button>

            <button
              type="button"
              className={`btn btn-xs ${showNumbers ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowNumbers(!showNumbers)}
              style={{
                fontSize: '0.8rem',
                padding: '6px 10px',
                background: showNumbers ? '#be123c' : 'transparent',
                borderColor: showNumbers ? '#be123c' : 'var(--border)',
                color: showNumbers ? '#ffffff' : 'var(--text-muted)'
              }}
              title="Activar o desactivar números del orden de trazos"
            >
              <span>🔢 Números: {showNumbers ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Fila 2: Color & Cuadrícula (con indicador claro de ON/OFF - Punto 6) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button
              type="button"
              className={`btn btn-xs ${isMultiColor ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setIsMultiColor(!isMultiColor)}
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              title="Alternar entre paleta multicolor y monocromático"
            >
              <span>🎨 Color: {isMultiColor ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              className={`btn btn-xs ${showGrid ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowGrid(!showGrid)}
              style={{
                fontSize: '0.8rem',
                padding: '6px 10px',
                background: showGrid ? 'var(--primary, #3b82f6)' : 'transparent',
                borderColor: showGrid ? 'var(--primary, #3b82f6)' : 'var(--border)',
                color: showGrid ? '#ffffff' : 'var(--text-muted)'
              }}
              title="Activar o desactivar cuadrícula"
            >
              <Grid size={13} />
              <span>Cuadrícula: {showGrid ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTROLES: PRACTICAR (CON FUNCIÓN ANIMAR INTEGRADA - Punto 1)
         ========================================================================= */}
      {activeTab === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 6, width: '100%' }}>
            {/* Función Animar integrada en Practicar */}
            <button
              type="button"
              className={`btn btn-sm ${isAnimating ? 'btn-primary' : 'btn-outline'}`}
              onClick={handleAnimateInQuiz}
              disabled={isAnimating}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: '0.8rem', padding: '6px 8px' }}
              title="Ver animación del kanji trazo por trazo"
            >
              <Play size={14} />
              <span>{isAnimating ? 'Animando...' : 'Animar'}</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={startQuizSession}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: '0.8rem', padding: '6px 8px' }}
              title="Borrar lienzo y reiniciar quiz"
            >
              <RotateCcw size={14} />
              <span>Reiniciar</span>
            </button>

            {/* Toggle de Números Guía en el lienzo */}
            <button
              type="button"
              className={`btn btn-sm ${showQuizGuideNumbers ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowQuizGuideNumbers(!showQuizGuideNumbers)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                fontSize: '0.78rem',
                padding: '6px 8px',
                background: showQuizGuideNumbers ? 'var(--primary)' : 'transparent',
                color: showQuizGuideNumbers ? '#fff' : 'inherit'
              }}
              title="Mostrar u ocultar números guía sobre el lienzo"
            >
              <span>🔢 Guía: {showQuizGuideNumbers ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Feedback de Errores y Éxito */}
          <div style={{ fontSize: '0.82rem', textAlign: 'center' }}>
            {quizSuccess ? (
              <span style={{ color: 'var(--success, #10b981)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={14} />
                ¡Trazo completado en el orden y dirección correctos! 🎉
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted, #64748b)' }}>
                Trazo: <strong>{currentQuizStroke + 1} de {totalStrokes}</strong> • Errores: <strong style={{ color: errorCount > 0 ? 'var(--danger, #ef4444)' : 'inherit' }}>{errorCount}</strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
