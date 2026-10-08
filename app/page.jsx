'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '../lib/AppContext';
import JapanesePillarsGuide from '../components/features/JapanesePillarsGuide';
import StudyStatusBento from '../components/features/StudyStatusBento';
import KanaKanjiMemoryGame from '../components/features/KanaKanjiMemoryGame';
import ParticleRushGame from '../components/features/ParticleRushGame';
import TerminologyDetailModal from '../components/modals/TerminologyDetailModal';
import { 
  Sparkles, 
  Compass, 
  BookOpen, 
  MessageSquare, 
  Tv, 
  Layers, 
  Target, 
  Languages, 
  Award, 
  Gamepad2, 
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';

// Carga dinámica con code-splitting del modelo 3D para máximo rendimiento
const ZenDaruma3D = dynamic(() => import('../components/features/ZenDaruma3D'), {
  ssr: false,
  loading: () => (
    <div className="w-56 h-56 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
      <span className="text-xs text-slate-400 font-bold">Invocando Daruma 3D...</span>
    </div>
  )
});

export default function HomePage() {
  const { appState, handleUpdateState, navigate } = useApp();

  // Estados interactivos
  const [isTerminologyModalOpen, setIsTerminologyModalOpen] = useState(false);
  const [selectedPillarId, setSelectedPillarId] = useState('writing');
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [activeGameTab, setActiveGameTab] = useState('memory'); // 'memory' | 'particles'

  // Saludo tradicional según hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { jp: 'おはようございます', es: '¡Buenos días!' };
    } else if (hour >= 12 && hour < 19) {
      return { jp: 'こんにちは', es: '¡Buenas tardes!' };
    } else {
      return { jp: 'こんばんは', es: '¡Buenas noches!' };
    }
  };

  const greeting = getGreeting();

  // Activar celebración de victoria en el Daruma 3D
  const triggerCelebration = useCallback(() => {
    setIsCelebrating(true);
    setTimeout(() => {
      setIsCelebrating(false);
    }, 4500);
  }, []);

  // Adjudicar puntos de experiencia (XP) al estado global
  const handleAwardXP = useCallback((amount) => {
    if (!handleUpdateState) return;
    const currentXp = appState?.xp || 0;
    const newXp = currentXp + amount;
    handleUpdateState({
      ...appState,
      xp: newXp
    });
    triggerCelebration();
  }, [appState, handleUpdateState, triggerCelebration]);

  const handleOpenPillar = (pillarId) => {
    setSelectedPillarId(pillarId);
    setIsTerminologyModalOpen(true);
  };

  // Módulos destacados de la plataforma
  const quickModules = [
    { title: 'Ruta de Aprendizaje', desc: 'Currículum paso a paso N5 a N1', path: '/curriculum', icon: Compass, color: '#6366f1' },
    { title: 'Historias con Furigana', desc: 'Lecturas graduadas con audio sincronizado', path: '/story', icon: BookOpen, color: '#8b5cf6' },
    { title: 'Conversación NHK', desc: 'Diálogos de la vida cotidiana en Japón', path: '/nhk', icon: MessageSquare, color: '#ec4899' },
    { title: 'Inmersión YouTube', desc: 'Videos auténticos con subtítulos duales', path: '/youtube', icon: Tv, color: '#ef4444' },
    { title: 'Banco de Vocabulario', desc: 'Kanji, Hiragana y audios oficiales', path: '/vocab', icon: Layers, color: '#3b82f6' },
    { title: 'Simulacros JLPT', desc: 'Exámenes cronometrados N5 a N1', path: '/jlpt', icon: Award, color: '#f59e0b' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-12">
      {/* 1. SECCIÓN HERO ZEN JAPANDI CON DARUMA 3D */}
      <section className="relative overflow-hidden rounded-[2.5rem] p-6 sm:p-10 bg-gradient-to-br from-indigo-50/70 via-white to-rose-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Lado izquierdo: Saludo e introducción serena */}
        <div className="flex-1 space-y-4 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 jp-text">
              {greeting.jp} · {greeting.es}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Aprende Japonés con <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600">Claridad y Serenidad</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
            Una experiencia minimalista e interactiva donde la terminología del idioma se comprende sin saturación: audio neuronal nativo, estructura paso a paso de N5 a N1 y práctica ágil.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              onClick={() => navigate('/curriculum')}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Compass className="w-4 h-4" />
              Continuar en el Currículum
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleOpenPillar('writing')}
              className="px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
            >
              Ver Guía de Terminología
            </button>
          </div>
        </div>

        {/* Lado derecho: Mascota 3D Zen Daruma */}
        <div className="flex flex-col items-center justify-center relative z-10 shrink-0">
          <ZenDaruma3D 
            celebrate={isCelebrating}
            size={270}
            onInteract={() => {}}
          />
        </div>
      </section>

      {/* 2. DASHBOARD BENTO: ESTADO ACTUAL DEL ESTUDIO */}
      <StudyStatusBento 
        appState={appState}
        onNavigate={navigate}
      />

      {/* 3. LOS 4 PILARES DE LA TERMINOLOGÍA JAPONESA */}
      <JapanesePillarsGuide 
        onOpenPillar={handleOpenPillar}
      />

      {/* 4. ESTACIÓN DE MINI-JUEGOS INTERACTIVOS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Práctica Táctil & Gamificación
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Mini-Juegos Educativos
            </h2>
          </div>

          {/* Selector de Juego */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setActiveGameTab('memory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeGameTab === 'memory' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              1. Memory Flash
            </button>
            <button
              onClick={() => setActiveGameTab('particles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeGameTab === 'particles' 
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              2. Desafío Partículas
            </button>
          </div>
        </div>

        {/* Tab Activo de Juego */}
        {activeGameTab === 'memory' ? (
          <KanaKanjiMemoryGame 
            onGameWin={triggerCelebration}
            onAwardXP={handleAwardXP}
          />
        ) : (
          <ParticleRushGame 
            onGameWin={triggerCelebration}
            onAwardXP={handleAwardXP}
          />
        )}
      </section>

      {/* 5. ACCESO RÁPIDO A TODOS LOS MÓDULOS DE APRENDIZAJE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              Ecosistema Integral
            </span>
          </div>
          <button
            onClick={() => navigate('/curriculum')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Ver catálogo completo
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {quickModules.map((mod, idx) => {
            const ModIcon = mod.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(mod.path)}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div 
                    className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm shrink-0"
                    style={{ backgroundColor: `${mod.color}15`, color: mod.color }}
                  >
                    <ModIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {mod.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {mod.desc}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal de Revelación Progresiva para Terminología Japonesa */}
      <TerminologyDetailModal 
        isOpen={isTerminologyModalOpen}
        onClose={() => setIsTerminologyModalOpen(false)}
        initialPillarId={selectedPillarId}
        onNavigate={navigate}
      />
    </div>
  );
}
