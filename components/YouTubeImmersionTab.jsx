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
  Link as LinkIcon,
  Trash2,
  Check,
  ShieldCheck,
  Loader2
} from 'lucide-react';

import YouTubePlayer from './YouTubePlayer';
import SaveVocabModal from './SaveVocabModal';
import audioManager from '../lib/audioManager';
import { dataStore } from '../lib/data';
import { tokenizeJapanese, formatTimestamp, containsKanji } from '../lib/japaneseUtils';

const TOPIC_PRESETS = [
  { id: 'anime', label: '🎌 Anime & Pop', query: 'Anime Japanese conversation', desc: 'Diálogos de anime y expresiones en japonés' },
  { id: 'food', label: '🍜 Comida & Ramen', query: 'Japanese food street food cooking', desc: 'Gastronomía japonesa, ramen y comida callejera' },
  { id: 'travel', label: '🚄 Viajes en Japón', query: 'Japan travel vlog Tokyo Kyoto', desc: 'Turismo en Tokio, Kioto, trenes y lugares icónicos' },
  { id: 'daily', label: '☕ Vida Diaria & Vlogs', query: 'Japanese daily life vlog routine', desc: 'Rutinas cotidianas, compras y vlogs de la vida en Japón' },
  { id: 'n5', label: '📚 JLPT N5 Gramática', query: 'JLPT N5 Japanese grammar vocabulary lesson', desc: 'Lecciones de gramática básica y vocabulario para principiantes' },
  { id: 'music', label: '🎵 Música & Canciones', query: 'Japanese song lyrics karaoke', desc: 'Canciones en japonés con letra y subtítulos' },
  { id: 'stories', label: '🌸 Cuentos & Audio Pausado', query: 'Japanese fairy tales slow easy Japanese for beginners', desc: 'Historias tradicionales contadas en japonés lento y claro' },
  { id: 'interview', label: '🎙️ Entrevistas Reales', query: 'Japanese street interview Tokyo', desc: 'Japonés real y coloquial hablado por personas en las calles de Tokio' }
];

