'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle2, RefreshCw } from 'lucide-react';
import * as wanakana from 'wanakana';

// Arabic digit to Kanji digit
export const DIGIT_TO_KANJI = {
  '0': '〇', '1': '一', '2': '二', '3': '三', '4': '四',
  '5': '五', '6': '六', '7': '七', '8': '八', '9': '九'
};

// Kanji digit to Arabic digit
export const KANJI_TO_DIGIT = {
  '〇': '0', '零': '0', '一': '1', '二': '2', '三': '3', '四': '4',
  '五': '5', '六': '6', '七': '7', '八': '8', '九': '9'
};

// Japanese Number Readings (Hiragana / Katakana)
export const NUMBER_READINGS = {
  '0': ['れい', 'ぜろ', 'ゼロ', 'まる'],
  '1': ['いち', 'ひと', 'ひとつ', 'いっ'],
  '2': ['に', 'ふた', 'ふたつ'],
  '3': ['さん', 'み', 'みっつ', 'みつ'],
  '4': ['よん', 'し', 'よ', 'よっつ'],
  '5': ['ご', 'いつ', 'いつつ'],
  '6': ['ろく', 'む', 'むっつ', 'ろっ'],
  '7': ['なな', 'しち', 'ななつ'],
  '8': ['はち', 'や', 'やっつ', 'はっ'],
  '9': ['きゅう', 'く', 'ここの', 'ここのつ'],
  '10': ['じゅう', 'とお', 'じゅっ', 'じっ'],
  '20': ['にじゅう', 'はたち'],
  '100': ['ひゃく'],
  '1000': ['せん'],
  '10000': ['まん', 'いちまん']
};

export const COUNTER_MAP = {
  '1つ': ['一つ', 'ひとつ'], '一つ': ['1つ', 'ひとつ'],
  '2つ': ['二つ', 'ふたつ'], '二つ': ['2つ', 'ふたつ'],
  '3つ': ['三つ', 'みっつ'], '三つ': ['3つ', 'みっつ'],
  '4つ': ['四つ', 'よっつ'], '四つ': ['4つ', 'よっつ'],
  '5つ': ['五つ', 'いつつ'], '五つ': ['5つ', 'いつつ'],
  '6つ': ['六つ', 'むっつ'], '六つ': ['6つ', 'むっつ'],
  '7つ': ['七つ', 'ななつ'], '七つ': ['7つ', 'ななつ'],
  '8つ': ['八つ', 'やっつ'], '八つ': ['8つ', 'やっつ'],
  '9つ': ['九つ', 'ここのつ'], '九つ': ['9つ', 'ここのつ'],
  '10': ['十', 'とお', 'じゅう'], '十': ['10', 'とお', 'じゅう'],
  '1日': ['一日', 'ついたち', 'いちにち'], '一日': ['1日', 'ついたち', 'いちにち'],
  '2日': ['二日', 'ふつか'], '二日': ['2日', 'ふつか'],
  '3日': ['三日', 'みっか'], '三日': ['3日', 'みっか'],
  '4日': ['四日', 'よっか'], '四日': ['4日', 'よっか'],
  '5日': ['五日', 'いつか'], '五日': ['5日', 'いつか'],
  '6日': ['六日', 'むいか'], '六日': ['6日', 'むいか'],
  '7日': ['七日', 'なのか'], '七日': ['7日', 'なのか'],
  '8日': ['八日', 'ようか'], '八日': ['8日', 'ようか'],
  '9日': ['九日', 'ここのか'], '九日': ['9日', 'ここのか'],
  '10日': ['十日', 'とおか'], '十日': ['10日', 'とおか'],
  '14日': ['十四日', 'じゅうよっか'], '十四日': ['14日', 'じゅうよっか'],
  '20日': ['二十日', 'はつか'], '二十日': ['20日', 'はつか'],
  '24日': ['二十四日', 'にじゅうよっか'], '二十四日': ['24日', 'にじゅうよっか'],
  '1人': ['一人', 'ひとり'], '一人': ['1人', 'ひとり'],
  '2人': ['二人', 'ふたり'], '二人': ['2人', 'ふたり'],
  '3人': ['三人', 'さんにん'], '三人': ['3人', 'さんにん'],
  '4人': ['四人', 'よにん'], '四人': ['4人', 'よにん']
};

export function normalizeFullWidthDigits(str) {
  if (!str) return '';
  return String(str).replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
}

export function convertArabicToKanjiNumber(str) {
  if (!str) return '';
  return String(str).replace(/\b\d+\b/g, (match) => {
    const n = parseInt(match, 10);
    if (isNaN(n) || n > 99999) return match;
    if (n === 0) return '〇';
    const kanjiDigits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    if (n < 10) return kanjiDigits[n];
    if (n === 10) return '十';
    if (n < 20) return '十' + kanjiDigits[n % 10];
    if (n < 100) {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      return (tens === 1 ? '十' : kanjiDigits[tens] + '十') + kanjiDigits[ones];
    }
    if (n === 100) return '百';
    if (n === 1000) return '千';
    if (n === 10000) return '一万';
    return match;
  });
}

