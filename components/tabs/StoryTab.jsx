'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import storiesData from '../../data/stories.json';
import audioManager from '../../lib/audioManager';
import { 
  Volume2, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  PlusCircle, 
  PenTool, 
  Info, 
  Search, 
  Filter, 
  Layers, 
  ArrowRight, 
  ExternalLink 
} from 'lucide-react';
import * as wanakana from 'wanakana';
import { useApp } from '../../lib/AppContext';

// Lazy loading con code-splitting
const SpeechPractice = dynamic(() => import('../features/SpeechPractice'), { ssr: false });
const ComprehensionQuiz = dynamic(() => import('../features/ComprehensionQuiz'), { ssr: false });

export default function StoryTab({ 
  userState, 
  onRecordActivity, 
  appState, 
  onUpdateState, 
  activeStoryId, 
  onSelectStory, 
  onNavigate,
  initialStoryId = null,
  initialChapter = null,
  initialMode = null,
  onParamsChange
}) {
  const contextApp = useApp();
  const showConfirm = contextApp?.showConfirm || (() => Promise.resolve(true));
  const allStories = useMemo(() => {
    const defaultStories = storiesData || [];
    const customStories = appState?.savedStories || [];
    return [...defaultStories, ...customStories];
  }, [appState?.savedStories]);

  const [selectedStoryId, setSelectedStoryId] = useState(initialStoryId || activeStoryId || allStories[0]?.id || 'story_1');
  const [currentChapter, setCurrentChapter] = useState(initialChapter ? parseInt(initialChapter, 10) : 1);
  const [readingMode, setReadingMode] = useState(initialMode || 'natural'); // 'natural', 'hiragana', 'kanji_only'
  const [storyLevelFilter, setStoryLevelFilter] = useState('Todos'); // 'Todos', 'N5', 'N4', 'N3', 'Personalizadas'
  const [storySearch, setStorySearch] = useState('');

  useEffect(() => {
    if (initialStoryId && allStories.some(s => s.id === initialStoryId)) {
      setSelectedStoryId(initialStoryId);
    } else if (activeStoryId && allStories.some(s => s.id === activeStoryId)) {
      setSelectedStoryId(activeStoryId);
    }
  }, [initialStoryId, activeStoryId, allStories]);

  useEffect(() => {
    if (initialChapter !== null && initialChapter !== undefined) {
      const ch = parseInt(initialChapter, 10);
      if (ch) setCurrentChapter(ch);
    }
  }, [initialChapter]);

  useEffect(() => {
    if (initialMode && ['natural', 'hiragana', 'kanji_only'].includes(initialMode)) {
      setReadingMode(initialMode);
    }
  }, [initialMode]);

  // Handle browser Back/Forward navigation smoothly
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      const chapter = params.get('chapter');
      const mode = params.get('mode');
      if (id && allStories.some(s => s.id === id)) setSelectedStoryId(id);
      if (chapter) {
        const ch = parseInt(chapter, 10);
        if (ch) setCurrentChapter(ch);
      }
      if (mode && ['natural', 'hiragana', 'kanji_only'].includes(mode)) {
        setReadingMode(mode);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allStories]);

  const story = useMemo(() => {
    return allStories.find(s => s.id === selectedStoryId) || allStories[0] || storiesData?.[0] || {};
  }, [allStories, selectedStoryId]);

  const filteredStories = useMemo(() => {
    return allStories.filter(s => {
      const lvl = s.level || s.difficulty || 'N5';
      const matchesLevel = 
        storyLevelFilter === 'Todos' ? true :
        storyLevelFilter === 'Personalizadas' ? s.isCustom :
        lvl === storyLevelFilter;
      if (!matchesLevel) return false;

      if (storySearch.trim()) {
        const q = storySearch.toLowerCase().trim();
        const titleJp = (s.title || '').toLowerCase();
        const titleEs = (s.title_es || s.title_en || s.description || '').toLowerCase();
        return titleJp.includes(q) || titleEs.includes(q);
      }
      return true;
    });
  }, [allStories, storyLevelFilter, storySearch]);

  const [selectedSentenceId, setSelectedSentenceId] = useState('sent_1');
  const [typingInput, setTypingInput] = useState('');
  const [typingFeedback, setTypingFeedback] = useState(null);

  const paragraphs = story?.paragraphs && story.paragraphs.length > 0 ? story.paragraphs : [
    {
      chapter: 1,
      title: story?.title || 'Capítulo 1',
      japanese: story?.japanese || '',
      hiragana: story?.hiragana || '',
      translation_es: story?.translation_es || ''
    }
  ];

  const chapter = paragraphs.find(p => p.chapter === currentChapter) || paragraphs[0];

  // Distribute sentences cleanly by chapter
  const storySentences = story.sentences && story.sentences.length > 0 ? story.sentences : [];
  const chapterSentences = useMemo(() => {
    if (story.isCustom) return storySentences;
    const matching = storySentences.filter(s => s.chapter === currentChapter);
    if (matching.length > 0) return matching;

    const chapterRanges = {
      1: [0, 12],
      2: [12, 26],
      3: [26, 40],
      4: [40, 58]
    };
    const [start, end] = chapterRanges[currentChapter] || [0, 15];
    return storySentences.slice(start, end);
  }, [story, currentChapter, storySentences]);

  useEffect(() => {
    if (chapterSentences.length > 0 && !chapterSentences.some(s => s.id === selectedSentenceId)) {
      setSelectedSentenceId(chapterSentences[0].id);
      setTypingInput('');
      setTypingFeedback(null);
    }
  }, [chapterSentences, selectedSentenceId]);

  const activeSentence = chapterSentences.find(s => s.id === selectedSentenceId) || chapterSentences[0];

  const handlePlayChapter = () => {
    audioManager.setPlaylist(chapterSentences, 0);
    audioManager.speak(chapterSentences[0].japanese, { autoAdvance: true });
  };

  const handleSentenceClick = (sentence) => {
    setSelectedSentenceId(sentence.id);
    audioManager.speak(sentence.japanese);
  };

  const handleWordClick = (e, word) => {
    e.stopPropagation();
    audioManager.speak(word);
  };

  const handleCheckTyping = () => {
    if (!activeSentence) return;
    const cleanUser = typingInput.replace(/[、。！？「」\s]/g, '').trim();
    const cleanTarget = activeSentence.clean_target;

    if (!cleanUser) {
      setTypingFeedback({ type: 'warning', msg: 'Por favor escribe tu respuesta en japonés con tu teclado.' });
      return;
    }

    if (cleanUser === cleanTarget) {
      setTypingFeedback({ type: 'success', msg: '🎉 ¡Perfecto! Escritura en japonés completada correctamente (+30 XP).' });
      onRecordActivity(true, true, activeSentence.id);
      audioManager.speak(activeSentence.japanese);
    } else {
      setTypingFeedback({
        type: 'error',
        msg: `Casi lo tienes. Revisa caracteres o kanji. Tu entrada: "${typingInput}" vs Objetivo: "${activeSentence.japanese}"`
      });
      onRecordActivity(false, true);
    }
  };

  const handleHint = () => {
    if (!activeSentence) return;
    setTypingInput(activeSentence.japanese.slice(0, Math.ceil(activeSentence.japanese.length / 2)));
  };

  const renderRubyParagraph = (rawJp) => {
    const rubyMap = [
      ['私', 'わたし'], ['今年', 'ことし'], ['外国', 'がいこく'], ['来ました', 'きました'],
      ['国', 'くに'], ['遠い', 'とおい'], ['今日', 'きょう'], ['四月一日', 'しがつついたち'],
      ['月曜日', 'げつようび'], ['今', 'いま'], ['午前六時半', 'ごぜんろくじはん'],
      ['毎日', 'まいにち'], ['早く', 'はやく'], ['起きます', 'おきます'],
      ['天気', 'てんき'], ['良くて', 'よくて'], ['空', 'そら'], ['白い', 'しろい'],
      ['雲', 'くも'], ['少し', 'すこし'], ['青い', 'あおい'], ['外', 'そと'],
      ['寒い', 'さむい'], ['冷たい', 'つめたい'], ['水', 'みず'], ['顔', 'かお'],
      ['洗います', 'あらいます'], ['朝ごはん', 'あさごはん'], ['味', 'あじ'],
      ['美味しい', 'おいしい'], ['食べます', 'たべます'], ['父', 'ちち'],
      ['母', 'はは'], ['会社', 'かいしゃ'], ['行きました', 'いきました'],
      ['子供たち', 'こどもたち'], ['家', 'いえ'], ['学生', 'がくせい'],
      ['学校', 'がっこう'], ['駅', 'えき'], ['近い', 'ちかい'], ['電車', 'でんしゃ'],
      ['乗ります', 'のります'], ['道', 'みち'], ['長い', 'ながい'], ['大きい', 'おおきい'],
      ['木', 'き'], ['美しい', 'うつくしい'], ['花', 'はな'], ['男の子', 'おとこのこ'],
      ['女の子', 'おんなのこ'], ['立っています', 'たっています'], ['右', 'みぎ'],
      ['左', 'ひだり'], ['古い', 'ふるい'], ['店', 'みせ'], ['新しい', 'あたらしい'],
      ['小さい', 'ちいさい'], ['見えます', 'みえます'], ['大勢', 'おおぜい'],
      ['人', 'ひと'], ['速い', 'はやい'], ['多い', 'おおい'], ['八時', 'はちじ'],
      ['出て', 'でて'], ['入ります', 'はいります'], ['南口', 'みなみぐち'],
      ['友達', 'ともだち'], ['会いました', 'あいました'], ['彼女', 'かのじょ'],
      ['名前', 'なまえ'], ['元気', 'げんき'], ['言います', 'いいます'],
      ['日本語', 'にほんご'], ['勉強', 'べんきょう'], ['先生方', 'せんせいがた'],
      ['本', 'ほん'], ['机', 'つくえ'], ['出します', 'だします'],
      ['話', 'はなし'], ['聞いて', 'きいて'], ['読みます', 'よみます'],
      ['字', 'じ'], ['書きます', 'かきます'], ['易しくない', 'やすくない'],
      ['難しい', 'むずかしい'], ['漢字', 'かんじ'], ['読み方', 'よみかた'],
      ['何', 'なん'], ['聞きます', 'ききます'], ['授業', 'じゅぎょう'],
      ['面白い', 'おもしろい'], ['休み時間', 'やすみじかん'], ['午後十二時', 'ごごじゅうにじ'],
      ['皆', 'みな'], ['魚', 'さかな'], ['飲み物', 'のみもの'], ['買います', 'かいます'],
      ['お茶', 'おちゃ'], ['百五十円', 'ひゃくごじゅうえん'], ['全部', 'ぜんぶ'],
      ['千二百九十八円', 'せんにひゃくきゅうじゅうはちえん'], ['安い', 'やすい'],
      ['今週', 'こんしゅう'], ['土曜日', 'どようび'], ['日曜日', 'にちようび'],
      ['東', 'ひがし'], ['山', 'やま'], ['高い', 'たかい'], ['低い', 'ひくい'],
      ['空気', 'くうき'], ['楽しい', 'たのしい'], ['西', 'にし'], ['川', 'かわ'],
      ['足', 'あし'], ['入れる', 'いれる'], ['気持ち', 'きもち'],
      ['火曜日', 'かようび'], ['水曜日', 'すいようび'], ['木曜日', 'もくようび'],
      ['金曜日', 'きんようび'], ['忙しい', 'いそがしい'], ['休み', 'やすみ'],
      ['暑い', 'あつい'], ['飲んで', 'のんで'], ['お父さん', 'おとうさん'],
      ['三万円', 'さんまんえん'], ['車', 'くるま'], ['遅い', 'おそい'],
      ['北', 'きた'], ['黒い', 'くろい'], ['悪い', 'わるい'], ['雨', 'あめ'],
      ['目', 'め'], ['耳', 'みみ'], ['口', 'くち'], ['手', 'て'],
      ['五分', 'ごふん'], ['時間', 'じかん'], ['行きましょう', 'いきましょう']
    ];

    // Sort keys by descending length to match compound kanji before individual characters
    const sortedRubyMap = [...rubyMap].sort((a, b) => b[0].length - a[0].length);
    const rubyDict = Object.fromEntries(rubyMap);
    const escapedKeys = sortedRubyMap.map(([k]) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const reg = new RegExp(escapedKeys.join('|'), 'g');
    const html = rawJp.replace(reg, (k) => `<ruby class="ruby-clickable" data-word="${k}">${k}<rt>${rubyDict[k]}</rt></ruby>`);

    return (
      <div 
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={(e) => {
          const ruby = e.target.closest('ruby');
          if (ruby) {
            const word = ruby.getAttribute('data-word') || ruby.innerText;
            handleWordClick(e, word);
          } else {
            // speak clicked text or target
            const selection = window.getSelection().toString();
            if (selection) audioManager.speak(selection);
          }
        }}
      />
    );
  };

  return (
    <div>
      {/* Story Selector Header & Level Filtering */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} className="text-primary" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              Biblioteca de Historias Graduadas ({allStories.length})
            </h3>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate && onNavigate('saved')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Ir a Guardados para crear una nueva historia con tus palabras"
          >
            <Sparkles size={14} />
            <span>+ Crear Historia IA</span>
          </button>
        </div>

        {/* Filter Pills and Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Todos', 'N5', 'N4', 'N3', 'Personalizadas'].map((lvl) => {
              const count = 
                lvl === 'Todos' ? allStories.length :
                lvl === 'Personalizadas' ? allStories.filter(s => s.isCustom).length :
                allStories.filter(s => (s.level || s.difficulty) === lvl).length;
              const isActive = storyLevelFilter === lvl;
              return (
                <button
                  key={lvl}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setStoryLevelFilter(lvl)}
                  style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                >
                  {lvl === 'Todos' ? `Todas (${count})` :
                   lvl === 'Personalizadas' ? `✨ Creadas (${count})` :
                   `${lvl} (${count})`}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '4px 10px', gap: 6, minWidth: 220 }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar historia..."
              value={storySearch}
              onChange={(e) => setStorySearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '0.85rem', width: '100%' }}
            />
          </div>
        </div>

        {/* Stories Grid / Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {filteredStories.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.95rem', marginBottom: 10 }}>No se encontraron historias con el filtro seleccionado.</p>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                onClick={() => { setStoryLevelFilter('Todos'); setStorySearch(''); }}
              >
                Ver todas las historias
              </button>
            </div>
          ) : (
            filteredStories.map((s) => {
            const isSelected = s.id === story.id;
            const lvl = s.level || s.difficulty || 'N5';
            const lvlColor = 
              lvl === 'N5' ? '#059669' :
              lvl === 'N4' ? '#2563eb' :
              lvl === 'N3' ? '#d97706' : '#8b5cf6';
            const lvlBg = 
              lvl === 'N5' ? 'rgba(16, 185, 129, 0.12)' :
              lvl === 'N4' ? 'rgba(59, 130, 246, 0.12)' :
              lvl === 'N3' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(139, 92, 246, 0.12)';

            return (
              <div
                key={s.id}
                onClick={() => {
                  setSelectedStoryId(s.id);
                  setCurrentChapter(1);
                  if (onSelectStory) onSelectStory(s.id);
                  if (onParamsChange) onParamsChange({ id: s.id, chapter: 1, mode: readingMode });
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: lvlBg, color: lvlColor }}>
                      {s.isCustom ? '✨ Creada' : lvl}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {s.paragraphs?.length || 1} {s.paragraphs?.length === 1 ? 'capítulo' : 'capítulos'}
                    </span>
                  </div>

                  <h4 className="jp-text" style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                    {s.title}
                  </h4>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                    {s.title_es || s.description || 'Lectura graduada en japonés'}
                  </p>
                </div>

                {s.source_modules && s.source_modules.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', paddingTop: 6, borderTop: '1px dashed var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Módulos:</span>
                    {s.source_modules.map((m) => (
                      <span key={m} style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                        M{m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          }))}
        </div>
      </div>

      {story.isCustom && (
        <div className="custom-story-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} className="text-primary" />
            <div>
              <strong>Historia Personalizada:</strong> Creada a partir de tus palabras guardadas.
              {story.wordsUsed && story.wordsUsed.length > 0 && (
                <span className="words-snippet"> Palabras: {story.wordsUsed.join(', ')}</span>
              )}
            </div>
          </div>
          <button 
            className="btn btn-outline btn-sm" 
            style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
            onClick={async () => {
              const ok = await showConfirm({
                title: '¿Eliminar historia?',
                message: '¿Estás seguro de que deseas eliminar esta historia generada de tu biblioteca?',
                confirmText: 'Eliminar',
                isDestructive: true
              });
              if (ok) {
                const updatedStories = (appState?.savedStories || []).filter(s => s.id !== story.id);
                onUpdateState({ ...appState, savedStories: updatedStories });
                setSelectedStoryId(allStories[0]?.id || null);
              }
            }}
          >
            Eliminar
          </button>
        </div>
      )}

      {/* Active Story Header */}
      <div className="section-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              padding: '2px 8px', 
              borderRadius: 4, 
              background: (story.level || story.difficulty) === 'N5' ? 'rgba(16, 185, 129, 0.15)' : (story.level || story.difficulty) === 'N4' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: (story.level || story.difficulty) === 'N5' ? '#059669' : (story.level || story.difficulty) === 'N4' ? '#2563eb' : '#d97706'
            }}>
              Nivel {story.level || story.difficulty || 'JLPT'}
            </span>
            {story.category && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                • {story.category}
              </span>
            )}
          </div>

          <h2 className="section-title jp-text" style={{ margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📖</span>
            <span>{story.title}</span>
          </h2>

          {story.title_es && (
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
              🇪🇸 {story.title_es}
            </p>
          )}

          {/* Curriculum Modules Links */}
          {story.source_modules && story.source_modules.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                🔗 Módulos del Currículum Asociados:
              </span>
              {story.source_modules.map((modNum) => (
                <Link
                  key={modNum}
                  href={`/curriculum?step=${modNum}`}
                  className="btn btn-outline btn-xs"
                  style={{ fontSize: '0.75rem', padding: '2px 8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  title={`Ver teoría y ejercicios del Módulo ${modNum}`}
                >
                  <span>Módulo {modNum}</span>
                  <ArrowRight size={11} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="tour-info-shortcut-btn"
          onClick={() => {
            if (contextApp?.openTour) {
              contextApp.openTour('story');
            } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
              window.__nihongoOpenTour('story');
            }
          }}
          title="Ver guía de Historias y Generador IA"
          aria-label="Información de Historias"
        >
          <Info size={14} />
          <span>Guía</span>
        </button>
      </div>

      {/* Story Controls Bar */}
      <div className="story-controls">
        <div className="reading-mode-selector">
          <button 
            className={`mode-btn ${readingMode === 'natural' ? 'active' : ''}`}
            onClick={() => {
              setReadingMode('natural');
              if (onParamsChange) onParamsChange({ id: selectedStoryId, chapter: currentChapter, mode: 'natural' });
            }}
          >
            🎌 Kanji + Furigana
          </button>
          <button 
            className={`mode-btn ${readingMode === 'hiragana' ? 'active' : ''}`}
            onClick={() => {
              setReadingMode('hiragana');
              if (onParamsChange) onParamsChange({ id: selectedStoryId, chapter: currentChapter, mode: 'hiragana' });
            }}
          >
            あ Solo Hiragana
          </button>
          <button 
            className={`mode-btn ${readingMode === 'kanji_only' ? 'active' : ''}`}
            onClick={() => {
              setReadingMode('kanji_only');
              if (onParamsChange) onParamsChange({ id: selectedStoryId, chapter: currentChapter, mode: 'kanji_only' });
            }}
          >
            漢 Solo Kanji
          </button>
        </div>

        <button className="btn btn-outline btn-sm" onClick={handlePlayChapter}>
          <Volume2 size={16} />
          <span>Escuchar Capítulo Completo</span>
        </button>
      </div>

      {/* Chapter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {paragraphs.map(p => (
          <button
            key={p.chapter}
            className={`btn ${p.chapter === currentChapter ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => {
              setCurrentChapter(p.chapter);
              setTypingFeedback(null);
              if (onParamsChange) onParamsChange({ id: selectedStoryId, chapter: p.chapter, mode: readingMode });
            }}
          >
            Capítulo {p.chapter}: {p.title?.split(' ')?.[0] || `Capítulo ${p.chapter}`}
          </button>
        ))}
      </div>

      {/* Story Main Reader */}
      <div className={`story-content-box ${readingMode === 'kanji_only' ? 'hide-furigana' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
            Capítulo {chapter.chapter}: {chapter.title}
          </h3>
          <button 
            className="audio-btn" 
            title="Escuchar párrafo" 
            onClick={() => audioManager.speak(chapter.japanese)}
          >
            <Volume2 size={16} />
          </button>
        </div>

        <div className="jp-text" style={{ lineHeight: 2.3, fontSize: '1.35rem' }}>
          {readingMode === 'hiragana' ? (
            <p>{chapter.hiragana}</p>
          ) : (
            renderRubyParagraph(chapter.japanese)
          )}
        </div>

        <details style={{ marginTop: '24px', padding: '14px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <summary style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>
            🇪🇸 Ver traducción en español del Capítulo {chapter.chapter}
          </summary>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            {chapter.translation_es}
          </p>
        </details>
      </div>

      {/* Sentence Breakdown & IME Typing Practice */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔍</span> Desglose Oración por Oración y Práctica de Teclado
          </h3>
        </div>

        {activeSentence && (
          <div className="breakdown-card" style={{ borderLeft: '5px solid var(--primary)' }}>
            <div className="breakdown-header">
              <div className="breakdown-jp jp-text">
                {activeSentence.japanese}
              </div>
              <div className="breakdown-actions">
                <button 
                  className="audio-btn"
                  onClick={() => audioManager.speak(activeSentence.japanese)}
                  title="Escuchar oración"
                >
                  <Volume2 size={16} />
                  <span className="breakdown-audio-label">Escuchar</span>
                </button>
                <SpeechPractice 
                  targetText={activeSentence.japanese} 
                  targetKana={activeSentence.clean_target}
                  onMatch={() => {
                    // Optional XP or celebration
                  }}
                />
                <button
                  type="button"
                  className="audio-btn"
                  onClick={() => {
                    if (contextApp?.openPracticePad) {
                      contextApp.openPracticePad({
                        text: activeSentence.japanese,
                        kana: activeSentence.clean_target,
                        title: `Historia: ${chapter?.title || 'Capítulo ' + chapter?.chapter}`,
                        source: 'story'
                      });
                    } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                      window.__nihongoOpenPracticePad({
                        text: activeSentence.japanese,
                        kana: activeSentence.clean_target,
                        title: `Historia: ${chapter?.title || 'Capítulo ' + chapter?.chapter}`,
                        source: 'story'
                      });
                    }
                  }}
                  title="Practicar caligrafía y trazos de esta oración en Cuaderno"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <PenTool size={16} />
                  <span className="breakdown-audio-label">Escribir ✍️</span>
                </button>
              </div>
            </div>

            <div className="breakdown-translations">
              <div className="trans-item">
                <strong>{activeSentence.translation_es ? '🇪🇸 Traducción:' : '🌐 Significado:'}</strong> {activeSentence.translation_es || activeSentence.spanish || activeSentence.english}
              </div>
            </div>

            {activeSentence.grammar_note && (
              <div className="grammar-note-box">
                <strong>💡 Explicación Gramatical:</strong><br />
                {activeSentence.grammar_note}
              </div>
            )}

            {/* IME Typing Exercise */}
            <div className="typing-box">
              <div className="typing-prompt">
                <span>✍️ Práctica de Escritura con Teclado Japonés:</span>
                <span className="ime-badge">🇯🇵 Teclado IME</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Teclea la oración en japonés con tu teclado. Presiona <strong>Enter</strong> para verificar:
              </p>

              <div className="typing-input-row">
                <input
                  type="text"
                  className="japanese-input jp-text"
                  placeholder="Escribe la frase en romaji (se convertirá a hiragana)..."
                  value={typingInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    const converted = wanakana.toKana(val, { IMEMode: true });
                    setTypingInput(converted);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheckTyping();
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <div className="typing-btn-group">
                  <button className="btn btn-primary" onClick={handleCheckTyping}>
                    Verificar
                  </button>
                  <button className="btn btn-outline" onClick={handleHint}>
                    Pista
                  </button>
                </div>
              </div>

              {typingFeedback && (
                <div className={`typing-feedback ${typingFeedback.type}`}>
                  {typingFeedback.msg}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sentences List for this Chapter */}
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>
            Selecciona una oración para desglosarla ({chapterSentences.length} oraciones):
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chapterSentences.map((s, idx) => {
              const isDone = userState?.completedSentences?.[s.id];
              const isSelected = s.id === selectedSentenceId;

              return (
                <div
                  key={s.id}
                  className="card"
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    background: isSelected ? 'var(--primary-bg)' : 'var(--bg-surface)'
                  }}
                  onClick={() => handleSentenceClick(s)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="jp-text" style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '2px', wordBreak: 'break-word' }}>
                        {idx + 1}. {s.japanese}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', wordBreak: 'break-word' }}>
                        {s.translation_es || s.spanish || s.english}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      {isDone && (
                        <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          ✓ Dominada
                        </span>
                      )}
                      <button
                        className="audio-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioManager.speak(s.japanese);
                        }}
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reading Comprehension Questions */}
      {story?.comprehension_questions && story.comprehension_questions.length > 0 && (
        <ComprehensionQuiz
          questions={story.comprehension_questions}
          appState={appState || userState}
          onUpdateState={onUpdateState}
          title="Preguntas de Comprensión de la Historia"
          subtitle="Demuestra tu comprensión del relato respondiendo estas 3 preguntas de opción múltiple:"
        />
      )}
    </div>
  );
}
