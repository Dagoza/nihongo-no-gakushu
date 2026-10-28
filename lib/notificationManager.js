/**
 * Notification Manager for Mobile (iOS PWA / Android) and Web Desktop
 * Manages dynamic multi-activity daily study reminders throughout the day:
 * - 🌅 Morning Kanji (Kanji del Día dinámico con ideograma, On/Kun y compuestos)
 * - 🍱 Lunch Vocabulary (Palabra del Día dinámica con oraciones de ejemplo)
 * - 🧠 FSRS Due Reviews (Alertas inteligentes de repasos FSRS pendientes)
 * - ☕ Afternoon Grammar (Partículas & Gramática dinámica con fórmulas)
 * - 🎲 Random Cultural Pill (Proverbios Kotowaza, curiosidades y conceptos japoneses)
 * - 🔥 Evening Streak Protector (Meta Diaria con preguntas pendientes y racha)
 * - 🌙 Night Reading (Historia Interactiva nocturna)
 */

import {
  formatDynamicActivityNotification,
  getKanjiOfTheDay,
  getWordOfTheDay,
  getParticleOfTheDay,
  getRandomCulturalNugget,
  getFsrsDueNotification,
  getStreakAlertNotification,
  getDailyGoalSuccessNotification
} from './notificationContent.js';
import { getDueCounts } from './srs.js';

const NOTIF_STORAGE_KEY = 'nihongo_daily_notif_enabled';
const NOTIF_SCHEDULE_KEY = 'nihongo_notif_schedule_v3';
const NOTIF_SENT_LOG_KEY = 'nihongo_notif_sent_log_v3';
const LAST_REMINDER_KEY = 'nihongo_last_reminder_date';
const SMART_FSRS_COOLDOWN_KEY = 'nihongo_fsrs_smart_notif_last_v1';

export const DEFAULT_ACTIVITIES = [
  {
    id: 'morning_kanji',
    name: 'Kanji del Día',
    category: 'kanji',
    time: '08:30',
    enabled: true,
    tag: 'nihongo-notif-kanji',
    url: '/kanji',
    iconEmoji: '🌅',
    title: '🌅 Kanji del Día · Nihongo Master',
    body: '¡Buenos días! Aprende el kanji de hoy, sus lecturas On/Kun y practica sus trazos.',
    description: 'Comienza tu mañana con un ideograma dinámico, animación de trazos, lecturas On/Kun y palabras compuestas.'
  },
  {
    id: 'lunch_vocab',
    name: 'Vocabulario FSRS',
    category: 'vocab',
    time: '13:00',
    enabled: true,
    tag: 'nihongo-notif-vocab',
    url: '/vocab',
    iconEmoji: '🍱',
    title: '🍱 Palabra del Día & Vocabulario',
    body: 'Pausa del día: repasa vocabulario clave de tu nivel JLPT con oraciones de ejemplo y audio nativo.',
    description: 'Palabra del día dinámica con significado, lectura en hiragana, nivel JLPT y oración de ejemplo.'
  },
  {
    id: 'fsrs_due',
    name: 'Repasos FSRS Pendientes',
    category: 'fsrs',
    time: '15:00',
    enabled: true,
    tag: 'nihongo-notif-fsrs-due',
    url: '/srs',
    iconEmoji: '🧠',
    title: '🧠 Repasos FSRS Disponibles',
    body: 'Tienes tarjetas de vocabulario y kanji en su momento óptimo de retención según el algoritmo FSRS.',
    description: 'Aviso inteligente que detecta cuándo tienes tarjetas vencidas listas para consolidar en tu memoria.'
  },
  {
    id: 'afternoon_particles',
    name: 'Partículas & Gramática',
    category: 'particles',
    time: '17:30',
    enabled: true,
    tag: 'nihongo-notif-particles',
    url: '/grammar',
    iconEmoji: '☕',
    title: '☕ Partícula & Gramática del Día',
    body: 'Fortalece tus estructuras gramaticales con un análisis dinámico de partículas esenciales (は, が, を, に, で...).',
    description: 'Pon a prueba tu comprensión de partículas cotidianas con ejemplos prácticos y fórmulas claras.'
  },
  {
    id: 'random_pill',
    name: 'Píldora & Curiosidad Japonesa',
    category: 'random',
    time: '19:00',
    enabled: true,
    tag: 'nihongo-notif-random',
    url: '/terminology?pillar=kotowaza',
    iconEmoji: '🎲',
    title: '🎲 Píldora Japonesa del Momento',
    body: 'Proverbios (Kotowaza), conceptos culturales como Komorebi o Kaizen y expresiones cotidianas al azar.',
    description: 'Una micro-lección rápida e inesperada para expandir tu vocabulario y cultura japonesa en 30 segundos.'
  },
  {
    id: 'evening_daily_goal',
    name: 'Reto Diario & Racha',
    category: 'daily_goal',
    time: '20:30',
    enabled: true,
    tag: 'nihongo-notif-daily-goal',
    url: '/?daily_goal=1',
    iconEmoji: '🔥',
    title: '🔥 ¡Salva tu Racha Diaria! · Nihongo Master',
    body: '¡No dejes que se apague tu llama! Completa tus preguntas de hoy para mantener tu racha.',
    description: 'Aviso con conteo en vivo de preguntas pendientes y días de racha para no perder tu progreso.'
  },
  {
    id: 'night_story',
    name: 'Lectura Nocturna',
    category: 'story',
    time: '22:00',
    enabled: false,
    tag: 'nihongo-notif-story',
    url: '/story',
    iconEmoji: '🌙',
    title: '🌙 Historia Breve Nocturna · Nihongo Master',
    body: 'Relájate antes de dormir escuchando y leyendo una historia en japonés con furigana.',
    description: 'Inmersión comprensiva suave con audio de hablantes nativos para terminar tu día con serenidad.'
  }
];