export function getNumberEquivalents(text) {
  if (!text) return [];
  const s = normalizeFullWidthDigits(text);
  const results = new Set([s]);

  if (COUNTER_MAP[s]) {
    COUNTER_MAP[s].forEach(c => results.add(c));
  }

  if (NUMBER_READINGS[s]) {
    NUMBER_READINGS[s].forEach(r => results.add(r));
    if (s in DIGIT_TO_KANJI) results.add(DIGIT_TO_KANJI[s]);
  }

  if (KANJI_TO_DIGIT[s] && NUMBER_READINGS[KANJI_TO_DIGIT[s]]) {
    const dig = KANJI_TO_DIGIT[s];
    results.add(dig);
    NUMBER_READINGS[dig].forEach(r => results.add(r));
  }

  if (s === '十') { results.add('10'); NUMBER_READINGS['10'].forEach(r => results.add(r)); }
  if (s === '10') { results.add('十'); NUMBER_READINGS['10'].forEach(r => results.add(r)); }
  if (s === '百') { results.add('100'); NUMBER_READINGS['100'].forEach(r => results.add(r)); }
  if (s === '100') { results.add('百'); NUMBER_READINGS['100'].forEach(r => results.add(r)); }
  if (s === '千') { results.add('1000'); NUMBER_READINGS['1000'].forEach(r => results.add(r)); }
  if (s === '1000') { results.add('千'); NUMBER_READINGS['1000'].forEach(r => results.add(r)); }
  if (s === '万') { results.add('10000'); NUMBER_READINGS['10000'].forEach(r => results.add(r)); }
  if (s === '10000') { results.add('万'); NUMBER_READINGS['10000'].forEach(r => results.add(r)); }

  // Compound replacement: digits to kanji
  const toKanji = s.replace(/\d/g, d => DIGIT_TO_KANJI[d] || d);
  results.add(toKanji);
  const toFullKanji = convertArabicToKanjiNumber(s);
  results.add(toFullKanji);

  // Compound replacement: kanji to digits
  const toDigits = s.replace(/[〇零一二三四五六七八九]/g, k => KANJI_TO_DIGIT[k] || k);
  results.add(toDigits);

  return Array.from(results);
}

// Helper to strip punctuation and whitespace for clean audio diff & matching
export function cleanText(text) {
  if (!text) return '';
  const cleaned = String(text).replace(/[。、！？!?,，[\]()（）\s]/g, '');
  return normalizeFullWidthDigits(cleaned);
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
        } catch {
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
        } catch {}

        const equivs = getNumberEquivalents(cleaned);
        for (const eq of equivs) {
          candidates.add(eq);
          try {
            const h = wanakana.toHiragana(eq);
            if (h) candidates.add(h);
          } catch {}
        }
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
    } catch {}

    let best = candidates[0];
    let maxScore = -1;

    for (const cand of candidates) {
      const cleanCand = cleanText(cand);
      let candHira = cleanCand;
      try {
        candHira = wanakana.toHiragana(cleanCand);
      } catch {}

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
    const spokenVariants = new Set([cleanSpoken]);
    const numEquivs = getNumberEquivalents(cleanSpoken);
    numEquivs.forEach(eq => spokenVariants.add(eq));
    try {
      const hira = wanakana.toHiragana(cleanSpoken);
      if (hira) spokenVariants.add(hira);
    } catch {}

    const candidates = getCandidates();

    let isMatch = false;
    for (const sv of spokenVariants) {
      let svHira = sv;
      try {
        svHira = wanakana.toHiragana(sv);
      } catch {}

      for (const cand of candidates) {
        if (!cand) continue;
        const candClean = cleanText(cand);
        let candHira = candClean;
        try {
          candHira = wanakana.toHiragana(candClean);
        } catch {}

        // Match exacto en kanji, dígitos o hiragana
        if (sv === candClean || svHira === candHira) {
          isMatch = true;
          break;
        }

        // Match parcial para oraciones compuestas (> 3 caracteres)
        if (candClean.length > 3) {
          if (
            sv.includes(candClean) || 
            candClean.includes(sv) ||
            svHira.includes(candHira) || 
            candHira.includes(svHira)
          ) {
            isMatch = true;
            break;
          }
        }
      }
      if (isMatch) break;
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
      } catch {
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

  // Align number representations between spoken and bestTarget for diff comparison
  const hasKanjiNum = /[〇零一二三四五六七八九十百千万]/.test(bestTarget);
  const hasArabicDigit = /\d/.test(cleanSpoken);
  const spokenForDiff = (hasKanjiNum && hasArabicDigit) 
    ? cleanSpoken.replace(/\d/g, d => DIGIT_TO_KANJI[d] || d) 
    : cleanSpoken;

  const diffResult = (cleanSpoken && bestTarget) ? diffStrings(spokenForDiff, bestTarget) : { sDiff: [], tDiff: [] };

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
                    {hasArabicDigit && hasKanjiNum && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                        ({cleanSpoken})
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--success, #10b981)', fontWeight: 600, fontSize: '0.72rem' }}>Esperado: </span>
                  <span className="jp-text" style={{ fontSize: '0.88rem' }}>
                    {renderDiff(diffResult.tDiff, 'target')}
                    {hasKanjiNum && KANJI_TO_DIGIT[bestTarget] && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                        ({KANJI_TO_DIGIT[bestTarget]})
                      </span>
                    )}
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
                {hasArabicDigit && hasKanjiNum && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                    ({cleanSpoken})
                  </span>
                )}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--success, #10b981)', fontWeight: 600 }}>Esperado: </span>
              <span className="jp-text" style={{ fontSize: '0.95rem' }}>
                {renderDiff(diffResult.tDiff, 'target')}
                {hasKanjiNum && KANJI_TO_DIGIT[bestTarget] && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                    ({KANJI_TO_DIGIT[bestTarget]})
                  </span>
                )}
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
