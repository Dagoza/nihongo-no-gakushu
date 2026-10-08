'use client';

import React from 'react';
import { 
  Languages, 
  Target, 
  Award, 
  Sparkles, 
  ArrowUpRight, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function JapanesePillarsGuide({ onOpenPillar }) {
  const pillars = [
    {
      id: 'writing',
      title: 'Sistemas de Escritura',
      badge: 'Bases Gráficas',
      kanjiSample: 'あ / ア / 漢',
      desc: 'Hiragana fonético, Katakana para extranjerismos y Kanjis conceptuales.',
      icon: Languages,
      color: '#6366f1',
      bgLight: '#eef2ff',
      tag: '46+46+2000+'
    },
    {
      id: 'particles',
      title: 'Estructura & Partículas',
      badge: 'Gramática SOV',
      kanjiSample: 'は · が · を · に',
      desc: 'El orden Sujeto-Objeto-Verbo y las partículas esenciales que conectan las ideas.',
      icon: Target,
      color: '#10b981',
      bgLight: '#ecfdf5',
      tag: '99 Partículas'
    },
    {
      id: 'jlpt',
      title: 'Niveles Oficiales JLPT',
      badge: 'Estándar Oficial',
      kanjiSample: 'N5 → N1',
      desc: 'Ruta certificada internacional desde principiante (N5) hasta fluidez nativa (N1).',
      icon: Award,
      color: '#f59e0b',
      bgLight: '#fffbeb',
      tag: '5 Niveles'
    },
    {
      id: 'phonetics',
      title: 'Fonética & Pitch Accent',
      badge: 'Ritmo & Melodía',
      kanjiSample: '拍 · 雨 vs 飴',
      desc: 'El compás de las moras uniformes y la entonación tonal que evita confusiones.',
      icon: Sparkles,
      color: '#ec4899',
      bgLight: '#fdf2f8',
      tag: 'Acento Tonal'
    }
  ];

  return (
    <section className="space-y-4">
      {/* Título de la Sección Zen */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Arquitectura del Idioma
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Los 4 Pilares del Japonés
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
          Explora cada pilar de forma limpia y progresiva con audio, desgloses y ejemplos sin saturar la pantalla.
        </p>
      </div>

      {/* Bento Grid de los 4 Pilares */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              onClick={() => onOpenPillar(pillar.id)}
              className="zen-pillar-card group cursor-pointer relative overflow-hidden rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Marca de fondo de agua zen */}
              <div 
                className="absolute -right-3 -bottom-4 text-5xl font-black opacity-[0.04] dark:opacity-[0.06] select-none pointer-events-none jp-text transition-transform duration-500 group-hover:scale-110"
              >
                {pillar.kanjiSample.split(' ')[0]}
              </div>

              <div>
                {/* Cabecera de la tarjeta */}
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm"
                    style={{ backgroundColor: `${pillar.color}15`, color: pillar.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {pillar.tag}
                  </span>
                </div>

                {/* Insignia y Título */}
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  {pillar.badge}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {pillar.title}
                </h3>

                {/* Muestra de Caracteres Japoneses */}
                <div className="mt-2 py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 inline-block font-mono jp-text text-xs font-bold text-slate-700 dark:text-slate-300">
                  {pillar.kanjiSample}
                </div>

                {/* Descripción concisa */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed line-clamp-2">
                  {pillar.desc}
                </p>
              </div>

              {/* Botón táctil inferior */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                <span>Explorar guía</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
