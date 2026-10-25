'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  Volume2, 
  ArrowRight, 
  Languages, 
  Target, 
  Award, 
  Sparkles,
  BookOpen,
  Search,
  Filter,
  Compass,
  Layers,
  Sparkle
} from 'lucide-react';
import audioManager from '../../lib/audioManager';
import terminologyList from '../../data/terminology.json';

/**
 * Normaliza texto en japonés para síntesis de voz neuronal eliminando lecturas entre paréntesis.
 */
function cleanTextForAudio(text) {
  if (!text || typeof text !== 'string') return '';
  const cleaned = text.replace(/\s*[\(\（][^\)\）]*[\)\）]/g, '').trim();
  return cleaned || text.trim();
}

export default function TerminologyGuideView({
  initialPillar = 'writing',
  initialTerm = null,
  initialSearch = ''
}) {
  const [activePillar, setActivePillar] = useState(initialTerm ? 'glossary' : initialPillar);
  const [highlightedTermId, setHighlightedTermId] = useState(initialTerm);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // Filtros y búsqueda para el glosario
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Categorías de filtrado
  const categoryPills = useMemo(() => {
    return [
      'Todas',
      'Cortesía y Registro',
      'Etimología y Vocabulario',
      'Morfología y Kanji',
      'Morfología y Escritura',
      'Gramática y Verbos',
      'Gramática y Morfología',
      'Pronunciación y Fonética'
    ];
  }, []);

  // Términos filtrados
  const filteredTerms = useMemo(() => {
    if (!Array.isArray(terminologyList)) return [];
    const query = searchTerm.trim().toLowerCase();

    return terminologyList.filter((item) => {
      const matchCat =
        selectedCategory === 'Todas' || item.category === selectedCategory;
      if (!matchCat) return false;
      if (!query) return true;

      const termName = (item.term || '').toLowerCase();
      const kanji = (item.kanji || '').toLowerCase();
      const kana = (item.kana || '').toLowerCase();
      const romaji = (item.romaji || '').toLowerCase();
      const shortDef = (item.short_definition || '').toLowerCase();
      const fullExp = (item.full_explanation || '').toLowerCase();
      const category = (item.category || '').toLowerCase();

      return (
        termName.includes(query) ||
        kanji.includes(query) ||
        kana.includes(query) ||
        romaji.includes(query) ||
        shortDef.includes(query) ||
        fullExp.includes(query) ||
        category.includes(query)
      );
    });
  }, [searchTerm, selectedCategory]);

  // Sincronizar estado si cambian las props iniciales
  useEffect(() => {
    if (initialTerm) {
      setActivePillar('glossary');
      setHighlightedTermId(initialTerm);
    } else if (initialPillar) {
      setActivePillar(initialPillar);
    }
  }, [initialPillar, initialTerm]);

  // Desplazamiento suave y resaltado cuando se accede mediante enlace directo a un término
  useEffect(() => {
    if (activePillar === 'glossary' && highlightedTermId) {
      const timer = setTimeout(() => {
        const targetElement = document.getElementById(`term-card-${highlightedTermId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activePillar, highlightedTermId]);

  // Actualizar la URL de forma limpia al cambiar de pilar
  const handlePillarChange = (pillarId) => {
    setActivePillar(pillarId);
    if (pillarId !== 'glossary') {
      setHighlightedTermId(null);
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('pillar', pillarId);
      if (pillarId !== 'glossary') {
        url.searchParams.delete('term');
      }
      window.history.replaceState(null, '', url.toString());
    }
  };

  const playAudio = (text, id) => {
    const clean = cleanTextForAudio(text);
    if (!clean) return;

    setPlayingAudioId(id);
    audioManager.speak(clean);
    setTimeout(() => {
      setPlayingAudioId(null);
    }, 1800);
  };

  const pillarsData = {
    writing: {
      title: 'Sistemas de Escritura del Japonés',
      subtitle: 'Los 4 pilares gráficos: Hiragana, Katakana, Kanji y Rōmaji',
      badge: 'Escritura & Alfabetos',
      icon: Languages,
      color: '#6366f1',
      summary: 'El japonés moderno no utiliza un solo abecedario, sino una combinación armoniosa de tres sistemas nativos complementarios más la transcripción en alfabeto latino para la era digital.',
      sections: [
        {
          id: 'hiragana',
          name: '1. Hiragana (ひらがな)',
          role: 'El silabario fonético nativo base (46 caracteres)',
          desc: 'Caracteres redondeados originados de la caligrafía cursiva tradicional (Man\'yōgana). Se emplea para palabras de origen japonés autóctono (Wago), terminaciones verbales y adjetivales conjugables (Okurigana) y partículas gramaticales.',
          examples: [
            { jp: 'ありがとう', romaji: 'Arigatou', es: 'Gracias' },
            { jp: 'たべます', romaji: 'Tabemasu', es: 'Comer (forma cortés)' },
            { jp: 'わたしは がくせい です', romaji: 'Watashi wa gakusei desu', es: 'Yo soy estudiante' }
          ]
        },
        {
          id: 'katakana',
          name: '2. Katakana (カタカナ)',
          role: 'Fonética angulosa para préstamos internacionales y énfasis (46 caracteres)',
          desc: 'Comparte los mismos 46 sonidos del Hiragana con trazos rectos y decididos. Creado a partir de fragmentos de kanjis por monjes budistas. Se utiliza para préstamos extranjeros (Gairaigo), nombres de personas y países no sinófonos, onomatopeyas y términos científicos.',
          examples: [
            { jp: 'コーヒー', romaji: 'Kōhī', es: 'Café (del holandés koffie / inglés coffee)' },
            { jp: 'スペイン', romaji: 'Supein', es: 'España' },
            { jp: 'コンピューター', romaji: 'Konpyūtā', es: 'Computadora / Ordenador' }
          ]
        },
        {
          id: 'kanji',
          name: '3. Kanji (漢字)',
          role: 'Ideogramas conceptuales de significado y raíz léxica',
          desc: 'Caracteres ideográficos adoptados de China. Cada ideograma representa una raíz de significado independiente. Poseen dos tipos de lecturas: On\'yomi (lectura china sonora heredada) y Kun\'yomi (lectura japonesa nativa atribuida). Los 2,136 Joyo Kanji conforman el canon de uso habitual.',
          examples: [
            { jp: '日', romaji: 'HI / NICHI', es: 'Sol / Día' },
            { jp: '本', romaji: 'HON / MOTO', es: 'Libro / Origen' },
            { jp: '日本 (にほん)', romaji: 'Nihon', es: 'Japón (El origen del sol)' }
          ]
        },
        {
          id: 'romaji',
          name: '4. Rōmaji (ローマ字)',
          role: 'Transcripción en alfabeto latino y método digital IME',
          desc: 'Puente pedagógico inicial para estudiantes occidentales y herramienta indispensable en la era contemporánea para mecanografiar texto en teclados y dispositivos móviles mediante el método IME (Input Method Editor).',
          examples: [
            { jp: 'Nihongo', romaji: 'Ni-hon-go', es: 'Idioma Japonés' },
            { jp: 'Tokyo', romaji: 'Tō-kyō', es: 'Tokio (Capital del Este)' }
          ]
        }
      ]
    },
    particles: {
      title: 'Estructura Oracional y Partículas (助詞)',
      subtitle: 'El orden SOV y las partículas que definen el rol de cada elemento',
      badge: 'Gramática & Sintaxis',
      icon: Target,
      color: '#10b981',
      summary: 'A diferencia del español (Sujeto + Verbo + Objeto), el japonés ubica invariablemente el verbo al final de la oración (Sujeto + Objeto + Verbo). Las partículas son sufijos pequeños invariables que indican qué papel sintáctico desempeña cada palabra.',
      sections: [
        {
          id: 'wa_ga',
          name: '1. は (wa) vs が (ga) — Tema vs Sujeto',
          role: 'La distinción conceptual más importante del japonés',
          desc: '「は」 (se pronuncia WA cuando funciona como partícula) establece el TEMA general de la conversación («En cuanto a X...»). 「が」 (ga) enfoca el SUJETO gramatical que realiza la acción específica o introduce información nueva que el oyente desconoce.',
          examples: [
            { jp: '私は 田中 です。', romaji: 'Watashi wa Tanaka desu.', es: 'En cuanto a mí, soy Tanaka.' },
            { jp: 'だれが 来ましたか。', romaji: 'Dare ga kimashita ka.', es: '¿Quién es el que ha venido?' }
          ]
        },
        {
          id: 'wo_ni',
          name: '2. を (o) y に (ni) — Objeto Directo y Destino',
          role: 'Receptor de la acción y puntos específicos en el espacio/tiempo',
          desc: '「を」 (se pronuncia O) marca el objeto directo sobre el que recae la acción del verbo transitivo. 「に」 (ni) señala el punto exacto de destino, hora precisa o receptor indirecto.',
          examples: [
            { jp: '水を 飲みます。', romaji: 'Mizu o nomimasu.', es: 'Bebo agua.' },
            { jp: '東京に 行きます。', romaji: 'Tōkyō ni ikimasu.', es: 'Voy a Tokio.' },
            { jp: '七時に 起きます。', romaji: 'Shichiji ni okimasu.', es: 'Me despierto a las 7:00 en punto.' }
          ]
        },
        {
          id: 'de_e',
          name: '3. で (de) y へ (e) — Lugar de Acción Dinámica y Dirección',
          role: 'Medio, herramienta, contexto físico y trayectoria',
          desc: '「で」 (de) indica el lugar donde transcurre una acción dinámica activa o el instrumento/medio de transporte utilizado. 「へ」 (se pronuncia E) enfatiza el vector de orientación y dirección hacia un punto.',
          examples: [
            { jp: 'レストランで 食べます。', romaji: 'Resutoran de tabemasu.', es: 'Como en el restaurante.' },
            { jp: '電車で 行きます。', romaji: 'Densha de ikimasu.', es: 'Voy en tren (de = medio).' },
            { jp: '日本へ ようこそ。', romaji: 'Nihon e yōkoso.', es: 'Bienvenido a Japón (he = dirección).' }
          ]
        },
        {
          id: 'to_mo',
          name: '4. と (to) y も (mo) — Compañía/Unión e Inclusión («También»)',
          role: 'Conjunción exhaustiva y paralelismo',
          desc: '「と」 (to) une sustantivos de forma exhaustiva («A y B») o denota compañía («con X»). 「も」 (mo) sustituye a は, が y を para expresar inclusión («también / tampoco»).',
          examples: [
            { jp: '友達と 話します。', romaji: 'Tomodachi to hanashimasu.', es: 'Hablo con un amigo.' },
            { jp: '私も 学生 です。', romaji: 'Watashi mo gakusei desu.', es: 'Yo también soy estudiante.' }
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
      summary: 'El examen oficial JLPT es la certificación internacional homologada por el Ministerio de Educación de Japón y empresas en todo el mundo. Va del nivel introductorio (N5) al dominio nativo superior (N1).',
      sections: [
        {
          id: 'n5',
          name: 'N5 — Nivel Inicial Cotidiano',
          role: '~100 Kanjis · ~800 Palabras de Vocabulario',
          desc: 'Capacidad de comprender expresiones habituales de la vida diaria escritas en hiragana, katakana y kanjis elementales. Frases declarativas cortés estándar (です/ます), preguntas de compra y direcciones.',
          examples: [
            { jp: 'これは いくら ですか。', romaji: 'Kore wa ikura desu ka.', es: '¿Cuánto cuesta esto?' },
            { jp: '毎朝 パンを 食べます。', romaji: 'Maiasa pan o tabemasu.', es: 'Como pan todas las mañanas.' }
          ]
        },
        {
          id: 'n4',
          name: 'N4 — Autonomía en Conversación Diaria',
          role: '~300 Kanjis · ~1,500 Palabras de Vocabulario',
          desc: 'Comprensión de diálogos y pasajes cotidianos a velocidad moderada. Dominio de formas potenciales (ことができる), condicionales (たら/ば), forma te de conexión y primeros prefijos de cortesía Bikougo (お/ご).',
          examples: [
            { jp: '漢字を 書く ことが できます。', romaji: 'Kanji o kaku koto ga dekimasu.', es: 'Puedo escribir ideogramas kanji.' },
            { jp: '雨が 降ったら、行きません。', romaji: 'Ame ga futtara, ikimasen.', es: 'Si llueve, no iré.' }
          ]
        },
        {
          id: 'n3',
          name: 'N3 — Puente Intermedio & Vida en Japón',
          role: '~650 Kanjis · ~3,750 Palabras de Vocabulario',
          desc: 'Capacidad de desenvolverse con soltura en la vida diaria en Japón, comprender noticias y artículos de prensa sencillos y expresar opiniones personales estructuradas.',
          examples: [
            { jp: '日本語の 勉強を 続けて います。', romaji: 'Nihongo no benkyō o tsuzukete imasu.', es: 'Sigo estudiando japonés continuamente.' }
          ]
        },
        {
          id: 'n2_n1',
          name: 'N2 y N1 — Dominio Profesional y Nativo',
          role: 'N2: ~1,000 Kanjis · N1: ~2,000+ Kanjis',
          desc: 'N2 es el requisito estándar exigido por empresas y universidades japonesas para trabajar en entornos profesionales. N1 acredita competencia en ensayos abstractos, literatura, lenguaje técnico y matices culturales profundos.',
          examples: [
            { jp: '日本の 文化に 深い 関心を 持って います。', romaji: 'Nihon no bunka ni fukai kanshin o motte imasu.', es: 'Tengo un profundo interés en la cultura y sociedad japonesa.' }
          ]
        }
      ]
    },
    phonetics: {
      title: 'Fonética, Moras y Pitch Accent',
      subtitle: 'El ritmo musical de compás uniforme y la entonación tonal',
      badge: 'Pronunciación & Fonética',
      icon: Sparkles,
      color: '#ec4899',
      summary: 'El japonés no tiene acentos de fuerza o volumen como el español (agudas, llanas o esdrújulas), sino un sistema de entonación por alturas tonales (Pitch Accent) y un compás temporal exacto por moras.',
      sections: [
        {
          id: 'moras',
          name: '1. El Ritmo de las Moras (拍 - Haku)',
          role: 'Cada unidad de sonido dura exactamente el mismo compás de tiempo',
          desc: 'El japonés es una lengua isocrónica por moras. Una vocal larga (ああ, おう), una pausa glotal (っ) o la consonante nasal final (ん) cuenta como un compás completo. Acortar o prolongar estas unidades cambia el significado.',
          examples: [
            { jp: 'おばさん', romaji: 'O-ba-sa-n (4 moras)', es: 'Tía / Señora' },
            { jp: 'おばあさん', romaji: 'O-ba-a-sa-n (5 moras)', es: 'Abuela (la «a» larga añade un compás entero)' },
            { jp: 'きって', romaji: 'Ki-t-te (3 moras)', es: 'Sello / Estampilla postal (con pausa de sokuon)' }
          ]
        },
        {
          id: 'pitch',
          name: '2. Pitch Accent (Acento Tonal)',
          role: 'Alturas tonales relativas que diferencian homófonos',
          desc: 'Palabras con la misma escritura en silabario se diferencian en el oído por la altura tonal de la voz. Existen 4 patrones tonales estándar de Tokio: Heiban (plano), Atamadaka (alto en la primera mora), Nakadaka (pico intermedio) y Odaka (alto al final antes de la partícula).',
          examples: [
            { jp: '雨 (あめ)', romaji: 'Ame (Atamadaka: tono alto inicial Á-me)', es: 'Lluvia' },
            { jp: '飴 (あめ)', romaji: 'Ame (Heiban: tono bajo-alto a-MÉ)', es: 'Caramelo / Dulce' },
            { jp: '橋 (はし)', romaji: 'Hashi (Heiban: tono plano ascendente)', es: 'Puente' },
            { jp: '箸 (はし)', romaji: 'Hashi (Atamadaka: tono alto al inicio HÁ-shi)', es: 'Palillos para comer' }
          ]
        }
      ]
    },
    glossary: {
      title: 'Glosario Lingüístico y Diccionario de Conceptos',
      subtitle: '39 explicaciones completas: Keigo, Bikougo, Wago, Kango, Jukugo, verbos Godan/Ichidan y más',
      badge: 'Glosario Completo',
      icon: BookOpen,
      color: '#8b5cf6',
      summary: 'Explora todas las definiciones lingüísticas del idioma con desglose etimológico, ejemplos contextuales con audio neuronal y referencias cruzadas.',
      isDynamicGlossary: true
    }
  };

  const currentData = pillarsData[activePillar] || pillarsData.writing;
  const PillarIcon = currentData.icon;

  // Definición de pestañas con labels adaptativos
  const pillarsTabs = useMemo(() => [
    { 
      id: 'writing', 
      label: '1. Sistemas de Escritura', 
      shortLabel: '1. Escritura',
      icon: Languages, 
      count: '4 Sistemas',
      color: '#6366f1',
      badgeBg: 'rgba(99, 102, 241, 0.12)'
    },
    { 
      id: 'particles', 
      label: '2. Estructura & Partículas', 
      shortLabel: '2. Partículas',
      icon: Target, 
      count: 'Sintaxis SOV',
      color: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.12)'
    },
    { 
      id: 'jlpt', 
      label: '3. Niveles JLPT', 
      shortLabel: '3. JLPT',
      icon: Award, 
      count: 'N5 a N1',
      color: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.12)'
    },
    { 
      id: 'phonetics', 
      label: '4. Fonética & Tono', 
      shortLabel: '4. Fonética',
      icon: Sparkles, 
      count: 'Moras & Pitch',
      color: '#ec4899',
      badgeBg: 'rgba(236, 72, 153, 0.12)'
    },
    { 
      id: 'glossary', 
      label: '5. Glosario Lingüístico', 
      shortLabel: '5. Glosario',
      icon: BookOpen, 
      count: `${terminologyList.length} Términos`,
      color: '#8b5cf6',
      badgeBg: 'rgba(139, 92, 246, 0.12)'
    }
  ], []);

  // Accesos contextuales dentro de cada pestaña
  const TAB_ACCESS_DATA = useMemo(() => ({
    writing: {
      title: 'Aplica los Sistemas de Escritura en tu Práctica',
      subtitle: 'Conecta la teoría de Hiragana, Katakana y Kanji con las herramientas interactivas:',
      items: [
        {
          title: 'Diccionario de Kanjis',
          badge: '2,136 Joyo Kanji',
          desc: 'Explora trazos animados, lecturas On\'yomi / Kun\'yomi y familias de radicales.',
          href: '/kanji',
          icon: Languages,
          color: '#6366f1',
          bg: 'rgba(99, 102, 241, 0.1)'
        },
        {
          title: 'Banco de Vocabulario',
          badge: 'Lecturas Kana & Romaji',
          desc: 'Practica vocabulario con kanjis, hiragana y katakana con audio neuronal nativo.',
          href: '/vocab',
          icon: Layers,
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.1)'
        },
        {
          title: 'Ruta de Aprendizaje N5',
          badge: 'Currículum Guiado',
          desc: 'Aprende los sistemas de escritura paso a paso con ejercicios progresivos.',
          href: '/curriculum',
          icon: Compass,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)'
        }
      ]
    },
    particles: {
      title: 'Aplica la Estructura y Partículas en tu Práctica',
      subtitle: 'Ejercita la sintaxis SOV y distingue con precisión las funciones de cada partícula:',
      items: [
        {
          title: 'Entrenador de Partículas',
          badge: 'Práctica Interactiva',
          desc: 'Pon a prueba は vs が, を, に, で, へ, と, も en oraciones y contextos reales.',
          href: '/particles',
          icon: Target,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)'
        },
        {
          title: 'Biblioteca de Gramática',
          badge: 'Reglas y Patrones',
          desc: 'Consulta todas las construcciones sintácticas, formas verbales y partículas.',
          href: '/grammar',
          icon: BookOpen,
          color: '#6366f1',
          bg: 'rgba(99, 102, 241, 0.1)'
        },
        {
          title: 'Ruta de Gramática en Currículum',
          badge: 'Lecciones N5 a N1',
          desc: 'Avanza por las explicaciones didácticas de sintaxis en el orden oficial.',
          href: '/curriculum',
          icon: Compass,
          color: '#8b5cf6',
          bg: 'rgba(139, 92, 246, 0.1)'
        }
      ]
    },
    jlpt: {
      title: 'Aplica el Estándar Oficial JLPT en tu Práctica',
      subtitle: 'Comprueba tu nivel y avanza de forma estructurada según la escala oficial N5 a N1:',
      items: [
        {
          title: 'Currículum Oficial N5 a N1',
          badge: 'Ruta Homologada',
          desc: 'Temarios completos clasificados por nivel con kanjis, gramática y vocabulario.',
          href: '/curriculum',
          icon: Compass,
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.1)'
        },
        {
          title: 'Simulador y Entrenador JLPT',
          badge: 'Tests por Nivel',
          desc: 'Mide tu preparación para el examen oficial con simulacros de preguntas.',
          href: '/jlpt',
          icon: Award,
          color: '#e11d48',
          bg: 'rgba(225, 29, 72, 0.1)'
        },
        {
          title: 'Vocabulario por Nivel JLPT',
          badge: 'Filtros N5-N1',
          desc: 'Estudia las listas de vocabulario oficial organizadas de N5 a N1 con repetición espaciada.',
          href: '/vocab',
          icon: Layers,
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.1)'
        }
      ]
    },
    phonetics: {
      title: 'Aplica la Fonética y Entonación en tu Práctica',
      subtitle: 'Perfecciona tu ritmo isocrónico por moras y discriminación del acento tonal (Pitch):',
      items: [
        {
          title: 'Vocabulario con Audio Neuronal',
          badge: 'Voz Japonesa Nativa',
          desc: 'Escucha la pronunciación de cada término con velocidad ajustable y entonación clara.',
          href: '/vocab',
          icon: Volume2,
          color: '#ec4899',
          bg: 'rgba(236, 72, 153, 0.1)'
        },
        {
          title: 'Historias y Shadowing',
          badge: 'Comprensión Auditiva',
          desc: 'Práctica de sombras y compás rítmico con textos contextualizados y furigana.',
          href: '/story',
          icon: BookOpen,
          color: '#8b5cf6',
          bg: 'rgba(139, 92, 246, 0.1)'
        },
        {
          title: 'Ruta Auditiva en Currículum',
          badge: 'Entrenamiento Auditivo',
          desc: 'Ejercicios guiados con audios MP3 oficiales y TTS de última generación.',
          href: '/curriculum',
          icon: Compass,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)'
        }
      ]
    },
    glossary: {
      title: 'Aplica la Terminología Lingüística en tu Práctica',
      subtitle: 'Conecta cada concepto del glosario (Keigo, Bikougo, Wago, Kango) con la aplicación diaria:',
      items: [
        {
          title: 'Vocabulario Completo',
          badge: 'Léxico Integral',
          desc: 'Busca palabras reales que aplican conceptos como Jukugo, Gairaigo y Wago.',
          href: '/vocab',
          icon: Layers,
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.1)'
        },
        {
          title: 'Biblioteca de Gramática',
          badge: 'Keigo y Registros',
          desc: 'Aprende el uso práctico de formas honoríficas (Sonkeigo, Kenjougo y Teineigo).',
          href: '/grammar',
          icon: Target,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)'
        },
        {
          title: 'Currículum Progresivo',
          badge: 'Ruta de Aprendizaje',
          desc: 'Avanza lección por lección integrando de forma natural todos los pilares estudiados.',
          href: '/curriculum',
          icon: Compass,
          color: '#6366f1',
          bg: 'rgba(99, 102, 241, 0.1)'
        }
      ]
    }
  }), []);

  const currentAccessData = TAB_ACCESS_DATA[activePillar] || TAB_ACCESS_DATA.writing;

  return (
    <div className="home-hub-container" style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 16px 80px' }}>
      
      {/* 1. HERO DE LA PÁGINA (CABECERA SIN BOTONES REDUNDANTES) */}
      <section 
        className="home-hero-card"
        style={{
          padding: '28px 24px',
          borderRadius: 24,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          marginBottom: 20
        }}
      >
        <div style={{ maxWidth: 840 }}>
          <div className="home-greeting-badge" style={{ marginBottom: 12 }}>
            <Sparkle size={14} color="#8b5cf6" />
            <span>Arquitectura Lingüística del Japonés</span>
          </div>

          <h1 className="home-hero-title" style={{ fontSize: '1.2rem', marginBottom: 6, lineHeight: 1.25 }}>
            Guía de Terminología y{' '}
            <span className="home-hero-highlight" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Pilares del Idioma
            </span>
          </h1>

          <p className="home-hero-desc" style={{ fontSize: '0.78rem', lineHeight: 1.35, color: 'var(--text-muted)', marginBottom: 0 }}>
            Una experiencia clara, sin saturación y fundamentada para comprender la estructura del japonés: los 5 pilares estructurales y el glosario completo con más de 39 explicaciones etimológicas, fórmulas de cortesía (Keigo, Bikougo) y audio nativo neuronal.
          </p>
        </div>
      </section>

      {/* 2. SELECTOR DE PESTAÑAS (LOS 5 PILARES) - GRID RESPONSIVO SIN SCROLL */}
      <nav 
        className="term-tabs-nav"
        role="tablist"
        aria-label="Pilares y secciones de terminología"
      >
        {pillarsTabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activePillar === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`pillar-panel-${tab.id}`}
              onClick={() => handlePillarChange(tab.id)}
              className={`term-tab-btn ${isActive ? 'active' : ''}`}
              style={{
                '--tab-color': tab.color,
                '--tab-badge-bg': tab.badgeBg
              }}
            >
              <div className="term-tab-icon-wrap">
                <TabIcon size={17} />
              </div>
              <div className="term-tab-title-wrap">
                <span className="term-tab-title">
                  <span className="term-tab-title-full">{tab.label}</span>
                  <span className="term-tab-title-short">{tab.shortLabel}</span>
                </span>
                <span className="term-tab-badge">
                  {tab.count}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* 3. RESUMEN SUPERIOR DEL PILAR SELECCIONADO */}
      <div 
        style={{ 
          padding: '16px 20px', 
          borderRadius: 16, 
          background: 'var(--primary-bg)', 
          border: '1px solid var(--border-focus)',
          fontSize: '0.92rem',
          color: 'var(--text-main)',
          lineHeight: 1.55,
          fontWeight: 500,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12
        }}
      >
        <div style={{ marginTop: 2, color: currentData.color, flexShrink: 0 }}>
          <PillarIcon size={20} />
        </div>
        <div>
          <strong style={{ color: currentData.color }}>{currentData.badge}: </strong>
          {currentData.summary}
        </div>
      </div>

      {/* 4. CONTENIDO PRINCIPAL POR PILAR */}
      {activePillar !== 'glossary' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {currentData.sections && currentData.sections.map((sec) => (
            <div 
              key={sec.id}
              className="term-modal-section-card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {sec.name}
                  </h3>
                </div>

                <div 
                  style={{ 
                    fontSize: '0.78rem', 
                    fontWeight: 700, 
                    color: currentData.color, 
                    marginBottom: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em'
                  }}
                >
                  {sec.role}
                </div>

                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 16px' }}>
                  {sec.desc}
                </p>
              </div>

              {/* Ejemplos con Audio */}
              {sec.examples && sec.examples.length > 0 && (
                <div style={{ background: 'var(--bg-subtle)', borderRadius: 14, padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                    Ejemplos didácticos:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sec.examples.map((ex, exIdx) => {
                      const audioKey = `${sec.id}_${exIdx}`;
                      const isPlaying = playingAudioId === audioKey;
                      return (
                        <div 
                          key={exIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '6px 8px',
                            background: 'var(--bg-card)',
                            borderRadius: 10,
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="jp-text" style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {ex.jp}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {ex.romaji && <span style={{ marginRight: 6, color: 'var(--primary)' }}>({ex.romaji})</span>}
                              <span>{ex.es}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => playAudio(ex.jp, audioKey)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: '1px solid var(--border)',
                              background: isPlaying ? 'var(--primary)' : 'var(--bg-subtle)',
                              color: isPlaying ? '#ffffff' : 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                              transition: 'all 0.18s ease'
                            }}
                            title="Escuchar pronunciación nativa"
                          >
                            <Volume2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Accesos contextuales dentro del contenido de la pestaña */}
          {currentAccessData && (
            <div className="term-access-section" style={{ gridColumn: '1 / -1' }}>
              <div className="term-access-header">
                <div className="term-access-title-wrap">
                  <Compass size={18} style={{ color: currentData.color }} />
                  <h4 className="term-access-title">{currentAccessData.title}</h4>
                </div>
                <p className="term-access-subtitle">{currentAccessData.subtitle}</p>
              </div>

              <div className="term-access-grid">
                {currentAccessData.items.map((acc, idx) => {
                  const AccIcon = acc.icon;
                  return (
                    <Link key={idx} href={acc.href} className="term-access-card">
                      <div className="term-access-icon" style={{ color: acc.color, background: acc.bg }}>
                        <AccIcon size={20} />
                      </div>
                      <div className="term-access-body">
                        <div className="term-access-top-line">
                          <span className="term-access-card-title">{acc.title}</span>
                          <span className="term-access-badge">{acc.badge}</span>
                        </div>
                        <p className="term-access-card-desc">{acc.desc}</p>
                        <div className="term-access-action" style={{ color: acc.color }}>
                          <span>Ir a la sección</span>
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VISTA DEL PILAR 5: GLOSARIO LINGÜÍSTICO COMPLETO */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Controles de Búsqueda y Filtros */}
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              background: 'var(--bg-card)',
              padding: '20px',
              borderRadius: 20,
              border: '1px solid var(--border)',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)'
            }}
          >
            {/* Input de Búsqueda */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search 
                size={18} 
                style={{ position: 'absolute', left: 16, color: 'var(--text-muted)', pointerEvents: 'none' }} 
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar término (ej. Bikougo, Keigo, Jukugo, Wago, Godan, Partícula)..."
                aria-label="Buscar en el glosario lingüístico"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 44px',
                  borderRadius: 14,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: 14,
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 4
                  }}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Categorías */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 4
              }}
            >
              <Filter size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginRight: 2 }} />
              {categoryPills.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 20,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--primary)' : 'var(--bg-subtle)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Contador de Resultados */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0 4px' }}>
              <span>
                Mostrando <strong>{filteredTerms.length}</strong> de {terminologyList.length} términos lingüísticos
              </span>
              {(searchTerm || selectedCategory !== 'Todas') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Todas');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: 0
                  }}
                >
                  Restablecer filtros
                </button>
              )}
            </div>
          </div>

          {/* Estado sin resultados */}
          {filteredTerms.length === 0 ? (
            <div 
              style={{
                padding: '44px 20px',
                textAlign: 'center',
                background: 'var(--bg-card)',
                borderRadius: 20,
                border: '1px dashed var(--border)'
              }}
            >
              <Search size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
                No se encontraron términos
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                No hay resultados coincidentes con &quot;{searchTerm}&quot; en la categoría seleccionada.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Todas');
                }}
                className="home-btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.82rem', margin: '0 auto' }}
              >
                Ver todos los términos
              </button>
            </div>
          ) : (
            /* Lista de Tarjetas de Términos Lingüísticos */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {filteredTerms.map((term) => {
                const isHighlighted = highlightedTermId === term.id;
                const isBikougo = term.id === 'bikougo';

                return (
                  <div
                    key={term.id}
                    id={`term-card-${term.id}`}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 22,
                      padding: '24px',
                      border: isHighlighted 
                        ? '2.5px solid var(--primary)' 
                        : isBikougo
                        ? '1.5px solid rgba(139, 92, 246, 0.4)'
                        : '1px solid var(--border)',
                      boxShadow: isHighlighted
                        ? '0 0 0 4px rgba(99, 102, 241, 0.18), 0 8px 30px rgba(0, 0, 0, 0.06)'
                        : '0 4px 18px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {/* Fila Superior: Categoría, Kanji y Audio */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              padding: '3px 10px',
                              borderRadius: 8,
                              background: isBikougo ? 'rgba(139, 92, 246, 0.15)' : 'var(--primary-bg)',
                              color: isBikougo ? '#8b5cf6' : 'var(--primary)'
                            }}
                          >
                            {term.category}
                          </span>

                          {isBikougo && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: 8,
                                background: 'rgba(16, 185, 129, 0.12)',
                                color: '#10b981'
                              }}
                            >
                              ✨ Prefijos お- / ご-
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span>{term.term}</span>
                          {term.kanji && (
                            <span className="jp-text" style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800 }}>
                              {term.kanji}
                            </span>
                          )}
                        </h3>

                        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                          {term.kana && <span className="jp-text" style={{ marginRight: 8 }}>「{term.kana}」</span>}
                          {term.romaji && <span>({term.romaji})</span>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => playAudio(term.kanji || term.kana || term.term, `term_${term.id}`)}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          border: '1px solid var(--border)',
                          background: playingAudioId === `term_${term.id}` ? 'var(--primary)' : 'var(--bg-subtle)',
                          color: playingAudioId === `term_${term.id}` ? '#ffffff' : 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'all 0.18s ease'
                        }}
                        title={`Escuchar pronunciación de ${term.term}`}
                      >
                        <Volume2 size={18} />
                      </button>
                    </div>

                    {/* Definición Corta */}
                    <div 
                      style={{ 
                        padding: '10px 14px', 
                        borderRadius: 12, 
                        background: 'var(--bg-subtle)', 
                        border: '1px solid var(--border)',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        marginBottom: 14,
                        lineHeight: 1.45
                      }}
                    >
                      💡 {term.short_definition}
                    </div>

                    {/* Explicación Detallada */}
                    <div 
                      style={{ 
                        fontSize: '0.88rem', 
                        color: 'var(--text-main)', 
                        lineHeight: 1.65, 
                        whiteSpace: 'pre-line',
                        marginBottom: 18 
                      }}
                    >
                      {term.full_explanation}
                    </div>

                    {/* Ejemplos Prácticos */}
                    {term.examples && term.examples.length > 0 && (
                      <div 
                        style={{ 
                          background: 'var(--bg-subtle)', 
                          borderRadius: 16, 
                          padding: '14px 16px', 
                          border: '1px solid var(--border)' 
                        }}
                      >
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                          Ejemplos contextuales con pronunciación:
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                          {term.examples.map((ex, exIdx) => {
                            const audioKey = `term_ex_${term.id}_${exIdx}`;
                            const isPlaying = playingAudioId === audioKey;

                            return (
                              <div
                                key={exIdx}
                                style={{
                                  background: 'var(--bg-card)',
                                  borderRadius: 12,
                                  padding: '10px 12px',
                                  border: '1px solid var(--border)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 10
                                }}
                              >
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div className="jp-text" style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                    {ex.jp}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                    {ex.es}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => playAudio(ex.jp, audioKey)}
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: isPlaying ? 'var(--primary)' : 'var(--bg-subtle)',
                                    color: isPlaying ? '#ffffff' : 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    transition: 'all 0.18s ease'
                                  }}
                                  title="Escuchar audio"
                                >
                                  <Volume2 size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Accesos contextuales dentro del contenido del glosario */}
          {currentAccessData && (
            <div className="term-access-section">
              <div className="term-access-header">
                <div className="term-access-title-wrap">
                  <Compass size={18} style={{ color: currentData.color }} />
                  <h4 className="term-access-title">{currentAccessData.title}</h4>
                </div>
                <p className="term-access-subtitle">{currentAccessData.subtitle}</p>
              </div>

              <div className="term-access-grid">
                {currentAccessData.items.map((acc, idx) => {
                  const AccIcon = acc.icon;
                  return (
                    <Link key={idx} href={acc.href} className="term-access-card">
                      <div className="term-access-icon" style={{ color: acc.color, background: acc.bg }}>
                        <AccIcon size={20} />
                      </div>
                      <div className="term-access-body">
                        <div className="term-access-top-line">
                          <span className="term-access-card-title">{acc.title}</span>
                          <span className="term-access-badge">{acc.badge}</span>
                        </div>
                        <p className="term-access-card-desc">{acc.desc}</p>
                        <div className="term-access-action" style={{ color: acc.color }}>
                          <span>Ir a la sección</span>
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
