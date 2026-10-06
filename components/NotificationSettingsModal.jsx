'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  BellOff, 
  Clock, 
  Sparkles, 
  Check, 
  CheckCircle, 
  Flame, 
  Coffee, 
  BookOpen, 
  RotateCcw, 
  Play, 
  ShieldCheck, 
  AlertCircle 
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
} from '../lib/notificationManager';
import { useApp } from '../lib/AppContext';

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
      className="modal-backdrop" 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-main, #0f172a)',
          borderRadius: '18px',
          border: '1px solid var(--border, rgba(255,255,255,0.1))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 22px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
            }}>
              <BellRing size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Recordatorios Diarios de Estudio
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Organiza tus micro-hábitos de japonés a lo largo de tu jornada
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
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Banner de Estado de Permisos */}
          {!supported ? (
            <div style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: '0.85rem',
              color: '#ef4444'
            }}>
              <AlertCircle size={20} />
              <span>Este navegador no soporta la API de notificaciones web.</span>
            </div>
          ) : permission === 'denied' ? (
            <div style={{
              padding: '14px 16px',
              borderRadius: 12,
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              fontSize: '0.82rem',
              color: 'var(--text-main)'
            }}>
              <AlertCircle size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#f59e0b', display: 'block', marginBottom: 2 }}>
                  Notificaciones bloqueadas por el navegador
                </strong>
                Para activarlas, ingresa a la configuración del sitio o navegador en tu móvil o PC y concede permiso de notificaciones para esta página.
              </div>
            </div>
          ) : permission !== 'granted' ? (
            <div style={{
              padding: '14px 18px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Sparkles size={22} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    Activa las notificaciones en este dispositivo
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Recibe tus avisos de kanji, vocabulario y racha en el horario exacto
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleRequestPermission}
                style={{ whiteSpace: 'nowrap', borderRadius: 10, padding: '8px 14px' }}
              >
                Conceder Permiso
              </button>
            </div>
          ) : (
            <div style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              color: '#10b981'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} />
                <span style={{ fontWeight: 600 }}>Permisos activos en este celular / navegador</span>
              </div>
              {nextNotif && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Próximo: <strong>{nextNotif.activity.iconEmoji} {nextNotif.time}</strong> ({nextNotif.relative})
                </span>
              )}
            </div>
          )}

          {/* Master Toggle Card */}
          <div style={{
            padding: '16px 18px',
            borderRadius: 14,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} style={{ color: 'var(--primary)' }} />
                <span>Sistema de Recordatorios Diarios</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {masterEnabled 
                  ? 'Activo: te recordaremos tus actividades a lo largo del día' 
                  : 'Pausado: no recibirás avisos programados'}
              </div>
            </div>

            <label style={{ position: 'relative', display: 'inline-block', width: 48, height: 26, cursor: 'pointer', flexShrink: 0 }}>
              <input 
                type="checkbox" 
                checked={masterEnabled} 
                onChange={handleToggleMaster}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: masterEnabled ? 'var(--primary, #6366f1)' : 'rgba(255, 255, 255, 0.16)',
                borderRadius: 26,
                transition: '0.2s',
                display: 'block'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: 20,
                  width: 20,
                  left: masterEnabled ? 25 : 3,
                  bottom: 3,
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  transition: '0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </span>
            </label>
          </div>

          {/* Plantillas / Presets Rápidos */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            padding: '4px 0'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Plantillas de estudio:
            </span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleApplyPreset('recommended')}
                style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: 8 }}
                title="Activa Kanji, Vocabulario, Partículas y Reto Diario"
              >
                🌟 Recomendada
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleApplyPreset('light')}
                style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: 8 }}
                title="Solo Kanji matutino y Reto Diario nocturno"
              >
                ⚡ Ligera (2/día)
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleApplyPreset('intensive')}
                style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: 8 }}
                title="Activa las 5 actividades completas"
              >
                📚 Intensiva (5/día)
              </button>
            </div>
          </div>

          {/* Lista de Actividades a lo largo del día */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Actividades Programadas</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                ({schedule.filter(s => s.enabled).length} activas)
              </span>
            </div>

            {schedule.map((activity) => (
              <div 
                key={activity.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: 'var(--bg-card)',
                  border: `1px solid ${activity.enabled ? 'rgba(99, 102, 241, 0.3)' : 'var(--border)'}`,
                  opacity: masterEnabled ? 1 : 0.65,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Info & Emoji */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '1.45rem',
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {activity.iconEmoji}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ 
                      fontWeight: 700, 
                      fontSize: '0.88rem', 
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span>{activity.name}</span>
                      <span style={{
                        fontSize: '0.66rem',
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: 'rgba(99, 102, 241, 0.12)',
                        color: 'var(--primary, #6366f1)',
                        fontWeight: 600
                      }}>
                        {activity.url}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '0.73rem', 
                      color: 'var(--text-muted)',
                      marginTop: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {activity.description}
                    </div>
                  </div>
                </div>

                {/* Controles de Hora, Switch y Prueba */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {/* Selector de Hora */}
                  <input
                    type="time"
                    value={activity.time}
                    disabled={!activity.enabled || !masterEnabled}
                    onChange={(e) => handleTimeChange(activity.id, e.target.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      color: 'var(--text-main)',
                      padding: '5px 8px',
                      fontSize: '0.82rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      cursor: activity.enabled && masterEnabled ? 'pointer' : 'not-allowed',
                      opacity: activity.enabled && masterEnabled ? 1 : 0.5
                    }}
                  />

                  {/* Botón Probar Notificación */}
                  <button
                    type="button"
                    onClick={() => handleTest(activity.id)}
                    title={`Enviar prueba de ${activity.name}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      color: 'var(--text-muted)',
                      padding: '6px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Play size={12} style={{ fill: 'currentColor' }} />
                    <span className="hidden-mobile">Probar</span>
                  </button>

                  {/* Switch ON/OFF de la actividad */}
                  <label style={{ position: 'relative', display: 'inline-block', width: 38, height: 22, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={activity.enabled} 
                      onChange={() => handleToggleActivity(activity.id)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: activity.enabled ? 'var(--primary, #6366f1)' : 'rgba(255, 255, 255, 0.16)',
                      borderRadius: 22,
                      transition: '0.2s',
                      display: 'block'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: 16,
                        width: 16,
                        left: activity.enabled ? 19 : 3,
                        bottom: 3,
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        transition: '0.2s'
                      }} />
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback de prueba */}
          {testStatus && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: testStatus === 'sent' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${testStatus === 'sent' ? '#10b981' : '#ef4444'}`,
              color: testStatus === 'sent' ? '#10b981' : '#ef4444',
              fontSize: '0.82rem',
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
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
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Los cambios se guardan automáticamente
          </span>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleTest(null)}
              style={{ borderRadius: 10, gap: 6 }}
            >
              <Bell size={14} />
              <span>Probar Notificación</span>
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