export default function YouTubeImmersionTab({ appState, onUpdateState }) {
  // Navigation internal views: 'catalog' | 'player' | 'saved' | 'channels'
  const [activeView, setActiveView] = useState('catalog');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'anime' | 'daily_life' | 'food_travel' | 'stories' | 'custom'
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all' | 'N5' | 'N4' | 'N3'
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVerified, setOnlyVerified] = useState(false); // Opcional para filtrar solo verificados
  
  // Custom video input
  const [customUrl, setCustomUrl] = useState('');
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState('');
  const [customSuccessMsg, setCustomSuccessMsg] = useState('');

  // Topic search state (Buscador interno de videos verificados)
  const [topicSearchQuery, setTopicSearchQuery] = useState('');
  const [activeTopicPreset, setActiveTopicPreset] = useState(null);
  const [isSearchingTopics, setIsSearchingTopics] = useState(false);
  const [topicSearchResults, setTopicSearchResults] = useState([]);
  const [hasSearchedTopics, setHasSearchedTopics] = useState(false);
  const [topicSearchError, setTopicSearchError] = useState(null);
  const [loadingTranscriptVid, setLoadingTranscriptVid] = useState(null);
  const [savingVideoId, setSavingVideoId] = useState(null);

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
  const [activeTrackLang, setActiveTrackLang] = useState(currentVideo?.spokenLanguage || 'ja');
  const [changingTrackLoading, setChangingTrackLoading] = useState(false);

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

  // Combinar videos del catálogo y videos personalizados guardados por el usuario
  const allVideos = useMemo(() => {
    const defaultVids = catalogData.videos || [];
    const customVids = appState.savedCustomVideos || [];
    // Evitar duplicados por youtubeId
    const uniqueCustom = customVids.filter(cv => !defaultVids.some(dv => dv.youtubeId === cv.youtubeId));
    return [...uniqueCustom, ...defaultVids];
  }, [catalogData.videos, appState.savedCustomVideos]);

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

  // Filtrado de videos
  const filteredVideos = useMemo(() => {
    return allVideos.filter((v) => {
      const matchCategory = selectedCategory === 'all' || v.category === selectedCategory;
      const matchLevel = selectedLevel === 'all' || v.level === selectedLevel;
      const matchVerified = !onlyVerified || v.embeddableVerified === true;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        (v.originalTitle && v.originalTitle.toLowerCase().includes(q)) ||
        (v.channelTitle && v.channelTitle.toLowerCase().includes(q)) ||
        (v.tags && v.tags.some((t) => t.toLowerCase().includes(q)));

      return matchCategory && matchLevel && matchVerified && matchSearch;
    });
  }, [allVideos, selectedCategory, selectedLevel, onlyVerified, searchQuery]);

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

  // Manejar selección de video (con carga dinámica de transcripción si no está en memoria)
  const handleSelectVideo = async (video) => {
    if (!video) return;

    // Si ya tiene subtítulos cargados, abrir directo
    if (video.subtitles && video.subtitles.length > 0) {
      setCurrentVideo(video);
      setCurrentTime(0);
      setPlayerError(null);
      setActiveTrackLang(video.spokenLanguage || 'ja');
      setActiveView('player');
      if (playerRef.current) {
        playerRef.current.seekTo(0, true);
      }
      return;
    }

    // Si viene de resultados de búsqueda por tema y requiere cargar transcripción
    setLoadingTranscriptVid(video.youtubeId);
    try {
      const res = await fetch('/api/youtube/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.youtubeId })
      });
      const data = await res.json();
      const enrichedVideo = {
        ...video,
        spokenLanguage: data.spokenLanguage || video.spokenLanguage || 'ja',
        spokenLanguageName: data.spokenLanguageName || video.spokenLanguageName || 'Original',
        availableLanguages: data.availableLanguages || video.availableLanguages || [],
        subtitles: data.cues || []
      };
      setCurrentVideo(enrichedVideo);
      setCurrentTime(0);
      setPlayerError(null);
      setActiveTrackLang(data.spokenLanguage || video.spokenLanguage || 'ja');
      setActiveView('player');
      if (playerRef.current) {
        playerRef.current.seekTo(0, true);
      }
    } catch (err) {
      console.error('Error al cargar transcripción para el video:', err);
      setCurrentVideo(video);
      setActiveView('player');
    } finally {
      setLoadingTranscriptVid(null);
    }
  };

  // Cargar video personalizado por URL (con transcripción en idioma hablado y soporte para guardar)
  const handleLoadCustomUrl = async (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setCustomLoading(true);
    setCustomError('');
    setCustomSuccessMsg('');

    try {
      const res = await fetch('/api/youtube/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: customUrl.trim() })
      });

      const data = await res.json();

      if (!res.ok && !data.cues) {
        throw new Error(data.error || 'Error al obtener la transcripción.');
      }

      const customVideo = {
        id: `custom_${data.videoId}_${Date.now()}`,
        youtubeId: data.videoId,
        title: data.title || 'Video de YouTube',
        originalTitle: data.title,
        channelTitle: data.author || 'Canal de YouTube',
        category: 'custom',
        level: 'N5',
        duration: '--:--',
        thumbnail: `https://img.youtube.com/vi/${data.videoId}/hqdefault.jpg`,
        description: data.isEmbeddable
          ? 'Video importado con transcripción completa.'
          : 'Video con inserción externa limitada. Transcripción completa lista para Modo de Estudio Sincronizado.',
        tags: ['Personalizado', 'URL', data.spokenLanguage?.toUpperCase() || 'AUDIO'],
        embeddableVerified: data.isEmbeddable !== false,
        isEmbeddable: data.isEmbeddable !== false,
        spokenLanguage: data.spokenLanguage || 'ja',
        spokenLanguageName: data.spokenLanguageName || data.spokenLanguage || 'Original',
        availableLanguages: data.availableLanguages || [],
        subtitles: data.cues || []
      };

      setCurrentVideo(customVideo);
      setActiveTrackLang(data.spokenLanguage || 'ja');
      setActiveView('player');
      setCustomUrl('');

      if (!data.isEmbeddable) {
        setCustomSuccessMsg(
          '⚠️ Este video tiene restricciones de reproducción externa en YouTube, pero su transcripción completa se cargó exitosamente. Puedes guardarlo en tu biblioteca y usar el Modo Sincronizado.'
        );
      } else {
        setCustomSuccessMsg('¡Video y transcripción completa cargados con éxito!');
      }
    } catch (err) {
      setCustomError(err.message);
    } finally {
      setCustomLoading(false);
    }
  };

  // Comprobar si un video está guardado en la biblioteca
  const isVideoSaved = (video) => {
    if (!video) return false;
    const saved = appState.savedCustomVideos || [];
    return saved.some(v => v.youtubeId === video.youtubeId);
  };

  // Guardar o quitar video de la biblioteca permanente
  const handleToggleSaveVideo = async (videoToSave) => {
    if (!videoToSave) return;
    const prevSaved = appState.savedCustomVideos || [];
    const isSaved = prevSaved.some(v => v.youtubeId === videoToSave.youtubeId);

    if (isSaved) {
      // Eliminar de guardados
      const updated = prevSaved.filter(v => v.youtubeId !== videoToSave.youtubeId);
      onUpdateState({
        ...appState,
        savedCustomVideos: updated
      });
    } else {
      // Guardar en biblioteca
      setSavingVideoId(videoToSave.youtubeId);
      let videoWithSubs = videoToSave;

      // Si no tiene subtítulos aún, obtenerlos para guardarlo con transcripción completa
      if (!videoToSave.subtitles || videoToSave.subtitles.length === 0) {
        try {
          const res = await fetch('/api/youtube/transcript', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId: videoToSave.youtubeId })
          });
          const data = await res.json();
          if (data.cues && data.cues.length > 0) {
            videoWithSubs = {
              ...videoToSave,
              spokenLanguage: data.spokenLanguage || videoToSave.spokenLanguage || 'ja',
              spokenLanguageName: data.spokenLanguageName || 'Original',
              availableLanguages: data.availableLanguages || [],
              subtitles: data.cues
            };
          }
        } catch (e) {
          console.warn('Error descargando subtítulos al guardar:', e);
        }
      }

      const newSavedItem = {
        ...videoWithSubs,
        category: 'custom',
        savedAt: new Date().toISOString()
      };
      const updated = [newSavedItem, ...prevSaved];
      onUpdateState({
        ...appState,
        savedCustomVideos: updated,
        xp: (appState.xp || 0) + 20
      });
      setSavingVideoId(null);
    }
  };

  const isCurrentVideoSaved = useMemo(() => {
    if (!currentVideo) return false;
    return isVideoSaved(currentVideo);
  }, [currentVideo, appState.savedCustomVideos]);

  const handleToggleSaveCurrentVideo = () => {
    if (currentVideo) {
      handleToggleSaveVideo(currentVideo);
    }
  };

  // Ejecutar búsqueda por temas en YouTube con filtro estricto
  const handleExecuteTopicSearch = async (queryText, presetId = null) => {
    const q = (queryText !== undefined ? queryText : topicSearchQuery).trim();
    if (!q) return;

    setIsSearchingTopics(true);
    setTopicSearchError(null);
    setActiveTopicPreset(presetId);
    setHasSearchedTopics(true);
    setTopicSearchQuery(q);

    try {
      const res = await fetch('/api/youtube/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, maxResults: 8 })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al buscar videos.');
      }

      setTopicSearchResults(data.results || []);
    } catch (err) {
      console.error('Error buscando videos por tema:', err);
      setTopicSearchError(err.message || 'Error al conectar con el buscador de YouTube.');
    } finally {
      setIsSearchingTopics(false);
    }
  };

  // Cambiar pista de idioma (ej. Inglés, Español o Japonés)
  const handleChangeLanguageTrack = async (langCode) => {
    if (!currentVideo || changingTrackLoading) return;
    setChangingTrackLoading(true);
    try {
      const res = await fetch('/api/youtube/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: currentVideo.youtubeId, lang: langCode })
      });
      const data = await res.json();
      if (data.cues && data.cues.length) {
        setCurrentVideo({
          ...currentVideo,
          spokenLanguage: langCode,
          subtitles: data.cues
        });
        setActiveTrackLang(langCode);
      }
    } catch (e) {
      console.warn('Error cambiando idioma:', e);
    } finally {
      setChangingTrackLoading(false);
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

  // Renderizar oraciones según idioma hablado (Japonés, Inglés o Español)
  const renderInteractiveSentence = (sentenceText, cue) => {
    // Si contiene caracteres japoneses (Hiragana, Katakana, Kanji)
    const isJapanese = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(sentenceText);

    if (isJapanese) {
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
    }

    // Si es inglés o español, tokenizar por palabras con espacios
    const words = sentenceText.split(/\s+/);
    return (
      <span className="interactive-sentence-tokens">
        {words.map((w, idx) => (
          <button
            key={idx}
            type="button"
            className="word-token-btn word-latin-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenSavePhrase(cue);
            }}
            title="Clic para guardar esta frase con timestamp"
          >
            {w}
          </button>
        ))}
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
            <h2 className="immersion-heading">Inmersión YouTube con Transcripciones Completas</h2>
            <p className="immersion-subheading">
              Aprende en el idioma real en que se habla (Japonés, Inglés o Español), guarda videos enviados por URL incluso si tienen restricciones de inserción, y captura vocabulario en tu cuaderno.
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

      {/* Navegación interna */}
      <div className="immersion-nav-strip">
        <div className="immersion-nav-tabs">
          <button
            className={`immersion-tab-btn ${activeView === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveView('catalog')}
          >
            <BookOpen size={16} />
            <span>Videoteca ({allVideos.length})</span>
          </button>
          <button
            className={`immersion-tab-btn ${activeView === 'search' ? 'active' : ''}`}
            onClick={() => setActiveView('search')}
          >
            <Search size={16} />
            <span>Buscar por Temas</span>
            <span className="tab-pill-badge">Verificado</span>
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
              Mi Cuaderno de Estudio (
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
      {/* VISTA 1: CATÁLOGO DE VIDEOS */}
      {/* ============================================================== */}
      {activeView === 'catalog' && (
        <div className="catalog-view-section">
          {/* Banner de Acceso Rápido al Buscador por Temas de YouTube */}
          <div className="catalog-topic-search-banner">
            <div className="banner-left">
              <div className="banner-icon-circle">
                <Search size={20} />
              </div>
              <div className="banner-text">
                <div className="banner-title-row">
                  <h4>Buscador de Videos de YouTube por Temas</h4>
                  <span className="banner-verified-badge">
                    <CheckCircle2 size={12} /> Filtro Estricto: 100% Reproducibles & con Transcripción
                  </span>
                </div>
                <p>
                  Encuentra miles de videos sobre Anime, Cocina, Viajes o Gramática filtrados para garantizar reproducción externa sin errores (sin Error 150) y con transcripción completa.
                </p>
              </div>
            </div>
            <div className="banner-right">
              <div className="banner-quick-chips">
                {TOPIC_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="banner-chip-btn"
                    onClick={() => {
                      setActiveView('search');
                      handleExecuteTopicSearch(preset.query, preset.id);
                    }}
                    title={preset.desc}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="banner-search-all-btn"
                onClick={() => setActiveView('search')}
              >
                <Search size={14} />
                <span>Explorar Todos los Temas →</span>
              </button>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="catalog-filter-controls">
            {/* Tópicos */}
            <div className="filter-pill-group">
              <span className="filter-label">Tópico:</span>
              <button
                className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Todos ({allVideos.length})
              </button>
              <button
                className={`filter-pill ${selectedCategory === 'custom' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('custom')}
              >
                📁 Mis Videos Guardados ({appState.savedCustomVideos?.length || 0})
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
                📖 Cuentos & Gramática
              </button>
            </div>

            {/* Nivel JLPT */}
            <div className="filter-level-group">
              <span className="filter-label">Nivel:</span>
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

            {/* Toggle de Videos Verificados */}
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
              <span>Cargar y guardar cualquier video de YouTube por URL (Incluso con restricciones):</span>
            </div>
            <form onSubmit={handleLoadCustomUrl} className="custom-url-form">
              <input
                type="text"
                placeholder="Pega cualquier enlace (ej. https://www.youtube.com/watch?v=... o youtu.be/...)"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                disabled={customLoading}
              />
              <button type="submit" disabled={customLoading || !customUrl.trim()}>
                {customLoading ? 'Cargando transcripción completa...' : 'Cargar Video'}
              </button>
            </form>
            {customError && <p className="custom-url-error">{customError}</p>}
            {customSuccessMsg && <p className="custom-url-success">{customSuccessMsg}</p>}
          </div>

          {/* Grid de Videos */}
          <div className="video-cards-grid">
            {filteredVideos.map((video) => {
              const isCurrent = currentVideo?.id === video.id;
              const isSaved = (appState.savedCustomVideos || []).some(
                (v) => v.youtubeId === video.youtubeId
              );
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
                    <span className={`video-level-badge level-${(video.level || 'n5').toLowerCase()}`}>
                      {video.level || 'N5'}
                    </span>
                    {video.embeddableVerified !== false ? (
                      <span className="video-verified-badge" title="Inserción permitida en la app">
                        <CheckCircle2 size={11} />
                        <span>Reproducible</span>
                      </span>
                    ) : (
                      <span className="video-restricted-badge" title="Modo Sincronizado disponible">
                        <span>Modo Sincronizado</span>
                      </span>
                    )}
                    <div className="video-play-overlay">
                      <Play size={28} className="play-icon-pulse" />
                    </div>
                  </div>

                  <div className="video-card-content">
                    <div className="video-card-top-row">
                      <span className="video-channel-name">{video.channelTitle}</span>
                      {isSaved && (
                        <span className="saved-indicator-pill" title="Guardado en tu biblioteca">
                          <Bookmark size={11} /> Guardado
                        </span>
                      )}
                    </div>

                    <h4 className="video-card-title">{video.title}</h4>
                    <p className="video-card-desc">{video.description}</p>

                    <div className="video-card-footer">
                      <div className="video-tags-list">
                        {video.spokenLanguage && (
                          <span className="mini-tag lang-tag">
                            🗣 {video.spokenLanguage.toUpperCase()}
                          </span>
                        )}
                        {(video.tags || []).slice(0, 2).map((tag, i) => (
                          <span key={i} className="mini-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="cues-count-badge">
                        {video.subtitles?.length || 0} frases completas
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mensaje de fallback si la búsqueda local no encuentra videos */}
          {filteredVideos.length === 0 && (
            <div className="no-local-videos-card">
              <div className="empty-search-icon">🔍</div>
              <h4>No hay videos en tu catálogo local para "{searchQuery}"</h4>
              <p>Puedes buscar este término directamente en YouTube con verificación de reproducción (sin Error 150) y transcripción completa:</p>
              <button
                type="button"
                className="btn-search-youtube-fallback"
                onClick={() => {
                  setActiveView('search');
                  handleExecuteTopicSearch(searchQuery, null);
                }}
              >
                <Search size={15} />
                <span>Buscar "{searchQuery}" en YouTube Verificado</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA: BUSCADOR POR TEMAS (100% REPRODUCIBLES Y CON TRANSCRIPCIÓN) */}
      {/* ============================================================== */}
      {activeView === 'search' && (
        <div className="topic-search-view-section">
          {/* Header del Buscador */}
          <div className="topic-search-hero">
            <div className="topic-search-hero-badge">
              <ShieldCheck size={16} />
              <span>Filtro Estricto de Reproducción & Transcripción</span>
            </div>
            <h3 className="topic-search-hero-title">
              Buscador Inteligente de YouTube por Temas
            </h3>
            <p className="topic-search-hero-desc">
              Busca cualquier tema en YouTube. Nuestro motor verifica automáticamente cada video en tiempo real:
              <strong> solo te mostrará videos 100% reproducibles en la aplicación (sin Error 150/101)</strong> y con
              <strong> transcripción completa disponible</strong> en su idioma original de audio (Japonés, Inglés o Español).
            </p>
          </div>

          {/* Formulario de Búsqueda */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteTopicSearch(topicSearchQuery, null);
            }}
            className="topic-search-form"
          >
            <div className="topic-search-input-wrapper">
              <Search size={20} className="topic-search-icon" />
              <input
                type="text"
                className="topic-search-input"
                placeholder="Escribe cualquier tema o palabra clave (ej: Anime, Comida callejera, JLPT N5, Vlogs en Kioto)..."
                value={topicSearchQuery}
                onChange={(e) => setTopicSearchQuery(e.target.value)}
                disabled={isSearchingTopics}
              />
              {topicSearchQuery && (
                <button
                  type="button"
                  className="btn-clear-topic-search"
                  onClick={() => setTopicSearchQuery('')}
                  title="Borrar texto"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="btn-submit-topic-search"
              disabled={isSearchingTopics || !topicSearchQuery.trim()}
            >
              {isSearchingTopics ? (
                <>
                  <Loader2 size={18} className="spin-animation" />
                  <span>Verificando videos...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Buscar Videos Verificados</span>
                </>
              )}
            </button>
          </form>

          {/* Chips de Temas Populares */}
          <div className="topic-preset-chips-container">
            <span className="preset-chips-label">
              <Sparkles size={14} /> Temas Populares Recomendados:
            </span>
            <div className="preset-chips-list">
              {TOPIC_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`topic-preset-chip ${activeTopicPreset === preset.id ? 'active' : ''}`}
                  onClick={() => handleExecuteTopicSearch(preset.query, preset.id)}
                  disabled={isSearchingTopics}
                  title={preset.desc}
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Estado de Carga */}
          {isSearchingTopics && (
            <div className="topic-search-loading-state">
              <Loader2 size={40} className="spin-animation" />
              <h4>Buscando y Verificando Videos en YouTube...</h4>
              <p>
                Comprobando que no tengan bloqueo de inserción (oEmbed 200) y que contengan pista de subtítulos completa.
              </p>
            </div>
          )}

          {/* Estado de Error */}
          {topicSearchError && !isSearchingTopics && (
            <div className="topic-search-error-state">
              <p>{topicSearchError}</p>
              <button
                type="button"
                className="btn-retry-search"
                onClick={() => handleExecuteTopicSearch(topicSearchQuery, activeTopicPreset)}
              >
                Reintentar Búsqueda
              </button>
            </div>
          )}

          {/* Estado Vacío inicial */}
          {!hasSearchedTopics && !isSearchingTopics && (
            <div className="topic-search-empty-prompt">
              <div className="empty-prompt-icon">🎌</div>
              <h4>Elige un tema popular arriba o ingresa una búsqueda</h4>
              <p>
                Todos los videos que encuentres aquí son garantizados: reproducen directamente sin errores y sincronizan subtítulos interactivos palabra por palabra.
              </p>
            </div>
          )}

          {/* Resultados de Búsqueda */}
          {hasSearchedTopics && !isSearchingTopics && !topicSearchError && (
            <div className="topic-search-results-section">
              <div className="search-results-header">
                <div className="results-count-tag">
                  <CheckCircle2 size={16} />
                  <span>
                    {topicSearchResults.length} videos verificados encontrados para "{topicSearchQuery}"
                  </span>
                </div>
                <span className="results-verified-note">
                  🛡️ 100% reproducibles en la app & con transcripción
                </span>
              </div>

              {topicSearchResults.length === 0 ? (
                <div className="no-search-results">
                  <p>No encontramos videos con transcripción e inserción abierta para este término exacto.</p>
                  <p className="subtext">Prueba con uno de los temas populares como "🎌 Anime" o "🍜 Comida Japonesa".</p>
                </div>
              ) : (
                <div className="video-cards-grid">
                  {topicSearchResults.map((video) => {
                    const isSaved = isVideoSaved(video);
                    const isLoadingTranscript = loadingTranscriptVid === video.youtubeId;
                    const isSaving = savingVideoId === video.youtubeId;

                    return (
                      <div
                        key={video.id}
                        className="video-card search-result-card"
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
                          <span className="video-level-badge level-n5">
                            {video.level || 'N5'}
                          </span>
                          <span className="video-verified-badge" title="Inserción 100% permitida">
                            <CheckCircle2 size={11} />
                            <span>100% Reproducible</span>
                          </span>
                          <div className="video-play-overlay">
                            {isLoadingTranscript ? (
                              <Loader2 size={32} className="spin-animation" />
                            ) : (
                              <Play size={28} className="play-icon-pulse" />
                            )}
                          </div>
                        </div>

                        <div className="video-card-content">
                          <div className="video-card-top-row">
                            <span className="video-channel-name">{video.channelTitle}</span>
                            {isSaved && (
                              <span className="saved-indicator-pill" title="Guardado en tu biblioteca">
                                <Bookmark size={11} /> Guardado
                              </span>
                            )}
                          </div>

                          <h4 className="video-card-title">{video.title}</h4>
                          <p className="video-card-desc">{video.description}</p>

                          <div className="video-card-footer">
                            <div className="video-tags-list">
                              <span className="mini-tag lang-tag">
                                🗣 {video.spokenLanguage ? video.spokenLanguage.toUpperCase() : 'JA'}
                              </span>
                              <span className="mini-tag verified-tag">
                                ✓ Transcripción
                              </span>
                            </div>

                            <div className="card-quick-actions" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className={`btn-card-save ${isSaved ? 'is-saved' : ''}`}
                                onClick={() => handleToggleSaveVideo(video)}
                                disabled={isSaving}
                                title={isSaved ? 'Eliminar de biblioteca' : 'Guardar en biblioteca'}
                              >
                                {isSaved ? <Check size={13} /> : <Bookmark size={13} />}
                                <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
                              </button>
                              <button
                                type="button"
                                className="btn-card-play"
                                onClick={() => handleSelectVideo(video)}
                                disabled={isLoadingTranscript}
                              >
                                {isLoadingTranscript ? (
                                  <>
                                    <Loader2 size={13} className="spin-animation" />
                                    <span>Cargando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Play size={13} />
                                    <span>Ver y Estudiar</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: REPRODUCTOR CON TRANSCRIPCIÓN COMPLETA Y DUAL SUBTÍTULOS */}
      {/* ============================================================== */}
      {activeView === 'player' && currentVideo && (
        <div className="player-view-section">
          {/* Header del Video Activo */}
          <div className="player-top-action-bar">
            <button className="btn-back-catalog" onClick={() => setActiveView('catalog')}>
              <ArrowLeft size={16} />
              <span>Volver a la Videoteca</span>
            </button>

            <div className="active-video-meta">
              <span className={`level-pill level-${(currentVideo.level || 'n5').toLowerCase()}`}>
                {currentVideo.level || 'N5'}
              </span>
              <h3 className="active-video-title">{currentVideo.title}</h3>
              <span className="active-video-channel">por {currentVideo.channelTitle}</span>
            </div>

            <div className="player-meta-actions">
              {/* Botón Guardar Video en Biblioteca */}
              <button
                type="button"
                className={`btn-save-video-library ${isCurrentVideoSaved ? 'is-saved' : ''}`}
                onClick={handleToggleSaveCurrentVideo}
                title={isCurrentVideoSaved ? 'Eliminar de videos guardados' : 'Guardar en mi biblioteca permanente'}
              >
                {isCurrentVideoSaved ? <Check size={16} /> : <Bookmark size={16} />}
                <span>{isCurrentVideoSaved ? 'Guardado en Mi Biblioteca' : 'Guardar Video en Biblioteca'}</span>
              </button>
            </div>
          </div>

          {/* Selector de Pistas de Idioma (Inglés, Español o Japonés) */}
          {currentVideo.availableLanguages && currentVideo.availableLanguages.length > 1 && (
            <div className="language-selector-strip">
              <span className="lang-selector-label">
                <Languages size={15} /> Idioma Transcrito:
              </span>
              <div className="lang-pills-row">
                {currentVideo.availableLanguages.map((l) => (
                  <button
                    key={l.code}
                    className={`lang-track-pill ${activeTrackLang === l.code ? 'active' : ''}`}
                    onClick={() => handleChangeLanguageTrack(l.code)}
                    disabled={changingTrackLoading}
                  >
                    {l.name} {l.isOriginal ? '★ Hablado Original' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                        title="Escuchar pronunciación"
                      >
                        <Volume2 size={15} />
                        <span>Escuchar</span>
                      </button>

                      <button
                        className="cue-action-btn"
                        onClick={() => handleOpenSavePhrase(activeCue)}
                        title="Guardar esta frase en mi cuaderno con timestamp"
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

                  {/* Modo Shadowing */}
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
                    title="Mostrar u ocultar traducción secundaria al español"
                  >
                    {showSpanishTranslation ? <Eye size={16} /> : <EyeOff size={16} />}
                    <span>{showSpanishTranslation ? 'Traducción On' : 'Traducción Off'}</span>
                  </button>
                </div>
              </div>

              {/* Vocabulario Recomendado si existe */}
              {currentVideo.recommendedVocab?.length > 0 && (
                <div className="recommended-vocab-section">
                  <div className="section-title">
                    <Sparkles size={16} className="text-warning" />
                    <h4>Vocabulario Clave del Video (Haz clic para guardar)</h4>
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

            {/* Columna Derecha: Transcripción Completa Sincronizada */}
            <div className="transcript-sidebar-column">
              <div className="transcript-sidebar-header">
                <div className="transcript-header-title">
                  <ListFilter size={18} />
                  <span>Transcripción Completa</span>
                  <span className="cues-counter">({subtitles.length} frases)</span>
                </div>

                <div className="transcript-search-mini">
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder="Filtrar en toda la transcripción..."
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
                          title="Guardar frase en mi cuaderno con timestamp"
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
      {/* VISTA 3: MI CUADERNO DE ESTUDIO */}
      {/* ============================================================== */}
      {activeView === 'saved' && (
        <div className="saved-notebook-view">
          <div className="notebook-header-card">
            <div>
              <h3>Mi Cuaderno de Estudio de Inmersión</h3>
              <p>
                Palabras, oraciones con enlace exacto a YouTube y videos guardados permanentemente en tu biblioteca.
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
              <div className="stat-pill">
                <span className="num">{appState.savedCustomVideos?.length || 0}</span>
                <span className="lbl">Videos Guardados</span>
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
      {/* VISTA 4: CANALES RECOMENDADOS */}
      {/* ============================================================== */}
      {activeView === 'channels' && (
        <div className="channels-view-section">
          <div className="channels-header">
            <h3>Los Mejores Canales de YouTube para Aprender Japonés</h3>
            <p>
              Canales seleccionados con subtítulos verificados, contenido estructurado por niveles JLPT y transcripciones completas.
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
