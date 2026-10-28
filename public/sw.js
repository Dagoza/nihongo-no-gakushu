// Nihongo Master Service Worker
const CACHE_NAME = 'nihongo-master-v11';
const OFFLINE_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon-192x192.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico'
];

// Almacenamiento en memoria para elementos dinámicos sincronizados desde la aplicación cliente
let syncedDynamicItems = null;

// Catálogo curado integrado para notificaciones push dinámicas y modo offline
const SW_KANJI_CATALOG = [
  { kanji: '日', meaning: 'Sol / Día', on: 'ニチ, ジツ', kun: 'ひ, -び', level: 'N5', word: '日本 (Japón)' },
  { kanji: '月', meaning: 'Luna / Mes', on: 'ゲツ, ガツ', kun: 'つき', level: 'N5', word: '今月 (este mes)' },
  { kanji: '水', meaning: 'Agua', on: 'スイ', kun: 'みず', level: 'N5', word: '水曜日 (miércoles)' },
  { kanji: '火', meaning: 'Fuego', on: 'カ', kun: 'ひ', level: 'N5', word: '火曜日 (martes)' },
  { kanji: '木', meaning: 'Árbol / Madera', on: 'モク, ボク', kun: 'き', level: 'N5', word: '木曜日 (jueves)' },
  { kanji: '金', meaning: 'Oro / Dinero', on: 'キン', kun: 'かね', level: 'N5', word: 'お金 (dinero)' },
  { kanji: '土', meaning: 'Tierra / Suelo', on: 'ド, ト', kun: 'つち', level: 'N5', word: '土曜日 (sábado)' },
  { kanji: '学', meaning: 'Estudio / Aprender', on: 'ガク', kun: 'まな・ぶ', level: 'N5', word: '学校 (escuela)' },
  { kanji: '生', meaning: 'Vida / Nacer', on: 'セイ, ショウ', kun: 'い・きる, う・まれる', level: 'N5', word: '先生 (profesor)' },
  { kanji: '本', meaning: 'Libro / Origen', on: 'ホン', kun: 'もと', level: 'N5', word: '日本語 (idioma japonés)' },
  { kanji: '人', meaning: 'Persona', on: 'ジン, ニン', kun: 'ひと', level: 'N5', word: '日本人 (persona japonesa)' },
  { kanji: '大', meaning: 'Grande', on: 'ダイ, タイ', kun: 'おお・きい', level: 'N5', word: '大学 (universidad)' },
  { kanji: '小', meaning: 'Pequeño', on: 'ショウ', kun: 'ちい・さい', level: 'N5', word: '小学校 (escuela primaria)' },
  { kanji: '友', meaning: 'Amigo', on: 'ユウ', kun: 'とも', level: 'N5', word: '友達 (amigos)' },
  { kanji: '食', meaning: 'Comer / Comida', on: 'ショク', kun: 'た・べる', level: 'N5', word: '食べ物 (comida)' },
  { kanji: '飲', meaning: 'Beber', on: 'イン', kun: 'の・む', level: 'N5', word: '飲み物 (bebida)' },
  { kanji: '時', meaning: 'Tiempo / Hora', on: 'ジ', kun: 'とき', level: 'N5', word: '時間 (tiempo / horas)' },
  { kanji: '道', meaning: 'Camino / Vía', on: 'ドウ, トウ', kun: 'みち', level: 'N4', word: '柔道 (Judo - vía suave)' },
  { kanji: '心', meaning: 'Corazón / Mente', on: 'シン', kun: 'こころ', level: 'N4', word: '安心 (tranquilidad)' },
  { kanji: '旅', meaning: 'Viaje', on: 'リョ', kun: 'たび', level: 'N4', word: '旅行 (viaje)' },
  { kanji: '桜', meaning: 'Cerezo / Flor de cerezo', on: 'オウ', kun: 'さくら', level: 'N3', word: '桜前線 (frente del cerezo)' },
  { kanji: '愛', meaning: 'Amor', on: 'アイ', kun: 'いと・しい', level: 'N3', word: '愛情 (afecto)' },
  { kanji: '夢', meaning: 'Sueño', on: 'ム', kun: 'ゆめ', level: 'N3', word: '夢中 (entusiasmado / absorto)' }
];

