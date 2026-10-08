'use client';

import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Target, 
  Award, 
  Languages, 
  HelpCircle 
} from 'lucide-react';
import audioManager from '../../lib/audioManager';
import FuriganaText from '../features/FuriganaText';

export default function TerminologyDetailModal({ isOpen, onClose, initialPillarId = 'writing', onNavigate }) {
  const [activePillar, setActivePillar] = useState(initialPillarId);
  const [playingAudio, setPlayingAudio] = useState(null);

  if (!isOpen) return null;

  const playAudio = (text, id) => {
    setPlayingAudio(id);
    audioManager.speak(text);
    setTimeout(() => {
      setPlayingAudio(null);
    }, 1800);
  };

  const pillarsData = {
    writing: {
      title: 'Sistemas de Escritura del Japonés',
      subtitle: 'Los 4 pilares gráficos: Hiragana, Katakana, Kanji y Rōmaji',
      badge: 'Escritura & Alfabetos',
      icon: Languages,
      color: '#6366f1',
      summary: 'El japonés moderno no utiliza un solo alfabeto, sino una orquestación armoniosa de 3 sistemas nativos complementarios más la transcripción en caracteres latinos.',
      sections: [
        {
          id: 'hiragana',
          name: '1. Hiragana (ひらがな)',
          role: 'El abecedario fonético nativo base',
          desc: 'Consta de 46 caracteres principales redondeados. Se usa para palabras de origen japonés, terminaciones verbales (okurigana) y partículas gramaticales.',
          examples: [
            { jp: 'ありがとう', romaji: 'Arigatou', es: 'Gracias' },
            { jp: 'たべます', romaji: 'Tabemasu', es: 'Comer (forma formal)' },
            { jp: 'わたし', romaji: 'Watashi', es: 'Yo' }
          ]
        },
        {
          id: 'katakana',
          name: '2. Katakana (カタカナ)',
          role: 'Fonética angulosa para extranjerismos y énfasis',
          desc: 'Comparte exactamente los mismos 46 sonidos del Hiragana pero con trazos rectos y angulares. Se emplea para préstamos lingüísticos internacionales, nombres extranjeros, onomatopeyas y nombres científicos.',
          examples: [
            { jp: 'コーヒー', romaji: 'Kōhī', es: 'Café (del inglés coffee)' },
            { jp: 'スペイン', romaji: 'Supein', es: 'España' },
            { jp: 'コンピューター', romaji: 'Konpyūtā', es: 'Computadora' }
          ]
        },
        {
          id: 'kanji',
          name: '3. Kanji (漢字)',
          role: 'Ideogramas de significado y raíz conceptual',
          desc: 'Caracteres conceptuales traídos de China. Cada kanji tiene significado propio y usualmente dos lecturas: On\'yomi (lectura china sonora) y Kun\'yomi (lectura japonesa autóctona).',
          examples: [
            { jp: '日', romaji: 'HI / NICHI', es: 'Sol / Día' },
            { jp: '本', romaji: 'HON / MOTO', es: 'Libro / Origen' },
            { jp: '日本', romaji: 'Nihon', es: 'Japón (Origen del Sol)' }
          ]
        },
        {
          id: 'romaji',
          name: '4. Rōmaji (ローマ字)',
          role: 'Transcripción fonética en alfabeto latino',
          desc: 'Sirve de puente didáctico para principiantes y como método universal para escribir en computadoras y teléfonos inteligentes mediante el teclado IME.',
          examples: [
            { jp: 'Nihongo', romaji: 'Ni-hon-go', es: 'Idioma Japonés' },
            { jp: 'Tokyo', romaji: 'Tō-kyō', es: 'Tokio (Capital del Este)' }
          ]
        }
      ]
    },
    particles: {
      title: 'Estructura Oracional y Partículas (助詞)',
      subtitle: 'El orden SOV y las partículas que conectan las ideas',
      badge: 'Gramática & Partículas',
      icon: Target,
      color: '#10b981',
      summary: 'A diferencia del español (Sujeto + Verbo + Objeto), el japonés ubica el verbo siempre al final (SOV). Las partículas son sufijos pequeños que indican qué rol desempeña cada palabra.',
      sections: [
        {
          id: 'wa_ga',
          name: '1. は (wa) vs が (ga) — Tema vs Sujeto',
          role: 'La distinción fundamental del japonés',
          desc: '「は」 (se pronuncia WA como partícula) define el TEMA principal de conversación ("En cuanto a X..."). 「が」 (ga) enfoca el SUJETO específico que realiza la acción o introduce nueva información.',
          examples: [
            { jp: '私は 田中 です。', romaji: 'Watashi wa Tanaka desu.', es: 'En cuanto a mí, soy Tanaka.' },
            { jp: 'だれが 来ましたか。', romaji: 'Dare ga kimashita ka.', es: '¿Quién es el que vino? (énfasis en quién)' }
          ]
        },
        {
          id: 'wo_ni',
          name: '2. を (o) y に (ni) — Objeto y Destino',
          role: 'Dirección y recepción de acciones',
          desc: '「を」 (se pronuncia O) marca el objeto directo sobre el que recae el verbo. 「に」 (ni) marca el punto exacto de destino, tiempo preciso o receptor indirecto.',
          examples: [
            { jp: 'みずを のみます。', romaji: 'Mizu o nomimasu.', es: 'Bebo agua.' },
            { jp: 'とうきょうに いきます。', romaji: 'Tōkyō ni ikimasu.', es: 'Voy a Tokio.' },
            { jp: '七時に おきます。', romaji: 'Shichiji ni okimasu.', es: 'Me despierto a las 7:00.' }
          ]
        },
        {
          id: 'de_e',
          name: '3. で (de) y へ (e) — Lugar de Acción y Dirección',
          role: 'Herramientas, contexto y rumbo',
          desc: '「で」 (de) indica el lugar donde ocurre una acción dinámica o el medio/herramienta. 「へ」 (se pronuncia E) enfatiza la dirección del viaje hacia un lugar.',
          examples: [
            { jp: 'レストランで たべます。', romaji: 'Resutoran de tabemasu.', es: 'Como en el restaurante.' },
            { jp: 'でんしゃで いきます。', romaji: 'Densha de ikimasu.', es: 'Voy en tren.' },
            { jp: '日本へ ようこそ。', romaji: 'Nihon e yōkoso.', es: 'Bienvenido a Japón.' }
          ]
        }
      ]
    },
    jlpt: {
      title: 'Estándar Oficial de Niveles JLPT (N5 a N1)',
      subtitle: 'Japanese-Language Proficiency Test (日本語能力試験)',
      badge: 'Escala Oficial JLPT',
      icon: Award,
      color: '#f59e0b',
      summary: 'El examen oficial JLPT es el estándar mundial reconocido por universidades y empresas en Japón. Va del nivel básico inicial (N5) al dominio nativo superior (N1).',
      sections: [
        {
          id: 'n5',
          name: 'N5 — Nivel Principiante Esencial',
          role: 'Comprensión básica de la vida cotidiana',
          desc: '~100 Kanjis y ~800 palabras de vocabulario. Capacidad de leer frases sencillas escritas en hiragana, katakana y kanji de uso cotidiano (saludos, compras, direcciones).',
          examples: [
            { jp: 'これは いくら ですか。', romaji: 'Kore wa ikura desu ka.', es: '¿Cuánto cuesta esto?' },
            { jp: '毎朝 パンを 食べます。', romaji: 'Maiasa pan o tabemasu.', es: 'Como pan todas las mañanas.' }
          ]
        },
        {
          id: 'n4',
          name: 'N4 — Nivel Elemental Sólido',
          role: 'Conversaciones cotidianas fluidas',
          desc: '~300 Kanjis y ~1,500 palabras. Comprensión de diálogos a velocidad moderada, conjugaciones potenciales, formas pasivas y condicionales básicas.',
          examples: [
            { jp: '漢字を 書く ことが できます。', romaji: 'Kanji o kaku koto ga dekimasu.', es: 'Puedo escribir kanji.' },
            { jp: '雨が 降ったら、行きません。', romaji: 'Ame ga futtara, ikimasen.', es: 'Si llueve, no iré.' }
          ]
        },
        {
          id: 'n3',
          name: 'N3 — Intermedio Puente',
          role: 'Autonomía en la vida en Japón',
          desc: '~650 Kanjis y ~3,750 palabras. Comprensión de noticias cotidianas, situaciones de trabajo y expresión de opiniones estructuradas.',
          examples: [
            { jp: '日本語の 勉強を 続けて います。', romaji: 'Nihongo no benkyō o tsuzukete imasu.', es: 'Sigo estudiando japonés continuamente.' }
          ]
        },
        {
          id: 'n2_n1',
          name: 'N2 y N1 — Intermedio Avanzado y Maestría',
          role: 'Fluidez profesional y comprensión académica',
          desc: 'N2 (~1,000 Kanjis, nivel laboral en Japón) y N1 (~2,000+ Kanjis, comprensión de ensayos abstractos, literatura y debates técnicos).',
          examples: [
            { jp: '日本の 文化に 深い 関心を 持って います。', romaji: 'Nihon no bunka ni fukai kanshin o motte imasu.', es: 'Tengo un profundo interés en la cultura japonesa.' }
          ]
        }
      ]
    },
    phonetics: {
      title: 'Fonética, Moras y Pitch Accent',
      subtitle: 'El ritmo musical y la entonación tonal japonesa',
      badge: 'Pronunciación & Fonética',
      icon: Sparkles,
      color: '#ec4899',
      summary: 'El japonés no tiene acentos de fuerza como el español (aguda, llana, esdrújula), sino un sistema de tonos altos y bajos (Pitch Accent) y un ritmo marcado por moras (unidades de tiempo idénticas).',
      sections: [
        {
          id: 'moras',
          name: '1. El Ritmo de las Moras (拍)',
          role: 'Cada sonido dura exactamente el mismo tiempo',
          desc: 'Una vocal larga (おう, ああ) o una pausa pequeña (っ) cuenta como una mora completa de tiempo. Romper este compás cambia el significado de la palabra.',
          examples: [
            { jp: 'おばさん', romaji: 'O-ba-sa-n (4 moras)', es: 'Tía / Señora' },
            { jp: 'おばあさん', romaji: 'O-ba-a-sa-n (5 moras)', es: 'Abuela' },
            { jp: 'きって', romaji: 'Ki-t-te (3 moras)', es: 'Estampilla postal' }
          ]
        },
        {
          id: 'pitch',
          name: '2. Pitch Accent (Acento Tonal)',
          role: 'Tonos altos y bajos que diferencian palabras homófonas',
          desc: 'Palabras escritas exactamente igual en kana varían su significado según la caída del tono musical de la voz.',
          examples: [
            { jp: '雨 (あめ)', romaji: 'Ame (Tono alto al inicio: Á-me)', es: 'Lluvia' },
            { jp: '飴 (あめ)', romaji: 'Ame (Tono bajo-alto plano: a-MÉ)', es: 'Dulce / Caramelo' },
            { jp: '橋 (はし)', romaji: 'Hashi (Tono plano)', es: 'Puente' },
            { jp: '箸 (はし)', romaji: 'Hashi (Tono alto al inicio)', es: 'Palillos para comer' }
          ]
        }
      ]
    }
  };

  const currentData = pillarsData[activePillar] || pillarsData.writing;
  const PillarIcon = currentData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${currentData.color}15`, color: currentData.color }}
            >
              <PillarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {currentData.badge}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  Guía Esencial
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {currentData.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cerrar guía"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Selector Rápido de Pilares */}
        <div className="px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'writing', label: '1. Escritura', icon: Languages },
            { id: 'particles', label: '2. Partículas', icon: Target },
            { id: 'jlpt', label: '3. Niveles JLPT', icon: Award },
            { id: 'phonetics', label: '4. Fonética & Tono', icon: Sparkles }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setActivePillar(p.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activePillar === p.id 
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <p.icon className="w-3.5 h-3.5" />
              {p.label}
            </button>
          ))}
        </div>

        {/* Contenido Desplazable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tarjeta de Resumen Zen */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100/80 dark:border-indigo-900/40 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            <p className="font-medium">
              💡 {currentData.summary}
            </p>
          </div>

          {/* Lista de Secciones Detalladas */}
          <div className="space-y-5">
            {currentData.sections.map((sec, idx) => (
              <div 
                key={sec.id}
                className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {sec.name}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {sec.role}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                    Paso {idx + 1}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  {sec.desc}
                </p>

                {/* Ejemplos interactivos con Audio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {sec.examples.map((ex, exIdx) => {
                    const audioId = `${sec.id}_${exIdx}`;
                    const isPlaying = playingAudio === audioId;

                    return (
                      <div 
                        key={exIdx}
                        onClick={() => playAudio(ex.jp, audioId)}
                        className={`p-3 rounded-xl bg-white dark:bg-slate-900 border transition-all cursor-pointer group flex flex-col justify-between ${
                          isPlaying 
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30' 
                            : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="jp-text text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {ex.jp}
                          </span>
                          <button
                            type="button"
                            className="p-1 rounded-lg text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                            title="Escuchar pronunciación nativa"
                          >
                            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce text-indigo-600' : ''}`} />
                          </button>
                        </div>
                        <div className="text-[11px] font-medium text-slate-400 dark:text-slate-400 font-mono">
                          {ex.romaji}
                        </div>
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                          {ex.es}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie del modal con acciones */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-500" />
            Toca cualquier ejemplo para escuchar su audio neuronal nativo.
          </span>

          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                onClick={() => {
                  onClose();
                  if (activePillar === 'particles') onNavigate('/grammar');
                  else if (activePillar === 'jlpt') onNavigate('/jlpt');
                  else if (activePillar === 'writing') onNavigate('/kanji');
                  else onNavigate('/curriculum');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                Practicar en profundidad
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
