'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  Copy,
  Check,
  Link,
  Smartphone,
  Laptop,
  Settings,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Code
} from 'lucide-react';
import { exportData, parseImportData, getInitialState } from '../lib/storage';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  isSupabaseConfigured,
  getSyncCode, 
  setSyncCode, 
  generateSyncCode, 
  testSupabaseConnection, 
  executeFullSync, 
  getLastSyncTime 
} from '../lib/supabaseSync';
import { dataStore } from '../lib/data';

const SQL_SCRIPT = `-- Nihongo Master - Tabla de progreso protegida con Supabase Auth y RLS
create table if not exists public.user_progress (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  data jsonb not null default '{}'::jsonb,
  device_info text default 'Web Client',
  client_version integer default 2,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_progress add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.user_progress add column if not exists email text;

create index if not exists idx_user_progress_user_id on public.user_progress (user_id);
create index if not exists idx_user_progress_updated_at on public.user_progress (updated_at desc);

alter table public.user_progress enable row level security;

drop policy if exists "Acceso total a progreso de usuario" on public.user_progress;
drop policy if exists "Usuarios autenticados solo acceden a su progreso" on public.user_progress;
drop policy if exists "Acceso anónimo con código" on public.user_progress;

create policy "Usuarios autenticados solo acceden a su progreso"
  on public.user_progress
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Acceso anónimo con código"
  on public.user_progress
  for all
  to anon
  using (user_id is null)
  with check (user_id is null);`;

