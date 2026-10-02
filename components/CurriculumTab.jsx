'use client';

import React, { useState } from 'react';
import dataStore from '../lib/data';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  Volume2, 
  HelpCircle, 
  FileText, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Check,
  X,
  Layers,
  GraduationCap,
  Search,
  Filter,
  Target,
  Info
} from 'lucide-react';
import audioManager from '../lib/audioManager';
import { useAppContext } from '../lib/AppContext';

// Helper to structure and parse grammar points into title and Japanese pattern/content
const parseGrammarPoint = (point) => {
  if (!point || typeof point !== 'string') return { title: null, content: '' };
  let inParen = 0;
  let colonIndex = -1;
  for (let i = 0; i < point.length; i++) {
    if (point[i] === '(' || point[i] === '（') inParen++;
    else if (point[i] === ')' || point[i] === '）') inParen--;
    else if (point[i] === ':' && inParen === 0) {
      colonIndex = i;
      break;
    }
  }
  if (colonIndex !== -1) {
    return {
      title: point.slice(0, colonIndex).trim(),
      content: point.slice(colonIndex + 1).trim()
    };
  }
  const match = point.match(/^(.*?)\s*([\(\（].*[\)\）])$/);
  if (match && match[1].trim()) {
    return {
      title: match[2].replace(/^[\(\（]/, '').replace(/[\)\）]$/, '').trim(),
      content: match[1].trim()
    };
  }
  return {
    title: null,
    content: point.trim()
  };
};