const SW_VOCAB_CATALOG = [
  { word: '先生', reading: 'せんせい', meaning: 'Profesor / Maestro', level: 'N5', example: '先生に質問があります。(Tengo una pregunta para el profesor).' },
  { word: '友達', reading: 'ともだち', meaning: 'Amigo', level: 'N5', example: '友達と日本語を勉強します。(Estudio japonés con un amigo).' },
  { word: '美味しい', reading: 'おいしい', meaning: 'Delicioso', level: 'N5', example: '日本のラーメンはとても美味しいです。(El ramen de Japón es delicioso).' },
  { word: '食べる', reading: 'たべる', meaning: 'Comer', level: 'N5', example: '毎日朝ごはんを食べます。(Como el desayuno todos los días).' },
  { word: '勉強', reading: 'べんきょう', meaning: 'Estudio', level: 'N5', example: '毎日日本語を勉強しています。(Estudio japonés todos los días).' },
  { word: '約束', reading: 'やくそく', meaning: 'Promesa / Cita', level: 'N4', example: '友達と約束があります。(Tengo una cita con un amigo).' },
  { word: '経験', reading: 'けいけん', meaning: 'Experiencia', level: 'N3', example: '日本への旅行は良い経験でした。(El viaje a Japón fue una gran experiencia).' },
  { word: '木漏れ日', reading: 'こもれび', meaning: 'Luz del sol filtrada entre árboles', level: 'N2', example: '木漏れ日の中を散歩しました。(Paseé bajo la luz entre los árboles).' },
  { word: '改善', reading: 'かいぜん', meaning: 'Mejora continua paso a paso', level: 'N4', example: '毎日の改善が大きな成果を生みます。(El kaizen diario genera grandes logros).' },
  { word: '感謝', reading: 'かんしゃ', meaning: 'Gratitud / Agradecimiento', level: 'N3', example: 'いつも感謝しています。(Siempre estoy agradecido).' }
];

const SW_NUGGETS_CATALOG = [
  { category: 'Proverbio', expression: '一期一会', reading: 'いちごいちえ', meaning: 'Un encuentro, una sola oportunidad en la vida', detail: 'Valora cada instante de tu práctica de japonés.', url: '/vocab?search=一期一会' },
  { category: 'Proverbio', expression: '七転び八起き', reading: 'ななころびやおき', meaning: 'Caer siete veces, levantarse ocho', detail: 'La resiliencia ante los ejercicios difíciles de kanji.', url: '/vocab?search=七転び八起き' },
  { category: 'Proverbio', expression: '猿も木から落ちる', reading: 'さるもきからおちる', meaning: 'Hasta los monos caen de los árboles', detail: 'Incluso los más avanzados se equivocan. ¡Sigue adelante!', url: '/vocab?search=猿' },
  { category: 'Cultura', expression: 'いただきます', reading: 'Itadakimasu', meaning: 'Recibo con humildad estos alimentos', detail: 'Agradecimiento tradicional antes de comer en Japón.', url: '/vocab?search=いただきます' },
  { category: 'Cultura', expression: 'お疲れ様でした', reading: 'Otsukaresama deshita', meaning: 'Gracias por tu arduo trabajo', detail: 'El saludo japonés de reconocimiento al esfuerzo mutuo.', url: '/vocab?search=疲' },
  { category: 'Filosofía', expression: '腹八分目', reading: 'Hara hachi bun me', meaning: 'Comer hasta el 80% de saciedad', detail: 'Secreto de salud y longevidad en Okinawa.', url: '/vocab?search=腹' }
];

