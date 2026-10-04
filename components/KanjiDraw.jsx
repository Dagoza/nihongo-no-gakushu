'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Target, 
  Loader2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Grid,
  PenTool,
  Eye,
  EyeOff,
  Sparkles,
  Volume2
} from 'lucide-react';
import { 
  STROKE_COLORS, 
  fetchKanjiStrokeData, 
  computeStrokeNumbers, 
  getScalingTransform 
} from '../lib/kanjiStrokeUtils';
import audioManager from '../lib/audioManager';

export default function KanjiDraw({ 
  character, 
  size = 260, 
  onQuizComplete,
  initialMode = 'order' // 'order' (筆順 - Stroke Order) | 'quiz' | 'animate'
}) {
  const containerRef = useRef(null);
  const writerRef = useRef(null);
  
  // Modos principales: 'order' (Diagrama numerado), 'quiz' (Práctica interactiva), 'animate' (Animación)
  const [activeTab, setActiveTab] = useState(initialMode);
  
  // Datos vectoriales del Kanji
  const [charData, setCharData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Estados del Modo 'order' (Diagrama de Trazos Numerado - 筆順)
  const [activeStep, setActiveStep] = useState(null); // null = mostrar todos; número = paso específico (1..total)
  const [showNumbers, setShowNumbers] = useState(true);
  const [isMultiColor, setIsMultiColor] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [hoveredStrokeIndex, setHoveredStrokeIndex] = useState(null);
  const [isPlayingSteps, setIsPlayingSteps] = useState(false);
  const stepTimerRef = useRef(null);

  // Estados del Modo 'quiz' (Práctica con HanziWriter)
  const [currentQuizStroke, setCurrentQuizStroke] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [showQuizGuideNumbers, setShowQuizGuideNumbers] = useState(true);

  // Estados del Modo 'animate'
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

  // Manejo de paso a paso automático en modo Orden de Trazos
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

  // Inicialización de HanziWriter cuando se entra en 'quiz' o 'animate'
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
        charDataLoader: () => charData // Utiliza los datos ya precargados
      });

      if (activeTab === 'quiz') {
        startQuizSession();
      } else if (activeTab === 'animate') {
        runAnimation();
      }
    } catch (e) {
      console.error('Error inicializando HanziWriter:', e);
    }
  }, [character, charData, size, activeTab, animationSpeed]);

  useEffect(() => {
    if (activeTab === 'quiz' || activeTab === 'animate') {
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

  const runAnimation = () => {
    if (!writerRef.current) return;
    setIsAnimating(true);
    try {
      writerRef.current.cancelQuiz();
      writerRef.current.animateCharacter({
        onComplete: () => {
          setIsAnimating(false);
        }
      });
    } catch (e) {
      console.error('Error en animación:', e);
      setIsAnimating(false);
    }
  };

  // Reintento en caso de error
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
      gap: 14,
      width: '100%',
      maxWidth: size + 36,
      margin: '0 auto'
    }}>
      {/* =========================================================================
          CABECERA OFICIAL "筆順 - Stroke Order" (idéntica a la referencia)
         ========================================================================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '6px 12px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08), rgba(225, 29, 72, 0.04))',
        border: '1px solid rgba(244, 63, 94, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #e11d48, #be123c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 6px rgba(225, 29, 72, 0.3)'
          }}>
            <PenTool size={15} />
          </div>
          <span style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: '#be123c',
            letterSpacing: '0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span>筆順</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.85 }}>— Stroke Order</span>
          </span>
        </div>

        <div style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          background: '#fff',
          color: '#be123c',
          padding: '2px 8px',
          borderRadius: 999,
          border: '1px solid rgba(244, 63, 94, 0.25)'
        }}>
          {totalStrokes > 0 ? `${totalStrokes} trazos` : 'Cargando...'}
        </div>
      </div>

      {/* =========================================================================
          SELECTOR DE MODOS (Orden con Números / Practicar / Animar)
         ========================================================================= */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-main, #f1f5f9)',
        padding: '3px',
        borderRadius: '10px',
        width: '100%',
        gap: '4px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          style={{
            flex: 1,
            padding: '6px 8px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: activeTab === 'order' ? 700 : 500,
            background: activeTab === 'order' ? '#ffffff' : 'transparent',
            color: activeTab === 'order' ? '#be123c' : 'var(--text-muted, #64748b)',
            boxShadow: activeTab === 'order' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4
          }}
          title="Ver orden oficial de trazos con números y colores"
        >
          <span>🔢 Orden (123)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          style={{
            flex: 1,
            padding: '6px 8px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: activeTab === 'quiz' ? 700 : 500,
            background: activeTab === 'quiz' ? '#ffffff' : 'transparent',
            color: activeTab === 'quiz' ? 'var(--primary, #3b82f6)' : 'var(--text-muted, #64748b)',
            boxShadow: activeTab === 'quiz' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4
          }}
          title="Dibujar y practicar trazos interactivamente"
        >
          <Target size={13} />
          <span>Practicar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('animate')}
          style={{
            flex: 1,
            padding: '6px 8px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: activeTab === 'animate' ? 700 : 500,
            background: activeTab === 'animate' ? '#ffffff' : 'transparent',
            color: activeTab === 'animate' ? 'var(--primary, #3b82f6)' : 'var(--text-muted, #64748b)',
            boxShadow: activeTab === 'animate' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4
          }}
          title="Ver animación trazo a trazo"
        >
          <Play size={13} />
          <span>Animar</span>
        </button>
      </div>

      {/* =========================================================================
          LIENZO PRINCIPAL
         ========================================================================= */}
      <div style={{
        position: 'relative',
        width: size,
        height: size,
        background: '#ffffff',
        borderRadius: '18px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        userSelect: 'none'
      }}>
        {/* Cuadrícula tradicional Tianzige / Mizige de fondo */}
        {showGrid && (
          <svg
            width={size}
            height={size}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
          >
            {/* Cruz central punteada */}
            <line 
              x1={size / 2} y1={0} 
              x2={size / 2} y2={size} 
              stroke="#e2e8f0" 
              strokeWidth={1} 
              strokeDasharray="4 4" 
            />
            <line 
              x1={0} y1={size / 2} 
              x2={size} y2={size / 2} 
              stroke="#e2e8f0" 
              strokeWidth={1} 
              strokeDasharray="4 4" 
            />
            {/* Diagonales suaves */}
            <line 
              x1={0} y1={0} 
              x2={size} y2={size} 
              stroke="#f1f5f9" 
              strokeWidth={1} 
              strokeDasharray="3 3" 
            />
            <line 
              x1={0} y1={size} 
              x2={size} y2={0} 
              stroke="#f1f5f9" 
              strokeWidth={1} 
              strokeDasharray="3 3" 
            />
          </svg>
        )}

        {/* -------------------------------------------------------------
            MODO 1: DIAGRAMA NUMERADO OFICIAL (筆順 - Stroke Order)
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
                  // Muestra el trazo en contorno muy tenue si aún no se ha dibujado en el paso a paso
                  strokeFill = '#e2e8f0';
                  opacity = 0.55;
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
                      {/* Círculo suave de respaldo cuando está resaltado */}
                      {(isCurrent || isHovered) && (
                        <circle
                          cx={st.numX}
                          cy={st.numY}
                          r={10.5}
                          fill="#ffffff"
                          stroke={numColor}
                          strokeWidth={1.5}
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                        />
                      )}

                      {/* Texto con halo blanco alrededor para máxima legibilidad */}
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
                          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
            MODO 2 & 3: CONTENEDOR HANZIWRITER (Practicar y Animar)
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
                  {/* Si ya fue completado con éxito */}
                  {isPast ? (
                    <circle
                      cx={st.numX}
                      cy={st.numY}
                      r={7}
                      fill="var(--success, #10b981)"
                      opacity={0.85}
                    />
                  ) : isCurrent ? (
                    /* El trazo actual pulsa con círculo blanco resaltado */
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
          CONTROLES ESPECÍFICOS SEGÚN EL MODO ACTIVO
         ========================================================================= */}
      
      {/* 1. CONTROLES DEL MODO "筆順 - Stroke Order" */}
      {activeTab === 'order' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {/* Stepper Paso a Paso */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border, #e2e8f0)',
            padding: '6px 10px',
            gap: 8
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
              style={{ padding: '4px 8px' }}
            >
              <ChevronLeft size={16} />
              <span>Ant.</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => {
                setIsPlayingSteps(false);
                setActiveStep(null);
              }}
              style={{
                fontWeight: activeStep === null ? 700 : 500,
                color: activeStep === null ? '#be123c' : 'var(--text-muted, #64748b)',
                fontSize: '0.82rem'
              }}
            >
              {activeStep === null 
                ? `Todos los trazos (${totalStrokes})` 
                : `Paso ${activeStep} de ${totalStrokes}`}
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
              style={{ padding: '4px 8px' }}
            >
              <span>Sig.</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Botones de acción & Toggles */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-xs ${isPlayingSteps ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setIsPlayingSteps(!isPlayingSteps)}
              style={{ fontSize: '0.78rem' }}
            >
              {isPlayingSteps ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlayingSteps ? 'Pausar' : 'Paso a paso'}</span>
            </button>

            <button
              type="button"
              className={`btn btn-xs ${showNumbers ? 'btn-outline' : 'btn-ghost'}`}
              onClick={() => setShowNumbers(!showNumbers)}
              style={{ fontSize: '0.78rem', color: showNumbers ? '#be123c' : 'var(--text-muted)' }}
              title="Mostrar / ocultar números del orden de trazos"
            >
              <span>🔢 Números: {showNumbers ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setIsMultiColor(!isMultiColor)}
              style={{ fontSize: '0.78rem' }}
              title="Alternar entre paleta multicolor o monocromática"
            >
              <span>🎨 {isMultiColor ? 'Color' : 'Mono'}</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setShowGrid(!showGrid)}
              style={{ fontSize: '0.78rem' }}
              title="Mostrar / ocultar cuadrícula"
            >
              <Grid size={13} />
            </button>
          </div>

          {/* Explicación contextual de trazo activo */}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', textAlign: 'center' }}>
            {hoveredStrokeIndex !== null ? (
              <span style={{ color: strokeItems[hoveredStrokeIndex]?.color, fontWeight: 700 }}>
                Trazo #{hoveredStrokeIndex + 1} de {totalStrokes}
              </span>
            ) : activeStep !== null ? (
              <span>Visualizando hasta el trazo <strong>#{activeStep}</strong></span>
            ) : (
              <span>Haz clic en cualquier número o flecha para ver el paso a paso.</span>
            )}
          </div>
        </div>
      )}

      {/* 2. CONTROLES DEL MODO "✍️ Practicar" */}
      {activeTab === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', width: '100%' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={startQuizSession}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
            >
              <RotateCcw size={14} />
              <span>Reiniciar</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${showQuizGuideNumbers ? 'btn-outline' : 'btn-ghost'}`}
              onClick={() => setShowQuizGuideNumbers(!showQuizGuideNumbers)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem' }}
              title="Mostrar números de orden sobre el lienzo mientras dibujas"
            >
              <span>🔢 Guía {showQuizGuideNumbers ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div style={{ fontSize: '0.82rem', textAlign: 'center' }}>
            {quizSuccess ? (
              <span style={{ color: 'var(--success, #10b981)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={14} />
                ¡Trazo completado en el orden y dirección correctos! 🎉
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted, #64748b)' }}>
                Trazo actual: <strong>{currentQuizStroke + 1} de {totalStrokes}</strong> • Errores: <strong style={{ color: errorCount > 0 ? 'var(--danger, #ef4444)' : 'inherit' }}>{errorCount}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. CONTROLES DEL MODO "▶️ Animar" */}
      {activeTab === 'animate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={runAnimation}
              disabled={isAnimating}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
            >
              <Play size={14} />
              <span>{isAnimating ? 'Animando...' : 'Reproducir'}</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                const speeds = [1.0, 1.4, 2.0];
                const next = speeds[(speeds.indexOf(animationSpeed) + 1) % speeds.length];
                setAnimationSpeed(next);
              }}
              style={{ fontSize: '0.82rem' }}
              title="Velocidad de reproducción"
            >
              <span>{animationSpeed}x</span>
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Observa el orden secuencial y el punto de inicio de cada trazo.
          </div>
        </div>
      )}
    </div>
  );
}