export default function CurriculumTab({ onNavigate, userState, onUpdateState, initialStep = null, onStepChange }) {
  const contextApp = useAppContext();
  const steps = dataStore.curriculum || [];
  
  // State for active module detailed view
  const [selectedStepNum, setSelectedStepNum] = useState(initialStep);
  // Active sub-step state for the selected module
  const [activeSubStep, setActiveSubStep] = useState(1);

  // Sync activeSubStep whenever selectedStepNum or userState changes
  React.useEffect(() => {
    if (selectedStepNum) {
      const savedSubStep = userState?.moduleProgress?.[selectedStepNum]?.currentSubStep;
      if (typeof savedSubStep === 'number' && savedSubStep >= 1) {
        setActiveSubStep(savedSubStep);
      } else {
        setActiveSubStep(1);
      }
    }
  }, [selectedStepNum, userState?.moduleProgress]);
  
  // Theme, Level and Status filter state
  const [selectedTheme, setSelectedTheme] = useState('all'); // 'all' | 'vida' | 'trabajo' | 'ciudad' | 'ocio'
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quiz interaction state for module view
  const [quizAnswers, setQuizAnswers] = useState({}); // { [exerciseId]: selectedOption }
  const [quizFeedback, setQuizFeedback] = useState({}); // { [exerciseId]: { isCorrect, explanation } }

  // Collapsible sections state for cards in curriculum list view
  const [openSections, setOpenSections] = useState({}); // { [`${step}_grammar`]: boolean, [`${step}_vocab`]: boolean }

  const toggleSection = (stepNum, sectionType) => {
    const key = `${stepNum}_${sectionType}`;
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Mobile Theme Dropdown state & outside click handler
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeDropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setIsThemeDropdownOpen(false);
      }
    };
    if (isThemeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isThemeDropdownOpen]);

  const themesList = [
    { id: 'all', label: 'Todos los Módulos', icon: '🌐', count: steps.length },
    { id: 'vida', label: 'Vida Cotidiana y Familia', icon: '🏠', count: 5 },
    { id: 'trabajo', label: 'Trabajo, Horarios y Reglas', icon: '🏢', count: 3 },
    { id: 'ciudad', label: 'Ciudad, Tiendas y Transporte', icon: '🛍️', count: 5 },
    { id: 'ocio', label: 'Ocio, Cultura, Salud y Metas', icon: '🎮', count: 6 },
  ];

  // Listen for browser Back/Forward navigation to smoothly switch between list and module view
  React.useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const step = params.get('step');
      setSelectedStepNum(step ? parseInt(step, 10) : null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  React.useEffect(() => {
    if (initialStep !== undefined && initialStep !== null) {
      setSelectedStepNum(initialStep);
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          if (window.location.hash === '#exercises') {
            const exSection = document.getElementById('exercises-section');
            if (exSection) {
              exSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              return;
            }
          }
          const detail = document.querySelector('.curriculum-detail-view');
          if (detail) {
            detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, [initialStep]);

  const selectedStep = steps.find(s => s.step === selectedStepNum) || null;

  // Temarios revisados con ejercicios pendientes
  const reviewedStepsWithPendingExercises = React.useMemo(() => {
    return steps.filter(step => {
      const isStepMarked = !!userState?.completedSteps?.[step.step];
      const hasAnyCanDo = (step.can_do || []).some(cd => !!userState?.completedCanDos?.[cd.id]);
      const isReviewed = isStepMarked || hasAnyCanDo;
      if (!isReviewed) return false;
      const stepExercises = step.exercises || [];
      if (stepExercises.length === 0) return false;
      const pending = stepExercises.filter(ex => !userState?.completedExercises?.[ex.id]);
      return pending.length > 0;
    });
  }, [steps, userState]);

  // Theme step mapping
  const themeSteps = {
    vida: [1, 2, 3, 4, 6],
    trabajo: [7, 8, 9],
    ciudad: [5, 12, 13, 14, 15],
    ocio: [10, 11, 16, 17, 18, 19]
  };

  // Filtered steps
  const filteredSteps = steps.filter(step => {
    if (selectedTheme !== 'all') {
      const allowed = themeSteps[selectedTheme] || [];
      if (!allowed.includes(step.step)) return false;
    }
    if (selectedLevel !== 'all' && !(step.level || '').includes(selectedLevel)) return false;
    if (selectedStatus === 'completed' && !userState?.completedSteps?.[step.step]) return false;
    if (selectedStatus === 'pending' && !!userState?.completedSteps?.[step.step]) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (step.title || '').toLowerCase().includes(q);
      const matchSubtitle = (step.subtitle || '').toLowerCase().includes(q);
      const matchGuide = (step.detailed_guide || '').toLowerCase().includes(q);
      const matchGrammar = (step.grammar_focus || []).some(g => g.toLowerCase().includes(q));
      const matchVocab = (step.included_vocab || []).some(v => v.toLowerCase().includes(q));
      const matchCanDos = (step.can_dos || []).some(cd => (cd.task || '').toLowerCase().includes(q) || (cd.sample || '').toLowerCase().includes(q));
      if (!matchTitle && !matchSubtitle && !matchGuide && !matchGrammar && !matchVocab && !matchCanDos) return false;
    }
    return true;
  });

  const handleOpenModule = (stepNum) => {
    setSelectedStepNum(stepNum);
    const saved = userState?.moduleProgress?.[stepNum]?.currentSubStep;
    setActiveSubStep(typeof saved === 'number' && saved >= 1 ? saved : 1);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/curriculum?step=${stepNum}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (onStepChange) onStepChange(stepNum);
    setQuizAnswers({});
    setQuizFeedback({});
  };

  const handleCloseModule = () => {
    setSelectedStepNum(null);
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('step=')) {
        window.history.pushState(null, '', '/curriculum');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (onStepChange) onStepChange(null);
  };

  const handlePlayAudio = (text, desc = '') => {
    audioManager.speak(text, desc);
  };

  const handleSelectOption = (exercise, option) => {
    const isCorrect = option === exercise.correct;
    setQuizAnswers(prev => ({ ...prev, [exercise.id]: option }));
    setQuizFeedback(prev => ({
      ...prev,
      [exercise.id]: {
        isCorrect,
        explanation: exercise.explanation
      }
    }));

    if (isCorrect && userState && onUpdateState) {
      // Award XP once and record exercise completion
      const alreadyDone = !!userState.completedExercises?.[exercise.id];
      const updatedExercises = {
        ...(userState.completedExercises || {}),
        [exercise.id]: true
      };
      onUpdateState({
        ...userState,
        completedExercises: updatedExercises,
        xp: (userState.xp || 0) + (!alreadyDone ? 5 : 0)
      });
    }
  };

  const handleSelectSubStep = (substepNum) => {
    setActiveSubStep(substepNum);
    if (onUpdateState && userState && selectedStepNum) {
      onUpdateState({
        ...userState,
        moduleProgress: {
          ...(userState.moduleProgress || {}),
          [selectedStepNum]: {
            ...(userState.moduleProgress?.[selectedStepNum] || {}),
            currentSubStep: substepNum
          }
        }
      });
    }
    if (typeof window !== 'undefined') {
      const el = document.getElementById('step-content-area');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleSubStepCompleted = (stepNum, substepNum) => {
    if (!onUpdateState || !userState) return;
    const key = `${stepNum}_${substepNum}`;
    const isDone = !!userState.completedSubSteps?.[key];
    const updatedSubSteps = {
      ...(userState.completedSubSteps || {}),
      [key]: !isDone
    };

    const targetStep = steps.find(s => s.step === stepNum);
    const stepSections = targetStep?.sections || [];
    const allDone = stepSections.length > 0 && stepSections.every(s =>
      s.substep === substepNum ? !isDone : !!updatedSubSteps[`${stepNum}_${s.substep}`]
    );

    const updatedSteps = {
      ...(userState.completedSteps || {}),
      ...(allDone ? { [stepNum]: true } : {})
    };

    onUpdateState({
      ...userState,
      completedSubSteps: updatedSubSteps,
      completedSteps: updatedSteps,
      xp: (userState.xp || 0) + (!isDone ? 15 : 0) + (allDone && !userState.completedSteps?.[stepNum] ? 25 : 0)
    });
  };

  const toggleStepCompleted = (stepNum) => {
    if (!onUpdateState || !userState) return;
    const currentCompleted = userState.completedSteps || {};
    const isDone = !!currentCompleted[stepNum];
    const updated = {
      ...currentCompleted,
      [stepNum]: !isDone
    };

    const targetStep = steps.find(s => s.step === stepNum);
    let updatedSubSteps = { ...(userState.completedSubSteps || {}) };
    if (!isDone && targetStep?.sections) {
      targetStep.sections.forEach(s => {
        updatedSubSteps[`${stepNum}_${s.substep}`] = true;
      });
    }

    onUpdateState({
      ...userState,
      completedSteps: updated,
      completedSubSteps: updatedSubSteps,
      xp: (userState.xp || 0) + (!isDone ? 25 : 0)
    });
  };

  const toggleCanDoCompleted = (canDoId) => {
    if (!onUpdateState || !userState) return;
    const currentCanDos = userState.completedCanDos || {};
    const isDone = !!currentCanDos[canDoId];
    const updated = {
      ...currentCanDos,
      [canDoId]: !isDone
    };
    onUpdateState({
      ...userState,
      completedCanDos: updated,
      xp: (userState.xp || 0) + (!isDone ? 10 : 0)
    });
  };

  // If a specific module is selected, render the deep interactive view
  if (selectedStep) {
    const isDone = userState?.completedSteps?.[selectedStep.step];

    return (
      <div className="curriculum-detail-view animate-fade-in">
        {/* Navigation & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleCloseModule}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ArrowLeft size={16} />
              <span>Volver a la Ruta</span>
            </button>

            <button
              type="button"
              className="tour-info-shortcut-btn"
              onClick={() => {
                if (contextApp?.openTour) {
                  contextApp.openTour('curriculum');
                } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
                  window.__nihongoOpenTour('curriculum');
                }
              }}
              title="Ver guía y explicación del Currículum en el tour"
              aria-label="Guía de la Ruta"
            >
              <Info size={14} />
              <span>Guía</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className={`btn ${isDone ? 'btn-outline' : 'btn-success'} btn-sm`}
              onClick={() => toggleStepCompleted(selectedStep.step)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <CheckCircle2 size={16} color={isDone ? 'var(--success)' : '#fff'} />
              <span>{isDone ? 'Módulo Completado ✓' : 'Marcar como Completado (+25 XP)'}</span>
            </button>
          </div>
        </div>

        {/* Hero Card of the Module */}
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.04) 100%)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ 
              fontSize: '2.5rem', 
              width: 68, 
              height: 68, 
              background: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0
            }}>
              {selectedStep.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <span className="step-target-tag">{selectedStep.stage}</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  padding: '2px 8px', 
                  borderRadius: 4, 
                  background: 'rgba(99, 102, 241, 0.12)', 
                  color: 'var(--primary)' 
                }}>
                  {selectedStep.level}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Módulo {selectedStep.step} de {steps.length}
                </span>
                {selectedStep.sourcePdf && (
                  <span style={{ fontSize: '0.78rem', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--primary)' }}>
                    📄 Extraído de: {selectedStep.sourcePdf}
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>
                {selectedStep.title}
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                {selectedStep.subtitle}
              </p>

              {/* Detailed Guide Narrative */}
              <div style={{ 
                background: 'var(--bg-surface)', 
                padding: '16px 20px', 
                borderRadius: 'var(--radius-md)', 
                borderLeft: '4px solid var(--primary)',
                fontSize: '0.98rem',
                lineHeight: 1.7,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <p><strong>📖 Guía Explicativa del Módulo:</strong></p>
                <p style={{ marginTop: 6 }}>{selectedStep.detailed_guide}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sectioned Steps Architecture */}
        {selectedStep.sections && selectedStep.sections.length > 0 ? (() => {
          const sections = selectedStep.sections;
          const completedSubStepsCount = sections.filter(s => !!userState?.completedSubSteps?.[`${selectedStep.step}_${s.substep}`]).length;
          const subStepsPercent = Math.round((completedSubStepsCount / sections.length) * 100);
          const currentSection = sections.find(s => s.substep === activeSubStep) || sections[0];
          const isSubStepDone = !!userState?.completedSubSteps?.[`${selectedStep.step}_${currentSection.substep}`];

          return (
            <div>
              {/* Stepper Navigation Bar if multiple steps */}
              {sections.length > 1 ? (
                <div className="curriculum-stepper-container">
                  <div className="curriculum-stepper-header">
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>
                        Ruta de Aprendizaje por Pasos
                      </span>
                      <h3 style={{ fontSize: '1.18rem', fontWeight: 800, margin: '2px 0 0' }}>
                        Paso {currentSection.substep} de {sections.length}: {currentSection.title}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        background: completedSubStepsCount === sections.length ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.12)',
                        color: completedSubStepsCount === sections.length ? 'var(--success)' : 'var(--primary)',
                        border: `1px solid ${completedSubStepsCount === sections.length ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.25)'}`
                      }}>
                        {completedSubStepsCount} / {sections.length} pasos completados ({subStepsPercent}%)
                      </span>
                    </div>
                  </div>

                  {/* Stepper Progress Bar */}
                  <div style={{ width: '100%', height: 6, background: 'var(--bg-main)', borderRadius: 10, overflow: 'hidden', marginBottom: 14, border: '1px solid var(--border)' }}>
                    <div style={{
                      height: '100%',
                      width: `${subStepsPercent}%`,
                      background: completedSubStepsCount === sections.length ? 'var(--success)' : 'linear-gradient(90deg, var(--primary), var(--accent))',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>

                  {/* Stepper Step Tabs */}
                  <div className="curriculum-stepper-tabs">
                    {sections.map((sec) => {
                      const secDone = !!userState?.completedSubSteps?.[`${selectedStep.step}_${sec.substep}`];
                      const isActive = sec.substep === currentSection.substep;

                      return (
                        <button
                          key={sec.substep}
                          type="button"
                          onClick={() => handleSelectSubStep(sec.substep)}
                          className={`curriculum-step-tab ${isActive ? 'active' : ''} ${secDone ? 'completed' : ''}`}
                          title={`Ir al Paso ${sec.substep}: ${sec.title}`}
                        >
                          <div className="step-tab-number">
                            {secDone ? <Check size={16} strokeWidth={3} /> : sec.substep}
                          </div>
                          <div className="step-tab-info">
                            <span className="step-tab-label">
                              Paso {sec.substep} {secDone ? '· Dominado ✓' : ''}
                            </span>
                            <div className="step-tab-title">
                              {sec.title}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="curriculum-stepper-container" style={{ padding: '14px 18px', background: 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.25rem' }}>🎯</span>
                      <div>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
                          Módulo de Tema Enfocado (1 Paso)
                        </span>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                          {currentSection.title}
                        </h3>
                      </div>
                    </div>
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: isSubStepDone || isDone ? 'rgba(16, 185, 129, 0.15)' : 'var(--primary-bg)',
                        color: isSubStepDone || isDone ? 'var(--success)' : 'var(--primary)'
                      }}>
                        {isSubStepDone || isDone ? 'Paso Dominado ✓' : 'Paso en Curso'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Content Area */}
              <div id="step-content-area">
                {/* 1. Objetivo de este Paso */}
                <div className="card" style={{ marginBottom: 20, background: 'var(--bg-surface)', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Target size={22} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: 2 }}>
                        Objetivo del Paso {currentSection.substep}
                      </div>
                      <p style={{ fontSize: '1.02rem', fontWeight: 600, color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
                        {currentSection.objective}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Puntos Clave de Gramática con Explicación Profunda, Fórmulas y Notas */}
                <div className="card" style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1.22rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={20} color="var(--accent)" />
                      <span>Puntos Clave de Gramática (Paso {currentSection.substep})</span>
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Estructuras explicadas con fundamentos teóricos y fórmulas extraídas de los manuales de referencia.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {currentSection.grammar_points?.map((gp, gpIdx) => (
                      <div key={gpIdx} className="grammar-deep-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ 
                            fontSize: '0.76rem', 
                            fontWeight: 800, 
                            padding: '2px 8px', 
                            background: 'var(--primary-bg)', 
                            color: 'var(--primary)', 
                            borderRadius: 4 
                          }}>
                            {currentSection.substep}.{gpIdx + 1}
                          </span>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                            {gp.title}
                          </h4>
                        </div>

                        {/* Formula box */}
                        {gp.formula && (
                          <div className="grammar-formula-box">
                            <span className="grammar-formula-badge">⚡ Fórmula</span>
                            <span className="grammar-formula-text">{gp.formula}</span>
                          </div>
                        )}

                        {/* Theoretical Deep Explanation */}
                        <p style={{ fontSize: '0.94rem', lineHeight: 1.65, color: 'var(--text-main)', margin: '10px 0' }}>
                          {gp.explanation}
                        </p>

                        {/* Cultural / Usage Notes */}
                        {gp.usage_notes && (
                          <div className="grammar-notes-box">
                            💡 <strong>Notas de uso y contexto:</strong> {gp.usage_notes}
                          </div>
                        )}

                        {/* Examples for this grammar point with audio */}
                        {gp.examples && gp.examples.length > 0 && (
                          <div className="grammar-examples-list">
                            <div style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                              Ejemplos con Audio:
                            </div>
                            {gp.examples.map((ex, exI) => (
                              <div key={exI} className="grammar-example-row">
                                <div>
                                  <div className="jp-text" style={{ fontSize: '1.06rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    {ex.jp}
                                  </div>
                                  <div className="jp-text" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {ex.kana}
                                  </div>
                                  <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: 2, fontWeight: 500 }}>
                                    🇪🇸 {ex.es}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                                  onClick={() => handlePlayAudio(ex.jp, ex.es)}
                                  title="Escuchar pronunciación"
                                >
                                  <Volume2 size={15} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Competencias Can-Do del Paso */}
                {currentSection.can_dos && currentSection.can_dos.length > 0 && (
                  <div className="card cando-section" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>🎯</span>
                          <span>Competencias Can-Do de este Paso</span>
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          Valida las competencias comunicativas prácticas que dominas en este paso (+10 XP cada una).
                        </p>
                      </div>
                    </div>

                    <div className="cando-grid">
                      {currentSection.can_dos.map((cd, idx) => {
                        const isCanDoDone = !!userState?.completedCanDos?.[cd.id];
                        return (
                          <div key={idx} className={`cando-card ${isCanDoDone ? 'completed-cando' : ''}`}>
                            <div className="cando-card-header">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className={`cando-badge ${isCanDoDone ? 'badge-completed' : ''}`}>
                                  <Target size={13} />
                                  {cd.id}
                                </span>
                                <span className="cando-tag">Irodori / MCER</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleCanDoCompleted(cd.id)}
                                className={`cando-check-btn ${isCanDoDone ? 'checked' : ''}`}
                                title={isCanDoDone ? 'Desmarcar competencia' : 'Validar competencia como dominada (+10 XP)'}
                              >
                                <div className={`cando-checkbox-square ${isCanDoDone ? 'checked' : ''}`}>
                                  {isCanDoDone && <Check size={12} strokeWidth={3} />}
                                </div>
                                <span>{isCanDoDone ? 'Dominada ✓' : 'Autoevaluar'}</span>
                              </button>
                            </div>

                            <h4 className="cando-task">{cd.task}</h4>

                            {cd.sample && (
                              <div className="cando-expression-box">
                                <div className="cando-expression-content">
                                  <span className="cando-expression-label">💬 Frase clave</span>
                                  <div className="cando-expression-text jp-text">{cd.sample}</div>
                                </div>
                                <button 
                                  type="button"
                                  className="cando-audio-btn" 
                                  onClick={() => handlePlayAudio(cd.sample.replace(/\//g, '、'))}
                                  title="Escuchar pronunciación"
                                >
                                  <Volume2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Vocabulario Esencial del Paso */}
                {(currentSection.vocab || currentSection.vocabulary) && (currentSection.vocab || currentSection.vocabulary).length > 0 && (() => {
                  const stepVocabList = currentSection.vocab || currentSection.vocabulary;
                  return (
                    <div className="card" style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <h3 style={{ fontSize: '1.22rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BookOpen size={20} color="var(--primary)" />
                            <span>Vocabulario del Paso {currentSection.substep}</span>
                          </h3>
                          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            Haz clic en el altavoz o en la palabra para escucharla o buscarla en el diccionario.
                          </p>
                        </div>

                        <button 
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            const playlist = stepVocabList.map(v => ({ text: v.kanji, desc: `${v.kana} - ${v.meaning}` }));
                            audioManager.setPlaylist(playlist, 0);
                          }}
                        >
                          <Volume2 size={16} />
                          <span>Reproducir Vocabulario del Paso</span>
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                        {stepVocabList.map((v, idx) => (
                          <div 
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 14px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--bg-main)',
                              border: '1px solid var(--border)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onClick={() => handlePlayAudio(v.kanji, `${v.kana} (${v.meaning})`)}
                            title="Click para escuchar pronunciación"
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                <span className="jp-text" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                  {v.kanji}
                                </span>
                                <span className="jp-text" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                                  {v.kana}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: 2, fontWeight: 500 }}>
                                {v.meaning}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: 2 }}>
                                {v.type}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {contextApp?.openDictionary && (
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '6px', borderRadius: '50%', flexShrink: 0 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    contextApp.openDictionary(v.kanji);
                                  }}
                                  title="Buscar en diccionario"
                                >
                                  <Search size={14} />
                                </button>
                              )}
                              <button 
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ padding: '6px', borderRadius: '50%', flexShrink: 0 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayAudio(v.kanji, `${v.kana} (${v.meaning})`);
                                }}
                                title="Escuchar audio"
                              >
                                <Volume2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 5. Ejemplos Reales en Contexto del Paso */}
                {currentSection.examples && currentSection.examples.length > 0 && (
                  <div className="card" style={{ marginBottom: 24 }}>
                    <div style={{ marginBottom: 16 }}>
                      <h3 style={{ fontSize: '1.22rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>💬</span>
                        <span>Ejemplos Reales en Contexto (Paso {currentSection.substep})</span>
                      </h3>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Diálogos y frases contextuales para interiorizar los patrones aprendidos en este paso.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {currentSection.examples.map((ex, i) => (
                        <div 
                          key={i} 
                          style={{ 
                            padding: 16, 
                            borderRadius: 'var(--radius-md)', 
                            background: 'var(--bg-surface)', 
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                            <div>
                              <div className="jp-text" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>
                                {ex.jp}
                              </div>
                              <div className="jp-text" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                {ex.kana} {ex.romaji ? `· ${ex.romaji}` : ''}
                              </div>
                              <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                                🇪🇸 {ex.es}
                              </div>
                            </div>

                            <button 
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => handlePlayAudio(ex.jp, ex.es)}
                              title="Escuchar oración completa"
                              style={{ flexShrink: 0 }}
                            >
                              <Volume2 size={16} />
                              <span>Audio</span>
                            </button>
                          </div>

                          {ex.explanation && (
                            <div style={{ 
                              fontSize: '0.86rem', 
                              background: 'var(--bg-main)', 
                              padding: '8px 12px', 
                              borderRadius: 'var(--radius-sm)', 
                              color: 'var(--text-muted)',
                              borderLeft: '3px solid var(--accent)'
                            }}>
                              💡 <strong>Análisis:</strong> {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Barra de Acción y Avance del Paso */}
                <div className="step-action-bar">
                  <button 
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={activeSubStep <= 1}
                    onClick={() => handleSelectSubStep(activeSubStep - 1)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: activeSubStep <= 1 ? 0.4 : 1 }}
                  >
                    <ArrowLeft size={16} />
                    <span>Paso Anterior</span>
                  </button>

                  <button
                    type="button"
                    className={`btn ${isSubStepDone ? 'btn-outline' : 'btn-success'}`}
                    onClick={() => toggleSubStepCompleted(selectedStep.step, currentSection.substep)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}
                  >
                    <CheckCircle2 size={18} color={isSubStepDone ? 'var(--success)' : '#fff'} />
                    <span>{isSubStepDone ? `Paso ${currentSection.substep} Completado ✓` : `Completar Paso ${currentSection.substep} (+15 XP)`}</span>
                  </button>

                  {activeSubStep < sections.length ? (
                    <button 
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSelectSubStep(activeSubStep + 1)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                    >
                      <span>Siguiente Paso (Paso {activeSubStep + 1})</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`btn ${isDone ? 'btn-outline' : 'btn-primary'} btn-sm`}
                      onClick={() => toggleStepCompleted(selectedStep.step)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{isDone ? 'Módulo Completado ✓' : 'Completar Módulo Completo 🏆 (+25 XP)'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })() : (
          /* Fallback layout if sections not present */
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GraduationCap size={20} color="var(--primary)" />
                  <span>Objetivos de Aprendizaje</span>
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedStep.objectives?.map((obj, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.95rem', lineHeight: 1.5 }}>
                      <CheckCircle2 size={16} color="var(--success)" style={{ marginTop: 3, flexShrink: 0 }} />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={20} color="var(--accent)" />
                  <span>Puntos Clave de Gramática</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedStep.grammar_focus?.map((point, i) => {
                    const { title, content } = parseGrammarPoint(point);
                    return (
                      <div 
                        key={i} 
                        style={{ 
                          padding: '10px 14px', 
                          borderRadius: 'var(--radius-sm)', 
                          background: 'var(--primary-bg)', 
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4
                        }}
                      >
                        {title && (
                          <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)', fontWeight: 700 }}>
                            ⚡ {title}
                          </span>
                        )}
                        <span className="jp-text" style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.45 }}>
                          {!title && '⚡ '}{content}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {selectedStep.can_dos && selectedStep.can_dos.length > 0 && (
              <div className="card cando-section" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 14 }}>🎯 Competencias Can-Do</h3>
                <div className="cando-grid">
                  {selectedStep.can_dos.map((cd, idx) => (
                    <div key={idx} className="cando-card">
                      <div className="cando-card-header">
                        <span className="cando-badge"><Target size={13} /> {cd.id}</span>
                      </div>
                      <h4 className="cando-task">{cd.task}</h4>
                      {cd.sample && <div className="cando-expression-text jp-text">{cd.sample}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Practical Interactive Exercises */}
        {selectedStep.exercises && selectedStep.exercises.length > 0 && (() => {
          const completedExCount = selectedStep.exercises.filter(ex => userState?.completedExercises?.[ex.id]).length;
          const allCompleted = completedExCount === selectedStep.exercises.length;

          return (
            <div id="exercises-section" className="card" style={{ marginBottom: 30 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HelpCircle size={20} color="var(--warning)" />
                    <span>Ejercicios Prácticos del Módulo</span>
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Pon a prueba lo aprendido. Selecciona la opción correcta para ganar puntos de experiencia (+5 XP por acierto).
                  </p>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: allCompleted ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-main)',
                  border: allCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progreso:</span>
                  <span style={{ color: allCompleted ? 'var(--success)' : 'var(--primary)' }}>
                    {completedExCount} / {selectedStep.exercises.length} {allCompleted ? '✓ Completados' : 'superados'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {selectedStep.exercises.map((ex, idx) => {
                  const selected = quizAnswers[ex.id];
                  const feedback = quizFeedback[ex.id];
                  const isAlreadySolved = !!userState?.completedExercises?.[ex.id];

                  return (
                    <div 
                      key={ex.id || idx}
                      style={{
                        padding: 18,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-main)',
                        border: isAlreadySolved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '2px 8px', background: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: 4 }}>
                            Pregunta {idx + 1}
                          </span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                            {ex.question}
                          </span>
                        </div>
                        {isAlreadySolved && (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--success)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: 999,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <Check size={12} /> Superado (+5 XP)
                          </span>
                        )}
                      </div>

                    <div className="jp-text" style={{ fontSize: '1.3rem', fontWeight: 700, margin: '10px 0 14px', color: 'var(--text-main)' }}>
                      {ex.sentence}
                    </div>

                    {/* Options Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                      {ex.options.map((opt, optIdx) => {
                        let btnClass = 'btn-outline';
                        if (selected) {
                          if (opt === ex.correct) {
                            btnClass = 'btn-success';
                          } else if (opt === selected) {
                            btnClass = 'btn-danger';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            className={`btn ${btnClass}`}
                            disabled={!!selected}
                            onClick={() => handleSelectOption(ex, opt)}
                            style={{ 
                              fontSize: '1.05rem', 
                              padding: '10px 14px',
                              justifyContent: 'center',
                              fontWeight: 600
                            }}
                          >
                            <span className="jp-text">{opt}</span>
                            {selected && opt === ex.correct && <Check size={16} />}
                            {selected && opt === selected && opt !== ex.correct && <X size={16} />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback message */}
                    {feedback && (
                      <div style={{ 
                        marginTop: 12, 
                        padding: '10px 14px', 
                        borderRadius: 'var(--radius-sm)', 
                        background: feedback.isCorrect ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: feedback.isCorrect ? 'var(--success)' : 'var(--danger)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10
                      }}>
                        <div>
                          <strong>{feedback.isCorrect ? '¡Excelente! Correcto 🎉' : 'Incorrecto.'}</strong> {feedback.explanation}
                        </div>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'var(--bg-surface)' }}
                          onClick={() => {
                            setQuizAnswers(prev => ({ ...prev, [ex.id]: null }));
                            setQuizFeedback(prev => ({ ...prev, [ex.id]: null }));
                          }}
                        >
                          <RotateCcw size={13} />
                          <span>Reintentar</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

        {/* Temas y Módulos Relacionados Section */}
        {selectedStep.related_topics && selectedStep.related_topics.length > 0 && (
          <div className="card" style={{ marginBottom: 28, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.4rem' }}>🔗</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Temas y Módulos Relacionados
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Avanza o refuerza tu aprendizaje explorando los módulos consecutivos, precedentes o temáticamente afines:
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {selectedStep.related_topics.map((rel, rIdx) => (
                <div
                  key={rIdx}
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        padding: '3px 8px', 
                        borderRadius: 4, 
                        background: 'rgba(99, 102, 241, 0.12)', 
                        color: 'var(--primary)' 
                      }}>
                        {rel.relationship || 'Tema Relacionado'}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                        Módulo {rel.step}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '1.3rem' }}>{rel.icon || '📌'}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, lineHeight: 1.3 }}>
                        {rel.title}
                      </h4>
                    </div>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                      {rel.reason}
                    </p>
                  </div>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleOpenModule(rel.step)}
                    style={{ 
                      width: '100%', 
                      justifyContent: 'center', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6,
                      fontWeight: 600,
                      marginTop: 4
                    }}
                  >
                    <span>Ir al Módulo {rel.step}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          {selectedStep.step > 1 ? (
            <button 
              className="btn btn-outline"
              onClick={() => handleOpenModule(selectedStep.step - 1)}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <ArrowLeft size={16} />
              <span>Módulo Anterior (M{selectedStep.step - 1})</span>
            </button>
          ) : <div />}

          <button 
            className="btn btn-primary"
            onClick={() => {
              if (selectedStep.step < steps.length) {
                handleOpenModule(selectedStep.step + 1);
              } else {
                handleCloseModule();
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span>{selectedStep.step < steps.length ? `Siguiente Módulo (M${selectedStep.step + 1})` : 'Volver a la Ruta Principal'}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Overview of all Curriculum Steps
  return (
    <div>
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🗺️</span>
            <span>Ruta de Aprendizaje</span>
          </h2>
          <button
            type="button"
            className="tour-info-shortcut-btn"
            onClick={() => {
              if (contextApp?.openTour) {
                contextApp.openTour('curriculum');
              } else if (typeof window !== 'undefined' && window.__nihongoOpenTour) {
                window.__nihongoOpenTour('curriculum');
              }
            }}
            title="Ver guía y explicación del Currículum en el tour"
            aria-label="Guía de la Ruta"
          >
            <Info size={15} />
            <span>Guía de la Ruta</span>
          </button>
        </div>
      </div>

      {/* Overall Progress Banner */}
      {(() => {
        const totalModules = steps.length;
        const completedModulesCount = steps.filter(s => userState?.completedSteps?.[s.step]).length;
        const modulePercent = totalModules > 0 ? Math.round((completedModulesCount / totalModules) * 100) : 0;

        const allCanDos = steps.flatMap(s => s.can_dos || []);
        const totalCanDos = allCanDos.length;
        const completedCanDosCount = allCanDos.filter(cd => userState?.completedCanDos?.[cd.id]).length;
        const canDoPercent = totalCanDos > 0 ? Math.round((completedCanDosCount / totalCanDos) * 100) : 0;

        return (
          <div className="card ruta-progress-banner" style={{ marginBottom: 24, padding: '16px 20px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.07) 0%, rgba(236, 72, 153, 0.07) 100%)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <span>📊</span> Progreso de Ruta y Competencias Can-Do
                </h3>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Ruta Consolidada</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {completedModulesCount}/{totalModules} ({modulePercent}%)
                  </div>
                </div>

                <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Can-Dos Validadas</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ec4899' }}>
                    {completedCanDosCount}/{totalCanDos} ({canDoPercent}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Dual visual progress bars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>🗺️ Módulos de la Ruta</span>
                  <span>{modulePercent}% completado</span>
                </div>
                <div style={{ width: '100%', height: 7, background: 'var(--bg-main)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ height: '100%', width: `${modulePercent}%`, background: 'var(--primary)', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>🎯 Competencias Can-Do</span>
                  <span>{canDoPercent}% dominado</span>
                </div>
                <div style={{ width: '100%', height: 7, background: 'var(--bg-main)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ height: '100%', width: `${canDoPercent}%`, background: 'linear-gradient(90deg, #ec4899, #f43f5e)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Theme & Level Filter Controls */}
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Desktop Theme Pills */}
        <div className="curriculum-theme-desktop">
          {themesList.map(t => (
            <button
              key={t.id}
              className={`btn btn-sm ${selectedTheme === t.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedTheme(t.id)}
              style={{ fontWeight: 600, padding: '7px 14px' }}
            >
              {t.icon} {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Mobile Theme Dropdown (Solo para Celular) */}
        <div className="curriculum-theme-mobile" ref={themeDropdownRef}>
          {(() => {
            const activeThemeObj = themesList.find(t => t.id === selectedTheme) || themesList[0];

            return (
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-primary theme-dropdown-trigger"
                  onClick={() => setIsThemeDropdownOpen(prev => !prev)}
                  aria-haspopup="true"
                  aria-expanded={isThemeDropdownOpen}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{activeThemeObj.icon}</span>
                    <span>{activeThemeObj.label} ({activeThemeObj.count})</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    style={{ 
                      transform: isThemeDropdownOpen ? 'rotate(180deg)' : 'none', 
                      transition: 'transform 0.2s ease',
                      flexShrink: 0
                    }} 
                  />
                </button>

                {isThemeDropdownOpen && (
                  <div className="theme-dropdown-menu">
                    {themesList.map(t => {
                      const isSelected = selectedTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'} theme-dropdown-item`}
                          onClick={() => {
                            setSelectedTheme(t.id);
                            setIsThemeDropdownOpen(false);
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{t.icon}</span>
                            <span>{t.label} ({t.count})</span>
                          </div>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Secondary filters: Level, Status and Search */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nivel:</span>
              {['all', 'N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
                <button
                  key={lvl}
                  className={`btn btn-sm ${selectedLevel === lvl ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedLevel(lvl)}
                  style={{ fontSize: '0.8rem', padding: '4px 10px', height: 'auto' }}
                >
                  {lvl === 'all' ? 'Todos' : lvl}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado:</span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'pending', label: 'Pendientes' },
                { id: 'completed', label: 'Completados' }
              ].map(st => (
                <button
                  key={st.id}
                  className={`btn btn-sm ${selectedStatus === st.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedStatus(st.id)}
                  style={{ fontSize: '0.8rem', padding: '4px 10px', height: 'auto' }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', minWidth: 260, flex: '1 1 260px', maxWidth: 380 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar tema, kanji, gramática o Can-Do..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 32px 7px 36px',
                fontSize: '0.85rem',
                minWidth: 'unset',
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="clear-search-btn"
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alert Banner for Reviewed Modules with Pending Exercises */}
      {reviewedStepsWithPendingExercises.length > 0 && (
        <div style={{
          marginBottom: 20,
          padding: '14px 18px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 240, flex: 1 }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-main)' }}>
                {reviewedStepsWithPendingExercises.length} {reviewedStepsWithPendingExercises.length === 1 ? 'módulo revisado tiene' : 'módulos revisados tienen'} ejercicios prácticos pendientes
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Has completado la teoría o Can-Dos de estos temas pero aún tienes preguntas para poner a prueba tu dominio.
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-primary"
            style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => {
              const target = reviewedStepsWithPendingExercises[0];
              if (target) {
                setSelectedStepNum(target.step);
                if (onStepChange) onStepChange(target.step);
                setTimeout(() => {
                  const exEl = document.getElementById('exercises-section');
                  if (exEl) exEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
              }
            }}
          >
            <span>Resolver Módulo {reviewedStepsWithPendingExercises[0]?.step}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      <div className="curriculum-list">
        {filteredSteps.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 12 }}>No se encontraron módulos con los filtros seleccionados.</p>
            <button className="btn btn-outline btn-sm" onClick={() => { setSelectedTheme('all'); setSelectedLevel('all'); setSelectedStatus('all'); setSearchQuery(''); }}>
              Restablecer filtros
            </button>
          </div>
        ) : (
          filteredSteps.map((step) => {
            const isDone = userState?.completedSteps?.[step.step];

            return (
              <div key={step.step} className={`curriculum-step-card ${isDone ? 'completed' : ''}`}>
                {/* Header Row: Badge + Titles + Actions */}
                <div className="step-card-header">
                  <div className="step-number-badge">
                    <span>{step.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                      M{step.step}
                    </span>
                  </div>

                  <div className="step-header-content">
                    <div className="step-header-main">
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
                        <span className="step-target-tag">{step.stage}</span>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 700, 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          background: 'rgba(99, 102, 241, 0.12)', 
                          color: 'var(--primary)' 
                        }}>
                          {step.level}
                        </span>
                        {step.sections && step.sections.length > 0 && (() => {
                          const totalSub = step.sections.length;
                          const completedSub = step.sections.filter(s => !!userState?.completedSubSteps?.[`${step.step}_${s.substep}`]).length;
                          const currentSub = userState?.moduleProgress?.[step.step]?.currentSubStep || 1;
                          const isMulti = totalSub > 1;

                          return (
                            <span style={{ 
                              fontSize: '0.72rem', 
                              fontWeight: 700, 
                              padding: '2px 8px', 
                              borderRadius: 4, 
                              background: completedSub === totalSub ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.12)', 
                              color: completedSub === totalSub ? 'var(--success)' : 'var(--primary)',
                              border: completedSub === totalSub ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.2)'
                            }}>
                              📑 {isMulti ? `${completedSub}/${totalSub} pasos (En Paso ${currentSub})` : '1 Paso Enfocado'}
                            </span>
                          );
                        })()}
                        {step.can_dos && step.can_dos.length > 0 && (() => {
                          const mTotal = step.can_dos.length;
                          const mDone = step.can_dos.filter(cd => userState?.completedCanDos?.[cd.id]).length;
                          const isAllDone = mDone === mTotal;

                          return (
                            <span style={{ 
                              fontSize: '0.72rem', 
                              fontWeight: 700, 
                              padding: '2px 8px', 
                              borderRadius: 4, 
                              background: isAllDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(236, 72, 153, 0.12)', 
                              color: isAllDone ? 'var(--success)' : '#db2777',
                              border: isAllDone ? '1px solid rgba(16, 185, 129, 0.3)' : 'none'
                            }}>
                              🎯 {mDone}/{mTotal} Can-Dos {isAllDone ? '✓' : ''}
                            </span>
                          );
                        })()}
                        {step.related_topics && step.related_topics.length > 0 && (
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 600, 
                            padding: '2px 8px', 
                            borderRadius: 4, 
                            background: 'var(--bg-surface)', 
                            border: '1px solid var(--border)', 
                            color: 'var(--text-muted)' 
                          }}>
                            🔗 {step.related_topics.length} temas relacionados
                          </span>
                        )}
                      </div>
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-subtitle">{step.subtitle}</p>
                    </div>

                    <div className="step-card-actions">
                      {/* Direct Checkbox to Mark Module as Completed */}
                      <button 
                        type="button"
                        className={`step-card-check-btn ${isDone ? 'checked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStepCompleted(step.step);
                        }}
                        title={isDone ? 'Módulo completado (Clic para desmarcar)' : 'Marcar módulo como completado (+25 XP)'}
                      >
                        <div className={`step-checkbox-square ${isDone ? 'checked' : ''}`}>
                          {isDone ? <Check size={12} strokeWidth={3} /> : null}
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                          {isDone ? 'Completado ✓' : 'Marcar'}
                        </span>
                      </button>

                      {/* Primary action: Open deep module view */}
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenModule(step.step)}
                        title="Ver guía completa, ejercicios, vocabulario con audio y temas relacionados"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <span>Ir al Módulo</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body: Full Width, Aligned to the Left */}
                <div className="step-card-body">
                  <ul className="step-objectives">
                    {step.objectives?.slice(0, 3).map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>

                  <div className="step-card-details">
                    {/* Collapsible Grammar Points */}
                    {step.grammar_focus && step.grammar_focus.length > 0 && (() => {
                      const isGrammarOpen = !!openSections[`${step.step}_grammar`];
                      const uniqueGrammar = Array.from(new Set(step.grammar_focus));

                      return (
                        <div className="step-collapsible-group">
                          <button
                            type="button"
                            className={`step-collapsible-trigger ${isGrammarOpen ? 'open' : ''}`}
                            onClick={() => toggleSection(step.step, 'grammar')}
                            aria-expanded={isGrammarOpen}
                          >
                            <div className="step-collapsible-title">
                              <Sparkles size={14} color="var(--accent)" />
                              <span>Puntos Gramaticales ({uniqueGrammar.length})</span>
                            </div>
                            <div className="step-collapsible-status">
                              <span>{isGrammarOpen ? 'Ocultar' : 'Ver puntos'}</span>
                              <ChevronDown size={14} className={`collapsible-chevron ${isGrammarOpen ? 'rotate' : ''}`} />
                            </div>
                          </button>

                          {isGrammarOpen && (
                            <div className="curriculum-grammar-grid">
                              {uniqueGrammar.map((point, idx) => {
                                const { title, content } = parseGrammarPoint(point);
                                return (
                                  <div key={idx} className="curriculum-grammar-item">
                                    <span className="grammar-item-icon">⚡</span>
                                    <div className="grammar-item-body">
                                      {title && <span className="grammar-item-title">{title}</span>}
                                      <span className="grammar-item-formula jp-text">{content}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Collapsible Vocabulary */}
                    {step.included_vocab && step.included_vocab.length > 0 && (() => {
                      const isVocabOpen = !!openSections[`${step.step}_vocab`];

                      return (
                        <div className="step-collapsible-group">
                          <button
                            type="button"
                            className={`step-collapsible-trigger ${isVocabOpen ? 'open' : ''}`}
                            onClick={() => toggleSection(step.step, 'vocab')}
                            aria-expanded={isVocabOpen}
                          >
                            <div className="step-collapsible-title">
                              <BookOpen size={14} color="var(--primary)" />
                              <span>Vocabulario Integrado ({step.included_vocab.length} palabras)</span>
                            </div>
                            <div className="step-collapsible-status">
                              <span>{isVocabOpen ? 'Ocultar' : 'Ver palabras'}</span>
                              <ChevronDown size={14} className={`collapsible-chevron ${isVocabOpen ? 'rotate' : ''}`} />
                            </div>
                          </button>

                          {isVocabOpen && (
                            <div className="step-vocab-container">
                              <div className="step-chips">
                                {step.included_vocab.map((w, idx) => (
                                  <span 
                                    key={idx} 
                                    className="step-chip jp-text"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handlePlayAudio(w)}
                                    title="Click para escuchar pronunciación"
                                  >
                                    {w}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
          );
        }))}
      </div>
    </div>
  );
}
