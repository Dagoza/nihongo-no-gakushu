'use client';

import React, { useRef, useState } from 'react';
import { 
  Download, 
  Upload, 
  Flame, 
  Star, 
  Target, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  RotateCcw, 
  Keyboard,
  Cloud,
  CloudOff,
  CloudCheck,
  CloudSync,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Compass
} from 'lucide-react';
import { exportData, parseImportData, getInitialState } from '../lib/storage';
import { 
  executeFullSync, 
  signInWithGoogle 
} from '../lib/supabaseSync';
import { dataStore } from '../lib/data';
import { useApp } from '../lib/AppContext';

export default function ProgressTab({ 
  appState, 
  onUpdateState, 
  syncStatus = 'local', 
  syncInfo = '', 
  onTriggerSync = null,
  authUser = null,
  onOpenAuth = null,
  onSignOut = null,
  onOpenTour = null
}) {
  let contextApp = null;
  try {
    contextApp = useApp();
  } catch (e) {}
  const showConfirm = contextApp?.showConfirm || (() => Promise.resolve(true));

  const handleOpenTour = () => {
    if (typeof onOpenTour === 'function') {
      onOpenTour();
      return;
    }
    if (typeof contextApp?.openTour === 'function') {
      contextApp.openTour();
      return;
    }
    if (typeof window !== 'undefined') {
      if (typeof window.__nihongoOpenTour === 'function') {
        window.__nihongoOpenTour();
        return;
      }
      window.dispatchEvent(new CustomEvent('nihongo-open-tour'));
    }
  };

  const fileInputRef = useRef(null);

  // Estados de Sincronización en la Nube
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: string }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setSyncMessage(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      let msg = err.message || 'Error al conectar con Google.';
      if (msg.includes('provider is not enabled') || msg.includes('disabled')) {
        msg = 'El inicio de sesión con Google no está disponible en este momento. Puedes usar tu correo y contraseña.';
      }
      setSyncMessage({ type: 'error', text: msg });
      setGoogleLoading(false);
    }
  };

  const streak = appState.streak || 1;
  const xp = appState.xp || 0;
  const userLevel = Math.floor(xp / 100) + 1;
  const masteredParticlesCount = Object.values(appState.masteredParticles || {}).filter(Boolean).length;
  const masteredVocabCount = Object.values(appState.masteredVocab || {}).filter(Boolean).length;
  const masteredKanjiCount = Object.values(appState.masteredKanji || {}).filter(Boolean).length;
  const completedSentencesCount = Object.values(appState.completedSentences || {}).filter(Boolean).length;
  const completedConversationsCount = Object.values(appState.completedConversations || {}).filter(Boolean).length;
  const totalConversations = dataStore.nhkLessons?.length || 48;
  const completedStepsCount = Object.values(appState.completedSteps || {}).filter(Boolean).length;
  const totalSteps = dataStore.curriculum?.length || 19;
  const allCanDos = (dataStore.curriculum || []).flatMap(s => s.can_dos || []);
  const totalCanDos = allCanDos.length || 87;
  const completedCanDosCount = Object.values(appState.completedCanDos || {}).filter(Boolean).length;

  // Sincronización manual en la nube (requiere sesión activa)
  const handleManualSync = async () => {
    if (!authUser) {
      setSyncMessage({ type: 'info', text: 'Inicia sesión con Google o correo para sincronizar tus datos en la nube.' });
      return;
    }
    setIsSyncingLocal(true);
    setSyncMessage(null);
    try {
      if (onTriggerSync) {
        await onTriggerSync();
        setSyncMessage({ type: 'success', text: '¡Progreso sincronizado exitosamente con tu cuenta!' });
      } else {
        const res = await executeFullSync(appState);
        if (res.success) {
          onUpdateState(res.mergedState);
          setSyncMessage({ type: 'success', text: res.message });
        } else {
          setSyncMessage({ type: 'error', text: res.message });
        }
      }
    } catch (e) {
      setSyncMessage({ type: 'error', text: 'Error inesperado durante la sincronización.' });
    } finally {
      setIsSyncingLocal(false);
    }
  };

  const handleExport = () => {
    exportData(appState);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text === 'string') {
          const restoredState = parseImportData(text);
          onUpdateState(restoredState);
          setSyncMessage({ type: 'success', text: '¡Progreso restaurado con éxito desde el archivo JSON!' });
        }
      } catch (err) {
        setSyncMessage({ type: 'error', text: 'El archivo JSON no es válido o está dañado.' });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    const ok = await showConfirm({
      title: '¿Reiniciar Progreso?',
      message: '¿Estás seguro de que deseas reiniciar todo el progreso acumulado? Esta acción restablecerá tus rachas y XP a cero y no se puede deshacer.',
      confirmText: 'Reiniciar Todo',
      isDestructive: true
    });
    if (ok) {
      const fresh = getInitialState();
      onUpdateState(fresh);
      setSyncMessage({ type: 'info', text: 'El progreso ha sido reiniciado a cero.' });
    }
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <span>📊</span> Mi Progreso y Estadísticas de Aprendizaje
        </h2>
        <p className="section-desc">
          Consulta tu rendimiento, mantén tu sesión sincronizada en tiempo real entre tu móvil, tablet y computadora, y gestiona tus copias de seguridad.
        </p>
      </div>

      {/* Banner de mensajes/alertas de sincronización */}
      {syncMessage && (
        <div 
          style={{
            padding: '12px 18px',
            borderRadius: 10,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: syncMessage.type === 'success' 
              ? 'rgba(16, 185, 129, 0.12)' 
              : syncMessage.type === 'error' 
              ? 'rgba(239, 68, 68, 0.12)' 
              : 'rgba(99, 102, 241, 0.12)',
            border: `1px solid ${
              syncMessage.type === 'success' 
                ? 'var(--success, #10b981)' 
                : syncMessage.type === 'error' 
                ? 'var(--danger, #ef4444)' 
                : 'var(--primary, #6366f1)'
            }`,
            color: 'var(--text-main)'
          }}
        >
          {syncMessage.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />}
          {syncMessage.type === 'error' && <AlertCircle size={18} style={{ color: 'var(--danger)' }} />}
          {syncMessage.type === 'info' && <RefreshCw size={18} style={{ color: 'var(--primary)' }} />}
          <div style={{ flex: 1, fontSize: '0.92rem' }}>{syncMessage.text}</div>
          <button 
            onClick={() => setSyncMessage(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🔥</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)' }}>
            {streak} {streak === 1 ? 'día' : 'días'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Racha de Estudio</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>⭐</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
            {xp} XP
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nivel {userLevel} Maestro</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🎯</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
            {masteredParticlesCount}/25
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Partículas Dominadas</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>漢</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-light)' }}>
            {masteredKanjiCount}/101
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Kanjis Aprendidos</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>📚</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>
            {masteredVocabCount}/163
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vocabulario Dominado</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>📖</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6' }}>
            {completedSentencesCount}/58
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Oraciones de Historia</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>📻</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899' }}>
            {completedConversationsCount}/{totalConversations}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Conversaciones Estudiadas</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🗺️</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
            {completedStepsCount}/{totalSteps}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ruta Consolidada (Módulos)</div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🎯</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899' }}>
            {completedCanDosCount}/{totalCanDos}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Competencias Can-Do</div>
        </div>
      </div>

      {/* CLOUD SYNC & USER ACCOUNT CARD */}
      <div className="card" style={{ marginBottom: 24, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        {/* Card Header with Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 8, 
              background: 'rgba(99, 102, 241, 0.12)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Cloud size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Sincronización en la Nube & Cuenta
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                La única forma de preservar tu progreso permanentemente entre dispositivos es iniciando sesión con Google o tu correo.
              </div>
            </div>
          </div>

          {/* Connection Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: '0.82rem',
              fontWeight: 600,
              background: isSyncingLocal || syncStatus === 'syncing'
                ? 'rgba(245, 158, 11, 0.12)'
                : authUser && syncStatus === 'synced'
                ? 'rgba(16, 185, 129, 0.12)'
                : authUser
                ? 'rgba(99, 102, 241, 0.12)'
                : 'rgba(148, 163, 184, 0.12)',
              color: isSyncingLocal || syncStatus === 'syncing'
                ? 'var(--accent, #f59e0b)'
                : authUser && syncStatus === 'synced'
                ? 'var(--success, #10b981)'
                : authUser
                ? 'var(--primary, #6366f1)'
                : 'var(--text-muted, #94a3b8)',
              border: '1px solid currentColor'
            }}>
              {isSyncingLocal || syncStatus === 'syncing' ? (
                <>
                  <CloudSync size={14} className="animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : authUser && syncStatus === 'synced' ? (
                <>
                  <CloudCheck size={14} />
                  <span>Sincronizado con tu cuenta</span>
                </>
              ) : authUser ? (
                <>
                  <Cloud size={14} />
                  <span>Cuenta conectada</span>
                </>
              ) : (
                <>
                  <CloudOff size={14} />
                  <span>Modo Local (Sin sincronizar)</span>
                </>
              )}
            </div>

            {authUser && (
              <button
                className="btn btn-outline btn-sm"
                onClick={handleManualSync}
                disabled={isSyncingLocal}
                title="Sincronizar ahora con tu cuenta en la nube"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={14} className={isSyncingLocal ? 'animate-spin' : ''} />
                <span>Sincronizar ahora</span>
              </button>
            )}
          </div>
        </div>

        {/* User Account & Security Banner */}
        <div style={{
          padding: '16px 20px',
          borderRadius: 12,
          background: authUser 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)' 
            : 'var(--bg-main)',
          border: `1px solid ${authUser ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {authUser?.avatar ? (
              <img 
                src={authUser.avatar} 
                alt={authUser.name || 'Usuario'} 
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--success, #10b981)' }} 
              />
            ) : (
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: authUser ? 'var(--success, #10b981)' : 'rgba(99, 102, 241, 0.15)',
                color: authUser ? '#ffffff' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={22} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.98rem' }}>
                  {authUser ? (authUser.name || authUser.email) : 'Sesión Local (Invitado)'}
                </strong>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 600,
                  background: authUser ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: authUser ? 'var(--success, #10b981)' : 'var(--accent, #f59e0b)'
                }}>
                  {authUser ? (authUser.provider === 'google' ? 'Google Account 🔒' : 'Cuenta Segura 🔒') : '⚠️ Sin Cuenta'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {authUser 
                  ? `Conectado como ${authUser.email}. Tu progreso, kanjis y vocabulario se respaldan automáticamente en la nube.`
                  : 'Para preservar tu racha, XP, palabras y kanjis al cambiar de navegador o dispositivo, inicia sesión con Google o tu correo.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {authUser ? (
              <button
                className="btn btn-outline btn-sm"
                onClick={onSignOut}
                style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>Cerrar Sesión</span>
              </button>
            ) : (
              <>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.685-5.17 3.685-9.09z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.31 21.36 7.39 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.31 2.64 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
                  </svg>
                  <span>{googleLoading ? 'Conectando...' : 'Google'}</span>
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={onOpenAuth}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <ShieldCheck size={15} />
                  <span>Entrar con Correo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Tour & Interactive Walkthrough Card */}
      <div className="card" style={{ 
        marginBottom: 24, 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Tour Guiado & Recorrido de la Aplicación
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 700,
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)'
                }}>
                  Interactivo & Animado
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                ¿Quieres repasar las herramientas de la plataforma, los badges del header o descubrir funciones ocultas como pronunciación por selección, Furigana interactivo y repaso espaciado?
              </p>
            </div>
          </div>

          <button 
            type="button"
            className="btn btn-primary"
            onClick={handleOpenTour}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8,
              background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
              boxShadow: '0 4px 14px rgba(67, 56, 202, 0.3)',
              padding: '10px 20px',
              fontWeight: 700
            }}
          >
            <Compass size={17} />
            <span>Iniciar Tour Interactivo</span>
          </button>
        </div>
      </div>

      {/* Backup and Restore Box (JSON Manual) */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>💾</span> Respaldo Manual en Archivo JSON
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 16 }}>
          Descarga un archivo JSON de respaldo con tu racha, XP y listas de estudio completadas, o restáuralo si deseas tener copias físicas fuera de la nube.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={handleExport}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Download size={16} /> Exportar Progreso a JSON
          </button>

          <button 
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Upload size={16} /> Restaurar desde JSON
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            accept=".json" 
            style={{ display: 'none' }} 
          />

          <button 
            className="btn btn-outline" 
            style={{ color: 'var(--danger)', marginLeft: 'auto' }}
            onClick={handleReset}
          >
            <RotateCcw size={16} /> Reiniciar Progreso
          </button>
        </div>
      </div>

      {/* Japanese Keyboard Guide */}
      <div className="card" style={{ background: 'var(--bg-main)', border: '2px dashed var(--border)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Keyboard size={20} color="var(--primary)" /> Consejos para Escribir con Teclado Japonés (IME) en macOS
        </h3>
        <ul style={{ fontSize: '0.93rem', color: 'var(--text-muted)', lineHeight: 1.9, paddingLeft: 22 }}>
          <li>
            <strong>Activar Japonés:</strong> Ve a <em>Preferencias del Sistema → Teclado → Fuentes de Entrada</em> y agrega <strong>Japonés (Romaji)</strong>.
          </li>
          <li>
            <strong>Alternar Rápido:</strong> Presiona <kbd style={{ background: 'var(--bg-surface)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>Control + Espacio</kbd> o la tecla <kbd style={{ background: 'var(--bg-surface)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>Bloq Mayús</kbd> (si está configurada para cambiar de fuente).
          </li>
          <li>
            <strong>Hiragana Directo:</strong> Escribe en letras latinas (ej. <code>watashi</code>) y el sistema lo escribirá inmediatamente como <code>わたし</code>.
          </li>
          <li>
            <strong>Conversión a Kanji:</strong> Al escribir una palabra en Hiragana, presiona la <kbd style={{ background: 'var(--bg-surface)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>Barra Espaciadora</kbd> para abrir el menú de conversión a Kanji (ej. <code>わたし</code> → <code>私</code>) y confirma con <kbd style={{ background: 'var(--bg-surface)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>Enter</kbd>.
          </li>
          <li>
            <strong>Katakana:</strong> Escribe la palabra (ej. <code>terebi</code>) y presiona la barra espaciadora o la tecla <kbd style={{ background: 'var(--bg-surface)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4 }}>F7</kbd> para convertir directamente a Katakana (<code>テレビ</code>).
          </li>
        </ul>
      </div>
    </div>
  );
}
