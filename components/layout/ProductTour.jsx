'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Flame, Star, CheckCircle2, BookOpen, Keyboard, Compass, MessageSquare, Tv, Layers, Target, Languages, FileText, BookmarkCheck, Volume2, BarChart3, ChevronLeft, ChevronRight, X, Play, Eye, EyeOff, Lightbulb, Check, ExternalLink, Mic, Award, CloudCheck, Bell, VolumeX, ArrowRight, PenTool } from 'lucide-react';
import * as wanakana from 'wanakana';
import audioManager from '../../lib/audioManager';

export default function ProductTour({ 
  isOpen, 
  initialStep = null,
  onClose, 
  onSkip, 
  onComplete, 
  onNavigate 
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalInitialStep, setInternalInitialStep] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleGlobalOpen = (e) => {
      const step = e?.detail?.step || null;
      if (step !== null && step !== undefined) {
        setInternalInitialStep(step);
      }
      setInternalOpen(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('nihongo-open-tour', handleGlobalOpen);
      return () => {
        window.removeEventListener('nihongo-open-tour', handleGlobalOpen);
      };
    }
  }, []);

  const effectiveOpen = Boolean(isOpen !== undefined ? isOpen : internalOpen);
  const effectiveTargetStep = initialStep !== null ? initialStep : internalInitialStep;

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

  // Paso 5: Furigana / Story / AI Generators
  const [furiganaVisible, setFuriganaVisible] = useState(true);
  const [savedWordDemo, setSavedWordDemo] = useState(false);
  const [storyTourTab, setStoryTourTab] = useState('reading'); // 'reading' | 'ai_tools'
  const [selectedAiGen, setSelectedAiGen] = useState(0);

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
  const [kanjiStrokeStep, setKanjiStrokeStep] = useState(0); // 0 = all/complete, 1, 2, 3, 4
  const [tourKanjiShowNumbers, setTourKanjiShowNumbers] = useState(true);
  const [tourKanjiMultiColor, setTourKanjiMultiColor] = useState(true);
  const [tourKanjiSuccess, setTourKanjiSuccess] = useState(true);
  const kanjiTimerRef = useRef(null);

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

  // Paso: Daily Goal
  const [tourGoalCategory, setTourGoalCategory] = useState('all');
  const [tourGoalAnswer, setTourGoalAnswer] = useState(null);
  const [tourGoalNotifTested, setTourGoalNotifTested] = useState(false);

  // Paso: JLPT
  const [tourJlptLevel, setTourJlptLevel] = useState('N5');
  const [tourJlptMode, setTourJlptMode] = useState('practice');
  const [tourJlptAnswer, setTourJlptAnswer] = useState(null);
  const [tourJlptSrsSaved, setTourJlptSrsSaved] = useState(false);

  // Mobile segmented view ('explanation' | 'demo')
  const [mobileTab, setMobileTab] = useState('explanation');
  const contentRef = useRef(null);

  // Restart or navigate to target step when tour is opened/reactivated
  useEffect(() => {
    if (effectiveOpen) {
      let startIndex = 0;
      if (effectiveTargetStep !== null && effectiveTargetStep !== undefined) {
        if (typeof effectiveTargetStep === 'number') {
          startIndex = Math.max(0, Math.min(effectiveTargetStep, TOUR_STEPS.length - 1));
        } else if (typeof effectiveTargetStep === 'string') {
          const rawTarget = String(effectiveTargetStep).toLowerCase().trim();
          const STEP_ALIASES = {
            grammar: 'particles',
            particulas: 'particles',
            gramatica: 'particles',
            dialogue: 'nhk',
            dialogos: 'nhk',
            conversacion: 'nhk',
            books: 'pdf',
            libros: 'pdf',
            materiales: 'pdf',
            review: 'saved',
            srs: 'saved',
            guardados: 'saved',
            cuaderno: 'practice_pad',
            practice: 'practice_pad',
            exam: 'jlpt',
            exams: 'jlpt',
            simulacro: 'jlpt',
            simulacros: 'jlpt',
            ruta: 'curriculum',
            historia: 'story',
            historias: 'story',
            meta: 'daily_goal',
            meta_diaria: 'daily_goal',
            goal: 'daily_goal',
            daily: 'daily_goal',
            notificaciones: 'header_badges',
            badges: 'header_badges',
            campana: 'header_badges',
            racha: 'header_badges',
            teclado: 'ime_keyboard',
            keyboard: 'ime_keyboard',
            ime: 'ime_keyboard',
            audio: 'audio_bar',
            audio_player: 'audio_bar',
            reproductor: 'audio_bar',
            progreso: 'progress',
            estadisticas: 'progress',
            stats: 'progress'
          };
          const target = STEP_ALIASES[rawTarget] || rawTarget;
          const idx = TOUR_STEPS.findIndex(s => s.id === target || s.tab === target);
          if (idx !== -1) startIndex = idx;
        }
      }
      setCurrentStepIndex(startIndex);
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
      setStoryTourTab('reading');
      setSelectedAiGen(0);
      setMicActive(false);
      setMicScore(null);
      setSubWordClicked(null);
      setPitchPattern('heiban');
      setParticleSelected(null);
      setKanjiAnimating(false);
      setKanjiStrokeStep(0);
      if (kanjiTimerRef.current) clearInterval(kanjiTimerRef.current);
      setSelectedBook(0);
      setTourPracticeStyle('shodo');
      setTourPracticeGrid('mizige');
      setTourPracticeDrawn(false);
      setSrsFlipped(false);
      setSrsInterval(null);
      setAudioPlaying(false);
      setAudioSpeed('1.0x');
    }
    return () => {
      if (kanjiTimerRef.current) clearInterval(kanjiTimerRef.current);
    };
  }, [effectiveOpen, effectiveTargetStep]);

  // Scroll to top of content on step change and reset mobile view tab
  useEffect(() => {
    setMobileTab('explanation');
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentStepIndex]);

  // Audio helper with playback rate support
  const handlePlayAudio = (text, options = {}) => {
    if (!text) return;
    try {
      if (audioManager && typeof audioManager.speak === 'function') {
        const activeRate = options.rate !== undefined ? options.rate : (parseFloat(audioSpeed) || 1.0);
        audioManager.speak(text, { rate: activeRate, ...options });
      }
    } catch (e) {
      console.warn('Audio play notice:', e);
    }
  };

  // Speed selector helper that immediately applies the rate to audioManager
  const handleSelectAudioSpeed = (spd) => {
    setAudioSpeed(spd);
    const numRate = parseFloat(spd) || 1.0;
    if (audioManager && typeof audioManager.setRate === 'function') {
      audioManager.setRate(numRate);
    }
    handlePlayAudio('にほんごマスターへようこそ', { rate: numRate });
    setAudioPlaying(true);
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
      description: 'En la parte superior encontrarás tu panel de control diario: racha activa, meta diaria (🎯), nivel, partículas y palabras dominadas, indicador del teclado japonés y sincronización en la nube.',
      hiddenTip: '🔔 Notificación Inteligente de Ejercicios: Si revisas un tema curricular o lección pero dejas preguntas sin resolver, la campana te alertará exactamente cuántas tienes pendientes y te llevará a resolverlas con un clic.',
      tab: null
    },
    {
      id: 'daily_goal',
      category: 'Hábitos & Gamificación',
      categoryColor: '#f59e0b',
      title: 'Meta Diaria Personalizada & Notificaciones Móviles',
      subtitle: 'Crea tu hábito diario de estudio y protege tu racha activa',
      icon: Target,
      description: 'Define tu meta diaria (3, 5 o 10 preguntas) y selecciona el tema que prefieras: Mix Inteligente con prioridad FSRS, solo Kanji, Vocabulario, Gramática o Simulacro JLPT. Recibe recordatorios directos en tu teléfono móvil (iOS PWA / Android) para no perder tu racha.',
      hiddenTip: '📱 Notificaciones Móviles Inteligentes: Activa los recordatorios para que tu teléfono te avise si tienes preguntas pendientes antes de que termine el día.',
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
      category: 'Aprender & Generadores IA',
      categoryColor: '#8b5cf6',
      title: 'Historias Interactivas & Ecosistema de Generadores IA',
      subtitle: 'Inmersión comprensible, audio sincronizado y creación personalizada con IA',
      icon: BookOpen,
      description: 'Aprende gramática y vocabulario dentro de historias inmersivas con oraciones sincronizadas, furigana conmutable y Click-to-Save. Además, Nihongo Master incorpora un ecosistema integral de 4 Generadores de Inteligencia Artificial para enriquecer tu aprendizaje en cualquier momento: 1) Generador de Historias JLPT graduadas de N5 a N1 con temáticas y longitudes libres, 2) Generador de Diálogos Situacionales NHK para practicar roleplay oral con micrófono (STT), 3) Generador de Cuentos a partir de tus Palabras Guardadas (SRS) para afianzar el vocabulario que estás memorizando, y 4) Generador dinámico de Quizzes y ejercicios de comprensión.',
      hiddenTip: '🤖 Ecosistema IA de Nihongo Master: 1. Historias JLPT adaptadas por nivel. 2. Roleplay en Conversación NHK con evaluación por voz (STT). 3. ¡Cuentos con tus Palabras Guardadas!: crea historias usando exclusivamente tus palabras en estudio para afianzar el recuerdo a largo plazo. 4. Quizzes y retos interactivos automáticos.',
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
      description: 'Guía detallada y completa de 99 partículas japonesas organizadas por nivel JLPT (N5 a N1: は, が, を, に, で, へ, と, も, から, まで, より, など...), con explicaciones directas, fórmulas sintácticas y ejemplos comentados.',
      hiddenTip: '⚖️ Tablas Comparativas y Práctica Instantánea: Resuelve dudas comunes como cuándo usar "は" frente a "が", o "に" frente a "で", con comparativas visuales y ejercicios prácticos con retroalimentación inmediata.',
      tab: 'particles'
    },
    {
      id: 'jlpt',
      category: 'Recursos & Práctica',
      categoryColor: '#8b5cf6',
      title: 'Simulacros Oficiales JLPT (N5 a N1)',
      subtitle: 'Exámenes completos y por sección con temporizador oficial y práctica guiada',
      icon: Award,
      description: 'Prepárate para la certificación oficial con 80 preguntas auténticas para los 5 niveles (N5 a N1). Incluye Modo Simulacro con cronómetro real y hoja de puntajes (0-180 puntos con corte de aprobación), y Modo Práctica Guiada con explicaciones didácticas paso a paso en español.',
      hiddenTip: '🧠 Repaso de Errores con FSRS: Cualquier pregunta que falles en un simulacro puede añadirse con un solo clic al algoritmo de repetición espaciada FSRS para programar repasos automáticos.',
      tab: 'jlpt'
    },
    {
      id: 'kanji',
      category: 'Recursos & Práctica',
      categoryColor: '#f59e0b',
      title: 'Biblioteca Kanji & Orden de Trazos',
      subtitle: 'Trazos numerados (1, 2, 3...) y práctica interactiva con verificación',
      icon: Languages,
      description: 'Fichas completas de kanjis con orden oficial de trazos numerados (1, 2, 3...) en colores vibrantes, radicales, lecturas On\'yomi (chinas) y Kun\'yomi (japonesas), mnemotécnicas y palabras compuestas sincronizadas.',
      hiddenTip: '✍️ 1. Pestaña "Trazos": Diagrama con números de inicio por trazo, cuadrícula visible (ON/OFF) y navegación paso a paso. 2. Pestaña "Practicar": Dibuja sobre el lienzo con números guía (ON/OFF), animación integrada trazo a trazo y confirmación visual con check (✓).',
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
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="tour-modal-container" 
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tour interactivo de Nihongo Master"
        style={{
          backgroundColor: 'var(--bg-surface, #1e293b)',
          color: 'var(--text-main, #f8fafc)',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
          borderRadius: 20,
          width: '100%',
          maxWidth: 900,
          maxHeight: 'min(92vh, 780px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Top Header Row with Progress and Skip */}
        <div 
          className="tour-modal-header"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: '14px 24px 10px',
            borderBottom: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            flexShrink: 0
          }}
        >
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
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
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
                        className={`stat-badge ${selectedBadge === 'daily_goal' ? 'active-preview' : ''}`}
                        onClick={() => setSelectedBadge('daily_goal')}
                      >
                        <Target size={15} style={{ color: 'var(--accent, #f59e0b)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--accent, #f59e0b)' }}>3/5 hoy</span>
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
                      {selectedBadge === 'daily_goal' && (
                        <div>
                          <strong>🎯 Meta Diaria FSRS:</strong> Desafío diario configurable (3 a 10 preguntas) sobre Kanji, Vocabulario, Gramática o JLPT con repetición espaciada inteligente FSRS y recordatorios push en tu móvil.
                        </div>
                      )}
                      {selectedBadge === 'xp' && (
                        <div>
                          <strong>⭐ Puntos de Experiencia (XP):</strong> Ganas XP al resolver ejercicios, escuchar historias y aprender palabras. Cada 100 XP subes de nivel.
                        </div>
                      )}
                      {selectedBadge === 'particles' && (
                        <div>
                          <strong>🎯 Partículas Dominadas:</strong> Monitorea tu avance en las 99 partículas japonesas organizadas por nivel JLPT (N5 a N1: は, が, を, に, で, より, ほど, にとって, に基づいて...).
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

                {/* Paso: Daily Goal Widget */}
                {currentStep.id === 'daily_goal' && (() => {
                  const sampleQuestions = {
                    all: {
                      tag: 'Mix Inteligente (FSRS Repaso)',
                      sentence: '毎朝 コーヒー [ ___ ] 飲みます。',
                      meaning: '(Cada mañana tomo café)',
                      options: [
                        { text: 'を', isCorrect: true, reason: 'Marca el objeto directo de la acción activa (tomar café).' },
                        { text: 'に', isCorrect: false, reason: 'Indica dirección, destino o tiempo puntual, no el objeto directo.' },
                        { text: 'で', isCorrect: false, reason: 'Indica medio, herramienta o lugar de acción.' },
                        { text: 'は', isCorrect: false, reason: 'Marca el tema principal, pero aquí el objeto directo requiere を.' }
                      ]
                    },
                    kanji: {
                      tag: 'Kanji N5',
                      sentence: '¿Cuál es el significado del ideograma 「水」 y su lectura común?',
                      meaning: '(Lecturas: みず / スイ)',
                      options: [
                        { text: 'Agua (みず)', isCorrect: true, reason: '¡Correcto! 水 significa agua y se pronuncia mizu en kun\'yomi y sui en on\'yomi.' },
                        { text: 'Fuego (ひ)', isCorrect: false, reason: 'Fuego es 火 (ひ / カ).' },
                        { text: 'Árbol (き)', isCorrect: false, reason: 'Árbol es 木 (き / モク).' },
                        { text: 'Tierra (つち)', isCorrect: false, reason: 'Tierra es 土 (つち / ド).' }
                      ]
                    },
                    vocab: {
                      tag: 'Vocabulario N5',
                      sentence: '田中さんは [ ___ ] ですか。はい、大学生です。',
                      meaning: '(¿El Sr. Tanaka es estudiante? Sí, es universitario)',
                      options: [
                        { text: 'がくせい (Estudiante)', isCorrect: true, reason: '¡Correcto! 学生 (がくせい) significa estudiante.' },
                        { text: 'せんせい (Profesor)', isCorrect: false, reason: '先生 (せんせい) significa profesor o maestro.' },
                        { text: 'いしゃ (Médico)', isCorrect: false, reason: '医者 (いしゃ) significa médico.' },
                        { text: 'かいしゃいん (Empleado)', isCorrect: false, reason: '会社員 (かいしゃいん) significa empleado de empresa.' }
                      ]
                    },
                    grammar: {
                      tag: 'Gramática N5',
                      sentence: 'ここで 写真を [ ___ ] ください。',
                      meaning: '(Por favor tome fotos aquí)',
                      options: [
                        { text: 'とって (Forma て)', isCorrect: true, reason: 'La petición cortés se forma con Verbo [Forma て] + ください (撮ってください).' },
                        { text: 'とります (Forma ます)', isCorrect: false, reason: 'No se une la forma ます directamente con ください.' },
                        { text: 'とり (Raíz)', isCorrect: false, reason: 'La raíz por sí sola no se combina con ください para peticiones.' },
                        { text: 'とる (Diccionario)', isCorrect: false, reason: 'La forma diccionario no se usa directamente con ください.' }
                      ]
                    },
                    jlpt: {
                      tag: 'Simulacro JLPT N5',
                      sentence: 'きょうは てんきが [ ___ ] ですね。',
                      meaning: '(Hoy hace buen tiempo, ¿verdad?)',
                      options: [
                        { text: 'いい', isCorrect: true, reason: 'いい (bueno) modifica directamente a です en tiempo presente afirmativo.' },
                        { text: 'よく', isCorrect: false, reason: 'よく es la forma adverbial o conectiva, no predica solo con です.' },
                        { text: 'いいでした', isCorrect: false, reason: 'En pasado sería よかったです, no いいでした.' },
                        { text: 'よかった', isCorrect: false, reason: 'Concluiría en pasado (hizo buen tiempo), pero la oración es presente.' }
                      ]
                    }
                  };

                  const currentQ = sampleQuestions[tourGoalCategory] || sampleQuestions.all;

                  return (
                    <div className="tour-widget-inner daily-goal-widget" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Cabecera del Reto Diario con progreso */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 10, padding: '8px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Target size={18} style={{ color: '#f59e0b' }} />
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              Meta de Hoy: {tourGoalAnswer !== null ? '4' : '3'} / 5 preguntas
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Racha protegida: 5 días 🔥 · +20 XP por acierto
                            </div>
                          </div>
                        </div>

                        <div style={{ width: 80 }}>
                          <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: tourGoalAnswer !== null ? '80%' : '60%', 
                                height: '100%', 
                                background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                                transition: 'width 0.3s ease'
                              }} 
                            />
                          </div>
                          <div style={{ fontSize: '0.65rem', textAlign: 'right', color: 'var(--text-muted)', marginTop: 2 }}>
                            {tourGoalAnswer !== null ? '80%' : '60%'}
                          </div>
                        </div>
                      </div>

                      {/* Selector de categoría temático */}
                      <div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                          Elige el tema de tu meta diaria para probar:
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {[
                            { id: 'all', label: '🎯 Mix FSRS' },
                            { id: 'kanji', label: '🈁 Kanji' },
                            { id: 'vocab', label: '📚 Vocabulario' },
                            { id: 'grammar', label: '🧩 Gramática' },
                            { id: 'jlpt', label: '🏆 JLPT N5' }
                          ].map(cat => (
                            <button
                              key={cat.id}
                              type="button"
                              className={`btn btn-sm ${tourGoalCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
                              onClick={() => {
                                setTourGoalCategory(cat.id);
                                setTourGoalAnswer(null);
                              }}
                              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tarjeta de Pregunta Interactiva */}
                      <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
                            {currentQ.tag}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handlePlayAudio(currentQ.sentence.replace(/\[ ___ \]/g, ''))}
                            style={{ padding: '2px 6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Volume2 size={12} /> Audio
                          </button>
                        </div>

                        <div className="jp-text" style={{ fontSize: '1.05rem', fontWeight: 700, margin: '6px 0' }}>
                          {currentQ.sentence}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                          {currentQ.meaning}
                        </div>

                        {/* Opciones */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                          {currentQ.options.map((opt, idx) => {
                            const isSelected = tourGoalAnswer === idx;
                            let btnStyle = 'btn-outline';
                            if (tourGoalAnswer !== null) {
                              if (opt.isCorrect) btnStyle = 'btn-primary';
                              else if (isSelected) btnStyle = 'btn-danger';
                            }
                            return (
                              <button
                                key={idx}
                                type="button"
                                className={`btn btn-sm ${btnStyle}`}
                                onClick={() => setTourGoalAnswer(idx)}
                                style={{ fontSize: '0.8rem', textAlign: 'left', justifyContent: 'flex-start', padding: '6px 10px' }}
                              >
                                <strong>{String.fromCharCode(65 + idx)}.</strong> {opt.text}
                              </button>
                            );
                          })}
                        </div>

                        {/* Feedback Didáctico y FSRS */}
                        {tourGoalAnswer !== null && (
                          <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: currentQ.options[tourGoalAnswer]?.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${currentQ.options[tourGoalAnswer]?.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, fontSize: '0.75rem', lineHeight: 1.4 }}>
                            {currentQ.options[tourGoalAnswer]?.isCorrect ? (
                              <div>
                                <span style={{ color: 'var(--success, #10b981)', fontWeight: 700 }}>✓ ¡Excelente!</span> {currentQ.options[tourGoalAnswer].reason}
                                <div style={{ marginTop: 4, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Sparkles size={12} style={{ color: '#f59e0b' }} />
                                  <span>Algoritmo FSRS: Próximo repaso programado en 3 días (Retención 90%).</span>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span style={{ color: 'var(--danger, #ef4444)', fontWeight: 700 }}>✕ Respuesta incorrecta.</span> {currentQ.options[tourGoalAnswer]?.reason}
                                <div style={{ marginTop: 4, color: 'var(--text-muted)' }}>
                                  La opción correcta era: <strong>{currentQ.options.find(o => o.isCorrect)?.text}</strong>. FSRS la volverá a repasar hoy.
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Demostración de Notificación Push Móvil */}
                      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tourGoalNotifTested ? 8 : 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--text-main)', fontWeight: 600 }}>
                            <Bell size={14} style={{ color: '#f59e0b' }} />
                            <span>Recordatorio Push en tu Celular (PWA / Web):</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setTourGoalNotifTested(prev => !prev)}
                            style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                          >
                            {tourGoalNotifTested ? 'Ocultar vista previa' : 'Simular notificación móvil 📲'}
                          </button>
                        </div>

                        {tourGoalNotifTested && (
                          <div style={{ background: 'var(--bg-main)', border: '1px solid #f59e0b', borderRadius: 8, padding: '8px 10px', display: 'flex', gap: 8, alignItems: 'flex-start', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                            <div style={{ background: '#f59e0b', color: '#fff', borderRadius: 6, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 800 }}>
                              日
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)' }}>Nihongo Master</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Ahora</span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-main)', marginTop: 2, lineHeight: 1.3 }}>
                                🎯 ¡Casi completas tu meta diaria! Te faltan 2 preguntas para proteger tu racha de 5 días 🔥. Toca para responderlas ahora.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botón para abrir el modal real */}
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.__nihongoOpenDailyGoal) {
                            window.__nihongoOpenDailyGoal();
                          }
                        }}
                        style={{ width: '100%', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <Target size={14} /> Abrir Reto Diario Real Ahora
                      </button>
                    </div>
                  );
                })()}

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

                {/* Paso 5: Story & Ecosistema de Generadores IA Widget */}
                {currentStep.id === 'story' && (
                  <div className="tour-widget-inner story-widget">
                    {/* Sub-tabs: Lectura interactiva vs 4 Generadores IA */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${storyTourTab === 'reading' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setStoryTourTab('reading')}
                        style={{ fontSize: '0.74rem', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <BookOpen size={13} />
                        <span>1. Lectura & Furigana</span>
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${storyTourTab === 'ai_tools' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setStoryTourTab('ai_tools')}
                        style={{ fontSize: '0.74rem', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Sparkles size={13} />
                        <span>2. Suite 4 Generadores IA</span>
                      </button>
                    </div>

                    {storyTourTab === 'reading' ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Frase interactiva con audio oracional y click-to-save:</span>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setFuriganaVisible(prev => !prev)}
                            style={{ fontSize: '0.73rem', display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px' }}
                          >
                            {furiganaVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                            <span>Furigana: {furiganaVisible ? 'ON' : 'OFF'}</span>
                          </button>
                        </div>

                        <div className="story-sentence-preview">
                          <div className="jp-text story-jp-text" style={{ fontSize: '1.15rem' }}>
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

                          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            &quot;Hoy hace muy buen clima.&quot;
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handlePlayAudio('きょうはてんきがよいです')}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', padding: '3px 8px' }}
                            >
                              <Play size={13} /> Escuchar pronunciación
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => setSavedWordDemo(true)}
                              style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                            >
                              Tocar palabra &quot;天気&quot;
                            </button>
                          </div>

                          {savedWordDemo && (
                            <div className="saved-word-popover" style={{ marginTop: 8, padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                              <div style={{ fontSize: '0.82rem' }}>
                                <strong>天気 (てんき)</strong>: Clima / Tiempo atmosférico
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--success)', marginTop: 2, fontWeight: 600 }}>
                                ⭐ ¡Guardada en tu banco léxico personal (SRS)!
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* SUITE 4 GENERADORES IA */
                      <div className="tour-ai-suite-showcase">
                        {/* Selector de los 4 generadores */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 10 }}>
                          {[
                            { id: 0, title: '📖 Historias JLPT', badge: 'N5 a N1' },
                            { id: 1, title: '🎙️ Diálogos NHK', badge: 'Roleplay' },
                            { id: 2, title: '🪄 Con Mis Palabras', badge: 'Refuerzo SRS' },
                            { id: 3, title: '⚡ Quizzes y Retos', badge: 'Comprensión' }
                          ].map(gen => (
                            <button
                              key={gen.id}
                              type="button"
                              onClick={() => setSelectedAiGen(gen.id)}
                              className={`btn btn-sm ${selectedAiGen === gen.id ? 'btn-primary' : 'btn-outline'}`}
                              style={{
                                fontSize: '0.72rem',
                                padding: '4px 6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                textAlign: 'left'
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{gen.title}</span>
                              <span style={{ fontSize: '0.64rem', opacity: 0.85, padding: '1px 4px', borderRadius: 4, background: 'rgba(0,0,0,0.1)' }}>
                                {gen.badge}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Tarjeta de demostración del generador seleccionado */}
                        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: '0.8rem' }}>
                          {selectedAiGen === 0 && (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem' }}>
                                <BookOpen size={14} />
                                <span>Generador de Historias JLPT Adaptativas</span>
                              </div>
                              <p style={{ margin: '0 0 6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Eliges tu nivel (N5-N1), longitud y temática (viajes, misterio, vida diaria). La IA genera lectura con audio Edge TTS, furigana y glosario.
                              </p>
                              <div style={{ background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', marginBottom: 6 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Prompt de ejemplo: &quot;Viaje en Shinkansen a Kioto (N5)&quot;</div>
                                <div className="jp-text" style={{ fontSize: '0.92rem', fontWeight: 600 }}>
                                  新幹線で京都へ行きます。窓から富士山が見えます。
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                  &quot;Voy a Kioto en tren bala. Desde la ventana se ve el Monte Fuji.&quot;
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => handlePlayAudio('しんかんせんできょうとへいきます。まどからふじさんがみえます。')}
                                style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <Volume2 size={12} /> Probar audio generado
                              </button>
                            </div>
                          )}

                          {selectedAiGen === 1 && (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#ec4899', fontWeight: 700, fontSize: '0.82rem' }}>
                                <Mic size={14} />
                                <span>Roleplay NHK & Diálogos Situacionales</span>
                              </div>
                              <p style={{ margin: '0 0 6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Genera conversaciones reales (restaurante, hotel, aeropuerto) y practica intercambiando roles hablando al micrófono con evaluación de voz (STT).
                              </p>
                              <div style={{ background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', marginBottom: 6 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Situación: En un restaurante de ramen</div>
                                <div style={{ fontSize: '0.78rem', marginBottom: 2 }}>
                                  <strong>Mesero:</strong> <span className="jp-text">いらっしゃいませ！何名様ですか？</span>
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>
                                  <strong>Tú (Voz):</strong> <span className="jp-text">一人です。豚骨ラーメンをお願いします。</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => handlePlayAudio('いらっしゃいませ！なんめいさまですか？')}
                                style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <Volume2 size={12} /> Oír diálogo del mesero
                              </button>
                            </div>
                          )}

                          {selectedAiGen === 2 && (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#10b981', fontWeight: 700, fontSize: '0.82rem' }}>
                                <Sparkles size={14} />
                                <span>Cuentos a Medida con Tus Palabras Guardadas</span>
                              </div>
                              <p style={{ margin: '0 0 6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                ¡Exclusivo de Nihongo Master! En la pestaña &quot;Guardados&quot;, la IA teje una historia usando únicamente las palabras que tienes en estudio (SRS).
                              </p>
                              <div style={{ background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', marginBottom: 6 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                                  Tus palabras integradas: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>天気 · 桜 · 友達</span>
                                </div>
                                <div className="jp-text" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                                  今日はいい<strong>天気</strong>なので、<strong>友達</strong>とお花見に行きました。満開の<strong>桜</strong>が綺麗でした。
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => handlePlayAudio('きょうはいいてんきなので、ともだちとおはなみにいきました。まんかいのさくらがきれいです。')}
                                style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <Volume2 size={12} /> Escuchar historia SRS
                              </button>
                            </div>
                          )}

                          {selectedAiGen === 3 && (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#f59e0b', fontWeight: 700, fontSize: '0.82rem' }}>
                                <CheckCircle2 size={14} />
                                <span>Quizzes & Desafíos de Comprensión Dinámicos</span>
                              </div>
                              <p style={{ margin: '0 0 6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Al finalizar cualquier lectura o lección, la IA genera preguntas interactivas de opción múltiple y retos de partículas para validar tu aprendizaje.
                              </p>
                              <div style={{ background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 4 }}>
                                  ¿Por qué fueron al parque a ver los cerezos?
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  <div style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 600 }}>
                                    ✓ Porque hacía buen clima (いい天気)
                                  </div>
                                  <div style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 4, color: 'var(--text-muted)' }}>
                                    ✕ Porque era el cumpleaños de su amigo
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
                {currentStep.id === 'vocab' && (() => {
                  const pitchData = {
                    heiban: {
                      name: 'Heiban (Plano [0])',
                      word: 'さくら',
                      romaji: 'sakura',
                      meaning: 'Flor de cerezo',
                      typeBadge: '[0] Heiban',
                      rule: 'Empieza bajo en la 1ª mora, sube y permanece ALTO en la palabra e incluso en la partícula [が]. No existe caída tonal.',
                      path: 'M 70,68 L 140,26 L 210,26 L 280,26',
                      dropMark: null,
                      nodes: [
                        { num: '1', kana: 'さ', pitch: 'low', x: 70, y: 68 },
                        { num: '2', kana: 'く', pitch: 'high', x: 140, y: 26 },
                        { num: '3', kana: 'ら', pitch: 'high', x: 210, y: 26 },
                        { num: 'P', kana: 'が', pitch: 'high', x: 280, y: 26, isParticle: true }
                      ]
                    },
                    atamadaka: {
                      name: 'Atamadaka (Alto [1])',
                      word: 'あめ',
                      romaji: 'áme',
                      meaning: 'Lluvia',
                      typeBadge: '[1] Atamadaka',
                      rule: 'Inicia ALTO en la 1ª mora y cae inmediatamente a BAJO. Todas las moras posteriores y la partícula [が] se pronuncian con tono bajo.',
                      path: 'M 80,26 L 175,68 L 270,68',
                      dropMark: { x: 128, y: 47 },
                      nodes: [
                        { num: '1', kana: 'あ', pitch: 'high', x: 80, y: 26 },
                        { num: '2', kana: 'め', pitch: 'low', x: 175, y: 68 },
                        { num: 'P', kana: 'が', pitch: 'low', x: 270, y: 68, isParticle: true }
                      ]
                    },
                    nakadaka: {
                      name: 'Nakadaka (Medio [2])',
                      word: 'あなた',
                      romaji: 'anáta',
                      meaning: 'Tú',
                      typeBadge: '[2] Nakadaka',
                      rule: 'La 1ª mora es baja, sube a ALTO en la 2ª y cae antes de que termine la palabra. La partícula [が] se mantiene baja.',
                      path: 'M 70,68 L 140,26 L 210,68 L 280,68',
                      dropMark: { x: 175, y: 47 },
                      nodes: [
                        { num: '1', kana: 'あ', pitch: 'low', x: 70, y: 68 },
                        { num: '2', kana: 'な', pitch: 'high', x: 140, y: 26 },
                        { num: '3', kana: 'た', pitch: 'low', x: 210, y: 68 },
                        { num: 'P', kana: 'が', pitch: 'low', x: 280, y: 68, isParticle: true }
                      ]
                    },
                    odaka: {
                      name: 'Odaka (Final [3])',
                      word: 'おとこ',
                      romaji: 'otokó',
                      meaning: 'Hombre',
                      typeBadge: '[3] Odaka',
                      rule: 'Toda la palabra se pronuncia ALTA hasta el final, pero ¡cae bruscamente sobre la partícula [が]! Esta caída la distingue del Heiban.',
                      path: 'M 70,68 L 140,26 L 210,26 L 280,68',
                      dropMark: { x: 245, y: 47 },
                      nodes: [
                        { num: '1', kana: 'お', pitch: 'low', x: 70, y: 68 },
                        { num: '2', kana: 'と', pitch: 'high', x: 140, y: 26 },
                        { num: '3', kana: 'こ', pitch: 'high', x: 210, y: 26 },
                        { num: 'P', kana: 'が', pitch: 'low', x: 280, y: 68, isParticle: true }
                      ]
                    }
                  };

                  const currentPattern = pitchData[pitchPattern] || pitchData.heiban;

                  return (
                    <div className="tour-widget-inner pitch-widget">
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                        Selecciona un patrón de Pitch Accent para ver su gráfica de entonación:
                      </div>
                      
                      <div className="pitch-tabs-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                        {Object.entries(pitchData).map(([key, item]) => (
                          <button
                            key={key}
                            type="button"
                            className={`btn btn-sm ${pitchPattern === key ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => {
                              setPitchPattern(key);
                              handlePlayAudio(item.word);
                            }}
                            style={{ fontSize: '0.73rem', padding: '3px 8px' }}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>

                      {/* Tarjeta con gráfico SVG de Pitch Accent conectado */}
                      <div className="pitch-graph-card" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="jp-text" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                              {currentPattern.word}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              ({currentPattern.romaji} · {currentPattern.meaning})
                            </span>
                            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontWeight: 700 }}>
                              {currentPattern.typeBadge}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handlePlayAudio(currentPattern.word)}
                            style={{ padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                          >
                            <Volume2 size={13} /> Escuchar
                          </button>
                        </div>

                        {/* Gráfico SVG de curva de entonación conectada */}
                        <div style={{ width: '100%', position: 'relative' }}>
                          <svg viewBox="0 0 350 96" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                            <defs>
                              <linearGradient id="pitchGradTour" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#3b82f6" />
                              </linearGradient>
                            </defs>

                            {/* Líneas guía punteadas para Alto y Bajo */}
                            <line x1="58" y1="26" x2="330" y2="26" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
                            <line x1="58" y1="68" x2="330" y2="68" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />

                            {/* Etiquetas laterales de nivel de tono */}
                            <text x="8" y="29" fill="var(--text-muted)" fontSize="9.5" fontWeight="700">Alto (高)</text>
                            <text x="8" y="71" fill="var(--text-muted)" fontSize="9.5" fontWeight="700">Bajo (低)</text>

                            {/* Línea continua conectando todas las moras */}
                            <path
                              d={currentPattern.path}
                              fill="none"
                              stroke="url(#pitchGradTour)"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Indicador de caída tonal (Downstep / 下がり目) */}
                            {currentPattern.dropMark && (
                              <g transform={`translate(${currentPattern.dropMark.x}, ${currentPattern.dropMark.y})`}>
                                <line x1="0" y1="-8" x2="0" y2="8" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />
                                <polygon points="-4,-10 4,-10 0,-4" fill="#ef4444" />
                                <text x="0" y="-14" fill="#ef4444" fontSize="8" fontWeight="800" textAnchor="middle">▼ Caída</text>
                              </g>
                            )}

                            {/* Nodos con número de mora y sílaba kana */}
                            {currentPattern.nodes.map((node, i) => (
                              <g key={i}>
                                {/* Halo exterior difuminado */}
                                <circle
                                  cx={node.x}
                                  cy={node.y}
                                  r="12"
                                  fill={node.pitch === 'high' ? 'rgba(99, 102, 241, 0.16)' : 'rgba(100, 116, 139, 0.1)'}
                                />
                                {/* Círculo principal del nodo */}
                                <circle
                                  cx={node.x}
                                  cy={node.y}
                                  r="9.5"
                                  fill={node.isParticle ? '#f59e0b' : (node.pitch === 'high' ? 'var(--primary)' : 'var(--bg-surface)')}
                                  stroke={node.isParticle ? '#d97706' : (node.pitch === 'high' ? 'var(--primary)' : 'var(--border)')}
                                  strokeWidth="2"
                                />
                                {/* Número o 'P' dentro del nodo */}
                                <text
                                  x={node.x}
                                  y={node.y + 3.5}
                                  fill={node.isParticle ? '#ffffff' : (node.pitch === 'high' ? '#ffffff' : 'var(--text-muted)')}
                                  fontSize="9.5"
                                  fontWeight="800"
                                  textAnchor="middle"
                                >
                                  {node.num}
                                </text>
                                {/* Sílaba kana sobre o debajo del nodo */}
                                <text
                                  x={node.x}
                                  y={node.y === 26 ? 12 : 90}
                                  fill={node.isParticle ? '#d97706' : 'var(--text-main)'}
                                  fontSize="12.5"
                                  fontWeight="800"
                                  fontFamily="var(--font-jp)"
                                  textAnchor="middle"
                                >
                                  {node.isParticle ? `[${node.kana}]` : node.kana}
                                </text>
                              </g>
                            ))}
                          </svg>
                        </div>

                        {/* Explicación de la regla fonética y comportamiento de partículas */}
                        <div style={{ marginTop: 10, fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45, background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                          💡 <strong>Regla fonética:</strong> {currentPattern.rule}
                        </div>
                      </div>
                    </div>
                  );
                })()}

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

                {/* Paso: JLPT Widget */}
                {currentStep.id === 'jlpt' && (() => {
                  const jlptLevelData = {
                    N5: {
                      title: 'JLPT N5',
                      section: 'Sección: 文字・語彙 (Vocabulario & Kanjis)',
                      sentence: '毎朝、新聞を [ ___ ]。',
                      meaning: '(Cada mañana leo el periódico)',
                      options: [
                        { text: 'よみます (Leer)', isCorrect: true, reason: '新聞 (しんぶん / periódico) se lee, por lo que el verbo correspondiente es よみます.' },
                        { text: 'ききます (Escuchar)', isCorrect: false, reason: 'ききます se usa para radio (ラジオ) o música (おんがく).' },
                        { text: 'たべます (Comer)', isCorrect: false, reason: 'たべます se usa para comida o alimentos.' },
                        { text: 'いきます (Ir)', isCorrect: false, reason: 'いきます indica desplazamiento a un destino.' }
                      ],
                      totalScore: '180 pts (Aprobación: 90 pts)',
                      timeLimit: '25 min'
                    },
                    N4: {
                      title: 'JLPT N4',
                      section: 'Sección: 文法 (Gramática)',
                      sentence: '田中さんは [ ___ ] から、あしたのパーティーに来ません。',
                      meaning: '(Como el Sr. Tanaka está ocupado, no vendrá a la fiesta de mañana)',
                      options: [
                        { text: 'いそがしい (Forma Llena/Plana)', isCorrect: true, reason: 'Antes de la conjunción causal から se utiliza la forma plana directa en adjetivos -i.' },
                        { text: 'いそがしくて (Forma て)', isCorrect: false, reason: 'La forma て no se combina antes de から para expresar causa.' },
                        { text: 'いそがしかった (Pasado)', isCorrect: false, reason: 'La fiesta es mañana (あした); se describe su estado presente.' },
                        { text: 'いそがし (Incompleto)', isCorrect: false, reason: 'Falta la desinencia い del adjetivo.' }
                      ],
                      totalScore: '180 pts (Aprobación: 90 pts)',
                      timeLimit: '30 min'
                    },
                    N3: {
                      title: 'JLPT N3',
                      section: 'Sección: 文法・表現 (Patrones Gramaticales)',
                      sentence: 'どんなに [ ___ ]、あきらめないで最後までやり抜くつもりだ。',
                      meaning: '(Por muy difícil/doloroso que sea, no me rendiré y llegaré hasta el final)',
                      options: [
                        { text: 'つらくても (Por muy... que sea)', isCorrect: true, reason: 'El patrón どんなに + [Forma て + も] expresa concesión extrema ("por más que / sin importar cuánto").' },
                        { text: 'つらいなら (Condicional)', isCorrect: false, reason: 'なら expresa condición sobre suposición del interlocutor, no concesión con どんなに.' },
                        { text: 'つらければ (Condicional ば)', isCorrect: false, reason: 'ば expresa condición lógica simple ("si es difícil").' },
                        { text: 'つらいのに (A pesar de que)', isCorrect: false, reason: 'のに indica contraste de hechos reales consumados, no acompaña a どんなに.' }
                      ],
                      totalScore: '180 pts (Aprobación: 95 pts)',
                      timeLimit: '40 min'
                    },
                    N2: {
                      title: 'JLPT N2',
                      section: 'Sección: 語彙・コロケーション (Colocaciones Léxicas)',
                      sentence: '健康診断の [ ___ ]、特に異常は見つからなかった。',
                      meaning: '(Como resultado del chequeo médico, no se encontraron anomalías)',
                      options: [
                        { text: '結果 (けっか / Resultado)', isCorrect: true, reason: '〜の結果 expresa el desenlace o reporte tras una prueba o examen formal.' },
                        { text: '結論 (けつろん / Conclusión)', isCorrect: false, reason: '結論 se refiere a deducciones lógicas de un debate o ensayo.' },
                        { text: '成果 (せいか / Logro/Fruto)', isCorrect: false, reason: '成果 denota frutos positivos fruto de un esfuerzo o investigación.' },
                        { text: '結末 (けつまつ / Desenlace narrativo)', isCorrect: false, reason: '結末 se usa para el final o desenlace de una novela o película.' }
                      ],
                      totalScore: '180 pts (Aprobación: 90 pts)',
                      timeLimit: '50 min'
                    },
                    N1: {
                      title: 'JLPT N1 (Experto / Nativo)',
                      section: 'Sección: 上級文法 (Gramática Avanzada)',
                      sentence: '彼の実力をもって [ ___ ]、この難関試験の合格は容易ではない。',
                      meaning: '(Incluso con su notable habilidad, aprobar este examen no será fácil)',
                      options: [
                        { text: 'しても (〜をもってしても)', isCorrect: true, reason: 'El patrón 〜をもってしても indica que aun disponiendo de medios extraordinarios, lograrlo es casi imposible.' },
                        { text: 'すれば (Condicional)', isCorrect: false, reason: 'をもってすれば expresa "si se cuenta con...", de tono positivo, que no encaja con 容易ではない.' },
                        { text: 'なれば (Sin sentido)', isCorrect: false, reason: 'No existe la construcción grammatica をもってなれば.' },
                        { text: 'おいて (Lugar)', isCorrect: false, reason: 'において indica marco temporal o espacial, no concesión de capacidad.' }
                      ],
                      totalScore: '180 pts (Aprobación: 100 pts)',
                      timeLimit: '60 min'
                    }
                  };

                  const currentData = jlptLevelData[tourJlptLevel] || jlptLevelData.N5;

                  return (
                    <div className="tour-widget-inner jlpt-widget" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Selector de Nivel JLPT Oficial (N5 a N1 estrictamente) */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            Nivel Oficial de Certificación JLPT:
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>
                            {currentData.totalScore}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {['N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
                            <button
                              key={lvl}
                              type="button"
                              className={`btn btn-sm ${tourJlptLevel === lvl ? 'btn-primary' : 'btn-outline'}`}
                              onClick={() => {
                                setTourJlptLevel(lvl);
                                setTourJlptAnswer(null);
                                setTourJlptSrsSaved(false);
                              }}
                              style={{ flex: 1, minWidth: 44, fontWeight: 700, fontSize: '0.8rem', padding: '4px 0' }}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Selector de Modo: Simulacro vs Práctica */}
                      <div style={{ display: 'flex', gap: 6, background: 'var(--bg-surface)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
                        <button
                          type="button"
                          className={`btn btn-sm ${tourJlptMode === 'practice' ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => setTourJlptMode('practice')}
                          style={{ flex: 1, fontSize: '0.72rem', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        >
                          <BookOpen size={12} /> Práctica Guiada
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${tourJlptMode === 'exam' ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => setTourJlptMode('exam')}
                          style={{ flex: 1, fontSize: '0.72rem', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        >
                          <Award size={12} /> Simulacro Cronometrado
                        </button>
                      </div>

                      {/* Tarjeta de Pregunta JLPT */}
                      <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            {currentData.section}
                          </span>
                          {tourJlptMode === 'exam' ? (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 3 }}>
                              ⏱️ {currentData.timeLimit}
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => handlePlayAudio(currentData.sentence.replace(/\[ ___ \]/g, ''))}
                              style={{ padding: '2px 6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Volume2 size={12} /> Audio
                            </button>
                          )}
                        </div>

                        <div className="jp-text" style={{ fontSize: '1.05rem', fontWeight: 700, margin: '6px 0' }}>
                          {currentData.sentence}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                          {currentData.meaning}
                        </div>

                        {/* Opciones */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                          {currentData.options.map((opt, idx) => {
                            const isSelected = tourJlptAnswer === idx;
                            let btnStyle = 'btn-outline';
                            if (tourJlptAnswer !== null) {
                              if (opt.isCorrect) btnStyle = 'btn-primary';
                              else if (isSelected) btnStyle = 'btn-danger';
                            }
                            return (
                              <button
                                key={idx}
                                type="button"
                                className={`btn btn-sm ${btnStyle}`}
                                onClick={() => setTourJlptAnswer(idx)}
                                style={{ fontSize: '0.8rem', textAlign: 'left', justifyContent: 'flex-start', padding: '6px 10px' }}
                              >
                                <strong>{idx + 1}.</strong> {opt.text}
                              </button>
                            );
                          })}
                        </div>

                        {/* Feedback / Explicación Didáctica / Guardar en FSRS */}
                        {tourJlptAnswer !== null && (
                          <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: currentData.options[tourJlptAnswer]?.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${currentData.options[tourJlptAnswer]?.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, fontSize: '0.75rem', lineHeight: 1.4 }}>
                            {currentData.options[tourJlptAnswer]?.isCorrect ? (
                              <div>
                                <span style={{ color: 'var(--success, #10b981)', fontWeight: 700 }}>✓ ¡Respuesta Correcta!</span> {currentData.options[tourJlptAnswer].reason}
                              </div>
                            ) : (
                              <div>
                                <span style={{ color: 'var(--danger, #ef4444)', fontWeight: 700 }}>✕ Opción incorrecta.</span> {currentData.options[tourJlptAnswer]?.reason}
                              </div>
                            )}

                            {/* Integración con FSRS */}
                            <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {tourJlptSrsSaved ? '🧠 Pregunta guardada en tu mazo de repaso FSRS' : '¿Deseas repasar este punto periódicamente?'}
                              </span>
                              <button
                                type="button"
                                className={`btn btn-sm ${tourJlptSrsSaved ? 'btn-success' : 'btn-outline'}`}
                                onClick={() => setTourJlptSrsSaved(true)}
                                disabled={tourJlptSrsSaved}
                                style={{ fontSize: '0.68rem', padding: '2px 8px' }}
                              >
                                {tourJlptSrsSaved ? '✓ En Repaso FSRS' : '+ Añadir a FSRS'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botón directo a la sección JLPT */}
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleExploreTab('jlpt')}
                        style={{ width: '100%', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#8b5cf6', borderColor: '#8b5cf6' }}
                      >
                        <Award size={14} /> Ir a la Sección de Exámenes JLPT ({tourJlptLevel})
                      </button>
                    </div>
                  );
                })()}

                {/* Paso 10: Kanji Widget */}
                {currentStep.id === 'kanji' && (() => {
                  const STROKE_LABELS = {
                    1: 'Trazo 1: Línea vertical descendente (左縦)',
                    2: 'Trazo 2: Horizontal con ángulo hacia abajo (横折)',
                    3: 'Trazo 3: Barra horizontal media (中横)',
                    4: 'Trazo 4: Barra horizontal base de cierre (下横)'
                  };

                  const handleTriggerStrokeAnimation = () => {
                    if (kanjiTimerRef.current) clearInterval(kanjiTimerRef.current);
                    setKanjiAnimating(true);
                    setTourKanjiSuccess(false);
                    setKanjiStrokeStep(1);
                    handlePlayAudio('にち');

                    let step = 1;
                    kanjiTimerRef.current = setInterval(() => {
                      step += 1;
                      if (step <= 4) {
                        setKanjiStrokeStep(step);
                      } else {
                        clearInterval(kanjiTimerRef.current);
                        kanjiTimerRef.current = null;
                        setKanjiAnimating(false);
                        setTourKanjiSuccess(true);
                        // Mantener el carácter completo visible tras finalizar
                        setTimeout(() => setKanjiStrokeStep(0), 1200);
                      }
                    }, 550);
                  };

                  const handleOpenRealDrawingModal = () => {
                    if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                      window.__nihongoOpenPracticePad({
                        text: '日',
                        kana: 'にち / ひ',
                        title: 'Práctica de Trazos: 日 (Sol / Día)',
                        source: 'kanji',
                        initialChar: '日',
                        initialTab: 'stroke_quiz'
                      });
                    }
                  };

                  return (
                    <div className="tour-widget-inner kanji-widget">
                      <div className="kanji-demo-card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        {/* Lienzo SVG con cuadrícula tradicional y animación trazo a trazo */}
                        <div 
                          style={{
                            width: 110,
                            height: 110,
                            background: '#ffffff',
                            border: tourKanjiSuccess ? '2px solid #10b981' : '1.5px solid #cbd5e1',
                            borderRadius: 12,
                            position: 'relative',
                            flexShrink: 0,
                            boxShadow: tourKanjiSuccess ? '0 3px 14px rgba(16, 185, 129, 0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
                            transition: 'all 0.3s ease',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Check animado en la esquina superior derecha */}
                          {tourKanjiSuccess && !kanjiAnimating && (
                            <div style={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              zIndex: 10,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              pointerEvents: 'none'
                            }}>
                              <div style={{
                                position: 'absolute',
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: '#10b981',
                                animation: 'checkRipple 1.4s ease-out infinite'
                              }} />
                              <div style={{
                                position: 'relative',
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.45)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                animation: 'kanjiCheckPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                              }}>
                                <Check size={13} strokeWidth={3} />
                              </div>
                            </div>
                          )}

                          {/* Líneas guía de cuadrícula 米字格 Mizige bien marcadas */}
                          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, borderLeft: '1.2px dashed #94a3b8', opacity: 0.7 }} />
                          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, borderTop: '1.2px dashed #94a3b8', opacity: 0.7 }} />
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(45deg, transparent 49.5%, rgba(203, 213, 225, 0.8) 50%, transparent 50.5%), linear-gradient(-45deg, transparent 49.5%, rgba(203, 213, 225, 0.8) 50%, transparent 50.5%)' }} />

                          {/* SVG con los 4 trazos exactos de 日 y sus números de orden */}
                          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                            {/* Silueta tenue de fondo para calcar */}
                            <g stroke="rgba(148, 163, 184, 0.28)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none">
                              <path d="M 28 20 L 28 82" />
                              <path d="M 28 20 L 74 20 L 74 82" />
                              <path d="M 28 51 L 74 51" />
                              <path d="M 28 82 L 74 82" />
                            </g>

                            {/* Trazo 1 (Vertical Izquierdo: Rojo) */}
                            {(kanjiStrokeStep === 0 || kanjiStrokeStep >= 1) && (
                              <path
                                d="M 28 20 L 28 82"
                                fill="none"
                                stroke={tourKanjiMultiColor ? '#ef4444' : '#1e293b'}
                                strokeWidth="9.5"
                                strokeLinecap="round"
                                style={{
                                  transition: 'stroke 0.2s ease'
                                }}
                              />
                            )}

                            {/* Trazo 2 (Horizontal Superior y Vertical Derecho: Azul) */}
                            {(kanjiStrokeStep === 0 || kanjiStrokeStep >= 2) && (
                              <path
                                d="M 28 20 L 74 20 L 74 82"
                                fill="none"
                                stroke={tourKanjiMultiColor ? '#3b82f6' : '#1e293b'}
                                strokeWidth="9.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                  transition: 'stroke 0.2s ease'
                                }}
                              />
                            )}

                            {/* Trazo 3 (Barra Central: Verde Esmeralda) */}
                            {(kanjiStrokeStep === 0 || kanjiStrokeStep >= 3) && (
                              <path
                                d="M 28 51 L 74 51"
                                fill="none"
                                stroke={tourKanjiMultiColor ? '#10b981' : '#1e293b'}
                                strokeWidth="9"
                                strokeLinecap="round"
                                style={{ transition: 'stroke 0.2s ease' }}
                              />
                            )}

                            {/* Trazo 4 (Barra Inferior de Cierre: Ámbar Dorado) */}
                            {(kanjiStrokeStep === 0 || kanjiStrokeStep >= 4) && (
                              <path
                                d="M 28 82 L 74 82"
                                fill="none"
                                stroke={tourKanjiMultiColor ? '#f59e0b' : '#1e293b'}
                                strokeWidth="9.5"
                                strokeLinecap="round"
                                style={{ transition: 'stroke 0.2s ease' }}
                              />
                            )}

                            {/* Números identificadores de orden de trazos (1, 2, 3, 4) */}
                            {tourKanjiShowNumbers && (
                              <g>
                                {(kanjiStrokeStep === 0 || kanjiStrokeStep >= 1) && (
                                  <text
                                    x="16"
                                    y="23"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill={tourKanjiMultiColor ? '#ef4444' : '#1e293b'}
                                    stroke="#ffffff"
                                    strokeWidth="2.5"
                                    strokeLinejoin="round"
                                    style={{ paintOrder: 'stroke fill', fontWeight: 900, fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}
                                  >
                                    1
                                  </text>
                                )}
                                {(kanjiStrokeStep === 0 || kanjiStrokeStep >= 2) && (
                                  <text
                                    x="31"
                                    y="11"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill={tourKanjiMultiColor ? '#3b82f6' : '#1e293b'}
                                    stroke="#ffffff"
                                    strokeWidth="2.5"
                                    strokeLinejoin="round"
                                    style={{ paintOrder: 'stroke fill', fontWeight: 900, fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}
                                  >
                                    2
                                  </text>
                                )}
                                {(kanjiStrokeStep === 0 || kanjiStrokeStep >= 3) && (
                                  <text
                                    x="16"
                                    y="52"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill={tourKanjiMultiColor ? '#10b981' : '#1e293b'}
                                    stroke="#ffffff"
                                    strokeWidth="2.5"
                                    strokeLinejoin="round"
                                    style={{ paintOrder: 'stroke fill', fontWeight: 900, fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}
                                  >
                                    3
                                  </text>
                                )}
                                {(kanjiStrokeStep === 0 || kanjiStrokeStep >= 4) && (
                                  <text
                                    x="16"
                                    y="83"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill={tourKanjiMultiColor ? '#f59e0b' : '#1e293b'}
                                    stroke="#ffffff"
                                    strokeWidth="2.5"
                                    strokeLinejoin="round"
                                    style={{ paintOrder: 'stroke fill', fontWeight: 900, fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}
                                  >
                                    4
                                  </text>
                                )}
                              </g>
                            )}
                          </svg>

                          {/* Badge de cantidad de trazos en esquina */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 4,
                              right: 4,
                              fontSize: '9px',
                              fontWeight: 800,
                              background: 'rgba(225, 29, 72, 0.08)',
                              color: '#be123c',
                              border: '1px solid rgba(225, 29, 72, 0.25)',
                              borderRadius: 4,
                              padding: '1px 5px'
                            }}
                          >
                            {kanjiStrokeStep ? `${kanjiStrokeStep}/4` : '4 trazos'}
                          </div>
                        </div>

                        {/* Lecturas y significado */}
                        <div className="kanji-readings-box" style={{ flex: 1, fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary)', marginBottom: 2 }}>
                            日 (Sol / Día / Japón)
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                            Radical: 日 (Sol) · Nivel JLPT N5 · 4 trazos
                          </div>
                          <div><strong>On&apos;yomi:</strong> ニチ (nichi), ジツ (jitsu)</div>
                          <div><strong>Kun&apos;yomi:</strong> ひ (hi), -び (-bi)</div>

                          <div style={{ marginTop: 6, fontSize: '0.72rem', color: kanjiStrokeStep ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                            ✍️ {kanjiStrokeStep ? STROKE_LABELS[kanjiStrokeStep] : 'Trazos: 1) Vertical → 2) Ángulo → 3) Centro → 4) Cierre'}
                          </div>
                        </div>
                      </div>

                      {/* Botones interactivos con toggles de números y color */}
                      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={handleTriggerStrokeAnimation}
                          disabled={kanjiAnimating}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', padding: '4px 10px' }}
                        >
                          <Play size={13} /> {kanjiAnimating ? `Dibujando trazo ${kanjiStrokeStep || 1}...` : 'Animar trazos 1 a 1'}
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm ${tourKanjiShowNumbers ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => setTourKanjiShowNumbers(!tourKanjiShowNumbers)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            background: tourKanjiShowNumbers ? '#be123c' : 'transparent',
                            borderColor: tourKanjiShowNumbers ? '#be123c' : 'var(--border)',
                            color: tourKanjiShowNumbers ? '#ffffff' : 'var(--text-muted)'
                          }}
                        >
                          <span>🔢 Números: {tourKanjiShowNumbers ? 'ON' : 'OFF'}</span>
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm ${tourKanjiMultiColor ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => setTourKanjiMultiColor(!tourKanjiMultiColor)}
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        >
                          <span>🎨 Color: {tourKanjiMultiColor ? 'ON' : 'OFF'}</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={handleOpenRealDrawingModal}
                          style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          ✍️ Probar lienzo y orden real
                        </button>
                      </div>
                    </div>
                  );
                })()}

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
                            className="btn btn-sm"
                            onClick={() => {
                              setTourPracticeDrawn(prev => !prev);
                              if (!tourPracticeDrawn) {
                                handlePlayAudio('えい');
                              }
                            }}
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 12px',
                              color: '#78350f',
                              backgroundColor: '#ffffff',
                              border: '1.5px solid #d97706',
                              borderRadius: '6px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                              cursor: 'pointer'
                            }}
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
                        { title: 'Irodori Katsudou', level: 'N5', pages: '18 temas' },
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
                            onClick={() => handleSelectAudioSpeed(spd)}
                            style={{ fontSize: '0.74rem', padding: '3px 10px', fontWeight: 600 }}
                            title={`Cambiar velocidad de reproducción a ${spd}`}
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
                        <span>Meta Diaria con FSRS y recordatorios móviles activados</span>
                      </div>
                      <div className="checklist-item">
                        <Check size={14} className="text-emerald-500" />
                        <span>Simulacros Oficiales JLPT (N5 a N1) listos para entrenar</span>
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
        <div 
          className="tour-modal-footer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            borderTop: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
            backgroundColor: 'var(--bg-surface, #1e293b)',
            flexShrink: 0,
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          {/* Step dots navigation */}
          <div 
            className="tour-dots-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap'
            }}
          >
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

          <div 
            className="tour-footer-buttons"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginLeft: 'auto'
            }}
          >
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
