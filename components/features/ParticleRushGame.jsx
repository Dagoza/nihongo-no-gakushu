'use client';

import React, { useState } from 'react';
import { 
  Target, 
  RotateCcw, 
  Volume2, 
  Trophy, 
  Flame, 
  ArrowRight,
  Info
} from 'lucide-react';
import audioManager from '../../lib/audioManager';

const PARTICLE_QUESTIONS = [
  {
    id: 1,
    sentenceBefore: '私は 日本',
    sentenceAfter: '行きます。',
    correct: 'に',
    options: ['に', 'で', 'を', 'は'],
    meaning: 'Voy a Japón.',
    explanation: '「に」 indica el punto de destino específico hacia donde se dirige el movimiento (con verbos como 行く, 来る, 帰る).'
  },
  {
    id: 2,
    sentenceBefore: '毎朝 パン',
    sentenceAfter: '食べます。',
    correct: 'を',
    options: ['を', 'に', 'で', 'が'],
    meaning: 'Como pan todas las mañanas.',
    explanation: '「を」 (se pronuncia O) marca el objeto directo que recibe la acción del verbo comer (食べる).'
  },
  {
    id: 3,
    sentenceBefore: '図書館',
    sentenceAfter: '本を 読みます。',
    correct: 'で',
    options: ['で', 'に', 'へ', 'を'],
    meaning: 'Leo libros en la biblioteca.',
    explanation: '「で」 señala el lugar físico donde se desarrolla una acción dinámica (leer libros).'
  },
  {
    id: 4,
    sentenceBefore: '田中さん',
    sentenceAfter: '親切な 人です。',
    correct: 'は',
    options: ['は', 'を', 'で', 'に'],
    meaning: 'Tanaka-san es una persona amable.',
    explanation: '「は」 (se pronuncia WA) establece el tema principal del que se está hablando: "En cuanto a Tanaka-san...".'
  },
  {
    id: 5,
    sentenceBefore: '電車',
    sentenceAfter: '学校へ 行きます。',
    correct: 'で',
    options: ['で', 'に', 'を', 'が'],
    meaning: 'Voy a la escuela en tren.',
    explanation: '「で」 también indica el medio de transporte, método o herramienta con la que se ejecuta una acción.'
  },
  {
    id: 6,
    sentenceBefore: '友達',
    sentenceAfter: '一緒に 話します。',
    correct: 'と',
    options: ['と', 'に', 'で', 'を'],
    meaning: 'Hablo junto con mi amigo.',
    explanation: '「と」 funciona como "con" o "y", indicando la compañía con quien se realiza la acción.'
  },
  {
    id: 7,
    sentenceBefore: '毎晩 十一時',
    sentenceAfter: '寝ます。',
    correct: 'に',
    options: ['に', 'で', 'を', 'へ'],
    meaning: 'Me duermo a las 11:00 cada noche.',
    explanation: '「に」 se utiliza obligatoriamente para marcar horas y puntos temporales numéricos exactos.'
  },
  {
    id: 8,
    sentenceBefore: '水',
    sentenceAfter: '飲みます。',
    correct: 'を',
    options: ['を', 'に', 'で', 'は'],
    meaning: 'Bebo agua.',
    explanation: '「を」 señala el agua (水) como el objeto directo que es bebido.'
  }
];

