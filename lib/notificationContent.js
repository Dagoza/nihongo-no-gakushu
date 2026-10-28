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
import kotowazaData from '../data/kotowaza.json';
import { getDueCounts } from './srs.js';

/**
 * Colección de proverbios japoneses (Kotowaza), modismos (Yojijukugo) y sabiduría cultural
 */
export const CULTURAL_NUGGETS = kotowazaData;

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
  const list = Array.isArray(CULTURAL_NUGGETS) && CULTURAL_NUGGETS.length > 0 ? CULTURAL_NUGGETS : [];
  if (list.length === 0) {
    return {
      id: 'koto_nana_korobi',
      category: 'Proverbio (Kotowaza)',
      expression: '七転び八起き',
      reading: 'ななころびやおき · Nana korobi ya oki',
      meaning: 'Caer siete veces, levantarse ocho',
      detail: 'El espíritu de la resiliencia japonesa: siempre vuelve a levantarte.',
      level: 'N3',
      url: '/terminology?pillar=kotowaza&id=koto_nana_korobi',
      title: '💡 Proverbio: 【七転び八起き】',
      body: '"ななころびやおき" · Caer siete veces, levantarse ocho. ¡Mantén tu constancia hoy!'
    };
  }

  const idx = typeof seed === 'number'
    ? (Math.abs(seed) % list.length)
    : Math.floor(Math.random() * list.length);

  const item = list[idx];
  const reading = `${item.kana || ''} · ${item.romaji || ''}`.trim();
  const title = `💡 ${item.category}: 【${item.expression}】`;
  const body = `"${item.kana}" · ${item.literal_es || item.meaning_es}. ${item.teaching || ''}`.trim();

  return {
    ...item,
    reading,
    meaning: item.meaning_es,
    detail: item.teaching,
    url: `/terminology?pillar=kotowaza&id=${item.id}`,
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
        url: nugget.url || '/terminology?pillar=kotowaza',
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
