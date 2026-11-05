'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sliders, 
  ArrowRight, 
  Info, 
  Eye, 
  EyeOff, 
  Headphones, 
  HelpCircle,
  Zap
} from 'lucide-react';
import audioManager from '../../lib/audioManager';
import PitchAccent from './PitchAccent';

// Pares y tríos mínimos fundamentales del acento de Tokio
export const TOKYO_MINIMAL_PAIRS = [
  {
    id: 'ame',
    kana: 'あめ',
    title: 'Ame (Lluvia vs Caramelo)',
    options: [
      {
        word: '雨',
        meaning: 'Lluvia',
        reading: 'あめ',
        pattern: 1,
        type: 'atamadaka',
        contourIsolated: 'H·L',
        contourWithParticle: 'H·L·L (あꜜめが)',
        notes: 'Atamadaka ①: La voz inicia en tono alto en "あ" y cae inmediatamente en "め".'
      },
      {
        word: '飴',
        meaning: 'Caramelo / Dulce',
        reading: 'あめ',
        pattern: 0,
        type: 'heiban',
        contourIsolated: 'L·H',
        contourWithParticle: 'L·H·H (あめが)',
        notes: 'Heiban ⓪: La voz sube en "め" y se mantiene alta al añadir la partícula が.'
      }
    ]
  },
  {
    id: 'hashi',
    kana: 'はし',
    title: 'Hashi (Palillos vs Puente vs Borde)',
    options: [
      {
        word: '箸',
        meaning: 'Palillos para comer',
        reading: 'はし',
        pattern: 1,
        type: 'atamadaka',
        contourIsolated: 'H·L',
        contourWithParticle: 'H·L·L (はꜜしが)',
        notes: 'Atamadaka ①: Inicia alto en "は" y desciende en "し".'
      },
      {
        word: '橋',
        meaning: 'Puente',
        reading: 'はし',
        pattern: 2,
        type: 'odaka',
        contourIsolated: 'L·H (con caída natural al final)',
        contourWithParticle: 'L·H·L (はしꜜが - Papel tornasol)',
        notes: 'Odaka ②: En aislamiento suena L·H; pero al añadir la partícula が, el tono CAE en が.'
      },
      {
        word: '端',
        meaning: 'Borde / Extremo',
        reading: 'はし',
        pattern: 0,
        type: 'heiban',
        contourIsolated: 'L·H',
        contourWithParticle: 'L·H·H (はしが - Plano continuo)',
        notes: 'Heiban ⓪: En aislamiento suena L·H; pero con la partícula が, el tono SE MANTIENE ALTO en が.'
      }
    ]
  },
  {
    id: 'hana',
    kana: 'はな',
    title: 'Hana (Flor vs Nariz)',
    options: [
      {
        word: '花',
        meaning: 'Flor',
        reading: 'はな',
        pattern: 2,
        type: 'odaka',
        contourIsolated: 'L·H',
        contourWithParticle: 'L·H·L (はなꜜが)',
        notes: 'Odaka ②: Con la partícula が, la entonación se precipita hacia abajo en が.'
      },
      {
        word: '鼻',
        meaning: 'Nariz',
        reading: 'はな',
        pattern: 0,
        type: 'heiban',
        contourIsolated: 'L·H',
        contourWithParticle: 'L·H·H (はなが)',
        notes: 'Heiban ⓪: Con la partícula が, la entonación continúa alta en が.'
      }
    ]
  },
  {
    id: 'kaki',
    kana: 'かき',
    title: 'Kaki (Ostra vs Caqui / Fruta)',
    options: [
      {
        word: '牡蠣',
        meaning: 'Ostra marina',
        reading: 'かき',
        pattern: 1,
        type: 'atamadaka',
        contourIsolated: 'H·L',
        contourWithParticle: 'H·L·L (かꜜきが)',
        notes: 'Atamadaka ①: Pico inicial en "か".'
      },
      {
        word: '柿',
        meaning: 'Caqui (fruta japonesa)',
        reading: 'かき',
        pattern: 0,
        type: 'heiban',
        contourIsolated: 'L·H',
        contourWithParticle: 'L·H·H (かきが)',
        notes: 'Heiban ⓪: Tono plano continuo.'
      }
    ]
  },
  {
    id: 'sake',
    kana: 'さけ',
    title: 'Sake (Licor de arroz vs Salmón)',
    options: [
      {
        word: '酒',
        meaning: 'Sake / Bebida alcohólica',
        reading: 'さけ',
        pattern: 0,
        type: 'heiban',
        contourIsolated: 'L·H',
        contourWithParticle: 'L·H·H (さけが)',
        notes: 'Heiban ⓪: Plano ascendente.'
      },
      {
        word: '鮭',
        meaning: 'Salmón',
        reading: 'さけ',
        pattern: 1,
        type: 'atamadaka',
        contourIsolated: 'H·L',
        contourWithParticle: 'H·L·L (さꜜけが)',
        notes: 'Atamadaka ①: Pico inicial y caída.'
      }
    ]
  }
];

