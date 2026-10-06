'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Volume2, 
  Sparkles, 
  Gauge, 
  Moon, 
  Sun, 
  ShieldCheck, 
  RefreshCw, 
  CloudCheck, 
  CloudOff, 
  Check, 
  Radio,
  Sliders,
  Compass,
  Bell
} from 'lucide-react';

import audioManager from '../lib/audioManager';
import { useApp } from '../lib/AppContext';

export default function SettingsModal({
  isOpen,
  onClose
}) {
  const contextApp = useApp();
  const {
    appState,
    handleUpdateState,
    theme,
    onToggleTheme,
    authUser,
    syncStatus,
    syncInfo,
    handleTriggerSync
  } = contextApp || {};

  const [selectedVoice, setSelectedVoice] = useState(
    appState?.preferredVoice || audioManager.voiceName || 'ja-JP-NanamiNeural'
  );
  const [selectedRate, setSelectedRate] = useState(
    appState?.audioRate || audioManager.rate || 0.9
  );
  const [selectedEngine, setSelectedEngine] = useState(
    audioManager.engine || 'neural'
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedVoice(appState?.preferredVoice || audioManager.voiceName || 'ja-JP-NanamiNeural');
      setSelectedRate(appState?.audioRate || audioManager.rate || 0.9);
      setSelectedEngine(audioManager.engine || 'neural');
    }
  }, [isOpen, appState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleVoiceChange = (voiceName) => {
    setSelectedVoice(voiceName);
    audioManager.setVoice(voiceName);
    if (handleUpdateState && appState) {
      handleUpdateState({
        ...appState,
        preferredVoice: voiceName
      });
    }
  };

  const handleRateChange = (rate) => {
    setSelectedRate(rate);
    audioManager.setRate(rate);
    if (handleUpdateState && appState) {
      handleUpdateState({
        ...appState,
        audioRate: rate
      });
    }
  };

  const handleEngineChange = (engine) => {
    setSelectedEngine(engine);
    audioManager.setEngine(engine);
  };

  const handleTestVoice = (voiceToTest) => {
    const sample = voiceToTest === 'ja-JP-NanamiNeural'
      ? 'はじめまして、七海です。日本語の勉強を一緒に頑張りましょう！'
      : 'こんにちは、恵太です。毎日の積み重ねが上達の近道です。';
    audioManager.speak(sample, { voice: voiceToTest, rate: selectedRate });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content settings-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 520,
          width: '94%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg, 16px)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(59, 130, 246, 0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Settings size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Configuración del Sistema
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Ajustes de voz, síntesis de audio, interfaz y sincronización
              </p>
            </div>
          </div>

          <button 
            type="button" 
            className="btn-modal-close" 
            onClick={onClose}
            title="Cerrar (Esc)"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 6,
              borderRadius: '50%',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Section 1: Default Voice Selection */}
          <div style={{
            padding: '16px',
            borderRadius: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Voz Neuronal Predeterminada (TTS)
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7' }}>
                Edge TTS HD
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Selecciona la voz predeterminada para el reproductor de audio, lecturas de vocabulario y oraciones individuales.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Nanami ♀ */}
              <div 
                onClick={() => handleVoiceChange('ja-JP-NanamiNeural')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: selectedVoice === 'ja-JP-NanamiNeural' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedVoice === 'ja-JP-NanamiNeural' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-main)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    Nanami ♀
                  </span>
                  {selectedVoice === 'ja-JP-NanamiNeural' && (
                    <span style={{ color: 'var(--primary)' }}><Check size={16} strokeWidth={3} /></span>
                  )}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Voz femenina neuronal de Tokio
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestVoice('ja-JP-NanamiNeural');
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: 4, padding: '4px 8px', fontSize: '0.72rem', justifyContent: 'center', gap: 4 }}
                  title="Escuchar muestra de voz de Nanami"
                >
                  <Volume2 size={13} />
                  <span>Probar voz</span>
                </button>
              </div>

              {/* Keita ♂ */}
              <div 
                onClick={() => handleVoiceChange('ja-JP-KeitaNeural')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: selectedVoice === 'ja-JP-KeitaNeural' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedVoice === 'ja-JP-KeitaNeural' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-main)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    Keita ♂
                  </span>
                  {selectedVoice === 'ja-JP-KeitaNeural' && (
                    <span style={{ color: 'var(--primary)' }}><Check size={16} strokeWidth={3} /></span>
                  )}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Voz masculina neuronal de Tokio
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestVoice('ja-JP-KeitaNeural');
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: 4, padding: '4px 8px', fontSize: '0.72rem', justifyContent: 'center', gap: 4 }}
                  title="Escuchar muestra de voz de Keita"
                >
                  <Volume2 size={13} />
                  <span>Probar voz</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Audio Speed */}
          <div style={{
            padding: '16px',
            borderRadius: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Gauge size={18} color="var(--primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                Velocidad de Reproducción Predeterminada
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {[0.75, 0.9, 1.0, 1.25].map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleRateChange(rate)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 8,
                    border: selectedRate === rate ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: selectedRate === rate ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-main)',
                    color: selectedRate === rate ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {rate}x {rate === 0.9 && '(Recom.)'}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: TTS Engine */}
          <div style={{
            padding: '16px',
            borderRadius: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sliders size={18} color="var(--primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                Motor de Síntesis de Voz
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-main)' }}>
                <input 
                  type="radio" 
                  name="ttsEngine" 
                  value="neural" 
                  checked={selectedEngine === 'neural'}
                  onChange={() => handleEngineChange('neural')} 
                />
                <div>
                  <span style={{ fontWeight: 600 }}>Síntesis Neuronal (/api/tts)</span>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Máxima fidelidad con entonación natural de Tokio (recomendado)
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-main)' }}>
                <input 
                  type="radio" 
                  name="ttsEngine" 
                  value="webspeech" 
                  checked={selectedEngine === 'webspeech'}
                  onChange={() => handleEngineChange('webspeech')} 
                />
                <div>
                  <span style={{ fontWeight: 600 }}>Web Speech API del Navegador</span>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Síntesis local offline directa del sistema operativo
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Recordatorios y Notificaciones Diarias */}
          <div style={{
            padding: '16px',
            borderRadius: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bell size={16} style={{ color: 'var(--primary)' }} />
                <span>Recordatorios del Día</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Configura avisos de Kanji, Vocabulario, Partículas, Reto Diario y Lectura
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                onClose();
                if (contextApp?.openNotificationSettings) {
                  contextApp.openNotificationSettings();
                } else if (typeof window !== 'undefined' && window.__nihongoOpenNotifications) {
                  window.__nihongoOpenNotifications();
                }
              }}
              style={{ gap: 6, whiteSpace: 'nowrap' }}
            >
              <Bell size={14} />
              <span>Configurar</span>
            </button>
          </div>

          {/* Section 5: Theme Toggle & Cloud Account */}

          <div style={{
            padding: '16px',
            borderRadius: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                Tema Visual
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Modo actual: {theme === 'dark' ? 'Oscuro 🌙' : 'Claro ☀️'}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onToggleTheme}
              style={{ gap: 6 }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === 'dark' ? 'Cambiar a Claro' : 'Cambiar a Oscuro'}</span>
            </button>
          </div>

          {/* Guía y Onboarding */}
          <div style={{
            padding: '16px',
            borderRadius: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Compass size={16} style={{ color: 'var(--primary)' }} />
                <span>Tour y Guía Interactiva</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Vuelve a repasar el recorrido paso a paso de todas las funciones
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                onClose();
                if (contextApp?.openTour) {
                  contextApp.openTour();
                } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
                  window.__nihongoOpenTour();
                }
              }}
              style={{ gap: 6 }}
            >
              <Compass size={15} />
              <span>Abrir Tour</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Los ajustes se guardan automáticamente
          </span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onClose}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
