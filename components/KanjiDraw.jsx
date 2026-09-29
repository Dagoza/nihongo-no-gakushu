import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { Play, RotateCcw, Target } from 'lucide-react';

export default function KanjiDraw({ character, size = 250, onQuizComplete }) {
  const containerRef = useRef(null);
  const writerRef = useRef(null);
  const [isQuizMode, setIsQuizMode] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !character) return;

    // Reset states when character changes
    setErrorCount(0);
    setSuccess(false);
    setLoadingError(false);

    // Initialize HanziWriter
    writerRef.current = HanziWriter.create(containerRef.current, character, {
      width: size,
      height: size,
      padding: 10,
      showOutline: true,
      strokeAnimationSpeed: 1.5,
      delayBetweenStrokes: 150,
      strokeColor: '#3b82f6', // primary color
      radicalColor: '#10b981', // accent for radical
      outlineColor: '#e2e8f0', // faint outline
      drawingColor: '#334155', // color while drawing
      drawingWidth: 15,
      showCharacter: false,
      // Usamos el dataset de Kanji japonés basado en KanjiVG
      charDataLoader: (char, onLoad, onError) => {
        fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data-jp@1/${char}.json`)
          .then(res => {
            if (!res.ok) throw new Error(`Kanji data not found for ${char}`);
            return res.json();
          })
          .then(onLoad)
          .catch(err => {
            console.error('Error loading kanji data:', err);
            setLoadingError(true);
            onError(err);
          });
      }
    });

    startQuiz();

    return () => {
      // Cleanup
      if (writerRef.current) {
        writerRef.current.cancelQuiz();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [character, size]);

  const startQuiz = () => {
    if (!writerRef.current) return;
    setErrorCount(0);
    setSuccess(false);
    setIsQuizMode(true);
    writerRef.current.quiz({
      onMistake: (strokeData) => {
        setErrorCount(prev => prev + 1);
      },
      onComplete: (summaryData) => {
        setSuccess(true);
        if (onQuizComplete) onQuizComplete(summaryData);
      }
    });
  };

  const animateKanji = () => {
    if (!writerRef.current) return;
    setIsQuizMode(false);
    writerRef.current.cancelQuiz();
    writerRef.current.animateCharacter({
      onComplete: () => {
        // Optional: return to quiz mode automatically after animation
        // setTimeout(startQuiz, 1000);
      }
    });
  };

  if (loadingError) {
    return (
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--danger)' }}>
        <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center', padding: 10 }}>
          No hay datos de trazos disponibles para este Kanji.
        </p>
      </div>
    );
  }

  return (
    <div className="kanji-draw-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Container for HanziWriter canvas */}
      <div 
        ref={containerRef} 
        style={{ 
          background: '#ffffff', // Always white to see outline clearly
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: success ? '3px solid var(--success)' : '1px solid var(--border)',
          transition: 'border-color 0.3s'
        }}
      />
      
      <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'center' }}>
        <button 
          className={`btn btn-sm ${isQuizMode ? 'btn-primary' : 'btn-outline'}`}
          onClick={startQuiz}
          title="Dibujar Kanji interactivo"
        >
          <Target size={14} /> Practicar
        </button>
        <button 
          className="btn btn-outline btn-sm"
          onClick={animateKanji}
          title="Ver animación de trazos"
        >
          <Play size={14} /> Animar
        </button>
        <button 
          className="btn btn-outline btn-sm"
          onClick={() => {
            if (writerRef.current) {
              writerRef.current.hideCharacter();
              startQuiz();
            }
          }}
          title="Borrar lienzo"
        >
          <RotateCcw size={14} /> Borrar
        </button>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {success ? (
          <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>¡Trazo completado perfectamente! 🎉</span>
        ) : (
          <span>Errores: <strong style={{ color: errorCount > 0 ? 'var(--danger)' : 'inherit' }}>{errorCount}</strong></span>
        )}
      </div>
    </div>
  );
}
