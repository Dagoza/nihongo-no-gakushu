import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { SRSRating } from '../lib/srs';

export default function SrsReview({ queue, onRate, onExit, renderFront, renderBack }) {
  const [srsReviewIndex, setSrsReviewIndex] = useState(0);
  const [srsRevealed, setSrsRevealed] = useState(false);

  if (srsReviewIndex >= queue.length) {
    return (
      <div className="quiz-container" style={{ maxWidth: 680 }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12 }}>¡Estás al día!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>No tienes más tarjetas pendientes para repasar hoy.</p>
          <button className="btn btn-primary" onClick={onExit}>
            Finalizar Repaso
          </button>
        </div>
      </div>
    );
  }

  const currentItem = queue[srsReviewIndex];

  const handleRate = (rating) => {
    onRate(currentItem, rating);
    setSrsRevealed(false);
    setSrsReviewIndex(prev => prev + 1);
  };

  return (
    <div className="quiz-container" style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span className="vocab-tag">🧠 Repaso Espaciado</span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Tarjeta {srsReviewIndex + 1} de {queue.length}
        </span>
      </div>

      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 24 }}>
        
        {renderFront(currentItem)}
        
        {srsRevealed ? (
          <div className="srs-revealed-content" style={{ marginTop: 24, paddingTop: 24, borderTop: '1px dashed var(--border)' }}>
            {renderBack(currentItem)}
          </div>
        ) : (
          <div style={{ marginTop: 32 }}>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setSrsRevealed(true)}
            >
              Mostrar Respuesta
            </button>
          </div>
        )}
      </div>

      {srsRevealed && (
        <div style={{ marginTop: 24 }}>
          <p style={{ textAlign: 'center', marginBottom: 12, fontSize: '0.9rem', color: 'var(--text-muted)' }}>¿Qué tan difícil fue recordar esto?</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <button className="btn btn-danger" onClick={() => handleRate(SRSRating.AGAIN)}>
              Olvidé
            </button>
            <button className="btn btn-warning" onClick={() => handleRate(SRSRating.HARD)} style={{ color: '#fff' }}>
              Difícil
            </button>
            <button className="btn btn-success" onClick={() => handleRate(SRSRating.GOOD)}>
              Bien
            </button>
            <button className="btn btn-primary" onClick={() => handleRate(SRSRating.EASY)}>
              Fácil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
