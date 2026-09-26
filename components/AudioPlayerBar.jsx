'use client';

import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Square, Sparkles, Volume2, Gauge } from 'lucide-react';
import audioManager from '../lib/audioManager';

export default function AudioPlayerBar() {
  const [audioState, setAudioState] = useState({
    state: 'idle',
    currentText: '',
    rate: 0.9,
    currentIndex: 0,
    playlistLength: 0,
    selectedText: ''
  });

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((newState) => {
      setAudioState(newState);
    });
    return () => unsubscribe();
  }, []);

  const handlePlayPause = () => {
    if (audioState.state === 'playing') {
      audioManager.pause();
    } else if (audioState.state === 'paused') {
      audioManager.resume();
    } else if (audioState.currentText) {
      audioManager.speak(audioState.currentText);
    }
  };

  const handlePlaySelection = () => {
    audioManager.playSelection();
  };

  const handleRateChange = (rate) => {
    audioManager.setRate(rate);
  };

  return (
    <div className="audio-player-bar">
      <div className="audio-player-container">
        {/* Currently Playing / Audio Info */}
        <div className="audio-info">
          <div className="audio-icon-pulse">
            <Volume2 size={20} className={audioState.state === 'playing' ? 'text-primary animate-pulse' : 'text-muted'} />
          </div>
          <div className="audio-text-wrapper">
            <div className="audio-status-label">
              {audioState.state === 'playing' && '🔊 Reproduciendo audio en japonés:'}
              {audioState.state === 'paused' && '⏸️ En pausa:'}
              {audioState.state === 'idle' && (audioState.currentText ? 'Listo para reproducir:' : 'Haz clic en cualquier palabra u oración para escucharla')}
            </div>
            <div className="audio-current-sentence jp-text">
              {audioState.currentText || 'Selecciona texto o toca cualquier palabra con furigana'}
            </div>
          </div>
        </div>

        {/* Controls: Prev, Play/Pause, Next, Stop */}
        <div className="audio-controls">
          <button 
            className="audio-ctrl-btn" 
            title="Retroceder oración / palabra anterior"
            onClick={() => audioManager.prev()}
            disabled={audioState.playlistLength === 0 || audioState.currentIndex <= 0}
          >
            <SkipBack size={18} />
          </button>

          <button 
            className="audio-ctrl-btn audio-main-btn" 
            title={audioState.state === 'playing' ? 'Pausar' : 'Reproducir'}
            onClick={handlePlayPause}
            disabled={!audioState.currentText && !audioState.selectedText}
          >
            {audioState.state === 'playing' ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button 
            className="audio-ctrl-btn" 
            title="Avanzar a la siguiente oración / palabra"
            onClick={() => audioManager.next()}
            disabled={audioState.playlistLength === 0 || audioState.currentIndex >= audioState.playlistLength - 1}
          >
            <SkipForward size={18} />
          </button>

          <button 
            className="audio-ctrl-btn" 
            title="Detener audio"
            onClick={() => audioManager.stop()}
            disabled={audioState.state === 'idle'}
          >
            <Square size={16} />
          </button>
        </div>

        {/* Actions: Play Selection & Speed Rate */}
        <div className="audio-actions">
          {audioState.selectedText && (
            <button 
              className="btn btn-accent btn-sm audio-selection-btn"
              onClick={handlePlaySelection}
              title={`Reproducir: "${audioState.selectedText}"`}
            >
              <Sparkles size={14} />
              <span>Reproducir Selección ({audioState.selectedText.slice(0, 10)}...)</span>
            </button>
          )}

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
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
