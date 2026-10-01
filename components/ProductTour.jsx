'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  Flame, 
  Star, 
  CheckCircle2, 
  BookOpen, 
  Keyboard, 
  Compass, 
  MessageSquare, 
  Tv, 
  Layers, 
  Target, 
  Languages, 
  FileText, 
  BookmarkCheck, 
  Volume2, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Eye, 
  EyeOff, 
  Lightbulb, 
  Check, 
  ExternalLink, 
  RotateCcw, 
  Mic, 
  Award, 
  ShieldCheck, 
  CloudCheck, 
  Bell,
  VolumeX,
  ArrowRight,
  PenTool
} from 'lucide-react';
import * as wanakana from 'wanakana';
import audioManager from '../lib/audioManager';

export default function ProductTour({ 
  isOpen, 
  onClose, 
  onSkip, 
  onComplete, 
  onNavigate 
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleGlobalOpen = () => {
      setInternalOpen(true);
    };
    if (typeof window !== 'undefined') {
      window.__nihongoOpenTour = handleGlobalOpen;
      window.addEventListener('nihongo-open-tour', handleGlobalOpen);
      return () => {
        window.removeEventListener('nihongo-open-tour', handleGlobalOpen);
      };
    }
  }, []);

  const effectiveOpen = Boolean(isOpen || internalOpen);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' | 'prev'
  const cardRef = useRef(null);

  // Estados interactivos para los widgets de cada paso
  // Paso 1: Bienvenida
  const [welcomePillar, setWelcomePillar] = useState(0);

  // Paso 2: Badges
  const [selectedBadge, setSelectedBadge] = useState('bell');

  // Paso 3: IME
  const [imeInput, setImeInput] = useState('');
  const [imeOutput, setImeOutput] = useState('');

  // Paso 4: Curriculum
  const [canDoChecked, setCanDoChecked] = useState(false);
  const [curriculumQuizAnswered, setCurriculumQuizAnswered] = useState(false);

  // Paso 5: Furigana / Story
  const [furiganaVisible, setFuriganaVisible] = useState(true);
  const [savedWordDemo, setSavedWordDemo] = useState(false);

  // Paso 6: NHK / Speech
  const [micActive, setMicActive] = useState(false);
  const [micScore, setMicScore] = useState(null);

  // Paso 7: YouTube
  const [subWordClicked, setSubWordClicked] = useState(null);

  // Paso 8: Pitch Accent
  const [pitchPattern, setPitchPattern] = useState('heiban');

  // Paso 9: Grammar / Particles
  const [particleSelected, setParticleSelected] = useState(null);

  // Paso 10: Kanji
  const [kanjiAnimating, setKanjiAnimating] = useState(false);

  // Paso 11: PDF
  const [selectedBook, setSelectedBook] = useState(0);

  // Paso: Practice Pad (Cuaderno de Caligrafía & Trazos)
  const [tourPracticeStyle, setTourPracticeStyle] = useState('shodo');
  const [tourPracticeGrid, setTourPracticeGrid] = useState('mizige');
  const [tourPracticeDrawn, setTourPracticeDrawn] = useState(false);

  // Paso 12: Saved / SRS
  const [srsFlipped, setSrsFlipped] = useState(false);
  const [srsInterval, setSrsInterval] = useState(null);

  // Paso 13: Audio Bar
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState('1.0x');

  // Mobile segmented view ('explanation' | 'demo')
  const [mobileTab, setMobileTab] = useState('explanation');
  const contentRef = useRef(null);

  // Always restart tour from the beginning when opened/reactivated
  useEffect(() => {
    if (effectiveOpen) {
      setCurrentStepIndex(0);
      setSlideDirection('next');
      setMobileTab('explanation');
      // Reset interactive states of all widgets
      setWelcomePillar(0);
      setSelectedBadge('bell');
      setImeInput('');
      setImeOutput('');
      setCanDoChecked(false);
      setCurriculumQuizAnswered(false);
      setFuriganaVisible(true);
      setSavedWordDemo(false);
      setMicActive(false);
      setMicScore(null);
      setSubWordClicked(null);
      setPitchPattern('heiban');
      setParticleSelected(null);
      setKanjiAnimating(false);
      setSelectedBook(0);
      setTourPracticeStyle('shodo');
      setTourPracticeGrid('mizige');
      setTourPracticeDrawn(false);
      setSrsFlipped(false);
      setSrsInterval(null);
      setAudioPlaying(false);
      setAudioSpeed('1.0x');
    }
  }, [effectiveOpen]);

  // Scroll to top of content on step change and reset mobile view tab
  useEffect(() => {
    setMobileTab('explanation');
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentStepIndex]);

  // Audio helper
  const handlePlayAudio = (text) => {
    if (!text) return;
    try {
      if (audioManager && typeof audioManager.speak === 'function') {
        audioManager.speak(text);
      }
    } catch (e) {
      console.warn('Audio play notice:', e);
    }
  };

  // IME live converter helper
  const handleImeChange = (text) => {
    setImeInput(text);
    const converted = wanakana.toKana(text, { IMEMode: true });
    setImeOutput(converted);
  };

  const handleSimulateImeSample = (sampleRomaji) => {
    setImeInput(sampleRomaji);
    const converted = wanakana.toKana(sampleRomaji);
    setImeOutput(converted);
  };

  // Pasos del Tour
  const TOUR_STEPS = [
    {
      id: 'welcome',
      category: 'Bienvenida',
      categoryColor: '#6366f1',
      title: '¡Bienvenido a Nihongo Master!',
      subtitle: 'Tu academia interactiva para dominar el japonés de N5 a N1',
      icon: Sparkles,
      description: 'Nihongo Master combina inmersión comprensible, audio neuronal y nativo, reconocimiento de voz y repetición espaciada (SRS). Este recorrido te guiará por todas las pestañas, herramientas inteligentes y funciones para que aprendas de manera natural y sin fricciones.',
      hiddenTip: '💡 Puedes saltar este tour cuando quieras con el botón "Saltar" o la tecla [Esc], y volver a abrirlo en cualquier momento desde la pestaña "Mi Progreso".',
      tab: null
    },
    {
      id: 'header_badges',
      category: 'Cabecera & Gamificación',
      categoryColor: '#f59e0b',
      title: 'Badges y Medallas de Progreso Diario',
      subtitle: 'Tus indicadores esenciales siempre a la vista en la barra superior',
      icon: Flame,
      description: 'En la parte superior encontrarás tu panel de control diario: racha activa, nivel, partículas y palabras dominadas, indicador del teclado japonés y sincronización en la nube.',
      hiddenTip: '🔔 Notificación Inteligente de Ejercicios: Si revisas un tema curricular o lección pero dejas preguntas sin resolver, la campana te alertará exactamente cuántas tienes pendientes y te llevará a resolverlas con un clic.',
      tab: null
    },
    {
      id: 'ime_keyboard',
      category: 'Escritura & Mecanografía',
      categoryColor: '#e11d48',
      title: 'Teclado Japonés Inteligente (IME Integrado)',
      subtitle: 'Escribe en japonés directamente usando letras latinas (Romaji)',
      icon: Keyboard,
      description: 'No necesitas instalar teclados complejos en tu sistema si no lo deseas. Nuestro motor integrado convierte automáticamente tus pulsaciones en romaji a Hiragana y Katakana en todos los campos y ejercicios de la aplicación.',
      hiddenTip: '⌨️ En macOS o Windows también puedes usar el atajo [Control + Espacio] para alternar el teclado del sistema, y la [Barra Espaciadora] para convertir Hiragana en Kanjis reales con confirmación en [Enter].',
      tab: null
    },
    {
      id: 'curriculum',
      category: 'Aprender',
      categoryColor: '#6366f1',
      title: 'Ruta de Aprendizaje Guiada (Currículum)',
      subtitle: 'Módulos progresivos ordenados por niveles oficiales JLPT',
      icon: Compass,
      description: 'El currículum te guía paso a paso desde conceptos iniciales (alfabetos Hiragana y Katakana) hasta estructuras complejas. Cada módulo contiene teoría concisa, oraciones modelo y ejercicios interactivos.',
      hiddenTip: '🎯 Objetivos Can-Do & Temas Relacionados: Cada módulo define metas de comunicación práctica ("Puedo pedir comida", "Puedo dar direcciones") basadas en el JF Standard, además de enlaces a temas relacionados sin duplicados.',
      tab: 'curriculum'
    },
    {
      id: 'story',
      category: 'Aprender',
      categoryColor: '#8b5cf6',
      title: 'Historias Interactivas & Generador IA',
      subtitle: 'Lecturas comprensibles con audio oracional sincronizado',
      icon: BookOpen,
      description: 'Aprende gramática y vocabulario dentro de historias entretenidas. A medida que avanza el narrador, cada oración se ilumina en pantalla para asociar la pronunciación natural con su escritura.',
      hiddenTip: '✨ 1. Furigana conmutable: oculta o muestra las lecturas en kana sobre los kanjis. 2. Click-to-Save: haz clic en cualquier palabra para guardarla. 3. Quiz interactivo de comprensión. 4. 🤖 Generador de Historias con IA a tu gusto.',
      tab: 'story'
    },
    {
      id: 'nhk',
      category: 'Aprender',
      categoryColor: '#ec4899',
      title: 'Conversación NHK & Práctica de Voz',
      subtitle: 'Diálogos de situaciones cotidianas reales en Japón',
      icon: MessageSquare,
      description: 'Lecciones orales basadas en el japonés real de la vida diaria: compras, saludos en el trabajo, restaurantes, médicos y transporte público con diálogos auténticos.',
      hiddenTip: '🎙️ Roleplay Interactivo con Micrófono: Activa tu micrófono y habla en japonés. La app evaluará tu pronunciación con reconocimiento de voz (Speech-to-Text). También incluye un Generador de Diálogos IA interactivo.',
      tab: 'nhk'
    },
    {
      id: 'youtube',
      category: 'Aprender',
      categoryColor: '#ef4444',
      title: 'Inmersión YouTube con Subtítulos Duales',
      subtitle: 'Contenido nativo auténtico con herramientas pedagógicas',
      icon: Tv,
      description: 'Aprende con videos de YouTube seleccionados por nivel. Incluye subtítulos sincronizados duales (japonés y español) y reproductor adaptado al estudio de idiomas.',
      hiddenTip: '🎬 Subtítulos interactivos con un clic: Toca cualquier palabra en los subtítulos para pausar el video, escuchar su pronunciación aislada y guardarla en tu vocabulario. Usa el bucle para repetir fragmentos difíciles.',
      tab: 'youtube'
    },
    {
      id: 'vocab',
      category: 'Recursos & Práctica',
      categoryColor: '#3b82f6',
      title: 'Banco Léxico & Gráfico de Pitch Accent',
      subtitle: 'Miles de palabras con audio neuronal y entonación melódica',
      icon: Layers,
      description: 'Diccionario categorizado por niveles JLPT (N5 a N1) y temáticas cotidianas. Cada palabra incluye Kanji, Hiragana, Katakana, español y audio neuronal de alta fidelidad.',
      hiddenTip: '🎵 Pitch Accent Visual (Acento Tonal): El japonés es una lengua con altura musical. La app te muestra la curva de entonación exacta (Heiban, Atamadaka, Nakadaka, Odaka) para pronunciar con acento nativo y no plano.',
      tab: 'vocab'
    },
    {
      id: 'particles',
      category: 'Recursos & Práctica',
      categoryColor: '#10b981',
      title: 'Partículas & Gramática Esencial',
      subtitle: 'Domina los conectores y estructuras vitales del idioma',
      icon: Target,
      description: 'Guía detallada de las 25 partículas japonesas más importantes (は, が, を, に, で, へ, と, も, から, まで, より, など...), con explicaciones directas y ejemplos comentados.',
      hiddenTip: '⚖️ Tablas Comparativas y Práctica Instantánea: Resuelve dudas comunes como cuándo usar "は" frente a "が", o "に" frente a "で", con comparativas visuales y ejercicios prácticos con retroalimentación inmediata.',
      tab: 'particles'
    },
    {
      id: 'kanji',
      category: 'Recursos & Práctica',
      categoryColor: '#f59e0b',
      title: 'Biblioteca Kanji & Lienzo de Dibujo',
      subtitle: 'Aprende ideogramas con orden de trazos y dibujo a mano',
      icon: Languages,
      description: 'Fichas completas de kanjis con número de trazos, radicales, lecturas On\'yomi (chinas), Kun\'yomi (japonesas) y lista sincronizada de palabras compuestas que los contienen.',
      hiddenTip: '✍️ Animación de Trazos y Modo Lienzo: Puedes ver la animación trazo a trazo y activar el modo dibujo para trazar el kanji con el mouse o con el dedo en pantallas táctiles; la app califica la precisión y dirección.',
      tab: 'kanji'
    },
    {
      id: 'practice_pad',
      category: 'Caligrafía & Práctica',
      categoryColor: '#f59e0b',
      title: 'Cuaderno de Caligrafía, Cuadrículas & Trazos',
      subtitle: 'Escribe a mano alzada, valida proporciones y guarda tus hojas de estudio',
      icon: PenTool,
      description: 'Accede a tu libreta digital en cualquier momento para practicar kanjis, vocabulario, oraciones modelo o historias completas. Elige entre cuadrículas tradicionales (田字格 Tianzige, 米字格 Mizige de 8 sectores, Genkouyoushi o Pautado) con estilos de trazo realistas y evaluación visual.',
      hiddenTip: '✍️ 1. Estilos auténticos: Pincel Shodō (書道), rotulador redondo, pluma estilográfica, lápiz escolar y tinta gel. 2. Plantilla fantasma ajustable para calcar. 3. Exporta tus hojas a PNG de alta resolución con sello tradicional Hanko (落款印). 4. Guarda y retoma donde lo dejaste.',
      tab: null
    },
    {
      id: 'pdf',
      category: 'Recursos & Práctica',
      categoryColor: '#06b6d4',
      title: 'Biblioteca de PDFs de Estudio',
      subtitle: 'Libros y guías de referencia en un visor integrado',
      icon: FileText,
      description: 'Visualiza directamente libros reconocidos como Minna no Nihongo, Irodori y guías descargables sin necesidad de instalar o abrir lectores externos.',
      hiddenTip: '📖 Visor integrado sin salir de la app: Navega por páginas, ajusta zoom y consulta explicaciones completas mientras mantienes tu sesión y racha activas.',
      tab: 'pdf'
    },
    {
      id: 'saved',
      category: 'Práctica & Consolidación',
      categoryColor: '#e11d48',
      title: 'Palabras Guardadas & Repaso Espaciado (SRS)',
      subtitle: 'Tu bóveda personal con memorización a largo plazo',
      icon: BookmarkCheck,
      description: 'Todas las palabras y frases que guardes al navegar se archivan aquí ordenadas con sus traducciones y audios para estudio continuo.',
      hiddenTip: '🧠 1. Algoritmo SRS FSRS: Programa repasos espaciados óptimos antes de que olvides una palabra. 2. Exportación a Anki / CSV / JSON. 3. 🪄 Generador de Historias con tus palabras: La IA crea cuentos usando solo tu vocabulario guardado.',
      tab: 'saved'
    },
    {
      id: 'audio_bar',
      category: 'Audio Persistente',
      categoryColor: '#6366f1',
      title: 'Barra Flotante de Audio & Modo Selección',
      subtitle: 'Tu reproductor persistente con control de velocidad y voz neuronal',
      icon: Volume2,
      description: 'En la parte inferior de la pantalla encontrarás el reproductor continuo: pausa, retrocede o adelanta 5 segundos y regula la velocidad desde 0.5x hasta 1.25x sin interrumpir tu navegación.',
      hiddenTip: '🔊 Pronunciación por Selección (Función Secreta): ¡Sombrea con el ratón cualquier fragmento de texto en japonés en cualquier pestaña y la voz neuronal lo leerá en voz alta al instante!',
      tab: null
    },
    {
      id: 'progress',
      category: 'Progreso & Cuenta',
      categoryColor: '#10b981',
      title: 'Mi Progreso, Sincronización en la Nube y Ajustes',
      subtitle: 'Tus estadísticas globales y cómo volver a ver este tour',
      icon: BarChart3,
      description: 'Monitorea tus gráficos de actividad, racha, nivel y dominio. Respalda tus datos iniciando sesión con Google o correo, o mediante archivos de exportación JSON.',
      hiddenTip: '🚀 Reactivar este Tour en cualquier momento: En la pestaña "Mi Progreso" encontrarás un botón dedicado para volver a abrir este tour interactivo cuando quieras repasar alguna función.',
      tab: 'progress'
    }
  ];

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const progressPercent = Math.round(((currentStepIndex + 1) / TOUR_STEPS.length) * 100);

  const handleClose = useCallback(() => {
    setInternalOpen(false);
    if (onClose) onClose();
  }, [onClose]);

  const handleSkip = useCallback(() => {
    setInternalOpen(false);
    if (onSkip) onSkip();
    else if (onClose) onClose();
  }, [onSkip, onClose]);

  const handleComplete = useCallback(() => {
    setInternalOpen(false);
    if (onComplete) onComplete();
    else if (onClose) onClose();
  }, [onComplete, onClose]);

  const goToNextStep = useCallback(() => {
    if (isLastStep) {
      handleComplete();
    } else {
      setSlideDirection('next');
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [isLastStep, handleComplete]);

  const goToPrevStep = useCallback(() => {
    if (!isFirstStep) {
      setSlideDirection('prev');
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!effectiveOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        goToNextStep();
      } else if (e.key === 'ArrowLeft') {
        goToPrevStep();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [effectiveOpen, currentStepIndex, goToNextStep, goToPrevStep, handleSkip]);

  const handleStepDotClick = (index) => {
    setSlideDirection(index > currentStepIndex ? 'next' : 'prev');
    setCurrentStepIndex(index);
  };

  const handleExploreTab = (tabId) => {
    if (onNavigate && tabId) {
      onNavigate(tabId);
      handleClose();
    }
  };

  if (!effectiveOpen || !mounted) return null;

  const modalMarkup = (
    <div 
      className="tour-modal-backdrop" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleSkip();
        }
      }}
    >
      <div 
        className="tour-modal-container" 
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tour interactivo de Nihongo Master"
      >
        {/* Top Header Row with Progress and Skip */}
        <div className="tour-modal-header">
          <div className="tour-header-main-row">
            <div className="tour-step-badge" style={{ backgroundColor: `${currentStep.categoryColor}18`, color: currentStep.categoryColor }}>
              {React.createElement(currentStep.icon, { size: 14, style: { marginRight: 6 } })}
              <span>{currentStep.category}</span>
            </div>

            <div className="tour-header-right">
              <span className="tour-step-counter">
                Paso <strong>{currentStepIndex + 1}</strong> de {TOUR_STEPS.length}
              </span>
              <button 
                type="button" 
                className="tour-skip-btn" 
                onClick={handleSkip}
                title="Saltar el tour"
                aria-label="Cerrar tour"
              >
                <span className="tour-skip-text">Saltar</span>
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="tour-progress-track">
            <div 
              className="tour-progress-bar" 
              style={{ width: `${progressPercent}%`, backgroundColor: currentStep.categoryColor }}
            />
          </div>
        </div>

        {/* Tour Main Content Area */}
        <div 
          className={`tour-modal-content slide-${slideDirection}`} 
          key={currentStep.id}
          ref={contentRef}
        >
          {/* Header Title & Subtitle */}
          <div className="tour-title-area">
            <h2 className="tour-main-title">
              {currentStep.title}
            </h2>
            <p className="tour-main-subtitle">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Mobile view segmented control (Explicación / Demo) */}
          <div className="tour-mobile-tabs">
            <button
              type="button"
              className={`tour-mobile-tab-btn ${mobileTab === 'explanation' ? 'active' : ''}`}
              onClick={() => setMobileTab('explanation')}
            >
              <BookOpen size={14} />
              <span>1. Explicación & Tips</span>
            </button>
            <button
              type="button"
              className={`tour-mobile-tab-btn ${mobileTab === 'demo' ? 'active' : ''}`}
              onClick={() => setMobileTab('demo')}
            >
              <Sparkles size={14} />
              <span>2. Demo en Vivo</span>
            </button>
          </div>

          {/* Body Description & Not-so-obvious tip box */}
          <div className={`tour-body-grid mobile-view-${mobileTab}`}>
            <div className="tour-text-column">
              <p className="tour-description-text">
                {currentStep.description}
              </p>

              {currentStep.hiddenTip && (
                <div className="tour-hidden-tip-card">
                  <div className="tour-tip-header">
                    <Lightbulb size={16} className="text-amber-500" />
                    <span>✨ Funcionalidad destacada (No tan obvia)</span>
                  </div>
                  <p className="tour-tip-body">
                    {currentStep.hiddenTip}
                  </p>
                </div>
              )}

              {/* Call to action for mobile to jump directly into the interactive widget */}
              <div className="tour-mobile-demo-cta">
                <button
                  type="button"
                  className="btn btn-outline btn-sm tour-go-to-demo-btn"
                  onClick={() => setMobileTab('demo')}
                  style={{ borderColor: currentStep.categoryColor, color: currentStep.categoryColor }}
                >
                  <Sparkles size={14} />
                  <span>Probar demostración interactiva en vivo</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {currentStep.tab && (
                <div className="tour-tab-shortcut">
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm tour-explore-btn"
                    onClick={() => handleExploreTab(currentStep.tab)}
                  >
                    <span>Explorar pestaña ahora</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Widget Column */}
            <div className="tour-interactive-column">
              <div className="tour-interactive-card">
                {/* Back button for mobile */}
                <div className="tour-mobile-back-to-exp">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm tour-back-exp-btn"
                    onClick={() => setMobileTab('explanation')}
                  >
                    <BookOpen size={13} />
                    <span>← Volver a la explicación</span>
                  </button>
                </div>

                <div className="tour-widget-header">
                  <span className="tour-widget-tag">🎮 Demostración interactiva en vivo</span>
                </div>

                {/* Paso 1: Bienvenida Widget */}
                {currentStep.id === 'welcome' && (
                  <div className="tour-widget-inner welcome-widget">
                    <div className="welcome-pillars-nav">
                      {['1. Inmersión', '2. Práctica', '3. SRS'].map((pill, idx) => (
                        <button
                          key={pill}
                          type="button"
                          className={`welcome-pillar-btn ${welcomePillar === idx ? 'active' : ''}`}
                          onClick={() => setWelcomePillar(idx)}
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                    <div className="welcome-pillar-card">
                      {welcomePillar === 0 && (
                        <div>
                          <div className="pillar-badge">🎧 Inmersión Comprensible</div>
                          <p style={{ margin: '8px 0', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                            Historias sincronizadas frase a frase, diálogos NHK auténticos y videos con subtítulos duales en tiempo real.
                          </p>
                          <div className="pillar-stat">
                            <span>48+ Lecciones NHK</span> · <span>Lecturas con Furigana</span>
                          </div>
                        </div>
                      )}
                      {welcomePillar === 1 && (
                        <div>
                          <div className="pillar-badge">✍️ Práctica Activa & Voz</div>
                          <p style={{ margin: '8px 0', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                            Teclado IME inteligente sin instalaciones, reconocimiento de voz (Speech-to-Text) y lienzo de dibujo de kanjis con el mouse o pantalla táctil.
                          </p>
                          <div className="pillar-stat">
                            <span>Reconocimiento de Voz STT</span> · <span>Trazos con HanziWriter</span>
                          </div>
                        </div>
                      )}
                      {welcomePillar === 2 && (
                        <div>
                          <div className="pillar-badge">🧠 Retención a Largo Plazo</div>
                          <p style={{ margin: '8px 0', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                            Algoritmo científico FSRS (Free Spaced Repetition Scheduler) que programa repasos justo antes del olvido.
                          </p>
                          <div className="pillar-stat">
                            <span>Curva del Olvido Optimizada</span> · <span>Exportación a Anki</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Paso 2: Header Badges Widget */}
                {currentStep.id === 'header_badges' && (
                  <div className="tour-widget-inner badges-widget">
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                      Haz clic en cualquier badge para ver su función:
                    </p>
                    <div className="tour-badges-preview">
                      <div 
                        className={`stat-badge ${selectedBadge === 'streak' ? 'active-preview' : ''}`}
                        onClick={() => setSelectedBadge('streak')}
                      >
                        <Flame size={15} className="text-amber-500" />
                        <span>3d racha</span>
                      </div>
                      <div 
                        className={`stat-badge ${selectedBadge === 'xp' ? 'active-preview' : ''}`}
                        onClick={() => setSelectedBadge('xp')}
                      >
                        <Star size={15} className="text-indigo-500" />
                        <span>Nivel 2 (180 XP)</span>
                      </div>
                      <div 
                        className={`stat-badge ${selectedBadge === 'particles' ? 'active-preview' : ''}`}
                        onClick={() => setSelectedBadge('particles')}
                      >
                        <CheckCircle2 size={15} className="text-emerald-500" />
                        <span>12/25 part.</span>
                      </div>
                      <div 
                        className={`stat-badge notif-stat-badge ${selectedBadge === 'bell' ? 'active-preview' : ''}`}
                        onClick={() => setSelectedBadge('bell')}
                      >
                        <Bell size={15} style={{ color: 'var(--accent, #f59e0b)' }} />
                        <span style={{ color: 'var(--accent, #f59e0b)', fontWeight: 700 }}>2 pend.</span>
                      </div>
                      <div 
                        className={`stat-badge ${selectedBadge === 'vocab' ? 'active-preview' : ''}`}
                        onClick={() => setSelectedBadge('vocab')}
                      >
                        <BookOpen size={15} className="text-blue-500" />
                        <span>45 pal.</span>
                      </div>
                      <div 
                        className={`stat-badge ${selectedBadge === 'ime' ? 'active-preview' : ''}`}
                        onClick={() => setSelectedBadge('ime')}
                      >
                        <Keyboard size={15} className="text-rose-500" />
                        <span>IME 🇯🇵</span>
                      </div>
                      <div 
                        className={`stat-badge ${selectedBadge === 'practice' ? 'active-preview' : ''}`}
                        onClick={() => setSelectedBadge('practice')}
                      >
                        <PenTool size={15} style={{ color: 'var(--accent, #f59e0b)' }} />
                        <span>Cuaderno ✍️</span>
                      </div>
                      <div 
                        className={`stat-badge ${selectedBadge === 'sync' ? 'active-preview' : ''}`}
                        onClick={() => setSelectedBadge('sync')}
                      >
                        <CloudCheck size={15} style={{ color: 'var(--success, #10b981)' }} />
                        <span>Nube</span>
                      </div>
                    </div>

                    <div className="tour-badge-explanation-box">
                      {selectedBadge === 'streak' && (
                        <div>
                          <strong>🔥 Racha Diaria:</strong> Registra los días consecutivos que completas al menos una actividad. ¡La constancia es la clave del japonés!
                        </div>
                      )}
                      {selectedBadge === 'xp' && (
                        <div>
                          <strong>⭐ Puntos de Experiencia (XP):</strong> Ganas XP al resolver ejercicios, escuchar historias y aprender palabras. Cada 100 XP subes de nivel.
                        </div>
                      )}
                      {selectedBadge === 'particles' && (
                        <div>
                          <strong>🎯 Partículas Dominadas:</strong> Monitorea tu avance en las 25 partículas japonesas elementales (は, が, を, に, で...).
                        </div>
                      )}
                      {selectedBadge === 'bell' && (
                        <div style={{ color: 'var(--accent, #e11d48)' }}>
                          <strong>🔔 ¡Función Oculta! Ejercicios Pendientes:</strong> Si abres un módulo o lección pero no completas sus ejercicios, este badge te avisa y te lleva con un clic a resolverlos.
                        </div>
                      )}
                      {selectedBadge === 'vocab' && (
                        <div>
                          <strong>📚 Vocabulario Registrado:</strong> Conteo del total de términos aprendidos y guardados en tu banco léxico personal.
                        </div>
                      )}
                      {selectedBadge === 'ime' && (
                        <div>
                          <strong>🇯🇵 Teclado IME:</strong> Indica que el transpilador automático romaji a kana está activo en los ejercicios.
                        </div>
                      )}
                      {selectedBadge === 'practice' && (
                        <div>
                          <strong>✍️ Cuaderno de Caligrafía & Trazos:</strong> Acceso rápido integrado en tus estadísticas para abrir tu libreta de práctica con cuadrículas y pincel Shodō sin perder de vista tu avance.
                        </div>
                      )}
                      {selectedBadge === 'sync' && (
                        <div>
                          <strong>☁️ Sincronización en la Nube:</strong> Muestra si tus datos están en modo local o respaldados en tiempo real en Supabase con tu cuenta.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Paso 3: IME Widget */}
                {currentStep.id === 'ime_keyboard' && (
                  <div className="tour-widget-inner ime-widget">
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Escribe en Romaji para probar la conversión instantánea:
                    </label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="Escribe 'arigatou', 'watashi', 'nihon'..."
                      value={imeInput}
                      onChange={(e) => handleImeChange(e.target.value)}
                      style={{ fontSize: '0.95rem', padding: '8px 12px', width: '100%', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                    />
                    
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Probar ejemplos:</span>
                      {['arigatou', 'watashi', 'konnichiwa', 'nihongo', 'sakura'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                          onClick={() => handleSimulateImeSample(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="ime-result-box">
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resultado convertido en Hiragana:</span>
                      <div className="ime-japanese-text jp-text">
                        {imeOutput || '… (escribe arriba para ver)'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 4: Curriculum Widget */}
                {currentStep.id === 'curriculum' && (
                  <div className="tour-widget-inner curriculum-widget">
                    <div className="curriculum-mini-card">
                      <div className="curriculum-mini-header">
                        <span className="badge-level">N5</span>
                        <strong>Módulo 1: Saludos y Presentaciones</strong>
                      </div>
                      
                      <div className="curriculum-mini-cando">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input 
                            type="checkbox" 
                            checked={canDoChecked}
                            onChange={(e) => setCanDoChecked(e.target.checked)}
                          />
                          <span><strong>Can-Do:</strong> Puedo presentarme diciendo mi nombre y origen.</span>
                        </label>
                        {canDoChecked && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Check size={13} /> ¡Objetivo de comunicación dominado! (+10 XP)
                          </div>
                        )}
                      </div>

                      <div className="curriculum-mini-exercise">
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                          Mini ejercicio interactivo:
                        </div>
                        <div style={{ fontSize: '0.85rem', marginBottom: 6 }}>
                          ¿Cómo se dice &quot;Mucho gusto&quot; al presentarse?
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button 
                            type="button"
                            className={`btn btn-sm ${curriculumQuizAnswered ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setCurriculumQuizAnswered(true)}
                            style={{ fontSize: '0.8rem' }}
                          >
                            はじめまして (Hajimemashite)
                          </button>
                          <button 
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => alert('¡Casi! さようなら significa Adiós.')}
                            style={{ fontSize: '0.8rem' }}
                          >
                            さようなら (Sayounara)
                          </button>
                        </div>
                        {curriculumQuizAnswered && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--success)', marginTop: 6, fontWeight: 600 }}>
                            ✓ ¡Correcto! Se usa al conocer a alguien por primera vez.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 5: Story Widget */}
                {currentStep.id === 'story' && (
                  <div className="tour-widget-inner story-widget">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Frase interactiva con audio y furigana:</span>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setFuriganaVisible(prev => !prev)}
                        style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {furiganaVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>Furigana: {furiganaVisible ? 'Activado' : 'Oculto'}</span>
                      </button>
                    </div>

                    <div className="story-sentence-preview">
                      <div className="jp-text story-jp-text">
                        {furiganaVisible ? (
                          <>
                            <ruby>今日<rt>きょう</rt></ruby>は{' '}
                            <ruby 
                              style={{ cursor: 'pointer', textDecoration: 'underline dotted var(--primary)' }}
                              onClick={() => setSavedWordDemo(true)}
                              title="Haz clic para guardar"
                            >
                              天気<rt>てんき</rt>
                            </ruby>が{' '}
                            <ruby>良い<rt>よい</rt></ruby>です。
                          </>
                        ) : (
                          <>
                            今日 は{' '}
                            <span 
                              style={{ cursor: 'pointer', textDecoration: 'underline dotted var(--primary)' }}
                              onClick={() => setSavedWordDemo(true)}
                              title="Haz clic para guardar"
                            >
                              天気
                            </span>{' '}
                            が良いです。
                          </>
                        )}
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        &quot;Hoy hace muy buen clima.&quot;
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handlePlayAudio('きょうはてんきがよいです')}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                        >
                          <Play size={13} /> Escuchar pronunciación
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setSavedWordDemo(true)}
                          style={{ fontSize: '0.75rem' }}
                        >
                          Tocar palabra &quot;天気&quot;
                        </button>
                      </div>

                      {savedWordDemo && (
                        <div className="saved-word-popover">
                          <div>
                            <strong>天気 (てんき)</strong>: Clima / Tiempo atmosférico
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 4, fontWeight: 600 }}>
                            ⭐ ¡Palabra guardada en tu banco léxico personal!
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Paso 6: NHK Widget */}
                {currentStep.id === 'nhk' && (
                  <div className="tour-widget-inner nhk-widget">
                    <div className="nhk-dialogue-box">
                      <div className="dialogue-line">
                        <div className="speaker-avatar">アンナ</div>
                        <div className="speech-bubble">
                          <div className="jp-text" style={{ fontSize: '0.92rem' }}>
                            すみません、駅はどこですか？
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            Disculpe, ¿dónde está la estación?
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handlePlayAudio('すみません、えきはどこですか')}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                        >
                          <Volume2 size={13} /> Escuchar audio
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm ${micActive ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => {
                            setMicActive(true);
                            setTimeout(() => {
                              setMicActive(false);
                              setMicScore(98);
                              handlePlayAudio('すみません');
                            }, 1200);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                        >
                          <Mic size={13} /> {micActive ? 'Escuchando tu voz...' : 'Practicar pronunciación'}
                        </button>
                      </div>

                      {micScore !== null && (
                        <div className="mic-score-result">
                          <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                          <span>¡Pronunciación excelente! Puntuación de similitud: <strong>{micScore}%</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Paso 7: YouTube Widget */}
                {currentStep.id === 'youtube' && (
                  <div className="tour-widget-inner youtube-widget">
                    <div className="youtube-player-mockup">
                      <div className="video-screen-mockup">
                        <div className="video-badge">▶ Video Inmersivo</div>
                        <div className="dual-subtitles-box">
                          <div className="sub-jp jp-text">
                            <span 
                              className="clickable-sub-word"
                              onClick={() => {
                                setSubWordClicked('日本語');
                                handlePlayAudio('にほんご');
                              }}
                            >
                              日本語
                            </span>
                            を
                            <span 
                              className="clickable-sub-word"
                              onClick={() => {
                                setSubWordClicked('勉強');
                                handlePlayAudio('べんきょう');
                              }}
                            >
                              勉強
                            </span>
                            するのが大好きです。
                          </div>
                          <div className="sub-es">
                            Me encanta estudiar japonés todos los días.
                          </div>
                        </div>
                      </div>

                      {subWordClicked && (
                        <div className="sub-click-card">
                          <div>
                            <strong>{subWordClicked}</strong> ({subWordClicked === '日本語' ? 'Nihongo' : 'Benkyou'}): {subWordClicked === '日本語' ? 'Idioma japonés' : 'Estudiar / Estudio'}
                          </div>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.72rem', marginTop: 4 }}
                            onClick={() => alert(`¡"${subWordClicked}" guardado en tu vocabulario!`)}
                          >
                            + Guardar palabra
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Paso 8: Vocab / Pitch Accent Widget */}
                {currentStep.id === 'vocab' && (
                  <div className="tour-widget-inner pitch-widget">
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                      Selecciona un patrón de Pitch Accent para ver su gráfico:
                    </div>
                    
                    <div className="pitch-tabs-row">
                      {[
                        { id: 'heiban', name: 'Heiban (Plano)', word: 'さくら', romaji: 'sakura', meaning: 'Cerezo', wave: [1, 2, 2] },
                        { id: 'atamadaka', name: 'Atamadaka (Alto)', word: 'あめ', romaji: 'áme', meaning: 'Lluvia', wave: [2, 1] },
                        { id: 'nakadaka', name: 'Nakadaka (Medio)', word: 'あなた', romaji: 'anáta', meaning: 'Tú', wave: [1, 2, 1] },
                        { id: 'odaka', name: 'Odaka (Final)', word: 'おとこ', romaji: 'otokó', meaning: 'Hombre', wave: [1, 2, 2] }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`btn btn-sm ${pitchPattern === item.id ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => {
                            setPitchPattern(item.id);
                            handlePlayAudio(item.word);
                          }}
                          style={{ fontSize: '0.73rem', padding: '4px 8px' }}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>

                    <div className="pitch-graph-display">
                      <div className="pitch-word-header">
                        <span className="jp-text" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                          {pitchPattern === 'heiban' && 'さくら (sakura)'}
                          {pitchPattern === 'atamadaka' && 'あめ (ame - lluvia)'}
                          {pitchPattern === 'nakadaka' && 'あなた (anata)'}
                          {pitchPattern === 'odaka' && 'おとこ (otoko)'}
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            const words = { heiban: 'さくら', atamadaka: 'あめ', nakadaka: 'あなた', odaka: 'おとこ' };
                            handlePlayAudio(words[pitchPattern]);
                          }}
                          style={{ padding: '2px 6px' }}
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>

                      <div className="pitch-curve-mockup">
                        <div className="pitch-level-row high">
                          <span className="pitch-label">Alto (高)</span>
                          <div className={`pitch-bar-node ${pitchPattern === 'atamadaka' ? 'active' : ''}`}>1</div>
                          <div className={`pitch-bar-node ${pitchPattern !== 'atamadaka' ? 'active' : ''}`}>2</div>
                          <div className={`pitch-bar-node ${pitchPattern === 'heiban' || pitchPattern === 'odaka' ? 'active' : ''}`}>3</div>
                        </div>
                        <div className="pitch-level-row low">
                          <span className="pitch-label">Bajo (低)</span>
                          <div className={`pitch-bar-node ${pitchPattern !== 'atamadaka' ? 'active' : ''}`}>1</div>
                          <div className={`pitch-bar-node ${pitchPattern === 'atamadaka' ? 'active' : ''}`}>2</div>
                          <div className={`pitch-bar-node ${pitchPattern === 'nakadaka' ? 'active' : ''}`}>3</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 9: Grammar / Particles Widget */}
                {currentStep.id === 'particles' && (
                  <div className="tour-widget-inner particles-widget">
                    <div className="particle-quiz-box">
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                        Completa la oración con la partícula correcta:
                      </div>
                      <div className="jp-text" style={{ fontSize: '1.05rem', margin: '8px 0' }}>
                        図書館{' '}
                        <span className="particle-blank">
                          {particleSelected ? `[ ${particleSelected} ]` : '[ ___ ]'}
                        </span>{' '}
                        本を読みます。
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                        (Leo libros en la biblioteca).
                      </div>

                      <div className="particle-options-row">
                        {['に', 'で', 'を', 'は'].map((part) => (
                          <button
                            key={part}
                            type="button"
                            className={`btn btn-sm ${particleSelected === part ? (part === 'で' ? 'btn-primary' : 'btn-danger') : 'btn-outline'}`}
                            onClick={() => setParticleSelected(part)}
                            style={{ minWidth: 42, fontSize: '0.9rem', fontWeight: 700 }}
                          >
                            {part}
                          </button>
                        ))}
                      </div>

                      {particleSelected && (
                        <div className={`particle-feedback-card ${particleSelected === 'で' ? 'success' : 'error'}`}>
                          {particleSelected === 'で' ? (
                            <div>
                              <strong>✓ ¡Correcto!</strong> La partícula <strong>で (de)</strong> indica el lugar donde se ejecuta una acción activa (leer), mientras que <strong>に</strong> solo indica ubicación estática.
                            </div>
                          ) : (
                            <div>
                              <strong>✕ No exactamente.</strong> La opción correcta es <strong>で</strong>, que señala el lugar de una acción. ¡Pruébala!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Paso 10: Kanji Widget */}
                {currentStep.id === 'kanji' && (
                  <div className="tour-widget-inner kanji-widget">
                    <div className="kanji-demo-card">
                      <div className="kanji-character-box jp-text">
                        <span className={`big-kanji ${kanjiAnimating ? 'animating-strokes' : ''}`}>
                          日
                        </span>
                        <div className="kanji-mini-stats">
                          <span>4 trazos</span> · <span>Radical: 日 (Sol)</span>
                        </div>
                      </div>

                      <div className="kanji-readings-box">
                        <div><strong>On&apos;yomi:</strong> ニチ (nichi), ジツ (jitsu)</div>
                        <div><strong>Kun&apos;yomi:</strong> ひ (hi), -び (-bi)</div>
                        <div><strong>Significado:</strong> Sol, día, Japón</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setKanjiAnimating(true);
                          handlePlayAudio('にち');
                          setTimeout(() => setKanjiAnimating(false), 2000);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                      >
                        <Play size={13} /> {kanjiAnimating ? 'Trazando...' : 'Animar trazos'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => alert('¡En la pestaña Kanji podrás dibujar con el mouse o con el dedo y la app evaluará tu trazo!')}
                        style={{ fontSize: '0.75rem' }}
                      >
                        ✍️ Probar lienzo de dibujo
                      </button>
                    </div>
                  </div>
                )}

                {/* Paso: Practice Pad (Cuaderno de Caligrafía, Cuadrículas y Trazos) */}
                {currentStep.id === 'practice_pad' && (
                  <div className="tour-widget-inner practice-pad-tour-widget">
                    {/* Selectores de estilo de trazo y cuadrícula */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                          Estilo de trazo disponible:
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {[
                            { id: 'shodo', label: '🖌️ Shodō', tip: 'Pincel tradicional con modulación dinámica' },
                            { id: 'marker', label: '🖊️ Rotulador', tip: 'Punta redonda de grosor homogéneo' },
                            { id: 'fountain', label: '✒️ Pluma', tip: 'Biselado estilográfico con filo variable' },
                            { id: 'pencil', label: '✏️ Lápiz', tip: 'Textura suave de grafito japonés' },
                            { id: 'gel', label: '🖋️ Gel 0.5', tip: 'Trazo continuo y fluido Catmull-Rom' }
                          ].map(st => (
                            <button
                              key={st.id}
                              type="button"
                              className={`btn btn-sm ${tourPracticeStyle === st.id ? 'btn-primary' : 'btn-outline'}`}
                              onClick={() => setTourPracticeStyle(st.id)}
                              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                              title={st.tip}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                          Tipo de cuadrícula de aprendizaje:
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {[
                            { id: 'tianzige', label: '田字格 (Cruz)' },
                            { id: 'mizige', label: '米字格 (Estrella 8)' },
                            { id: 'genkouyoushi', label: '原稿用紙 (Redacción)' },
                            { id: 'lined', label: 'Líneas pautadas' }
                          ].map(gd => (
                            <button
                              key={gd.id}
                              type="button"
                              className={`btn btn-sm ${tourPracticeGrid === gd.id ? 'btn-primary' : 'btn-outline'}`}
                              onClick={() => setTourPracticeGrid(gd.id)}
                              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                            >
                              {gd.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Previsualizador de Papel Washi & Cuadrícula */}
                    <div 
                      className="practice-tour-preview-card"
                      style={{
                        background: '#fcfaf5',
                        border: '2px solid rgba(217, 119, 6, 0.3)',
                        borderRadius: 12,
                        padding: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 14,
                        boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.04)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Cuadrícula visual simulada */}
                      <div 
                        style={{
                          width: 120,
                          height: 120,
                          flexShrink: 0,
                          position: 'relative',
                          border: '2px solid #b45309',
                          background: '#fffef9',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {/* Líneas guía según cuadrícula */}
                        {tourPracticeGrid === 'tianzige' && (
                          <>
                            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, borderLeft: '1px dashed rgba(180, 83, 9, 0.45)' }} />
                            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, borderTop: '1px dashed rgba(180, 83, 9, 0.45)' }} />
                          </>
                        )}
                        {tourPracticeGrid === 'mizige' && (
                          <>
                            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, borderLeft: '1px dashed rgba(180, 83, 9, 0.45)' }} />
                            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, borderTop: '1px dashed rgba(180, 83, 9, 0.45)' }} />
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(45deg, transparent 49.5%, rgba(180, 83, 9, 0.25) 50%, transparent 50.5%), linear-gradient(-45deg, transparent 49.5%, rgba(180, 83, 9, 0.25) 50%, transparent 50.5%)' }} />
                          </>
                        )}
                        {tourPracticeGrid === 'genkouyoushi' && (
                          <div style={{ position: 'absolute', inset: 8, border: '1px solid rgba(180, 83, 9, 0.35)', borderRadius: 2 }} />
                        )}
                        {tourPracticeGrid === 'lined' && (
                          <>
                            <div style={{ position: 'absolute', left: 0, right: 0, top: '33%', height: 1, borderTop: '1px dashed rgba(180, 83, 9, 0.4)' }} />
                            <div style={{ position: 'absolute', left: 0, right: 0, top: '66%', height: 1, borderTop: '1px solid rgba(180, 83, 9, 0.4)' }} />
                          </>
                        )}

                        {/* Ideograma clásico "永" (los 8 trazos de caligrafía) */}
                        <span 
                          className="jp-text"
                          style={{
                            fontSize: '4.8rem',
                            fontWeight: 400,
                            lineHeight: 1,
                            color: tourPracticeDrawn ? '#111827' : 'rgba(180, 83, 9, 0.28)',
                            transition: 'all 0.3s ease',
                            userSelect: 'none',
                            textShadow: tourPracticeDrawn && tourPracticeStyle === 'shodo' ? '0 0 1px rgba(0,0,0,0.8)' : 'none'
                          }}
                        >
                          永
                        </span>

                        {/* Sello tradicional Hanko en miniatura */}
                        <div 
                          style={{
                            position: 'absolute',
                            bottom: 4,
                            right: 4,
                            width: 18,
                            height: 18,
                            border: '1px solid #dc2626',
                            background: 'rgba(220, 38, 38, 0.08)',
                            color: '#dc2626',
                            fontSize: '9px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 2
                          }}
                        >
                          秀
                        </div>
                      </div>

                      {/* Explicación y controles del lienzo */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400e' }}>
                          永 (Ei · Eternidad / 8 trazos maestros)
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#78350f', lineHeight: 1.4 }}>
                          {tourPracticeDrawn ? (
                            <span style={{ color: '#047857', fontWeight: 600 }}>
                              ✓ ¡Proporción verificada con éxito! Balance en 4 cuadrantes: <strong>96%</strong>.
                            </span>
                          ) : (
                            'Modo lienzo activo con papel Washi. Puedes calcar con la plantilla fantasma o escribir a mano alzada.'
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              setTourPracticeDrawn(prev => !prev);
                              if (!tourPracticeDrawn) {
                                handlePlayAudio('えい');
                              }
                            }}
                            style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                          >
                            {tourPracticeDrawn ? '↺ Limpiar trazo' : '✍️ Simular trazo'}
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              handleClose();
                              if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                                window.__nihongoOpenPracticePad({
                                  text: '永',
                                  kana: 'えい',
                                  title: 'Práctica de Caligrafía: 永 (8 Trazos Clásicos)',
                                  source: 'kanji'
                                });
                              }
                            }}
                            style={{
                              fontSize: '0.74rem',
                              padding: '3px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              background: '#b45309',
                              borderColor: '#92400e'
                            }}
                          >
                            <PenTool size={12} /> Abrir Cuaderno Ahora
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>💡 <strong>Tip:</strong> Puedes abrir el cuaderno desde el indicador de las estadísticas o desde cualquier kanji, palabra u oración de la aplicación.</span>
                    </div>
                  </div>
                )}

                {/* Paso 11: PDF Widget */}
                {currentStep.id === 'pdf' && (
                  <div className="tour-widget-inner pdf-widget">
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                      Selecciona un libro de texto oficial disponible:
                    </div>
                    <div className="pdf-book-selector">
                      {[
                        { title: 'Minna no Nihongo I', level: 'N5', pages: '25 lecciones' },
                        { title: 'Irodori Katsudou', level: 'A1 / N5', pages: '18 temas' },
                        { title: 'Guía de Kanjis N5', level: 'N5', pages: '103 caracteres' }
                      ].map((bk, i) => (
                        <div 
                          key={bk.title}
                          className={`pdf-book-card ${selectedBook === i ? 'active' : ''}`}
                          onClick={() => setSelectedBook(i)}
                        >
                          <FileText size={18} className="text-cyan-500" />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{bk.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{bk.level} · {bk.pages}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pdf-viewer-tip">
                      Visor integrado con salto rápido a páginas y descarga directa para estudiar offline.
                    </div>
                  </div>
                )}

                {/* Paso 12: Saved / SRS Widget */}
                {currentStep.id === 'saved' && (
                  <div className="tour-widget-inner srs-widget">
                    <div 
                      className={`srs-flashcard ${srsFlipped ? 'flipped' : ''}`}
                      onClick={() => setSrsFlipped(prev => !prev)}
                    >
                      <div className="flashcard-front">
                        <span className="badge-srs">Tarjeta SRS</span>
                        <div className="jp-text" style={{ fontSize: '1.4rem', fontWeight: 700, margin: '8px 0' }}>
                          勉強する
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          (べんきょうする) · Haz clic para voltear
                        </div>
                      </div>
                      {srsFlipped && (
                        <div className="flashcard-back">
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                            Estudiar
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0' }}>
                            Verbo grupo 3 (Suru)
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                        Evalúa tu recuerdo para calcular el próximo repaso:
                      </div>
                      <div className="srs-actions-row">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm btn-srs-hard"
                          onClick={() => setSrsInterval('1 día')}
                        >
                          Difícil (1d)
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm btn-srs-good"
                          onClick={() => setSrsInterval('3 días')}
                        >
                          Bien (3d)
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm btn-srs-easy"
                          onClick={() => setSrsInterval('7 días')}
                        >
                          Fácil (7d)
                        </button>
                      </div>
                      {srsInterval && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--success)', marginTop: 6, textAlign: 'center', fontWeight: 600 }}>
                          ✓ Próximo repaso programado en: <strong>{srsInterval}</strong> (Algoritmo FSRS)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Paso 13: Audio Bar Widget */}
                {currentStep.id === 'audio_bar' && (
                  <div className="tour-widget-inner audio-bar-widget">
                    <div className="audio-player-mockup-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ width: 34, height: 34, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={() => {
                            setAudioPlaying(prev => !prev);
                            handlePlayAudio('にほんごマスターへようこそ');
                          }}
                        >
                          {audioPlaying ? <VolumeX size={15} /> : <Play size={15} />}
                        </button>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                            Reproductor Persistente Nihongo
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {audioPlaying ? 'Reproduciendo audio neuronal...' : 'Listo para reproducir'}
                          </div>
                        </div>
                      </div>

                      <div className="speed-buttons-row">
                        {['0.75x', '1.0x', '1.25x'].map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            className={`btn btn-sm ${audioSpeed === spd ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setAudioSpeed(spd)}
                            style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                          >
                            {spd}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="selection-audio-demo-box">
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
                        🔊 Prueba el Modo Selección:
                      </div>
                      <p style={{ fontSize: '0.82rem', margin: 0 }}>
                        Sombrea con el ratón esta frase en japonés para oírla:
                      </p>
                      <div 
                        className="jp-text selection-test-phrase"
                        onMouseUp={() => handlePlayAudio('にほんごはおもしろいです')}
                      >
                        日本語は面白いです (El japonés es interesante)
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 14: Progress Widget */}
                {currentStep.id === 'progress' && (
                  <div className="tour-widget-inner finish-widget">
                    <div className="finish-medal-box">
                      <Award size={48} className="text-amber-500 animate-bounce" />
                      <h3 style={{ margin: '8px 0 4px', fontSize: '1.15rem', color: 'var(--text-main)' }}>
                        ¡Tour Completado! 🎉
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                        Ya conoces las herramientas principales y trucos de Nihongo Master.
                      </p>
                    </div>

                    <div className="finish-checklist">
                      <div className="checklist-item">
                        <Check size={14} className="text-emerald-500" />
                        <span>Badges y notificaciones de ejercicios entendidos</span>
                      </div>
                      <div className="checklist-item">
                        <Check size={14} className="text-emerald-500" />
                        <span>Teclado IME y Pitch Accent dominados</span>
                      </div>
                      <div className="checklist-item">
                        <Check size={14} className="text-emerald-500" />
                        <span>Ruta de aprendizaje y herramientas IA listas</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                      Recuerda: puedes reactivar este tour en cualquier momento desde el botón en la pestaña <strong>&quot;Mi Progreso&quot;</strong>.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="tour-modal-footer">
          {/* Step dots navigation */}
          <div className="tour-dots-row">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                className={`tour-dot-btn ${currentStepIndex === idx ? 'active' : ''}`}
                onClick={() => handleStepDotClick(idx)}
                title={`Ir al paso ${idx + 1}: ${step.title}`}
                style={{
                  backgroundColor: currentStepIndex === idx ? currentStep.categoryColor : undefined
                }}
              />
            ))}
          </div>

          <div className="tour-footer-buttons">
            {!isFirstStep && (
              <button
                type="button"
                className="btn btn-outline tour-nav-btn"
                onClick={goToPrevStep}
              >
                <ChevronLeft size={16} />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary tour-nav-btn tour-next-btn"
              onClick={goToNextStep}
              style={{ backgroundColor: currentStep.categoryColor, borderColor: currentStep.categoryColor }}
            >
              <span>{isLastStep ? '¡Comenzar a Aprender!' : 'Siguiente'}</span>
              {isLastStep ? <Sparkles size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalMarkup, document.body);
  }
  return modalMarkup;
}