export default function ProgressTab({ 
  appState, 
  onUpdateState, 
  syncStatus = 'unconfigured', 
  syncInfo = '', 
  onTriggerSync = null,
  authUser = null,
  onOpenAuth = null,
  onSignOut = null
}) {
  const fileInputRef = useRef(null);

  // Estados de Sincronización en la Nube
  const [currentSyncCode, setCurrentSyncCode] = useState('');
  const [inputDeviceCode, setInputDeviceCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: string }

  // Configuración Supabase
  const [supabaseConfig, setSupabaseConfig] = useState({ url: '', anonKey: '', source: 'none' });
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [showSqlDrawer, setShowSqlDrawer] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customAnonKey, setCustomAnonKey] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    setCurrentSyncCode(getSyncCode());
    const cfg = getSupabaseConfig();
    setSupabaseConfig(cfg);
    if (cfg.source === 'custom') {
      setCustomUrl(cfg.url);
      setCustomAnonKey(cfg.anonKey);
    }
  }, []);

  const streak = appState.streak || 1;
  const xp = appState.xp || 0;
  const userLevel = Math.floor(xp / 100) + 1;
  const masteredParticlesCount = Object.values(appState.masteredParticles || {}).filter(Boolean).length;
  const masteredVocabCount = Object.values(appState.masteredVocab || {}).filter(Boolean).length;
  const masteredKanjiCount = Object.values(appState.masteredKanji || {}).filter(Boolean).length;
  const completedSentencesCount = Object.values(appState.completedSentences || {}).filter(Boolean).length;
  const completedConversationsCount = Object.values(appState.completedConversations || {}).filter(Boolean).length;
  const totalConversations = dataStore.nhkLessons?.length || 22;

  // Acciones de sincronización
  const handleCopyCode = () => {
    if (!currentSyncCode) return;
    navigator.clipboard.writeText(currentSyncCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleGenerateNewCode = () => {
    if (confirm('¿Deseas generar un nuevo código de sincronización para este dispositivo? Si ya tienes otro dispositivo vinculado con el código actual, dejarán de sincronizarse.')) {
      const newCode = generateSyncCode();
      setSyncCode(newCode);
      setCurrentSyncCode(newCode);
      setSyncMessage({ type: 'info', text: `Nuevo código generado: ${newCode}` });
    }
  };

  const handleManualSync = async () => {
    setIsSyncingLocal(true);
    setSyncMessage(null);
    try {
      if (onTriggerSync) {
        await onTriggerSync();
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

  const handleLinkDevice = async (e) => {
    e.preventDefault();
    const code = inputDeviceCode.trim().toUpperCase();
    if (!code) return;

    if (code === currentSyncCode) {
      setSyncMessage({ type: 'info', text: 'Este ya es el código de este dispositivo.' });
      return;
    }

    if (!isSupabaseConfigured()) {
      setSyncMessage({ 
        type: 'error', 
        text: 'Primero debes configurar la base de datos de Supabase antes de vincular dispositivos.' 
      });
      setShowConfigDrawer(true);
      return;
    }

    setIsSyncingLocal(true);
    setSyncMessage({ type: 'info', text: `Conectando con el dispositivo [${code}]...` });

    try {
      // Ejecutar sincronización con el código objetivo
      const res = await executeFullSync(appState, code);
      if (res.success) {
        setSyncCode(code);
        setCurrentSyncCode(code);
        setInputDeviceCode('');
        onUpdateState(res.mergedState);
        setSyncMessage({ 
          type: 'success', 
          text: `¡Dispositivo vinculado con éxito! Todo el progreso ha sido combinado y sincronizado.` 
        });
      } else {
        setSyncMessage({ 
          type: 'error', 
          text: res.message || 'No se pudo vincular con el código indicado. Comprueba que el código sea correcto.' 
        });
      }
    } catch (err) {
      setSyncMessage({ type: 'error', text: 'Error al conectar con la base de datos.' });
    } finally {
      setIsSyncingLocal(false);
    }
  };

  const handleSaveCustomConfig = async (e) => {
    e.preventDefault();
    if (!customUrl || !customAnonKey) {
      setSyncMessage({ type: 'error', text: 'Ingresa la URL y la Anon Key de Supabase.' });
      return;
    }

    setIsTestingConnection(true);
    const testRes = await testSupabaseConnection({ url: customUrl, anonKey: customAnonKey });
    setIsTestingConnection(false);

    if (testRes.success) {
      saveSupabaseConfig(customUrl, customAnonKey);
      setSupabaseConfig({ url: customUrl, anonKey: customAnonKey, source: 'custom' });
      setSyncMessage({ type: 'success', text: '¡Conexión verificada y guardada con éxito!' });
      setShowConfigDrawer(false);
      // Disparar sincronización inicial
      handleManualSync();
    } else {
      setSyncMessage({ type: 'error', text: testRes.message });
    }
  };

  const handleTestExistingConnection = async () => {
    setIsTestingConnection(true);
    const testRes = await testSupabaseConnection();
    setIsTestingConnection(false);
    if (testRes.success) {
      setSyncMessage({ type: 'success', text: testRes.message });
    } else {
      setSyncMessage({ type: 'error', text: testRes.message });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
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

  const handleReset = () => {
    if (confirm('¿Estás seguro de que deseas reiniciar todo el progreso acumulado? Esta acción no se puede deshacer.')) {
      const fresh = getInitialState();
      onUpdateState(fresh);
      setSyncMessage({ type: 'info', text: 'El progreso ha sido reiniciado a cero.' });
    }
  };

  const configured = isSupabaseConfigured();

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
      </div>

      {/* CLOUD SYNC & MULTI-DEVICE PERSISTENCE CARD */}
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
                Sincronización en la Nube y Multi-Dispositivo
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Guarda tu progreso en la nube y continúa exactamente donde lo dejaste en tu teléfono o computadora.
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
                : configured && syncStatus === 'synced'
                ? 'rgba(16, 185, 129, 0.12)'
                : configured
                ? 'rgba(99, 102, 241, 0.12)'
                : 'rgba(148, 163, 184, 0.12)',
              color: isSyncingLocal || syncStatus === 'syncing'
                ? 'var(--accent, #f59e0b)'
                : configured && syncStatus === 'synced'
                ? 'var(--success, #10b981)'
                : configured
                ? 'var(--primary, #6366f1)'
                : 'var(--text-muted, #94a3b8)',
              border: '1px solid currentColor'
            }}>
              {isSyncingLocal || syncStatus === 'syncing' ? (
                <>
                  <CloudSync size={14} className="animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : configured && syncStatus === 'synced' ? (
                <>
                  <CloudCheck size={14} />
                  <span>Sincronizado con la nube</span>
                </>
              ) : configured ? (
                <>
                  <Cloud size={14} />
                  <span>Nube lista</span>
                </>
              ) : (
                <>
                  <CloudOff size={14} />
                  <span>Modo Local (Sin sincronización)</span>
                </>
              )}
            </div>

            {configured && (
              <button
                className="btn btn-outline btn-sm"
                onClick={handleManualSync}
                disabled={isSyncingLocal}
                title="Sincronizar ahora con la nube"
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
            : 'rgba(245, 158, 11, 0.08)',
          border: `1px solid ${authUser ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: authUser ? 'var(--success, #10b981)' : 'var(--accent, #f59e0b)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.98rem' }}>
                  {authUser ? `Sesión Activa: ${authUser.email}` : 'Sesión Local (Invitado)'}
                </strong>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 600,
                  background: authUser ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: authUser ? 'var(--success, #10b981)' : 'var(--accent, #f59e0b)'
                }}>
                  {authUser ? '🔒 RLS Protegido' : '⚠️ Sin Cuenta'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {authUser 
                  ? 'Tus datos están protegidos en PostgreSQL. Solo tu token de sesión autenticado puede leer o modificar tu progreso.'
                  : 'Crea una cuenta o inicia sesión para blindar tu progreso y sincronizar automáticamente entre tus dispositivos.'}
              </p>
            </div>
          </div>

          <div>
            {authUser ? (
              <button
                className="btn btn-outline btn-sm"
                onClick={onSignOut}
                style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>Cerrar Sesión</span>
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={onOpenAuth}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <ShieldCheck size={15} />
                <span>Iniciar Sesión / Crear Cuenta</span>
              </button>
            )}
          </div>
        </div>

        {/* Pairing Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 16,
          padding: 16,
          background: 'var(--bg-main)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          marginBottom: 16
        }}>
          {/* Column 1: This Device's Sync Code */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Laptop size={16} color="var(--primary)" />
              <strong style={{ fontSize: '0.92rem' }}>Código de este dispositivo</strong>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              Comparte este código con tu celular o tablet para estudiar en ambos dispositivos sin perder nada.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '1.05rem',
                fontWeight: 700,
                letterSpacing: '1px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--primary)',
                textAlign: 'center'
              }}>
                {currentSyncCode || 'CARGANDO...'}
              </code>
              <button
                className="btn btn-outline"
                onClick={handleCopyCode}
                title="Copiar código"
                style={{ padding: '10px 12px' }}
              >
                {copiedCode ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
              </button>
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {copiedCode ? '¡Copiado al portapapeles!' : 'Privado y seguro'}
              </span>
              <button
                onClick={handleGenerateNewCode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Generar nuevo código
              </button>
            </div>
          </div>

          {/* Column 2: Link another device */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Smartphone size={16} color="var(--accent)" />
              <strong style={{ fontSize: '0.92rem' }}>Vincular otro dispositivo</strong>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              Escribe el código generado en tu otro dispositivo para combinar el progreso de ambos.
            </p>
            <form onSubmit={handleLinkDevice} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={inputDeviceCode}
                onChange={(e) => setInputDeviceCode(e.target.value.toUpperCase())}
                placeholder="Ej: NIH-7K2M-9P4W"
                maxLength={20}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!inputDeviceCode.trim() || isSyncingLocal}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
              >
                <Link size={15} />
                <span>Vincular</span>
              </button>
            </form>
            <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Fusión inteligente: combina kanjis, vocabulario y XP sin sobreescribir.
            </div>
          </div>
        </div>

        {/* Database Configuration Accordion / Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} color={configured ? 'var(--success)' : 'var(--text-muted)'} />
            <span>
              {configured
                ? `Base de datos conectada (${supabaseConfig.source === 'env' ? 'Variables de entorno' : 'Configuración personalizada'})`
                : 'Base de datos no configurada. Conecta Supabase en 2 minutos para activar la sincronización.'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {configured && (
              <button
                className="btn btn-outline btn-sm"
                onClick={handleTestExistingConnection}
                disabled={isTestingConnection}
                style={{ fontSize: '0.8rem' }}
              >
                {isTestingConnection ? 'Probando...' : 'Probar conexión'}
              </button>
            )}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Settings size={14} />
              <span>{showConfigDrawer ? 'Ocultar ajustes de BD' : 'Ajustes de Supabase'}</span>
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowSqlDrawer(!showSqlDrawer)}
              style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Code size={14} />
              <span>{showSqlDrawer ? 'Ocultar Script SQL' : 'Ver Script SQL'}</span>
            </button>
          </div>
        </div>

        {/* Config Drawer */}
        {showConfigDrawer && (
          <div style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 10,
            background: 'var(--bg-main)',
            border: '1px solid var(--border)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.98rem', fontWeight: 700 }}>
              Configuración de Supabase
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              Crea un proyecto gratis en{' '}
              <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                supabase.com
              </a>{' '}
              y copia aquí tu URL de proyecto y tu clave anónima (Anon Key), o configúralas en Vercel con las variables <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </p>

            <form onSubmit={handleSaveCustomConfig}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://xyzabcdefg.supabase.co"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                  Supabase Anon Public Key (API Key)
                </label>
                <input
                  type="password"
                  value={customAnonKey}
                  onChange={(e) => setCustomAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                {supabaseConfig.source === 'custom' && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => {
                      clearSupabaseConfig();
                      setSupabaseConfig(getSupabaseConfig());
                      setCustomUrl('');
                      setCustomAnonKey('');
                      setSyncMessage({ type: 'info', text: 'Configuración personalizada eliminada.' });
                    }}
                  >
                    Restablecer
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? 'Verificando...' : 'Guardar y Conectar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SQL Drawer */}
        {showSqlDrawer && (
          <div style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 10,
            background: 'var(--bg-main)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                Script SQL para Supabase (Crear tabla <code>user_progress</code>)
              </h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href="https://supabase.com/dashboard/project/ttlwngmidibgcuqsrvnb/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)' }}
                >
                  <ExternalLink size={14} />
                  <span>Abrir SQL Editor en Supabase</span>
                </a>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleCopySql}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {copiedSql ? <Check size={14} color="#fff" /> : <Copy size={14} />}
                  <span>{copiedSql ? '¡Copiado!' : 'Copiar Script SQL'}</span>
                </button>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 10 }}>
              Pega este código en el <strong>SQL Editor</strong> de tu panel de Supabase y pulsa <strong>Run</strong>:
            </p>
            <pre style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 12,
              fontSize: '0.8rem',
              overflowX: 'auto',
              maxHeight: 220,
              color: 'var(--text-main)'
            }}>
              {SQL_SCRIPT}
            </pre>
          </div>
        )}
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
