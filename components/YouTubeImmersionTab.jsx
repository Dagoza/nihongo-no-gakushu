'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Tv, 
  Search, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Bookmark, 
  Layers, 
  Languages, 
  Sparkles, 
  Filter, 
  ExternalLink, 
  ChevronRight, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  UserCheck, 
  LogIn, 
  LogOut, 
  Download, 
  ListFilter,
  CheckCircle2,
  Clock,
  BookOpen,
  PlusCircle,
  HelpCircle,
  Link as LinkIcon
} from 'lucide-react';

import YouTubePlayer from './YouTubePlayer';
import SaveVocabModal from './SaveVocabModal';
import audioManager from '../lib/audioManager';
import { dataStore } from '../lib/data';
import { tokenizeJapanese, formatTimestamp, containsKanji } from '../lib/japaneseUtils';

export default function YouTubeImmersionTab({ appState, onUpdateState }) {
  // Navigation internal views: 'catalog' | 'player' | 'saved' | 'channels'
  const [activeView, setActiveView] = useState('catalog');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'anime' | 'daily_life' | 'food_travel' | 'stories'
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all' | 'N5' | 'N4' | 'N3'
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVerified, setOnlyVerified] = useState(true); // Filtrar solo videos con inserción 100% verificada
  
  // Custom video input
  const [customUrl, setCustomUrl] = useState('');
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState('');

  // Selected Video & Player State
  const catalogData = dataStore.youtubeCatalog || { channels: [], videos: [] };
  const [currentVideo, setCurrentVideo] = useState(catalogData.videos?.[0] || null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerState, setPlayerState] = useState(2); // 1 = playing, 2 = paused
  const [playerError, setPlayerError] = useState(null); // Códigos de error de YouTube (101, 150)
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [autoPauseAfterCue, setAutoPauseAfterCue] = useState(false);
  const [showSpanishTranslation, setShowSpanishTranslation] = useState(true);
  const [transcriptSearch, setTranscriptSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});

  // Refs
  const playerRef = useRef(null);
  const transcriptContainerRef = useRef(null);
  const activeCueRef = useRef(null);
  const lastActiveCueIndexRef = useRef(-1);

  // Google Account state in appState
  const googleAccount = appState.googleAccount;

  // Toggle Google Account simulation
  const handleToggleGoogleAuth = () => {
    if (googleAccount) {
      onUpdateState({
        ...appState,
        googleAccount: null
      });
    } else {
      const simulatedGoogleUser = {
        name: 'Daniel Gómez',
        email: 'daniel.gomez@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        connectedAt: new Date().toISOString(),
        preferredTopics: ['anime', 'daily_life'],
        preferredLevel: 'N5'
      };
      onUpdateState({
        ...appState,
        googleAccount: simulatedGoogleUser
      });
    }
  };

  // Filtrado de videos del catálogo
  const filteredVideos = useMemo(() => {
    return (catalogData.videos || []).filter((v) => {
      const matchCategory = selectedCategory === 'all' || v.category === selectedCategory;
      const matchLevel = selectedLevel === 'all' || v.level === selectedLevel;
      const matchVerified = !onlyVerified || v.embeddableVerified === true;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        (v.originalTitle && v.originalTitle.toLowerCase().includes(q)) ||
        v.channelTitle.toLowerCase().includes(q) ||
        (v.tags && v.tags.some((t) => t.toLowerCase().includes(q)));

      return matchCategory && matchLevel && matchVerified && matchSearch;
    });
  }, [catalogData.videos, selectedCategory, selectedLevel, onlyVerified, searchQuery]);

  // Subtítulos del video actual
  const subtitles = currentVideo?.subtitles || [];

  // Calcular índice del subtítulo activo
  const activeCueIndex = useMemo(() => {
    if (!subtitles.length) return -1;
    return subtitles.findIndex(
      (cue) => currentTime >= cue.start && currentTime < cue.start + (cue.duration || 3)
    );
  }, [subtitles, currentTime]);

  const activeCue = activeCueIndex !== -1 ? subtitles[activeCueIndex] : null;

  // Manejo de Auto-Pausa (Modo Shadowing)
  useEffect(() => {
    if (!autoPauseAfterCue || activeCueIndex === -1) return;

    // Si cambió de subtítulo y el anterior terminó, pausar
    if (
      lastActiveCueIndexRef.current !== -1 &&
      lastActiveCueIndexRef.current !== activeCueIndex &&
      playerState === 1
    ) {
      if (playerRef.current) {
        playerRef.current.pause();
      }
    }
    lastActiveCueIndexRef.current = activeCueIndex;
  }, [activeCueIndex, autoPauseAfterCue, playerState]);

  // Auto-scroll del panel de transcripción al cue activo
  useEffect(() => {
    if (activeCueRef.current && transcriptContainerRef.current) {
      activeCueRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeCueIndex]);

  // Manejar selección de video
  const handleSelectVideo = (video) => {
    setCurrentVideo(video);
    setCurrentTime(0);
    setPlayerError(null);
    setActiveView('player');
    if (playerRef.current) {
      playerRef.current.seekTo(0, true);
    }
  };

  // Cargar video personalizado por URL
  const handleLoadCustomUrl = async (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setCustomLoading(true);
    setCustomError('');

    try {
      const res = await fetch('/api/youtube/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: customUrl.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al obtener la transcripción.');
      }

      const customVideo = {
        id: `custom_${data.videoId}`,
        youtubeId: data.videoId,
        title: data.title,
        originalTitle: data.title,
        channelTitle: data.author,
        category: 'custom',
        level: 'N5',
        duration: '--:--',
        thumbnail: `https://img.youtube.com/vi/${data.videoId}/hqdefault.jpg`,
        description: 'Video importado directamente desde YouTube.',
        tags: ['Personalizado', 'YouTube'],
        subtitles: data.cues || []
      };

      setCurrentVideo(customVideo);
      setActiveView('player');
      setCustomUrl('');
    } catch (err) {
      setCustomError(err.message);
    } finally {
      setCustomLoading(false);
    }
  };

  // Acciones del reproductor
  const handleSeekCue = (cue) => {
    if (playerRef.current && cue) {
      playerRef.current.seekTo(cue.start, true);
    }
  };

  const handleReplayActiveCue = () => {
    if (activeCue && playerRef.current) {
      playerRef.current.seekTo(activeCue.start, true);
    } else if (playerRef.current) {
      playerRef.current.seekTo(Math.max(0, currentTime - 4), true);
    }
  };

  const handleNextCue = () => {
    if (subtitles.length === 0) return;
    const nextIdx = activeCueIndex + 1 < subtitles.length ? activeCueIndex + 1 : 0;
    handleSeekCue(subtitles[nextIdx]);
  };

  const handlePrevCue = () => {
    if (subtitles.length === 0) return;
    const prevIdx = activeCueIndex - 1 >= 0 ? activeCueIndex - 1 : 0;
    handleSeekCue(subtitles[prevIdx]);
  };

  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    if (playerState === 1) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  // Abrir modal de guardado para una palabra específica
  const handleOpenSaveWord = (wordToken, cue) => {
    // Buscar si ya existe en el diccionario para autocompletar lectura y traducción
    const knownVocab = (dataStore.vocabulary || []).find(
      (v) => v.kanji === wordToken || v.kana === wordToken
    );

    const knownKanji = (dataStore.kanji || []).find((k) => k.kanji === wordToken);

    setModalData({
      type: 'word',
      text: wordToken,
      reading: knownVocab?.kana || knownKanji?.pronunciation || '',
      translation: knownVocab?.meaning_es || knownKanji?.meaning_es || '',
      level: knownVocab?.level || knownKanji?.level || currentVideo?.level || 'N5',
      category: knownVocab?.category || 'Anime y Cultura',
      sentenceText: cue?.text || '',
      sentenceTranslation: cue?.translation_es || '',
      videoTitle: currentVideo?.title || '',
      videoId: currentVideo?.youtubeId || '',
      timestamp: cue?.start || currentTime
    });
    setModalOpen(true);
  };

  // Abrir modal de guardado para la frase entera
  const handleOpenSavePhrase = (cue) => {
    if (!cue) return;
    setModalData({
      type: 'phrase',
      text: cue.text,
      sentenceText: cue.text,
      sentenceTranslation: cue.translation_es,
      translation: cue.translation_es,
      videoTitle: currentVideo?.title || '',
      videoId: currentVideo?.youtubeId || '',
      timestamp: cue.start
    });
    setModalOpen(true);
  };

  // Renderizar palabras interactivas dentro de una oración
  const renderInteractiveSentence = (sentenceText, cue) => {
    const tokens = tokenizeJapanese(sentenceText);
    return (
      <span className="interactive-sentence-tokens">
        {tokens.map((token, idx) => {
          if (!token.isWordLike) {
            return (
              <span key={idx} className="punctuation-token">
                {token.text}
              </span>
            );
          }

          const hasKanji = containsKanji(token.text);
          return (
            <button
              key={idx}
              type="button"
              className={`word-token-btn ${hasKanji ? 'has-kanji' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenSaveWord(token.text, cue);
              }}
              title={`Clic para analizar y guardar: ${token.text}`}
            >
              {token.text}
            </button>
          );
        })}
      </span>
    );
  };

  return (
    <div className="tab-pane-container youtube-immersion-page">
      {/* Top Banner & Google Integration */}
      <div className="immersion-header-bar">
        <div className="immersion-title-group">
          <div className="icon-badge">
            <Tv size={24} />
          </div>
          <div>
            <h2 className="immersion-heading">Inmersión YouTube con Subtítulos Interactivos</h2>
            <p className="immersion-subheading">
              Aprende japonés auténtico con videos reales filtrados por tópicos (Anime, Vlogs, etc.) y niveles JLPT, con transcripción sincronizada y guardado a tu cuaderno.
            </p>
          </div>
        </div>

        {/* Google Account Bar */}
        <div className="google-auth-card">
          {googleAccount ? (
            <div className="google-profile-connected">
              <img
                src={googleAccount.avatar}
                alt={googleAccount.name}
                className="google-avatar"
              />
              <div className="google-info">
                <div className="google-name-row">
                  <span className="google-name">{googleAccount.name}</span>
                  <span className="google-badge">
                    <UserCheck size={12} /> Google Conectado
                  </span>
                </div>
                <span className="google-email">{googleAccount.email}</span>
              </div>
              <button
                className="btn-google-disconnect"
                onClick={handleToggleGoogleAuth}
                title="Desconectar cuenta"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="btn-google-connect" onClick={handleToggleGoogleAuth}>
              <LogIn size={16} />
              <span>Conectar con Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Navegación interna entre Catálogo, Reproductor, Cuaderno y Canales */}
      <div className="immersion-nav-strip">
        <div className="immersion-nav-tabs">
          <button
            className={`immersion-tab-btn ${activeView === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveView('catalog')}
          >
            <BookOpen size={16} />
            <span>Catálogo Curado ({catalogData.videos?.length || 0})</span>
          </button>
          <button
            className={`immersion-tab-btn ${activeView === 'player' ? 'active' : ''}`}
            onClick={() => setActiveView('player')}
          >
            <Play size={16} />
            <span>Reproductor & Subtítulos</span>
          </button>
          <button
            className={`immersion-tab-btn ${activeView === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveView('saved')}
          >
            <Bookmark size={16} />
            <span>
              Mi Cuaderno de YouTube (
              {(appState.savedCustomVocab?.length || 0) + (appState.savedPhrases?.length || 0)}
              )
            </span>
          </button>
          <button
            className={`immersion-tab-btn ${activeView === 'channels' ? 'active' : ''}`}
            onClick={() => setActiveView('channels')}
          >
            <Tv size={16} />
            <span>Canales Recomendados ({catalogData.channels?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VISTA 1: CATÁLOGO DE VIDEOS Y FILTRADO POR TÓPICO / JLPT */}
      {/* ============================================================== */}
      {activeView === 'catalog' && (
        <div className="catalog-view-section">
          {/* Barra de Filtros y Búsqueda */}
          <div className="catalog-filter-controls">
            {/* Tópicos */}
            <div className="filter-pill-group">
              <span className="filter-label">Tópico:</span>
              <button
                className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Todos
              </button>
              <button
                className={`filter-pill ${selectedCategory === 'anime' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('anime')}
              >
                🎌 Anime & Cultura
              </button>
              <button
                className={`filter-pill ${selectedCategory === 'daily_life' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('daily_life')}
              >
                ☕ Vida Diaria
              </button>
              <button
                className={`filter-pill ${selectedCategory === 'stories' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('stories')}
              >
                📖 Cuentos & Historias
              </button>
              <button
                className={`filter-pill ${selectedCategory === 'food_travel' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('food_travel')}
              >
                🍱 Comida & Viajes
              </button>
            </div>

            {/* Nivel JLPT */}
            <div className="filter-level-group">
              <span className="filter-label">Nivel JLPT:</span>
              <select
                className="filter-select-level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="all">Todos los niveles</option>
                <option value="N5">Nivel N5 (Principiante)</option>
                <option value="N4">Nivel N4 (Básico-Intermedio)</option>
                <option value="N3">Nivel N3 (Intermedio)</option>
              </select>
            </div>

            {/* Toggle de Videos Verificados / Reproducibles */}
            <button
              type="button"
              className={`filter-pill-verified ${onlyVerified ? 'active' : ''}`}
              onClick={() => setOnlyVerified(!onlyVerified)}
              title="Filtrar videos con inserción permitida"
            >
              <CheckCircle2 size={14} />
              <span>Solo Reproducibles en App</span>
            </button>

            {/* Buscador */}
            <div className="catalog-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por título, canal o palabra clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Formulario para Pegar URL de YouTube Externa */}
          <div className="custom-url-banner">
            <div className="custom-url-label">
              <LinkIcon size={16} />
              <span>¿Tienes otro video de YouTube en mente?</span>
            </div>
            <form onSubmit={handleLoadCustomUrl} className="custom-url-form">
              <input
                type="text"
                placeholder="Pega cualquier enlace de YouTube (ej. https://www.youtube.com/watch?v=...)"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                disabled={customLoading}
              />
              <button type="submit" disabled={customLoading || !customUrl.trim()}>
                {customLoading ? 'Cargando subtítulos...' : 'Cargar Video'}
              </button>
            </form>
            {customError && <p className="custom-url-error">{customError}</p>}
          </div>

          {/* Grid de Videos */}
          <div className="video-cards-grid">
            {filteredVideos.map((video) => {
              const isCurrent = currentVideo?.id === video.id;
              return (
                <div
                  key={video.id}
                  className={`video-card ${isCurrent ? 'is-active-video' : ''}`}
                  onClick={() => handleSelectVideo(video)}
                >
                  <div className="video-thumbnail-container">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="video-thumbnail-img"
                      loading="lazy"
                    />
                    <span className="video-duration-badge">{video.duration}</span>
                    <span className={`video-level-badge level-${video.level.toLowerCase()}`}>
                      {video.level}
                    </span>
                    {video.embeddableVerified && (
                      <span className="video-verified-badge" title="Inserción 100% verificada">
                        <CheckCircle2 size={11} />
                        <span>Reproducible</span>
                      </span>
                    )}
                    <div className="video-play-overlay">
                      <Play size={28} className="play-icon-pulse" />
                    </div>
                  </div>

                  <div className="video-card-content">
                    <span className="video-channel-name">{video.channelTitle}</span>
                    <h4 className="video-card-title">{video.title}</h4>
                    <p className="video-card-desc">{video.description}</p>

                    <div className="video-card-footer">
                      <div className="video-tags-list">
                        {(video.tags || []).slice(0, 3).map((tag, i) => (
                          <span key={i} className="mini-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="cues-count-badge">
                        {video.subtitles?.length || 0} frases sincronizadas
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: REPRODUCTOR CON TRANSCRIPCIÓN Y SUBTÍTULOS DUALES */}
      {/* ============================================================== */}
      {activeView === 'player' && currentVideo && (
        <div className="player-view-section">
          {/* Header del Video Activo */}
          <div className="player-top-action-bar">
            <button className="btn-back-catalog" onClick={() => setActiveView('catalog')}>
              <ArrowLeft size={16} />
              <span>Volver al Catálogo</span>
            </button>
            <div className="active-video-meta">
              <span className={`level-pill level-${currentVideo.level.toLowerCase()}`}>
                {currentVideo.level}
              </span>
              <h3 className="active-video-title">{currentVideo.title}</h3>
              <span className="active-video-channel">por {currentVideo.channelTitle}</span>
            </div>
          </div>

          <div className="player-dual-layout">
            {/* Columna Izquierda: Video Player + Subtítulo Karaoke + Controles */}
            <div className="player-main-column">
              <div className="video-player-frame">
                <YouTubePlayer
                  ref={playerRef}
                  videoId={currentVideo.youtubeId}
                  playbackRate={playbackRate}
                  onTimeUpdate={(time) => setCurrentTime(time)}
                  onStateChange={(state) => setPlayerState(state)}
                  onError={(code) => setPlayerError(code)}
                />
              </div>

              {/* Subtítulo Dinámico Karaoke debajo del video */}
              <div className="karaoke-subtitle-box">
                {activeCue ? (
                  <div className="active-cue-display">
                    <div className="active-cue-japanese jp-text">
                      {renderInteractiveSentence(activeCue.text, activeCue)}
                    </div>

                    {showSpanishTranslation && activeCue.translation_es && (
                      <div className="active-cue-spanish">
                        {activeCue.translation_es}
                      </div>
                    )}

                    <div className="active-cue-actions">
                      <button
                        className="cue-action-btn"
                        onClick={() => audioManager.speak(activeCue.text)}
                        title="Escuchar audio nativo (TTS)"
                      >
                        <Volume2 size={15} />
                        <span>Escuchar</span>
                      </button>

                      <button
                        className="cue-action-btn"
                        onClick={() => handleOpenSavePhrase(activeCue)}
                        title="Guardar esta frase en mi cuaderno"
                      >
                        <Bookmark size={15} />
                        <span>Guardar Frase</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-active-cue">
                    <Clock size={16} />
                    <span>Reproduce el video para ver los subtítulos sincronizados...</span>
                  </div>
                )}
              </div>

              {/* Barra de Controles de Inmersión */}
              <div className="immersion-controls-panel">
                <div className="playback-buttons">
                  <button
                    className="control-btn"
                    onClick={handlePrevCue}
                    title="Frase anterior"
                  >
                    <SkipBack size={18} />
                  </button>

                  <button
                    className="control-btn control-btn-play"
                    onClick={handleTogglePlay}
                    title={playerState === 1 ? 'Pausar' : 'Reproducir'}
                  >
                    {playerState === 1 ? <Pause size={20} /> : <Play size={20} />}
                  </button>

                  <button
                    className="control-btn"
                    onClick={handleReplayActiveCue}
                    title="Repetir frase actual"
                  >
                    <RotateCcw size={18} />
                  </button>

                  <button
                    className="control-btn"
                    onClick={handleNextCue}
                    title="Frase siguiente"
                  >
                    <SkipForward size={18} />
                  </button>
                </div>

                <div className="immersion-toggle-group">
                  {/* Selector de Velocidad */}
                  <div className="speed-selector">
                    <span className="speed-label">Velocidad:</span>
                    {[0.75, 1.0, 1.25].map((rate) => (
                      <button
                        key={rate}
                        className={`speed-btn ${playbackRate === rate ? 'active' : ''}`}
                        onClick={() => setPlaybackRate(rate)}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  {/* Modo Shadowing (Auto-pausa) */}
                  <button
                    className={`toggle-feature-btn ${autoPauseAfterCue ? 'active' : ''}`}
                    onClick={() => setAutoPauseAfterCue(!autoPauseAfterCue)}
                    title="Pausa automáticamente al finalizar cada frase para repetir en voz alta"
                  >
                    <CheckCircle2 size={16} />
                    <span>Modo Shadowing {autoPauseAfterCue ? '(Activado)' : ''}</span>
                  </button>

                  {/* Toggle Traducción Español */}
                  <button
                    className="toggle-feature-btn"
                    onClick={() => setShowSpanishTranslation(!showSpanishTranslation)}
                    title="Mostrar u ocultar traducción al español"
                  >
                    {showSpanishTranslation ? <Eye size={16} /> : <EyeOff size={16} />}
                    <span>{showSpanishTranslation ? 'Español On' : 'Español Off'}</span>
                  </button>
                </div>
              </div>

              {/* Vocabulario Recomendado del Video */}
              {currentVideo.recommendedVocab?.length > 0 && (
                <div className="recommended-vocab-section">
                  <div className="section-title">
                    <Sparkles size={16} className="text-warning" />
                    <h4>Vocabulario Clave de este Video (Haz clic para guardar)</h4>
                  </div>
                  <div className="vocab-chips-grid">
                    {currentVideo.recommendedVocab.map((w, idx) => (
                      <button
                        key={idx}
                        className="vocab-card-chip"
                        onClick={() => {
                          setModalData({
                            type: 'word',
                            text: w.kanji,
                            reading: w.hiragana,
                            translation: w.meaning_es,
                            level: w.level,
                            category: currentVideo.category,
                            videoTitle: currentVideo.title,
                            videoId: currentVideo.youtubeId,
                            timestamp: currentTime
                          });
                          setModalOpen(true);
                        }}
                      >
                        <div className="vocab-chip-top">
                          <span className="vocab-chip-kanji jp-text">{w.kanji}</span>
                          <span className="vocab-chip-reading jp-text">{w.hiragana}</span>
                          <span className="vocab-chip-level">{w.level}</span>
                        </div>
                        <span className="vocab-chip-meaning">{w.meaning_es}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Transcripción Lateral Sincronizada */}
            <div className="transcript-sidebar-column">
              <div className="transcript-sidebar-header">
                <div className="transcript-header-title">
                  <ListFilter size={18} />
                  <span>Transcripción Interactiva</span>
                  <span className="cues-counter">({subtitles.length})</span>
                </div>

                <div className="transcript-search-mini">
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder="Filtrar en transcripción..."
                    value={transcriptSearch}
                    onChange={(e) => setTranscriptSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="transcript-cues-list" ref={transcriptContainerRef}>
                {subtitles
                  .filter((cue) => {
                    if (!transcriptSearch.trim()) return true;
                    const q = transcriptSearch.toLowerCase();
                    return (
                      cue.text.toLowerCase().includes(q) ||
                      (cue.translation_es && cue.translation_es.toLowerCase().includes(q))
                    );
                  })
                  .map((cue, index) => {
                    const isActive = activeCueIndex === index;
                    return (
                      <div
                        key={cue.id || index}
                        ref={isActive ? activeCueRef : null}
                        className={`transcript-cue-item ${isActive ? 'is-active-cue' : ''}`}
                        onClick={() => handleSeekCue(cue)}
                      >
                        <div className="cue-timestamp-badge">
                          <span>{formatTimestamp(cue.start)}</span>
                        </div>

                        <div className="cue-content-body">
                          <div className="cue-text-jp jp-text">
                            {renderInteractiveSentence(cue.text, cue)}
                          </div>
                          {showSpanishTranslation && cue.translation_es && (
                            <div className="cue-text-es">{cue.translation_es}</div>
                          )}
                        </div>

                        <button
                          className="btn-cue-bookmark"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSavePhrase(cue);
                          }}
                          title="Guardar frase en mi cuaderno"
                        >
                          <Bookmark size={15} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 3: MI CUADERNO DE ESTUDIO (MINED VOCAB & PHRASES) */}
      {/* ============================================================== */}
      {activeView === 'saved' && (
        <div className="saved-notebook-view">
          <div className="notebook-header-card">
            <div>
              <h3>Mi Cuaderno de Estudio de Inmersión</h3>
              <p>
                Palabras, oraciones con video y kanjis capturados directamente desde YouTube. Registrados con Kanji, Hiragana, Katakana y traducción en español.
              </p>
            </div>
            <div className="notebook-stats-row">
              <div className="stat-pill">
                <span className="num">{appState.savedCustomVocab?.length || 0}</span>
                <span className="lbl">Palabras</span>
              </div>
              <div className="stat-pill">
                <span className="num">{appState.savedPhrases?.length || 0}</span>
                <span className="lbl">Frases con Video</span>
              </div>
            </div>
          </div>

          <div className="notebook-content-grid">
            {/* Lista de Palabras Guardadas */}
            <div className="notebook-column">
              <div className="column-title-bar">
                <Layers size={18} className="text-primary" />
                <h4>Palabras Guardadas ({appState.savedCustomVocab?.length || 0})</h4>
              </div>

              {(!appState.savedCustomVocab || appState.savedCustomVocab.length === 0) ? (
                <div className="empty-state-box">
                  <Bookmark size={32} />
                  <p>Aún no has guardado palabras de los videos.</p>
                  <small>Haz clic en cualquier palabra de los subtítulos para guardarla.</small>
                </div>
              ) : (
                <div className="saved-items-list">
                  {appState.savedCustomVocab.map((w) => (
                    <div key={w.id} className="saved-word-card">
                      <div className="word-main-info">
                        <div className="word-kanji jp-text">{w.kanji}</div>
                        <div className="word-readings jp-text">
                          <span className="reading-hira">{w.hiragana}</span>
                          <span className="reading-kata">({w.katakana})</span>
                        </div>
                        <div className="word-meaning">{w.meaning_es}</div>
                      </div>

                      <div className="word-card-actions">
                        <span className={`level-pill level-${(w.level || 'n5').toLowerCase()}`}>
                          {w.level}
                        </span>
                        <button
                          className="tts-btn-small"
                          onClick={() => audioManager.speak(w.kanji || w.hiragana)}
                          title="Escuchar pronunciación"
                        >
                          <Volume2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lista de Frases con Link a YouTube */}
            <div className="notebook-column">
              <div className="column-title-bar">
                <Sparkles size={18} className="text-warning" />
                <h4>Frases con Timestamp de YouTube ({appState.savedPhrases?.length || 0})</h4>
              </div>

              {(!appState.savedPhrases || appState.savedPhrases.length === 0) ? (
                <div className="empty-state-box">
                  <Sparkles size={32} />
                  <p>Aún no has guardado frases con marcas de tiempo.</p>
                  <small>Haz clic en el icono de marcador al lado de cualquier subtítulo.</small>
                </div>
              ) : (
                <div className="saved-items-list">
                  {appState.savedPhrases.map((phrase) => (
                    <div key={phrase.id} className="saved-phrase-card">
                      <div className="phrase-jp jp-text">{phrase.japanese}</div>
                      {phrase.translation && (
                        <div className="phrase-es">{phrase.translation}</div>
                      )}

                      <div className="phrase-meta-footer">
                        <span className="phrase-source">{phrase.videoTitle}</span>
                        <div className="phrase-actions-row">
                          <button
                            className="tts-btn-small"
                            onClick={() => audioManager.speak(phrase.japanese)}
                            title="Escuchar audio"
                          >
                            <Volume2 size={15} />
                          </button>
                          {phrase.youtubeUrl && (
                            <a
                              href={phrase.youtubeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="yt-timestamp-btn"
                              title="Ver momento exacto en YouTube"
                            >
                              <span>{formatTimestamp(phrase.timestamp)}</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 4: CANALES RECOMENDADOS PARA INMERSIÓN EN JAPONÉS */}
      {/* ============================================================== */}
      {activeView === 'channels' && (
        <div className="channels-view-section">
          <div className="channels-header">
            <h3>Los Mejores Canales de YouTube para Aprender Japonés</h3>
            <p>
              Canales seleccionados con subtítulos oficiales en japonés, lenguaje pausado y contenido estructurado por niveles JLPT.
            </p>
          </div>

          <div className="channels-grid">
            {(catalogData.channels || []).map((ch) => (
              <div key={ch.id} className="channel-card">
                <div className="channel-card-top">
                  <img src={ch.avatar} alt={ch.name} className="channel-avatar" />
                  <div className="channel-badge-level">
                    <span className="channel-level-tag">{ch.level}</span>
                    <span className="channel-feature-badge">{ch.badge}</span>
                  </div>
                </div>

                <div className="channel-details">
                  <h4 className="channel-name">{ch.name}</h4>
                  <span className="channel-handle">{ch.handle} • {ch.subscribers}</span>
                  <p className="channel-focus">{ch.focus}</p>
                </div>

                <a
                  href={ch.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-visit-channel"
                >
                  <span>Ver Canal en YouTube</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Guardado para Palabras, Frases y Kanjis */}
      <SaveVocabModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={modalData}
        appState={appState}
        onUpdateState={onUpdateState}
      />
    </div>
  );
}
