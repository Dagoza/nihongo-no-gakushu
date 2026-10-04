'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Flame, 
  Star, 
  Target, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  RotateCcw, 
  Keyboard,
  Cloud,
  CloudOff,
  CloudCheck,
  CloudSync,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Compass,
  Monitor,
  Smartphone,
  Laptop,
  Check,
  Brain
} from 'lucide-react';
import FsrsStatsModule from './FsrsStatsModule';
import { exportData, parseImportData, getInitialState } from '../lib/storage';
import { 
  executeFullSync, 
  signInWithGoogle 
} from '../lib/supabaseSync';
import nhkLessonsData from '../data/nhk_lessons.json';
import irodoriDialoguesData from '../data/irodori_dialogues.json';
import curriculumData from '../data/curriculum.json';
import particlesData from '../data/particles.json';
import kanjiData from '../data/kanji.json';
import vocabularyData from '../data/vocabulary.json';
import { useApp } from '../lib/AppContext';

function detectUserOS() {
  if (typeof window === 'undefined') return 'macos';
  const ua = window.navigator.userAgent || '';
  const platform = window.navigator.platform || '';
  
  if (/iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  if (/Android/i.test(ua)) {
    return 'android';
  }
  if (/Win/i.test(ua) || /Win/.test(platform)) {
    return 'windows';
  }
  if (/Mac/i.test(ua) || /Mac/.test(platform)) {
    return 'macos';
  }
  if (/Linux/i.test(ua) || /Linux/.test(platform)) {
    return 'linux';
  }
  return 'macos';
}

const OS_GUIDES = {
  macos: {
    id: 'macos',
    name: 'macOS',
    subtitle: 'Apple Mac (MacBook, iMac, Mac Mini)',
    icon: '🍏',
    steps: [
      {
        title: 'Abrir configuración de Teclado',
        desc: 'Ve a Ajustes del Sistema (o Preferencias del Sistema) → Teclado → Fuentes de entrada y haz clic en Editar... o en el botón "+".'
      },
      {
        title: 'Añadir fuente japonesa (Romaji)',
        desc: 'Busca "Japonés" en la barra de búsqueda y selecciona "Japonés (Romaji)". Asegúrate de que las casillas "Hiragana" y "Katakana" estén activadas y haz clic en Añadir.'
      },
      {
        title: 'Alternar rápidamente entre idiomas',
        desc: 'Usa el atajo Control + Espacio o presiona la tecla Fn / 🌐 (o Bloq Mayús si lo configuraste) para cambiar al teclado japonés al instante.'
      },
      {
        title: 'Escribir en Hiragana en tiempo real',
        desc: 'Escribe fonéticamente en letras latinas (ej. watashi) y el sistema convertirá automáticamente el texto a わたし mientras tecleas.'
      },
      {
        title: 'Convertir a Kanji con la Barra Espaciadora',
        desc: 'Al escribir una palabra en Hiragana, presiona la Barra Espaciadora. Se desplegará la lista de kanjis candidatos (ej. わたし → 私). Navega y presiona Enter para confirmar.'
      },
      {
        title: 'Conversión rápida a Katakana',
        desc: 'Escribe la palabra (ej. terebi) y presiona la tecla F7 o Control + K para convertirla inmediatamente a Katakana (テレビ).'
      }
    ],
    shortcuts: [
      { key: 'Control + Espacio', action: 'Alternar entre teclados' },
      { key: 'Barra Espaciadora', action: 'Convertir a Kanji (presionar varias veces para ver más candidatos)' },
      { key: 'Enter', action: 'Confirmar el kanji / texto actual' },
      { key: 'F7 o Control + K', action: 'Convertir selección a Katakana' },
      { key: 'F6 o Control + J', action: 'Convertir selección a Hiragana' }
    ],
    tips: [
      'Si tienes una Mac con chip Apple Silicon o teclado Magic Keyboard, la tecla Fn (globo terráqueo) en la esquina inferior izquierda cambia de idioma con solo un toque.',
      'Si presionas la barra espaciadora dos veces consecutivas, se abre la cuadrícula completa con todos los kanjis y homófonos ordenados por frecuencia.'
    ]
  },
  windows: {
    id: 'windows',
    name: 'Windows',
    subtitle: 'Windows 10 & Windows 11',
    icon: '🪟',
    steps: [
      {
        title: 'Abrir Configuración de Idioma',
        desc: 'Presiona Win + I para abrir Configuración → Ve a Hora e idioma → Idioma y región (o Idioma en Windows 10).'
      },
      {
        title: 'Agregar el idioma Japonés',
        desc: 'Haz clic en "Agregar un idioma", busca "Japonés (日本語)" y pulsa Siguiente. Con mantener marcada la opción "Escritura básica" es suficiente. Haz clic en Instalar.'
      },
      {
        title: 'Cambiar al teclado japonés',
        desc: 'Presiona la combinación Win + Barra Espaciadora o Alt + Shift para alternar entre el teclado español y el japonés.'
      },
      {
        title: 'Activar el modo Hiragana (あ)',
        desc: 'Al cambiar a japonés, si ves el icono "A" al lado del reloj en la barra de tareas, presiona Alt + ~ (o haz clic sobre la letra A) para que cambie a "あ" (modo Hiragana).'
      },
      {
        title: 'Escribir y convertir a Kanji',
        desc: 'Escribe en romaji (ej. nihon) y presiona la Barra Espaciadora para abrir la lista de Kanjis disponibles (ej. 日本). Presiona Enter para confirmar.'
      },
      {
        title: 'Convertir a Katakana',
        desc: 'Presiona la tecla F7 mientras la palabra está subrayada para transformarla al instante en Katakana (ej. kamera → カメラ).'
      }
    ],
    shortcuts: [
      { key: 'Win + Espacio', action: 'Alternar entre teclados de Windows' },
      { key: 'Alt + ~ (tilde)', action: 'Alternar entre modo inglés (A) e Hiragana (あ)' },
      { key: 'Barra Espaciadora', action: 'Convertir fonética a lista de Kanjis' },
      { key: 'F7', action: 'Convertir a Katakana' },
      { key: 'F6', action: 'Convertir a Hiragana' }
    ],
    tips: [
      'El atajo rápido Alt + ~ es la forma más veloz de alternar entre escribir letras normales (A) y japonés (あ) sin cambiar la distribución de teclado.',
      'Windows IME aprende de tus hábitos: los kanjis que más utilices aparecerán de primeros en las sugerencias.'
    ]
  },
  ios: {
    id: 'ios',
    name: 'iOS / iPadOS',
    subtitle: 'iPhone & iPad',
    icon: '📱',
    steps: [
      {
        title: 'Abrir Ajustes de Teclado',
        desc: 'En tu iPhone o iPad, abre la app Ajustes → General → Teclado → Teclados.'
      },
      {
        title: 'Añadir nuevo teclado japonés',
        desc: 'Toca en "Añadir nuevo teclado...", busca y selecciona "Japonés".'
      },
      {
        title: 'Elegir Romaji o Kana (Flick)',
        desc: 'Puedes activar uno o ambos: "Romaji" (distribución QWERTY idéntica al teclado latino, ideal para escribir como en PC) o "Kana" (teclado japonés de 12 teclas con deslizamiento flick).'
      },
      {
        title: 'Alternar teclados en cualquier app',
        desc: 'Al escribir en cualquier campo de texto, mantén presionado el icono del Globo terráqueo 🌐 en la esquina inferior izquierda y selecciona el teclado japonés.'
      },
      {
        title: 'Sugerencias de Kanjis en la barra predictiva',
        desc: 'Escribe en Romaji (ej. neko); en la barra superior del teclado aparecerán automáticamente las opciones en Kanji (猫), Hiragana (ねこ) y Katakana (ネコ). Toca la opción deseada para insertarla.'
      }
    ],
    shortcuts: [
      { key: 'Icono 🌐 (Toque rápido)', action: 'Alternar al siguiente teclado instalado' },
      { key: 'Icono 🌐 (Mantener)', action: 'Desplegar menú con todos los teclados' },
      { key: 'Barra predictiva superior', action: 'Tocar el Kanji o Katakana correspondiente' }
    ],
    tips: [
      'Si tienes un iPad con Magic Keyboard o teclado externo Bluetooth, puedes alternar idiomas presionando Control + Espacio o la tecla de globo terráqueo.',
      'El teclado Romaji en iOS incluye acceso directo a signos de puntuación japoneses tradicionales como comillas de gancho 「 」, puntos de centro ・ y puntos finales 。.'
    ]
  },
  android: {
    id: 'android',
    name: 'Android',
    subtitle: 'Gboard / Samsung Keyboard',
    icon: '🤖',
    steps: [
      {
        title: 'Abrir ajustes del teclado',
        desc: 'Toca cualquier campo de texto para abrir el teclado (ej. Gboard). Toca el icono de Ajustes ⚙️ en la barra superior del teclado (o mantén pulsada la coma "," o la barra espaciadora) y entra en "Idiomas".'
      },
      {
        title: 'Añadir teclado japonés',
        desc: 'Toca en "Añadir teclado", busca "Japonés (日本語)" y selecciónalo.'
      },
      {
        title: 'Seleccionar formato (QWERTY o 12 teclas)',
        desc: 'Elige tu modo favorito: "QWERTY" (escribes fonéticamente con letras latinas como en PC, ej. sakura → さくら) o "12 teclas" (teclado japonés deslizable tradicional). Pulsa "Listo".'
      },
      {
        title: 'Alternar idiomas al escribir',
        desc: 'Toca el icono del Globo terráqueo 🌐 o mantén presionada la Barra Espaciadora para cambiar rápidamente entre español y japonés.'
      },
      {
        title: 'Selección de Kanjis',
        desc: 'Mientras escribes, la barra de predicción de Gboard te sugerirá los kanjis correspondientes. Toca el kanji o la flechita hacia abajo para desplegar todos los candidatos.'
      }
    ],
    shortcuts: [
      { key: 'Icono 🌐', action: 'Cambiar de idioma con un solo toque' },
      { key: 'Mantener Barra Espaciadora', action: 'Menú de selección de teclado activo' },
      { key: 'Barra de sugerencias', action: 'Insertar Kanji, Katakana o emoji al instante' }
    ],
    tips: [
      'En dispositivos Samsung con Samsung Keyboard: ve a Ajustes del teléfono → Administración general → Ajustes de Teclado Samsung → Idiomas y tipos → Administrar idiomas de entrada y activa Japonés.',
      'Gboard para Android admite dictado por voz en japonés directamente tocando el micrófono del teclado mientras esté activo el modo japonés.'
    ]
  },
  linux: {
    id: 'linux',
    name: 'Linux',
    subtitle: 'Ubuntu, Fedora, Debian, Arch',
    icon: '🐧',
    steps: [
      {
        title: 'Instalar el motor de entrada Mozc',
        desc: 'Instala el paquete ibus-mozc o fcitx5-mozc desde la terminal (ej. en Ubuntu/Debian: "sudo apt install ibus-mozc"; en Fedora: "sudo dnf install ibus-mozc"; en Arch: "sudo pacman -S fcitx5-mozc").'
      },
      {
        title: 'Configurar la fuente en Región e Idioma',
        desc: 'Abre Configuración del Sistema → Región e idioma → Fuentes de entrada → pulsa en "+" y añade "Japonés (Mozc)".'
      },
      {
        title: 'Alternar teclado',
        desc: 'Usa el atajo Super + Espacio o Control + Espacio para activar el motor Mozc.'
      },
      {
        title: 'Escribir y convertir a Kanji',
        desc: 'Escribe en romaji (ej. arigatou) y presiona la Barra Espaciadora para abrir la lista de Kanjis. Confirma con Enter.'
      }
    ],
    shortcuts: [
      { key: 'Super + Espacio', action: 'Alternar fuentes de entrada en GNOME' },
      { key: 'Barra Espaciadora', action: 'Convertir fonética a Kanjis' },
      { key: 'Enter', action: 'Fijar el kanji seleccionado' }
    ],
    tips: [
      'Mozc es el motor de código abierto derivado de Google Japanese Input para sistemas basados en Unix.',
      'Reiniciar la sesión tras la primera instalación asegura que el demonio de entrada (IBus o Fcitx5) cargue correctamente.'
    ]
  }
};

export default function ProgressTab({ 
  appState, 
  onUpdateState, 
  syncStatus = 'local', 
  syncInfo = '', 
  onTriggerSync = null,
  authUser = null,
  onOpenAuth = null,
  onSignOut = null,
  onOpenTour = null
}) {
  let contextApp = null;
  try {
    contextApp = useApp();
  } catch (e) {}
  const showConfirm = contextApp?.showConfirm || (() => Promise.resolve(true));

  const handleOpenTour = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    // 1. Direct callback prop
    try {
      if (typeof onOpenTour === 'function') onOpenTour();
    } catch (err) {}

    // 2. AppContext methods
    try {
      if (typeof contextApp?.openTour === 'function') contextApp.openTour();
      if (typeof contextApp?.setIsTourOpen === 'function') contextApp.setIsTourOpen(true);
    } catch (err) {}

    // 3. Global window handlers & events
    try {
      if (typeof window !== 'undefined') {
        if (typeof window.__nihongoOpenTour === 'function') {
          window.__nihongoOpenTour();
        }
        window.dispatchEvent(new CustomEvent('nihongo-open-tour'));
      }
    } catch (err) {}
  };

  const fileInputRef = useRef(null);

  // Estados de Sincronización en la Nube
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: string }

  // Estados de Guía de Teclado Japonés e IME Multi-Sistema
  const [selectedOS, setSelectedOS] = useState('macos');
  const [detectedOS, setDetectedOS] = useState('macos');
  const [testInput, setTestInput] = useState('');

  // Sección activa en la página de Progreso ('fsrs' por defecto)
  const [activeSection, setActiveSection] = useState('fsrs'); // 'fsrs' | 'cloud' | 'backup' | 'keyboard'

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const sec = params.get('section');
      if (sec && ['fsrs', 'cloud', 'backup', 'keyboard'].includes(sec)) {
        setActiveSection(sec);
      }
    } catch (e) {}
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setSyncMessage(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      let msg = err.message || 'Error al conectar con Google.';
      if (msg.includes('provider is not enabled') || msg.includes('disabled')) {
        msg = 'El inicio de sesión con Google no está disponible en este momento. Puedes usar tu correo y contraseña.';
      }
      setSyncMessage({ type: 'error', text: msg });
      setGoogleLoading(false);
    }
  };

  const streak = appState.streak || 1;
  const xp = appState.xp || 0;
  const userLevel = Math.floor(xp / 100) + 1;
  const masteredParticlesCount = Object.values(appState.masteredParticles || {}).filter(Boolean).length;
  const totalParticles = particlesData?.length || 99;
  const masteredVocabCount = Object.values(appState.masteredVocab || {}).filter(Boolean).length;
  const totalVocab = vocabularyData?.length || 321;
  const masteredKanjiCount = Object.values(appState.masteredKanji || {}).filter(Boolean).length;
  const totalKanji = kanjiData?.length || 161;
  const completedSentencesCount = Object.values(appState.completedSentences || {}).filter(Boolean).length;
  const completedConversationsCount = Object.values(appState.completedConversations || {}).filter(Boolean).length;
  const totalConversations = (nhkLessonsData?.length || 48) + (irodoriDialoguesData?.length || 22);
  const completedStepsCount = Object.values(appState.completedSteps || {}).filter(Boolean).length;
  const totalSteps = curriculumData?.length || 37;
  const allCanDos = (curriculumData || []).flatMap(s => s.can_dos || []);
  const totalCanDos = allCanDos.length || 141;
  const completedCanDosCount = Object.values(appState.completedCanDos || {}).filter(Boolean).length;

  // Sincronización manual en la nube (requiere sesión activa)
  const handleManualSync = async () => {
    if (!authUser) {
      setSyncMessage({ type: 'info', text: 'Inicia sesión con Google o correo para sincronizar tus datos en la nube.' });
      return;
    }
    setIsSyncingLocal(true);
    setSyncMessage(null);
    try {
      if (onTriggerSync) {
        await onTriggerSync();
        setSyncMessage({ type: 'success', text: '¡Progreso sincronizado exitosamente con tu cuenta!' });
      } else {
        const res = await executeFullSync(appState);
        if (res.success) {
          onUpdateState(res.mergedState);
          setSyncMessage({ type: 'success', text: res.message });
        } else {
          setSyncMessage({ type: 'error', text: res.message });
        }
      }
    } catch (e) {
      setSyncMessage({ type: 'error', text: 'Error inesperado durante la sincronización.' });
    } finally {
      setIsSyncingLocal(false);
    }
  };

  const handleExport = () => {
    exportData(appState);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text === 'string') {
          const restoredState = parseImportData(text);
          onUpdateState(restoredState);
          setSyncMessage({ type: 'success', text: '¡Progreso restaurado con éxito desde el archivo JSON!' });
        }
      } catch (err) {
        setSyncMessage({ type: 'error', text: 'El archivo JSON no es válido o está dañado.' });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    const ok = await showConfirm({
      title: '¿Reiniciar Progreso?',
      message: '¿Estás seguro de que deseas reiniciar todo el progreso acumulado? Esta acción restablecerá tus rachas y XP a cero y no se puede deshacer.',
      confirmText: 'Reiniciar Todo',
      isDestructive: true
    });
    if (ok) {
      const fresh = getInitialState();
      onUpdateState(fresh);
      setSyncMessage({ type: 'info', text: 'El progreso ha sido reiniciado a cero.' });
    }
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <span style={{ flexShrink: 0 }}>📊</span>
          <span>Mi Progreso y Estadísticas de Aprendizaje</span>
        </h2>
        <p className="section-desc">
          Consulta tu rendimiento, mantén tu sesión sincronizada en tiempo real entre tu móvil, tablet y computadora, y gestiona tus copias de seguridad.
        </p>
      </div>

      {/* Banner de mensajes/alertas de sincronización */}
      {syncMessage && (
        <div 
          style={{
            padding: '12px 18px',
            borderRadius: 10,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: syncMessage.type === 'success' 
              ? 'rgba(16, 185, 129, 0.12)' 
              : syncMessage.type === 'error' 
              ? 'rgba(239, 68, 68, 0.12)' 
              : 'rgba(99, 102, 241, 0.12)',
            border: `1px solid ${
              syncMessage.type === 'success' 
                ? 'var(--success, #10b981)' 
                : syncMessage.type === 'error' 
                ? 'var(--danger, #ef4444)' 
                : 'var(--primary, #6366f1)'
            }`,
            color: 'var(--text-main)'
          }}
        >
          {syncMessage.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />}
          {syncMessage.type === 'error' && <AlertCircle size={18} style={{ color: 'var(--danger)' }} />}
          {syncMessage.type === 'info' && <RefreshCw size={18} style={{ color: 'var(--primary)' }} />}
          <div style={{ flex: 1, fontSize: '0.92rem' }}>{syncMessage.text}</div>
          <button 
            onClick={() => setSyncMessage(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="progress-stats-grid">
        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🔥</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)' }}>
            {streak} {streak === 1 ? 'día' : 'días'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Racha de Estudio</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>⭐</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
            {xp} XP
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nivel {userLevel} Maestro</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🎯</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
            {masteredParticlesCount}/{totalParticles}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Partículas Dominadas</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>漢</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-light)' }}>
            {masteredKanjiCount}/{totalKanji}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Kanjis Aprendidos</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>📚</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>
            {masteredVocabCount}/{totalVocab}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vocabulario Dominado</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>📖</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6' }}>
            {completedSentencesCount}/58
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Oraciones de Historia</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>📻</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899' }}>
            {completedConversationsCount}/{totalConversations}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Conversaciones Estudiadas</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🗺️</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
            {completedStepsCount}/{totalSteps}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ruta Consolidada (Módulos)</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🎯</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899' }}>
            {completedCanDosCount}/{totalCanDos}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Competencias Can-Do</div>
        </div>
      </div>

      {/* Selector de Sección Principal en Mi Progreso */}
      <div 
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 24,
          overflowX: 'auto',
          paddingBottom: 6,
          borderBottom: '2px solid var(--border)'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSection('fsrs')}
          className={`btn btn-sm ${activeSection === 'fsrs' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontWeight: 700, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px' }}
        >
          <Brain size={16} />
          <span>🧠 Análisis & FSRS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('cloud')}
          className={`btn btn-sm ${activeSection === 'cloud' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontWeight: 700, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px' }}
        >
          <Cloud size={16} />
          <span>☁️ Nube & Cuenta</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('backup')}
          className={`btn btn-sm ${activeSection === 'backup' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontWeight: 700, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px' }}
        >
          <Download size={16} />
          <span>💾 Respaldos JSON</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('keyboard')}
          className={`btn btn-sm ${activeSection === 'keyboard' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontWeight: 700, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px' }}
        >
          <Keyboard size={16} />
          <span>⌨️ Teclados Japonés (IME)</span>
        </button>
      </div>

      {/* SECCIÓN 1: ANÁLISIS & FSRS */}
      {activeSection === 'fsrs' && (
        <FsrsStatsModule
          appState={appState}
          onUpdateState={onUpdateState}
          onOpenDailyGoal={contextApp?.openDailyGoalModal}
          onNavigate={contextApp?.navigate}
          showConfirm={showConfirm}
          showAlert={contextApp?.showAlert}
        />
      )}

      {/* SECCIÓN 2: NUBE Y CUENTA */}
      {activeSection === 'cloud' && (
        <>
          {/* CLOUD SYNC & USER ACCOUNT CARD */}
          <div className="card" style={{ marginBottom: 24, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        {/* Card Header with Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 8, 
              background: 'rgba(99, 102, 241, 0.12)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Cloud size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Sincronización en la Nube & Cuenta
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                La única forma de preservar tu progreso permanentemente entre dispositivos es iniciando sesión con Google o tu correo.
              </div>
            </div>
          </div>

          {/* Connection Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: '0.82rem',
              fontWeight: 600,
              background: isSyncingLocal || syncStatus === 'syncing'
                ? 'rgba(245, 158, 11, 0.12)'
                : authUser && syncStatus === 'synced'
                ? 'rgba(16, 185, 129, 0.12)'
                : authUser
                ? 'rgba(99, 102, 241, 0.12)'
                : 'rgba(148, 163, 184, 0.12)',
              color: isSyncingLocal || syncStatus === 'syncing'
                ? 'var(--accent, #f59e0b)'
                : authUser && syncStatus === 'synced'
                ? 'var(--success, #10b981)'
                : authUser
                ? 'var(--primary, #6366f1)'
                : 'var(--text-muted, #94a3b8)',
              border: '1px solid currentColor'
            }}>
              {isSyncingLocal || syncStatus === 'syncing' ? (
                <>
                  <CloudSync size={14} className="animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : authUser && syncStatus === 'synced' ? (
                <>
                  <CloudCheck size={14} />
                  <span>Sincronizado con tu cuenta</span>
                </>
              ) : authUser ? (
                <>
                  <Cloud size={14} />
                  <span>Cuenta conectada</span>
                </>
              ) : (
                <>
                  <CloudOff size={14} />
                  <span>Modo Local (Sin sincronizar)</span>
                </>
              )}
            </div>

            {authUser && (
              <button
                className="btn btn-outline btn-sm"
                onClick={handleManualSync}
                disabled={isSyncingLocal}
                title="Sincronizar ahora con tu cuenta en la nube"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={14} className={isSyncingLocal ? 'animate-spin' : ''} />
                <span>Sincronizar ahora</span>
              </button>
            )}
          </div>
        </div>

        {/* User Account & Security Banner */}
        <div style={{
          padding: '16px 20px',
          borderRadius: 12,
          background: authUser 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)' 
            : 'var(--bg-main)',
          border: `1px solid ${authUser ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {authUser?.avatar ? (
              <img 
                src={authUser.avatar} 
                alt={authUser.name || 'Usuario'} 
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--success, #10b981)' }} 
              />
            ) : (
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: authUser ? 'var(--success, #10b981)' : 'rgba(99, 102, 241, 0.15)',
                color: authUser ? '#ffffff' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={22} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.98rem' }}>
                  {authUser ? (authUser.name || authUser.email) : 'Sesión Local (Invitado)'}
                </strong>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 600,
                  background: authUser ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: authUser ? 'var(--success, #10b981)' : 'var(--accent, #f59e0b)'
                }}>
                  {authUser ? (authUser.provider === 'google' ? 'Google Account 🔒' : 'Cuenta Segura 🔒') : '⚠️ Sin Cuenta'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {authUser 
                  ? `Conectado como ${authUser.email}. Tu progreso, kanjis y vocabulario se respaldan automáticamente en la nube.`
                  : 'Para preservar tu racha, XP, palabras y kanjis al cambiar de navegador o dispositivo, inicia sesión con Google o tu correo.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {authUser ? (
              <button
                className="btn btn-outline btn-sm"
                onClick={onSignOut}
                style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>Cerrar Sesión</span>
              </button>
            ) : (
              <>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.685-5.17 3.685-9.09z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.31 21.36 7.39 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.31 2.64 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
                  </svg>
                  <span>{googleLoading ? 'Conectando...' : 'Google'}</span>
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={onOpenAuth}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <ShieldCheck size={15} />
                  <span>Entrar con Correo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Tour & Interactive Walkthrough Card */}
      <div className="card" style={{ 
        marginBottom: 24, 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Tour Guiado & Recorrido de la Aplicación
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 700,
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)'
                }}>
                  Interactivo & Animado
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                ¿Quieres repasar las herramientas de la plataforma, los badges del header o descubrir funciones ocultas como pronunciación por selección, Furigana interactivo y repaso espaciado?
              </p>
            </div>
          </div>

          <button 
            type="button"
            className="btn btn-primary"
            onClick={handleOpenTour}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8,
              background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
              boxShadow: '0 4px 14px rgba(67, 56, 202, 0.3)',
              padding: '10px 20px',
              fontWeight: 700
            }}
          >
            <Compass size={17} />
            <span>Iniciar Tour Interactivo</span>
          </button>
        </div>
      </div>
      </>
    )}

    {/* SECCIÓN 3: RESPALDOS MANUALES JSON */}
    {activeSection === 'backup' && (
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>💾</span> Respaldo Manual en Archivo JSON
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 16 }}>
          Descarga un archivo JSON de respaldo con tu racha, XP y listas de estudio completadas, o restáuralo si deseas tener copias físicas fuera de la nube.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={handleExport}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Download size={16} /> Exportar Progreso a JSON
          </button>

          <button 
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Upload size={16} /> Restaurar desde JSON
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            accept=".json" 
            style={{ display: 'none' }} 
          />

          <button 
            className="btn btn-outline" 
            style={{ color: 'var(--danger)', marginLeft: 'auto' }}
            onClick={handleReset}
          >
            <RotateCcw size={16} /> Reiniciar Progreso
          </button>
        </div>
      </div>
    )}

    {/* SECCIÓN 4: CONSEJOS Y CONFIGURACIÓN DEL TECLADO JAPONÉS (IME) */}
    {activeSection === 'keyboard' && (
      <div className="card" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Keyboard size={22} color="var(--primary)" /> Consejos y Configuración del Teclado Japonés (IME)
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Aprende a escribir en Hiragana, Katakana y convertir a Kanjis nativamente en tu sistema operativo.
            </p>
          </div>

          {/* Detected OS indicator */}
          {detectedOS && (
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 6, 
                padding: '5px 12px', 
                background: 'rgba(99, 102, 241, 0.12)', 
                border: '1px solid rgba(99, 102, 241, 0.25)', 
                borderRadius: 20, 
                fontSize: '0.8rem', 
                color: 'var(--primary)', 
                fontWeight: 600 
              }}
            >
              <Sparkles size={14} />
              <span>Tu sistema detectado: <strong>{OS_GUIDES[detectedOS]?.name} {OS_GUIDES[detectedOS]?.icon}</strong></span>
            </div>
          )}
        </div>

        {/* Operating System Selector Tabs */}
        <div 
          style={{ 
            display: 'flex', 
            gap: 8, 
            overflowX: 'auto', 
            paddingBottom: 8, 
            marginBottom: 20,
            borderBottom: '1px solid var(--border)' 
          }}
        >
          {Object.entries(OS_GUIDES).map(([key, item]) => {
            const isSelected = selectedOS === key;
            const isDetected = detectedOS === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedOS(key)}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.82rem',
                  padding: '7px 14px',
                  borderRadius: 10,
                  whiteSpace: 'nowrap',
                  fontWeight: isSelected ? 700 : 500
                }}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
                {isDetected && (
                  <span 
                    style={{ 
                      fontSize: '0.68rem', 
                      background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--primary-bg)', 
                      padding: '1px 6px', 
                      borderRadius: 4,
                      marginLeft: 2
                    }}
                  >
                    Actual
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active OS Details */}
        {(() => {
          const currentGuide = OS_GUIDES[selectedOS] || OS_GUIDES.macos;
          return (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: '1.5rem' }}>{currentGuide.icon}</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                    Cómo activar el teclado japonés en {currentGuide.name}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {currentGuide.subtitle}
                  </span>
                </div>
              </div>

              {/* Step by step list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {currentGuide.steps.map((step, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      background: 'var(--bg-surface)',
                      borderRadius: 10,
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div 
                      style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        background: 'var(--primary)', 
                        color: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 1
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 3 }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Shortcuts Grid */}
              {currentGuide.shortcuts && currentGuide.shortcuts.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h5 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Keyboard size={15} color="var(--primary)" /> Atajos clave en {currentGuide.name}
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 10 }}>
                    {currentGuide.shortcuts.map((sc, i) => (
                      <div 
                        key={i}
                        style={{
                          padding: '10px 12px',
                          background: 'var(--bg-surface)',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4
                        }}
                      >
                        <kbd 
                          style={{
                            alignSelf: 'flex-start',
                            background: 'var(--bg-main)',
                            padding: '3px 8px',
                            border: '1px solid var(--border)',
                            borderRadius: 5,
                            fontFamily: 'monospace',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: 'var(--text-main)'
                          }}
                        >
                          {sc.key}
                        </kbd>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {sc.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Useful Pro-Tips */}
              {currentGuide.tips && currentGuide.tips.length > 0 && (
                <div 
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(234, 179, 8, 0.08)',
                    border: '1px solid rgba(234, 179, 8, 0.25)',
                    borderRadius: 10,
                    marginBottom: 20
                  }}
                >
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--warning, #eab308)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    💡 Consejos clave para {currentGuide.name}:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.83rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                    {currentGuide.tips.map((tip, idx) => (
                      <li key={idx} style={{ marginBottom: idx === currentGuide.tips.length - 1 ? 0 : 4 }}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Scratchpad Test Area */}
              <div 
                style={{
                  padding: '16px 18px',
                  background: 'var(--bg-surface)',
                  borderRadius: 12,
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    ✍️ ¡Prueba tu teclado japonés aquí mismo!
                  </span>
                  {testInput && (
                    <button 
                      type="button" 
                      onClick={() => setTestInput('')} 
                      className="btn btn-ghost btn-xs"
                      style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                    >
                      Limpiar campo
                    </button>
                  )}
                </div>
                <input 
                  type="text"
                  className="japanese-input jp-text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Escribe aquí con tu teclado japonés activado (ej. escribe 'nihon' + espacio -> 日本)..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-jp)',
                    outline: 'none'
                  }}
                />
                <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Tip: Con tu teclado en modo japonés, escribe letras romaji (ej. <code>watashi</code>), presiona la barra espaciadora para ver la lista de kanjis y presiona Enter para confirmar.
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    )}
    </div>
  );
}
