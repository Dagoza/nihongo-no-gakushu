'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '../lib/AppContext';
import JapanesePillarsGuide from '../components/features/JapanesePillarsGuide';
import StudyStatusBento from '../components/features/StudyStatusBento';
import KanaKanjiMemoryGame from '../components/features/KanaKanjiMemoryGame';
import ParticleRushGame from '../components/features/ParticleRushGame';
import TerminologyDetailModal from '../components/modals/TerminologyDetailModal';
import { 
  Compass, 
  BookOpen, 
  MessageSquare, 
  Tv, 
  Layers, 
  Target, 
  Award, 
  ArrowRight
} from 'lucide-react';

// Carga dinámica del modelo de mascota
const ZenDaruma3D = dynamic(() => import('../components/features/ZenDaruma3D'), {
  ssr: false,
  loading: () => (
    <div style={{ width: 220, height: 220, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Invocando Daruma...</span>
    </div>
  )
});

export default function HomePage() {
  const { appState, handleUpdateState, navigate } = useApp();

  const [isTerminologyModalOpen, setIsTerminologyModalOpen] = useState(false);
  const [selectedPillarId, setSelectedPillarId] = useState('writing');
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [activeGameTab, setActiveGameTab] = useState('memory');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { jp: 'おはようございます', es: '¡Buenos días!' };
    } else if (hour >= 12 && hour < 19) {
      return { jp: 'こんにちは', es: '¡Buenas tardes!' };
    } else {
      return { jp: 'こんばんは', es: '¡Buenas noches!' };
    }
  };

  const greeting = getGreeting();

  const triggerCelebration = useCallback(() => {
    setIsCelebrating(true);
    setTimeout(() => {
      setIsCelebrating(false);
    }, 4500);
  }, []);

  const handleAwardXP = useCallback((amount) => {
    if (!handleUpdateState) return;
    const currentXp = appState?.xp || 0;
    const newXp = currentXp + amount;
    handleUpdateState({
      ...appState,
      xp: newXp
    });
    triggerCelebration();
  }, [appState, handleUpdateState, triggerCelebration]);

  const handleOpenPillar = (pillarId) => {
    setSelectedPillarId(pillarId);
    setIsTerminologyModalOpen(true);
  };

  const quickModules = [
    { title: 'Ruta de Aprendizaje', desc: 'Currículum guiado progresivo N5 a N1', path: '/curriculum', icon: Compass, color: '#6366f1' },
    { title: 'Historias con Furigana', desc: 'Lecturas graduadas con audio sincronizado', path: '/story', icon: BookOpen, color: '#8b5cf6' },
    { title: 'Conversación NHK', desc: 'Diálogos de situaciones cotidianas reales', path: '/nhk', icon: MessageSquare, color: '#ec4899' },
    { title: 'Inmersión YouTube', desc: 'Videos auténticos con subtítulos duales', path: '/youtube', icon: Tv, color: '#ef4444' },
    { title: 'Banco de Vocabulario', desc: 'Kanji, Hiragana, Katakana y audios', path: '/vocab', icon: Layers, color: '#3b82f6' },
    { title: 'Simulacros JLPT', desc: 'Exámenes oficiales cronometrados N5 a N1', path: '/jlpt', icon: Award, color: '#f59e0b' },
  ];

  return (
    <div className="home-hub-container">
      {/* 1. SECCIÓN HERO JAPANDI CON DARUMA */}
      <section className="home-hero-card">
        <div className="home-hero-content">
          <div className="home-greeting-badge">
            <span className="home-pulse-dot" />
            <span className="jp-text">{greeting.jp}</span>
            <span>· {greeting.es}</span>
          </div>

          <h1 className="home-hero-title">
            Aprende Japonés con{' '}
            <span className="home-hero-highlight">Claridad y Serenidad</span>.
          </h1>

          <p className="home-hero-desc">
            Una experiencia interactiva y minimalista donde la terminología del idioma se comprende sin saturación: audio neuronal nativo, estructura paso a paso de N5 a N1 y práctica ágil.
          </p>

          <div className="home-hero-actions">
            <button
              type="button"
              onClick={() => navigate('/curriculum')}
              className="home-btn-primary"
            >
              <Compass size={17} />
              <span>Continuar en el Currículum</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => handleOpenPillar('writing')}
              className="home-btn-secondary"
            >
              <span>Ver Guía de Terminología</span>
            </button>
          </div>
        </div>

        {/* Mascota Zen Daruma */}
        <ZenDaruma3D 
          celebrate={isCelebrating}
          size={240}
          onInteract={() => {}}
        />
      </section>

      {/* 2. DASHBOARD BENTO: ESTADO ACTUAL DEL ESTUDIO */}
      <StudyStatusBento 
        appState={appState}
        onNavigate={navigate}
      />

      {/* 3. LOS 4 PILARES DE LA TERMINOLOGÍA JAPONESA */}
      <JapanesePillarsGuide 
        onOpenPillar={handleOpenPillar}
      />

      {/* 4. ESTACIÓN DE MINI-JUEGOS INTERACTIVOS */}
      <section className="home-section">
        <div className="home-section-header">
          <div>
            <span className="home-section-label">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
              Práctica Táctil & Gamificación
            </span>
            <h2 className="home-section-title">
              Mini-Juegos Educativos
            </h2>
          </div>

          {/* Selector de Juego */}
          <div className="games-tab-pills">
            <button
              type="button"
              onClick={() => setActiveGameTab('memory')}
              className={`game-tab-btn ${activeGameTab === 'memory' ? 'active' : ''}`}
            >
              <Layers size={15} />
              <span>1. Memory Flash</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveGameTab('particles')}
              className={`game-tab-btn ${activeGameTab === 'particles' ? 'active' : ''}`}
            >
              <Target size={15} />
              <span>2. Desafío Partículas</span>
            </button>
          </div>
        </div>

        {/* Juego Activo */}
        {activeGameTab === 'memory' ? (
          <KanaKanjiMemoryGame 
            onGameWin={triggerCelebration}
            onAwardXP={handleAwardXP}
          />
        ) : (
          <ParticleRushGame 
            onGameWin={triggerCelebration}
            onAwardXP={handleAwardXP}
          />
        )}
      </section>

      {/* 5. ACCESO RÁPIDO A TODOS LOS MÓDULOS DE APRENDIZAJE */}
      <section className="home-section">
        <div className="home-section-header">
          <div>
            <span className="home-section-label">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#8b5cf6' }} />
              Ecosistema Integral
            </span>
            <h2 className="home-section-title" style={{ fontSize: '1.25rem' }}>
              Explora Todo el Catálogo de Estudio
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/curriculum')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.82rem'
            }}
          >
            <span>Ver ruta completa</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="home-modules-grid">
          {quickModules.map((mod, idx) => {
            const ModIcon = mod.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(mod.path)}
                className="home-module-card"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(mod.path); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div 
                    className="home-module-icon-wrap"
                    style={{ background: `${mod.color}15`, color: mod.color }}
                  >
                    <ModIcon size={22} />
                  </div>
                  <div>
                    <h4 className="home-module-title">
                      {mod.title}
                    </h4>
                    <p className="home-module-desc">
                      {mod.desc}
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal de Revelación Progresiva para Terminología Japonesa */}
      <TerminologyDetailModal 
        isOpen={isTerminologyModalOpen}
        onClose={() => setIsTerminologyModalOpen(false)}
        initialPillarId={selectedPillarId}
        onNavigate={navigate}
      />
    </div>
  );
}
