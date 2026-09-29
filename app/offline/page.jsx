'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Home, BookOpen } from 'lucide-react';

export default function OfflinePage() {
  const [retrying, setRetrying] = React.useState(false);

  const handleRetry = () => {
    setRetrying(true);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div style={{
      maxWidth: 600,
      margin: '40px auto',
      padding: '32px 20px',
      textAlign: 'center',
      background: 'var(--bg-card, #111827)',
      borderRadius: 'var(--radius-lg, 18px)',
      border: '1px solid var(--border, #1f2937)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--danger, #ef4444)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
      }}>
        <WifiOff size={36} />
      </div>

      <h1 style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        marginBottom: 10,
        color: 'var(--text-main, #f1f5f9)'
      }}>
        Sin conexión a internet
      </h1>

      <p style={{
        color: 'var(--text-muted, #94a3b8)',
        fontSize: '0.95rem',
        lineHeight: 1.6,
        marginBottom: 28
      }}>
        Estás usando Nihongo Master en modo offline. Los contenidos cargados previamente y las funciones locales continúan disponibles en tu dispositivo.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '0 auto' }}>
        <button
          onClick={handleRetry}
          disabled={retrying}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 20px',
            background: 'var(--primary, #4338ca)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md, 12px)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            opacity: retrying ? 0.7 : 1
          }}
        >
          <RefreshCw size={18} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Comprobando...' : 'Reintentar conexión'}
        </button>

        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 20px',
            background: 'var(--bg-main, #090d16)',
            color: 'var(--text-main, #f1f5f9)',
            border: '1px solid var(--border, #1f2937)',
            borderRadius: 'var(--radius-md, 12px)',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.95rem'
          }}
        >
          <Home size={18} />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
