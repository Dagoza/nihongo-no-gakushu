/**
 * Generador de contenido dinámico para notificaciones locales y push en Nihongo Master.
 * Proporciona:
 * - 🌅 Kanji del Día dinámico (ideograma, lecturas On/Kun, palabras compuestas y significado)
 * - 🍱 Palabra del Día dinámica (kanji, kana, significado en español y oración de ejemplo)
 * - ☕ Partícula del Día dinámica (función, fórmula y ejemplo)
 * - 🎲 Píldoras / Curiosidades japonesas y Proverbios (Kotowaza) al azar
 * - 🧠 Notificaciones inteligentes de repasos FSRS pendientes
 * - 🔥 Alerta de salvado de racha y retos diarios
 * - 🎉 Celebración de meta diaria completada
 */

import kanjiData from '../data/kanji.json';
import vocabularyData from '../data/vocabulary.json';
import particlesData from '../data/particles.json';
import { getDueCounts } from './srs.js';

/**
 * Colección curada de proverbios japoneses (Kotowaza) y expresiones culturales profundas
 */
export const CULTURAL_NUGGETS = [
  {
    category: 'Proverbio (Kotowaza)',
    expression: '一期一会',
    reading: 'いちごいちえ · Ichigo Ichie',
    meaning: 'Un encuentro, una sola oportunidad en la vida',
    detail: 'Aprecia cada instante y cada conversación, pues ese momento jamás se repetirá de la misma forma.',
    level: 'N2',
    url: '/vocab?search=一期一会'
  },
  {
    category: 'Proverbio (Kotowaza)',
    expression: '七転び八起き',
    reading: 'ななころびやおき · Nanakorobi yaoki',
    meaning: 'Caer siete veces, levantarse ocho',
    detail: 'El espíritu de la resiliencia japonesa: no importa cuántas veces tropieces, siempre vuelve a levantarte.',
    level: 'N3',
    url: '/vocab?search=七転び八起き'
  },
  {
    category: 'Proverbio (Kotowaza)',
    expression: '猿も木から落ちる',
    reading: 'さるもきからおちる · Saru mo ki kara ochiru',
    meaning: 'Hasta los monos se caen de los árboles',
    detail: 'Incluso los más expertos pueden cometer errores. No te desanimes si fallas una respuesta hoy.',
    level: 'N3',
    url: '/vocab?search=猿'
  },
  {
    category: 'Proverbio (Kotowaza)',
    expression: '雨降って地固まる',
    reading: 'あめふってじかたまる · Ame futte ji katamaru',
    meaning: 'Tras la lluvia, el suelo se endurece',
    detail: 'Las dificultades y adversidades consolidan las relaciones y fortalecen el carácter.',
    level: 'N2',
    url: '/vocab?search=雨'
  },
  {
    category: 'Proverbio (Kotowaza)',
    expression: '花より団子',
    reading: 'はなよりだんご · Hana yori dango',
    meaning: 'Mejor albóndigas que flores',
    detail: 'Preferir lo práctico y útil por encima de lo meramente estético o superficial.',
    level: 'N3',
    url: '/vocab?search=花'
  },
  {
    category: 'Concepto Cultural',
    expression: '木漏れ日',
    reading: 'こもれび · Komorebi',
    meaning: 'La luz solar que se filtra a través de las hojas',
    detail: 'Una palabra poética japonesa que no tiene traducción directa en español.',
    level: 'N2',
    url: '/vocab?search=木漏れ日'
  },
  {
    category: 'Concepto Cultural',
    expression: '改善',
    reading: 'かいぜん · Kaizen',
    meaning: 'Mejora continua paso a paso',
    detail: 'Avanzar 1% cada día en tu japonés supera a estudiar 5 horas un solo día del mes.',
    level: 'N4',
    url: '/vocab?search=改善'
  },
  {
    category: 'Cultura Cotidiana',
    expression: 'いただきます',
    reading: 'Itadakimasu',
    meaning: 'Recibo con gratitud la vida de estos alimentos',
    detail: 'Se pronuncia con las palmas juntas antes de cada comida para agradecer a la naturaleza y al cocinero.',
    level: 'N5',
    url: '/vocab?search=いただきます'
  },
  {
    category: 'Cultura Cotidiana',
    expression: 'ごちそうさまでした',
    reading: 'Gochisousama deshita',
    meaning: 'Gracias por la comida / Fue un gran banquete',
    detail: '馳走 (Chisou) alude al esfuerzo de correr de aquí para allá para preparar un plato con amor.',
    level: 'N5',
    url: '/vocab?search=ごちそう'
  },
  {
    category: 'Cultura Cotidiana',
    expression: 'お疲れ様でした',
    reading: 'おつかれさまでした · Otsukaresama deshita',
    meaning: 'Gracias por tu arduo esfuerzo de hoy',
    detail: 'El saludo de reconocimiento mutuo más representativo del trabajo y estudio en Japón.',
    level: 'N4',
    url: '/vocab?search=疲'
  },
  {
    category: 'Concepto Filosófico',
    expression: '物の哀れ',
    reading: 'もののあわれ · Mono no aware',
    meaning: 'Sensibilidad y aprecio por lo efímero de las cosas',
    detail: 'La nostalgia bella que sentimos al ver caer los pétalos de sakura en primavera.',
    level: 'N1',
    url: '/vocab?search=物'
  },
  {
    category: 'Longevidad',
    expression: '腹八分目',
    reading: 'はらはちぶんめ · Hara hachi bun me',
    meaning: 'Comer hasta el 80% de capacidad',
    detail: 'Secreto tradicional de Okinawa para vivir con energía y lucidez mental por más de 100 años.',
    level: 'N2',
    url: '/vocab?search=腹'
  },
  {
    category: 'Proverbio (Kotowaza)',
    expression: '石の上にも三年',
    reading: 'いしのうえにもさんねん · Ishi no ue ni mo sannen',
    meaning: 'Tres años sobre una piedra fría la calentarán',
    detail: 'La perseverancia constante rinde frutos incluso en las metas que parecen imposibles.',
    level: 'N2',
    url: '/vocab?search=石'
  },
  {
    category: 'Concepto Cultural',
    expression: '幽玄',
    reading: 'ゆうげん · Yuugen',
    meaning: 'Belleza sutil, misteriosa e insondable del universo',
    detail: 'Un concepto estético central en el teatro Noh, la ceremonia del té y la pintura tradicional zen.',
    level: 'N1',
    url: '/vocab?search=幽玄'
  },
  {
    category: 'Expresión Cotidiana',
    expression: '頑張って！',
    reading: 'がんばって · Ganbatte!',
    meaning: '¡Da lo mejor de ti! ¡Persevera!',
    detail: 'El motor del aliento japonés ante exámenes, trabajo y la práctica diaria de kanji.',
    level: 'N5',
    url: '/vocab?search=頑張'
  }
];

