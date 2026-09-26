'use client';

import React, { useState } from 'react';
import { Volume2, Play, BookOpen, MessageSquare, CheckCircle2 } from 'lucide-react';
import audioManager from '../lib/audioManager';
import { dataStore } from '../lib/data';

export default function ConversationTab({ appState, onUpdateState }) {
  const [currentLessonNum, setCurrentLessonNum] = useState(1);
  const lessons = dataStore.nhkLessons || [];

  const lesson = lessons.find(l => l.lesson === currentLessonNum) || lessons[0];

  const handlePlayFullDialogue = () => {
    if (!lesson || !lesson.dialogue) return;
    const playlist = lesson.dialogue.map(d => ({
      text: d.jp,
      desc: `${d.speaker}: ${d.es}`
    }));
    audioManager.setPlaylist(playlist, 0);
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <span>📻</span> Conversaciones y Diálogos Cotidianos
        </h2>
        <p className="section-desc">
          Diálogos reales de la vida cotidiana en Japón extraídos de tu guía de NHK (Japonés desde el Español), con pronunciación nativa, reproducción línea por línea y notas gramaticales contextuales.
        </p>
      </div>

      {/* Lesson Selector Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {lessons.map(l => (
          <button
            key={l.lesson}
            className={`btn ${l.lesson === currentLessonNum ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setCurrentLessonNum(l.lesson)}
          >
            Lección {l.lesson}: {l.title_es.split('.')[0]}
          </button>
        ))}
      </div>

      {lesson && (
        <div className="card" style={{ marginBottom: 24 }}>
          {/* Top Info */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="vocab-tag">Lección {lesson.lesson} · {lesson.topic}</span>
              <h3 className="jp-text" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: 8 }}>
                {lesson.title_jp}
              </h3>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: 4 }}>
                🇪🇸 {lesson.title_es}
              </p>
            </div>

            <button 
              className="btn btn-primary"
              onClick={handlePlayFullDialogue}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Play size={16} /> Escuchar Diálogo Completo
            </button>
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
                  <div className="jp-text" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
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
              <BookOpen size={18} /> Puntos Clave de Gramática y Uso:
            </h4>
            <ul style={{ listStyleType: 'disc', paddingLeft: 22, fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-main)' }}>
              {lesson.grammar_notes.map((note, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
