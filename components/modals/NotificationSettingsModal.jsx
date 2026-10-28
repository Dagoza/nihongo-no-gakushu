'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  Clock, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  RotateCcw, 
  Play,
  Zap,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../lib/AppContext';
import {
  isNotificationSupported,
  getNotificationPermission,
  isDailyReminderEnabled,
  setDailyReminderEnabled,
  getNotificationSchedule,
  saveNotificationSchedule,
  resetNotificationSchedule,
  requestNotificationPermission,
  sendTestNotification,
  getNextScheduledNotification,
  DEFAULT_ACTIVITIES
} from '../../lib/notificationManager';
import {
  getKanjiOfTheDay,
  getWordOfTheDay,
  getParticleOfTheDay,
  getRandomCulturalNugget,
  getFsrsDueNotification
} from '../../lib/notificationContent';
import { getDueCounts } from '../../lib/srs';
import useFocusTrap from '../../lib/useFocusTrap';

export default function NotificationSettingsModal({
  isOpen,
  onClose
}) {
  const modalCardRef = useFocusTrap(isOpen);
  const { appState } = useApp();

  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState('default');
  const [masterEnabled, setMasterEnabled] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [testStatus, setTestStatus] = useState(null); // 'sending' | 'sent' | 'error'
  const [testingId, setTestingId] = useState(null);
  const [nextNotif, setNextNotif] = useState(null);

  // Información dinámica de hoy para mostrar en vista previa viva
  const todayKanji = useMemo(() => getKanjiOfTheDay(), []);
  const todayWord = useMemo(() => getWordOfTheDay(), []);
  const todayParticle = useMemo(() => getParticleOfTheDay(), []);
  const todayNugget = useMemo(() => getRandomCulturalNugget(0), []);
  const dueCounts = useMemo(() => getDueCounts(appState || {}), [appState]);
  const fsrsPreview = useMemo(() => getFsrsDueNotification(appState || {}), [appState]);

  const refreshState = useCallback(() => {
    if (typeof window === 'undefined') return;
    setSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
    setMasterEnabled(isDailyReminderEnabled());
    setSchedule(getNotificationSchedule());
    setNextNotif(getNextScheduledNotification());
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshState();
    }
  }, [isOpen, refreshState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Manejar switch general de notificaciones
  const handleToggleMaster = async () => {
    if (!masterEnabled) {
      if (permission !== 'granted') {
        const granted = await requestNotificationPermission();
        if (granted) {
          setPermission('granted');
          setMasterEnabled(true);
          refreshState();
        } else {
          setPermission(getNotificationPermission());
          setMasterEnabled(false);
        }
      } else {
        setDailyReminderEnabled(true);
        setMasterEnabled(true);
        refreshState();
      }
    } else {
      setDailyReminderEnabled(false);
      setMasterEnabled(false);
      refreshState();
    }
  };

  // Solicitar permiso manualmente
  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermission('granted');
      setMasterEnabled(true);
      refreshState();
    } else {
      setPermission(getNotificationPermission());
    }
  };

  // Alternar una actividad específica (switch ON/OFF)
  const handleToggleActivity = (activityId) => {
    const updated = schedule.map(act => {
      if (act.id === activityId) {
        return { ...act, enabled: !act.enabled };
      }
      return act;
    });
    setSchedule(updated);
    saveNotificationSchedule(updated);
    setNextNotif(getNextScheduledNotification());
  };

  // Cambiar la hora de una actividad
  const handleTimeChange = (activityId, newTime) => {
    const updated = schedule.map(act => {
      if (act.id === activityId) {
        return { ...act, time: newTime };
      }
      return act;
    });
    setSchedule(updated);
    saveNotificationSchedule(updated);
    setNextNotif(getNextScheduledNotification());
  };

  // Probar una actividad individual o general
  const handleTest = async (activityId = null) => {
    if (permission !== 'granted') {
      const ok = await requestNotificationPermission();
      if (!ok) {
        setTestStatus('error');
        setTimeout(() => setTestStatus(null), 3000);
        return;
      }
      setPermission('granted');
      setMasterEnabled(true);
    }

    setTestingId(activityId || 'all');
    setTestStatus('sending');

    try {
      const success = await sendTestNotification(activityId, appState || {});
      if (success) {
        setTestStatus('sent');
      } else {
        setTestStatus('error');
      }
    } catch {
      setTestStatus('error');
    }

    setTimeout(() => {
      setTestStatus(null);
      setTestingId(null);
    }, 3000);
  };

  // Aplicar plantilla rápida
  const handleApplyPreset = (presetName) => {
    let updated;
    if (presetName === 'recommended') {
      updated = DEFAULT_ACTIVITIES.map(a => ({
        ...a,
        enabled: a.id !== 'night_story' && a.id !== 'random_pill'
      }));
    } else if (presetName === 'light') {
      updated = DEFAULT_ACTIVITIES.map(a => ({
        ...a,
        enabled: a.id === 'morning_kanji' || a.id === 'evening_daily_goal'
      }));
    } else if (presetName === 'intensive') {
      updated = DEFAULT_ACTIVITIES.map(a => ({
        ...a,
        enabled: true
      }));
    }
    if (updated) {
      setSchedule(updated);
      saveNotificationSchedule(updated);
      setNextNotif(getNextScheduledNotification());
    }
  };

  // Restablecer por defecto
  const handleResetDefaults = () => {
    const def = resetNotificationSchedule();
    setSchedule(def);
    setNextNotif(getNextScheduledNotification());
  };

  return (
    <div 
      className="notif-modal-backdrop" 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={modalCardRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-modal-title"
        className="notif-modal-container" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="notif-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              flexShrink: 0
            }}>
              <BellRing size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 id="notif-modal-title" style={{ fontSize: '1.12rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Recordatorios Dinámicos
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Kanjis, vocabulario, alertas FSRS y píldoras al instante
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            title="Cerrar (Esc)"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 6,
              borderRadius: '50%',
              display: 'flex',
              flexShrink: 0
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="notif-modal-body">
          {/* Banner de Estado de Permisos */}
          {!supported ? (
            <div style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.82rem',
              color: '#ef4444'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>Este navegador no soporta la API de notificaciones web.</span>
            </div>
          ) : permission === 'denied' ? (
            <div style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: '0.8rem',
              color: 'var(--text-main)'
            }}>
              <AlertCircle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#f59e0b', display: 'block', marginBottom: 2 }}>
                  Notificaciones bloqueadas por el navegador
                </strong>
                Habilita los permisos del sitio en tu navegador o celular para recibir recordatorios dinámicos.
              </div>
            </div>
          ) : permission !== 'granted' ? (
            <div style={{
              padding: '12px 14px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: '200px' }}>
                <Sparkles size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    Activar en este celular / navegador
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Recibe kanjis, palabras del día, alertas FSRS y salva tu racha
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleRequestPermission}
                style={{ whiteSpace: 'nowrap', borderRadius: 10, padding: '7px 14px', fontSize: '0.8rem' }}
              >
                Conceder Permiso
              </button>
            </div>
          ) : (
            <div style={{
              padding: '9px 12px',
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 6,
              fontSize: '0.8rem',
              color: '#10b981'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} />
                <span style={{ fontWeight: 600 }}>Notificaciones activas en este dispositivo</span>
              </div>
              {nextNotif && (
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Próximo: <strong>{nextNotif.activity.iconEmoji} {nextNotif.time}</strong> ({nextNotif.relative})
                </span>
              )}
            </div>
          )}

          {/* Master Toggle Card */}
          <div style={{
            padding: '14px 16px',
            borderRadius: 14,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} style={{ color: 'var(--primary)' }} />
                <span>Recordatorios Automáticos y FSRS</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {masterEnabled 
                  ? 'Activo: recibirás notificaciones dinámicas y avisos cuando haya FSRS listos' 
                  : 'Pausado: no recibirás avisos'}
              </div>
            </div>

            <label className="notif-toggle-switch">
              <input 
                type="checkbox" 
                checked={masterEnabled} 
                onChange={handleToggleMaster}
              />
              <span className="notif-toggle-slider" />
            </label>
          </div>

          {/* Tarjeta de Vista Previa Dinámica Viva de Hoy */}
          <div style={{
            padding: '12px 14px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(16, 185, 129, 0.06))',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} />
                <span>Vista Previa de Notificaciones Dinámicas de Hoy</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Cambian a diario y son interactivas
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 8,
              fontSize: '0.74rem'
            }}>
              {/* Kanji de hoy */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid var(--border)'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700 }}>🌅 KANJI DEL DÍA</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                  【{todayKanji.kanji}】 {todayKanji.meaning_es}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.67rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {todayKanji.onyomi}
                </div>
              </div>

              {/* Palabra de hoy */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid var(--border)'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700 }}>🍱 PALABRA DEL DÍA</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                  【{todayWord.word}】
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.67rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {todayWord.meaning_es}
                </div>
              </div>

              {/* FSRS Status */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid var(--border)'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700 }}>🧠 ESTADO FSRS</div>
                <div style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: 800, 
                  color: dueCounts.total > 0 ? 'var(--accent, #f59e0b)' : '#10b981', 
                  marginTop: 2 
                }}>
                  {dueCounts.total > 0 ? `${dueCounts.total} por repasar` : 'Al día ✨'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.67rem' }}>
                  {dueCounts.vocab} vcb · {dueCounts.kanji} knj
                </div>
              </div>

              {/* Píldora / Proverbio */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid var(--border)'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700 }}>💡 PÍLDORA CULTURAL</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                  {todayNugget.expression}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.67rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {todayNugget.meaning}
                </div>
              </div>
            </div>
          </div>

          {/* Plantillas / Presets Rápidos */}
          <div className="notif-presets-bar" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            padding: '2px 0'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Plantillas de estudio:
            </span>
            <div className="notif-presets-buttons-wrap" style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleApplyPreset('recommended')}
                style={{ fontSize: '0.73rem', padding: '5px 10px', borderRadius: 8 }}
                title="Activa Kanji, Vocabulario, FSRS, Partículas y Reto Diario"
              >
                🌟 Recomendada
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleApplyPreset('light')}
                style={{ fontSize: '0.73rem', padding: '5px 10px', borderRadius: 8 }}
                title="Solo Kanji matutino y Reto Diario nocturno"
              >
                ⚡ Ligera (2)
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleApplyPreset('intensive')}
                style={{ fontSize: '0.73rem', padding: '5px 10px', borderRadius: 8 }}
                title="Activa todas las actividades disponibles"
              >
                📚 Todas ({DEFAULT_ACTIVITIES.length})
              </button>
            </div>
          </div>

          {/* Lista de Actividades a lo largo del día */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Actividades Programadas</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                ({schedule.filter(s => s.enabled).length} de {schedule.length} activas)
              </span>
            </div>

            {schedule.map((activity) => {
              const isCardActive = activity.enabled && masterEnabled;

              // Datos dinámicos contextuales para cada actividad
              let dynamicSubtext = null;
              if (activity.id === 'morning_kanji') {
                dynamicSubtext = `Hoy: 【${todayKanji.kanji}】 ${todayKanji.meaning_es} (${todayKanji.level})`;
              } else if (activity.id === 'lunch_vocab') {
                dynamicSubtext = `Hoy: 【${todayWord.word}】 ${todayWord.meaning_es}`;
              } else if (activity.id === 'fsrs_due') {
                dynamicSubtext = dueCounts.total > 0
                  ? `🚨 ${dueCounts.total} tarjetas pendientes listas para repasar`
                  : `✨ No hay repasos pendientes en este momento`;
              } else if (activity.id === 'afternoon_particles') {
                dynamicSubtext = `Hoy: Partícula 【${todayParticle.particle}】 · ${todayParticle.role_es}`;
              } else if (activity.id === 'random_pill') {
                dynamicSubtext = `Hoy: 【${todayNugget.expression}】 · ${todayNugget.meaning}`;
              } else if (activity.id === 'evening_daily_goal') {
                const pending = Math.max(1, (appState?.dailyGoal?.target || 5) - (appState?.dailyGoal?.answeredToday || 0));
                dynamicSubtext = `Racha actual: ${appState?.streak || 1} días 🔥 · ${pending} preguntas pendientes`;
              }

              return (
                <div 
                  key={activity.id}
                  className={`notif-activity-card ${isCardActive ? 'enabled' : 'disabled'}`}
                >
                  {/* Fila 1: Header con Emoji, Título, Badge de Ruta y Switch ON/OFF */}
                  <div className="notif-activity-top-row">
                    <div className="notif-activity-title-group">
                      <div className="notif-activity-emoji">
                        {activity.iconEmoji}
                      </div>
                      <div className="notif-activity-title-wrap">
                        <div className="notif-activity-title">
                          <span>{activity.name}</span>
                          <span className="notif-activity-badge">
                            {activity.url}
                          </span>
                        </div>
                        {dynamicSubtext && (
                          <div style={{ 
                            fontSize: '0.71rem', 
                            color: activity.id === 'fsrs_due' && dueCounts.total > 0 ? 'var(--accent, #f59e0b)' : 'var(--primary)',
                            fontWeight: 600,
                            marginTop: 2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {dynamicSubtext}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Switch de activación de la actividad */}
                    <label className="notif-toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={activity.enabled} 
                        onChange={() => handleToggleActivity(activity.id)}
                      />
                      <span className="notif-toggle-slider" />
                    </label>
                  </div>

                  {/* Fila 2: Descripción pedagógica legible */}
                  <p className="notif-activity-desc">
                    {activity.description}
                  </p>

                  {/* Fila 3: Barra de controles (Selector de hora y botón de prueba) */}
                  <div className="notif-activity-controls-bar">
                    <div className="notif-activity-time-wrap">
                      <Clock size={14} style={{ color: 'var(--primary)' }} />
                      <span>Hora:</span>
                      <input
                        type="time"
                        value={activity.time}
                        disabled={!activity.enabled || !masterEnabled}
                        onChange={(e) => handleTimeChange(activity.id, e.target.value)}
                        className="notif-activity-time-input"
                        style={{
                          cursor: activity.enabled && masterEnabled ? 'pointer' : 'not-allowed',
                          opacity: activity.enabled && masterEnabled ? 1 : 0.5
                        }}
                      />
                    </div>

                    <div className="notif-activity-actions-wrap">
                      <button
                        type="button"
                        onClick={() => handleTest(activity.id)}
                        disabled={testingId === activity.id}
                        title={`Enviar prueba dinámica de ${activity.name}`}
                        className="notif-test-btn"
                        style={{
                          opacity: testingId === activity.id ? 0.6 : 1
                        }}
                      >
                        <Play size={11} style={{ fill: 'currentColor' }} />
                        <span>{testingId === activity.id ? 'Enviando...' : 'Probar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback de prueba */}
          {testStatus && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: testStatus === 'sent' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${testStatus === 'sent' ? '#10b981' : '#ef4444'}`,
              color: testStatus === 'sent' ? '#10b981' : '#ef4444',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              {testStatus === 'sent' ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>
                {testStatus === 'sent' 
                  ? '¡Notificación dinámica enviada con éxito! Revisa la barra de tu dispositivo.' 
                  : 'No se pudo mostrar la notificación. Revisa que los permisos estén concedidos en el navegador.'}
              </span>
            </div>
          )}

          {/* Botón de Restablecer Valores */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 2 }}>
            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <RotateCcw size={12} />
              <span>Restablecer horarios por defecto</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="notif-modal-footer">
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Se guardan automáticamente en este dispositivo
          </span>

          <div className="notif-modal-footer-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleTest(null)}
              style={{ borderRadius: 10, gap: 6 }}
            >
              <Bell size={14} />
              <span>Probar General</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onClose}
              style={{ borderRadius: 10, padding: '8px 20px' }}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