/**
 * Función auxiliar para obtener un índice determinista basado en la fecha (YYYY-MM-DD)
 * Garantiza que todos los usuarios vean el mismo "elemento del día" hoy y cambie a la medianoche.
 */
export function getDayOfYearIndex(date = new Date()) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffTime = date.getTime() - startOfYear.getTime();
  return Math.floor(diffTime / 86400000);
}

/**
 * Obtiene el Kanji del Día dinámico
 * @param {Date} [date]
 * @param {boolean} [random]
 * @returns {Object}
 */
export function getKanjiOfTheDay(date = new Date(), random = false) {
  const list = Array.isArray(kanjiData) && kanjiData.length > 0 ? kanjiData : [];
  if (list.length === 0) {
    return {
      kanji: '日',
      meaning_es: 'Sol / Día',
      level: 'N5',
      onyomi: 'ニチ, ジツ',
      kunyomi: 'ひ, -び',
      mnemonic: 'El sol en el horizonte.',
      compoundWord: '日本 (にほん - Japón)',
      title: '🌅 Kanji del Día: 【日】 · Sol / Día (N5)',
      body: 'On: ニチ, ジツ | Kun: ひ. Compuesto: 日本 (Japón). ¡Practica sus trazos hoy!',
      url: '/kanji?search=日'
    };
  }

  const index = random 
    ? Math.floor(Math.random() * list.length)
    : (getDayOfYearIndex(date) % list.length);

  const item = list[index];
  const kanjiChar = item.kanji || '日';
  const meaning = item.meaning_es || item.meaning_en || 'Ideograma';
  const level = item.level || 'N5';
  const on = item.onyomi || '-';
  const kun = item.kunyomi || '-';

  // Buscar una palabra compuesta destacada
  let compound = '';
  if (Array.isArray(item.words) && item.words.length > 0) {
    const firstWord = item.words[0];
    compound = `${firstWord.word || ''} (${firstWord.reading || ''} - ${firstWord.meaning || ''})`;
  }

  const title = `🌅 Kanji del Día: 【${kanjiChar}】 · ${meaning} (${level})`;
  const body = compound 
    ? `On: ${on} | Kun: ${kun}. Compuesto: ${compound}. ¡Toca para practicar sus trazos!`
    : `On: ${on} | Kun: ${kun}. Nivel ${level}. ¡Toca para practicar sus trazos y lecturas!`;

  return {
    ...item,
    kanji: kanjiChar,
    meaning_es: meaning,
    level,
    onyomi: on,
    kunyomi: kun,
    compoundWord: compound,
    title,
    body,
    url: `/kanji?search=${encodeURIComponent(kanjiChar)}`
  };
}

