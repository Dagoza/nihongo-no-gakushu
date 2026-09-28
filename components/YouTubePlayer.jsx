'use client';

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';

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
  const isReadyRef = useRef(false);
  const [embedError, setEmbedError] = useState(null); // error code (101, 150, 100, etc.)
  const [currentPlayTime, setCurrentPlayTime] = useState(0);

  // Exponer métodos para control externo (seekTo, play, pause, etc.)
  useImperativeHandle(ref, () => ({
    seekTo: (seconds, playImmediately = true) => {
      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seconds, true);
        if (playImmediately) {
          playerRef.current.playVideo();
        }
      }
    },
    play: () => {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
    },
    pause: () => {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    },
    getCurrentTime: () => {
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

    const startTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const time = playerRef.current.getCurrentTime();
          setCurrentPlayTime(time);
          if (onTimeUpdate) onTimeUpdate(time);
        }
      }, 80); // 80ms para fluidez en karaoke
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

      // Crear nuevo reproductor
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
            // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
            if (event.data === 1) {
              startTimer();
            } else {
              stopTimer();
            }
            if (onStateChange) onStateChange(event.data);
          },
          onError: (event) => {
            if (!isMounted) return;
            // Error 101 o 150 = Inserción inhabilitada por el propietario del video
            // Error 100 = Video no encontrado o privado
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

  // Actualizar tasa de reproducción cuando cambie la prop
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

      {/* Overlay amigable si YouTube bloquea la inserción (Error 101 / 150) */}
      {(embedError === 101 || embedError === 150 || embedError === 100) && (
        <div className="yt-embed-error-overlay">
          <div className="yt-error-card">
            <div className="yt-error-icon">
              <AlertTriangle size={32} />
            </div>
            <h4>Video con Inserción Restringida</h4>
            <p>
              El propietario de este video ha desactivado los permisos para reproducirlo dentro de sitios web externos (Restricción de YouTube).
            </p>
            <div className="yt-error-actions">
              <a
                href={`https://www.youtube.com/watch?v=${videoId}${currentPlayTime > 0 ? `&t=${Math.floor(currentPlayTime)}s` : ''}`}
                target="_blank"
                rel="noreferrer"
                className="btn-open-youtube"
              >
                <span>Abrir y ver en YouTube</span>
                <ExternalLink size={14} />
              </a>
            </div>
            <small className="yt-error-tip">
              💡 Puedes usar la transcripción sincronizada lateral para seguir estudiando mientras lo ves en YouTube, o elegir cualquiera de nuestros videos 100% verificados del catálogo.
            </small>
          </div>
        </div>
      )}
    </div>
  );
});

export default YouTubePlayer;
