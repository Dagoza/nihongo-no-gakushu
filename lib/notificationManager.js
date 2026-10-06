/**
 * Notification Manager for Mobile (iOS PWA / Android) and Web Desktop
 * Manages multi-activity daily study reminders throughout the day:
 * - 🌅 Morning Kanji (Kanji del Día)
 * - 🍱 Lunch Vocabulary (Vocabulario FSRS)
 * - ☕ Afternoon Grammar (Partículas & Gramática)
 * - 🔥 Evening Streak Protector (Meta Diaria)
 * - 🌙 Night Reading (Historia Interactiva)
 */

const NOTIF_STORAGE_KEY = 'nihongo_daily_notif_enabled';
const NOTIF_SCHEDULE_KEY = 'nihongo_notif_schedule_v2';
const NOTIF_SENT_LOG_KEY = 'nihongo_notif_sent_log_v2';
const LAST_REMINDER_KEY = 'nihongo_last_reminder_date';

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
    description: 'Comienza tu mañana con un nuevo ideograma, animación de trazos y palabras compuestas.'
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
    title: '🍱 5 min de Vocabulario · Nihongo Master',
    body: 'Pausa del día: repasa vocabulario clave de tu nivel JLPT con repetición espaciada.',
    description: 'Aprovecha el almuerzo para fijar palabras en tu memoria de largo plazo con el algoritmo FSRS.'
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
    title: '☕ Momento de Gramática · Nihongo Master',
    body: '¿Dudas con は, が, を o に? Resuelve un par de oraciones y fortalece tus estructuras.',
    description: 'Pon a prueba tu comprensión de partículas esenciales y patrones de oración cotidianos.'
  },
  {
    id: 'evening_daily_goal',
    name: 'Reto Diario & Racha',
    category: 'daily_goal',
    time: '20:00',
    enabled: true,
    tag: 'nihongo-notif-daily-goal',
    url: '/?daily_goal=1',
    iconEmoji: '🔥',
    title: '🔥 ¡Salva tu Racha Diaria! · Nihongo Master',
    body: '¡No dejes que se apague tu llama! Completa tus preguntas de hoy para mantener tu racha.',
    description: 'Responde tus preguntas objetivo antes de finalizar el día y acumula experiencia XP.'
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
    description: 'Inmersión comprensiva suave con audio de hablantes nativos para terminar tu día.'
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
    const raw = localStorage.getItem(NOTIF_SCHEDULE_KEY);
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
  } catch (e) {}
  return DEFAULT_ACTIVITIES;
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
        } catch (swErr) {
          // periodicSync requiere permisos especiales o instalación PWA, continuar sin error
        }
      }

      // Enviar notificación de bienvenida y confirmación
      await showLocalNotification(
        '🇯🇵 ¡Recordatorios Diarios Activados!',
        'Recibirás recordatorios con tus actividades de japonés a lo largo del día para mantener tu racha.',
        { url: '/?daily_goal=1', tag: 'nihongo-welcome-notif' }
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
      { action: 'open', title: 'Abrir Práctica' }
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
 * Envía una notificación de prueba instantánea para verificar funcionamiento
 * @param {string|null} activityId
 */
export async function sendTestNotification(activityId = null) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const schedule = getNotificationSchedule();
  const activity = schedule.find(a => a.id === activityId) || schedule[0] || DEFAULT_ACTIVITIES[0];

  return await showLocalNotification(
    `🔔 [Prueba] ${activity.title}`,
    `¡El sistema de notificaciones funciona correctamente! ${activity.body}`,
    {
      tag: `nihongo-test-${Date.now()}`,
      url: activity.url,
      category: activity.category
    }
  );
}

/**
 * Obtiene el log de notificaciones enviadas hoy
 */
function getTodaySentLog() {
  if (typeof window === 'undefined') return {};
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
  } catch (e) {
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
  } catch (e) {}
}

/**
 * Verifica y dispara las actividades programadas que coincidan con la hora actual
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

  for (const activity of schedule) {
    if (!activity.enabled) continue;
    if (sent[activity.id]) continue; // Ya enviada hoy

    // Si es el reto diario y el usuario ya cumplió su meta de hoy, no interrumpir
    if (activity.id === 'evening_daily_goal' && isGoalCompletedToday) {
      continue;
    }

    const [actH, actM] = (activity.time || '12:00').split(':').map(Number);
    const actTotalMinutes = actH * 60 + actM;

    // Disparar si la hora ya llegó y está dentro de una ventana de tolerancia de 90 minutos
    const diff = currentTotalMinutes - actTotalMinutes;
    if (diff >= 0 && diff <= 90) {
      let customBody = activity.body;

      // Personalizar el recordatorio del reto diario con racha y preguntas pendientes
      if (activity.id === 'evening_daily_goal') {
        const streak = appState.streak || 1;
        const pending = Math.max(1, (dailyGoal.target || 5) - (dailyGoal.answeredToday || 0));
        customBody = `Tienes ${pending} preguntas pendientes para cumplir tu meta diaria de hoy (Racha: ${streak} días 🔥).`;
      }

      const ok = await showLocalNotification(
        activity.title,
        customBody,
        {
          tag: activity.tag,
          url: activity.url,
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
