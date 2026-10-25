'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import { 
  Volume2, 
  RotateCcw, 
  Undo2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Award, 
  PenTool, 
  Layers, 
  ArrowRight,
  Info,
  Maximize2,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../../lib/AppContext';
import audioManager from '../../lib/audioManager';
import { triggerCheerConfetti } from '../../lib/confetti';
import { STROKE_COLORS, fetchKanjiStrokeData } from '../../lib/kanjiStrokeUtils';

// Estilos de papel tradicionales para delimitar claramente los límites del lienzo
export const SCRIPT_PAPER_STYLES = {
  washi: {
    id: 'washi',
    label: 'Washi Tradicional (和紙)',
    shortLabel: 'Washi',
    icon: '📜',
    bg: '#faf6ee',
    border: '2.5px solid #d4c7b0',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.45), inset 0 0 20px rgba(180, 83, 9, 0.05)',
    gridColor: 'rgba(180, 83, 9, 0.28)',
    strokeColor: '#18181b', // Tinta Sumi negra auténtica
    outlineColor: 'rgba(100, 116, 139, 0.38)',
    drawingColor: '#2563eb', // Trazo azul real vivo
    highlightColor: '#d97706', // Ámbar dorado cálido
    highlightCompleteColor: '#b45309',
    isDark: false
  },
  white: {
    id: 'white',
    label: 'Papel Blanco Puro (白紙)',
    shortLabel: 'Blanco',
    icon: '📄',
    bg: '#ffffff',
    border: '2.5px solid #cbd5e1',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.38)',
    gridColor: 'rgba(148, 163, 184, 0.45)',
    strokeColor: '#0f172a',
    outlineColor: 'rgba(100, 116, 139, 0.38)',
    drawingColor: '#2563eb',
    highlightColor: '#d97706',
    highlightCompleteColor: '#b45309',
    isDark: false
  },
  chalkboard: {
    id: 'chalkboard',
    label: 'Pizarra Oscura (黒板)',
    shortLabel: 'Pizarra',
    icon: '⬛',
    bg: '#0a0f1d',
    border: '2.5px solid #334155',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.65), inset 0 0 20px rgba(0, 0, 0, 0.6)',
    gridColor: 'rgba(148, 163, 184, 0.35)',
    strokeColor: '#ffffff', // Tiza blanca luminosa
    outlineColor: 'rgba(224, 231, 255, 0.40)',
    drawingColor: '#22d3ee', // Cyan neón eléctrico
    highlightColor: '#fbbf24', // Oro radiante
    highlightCompleteColor: '#f59e0b',
    isDark: true
  }
};

