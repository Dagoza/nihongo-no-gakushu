'use client';

import React from 'react';
import { Flame, Star, CheckCircle, BookOpen, Moon, Sun, Keyboard } from 'lucide-react';

export default function Header({ stats, theme, onToggleTheme, onNavigate }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-wrapper" onClick={() => onNavigate('curriculum')}>
          <div className="brand-logo">日</div>
          <div>
            <div className="brand-title">日本語マスター</div>
            <div className="brand-subtitle">Nihongo Master · Japonés General</div>
          </div>
        </div>

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

          <button 
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