// Install Event - Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests (mutations, posts, etc.)
  if (request.method !== 'GET') {
    return;
  }

  // Bypass API, Supabase, Next.js internal RSC data requests, and range requests (PDFs, audio streams)
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.pathname.endsWith('.pdf') ||
    url.searchParams.has('_rsc') ||
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-State-Tree') ||
    request.headers.get('range')
  ) {
    return;
  }

  // Navigation requests: Network-first, fallback to cache, then fallback to /offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) {
            return offlinePage;
          }
          return caches.match('/');
        })
    );
    return;
  }

  // Static Assets (_next/static, icons, images, fonts): Stale-While-Revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2|woff|ttf|css|js)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Nothing in cache and network failed - return fallback Response
            return new Response('Network error or offline', { status: 503, statusText: 'Service Unavailable' });
          })
      );
    })
  );
});

// Soporte de mensajes internos de la app cliente
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'SYNC_DYNAMIC_NOTIF_ITEMS' && event.data.payload) {
    syncedDynamicItems = event.data.payload;
  }
});

/**
 * Generador de contenido dinámico para notificaciones Push del celular
 * Soporta Kanji del día, Palabra del día, alertas FSRS y píldoras aleatorias
 * @param {Object} dataPayload
 * @returns {{ title: string, body: string, url: string, actionTitle: string }}
 */
function getDynamicPushNotification(dataPayload = {}) {
  // Si el push entrante trae título y texto explícito, respetarlo
  if (dataPayload.title && dataPayload.body && !dataPayload.autoGenerate) {
    return {
      title: dataPayload.title,
      body: dataPayload.body,
      url: dataPayload.url || '/?daily_goal=1',
      actionTitle: dataPayload.actionTitle || 'Abrir'
    };
  }

  const now = new Date();
  const currentHour = now.getHours();
  const dayIndex = Math.floor(now.getTime() / 86400000);

  const reqType = dataPayload.type || null;

  // 1. Si es tipo Kanji o la hora es matutina (6 a 11 hrs)
  if (reqType === 'kanji' || (!reqType && currentHour >= 6 && currentHour < 12)) {
    if (syncedDynamicItems?.kanji) {
      return {
        title: syncedDynamicItems.kanji.title,
        body: syncedDynamicItems.kanji.body,
        url: syncedDynamicItems.kanji.url,
        actionTitle: 'Ver Kanji'
      };
    }
    const k = SW_KANJI_CATALOG[dayIndex % SW_KANJI_CATALOG.length];
    return {
      title: `🌅 Kanji del Día: 【${k.kanji}】 · ${k.meaning} (${k.level})`,
      body: `On: ${k.on} | Kun: ${k.kun}. Compuesto: ${k.word}. ¡Toca para ver sus trazos!`,
      url: `/kanji?search=${encodeURIComponent(k.kanji)}`,
      actionTitle: 'Ver Kanji'
    };
  }

  // 2. Si es tipo Vocabulario o la hora es del almuerzo (12 a 14 hrs)
  if (reqType === 'vocab' || (!reqType && currentHour >= 12 && currentHour < 15)) {
    if (syncedDynamicItems?.word) {
      return {
        title: syncedDynamicItems.word.title,
        body: syncedDynamicItems.word.body,
        url: syncedDynamicItems.word.url,
        actionTitle: 'Ver Palabra'
      };
    }
    const w = SW_VOCAB_CATALOG[dayIndex % SW_VOCAB_CATALOG.length];
    return {
      title: `🍱 Palabra del Día: 【${w.word}】（${w.reading}） · ${w.level}`,
      body: `${w.meaning}. Ej: "${w.example}". ¡Toca para escucharla!`,
      url: `/vocab?search=${encodeURIComponent(w.word)}`,
      actionTitle: 'Ver Palabra'
    };
  }

  // 3. Si es tipo FSRS o media tarde (15 a 17 hrs)
  if (reqType === 'fsrs' || (!reqType && currentHour >= 15 && currentHour < 18)) {
    return {
      title: '🧠 Momento Óptimo de Repaso FSRS · Nihongo Master',
      body: 'Tienes tarjetas de vocabulario y kanji en su punto óptimo de retención. ¡Una sesión de 3 min fijará tu memoria!',
      url: '/srs',
      actionTitle: 'Repasar Ahora'
    };
  }

  // 4. Si es tipo Random / Proverbio o atardecer (18 a 20 hrs)
  if (reqType === 'random' || (!reqType && currentHour >= 18 && currentHour < 21)) {
    if (syncedDynamicItems?.nugget) {
      return {
        title: syncedDynamicItems.nugget.title,
        body: syncedDynamicItems.nugget.body,
        url: syncedDynamicItems.nugget.url || '/vocab',
        actionTitle: 'Aprender Más'
      };
    }
    const n = SW_NUGGETS_CATALOG[Math.floor(Math.random() * SW_NUGGETS_CATALOG.length)];
    return {
      title: `💡 ${n.category}: 【${n.expression}】（${n.reading}）`,
      body: `"${n.meaning}". ${n.detail}`,
      url: n.url || '/vocab',
      actionTitle: 'Ver Más'
    };
  }

  // 5. Noche (21 hrs en adelante o madrugada) -> Salvar Racha o Lectura
  if (currentHour >= 21 || currentHour < 6) {
    return {
      title: '🔥 ¡Salva tu Racha Diaria! · Nihongo Master',
      body: '¡No dejes que se apague tu llama! Completa tus preguntas de hoy antes de que termine el día.',
      url: '/?daily_goal=1',
      actionTitle: 'Completar Meta'
    };
  }

  // Fallback por defecto dinámico
  const fallbackK = SW_KANJI_CATALOG[dayIndex % SW_KANJI_CATALOG.length];
  return {
    title: `🇯🇵 Nihongo Master · Kanji 【${fallbackK.kanji}】 (${fallbackK.meaning})`,
    body: `Aprovecha tu momento libre para practicar kanjis, vocabulario y mantener tu racha activa.`,
    url: `/kanji?search=${encodeURIComponent(fallbackK.kanji)}`,
    actionTitle: 'Abrir Práctica'
  };
}

