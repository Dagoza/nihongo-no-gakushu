/**
 * Gestor de datos y progreso para la sección Scriptpad
 * Maneja catálogo de unidades, lecciones modulares, estado de aprendizaje,
 * integración con FSRS para repaso de escritura a mano y persistencia en Supabase.
 */

import scriptpadUnitsData from '../data/scriptpad_units.json';
import curriculumData from '../data/curriculum.json';
import { isDue, getNewCard, ensureFsrsCard } from './srs';

/**
 * Obtiene todas las unidades filtradas opcionalmente por nivel JLPT o tipo de track
 */
export function getScriptpadUnits(filterLevel = 'all', filterTrack = 'all') {
  let units = [...scriptpadUnitsData];

  // Si se solicita la pista del currículum, transformar módulos del currículum en unidades
  if (filterTrack === 'curriculum') {
    const curriculumUnits = (curriculumData || []).map((mod, idx) => {
      const vocabList = mod.vocab_details || mod.vocabulary || [];
      const lessons = [];
      const chunkSize = 10;
      for (let i = 0; i < vocabList.length; i += chunkSize) {
        const chunk = vocabList.slice(i, i + chunkSize);
        const lNum = Math.floor(i / chunkSize) + 1;
        lessons.push({
          id: `curriculum-mod-${mod.step || idx + 1}-l${lNum}`,
          number: lNum,
          title: `${mod.title} (${lNum})`,
          japanese_title: mod.title,
          description: mod.subtitle || `Vocabulario del paso ${mod.step || idx + 1}`,
          words: chunk.map((w, wIdx) => ({
            id: w.id || `cur_v_${mod.step}_${i + wIdx}`,
            kanji: w.kanji || w.word || w.kana || '',
            hiragana: w.hiragana || w.reading || w.kana || '',
            katakana: w.katakana || '',
            romaji: w.romaji || '',
            meaning_es: w.meaning_es || w.meaning || '',
            level: mod.level || 'N5',
            category: mod.title,
            audio_url: w.audio_url || ''
          }))
        });
      }

      return {
        id: `curriculum-mod-${mod.step || idx + 1}`,
        title: `Paso ${mod.step || idx + 1}: ${mod.title}`,
        japanese_title: mod.title,
        subtitle: mod.subtitle || `${vocabList.length} palabras del currículum`,
        kanji_icon: `${mod.step || idx + 1}`,
        color: '#6366f1',
        bg_gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
        track: 'curriculum',
        total_words: vocabList.length,
        lessons_count: lessons.length,
        lessons: lessons
      };
    }).filter(u => u.total_words > 0);

    units = curriculumUnits;
  } else if (filterTrack && filterTrack !== 'all') {
    units = units.filter(u => u.track === filterTrack);
  }

  // Filtrado por nivel JLPT
  if (filterLevel && filterLevel !== 'all') {
    units = units.map(u => {
      const filteredLessons = u.lessons.map(l => {
        const filteredWords = l.words.filter(w => (w.level || 'N5').toUpperCase() === filterLevel.toUpperCase());
        return {
          ...l,
          words: filteredWords
        };
      }).filter(l => l.words.length > 0);

      const totalWords = filteredLessons.reduce((acc, l) => acc + l.words.length, 0);
      return {
        ...u,
        total_words: totalWords,
        lessons_count: filteredLessons.length,
        lessons: filteredLessons
      };
    }).filter(u => u.total_words > 0);
  }

  return units;
}

/**
 * Busca una lección específica por su ID
 */
export function getLessonById(lessonId) {
  if (!lessonId) return null;

  // 1. Buscar en unidades estándar
  for (const unit of scriptpadUnitsData) {
    const found = (unit.lessons || []).find(l => l.id === lessonId);
    if (found) {
      return {
        ...found,
        unitId: unit.id,
        unitTitle: unit.title,
        unitColor: unit.color
      };
    }
  }

  // 2. Buscar en currículum
  if (lessonId.startsWith('curriculum-mod-')) {
    const curUnits = getScriptpadUnits('all', 'curriculum');
    for (const unit of curUnits) {
      const found = (unit.lessons || []).find(l => l.id === lessonId);
      if (found) {
        return {
          ...found,
          unitId: unit.id,
          unitTitle: unit.title,
          unitColor: unit.color
        };
      }
    }
  }

  return null;
}