/**
 * Obtiene la Palabra del Día dinámica
 * @param {Date} [date]
 * @param {boolean} [random]
 * @returns {Object}
 */
export function getWordOfTheDay(date = new Date(), random = false) {
  const list = Array.isArray(vocabularyData) && vocabularyData.length > 0 ? vocabularyData : [];
  if (list.length === 0) {
    return {
      kanji: '友達',
      kana: 'ともだち',
      meaning_es: 'Amigo',
      level: 'N5',
      example: '友達と日本語を勉強します。(Estudio japonés con un amigo).',
      title: '🍱 Palabra del Día: 【友達】（ともだち）',
      body: 'Significado: Amigo (N5). "友達と日本語を勉強します。" ¡Toca para escucharla y guardarla!',
      url: '/vocab?search=友達'
    };
  }

  // Filtrar preferentemente palabras con oración de ejemplo o kanji definido
  const eligible = list.filter(w => w.kanji && w.meaning_es);
  const pool = eligible.length > 0 ? eligible : list;

  const index = random 
    ? Math.floor(Math.random() * pool.length)
    : (getDayOfYearIndex(date) % pool.length);

  const item = pool[index];
  const word = item.kanji || item.kana || item.hiragana || '';
  const reading = item.kana || item.hiragana || '';
  const meaning = item.meaning_es || 'Vocabulario';
  const level = item.level || 'N5';

  let exampleSentence = '';
  if (Array.isArray(item.tatoeba_sentences) && item.tatoeba_sentences.length > 0) {
    const s = item.tatoeba_sentences[0];
    exampleSentence = `"${s.jp}" (${s.es})`;
  }

  const displayReading = reading && reading !== word ? `（${reading}）` : '';
  const title = `🍱 Palabra del Día: 【${word}】${displayReading} · ${level}`;
  const body = exampleSentence
    ? `${meaning}. Ej: ${exampleSentence}. ¡Repásala hoy!`
    : `${meaning} (${level}). ¡Añádela a tu vocabulario activo y escucha su pronunciación!`;

  return {
    ...item,
    word,
    reading,
    meaning_es: meaning,
    level,
    exampleSentence,
    title,
    body,
    url: `/vocab?search=${encodeURIComponent(word)}`
  };
}

/**
 * Obtiene la Partícula / Gramática del Día dinámica
 * @param {Date} [date]
 * @param {boolean} [random]
 * @returns {Object}
 */