export default function ParticleRushGame({ onGameWin = null, onAwardXP = null }) {
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);

  const currentQ = PARTICLE_QUESTIONS[currentRound];

  const handleSelectOption = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correct;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      const fullSentence = `${currentQ.sentenceBefore} ${option} ${currentQ.sentenceAfter}`;
      audioManager.speak(fullSentence);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentRound + 1 < PARTICLE_QUESTIONS.length) {
      setCurrentRound(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsGameFinished(true);
      if (score >= PARTICLE_QUESTIONS.length * 0.7) {
        if (onGameWin) onGameWin();
        if (onAwardXP) onAwardXP(30);
      }
    }
  };

  const restartGame = () => {
    setCurrentRound(0);
    setSelectedOption(null);
    setScore(0);
    setStreak(0);
    setIsAnswered(false);
    setIsGameFinished(false);
  };

  const playFullSentence = () => {
    if (!currentQ) return;
    const particle = selectedOption || currentQ.correct;
    const fullSentence = `${currentQ.sentenceBefore} ${particle} ${currentQ.sentenceAfter}`;
    audioManager.speak(fullSentence);
  };

  return (
    <div className="bento-card">
      {/* Cabecera del Juego */}
      <div className="home-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 12, 
              background: 'rgba(16, 185, 129, 0.12)', 
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Target size={20} />
          </div>
          <div>
            <h3 className="home-section-title" style={{ fontSize: '1.2rem' }}>
              Desafío de Partículas (Speed Rush)
            </h3>
            <p className="home-section-desc" style={{ fontSize: '0.8rem' }}>
              Elige la partícula correcta y afianza tu intuición gramatical con explicaciones instantáneas.
            </p>
          </div>
        </div>

        {/* Marcador de Racha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 4, 
              padding: '6px 12px', 
              borderRadius: 12, 
              background: 'rgba(245, 158, 11, 0.15)', 
              color: 'var(--warning)',
              fontSize: '0.8rem',
              fontWeight: 800
            }}
          >
            <Flame size={15} />
            <span>Racha: {streak}</span>
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>
            {currentRound + 1} / {PARTICLE_QUESTIONS.length}
          </span>
        </div>
      </div>

      {isGameFinished ? (
        /* Pantalla de Fin de Juego */
        <div 
          style={{ 
            padding: '36px 20px', 
            borderRadius: 20, 
            background: 'var(--success-bg)', 
            border: '1px solid var(--success)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14
          }}
        >
          <div 
            style={{ 
              width: 56, 
              height: 56, 
              borderRadius: '50%', 
              background: 'var(--success)', 
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <Trophy size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>
              ¡Misión Cumplida! (ミッション完了 ✨)
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Obtuviste {score} de {PARTICLE_QUESTIONS.length} aciertos. {score >= 6 ? '¡Ganaste +30 XP!' : '¡Sigue practicando para dominar las partículas!'}
            </p>
          </div>
          <button
            type="button"
            onClick={restartGame}
            className="home-btn-primary"
            style={{ padding: '10px 20px', backgroundColor: 'var(--success)' }}
          >
            <RotateCcw size={15} />
            <span>Reintentar desafío</span>
          </button>
        </div>
      ) : (
        /* Área de Pregunta */
        <div style={{ display: 'flex', flexDirecti: 'column', gap: 16 }}>
          {/* Tarjeta de la Oración */}
          <div className="particle-rush-sentence-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div className="particle-rush-sentence">
                <span>{currentQ.sentenceBefore}</span>
                <span 
                  className={`particle-rush-blank ${
                    isAnswered 
                      ? selectedOption === currentQ.correct ? 'correct' : 'wrong'
                      : ''
                  }`}
                >
                  {selectedOption || '___'}
                </span>
                <span>{currentQ.sentenceAfter}</span>
              </div>

              <button
                type="button"
                onClick={playFullSentence}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 8,
                  cursor: 'pointer',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Escuchar oración completa con audio neuronal"
              >
                <Volume2 size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
              Traducción: {currentQ.meaning}
            </p>
          </div>

          {/* Opciones de Partículas */}
          <div className="particle-options-grid">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentQ.correct;

              let customClass = '';
              if (isAnswered) {
                if (isCorrectOpt) customClass = 'selected-correct';
                else if (isSelected && !isCorrectOpt) customClass = 'selected-wrong';
                else customClass = 'faded';
              }

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`particle-choice-btn ${customClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Feedback Didáctico Inmediato */}
          {isAnswered && (
            <div 
              style={{
                padding: '16px 20px',
                borderRadius: 16,
                background: 'var(--primary-bg)',
                border: '1px solid var(--border-focus)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 240 }}>
                <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>
                    {selectedOption === currentQ.correct ? '¡Correcto! 🌸' : `Respuesta correcta: ${currentQ.correct}`}
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.4 }}>
                    {currentQ.explanation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="home-btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                <span>Siguiente</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
