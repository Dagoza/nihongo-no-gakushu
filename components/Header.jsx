'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Flame, 
  Star, 
  CheckCircle, 
  BookOpen, 
  Moon, 
  Sun, 
  Keyboard, 
  CloudCheck, 
  CloudOff, 
  CloudSync,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  RefreshCw,
  Mail,
  ShieldCheck,
  Bell,
  AlertCircle,
  ArrowRight,
  X,
  Sparkles,
  PenTool
} from 'lucide-react';
import { dataStore } from '../lib/data';
import { useApp } from '../lib/AppContext';

function GoogleLogo({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.685-5.17 3.685-9.09z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.31 21.36 7.39 24 12 24z"/>
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.31 2.64 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
    </svg>
  );
}

export default function Header({ 
  stats, 
  theme, 
  onToggleTheme, 
  onNavigate, 
  syncStatus = 'unconfigured', 
  syncInfo = '', 
  authUser = null, 
  onOpenAuth = null, 
  onSignOut = null, 
  onTriggerSync = null, 
  userState = null 
}) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  let contextApp = null;
  try {
    contextApp = useApp();
  } catch (e) {}

  // Close dropdowns on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsNotifOpen(false);
      }
    }
    if (isDropdownOpen || isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen, isNotifOpen]);

  // Compute reviewed topics that have pending exercises
  const reviewedTopicsWithPendingExercises = useMemo(() => {
    if (!userState) return [];
    const curriculum = dataStore.curriculum || [];
    const completedSteps = userState.completedSteps || {};
    const completedCanDos = userState.completedCanDos || {};
    const completedExercises = userState.completedExercises || {};

    const results = [];

    // 1. Revisar los módulos curriculares revisados/tocados con ejercicios pendientes
    curriculum.forEach(step => {
      const isStepMarked = !!completedSteps[step.step];
      const hasAnyCanDo = (step.can_do || []).some(cd => !!completedCanDos[cd.id]);
      const isReviewed = isStepMarked || hasAnyCanDo;

      const stepExercises = step.exercises || [];
      if (stepExercises.length === 0) return;

      const pendingExercises = stepExercises.filter(ex => !completedExercises[ex.id]);

      if (isReviewed && pendingExercises.length > 0) {
        results.push({
          type: 'curriculum',
          id: step.step,
          title: step.title,
          level: step.level,
          totalExercises: stepExercises.length,
          pendingExercises: pendingExercises.length,
          completedExercises: stepExercises.length - pendingExercises.length,
          isStepMarked
        });
      }
    });

    // 2. Revisar Lecciones NHK completadas con ejercicios pendientes
    const nhkLessons = dataStore.nhkLessons || [];
    const convExercises = dataStore.conversationExercises || [];
    const completedConversations = userState.completedConversations || {};

    nhkLessons.forEach(l => {
      const isLessonCompleted = !!completedConversations[l.lesson];
      if (!isLessonCompleted) return;

      const lessonExs = convExercises.filter(ex => ex.lesson === l.lesson);
      if (lessonExs.length === 0) return;

      const pendingLessonExs = lessonExs.filter(ex => !completedExercises[ex.id]);
      if (pendingLessonExs.length > 0) {
        results.push({
          type: 'nhk',
          id: l.lesson,
          title: `Lección ${l.lesson}: ${l.title_es || l.title_jp}`,
          level: 'N5',
          totalExercises: lessonExs.length,
          pendingExercises: pendingLessonExs.length,
          completedExercises: lessonExs.length - pendingLessonExs.length,
          isStepMarked: true
        });
      }
    });

    return results;
  }, [userState]);

  const pendingTopicsCount = reviewedTopicsWithPendingExercises.length;
  const totalPendingQuestions = reviewedTopicsWithPendingExercises.reduce((acc, item) => acc + item.pendingExercises, 0);

  const displayName = authUser?.name || authUser?.email?.split('@')[0] || 'Estudiante';
  const initialLetter = (displayName || 'U')[0].toUpperCase();

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-top-row">
          <div className="brand-wrapper" onClick={() => onNavigate('curriculum')}>
            <div className="brand-logo">日</div>
            <div className="brand-info">
              <div className="brand-title">日本語マスター</div>
              <div className="brand-subtitle">Nihongo Master · Japonés General</div>
            </div>
          </div>
          
          <div className="header-actions-right">
            {/* Notification / Pending Exercises Status Button & Dropdown */}
            <div className="header-notif-wrapper" ref={notifRef}>
              <button
                type="button"
                className={`header-notif-btn ${isNotifOpen ? 'active' : ''}`}
                onClick={() => setIsNotifOpen(prev => !prev)}
                title={pendingTopicsCount > 0 
                  ? `${pendingTopicsCount} temario(s) revisado(s) con ${totalPendingQuestions} ejercicios pendientes. Haz clic para ver y resolver.` 
                  : 'Todo al día: sin ejercicios pendientes en temarios revisados'}
                aria-haspopup="true"
                aria-expanded={isNotifOpen}
              >
                <Bell size={18} />
                {pendingTopicsCount > 0 && (
                  <span className="header-notif-badge">
                    {pendingTopicsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {isNotifOpen && (
                <div className="notif-dropdown-card" role="dialog" aria-label="Temarios revisados con ejercicios pendientes">
                  <div className="notif-dropdown-header">
                    <div className="notif-dropdown-title">
                      <Bell size={16} className="text-amber-500" />
                      <span>Ejercicios Pendientes</span>
                    </div>
                    {pendingTopicsCount > 0 && (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: 'var(--accent, #f59e0b)',
                        borderRadius: 999
                      }}>
                        {totalPendingQuestions} por resolver
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 8px', lineHeight: 1.35 }}>
                    {pendingTopicsCount > 0
                      ? 'Temarios que has revisado pero que aún tienen preguntas prácticas sin completar:'
                      : '¡Excelente! Has resuelto todos los ejercicios de los módulos y lecciones que has revisado.'}
                  </p>

                  <div className="notif-items-list">
                    {pendingTopicsCount === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 6 }}>🎉</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: 4 }}>
                          ¡Práctica al día!
                        </div>
                        <div style={{ fontSize: '0.8rem' }}>
                          No hay ejercicios pendientes en tus temarios revisados.
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                          onClick={() => {
                            setIsNotifOpen(false);
                            onNavigate('curriculum');
                          }}
                        >
                          Ir al Currículum General
                        </button>
                      </div>
                    ) : (
                      reviewedTopicsWithPendingExercises.map((item) => (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="notif-item"
                          onClick={() => {
                            setIsNotifOpen(false);
                            if (item.type === 'curriculum') {
                              onNavigate('curriculum', `${item.id}#exercises`);
                            } else {
                              onNavigate('nhk', item.id);
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: '1rem' }}>
                                {item.type === 'curriculum' ? '🎯' : '🎙️'}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                                {item.type === 'curriculum' ? `Módulo ${item.id}` : `NHK`}
                              </span>
                              <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '1px 6px',
                                background: 'rgba(16, 185, 129, 0.12)',
                                color: 'var(--success, #10b981)',
                                borderRadius: 4
                              }}>
                                ✓ Revisado
                              </span>
                            </div>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'var(--accent, #f59e0b)',
                              whiteSpace: 'nowrap'
                            }}>
                              ⚠️ {item.pendingExercises} pend.
                            </span>
                          </div>

                          <div style={{
                            fontSize: '0.82rem',
                            color: 'var(--text-main)',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.title}
                          </div>

                          {/* Mini Progress Bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{
                                width: `${Math.round((item.completedExercises / item.totalExercises) * 100)}%`,
                                height: '100%',
                                background: 'var(--primary)'
                              }} />
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {item.completedExercises}/{item.totalExercises}
                            </span>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 4,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            marginTop: 2
                          }}>
                            <span>Resolver ejercicios</span>
                            <ArrowRight size={13} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button 
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Mobile Stats Toggle */}
            <button 
              className={`mobile-header-toggle ${!isMinimized ? 'active' : ''}`}
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Mostrar estadísticas de racha y progreso' : 'Ocultar estadísticas'}
              aria-label={isMinimized ? 'Mostrar estadísticas' : 'Ocultar estadísticas'}
              aria-expanded={!isMinimized}
            >
              <Flame size={13} className="text-amber-500" />
              <span>{isMinimized ? 'Stats' : 'Ocultar'}</span>
            </button>

            {/* User Session Profile & Actions */}
            {authUser ? (
              <div className="header-session-wrapper" ref={dropdownRef}>
                <button 
                  type="button"
                  className={`header-session-btn ${isDropdownOpen ? 'active' : ''}`}
                  onClick={() => setIsDropdownOpen(prev => !prev)}
                  title={`Sesión activa: ${displayName} (${authUser.email}). Haz clic para gestionar tu cuenta.`}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <div className="header-avatar-wrap">
                    {authUser.avatar ? (
                      <img 
                        src={authUser.avatar} 
                        alt={displayName} 
                        className="header-avatar-img"
                      />
                    ) : (
                      <div className="header-avatar-fallback">
                        {initialLetter}
                      </div>
                    )}
                    <span 
                      className={`header-sync-dot ${syncStatus === 'synced' ? 'synced' : syncStatus === 'syncing' ? 'syncing' : 'local'}`}
                      title={syncStatus === 'synced' ? 'Nube sincronizada' : syncStatus === 'syncing' ? 'Sincronizando' : 'Local'}
                    />
                  </div>

                  <div className="header-session-text">
                    <span className="header-session-name">{displayName}</span>
                    <span className="header-session-provider">
                      {authUser.provider === 'google' ? (
                        <>
                          <GoogleLogo size={11} />
                          <span>Google</span>
                        </>
                      ) : (
                        <>
                          <Mail size={11} />
                          <span>Correo</span>
                        </>
                      )}
                    </span>
                  </div>

                  <ChevronDown size={14} className={`header-chevron ${isDropdownOpen ? 'rotated' : ''}`} />
                </button>

                {/* Session Card Dropdown */}
                {isDropdownOpen && (
                  <div className="session-dropdown-card" role="menu">
                    {/* Header info */}
                    <div className="session-card-header">
                      {authUser.avatar ? (
                        <img 
                          src={authUser.avatar} 
                          alt={displayName} 
                          className="session-card-avatar"
                        />
                      ) : (
                        <div className="session-card-avatar-fallback">
                          {initialLetter}
                        </div>
                      )}
                      <div className="session-card-info">
                        <div className="session-card-name">{displayName}</div>
                        <div className="session-card-email" title={authUser.email}>{authUser.email}</div>
                        <div className="session-card-badge">
                          {authUser.provider === 'google' ? (
                            <span className="provider-tag google">
                              <GoogleLogo size={12} /> Cuenta de Google
                            </span>
                          ) : (
                            <span className="provider-tag email">
                              <Mail size={12} /> Cuenta de Correo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sync Status Box */}
                    <div className="session-sync-box">
                      <div className="session-sync-header">
                        <div className="session-sync-title">
                          {syncStatus === 'syncing' ? (
                            <CloudSync size={16} className="text-amber-500 animate-spin" />
                          ) : syncStatus === 'synced' ? (
                            <CloudCheck size={16} className="text-emerald-500" />
                          ) : (
                            <CloudOff size={16} className="text-slate-400" />
                          )}
                          <span>
                            {syncStatus === 'synced' ? 'Nube Sincronizada' : syncStatus === 'syncing' ? 'Sincronizando cambios...' : 'Modo Local'}
                          </span>
                        </div>
                        {onTriggerSync && (
                          <button
                            type="button"
                            className="btn-sync-trigger"
                            onClick={() => {
                              onTriggerSync();
                            }}
                            disabled={syncStatus === 'syncing'}
                            title="Sincronizar ahora con la nube"
                          >
                            <RefreshCw size={12} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                            <span>Sync</span>
                          </button>
                        )}
                      </div>
                      {syncInfo && <p className="session-sync-desc">{syncInfo}</p>}
                    </div>

                    {/* Quick Menu Actions */}
                    <div className="session-menu-actions">
                      <button
                        type="button"
                        className="session-action-item"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate('progress');
                        }}
                      >
                        <User size={15} />
                        <span>Mi Progreso & Cuenta</span>
                      </button>
                      {onSignOut && (
                        <button
                          type="button"
                          className="session-action-item danger"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onSignOut();
                          }}
                        >
                          <LogOut size={15} />
                          <span>Cerrar sesión</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                type="button"
                className="header-login-btn"
                onClick={onOpenAuth}
                title="Iniciar sesión para proteger y sincronizar tu progreso en la nube"
              >
                <LogIn size={15} />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>

        <div className={`header-badges ${isMinimized ? 'minimized-mobile' : ''}`}>
          <div className="stat-badge" title="Racha de estudio activa">
            <Flame size={16} className="text-amber-500" />
            <span>{stats.streak}d</span>
          </div>

          <div className="stat-badge" title="Puntos de experiencia y nivel">
            <Star size={16} className="text-indigo-500" />
            <span>Nivel {stats.level} ({stats.xp} XP)</span>
          </div>

          <div className="stat-badge" title="Partículas dominadas">
            <CheckCircle size={16} className="text-emerald-500" />
            <span>{stats.particles}/25 part.</span>
          </div>

          {/* Temarios revisados con ejercicios pendientes */}
          {pendingTopicsCount > 0 && (
            <div 
              className="stat-badge notif-stat-badge" 
              style={{ cursor: 'pointer', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.12)' }}
              onClick={() => setIsNotifOpen(prev => !prev)}
              title={`${pendingTopicsCount} temarios revisados con ${totalPendingQuestions} ejercicios pendientes. Clic para ver lista.`}
            >
              <Bell size={15} style={{ color: 'var(--accent, #f59e0b)' }} />
              <span style={{ color: 'var(--accent, #f59e0b)', fontWeight: 700 }}>
                {pendingTopicsCount} tem. pend.
              </span>
            </div>
          )}

          <div className="stat-badge" title="Palabras aprendidas">
            <BookOpen size={16} className="text-blue-500" />
            <span>{stats.vocab} pal.</span>
          </div>

          <div className="stat-badge hidden-sm" title="Teclado Japonés IME listo">
            <Keyboard size={16} className="text-rose-500" />
            <span>IME 🇯🇵</span>
          </div>

          {/* Acceso sutil a Cuaderno de Trazos */}
          <div 
            className="stat-badge" 
            style={{ 
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onClick={() => {
              if (contextApp?.openPracticePad) {
                contextApp.openPracticePad();
              } else if (typeof window !== 'undefined' && window.__nihongoOpenPracticePad) {
                window.__nihongoOpenPracticePad();
              }
            }}
            title="Cuaderno: práctica libre de caligrafía, kanji y trazos"
          >
            <PenTool size={15} className="text-indigo-500" />
            <span style={{ fontWeight: 600 }}>Cuaderno ✍️</span>
          </div>

          {/* Cloud Sync Status in Badges */}
          <div 
            className="stat-badge" 
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('progress')}
            title={syncInfo || (authUser ? 'Progreso sincronizado en la nube (Haz clic para ver)' : 'Modo local. Inicia sesión para sincronizar')}
          >
            {syncStatus === 'syncing' ? (
              <CloudSync size={16} style={{ color: 'var(--accent, #f59e0b)' }} />
            ) : syncStatus === 'synced' ? (
              <CloudCheck size={16} style={{ color: 'var(--success, #10b981)' }} />
            ) : (
              <CloudOff size={16} style={{ color: 'var(--text-muted, #94a3b8)' }} />
            )}
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
              {syncStatus === 'synced' ? 'Nube' : syncStatus === 'syncing' ? 'Sync...' : 'Local'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
