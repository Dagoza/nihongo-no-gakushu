'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  X, 
  Minimize2, 
  Maximize2, 
  GripVertical
} from 'lucide-react';
import audioManager from '../../lib/audioManager';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0 || !isFinite(seconds)) {
    return '00:00';
  }
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25];

export default function FloatingMiniPlayer() {
  const [audioState, setAudioState] = useState({
    state: 'idle',
    currentText: '',
    currentAudioUrl: null,
    currentTime: 0,
    duration: 0,
    rate: 1.0,
    selectedText: ''
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(null); // { x, y } when dragged
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStartRef = useRef(null);
  const playerRef = useRef(null);
  const lastWidthRef = useRef(380);

  // Subscribe to audioManager updates
  useEffect(() => {
    const unsubscribe = audioManager.subscribe((newState) => {
      setAudioState(newState);
    });
    return () => unsubscribe();
  }, []);

  const duration = audioState.duration || 0;
  const currentTime = audioState.currentTime || 0;
  const isAudioTrack = Boolean(audioState.currentAudioUrl || duration > 0);
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  // Active check: show player whenever audio is playing, paused, or loaded
  const isActive = audioState.state === 'playing' || audioState.state === 'paused' || (audioState.currentAudioUrl && audioState.state !== 'idle');

  // Prevent exiting viewport on expand / collapse / window resize
  const clampPositionWithinViewport = useCallback((targetWidth, targetHeight) => {
    if (typeof window === 'undefined') return;
    const margin = 16;
    const width = targetWidth || playerRef.current?.offsetWidth || (isMinimized ? 120 : 380);
    const height = targetHeight || playerRef.current?.offsetHeight || 44;

    setPosition(prev => {
      if (!prev) return null;
      let newX = prev.x;
      let newY = prev.y;

      // Re-center / shift left if aligned to or exceeding the right edge
      if (newX + width > window.innerWidth - margin) {
        newX = Math.max(margin, window.innerWidth - width - margin);
      }
      if (newX < margin) {
        newX = margin;
      }

      if (newY + height > window.innerHeight - margin) {
        newY = Math.max(margin, window.innerHeight - height - margin);
      }
      if (newY < margin) {
        newY = margin;
      }

      if (newX !== prev.x || newY !== prev.y) {
        return { x: newX, y: newY };
      }
      return prev;
    });
  }, [isMinimized]);

  // Re-clamp whenever minimized state changes (e.g. expanding near right edge)
  useEffect(() => {
    if (!position || typeof window === 'undefined') return;
    // Delay slightly to allow DOM layout measurement of new capsule width
    const timer = setTimeout(() => {
      const estimatedWidth = isMinimized ? 120 : 380;
      clampPositionWithinViewport(estimatedWidth, 44);
    }, 40);
    return () => clearTimeout(timer);
  }, [isMinimized, clampPositionWithinViewport, position]);

  // Re-clamp on window resize
  useEffect(() => {
    const handleResize = () => {
      if (position) {
        clampPositionWithinViewport();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, clampPositionWithinViewport]);

  // Play / Pause toggle
  const handlePlayPause = useCallback(() => {
    if (audioState.state === 'playing') {
      audioManager.pause();
    } else if (audioState.state === 'paused') {
      audioManager.resume();
    } else if (audioState.currentAudioUrl) {
      audioManager.resume();
    } else if (audioState.currentText) {
      audioManager.speak(audioState.currentText);
    }
  }, [audioState.state, audioState.currentAudioUrl, audioState.currentText]);

  // Restart from beginning (0:00)
  const handleRestart = useCallback(() => {
    if (typeof audioManager.restart === 'function') {
      audioManager.restart();
    } else {
      audioManager.seek(0);
      if (audioState.state !== 'playing') {
        audioManager.resume();
      }
    }
  }, [audioState.state]);

  // Skip relative (-5s / +5s)
  const handleSeekRelative = useCallback((delta) => {
    audioManager.seekRelative(delta);
  }, []);

  // Cycle speed rate
  const handleCycleSpeed = useCallback(() => {
    const currentRate = audioState.rate || 1.0;
    const currentIdx = SPEED_OPTIONS.indexOf(currentRate);
    const nextIdx = (currentIdx + 1) % SPEED_OPTIONS.length;
    const nextRate = SPEED_OPTIONS[nextIdx];
    audioManager.setRate(nextRate);
  }, [audioState.rate]);

  // Close & stop playback
  const handleClose = useCallback(() => {
    audioManager.stop();
  }, []);

  // Jump to position on top progress rail click
  const handleProgressRailClick = (e) => {
    if (!duration || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioManager.seek(pct * duration);
  };

  // Immediate Drag on the dedicated Handle
  const handleHandlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (!playerRef.current) return;
    const rect = playerRef.current.getBoundingClientRect();

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position ? position.x : rect.left,
      posY: position ? position.y : rect.top,
      isCommitted: true,
      targetEl: e.currentTarget,
      pointerId: e.pointerId
    };

    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  // Safe Threshold Dragging on the container (does NOT hijack scrolling)
  const handleContainerPointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('.fmp-rail') || e.target.closest('.fmp-drag-handle')) {
      return;
    }
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (!playerRef.current) return;
    const rect = playerRef.current.getBoundingClientRect();

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position ? position.x : rect.left,
      posY: position ? position.y : rect.top,
      isCommitted: false,
      targetEl: e.currentTarget,
      pointerId: e.pointerId
    };
  };

  const handlePointerMove = (e) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    // Only commit to drag if moved beyond threshold (prevents scroll interference on touchscreens)
    if (!dragStartRef.current.isCommitted) {
      if (Math.hypot(dx, dy) > 8) {
        dragStartRef.current.isCommitted = true;
        setIsDragging(true);
        try {
          dragStartRef.current.targetEl?.setPointerCapture(dragStartRef.current.pointerId);
        } catch {}
      } else {
        return;
      }
    }

    const newX = dragStartRef.current.posX + dx;
    const newY = dragStartRef.current.posY + dy;

    const width = playerRef.current?.offsetWidth || (isMinimized ? 120 : 360);
    const height = playerRef.current?.offsetHeight || 44;
    const margin = 12;

    const clampedX = Math.max(margin, Math.min(newX, window.innerWidth - width - margin));
    const clampedY = Math.max(margin, Math.min(newY, window.innerHeight - height - margin));

    setPosition({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e) => {
    if (dragStartRef.current) {
      if (dragStartRef.current.isCommitted) {
        try {
          dragStartRef.current.targetEl?.releasePointerCapture(dragStartRef.current.pointerId);
        } catch {}
      }
      dragStartRef.current = null;
    }
    if (isDragging) {
      setIsDragging(false);
    }
  };

  if (!isActive) {
    return null;
  }

  const titleText = (audioState.currentText || audioState.selectedText || 'Audio en curso').trim();
  const truncatedText = titleText.length > 20 ? `${titleText.slice(0, 20)}…` : titleText;

  const playerStyle = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto'
      }
    : {};

  // Minimized mode: sleek compact mini-pill with drag handle on far left
  if (isMinimized) {
    return (
      <div
        ref={playerRef}
        className={`floating-mini-player minimized ${isDragging ? 'is-dragging' : ''}`}
        style={playerStyle}
        onPointerDown={handleContainerPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="region"
        aria-label="Reproductor de audio minimizado"
      >
        {/* Drag handle on the far left */}
        <div 
          className="fmp-drag-handle fmp-min-drag-handle" 
          title="Arrastrar reproductor"
          onPointerDown={handleHandlePointerDown}
        >
          <GripVertical size={14} className="text-muted" />
        </div>

        {/* Play/Pause high-contrast button */}
        <button
          type="button"
          className={`fmp-min-play-btn ${audioState.state === 'playing' ? 'is-playing' : ''}`}
          onClick={handlePlayPause}
          title={audioState.state === 'playing' ? 'Pausar audio' : 'Reanudar audio'}
          aria-label={audioState.state === 'playing' ? 'Pausar' : 'Reproducir'}
        >
          {audioState.state === 'playing' ? (
            <Pause size={14} className="fmp-icon-white" />
          ) : (
            <Play size={14} className="fmp-icon-white" style={{ marginLeft: 1 }} />
          )}
        </button>

        <div className="fmp-min-divider" />

        {/* Expand button */}
        <button
          type="button"
          className="fmp-min-action-btn"
          onClick={() => setIsMinimized(false)}
          title="Expandir reproductor completo"
          aria-label="Expandir reproductor"
        >
          <Maximize2 size={13} />
        </button>

        {/* Close button */}
        <button
          type="button"
          className="fmp-min-action-btn fmp-min-close-btn"
          onClick={handleClose}
          title="Cerrar y detener audio"
          aria-label="Cerrar"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  // Expanded mode: sleek compact capsule with drag handle on the left and NO sound icon
  return (
    <div
      ref={playerRef}
      className={`floating-mini-player ${isDragging ? 'is-dragging' : ''}`}
      style={playerStyle}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="region"
      aria-label="Reproductor de audio compacto"
    >
      {/* Top thin progress rail for audio tracks with duration */}
      {isAudioTrack && (
        <div 
          className="fmp-rail" 
          onClick={handleProgressRailClick}
          title={`Progreso: ${formatTime(currentTime)} / ${formatTime(duration)} (Clic para saltar)`}
        >
          <div 
            className="fmp-rail-fill" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      )}

      {/* Drag handle on the far left */}
      <div 
        className="fmp-drag-handle" 
        title="Arrastrar reproductor"
        onPointerDown={handleHandlePointerDown}
      >
        <GripVertical size={14} className="text-muted" />
      </div>

      {/* Info indicator - NO sound icon, just text and time badge */}
      <div className="fmp-info" title={titleText}>
        <span className="fmp-text jp-text">{truncatedText}</span>
        {isAudioTrack && (
          <span className="fmp-time-badge">
            {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : '--:--'}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="fmp-controls">
        {/* Restart from beginning */}
        <button
          type="button"
          className="fmp-btn fmp-btn-ghost"
          onClick={handleRestart}
          title="Reiniciar desde el inicio (0:00)"
          aria-label="Volver a empezar"
        >
          <RotateCcw size={14} />
        </button>

        {/* Rewind -5s */}
        <button
          type="button"
          className="fmp-btn fmp-btn-ghost fmp-btn-jump"
          onClick={() => handleSeekRelative(-5)}
          title="Retroceder 5 segundos"
          aria-label="Retroceder 5 segundos"
        >
          <span className="fmp-jump-num">-5s</span>
        </button>

        {/* Play / Pause main button */}
        <button
          type="button"
          className="fmp-btn fmp-btn-play"
          onClick={handlePlayPause}
          title={audioState.state === 'playing' ? 'Pausar' : 'Reproducir'}
          aria-label={audioState.state === 'playing' ? 'Pausar' : 'Reproducir'}
        >
          {audioState.state === 'playing' ? <Pause size={16} /> : <Play size={16} />}
        </button>

        {/* Forward +5s */}
        <button
          type="button"
          className="fmp-btn fmp-btn-ghost fmp-btn-jump"
          onClick={() => handleSeekRelative(5)}
          title="Adelantar 5 segundos"
          aria-label="Adelantar 5 segundos"
        >
          <span className="fmp-jump-num">+5s</span>
        </button>

        {/* Speed rate cyclic button */}
        <button
          type="button"
          className="fmp-btn fmp-btn-speed"
          onClick={handleCycleSpeed}
          title={`Velocidad actual: ${audioState.rate || 1.0}x (Clic para cambiar: 0.75x, 1x, 1.25x)`}
          aria-label="Velocidad de reproducción"
        >
          <span>{audioState.rate || 1.0}x</span>
        </button>
      </div>

      {/* Action buttons: Minimize & Close */}
      <div className="fmp-actions">
        <button
          type="button"
          className="fmp-btn-action"
          onClick={() => setIsMinimized(true)}
          title="Minimizar a micro-burbuja"
          aria-label="Minimizar"
        >
          <Minimize2 size={13} />
        </button>

        <button
          type="button"
          className="fmp-btn-action fmp-btn-close"
          onClick={handleClose}
          title="Cerrar y detener audio"
          aria-label="Cerrar reproductor"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
