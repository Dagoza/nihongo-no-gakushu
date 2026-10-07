'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Play 
} from 'lucide-react';
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
import { useApp } from '../../lib/AppContext';

export default function NotificationSettingsModal({
  isOpen,
  onClose
}) {
  const contextApp = useApp();
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState('default');
  const [masterEnabled, setMasterEnabled] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [testStatus, setTestStatus] = useState(null); // 'sending' | 'sent' | 'error'
  const [testingId, setTestingId] = useState(null);
  const [nextNotif, setNextNotif] = useState(null);

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
      const success = await sendTestNotification(activityId);
      if (success) {
        setTestStatus('sent');
      } else {
        setTestStatus('error');
      }
    } catch (e) {
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
        enabled: a.id !== 'night_story'
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
      <div className="notif-modal-container" onClick={(e) => e.stopPropagation()}>
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
              <h3 style={{ fontSize: '1.12rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Recordatorios Diarios
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Organiza tus micro-hábitos de estudio en japonés
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
                Habilita los permisos del sitio en tu navegador o celular para poder recibir los recordatorios.
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
                    Recibe tus avisos de kanji, vocabulario y racha en el horario fijado
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
                <span style={{ fontWeight: 600 }}>Permisos activos en este dispositivo</span>
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
                <span>Recordatorios Automáticos</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {masterEnabled 
                  ? 'Activo: se enviarán notificaciones según tus horarios' 
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
                title="Activa Kanji, Vocabulario, Partículas y Reto Diario"
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
                title="Activa las 5 actividades completas"
              >
                📚 Todas (5)
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
                        title={`Enviar prueba de ${activity.name}`}
                        className="notif-test-btn"
                      >
                        <Play size={11} style={{ fill: 'currentColor' }} />
                        <span>Probar</span>
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
                  ? '¡Notificación de prueba enviada con éxito a tu dispositivo!' 
                  : 'No se pudo mostrar la notificación. Revisa que los permisos estén concedidos.'}
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
            Los cambios se guardan automáticamente
          </span>

          <div className="notif-modal-footer-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleTest(null)}
              style={{ borderRadius: 10, gap: 6 }}
            >
              <Bell size={14} />
              <span>Probar</span>
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
