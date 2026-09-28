'use client';

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { ExternalLink, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';

const YouTubePlayer = forwardRef(function YouTubePlayer({
  videoId,
  onTimeUpdate,
  onStateChange,
  onReady,
  onError,
  playbackRate = 1.0,
  autoPlay = false
}, ref) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const virtualTimerRef = useRef(null);
  const isReadyRef = useRef(false);
  const [embedError, setEmbedError] = useState(null); // error code (101, 150, 100, etc.)
  const [currentPlayTime, setCurrentPlayTime] = useState(0);
  const [isVirtualPlaying, setIsVirtualPlaying] = useState(false);

  // Control del temporizador virtual si la inserción está bloqueada
  const toggleVirtualPlay = () => {
    if (isVirtualPlaying) {
      if (virtualTimerRef.current) clearInterval(virtualTimerRef.current);
      setIsVirtualPlaying(false);
      if (onStateChange) onStateChange(2); // Paused
    } else {
      setIsVirtualPlaying(true);
      if (onStateChange) onStateChange(1); // Playing
      virtualTimerRef.current = setInterval(() => {
        setCurrentPlayTime((prev) => {
          const next = prev + 0.1 * playbackRate;
          if (onTimeUpdate) onTimeUpdate(next);
          return next;
        });
      }, 100);
    }
  };

  // Exponer métodos para control externo (seekTo, play, pause, etc.)
  useImperativeHandle(ref, () => ({
    seekTo: (seconds, playImmediately = true) => {
      setCurrentPlayTime(seconds);
      if (onTimeUpdate) onTimeUpdate(seconds);

      if (embedError === 101 || embedError === 150) {
        if (playImmediately && !isVirtualPlaying) {
          toggleVirtualPlay();
        }
        return;
      }

      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seconds, true);
        if (playImmediately) {
          playerRef.current.playVideo();
        }
      }
    },
    play: () => {
      if (embedError === 101 || embedError === 150) {
        if (!isVirtualPlaying) toggleVirtualPlay();
        return;
      }
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
    },
    pause: () => {
      if (embedError === 101 || embedError === 150) {
        if (isVirtualPlaying) toggleVirtualPlay();
        return;
      }
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    },
    getCurrentTime: () => {
      if (embedError === 101 || embedError === 150) {
        return currentPlayTime;
      }
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        return playerRef.current.getCurrentTime();
      }
      return currentPlayTime;
    },
    setPlaybackRate: (rate) => {
      if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
        playerRef.current.setPlaybackRate(rate);
      }
    }
  }));

  // Cargar SDK de YouTube IFrame si no está presente
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, []);

  // Inicializar o actualizar reproductor
  useEffect(() => {
    let isMounted = true;
    setEmbedError(null);
    setIsVirtualPlaying(false);
    if (virtualTimerRef.current) clearInterval(virtualTimerRef.current);

    const startTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const time = playerRef.current.getCurrentTime();
          setCurrentPlayTime(time);
          if (onTimeUpdate) onTimeUpdate(time);
        }
      }, 80);
    };

    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const initPlayer = () => {
      if (!isMounted || !containerRef.current || !window.YT || !window.YT.Player) return;

      // Si ya hay un reproductor, cambiar el video
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.loadVideoById === 'function') {
            if (autoPlay) {
              playerRef.current.loadVideoById(videoId);
            } else {
              playerRef.current.cueVideoById(videoId);
            }
            return;
          }
        } catch (e) {
          console.warn('Reinitializing YouTube Player:', e);
        }
      }

      const targetDiv = document.createElement('div');
      targetDiv.id = `yt-player-${videoId}-${Date.now()}`;
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(targetDiv);

      playerRef.current = new window.YT.Player(targetDiv.id, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: autoPlay ? 1 : 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          fs: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : ''
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            isReadyRef.current = true;
            if (playbackRate && playbackRate !== 1.0) {
              event.target.setPlaybackRate(playbackRate);
            }
            if (onReady) onReady(event.target);
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            if (event.data === 1) {
              startTimer();
            } else {
              stopTimer();
            }
            if (onStateChange) onStateChange(event.data);
          },
          onError: (event) => {
            if (!isMounted) return;
            console.warn('YouTube Player Error:', event.data);
            setEmbedError(event.data);
            if (onError) onError(event.data);
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      isMounted = false;
      stopTimer();
      if (virtualTimerRef.current) clearInterval(virtualTimerRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [videoId, autoPlay]);

  // Actualizar tasa de reproducción
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      try {
        playerRef.current.setPlaybackRate(playbackRate);
      } catch (e) {
        // ignore
      }
    }
  }, [playbackRate]);

  return (
    <div className="yt-player-wrapper">
      <div ref={containerRef} className="yt-player-container" />

      {/* Overlay de Modo Sincronizado si YouTube bloquea la inserción directa */}
      {(embedError === 101 || embedError === 150 || embedError === 100) && (
        <div className="yt-embed-error-overlay">
          <div className="yt-error-card">
            <div className="yt-error-icon">
              <AlertTriangle size={30} />
            </div>
            <h4>Modo de Estudio Sincronizado Activo</h4>
            <p>
              El autor ha limitado la reproducción en marcos externos, pero <strong>puedes seguir estudiando este video en la app</strong> gracias al sincronizador de transcripción.
            </p>

            <div className="yt-error-actions">
              <button
                type="button"
                className={`btn-virtual-play ${isVirtualPlaying ? 'active' : ''}`}
                onClick={toggleVirtualPlay}
              >
                {isVirtualPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isVirtualPlaying ? 'Pausar Sincronización' : 'Iniciar Sincronización'}</span>
              </button>

              <a
                href={`https://www.youtube.com/watch?v=${videoId}${currentPlayTime > 0 ? `&t=${Math.floor(currentPlayTime)}s` : ''}`}
                target="_blank"
                rel="noreferrer"
                className="btn-open-youtube"
                title="Abre el video en YouTube en el segundo exacto"
              >
                <span>Abrir en YouTube</span>
                <ExternalLink size={14} />
              </a>
            </div>

            <small className="yt-error-tip">
              💡 La transcripción lateral, las palabras interactivas y el guardado de vocabulario continúan 100% operativos.
            </small>
          </div>
        </div>
      )}
    </div>
  );
});

export default YouTubePlayer;
