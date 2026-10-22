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
  X
} from 'lucide-react';
import audioManager from '../../lib/audioManager';
import { triggerCheerConfetti } from '../../lib/confetti';
import { STROKE_COLORS, fetchKanjiStrokeData } from '../../lib/kanjiStrokeUtils';

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
  const [continuousActiveIndex, setContinuousActiveIndex] = useState(0);

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
    audioManager.playWord(currentWord);
  }, [currentWord]);

  // Al cambiar de palabra
  useEffect(() => {
    setCurrentCharIndex(0);
    setStrokes([]);
    setContinuousStrokes({});
    setCharCompleted(false);
    playCurrentWordAudio();
  }, [currentWordIndex, playCurrentWordAudio]);

  // Inicializar HanziWriter en modo 'guided' para el carácter activo
  useEffect(() => {
    if (engineMode !== 'guided' || flowMode === 'continuous') return;
    if (!writerContainerRef.current || !activeChar) return;

    let isMounted = true;
    setWriterLoaded(false);
    setHasWriterData(true);
    setCharCompleted(false);

    // Limpiar contenedor previo
    writerContainerRef.current.innerHTML = '';

    const containerWidth = Math.min(320, window.innerWidth - 48);
    const size = Math.max(240, containerWidth);

    try {
      const writer = HanziWriter.create(writerContainerRef.current, activeChar, {
        width: size,
        height: size,
        padding: 16,
        showOutline: showGhostGuide,
        strokeAnimationSpeed: 1.2,
        delayBetweenStrokes: 150,
        strokeColor: '#1e1b4b',
        outlineColor: 'rgba(99, 102, 241, 0.22)',
        highlightColor: '#6366f1',
        drawingColor: '#4f46e5',
        drawingWidth: 16,
        showCharacter: false,
        charDataLoader: (char, onComplete) => {
          fetchKanjiStrokeData(char)
            .then(data => {
              if (isMounted) onComplete(data);
            })
            .catch(() => {
              if (isMounted) {
                setHasWriterData(false);
                // Si falla o no hay datos SVG (ej. kanji raro), permitir modo libre
              }
            });
        }
      });

      writerRef.current = writer;

      // Iniciar modo Quiz interactivo
      writer.quiz({
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
    }

    return () => {
      isMounted = false;
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch {}
      }
    };
  }, [activeChar, engineMode, flowMode, showGhostGuide]);

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

    // 1. Dibujar cuadrícula japonesa tradicional (米字格 Mizige)
    ctx.save();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    // Cruz central
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    // Diagonales
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    // Borde exterior
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.strokeRect(1, 1, width - 2, height - 2);
    ctx.restore();

    // 2. Silueta de fondo (Ghost outline) si está habilitada
    if (showGhostGuide && activeChar) {
      ctx.save();
      ctx.font = `bold ${Math.floor(height * 0.72)}px "Noto Sans JP", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.fillText(activeChar, width / 2, height / 2 + 8);
      ctx.restore();
    }

    // 3. Renderizar trazos del usuario
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e1b4b';

    strokes.forEach(stroke => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.lineWidth = stroke[0].w || 10;
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });
    ctx.restore();
  }, [strokes, showGhostGuide, activeChar]);

  useEffect(() => {
    if (engineMode === 'free') {
      redrawFreeCanvas();
    }
  }, [engineMode, redrawFreeCanvas]);

  // Pointer events para dibujo fluido y sin pull-to-refresh
  const handlePointerDown = (e) => {
    if (engineMode !== 'free') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    currentStrokeRef.current = [{ x, y, w: 10 }];
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || engineMode !== 'free') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStrokeRef.current.push({ x, y, w: 10 });
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
    setStrokes([]);
    if (writerRef.current) {
      try {
        writerRef.current.cancelQuiz();
        writerRef.current.quiz();
      } catch {}
    }
  };

  const handleUndoStroke = () => {
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
      maxWidth: 620,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      touchAction: 'none' // Prevenir scroll y bounce mientras se dibuja
    }}>
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
        <button
          type="button"
          onClick={onClose}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10 }}
          aria-label="Cerrar lección"
        >
          <ChevronLeft size={16} />
          <span>Salir</span>
        </button>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {lesson.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Palabra {currentWordIndex + 1} de {words.length}
          </div>
        </div>

        {/* Botón de audio */}
        <button
          type="button"
          onClick={playCurrentWordAudio}
          className="btn btn-primary btn-sm"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {currentWord.category || 'Vocabulario'}
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

        {/* Palabra en gran formato con carácter activo resaltado */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12, margin: '6px 0' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            letterSpacing: 2,
            margin: 0,
            color: 'var(--text-main)',
            display: 'flex',
            gap: 4
          }}>
            {characters.map((ch, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentCharIndex(idx)}
                style={{
                  cursor: 'pointer',
                  padding: '0 4px',
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
        <div style={{ textAlign: 'center', minHeight: 24, marginBottom: 4 }}>
          {showKana ? (
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>
              {currentWord.hiragana} {currentWord.romaji && <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>({currentWord.romaji})</span>}
            </span>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              [Lectura Kana oculta]
            </span>
          )}
        </div>

        {/* Significado en español (condicional según toggle) */}
        <div style={{ textAlign: 'center', minHeight: 22 }}>
          {showMeaning ? (
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {currentWord.meaning_es}
            </span>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              [Significado oculto]
            </span>
          )}
        </div>
      </div>

      {/* Selector de Modos: Motor (Trazo Guiado vs Caligrafía) y Flujo (Secuencial vs Tira Continua) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        padding: '0 4px'
      }}>
        {/* Selector de Motor */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-surface)',
          padding: 3,
          borderRadius: 12,
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={() => setEngineMode('guided')}
            style={{
              padding: '6px 14px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: engineMode === 'guided' ? 700 : 500,
              background: engineMode === 'guided' ? 'var(--primary)' : 'transparent',
              color: engineMode === 'guided' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Sparkles size={14} />
            <span>Trazo Guiado</span>
          </button>
          <button
            type="button"
            onClick={() => setEngineMode('free')}
            style={{
              padding: '6px 14px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: engineMode === 'free' ? 700 : 500,
              background: engineMode === 'free' ? 'var(--primary)' : 'transparent',
              color: engineMode === 'free' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <PenTool size={14} />
            <span>Caligrafía Libre</span>
          </button>
        </div>

        {/* Selector de Flujo: Secuencial vs Continuo (Requerimiento de usuario) */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-surface)',
          padding: 3,
          borderRadius: 12,
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={() => setFlowMode('sequential')}
            style={{
              padding: '6px 12px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: flowMode === 'sequential' ? 700 : 500,
              background: flowMode === 'sequential' ? 'var(--primary)' : 'transparent',
              color: flowMode === 'sequential' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Secuencial
          </button>
          <button
            type="button"
            onClick={() => {
              setFlowMode('continuous');
              setEngineMode('free'); // El modo continuo utiliza el motor libre
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: flowMode === 'continuous' ? 700 : 500,
              background: flowMode === 'continuous' ? 'var(--primary)' : 'transparent',
              color: flowMode === 'continuous' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer'
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
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          minHeight: 310
        }}>
          {/* Tira superior de casillas de caracteres */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 12,
            width: '100%',
            justifyContent: 'center'
          }}>
            {characters.map((ch, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentCharIndex(idx)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: idx === currentCharIndex ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: idx === currentCharIndex ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-main)',
                  color: idx === currentCharIndex ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Contenedor de Dibujo */}
          {engineMode === 'guided' && hasWriterData ? (
            <div 
              ref={writerContainerRef} 
              style={{ 
                width: 270, 
                height: 270, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                touchAction: 'none'
              }} 
            />
          ) : (
            <canvas
              ref={canvasRef}
              width={270}
              height={270}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                width: 270,
                height: 270,
                borderRadius: 16,
                background: '#faf6ee', // Papel Washi tradicional
                cursor: 'crosshair',
                touchAction: 'none'
              }}
            />
          )}

          {/* Feedback de completitud del carácter */}
          {charCompleted && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(16, 185, 129, 0.92)',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: 30,
              fontSize: '1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
              pointerEvents: 'none'
            }}>
              <CheckCircle2 size={20} />
              <span>¡Correcto!</span>
            </div>
          )}
        </div>
      ) : (
        // MODO TIRA CONTINUA MULTI-CASILLA (Escribir todas de seguido)
        <div style={{
          background: 'var(--bg-surface)',
          border: '2px solid var(--border)',
          borderRadius: 24,
          padding: 16,
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Escribe todos los caracteres de la palabra de seguido sobre las casillas:
          </div>

          <div style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 8,
            justifyContent: characters.length <= 3 ? 'center' : 'flex-start'
          }}>
            {characters.map((ch, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0
                }}
              >
                <div style={{
                  position: 'relative',
                  width: 170,
                  height: 170,
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: '#faf6ee',
                  border: idx === continuousActiveIndex ? '2px solid var(--primary)' : '1px solid var(--border)'
                }}>
                  {/* Silueta tenue de ayuda en la casilla */}
                  {showGhostGuide && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '5rem',
                      fontWeight: 800,
                      color: 'rgba(99, 102, 241, 0.14)',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}>
                      {ch}
                    </div>
                  )}

                  <canvas
                    width={170}
                    height={170}
                    onPointerDown={() => setContinuousActiveIndex(idx)}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      touchAction: 'none'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Carácter {idx + 1} ({ch})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BARRA DE HERRAMIENTAS Y ACCIONES INFERIORES */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        background: 'var(--bg-surface)',
        padding: '12px 16px',
        borderRadius: 20,
        border: '1px solid var(--border)'
      }}>
        {/* Herramientas de trazo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {engineMode === 'free' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleUndoStroke}
              disabled={strokes.length === 0}
              title="Deshacer trazo"
              style={{ borderRadius: 10 }}
            >
              <Undo2 size={16} />
            </button>
          )}

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleClearStrokes}
            title="Borrar lienzo"
            style={{ borderRadius: 10 }}
          >
            <RotateCcw size={16} />
            <span>Borrar</span>
          </button>

          {engineMode === 'guided' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleAnimateHint}
              disabled={isAnimating}
              title="Ver animación de trazo"
              style={{ borderRadius: 10 }}
            >
              <Sparkles size={16} />
              <span>Pista</span>
            </button>
          )}

          <button
            type="button"
            className={`btn btn-sm ${showGhostGuide ? 'btn-outline' : 'btn-primary'}`}
            onClick={() => setShowGhostGuide(!showGhostGuide)}
            title="Alternar silueta de guía"
            style={{ borderRadius: 10 }}
          >
            {showGhostGuide ? <Eye size={15} /> : <EyeOff size={15} />}
            <span>Guía</span>
          </button>
        </div>

        {/* Navegación y avance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {flowMode === 'sequential' && characters.length > 1 && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handlePrevChar}
              disabled={currentCharIndex === 0}
              style={{ borderRadius: 10 }}
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={flowMode === 'sequential' && currentCharIndex < characters.length - 1 ? handleNextChar : handleCompleteCurrentWord}
            style={{
              padding: '8px 18px',
              borderRadius: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>
              {flowMode === 'sequential' && currentCharIndex < characters.length - 1 
                ? 'Siguiente Carácter' 
                : (currentWordIndex === words.length - 1 ? 'Finalizar Lección' : 'Siguiente Palabra')}
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
