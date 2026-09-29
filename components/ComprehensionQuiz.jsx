'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  RotateCcw, 
  Lightbulb,
  Sparkles,
  Check
} from 'lucide-react';
import audioManager from '../lib/audioManager';

export default function ComprehensionQuiz({ 
  questions = [], 
  appState = null, 
  onUpdateState = null,
  title = "Preguntas de Comprensión Lectora",
  subtitle = "Demuestra tu comprensión del contenido en japonés respondiendo estas 3 preguntas de opción múltiple:"
}) {
  const [answers, setAnswers] = useState({});
  const [xpAwarded, setXpAwarded] = useState({});

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return null;
  }

  const validQuestions = questions.slice(0, 3); // Garantizar las 3 preguntas solicitadas
  const totalQuestions = validQuestions.length;
  const answeredCount = Object.keys(answers).length;
  
  const correctCount = validQuestions.reduce((acc, q, idx) => {
    return acc + (answers[idx] === q.correct_index ? 1 : 0);
  }, 0);

  const handleSelectOption = (qIdx, optIdx, question) => {
    if (answers[qIdx] !== undefined) return; // Ya respondida

    const isCorrect = optIdx === question.correct_index;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));

    // Otorgar +10 XP por respuesta correcta si no se ha otorgado aún
    if (isCorrect && !xpAwarded[qIdx] && onUpdateState && appState) {
      setXpAwarded(prev => ({ ...prev, [qIdx]: true }));
      onUpdateState({
        ...appState,
        xp: (appState.xp || 0) + 10
      });
    }
  };

  const handleReset = () => {
    setAnswers({});
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div 
      className="card" 
      style={{ 
        marginTop: 24, 
        padding: '24px 26px', 
        borderRadius: 'var(--radius-lg, 16px)',
        border: '1.5px solid var(--border)',
        background: 'var(--bg-card)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '1.3rem' }}>📝</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {title}
            </h3>
            <span className="vocab-tag" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem' }}>
              3 Preguntas con IA
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            {subtitle}
          </p>
        </div>

        {/* Score & Progress Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'var(--bg-main)', border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
          <Award size={16} color="var(--primary)" />
          <span>Aciertos: {correctCount} de {totalQuestions}</span>
          {correctCount > 0 && (
            <span style={{ color: '#10b981', fontSize: '0.78rem' }}>
              (+{correctCount * 10} XP)
            </span>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {validQuestions.map((q, qIdx) => {
          const selectedOpt = answers[qIdx];
          const hasAnswered = selectedOpt !== undefined;
          const isCorrect = selectedOpt === q.correct_index;

          return (
            <div 
              key={q.id || qIdx}
              style={{
                background: 'var(--bg-main)',
                border: `1.5px solid ${hasAnswered ? (isCorrect ? '#10b981' : 'rgba(239, 68, 68, 0.4)') : 'var(--border)'}`,
                borderRadius: 'var(--radius-md, 12px)',
                padding: '18px 20px',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Question Title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                <span 
                  style={{ 
                    width: 26, 
                    height: 26, 
                    borderRadius: 999, 
                    background: hasAnswered ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--primary)',
                    color: '#fff', 
                    fontSize: '0.85rem', 
                    fontWeight: 800, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}
                >
                  {qIdx + 1}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.5 }}>
                    {q.question}
                  </div>
                  {q.question_jp && (
                    <div className="jp-text" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {q.question_jp}
                    </div>
                  )}
                </div>
              </div>

              {/* Multiple Choice Options Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginBottom: hasAnswered ? 14 : 0 }}>
                {(q.options || []).map((opt, optIdx) => {
                  const isThisSelected = selectedOpt === optIdx;
                  const isThisTheCorrectAnswer = optIdx === q.correct_index;

                  let optBg = 'var(--bg-card)';
                  let optBorder = 'var(--border)';
                  let optColor = 'var(--text-main)';

                  if (hasAnswered) {
                    if (isThisTheCorrectAnswer) {
                      optBg = 'rgba(34, 197, 94, 0.12)';
                      optBorder = '#22c55e';
                      optColor = '#15803d';
                    } else if (isThisSelected && !isCorrect) {
                      optBg = 'rgba(239, 68, 68, 0.12)';
                      optBorder = '#ef4444';
                      optColor = '#b91c1c';
                    } else {
                      optColor = 'var(--text-muted)';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(qIdx, optIdx, q)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm, 8px)',
                        border: `1.5px solid ${optBorder}`,
                        background: optBg,
                        color: optColor,
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: hasAnswered ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!hasAnswered) e.currentTarget.style.borderColor = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        if (!hasAnswered) e.currentTarget.style.borderColor = optBorder;
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span 
                          style={{ 
                            width: 22, 
                            height: 22, 
                            borderRadius: 4, 
                            background: isThisSelected ? (isCorrect ? '#22c55e' : '#ef4444') : 'var(--bg-main)',
                            color: isThisSelected ? '#fff' : 'var(--text-muted)',
                            fontSize: '0.75rem', 
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {optionLetters[optIdx] || optIdx + 1}
                        </span>
                        <span style={{ lineHeight: 1.4 }}>{opt}</span>
                      </div>

                      {hasAnswered && isThisTheCorrectAnswer && (
                        <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0 }} />
                      )}
                      {hasAnswered && isThisSelected && !isCorrect && (
                        <XCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Explanation */}
              {hasAnswered && (
                <div 
                  style={{ 
                    marginTop: 10, 
                    padding: '12px 14px', 
                    borderRadius: 'var(--radius-sm, 8px)',
                    background: isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${isCorrect ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.9rem', color: isCorrect ? '#15803d' : '#b91c1c', marginBottom: 4 }}>
                    {isCorrect ? (
                      <>
                        <Check size={16} /> ¡Respuesta correcta! (+10 XP)
                      </>
                    ) : (
                      <>
                        <XCircle size={16} /> Respuesta incorrecta
                      </>
                    )}
                  </div>
                  {q.explanation && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <Lightbulb size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quiz Completion Footer */}
      {answeredCount === totalQuestions && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.4rem' }}>{correctCount === totalQuestions ? '🎉' : '👏'}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {correctCount === totalQuestions ? '¡Puntuación perfecta! Has comprendido el texto al 100%' : `Completado: ${correctCount} de ${totalQuestions} respuestas correctas`}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {correctCount > 0 ? `Has sumado +${correctCount * 10} XP a tu progreso general.` : 'Puedes repasar el texto y volver a intentarlo.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleReset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RotateCcw size={14} /> Volver a intentar
          </button>
        </div>
      )}
    </div>
  );
}
