import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import * as wanakana from 'wanakana';

export default function SpeechPractice({ targetText, targetKana, onMatch }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null); // 'match', 'nomatch', null
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
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
        // Evaluar en el onend
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
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
    // Removes japanese punctuation and whitespace
    return text.replace(/[。、！？\s]/g, '');
  };

  const evaluatePronunciation = (spoken) => {
    if (!spoken) return;
    
    const cleanSpoken = cleanText(spoken);
    const cleanTarget = cleanText(targetText);
    const cleanTargetKana = cleanText(targetKana);

    // Mismo texto exacto
    let isMatch = cleanSpoken === cleanTarget;

    // Si no es el kanji exacto, a veces la API devuelve Kana u homófonos.
    // Convertimos lo hablado a Kana puro asumiendo que wanakana puede fallar si hay Kanjis que no sabe leer,
    // pero si lo que habló es puro Hiragana, podemos compararlo con el targetKana.
    if (!isMatch && cleanTargetKana) {
      if (cleanSpoken === cleanTargetKana) {
        isMatch = true;
      }
    }

    // Match parcial (si es una oración larga y captó el 80% o está incluido)
    if (!isMatch && cleanTarget.length > 3) {
      if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
        isMatch = true;
      }
    }

    if (isMatch) {
      setFeedback('match');
      if (onMatch) onMatch(spoken);
    } else {
      setFeedback('nomatch');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  if (!recognitionRef.current) {
    // Navigate away or show unsupported
    return (
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        🎤 API de voz no soportada en este navegador. Usa Chrome o Edge.
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