export function getParticleOfTheDay(date = new Date(), random = false) {
  const list = Array.isArray(particlesData) && particlesData.length > 0 ? particlesData : [];
  if (list.length === 0) {
    return {
      particle: 'は',
      role_es: 'Marcador de tema principal',
      title: '☕ Partícula del Día: 【は】 · Tema Principal',
      body: 'Marca de qué estamos hablando. Ej: "わたしはラオです。" (Yo soy Rao). ¡Repásala en 1 minuto!',
      url: '/particles'
    };
  }

  const index = random 
    ? Math.floor(Math.random() * list.length)
    : (getDayOfYearIndex(date) % list.length);

  const item = list[index];
  const p = item.particle || 'は';
  const role = item.role_es || item.role_en || 'Partícula gramatical';
  const level = item.level || 'N5';

  let exampleStr = '';
  if (Array.isArray(item.examples) && item.examples.length > 0) {
    const ex = item.examples[0];
    exampleStr = `"${ex.ja || ''}" (${ex.es || ''})`;
  }

  const title = `☕ Gramática del Día: Partícula 【${p}】 (${level})`;
  const body = exampleStr
    ? `${role}. Ejemplo: ${exampleStr}. ¡Fortalece tus estructuras hoy!`
    : `${role}. Fórmula: ${item.formula || '[Sujeto] + ' + p}. ¡Toca para practicarla!`;

  return {
    ...item,
    particle: p,
    role_es: role,
    level,
    title,
    body,
    url: '/particles'
  };
}

/**
 * Obtiene una píldora aleatoria o proverbio cultural
 * @param {number|null} [seed]
 * @returns {Object}
 */
export function getRandomCulturalNugget(seed = null) {
  const idx = typeof seed === 'number'
    ? (Math.abs(seed) % CULTURAL_NUGGETS.length)
    : Math.floor(Math.random() * CULTURAL_NUGGETS.length);

  const item = CULTURAL_NUGGETS[idx];
  const title = `💡 ${item.category}: 【${item.expression}】`;
  const body = `"${item.reading}" · ${item.meaning}. ${item.detail}`;

  return {
    ...item,
    title,
    body
  };
}

/**
 * Genera la notificación inteligente para repasos FSRS pendientes
 * @param {Object} appState
 * @returns {Object}
 */
export function getFsrsDueNotification(appState = {}) {
  const dueCounts = getDueCounts(appState);

  if (dueCounts.total === 0) {
    return {
      total: 0,
      dueCounts,
      title: '✨ ¡Memoria al Día con FSRS!',
      body: 'No tienes repasos pendientes en este momento. ¡Excelente constancia manteniendo tu memoria activa!',
      url: '/srs',
      tag: 'nihongo-notif-fsrs-zero'
    };
  }

  let title = `🧠 ¡Tienes ${dueCounts.total} repasos FSRS listos!`;
  const parts = [];
  if (dueCounts.vocab > 0) parts.push(`${dueCounts.vocab} palabras`);
  if (dueCounts.kanji > 0) parts.push(`${dueCounts.kanji} kanjis`);
  if (dueCounts.particles > 0) parts.push(`${dueCounts.particles} partículas`);
  if (dueCounts.questions > 0) parts.push(`${dueCounts.questions} ejercicios`);

  const breakdown = parts.join(', ');

  let body = '';
  if (dueCounts.vocab > 0 && dueCounts.kanji === 0) {
    title = `🍱 ${dueCounts.vocab} palabras FSRS listas para repasar`;
    body = `El algoritmo FSRS calculó que hoy es el momento óptimo para repasarlas y no olvidarlas. ¡Repasa ahora!`;
  } else if (dueCounts.kanji > 0 && dueCounts.vocab === 0) {
    title = `🉐 ${dueCounts.kanji} kanjis FSRS listos para repasar`;
    body = `Refuerza trazos y lecturas de tus ideogramas pendientes antes de que decaiga su recuerdo.`;
  } else {
    body = `Tienes ${breakdown} en su punto óptimo de retención. ¡Una sesión de 3 minutos consolidará tu memoria!`;
  }

  return {
    total: dueCounts.total,
    dueCounts,
    title,
    body,
    url: '/srs',
    tag: 'nihongo-notif-fsrs-due'
  };
}

/**
 * Genera la notificación de alerta de racha diaria en riesgo
 * @param {Object} appState
 * @returns {Object}
 */
