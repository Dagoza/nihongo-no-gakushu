'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Square, 
  Sparkles, 
  Volume2, 
  Gauge, 
  BookmarkPlus, 
  BookmarkCheck,
  Bookmark,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import audioManager from '../lib/audioManager';
import SaveVocabModal from './SaveVocabModal';

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

export default function AudioPlayerBar({ appState, onUpdateState, onNavigate }) {
  const [audioState, setAudioState] = useState({
    state: 'idle',
    currentText: '',
    currentAudioUrl: null,
    currentTime: 0,
    duration: 0,
    rate: 0.9,
    currentIndex: 0,
    playlistLength: 0,
    selectedText: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [isMinimized, setIsMinimized] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [hoverInfo, setHoverInfo] = useState({ visible: false, percent: 0, time: 0 });
  const scrubberRef = useRef(null);

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((newState) => {
      setAudioState(newState);
    });
    return () => unsubscribe();
  }, []);

  const duration = audioState.duration || 0;
  const isAudioTrack = Boolean(audioState.currentAudioUrl || duration > 0);
  const effectiveTime = isDragging ? dragTime : (audioState.currentTime || 0);
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (effectiveTime / duration) * 100)) : 0;

  const handlePlayPause = () => {
    if (audioState.state === 'playing') {
      audioManager.pause();
    } else if (audioState.state === 'paused') {
      audioManager.resume();
    } else if (audioState.currentAudioUrl) {
      audioManager.resume();
    } else if (audioState.selectedText) {
      audioManager.playSelection();
    } else if (audioState.currentText) {
      audioManager.speak(audioState.currentText);
    }
  };

  const handlePlaySelection = () => {
    audioManager.playSelection();
  };

  const handleSaveSelection = () => {
    if (!audioState.selectedText) return;
    const text = audioState.selectedText.trim();
    const isPhrase = text.length > 15 || /[。！？\n]/.test(text);
    setModalData({
      type: isPhrase ? 'phrase' : 'word',
      text: text,
      sentenceText: text,
      source: 'Reproductor de Audio (Selección)'
    });
    setIsModalOpen(true);
  };

  const handleSaveCurrent = () => {
    if (!audioState.currentText) return;
    const text = audioState.currentText.trim();
    const isPhrase = text.length > 15 || /[。！？\n]/.test(text);
    setModalData({
      type: isPhrase ? 'phrase' : 'word',
      text: text,
      sentenceText: text,
      source: 'Reproductor de Audio'
    });
    setIsModalOpen(true);
  };

  const handleRateChange = (rate) => {
    audioManager.setRate(rate);
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const val = parseFloat(e.target.value);
    setDragTime(val);
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      const val = parseFloat(e.target.value);
      setDragTime(val);
    }
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      const val = parseFloat(e.target.value);
      audioManager.seek(val);
      setDragTime(val);
      setIsDragging(false);
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handleRangeChange = (e) => {
    const val = parseFloat(e.target.value);
    setDragTime(val);
    if (!isDragging) {
      audioManager.seek(val);
    }
  };

  const handleScrubberMouseMove = (e) => {
    if (!duration || duration <= 0) return;
    if (!scrubberRef.current) return;

    const rect = scrubberRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clampedX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = rect.width > 0 ? clampedX / rect.width : 0;
    const time = percent * duration;

    setHoverInfo({
      visible: true,
      percent,
      time
    });
  };

  const handleScrubberMouseLeave = () => {
    setHoverInfo(prev => ({ ...prev, visible: false }));
  };

  const handleTopRailClick = (e) => {
    if (!duration || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioManager.seek(pct * duration);
  };

  const totalSaved = (appState?.savedCustomVocab?.length || 0) + (appState?.savedPhrases?.length || 0);

  return (
    <>
      <div className={`audio-player-bar ${isMinimized ? 'minimized' : ''}`}>
        {/* Clickable progress rail on the top border */}
        {isAudioTrack && (
          <div 
            className="audio-top-rail" 
            title={`Progreso: ${formatTime(effectiveTime)} / ${duration > 0 ? formatTime(duration) : '--:--'} (Clic para saltar)`}
            onClick={handleTopRailClick}
          >
            <div 
              className="audio-top-rail-fill" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        )}

        <button 
          className="audio-minimize-btn" 
          onClick={() => setIsMinimized(!isMinimized)}
          title={isMinimized ? 'Expandir reproductor' : 'Minimizar reproductor'}
        >
          {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="audio-player-container">
          {/* Currently Playing / Audio Info */}
          {!isMinimized && (
            <div className="audio-info">
              <div className="audio-icon-pulse">
                <Volume2 size={20} className={audioState.state === 'playing' ? 'text-primary animate-pulse' : 'text-muted'} />
              </div>
              <div className="audio-text-wrapper">
                <div className="audio-status-label" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span>
                    {audioState.state === 'playing' && '🔊 Reproduciendo:'}
                    {audioState.state === 'paused' && '⏸️ En pausa:'}
                    {audioState.state === 'idle' && (audioState.selectedText ? 'Selección lista:' : (audioState.currentText ? 'Listo para reproducir:' : 'Haz clic en cualquier palabra para escuchar'))}
                  </span>
                  {audioState.currentAudioUrl ? (
                    <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', fontWeight: 700 }}>
                      MP3 Humano Nativo
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}>
                      TTS Neuronal ({audioState.voiceName?.includes('Nanami') ? 'Nanami ♀' : 'Keita ♂'})
                    </span>
                  )}
                  {isAudioTrack && (
                    <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', fontWeight: 700, fontFamily: 'monospace' }}>
                      {formatTime(effectiveTime)} / {duration > 0 ? formatTime(duration) : '--:--'}
                    </span>
                  )}
                </div>
                <div className="audio-current-sentence jp-text" title={audioState.selectedText || audioState.currentText || ''}>
                  {audioState.selectedText ? `"${audioState.selectedText}"` : (audioState.currentText || 'Selecciona texto en pantalla o toca cualquier palabra con furigana')}
                </div>
              </div>

              {/* Quick save button for active sentence if present */}
              {(audioState.selectedText || audioState.currentText) && (
                <button
                  className="audio-save-inline-btn"
                  title="Guardar esta frase u oración en tu cuaderno para crear historias"
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onClick={audioState.selectedText ? handleSaveSelection : handleSaveCurrent}
                  type="button"
                >
                  <BookmarkPlus size={14} />
                  <span className="hidden-xs">Guardar</span>
                </button>
              )}
            </div>
          )}

          {/* Center Section: Controls & Timeline */}
          <div className="audio-center-section" style={isMinimized ? { margin: '0 auto' } : {}}>
            <div className="audio-controls">
              <button 
                className="audio-ctrl-btn" 
                title="Retroceder oración / palabra anterior"
                onClick={() => audioManager.prev()}
                disabled={audioState.playlistLength === 0 || audioState.currentIndex <= 0}
                type="button"
              >
                <SkipBack size={18} />
              </button>

              {isAudioTrack && (
                <button 
                  className="audio-ctrl-btn audio-seek-jump-btn" 
                  title="Retroceder 10 segundos (clic para volver a escuchar)"
                  onClick={() => audioManager.seekRelative(-10)}
                  disabled={audioState.state === 'idle' && !audioState.currentTime}
                  type="button"
                >
                  <RotateCcw size={15} />
                  <span className="seek-jump-text">10s</span>
                </button>
              )}

              <button 
                className="audio-ctrl-btn audio-main-btn" 
                title={audioState.state === 'playing' ? 'Pausar' : 'Reproducir'}
                onClick={handlePlayPause}
                disabled={!audioState.currentText && !audioState.selectedText && !audioState.currentAudioUrl}
                type="button"
              >
                {audioState.state === 'playing' ? <Pause size={20} /> : <Play size={20} />}
              </button>

              {isAudioTrack && (
                <button 
                  className="audio-ctrl-btn audio-seek-jump-btn" 
                  title="Avanzar 10 segundos (clic para adelantar)"
                  onClick={() => audioManager.seekRelative(10)}
                  disabled={duration > 0 && effectiveTime >= duration}
                  type="button"
                >
                  <RotateCw size={15} />
                  <span className="seek-jump-text">10s</span>
                </button>
              )}

              <button 
                className="audio-ctrl-btn" 
                title="Avanzar a la siguiente oración / palabra"
                onClick={() => audioManager.next()}
                disabled={audioState.playlistLength === 0 || audioState.currentIndex >= audioState.playlistLength - 1}
                type="button"
              >
                <SkipForward size={18} />
              </button>

              <button 
                className="audio-ctrl-btn" 
                title="Detener audio"
                onClick={() => audioManager.stop()}
                disabled={audioState.state === 'idle' && !audioState.currentTime && !audioState.currentAudioUrl}
                type="button"
              >
                <Square size={16} />
              </button>
            </div>

            {/* MP3 Timeline Scrubber (only shown when MP3 / audio track is loaded and not minimized) */}
            {isAudioTrack && !isMinimized && (
              <div className="audio-timeline-row">
                <span className="audio-time-label" title="Tiempo actual transcurrido">
                  {formatTime(effectiveTime)}
                </span>
                <div 
                  className="audio-scrubber-wrapper"
                  ref={scrubberRef}
                  onMouseMove={handleScrubberMouseMove}
                  onMouseLeave={handleScrubberMouseLeave}
                >
                  {hoverInfo.visible && (
                    <div 
                      className="audio-scrubber-tooltip"
                      style={{ left: `${hoverInfo.percent * 100}%` }}
                    >
                      {formatTime(hoverInfo.time)}
                    </div>
                  )}
                  <div className="audio-scrubber-track">
                    <div 
                      className="audio-scrubber-fill" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                  <input
                    type="range"
                    className="audio-scrubber"
                    min="0"
                    max={duration > 0 ? duration : 100}
                    step="0.1"
                    value={duration > 0 ? effectiveTime : 0}
                    disabled={!duration || duration <= 0}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onChange={handleRangeChange}
                    aria-label="Línea de tiempo del audio MP3"
                    aria-valuemin="0"
                    aria-valuemax={duration || 0}
                    aria-valuenow={effectiveTime}
                    aria-valuetext={`${formatTime(effectiveTime)} de ${formatTime(duration)}`}
                  />
                </div>
                <span className="audio-time-label" title="Duración total del MP3">
                  {duration > 0 ? formatTime(duration) : '--:--'}
                </span>
              </div>
            )}
          </div>

          {/* Actions: Play Selection, Save Selection, Saved Link & Speed */}
          {!isMinimized && (
            <div className="audio-actions">
              {/* Quick Link to Saved Words Tab */}
              <button
                className="audio-saved-tab-link"
                onClick={() => onNavigate && onNavigate('saved')}
                title="Ver palabras y frases guardadas para exportar y crear historias"
                type="button"
              >
                <BookmarkCheck size={14} />
                <span>Guardadas ({totalSaved})</span>
              </button>

              {/* Voice selector (Nanami / Keita) */}
              <div className="speed-selector">
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Sparkles size={13} color="var(--primary)" /> Voz:
                </span>
                <button
                  className={`speed-pill ${audioState.voiceName === 'ja-JP-NanamiNeural' ? 'active' : ''}`}
                  onClick={() => audioManager.setVoice('ja-JP-NanamiNeural')}
                  title="Voz femenina neuronal de Tokio (Nanami)"
                  type="button"
                >
                  Nanami ♀
                </button>
                <button
                  className={`speed-pill ${audioState.voiceName === 'ja-JP-KeitaNeural' ? 'active' : ''}`}
                  onClick={() => audioManager.setVoice('ja-JP-KeitaNeural')}
                  title="Voz masculina neuronal de Tokio (Keita)"
                  type="button"
                >
                  Keita ♂
                </button>
              </div>

              {/* Speed rates */}
              <div className="speed-selector">
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Gauge size={13} /> Velocidad:
                </span>
                {[0.75, 0.9, 1.0, 1.25].map(speed => (
                  <button
                    key={speed}
                    className={`speed-pill ${audioState.rate === speed ? 'active' : ''}`}
                    onClick={() => handleRateChange(speed)}
                    type="button"
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Vocab / Phrase Modal */}
      <SaveVocabModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={modalData}
        appState={appState}
        onUpdateState={onUpdateState}
      />
    </>
  );
}
