/**
 * Notification Manager for Mobile (iOS PWA / Android) and Web Desktop
 * Manages daily goal reminders and Spaced Repetition (FSRS) prompts.
 */

const NOTIF_STORAGE_KEY = 'nihongo_daily_notif_enabled';
const LAST_REMINDER_KEY = 'nihongo_last_reminder_date';

export function isNotificationSupported() {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
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
 * Solicita permiso para notificaciones en el navegador / PWA móvil
 * @returns {Promise<boolean>}
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return false;

  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setDailyReminderEnabled(true);
      
      // Enviar notificación de confirmación al usuario
      await showLocalNotification(
        '🇯🇵 ¡Recordatorios Diarios Activados!',
        'Te avisaremos cada día con tus preguntas de práctica para que nunca pierdas tu racha.',
        { url: '/?daily_goal=1' }
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
 * Muestra una notificación local a través del Service Worker registrado
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
      ...(options.data || {})
    }
  };

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration && registration.showNotification) {
      await registration.showNotification(title, notifOptions);
      return true;
    }
    // Fallback a API de notificación directa de ventana si no hay SW activo
    new Notification(title, notifOptions);
    return true;
  } catch (err) {
    console.warn('[NotificationManager] showNotification failed:', err);
    return false;
  }
}

/**
 * Verifica si es necesario enviar el recordatorio del reto diario hoy
 * @param {Object} appState
 */
export async function checkDailyReminderScheduled(appState = {}) {
  if (typeof window === 'undefined') return;
  if (!isDailyReminderEnabled()) return;
  if (getNotificationPermission() !== 'granted') return;

  const today = new Date().toISOString().split('T')[0];
  const lastReminder = localStorage.getItem(LAST_REMINDER_KEY);

  // Si ya se envió hoy, omitir
  if (lastReminder === today) return;

  const dailyGoal = appState.dailyGoal || {};
  const isGoalCompleted = dailyGoal.date === today && dailyGoal.completed;
  if (isGoalCompleted) return;

  const streak = appState.streak || 1;
  const pending = Math.max(1, (dailyGoal.target || 5) - (dailyGoal.answeredToday || 0));

  // Enviar recordatorio
  const sent = await showLocalNotification(
    '🔥 ¡Mantén tu Racha Activa!',
    `Tienes ${pending} preguntas pendientes para cumplir tu meta diaria de hoy (Racha: ${streak} días).`,
    { tag: 'nihongo-daily-goal-reminder', url: '/?daily_goal=1' }
  );

  if (sent) {
    localStorage.setItem(LAST_REMINDER_KEY, today);
  }
}
