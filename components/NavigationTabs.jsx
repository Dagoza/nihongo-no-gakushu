'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Compass, 
  BookOpen, 
  Layers, 
  Target, 
  Languages, 
  MessageSquare, 
  FileText, 
  BarChart3,
  Tv,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Grid,
  Sparkles,
  Check,
  X,
  BookmarkCheck
} from 'lucide-react';

export const NAV_CATEGORIES = [
  { id: 'all', label: 'Todos los módulos', shortLabel: 'Todos', icon: Grid, count: 10 },
  { id: 'learn', label: 'Aprender', shortLabel: 'Aprender', icon: Sparkles, count: 4 },
  { id: 'practice', label: 'Recursos & Práctica', shortLabel: 'Recursos', icon: Layers, count: 5 },
  { id: 'progress', label: 'Progreso', shortLabel: 'Progreso', icon: BarChart3, count: 1 },
];

export const TABS = [
  {
    id: 'curriculum',
    path: '/curriculum',
    category: 'learn',
    categoryName: 'Aprender',
    shortLabel: 'Ruta',
    fullLabel: 'Ruta de Aprendizaje',
    desc: 'Plan guiado progresivo con objetivos por nivel',
    icon: Compass,
    color: '#6366f1',
  },
  {
    id: 'story',
    path: '/story',
    category: 'learn',
    categoryName: 'Aprender',
    shortLabel: 'Historia',
    fullLabel: 'Historia Interactiva',
    desc: 'Lectura con audio interactivo y furigana',
    icon: BookOpen,
    color: '#8b5cf6',
  },
  {
    id: 'nhk',
    path: '/nhk',
    category: 'learn',
    categoryName: 'Aprender',
    shortLabel: 'Conversación',
    fullLabel: 'Conversación NHK',
    desc: 'Diálogos de situaciones cotidianas reales',
    icon: MessageSquare,
    color: '#ec4899',
  },
  {
    id: 'youtube',
    path: '/youtube',
    category: 'learn',
    categoryName: 'Aprender',
    shortLabel: 'Inmersión',
    fullLabel: 'Inmersión YouTube',
    desc: 'Videos auténticos con subtítulos sincronizados',
    icon: Tv,
    color: '#ef4444',
  },
  {
    id: 'vocab',
    path: '/vocab',
    category: 'practice',
    categoryName: 'Recursos & Práctica',
    shortLabel: 'Vocabulario',
    fullLabel: 'Vocabulario',
    desc: 'Banco léxico con Kanji, Hiragana y audio',
    icon: Layers,
    color: '#3b82f6',
  },
  {
    id: 'particles',
    path: '/grammar',
    category: 'practice',
    categoryName: 'Recursos & Práctica',
    shortLabel: 'Gramática',
    fullLabel: 'Partículas & Gramática',
    desc: '99 partículas y estructuras esenciales (N5 a N1)',
    icon: Target,
    color: '#10b981',
  },
  {
    id: 'kanji',
    path: '/kanji',
    category: 'practice',
    categoryName: 'Recursos & Práctica',
    shortLabel: 'Kanji',
    fullLabel: 'Biblioteca Kanji',
    desc: 'Trazos, lecturas On/Kun y palabras asociadas',
    icon: Languages,
    color: '#f59e0b',
  },
  {
    id: 'pdf',
    path: '/pdf',
    category: 'practice',
    categoryName: 'Recursos & Práctica',
    shortLabel: 'PDFs',
    fullLabel: 'Biblioteca de PDFs',
    desc: 'Libros Minna no Nihongo y guías descargables',
    icon: FileText,
    color: '#06b6d4',
  },
  {
    id: 'saved',
    path: '/saved',
    category: 'practice',
    categoryName: 'Recursos & Práctica',
    shortLabel: 'Guardados',
    fullLabel: 'Palabras & Historias',
    desc: 'Palabras y frases guardadas para exportar y crear historias',
    icon: BookmarkCheck,
    color: '#e11d48',
  },
  {
    id: 'progress',
    path: '/progress',
    category: 'progress',
    categoryName: 'Progreso',
    shortLabel: 'Mi Progreso',
    fullLabel: 'Mi Progreso',
    desc: 'Rachas, experiencia, nivel y estadísticas',
    icon: BarChart3,
    color: '#10b981',
  },
];

