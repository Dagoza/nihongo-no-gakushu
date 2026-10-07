'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker & check for updates immediately
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleRegister = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[PWA] Service Worker registrado exitosamente con scope:', registration.scope);
            // Check for updates immediately so stale client caches are replaced
            registration.update();
          })
          .catch((err) => {
            console.error('[PWA] Error al registrar Service Worker:', err);
          });
      };

      if (document.readyState === 'complete') {
        handleRegister();
      } else {
        window.addEventListener('load', handleRegister);
      }
    }

    // 2. Check if already running in standalone mode (installed)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    if (checkStandalone()) {
      return;
    }

    // 3. Listen for Android / Chrome / Edge 'beforeinstallprompt'
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user dismissed prompt recently (last 5 days)
      const dismissedAt = localStorage.getItem('pwa_prompt_dismissed');
      if (dismissedAt) {
        const diffDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
        if (diffDays < 5) return;
      }

      setShowAndroidPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Handle iOS Safari installation banner
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) && !window.MSStream;
    if (isIOS && !checkStandalone()) {
      const dismissedAt = localStorage.getItem('pwa_ios_dismissed');
      let shouldShow = true;
      if (dismissedAt) {
        const diffDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
        if (diffDays < 5) shouldShow = false;
      }
      if (shouldShow) {
        setShowIosPrompt(true);
      }
    }

    // 5. Listen for successful app install
    const handleAppInstalled = () => {
      console.log('[PWA] Aplicación instalada exitosamente');
      setShowAndroidPrompt(false);
      setShowIosPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Respuesta del usuario al diálogo de instalación:', outcome);

    if (outcome === 'accepted') {
      setShowAndroidPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismissAndroid = () => {
    setShowAndroidPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  const handleDismissIos = () => {
    setShowIosPrompt(false);
    localStorage.setItem('pwa_ios_dismissed', Date.now().toString());
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Android / Desktop / Chrome Native Install Banner */}
      {showAndroidPrompt && (
        <div 
          className="pwa-install-banner" 
          role="dialog" 
          aria-label="Instalar aplicación"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: 480,
            zIndex: 9999,
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: 18,
            border: '1px solid var(--border, #e2e8f0)',
            boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.3)',
            padding: '14px 16px',
            boxSizing: 'border-box'
          }}
        >
          <div className="pwa-install-content" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div className="pwa-icon-wrapper" style={{ flexShrink: 0 }}>
              <img src="/icons/icon-96x96.png" alt="Nihongo Master Logo" width={44} height={44} style={{ borderRadius: 10, display: 'block' }} />
            </div>
            <div className="pwa-install-text" style={{ flex: 1, minWidth: 0 }}>
              <div className="pwa-install-title" style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2 }}>Instalar Nihongo Master</div>
              <div className="pwa-install-desc" style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.3 }}>Úsala a pantalla completa y sin conexión en tu dispositivo.</div>
            </div>
            <div className="pwa-install-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button onClick={handleInstallClick} className="pwa-btn-primary">
                <Download size={16} />
                <span>Instalar</span>
              </button>
              <button onClick={handleDismissAndroid} className="pwa-btn-close" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Instructions Banner */}
      {showIosPrompt && (
        <div 
          className="pwa-install-banner pwa-ios-banner" 
          role="dialog" 
          aria-label="Instalar en iOS"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: 480,
            zIndex: 9999,
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: 18,
            border: '1px solid var(--border, #e2e8f0)',
            boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.3)',
            padding: '14px 16px',
            boxSizing: 'border-box'
          }}
        >
          <div className="pwa-install-content" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div className="pwa-icon-wrapper" style={{ flexShrink: 0 }}>
              <img src="/icons/apple-touch-icon.png" alt="Nihongo Master" width={44} height={44} style={{ borderRadius: 10, display: 'block' }} />
            </div>
            <div className="pwa-install-text" style={{ flex: 1, minWidth: 0 }}>
              <div className="pwa-install-title" style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2 }}>Instalar en tu iPhone o iPad</div>
              <div className="pwa-install-desc" style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                Toca <Share size={15} style={{ verticalAlign: 'middle', display: 'inline' }} /> <strong>Compartir</strong> y luego <PlusSquare size={15} style={{ verticalAlign: 'middle', display: 'inline' }} /> <strong>"Agregar a pantalla de inicio"</strong>.
              </div>
            </div>
            <div className="pwa-install-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button onClick={handleDismissIos} className="pwa-btn-close" aria-label="Entendido">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