// Notifications Support (Mobile PWA & Web Push)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : '/?daily_goal=1';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una pestaña abierta, enfocarla y dirigirla a la ruta adecuada
      for (const client of clientList) {
        if ('focus' in client) {
          if (targetUrl.includes('daily_goal=1')) {
            client.postMessage({ type: 'OPEN_DAILY_GOAL' });
          } else {
            client.postMessage({ type: 'NAVIGATE_URL', url: targetUrl });
            if (client.navigate) {
              client.navigate(targetUrl);
            }
          }
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrir una nueva con la URL de la actividad
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Soporte de sincronización periódica en segundo plano (Periodic Background Sync PWA)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'nihongo-daily-reminders') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        // Si hay una ventana abierta, delegar el chequeo
        if (clientList.length > 0) {
          for (const client of clientList) {
            client.postMessage({ type: 'TRIGGER_NOTIFICATION_CHECK' });
          }
        } else {
          // Si la aplicación está cerrada en el celular, generar notificación dinámica directamente desde el SW
          const dynamicNotif = getDynamicPushNotification();
          const options = {
            body: dynamicNotif.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            tag: 'nihongo-sw-periodic-reminder',
            renotify: true,
            data: { url: dynamicNotif.url },
            actions: [
              { action: 'open', title: dynamicNotif.actionTitle || 'Abrir' }
            ]
          };
          return self.registration.showNotification(dynamicNotif.title, options);
        }
      })
    );
  }
});

// Manejador de eventos Push en el celular o navegador
self.addEventListener('push', (event) => {
  let incomingData = {};

  if (event.data) {
    try {
      incomingData = event.data.json();
    } catch (e) {
      incomingData = { body: event.data.text() };
    }
  }

  // Generar notificación dinámica e interactiva
  const dynamicNotif = getDynamicPushNotification(incomingData);

  const options = {
    body: dynamicNotif.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: incomingData.tag || 'nihongo-mobile-push',
    renotify: true,
    data: { url: dynamicNotif.url },
    actions: [
      { action: 'open', title: dynamicNotif.actionTitle || 'Comenzar Práctica' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(dynamicNotif.title, options)
  );
});
