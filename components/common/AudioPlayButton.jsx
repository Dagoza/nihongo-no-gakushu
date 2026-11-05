'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause } from 'lucide-react';
import audioManager from '../../lib/audioManager';

/**
 * Componente estándar, accesible y reactivo para reproducción de audio japonés.
 * Soporta automáticamente la cascada de audio:
 * 1. Audio MP3 nativo (si el objeto contiene audio_url o audio_local)
 * 2. Síntesis neuronal de alta fidelidad (/api/tts)
 * 3. Fallback a Web Speech API
 * 
 * Incorpora animación de ecualizador (soundwave) activa durante la reproducción,
 * auto-prevención de propagación de eventos y atajos de accesibilidad.
 * 
 * @param {Object} props
 * @param {string} [props.text] - Texto en japonés a pronunciar
 * @param {string} [props.reading] - Lectura kana para asegurar fonética precisa
 * @param {Object} [props.wordObj] - Objeto completo de vocabulario (soporta audio_url/audio_local)
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='sm'] - Tamaño del botón
 * @param {'pill'|'icon'|'ghost'|'outline'} [props.variant='pill'] - Variante visual
 * @param {string} [props.label] - Texto opcional para la etiqueta (en variante pill)
 * @param {boolean} [props.autoStopPropagation=true] - Evita propagar clic a tarjetas/filas padre
 * @param {string} [props.title] - Tooltip accesible
 * @param {string} [props.className] - Clases CSS adicionales
 * @param {boolean} [props.disabled=false] - Si el botón está deshabilitado
 * @param {Function} [props.onPlayStateChange] - Callback opcional al cambiar de estado (isPlaying)
 */
export default function AudioPlayButton({
  text = '',
  reading = '',
  wordObj = null,
  size = 'sm',
  variant = 'pill',
  label = '',
  autoStopPropagation = true,
  title = 'Escuchar pronunciación',
  className = '',
  disabled = false,
  onPlayStateChange,
  style = {}
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimeoutRef = useRef(null);

  // Determinar el texto objetivo limpio para comparación
  const targetText = wordObj
    ? (wordObj.hiragana || wordObj.kana || wordObj.kanji || wordObj.word || '')
    : (reading || text || '');

  const cleanedTarget = audioManager ? audioManager.cleanText(targetText) : targetText;

  // Suscripción al estado reactivo del AudioManager
  useEffect(() => {
    if (!audioManager || typeof audioManager.subscribe !== 'function') return;

    const unsubscribe = audioManager.subscribe((info) => {
      const isCurrentAudio = info.state === 'playing' && (
        (cleanedTarget && audioManager.cleanText(info.currentText) === cleanedTarget) ||
        (wordObj?.audio_url && info.currentAudioUrl === wordObj.audio_url) ||
        (wordObj?.audio_local && info.currentAudioUrl === wordObj.audio_local)
      );

      setIsPlaying(Boolean(isCurrentAudio));
      onPlayStateChange?.(Boolean(isCurrentAudio));
    });

    return () => {
      unsubscribe();
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    };
  }, [cleanedTarget, wordObj, onPlayStateChange]);

  const handlePlayClick = (e) => {
    if (autoStopPropagation) {
      e?.stopPropagation?.();
    }

    if (disabled) return;

    // Si ya está reproduciendo este mismo audio, permitir pausar o detener
    if (isPlaying) {
      audioManager.stopActivePlayback();
      setIsPlaying(false);
      onPlayStateChange?.(false);
      return;
    }

    // Ejecutar reproducción inteligente
    if (wordObj) {
      audioManager.playWord(wordObj);
    } else if (targetText) {
      audioManager.speak(reading || text);
    }

    // Temporizador de seguridad para restablecer si no se recibe evento de fin (ej. fallo de red o audio truncado)
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    playTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
    }, 6000);
  };

  // Dimensiones según tamaño
  const sizeConfig = {
    xs: { iconSize: 12, height: 26, padding: '0 8px', fontSize: '0.74rem', minWidth: 26 },
    sm: { iconSize: 15, height: 32, padding: '0 12px', fontSize: '0.82rem', minWidth: 32 },
    md: { iconSize: 18, height: 38, padding: '0 16px', fontSize: '0.88rem', minWidth: 38 },
    lg: { iconSize: 22, height: 46, padding: '0 20px', fontSize: '1rem', minWidth: 46 }
  }[size] || { iconSize: 15, height: 32, padding: '0 12px', fontSize: '0.82rem', minWidth: 32 };

  // Estilos según variante
  const isIconOnly = variant === 'icon' || (!label && variant !== 'pill');
  
  const getVariantStyles = () => {
    if (variant === 'ghost') {
      return {
        background: isPlaying ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        border: 'none',
        color: isPlaying ? 'var(--primary)' : 'var(--text-muted)'
      };
    }
    if (variant === 'outline') {
      return {
        background: isPlaying ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
        border: isPlaying ? '1px solid var(--primary)' : '1px solid var(--border)',
        color: isPlaying ? 'var(--primary)' : 'var(--text-main)'
      };
    }
    if (variant === 'icon') {
      return {
        background: isPlaying ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-subtle, rgba(255, 255, 255, 0.06))',
        border: isPlaying ? '1px solid var(--primary)' : '1px solid transparent',
        color: isPlaying ? 'var(--primary)' : 'var(--text-main)',
        borderRadius: '50%',
        padding: 0
      };
    }
    // 'pill' por defecto
    return {
      background: isPlaying ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.12)',
      border: isPlaying ? '1px solid var(--primary)' : '1px solid rgba(99, 102, 241, 0.25)',
      color: 'var(--primary)',
      borderRadius: 999
    };
  };

  return (
    <button
      type="button"
      className={`btn-audio-play ${isPlaying ? 'is-playing' : ''} ${className}`}
      onClick={handlePlayClick}
      disabled={disabled || (!targetText && !wordObj?.audio_url && !wordObj?.audio_local)}
      title={title}
      aria-label={label || title}
      aria-pressed={isPlaying}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        height: sizeConfig.height,
        minWidth: isIconOnly ? sizeConfig.height : sizeConfig.minWidth,
        padding: isIconOnly ? 0 : sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
        fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
        ...getVariantStyles(),
        ...style
      }}
    >
      {/* Icono de audio o animación Soundwave activa */}
      {isPlaying ? (
        <span 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'flex-end', 
            gap: 2, 
            height: sizeConfig.iconSize,
            width: sizeConfig.iconSize,
            justifyContent: 'center'
          }}
          aria-hidden="true"
        >
          <span 
            style={{
              width: 2.5,
              height: '100%',
              background: 'currentColor',
              borderRadius: 2,
              animation: 'audioBarPulse 0.6s infinite ease-in-out',
              animationDelay: '0s'
            }} 
          />
          <span 
            style={{
              width: 2.5,
              height: '75%',
              background: 'currentColor',
              borderRadius: 2,
              animation: 'audioBarPulse 0.6s infinite ease-in-out',
              animationDelay: '0.2s'
            }} 
          />
          <span 
            style={{
              width: 2.5,
              height: '90%',
              background: 'currentColor',
              borderRadius: 2,
              animation: 'audioBarPulse 0.6s infinite ease-in-out',
              animationDelay: '0.4s'
            }} 
          />
        </span>
      ) : (
        <Volume2 size={sizeConfig.iconSize} aria-hidden="true" />
      )}

      {/* Etiqueta textual opcional */}
      {!isIconOnly && (
        <span style={{ lineHeight: 1 }}>
          {label || (isPlaying ? 'Reproduciendo...' : 'Pista de Audio')}
        </span>
      )}
    </button>
  );
}
