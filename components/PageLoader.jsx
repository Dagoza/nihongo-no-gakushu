'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function PageLoader({ text = 'Cargando contenido...' }) {
  return (
    <div 
      className="page-loader-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        width: '100%',
        gap: '12px',
        color: 'var(--text-muted, #94a3b8)',
      }}
    >
      <Loader2 
        size={28} 
        className="animate-spin" 
        style={{ color: 'var(--primary, #6366f1)' }} 
      />
      <span style={{ fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.01em' }}>
        {text}
      </span>
    </div>
  );
}
