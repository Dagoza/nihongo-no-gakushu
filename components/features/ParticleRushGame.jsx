'use client';

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  XCircle,
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
      // Reproducir oración completa
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Cabecera del Juego */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Desafío de Partículas (Speed Rush)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Elige la partícula correcta y refuerza la gramática con explicaciones instantáneas.
            </p>
          </div>
        </div>

        {/* Marcador de Racha */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            Racha: {streak}
          </div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-400">
            {currentRound + 1} / {PARTICLE_QUESTIONS.length}
          </span>
        </div>
      </div>

      {isGameFinished ? (
        /* Pantalla de Fin de Juego */
        <div className="p-8 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-4 animate-scaleUp">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shadow-md">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              ¡Misión Cumplida! (ミッション完了 ✨)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Obtuviste {score} de {PARTICLE_QUESTIONS.length} aciertos. {score >= 6 ? '¡Ganaste +30 XP!' : '¡Sigue practicando para dominar las partículas!'}
            </p>
          </div>
          <button
            onClick={restartGame}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar desafío
          </button>
        </div>
      ) : (
        /* Área de Pregunta */
        <div className="space-y-4">
          {/* Tarjeta de la Oración en Japonés */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="jp-text text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5 flex-wrap">
                <span>{currentQ.sentenceBefore}</span>
                <span className={`inline-flex items-center justify-center min-w-12 h-9 px-2 rounded-xl font-bold border-2 transition-all ${
                  !isAnswered 
                    ? 'border-dashed border-indigo-400 bg-white dark:bg-slate-900 text-indigo-500' 
                    : selectedOption === currentQ.correct
                      ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'border-rose-500 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                }`}>
                  {selectedOption || '___'}
                </span>
                <span>{currentQ.sentenceAfter}</span>
              </div>

              <button
                onClick={playFullSentence}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition-colors ml-1"
                title="Escuchar oración completa"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Traducción: {currentQ.meaning}
            </p>
          </div>

          {/* Opciones de Partículas en Botones Táctiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentQ.correct;

              let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-slate-700';

              if (isAnswered) {
                if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-600 border-emerald-600 text-white ring-2 ring-emerald-500/20';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = 'bg-rose-600 border-rose-600 text-white';
                } else {
                  btnStyle = 'opacity-40 bg-slate-100 dark:bg-slate-800 border-transparent';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`py-3.5 px-4 rounded-2xl border text-lg font-black jp-text transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Feedback Didáctico Inmediato */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {selectedOption === currentQ.correct ? '¡Correcto! 🌸' : `Respuesta correcta: ${currentQ.correct}`}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
