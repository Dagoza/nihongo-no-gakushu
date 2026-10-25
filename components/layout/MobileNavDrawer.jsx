'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  X,
  Compass, 
  ChevronRight,
  Check,
  Flame,
  Star,
  Settings,
  Sparkles,
  Layers,
  BarChart3,
  Grid
} from 'lucide-react';
import { TABS, NAV_CATEGORIES } from './NavigationTabs';

export default function MobileNavDrawer({
  isOpen = false,
  onClose,
  currentTab,
  savedCount = 0,
  onNavigate,
  userState = null,
  onOpenTour = null,
  onOpenSettings = null
}) {
  const pathname = usePathname();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const drawerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Determine active tab
  const activeTabId = (() => {
    if (currentTab) return currentTab;
    if (!pathname || pathname === '/') return 'home';
    if (pathname.startsWith('/story')) return 'story';
    if (pathname.startsWith('/nhk')) return 'nhk';
    if (pathname.startsWith('/youtube')) return 'youtube';
    if (pathname.startsWith('/scriptpad')) return 'scriptpad';
    if (pathname.startsWith('/vocab')) return 'vocab';
    if (pathname.startsWith('/grammar') || pathname.startsWith('/particles')) return 'particles';
    if (pathname.startsWith('/jlpt')) return 'jlpt';
    if (pathname.startsWith('/kanji')) return 'kanji';
    if (pathname.startsWith('/pdf')) return 'pdf';
    if (pathname.startsWith('/saved')) return 'saved';
    if (pathname.startsWith('/progress')) return 'progress';
    if (pathname.startsWith('/terminology')) return 'terminology';
    if (pathname.startsWith('/curriculum')) return 'curriculum';
    return 'curriculum';
  })();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  // Close drawer when pathname changes
  useEffect(() => {
    if (isOpen) {
      onClose?.();
    }
  }, [pathname]);

  // Touch handlers for swipe-to-dismiss (swipe right)
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaX > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      onClose?.();
    }
  };

  const handleItemClick = (tab) => {
    onClose?.();
    if (onNavigate) {
      onNavigate(tab.id);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const streak = userState?.streak || 1;
  const xp = userState?.xp || 0;
  const level = Math.floor(xp / 100) + 1;

  // Filter tabs by category
  const filteredTabs = selectedCategory === 'all'
    ? TABS
    : TABS.filter((t) => t.category === selectedCategory);

  const learnTabs = TABS.filter((t) => t.category === 'learn');
  const practiceTabs = TABS.filter((t) => t.category === 'practice');
  const progressTabs = TABS.filter((t) => t.category === 'progress');

  return (
    <>
      {/* Semi-transparent Backdrop Overlay */}
      <div 
        className={`mobile-nav-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel (from right edge) */}
      <aside 
        ref={drawerRef}
        className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal de navegación"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drawer Header */}
        <div className="mobile-nav-header">
          <div className="mobile-nav-header-brand">
            <div className="mobile-nav-header-icon">
              <Sparkles size={17} style={{ color: 'var(--primary, #6366f1)' }} />
            </div>
            <div>
              <div className="mobile-nav-header-title">日本語マスター</div>
              <div className="mobile-nav-header-subtitle">Navegación & Módulos</div>
            </div>
          </div>

          <button
            type="button"
            className="mobile-nav-close-btn"
            onClick={onClose}
            aria-label="Cerrar menú"
            title="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="mobile-nav-cats">
          {NAV_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`mobile-nav-cat-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon size={13} />
                <span>{cat.shortLabel}</span>
                <span className="mobile-cat-count">{cat.count}</span>
              </button>
            );
          })}
        </div>

        {/* Vertical Options Scrollable List */}
        <div className="mobile-nav-list">
          {selectedCategory === 'all' ? (
            <>
              {/* Sección: Aprender */}
              <div className="mobile-nav-section-title">
                <Sparkles size={13} style={{ color: 'var(--primary, #6366f1)' }} />
                <span>Aprender ({learnTabs.length})</span>
              </div>
              {learnTabs.map((tab) => renderNavCard(tab))}

              {/* Sección: Recursos & Práctica */}
              <div className="mobile-nav-section-title" style={{ marginTop: 14 }}>
                <Layers size={13} style={{ color: '#3b82f6' }} />
                <span>Recursos & Práctica ({practiceTabs.length})</span>
              </div>
              {practiceTabs.map((tab) => renderNavCard(tab))}

              {/* Sección: Progreso */}
              <div className="mobile-nav-section-title" style={{ marginTop: 14 }}>
                <BarChart3 size={13} style={{ color: '#10b981' }} />
                <span>Seguimiento ({progressTabs.length})</span>
              </div>
              {progressTabs.map((tab) => renderNavCard(tab))}
            </>
          ) : (
            filteredTabs.map((tab) => renderNavCard(tab))
          )}
        </div>

        {/* Drawer Footer with Quick Stats & Utilities */}
        <div className="mobile-nav-footer">
          <div className="mobile-nav-footer-stats">
            <div className="mobile-footer-stat-chip">
              <Flame size={14} style={{ color: 'var(--kohaku, #f59e0b)' }} />
              <span>{streak}d racha</span>
            </div>
            <div className="mobile-footer-stat-chip">
              <Star size={14} style={{ color: 'var(--primary, #6366f1)' }} />
              <span>Nivel {level} ({xp} XP)</span>
            </div>
          </div>

          <div className="mobile-nav-footer-actions">
            {onOpenTour && (
              <button
                type="button"
                className="mobile-footer-btn"
                onClick={() => {
                  onClose?.();
                  onOpenTour();
                }}
              >
                <Compass size={14} style={{ color: 'var(--primary, #6366f1)' }} />
                <span>Tour de la App</span>
              </button>
            )}

            {onOpenSettings && (
              <button
                type="button"
                className="mobile-footer-btn"
                onClick={() => {
                  onClose?.();
                  onOpenSettings();
                }}
              >
                <Settings size={14} />
                <span>Configuración</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );

  function renderNavCard(tab) {
    const Icon = tab.icon;
    const isActive = activeTabId === tab.id;

    return (
      <Link
        key={tab.id}
        href={tab.path}
        className={`mobile-nav-card ${isActive ? 'active' : ''}`}
        onClick={() => handleItemClick(tab)}
      >
        <div 
          className="mobile-nav-card-icon"
          style={{ 
            backgroundColor: `${tab.color}18`, 
            color: tab.color,
            borderColor: isActive ? tab.color : 'transparent'
          }}
        >
          <Icon size={19} />
        </div>

        <div className="mobile-nav-card-info">
          <div className="mobile-nav-card-title-row">
            <span className="mobile-nav-card-title">{tab.fullLabel}</span>
            {isActive && (
              <span className="mobile-nav-active-pill">
                <Check size={11} />
                <span>Actual</span>
              </span>
            )}
            {tab.id === 'saved' && savedCount > 0 && (
              <span className="mobile-nav-count-badge">
                {savedCount}
              </span>
            )}
          </div>
          <span className="mobile-nav-card-desc">{tab.desc}</span>
        </div>

        <ChevronRight size={16} className="mobile-nav-card-arrow" />
      </Link>
    );
  }
}
