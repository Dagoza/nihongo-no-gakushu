'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Volume2, CheckCircle2, Circle, Search, ArrowLeft, RotateCcw, PenTool, Info, Target, SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import audioManager from '../../lib/audioManager';
import particlesData from '../../data/particles.json';
import * as wanakana from 'wanakana';
import { useApp } from '../../lib/AppContext';
import { SRSRating, reviewCard, ensureFsrsCard } from '../../lib/srs';
import { recordActivity } from '../../lib/storage';

// Lazy loading con code-splitting
const SpeechPractice = dynamic(() => import('../features/SpeechPractice'), { ssr: false });

export const PARTICLE_CATEGORIES = [
  { id: 'all', label: 'Todas', icon: '🌐' },
  { id: 'case', label: 'Casos & Núcleo', icon: '🏷️' },
  { id: 'conjunctive', label: 'Conexión & Condición', icon: '🔀' },
  { id: 'adverbial', label: 'Enfoque & Cantidad', icon: '⚖️' },
  { id: 'sentence_final', label: 'Finales de Oración', icon: '💬' },
  { id: 'compound', label: 'Compuestas (N3-N1)', icon: '🧩' },
];

export const TOP_PARTICLES = ['は', 'が', 'を', 'に', 'で', 'へ', 'も', 'と', 'から', 'まで', 'など', 'ね'];

export const PARTICLE_METADATA = {
  'は': { label: 'Tema principal', category: 'case' },
  'が': { label: 'Sujeto / Cualidad', category: 'case' },
  'を': { label: 'Objeto directo', category: 'case' },
  'に': { label: 'Tiempo / Destino', category: 'case' },
  'へ': { label: 'Dirección', category: 'case' },
  'で': { label: 'Lugar / Medio', category: 'case' },
  'と': { label: 'Compañía / Cita', category: 'case' },
  'より': { label: 'Comparación', category: 'case' },
  'から': { label: 'Origen / Causa', category: 'case' },
  'まで': { label: 'Límite / Hasta', category: 'case' },
  'までに': { label: 'Plazo tope', category: 'case' },
  'から・まで': { label: 'Rango de-hasta', category: 'case' },
  'の': { label: 'Posesión / De', category: 'case' },

  'ので': { label: 'Puesto que (formal)', category: 'conjunctive' },
  'のに': { label: 'A pesar de', category: 'conjunctive' },
  'でも': { label: 'Incluso / O algo', category: 'conjunctive' },
  'ば': { label: 'Si (lógico)', category: 'conjunctive' },
  'たら': { label: 'Si / Cuando', category: 'conjunctive' },
  'なら': { label: 'Si es el caso', category: 'conjunctive' },
  'ても / でも': { label: 'Aunque', category: 'conjunctive' },
  'ながら': { label: 'Simultaneidad', category: 'conjunctive' },
  'し': { label: 'Además de', category: 'conjunctive' },
  'たり〜たり': { label: 'Acciones como', category: 'conjunctive' },
  'か / かどうか': { label: 'Si acaso o no', category: 'conjunctive' },

  'も': { label: 'También / Tampoco', category: 'adverbial' },
  'だけ': { label: 'Solo (límite)', category: 'adverbial' },
  'しか': { label: 'Solo (+ negativo)', category: 'adverbial' },
  'ばかり': { label: 'En exceso / Solo', category: 'adverbial' },
  'たばかり': { label: 'Recién hecho', category: 'adverbial' },
  'ぐらい / くらい': { label: 'Aproximadamente', category: 'adverbial' },
  'ごろ': { label: 'Hacia las (hora)', category: 'adverbial' },
  'ほど': { label: 'Grado / No tanto', category: 'adverbial' },
  'や': { label: 'Lista abierta (y)', category: 'adverbial' },
  'など': { label: 'Etcétera', category: 'adverbial' },

  'か': { label: 'Pregunta / O', category: 'sentence_final' },
  'ね': { label: '¿Verdad? (acuerdo)', category: 'sentence_final' },
  'よ': { label: 'Aserción / Énfasis', category: 'sentence_final' },
  'よね': { label: 'Confirmación mutua', category: 'sentence_final' },

  'とおり（に）': { label: 'Tal como', category: 'compound' },
  'まま': { label: 'Conservando estado', category: 'compound' },
  'ために': { label: 'Propósito / Debido', category: 'compound' },
  'ように': { label: 'Para que / Modo', category: 'compound' },
  'やすい / にくい': { label: 'Fácil / Difícil', category: 'compound' },
  'にとって': { label: 'Para alguien', category: 'compound' },
  'について': { label: 'Acerca de / Sobre', category: 'compound' },
  'に関して': { label: 'En relación con', category: 'compound' },
  'に対して': { label: 'Frente a / Hacia', category: 'compound' },
  'によって': { label: 'Por / Dependiendo', category: 'compound' },
  'を通じて / を通して': { label: 'A través de', category: 'compound' },
  'をはじめ': { label: 'Empezando por', category: 'compound' },
  'を中心に': { label: 'Como eje central', category: 'compound' },
  'をこめて': { label: 'Con todo cariño', category: 'compound' },
  'にかけて': { label: 'Extendiéndose hasta', category: 'compound' },
  'にわたって': { label: 'Abarcando todo', category: 'compound' },
  'おかげで': { label: 'Gracias a', category: 'compound' },
  'せいで': { label: 'Por culpa de', category: 'compound' },
  'たびに': { label: 'Cada vez que', category: 'compound' },
  'ついでに': { label: 'De paso', category: 'compound' },
  '最中に': { label: 'En medio de', category: 'compound' },
  'うちに': { label: 'Mientras / Antes', category: 'compound' },
  '向け': { label: 'Dirigido a', category: 'compound' },
  '向き': { label: 'Adecuado para', category: 'compound' },
  'っぽい': { label: 'Parecido a', category: 'compound' },
  'として': { label: 'En calidad de', category: 'compound' },
  'わりに（は）': { label: 'Para ser / A pesar', category: 'compound' },
  'にこたえて': { label: 'En respuesta a', category: 'compound' },
  'に基づいて': { label: 'Basado en', category: 'compound' },
  'に沿って': { label: 'Siguiendo norma', category: 'compound' },
  'のもとで': { label: 'Bajo tutela de', category: 'compound' },
  'を契機に': { label: 'Como detonante', category: 'compound' },
  'を問わず': { label: 'Sin distinción de', category: 'compound' },
  'にかかわらず': { label: 'Sin importar si', category: 'compound' },
  'のみならず': { label: 'No solo... sino', category: 'compound' },
  'はおろか': { label: 'Ni hablar de', category: 'compound' },
  'を余儀なくされる': { label: 'Forzado a', category: 'compound' },
  'たるもの': { label: 'Propio de su rango', category: 'compound' },
  'ならでは': { label: 'Exclusivo y singular', category: 'compound' }
};

