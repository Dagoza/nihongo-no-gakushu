'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import { 
  Volume2, 
  ChevronLeft, 
  RotateCcw, 
  Undo2,
  Sparkles, 
  CheckCircle2, 
  Award, 
  PenTool, 
  Eye, 
  EyeOff, 
  Layers,
  ArrowRight,
  HelpCircle,
  Flag,
  Check,
  Pause,
  Play,
  Info
} from 'lucide-react';
import audioManager from '../../lib/audioManager';
import { triggerCheerConfetti } from '../../lib/confetti';
import { SRSRating, reviewCard, getIntervalPreviews, ensureFsrsCard } from '../../lib/srs';
import { fetchKanjiStrokeData } from '../../lib/kanjiStrokeUtils';

// Estilos de papel para el lienzo de caligrafía
const PAPER_STYLES = {
  washi: {
    id: 'washi',
    label: 'Washi Tradicional (和紙)',
    bg: '#faf6ee',
    border: '2.5px solid #d4c7b0',
    gridColor: 'rgba(180, 83, 9, 0.28)',
    strokeColor: '#18181b',
    outlineColor: 'rgba(99, 102, 241, 0.35)',
    drawingColor: '#2563eb',
    highlightColor: '#d97706',
    highlightCompleteColor: '#b45309',
    isDark: false
  },
  chalkboard: {
    id: 'chalkboard',
    label: 'Pizarra Oscura (黒板)',
    bg: '#0a0f1d',
    border: '2.5px solid #334155',
    gridColor: 'rgba(148, 163, 184, 0.35)',
    strokeColor: '#ffffff',
    outlineColor: 'rgba(56, 189, 248, 0.40)',
    drawingColor: '#22d3ee',
    highlightColor: '#fbbf24',
    highlightCompleteColor: '#f59e0b',
    isDark: true
  }
};

/**
 * Calcula la calificación recomendada FSRS según la cantidad de equivocados
 */
function getRatingInfoFromMistakes(mistakes, wasGuideUsed) {
  if (wasGuideUsed) {
    return {
      rating: SRSRating.AGAIN,
      name: 'Otra vez',
      tag: 'Guía consultada',
      badge: 'Requiere repaso (Guía consultada)',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.5)',
      desc: 'El intervalo se reinicia para afianzar la memoria muscular.'
    };
  }

  if (mistakes === 0) {
    return {
      rating: SRSRating.EASY,
      name: 'Fácil',
      tag: '0 errores',
      badge: 'Impecable: 0 errores de trazo',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.5)',
      desc: 'Trazos exactos de memoria en orden correcto.'
    };
  }

  if (mistakes === 1) {
    return {
      rating: SRSRating.GOOD,
      name: 'Bueno',
      tag: '1 error',
      badge: 'Muy bien: 1 error leve',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.5)',
      desc: 'Gran precisión con solo un ajuste menor.'
    };
  }

  if (mistakes <= 3) {
    return {
      rating: SRSRating.HARD,
      name: 'Difícil',
      tag: `${mistakes} errores`,
      badge: `Buen esfuerzo: ${mistakes} errores`,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.5)',
      desc: 'Costó recordar el orden exacto de trazos.'
    };
  }

  return {
    rating: SRSRating.AGAIN,
    name: 'Otra vez',
    tag: `${mistakes} errores`,
    badge: `Necesitas repasar: ${mistakes} errores`,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.5)',
    desc: 'Es conveniente volver a practicar este kanji pronto.'
  };
}

// Duración del temporizador de auto-avance al completar una palabra (2 segundos para un ritmo ágil)
const AUTO_ADVANCE_SECONDS = 2;

