'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ShieldCheck
} from 'lucide-react';

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
  onTriggerSync = null
}) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const displayName = authUser?.name || authUser?.email?.split('@')[0] || 'Estudiante';
  const initialLetter = (displayName || 'U')[0].toUpperCase();

  return (
    <header className="app-header">
      <div className="header-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
          <div className="brand-wrapper" onClick={() => onNavigate('curriculum')}>
            <div className="brand-logo">日</div>
            <div>
              <div className="brand-title">日本語マスター</div>
              <div className="brand-subtitle">Nihongo Master · Japonés General</div>
            </div>
          </div>
          
          <div className="header-actions-right">
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
              className="mobile-header-toggle"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Mostrar estadísticas' : 'Ocultar estadísticas'}
            >
              {isMinimized ? <span style={{fontSize:'0.75rem', fontWeight:'bold'}}>Stats</span> : <span style={{fontSize:'0.75rem', fontWeight:'bold'}}>Ocultar</span>}
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

          <div className="stat-badge" title="Palabras aprendidas">
            <BookOpen size={16} className="text-blue-500" />
            <span>{stats.vocab} pal.</span>
          </div>

          <div className="stat-badge hidden-sm" title="Teclado Japonés IME listo">
            <Keyboard size={16} className="text-rose-500" />
            <span>IME 🇯🇵</span>
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
            <span className="hidden-sm" style={{ fontSize: '0.8rem' }}>
              {syncStatus === 'synced' ? 'Nube' : syncStatus === 'syncing' ? 'Sincronizando' : 'Local'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