/**
 * Retorna el estado de completitud de una lección para el usuario actual
 */
export function getLessonStatus(lessonId, appState = {}) {
  const completedMap = appState?.completedScriptpadLessons || {};
  const record = completedMap[lessonId];
  if (!record) {
    return {
      isCompleted: false,
      stars: 0,
      score: 0,
      completedAt: null
    };
  }
  return {
    isCompleted: true,
    stars: record.stars || 3,
    score: record.score || 100,
    completedAt: record.completedAt
  };
}

/**
 * Registra la finalización de una lección en appState (sincroniza en Supabase automáticamente)
 */
export function recordLessonCompletion(lessonId, stats, appState = {}, onUpdateState) {
  if (!lessonId || !onUpdateState) return;

  const currentLessons = { ...(appState?.completedScriptpadLessons || {}) };
  const prevRecord = currentLessons[lessonId];

  const stars = stats.stars !== undefined ? stats.stars : 3;
  const score = stats.score !== undefined ? stats.score : 100;
  const totalWords = stats.totalWords || 10;

  currentLessons[lessonId] = {
    completedAt: new Date().toISOString(),
    score: Math.max(score, prevRecord?.score || 0),
    stars: Math.max(stars, prevRecord?.stars || 0),
    totalWords: totalWords
  };

  // Otorgar XP de recompensa
  const xpEarned = prevRecord ? 10 : 35;
  const currentXp = (appState?.xp || 0) + xpEarned;

  // Registrar cada palabra en scriptpadWordProgress
  const currentWordProgress = { ...(appState?.scriptpadWordProgress || {}) };
  if (Array.isArray(stats.wordsPracticed)) {
    stats.wordsPracticed.forEach(w => {
      const key = w.kanji || w.hiragana || w.id;
      if (key) {
        currentWordProgress[key] = {
          timesWritten: (currentWordProgress[key]?.timesWritten || 0) + 1,
          lastWrittenAt: new Date().toISOString(),
          mastered: true
        };
      }
    });
  }

  onUpdateState({
    ...appState,
    xp: currentXp,
    completedScriptpadLessons: currentLessons,
    scriptpadWordProgress: currentWordProgress
  });
}

/**
 * Obtiene la cola de palabras para Repaso SRS de Escritura (FSRS)
 */
export function getScriptpadSrsQueue(appState = {}, limit = 15) {
  const srsQuestions = appState?.srsQuestions || {};
  const wordProgress = appState?.scriptpadWordProgress || {};
  const queue = [];

  // 1. Recorrer palabras del catálogo
  for (const unit of scriptpadUnitsData) {
    for (const lesson of unit.lessons) {
      for (const word of lesson.words) {
        const cardKey = `sp_write_${word.kanji || word.hiragana || word.id}`;
        const card = srsQuestions[cardKey];

        if (card) {
          if (isDue(card)) {
            queue.push({
              ...word,
              cardKey,
              card: ensureFsrsCard(card),
              isNew: false
            });
          }
        } else {
          // Si el usuario ya practicó esta palabra en alguna lección, pero aún no tiene tarjeta SRS
          const key = word.kanji || word.hiragana || word.id;
          if (wordProgress[key] && queue.length < limit) {
            queue.push({
              ...word,
              cardKey,
              card: getNewCard(),
              isNew: true
            });
          }
        }

        if (queue.length >= limit) break;
      }
      if (queue.length >= limit) break;
    }
    if (queue.length >= limit) break;
  }

  // Si la cola tiene pocos elementos, agregar palabras iniciales recomendadas
  if (queue.length < 5) {
    const basics = scriptpadUnitsData[0]?.lessons[0]?.words || [];
    for (const w of basics) {
      const cardKey = `sp_write_${w.kanji || w.hiragana || w.id}`;
      if (!queue.some(item => item.cardKey === cardKey)) {
        queue.push({
          ...w,
          cardKey,
          card: srsQuestions[cardKey] ? ensureFsrsCard(srsQuestions[cardKey]) : getNewCard(),
          isNew: !srsQuestions[cardKey]
        });
      }
      if (queue.length >= 8) break;
    }
  }

  return queue;
}