export default function ScriptpadSrsReview({
  queue = [],
  onClose,
  appState = {},
  onUpdateState,
  onComplete
}) {
  // Congelar la cola de repaso para la sesión activa para evitar desincronización
  const [reviewQueue] = useState(() => {
    return Array.isArray(queue) && queue.length > 0 ? [...queue] : [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [wordMistakes, setWordMistakes] = useState(0);
  const [charMistakes, setCharMistakes] = useState(0);
  const [showGhostGuide, setShowGhostGuide] = useState(false);
  const [wasGuideUsed, setWasGuideUsed] = useState(false);
  const [isWordCompleted, setIsWordCompleted] = useState(false);
  const [assignedRatingInfo, setAssignedRatingInfo] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  // Referencias mutables para evitar re-crear HanziWriter al equivocarse o usar guía
  const wordMistakesRef = useRef(0);
  const wasGuideUsedRef = useRef(false);
  const showGhostGuideRef = useRef(false);
  const currentCharIndexRef = useRef(0);
  const isWordCompletedRef = useRef(false);
  const isFinishedRef = useRef(false);
  const isRatingInProgressRef = useRef(false);

  wordMistakesRef.current = wordMistakes;
  wasGuideUsedRef.current = wasGuideUsed;
  showGhostGuideRef.current = showGhostGuide;
  currentCharIndexRef.current = currentCharIndex;
  isWordCompletedRef.current = isWordCompleted;
  isFinishedRef.current = isFinished;

  // Estados de carga de trazos y fallback libre
  const [writerLoaded, setWriterLoaded] = useState(false);
  const [hasWriterData, setHasWriterData] = useState(true);
  const [strokeProgress, setStrokeProgress] = useState({ current: 0, total: 0 });

  // Trazos libres por carácter para cuando no hay SVG interactivo
  const [fallbackStrokesByChar, setFallbackStrokesByChar] = useState({});
  const [comparisonMode, setComparisonMode] = useState('both'); // 'both' | 'drawing' | 'model'
  const [isDrawingFallback, setIsDrawingFallback] = useState(false);
  const fallbackCanvasRef = useRef(null);
  const currentFallbackStrokeRef = useRef([]);

  // Auto-avance: 2 segundos para dar ritmo ágil y tiempo de confirmar el resultado
  const [autoAdvancePaused, setAutoAdvancePaused] = useState(false);
  const [autoAdvanceTimeLeft, setAutoAdvanceTimeLeft] = useState(AUTO_ADVANCE_SECONDS);

  // Ref mutable para mantener siempre sincronizado appState
  const appStateRef = useRef(appState);
  appStateRef.current = appState;

  // Referencias HanziWriter
  const writerContainerRef = useRef(null);
  const writerRef = useRef(null);

  // Detectar tema oscuro
  const isDark = (typeof document !== 'undefined' && document.body?.getAttribute('data-theme') === 'dark') || appState?.theme === 'dark';
  const currentPaper = isDark ? PAPER_STYLES.chalkboard : PAPER_STYLES.washi;

  // Tamaño responsivo del lienzo
  const [padSize, setPadSize] = useState(270);
  useEffect(() => {
    const updateSize = () => {
      if (typeof window === 'undefined') return;
      const available = Math.min(290, window.innerWidth - 44);
      setPadSize(Math.max(240, available));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Ocultar barra flotante de reproducción para evitar obstrucción en móvil
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('hide-audio-bar');
      return () => {
        document.body.classList.remove('hide-audio-bar');
      };
    }
  }, []);

  const currentItem = reviewQueue[currentIndex];

  // Descomponer palabra en caracteres para orden de trazos
  const characters = useMemo(() => {
    if (!currentItem) return ['日'];
    const text = (currentItem.kanji || currentItem.hiragana || '').trim();
    const chars = Array.from(text).filter(c => c && c.trim().length > 0);
    return chars.length > 0 ? chars : ['日'];
  }, [currentItem]);

  const activeChar = characters[currentCharIndex] || characters[0] || '日';

  // Reproducir audio nativo o neuronal
  const playAudio = useCallback(() => {
    if (!currentItem) return;
    try {
      if (typeof audioManager?.playWord === 'function') {
        audioManager.playWord(currentItem);
      } else if (typeof audioManager?.speak === 'function') {
        audioManager.speak(currentItem.hiragana || currentItem.kana || currentItem.kanji || '', {
          audioUrl: currentItem.audio_url
        });
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }, [currentItem]);

  // Previsualizaciones de intervalos FSRS
  const intervals = useMemo(() => {
    if (!currentItem?.card) return { 1: '1d', 2: '2d', 3: '3d', 4: '8d' };
    return getIntervalPreviews(currentItem.card);
  }, [currentItem]);

  // Calificar tarjeta de forma segura con FSRS y avanzar
  const handleRate = useCallback((rating) => {
    if (!currentItem || isFinished || isFinishedRef.current || isRatingInProgressRef.current) return;
    isRatingInProgressRef.current = true;

    try {
      const currentCard = currentItem.card;
      const updatedCard = reviewCard(currentCard, rating);
      const latestAppState = appStateRef.current || {};

      // Guardar en srsQuestions y registrar progreso en Scriptpad
      if (onUpdateState) {
        const nextQuestions = {
          ...(latestAppState?.srsQuestions || {}),
          [currentItem.cardKey]: updatedCard
        };

        const wordKey = currentItem.kanji || currentItem.hiragana || currentItem.id;
        const prevWordProgress = latestAppState?.scriptpadWordProgress?.[wordKey] || { practices: 0, completed: true };
        const nextWordProgress = {
          ...(latestAppState?.scriptpadWordProgress || {}),
          [wordKey]: {
            ...prevWordProgress,
            practices: (prevWordProgress.practices || 0) + 1,
            lastPractice: new Date().toISOString(),
            completed: true
          }
        };

        onUpdateState({
          ...latestAppState,
          srsQuestions: nextQuestions,
          scriptpadWordProgress: nextWordProgress
        });
      }

      setReviewHistory(prev => [
        ...prev, 
        { 
          item: currentItem, 
          rating, 
          mistakes: wordMistakesRef.current,
          wasGuideUsed: wasGuideUsedRef.current,
          hasWriterData
        }
      ]);

      // Avanzar a la siguiente palabra o finalizar
      if (currentIndex < reviewQueue.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setCurrentCharIndex(0);
        setWordMistakes(0);
        wordMistakesRef.current = 0;
        setCharMistakes(0);
        setShowGhostGuide(false);
        showGhostGuideRef.current = false;
        setWasGuideUsed(false);
        wasGuideUsedRef.current = false;
        setIsWordCompleted(false);
        isWordCompletedRef.current = false;
        setAssignedRatingInfo(null);
        setAutoAdvancePaused(false);
        setAutoAdvanceTimeLeft(AUTO_ADVANCE_SECONDS);
        setFallbackStrokesByChar({});
        setComparisonMode('both');
        setHasWriterData(true);
        setTimeout(() => {
          isRatingInProgressRef.current = false;
        }, 100);
      } else {
        isFinishedRef.current = true;
        setIsFinished(true);
        setIsWordCompleted(false);
        isWordCompletedRef.current = false;
        setAssignedRatingInfo(null);
        setAutoAdvancePaused(true);
        setAutoAdvanceTimeLeft(0);
        triggerCheerConfetti();
        if (onComplete) {
          onComplete({
            mode: 'srs',
            totalWords: reviewQueue.length,
            wordsPracticed: reviewQueue
          });
        }
      }
    } catch (err) {
      console.error('Error al calificar con FSRS:', err);
      // Fallback para nunca trabar al usuario
      if (currentIndex < reviewQueue.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setCurrentCharIndex(0);
        setIsWordCompleted(false);
        isWordCompletedRef.current = false;
        setWordMistakes(0);
        wordMistakesRef.current = 0;
        setFallbackStrokesByChar({});
        setHasWriterData(true);
        setAutoAdvanceTimeLeft(AUTO_ADVANCE_SECONDS);
        setTimeout(() => {
          isRatingInProgressRef.current = false;
        }, 100);
      } else {
        isFinishedRef.current = true;
        setIsFinished(true);
        setIsWordCompleted(false);
        isWordCompletedRef.current = false;
        setAssignedRatingInfo(null);
        setAutoAdvancePaused(true);
        setAutoAdvanceTimeLeft(0);
      }
    }
  }, [currentItem, currentIndex, reviewQueue, appState, onUpdateState, onComplete, hasWriterData, isFinished]);

  // Completar palabra con seguimiento vectorial y asignar dificultad
  const handleCompleteWord = useCallback((totalMistakes, guideUsed) => {
    if (isFinishedRef.current) return;
    setIsWordCompleted(true);
    isWordCompletedRef.current = true;
    setAutoAdvanceTimeLeft(AUTO_ADVANCE_SECONDS); // 2 segundos de avance ágil
    const ratingInfo = getRatingInfoFromMistakes(totalMistakes, guideUsed);
    setAssignedRatingInfo(ratingInfo);

    if (totalMistakes === 0 && !guideUsed) {
      triggerCheerConfetti();
    }
    playAudio();
  }, [playAudio]);

  // Completar palabra en modo libre (sin trazo vectorial) para autoevaluación
  const handleCompleteFallbackWord = useCallback(() => {
    setIsWordCompleted(true);
    playAudio();
  }, [playAudio]);

  // Inicializar HanziWriter en modo Quiz SIN GUÍA
  // NOTA CRÍTICA: NO debe depender de wordMistakes, wasGuideUsed ni showGhostGuide
  // para que un error o activación de guía NUNCA borre los trazos ya completados.
  useEffect(() => {
    if (!writerContainerRef.current || !activeChar) return;

    let isMounted = true;
    setWriterLoaded(false);
    setHasWriterData(true);
    setCharMistakes(0);

    // Limpiar contenedor previo
    writerContainerRef.current.innerHTML = '';

    try {
      const writer = HanziWriter.create(writerContainerRef.current, activeChar, {
        width: padSize,
        height: padSize,
        padding: 18,
        showOutline: showGhostGuideRef.current,
        showCharacter: false,
        strokeAnimationSpeed: 1.4,
        strokeHighlightSpeed: 2.0,
        delayBetweenStrokes: 120,
        strokeColor: currentPaper.strokeColor,
        outlineColor: currentPaper.outlineColor,
        highlightColor: currentPaper.highlightColor,
        highlightCompleteColor: currentPaper.highlightCompleteColor,
        drawingColor: currentPaper.drawingColor,
        drawingWidth: 22,
        charDataLoader: (char, onComplete, onErr) => {
          fetchKanjiStrokeData(char)
            .then(data => {
              if (isMounted) {
                onComplete(data);
                setWriterLoaded(true);
                const total = Array.isArray(data.strokes) ? data.strokes.length : 0;
                setStrokeProgress({ current: 0, total });
              }
            })
            .catch(err => {
              if (isMounted) {
                console.warn(`[SRS Writing] No stroke vector data for ${char}, fallback to free canvas:`, err);
                setHasWriterData(false);
                if (onErr) onErr(err);
              }
            });
        }
      });

      writerRef.current = writer;

      // Iniciar el Quiz con seguimiento estricto de trazos
      writer.quiz({
        showHintAfterMisses: 3, // Destello suave tras 3 fallos consecutivos en el mismo trazo
        leniency: 1.15,
        onMistake: (strokeData) => {
          if (!isMounted) return;
          // Actualizar ref y estado sin re-montar el componente
          wordMistakesRef.current += 1;
          setWordMistakes(wordMistakesRef.current);
          setCharMistakes(prev => prev + 1);

          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(40); } catch {}
          }
        },
        onCorrectStroke: (strokeData) => {
          if (!isMounted) return;
          setStrokeProgress(prev => ({
            ...prev,
            current: (strokeData?.strokeNum || 0) + 1
          }));

          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(20); } catch {}
          }
        },
        onComplete: (summary) => {
          if (!isMounted) return;

          // Si la palabra tiene más caracteres pendientes
          if (currentCharIndexRef.current < characters.length - 1) {
            setTimeout(() => {
              if (isMounted) {
                setCurrentCharIndex(prev => prev + 1);
              }
            }, 350);
          } else {
            // Palabra completa de principio a fin
            setTimeout(() => {
              if (isMounted) {
                const totalWordMistakes = wordMistakesRef.current;
                handleCompleteWord(totalWordMistakes, wasGuideUsedRef.current || showGhostGuideRef.current);
              }
            }, 250);
          }
        }
      });

      setWriterLoaded(true);
    } catch (err) {
      console.warn('[SRS Writing] HanziWriter init exception, activating fallback canvas:', err);
      setHasWriterData(false);
    }

    return () => {
      isMounted = false;
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch {}
        writerRef.current = null;
      }
      if (writerContainerRef.current) {
        writerContainerRef.current.innerHTML = '';
      }
    };
  }, [
    activeChar, 
    currentCharIndex, 
    characters.length, 
    currentIndex, 
    padSize, 
    currentPaper, 
    handleCompleteWord
  ]);

  // Manejo de silueta / guía: TOGGLE interactivo (Permite activar Y desactivar)
  const handleToggleGuide = () => {
    const nextState = !showGhostGuide;
    setShowGhostGuide(nextState);
    showGhostGuideRef.current = nextState;
    if (nextState) {
      setWasGuideUsed(true);
      wasGuideUsedRef.current = true;
    }
    if (hasWriterData && writerRef.current) {
      try {
        if (nextState) {
          writerRef.current.showOutline();
        } else {
          writerRef.current.hideOutline();
        }
      } catch {}
    }
  };

  // Botón "Sí era": el usuario indica que su trazo sí era correcto (error de lápiz, dedo, sensibilidad)
  // Anula el error registrado, dibuja el trazo automáticamente y avanza al siguiente trazo sin penalización
  const handleAcceptStroke = () => {
    // 1. Descontar el error registrado
    if (wordMistakesRef.current > 0) {
      wordMistakesRef.current -= 1;
      setWordMistakes(wordMistakesRef.current);
    }
    setCharMistakes(prev => Math.max(0, prev - 1));

    // 2. Si estamos en modo HanziWriter interactivo:
    if (hasWriterData && writerRef.current) {
      try {
        // Reducir totalMistakes interno de HanziWriter si existe
        if (writerRef.current._quiz) {
          if (typeof writerRef.current._quiz._totalMistakes === 'number' && writerRef.current._quiz._totalMistakes > 0) {
            writerRef.current._quiz._totalMistakes -= 1;
          }
          if (typeof writerRef.current._quiz._mistakesOnStroke === 'number') {
            writerRef.current._quiz._mistakesOnStroke = 0;
          }
        }

        // Aceptar y dibujar el trazo actual
        writerRef.current.skipQuizStroke();

        // Actualizar indicador de trazo activo
        setStrokeProgress(prev => ({
          ...prev,
          current: Math.min(prev.total, prev.current + 1)
        }));

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(25); } catch {}
        }
      } catch (err) {
        console.warn('Error in skipQuizStroke:', err);
      }
    }
  };

  // Reiniciar carácter actual (funciona tanto para HanziWriter como para Fallback libre)
  const handleResetCurrentChar = () => {
    if (hasWriterData && writerRef.current) {
      try {
        writerRef.current.cancelQuiz();
        writerRef.current.quiz();
        setCharMistakes(0);
        setStrokeProgress(prev => ({ ...prev, current: 0 }));
      } catch {}
    } else {
      setFallbackStrokesByChar(prev => ({
        ...prev,
        [currentCharIndex]: []
      }));
    }
  };

  // Deshacer último trazo en modo libre
  const handleUndoFallbackStroke = () => {
    setFallbackStrokesByChar(prev => {
      const current = prev[currentCharIndex] || [];
      return {
        ...prev,
        [currentCharIndex]: current.slice(0, -1)
      };
    });
  };

  // Rendirse / No me acuerdo: muestra la animación y asigna "Otra vez"
  const handleGiveUp = () => {
    setWasGuideUsed(true);
    wasGuideUsedRef.current = true;
    if (hasWriterData && writerRef.current) {
      try {
        writerRef.current.cancelQuiz();
        writerRef.current.showOutline();
        writerRef.current.animateCharacter({
          onComplete: () => {
            handleCompleteWord(wordMistakesRef.current + 4, true);
          }
        });
      } catch {
        handleCompleteWord(wordMistakesRef.current + 4, true);
      }
    } else {
      // En modo libre revela el modelo y completa para autoevaluación
      setShowGhostGuide(true);
      showGhostGuideRef.current = true;
      handleCompleteFallbackWord();
    }
  };

  // Temporizador de auto-avance (4 segundos, solo en modo guiado automático)
  useEffect(() => {
    if (isFinished || isFinishedRef.current) return;
    if (!hasWriterData) return; // En modo libre sin datos no hay auto-avance para permitir comparar con calma
    if (!isWordCompleted || autoAdvancePaused || !assignedRatingInfo) return;

    if (autoAdvanceTimeLeft <= 0) {
      handleRate(assignedRatingInfo.rating);
      return;
    }

    const timer = setInterval(() => {
      setAutoAdvanceTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, hasWriterData, isWordCompleted, autoAdvancePaused, autoAdvanceTimeLeft, assignedRatingInfo, handleRate]);

  // Manejadores Pointer para el Lienzo de Fallback (dibujo libre de memoria)
  const handleFallbackPointerDown = (e) => {
    if (hasWriterData) return;
    const canvas = fallbackCanvasRef.current;
    if (!canvas) return;
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawingFallback(true);
    currentFallbackStrokeRef.current = [{ x, y }];
  };

  const handleFallbackPointerMove = (e) => {
    if (!isDrawingFallback || hasWriterData) return;
    const canvas = fallbackCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentFallbackStrokeRef.current.push({ x, y });

    // Trazado en tiempo real sin desfase
    const ctx = canvas.getContext('2d');
    if (ctx && currentFallbackStrokeRef.current.length >= 2) {
      const len = currentFallbackStrokeRef.current.length;
      const p1 = currentFallbackStrokeRef.current[len - 2];
      const p2 = currentFallbackStrokeRef.current[len - 1];

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

  const handleFallbackPointerUp = (e) => {
    if (!isDrawingFallback) return;
    const canvas = fallbackCanvasRef.current;
    if (canvas) {
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    }
    setIsDrawingFallback(false);
    if (currentFallbackStrokeRef.current.length > 1) {
      const charStrokes = fallbackStrokesByChar[currentCharIndex] || [];
      setFallbackStrokesByChar(prev => ({
        ...prev,
        [currentCharIndex]: [...charStrokes, currentFallbackStrokeRef.current]
      }));
    }
    currentFallbackStrokeRef.current = [];
  };

  // Redibujado completo del lienzo de fallback (soporta modos 'both', 'drawing' y 'model')
  const redrawFallbackCanvas = useCallback(() => {
    const canvas = fallbackCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Cuadrícula cruzada tradicional
    ctx.save();
    ctx.strokeStyle = currentPaper.gridColor;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.restore();

    const charStrokes = fallbackStrokesByChar[currentCharIndex] || [];

    // 2. Modelo de referencia
    const shouldDrawModel = (showGhostGuide && !isWordCompleted) || 
      (isWordCompleted && (comparisonMode === 'both' || comparisonMode === 'model'));

    if (shouldDrawModel && activeChar) {
      ctx.save();
      ctx.font = `bold ${Math.floor(canvas.height * 0.68)}px "Noto Sans JP", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isWordCompleted && comparisonMode === 'model'
        ? (currentPaper.isDark ? '#38bdf8' : '#2563eb')
        : currentPaper.outlineColor;
      ctx.fillText(activeChar, canvas.width / 2, canvas.height / 2 + 6);
      ctx.restore();
    }

    // 3. Trazos libres dibujados por el usuario
    const shouldDrawUserStrokes = !isWordCompleted || (isWordCompleted && (comparisonMode === 'both' || comparisonMode === 'drawing'));

    if (shouldDrawUserStrokes) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = currentPaper.strokeColor;
      charStrokes.forEach(stroke => {
        if (!stroke || stroke.length < 2) return;
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
      });
      ctx.restore();
    }
  }, [activeChar, comparisonMode, currentPaper, currentCharIndex, fallbackStrokesByChar, isWordCompleted, showGhostGuide]);

  // Ejecutar redibujado cuando cambian dependencias en modo fallback
  useEffect(() => {
    if (!hasWriterData) {
      redrawFallbackCanvas();
    }
  }, [hasWriterData, redrawFallbackCanvas]);

  // ==========================================
  // PANTALLA DE FINALIZACIÓN
  // ==========================================
  if (isFinished || (currentIndex >= reviewQueue.length && reviewHistory.length > 0)) {
    const perfectCount = reviewHistory.filter(h => h.mistakes === 0 && !h.wasGuideUsed).length;
    const hardOrAgainCount = reviewHistory.filter(h => h.rating === SRSRating.AGAIN || h.rating === SRSRating.HARD).length;

    return (
      <div key="srs-finish-view" className="srs-finish-card" style={{
        maxWidth: 520,
        margin: '0 auto',
        padding: '36px 20px',
        paddingBottom: 60,
        textAlign: 'center',
        background: 'var(--bg-surface)',
        borderRadius: 24,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
        }}>
          <CheckCircle2 size={44} />
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
          ¡Repaso SRS Completado!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 24 }}>
          Has practicado el trazo de {reviewHistory.length} palabras de memoria con seguimiento inteligente FSRS.
        </p>

        {/* Resumen de rendimiento */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          marginBottom: 28,
          textAlign: 'left'
        }}>
          <div style={{
            background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 16,
            padding: '14px 16px',
            minWidth: 0
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
              Trazos Perfectos
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
              {perfectCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.7 }}>/ {reviewHistory.length}</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
              0 errores de memoria (Fácil)
            </div>
          </div>

          <div style={{
            background: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 16,
            padding: '14px 16px',
            minWidth: 0
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
              A Reforzar
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
              {hardOrAgainCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.7 }}>palabras</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Programadas para repaso próximo
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onClose}
          style={{
            padding: '14px 32px',
            borderRadius: 16,
            fontWeight: 800,
            fontSize: '1rem',
            width: '100%',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)'
          }}
        >
          Volver al Scriptpad
        </button>
      </div>
    );
  }

  // Cola vacía
  if (!currentItem) {
    return (
      <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg-surface)', borderRadius: 24 }}>
        <h3>No hay palabras pendientes para repasar ahora</h3>
        <p style={{ color: 'var(--text-muted)' }}>¡Estás al día con tus repasos de escritura a mano!</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={onClose} style={{ marginTop: 14 }}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div key="srs-quiz-view" className="scriptpad-srs-container" style={{
      maxWidth: 540,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      paddingBottom: 40
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

      {/* 1. Header Superior */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        padding: '12px 18px',
        borderRadius: 18,
        border: '1px solid var(--border)',
        gap: 12
      }}>
        <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
            Repaso SRS de Escritura (FSRS)
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Palabra {currentIndex + 1} de {reviewQueue.length}
          </div>
        </div>

        <button
          type="button"
          onClick={playAudio}
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
        >
          <Volume2 size={18} />
        </button>
      </div>

      {/* 2. Tarjeta de Pregunta */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '16px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Escribe de memoria en japonés:
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
          {currentItem.meaning_es}
        </div>

        {/* Indicador de pasos si la palabra tiene varios caracteres */}
        {characters.length > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 10
          }}>
            {characters.map((ch, idx) => {
              const isPast = idx < currentCharIndex;
              const isCurrent = idx === currentCharIndex;
              return (
                <div
                  key={`char-step-${idx}`}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: isCurrent 
                      ? 'var(--primary)' 
                      : (isPast ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-hover)'),
                    color: isCurrent 
                      ? '#ffffff' 
                      : (isPast ? '#10b981' : 'var(--text-muted)'),
                    border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  {isPast && <Check size={12} strokeWidth={3} />}
                  <span>Carácter {idx + 1}</span>
                  {isWordCompleted && <span style={{ opacity: 0.85 }}>({ch})</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Modelo revelado cuando se completa */}
        {isWordCompleted && (
          <div style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px dashed var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-jp)' }}>
              {currentItem.kanji || currentItem.hiragana}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ({currentItem.hiragana})
            </span>
          </div>
        )}
      </div>

      {/* 3. Lienzo de Trazos: HanziWriter "Sin Guía" vs Fallback Caligrafía Libre */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '2px solid var(--border)',
        borderRadius: 24,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative'
      }}>
        {/* Contenedor cuadrado con estilo de papel y cuadrícula */}
        <div style={{
          width: padSize,
          height: padSize,
          borderRadius: 20,
          background: currentPaper.bg,
          border: currentPaper.border,
          boxShadow: currentPaper.isDark 
            ? 'inset 0 2px 14px rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.4)' 
            : 'inset 0 1px 4px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          touchAction: 'none'
        }}>
          {/* Rejilla de caligrafía japonesa tradicional (SVG) */}
          <svg
            width={padSize}
            height={padSize}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            {/* Marco perimetral */}
            <rect
              x={6}
              y={6}
              width={padSize - 12}
              height={padSize - 12}
              fill="none"
              stroke={currentPaper.gridColor}
              strokeWidth={1.5}
              rx={12}
            />
            {/* Cruz central punteada */}
            <line
              x1={padSize / 2} y1={6}
              x2={padSize / 2} y2={padSize - 6}
              stroke={currentPaper.gridColor}
              strokeWidth={1.4}
              strokeDasharray="6 4"
            />
            <line
              x1={6} y1={padSize / 2}
              x2={padSize - 6} y2={padSize / 2}
              stroke={currentPaper.gridColor}
              strokeWidth={1.4}
              strokeDasharray="6 4"
            />
            {/* Diagonales tenues */}
            <line
              x1={6} y1={6}
              x2={padSize - 6} y2={padSize - 6}
              stroke={currentPaper.gridColor}
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.5}
            />
            <line
              x1={padSize - 6} y1={6}
              x2={6} y2={padSize - 6}
              stroke={currentPaper.gridColor}
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.5}
            />
          </svg>

          {/* Motor A: HanziWriter cuando hay orden vectorial disponible */}
          {hasWriterData ? (
            <div
              ref={writerContainerRef}
              style={{
                width: padSize,
                height: padSize,
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          ) : (
            /* Motor B: Canvas de caligrafía libre cuando NO hay orden vectorial disponible */
            <canvas
              ref={fallbackCanvasRef}
              width={padSize}
              height={padSize}
              onPointerDown={handleFallbackPointerDown}
              onPointerMove={handleFallbackPointerMove}
              onPointerUp={handleFallbackPointerUp}
              onPointerCancel={handleFallbackPointerUp}
              style={{
                width: padSize,
                height: padSize,
                position: 'relative',
                zIndex: 2,
                cursor: 'crosshair',
                touchAction: 'none'
              }}
            />
          )}

          {/* Indicador de trazo activo cuando hay motor HanziWriter */}
          {hasWriterData && !isWordCompleted && strokeProgress.total > 0 && (
            <div style={{
              position: 'absolute',
              bottom: 8,
              right: 10,
              zIndex: 3,
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 6,
              background: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)',
              color: currentPaper.drawingColor,
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none'
            }}>
              Trazo {strokeProgress.current} de {strokeProgress.total}
            </div>
          )}
        </div>

        {/* 4. Barra de Acciones durante el trazo */}
        {!isWordCompleted ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: padSize + 20,
            marginTop: 12,
            gap: 6
          }}>
            {/* Botón Reiniciar / Limpiar */}
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleResetCurrentChar}
              style={{ borderRadius: 10, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 4 }}
              title={hasWriterData ? "Reiniciar trazos desde el inicio" : "Limpiar lienzo"}
            >
              <RotateCcw size={13} />
              <span>{hasWriterData ? 'Reiniciar' : 'Borrar'}</span>
            </button>

            {/* En modo libre: Botón Deshacer último trazo */}
            {!hasWriterData && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleUndoFallbackStroke}
                disabled={!(fallbackStrokesByChar[currentCharIndex]?.length > 0)}
                style={{ borderRadius: 10, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 4 }}
                title="Deshacer último trazo dibujado"
              >
                <Undo2 size={13} />
                <span>Deshacer</span>
              </button>
            )}

            {/* Botón Toggle Ver Guía / Ocultar Guía */}
            <button
              type="button"
              className={`btn btn-sm ${showGhostGuide ? 'btn-primary' : 'btn-outline'}`}
              onClick={handleToggleGuide}
              style={{ borderRadius: 10, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 4 }}
              title={showGhostGuide ? "Ocultar silueta de guía" : "Mostrar silueta de guía"}
            >
              {showGhostGuide ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showGhostGuide ? 'Ocultar Guía' : 'Ver Guía'}</span>
            </button>

            {/* Botón SÍ ERA: anula error de trazo, acepta y dibuja el trazo si hubo fallo de dedo o lápiz */}
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleAcceptStroke}
              style={{
                borderRadius: 10,
                fontSize: '0.76rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: '#10b981',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                background: 'rgba(16, 185, 129, 0.08)'
              }}
            >
              <Check size={13} strokeWidth={2.5} />
              <span>Sí era</span>
            </button>

            {/* Botón No me acuerdo */}
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleGiveUp}
              style={{
                borderRadius: 10,
                fontSize: '0.76rem',
                color: '#ef4444',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Rendirse y ver el modelo completo"
            >
              <Flag size={13} />
              <span>No sé</span>
            </button>
          </div>
        ) : (
          /* Controles post-completado */
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {/* Si no hay datos vectoriales, permitir cambiar vista de comparación */}
            {!hasWriterData && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-hover)',
                padding: '4px',
                borderRadius: 12,
                border: '1px solid var(--border)'
              }}>
                <button
                  type="button"
                  onClick={() => setComparisonMode('both')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: 'none',
                    background: comparisonMode === 'both' ? 'var(--primary)' : 'transparent',
                    color: comparisonMode === 'both' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Superpuesto
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonMode('drawing')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: 'none',
                    background: comparisonMode === 'drawing' ? 'var(--primary)' : 'transparent',
                    color: comparisonMode === 'drawing' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Mis Trazos
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonMode('model')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: 'none',
                    background: comparisonMode === 'model' ? 'var(--primary)' : 'transparent',
                    color: comparisonMode === 'model' ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Modelo Solo
                </button>
              </div>
            )}

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setIsWordCompleted(false);
                setCurrentCharIndex(0);
                setWordMistakes(0);
                wordMistakesRef.current = 0;
                setCharMistakes(0);
                setShowGhostGuide(false);
                showGhostGuideRef.current = false;
                setWasGuideUsed(false);
                wasGuideUsedRef.current = false;
                setAssignedRatingInfo(null);
                setFallbackStrokesByChar({});
              }}
              style={{ borderRadius: 10, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <RotateCcw size={13} />
              <span>Volver a trazar</span>
            </button>
          </div>
        )}
      </div>

      {/* 5A. Modo Guiado Vectorial: Banner de Dificultad Percibida Automática */}
      {isWordCompleted && hasWriterData && assignedRatingInfo && (
        <div style={{
          background: assignedRatingInfo.bg,
          border: `1.5px solid ${assignedRatingInfo.border}`,
          borderRadius: 18,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <div>
            <div style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              color: assignedRatingInfo.color,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>{assignedRatingInfo.badge}</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Dificultad asignada automáticamente: <strong>{assignedRatingInfo.name}</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAutoAdvancePaused(prev => !prev)}
            className="btn btn-outline btn-sm"
            style={{
              padding: '4px 8px',
              borderRadius: 8,
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              borderColor: assignedRatingInfo.border
            }}
            title={autoAdvancePaused ? "Reanudar auto-avance" : "Pausar para elegir otra dificultad"}
          >
            {autoAdvancePaused ? <Play size={12} /> : <Pause size={12} />}
            <span>{autoAdvancePaused ? 'Pausado' : `${autoAdvanceTimeLeft}s`}</span>
          </button>
        </div>
      )}

      {/* 5B. Modo Caligrafía Libre: Banner de Autoevaluación Pedagógica */}
      {isWordCompleted && !hasWriterData && (
        <div style={{
          background: isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)',
          border: '1.5px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 18,
          padding: '12px 16px'
        }}>
          <div style={{
            fontSize: '0.88rem',
            fontWeight: 800,
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Info size={16} />
            <span>Autoevaluación de Caligrafía</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Compara tus trazos con el modelo revelado y selecciona tu nivel de dominio percibido abajo:
          </div>
        </div>
      )}

      {/* 6. Botón Principal Continuar (Modo Guiado Vectorial, 4s) */}
      {isWordCompleted && hasWriterData && assignedRatingInfo && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleRate(assignedRatingInfo.rating)}
          style={{
            padding: '14px 20px',
            borderRadius: 16,
            fontSize: '1rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: `0 4px 16px ${assignedRatingInfo.color}40`,
            background: assignedRatingInfo.color,
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <span>Continuar ({assignedRatingInfo.name})</span>
          <ArrowRight size={18} />
        </button>
      )}

      {/* 7. Opciones de Calificación FSRS (Manuales en modo guiado o Autoevaluación en modo libre) */}
      {isWordCompleted && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>
            {hasWriterData 
              ? 'O ajusta la dificultad manualmente si lo deseas:' 
              : 'Selecciona cómo sentiste tu dominio de este carácter:'}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8
          }}>
            {/* OTRA VEZ (1) */}
            <button
              type="button"
              onClick={() => handleRate(SRSRating.AGAIN)}
              style={{
                padding: '10px 4px',
                borderRadius: 14,
                border: assignedRatingInfo?.rating === SRSRating.AGAIN 
                  ? '2px solid #ef4444' 
                  : '1px solid rgba(239, 68, 68, 0.4)',
                background: assignedRatingInfo?.rating === SRSRating.AGAIN 
                  ? 'rgba(239, 68, 68, 0.22)' 
                  : 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                boxShadow: assignedRatingInfo?.rating === SRSRating.AGAIN ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none'
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Otra vez</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>{intervals[1] || '1d'}</span>
              {hasWriterData && assignedRatingInfo?.rating === SRSRating.AGAIN && (
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#ef4444' }}>✓ Asignado</span>
              )}
            </button>

            {/* DIFÍCIL (2) */}
            <button
              type="button"
              onClick={() => handleRate(SRSRating.HARD)}
              style={{
                padding: '10px 4px',
                borderRadius: 14,
                border: assignedRatingInfo?.rating === SRSRating.HARD 
                  ? '2px solid #f59e0b' 
                  : '1px solid rgba(245, 158, 11, 0.4)',
                background: assignedRatingInfo?.rating === SRSRating.HARD 
                  ? 'rgba(245, 158, 11, 0.22)' 
                  : 'rgba(245, 158, 11, 0.1)',
                color: '#f59e0b',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                boxShadow: assignedRatingInfo?.rating === SRSRating.HARD ? '0 0 10px rgba(245, 158, 11, 0.3)' : 'none'
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Difícil</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>{intervals[2] || '1d'}</span>
              {hasWriterData && assignedRatingInfo?.rating === SRSRating.HARD && (
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#f59e0b' }}>✓ Asignado</span>
              )}
            </button>

            {/* BUENO (3) */}
            <button
              type="button"
              onClick={() => handleRate(SRSRating.GOOD)}
              style={{
                padding: '10px 4px',
                borderRadius: 14,
                border: assignedRatingInfo?.rating === SRSRating.GOOD 
                  ? '2px solid #3b82f6' 
                  : '1px solid rgba(59, 130, 246, 0.4)',
                background: assignedRatingInfo?.rating === SRSRating.GOOD 
                  ? 'rgba(59, 130, 246, 0.22)' 
                  : 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                boxShadow: assignedRatingInfo?.rating === SRSRating.GOOD ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none'
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Bueno</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>{intervals[3] || '3d'}</span>
              {hasWriterData && assignedRatingInfo?.rating === SRSRating.GOOD && (
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#3b82f6' }}>✓ Asignado</span>
              )}
            </button>

            {/* FÁCIL (4) */}
            <button
              type="button"
              onClick={() => handleRate(SRSRating.EASY)}
              style={{
                padding: '10px 4px',
                borderRadius: 14,
                border: assignedRatingInfo?.rating === SRSRating.EASY 
                  ? '2px solid #10b981' 
                  : '1px solid rgba(16, 185, 129, 0.4)',
                background: assignedRatingInfo?.rating === SRSRating.EASY 
                  ? 'rgba(16, 185, 129, 0.22)' 
                  : 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                boxShadow: assignedRatingInfo?.rating === SRSRating.EASY ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Fácil</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>{intervals[4] || '8d'}</span>
              {hasWriterData && assignedRatingInfo?.rating === SRSRating.EASY && (
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#10b981' }}>✓ Asignado</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Botón Comprobar y Revelar para Modo Caligrafía Libre */}
      {!isWordCompleted && !hasWriterData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {characters.length > 1 && currentCharIndex < characters.length - 1 ? (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setCurrentCharIndex(prev => prev + 1)}
              style={{
                padding: '12px 20px',
                borderRadius: 16,
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <span>Siguiente Carácter ({currentCharIndex + 2} de {characters.length})</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCompleteFallbackWord}
              style={{
                padding: '13px 20px',
                borderRadius: 16,
                fontSize: '0.96rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
              }}
            >
              <Sparkles size={16} />
              <span>Comprobar y Revelar Modelo</span>
            </button>
          )}

          <div style={{
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4
          }}>
            <Info size={12} />
            <span>Sin vector interactivo. Traza de memoria y pulsa comprobar para comparar.</span>
          </div>
        </div>
      )}
    </div>
  );
}