export function isNotificationSupported() {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function isDailyReminderEnabled() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(NOTIF_STORAGE_KEY) === 'true';
}

export function setDailyReminderEnabled(enabled) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIF_STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Obtiene la configuración de horarios de las actividades
 * Fusiona con DEFAULT_ACTIVITIES para garantizar que cualquier actividad nueva esté disponible
 */
export function getNotificationSchedule() {
  if (typeof window === 'undefined') return DEFAULT_ACTIVITIES;
  try {
    const raw = localStorage.getItem(NOTIF_SCHEDULE_KEY) || localStorage.getItem('nihongo_notif_schedule_v2');
    if (!raw) return DEFAULT_ACTIVITIES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_ACTIVITIES;

    // Fusionar asegurando que todas las propiedades predeterminadas existan
    const scheduleMap = new Map(parsed.map(item => [item.id, item]));
    return DEFAULT_ACTIVITIES.map(def => {
      const saved = scheduleMap.get(def.id);
      if (!saved) return def;
      return {
        ...def,
        enabled: typeof saved.enabled === 'boolean' ? saved.enabled : def.enabled,
        time: typeof saved.time === 'string' && /^\d{2}:\d{2}$/.test(saved.time) ? saved.time : def.time
      };
    });
  } catch (e) {
    console.warn('[NotificationManager] Error reading schedule:', e);
    return DEFAULT_ACTIVITIES;
  }
}

/**
 * Guarda la programación de actividades en localStorage
 */
export function saveNotificationSchedule(schedule) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIF_SCHEDULE_KEY, JSON.stringify(schedule));
  } catch (e) {
    console.warn('[NotificationManager] Error saving schedule:', e);
  }
}

/**
 * Restablece los horarios a la configuración predeterminada recomendada
 */
export function resetNotificationSchedule() {
  if (typeof window === 'undefined') return DEFAULT_ACTIVITIES;
  try {
    localStorage.removeItem(NOTIF_SCHEDULE_KEY);
  } catch {}
  return DEFAULT_ACTIVITIES;
}

/**
 * Sincroniza los elementos dinámicos del día con el Service Worker activo
 */
export function syncDynamicItemsWithServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const kanji = getKanjiOfTheDay();
    const word = getWordOfTheDay();
    const particle = getParticleOfTheDay();
    const nugget = getRandomCulturalNugget();

    navigator.serviceWorker.ready.then(reg => {
      if (reg.active) {
        reg.active.postMessage({
          type: 'SYNC_DYNAMIC_NOTIF_ITEMS',
          payload: { kanji, word, particle, nugget }
        });
      }
    }).catch(() => {});
  } catch {}
}

/**
 * Solicita permiso para notificaciones en el navegador / PWA móvil
 * @returns {Promise<boolean>}
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return false;

  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setDailyReminderEnabled(true);

      // Registrar Background Sync periódico en Service Worker si está soportado (Chrome en Android PWA)
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if ('periodicSync' in registration) {
            await registration.periodicSync.register('nihongo-daily-reminders', {
              minInterval: 60 * 60 * 1000 // 1 hora
            });
          }
        } catch {
          // periodicSync requiere permisos especiales o instalación PWA, continuar sin error
        }
      }

      // Sincronizar catálogo dinámico con el Service Worker
      syncDynamicItemsWithServiceWorker();

      // Enviar notificación de bienvenida y confirmación dinámica con el Kanji del día
      const todayKanji = getKanjiOfTheDay();
      await showLocalNotification(
        '🇯🇵 ¡Recordatorios y Notificaciones Activados!',
        `Recibirás kanjis, vocabulario y avisos de FSRS dinámicos. Kanji de hoy: ${todayKanji.kanji} (${todayKanji.meaning_es}).`,
        { url: todayKanji.url, tag: 'nihongo-welcome-notif' }
      );
      return true;
    }
    setDailyReminderEnabled(false);
    return false;
  } catch (err) {
    console.warn('[NotificationManager] Request error:', err);
    return false;
  }
}

/**
 * Muestra una notificación local a través del Service Worker registrado o Notification API
 * @param {string} title
 * @param {string} body
 * @param {Object} options
 */
