'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle2, RefreshCw } from 'lucide-react';

import * as wanakana from 'wanakana';

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

  const cleanText = (text) => {
    if (!text) return '';
    return String(text).replace(/[。、！？!?,，[\]()（）\s]/g, '');
  };

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

  if (!mounted) {
    return null;
  }

  // COMPACT MODE (for lists, cards, tables)
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

        {/* Small floating pill if feedback or transcript */}
        {feedback && (
          <span 
            style={{ 
              position: 'absolute', 
              top: '100%', 
              right: 0, 
              marginTop: 4, 
              fontSize: '0.72rem', 
              whiteSpace: 'nowrap',
              padding: '2px 6px',
              borderRadius: 4,
              zIndex: 10,
              background: feedback === 'match' ? 'var(--success)' : 'var(--danger)',
              color: '#fff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            {feedback === 'match' ? '¡Excelente!' : transcript ? `Diste: "${transcript}"` : 'Intenta de nuevo'}
          </span>
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
      padding: '8px 12px', 
      borderRadius: 'var(--radius-full)',
      border: `1px solid ${feedback === 'match' ? 'var(--success)' : feedback === 'nomatch' ? 'var(--danger)' : 'var(--border)'}`
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
          transition: 'all 0.2s'
        }}
        title="Practicar pronunciación"
      >
        {isListening ? <Mic size={18} /> : <MicOff size={18} />}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
        {transcript ? (
          <span className="jp-text" style={{ 
            fontSize: '1rem', 
            color: feedback === 'match' ? 'var(--success)' : feedback === 'nomatch' ? 'var(--danger)' : 'var(--text-main)',
            fontWeight: 500
          }}>
            {transcript}
          </span>
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isListening ? 'Escuchando...' : 'Presiona para hablar'}
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
