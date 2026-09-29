'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle2, RefreshCw } from 'lucide-react';
import * as wanakana from 'wanakana';

// Helper to strip punctuation and whitespace for clean audio diff & matching
export function cleanText(text) {
  if (!text) return '';
  return String(text).replace(/[。、！？!?,，[\]()（）\s]/g, '');
}

// Compute Longest Common Subsequence length
export function getLcsLength(s1, s2) {
  const a = Array.from(s1 || '');
  const b = Array.from(s2 || '');
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = (a[i - 1] === b[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// Character-by-character diff algorithm based on LCS
export function diffStrings(spoken, target) {
  const sChars = Array.from(spoken || '');
  const tChars = Array.from(target || '');
  const m = sChars.length;
  const n = tChars.length;

  if (m === 0 && n === 0) return { sDiff: [], tDiff: [] };

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (sChars[i - 1] === tChars[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const sDiff = [];
  const tDiff = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && sChars[i - 1] === tChars[j - 1]) {
      sDiff.unshift({ char: sChars[i - 1], type: 'match' });
      tDiff.unshift({ char: tChars[j - 1], type: 'match' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tDiff.unshift({ char: tChars[j - 1], type: 'diff' });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      sDiff.unshift({ char: sChars[i - 1], type: 'diff' });
      i--;
    }
  }

  return { sDiff, tDiff };
}

export default function SpeechPractice({ targetText, targetKana, acceptableReadings, onMatch, compact = false }) {
  const [mounted, setMounted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null); // 'match', 'nomatch', null
  const recognitionRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ja-JP';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('');
          setFeedback(null);
        };

        recognition.onresult = (event) => {
          const currentTranscript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join('');
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Failed to init SpeechRecognition', err);
        setIsSupported(false);
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Evaluate when listening stops and we have transcript
  useEffect(() => {
    if (!isListening && transcript) {
      evaluatePronunciation(transcript);
    }
  }, [isListening, transcript]);

  // Auto dismiss feedback banner after a reasonable delay
  useEffect(() => {
    if (feedback === 'match') {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
    if (feedback === 'nomatch') {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const getCandidates = () => {
    const candidates = new Set();

    const addClean = (raw) => {
      if (!raw) return;
      const cleaned = cleanText(raw);
      if (cleaned) {
        candidates.add(cleaned);
        try {
          const hira = wanakana.toHiragana(cleaned);
          if (hira) candidates.add(hira);
        } catch (e) {}
      }
    };

    const parseStr = (val) => {
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach(parseStr);
        return;
      }
      const str = String(val);
      // Remove bracket wrappers like [いち, いつ]
      const insideBrackets = str.match(/\[(.*?)\]/);
      const textToSplit = insideBrackets ? `${str} ${insideBrackets[1]}` : str;
      const parts = textToSplit.split(/[,、/・;\s]+/);
      for (const p of parts) {
        if (!p) continue;
        addClean(p);
        // If parentheses like ひと(つ) -> add 'ひと' and 'ひとつ'
        if (p.includes('(') || p.includes('（')) {
          const withoutParen = p.replace(/[()（）]/g, '');
          const baseOnly = p.replace(/[(（].*?[)）]/g, '');
          addClean(withoutParen);
          addClean(baseOnly);
        }
      }
    };

    if (targetText) addClean(targetText);
    if (targetKana) parseStr(targetKana);
    if (acceptableReadings) parseStr(acceptableReadings);

    return Array.from(candidates);
  };

  // Find candidate with closest match to spoken text
  const getBestCandidate = (spoken) => {
    const candidates = getCandidates();
    if (!candidates || candidates.length === 0) {
      return cleanText(targetText) || targetText || '';
    }
    const cleanSpoken = cleanText(spoken);
    let spokenHiragana = cleanSpoken;
    try {
      spokenHiragana = wanakana.toHiragana(cleanSpoken);
    } catch (e) {}

    let best = candidates[0];
    let maxScore = -1;

    for (const cand of candidates) {
      const cleanCand = cleanText(cand);
      let candHira = cleanCand;
      try {
        candHira = wanakana.toHiragana(cleanCand);
      } catch (e) {}

      const lcsDirect = getLcsLength(cleanSpoken, cleanCand);
      const lcsHira = getLcsLength(spokenHiragana, candHira);
      const score = Math.max(lcsDirect, lcsHira);

      if (score > maxScore) {
        maxScore = score;
        best = cleanCand;
      }
    }
    return best;
  };

  const evaluatePronunciation = (spoken) => {
    if (!spoken) return;
    
    const cleanSpoken = cleanText(spoken);
    let spokenHiragana = cleanSpoken;
    try {
      spokenHiragana = wanakana.toHiragana(cleanSpoken);
    } catch (e) {}

    const candidates = getCandidates();

    let isMatch = false;
    for (const cand of candidates) {
      if (!cand) continue;
      const candClean = cleanText(cand);
      let candHira = candClean;
      try {
        candHira = wanakana.toHiragana(candClean);
      } catch (e) {}

      // Match exacto en kanji o en hiragana
      if (cleanSpoken === candClean || spokenHiragana === candHira) {
        isMatch = true;
        break;
      }

      // Match parcial para oraciones compuestas (> 3 caracteres)
      if (candClean.length > 3) {
        if (
          cleanSpoken.includes(candClean) || 
          candClean.includes(cleanSpoken) ||
          spokenHiragana.includes(candHira) || 
          candHira.includes(spokenHiragana)
        ) {
          isMatch = true;
          break;
        }
      }
    }

    if (isMatch) {
      setFeedback('match');
      if (onMatch) onMatch(spoken);
    } else {
      setFeedback('nomatch');
    }
  };

  const toggleListening = (e) => {
    if (e) e.stopPropagation();
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        setIsListening(false);
      }
    } else {
      try {
        setTranscript('');
        setFeedback(null);
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition', err);
        setIsListening(false);
      }
    }
  };

  // Render character diff with high contrast styling
  const renderDiff = (diffArray, mode = 'spoken') => {
    if (!diffArray || diffArray.length === 0) return null;
    const isSpoken = mode === 'spoken';
    return (
      <span>
        {diffArray.map((item, idx) => {
          if (item.type === 'match') {
            return (
              <span key={idx} style={{ opacity: 0.95 }}>
                {item.char}
              </span>
            );
          }
          return (
            <mark
              key={idx}
              style={{
                display: 'inline-block',
                color: isSpoken ? '#ef4444' : '#10b981',
                backgroundColor: isSpoken ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                borderBottom: isSpoken ? '2px solid #ef4444' : '2px solid #10b981',
                borderRadius: 3,
                padding: '0 2px',
                margin: '0 1px',
                fontWeight: 700,
                textDecoration: isSpoken ? 'line-through' : 'none',
                verticalAlign: 'baseline'
              }}
              title={isSpoken ? `Carácter no coincidente: ${item.char}` : `Carácter esperado: ${item.char}`}
            >
              {item.char}
            </mark>
          );
        })}
      </span>
    );
  };

  if (!mounted) {
    return null;
  }

  const cleanSpoken = cleanText(transcript);
  const bestTarget = cleanSpoken ? getBestCandidate(transcript) : (cleanText(targetText) || targetText || '');
  const diffResult = (cleanSpoken && bestTarget) ? diffStrings(cleanSpoken, bestTarget) : { sDiff: [], tDiff: [] };

  // COMPACT MODE (for lists, cards, tables, dialogues)
  if (compact) {
    if (!isSupported) {
      return (
        <button 
          type="button"
          className="audio-btn" 
          disabled
          style={{ width: 28, height: 28, opacity: 0.35, cursor: 'not-allowed', flexShrink: 0 }}
          title="Reconocimiento de voz no soportado en este navegador (usa Chrome o Edge)"
        >
          <MicOff size={14} />
        </button>
      );
    }

    return (
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
        <button 
          type="button"
          onClick={toggleListening}
          className={`audio-btn ${isListening ? 'listening' : ''}`}
          style={{
            width: 28,
            height: 28,
            flexShrink: 0,
            background: isListening 
              ? 'var(--danger)' 
              : feedback === 'match' 
                ? 'var(--success)' 
                : feedback === 'nomatch' 
                  ? 'var(--danger-bg)' 
                  : undefined,
            color: isListening || feedback === 'match' ? '#fff' : undefined,
            borderColor: feedback === 'match' 
              ? 'var(--success)' 
              : feedback === 'nomatch' 
                ? 'var(--danger)' 
                : undefined,
            transition: 'all 0.2s ease'
          }}
          title={isListening ? "Escuchando... Habla ahora" : feedback === 'match' ? "¡Pronunciación correcta! Clic para repetir" : "Practicar pronunciación"}
        >
          {isListening ? (
            <Mic size={14} style={{ animation: 'pulse 1s infinite' }} />
          ) : feedback === 'match' ? (
            <CheckCircle2 size={14} />
          ) : (
            <Mic size={14} />
          )}
        </button>

        {/* Small floating badge if match */}
        {feedback === 'match' && (
          <span 
            style={{ 
              position: 'absolute', 
              top: 'calc(100% + 4px)', 
              right: 0, 
              fontSize: '0.72rem', 
              fontWeight: 600,
              whiteSpace: 'nowrap',
              padding: '3px 8px',
              borderRadius: 6,
              zIndex: 50,
              background: 'var(--success, #10b981)',
              color: '#fff',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <CheckCircle2 size={12} /> ¡Excelente!
          </span>
        )}

        {/* Floating diff popover if nomatch */}
        {feedback === 'nomatch' && (
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              position: 'absolute', 
              top: 'calc(100% + 6px)', 
              right: 0, 
              minWidth: 200,
              maxWidth: 300,
              fontSize: '0.75rem', 
              padding: '8px 10px', 
              borderRadius: 8, 
              zIndex: 60, 
              background: 'var(--bg-card, #1e293b)', 
              border: '1px solid var(--danger, #ef4444)', 
              boxShadow: '0 8px 20px rgba(0,0,0,0.35)', 
              color: 'var(--text-main, #f8fafc)',
              lineHeight: 1.4
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
              <span style={{ fontWeight: 700, color: 'var(--danger, #ef4444)', fontSize: '0.72rem' }}>
                Intenta de nuevo
              </span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setFeedback(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer', padding: '0 2px', fontSize: '0.8rem', lineHeight: 1 }}
                title="Cerrar"
              >
                ✕
              </button>
            </div>
            {cleanSpoken ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>
                  <span style={{ color: 'var(--danger, #ef4444)', fontWeight: 600, fontSize: '0.72rem' }}>Dijiste: </span>
                  <span className="jp-text" style={{ fontSize: '0.88rem' }}>
                    {renderDiff(diffResult.sDiff, 'spoken')}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--success, #10b981)', fontWeight: 600, fontSize: '0.72rem' }}>Esperado: </span>
                  <span className="jp-text" style={{ fontSize: '0.88rem' }}>
                    {renderDiff(diffResult.tDiff, 'target')}
                  </span>
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>
                No se detectó audio.
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // STANDARD EXPANDED MODE
  if (!isSupported) {
    return (
      <div style={{ 
        fontSize: '0.8rem', 
        color: 'var(--text-muted)', 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 6,
        padding: '6px 12px',
        background: 'var(--bg-main)',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border)'
      }}>
        <MicOff size={14} />
        <span>Voz no soportada (usa Chrome/Edge)</span>
      </div>
    );
  }

  return (
    <div className="speech-practice-container" style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: 12, 
      background: 'var(--bg-main)', 
      padding: '8px 14px', 
      borderRadius: 'var(--radius-lg, 12px)',
      border: `1px solid ${feedback === 'match' ? 'var(--success)' : feedback === 'nomatch' ? 'var(--danger)' : 'var(--border)'}`,
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
    }}>
      <button 
        type="button"
        onClick={toggleListening}
        className={`speech-btn ${isListening ? 'listening' : ''}`}
        style={{
          background: isListening ? 'var(--danger)' : 'var(--bg-surface)',
          color: isListening ? '#fff' : 'var(--text-main)',
          border: 'none',
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isListening ? '0 0 0 4px rgba(239,68,68,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
          transition: 'all 0.2s',
          flexShrink: 0
        }}
        title="Practicar pronunciación"
      >
        {isListening ? <Mic size={18} /> : <MicOff size={18} />}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 140, gap: 3 }}>
        {feedback === 'nomatch' && cleanSpoken ? (
          <>
            <div style={{ fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--danger, #ef4444)', fontWeight: 600 }}>Dijiste: </span>
              <span className="jp-text" style={{ fontSize: '0.95rem' }}>
                {renderDiff(diffResult.sDiff, 'spoken')}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--success, #10b981)', fontWeight: 600 }}>Esperado: </span>
              <span className="jp-text" style={{ fontSize: '0.95rem' }}>
                {renderDiff(diffResult.tDiff, 'target')}
              </span>
            </div>
          </>
        ) : transcript ? (
          <span className="jp-text" style={{ 
            fontSize: '1rem', 
            color: feedback === 'match' ? 'var(--success)' : 'var(--text-main)',
            fontWeight: 500
          }}>
            {feedback === 'match' ? `¡Excelente! "${transcript}"` : transcript}
          </span>
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isListening ? 'Escuchando...' : feedback === 'nomatch' ? 'No se detectó audio' : 'Presiona para hablar'}
          </span>
        )}
      </div>

      {feedback === 'match' && <CheckCircle2 size={18} color="var(--success)" />}
      {feedback === 'nomatch' && (
        <button 
          type="button"
          onClick={toggleListening} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
          title="Intentar de nuevo"
        >
          <RefreshCw size={16} />
        </button>
      )}
    </div>
  );
}