export async function showLocalNotification(title, body, options = {}) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const notifOptions = {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: options.tag || 'nihongo-daily-reminder',
    renotify: true,
    data: {
      url: options.url || '/?daily_goal=1',
      actionType: options.category || 'general',
      ...(options.data || {})
    },
    actions: [
      { action: 'open', title: options.actionTitle || 'Abrir Práctica' }
    ]
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, notifOptions);
        return true;
      }
    }
    // Fallback a API de notificación directa si no hay SW activo
    new Notification(title, notifOptions);
    return true;
  } catch (err) {
    console.warn('[NotificationManager] showNotification failed:', err);
    return false;
  }
}

/**
 * Envía una notificación de prueba instantánea y completamente dinámica
 * @param {string|null} activityId
 * @param {Object} [appState]
 */
export async function sendTestNotification(activityId = null, appState = {}) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const schedule = getNotificationSchedule();
  const activity = schedule.find(a => a.id === activityId) || schedule[0] || DEFAULT_ACTIVITIES[0];
  const dynamicPayload = formatDynamicActivityNotification(activity, appState);

  return await showLocalNotification(
    `🔔 [Prueba] ${dynamicPayload.title}`,
    `¡Notificación dinámica verificada! ${dynamicPayload.body}`,
    {
      tag: `nihongo-test-${Date.now()}`,
      url: dynamicPayload.url,
      category: activity.category
    }
  );
}

/**
 * Disparador inteligente para notificar cuando hay repasos FSRS pendientes
 * Se ejecuta al iniciar sesión o cuando el usuario entra en la aplicación
 * Cuenta con un intervalo mínimo de 4 horas para no saturar al usuario
 * @param {Object} appState
 * @returns {Promise<boolean>}
 */
export async function checkFsrsSmartNotification(appState = {}) {
  if (typeof window === 'undefined') return false;
  if (!isDailyReminderEnabled() || getNotificationPermission() !== 'granted') return false;

  const dueCounts = getDueCounts(appState);
  if (dueCounts.total < 1) return false;

  // Comprobar cooldown (mínimo 4 horas entre alertas inteligentes de FSRS para no saturar)
  const lastTs = Number(localStorage.getItem(SMART_FSRS_COOLDOWN_KEY) || 0);
  const nowTs = Date.now();
  const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

  if (nowTs - lastTs < FOUR_HOURS_MS) {
    return false;
  }

  const notif = getFsrsDueNotification(appState);
  const ok = await showLocalNotification(
    notif.title,
    notif.body,
    {
      tag: 'nihongo-notif-fsrs-smart',
      url: notif.url,
      category: 'fsrs',
      actionTitle: 'Repasar Ahora'
    }
  );

  if (ok) {
    localStorage.setItem(SMART_FSRS_COOLDOWN_KEY, String(nowTs));
  }
  return ok;
}

/**
 * Notificación celebratoria al cumplir la meta diaria
 * @param {number} streak
 */
export async function notifyDailyGoalSuccess(streak = 1) {
  if (typeof window === 'undefined') return false;
  if (!isDailyReminderEnabled() || getNotificationPermission() !== 'granted') return false;

  const notif = getDailyGoalSuccessNotification(streak);
  return await showLocalNotification(
    notif.title,
    notif.body,
    {
      tag: 'nihongo-goal-completed',
      url: '/?daily_goal=1',
      category: 'daily_goal',
      actionTitle: 'Ver Progreso'
    }
  );
}

/**
 * Obtiene el log de notificaciones enviadas hoy
 */