// Casilla individual táctil para el modo Tira Continua (con soporte de Trazo Guiado HanziWriter y fallback libre)
function ContinuousCharBox({
  char,
  charIndex,
  totalChars = 1,
  isActive,
  onSelect,
  onSelectNext,
  strokes = [],
  onStrokesChange,
  currentPaper,
  showGhostGuide,
  size = 220,
  onCharComplete,
  isAlreadyCompleted = false,
  onRegisterActions
}) {
  const writerContainerRef = useRef(null);
  const writerRef = useRef(null);
  const canvasRef = useRef(null);

  const [hasWriterData, setHasWriterData] = useState(true);
  const [writerLoaded, setWriterLoaded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted);
  const [isAnimating, setIsAnimating] = useState(false);

  // Estado para el motor libre (cuando no hay datos de trazo)
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef([]);

  // Animar pista guiada
  const handleAnimateHint = useCallback(() => {
    if (writerRef.current && !isAnimating) {
      setIsAnimating(true);
      writerRef.current.animateCharacter({
        onComplete: () => setIsAnimating(false)
      });
    }
  }, [isAnimating]);

  // Reiniciar quiz del carácter
  const handleResetBox = useCallback(() => {
    setIsCompleted(false);
    if (writerRef.current) {
      try {
        writerRef.current.cancelQuiz();
        writerRef.current.quiz();
      } catch {}
    }
    if (onStrokesChange) {
      onStrokesChange([]);
    }
  }, [onStrokesChange]);

  // Registrar acciones hacia el componente padre
  useEffect(() => {
    if (onRegisterActions) {
      onRegisterActions(charIndex, {
        animateHint: handleAnimateHint,
        clear: handleResetBox,
        undo: () => {
          if (!hasWriterData && strokes.length > 0) {
            onStrokesChange(strokes.slice(0, -1));
          }
        },
        hasWriterData,
        isCompleted
      });
    }
  }, [charIndex, onRegisterActions, handleAnimateHint, handleResetBox, hasWriterData, isCompleted, strokes, onStrokesChange]);

  // Inicializar HanziWriter para este carácter en la tira continua
  useEffect(() => {
    if (!writerContainerRef.current || !char) return;

    let isMounted = true;
    setWriterLoaded(false);
    setHasWriterData(true);

    writerContainerRef.current.innerHTML = '';

    try {
      const padding = Math.max(12, Math.floor(size * 0.08));
      const writer = HanziWriter.create(writerContainerRef.current, char, {
        width: size,
        height: size,
        padding,
        showOutline: showGhostGuide,
        strokeAnimationSpeed: 1.3,
        strokeHighlightSpeed: 1.8,
        delayBetweenStrokes: 150,
        strokeColor: currentPaper.strokeColor,
        outlineColor: currentPaper.outlineColor,
        highlightColor: currentPaper.highlightColor,
        highlightCompleteColor: currentPaper.highlightCompleteColor,
        drawingColor: currentPaper.drawingColor,
        drawingWidth: Math.max(16, Math.floor(size * 0.1)),
        showCharacter: false,
        charDataLoader: (targetChar, onComplete, onErr) => {
          fetchKanjiStrokeData(targetChar)
            .then(data => {
              if (isMounted) {
                onComplete(data);
                setWriterLoaded(true);
                setHasWriterData(true);
              }
            })
            .catch(err => {
              if (isMounted) {
                console.warn(`No stroke data for ${targetChar} in continuous mode:`, err);
                setHasWriterData(false);
                if (onErr) onErr(err);
              }
            });
        }
      });

      writerRef.current = writer;

      writer.quiz({
        showHintAfterMisses: 2,
        leniency: 1.15,
        onMistake: () => {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(40);
          }
        },
        onCorrectStroke: () => {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(20);
          }
        },
        onComplete: () => {
          if (!isMounted) return;
          setIsCompleted(true);
          onCharComplete?.(charIndex);
          if (charIndex < totalChars - 1) {
            setTimeout(() => {
              onSelectNext?.(charIndex + 1);
            }, 500);
          }
        }
      });

      setWriterLoaded(true);
    } catch (err) {
      console.warn('Continuous HanziWriter init fallback:', err);
      setHasWriterData(false);
    }

    return () => {
      isMounted = false;
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch {}
      }
    };
  }, [char, size, currentPaper, totalChars, charIndex, onCharComplete, onSelectNext]);

  // Actualizar silueta cuando cambia showGhostGuide
  useEffect(() => {
    if (writerRef.current) {
      try {
        if (showGhostGuide) {
          writerRef.current.showOutline();
        } else {
          writerRef.current.hideOutline();
        }
      } catch {}
    }
  }, [showGhostGuide]);

  // ==========================================
  // Fallback Canvas libre cuando !hasWriterData
  // ==========================================
  const redrawFree = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || hasWriterData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    // Fondo y cuadrícula Mizige
    ctx.fillStyle = currentPaper.bg;
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.strokeStyle = currentPaper.gridColor;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(6, 6, size - 12, size - 12);
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(size / 2, 6);
    ctx.lineTo(size / 2, size - 6);
    ctx.moveTo(6, size / 2);
    ctx.lineTo(size - 6, size / 2);
    ctx.moveTo(6, 6);
    ctx.lineTo(size - 6, size - 6);
    ctx.moveTo(size - 6, 6);
    ctx.lineTo(6, size - 6);
    ctx.stroke();
    ctx.restore();

    // Silueta si ghost guide está activa
    if (showGhostGuide && char) {
      ctx.save();
      ctx.font = `bold ${Math.floor(size * 0.72)}px "Noto Sans JP", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = currentPaper.isDark ? 'rgba(224, 231, 255, 0.35)' : 'rgba(100, 116, 139, 0.25)';
      ctx.fillText(char, size / 2, size / 2 + 6);
      ctx.restore();
    }

    // Trazos libres
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentPaper.strokeColor;
    strokes.forEach(stroke => {
      if (!stroke || stroke.length < 2) return;
      ctx.beginPath();
      ctx.lineWidth = stroke[0].w || 10;
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });
    ctx.restore();
  }, [char, currentPaper, hasWriterData, showGhostGuide, size, strokes]);

  useEffect(() => {
    if (!hasWriterData) {
      redrawFree();
    }
  }, [hasWriterData, redrawFree]);

  const handlePointerDown = (e) => {
    if (hasWriterData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}

    onSelect();

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    currentStrokeRef.current = [{ x, y, w: 10 }];
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || hasWriterData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStrokeRef.current.push({ x, y, w: 10 });

    const ctx = canvas.getContext('2d');
    if (ctx && currentStrokeRef.current.length >= 2) {
      const len = currentStrokeRef.current.length;
      const p1 = currentStrokeRef.current[len - 2];
      const p2 = currentStrokeRef.current[len - 1];

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = currentPaper.drawingColor || currentPaper.strokeColor;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStrokeRef.current.length > 0) {
      const updated = [...strokes, currentStrokeRef.current];
      onStrokesChange(updated);
      currentStrokeRef.current = [];
      if (!isCompleted && updated.length >= 2) {
        setIsCompleted(true);
        onCharComplete?.(charIndex);
      }
    }
  };

  return (
    <div 
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        maxWidth: size + 20,
        cursor: 'pointer'
      }}
    >
      {/* Cabecera con número de casilla, carácter y controles rápidos */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: size,
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
            background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
            padding: '2px 8px',
            borderRadius: 6
          }}>
            #{charIndex + 1}
          </span>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {char}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isCompleted ? (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(16, 185, 129, 0.12)',
              padding: '3px 8px',
              borderRadius: 8
            }}>
              <CheckCircle2 size={13} />
              <span>Listo</span>
            </span>
          ) : (
            hasWriterData ? (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                  handleAnimateHint();
                }}
                disabled={isAnimating}
                title={`Ver animación de trazos para ${char}`}
                style={{
                  padding: '3px 8px',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  borderColor: '#f59e0b',
                  color: '#f59e0b',
                  background: 'rgba(245, 158, 11, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Sparkles size={12} />
                <span>Pista</span>
              </button>
            ) : (
              strokes.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStrokesChange([]);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: '3px 8px',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title={`Borrar trazos de ${char}`}
                >
                  <RotateCcw size={12} />
                  <span>Limpiar</span>
                </button>
              )
            )
          )}
        </div>
      </div>

      {/* Casilla de lienzo físico delimitado */}
      <div style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: 20,
        overflow: 'hidden',
        background: currentPaper.bg,
        border: isCompleted 
          ? '2.5px solid #10b981' 
          : (isActive ? '2.5px solid var(--primary)' : currentPaper.border),
        boxShadow: isCompleted 
          ? '0 0 0 3px rgba(16, 185, 129, 0.25), ' + currentPaper.shadow 
          : (isActive ? '0 0 0 3px rgba(99, 102, 241, 0.25), ' + currentPaper.shadow : currentPaper.shadow),
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
      }}>
        {/* Cuadrícula japonesa Mizige */}
        <svg
          width={size}
          height={size}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <rect
            x={6}
            y={6}
            width={size - 12}
            height={size - 12}
            fill="none"
            stroke={currentPaper.gridColor}
            strokeWidth={1.3}
            rx={8}
          />
          <line
            x1={size / 2} y1={6}
            x2={size / 2} y2={size - 6}
            stroke={currentPaper.gridColor}
            strokeWidth={1.3}
            strokeDasharray="5 4"
          />
          <line
            x1={6} y1={size / 2}
            x2={size - 6} y2={size / 2}
            stroke={currentPaper.gridColor}
            strokeWidth={1.3}
            strokeDasharray="5 4"
          />
          <line
            x1={6} y1={6}
            x2={size - 6} y2={size - 6}
            stroke={currentPaper.gridColor}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.6}
          />
          <line
            x1={size - 6} y1={6}
            x2={6} y2={size - 6}
            stroke={currentPaper.gridColor}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.6}
          />
        </svg>

        {/* Motor HanziWriter (Trazo Guiado) */}
        {hasWriterData ? (
          <>
            {!writerLoaded && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: currentPaper.bg,
                color: currentPaper.isDark ? '#94a3b8' : '#64748b',
                fontSize: '0.78rem',
                zIndex: 10
              }}>
                <span>Cargando trazos...</span>
              </div>
            )}
            <div 
              ref={writerContainerRef} 
              style={{ 
                position: 'relative',
                width: size, 
                height: size, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                zIndex: 2,
                touchAction: 'none'
              }} 
            />
          </>
        ) : (
          /* Motor Libre (Canvas fallback) */
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              position: 'relative',
              width: size,
              height: size,
              zIndex: 2,
              cursor: 'crosshair',
              touchAction: 'none'
            }}
          />
        )}

        {/* Feedback visual al completar */}
        {isCompleted && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#ffffff',
            padding: '8px 18px',
            borderRadius: 24,
            fontSize: '0.9rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
            zIndex: 20,
            pointerEvents: 'none'
          }}>
            <CheckCircle2 size={18} />
            <span>¡Correcto!</span>
          </div>
        )}
      </div>

      {/* Pequeña nota cuando no hay trazo guiado */}
      {!hasWriterData && (
        <div style={{
          marginTop: 4,
          padding: '4px 10px',
          borderRadius: 8,
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          color: 'var(--text-main)',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          textAlign: 'center',
          maxWidth: size
        }}>
          <Info size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>Trazo guiado no disponible para «{char}». Modo libre activado.</span>
        </div>
      )}
    </div>
  );
}

export default function ScriptpadWriter({
  lesson,
  onClose,
  onComplete,
  appState = {},
  onUpdateState
}) {
  const words = useMemo(() => lesson?.words || [], [lesson]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const currentWord = words[currentWordIndex] || words[0];

  // Estilo de papel (Washi tradicional por defecto para delimitar claramente los límites físicos del lienzo)
  const [paperStyle, setPaperStyle] = useState('washi');
  const currentPaper = SCRIPT_PAPER_STYLES[paperStyle] || SCRIPT_PAPER_STYLES.washi;
  const isDark = currentPaper.isDark;

  // Dimensiones dinámicas del tablero para máxima adaptabilidad en móvil / desktop
  const [padSize, setPadSize] = useState(280);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateSize = () => {
      // Ajuste dinámico para garantizar que el lienzo y su tarjeta encajen perfectamente en pantallas móviles sin desbordar
      const available = Math.min(300, Math.max(220, window.innerWidth - 72));
      setPadSize(available);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Desglosar caracteres de la palabra activa
  const characters = useMemo(() => {
    if (!currentWord) return ['日'];
    const text = (currentWord.kanji || currentWord.hiragana || '').trim();
    const chars = Array.from(text).filter(c => c && c.trim().length > 0);
    return chars.length > 0 ? chars : ['日'];
  }, [currentWord]);

  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const activeChar = characters[currentCharIndex] || characters[0] || '日';

  // Toggles de privacidad para autoevaluación (Requerimiento de usuario)
  const [showKana, setShowKana] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showGhostGuide, setShowGhostGuide] = useState(true);

  // Selector Manual de Flujo: 'sequential' (carácter por carácter) vs 'continuous' (tira multi-casilla)
  const [flowMode, setFlowMode] = useState('sequential'); // 'sequential' | 'continuous'

  // Motor de dibujo: 'guided' (HanziWriter trazo a trazo) vs 'free' (Caligrafía con pincel libre)
  const [engineMode, setEngineMode] = useState('guided'); // 'guided' | 'free'

  // Estado del lienzo libre (para 'free' o 'continuous')
  const canvasRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef([]);

  // Multi-casillas para modo continuo
  const [continuousStrokes, setContinuousStrokes] = useState({}); // { [charIndex]: [strokes] }
  const [continuousCompleted, setContinuousCompleted] = useState({}); // { [charIndex]: boolean }
  const [continuousActiveIndex, setContinuousActiveIndex] = useState(0);
  const continuousActionsRef = useRef({});
  const registerContinuousAction = useCallback((charIdx, actions) => {
    continuousActionsRef.current[charIdx] = actions;
  }, []);

  // Total de caracteres completados en modo continuo (trazo guiado o libre)
  const totalCompletedInContinuous = useMemo(() => {
    return characters.filter((_, idx) => {
      return continuousCompleted[idx] || (continuousStrokes[idx] && continuousStrokes[idx].length > 0);
    }).length;
  }, [characters, continuousCompleted, continuousStrokes]);

  // Estados de HanziWriter (modo guiado)
  const writerContainerRef = useRef(null);
  const writerRef = useRef(null);
  const [writerLoaded, setWriterLoaded] = useState(false);
  const [hasWriterData, setHasWriterData] = useState(true);
  const [charCompleted, setCharCompleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Estado general de progreso de la lección
  const [wordsPracticed, setWordsPracticed] = useState([]);
  const [isLessonFinished, setIsLessonFinished] = useState(false);

  // Audio de la palabra actual
  const playCurrentWordAudio = useCallback(() => {
    if (!currentWord) return;
    try {
      if (typeof audioManager?.playWord === 'function') {
        audioManager.playWord(currentWord);
      } else if (typeof audioManager?.speak === 'function') {
        audioManager.speak(currentWord.hiragana || currentWord.kana || currentWord.kanji || '', {
          audioUrl: currentWord.audio_url
        });
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }, [currentWord]);

  // Al cambiar de palabra
  useEffect(() => {
    setCurrentCharIndex(0);
    setStrokes([]);
    setContinuousStrokes({});
    setContinuousCompleted({});
    continuousActionsRef.current = {};
    setContinuousActiveIndex(0);
    setCharCompleted(false);
    setHasWriterData(true);
    if (flowMode === 'sequential') {
      setEngineMode('guided');
    }
    playCurrentWordAudio();
  }, [currentWordIndex, playCurrentWordAudio, flowMode]);

  // Al cambiar de carácter en modo secuencial
  useEffect(() => {
    setCharCompleted(false);
    setStrokes([]);
    setWriterLoaded(false);
    setHasWriterData(true);
    if (flowMode === 'sequential') {
      setEngineMode('guided');
    }
  }, [currentCharIndex, currentWordIndex, flowMode]);

  // Inicializar HanziWriter en modo 'guided' para el carácter activo
  useEffect(() => {
    if (flowMode === 'continuous') return;
    if (!writerContainerRef.current || !activeChar) return;

    let isMounted = true;
    setWriterLoaded(false);
    setCharCompleted(false);

    // Limpiar contenedor previo
    writerContainerRef.current.innerHTML = '';

    try {
      const writer = HanziWriter.create(writerContainerRef.current, activeChar, {
        width: padSize,
        height: padSize,
        padding: 16,
        showOutline: showGhostGuide,
        strokeAnimationSpeed: 1.3,
        strokeHighlightSpeed: 1.8,
        delayBetweenStrokes: 150,
        // Colores adaptados al estilo de papel seleccionado (Washi, Blanco o Pizarra)
        strokeColor: currentPaper.strokeColor,
        outlineColor: currentPaper.outlineColor,
        highlightColor: currentPaper.highlightColor,
        highlightCompleteColor: currentPaper.highlightCompleteColor,
        drawingColor: currentPaper.drawingColor,
        drawingWidth: 22,
        showCharacter: false,
        charDataLoader: (char, onComplete, onErr) => {
          fetchKanjiStrokeData(char)
            .then(data => {
              if (isMounted) {
                onComplete(data);
                setWriterLoaded(true);
                setHasWriterData(true);
                setEngineMode('guided');
              }
            })
            .catch(err => {
              if (isMounted) {
                console.warn(`No stroke data for ${char}, fallback to free canvas:`, err);
                setHasWriterData(false);
                setEngineMode('free');
                if (onErr) onErr(err);
              }
            });
        }
      });

      writerRef.current = writer;

      // Iniciar modo Quiz interactivo con asistencia amigable
      writer.quiz({
        showHintAfterMisses: 2,
        leniency: 1.15,
        onMistake: (strokeData) => {
          // Vibración háptica suave si está soportada
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(40);
          }
        },
        onCorrectStroke: () => {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(20);
          }
        },
        onComplete: (summary) => {
          if (!isMounted) return;
          setCharCompleted(true);
          // Auto avance suave al siguiente carácter
          setTimeout(() => {
            handleNextChar();
          }, 600);
        }
      });

      setWriterLoaded(true);
    } catch (err) {
      console.warn('HanziWriter init fallback:', err);
      setHasWriterData(false);
      setEngineMode('free');
    }

    return () => {
      isMounted = false;
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch {}
      }
    };
  }, [activeChar, flowMode, showGhostGuide, paperStyle, padSize]);

  // Actualizar visibilidad de silueta en HanziWriter si cambia toggle
  useEffect(() => {
    if (writerRef.current) {
      try {
        if (showGhostGuide) {
          writerRef.current.showOutline();
        } else {
          writerRef.current.hideOutline();
        }
      } catch {}
    }
  }, [showGhostGuide]);

  // Animar trazo de ayuda
  const handleAnimateHint = () => {
    if (flowMode === 'continuous') {
      const activeActions = continuousActionsRef.current[continuousActiveIndex];
      if (activeActions?.animateHint) {
        activeActions.animateHint();
      }
      return;
    }

    if (writerRef.current && !isAnimating) {
      setIsAnimating(true);
      writerRef.current.animateCharacter({
        onComplete: () => setIsAnimating(false)
      });
    }
  };

  // Avanzar al siguiente carácter o siguiente palabra
  const handleNextChar = () => {
    if (currentCharIndex < characters.length - 1) {
      setCurrentCharIndex(prev => prev + 1);
      setCharCompleted(false);
      setStrokes([]);
      setHasWriterData(true);
      if (flowMode === 'sequential') {
        setEngineMode('guided');
      }
    } else {
      // Palabra completada
      handleCompleteCurrentWord();
    }
  };

  // Retroceder al carácter anterior
  const handlePrevChar = () => {
    if (currentCharIndex > 0) {
      setCurrentCharIndex(prev => prev - 1);
      setCharCompleted(false);
      setStrokes([]);
      setHasWriterData(true);
      if (flowMode === 'sequential') {
        setEngineMode('guided');
      }
    }
  };

  // Completar la palabra actual y pasar a la siguiente
  const handleCompleteCurrentWord = () => {
    triggerCheerConfetti();
    const updated = [...wordsPracticed, currentWord];
    setWordsPracticed(updated);

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      // Lección terminada
      setIsLessonFinished(true);
      if (onComplete) {
        onComplete({
          mode: 'write',
          score: 100,
          totalWords: words.length,
          stars: 3,
          wordsPracticed: updated
        });
      }
    }
  };

  // ==========================================
  // MANEJO DE LIENZO LIBRE (FREEHAND CANVAS)
  // ==========================================
  const redrawFreeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // 1. Dibujar cuadrícula japonesa tradicional (米字格 Mizige) con marco perimetral para delimitar el lienzo
    ctx.save();
    ctx.strokeStyle = currentPaper.gridColor;
    ctx.lineWidth = 1.5;

    // Marco exterior para delimitar físicamente el lienzo
    ctx.strokeRect(8, 8, width - 16, height - 16);

    ctx.setLineDash([5, 4]);
    // Cruz central
    ctx.beginPath();
    ctx.moveTo(width / 2, 8);
    ctx.lineTo(width / 2, height - 8);
    ctx.moveTo(8, height / 2);
    ctx.lineTo(width - 8, height / 2);
    // Diagonales
    ctx.moveTo(8, 8);
    ctx.lineTo(width - 8, height - 8);
    ctx.moveTo(width - 8, 8);
    ctx.lineTo(8, height - 8);
    ctx.stroke();
    ctx.restore();

    // 2. Silueta de fondo (Ghost outline) si está habilitada
    if (showGhostGuide && activeChar) {
      ctx.save();
      ctx.font = `bold ${Math.floor(height * 0.72)}px "Noto Sans JP", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = currentPaper.isDark ? 'rgba(224, 231, 255, 0.28)' : 'rgba(100, 116, 139, 0.22)';
      ctx.fillText(activeChar, width / 2, height / 2 + 8);
      ctx.restore();
    }

    // 3. Renderizar trazos del usuario
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentPaper.strokeColor;

    strokes.forEach(stroke => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.lineWidth = stroke[0].w || 12;
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });
    ctx.restore();
  }, [strokes, showGhostGuide, activeChar, currentPaper]);

  useEffect(() => {
    if (engineMode === 'free' || !hasWriterData) {
      redrawFreeCanvas();
    }
  }, [engineMode, hasWriterData, redrawFreeCanvas]);

  // Pointer events para dibujo fluido y sin pull-to-refresh
  const handlePointerDown = (e) => {
    if (engineMode !== 'free' && hasWriterData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    currentStrokeRef.current = [{ x, y, w: 12 }];
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || (engineMode !== 'free' && hasWriterData)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStrokeRef.current.push({ x, y, w: 12 });
    setStrokes([...strokes, [...currentStrokeRef.current]]);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStrokeRef.current.length > 0) {
      setStrokes(prev => [...prev, currentStrokeRef.current]);
      currentStrokeRef.current = [];
    }
  };

  const handleClearStrokes = () => {
    if (flowMode === 'continuous') {
      setContinuousStrokes(prev => {
        const copy = { ...prev };
        if (copy[continuousActiveIndex]?.length > 0) {
          copy[continuousActiveIndex] = [];
        } else {
          return {};
        }
        return copy;
      });
      return;
    }

    setStrokes([]);
    if (writerRef.current) {
      try {
        writerRef.current.cancelQuiz();
        writerRef.current.quiz();
      } catch {}
    }
  };

  const handleUndoStroke = () => {
    if (flowMode === 'continuous') {
      setContinuousStrokes(prev => {
        const currentList = prev[continuousActiveIndex] || [];
        if (currentList.length === 0) return prev;
        return {
          ...prev,
          [continuousActiveIndex]: currentList.slice(0, -1)
        };
      });
      return;
    }

    if (strokes.length > 0) {
      setStrokes(prev => prev.slice(0, -1));
    }
  };

  // ==========================================
  // PANTALLA DE FELICITACIÓN FINAL
  // ==========================================
  if (isLessonFinished) {
    return (
      <div className="scriptpad-finish-view" style={{
        maxWidth: 580,
        margin: '0 auto',
        padding: '32px 20px',
        textAlign: 'center',
        background: 'var(--bg-surface)',
        borderRadius: 24,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
        }}>
          <Award size={44} />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
          ¡Lección Completada!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 24 }}>
          Has practicado la escritura a mano de <strong>{words.length} palabras</strong> en {lesson.title}.
        </p>

        {/* Resumen de palabras dominadas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 10,
          marginBottom: 32,
          textAlign: 'left'
        }}>
          {words.map((w, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {w.kanji}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                {w.hiragana}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {w.meaning_es}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem', fontWeight: 700, borderRadius: 14 }}
            onClick={onClose}
          >
            Volver a las Lecciones
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // INTERFAZ PRINCIPAL DE ESCRITURA
  // ==========================================
  return (
    <div className="scriptpad-writer-container" style={{
      maxWidth: 580,
      width: '100%',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      paddingBottom: 140, // Espacio para scroll nativo fluido en móvil por encima del reproductor de audio
      boxSizing: 'border-box'
    }}>
      {/* Botón de Salir fuera y arriba de la card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%'
      }}>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-outline btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 12,
            padding: '7px 14px',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
          aria-label="Cerrar lección"
        >
          <ChevronLeft size={16} />
          <span>Salir</span>
        </button>
      </div>

      {/* Barra superior de progreso */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: 'var(--bg-surface)',
        padding: '12px 18px',
        borderRadius: 18,
        border: '1px solid var(--border)'
      }}>
        <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            lineHeight: 1.3,
            wordBreak: 'break-word'
          }}>
            {lesson.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Palabra {currentWordIndex + 1} de {words.length}
          </div>
        </div>

        {/* Botón de audio */}
        <button
          type="button"
          onClick={playCurrentWordAudio}
          className="btn btn-primary btn-sm"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
            flexShrink: 0
          }}
          title="Escuchar pronunciación"
          aria-label="Escuchar pronunciación"
        >
          <Volume2 size={18} />
        </button>
      </div>

      {/* Ficha de la palabra con toggles de visibilidad (Requerimiento de usuario) */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 22,
        padding: '16px 20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 8
            }}>
              {currentWord.level || 'N5'}
            </span>
          </div>

          {/* Toggles de privacidad */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className={`btn btn-sm ${showKana ? 'btn-outline' : 'btn-primary'}`}
              onClick={() => setShowKana(!showKana)}
              title={showKana ? 'Ocultar Kana' : 'Mostrar Kana'}
              style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 8 }}
            >
              {showKana ? <Eye size={13} /> : <EyeOff size={13} />}
              <span>Kana</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${showMeaning ? 'btn-outline' : 'btn-primary'}`}
              onClick={() => setShowMeaning(!showMeaning)}
              title={showMeaning ? 'Ocultar Traducción' : 'Mostrar Traducción'}
              style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 8 }}
            >
              {showMeaning ? <Eye size={13} /> : <EyeOff size={13} />}
              <span>Español</span>
            </button>
          </div>
        </div>

        {/* Palabra en gran formato con carácter activo resaltado y wrap multilinea para palabras largas */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '8px 0',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h1 style={{
            fontSize: characters.length > 8
              ? 'clamp(1.75rem, 5.5vw, 2.1rem)'
              : characters.length > 5
                ? 'clamp(2rem, 7vw, 2.4rem)'
                : '2.5rem',
            fontWeight: 900,
            letterSpacing: 2,
            margin: 0,
            color: 'var(--text-main)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px 4px',
            maxWidth: '100%',
            lineHeight: 1.35,
            wordBreak: 'break-all'
          }}>
            {characters.map((ch, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentCharIndex(idx)}
                style={{
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px 5px',
                  borderRadius: 8,
                  background: idx === currentCharIndex ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  color: idx === currentCharIndex ? 'var(--primary)' : 'inherit',
                  borderBottom: idx === currentCharIndex ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                {ch}
              </span>
            ))}
          </h1>
        </div>

        {/* Lectura Kana (condicional según toggle) */}
        <div style={{ textAlign: 'center', minHeight: 24, marginBottom: 4, width: '100%', wordBreak: 'break-word' }}>
          {showKana ? (
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', wordBreak: 'break-word' }}>
              {currentWord.hiragana} {currentWord.romaji && <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>({currentWord.romaji})</span>}
            </span>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              [Lectura Kana oculta]
            </span>
          )}
        </div>

        {/* Significado en español (condicional según toggle) */}
        <div style={{ textAlign: 'center', minHeight: 22, width: '100%', wordBreak: 'break-word' }}>
          {showMeaning ? (
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>
              {currentWord.meaning_es}
            </span>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              [Significado oculto]
            </span>
          )}
        </div>
      </div>

      {/* Selector de Flujo: Secuencial vs Tira Continua */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 4px',
        width: '100%'
      }}>
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-surface)',
          padding: 3,
          borderRadius: 14,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button
            type="button"
            onClick={() => {
              setFlowMode('sequential');
              setEngineMode('guided');
              setHasWriterData(true);
            }}
            style={{
              padding: '7px 20px',
              borderRadius: 11,
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: flowMode === 'sequential' ? 800 : 500,
              background: flowMode === 'sequential' ? 'var(--primary)' : 'transparent',
              color: flowMode === 'sequential' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Secuencial
          </button>
          <button
            type="button"
            onClick={() => {
              setFlowMode('continuous');
              setEngineMode('free');
            }}
            style={{
              padding: '7px 20px',
              borderRadius: 11,
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: flowMode === 'continuous' ? 800 : 500,
              background: flowMode === 'continuous' ? 'var(--primary)' : 'transparent',
              color: flowMode === 'continuous' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Tira Continua
          </button>
        </div>
      </div>

      {/* ÁREA DE ESCRITURA TÁCTIL */}
      {flowMode === 'sequential' ? (
        // MODO SECUENCIAL: Un lienzo principal grande para el carácter activo
        <div style={{
          background: 'var(--bg-surface)',
          border: '2px solid var(--border)',
          borderRadius: 24,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          minHeight: 310,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Tira superior de casillas de caracteres */}
          <div style={{
            display: 'flex',
            gap: characters.length > 7 ? 6 : 8,
            marginBottom: 14,
            width: '100%',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {characters.map((ch, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentCharIndex(idx);
                  setCharCompleted(false);
                  setStrokes([]);
                  setHasWriterData(true);
                  setEngineMode('guided');
                }}
                style={{
                  width: characters.length > 8 ? 38 : characters.length > 6 ? 40 : 44,
                  height: characters.length > 8 ? 38 : characters.length > 6 ? 40 : 44,
                  borderRadius: 12,
                  border: idx === currentCharIndex ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: idx === currentCharIndex ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-main)',
                  color: idx === currentCharIndex ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: characters.length > 8 ? '1.1rem' : '1.25rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Contenedor de Hoja de Papel con Límites Físicos Definidos */}
          <div
            style={{
              position: 'relative',
              width: padSize,
              height: padSize,
              borderRadius: 20,
              background: currentPaper.bg,
              border: currentPaper.border,
              boxShadow: currentPaper.shadow,
              overflow: 'hidden',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}
          >
            {/* Cuadrícula japonesa Mizige (米字格) con marco perimetral bien delimitado */}
            <svg
              width={padSize}
              height={padSize}
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1
              }}
            >
              {/* Marco perimetral del límite del lienzo */}
              <rect
                x={8}
                y={8}
                width={padSize - 16}
                height={padSize - 16}
                fill="none"
                stroke={currentPaper.gridColor}
                strokeWidth={1.5}
                rx={10}
              />
              {/* Cruz central punteada */}
              <line
                x1={padSize / 2} y1={8}
                x2={padSize / 2} y2={padSize - 8}
                stroke={currentPaper.gridColor}
                strokeWidth={1.4}
                strokeDasharray="6 4"
              />
              <line
                x1={8} y1={padSize / 2}
                x2={padSize - 8} y2={padSize / 2}
                stroke={currentPaper.gridColor}
                strokeWidth={1.4}
                strokeDasharray="6 4"
              />
              {/* Diagonales sutiles */}
              <line
                x1={8} y1={8}
                x2={padSize - 8} y2={padSize - 8}
                stroke={currentPaper.gridColor}
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.6}
              />
              <line
                x1={padSize - 8} y1={8}
                x2={8} y2={padSize - 8}
                stroke={currentPaper.gridColor}
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.6}
              />
            </svg>

            {/* Motor HanziWriter (Trazo Guiado) */}
            {engineMode === 'guided' && hasWriterData ? (
              <>
                {!writerLoaded && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: currentPaper.bg,
                    backdropFilter: 'blur(4px)',
                    color: currentPaper.isDark ? '#94a3b8' : '#64748b',
                    fontSize: '0.85rem',
                    gap: 8,
                    zIndex: 10
                  }}>
                    <span>Cargando trazos del carácter...</span>
                  </div>
                )}
                <div 
                  ref={writerContainerRef} 
                  style={{ 
                    position: 'relative',
                    width: padSize, 
                    height: padSize, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    zIndex: 2,
                    touchAction: 'none'
                  }} 
                />
              </>
            ) : (
              /* Motor Libre (Canvas) */
              <canvas
                ref={canvasRef}
                width={padSize}
                height={padSize}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  position: 'relative',
                  width: padSize,
                  height: padSize,
                  zIndex: 2,
                  cursor: 'crosshair',
                  touchAction: 'none'
                }}
              />
            )}

            {/* Feedback animado al completar el carácter */}
            {charCompleted && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(16, 185, 129, 0.95)',
                color: '#ffffff',
                padding: '10px 22px',
                borderRadius: 30,
                fontSize: '1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.5)',
                zIndex: 20,
                pointerEvents: 'none'
              }}>
                <CheckCircle2 size={20} />
                <span>¡Correcto!</span>
              </div>
            )}
          </div>

          {/* Pequeña nota informativa si no hay trazo guiado disponible para este carácter */}
          {!hasWriterData && (
            <div style={{
              marginTop: 12,
              padding: '6px 12px',
              borderRadius: 12,
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--text-main)',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              textAlign: 'center',
              maxWidth: padSize
            }}>
              <Info size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span>Trazo guiado no disponible para «{activeChar}». Modo caligrafía libre activado.</span>
            </div>
          )}
        </div>
      ) : (
        // MODO TIRA CONTINUA MULTI-CASILLA VERTICAL (Ver y escribir todos hacia abajo)
        <div style={{
          background: 'var(--bg-surface)',
          border: '2px solid var(--border)',
          borderRadius: 24,
          padding: '16px 12px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0 8px' }}>
            Escribe o calca cada carácter hacia abajo en orden:
          </div>

          {/* Lista VERTICAL interactiva de casillas táctiles */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 22,
            width: '100%'
          }}>
            {characters.map((ch, idx) => (
              <ContinuousCharBox
                key={`${currentWordIndex}_${idx}_${ch}`}
                char={ch}
                charIndex={idx}
                isActive={idx === continuousActiveIndex}
                onSelect={() => setContinuousActiveIndex(idx)}
                strokes={continuousStrokes[idx] || []}
                onStrokesChange={(newStrokes) => {
                  setContinuousStrokes(prev => ({
                    ...prev,
                    [idx]: newStrokes
                  }));
                }}
                currentPaper={currentPaper}
                showGhostGuide={showGhostGuide}
                size={Math.min(260, Math.max(210, padSize - 20))}
              />
            ))}
          </div>

          {/* Barra de progreso de la palabra */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'var(--bg-main)',
            borderRadius: 14,
            border: '1px solid var(--border)',
            fontSize: '0.82rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Palabra: <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{currentWord.kanji || currentWord.hiragana}</strong>
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              {Object.values(continuousStrokes).filter(s => s && s.length > 0).length} de {characters.length} escritos
            </span>
          </div>
        </div>
      )}

      {/* BARRA DE HERRAMIENTAS Y ACCIONES INFERIORES */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: 'var(--bg-surface)',
        padding: '12px',
        borderRadius: 20,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Fila 1: 4 Herramientas de trazo y cambio rápido de papel en cuadrícula perfecta */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 6,
          width: '100%'
        }}>
          {/* Botón 1: Borrar */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleClearStrokes}
            title={flowMode === 'continuous' ? "Borrar casilla activa (o todas si ya está vacía)" : "Borrar lienzo"}
            style={{
              borderRadius: 10,
              padding: '8px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              fontSize: '0.78rem',
              minWidth: 0
            }}
          >
            <RotateCcw size={15} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Borrar</span>
          </button>

          {/* Botón 2: Pista (si guiado) o Deshacer (si libre / continua) */}
          {(flowMode === 'continuous' || !hasWriterData) ? (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleUndoStroke}
              disabled={flowMode === 'continuous' ? (continuousStrokes[continuousActiveIndex] || []).length === 0 : strokes.length === 0}
              title="Deshacer último trazo"
              style={{
                borderRadius: 10,
                padding: '8px 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                fontSize: '0.78rem',
                minWidth: 0
              }}
            >
              <Undo2 size={15} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Deshacer</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleAnimateHint}
              disabled={isAnimating}
              title="Ver animación del orden de trazos (Pista dorada)"
              style={{
                borderRadius: 10,
                borderColor: '#f59e0b',
                color: '#f59e0b',
                background: 'rgba(245, 158, 11, 0.08)',
                fontWeight: 700,
                padding: '8px 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                fontSize: '0.78rem',
                minWidth: 0
              }}
            >
              <Sparkles size={15} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Pista</span>
            </button>
          )}

          {/* Botón 3: Alternar silueta Guía */}
          <button
            type="button"
            className={`btn btn-sm ${showGhostGuide ? 'btn-outline' : 'btn-primary'}`}
            onClick={() => setShowGhostGuide(!showGhostGuide)}
            title="Alternar silueta de guía"
            style={{
              borderRadius: 10,
              padding: '8px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              fontSize: '0.78rem',
              minWidth: 0
            }}
          >
            {showGhostGuide ? <Eye size={15} style={{ flexShrink: 0 }} /> : <EyeOff size={15} style={{ flexShrink: 0 }} />}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Guía</span>
          </button>

          {/* Botón 4: Único botón de papel que switchea entre Washi, Blanco y Pizarra */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              const styles = ['washi', 'white', 'chalkboard'];
              const nextIdx = (styles.indexOf(paperStyle) + 1) % styles.length;
              setPaperStyle(styles[nextIdx]);
            }}
            title="Cambiar estilo de papel (Washi, Blanco, Pizarra)"
            style={{
              borderRadius: 10,
              padding: '8px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              fontSize: '0.78rem',
              minWidth: 0
            }}
          >
            <span style={{ flexShrink: 0 }}>{currentPaper.icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentPaper.shortLabel}</span>
          </button>
        </div>

        {/* Fila 2: Navegación y avance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
          {flowMode === 'sequential' && characters.length > 1 && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handlePrevChar}
              disabled={currentCharIndex === 0}
              style={{
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Carácter anterior"
              aria-label="Carácter anterior"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={flowMode === 'sequential' && currentCharIndex < characters.length - 1 ? handleNextChar : handleCompleteCurrentWord}
            style={{
              flex: 1,
              padding: '10px 18px',
              borderRadius: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '0.9rem'
            }}
          >
            <span>
              {flowMode === 'sequential' && currentCharIndex < characters.length - 1 
                ? 'Siguiente Carácter' 
                : (currentWordIndex === words.length - 1 ? 'Finalizar Lección' : 'Siguiente Palabra')}
            </span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
