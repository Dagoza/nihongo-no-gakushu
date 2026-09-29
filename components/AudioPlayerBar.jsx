'use client';

import React, { useEffect, useState } from 'react';
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
  ChevronUp
} from 'lucide-react';
import audioManager from '../lib/audioManager';
import SaveVocabModal from './SaveVocabModal';

export default function AudioPlayerBar({ appState, onUpdateState, onNavigate }) {
  const [audioState, setAudioState] = useState({
    state: 'idle',
    currentText: '',
    rate: 0.9,
    currentIndex: 0,
    playlistLength: 0,
    selectedText: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [isMinimized, setIsMinimized] = useState(false);

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

  const totalSaved = (appState?.savedCustomVocab?.length || 0) + (appState?.savedPhrases?.length || 0);

  return (
    <>
      <div className={`audio-player-bar ${isMinimized ? 'minimized' : ''}`}>
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

          {/* Controls: Prev, Play/Pause, Next, Stop */}
          <div className="audio-controls" style={isMinimized ? { margin: '0 auto' } : {}}>
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