export const getCategoryForEntry = (p) => {
  const symbol = p.particle;
  const role = (p.role_es || '').toLowerCase();
  
  if (symbol === 'から' && (role.includes('causa') || role.includes('motivo') || role.includes('porque'))) return 'conjunctive';
  if (symbol === 'が' && (role.includes('adversativa') || role.includes('pero') || role.includes('sin embargo') || role.includes('conjunción'))) return 'conjunctive';
  if (symbol === 'か' && role.includes('alternativa')) return 'sentence_final';
  
  const caseList = ['は', 'が', 'を', 'に', 'へ', 'で', 'と', 'より', 'から', 'まで', 'までに', 'から・まで', 'の'];
  const finalSymbols = ['か', 'ね', 'よ', 'よね'];
  const adverbialSymbols = ['も', 'だけ', 'しか', 'ばかり', 'たばかり', 'ぐらい / くらい', 'ごろ', 'ほど', 'や', 'など'];
  const conjunctiveSymbols = ['ので', 'のに', 'でも', 'ば', 'たら', 'なら', 'ても / でも', 'ながら', 'し', 'たり〜たり', 'か / かどうか'];
  
  if (finalSymbols.includes(symbol)) return 'sentence_final';
  if (conjunctiveSymbols.includes(symbol)) return 'conjunctive';
  if (caseList.includes(symbol) && (p.level === 'N5' || !p.level)) return 'case';
  if (adverbialSymbols.includes(symbol)) return 'adverbial';
  
  return 'compound';
};

