'use client';

import React, { useState } from 'react';
import { 
  Volume2, 
  Play, 
  BookOpen, 
  MessageSquare, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import audioManager from '../lib/audioManager';
import { dataStore } from '../lib/data';

export default function ConversationTab({ appState, onUpdateState }) {
  const [currentLessonNum, setCurrentLessonNum] = useState(1);
  const [activeSubTab, setActiveSubTab] = useState('dialogue'); // 'dialogue' | 'practice'
  
  // Exercise practice state
  const [filterType, setFilterType] = useState('all'); // 'all' | 'reply' | 'missing_word' | 'missing_kanji'
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const lessons = dataStore.nhkLessons || [];
  const allExercises = dataStore.conversationExercises || [];

  const lesson = lessons.find(l => l.lesson === currentLessonNum) || lessons[0];

  // Exercises filtered by current active category
  const filteredExercises = allExercises.filter(ex => {
    if (filterType === 'all') return true;
    return ex.type === filterType;
  });

  const currentExercise = filteredExercises[currentExIndex] || filteredExercises[0];

  const handlePlayFullDialogue = () => {
    if (!lesson || !lesson.dialogue) return;
    const playlist = lesson.dialogue.map(d => ({
      text: d.jp,
      desc: `${d.speaker}: ${d.es}`
    }));
    audioManager.setPlaylist(playlist, 0);
  };

  const handleSelectOption = (option) => {
    if (selectedAnswer !== null || !currentExercise) return;
    const isCorrect = option === currentExercise.correct;
    setSelectedAnswer({
      chosen: option,
      isCorrect
    });
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    if (isCorrect) {
      audioManager.speak(option);
    }
  };

  const handleNextExercise = () => {
    setSelectedAnswer(null);
    if (currentExIndex < filteredExercises.length - 1) {
      setCurrentExIndex(prev => prev + 1);
    } else {
      setCurrentExIndex(0);
    }
  };

  const handleResetExercises = () => {
    setSelectedAnswer(null);
    setCurrentExIndex(0);
    setScore({ correct: 0, total: 0 });
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <span>📻</span> Conversaciones y Diálogos Cotidianos
        </h2>
        <p className="section-desc">
          Diálogos reales de la vida cotidiana en Japón extraídos del programa oficial de la NHK, con audio interactivo línea por línea, explicaciones gramaticales y nuevos ejercicios interactivos de comprensión, respuesta y kanji.
        </p>
      </div>

      {/* Main Mode Switcher: Dialogue vs Practice */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 22, borderBottom: '1px solid var(--border)', paddingBottom: 12, flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeSubTab === 'dialogue' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('dialogue')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 700 }}
        >
          <MessageSquare size={18} /> Diálogos y Lecciones ({lessons.length})
        </button>

        <button
          className={`btn ${activeSubTab === 'practice' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('practice')}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '10px 18px', 
            fontWeight: 700,
            background: activeSubTab === 'practice' ? 'var(--accent)' : 'transparent',
            borderColor: activeSubTab === 'practice' ? 'var(--accent)' : 'var(--border)',
            color: activeSubTab === 'practice' ? '#fff' : 'var(--text-main)'
          }}
        >
          <HelpCircle size={18} /> Ejercicios Didácticos de Diálogo ({allExercises.length})
        </button>
      </div>

      {/* SUBTAB 1: DIALOGUES */}
      {activeSubTab === 'dialogue' && (
        <>
          {/* Lesson Selector Bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', maxHeight: 150, overflowY: 'auto', padding: '4px 0' }}>
            {lessons.map(l => (
              <button
                key={l.lesson}
                className={`btn ${l.lesson === currentLessonNum ? 'btn-primary' : 'btn-outline'} btn-sm`}
                onClick={() => setCurrentLessonNum(l.lesson)}
                style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                L{l.lesson}: {l.title_es.split('.')[0].slice(0, 22)}...
              </button>
            ))}
          </div>

          {lesson && (
            <div className="card" style={{ marginBottom: 24 }}>
              {/* Top Info */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span className="vocab-tag">Lección {lesson.lesson} de {lessons.length} · {lesson.topic}</span>
                  <h3 className="jp-text" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: 8 }}>
                    {lesson.title_jp}
                  </h3>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    🇪🇸 {lesson.title_es}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    className="btn btn-primary"
                    onClick={handlePlayFullDialogue}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <Play size={16} /> Escuchar Diálogo Completo
                  </button>
                </div>
              </div>

              {/* Dialogue Lines */}
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={18} color="var(--primary)" /> Diálogo de la Lección:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {lesson.dialogue.map((d, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      display: 'flex', 
                      gap: 14, 
                      alignItems: 'flex-start', 
                      padding: '14px 16px', 
                      background: 'var(--bg-main)', 
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background 0.2s, border-color 0.2s'
                    }}
                    onClick={() => audioManager.speak(d.jp)}
                    title="Toca para escuchar esta línea"
                  >
                    <div style={{ minWidth: 80, fontWeight: 700, color: 'var(--accent)', paddingTop: 2 }}>
                      {d.speaker}:
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                        {d.jp}
                      </div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                        {d.es}
                      </div>
                    </div>
                    <button 
                      className="audio-btn" 
                      style={{ width: 34, height: 34 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        audioManager.speak(d.jp);
                      }}
                      title="Escuchar"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Grammar Notes in Spanish */}
              <div style={{ background: 'var(--primary-bg)', borderLeft: '4px solid var(--primary)', padding: '18px 20px', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={18} /> Puntos Clave de Gramática y Uso Cotidiano:
                </h4>
                <ul style={{ listStyleType: 'disc', paddingLeft: 22, fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-main)' }}>
                  {lesson.grammar_notes.map((note, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {/* SUBTAB 2: INTERACTIVE EXERCISES */}
      {activeSubTab === 'practice' && currentExercise && (
        <div className="card" style={{ maxWidth: 820, margin: '0 auto', padding: '24px 28px' }}>
          {/* Practice Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setFilterType('all'); setCurrentExIndex(0); setSelectedAnswer(null); }}
              >
                Todos ({allExercises.length})
              </button>
              <button
                className={`btn btn-sm ${filterType === 'reply' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setFilterType('reply'); setCurrentExIndex(0); setSelectedAnswer(null); }}
              >
                💬 ¿Qué responder?
              </button>
              <button
                className={`btn btn-sm ${filterType === 'missing_word' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setFilterType('missing_word'); setCurrentExIndex(0); setSelectedAnswer(null); }}
              >
                🧩 ¿Qué palabra falta?
              </button>
              <button
                className={`btn btn-sm ${filterType === 'missing_kanji' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setFilterType('missing_kanji'); setCurrentExIndex(0); setSelectedAnswer(null); }}
              >
                ㊗️ ¿Qué kanji corresponde?
              </button>
            </div>

            {/* Score pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, background: 'var(--bg-main)', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}>
              <Award size={16} color="var(--primary)" /> Aciertos: {score.correct} / {score.total}
            </div>
          </div>

          {/* Exercise Card Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="vocab-tag" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                {currentExercise.type_label}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Basado en la Lección {currentExercise.lesson}
              </span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {currentExIndex + 1} de {filteredExercises.length}
            </span>
          </div>

          {/* Question Box */}
          <div style={{ background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', border: '1px solid var(--border)', marginBottom: 22 }}>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: 16, lineHeight: 1.6, fontWeight: 500 }}>
              {currentExercise.prompt_es}
            </p>

            {/* Dialogue context / Masked text */}
            <div 
              className="jp-text" 
              style={{ 
                fontSize: '1.4rem', 
                background: 'var(--bg-card)', 
                padding: '16px 20px', 
                borderRadius: 'var(--radius-md)', 
                borderLeft: '4px solid var(--primary)',
                lineHeight: 1.9,
                whiteSpace: 'pre-line',
                color: 'var(--text-main)'
              }}
            >
              {currentExercise.context}
            </div>
          </div>

          {/* Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 22 }}>
            {currentExercise.options.map((option, idx) => {
              const isSelected = selectedAnswer?.chosen === option;
              const isCorrectTarget = option === currentExercise.correct;
              
              let bg = 'var(--bg-card)';
              let border = 'var(--border)';
              let color = 'var(--text-main)';

              if (selectedAnswer) {
                if (isCorrectTarget) {
                  bg = 'rgba(34, 197, 94, 0.12)';
                  border = '#22c55e';
                  color = '#15803d';
                } else if (isSelected && !selectedAnswer.isCorrect) {
                  bg = 'rgba(239, 68, 68, 0.12)';
                  border = '#ef4444';
                  color = '#b91c1c';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={selectedAnswer !== null}
                  className="jp-text"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${border}`,
                    background: bg,
                    color: color,
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    cursor: selectedAnswer === null ? 'pointer' : 'default',
                    textAlign: 'left',
                    transition: 'transform 0.15s, border-color 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedAnswer) e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedAnswer) e.currentTarget.style.borderColor = border;
                  }}
                >
                  <span>{option}</span>
                  {selectedAnswer && isCorrectTarget && <CheckCircle2 size={20} color="#22c55e" />}
                  {selectedAnswer && isSelected && !selectedAnswer.isCorrect && <XCircle size={20} color="#ef4444" />}
                </button>
              );
            })}
          </div>

          {/* Answer Feedback & Explanation */}
          {selectedAnswer && (
            <div 
              style={{ 
                padding: '18px 20px', 
                borderRadius: 'var(--radius-md)', 
                background: selectedAnswer.isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${selectedAnswer.isCorrect ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1.05rem', color: selectedAnswer.isCorrect ? '#15803d' : '#b91c1c', marginBottom: 6 }}>
                {selectedAnswer.isCorrect ? (
                  <>
                    <CheckCircle2 size={20} /> ¡Correcto! Exactamente esa es la respuesta.
                  </>
                ) : (
                  <>
                    <XCircle size={20} /> Incorrecto. La respuesta adecuada es: <span className="jp-text">{currentExercise.correct}</span>
                  </>
                )}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
                💡 <strong>Explicación:</strong> {currentExercise.explanation}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleResetExercises}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={15} /> Reiniciar práctica
            </button>

            {selectedAnswer && (
              <button
                className="btn btn-primary"
                onClick={handleNextExercise}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px' }}
              >
                {currentExIndex < filteredExercises.length - 1 ? (
                  <>Siguiente Ejercicio <ArrowRight size={16} /></>
                ) : (
                  <>Comenzar de nuevo <RotateCcw size={16} /></>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