export default function NavigationTabs({ currentTab, onTabChange, savedCount = 0 }) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTabId = (() => {
    if (currentTab) return currentTab;
    if (!pathname) return 'curriculum';
    if (pathname.startsWith('/story')) return 'story';
    if (pathname.startsWith('/nhk')) return 'nhk';
    if (pathname.startsWith('/youtube')) return 'youtube';
    if (pathname.startsWith('/vocab')) return 'vocab';
    if (pathname.startsWith('/grammar') || pathname.startsWith('/particles')) return 'particles';
    if (pathname.startsWith('/kanji')) return 'kanji';
    if (pathname.startsWith('/pdf')) return 'pdf';
    if (pathname.startsWith('/saved')) return 'saved';
    if (pathname.startsWith('/progress')) return 'progress';
    if (pathname.startsWith('/curriculum')) return 'curriculum';
    return 'curriculum';
  })();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollContainerRef = useRef(null);
  const menuRef = useRef(null);

  // Sync category if active tab changed from an external source (e.g. logo or curriculum)
  useEffect(() => {
    const currentTabObj = TABS.find((t) => t.id === activeTabId);
    if (currentTabObj && selectedCategory !== 'all' && currentTabObj.category !== selectedCategory) {
      setSelectedCategory(currentTabObj.category);
    }
  }, [activeTabId, selectedCategory]);

  // Check scroll capability
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const canLeft = el.scrollLeft > 6;
    const canRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 6;
    setCanScrollLeft(canLeft);
    setCanScrollRight(canRight);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScroll();
    window.addEventListener('resize', checkScroll);
    el.addEventListener('scroll', checkScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', checkScroll);
      el.removeEventListener('scroll', checkScroll);
    };
  }, [checkScroll, selectedCategory]);

  // Center active tab into view when changed
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const activeBtn = el.querySelector(`.nav-tab-pill[data-tab-id="${activeTabId}"]`) || el.querySelector('.nav-tab-pill.active');
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
    // Re-check scroll positions after animation
    const timer = setTimeout(checkScroll, 350);
    return () => clearTimeout(timer);
  }, [activeTabId, checkScroll]);

  // Close menu on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleScroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -240 : 240;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleWheel = (e) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Allow horizontal wheel scrolling
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
      el.scrollLeft += e.deltaY;
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId !== 'all') {
      const categoryTabs = TABS.filter((t) => t.category === categoryId);
      // If current tab is not in the chosen category, navigate to the first tab of that category
      if (!categoryTabs.some((t) => t.id === activeTabId)) {
        handleTabClick(categoryTabs[0].id);
      }
    }
  };

  const handleTabClick = (tabId) => {
    const tabObj = TABS.find((t) => t.id === tabId);
    const targetPath = tabObj ? tabObj.path : `/${tabId}`;
    router.push(targetPath);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const visibleTabs = selectedCategory === 'all' 
    ? TABS 
    : TABS.filter((t) => t.category === selectedCategory);

  const activeTabObj = TABS.find((t) => t.id === currentTab) || TABS[0];

  return (
    <nav className="nav-tabs-wrapper" aria-label="Navegación principal">
      <div className="nav-tabs-container">
        
        {/* Upper Micro-Bar: Category Filter Switcher + Quick Dropdown Menu */}
        <div className="nav-controls-bar">
          <div className="nav-category-pills">
            {NAV_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  className={`nav-cat-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                  type="button"
                >
                  <Icon size={14} />
                  <span>{cat.shortLabel}</span>
                  <span className="cat-count-badge">{cat.count}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Menu / Mega-Dropdown Trigger */}
          <div className="nav-mega-dropdown-wrapper" ref={menuRef}>
            <button
              className={`nav-modules-btn ${isMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              title="Ver todos los módulos agrupados"
              type="button"
            >
              <Grid size={15} />
              <span className="modules-btn-label">Módulos</span>
              <ChevronDown size={14} className={`dropdown-arrow ${isMenuOpen ? 'rotated' : ''}`} />
            </button>

            {/* Mega-Dropdown Floating Popover */}
            {isMenuOpen && (
              <div className="nav-mega-menu-card" role="menu">
                <div className="mega-menu-header">
                  <div>
                    <h4 className="mega-menu-title">Módulos de Nihongo Master</h4>
                    <p className="mega-menu-subtitle">Accede rápidamente a cualquier sección de estudio</p>
                  </div>
                  <button 
                    className="mega-menu-close" 
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Cerrar menú"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mega-menu-sections">
                  {/* Category: Aprender */}
                  <div className="mega-menu-section">
                    <div className="mega-section-header">
                      <Sparkles size={14} className="text-indigo-400" />
                      <span>Aprender (4)</span>
                    </div>
                    <div className="mega-items-grid">
                      {TABS.filter((t) => t.category === 'learn').map((t) => {
                        const Icon = t.icon;
                        const isActive = activeTabId === t.id;
                        return (
                          <Link
                            key={t.id}
                            href={t.path}
                            className={`mega-item-btn ${isActive ? 'active' : ''}`}
                            onClick={() => {
                              setIsMenuOpen(false);
                            }}
                            role="menuitem"
                          >
                            <div className="mega-item-icon" style={{ backgroundColor: `${t.color}20`, color: t.color }}>
                              <Icon size={18} />
                            </div>
                            <div className="mega-item-info">
                              <div className="mega-item-title-row">
                                <span className="mega-item-title">{t.fullLabel}</span>
                                {isActive && <Check size={14} className="mega-item-active-check" />}
                              </div>
                              <span className="mega-item-desc">{t.desc}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category: Recursos & Práctica */}
                  <div className="mega-menu-section">
                    <div className="mega-section-header">
                      <Layers size={14} className="text-blue-400" />
                      <span>Recursos & Práctica ({TABS.filter((t) => t.category === 'practice').length})</span>
                    </div>
                    <div className="mega-items-grid">
                      {TABS.filter((t) => t.category === 'practice').map((t) => {
                        const Icon = t.icon;
                        const isActive = activeTabId === t.id;
                        return (
                          <Link
                            key={t.id}
                            href={t.path}
                            className={`mega-item-btn ${isActive ? 'active' : ''}`}
                            onClick={() => {
                              setIsMenuOpen(false);
                            }}
                            role="menuitem"
                          >
                            <div className="mega-item-icon" style={{ backgroundColor: `${t.color}20`, color: t.color }}>
                              <Icon size={18} />
                            </div>
                            <div className="mega-item-info">
                              <div className="mega-item-title-row">
                                <span className="mega-item-title">{t.fullLabel}</span>
                                {isActive && <Check size={14} className="mega-item-active-check" />}
                              </div>
                              <span className="mega-item-desc">{t.desc}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category: Progreso */}
                  <div className="mega-menu-section">
                    <div className="mega-section-header">
                      <BarChart3 size={14} className="text-emerald-400" />
                      <span>Seguimiento (1)</span>
                    </div>
                    <div className="mega-items-grid">
                      {TABS.filter((t) => t.category === 'progress').map((t) => {
                        const Icon = t.icon;
                        const isActive = activeTabId === t.id;
                        return (
                          <Link
                            key={t.id}
                            href={t.path}
                            className={`mega-item-btn ${isActive ? 'active' : ''}`}
                            onClick={() => {
                              setIsMenuOpen(false);
                            }}
                            role="menuitem"
                          >
                            <div className="mega-item-icon" style={{ backgroundColor: `${t.color}20`, color: t.color }}>
                              <Icon size={18} />
                            </div>
                            <div className="mega-item-info">
                              <div className="mega-item-title-row">
                                <span className="mega-item-title">{t.fullLabel}</span>
                                {isActive && <Check size={14} className="mega-item-active-check" />}
                              </div>
                              <span className="mega-item-desc">{t.desc}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Primary Tabs Row with Smooth Scroll & Overflow Indicators */}
        <div className="nav-tabs-track-wrapper">
          {/* Left Scroll Button */}
          {canScrollLeft && (
            <button
              className="nav-scroll-btn left"
              onClick={() => handleScroll('left')}
              title="Desplazar a la izquierda"
              type="button"
              aria-label="Desplazar a la izquierda"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Left Gradient Mask */}
          <div className={`nav-edge-mask left ${canScrollLeft ? 'visible' : ''}`} />

          {/* Scrollable Tabs Container */}
          <div 
            className="nav-tabs-scroll-container" 
            ref={scrollContainerRef}
            onWheel={handleWheel}
          >
            {visibleTabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTabId === tab.id;

              // Insert subtle category dividers when showing all tabs
              const prevTab = idx > 0 ? visibleTabs[idx - 1] : null;
              const isDifferentCategory = selectedCategory === 'all' && prevTab && prevTab.category !== tab.category;

              return (
                <React.Fragment key={tab.id}>
                  {isDifferentCategory && (
                    <div className="nav-tab-divider" aria-hidden="true" />
                  )}
                  <Link
                    href={tab.path}
                    className={`nav-tab-pill ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    title={`${tab.fullLabel}: ${tab.desc}`}
                    data-tab-id={tab.id}
                  >
                    <Icon size={17} className="tab-pill-icon" />
                    <span className="tab-pill-label">
                      {selectedCategory === 'all' ? tab.shortLabel : tab.fullLabel}
                    </span>
                    {tab.id === 'saved' && savedCount > 0 && (
                      <span className="tab-pill-badge">{savedCount}</span>
                    )}
                    {isActive && <div className="tab-pill-glow" />}
                  </Link>
                </React.Fragment>
              );
            })}
          </div>

          {/* Right Gradient Mask */}
          <div className={`nav-edge-mask right ${canScrollRight ? 'visible' : ''}`} />

          {/* Right Scroll Button */}
          {canScrollRight && (
            <button
              className="nav-scroll-btn right"
              onClick={() => handleScroll('right')}
              title="Desplazar a la derecha"
              type="button"
              aria-label="Desplazar a la derecha"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
