'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Trophy, 
  Layers 
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
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const initGame = useCallback(() => {
    const dataSource = gameMode === 'kana' ? KANA_PAIRS : KANJI_PAIRS;
    const deck = [];

    dataSource.forEach(pair => {
      deck.push({
        pairId: pair.id,
        content: pair.jp1,
        subtitle: pair.type1,
        sound: pair.sound
      });
      deck.push({
        pairId: pair.id,
        content: pair.jp2,
        subtitle: pair.type2,
        sound: pair.sound
      });
    });

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

    if (cards[index].sound) {
      audioManager.speak(cards[index].sound);
    }

    const nextFlipped = [...flippedCards, index];
    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsChecking(true);

      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        setTimeout(() => {
          setMatchedPairs(prev => {
            const nextSet = new Set(prev);
            nextSet.add(firstCard.pairId);

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
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
        }, 850);
      }
    }
  };

  return (
    <div className="bento-card">
      {/* Controles y Modos */}
      <div className="home-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 12, 
              background: 'rgba(99, 102, 241, 0.12)', 
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Layers size={20} />
          </div>
          <div>
            <h3 className="home-section-title" style={{ fontSize: '1.2rem' }}>
              Memory Flash (Parejas)
            </h3>
            <p className="home-section-desc" style={{ fontSize: '0.8rem' }}>
              Conecta caracteres y significados para afianzar retención rápida.
            </p>
          </div>
        </div>

        {/* Selector de modo */}
        <div className="games-tab-pills">
          <button
            type="button"
            onClick={() => setGameMode('kana')}
            className={`game-tab-btn ${gameMode === 'kana' ? 'active' : ''}`}
          >
            Hiragana ↔ Katakana
          </button>
          <button
            type="button"
            onClick={() => setGameMode('kanji')}
            className={`game-tab-btn ${gameMode === 'kanji' ? 'active' : ''}`}
          >
            Kanji N5 ↔ Español
          </button>
        </div>
      </div>

      {/* Marcador de partida */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderRadius: 14,
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'var(--text-main)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span>
            Pares: <strong style={{ color: 'var(--primary)' }}>{matchedPairs.size} / {gameMode === 'kana' ? KANA_PAIRS.length : KANJI_PAIRS.length}</strong>
          </span>
          <span>
            Movimientos: <strong style={{ color: 'var(--text-main)' }}>{moves}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={initGame}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5
          }}
          title="Reiniciar y barajar cartas"
        >
          <RotateCcw size={14} />
          <span>Barajar</span>
        </button>
      </div>

      {/* Pantalla de Victoria */}
      {isCompleted ? (
        <div 
          style={{ 
            padding: '36px 20px', 
            borderRadius: 20, 
            background: 'var(--primary-bg)', 
            border: '1px solid var(--border-focus)',
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
              background: 'var(--success-bg)', 
              color: 'var(--success)',
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
              ¡Excelente trabajo! (よくできました 🌸)
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Completaste todos los pares en {moves} movimientos. ¡Ganaste +25 XP!
            </p>
          </div>
          <button
            type="button"
            onClick={initGame}
            className="home-btn-primary"
            style={{ padding: '10px 20px' }}
          >
            <RotateCcw size={15} />
            <span>Jugar otra ronda</span>
          </button>
        </div>
      ) : (
        /* Cuadrícula de Cartas */
        <div className="memory-grid">
          {cards.map((card, idx) => {
            const isFlipped = flippedCards.includes(idx);
            const isMatched = matchedPairs.has(card.pairId);

            return (
              <div
                key={idx}
                onClick={() => handleCardClick(idx)}
                className={`memory-card-wrap ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(idx); }}
              >
                <div className="memory-card-inner">
                  {isFlipped || isMatched ? (
                    <>
                      <span className="memory-card-char">
                        {card.content}
                      </span>
                      <span className="memory-card-subtitle">
                        {card.subtitle}
                      </span>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-light)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Sparkles size={18} style={{ opacity: 0.6, marginBottom: 2 }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>?</span>
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
