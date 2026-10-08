'use client';

import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  ArrowRight, 
  Languages, 
  Target, 
  Award, 
  Sparkles 
} from 'lucide-react';
import audioManager from '../../lib/audioManager';

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
      summary: 'El japonés moderno no utiliza un solo abecedario, sino una combinación armoniosa de 3 sistemas nativos complementarios más la transcripción en alfabeto latino.',
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
            { jp: 'だれが 来ましたか。', romaji: 'Dare ga kimashita ka.', es: '¿Quién es el que vino?' }
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
          name: 'N5 — Nivel Oficial JLPT N5',
          role: 'Comprensión básica de la vida cotidiana',
          desc: '~100 Kanjis y ~800 palabras de vocabulario. Capacidad de leer frases sencillas escritas en hiragana, katakana y kanji de uso cotidiano.',
          examples: [
            { jp: 'これは いくら ですか。', romaji: 'Kore wa ikura desu ka.', es: '¿Cuánto cuesta esto?' },
            { jp: '毎朝 パンを 食べます。', romaji: 'Maiasa pan o tabemasu.', es: 'Como pan todas las mañanas.' }
          ]
        },
        {
          id: 'n4',
          name: 'N4 — Nivel Oficial JLPT N4',
          role: 'Conversaciones cotidianas fluidas',
          desc: '~300 Kanjis y ~1,500 palabras. Comprensión de diálogos a velocidad moderada, conjugaciones potenciales, formas pasivas y condicionales.',
          examples: [
            { jp: '漢字を 書く ことが できます。', romaji: 'Kanji o kaku koto ga dekimasu.', es: 'Puedo escribir kanji.' },
            { jp: '雨が 降ったら、行きません。', romaji: 'Ame ga futtara, ikimasen.', es: 'Si llueve, no iré.' }
          ]
        },
        {
          id: 'n3',
          name: 'N3 — Nivel Oficial JLPT N3',
          role: 'Autonomía en la vida en Japón',
          desc: '~650 Kanjis y ~3,750 palabras. Comprensión de noticias cotidianas, situaciones laborales comunes y expresión de opiniones.',
          examples: [
            { jp: '日本語の 勉強を 続けて います。', romaji: 'Nihongo no benkyō o tsuzukete imasu.', es: 'Sigo estudiando japonés continuamente.' }
          ]
        },
        {
          id: 'n2_n1',
          name: 'N2 y N1 — Niveles Oficiales JLPT N2 y N1',
          role: 'Ámbito laboral profesional y textos complejos',
          desc: 'N2 (~1,000 Kanjis, nivel requerido por empresas en Japón) y N1 (~2,000+ Kanjis, comprensión de ensayos abstractos, literatura y debates técnicos).',
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
      summary: 'El japonés no tiene acentos de fuerza como el español (aguda, llana, esdrújula), sino un sistema de tonos altos y bajos (Pitch Accent) y un ritmo estricto de moras (tiempos uniformes).',
      sections: [
        {
          id: 'moras',
          name: '1. El Ritmo de las Moras (拍)',
          role: 'Cada sonido dura exactamente el mismo compás',
          desc: 'Una vocal larga (おう, ああ) o una pausa pequeña (っ) cuenta como una mora completa de tiempo. Romper este compás altera el significado de la palabra.',
          examples: [
            { jp: 'おばさん', romaji: 'O-ba-sa-n (4 moras)', es: 'Tía / Señora' },
            { jp: 'おばあさん', romaji: 'O-ba-a-sa-n (5 moras)', es: 'Abuela' },
            { jp: 'きって', romaji: 'Ki-t-te (3 moras)', es: 'Estampilla postal' }
          ]
        },
        {
          id: 'pitch',
          name: '2. Pitch Accent (Acento Tonal)',
          role: 'Tonos altos y bajos que diferencian homófonos',
          desc: 'Palabras idénticas en kana difieren únicamente según la altura del tono de la voz en cada mora.',
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
    <div className="term-modal-overlay" onClick={onClose}>
      <div 
        className="term-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="term-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div 
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(99, 102, 241, 0.12)',
                color: currentData.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PillarIcon size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.04em' }}>
                {currentData.badge}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: '2px 0 0' }}>
                {currentData.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 8,
              borderRadius: 10
            }}
            title="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Pestañas de selector */}
        <div className="term-modal-tabs">
          {[
            { id: 'writing', label: '1. Escritura' },
            { id: 'particles', label: '2. Partículas' },
            { id: 'jlpt', label: '3. Niveles JLPT' },
            { id: 'phonetics', label: '4. Fonética & Tono' }
          ].map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePillar(p.id)}
              className={`term-modal-tab-btn ${activePillar === p.id ? 'active' : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Cuerpo con Scroll */}
        <div className="term-modal-body">
          {/* Resumen */}
          <div 
            style={{ 
              padding: '14px 18px', 
              borderRadius: 16, 
              background: 'var(--primary-bg)', 
              border: '1px solid var(--border-focus)',
              fontSize: '0.86rem',
              color: 'var(--text-main)',
              lineHeight: 1.5,
              fontWeight: 500
            }}
          >
            💡 {currentData.summary}
          </div>

          {/* Secciones de contenido */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {currentData.sections.map((sec, idx) => (
              <div key={sec.id} className="term-modal-section-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {sec.name}
                    </h3>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {sec.role}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    Paso {idx + 1}
                  </span>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  {sec.desc}
                </p>

                {/* Muestra de ejemplos con Audio */}
                <div className="term-sample-grid">
                  {sec.examples.map((ex, exIdx) => {
                    const audioId = `${sec.id}_${exIdx}`;
                    const isPlaying = playingAudio === audioId;

                    return (
                      <div
                        key={exIdx}
                        onClick={() => playAudio(ex.jp, audioId)}
                        className={`term-sample-item ${isPlaying ? 'playing' : ''}`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') playAudio(ex.jp, audioId); }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="jp-text" style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)' }}>
                            {ex.jp}
                          </span>
                          <Volume2 size={16} style={{ color: isPlaying ? 'var(--primary)' : 'var(--text-light)' }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {ex.romaji}
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                          {ex.es}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie del modal */}
        <div 
          style={{ 
            padding: '16px 24px', 
            borderTop: '1px solid var(--border)', 
            background: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Volume2 size={15} style={{ color: 'var(--primary)' }} />
            Toca cualquier ejemplo para escuchar su pronunciación neuronal nativa.
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {onNavigate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (activePillar === 'particles') onNavigate('/grammar');
                  else if (activePillar === 'jlpt') onNavigate('/jlpt');
                  else if (activePillar === 'writing') onNavigate('/kanji');
                  else onNavigate('/curriculum');
                }}
                className="home-btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                <span>Practicar en profundidad</span>
                <ArrowRight size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="home-btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