function getTodaySentLog() {
  if (typeof window === 'undefined') return { today: '', sent: {} };
  const today = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(NOTIF_SENT_LOG_KEY);
    if (!raw) return { today, sent: {} };
    const parsed = JSON.parse(raw);
    if (parsed.today !== today) {
      // Cambio de día: limpiar log antiguo
      const fresh = { today, sent: {} };
      localStorage.setItem(NOTIF_SENT_LOG_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return parsed;
  } catch {
    return { today, sent: {} };
  }
}

/**
 * Marca una actividad como enviada hoy
 */
function markActivitySentToday(activityId) {
  if (typeof window === 'undefined') return;
  const currentLog = getTodaySentLog();
  currentLog.sent[activityId] = Date.now();
  try {
    localStorage.setItem(NOTIF_SENT_LOG_KEY, JSON.stringify(currentLog));
  } catch {}
}

/**
 * Verifica y dispara las actividades programadas que coincidan con la hora actual
 * Genera contenido 100% dinámico para cada notificación
 * @param {Object} appState
 */
export async function checkAllScheduledActivities(appState = {}) {
  if (typeof window === 'undefined') return;
  if (!isDailyReminderEnabled()) return;
  if (getNotificationPermission() !== 'granted') return;

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  const todayStr = now.toISOString().split('T')[0];
  const { sent } = getTodaySentLog();
  const schedule = getNotificationSchedule();

  const dailyGoal = appState.dailyGoal || {};
  const isGoalCompletedToday = dailyGoal.date === todayStr && dailyGoal.completed;

  // Sincronizar elementos con el Service Worker en segundo plano
  syncDynamicItemsWithServiceWorker();

  // Revisar si corresponde una alerta inteligente de FSRS
  checkFsrsSmartNotification(appState);

  for (const activity of schedule) {
    if (!activity.enabled) continue;
    if (sent[activity.id]) continue; // Ya enviada hoy

    // Si es el reto diario y el usuario ya cumplió su meta de hoy, no interrumpir
    if (activity.id === 'evening_daily_goal' && isGoalCompletedToday) {
      continue;
    }

    // Para la actividad de FSRS, si no hay tarjetas pendientes de repaso, omitir
    if (activity.id === 'fsrs_due') {
      const dueCounts = getDueCounts(appState);
      if (dueCounts.total === 0) {
        continue;
      }
    }

    const [actH, actM] = (activity.time || '12:00').split(':').map(Number);
    const actTotalMinutes = actH * 60 + actM;

    // Disparar si la hora ya llegó y está dentro de una ventana de tolerancia de 90 minutos
    const diff = currentTotalMinutes - actTotalMinutes;
    if (diff >= 0 && diff <= 90) {
      // Formatear contenido dinámico en tiempo real
      const dynamicPayload = formatDynamicActivityNotification(activity, appState);

      const ok = await showLocalNotification(
        dynamicPayload.title,
        dynamicPayload.body,
        {
          tag: dynamicPayload.tag || activity.tag,
          url: dynamicPayload.url || activity.url,
          category: activity.category
        }
      );

      if (ok) {
        markActivitySentToday(activity.id);
        // Compatibilidad con clave histórica
        if (activity.id === 'evening_daily_goal') {
          localStorage.setItem(LAST_REMINDER_KEY, todayStr);
        }
      }
    }
  }
}

/**
 * Alias para compatibilidad con código existente
 */
export async function checkDailyReminderScheduled(appState = {}) {
  return checkAllScheduledActivities(appState);
}

/**
 * Calcula el próximo recordatorio programado
 */
export function getNextScheduledNotification() {
  if (typeof window === 'undefined') return null;
  const schedule = getNotificationSchedule().filter(a => a.enabled);
  if (schedule.length === 0) return null;

  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  // Buscar el primero que sea mayor a la hora actual hoy
  const upcomingToday = schedule
    .map(a => {
      const [h, m] = a.time.split(':').map(Number);
      return { activity: a, totalMinutes: h * 60 + m };
    })
    .filter(item => item.totalMinutes > currentTotalMinutes)
    .sort((a, b) => a.totalMinutes - b.totalMinutes);

  if (upcomingToday.length > 0) {
    const next = upcomingToday[0];
    const diffMins = next.totalMinutes - currentTotalMinutes;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const timeFormatted = hours > 0 ? `en ${hours}h ${mins}m` : `en ${mins}m`;
    return {
      activity: next.activity,
      time: next.activity.time,
      relative: timeFormatted,
      isTomorrow: false
    };
  }

  // Si ya pasaron todos hoy, el siguiente es el más temprano de mañana
  const sortedAll = [...schedule]
    .map(a => {
      const [h, m] = a.time.split(':').map(Number);
      return { activity: a, totalMinutes: h * 60 + m };
    })
    .sort((a, b) => a.totalMinutes - b.totalMinutes);

  if (sortedAll.length > 0) {
    const next = sortedAll[0];
    return {
      activity: next.activity,
      time: next.activity.time,
      relative: 'Mañana',
      isTomorrow: true
    };
  }

  return null;
}
