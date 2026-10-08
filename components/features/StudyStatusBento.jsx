'use client';

import React from 'react';
import { 
  Flame, 
  Sparkles, 
  Award, 
  BookOpen, 
  Languages, 
  Target, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp,
  Clock,
  Compass
} from 'lucide-react';

export default function StudyStatusBento({ appState, onNavigate }) {
  const streak = appState?.streak || 1;
  const xp = appState?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;
  const xpProgressPercent = Math.min(100, xpInCurrentLevel);

  // Métricas de dominio desde appState
  const masteredVocabCount = Object.values(appState?.masteredVocab || {}).filter(Boolean).length;
  const masteredKanjiCount = Object.values(appState?.masteredKanji || {}).filter(Boolean).length;
  const masteredParticlesCount = Object.values(appState?.masteredParticles || {}).filter(Boolean).length;

  // Módulo actual en estudio
  const currentModuleStep = appState?.currentModuleStep || 1;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Estado de Aprendizaje
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800">
                Activo hoy
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Tu Progreso y Métricas de Estudio
            </h3>
          </div>
        </div>

        {/* Botón para continuar ruta */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('/curriculum')}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/20 self-start sm:self-auto"
          >
            <Compass className="w-3.5 h-3.5" />
            Continuar en Ruta (Módulo {currentModuleStep})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid Bento de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Métrica 1: Racha */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Racha diaria
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {streak} {streak === 1 ? 'día' : 'días'} 🔥
            </span>
          </div>
        </div>

        {/* Métrica 2: Nivel y XP */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Nivel {level}
            </span>
            <span className="text-[11px] font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {xp} XP
            </span>
          </div>
          {/* Barra de progreso */}
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${xpProgressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block text-right font-medium">
            {100 - xpInCurrentLevel} XP para Nivel {level + 1}
          </span>
        </div>

        {/* Métrica 3: Vocabulario & Kanjis */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Vocabulario / Kanji
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {masteredVocabCount} palabras · {masteredKanjiCount} kanjis
            </span>
          </div>
        </div>

        {/* Métrica 4: Partículas */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Partículas
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {masteredParticlesCount} / 99 dominadas
            </span>
          </div>
        </div>
      </div>

      {/* Enlace rápido a ver estadísticas completas en /progress */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Datos sincronizados localmente y respaldados en tu perfil.</span>
        {onNavigate && (
          <button
            onClick={() => onNavigate('/progress')}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Ver analítica detallada
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