export default function GrammarTab({ 
  appState, 
  onUpdateState,
  initialParticle = null,
  initialSearch = null,
  initialQuiz = false,
  initialLevel = null,
  onParamsChange
}) {
  const contextApp = useApp();

  const [levelFilter, setLevelFilter] = useState(initialLevel || 'all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [filterParticle, setFilterParticle] = useState(initialParticle || 'all');
  const [showAllParticles, setShowAllParticles] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'mastered'
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterStatus !== 'all') count++;
    if (levelFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (filterParticle !== 'all') count++;
    return count;
  }, [filterStatus, levelFilter, categoryFilter, filterParticle]);

  const handleResetFilters = () => {
    setFilterStatus('all');
    setLevelFilter('all');
    setCategoryFilter('all');
    setFilterParticle('all');
    updateParams('all', searchTerm, quizActive, 'all');
  };
  const [quizActive, setQuizActive] = useState(!!initialQuiz);
  const [quizFilter, setQuizFilter] = useState('all'); // 'all' | 'pending'
  const [quizLevelFilter, setQuizLevelFilter] = useState(initialLevel || 'all'); // 'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null); // { selected, isCorrect, correct, sentence, role }
  const [imeInput, setImeInput] = useState('');
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (initialLevel) {
      setLevelFilter(initialLevel);
      setQuizLevelFilter(initialLevel);
    }
  }, [initialLevel]);

  useEffect(() => {
    if (initialParticle) {
      setFilterParticle(initialParticle);
      const meta = PARTICLE_METADATA[initialParticle];
      if (meta && meta.category) {
        setCategoryFilter(meta.category);
      }
    }
  }, [initialParticle]);

  useEffect(() => {
    if (initialSearch !== null && initialSearch !== undefined) setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialQuiz !== undefined) setQuizActive(!!initialQuiz);
  }, [initialQuiz]);

  const updateParams = (newP, newSearch, newQuiz, newLevel) => {
    if (onParamsChange) {
      onParamsChange({
        particle: newP !== undefined ? newP : filterParticle,
        search: newSearch !== undefined ? newSearch : searchTerm,
        quiz: newQuiz !== undefined ? newQuiz : quizActive,
        level: newLevel !== undefined ? newLevel : levelFilter
      });
    }
  };

  const [visibleCount, setVisibleCount] = useState(30);

  // Progressive Disclosure: Examples toggle per particle
  const [expandedExamples, setExpandedExamples] = useState({});
  const toggleExpandExamples = (id) => {
    setExpandedExamples(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setVisibleCount(30);
  }, [levelFilter, categoryFilter, filterParticle, filterStatus, searchTerm]);

  const levelCounts = useMemo(() => {
    const counts = { all: particlesData.length, N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
    particlesData.forEach(p => {
      const lvl = p.level || 'N5';
      if (counts[lvl] !== undefined) counts[lvl]++;
    });
    return counts;
  }, [particlesData]);

  // Counts of unique particles per category under currently active level filter
  const categoryCounts = useMemo(() => {
    const pool = levelFilter === 'all'
      ? particlesData
      : particlesData.filter(p => (p.level || 'N5') === levelFilter);
    
    const sets = {
      all: new Set(),
      case: new Set(),
      conjunctive: new Set(),
      adverbial: new Set(),
      sentence_final: new Set(),
      compound: new Set()
    };

    pool.forEach(p => {
      sets.all.add(p.particle);
      const cat = getCategoryForEntry(p);
      if (sets[cat]) sets[cat].add(p.particle);
    });

    return {
      all: sets.all.size,
      case: sets.case.size,
      conjunctive: sets.conjunctive.size,
      adverbial: sets.adverbial.size,
      sentence_final: sets.sentence_final.size,
      compound: sets.compound.size,
    };
  }, [particlesData, levelFilter]);

  // Auto-reset category filter if currently selected category has 0 particles in new level
  useEffect(() => {
    if (categoryFilter !== 'all' && categoryCounts[categoryFilter] === 0) {
      setCategoryFilter('all');
    }
  }, [categoryCounts, categoryFilter]);

  // Visible particles for the chips row based on category and expansion state
  const visibleParticles = useMemo(() => {
    const pool = levelFilter === 'all'
      ? particlesData
      : particlesData.filter(p => (p.level || 'N5') === levelFilter);

    const symbols = new Set();
    pool.forEach(p => {
      if (categoryFilter === 'all' || getCategoryForEntry(p) === categoryFilter) {
        symbols.add(p.particle);
      }
    });

    // If viewing 'all' and not expanded: show TOP_PARTICLES plus active filterParticle if not in top list
    if (categoryFilter === 'all' && !showAllParticles) {
      const top = TOP_PARTICLES.filter(tp => symbols.has(tp));
      if (filterParticle !== 'all' && !top.includes(filterParticle) && symbols.has(filterParticle)) {
        top.push(filterParticle);
      }
      return top;
    }

    return Array.from(symbols);
  }, [particlesData, levelFilter, categoryFilter, showAllParticles, filterParticle]);

  const getLevelBadgeStyle = (level) => {
    switch (level) {
      case 'N5':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#059669', borderColor: 'rgba(16, 185, 129, 0.3)' };
      case 'N4':
        return { background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', borderColor: 'rgba(59, 130, 246, 0.3)' };
      case 'N3':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', borderColor: 'rgba(245, 158, 11, 0.3)' };
      case 'N2':
        return { background: 'rgba(139, 92, 246, 0.15)', color: '#7c3aed', borderColor: 'rgba(139, 92, 246, 0.3)' };
      case 'N1':
        return { background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { background: 'var(--primary-bg, rgba(59, 130, 246, 0.1))', color: 'var(--primary)', borderColor: 'rgba(59, 130, 246, 0.2)' };
    }
  };

  const filteredParticles = useMemo(() => {
    return particlesData.filter(p => {
      const isMastered = !!appState.masteredParticles?.[p.id];
      if (filterStatus === 'mastered' && !isMastered) return false;
      if (filterStatus === 'pending' && isMastered) return false;

      const pLevel = p.level || 'N5';
      if (levelFilter !== 'all' && pLevel !== levelFilter) return false;

      if (categoryFilter !== 'all') {
        const pCat = getCategoryForEntry(p);
        if (pCat !== categoryFilter) return false;
      }

      const matchFilter = filterParticle === 'all' || p.particle === filterParticle;
      const search = searchTerm.trim().toLowerCase();
      if (!search) return matchFilter;

      const matchParticle = p.particle.toLowerCase().includes(search);
      const matchRoleEs = p.role_es && p.role_es.toLowerCase().includes(search);
      const matchRoleEn = p.role_en && p.role_en.toLowerCase().includes(search);
      const matchFormula = p.formula && p.formula.toLowerCase().includes(search);
      const matchExamples = p.examples && p.examples.some(ex => {
        const ja = typeof ex === 'string' ? ex : (ex.ja || '');
        const es = typeof ex === 'string' ? '' : (ex.es || '');
        const romaji = typeof ex === 'string' ? '' : (ex.romaji || '');
        return ja.toLowerCase().includes(search) || es.toLowerCase().includes(search) || romaji.toLowerCase().includes(search);
      });

      return matchFilter && (matchParticle || matchRoleEs || matchRoleEn || matchFormula || matchExamples);
    });
  }, [particlesData, levelFilter, categoryFilter, filterParticle, filterStatus, searchTerm, appState.masteredParticles]);

  const masteredCount = particlesData.filter(p => !!appState.masteredParticles?.[p.id]).length;
  const pendingCount = particlesData.length - masteredCount;
  const progressPercent = Math.round((masteredCount / Math.max(1, particlesData.length)) * 100);

  const toggleParticleMastery = (id) => {
    const isMastered = !!appState.masteredParticles?.[id];
    const newMastered = {
      ...(appState.masteredParticles || {}),
      [id]: !isMastered
    };
    onUpdateState({
      ...appState,
      masteredParticles: newMastered
    });
  };

  // Compile quiz questions from particle quiz_items with level filtering
  const quizQuestions = useMemo(() => {
    const questions = [];
    particlesData.forEach(p => {
      const isMastered = !!appState.masteredParticles?.[p.id];
      if (quizFilter === 'pending' && isMastered) return;

      const pLevel = p.level || 'N5';
      if (quizLevelFilter !== 'all' && pLevel !== quizLevelFilter) return;

      if (p.quiz_items && p.quiz_items.length > 0) {
        p.quiz_items.forEach(q => {
          questions.push({
            ...q,
            particleLevel: pLevel,
            particleRole: p.role_es,
            particleName: p.particle,
            particleId: p.id
          });
        });
      }
    });
    return questions.sort(() => 0.5 - Math.random());
  }, [quizActive, particlesData, quizFilter, quizLevelFilter, appState.masteredParticles]);

  const currentQuiz = quizQuestions[quizIndex];

  const handleAnswerQuiz = (selected) => {
    if (!currentQuiz || quizFeedback) return;
    const isCorrect = selected === currentQuiz.correct;
    setQuizFeedback({
      selected,
      isCorrect,
      correct: currentQuiz.correct,
      sentence: currentQuiz.sentence,
      role: currentQuiz.particleRole
    });

    const exId = `PARTICLE-${currentQuiz.particleName}-${currentQuiz.sentence.slice(0, 10)}`;
    const rating = isCorrect ? SRSRating.GOOD : SRSRating.AGAIN;
    
    // Actualizar tarjeta FSRS para esta partícula
    const currentParticleCard = appState.masteredParticles?.[currentQuiz.particleName];
    const newParticleCard = reviewCard(ensureFsrsCard(currentParticleCard), rating);

    // Actualizar tarjeta FSRS para esta pregunta específica
    const currentQuestionCard = appState.srsQuestions?.[exId];
    const newQuestionCard = reviewCard(ensureFsrsCard(currentQuestionCard), rating);

    const updatedState = {
      ...appState,
      masteredParticles: {
        ...(appState.masteredParticles || {}),
        [currentQuiz.particleName]: newParticleCard
      },
      srsQuestions: {
        ...(appState.srsQuestions || {}),
        [exId]: newQuestionCard
      },
      completedExercises: {
        ...(appState.completedExercises || {}),
        [exId]: true
      }
    };

    const finalState = recordActivity(updatedState, isCorrect);
    onUpdateState(finalState);

    if (isCorrect) {
      audioManager.speak(currentQuiz.sentence);
    }

    setTimeout(() => {
      setQuizFeedback(null);
      setImeInput('');
      setQuizIndex((prev) => prev + 1);
    }, 2200);
  };

  const highlightParticle = (sentence, particle) => {
    if (!sentence) return '';
    const pClean = particle.split('・')[0];
    const parts = sentence.split(pClean);
    if (parts.length === 1) return sentence;

    return parts.reduce((acc, part, i) => {
      if (i === 0) return [part];
      return [
        ...acc,
        <span key={i} className="particle-highlight">
          {pClean}
        </span>,
        part
      ];
    }, []);
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="module-hero-card">
        <div className="module-hero-content">
          <div className="module-hero-title-row">
            <div 
              className="module-hero-icon-badge" 
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
            >
              <Target size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <span className="module-category-pill" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.12)' }}>
                  Recursos & Práctica
                </span>
                <button
                  type="button"
                  className="tour-info-shortcut-btn"
                  onClick={() => {
                    if (contextApp?.openTour) {
                      contextApp.openTour('particles');
                    } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
                      window.__nihongoOpenTour('particles');
                    }
                  }}
                  title="Ver guía y explicación de Partículas y Gramática"
                  aria-label="Información de Partículas"
                >
                  <Info size={14} />
                  <span>Guía</span>
                </button>
              </div>
              <h1 className="module-hero-title">Partículas y Gramática</h1>
              <p className="module-hero-subtitle">
                Guía interactiva de partículas y estructuras gramaticales con explicaciones funcionales, oraciones de ejemplo y modo quiz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {!quizActive ? (
        <div>
          {/* Progress Overview Card */}
          <div className="card grammar-progress-card" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, minWidth: 0, maxWidth: '100%' }}>
            <div style={{ flex: 1, minWidth: 220, maxWidth: '100%' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                Progreso del Checklist: <span style={{ color: 'var(--primary)' }}>{masteredCount} de {particlesData.length} dominadas</span> ({progressPercent}%)
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Marca las casillas conforme comprendas cada función y pon a prueba tu dominio en el Quiz.
              </div>
              <div style={{ width: '100%', maxWidth: 280, height: 8, background: 'var(--border)', borderRadius: 999, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.4s' }} />
              </div>
            </div>

            <button 
              className="btn btn-accent btn-lg grammar-quiz-btn"
              onClick={() => {
                setQuizIndex(0);
                setQuizFeedback(null);
                setQuizActive(true);
                updateParams(filterParticle, searchTerm, true, levelFilter);
              }}
            >
              ⚡ Iniciar Quiz de Partículas
            </button>
          </div>

          {/* Search Bar & Botón de Filtros */}
          <div className="vocab-filter-bar" style={{ marginBottom: 12 }}>
            <div className="filter-search-row">
              <div className="filter-input-wrapper">
                <Search size={18} className="filter-search-icon" />
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ paddingLeft: 38, width: '100%' }}
                  placeholder="Buscar función, fórmula, ejemplo o traducción..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    updateParams(filterParticle, e.target.value, quizActive, levelFilter);
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      updateParams(filterParticle, '', quizActive, levelFilter);
                    }}
                    aria-label="Limpiar búsqueda"
                    className="clear-search-btn"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'} filter-toggle-btn`}
                onClick={() => setShowFilters(prev => !prev)}
                aria-expanded={showFilters}
                title={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              >
                <SlidersHorizontal size={15} />
                <span className="filter-toggle-text">Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="filter-toggle-badge">
                    {activeFilterCount}
                  </span>
                )}
                <span className="filter-toggle-chevron">
                  {showFilters ? <ChevronUp size={13} style={{ marginLeft: 2 }} /> : <ChevronDown size={13} style={{ marginLeft: 2 }} />}
                </span>
              </button>
            </div>
          </div>

          {/* Filtros Integrados (Colapsable) */}
          {showFilters && (
            <div className="card filter-card-animated" style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeFilterCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {activeFilterCount} {activeFilterCount === 1 ? 'filtro activo' : 'filtros activos'}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '2px 4px'
                    }}
                  >
                    Limpiar todos
                  </button>
                </div>
              )}

              {/* Filtro de Estado */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Estado:
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { id: 'all', label: `Todas (${particlesData.length})` },
                    { id: 'pending', label: `Por aprender (${pendingCount})` },
                    { id: 'mastered', label: `Dominadas (${masteredCount})` }
                  ].map(st => (
                    <button
                      key={st.id}
                      className={`btn ${filterStatus === st.id ? 'btn-primary' : 'btn-outline'} btn-xs`}
                      onClick={() => setFilterStatus(st.id)}
                      style={{ fontSize: '0.8rem', padding: '4px 10px', height: 'auto' }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Nivel JLPT */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Nivel JLPT:
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  {['all', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => {
                    const count = levelCounts[lvl] || 0;
                    const isActive = levelFilter === lvl;
                    const badgeStyle = lvl !== 'all' ? getLevelBadgeStyle(lvl) : null;
                    return (
                      <button
                        key={lvl}
                        className={`btn ${isActive ? 'btn-primary' : 'btn-outline'} btn-xs`}
                        style={{
                          minWidth: 44,
                          padding: '4px 10px',
                          ...(isActive && badgeStyle ? { background: badgeStyle.color, borderColor: badgeStyle.color, color: '#fff' } : {})
                        }}
                        onClick={() => {
                          setLevelFilter(lvl);
                          const pool = lvl === 'all' ? particlesData : particlesData.filter(p => (p.level || 'N5') === lvl);
                          const hasCurrent = pool.some(p => p.particle === filterParticle);
                          const nextPart = hasCurrent ? filterParticle : 'all';
                          if (nextPart !== filterParticle) {
                            setFilterParticle('all');
                          }
                          updateParams(nextPart, searchTerm, quizActive, lvl);
                        }}
                      >
                        {lvl === 'all' ? `Todas (${count})` : `${lvl} (${count})`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hub de Categorías y Partículas */}
              <div className="particle-filter-hub" style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                {/* Category Selection Row */}
                <div className="particle-category-row">
                  <span className="particle-filter-label">Categoría:</span>
                  {PARTICLE_CATEGORIES.map((cat) => {
                    const count = categoryCounts[cat.id] || 0;
                    const isActive = categoryFilter === cat.id;
                    const isDisabled = count === 0 && cat.id !== 'all';

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        disabled={isDisabled}
                        className={`particle-category-pill ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => {
                          setCategoryFilter(cat.id);
                          if (cat.id !== 'all' && filterParticle !== 'all') {
                            const meta = PARTICLE_METADATA[filterParticle];
                            if (!meta || meta.category !== cat.id) {
                              setFilterParticle('all');
                              updateParams('all', searchTerm, quizActive, levelFilter);
                            }
                          }
                        }}
                        title={isDisabled ? 'No hay partículas en este nivel JLPT' : `${cat.label} (${count})`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                        <span className="particle-category-count">{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Particle Chips Row */}
                <div className="particle-chips-section">
                  <div className="particle-chips-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="particle-filter-label">
                        {categoryFilter === 'all'
                          ? (!showAllParticles ? 'Partículas frecuentes:' : 'Todas las partículas:')
                          : `Partículas de ${PARTICLE_CATEGORIES.find(c => c.id === categoryFilter)?.label}:`}
                      </span>
                      {filterParticle !== 'all' && (
                        <button
                          type="button"
                          className="btn btn-xs btn-outline"
                          style={{ padding: '2px 8px', fontSize: '0.75rem', height: 'auto', borderRadius: 999 }}
                          onClick={() => {
                            setFilterParticle('all');
                            updateParams('all', searchTerm, quizActive, levelFilter);
                          }}
                        >
                          ✕ Ver todas ({categoryFilter === 'all' ? 'este nivel' : 'esta categoría'})
                        </button>
                      )}
                    </div>

                    {categoryFilter === 'all' && categoryCounts.all > TOP_PARTICLES.length && (
                      <button
                        type="button"
                        className="particle-toggle-expand-btn"
                        onClick={() => setShowAllParticles(!showAllParticles)}
                      >
                        {showAllParticles ? (
                          <>▴ Mostrar menos (Top 12)</>
                        ) : (
                          <>▾ Ver todas ({categoryCounts.all})</>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="particle-chips-grid">
                    <button
                      type="button"
                      className={`particle-chip-btn ${filterParticle === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        setFilterParticle('all');
                        updateParams('all', searchTerm, quizActive, levelFilter);
                      }}
                      title="Mostrar todas las partículas de la categoría seleccionada"
                    >
                      <span className="particle-chip-symbol">Todas</span>
                      <span className="particle-chip-label">({visibleParticles.length})</span>
                    </button>

                    {visibleParticles.map((p) => {
                      const isSelected = filterParticle === p;
                      const meta = PARTICLE_METADATA[p];

                      return (
                        <button
                          key={p}
                          type="button"
                          className={`particle-chip-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            const nextP = isSelected ? 'all' : p;
                            setFilterParticle(nextP);
                            updateParams(nextP, searchTerm, quizActive, levelFilter);
                          }}
                          title={meta ? `${p} — ${meta.label}` : p}
                        >
                          <span className="particle-chip-symbol jp-text">{p}</span>
                          {meta?.label && (
                            <span className="particle-chip-label">{meta.label}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results count indicator */}
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span>Mostrando <strong>{filteredParticles.length}</strong> de {particlesData.length} tarjetas</span>
            {levelFilter !== 'all' && (
              <span 
                className="particle-level-tag" 
                style={{ ...getLevelBadgeStyle(levelFilter), borderWidth: 1, borderStyle: 'solid' }}
              >
                Nivel {levelFilter}
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span 
                className="badge badge-subtle"
                style={{ background: 'var(--primary-bg)', color: 'var(--primary)', borderColor: 'rgba(99, 102, 241, 0.2)', padding: '2px 8px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}
              >
                {PARTICLE_CATEGORIES.find(c => c.id === categoryFilter)?.icon} {PARTICLE_CATEGORIES.find(c => c.id === categoryFilter)?.label}
              </span>
            )}
            {filterParticle !== 'all' && <span>• Partícula: <strong className="jp-text">{filterParticle}</strong></span>}
            {filterStatus !== 'all' && <span>• {filterStatus === 'mastered' ? 'Dominadas' : 'Por aprender'}</span>}
            {searchTerm.trim() && <span>• Búsqueda: &quot;{searchTerm.trim()}&quot;</span>}

            {(categoryFilter !== 'all' || filterParticle !== 'all' || levelFilter !== 'all' || filterStatus !== 'all' || searchTerm.trim()) && (
              <button 
                type="button" 
                className="btn btn-xs btn-outline" 
                style={{ marginLeft: 'auto', fontSize: '0.78rem', padding: '3px 8px', height: 'auto' }}
                onClick={() => {
                  setLevelFilter('all');
                  setCategoryFilter('all');
                  setFilterParticle('all');
                  setFilterStatus('all');
                  setSearchTerm('');
                  setShowAllParticles(false);
                  updateParams('all', '', quizActive, 'all');
                }}
              >
                Restablecer filtros
              </button>
            )}
          </div>

          {/* Particles Grid */}
          <div className="particles-grid">
            {filteredParticles.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1rem', marginBottom: 12 }}>No se encontraron partículas con los filtros seleccionados.</p>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  onClick={() => {
                    setLevelFilter('all');
                    setCategoryFilter('all');
                    setFilterParticle('all');
                    setFilterStatus('all');
                    setSearchTerm('');
                    setShowAllParticles(false);
                    updateParams('all', '', quizActive, 'all');
                  }}
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              filteredParticles.slice(0, visibleCount).map((p) => {
                const isMastered = !!appState.masteredParticles?.[p.id];
                const pLevel = p.level || 'N5';
                return (
                  <div 
                    key={p.id}
                    className={`particle-card ${isMastered ? 'mastered' : ''}`}
                  >
                  {/* Card Header */}
                  <div className="particle-header">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                      <div className="particle-symbol jp-text">
                        {p.particle}
                      </div>
                      <div className="particle-role">
                        <div className="particle-meta">
                          <span 
                            className="particle-level-tag"
                            style={{
                              ...getLevelBadgeStyle(pLevel),
                              borderWidth: 1,
                              borderStyle: 'solid'
                            }}
                          >
                            {pLevel}
                          </span>
                          <span className="particle-role-en">{p.role_en}</span>
                        </div>
                        <h4 className="particle-role-title">{p.role_es || 'Función gramatical'}</h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`particle-master-btn ${isMastered ? 'mastered' : ''}`}
                      onClick={() => toggleParticleMastery(p.id)}
                      title={isMastered ? "Marcar como por aprender" : "Marcar como dominada"}
                    >
                      {isMastered ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      <span>{isMastered ? 'Dominada' : 'Aprender'}</span>
                    </button>
                  </div>

                  {/* Grammar Formula / Structure */}
                  {p.formula && (
                    <div className="particle-formula-box">
                      <span className="particle-formula-tag">Fórmula</span>
                      <span className="particle-formula-code jp-text">{p.formula}</span>
                    </div>
                  )}

                  {/* Examples Section with Progressive Disclosure */}
                  {p.examples && p.examples.length > 0 && (() => {
                    const isExpanded = Boolean(expandedExamples[p.id]);
                    const displayExamples = isExpanded || p.examples.length <= 2 ? p.examples : p.examples.slice(0, 2);
                    const remainingCount = p.examples.length - 2;

                    return (
                      <div className="particle-examples-section">
                        <div className="particle-examples-header">
                          <span>Ejemplos de uso ({p.examples.length})</span>
                          {p.examples.length > 2 && (
                            <button
                              type="button"
                              onClick={() => toggleExpandExamples(p.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--primary)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}
                            >
                              {isExpanded ? 'Ver menos' : `+ Ver ${remainingCount} más`}
                            </button>
                          )}
                        </div>

                        <div className="particle-examples-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {displayExamples.map((ex, idx) => {
                            const exJa = typeof ex === 'string' ? ex : ex.ja;
                            const exRomaji = typeof ex === 'string' ? '' : ex.romaji;
                            const exEs = typeof ex === 'string' ? '' : ex.es;

                            return (
                              <div key={idx} className="particle-example-card">
                                <div className="particle-example-main">
                                  <div className="jp-text particle-example-sentence">
                                    {highlightParticle(exJa, p.particle)}
                                  </div>
                                  <div className="particle-example-actions">
                                    <button 
                                      type="button"
                                      className="audio-btn" 
                                      onClick={() => audioManager.speak(exJa)}
                                      title="Escuchar pronunciación nativa"
                                    >
                                      <Volume2 size={15} />
                                    </button>
                                    <SpeechPractice 
                                      targetText={exJa} 
                                      targetKana={wanakana.toKana(exRomaji || '')}
                                      compact={true} 
                                    />
                                    <button 
                                      type="button"
                                      className="audio-btn" 
                                      onClick={() => {
                                        if (contextApp?.openPracticePad) {
                                          contextApp.openPracticePad({
                                            text: exJa,
                                            kana: wanakana.toKana(exRomaji || ''),
                                            title: `Gramática: Partícula ${p.particle}`,
                                            source: 'grammar'
                                          });
                                        } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                                          window.__nihongoOpenPracticePad({
                                            text: exJa,
                                            kana: wanakana.toKana(exRomaji || ''),
                                            title: `Gramática: Partícula ${p.particle}`,
                                            source: 'grammar'
                                          });
                                        }
                                      }}
                                      title="Practicar caligrafía y trazos de este ejemplo en Cuaderno"
                                    >
                                      <PenTool size={15} />
                                    </button>
                                  </div>
                                </div>

                                {exRomaji && (
                                  <div className="particle-example-romaji">
                                    {exRomaji}
                                  </div>
                                )}

                                {exEs && (
                                  <div className="particle-example-trans">
                                    <span style={{ opacity: 0.8, marginRight: 4 }}>🇪🇸</span>
                                    <span>{exEs}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            }))}
          </div>

          {visibleCount < filteredParticles.length && (
            <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 20 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setVisibleCount((prev) => prev + 30)}
                style={{ padding: '10px 24px', fontWeight: 600 }}
              >
                Mostrar más partículas ({filteredParticles.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* QUIZ MODE */
        <div className="quiz-container" style={{ maxWidth: 700 }}>
          {currentQuiz ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setQuizActive(false);
                    updateParams(filterParticle, searchTerm, false, levelFilter);
                  }}
                >
                  <ArrowLeft size={16} /> Volver al Checklist
                </button>

                {/* Level Filter for Quiz */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-main)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nivel:</span>
                  {['all', 'N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
                    <button
                      key={lvl}
                      className={`btn btn-sm ${quizLevelFilter === lvl ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => { setQuizLevelFilter(lvl); setQuizIndex(0); setQuizFeedback(null); }}
                      style={{ fontSize: '0.78rem', padding: '3px 7px', height: 'auto' }}
                    >
                      {lvl === 'all' ? 'Todos' : lvl}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-main)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Preguntas:</span>
                  <button
                    className={`btn btn-sm ${quizFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setQuizFilter('all'); setQuizIndex(0); setQuizFeedback(null); }}
                    style={{ fontSize: '0.78rem', padding: '3px 8px', height: 'auto' }}
                  >
                    Todas
                  </button>
                  <button
                    className={`btn btn-sm ${quizFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setQuizFilter('pending'); setQuizIndex(0); setQuizFeedback(null); }}
                    style={{ fontSize: '0.78rem', padding: '3px 8px', height: 'auto' }}
                  >
                    Por aprender ({pendingCount})
                  </button>
                </div>

                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Pregunta {quizIndex + 1} de {quizQuestions.length}
                </span>
              </div>

              <div className="quiz-question-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span 
                    className="particle-level-tag" 
                    style={{ 
                      ...getLevelBadgeStyle(currentQuiz.particleLevel || 'N5'),
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      borderWidth: 1,
                      borderStyle: 'solid'
                    }}
                  >
                    {currentQuiz.particleLevel || 'N5'}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    Función: {currentQuiz.particleRole}
                  </span>
                </div>

                <div className="quiz-sentence jp-text" style={{ fontSize: '1.5rem', lineHeight: 2 }}>
                  {currentQuiz.masked}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: 10 }}>
                  ¿Qué partícula encaja correctamente en el espacio para completar la oración?
                </p>
              </div>

              {/* 4 Options Grid */}
              <div className="quiz-options-grid">
                {currentQuiz.options.map((opt) => {
                  let btnClass = 'quiz-option-btn jp-text';
                  if (quizFeedback) {
                    if (opt === currentQuiz.correct) btnClass += ' correct';
                    else if (opt === quizFeedback.selected && !quizFeedback.isCorrect) btnClass += ' wrong';
                  }

                  return (
                    <button
                      key={opt}
                      className={btnClass}
                      onClick={() => handleAnswerQuiz(opt)}
                      disabled={!!quizFeedback}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* IME Input Option */}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  O teclea la partícula directamente con tu teclado japonés IME:
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="text" 
                    className="japanese-input jp-text" 
                    placeholder="Escribe la partícula en romaji (ej. wa, o, ni)..."
                    value={imeInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      const converted = wanakana.toKana(val, { IMEMode: true });
                      setImeInput(converted);
                    }}
                    onCompositionStart={() => { isComposingRef.current = true; }}
                    onCompositionEnd={() => { isComposingRef.current = false; }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isComposingRef.current && imeInput.trim()) {
                        handleAnswerQuiz(imeInput.trim());
                      }
                    }}
                    style={{ fontSize: '1.1rem', padding: '8px 12px' }}
                    disabled={!!quizFeedback}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={() => imeInput.trim() && handleAnswerQuiz(imeInput.trim())}
                    disabled={!imeInput.trim() || !!quizFeedback}
                  >
                    Validar
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {quizFeedback && (
                <div 
                  style={{ 
                    marginTop: 18, 
                    padding: '14px 18px', 
                    borderRadius: 'var(--radius-md)',
                    background: quizFeedback.isCorrect ? 'var(--success-bg)' : 'var(--danger-bg)',
                    border: `1px solid ${quizFeedback.isCorrect ? 'var(--success)' : 'var(--danger)'}`
                  }}
                >
                  <div style={{ fontWeight: 700, color: quizFeedback.isCorrect ? 'var(--success)' : 'var(--danger)', marginBottom: 4 }}>
                    {quizFeedback.isCorrect ? `🎉 ¡Correcto! (+15 XP) Partícula: ${quizFeedback.correct}` : `❌ Incorrecto. La partícula correcta es: ${quizFeedback.correct} (${quizFeedback.role})`}
                  </div>
                  <div className="jp-text" style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>{quizFeedback.sentence}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button 
                        type="button"
                        className="audio-btn" 
                        style={{ width: 28, height: 28 }}
                        onClick={() => audioManager.speak(quizFeedback.sentence)}
                        title="Escuchar oración completa"
                      >
                        <Volume2 size={14} />
                      </button>
                      <SpeechPractice 
                        targetText={quizFeedback.sentence} 
                        compact={true} 
                      />
                      <button 
                        type="button"
                        className="audio-btn" 
                        style={{ width: 28, height: 28 }}
                        onClick={() => {
                          if (contextApp?.openPracticePad) {
                            contextApp.openPracticePad({
                              text: quizFeedback.sentence,
                              title: `Gramática: ${quizFeedback.role || 'Práctica'}`,
                              source: 'grammar'
                            });
                          } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                            window.__nihongoOpenPracticePad({
                              text: quizFeedback.sentence,
                              title: `Gramática: ${quizFeedback.role || 'Práctica'}`,
                              source: 'grammar'
                            });
                          }
                        }}
                        title="Practicar caligrafía y trazos de esta oración en Cuaderno"
                      >
                        <PenTool size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed View */
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12 }}>
                ¡Quiz de Partículas Completado!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 24 }}>
                Has repasado las partículas fundamentales. Tu racha se mantiene y has ganado puntos de experiencia.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setQuizIndex(0);
                    setQuizFeedback(null);
                  }}
                >
                  <RotateCcw size={16} /> Repetir Quiz
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setQuizActive(false);
                    updateParams(filterParticle, searchTerm, false, levelFilter);
                  }}
                >
                  Volver al Checklist
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
