'use client';

import React from 'react';
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
  LogIn
} from 'lucide-react';

export default function Header({ 
  stats, 
  theme, 
  onToggleTheme, 
  onNavigate, 
  syncStatus = 'unconfigured', 
  syncInfo = '',
  authUser = null,
  onOpenAuth = null
}) {
  const [isMinimized, setIsMinimized] = React.useState(true);

  return (
    <header className="app-header">
      <div className="header-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="brand-wrapper" onClick={() => onNavigate('curriculum')}>
            <div className="brand-logo">日</div>
            <div>
              <div className="brand-title">日本語マスター</div>
              <div className="brand-subtitle">Nihongo Master · Japonés General</div>
            </div>
          </div>
          
          <div className="header-actions-right">
            <button 
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              className="mobile-header-toggle"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Mostrar estadísticas' : 'Ocultar estadísticas'}
            >
              {isMinimized ? <span style={{fontSize:'0.75rem', fontWeight:'bold'}}>Info</span> : <span style={{fontSize:'0.75rem', fontWeight:'bold'}}>Ocultar</span>}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="header-badges">
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

            {/* Cloud Sync Status */}
            <div 
              className="stat-badge" 
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('progress')}
              title={syncInfo || (syncStatus === 'synced' ? 'Nube sincronizada (Haz clic para ver)' : 'Haz clic para configurar sincronización multi-dispositivo')}
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

            {/* User Session Auth Badge */}
            {authUser ? (
              <div 
                className="stat-badge"
                style={{ 
                  cursor: 'pointer', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  borderColor: 'var(--primary, #6366f1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
                onClick={() => onNavigate('progress')}
                title={`Sesión activa: ${authUser.email}. Haz clic para gestionar tu cuenta.`}
              >
                <User size={15} style={{ color: 'var(--primary, #6366f1)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary, #6366f1)' }}>
                  {authUser.email.split('@')[0]}
                </span>
              </div>
            ) : (
              <button 
                className="stat-badge"
                style={{ 
                  cursor: 'pointer', 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
                onClick={onOpenAuth}
                title="Iniciar sesión para proteger y sincronizar tu progreso"
              >
                <LogIn size={15} style={{ color: 'var(--primary, #6366f1)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Entrar</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