export default function PitchAccentMinimalPairs({
  onComplete = null
}) {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [useParticle, setUseParticle] = useState(true); // Con partícula が (papel tornasol) vs Aislamiento
  const [isMuffled, setIsMuffled] = useState(false); // Audio Amortiguado (BiquadFilter paso bajo 350Hz)
  const [purePerceptionMode, setPurePerceptionMode] = useState(true); // Ocultar kanji y significado antes de responder
  
  // Opción correcta elegida aleatoriamente para el test
  const [targetOptionIndex, setTargetOptionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [scoreStats, setScoreStats] = useState({ correct: 0, total: 0 });

  const audioCtxRef = useRef(null);
  const audioSourceRef = useRef(null);
  const filterNodeRef = useRef(null);

  const activePair = TOKYO_MINIMAL_PAIRS[currentPairIndex] || TOKYO_MINIMAL_PAIRS[0];
  const currentTarget = activePair.options[targetOptionIndex] || activePair.options[0];

  // Configurar nueva pregunta
  const setupQuestion = useCallback((pairIdx) => {
    const pair = TOKYO_MINIMAL_PAIRS[pairIdx];
    if (!pair) return;
    const randomTarget = Math.floor(Math.random() * pair.options.length);
    setTargetOptionIndex(randomTarget);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, []);

  useEffect(() => {
    setupQuestion(currentPairIndex);
  }, [currentPairIndex, setupQuestion]);

  // Reproducir audio con o sin filtro de amortiguamiento (Muffle Audio paso bajo)
  const playTargetAudio = useCallback(() => {
    const textToSpeak = useParticle ? `${currentTarget.reading}が` : currentTarget.reading;

    if (!isMuffled) {
      // Reproducción nítida estándar
      audioManager.speak(textToSpeak, { voice: 'ja-JP-NanamiNeural', rate: 0.95 });
      return;
    }

    // Modo Muffle Audio (BiquadFilterNode a 350Hz para aislar F0)
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }

        const ttsUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&voice=ja-JP-NanamiNeural`;
        const audio = new Audio(ttsUrl);
        audio.crossOrigin = 'anonymous';

        const source = audioCtxRef.current.createMediaElementSource(audio);
        const filter = audioCtxRef.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350; // Filtra consonantes y formantes vocálicos dejando la melodía pura F0
        filter.Q.value = 1.0;

        source.connect(filter);
        filter.connect(audioCtxRef.current.destination);

        audio.play().catch(() => {
          // Fallback a audio regular si CORS o autoplay restringe
          audioManager.speak(textToSpeak, { rate: 0.95 });
        });
      } else {
        audioManager.speak(textToSpeak, { rate: 0.95 });
      }
    } catch {
      audioManager.speak(textToSpeak, { rate: 0.95 });
    }
  }, [currentTarget, useParticle, isMuffled]);

  // Reproducir audio al cargar la pregunta
  useEffect(() => {
    const timer = setTimeout(() => {
      playTargetAudio();
    }, 200);
    return () => clearTimeout(timer);
  }, [currentPairIndex, targetOptionIndex, playTargetAudio]);

  // Validación de respuesta
  const handleSelectOption = useCallback((optionIdx) => {
    if (isAnswered) return;
    const isCorrect = optionIdx === targetOptionIndex;
    setSelectedAnswer(optionIdx);
    setIsAnswered(true);
    setScoreStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  }, [isAnswered, targetOptionIndex]);

  // Avanzar a la siguiente pregunta
  const handleNext = useCallback(() => {
    const nextIdx = (currentPairIndex + 1) % TOKYO_MINIMAL_PAIRS.length;
    setCurrentPairIndex(nextIdx);
  }, [currentPairIndex]);

  // Atajos de teclado numéricos (1, 2, 3) y Espacio
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['1', '2', '3'].includes(e.key)) {
        const num = parseInt(e.key, 10) - 1;
        if (!isAnswered && activePair.options[num]) {
          e.preventDefault();
          handleSelectOption(num);
        }
      } else if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (isAnswered) {
          handleNext();
        } else {
          playTargetAudio();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, activePair, handleSelectOption, handleNext, playTargetAudio]);

  return (
    <div style={{
      background: 'var(--bg-main, #ffffff)',
      borderRadius: 16,
      border: '1px solid var(--border)',
      padding: '24px 20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      maxWidth: 680,
      margin: '0 auto 24px auto'
    }}>
      {/* 1. CABECERA & CONTROLES PEDAGÓGICOS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 9999,
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--primary)',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              Entrenador Auditivo OJAD / Kotu.io
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Par {currentPairIndex + 1} de {TOKYO_MINIMAL_PAIRS.length}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
            Discriminación Fonética de Pares Mínimos
          </h3>
        </div>

        {/* Puntuación */}
        <div style={{
          background: 'var(--bg-surface)',
          padding: '4px 10px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          fontSize: '0.78rem',
          fontWeight: 700
        }}>
          Aciertos: <strong style={{ color: 'var(--success)' }}>{scoreStats.correct}</strong> / {scoreStats.total}
        </div>
      </div>

      {/* 2. BARRA DE HERRAMIENTAS PEDAGÓGICAS (MUFFLE, PARTÍCULA Y PERCEPCIÓN PURA) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        background: 'var(--bg-subtle, #f8fafc)',
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        marginBottom: 20
      }}>
        {/* Control 1: Audio Amortiguado (Muffle Audio) */}
        <button
          type="button"
          className={`btn btn-xs ${isMuffled ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setIsMuffled(prev => !prev)}
          style={{ gap: 4, fontWeight: 700, fontSize: '0.74rem' }}
          title="Filtro paso bajo a 350Hz: silencia consonantes para escuchar la melodía pura F0 (Kotu.io)"
        >
          <Headphones size={13} />
          <span>{isMuffled ? '🎛️ Audio Amortiguado: ACTIVADO' : 'Audio Amortiguado (Muffle)'}</span>
        </button>

        {/* Control 2: Trampa en Aislamiento vs Partícula が */}
        <button
          type="button"
          className={`btn btn-xs ${useParticle ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setUseParticle(prev => !prev)}
          style={{ gap: 4, fontWeight: 700, fontSize: '0.74rem' }}
          title="Alterna entre escuchar la palabra aislada vs con partícula が (papel tornasol diferencial)"
        >
          <Zap size={13} />
          <span>{useParticle ? '🔘 Con Partícula (が) [Tornasol]' : 'Palabra Aislada (Trampa)'}</span>
        </button>

        {/* Control 3: Percepción Pura */}
        <button
          type="button"
          className={`btn btn-xs ${purePerceptionMode ? 'btn-outline' : 'btn-ghost'}`}
          onClick={() => setPurePerceptionMode(prev => !prev)}
          style={{ gap: 4, fontSize: '0.74rem' }}
          title="Oculta el significado y kanji antes de responder para evaluar únicamente el oído"
        >
          {purePerceptionMode ? <EyeOff size={13} /> : <Eye size={13} />}
          <span>{purePerceptionMode ? 'Percepción Pura (Sin Kanji)' : 'Mostrar Kanjis'}</span>
        </button>
      </div>

      {/* 3. ZONA DE ESCUCHA Y PRUEBA */}
      <div style={{
        textAlign: 'center',
        padding: '24px 16px',
        background: 'var(--bg-surface, #f1f5f9)',
        borderRadius: 14,
        border: '1.5px dashed var(--border)',
        marginBottom: 20
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
          {useParticle ? 'Escuchas la palabra con la partícula が como revelador tonal:' : 'Escuchas la palabra en aislamiento fonológico:'}
        </div>

        <div className="jp-text" style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: 12 }}>
          {activePair.kana} {useParticle ? '<span style="color: var(--primary); font-size: 1.6rem">が</span>' : ''}
        </div>

        <button
          type="button"
          onClick={playTargetAudio}
          className="btn btn-primary btn-md"
          style={{ gap: 8, borderRadius: 30, padding: '10px 24px', fontWeight: 700, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
        >
          <Volume2 size={20} />
          <span>Repetir Audio [Espacio]</span>
        </button>
      </div>

      {/* 4. OPCIONES DE RESPUESTA (ESQUEMAS TONALES O KANJIS) */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
          ¿Qué contorno tonal acabas de escuchar? (Presiona 1, 2 ó 3):
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activePair.options.length}, 1fr)`, gap: 10 }}>
          {activePair.options.map((opt, idx) => {
            const isTarget = idx === targetOptionIndex;
            const isChosen = selectedAnswer === idx;
            let borderStyle = '1.5px solid var(--border)';
            let bgStyle = 'var(--bg-main)';

            if (isAnswered) {
              if (isTarget) {
                borderStyle = '2px solid #10b981';
                bgStyle = 'rgba(16, 185, 129, 0.08)';
              } else if (isChosen && !isTarget) {
                borderStyle = '2px solid #ef4444';
                bgStyle = 'rgba(239, 68, 68, 0.08)';
              }
            }

            return (
              <div
                key={idx}
                onClick={() => handleSelectOption(idx)}
                style={{
                  border: borderStyle,
                  background: bgStyle,
                  borderRadius: 12,
                  padding: '14px 10px',
                  textAlign: 'center',
                  cursor: isAnswered ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: 8,
                  left: 10,
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: 'var(--text-muted)'
                }}>
                  [{idx + 1}]
                </span>

                {/* Esquema de contorno tonal (SIEMPRE VISIBLE) */}
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  letterSpacing: '0.05em',
                  marginTop: 6,
                  marginBottom: 6
                }}>
                  {useParticle ? opt.contourWithParticle.split(' ')[0] : opt.contourIsolated.split(' ')[0]}
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Patrón [{opt.pattern}] · {opt.type}
                </div>

                {/* Kanji y significado (ocultos en percepción pura antes de responder) */}
                {(!purePerceptionMode || isAnswered) ? (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                      {opt.word}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {opt.meaning}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    🔒 Revelar tras responder
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RETROALIMENTACIÓN PEDAGÓGICA TRAS RESPONDER */}
      {isAnswered && (
        <div style={{
          background: selectedAnswer === targetOptionIndex ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1.5px solid ${selectedAnswer === targetOptionIndex ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {selectedAnswer === targetOptionIndex ? (
              <CheckCircle2 size={18} color="var(--success)" />
            ) : (
              <XCircle size={18} color="#ef4444" />
            )}
            <strong style={{ fontSize: '0.92rem', color: selectedAnswer === targetOptionIndex ? 'var(--success)' : '#ef4444' }}>
              {selectedAnswer === targetOptionIndex ? '¡Excelente oído tonal!' : `Incorrecto. Era ${currentTarget.word} (${currentTarget.meaning}).`}
            </strong>
          </div>

          <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
            {currentTarget.notes}
          </p>

          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleNext}
              style={{ gap: 6, fontWeight: 700 }}
            >
              <span>Siguiente Par Mínimo</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Pie informativo */}
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Tip: En aislamiento, palabras Heiban ⓪ y Odaka ㊵ suelen sonar L·H a oídos occidentales. Activa la <strong>partícula が</strong> para usarla como papel tornasol tonal.
      </div>
    </div>
  );
}
