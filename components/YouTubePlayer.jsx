'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const YouTubePlayer = forwardRef(function YouTubePlayer({
  videoId,
  onTimeUpdate,
  onStateChange,
  onReady,
  playbackRate = 1.0,
  autoPlay = false
}, ref) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const isReadyRef = useRef(false);

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
      return 0;
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

    const startTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const time = playerRef.current.getCurrentTime();
          if (onTimeUpdate) onTimeUpdate(time);
        }
      }, 80); // 80ms para suavidad en karaoke
    };

    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const initPlayer = () => {
      if (!isMounted || !containerRef.current || !window.YT || !window.YT.Player) return;

      // Si ya hay un reproductor, cambiar solo el video
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
      targetDiv.id = `yt-player-${videoId}`;
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
    </div>
  );
});

export default YouTubePlayer;