export function getStreakAlertNotification(appState = {}) {
  const streak = appState.streak || 1;
  const dailyGoal = appState.dailyGoal || {};
  const target = dailyGoal.target || 5;
  const answered = dailyGoal.answeredToday || 0;
  const pending = Math.max(1, target - answered);

  return {
    streak,
    pending,
    title: `🔥 ¡Salva tu Racha de ${streak} días! · Nihongo Master`,
    body: `¡No dejes que se apague tu llama! Te faltan solo ${pending} preguntas para cumplir tu meta de hoy.`,
    url: '/?daily_goal=1',
    tag: 'nihongo-notif-daily-goal'
  };
}

/**
 * Genera la notificación de celebración de meta diaria completada
 * @param {number} streak
 * @returns {Object}
 */
export function getDailyGoalSuccessNotification(streak = 1) {
  return {
    title: `🎉 ¡Meta Diaria Cumplida! · Racha de ${streak} días 🔥`,
    body: `¡Excelente disciplina! Has alcanzado tu objetivo del día y sumado experiencia XP a tu perfil.`,
    url: '/?daily_goal=1',
    tag: 'nihongo-notif-goal-celebration'
  };
}

/**
 * Formatea dinámicamente cualquier actividad programada basándose en su ID
 * @param {Object} activity
 * @param {Object} appState
 * @returns {{ title: string, body: string, url: string, tag: string }}
 */
export function formatDynamicActivityNotification(activity, appState = {}) {
  const now = new Date();

  switch (activity.id) {
    case 'morning_kanji': {
      const kanji = getKanjiOfTheDay(now);
      return {
        title: kanji.title,
        body: kanji.body,
        url: kanji.url,
        tag: activity.tag || 'nihongo-notif-kanji'
      };
    }

    case 'lunch_vocab': {
      const dueCounts = getDueCounts(appState);
      const word = getWordOfTheDay(now);
      
      // Si hay vocabulario FSRS vencido, mencionarlo en la notificación de almuerzo
      if (dueCounts.vocab > 0) {
        return {
          title: `🍱 Vocabulario FSRS (${dueCounts.vocab} pendientes) · 【${word.word}】`,
          body: `Palabra del día: "${word.meaning_es}". Además tienes ${dueCounts.vocab} tarjetas en FSRS listas para repaso.`,
          url: '/vocab',
          tag: activity.tag || 'nihongo-notif-vocab'
        };
      }

      return {
        title: word.title,
        body: word.body,
        url: word.url,
        tag: activity.tag || 'nihongo-notif-vocab'
      };
    }

    case 'fsrs_due': {
      const fsrs = getFsrsDueNotification(appState);
      return {
        title: fsrs.title,
        body: fsrs.body,
        url: fsrs.url,
        tag: activity.tag || 'nihongo-notif-fsrs-due'
      };
    }

    case 'afternoon_particles': {
      const particle = getParticleOfTheDay(now);
      return {
        title: particle.title,
        body: particle.body,
        url: particle.url,
        tag: activity.tag || 'nihongo-notif-particles'
      };
    }

    case 'random_pill': {
      const nugget = getRandomCulturalNugget();
      return {
        title: nugget.title,
        body: nugget.body,
        url: nugget.url || '/vocab',
        tag: activity.tag || 'nihongo-notif-random'
      };
    }

    case 'evening_daily_goal': {
      const streakAlert = getStreakAlertNotification(appState);
      return {
        title: streakAlert.title,
        body: streakAlert.body,
        url: streakAlert.url,
        tag: activity.tag || 'nihongo-notif-daily-goal'
      };
    }

    case 'night_story': {
      return {
        title: activity.title || '🌙 Historia Breve Nocturna · Nihongo Master',
        body: activity.body || 'Relájate antes de dormir escuchando y leyendo una historia en japonés con furigana.',
        url: activity.url || '/story',
        tag: activity.tag || 'nihongo-notif-story'
      };
    }

    default:
      return {
        title: activity.title,
        body: activity.body,
        url: activity.url,
        tag: activity.tag
      };
  }
}
