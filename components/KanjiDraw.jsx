import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { Play, RotateCcw, Target, Loader2 } from 'lucide-react';

export default function KanjiDraw({ character, size = 250, onQuizComplete }) {
  const containerRef = useRef(null);
  const writerRef = useRef(null);
  const [isQuizMode, setIsQuizMode] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const startQuiz = React.useCallback(() => {
    if (!writerRef.current) return;
    setErrorCount(0);
    setSuccess(false);
    setIsQuizMode(true);
    try {
      writerRef.current.quiz({
        onMistake: () => {
          setErrorCount(prev => prev + 1);
        },
        onComplete: (summaryData) => {
          setSuccess(true);
          if (onQuizComplete) onQuizComplete(summaryData);
        }
      });
    } catch (e) {
      console.error('Quiz start error:', e);
    }
  }, [onQuizComplete]);

  const animateKanji = React.useCallback(() => {
    if (!writerRef.current) return;
    setIsQuizMode(false);
    try {
      writerRef.current.cancelQuiz();
      writerRef.current.animateCharacter();
    } catch (e) {
      console.error('Animate error:', e);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !character) return;

    // Reset states when character changes
    setErrorCount(0);
    setSuccess(false);
    setIsLoading(true);
    setLoadingError(false);

    let isMounted = true;

    // Initialize HanziWriter
    try {
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
        // Carga de datos de trazos con fallback multi-CDN
        charDataLoader: (char, onLoad, onError) => {
          const encoded = encodeURIComponent(char);
          const urls = [
            `https://cdn.jsdelivr.net/npm/hanzi-writer-data-jp@0/${encoded}.json`,
            `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encoded}.json`,
            `https://unpkg.com/hanzi-writer-data-jp@0/${encoded}.json`,
            `https://unpkg.com/hanzi-writer-data@2.0/${encoded}.json`
          ];

          let index = 0;
          const tryNext = () => {
            if (!isMounted) return;
            if (index >= urls.length) {
              console.error(`Stroke data not available for ${char} across all sources.`);
              setIsLoading(false);
              setLoadingError(true);
              onError(new Error(`Kanji stroke data not found for ${char}`));
              return;
            }

            const currentUrl = urls[index++];
            fetch(currentUrl)
              .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
              })
              .then(data => {
                if (!isMounted) return;
                setIsLoading(false);
                setLoadingError(false);
                onLoad(data);
              })
              .catch(() => {
                tryNext();
              });
          };

          tryNext();
        }
      });

      startQuiz();
    } catch (err) {
      console.error('Failed to create HanziWriter:', err);
      setIsLoading(false);
      setLoadingError(true);
    }

    return () => {
      isMounted = false;
      if (writerRef.current) {
        writerRef.current.cancelQuiz();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [character, size, retryKey, startQuiz]);

  if (loadingError) {
    return (
      <div style={{ width: size, height: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--danger)', padding: 16, gap: 12 }}>
        <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
          No hay datos de trazos disponibles para este Kanji ({character}).
        </p>
        <button 
          className="btn btn-outline btn-sm"
          onClick={() => setRetryKey(k => k + 1)}
          style={{ fontSize: '0.8rem' }}
        >
          <RotateCcw size={14} /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="kanji-draw-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Container for HanziWriter canvas */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <div 
          ref={containerRef} 
          style={{ 
            width: size,
            height: size,
            background: '#ffffff', // Always white to see outline clearly
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: success ? '3px solid var(--success)' : '1px solid var(--border)',
            transition: 'border-color 0.3s'
          }}
        />
        {isLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 'var(--radius-md)',
            gap: 8,
            color: '#334155',
            fontSize: '0.85rem',
            zIndex: 5
          }}>
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary, #3b82f6)' }} />
            <span>Cargando trazos...</span>
          </div>
        )}
      </div>
      
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
