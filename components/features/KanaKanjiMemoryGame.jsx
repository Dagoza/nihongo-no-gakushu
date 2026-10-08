'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Trophy, 
  Award, 
  Volume2, 
  Layers, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import audioManager from '../../lib/audioManager';

const KANA_PAIRS = [
  { id: 'a', jp1: 'あ', type1: 'Hiragana', jp2: 'ア', type2: 'Katakana', reading: 'a', sound: 'あ' },
  { id: 'ka', jp1: 'か', type1: 'Hiragana', jp2: 'カ', type2: 'Katakana', reading: 'ka', sound: 'か' },
  { id: 'sa', jp1: 'さ', type1: 'Hiragana', jp2: 'サ', type2: 'Katakana', reading: 'sa', sound: 'さ' },
  { id: 'ta', jp1: 'た', type1: 'Hiragana', jp2: 'タ', type2: 'Katakana', reading: 'ta', sound: 'た' },
  { id: 'na', jp1: 'な', type1: 'Hiragana', jp2: 'ナ', type2: 'Katakana', reading: 'na', sound: 'な' },
  { id: 'ha', jp1: 'は', type1: 'Hiragana', jp2: 'ハ', type2: 'Katakana', reading: 'ha', sound: 'は' },
];

const KANJI_PAIRS = [
  { id: 'sun', jp1: '日', type1: 'Kanji', jp2: 'Sol / Día', type2: 'Significado', reading: 'hi / nichi', sound: 'ひ' },
  { id: 'moon', jp1: '月', type1: 'Kanji', jp2: 'Luna / Mes', type2: 'Significado', reading: 'tsuki / getsu', sound: 'つき' },
  { id: 'fire', jp1: '火', type1: 'Kanji', jp2: 'Fuego', type2: 'Significado', reading: 'hi / ka', sound: 'ひ' },
  { id: 'water', jp1: '水', type1: 'Kanji', jp2: 'Agua', type2: 'Significado', reading: 'mizu / sui', sound: 'みず' },
  { id: 'tree', jp1: '木', type1: 'Kanji', jp2: 'Árbol', type2: 'Significado', reading: 'ki / moku', sound: 'き' },
  { id: 'mountain', jp1: '山', type1: 'Kanji', jp2: 'Montaña', type2: 'Significado', reading: 'yama / san', sound: 'やま' },
];

export default function KanaKanjiMemoryGame({ onGameWin = null, onAwardXP = null }) {
  const [gameMode, setGameMode] = useState('kana'); // 'kana' | 'kanji'
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]); // Array de índices de tarjetas volteadas (máx 2)
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Inicializar o reiniciar la partida con cartas barajadas
  const initGame = useCallback(() => {
    const dataSource = gameMode === 'kana' ? KANA_PAIRS : KANJI_PAIRS;
    const deck = [];

    dataSource.forEach(pair => {
      // Tarjeta 1
      deck.push({
        pairId: pair.id,
        content: pair.jp1,
        subtitle: pair.type1,
        reading: pair.reading,
        sound: pair.sound
      });
      // Tarjeta 2
      deck.push({
        pairId: pair.id,
        content: pair.jp2,
        subtitle: pair.type2,
        reading: pair.reading,
        sound: pair.sound
      });
    });

    // Barajado Fisher-Yates aleatorio
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedCards([]);
    setMatchedPairs(new Set());
    setMoves(0);
    setIsCompleted(false);
    setIsChecking(false);
  }, [gameMode]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (index) => {
    if (isChecking) return;
    if (flippedCards.includes(index)) return;
    if (matchedPairs.has(cards[index].pairId)) return;
    if (flippedCards.length >= 2) return;

    // Reproducir audio al voltear si tiene sonido asignado
    if (cards[index].sound) {
      audioManager.speak(cards[index].sound);
    }

    const nextFlipped = [...flippedCards, index];
    setFlippedCards(nextFlipped);

    // Cuando se voltean 2 cartas, verificar coincidencia
    if (nextFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsChecking(true);

      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Coincidencia correcta
        setTimeout(() => {
          setMatchedPairs(prev => {
            const nextSet = new Set(prev);
            nextSet.add(firstCard.pairId);

            // Verificar si se completaron todos los pares
            const totalPairs = gameMode === 'kana' ? KANA_PAIRS.length : KANJI_PAIRS.length;
            if (nextSet.size === totalPairs) {
              setIsCompleted(true);
              if (onGameWin) onGameWin();
              if (onAwardXP) onAwardXP(25);
            }
            return nextSet;
          });
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        // No coinciden, voltear de regreso
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
        }, 900);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Barra de Controles y Modos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Memory Flash (Parejas)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conecta caracteres y significados para afianzar retención rápida.
            </p>
          </div>
        </div>

        {/* Selector de modo Kana / Kanji */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => { setGameMode('kana'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'kana' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Hiragana ↔ Katakana
          </button>
          <button
            onClick={() => { setGameMode('kanji'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'kanji' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Kanji N5 ↔ Español
          </button>
        </div>
      </div>

      {/* Métricas de partida */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-4">
          <span>
            Pares: <strong className="text-indigo-600 dark:text-indigo-400">{matchedPairs.size} / {gameMode === 'kana' ? KANA_PAIRS.length : KANJI_PAIRS.length}</strong>
          </span>
          <span>
            Movimientos: <strong className="text-slate-800 dark:text-slate-200">{moves}</strong>
          </span>
        </div>

        <button
          onClick={initGame}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
          title="Reiniciar y barajar cartas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Barajar
        </button>
      </div>

      {/* Pantalla de Victoria */}
      {isCompleted ? (
        <div className="p-8 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-center space-y-4 animate-scaleUp">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              ¡Excelente trabajo! (よくできました 🌸)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Completaste todos los pares en {moves} movimientos. Ganaste +25 XP.
            </p>
          </div>
          <button
            onClick={initGame}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Jugar otra ronda
          </button>
        </div>
      ) : (
        /* Tablero de Cartas (Grid 3x4 o 4x3) */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
          {cards.map((card, idx) => {
            const isFlipped = flippedCards.includes(idx);
            const isMatched = matchedPairs.has(card.pairId);

            return (
              <div
                key={idx}
                onClick={() => handleCardClick(idx)}
                className={`relative h-24 sm:h-28 rounded-2xl cursor-pointer select-none transition-all duration-300 transform perspective-500 ${
                  isMatched 
                    ? 'opacity-80 scale-95 pointer-events-none' 
                    : 'hover:scale-[1.03] active:scale-95'
                }`}
              >
                <div 
                  className={`w-full h-full rounded-2xl border flex flex-col items-center justify-center p-2 text-center transition-all duration-300 ${
                    isFlipped || isMatched
                      ? isMatched 
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-sm'
                        : 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 shadow-sm'
                  }`}
                >
                  {isFlipped || isMatched ? (
                    <>
                      <span className="text-xl sm:text-2xl font-black jp-text text-slate-900 dark:text-white leading-tight">
                        {card.content}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 mt-1 uppercase tracking-tight">
                        {card.subtitle}
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                      <Sparkles className="w-5 h-5 opacity-40 mb-1" />
                      <span className="text-[10px] font-bold font-mono">?</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
