'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Home, 
  Layers, 
  Languages, 
  Target, 
  BookmarkCheck, 
  Database,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export default function OfflinePage() {
  const [retrying, setRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [cacheCount, setCacheCount] = useState(null);

  useEffect(() => {
    // Initial status
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Inspect service worker caches if available
    if (typeof window !== 'undefined' && 'caches' in window) {
      window.caches.keys().then((keys) => {
        setCacheCount(keys.length);
      }).catch(() => {
        setCacheCount(0);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const OFFLINE_MODULES = [
    {
      title: 'Vocabulario JLPT N5–N1',
      desc: 'Banco léxico con furigana, traducciones y kanjis cargado en memoria local.',
      href: '/vocab',
      icon: Layers,
      color: '#3b82f6',
      badge: 'Local'
    },
    {
      title: 'Biblioteca de Kanjis',
      desc: 'Consulta de ideogramas, lecturas On/Kun y práctica de trazo interactivo.',
      href: '/kanji',
      icon: Languages,
      color: '#f59e0b',
      badge: 'Local'
    },
    {
      title: 'Partículas & Gramática',
      desc: '99 partículas esenciales y explicaciones gramaticales disponibles sin conexión.',
      href: '/grammar',
      icon: Target,
      color: '#10b981',
      badge: 'Local'
    },
    {
      title: 'Mis Recursos & FSRS',
      desc: 'Tus palabras guardadas y sesiones de repaso espaciado local.',
      href: '/saved',
      icon: BookmarkCheck,
      color: '#e11d48',
      badge: 'Local'
    }
  ];

  return (
    <div style={{ maxWidth: 840, margin: '24px auto', padding: '0 16px' }}>
      {/* Hero Header Standard */}
      <div className="page-header-standard" style={{ marginBottom: 24 }}>
        <div 
          className="header-icon-badge" 
          style={{ 
            background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
            color: isOnline ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)' 
          }}
        >
          {isOnline ? <Wifi size={28} /> : <WifiOff size={28} />}
        </div>
        <div className="header-text-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="header-title-main" style={{ margin: 0 }}>
              {isOnline ? '¡Conexión a Internet Restablecida!' : 'Modo Offline & Sin Conexión'}
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 20,
              background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
              color: isOnline ? '#10b981' : '#ef4444',
              border: isOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              {isOnline ? <CheckCircle2 size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'EN LÍNEA' : 'OFFLINE'}
            </span>
          </div>
          <p className="header-desc-main" style={{ marginTop: 6 }}>
            {isOnline 
              ? 'Tu dispositivo ha recuperado la conexión. Puedes sincronizar tu progreso o recargar la página para acceder a todos los recursos en la nube.'
              : 'Nihongo Master está preparado para funcionar sin conexión gracias a su arquitectura PWA. Todos tus datos locales, vocabulario y herramientas interactivas continúan operativos.'}
          </p>
        </div>
      </div>

      {/* Main Status Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 16px)',
        padding: '24px 20px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 24,
        textAlign: 'center'
      }}>
        {cacheCount !== null && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg-main)',
            border: '1px solid var(--border)',
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: 16
          }}>
            <HardDrive size={14} style={{ color: 'var(--primary)' }} />
            <span>Almacenamiento local PWA activo ({cacheCount} paquetes en caché)</span>
          </div>
        )}

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
          {isOnline ? 'Vuelve a navegar libremente' : '¿Deseas volver a comprobar la conexión?'}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 520, margin: '0 auto 20px' }}>
          {isOnline 
            ? 'Haz clic en el botón para recargar la aplicación y reanudar la sincronización con tu cuenta.'
            : 'Si te has reconectado a una red Wi-Fi o datos móviles, pulsa en "Reintentar conexión". De lo contrario, puedes seguir practicando con los módulos locales abajo.'}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleRetry}
            disabled={retrying}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md, 10px)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
              opacity: retrying ? 0.7 : 1,
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
            {retrying ? 'Comprobando...' : 'Reintentar conexión'}
          </button>

          <Link
            href="/curriculum"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              background: 'var(--bg-main)',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md, 10px)',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Home size={16} />
            <span>Volver a la Ruta</span>
          </Link>
        </div>
      </div>

      {/* Offline Functional Modules Grid */}
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: 700, 
          color: 'var(--text-main)', 
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Database size={16} style={{ color: 'var(--primary)' }} />
          <span>Módulos 100% disponibles sin conexión a internet:</span>
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14
        }}>
          {OFFLINE_MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link
                key={idx}
                href={mod.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md, 12px)',
                  textDecoration: 'none',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
                className="offline-module-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: `${mod.color}18`,
                    color: mod.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={18} />
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 12,
                    background: 'var(--primary-bg)',
                    color: 'var(--primary)',
                    border: '1px solid var(--border-focus)'
                  }}>
                    {mod.badge}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                  {mod.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                  {mod.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
