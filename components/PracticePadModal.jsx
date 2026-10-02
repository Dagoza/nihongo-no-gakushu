'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import { 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Grid, 
  Download, 
  Save, 
  FolderOpen, 
  Volume2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  X, 
  Eye, 
  EyeOff, 
  Sliders, 
  Edit3, 
  Trash2,
  BookOpen,
  FileText,
  Check,
  ZoomIn,
  ZoomOut,
  Hand,
  Keyboard
} from 'lucide-react';
import * as wanakana from 'wanakana';
import audioManager from '../lib/audioManager';
import { 
  STROKE_STYLES, 
  GRID_TYPES, 
  PAPER_STYLES, 
  INK_PALETTES,
  savePracticeDraft,
  loadPracticeDraft,
  clearPracticeDraft,
  getSavedPracticeSheets,
  savePracticeSheet,
  deletePracticeSheet,
  getGridLayout,
  renderGridOnCanvas,
  renderStroke,
  renderStrokeSegment,
  renderAllStrokes,
  analyzeDrawingAccuracy,
  exportPracticeSheetToImage
} from '../lib/practiceSheetManager';

export default function PracticePadModal({
  isOpen = false,
  onClose,
  initialText = '',
  initialKana = '',
  initialTitle = '',
  initialSource = 'custom', // 'kanji' | 'vocab' | 'conversation' | 'story' | 'grammar' | 'custom' | 'free'
  initialChar = '',
  initialGhostOpacity,
  initialTab = 'canvas',
  onSaveToCloud
}) {
  // Main view modes
  const [activeTab, setActiveTab] = useState(initialTab || 'canvas'); // 'canvas' | 'stroke_quiz'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Target text & character navigation
  const [text, setText] = useState(initialText || '');
  const [kana, setKana] = useState(initialKana || '');
  const [title, setTitle] = useState(initialTitle || (initialSource === 'free' ? 'Cuaderno Libre' : 'Práctica de Escritura'));
  const [source, setSource] = useState(initialSource || 'custom');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Drawing settings
  const [strokeStyle, setStrokeStyle] = useState('shodo'); // 'shodo' | 'marker' | 'fountain' | 'pencil' | 'gel'
  const [strokeWidth, setStrokeWidth] = useState(8);
  const [inkColor, setInkColor] = useState('#18181b');
  const [isEraser, setIsEraser] = useState(false);
  const [gridType, setGridType] = useState('mizige'); // 'tianzige' | 'mizige' | 'genkouyoushi' | 'dot' | 'lined' | 'blank'
  const [paperStyle, setPaperStyle] = useState('washi'); // 'washi' | 'white' | 'chalkboard'
  const [ghostOpacity, setGhostOpacity] = useState(
    typeof initialGhostOpacity === 'number' 
      ? initialGhostOpacity 
      : (initialSource === 'free' || !initialText ? 0 : 35)
  );

  // Canvas strokes & history for Undo/Redo
  const [strokes, setStrokes] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Verification state
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [transcriptionInput, setTranscriptionInput] = useState('');
  const [transcriptionMatch, setTranscriptionMatch] = useState(null); // 'correct' | 'incorrect' | null
  const [transcriptionFeedback, setTranscriptionFeedback] = useState(null); // { type: 'success' | 'error' | 'info', message: string } | null
  const [useIme, setUseIme] = useState(true);
  const isComposingRef = useRef(false);

  // Saved sheets library state
  const [savedSheets, setSavedSheets] = useState([]);
  const [sheetTitleInput, setSheetTitleInput] = useState('');
  const [notification, setNotification] = useState(null);

  // HanziWriter interactive quiz state
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [quizMistakes, setQuizMistakes] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState(false);

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  // Refs
  const viewportRef = useRef(null);
  const artboardRef = useRef(null);
  const gridCanvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const hanziContainerRef = useRef(null);
  const writerRef = useRef(null);
  const currentStrokeRef = useRef(null);
  const isPointerDownRef = useRef(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ clientX: 0, clientY: 0, panX: 0, panY: 0 });
  const touchStateRef = useRef({ distance: 0, startPan: { x: 0, y: 0 }, startZoom: 1, startCenter: { x: 0, y: 0 } });

  // Dimensiones del área de trabajo para cálculos de cuadrícula
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });

  // Split text into individual characters (filtering out pure whitespace)
  const characters = React.useMemo(() => {
    const trimmed = (text || '').trim();
    if (!trimmed) return ['日'];
    const chars = Array.from(trimmed).filter(c => c && c.trim().length > 0);
    return chars.length > 0 ? chars : ['日'];
  }, [text]);

  const activeChar = characters[currentCharIndex] || characters[0] || '日';

  // Layout geométrico adaptado a la cuadrícula seleccionada y al texto
  const gridLayout = React.useMemo(() => {
    return getGridLayout(canvasDimensions.width, canvasDimensions.height, gridType, text, 24);
  }, [canvasDimensions.width, canvasDimensions.height, gridType, text]);

  // Show temporary banner / toast
  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Sync incoming props when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsPanMode(false);
      if (initialSource === 'free') {
        // Cuaderno libre sin guía desde el header
        setText(initialText || '');
        setKana('');
        setTitle(initialTitle || 'Cuaderno Libre');
        setSource('free');
        setGhostOpacity(0);
        setCurrentCharIndex(0);
        setVerificationResult(null);

        // Si existe un borrador previo de cuaderno libre, recuperar trazos
        const draft = loadPracticeDraft();
        if (draft && draft.source === 'free' && Array.isArray(draft.strokes) && draft.strokes.length > 0) {
          const validStrokes = draft.strokes.filter(s => s && typeof s === 'object' && Array.isArray(s.points) && s.points.length > 0);
          setStrokes(validStrokes);
          setGridType(draft.gridType || 'mizige');
          setPaperStyle(draft.paperStyle || 'washi');
          setStrokeStyle(draft.strokeStyle || 'shodo');
          setStrokeWidth(draft.strokeWidth || 8);
          setInkColor(draft.inkColor || '#18181b');
        }
      } else if (initialText) {
        setText(initialText);
        setKana(initialKana || '');
        setTitle(initialTitle || `Práctica: ${initialText}`);
        setSource(initialSource || 'custom');
        setGhostOpacity(typeof initialGhostOpacity === 'number' ? initialGhostOpacity : 35);
        setVerificationResult(null);
        
        // Find index of initialChar if passed
        const chars = Array.from(initialText.trim()).filter(c => c && c.trim().length > 0);
        if (initialChar) {
          const idx = chars.indexOf(initialChar);
          setCurrentCharIndex(idx >= 0 ? idx : 0);
        } else {
          setCurrentCharIndex(0);
        }
      } else {
        // Try restoring last active draft
        const draft = loadPracticeDraft();
        if (draft && Array.isArray(draft.strokes) && draft.strokes.length > 0) {
          const validStrokes = draft.strokes.filter(s => s && typeof s === 'object' && Array.isArray(s.points) && s.points.length > 0);
          setText(draft.text || '');
          setKana(draft.kana || '');
          setTitle(draft.title || (draft.source === 'free' ? 'Cuaderno Libre' : 'Práctica de Escritura'));
          setSource(draft.source || 'custom');
          setStrokes(validStrokes);
          setGridType(draft.gridType || 'mizige');
          setPaperStyle(draft.paperStyle || 'washi');
          setStrokeStyle(draft.strokeStyle || 'shodo');
          setStrokeWidth(draft.strokeWidth || 8);
          setInkColor(draft.inkColor || '#18181b');
          setGhostOpacity(typeof initialGhostOpacity === 'number' ? initialGhostOpacity : (draft.source === 'free' ? 0 : 35));
          setCurrentCharIndex(draft.currentCharIndex || 0);
          showNotification('Borrador previo recuperado automáticamente ✨', 'success');
        } else {
          setText('');
          setGhostOpacity(0);
          setSource('free');
          setTitle('Cuaderno Libre');
        }
      }

      setSavedSheets(getSavedPracticeSheets());
    }
  }, [isOpen, initialText, initialKana, initialTitle, initialSource, initialChar, initialGhostOpacity]);

  // Reset transcription when modal opens, text changes or active character changes
  useEffect(() => {
    if (isOpen) {
      setTranscriptionInput('');
      setTranscriptionMatch(null);
      setTranscriptionFeedback(null);
    }
  }, [isOpen, currentCharIndex, text]);

  // Adjust default ink color when chalkboard paper is picked
  useEffect(() => {
    if (paperStyle === 'chalkboard' && inkColor === '#18181b') {
      setInkColor('#f8fafc');
    } else if (paperStyle !== 'chalkboard' && inkColor === '#f8fafc') {
      setInkColor('#18181b');
    }
  }, [paperStyle]);

  // Auto-save draft whenever strokes or text change
  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      savePracticeDraft({
        text,
        kana,
        title,
        source,
        strokes,
        gridType,
        paperStyle,
        strokeStyle,
        strokeWidth,
        inkColor,
        currentCharIndex
      });
    }, 600);
    return () => clearTimeout(timeout);
  }, [isOpen, text, kana, title, source, strokes, gridType, paperStyle, strokeStyle, strokeWidth, inkColor, currentCharIndex]);

  // -------------------------------------------------------------
  // CANVAS ENGINE (GRID & DRAWING)
  // -------------------------------------------------------------

  // Resize and redraw grid canvas
  const setupCanvases = useCallback(() => {
    const gridCanvas = gridCanvasRef.current;
    const drawCanvas = drawingCanvasRef.current;
    const viewport = viewportRef.current;
    if (!gridCanvas || !drawCanvas || !viewport) return;

    const rect = viewport.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    if (width === 0 || height === 0) return;

    setCanvasDimensions(prev => (prev.width === width && prev.height === height) ? prev : { width, height });

    // Grid canvas
    gridCanvas.width = width * dpr;
    gridCanvas.height = height * dpr;
    gridCanvas.style.width = `${width}px`;
    gridCanvas.style.height = `${height}px`;

    const gCtx = gridCanvas.getContext('2d');
    if (gCtx) {
      gCtx.scale(dpr, dpr);
      renderGridOnCanvas(gCtx, width, height, gridType, paperStyle, 24, { text });
    }

    // Drawing canvas
    drawCanvas.width = width * dpr;
    drawCanvas.height = height * dpr;
    drawCanvas.style.width = `${width}px`;
    drawCanvas.style.height = `${height}px`;

    const dCtx = drawCanvas.getContext('2d');
    if (dCtx) {
      dCtx.scale(dpr, dpr);
      renderAllStrokes(dCtx, (strokes || []).filter(Boolean));
    }
  }, [gridType, paperStyle, strokes, text]);

  useEffect(() => {
    if (activeTab !== 'canvas') return;
    setupCanvases();
    const handleResize = () => setupCanvases();
    window.addEventListener('resize', handleResize);

    let resizeObserver = null;
    if (viewportRef.current && typeof window.ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        setupCanvases();
      });
      resizeObserver.observe(viewportRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [activeTab, setupCanvases, isFullscreen]);

  // Redraw strokes when strokes state changes
  useEffect(() => {
    const drawCanvas = drawingCanvasRef.current;
    if (!drawCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    const dCtx = drawCanvas.getContext('2d');
    if (!dCtx) return;

    dCtx.save();
    dCtx.setTransform(1, 0, 0, 1, 0, 0);
    dCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    dCtx.scale(dpr, dpr);
    renderAllStrokes(dCtx, (strokes || []).filter(Boolean));
    dCtx.restore();
  }, [strokes]);

  // Pointer event handlers for drawing and panning
  const handlePointerDown = (e) => {
    if (activeTab !== 'canvas') return;

    const isPanAction = isPanMode || isSpacePressed || e.button === 1;
    if (isPanAction) {
      isPanningRef.current = true;
      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        panX: pan.x,
        panY: pan.y
      };
      return;
    }

    const drawCanvas = drawingCanvasRef.current;
    if (!drawCanvas) return;

    try {
      drawCanvas.setPointerCapture(e.pointerId);
    } catch (err) {}

    const rect = drawCanvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const scaleX = canvasDimensions.width / rect.width;
    const scaleY = canvasDimensions.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    isPointerDownRef.current = true;
    setIsDrawing(true);

    const newStroke = {
      points: [{
        x,
        y,
        pressure: e.pressure || 0.5,
        time: Date.now()
      }],
      style: strokeStyle,
      color: inkColor,
      width: strokeWidth,
      isEraser
    };

    currentStrokeRef.current = newStroke;

    // Draw single point immediately
    const dpr = window.devicePixelRatio || 1;
    const dCtx = drawCanvas.getContext('2d');
    if (dCtx) {
      dCtx.save();
      dCtx.setTransform(1, 0, 0, 1, 0, 0);
      dCtx.scale(dpr, dpr);
      renderStroke(dCtx, newStroke);
      dCtx.restore();
    }
  };

  const handlePointerMove = (e) => {
    if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.clientX;
      const dy = e.clientY - panStartRef.current.clientY;
      setPan({
        x: Math.round(panStartRef.current.panX + dx),
        y: Math.round(panStartRef.current.panY + dy)
      });
      return;
    }

    if (!isPointerDownRef.current || !currentStrokeRef.current) return;
    const drawCanvas = drawingCanvasRef.current;
    if (!drawCanvas) return;

    const rect = drawCanvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const scaleX = canvasDimensions.width / rect.width;
    const scaleY = canvasDimensions.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const stroke = currentStrokeRef.current;
    if (!stroke || !Array.isArray(stroke.points) || stroke.points.length === 0) return;

    const pt = {
      x,
      y,
      pressure: (typeof e.pressure === 'number' && e.pressure > 0) ? e.pressure : 0.5,
      time: Date.now()
    };

    const p0 = stroke.points[stroke.points.length - 1];
    stroke.points.push(pt);
    const p1 = pt;

    // Progressive rendering: render last segment smoothly
    const dpr = window.devicePixelRatio || 1;
    const dCtx = drawCanvas.getContext('2d');
    if (dCtx) {
      dCtx.save();
      dCtx.setTransform(1, 0, 0, 1, 0, 0);
      dCtx.scale(dpr, dpr);
      renderStrokeSegment(dCtx, p0, p1, stroke);
      dCtx.restore();
    }
  };

  const handlePointerUp = (e) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
      try {
        if (drawingCanvasRef.current && e?.pointerId !== undefined) {
          drawingCanvasRef.current.releasePointerCapture(e.pointerId);
        }
      } catch (err) {}
      return;
    }

    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDrawing(false);

    try {
      if (drawingCanvasRef.current && e?.pointerId !== undefined) {
        drawingCanvasRef.current.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}

    const completed = currentStrokeRef.current;
    currentStrokeRef.current = null;

    if (completed && Array.isArray(completed.points) && completed.points.length > 0) {
      const strokeToCommit = {
        points: [...completed.points],
        style: completed.style || strokeStyle,
        color: completed.color || inkColor,
        width: completed.width || strokeWidth,
        isEraser: Boolean(completed.isEraser)
      };
      setStrokes(prev => [...(Array.isArray(prev) ? prev.filter(Boolean) : []), strokeToCommit]);
      setRedoStack([]); // Clear redo stack on new action
    }
  };

  const handleViewportPointerDown = (e) => {
    if (e.target === drawingCanvasRef.current) return;
    const isPanAction = isPanMode || isSpacePressed || e.button === 1 || zoom > 1;
    if (isPanAction) {
      isPanningRef.current = true;
      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        panX: pan.x,
        panY: pan.y
      };
    }
  };

  // Window listeners during pan dragging
  useEffect(() => {
    if (!isPanning) return;

    const handleWindowPointerMove = (e) => {
      if (!isPanningRef.current) return;
      const dx = e.clientX - panStartRef.current.clientX;
      const dy = e.clientY - panStartRef.current.clientY;
      setPan({
        x: Math.round(panStartRef.current.panX + dx),
        y: Math.round(panStartRef.current.panY + dy)
      });
    };

    const handleWindowPointerUp = () => {
      isPanningRef.current = false;
      setIsPanning(false);
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [isPanning]);

  // Spacebar and Zoom Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTab !== 'canvas') return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomStep(0.25);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        handleZoomStep(-0.25);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleResetZoomAndPan();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTab]);

  // Wheel zoom (Ctrl+wheel / pinch) and trackpad scroll
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || activeTab !== 'canvas') return;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;

        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        setZoom((prevZoom) => {
          const nextZoom = Math.min(Math.max(Number((prevZoom * zoomFactor).toFixed(2)), 0.5), 4);
          const scaleRatio = nextZoom / prevZoom;
          setPan((prevPan) => ({
            x: Math.round(mouseX - (mouseX - prevPan.x) * scaleRatio),
            y: Math.round(mouseY - (mouseY - prevPan.y) * scaleRatio)
          }));
          return nextZoom;
        });
      } else if (e.shiftKey) {
        e.preventDefault();
        setPan((prevPan) => ({
          x: prevPan.x - e.deltaY,
          y: prevPan.y
        }));
      } else if (Math.abs(e.deltaX) > 0 || zoom > 1) {
        e.preventDefault();
        setPan((prevPan) => ({
          x: Math.round(prevPan.x - e.deltaX),
          y: Math.round(prevPan.y - e.deltaY)
        }));
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, [activeTab, zoom]);

  // Touch Pinch-to-Zoom and Touch Pan
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || activeTab !== 'canvas') return;

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        touchStateRef.current = {
          distance: dist,
          startPan: { ...pan },
          startZoom: zoom,
          startCenter: {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2
          }
        };
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && touchStateRef.current.distance > 0) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const center = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };

        const factor = dist / touchStateRef.current.distance;
        const newZoom = Math.min(Math.max(Number((touchStateRef.current.startZoom * factor).toFixed(2)), 0.5), 4);
        setZoom(newZoom);

        const dx = center.x - touchStateRef.current.startCenter.x;
        const dy = center.y - touchStateRef.current.startCenter.y;
        setPan({
          x: Math.round(touchStateRef.current.startPan.x + dx),
          y: Math.round(touchStateRef.current.startPan.y + dy)
        });
      }
    };

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        touchStateRef.current.distance = 0;
      }
    };

    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: false });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchmove', onTouchMove);
      viewport.removeEventListener('touchend', onTouchEnd);
    };
  }, [activeTab, zoom, pan]);

  // Zoom control helpers
  const handleZoomChange = (newZoom) => {
    const clamped = Math.min(Math.max(Number(newZoom.toFixed(2)), 0.5), 4);
    setZoom(clamped);
    if (clamped === 1) {
      setPan({ x: 0, y: 0 });
    }
  };

  const handleZoomStep = (delta) => {
    setZoom(prev => {
      const next = Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.5), 4);
      if (next === 1) {
        setPan({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoomAndPan = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    showNotification('Vista restablecida (100%)', 'info');
  };

  // Undo / Redo
  const handleUndo = () => {
    if (!strokes || strokes.length === 0) return;
    const valid = strokes.filter(Boolean);
    if (valid.length === 0) return;
    const last = valid[valid.length - 1];
    setStrokes(valid.slice(0, -1));
    setRedoStack(prev => [...(Array.isArray(prev) ? prev.filter(Boolean) : []), last]);
  };

  const handleRedo = () => {
    if (!redoStack || redoStack.length === 0) return;
    const valid = redoStack.filter(Boolean);
    if (valid.length === 0) return;
    const next = valid[valid.length - 1];
    setRedoStack(valid.slice(0, -1));
    setStrokes(prev => [...(Array.isArray(prev) ? prev.filter(Boolean) : []), next]);
  };

  const handleClearCanvas = () => {
    if (strokes.length === 0) return;
    setStrokes([]);
    setRedoStack([]);
    setVerificationResult(null);
    showNotification('Lienzo limpiado', 'info');
  };

  // -------------------------------------------------------------
  // VERIFICACIÓN DE TRAZO Y CALIGRAFÍA
  // -------------------------------------------------------------

  const handleVerifyDrawing = () => {
    const drawCanvas = drawingCanvasRef.current;
    if (!drawCanvas || strokes.length === 0) {
      showNotification('Dibuja en la cuadrícula antes de verificar', 'warning');
      return;
    }

    const targetToVerify = (activeTab === 'canvas' && text && text.trim().length > 1)
      ? text.trim()
      : (text && text.trim() ? activeChar : '');

    if (!targetToVerify) {
      showNotification('En modo cuaderno libre puedes escribir y dibujar libremente sin modelo ✨', 'info');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const res = analyzeDrawingAccuracy(
        drawCanvas, 
        targetToVerify, 
        canvasDimensions.width, 
        canvasDimensions.height, 
        gridType, 
        24
      );
      setVerificationResult(res);
      setIsVerifying(false);
      if (res && res.score >= 70) {
        showNotification(`¡Excelente trazo! ${res.score}% de similitud 💮`, 'success');
      }
    }, 150);
  };

  // Extract all valid target readings and representations
  const getValidTargetReadings = useCallback(() => {
    const targets = new Set();
    
    if (text && text.trim()) {
      const cleanT = text.trim();
      targets.add(cleanT);
      try {
        targets.add(wanakana.toHiragana(cleanT));
        targets.add(wanakana.toKatakana(cleanT));
        const rom = wanakana.toRomaji(cleanT).toLowerCase().trim();
        if (rom) targets.add(rom);
      } catch (e) {}
    }

    if (activeChar && activeChar.trim()) {
      targets.add(activeChar.trim());
    }

    if (kana && kana.trim()) {
      // Split readings like "にち、ひ、-び、-か" or "ニチ / ひ"
      const parts = kana.split(/[,、/|;·\s]+/).filter(Boolean);
      parts.forEach(p => {
        const cleaned = p.replace(/[\[\]()（）]/g, '').replace(/^[-ー]+|[-ー]+$/g, '').trim();
        if (cleaned) {
          targets.add(cleaned);
          try {
            targets.add(wanakana.toHiragana(cleaned));
            targets.add(wanakana.toKatakana(cleaned));
            const rom = wanakana.toRomaji(cleaned).toLowerCase().trim();
            if (rom) targets.add(rom);
          } catch (e) {}
        }
      });
      const rawClean = kana.replace(/[\[\]()（）]/g, '').trim();
      if (rawClean) {
        targets.add(rawClean);
        try {
          targets.add(wanakana.toHiragana(rawClean));
          targets.add(wanakana.toKatakana(rawClean));
          const rom = wanakana.toRomaji(rawClean).toLowerCase().trim();
          if (rom) targets.add(rom);
        } catch (e) {}
      }
    }

    return Array.from(targets).filter(Boolean);
  }, [text, kana, activeChar]);

  const primaryExpectedReading = React.useMemo(() => {
    const cleanKana = (kana || '').trim();
    if (cleanKana) return cleanKana;
    const cleanText = (text || '').trim();
    if (cleanText) return cleanText;
    if (activeChar) return activeChar;
    return '';
  }, [kana, text, activeChar]);

  const primaryExpectedRomaji = React.useMemo(() => {
    if (!primaryExpectedReading) return '';
    try {
      return wanakana.toRomaji(primaryExpectedReading);
    } catch (e) {
      return '';
    }
  }, [primaryExpectedReading]);

  // Text transcription verification
  const handleVerifyTranscription = useCallback((input, isExplicit = false) => {
    setTranscriptionInput(input);
    const cleanInput = (input || '').trim();
    if (!cleanInput) {
      setTranscriptionMatch(null);
      setTranscriptionFeedback(null);
      return;
    }

    const validTargets = getValidTargetReadings();

    if (validTargets.length === 0) {
      if (isExplicit) {
        setTranscriptionMatch(null);
        setTranscriptionFeedback({
          type: 'info',
          message: 'Cuaderno libre: Texto registrado. Puedes asignar un texto o kanji de referencia con ✏️ arriba.'
        });
      } else {
        setTranscriptionMatch(null);
        setTranscriptionFeedback(null);
      }
      return;
    }

    const inputLower = cleanInput.toLowerCase();
    let inputHira = '';
    let inputKata = '';
    let inputRomaji = '';
    try {
      inputHira = wanakana.toHiragana(cleanInput);
      inputKata = wanakana.toKatakana(cleanInput);
      inputRomaji = wanakana.toRomaji(cleanInput).toLowerCase().trim();
    } catch (e) {}

    const isExact = validTargets.some(t => {
      const tLower = t.toLowerCase();
      return (
        cleanInput === t ||
        inputLower === tLower ||
        (inputHira && inputHira === t) ||
        (inputKata && inputKata === t) ||
        (inputRomaji && inputRomaji === tLower)
      );
    });

    if (isExact) {
      setTranscriptionMatch('correct');
      setTranscriptionFeedback({
        type: 'success',
        message: `¡Correcto! Lectura confirmada: ${cleanInput} ✨`
      });
      return;
    }

    // Check if the user is still typing a prefix
    const isPrefix = validTargets.some(t => {
      const tLower = t.toLowerCase();
      return (
        t.startsWith(cleanInput) ||
        tLower.startsWith(inputLower) ||
        (inputHira && t.startsWith(inputHira)) ||
        (inputRomaji && tLower.startsWith(inputRomaji))
      );
    });

    if (isPrefix && !isExplicit) {
      // User is still typing in progress: neutral state without red error
      setTranscriptionMatch(null);
      setTranscriptionFeedback(null);
    } else if (isExplicit || cleanInput.length >= (primaryExpectedReading ? primaryExpectedReading.length : 1)) {
      // Distinctly incorrect
      setTranscriptionMatch('incorrect');
      const expectedDisplay = primaryExpectedReading 
        ? `${primaryExpectedReading}${primaryExpectedRomaji && primaryExpectedRomaji !== primaryExpectedReading ? ` (${primaryExpectedRomaji})` : ''}`
        : (text || activeChar);
      setTranscriptionFeedback({
        type: 'error',
        message: `No coincide con la lectura esperada. Esperado: "${expectedDisplay}". Escribiste: "${cleanInput}".`
      });
    } else {
      setTranscriptionMatch(null);
      setTranscriptionFeedback(null);
    }
  }, [getValidTargetReadings, primaryExpectedReading, primaryExpectedRomaji, text, activeChar]);

  const handleTriggerVerify = () => {
    handleVerifyTranscription(transcriptionInput, true);
  };

  // -------------------------------------------------------------
  // HANZI WRITER INTERACTIVE QUIZ & ANIMATION
  // -------------------------------------------------------------

  useEffect(() => {
    if (activeTab !== 'stroke_quiz') {
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch (e) {}
      }
      return;
    }

    if (!hanziContainerRef.current || !activeChar) return;

    let isMounted = true;
    setQuizLoading(true);
    setQuizError(false);
    setQuizSuccess(false);
    setQuizMistakes(0);

    try {
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch (e) {}
      }
      hanziContainerRef.current.innerHTML = '';

      writerRef.current = HanziWriter.create(hanziContainerRef.current, activeChar, {
        width: 280,
        height: 280,
        padding: 16,
        showOutline: true,
        strokeAnimationSpeed: 1.4,
        delayBetweenStrokes: 160,
        strokeColor: '#3b82f6',
        radicalColor: '#10b981',
        outlineColor: '#cbd5e1',
        drawingColor: '#1e293b',
        drawingWidth: 16,
        showCharacter: false,
        charDataLoader: (char, onLoad, onError) => {
          const encoded = encodeURIComponent(char);
          const urls = [
            `https://cdn.jsdelivr.net/npm/hanzi-writer-data-jp@0/${encoded}.json`,
            `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encoded}.json`,
            `https://unpkg.com/hanzi-writer-data-jp@0/${encoded}.json`,
            `https://unpkg.com/hanzi-writer-data@2.0/${encoded}.json`
          ];

          let index = 0;
          const tryNext = () => {
            if (!isMounted) return;
            if (index >= urls.length) {
              setQuizLoading(false);
              setQuizError(true);
              onError(new Error(`Stroke data not found for ${char}`));
              return;
            }
            fetch(urls[index++])
              .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
              })
              .then(data => {
                if (!isMounted) return;
                setQuizLoading(false);
                setQuizError(false);
                onLoad(data);
              })
              .catch(() => tryNext());
          };
          tryNext();
        }
      });

      // Start quiz automatically
      startQuizSession();
    } catch (err) {
      console.error('HanziWriter init error:', err);
      setQuizLoading(false);
      setQuizError(true);
    }

    return () => {
      isMounted = false;
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch (e) {}
      }
      if (hanziContainerRef.current) {
        hanziContainerRef.current.innerHTML = '';
      }
    };
  }, [activeTab, activeChar]);

  const startQuizSession = () => {
    if (!writerRef.current) return;
    setQuizMistakes(0);
    setQuizSuccess(false);
    try {
      writerRef.current.quiz({
        onMistake: () => setQuizMistakes(m => m + 1),
        onComplete: () => {
          setQuizSuccess(true);
          showNotification('¡Trazo completado perfectamente en orden y dirección! 🎉', 'success');
        }
      });
    } catch (e) {
      console.warn('Quiz start error:', e);
    }
  };

  const handleAnimateQuiz = () => {
    if (!writerRef.current) return;
    try {
      writerRef.current.cancelQuiz();
      writerRef.current.animateCharacter({
        onComplete: () => startQuizSession()
      });
    } catch (e) {}
  };

  // -------------------------------------------------------------
  // GUARDAR Y RETOMAR HOJAS
  // -------------------------------------------------------------

  const handleOpenSaveDialog = () => {
    const defaultTitle = `${title || 'Práctica'} - ${activeChar} (${new Date().toLocaleDateString()})`;
    setSheetTitleInput(defaultTitle);
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!sheetTitleInput.trim()) return;

    // Generate thumbnail
    let thumbnail = null;
    const drawCanvas = drawingCanvasRef.current;
    if (drawCanvas) {
      thumbnail = drawCanvas.toDataURL('image/png');
    }

    const newSheet = savePracticeSheet({
      title: sheetTitleInput.trim(),
      text,
      kana,
      source,
      strokes,
      gridType,
      paperStyle,
      strokeStyle,
      strokeWidth,
      inkColor,
      currentCharIndex,
      thumbnail
    });

    if (newSheet) {
      setSavedSheets(getSavedPracticeSheets());
      setIsSaveModalOpen(false);
      showNotification(`¡Hoja "${newSheet.title}" guardada con éxito! 💾`, 'success');
      if (onSaveToCloud) onSaveToCloud(newSheet);
    }
  };

  const handleResumeSheet = (sheet) => {
    setText(sheet.text || '日本語');
    setKana(sheet.kana || '');
    setTitle(sheet.title || 'Práctica');
    setSource(sheet.source || 'custom');
    setStrokes(sheet.strokes || []);
    setRedoStack([]);
    setGridType(sheet.gridType || 'mizige');
    setPaperStyle(sheet.paperStyle || 'washi');
    setStrokeStyle(sheet.strokeStyle || 'shodo');
    setStrokeWidth(sheet.strokeWidth || 8);
    setInkColor(sheet.inkColor || '#18181b');
    setCurrentCharIndex(sheet.currentCharIndex || 0);
    setIsLibraryOpen(false);
    showNotification(`Hoja "${sheet.title}" cargada. ¡Puedes continuar donde lo dejaste! ✍️`, 'success');
  };

  const handleDeleteSheet = (id, e) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta hoja de práctica guardada?')) {
      deletePracticeSheet(id);
      setSavedSheets(getSavedPracticeSheets());
      showNotification('Hoja eliminada de la biblioteca', 'info');
    }
  };

  const handleExportPNG = async () => {
    const dataUrl = await exportPracticeSheetToImage({
      strokes,
      gridType,
      paperStyle,
      title: `${title} · ${activeChar}`,
      character: activeChar,
      width: 900,
      height: 900
    });

    if (!dataUrl) {
      showNotification('Error al exportar imagen', 'error');
      return;
    }

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `nihongo_practica_${activeChar}_${Date.now()}.png`;
    a.click();
    showNotification('¡Imagen de práctica descargada con sello Hanko! 💮', 'success');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="practice-pad-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100005,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? 0 : '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="practice-pad-window"
        style={{
          width: isFullscreen ? '100vw' : '96vw',
          maxWidth: isFullscreen ? '100vw' : '1100px',
          height: isFullscreen ? '100vh' : '92vh',
          maxHeight: isFullscreen ? '100vh' : '860px',
          background: 'var(--bg-surface, #ffffff)',
          borderRadius: isFullscreen ? 0 : '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* TOAST / BANNER NOTIFICATION */}
        {notification && (
          <div 
            style={{
              position: 'absolute',
              top: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              background: notification.type === 'success' ? '#059669' : notification.type === 'warning' ? '#d97706' : '#3b82f6',
              color: '#ffffff',
              animation: 'bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {notification.type === 'success' ? <Sparkles size={16} /> : <AlertCircle size={16} />}
            <span>{notification.msg}</span>
          </div>
        )}

        {/* =========================================================================
            TOP HEADER BAR
           ========================================================================= */}
        <header 
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          {/* Left: Title & Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div 
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
              }}
            >
              <PenTool size={18} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Cuaderno de Caligrafía & Trazos
                </h2>
                <span 
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'var(--primary-bg, #eef2ff)',
                    color: 'var(--primary, #4f46e5)',
                    textTransform: 'uppercase'
                  }}
                >
                  {source === 'kanji' ? 'Kanji' : source === 'vocab' ? 'Vocabulario' : source === 'conversation' ? 'Conversación' : source === 'story' ? 'Historia' : source === 'grammar' ? 'Gramática' : 'Notas Libres'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {title} {kana ? `(${kana})` : ''}
              </p>
            </div>
          </div>

          {/* Center: Tabs Switcher (Cuaderno Libre vs Verificador Guiado) */}
          <div 
            style={{
              display: 'flex',
              background: 'var(--border, #e2e8f0)',
              padding: '3px',
              borderRadius: '10px',
              gap: 2
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('canvas')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'canvas' ? 700 : 500,
                background: activeTab === 'canvas' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'canvas' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'canvas' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Grid size={15} />
              <span>Cuaderno & Cuadrícula</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stroke_quiz')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'stroke_quiz' ? 700 : 500,
                background: activeTab === 'stroke_quiz' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'stroke_quiz' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'stroke_quiz' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <CheckCircle2 size={15} />
              <span>Verificador de Trazos Paso a Paso</span>
            </button>
          </div>

          {/* Right: Library, Save, Fullscreen & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsLibraryOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
              title="Ver mis cuadernos y hojas guardadas para retomar"
            >
              <FolderOpen size={14} />
              <span>Mis Cuadernos ({savedSheets.length})</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenSaveDialog}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
              title="Guardar estado actual para retomar luego"
            >
              <Save size={14} />
              <span>Guardar</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleExportPNG}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
              title="Descargar imagen con sello Hanko"
            >
              <Download size={14} />
              <span className="hidden-sm">PNG</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsFullscreen(prev => !prev)}
              style={{ padding: '6px' }}
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              style={{ padding: '6px', color: 'var(--danger)' }}
              title="Cerrar (El borrador se guarda automáticamente)"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* =========================================================================
            CHARACTER NAVIGATION STRIP & AUDIO TOOLBAR
           ========================================================================= */}
        <div 
          style={{
            padding: '8px 18px',
            background: 'var(--bg-main)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          {/* MODO CUADERNO (activeTab === 'canvas'): TODOS LOS CARACTERES JUNTOS, NO SEPARADOS */}
          {activeTab === 'canvas' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260, flexWrap: 'wrap' }}>
              {(!text || !text.trim()) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span 
                    style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 700, 
                      color: 'var(--text-main)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6,
                      background: 'var(--bg-surface)',
                      padding: '4px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)'
                    }}
                  >
                    📝 Cuaderno Libre sin Guía
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Lienzo despejado para trazos libres, caligrafía y notas.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
                    {text.trim().length === 1 ? 'Carácter en práctica:' : 'Frase completa:'}
                  </span>
                  {/* TODOS LOS CARACTERES JUNTOS EN UN SOLO BLOQUE INTEGRADO */}
                  <div 
                    className="jp-text"
                    style={{
                      fontSize: text.trim().length <= 6 ? '1.25rem' : '1.1rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      background: 'var(--bg-surface)',
                      padding: '5px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      letterSpacing: '0.05em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                    title="Texto completo del cuaderno (mostrado continuo y no separado)"
                  >
                    <span>{text.trim()}</span>
                    {kana && (
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                        （{kana}）
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODO PASO A PASO (activeTab === 'stroke_quiz'): CONSERVAR LOS CARACTERES SEPARADOS */}
          {activeTab === 'stroke_quiz' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', maxWidth: '70%', paddingBottom: 2 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
                Paso a paso ({characters.length}):
              </span>

              {characters.map((ch, idx) => {
                const isCurrent = idx === currentCharIndex;
                return (
                  <button
                    key={`${ch}-${idx}`}
                    type="button"
                    onClick={() => setCurrentCharIndex(idx)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '8px',
                      border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isCurrent ? 'var(--primary)' : 'var(--bg-surface)',
                      color: isCurrent ? '#ffffff' : 'var(--text-main)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-jp)',
                      boxShadow: isCurrent ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                    title={`Verificar trazo del carácter ${ch}`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Audio & Custom Text Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {activeTab === 'stroke_quiz' && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => audioManager.speak(activeChar)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem' }}
                title={`Escuchar pronunciación de ${activeChar}`}
              >
                <Volume2 size={14} />
                <span>Oír {activeChar}</span>
              </button>
            )}

            {text && text.trim().length > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => audioManager.speak(text)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem' }}
                title="Escuchar pronunciación completa"
              >
                <Volume2 size={14} />
                <span>{text.trim().length === 1 ? `Oír ${text.trim()}` : 'Oír Frase Completa'}</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsEditingText(prev => !prev)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}
              title="Escribir o cambiar texto de práctica"
            >
              <Edit3 size={13} />
              <span>{isEditingText ? 'Listo' : 'Editar texto'}</span>
            </button>
          </div>
        </div>

        {/* In-place Text Edit Drawer */}
        {isEditingText && (
          <div 
            style={{
              padding: '10px 18px',
              background: 'var(--primary-bg, #f5f3ff)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Texto a practicar:</span>
            <input 
              type="text" 
              value={text} 
              onChange={(e) => {
                setText(e.target.value);
                setCurrentCharIndex(0);
              }}
              placeholder="Escribe kanjis, oraciones, palabras..."
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-jp)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main, #ffffff)',
                outline: 'none'
              }}
            />
            <button 
              type="button" 
              className="btn btn-primary btn-sm"
              onClick={() => setIsEditingText(false)}
            >
              Aceptar
            </button>
          </div>
        )}

        {/* =========================================================================
            MAIN WORKSPACE BODY
           ========================================================================= */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          {/* TAB 1: CANVAS PRACTICE WORKSPACE */}
          {activeTab === 'canvas' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Canvas Controls Toolbar */}
              <div 
                style={{
                  padding: '8px 16px',
                  background: 'var(--bg-surface)',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap'
                }}
              >
                {/* 1. Stroke Style Selector (Shodo, Marker, Fountain, Pencil, Gel) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Estilo de Trazo:
                  </span>
                  <div style={{ display: 'flex', background: 'var(--border, #e2e8f0)', padding: 2, borderRadius: 8, gap: 2 }}>
                    {STROKE_STYLES.map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setStrokeStyle(st.id);
                          setStrokeWidth(st.defaultWidth);
                          setIsEraser(false);
                          setIsPanMode(false);
                        }}
                        style={{
                          border: 'none',
                          background: strokeStyle === st.id && !isEraser && !isPanMode ? 'var(--bg-surface)' : 'transparent',
                          color: strokeStyle === st.id && !isEraser && !isPanMode ? 'var(--primary)' : 'var(--text-muted)',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: '0.78rem',
                          fontWeight: strokeStyle === st.id && !isEraser && !isPanMode ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          boxShadow: strokeStyle === st.id && !isEraser && !isPanMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                        title={st.desc}
                      >
                        <span>{st.icon}</span>
                        <span className="hidden-xs">{st.name.split(' ')[0]}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setIsEraser(true);
                        setIsPanMode(false);
                      }}
                      style={{
                        border: 'none',
                        background: isEraser && !isPanMode ? 'var(--danger)' : 'transparent',
                        color: isEraser && !isPanMode ? '#ffffff' : 'var(--text-muted)',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.78rem',
                        fontWeight: isEraser && !isPanMode ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="Goma de borrar trazos"
                    >
                      <Eraser size={13} />
                      <span className="hidden-xs">Goma</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPanMode(!isPanMode)}
                      style={{
                        border: 'none',
                        background: isPanMode ? 'var(--primary)' : 'transparent',
                        color: isPanMode ? '#ffffff' : 'var(--text-muted)',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.78rem',
                        fontWeight: isPanMode ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="Mover lienzo (Espacio + arrastrar o botón central)"
                    >
                      <Hand size={13} />
                      <span className="hidden-xs">Mover</span>
                    </button>
                  </div>
                </div>

                {/* 2. Ink Colors */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Tinta:
                  </span>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {INK_PALETTES.map(ink => {
                      const isSelected = inkColor === (paperStyle === 'chalkboard' ? ink.lightColor : ink.color);
                      return (
                        <button
                          key={ink.id}
                          type="button"
                          onClick={() => {
                            setInkColor(paperStyle === 'chalkboard' ? ink.lightColor : ink.color);
                            setIsEraser(false);
                          }}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: paperStyle === 'chalkboard' ? ink.lightColor : ink.color,
                            border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                            transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            transition: 'all 0.15s ease'
                          }}
                          title={ink.name}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* 3. Grid & Paper Types */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Cuadrícula:</span>
                    <select
                      value={gridType}
                      onChange={(e) => setGridType(e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        fontSize: '0.78rem',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        cursor: 'pointer'
                      }}
                    >
                      {GRID_TYPES.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Papel:</span>
                    <select
                      value={paperStyle}
                      onChange={(e) => setPaperStyle(e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        fontSize: '0.78rem',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        cursor: 'pointer'
                      }}
                    >
                      {PAPER_STYLES.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Undo, Redo, Clear & Verify */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleUndo}
                    disabled={strokes.length === 0}
                    style={{ padding: '6px', opacity: strokes.length === 0 ? 0.4 : 1 }}
                    title="Deshacer trazo (Ctrl+Z)"
                  >
                    <Undo2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    style={{ padding: '6px', opacity: redoStack.length === 0 ? 0.4 : 1 }}
                    title="Rehacer trazo"
                  >
                    <Redo2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleClearCanvas}
                    style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                    title="Limpiar todo el lienzo"
                  >
                    <RotateCcw size={13} />
                    <span className="hidden-xs">Limpiar</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleVerifyDrawing}
                    disabled={isVerifying}
                    style={{
                      fontSize: '0.8rem',
                      padding: '5px 12px',
                      background: 'linear-gradient(135deg, #059669, #10b981)',
                      border: 'none',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                    }}
                    title="Analizar y verificar precisión de trazo respecto al carácter modelo"
                  >
                    <Sparkles size={14} />
                    <span>Verificar Trazo</span>
                  </button>
                </div>
              </div>

              {/* Central Drawing Viewport with Ghost Guide Layer */}
              <div 
                ref={viewportRef}
                onPointerDown={handleViewportPointerDown}
                style={{
                  flex: 1,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: paperStyle === 'chalkboard' ? '#090d16' : '#f1f5f9',
                  userSelect: 'none',
                  cursor: (isPanMode || isSpacePressed)
                    ? (isPanning ? 'grabbing' : 'grab')
                    : (zoom > 1 ? 'default' : 'default')
                }}
              >
                <div 
                  ref={artboardRef}
                  style={{
                    position: 'relative',
                    width: `${canvasDimensions.width}px`,
                    height: `${canvasDimensions.height}px`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    boxShadow: '0 4px 25px rgba(0,0,0,0.15)',
                    touchAction: 'none',
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isPanning ? 'none' : 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Layer 1: Background Grid Canvas */}
                  <canvas 
                    ref={gridCanvasRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Layer 2: Ghost Reference Glyph Overlay Adaptado a la Cuadrícula */}
                  {ghostOpacity > 0 && text && text.trim().length > 0 && (
                    <div 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        pointerEvents: 'none',
                        opacity: ghostOpacity / 100,
                        color: paperStyle === 'chalkboard' ? '#94a3b8' : '#64748b',
                        fontFamily: 'var(--font-jp)',
                        userSelect: 'none',
                        transition: 'opacity 0.2s ease'
                      }}
                    >
                      {/* Caso A: Tianzige, Mizige o Genkouyoushi - Cada carácter colocado en su celda exacta */}
                      {(gridType === 'tianzige' || gridType === 'mizige' || gridType === 'genkouyoushi') && (
                        (gridLayout?.cells || []).map((cell) => {
                          if (!cell.char) return null;
                          return (
                            <div
                              key={cell.index}
                              style={{
                                position: 'absolute',
                                left: cell.x,
                                top: cell.y,
                                width: cell.width,
                                height: cell.height,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: cell.fontSize,
                                fontWeight: 700,
                                lineHeight: 1,
                                textAlign: 'center',
                                userSelect: 'none'
                              }}
                            >
                              {cell.char}
                            </div>
                          );
                        })
                      )}

                      {/* Caso B: Renglones pautados (Lined) - Texto apoyado en el renglón con sangría */}
                      {gridType === 'lined' && (
                        (gridLayout?.lines || []).map((line) => {
                          if (!line.text) return null;
                          return (
                            <div
                              key={line.lineIndex}
                              style={{
                                position: 'absolute',
                                left: (gridLayout?.meta?.marginX || 64) + 16,
                                top: line.y,
                                height: gridLayout?.meta?.lineSpacing || 48,
                                display: 'flex',
                                alignItems: 'flex-end',
                                paddingBottom: 6,
                                fontSize: line.fontSize,
                                fontWeight: 700,
                                letterSpacing: '0.12em',
                                lineHeight: 1,
                                whiteSpace: 'nowrap',
                                userSelect: 'none'
                              }}
                            >
                              {line.text}
                            </div>
                          );
                        })
                      )}

                      {/* Caso C: Dot o Blank - Centrado armónico proporcionado */}
                      {(gridType === 'dot' || gridType === 'blank') && (
                        <div 
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px 32px'
                          }}
                        >
                          <div 
                            style={{
                              maxWidth: '92%',
                              textAlign: 'center',
                              fontWeight: 700,
                              lineHeight: 1.35,
                              letterSpacing: '0.08em',
                              fontSize: text.trim().length <= 1 
                                ? 'min(55vh, 380px)'
                                : text.trim().length <= 4 
                                ? 'min(18vh, 110px)'
                                : text.trim().length <= 8
                                ? 'min(13vh, 72px)'
                                : text.trim().length <= 16
                                ? 'min(9vh, 46px)'
                                : 'min(6.5vh, 32px)',
                              wordBreak: 'break-word',
                              userSelect: 'none'
                            }}
                          >
                            {text.trim()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Layer 3: Interactive Drawing Canvas */}
                  <canvas 
                    ref={drawingCanvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 3,
                      cursor: (isPanMode || isSpacePressed)
                        ? (isPanning ? 'grabbing' : 'grab')
                        : isEraser 
                          ? 'cell' 
                          : 'crosshair',
                      touchAction: 'none'
                    }}
                  />
                </div>

                {/* Floating Ghost Opacity Slider */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    zIndex: 10,
                    background: 'var(--bg-surface)',
                    padding: '6px 12px',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    border: '1px solid var(--border)',
                    fontSize: '0.78rem'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {ghostOpacity > 0 ? <Eye size={13} /> : <EyeOff size={13} />}
                    Guía Fantasma:
                  </span>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={ghostOpacity}
                    onChange={(e) => setGhostOpacity(Number(e.target.value))}
                    style={{ width: 80, accentColor: 'var(--primary)' }}
                    title="Opacidad de la silueta de ayuda para calcar (0% = oculta)"
                  />
                  <span style={{ minWidth: 32, fontWeight: 700 }}>{ghostOpacity}%</span>
                </div>

                {/* Floating Stroke Thickness Slider */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 210,
                    zIndex: 10,
                    background: 'var(--bg-surface)',
                    padding: '6px 12px',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    border: '1px solid var(--border)',
                    fontSize: '0.78rem'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Grosor:</span>
                  <input 
                    type="range"
                    min="2"
                    max="28"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    style={{ width: 75, accentColor: 'var(--primary)' }}
                  />
                  <span style={{ minWidth: 28, fontWeight: 700 }}>{strokeWidth}px</span>
                </div>

                {/* Floating Zoom & Pan Navigation Dock */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    zIndex: 10,
                    background: 'var(--bg-surface)',
                    padding: '4px 8px',
                    borderRadius: 12,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    border: '1px solid var(--border)',
                    fontSize: '0.78rem'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleZoomChange(zoom - 0.25)}
                    disabled={zoom <= 0.5}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: zoom <= 0.5 ? 'var(--text-muted)' : 'var(--text-main)',
                      opacity: zoom <= 0.5 ? 0.4 : 1,
                      cursor: zoom <= 0.5 ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Alejar (Zoom Out - Ctrl+-)"
                  >
                    <ZoomOut size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={handleResetZoomAndPan}
                    style={{
                      border: 'none',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      minWidth: 46,
                      textAlign: 'center'
                    }}
                    title="Restablecer zoom al 100% y centrar (Ctrl+0)"
                  >
                    {Math.round(zoom * 100)}%
                  </button>

                  <button
                    type="button"
                    onClick={() => handleZoomChange(zoom + 0.25)}
                    disabled={zoom >= 4}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: zoom >= 4 ? 'var(--text-muted)' : 'var(--text-main)',
                      opacity: zoom >= 4 ? 0.4 : 1,
                      cursor: zoom >= 4 ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Acercar (Zoom In - Ctrl++)"
                  >
                    <ZoomIn size={15} />
                  </button>

                  <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 2px' }} />

                  <button
                    type="button"
                    onClick={() => setIsPanMode(!isPanMode)}
                    style={{
                      border: 'none',
                      background: isPanMode ? 'var(--primary)' : 'transparent',
                      color: isPanMode ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title={isPanMode ? "Modo mover activo (clic para volver a dibujar)" : "Mover lienzo (Espacio + arrastrar)"}
                  >
                    <Hand size={13} />
                    <span className="hidden-xs">Mover</span>
                  </button>

                  {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
                    <button
                      type="button"
                      onClick={handleResetZoomAndPan}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Centrar y reajustar lienzo"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>

                {/* Floating Verification Result Card */}
                {verificationResult && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 20,
                      background: 'var(--bg-surface)',
                      padding: '14px 18px',
                      borderRadius: 14,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                      border: `2px solid ${verificationResult.score >= 70 ? 'var(--success, #10b981)' : 'var(--warning, #f59e0b)'}`,
                      maxWidth: 320,
                      animation: 'fadeIn 0.2s ease-out'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: verificationResult.score >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                        {verificationResult.badge}
                      </span>
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-xs"
                        onClick={() => setVerificationResult(null)}
                        style={{ padding: 2 }}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>
                        {verificationResult.score}%
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        precisión de silueta
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: '0 0 10px', lineHeight: 1.4 }}>
                      {verificationResult.feedback}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.72rem', background: 'var(--bg-main)', padding: '6px 8px', borderRadius: 8 }}>
                      <div>Cobertura: <strong>{verificationResult.coverage}%</strong></div>
                      <div>Precisión tinta: <strong>{verificationResult.precision}%</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Reading & Verification Transcription Bar */}
              <div 
                style={{
                  padding: '10px 18px',
                  background: 'var(--bg-surface)',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      Verificar Lectura / Transcripción:
                    </span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 240, maxWidth: 440 }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input 
                          type="text"
                          className="japanese-input jp-text"
                          value={transcriptionInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            let finalVal = val;
                            if (useIme && !isComposingRef.current) {
                              try {
                                finalVal = wanakana.toKana(val, { IMEMode: true });
                              } catch (err) {
                                finalVal = val;
                              }
                            }
                            handleVerifyTranscription(finalVal);
                          }}
                          onCompositionStart={() => { isComposingRef.current = true; }}
                          onCompositionEnd={(e) => {
                            isComposingRef.current = false;
                            handleVerifyTranscription(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isComposingRef.current) {
                              e.preventDefault();
                              handleTriggerVerify();
                            }
                          }}
                          placeholder={primaryExpectedReading ? `Lectura en romaji o kana (ej. ${primaryExpectedRomaji || '...'})` : 'Escribe lo que practicaste...'}
                          style={{
                            width: '100%',
                            padding: '6px 32px 6px 12px',
                            borderRadius: 8,
                            border: transcriptionMatch === 'correct' 
                              ? '2px solid var(--success, #10b981)' 
                              : transcriptionMatch === 'incorrect' 
                                ? '2px solid var(--danger, #ef4444)' 
                                : '1px solid var(--border)',
                            fontSize: '0.88rem',
                            fontFamily: 'var(--font-jp)',
                            background: 'var(--bg-main, #121214)',
                            color: 'var(--text-main, #ffffff)',
                            caretColor: 'var(--primary, #6366f1)',
                            outline: 'none',
                            boxShadow: transcriptionMatch === 'correct'
                              ? '0 0 0 2px rgba(16, 185, 129, 0.2)'
                              : transcriptionMatch === 'incorrect'
                                ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
                                : 'none'
                          }}
                        />
                        {transcriptionInput && (
                          <button
                            type="button"
                            onClick={() => {
                              setTranscriptionInput('');
                              setTranscriptionMatch(null);
                              setTranscriptionFeedback(null);
                            }}
                            style={{
                              position: 'absolute',
                              right: 8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: 2,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Limpiar"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* IME Mode Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setUseIme(prev => !prev)}
                        className={`btn btn-xs ${useIme ? 'btn-primary' : 'btn-outline'}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.74rem',
                          padding: '5px 8px',
                          borderRadius: 6,
                          height: 32,
                          whiteSpace: 'nowrap'
                        }}
                        title={useIme ? 'IME activo: convierte romaji a kana automáticamente. Clic para desactivar.' : 'IME desactivado: escribe romaji o texto directo. Clic para activar conversión a kana.'}
                      >
                        <Keyboard size={13} />
                        <span>IME: {useIme ? 'ON 🇯🇵' : 'OFF'}</span>
                      </button>

                      {/* Explicit Verify Button */}
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleTriggerVerify}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.76rem',
                          padding: '0 10px',
                          height: 32,
                          borderRadius: 6,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span>Verificar</span>
                      </button>

                      {/* Audio Button */}
                      {primaryExpectedReading && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => audioManager.speak(primaryExpectedReading)}
                          title={`Escuchar lectura esperada (${primaryExpectedReading})`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            padding: 0,
                            borderRadius: 6,
                            color: 'var(--primary)'
                          }}
                        >
                          <Volume2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>💾 Borrador autoguardado en tiempo real</span>
                  </div>
                </div>

                {/* Feedback message banner (Success, informative error or note) */}
                {transcriptionFeedback && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: transcriptionFeedback.type === 'success'
                        ? 'rgba(16, 185, 129, 0.12)'
                        : transcriptionFeedback.type === 'error'
                          ? 'rgba(239, 68, 68, 0.12)'
                          : 'rgba(99, 102, 241, 0.12)',
                      color: transcriptionFeedback.type === 'success'
                        ? 'var(--success, #10b981)'
                        : transcriptionFeedback.type === 'error'
                          ? 'var(--danger, #ef4444)'
                          : 'var(--primary, #6366f1)',
                      border: transcriptionFeedback.type === 'success'
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : transcriptionFeedback.type === 'error'
                          ? '1px solid rgba(239, 68, 68, 0.3)'
                          : '1px solid rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {transcriptionFeedback.type === 'success' && <CheckCircle2 size={16} style={{ flexShrink: 0 }} />}
                    {transcriptionFeedback.type === 'error' && <AlertCircle size={16} style={{ flexShrink: 0 }} />}
                    <span>{transcriptionFeedback.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HANZI WRITER INTERACTIVE STROKE-BY-STROKE QUIZ */}
          {activeTab === 'stroke_quiz' && (
            <div 
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                background: 'var(--bg-main)',
                overflowY: 'auto'
              }}
            >
              <div 
                style={{
                  background: 'var(--bg-surface)',
                  padding: '28px 36px',
                  borderRadius: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 18,
                  maxWidth: 420,
                  width: '100%'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 800 }}>
                    Trazos Paso a Paso: <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-jp)' }}>{activeChar}</span>
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Dibuja directamente sobre el recuadro respetando el orden y sentido correcto de cada trazo.
                  </p>
                  {(!text || !text.trim()) && (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Probar ideograma:</span>
                      {['日', '桜', '水', '火', '木', '金', '土'].map(k => (
                        <button
                          key={k}
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => {
                            setText(k);
                            setCurrentCharIndex(0);
                          }}
                          style={{ fontSize: '0.78rem', padding: '2px 8px' }}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* HanziWriter Canvas Mount Target */}
                <div 
                  style={{
                    position: 'relative',
                    width: 280,
                    height: 280,
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: quizSuccess ? '3px solid var(--success)' : '2px dashed var(--border)',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div ref={hanziContainerRef} style={{ width: 280, height: 280 }} />

                  {quizLoading && (
                    <div 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,0.92)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <RotateCcw size={24} className="animate-spin text-indigo-500" />
                      <span>Cargando trazos de {activeChar}...</span>
                    </div>
                  )}

                  {quizError && (
                    <div 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                        textAlign: 'center',
                        gap: 8,
                        fontSize: '0.82rem',
                        color: 'var(--danger)'
                      }}
                    >
                      <AlertCircle size={24} />
                      <span>Trazos vectoriales no indexados para este carácter específico. Puedes practicarlo libremente en el modo Cuaderno & Cuadrícula.</span>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleAnimateQuiz}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    title="Ver animación de trazos"
                  >
                    <Play size={14} />
                    <span>Animar Trazos</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={startQuizSession}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    title="Reiniciar práctica interactiva"
                  >
                    <RotateCcw size={14} />
                    <span>Reiniciar Quiz</span>
                  </button>
                </div>

                {/* Mistakes and Success Badge */}
                <div style={{ fontSize: '0.85rem', textAlign: 'center' }}>
                  {quizSuccess ? (
                    <div style={{ color: 'var(--success)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={16} />
                      <span>¡Kanji trazado con éxito y orden perfecto! 🎉</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>
                      Errores de orden o dirección: <strong style={{ color: quizMistakes > 0 ? 'var(--danger)' : 'inherit' }}>{quizMistakes}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              LIBRARY DRAWER (MIS CUADERNOS GUARDADOS)
             ========================================================================= */}
          {isLibraryOpen && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: '380px',
                maxWidth: '90%',
                background: 'var(--bg-surface)',
                borderLeft: '1px solid var(--border)',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.2)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideInRight 0.25s ease-out'
              }}
            >
              <div 
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FolderOpen size={18} className="text-indigo-500" />
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>
                    Mis Cuadernos Guardados
                  </h3>
                </div>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsLibraryOpen(false)}
                  style={{ padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
                {savedSheets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📓</div>
                    <p style={{ fontWeight: 700, margin: '0 0 6px', color: 'var(--text-main)' }}>
                      No tienes hojas guardadas todavía
                    </p>
                    <p style={{ fontSize: '0.8rem', margin: 0 }}>
                      Guarda tu práctica con el botón "Guardar" para retomar tus trazos en cualquier momento.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {savedSheets.map(sheet => (
                      <div 
                        key={sheet.id}
                        onClick={() => handleResumeSheet(sheet)}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '12px',
                          background: 'var(--bg-main)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          gap: 12,
                          alignItems: 'center'
                        }}
                      >
                        {/* Thumbnail preview */}
                        <div 
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: '8px',
                            background: '#faf6ee',
                            border: '1px solid var(--border)',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {sheet.thumbnail ? (
                            <img src={sheet.thumbnail} alt={sheet.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-jp)' }}>
                              {sheet.text?.[0] || '日'}
                            </span>
                          )}
                        </div>

                        {/* Metadata */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: '0 0 3px', fontSize: '0.88rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sheet.title}
                          </h4>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                            {new Date(sheet.updatedAt).toLocaleDateString()} · {sheet.strokes?.length || 0} trazos
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <span 
                              style={{
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: 'var(--primary-bg)',
                                color: 'var(--primary)',
                                fontWeight: 600
                              }}
                            >
                              Retomar ✍️
                            </span>
                          </div>
                        </div>

                        {/* Delete action */}
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={(e) => handleDeleteSheet(sheet.id, e)}
                          style={{ color: 'var(--danger)', padding: 6 }}
                          title="Eliminar esta hoja"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              MODAL: GUARDAR HOJA DE PRÁCTICA
             ========================================================================= */}
          {isSaveModalOpen && (
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16
              }}
            >
              <div 
                style={{
                  background: 'var(--bg-surface)',
                  padding: '24px',
                  borderRadius: '16px',
                  maxWidth: 420,
                  width: '100%',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  border: '1px solid var(--border)'
                }}
              >
                <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800 }}>
                  💾 Guardar Hoja de Práctica
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Asigna un nombre a tu hoja de apuntes para poder retomarla o revisarla más tarde.
                </p>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
                    Título de la hoja:
                  </label>
                  <input 
                    type="text" 
                    value={sheetTitleInput} 
                    onChange={(e) => setSheetTitleInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main, #ffffff)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    onClick={() => setIsSaveModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={handleConfirmSave}
                  >
                    Guardar Hoja
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
