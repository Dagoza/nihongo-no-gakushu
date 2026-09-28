'use client';

import React, { useRef } from 'react';
import { Download, Upload, Flame, Star, Target, BookOpen, Layers, CheckCircle2, RotateCcw, Keyboard } from 'lucide-react';
import { exportData, parseImportData, getInitialState } from '../lib/storage';
import { dataStore } from '../lib/data';

export default function ProgressTab({ appState, onUpdateState }) {
  const fileInputRef = useRef(null);

  const streak = appState.streak || 1;
  const xp = appState.xp || 0;
  const userLevel = Math.floor(xp / 100) + 1;
  const masteredParticlesCount = Object.values(appState.masteredParticles || {}).filter(Boolean).length;
  const masteredVocabCount = Object.values(appState.masteredVocab || {}).filter(Boolean).length;
  const masteredKanjiCount = Object.values(appState.masteredKanji || {}).filter(Boolean).length;
  const completedSentencesCount = Object.values(appState.completedSentences || {}).filter(Boolean).length;
  const completedConversationsCount = Object.values(appState.completedConversations || {}).filter(Boolean).length;
  const totalConversations = dataStore.nhkLessons?.length || 22;

  const handleExport = () => {
    exportData(appState);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text === 'string') {
          const restoredState = parseImportData(text);
          onUpdateState(restoredState);
          alert('¡Progreso restaurado con éxito!');
        }
      } catch (err) {
        alert('El archivo JSON no es válido o está dañado.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de que deseas reiniciar todo el progreso acumulado? Esta acción no se puede deshacer.')) {
      const fresh = getInitialState();
      onUpdateState(fresh);
    }
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <span>📊</span> Mi Progreso y Estadísticas de Aprendizaje
        </h2>
        <p className="section-desc">
          Todo tu progreso se guarda automáticamente en tu navegador. Consulta tu rendimiento, exporta tus datos para sincronizar con otros equipos y revisa la guía de teclado japonés.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🔥</div>
          <div style={{ fontSize: '1.8rem', fontBold: true, fontWeight: 800, color: 'var(--accent)' }}>
            {streak} {streak === 1 ? 'día' : 'días'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Racha de Estudio</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>⭐</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
            {xp} XP
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nivel {userLevel} Maestro</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🎯</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
            {masteredParticlesCount}/25
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Partículas Dominadas</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>漢</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-light)' }}>
            {masteredKanjiCount}/101
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Kanjis Aprendidos</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>📚</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>
            {masteredVocabCount}/163
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vocabulario Dominado</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>📖</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6' }}>
            {completedSentencesCount}/58
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Oraciones de Historia</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>📻</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899' }}>
            {completedConversationsCount}/{totalConversations}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Conversaciones Estudiadas</div>
        </div>
      </div>

      {/* Backup and Restore Box */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>💾</span> Respaldo y Sincronización de Datos
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 16 }}>
          Descarga un archivo JSON de respaldo con tu racha, XP y listas de estudio completadas, o restáuralo si cambias de equipo o navegador.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={handleExport}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Download size={16} /> Exportar Progreso a JSON
          </button>

          <button 
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Upload size={16} /> Restaurar desde JSON
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            accept=".json" 
            style={{ display: 'none' }} 
          />

          <button 
            className="btn btn-outline" 
            style={{ color: 'var(--danger)', marginLeft: 'auto' }}
            onClick={handleReset}
          >
            <RotateCcw size={16} /> Reiniciar Progreso
          </button>
        </div>
      </div>

      {/* Japanese Keyboard Guide */}
      <div className="card" style={{ background: 'var(--bg-main)', border: '2px dashed var(--border)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Keyboard size={20} color="var(--primary)" /> Consejos para Escribir con Teclado Japonés (IME) en macOS
        </h3>
        <ul style={{ fontSize: '0.93rem', color: 'var(--text-muted)', lineHeight: 1.9, paddingLeft: 22 }}>
          <li>
            <strong>Activar Japonés:</strong> Ve a <em>Preferencias del Sistema → Teclado → Fuentes de Entrada</em> y agrega <strong>Japonés (Romaji)</strong>.
          </li>
          <li>
            <strong>Alternar Rápido:</strong> Presiona <kbd style={{ background: 'var(--bg-surface)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>Control + Espacio</kbd> o la tecla <kbd style={{ background: 'var(--bg-surface)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>Bloq Mayús</kbd> (si está configurada para cambiar de fuente).
          </li>
          <li>
            <strong>Hiragana Directo:</strong> Escribe en letras latinas (ej. <code>watashi</code>) y el sistema lo escribirá inmediatamente como <code>わたし</code>.
          </li>
          <li>
            <strong>Conversión a Kanji:</strong> Al escribir una palabra en Hiragana, presiona la <kbd style={{ background: 'var(--bg-surface)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>Barra Espaciadora</kbd> para abrir el menú de conversión a Kanji (ej. <code>わたし</code> → <code>私</code>) y confirma con <kbd style={{ background: 'var(--bg-surface)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>Enter</kbd>.
          </li>
          <li>
            <strong>Katakana:</strong> Escribe la palabra (ej. <code>terebi</code>) y presiona la barra espaciadora o la tecla <kbd style={{ background: 'var(--bg-surface)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>F7</kbd> para convertir directamente a Katakana (<code>テレビ</code>).
          </li>
        </ul>
      </div>
    </div>
  );
}
