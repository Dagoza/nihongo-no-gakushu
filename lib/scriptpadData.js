/**
 * Gestor de datos y progreso para la sección Scriptpad
 * Maneja catálogo de unidades, lecciones modulares, estado de aprendizaje,
 * integración con FSRS para repaso de escritura a mano y persistencia en Supabase.
 */

import scriptpadUnitsData from '../data/scriptpad_units.json';
import curriculumData from '../data/curriculum.json';
import { isDue, getNewCard, ensureFsrsCard } from './srs.js';

/**
 * Mapa de compatibilidad hacia atrás para lecciones y progreso guardado
 * Garantiza que si el usuario completó lecciones con IDs previos o alternativos,
 * se mantengan siempre como completadas con sus estrellas y calificaciones intactas.
 */
export const LESSON_ID_ALIASES = {
  'u1-l1-numeros-0-10': ['basics-1-numbers-0-10', 'unit-1-lesson-1', 'sp_lesson_1', 'u1-l1'],
  'u1-l2-numeros-11-20': ['basics-2-numbers-11-20', 'unit-1-lesson-2', 'sp_lesson_2', 'u1-l2'],
  'u2-l1-mascotas-comunes': ['basics-pets', 'animals-1', 'unit-2-lesson-1', 'ref-l1-common-pets', 'u2-l1'],
  'u2-l2-animales-salvajes': ['basics-wild', 'animals-2', 'unit-2-lesson-2', 'ref-l2-wild-zoo', 'u2-l2'],
  'u2-l3-animales-granja': ['animals-3', 'unit-2-lesson-3', 'ref-l3-farm-livestock'],
  'u2-l4-aves-pajaros': ['animals-4', 'birds', 'unit-2-lesson-4', 'ref-l4-birds'],
  'u2-l5-criaturas-marinas': ['animals-5', 'sea-creatures', 'unit-2-lesson-5', 'ref-l5-sea-creatures'],
  'u2-l6-insectos-bichos': ['animals-6', 'insects', 'unit-2-lesson-6', 'ref-l6-insects'],
  'u2-l7-reptiles-anfibios': ['animals-7', 'reptiles', 'unit-2-lesson-7', 'ref-l7-reptiles'],
  'u2-l8-colores-principales': ['colors', 'unit-2-lesson-8', 'ref-l8-colors'],
  'u1-l4-ordinales-fracciones': ['ordinals', 'unit-1-lesson-4', 'ref-l9-ordinals'],
  'u1-l5-matematicas-cantidades': ['math', 'unit-1-lesson-5', 'ref-l10-math'],
  'u2-l9-formas-dimensiones': ['shapes', 'unit-2-lesson-9', 'ref-l11-shapes'],
  'u3-l1-cabeza-rostro': ['body-1', 'head-face', 'unit-3-lesson-1', 'ref-l12-head-face'],
  'u3-l2-ojos-orejas-boca': ['body-2', 'eyes-mouth', 'unit-3-lesson-2', 'ref-l13-eyes-mouth'],
  'u3-l3-brazos-manos': ['body-3', 'arms-hands', 'unit-3-lesson-3', 'ref-l14-arms-hands'],
  'u3-l4-piernas-pies-tronco': ['body-4', 'legs-feet', 'unit-3-lesson-4', 'ref-l15-legs-feet'],
  'u3-l5-organos-fisiologia': ['body-5', 'torso-organs', 'unit-3-lesson-5', 'ref-l16-torso-organs'],
  'u4-l1-familia-inmediata': ['family-1', 'family-immediate', 'unit-4-lesson-1', 'ref-l17-family-immediate'],
  'u4-l2-hermanos-abuelos': ['family-2', 'family-relatives', 'unit-4-lesson-2', 'ref-l18-family-relatives'],
  'u1-l9-horas-minutos-periodos': ['time-day-night', 'unit-1-lesson-9', 'ref-l19-time'],
  'u1-l6-dias-semana': ['days-seasons', 'unit-1-lesson-6', 'ref-l20-days'],
  'u6-l5-posicion-espacial': ['cardinal-directions', 'unit-6-lesson-5', 'ref-l21-directions'],
  'u2-l12-texturas-superficies': ['textures-surfaces', 'ref-l22-textures'],
  'u4-l10-estructura-vivienda': ['ref-l23-house-structure', 'house-structure'],
  'u4-l11-salon-estar': ['ref-l24-living-room', 'living-room'],
  'u4-l12-dormitorio-descanso': ['ref-l25-bedroom', 'bedroom'],
  'u4-l13-bano-aseo': ['ref-l26-bathroom', 'bathroom'],
  'u5-l10-comedor-mesa': ['ref-l27-dining-room', 'dining-room'],
  'u5-l11-vajilla-cubiertos': ['ref-l28-crockery-cutlery', 'crockery-cutlery'],
  'u5-l12-cocina-espacio': ['ref-l29-kitchen', 'kitchen'],
  'u5-l13-electrodomesticos-cocina-detallada': ['ref-l30-kitchen-appliances', 'kitchen-appliances'],
  'u5-l14-utensilios-cocina': ['ref-l31-kitchenware-utensils', 'kitchenware-utensils'],
  'u5-l15-acciones-cocinar': ['ref-l32-cooking-actions', 'cooking-actions'],
  'u5-l16-tecnicas-culinarias': ['ref-l33-cooking-techniques', 'cooking-techniques'],
  'u4-l14-instalaciones-hogar': ['ref-l34-home-systems', 'home-systems'],
  'u4-l15-lavanderia-ropa': ['ref-l35-laundry', 'laundry'],
  'u4-l16-equipos-limpieza': ['ref-l36-cleaning-equipment', 'cleaning-equipment'],
  'u4-l17-jardin-patio': ['ref-l37-garden-yard', 'garden-yard'],
  'u4-l18-herramientas-bricolaje': ['ref-l38-tools-workshop', 'tools-workshop'],
  'u4-l19-bebe-cuidado': ['ref-l39-baby-childcare', 'baby-childcare'],
  'u4-l6-ropa-prendas': ['ref-l40-clothing-general', 'clothing-general'],
  'u4-l20-accesorios-vestir': ['ref-l41-clothing-accessories', 'clothing-accessories'],
  'u4-l21-calzado-bolsos': ['ref-l42-shoes-bags', 'shoes-bags'],
  'u4-l22-cabello-peinados': ['ref-l43-hair-hairstyles', 'hair-hairstyles'],
  'u4-l23-belleza-maquillaje': ['ref-l44-beauty-makeup', 'beauty-makeup']
};

/**
 * Retorna las unidades unificadas (compatibilidad para importadores legacy)
 */
export function getStandardCourseUnits() {
  return scriptpadUnitsData;
}

/**
 * Obtiene todas las unidades filtradas opcionalmente por nivel JLPT o tipo de track
 */
export function getScriptpadUnits(filterLevel = 'all', filterTrack = 'all') {
  let units = [];

  // Pista del Currículum (módulos de pasos)
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
  }
  // Pista Principal Unificada: Todas las 10 unidades maestras sin duplicados
  else {
    units = [...scriptpadUnitsData];
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

  // 1. Buscar en unidades unificadas por ID directo
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

  // 2. Buscar en unidades unificadas por alias conocido
  for (const unit of scriptpadUnitsData) {
    for (const l of (unit.lessons || [])) {
      const aliases = LESSON_ID_ALIASES[l.id] || [];
      if (aliases.includes(lessonId)) {
        return {
          ...l,
          unitId: unit.id,
          unitTitle: unit.title,
          unitColor: unit.color
        };
      }
    }
  }

  // 3. Buscar en currículum
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
 * Retorna el estado de completitud de una lección para el usuario actual.
 * Incluye resolución bidireccional de aliases para que lecciones completadas previamente
 * NUNCA se pierdan ni se desmarquen.
 */
export function getLessonStatus(lessonId, appState = {}) {
  const completedMap = appState?.completedScriptpadLessons || {};
  let record = completedMap[lessonId];

  // Si no está con el ID canónico, buscar en aliases conocidos
  if (!record) {
    const aliases = LESSON_ID_ALIASES[lessonId] || [];
    for (const alt of aliases) {
      if (completedMap[alt]) {
        record = completedMap[alt];
        break;
      }
    }

    // Verificar si el lessonId solicitado es alias de una clave canónica que sí fue completada
    if (!record) {
      for (const [canon, alts] of Object.entries(LESSON_ID_ALIASES)) {
        if (alts.includes(lessonId) && completedMap[canon]) {
          record = completedMap[canon];
          break;
        }
      }
    }
  }

  if (!record) {
    return {
      isCompleted: false,
      stars: 0,
      score: 0,
      completedAt: null,
      completedModes: []
    };
  }

  if (record === true) {
    return {
      isCompleted: true,
      stars: 3,
      score: 100,
      completedAt: new Date().toISOString(),
      completedModes: ['write']
    };
  }

  return {
    isCompleted: true,
    stars: record.stars || 3,
    score: record.score || 100,
    completedAt: record.completedAt,
    completedModes: Array.isArray(record.completedModes) ? record.completedModes : ['write']
  };
}

/**
 * Registra la finalización de un modo LEARN de una lección en appState (sincroniza en Supabase automáticamente)
 */
export function recordLessonCompletion(lessonId, stats = {}, appState = {}, onUpdateState) {
  if (!lessonId || !onUpdateState) return;

  onUpdateState((prev) => {
    const baseState = prev || appState || {};
    const currentLessons = { ...(baseState?.completedScriptpadLessons || {}) };
    const prevRecord = currentLessons[lessonId] || {};

    const stars = stats.stars !== undefined ? stats.stars : 3;
    const score = stats.score !== undefined ? stats.score : 100;
    const totalWords = stats.totalWords || 10;
    const mode = stats.mode || 'write';

    const prevModes = Array.isArray(prevRecord.completedModes) 
      ? prevRecord.completedModes 
      : (prevRecord.completedAt ? ['write'] : []);
    const completedModes = prevModes.includes(mode) ? prevModes : [...prevModes, mode];

    const updatedRecord = {
      ...prevRecord,
      completedAt: new Date().toISOString(),
      score: Math.max(score, prevRecord.score || 0),
      stars: Math.max(stars, prevRecord.stars || 0),
      totalWords: totalWords,
      completedModes: completedModes
    };

    currentLessons[lessonId] = updatedRecord;

    // Replicar en aliases conocidos para máxima resiliencia
    const aliases = LESSON_ID_ALIASES[lessonId] || [];
    aliases.forEach(alt => {
      currentLessons[alt] = { ...updatedRecord };
    });

    // Otorgar XP de recompensa
    const xpEarned = prevRecord.completedAt ? 10 : 35;
    const currentXp = (baseState?.xp || 0) + xpEarned;

    // Registrar cada palabra en scriptpadWordProgress y masteredVocab
    const currentWordProgress = { ...(baseState?.scriptpadWordProgress || {}) };
    const currentMasteredVocab = { ...(baseState?.masteredVocab || {}) };

    if (Array.isArray(stats.wordsPracticed)) {
      stats.wordsPracticed.forEach(w => {
        const key = w.kanji || w.hiragana || w.id;
        if (key) {
          currentWordProgress[key] = {
            timesWritten: (currentWordProgress[key]?.timesWritten || 0) + 1,
            lastWrittenAt: new Date().toISOString(),
            mastered: true
          };
          if (w.id) {
            currentMasteredVocab[w.id] = true;
          }
        }
      });
    }

    return {
      ...baseState,
      xp: currentXp,
      completedScriptpadLessons: currentLessons,
      scriptpadWordProgress: currentWordProgress,
      masteredVocab: currentMasteredVocab
    };
  });
}

/**
 * Obtiene la cola de palabras para Repaso SRS de Escritura (FSRS)
 * - Incluye ÚNICAMENTE palabras de lecciones que el usuario ya ha visto/completado.
 * - Incluye palabras con tarjetas vencidas para repaso (isDue == true) o palabras ya estudiadas en lección sin tarjeta SRS aún.
 * - Si no hay palabras pendientes para repasar, retorna una lista vacía (el botón se deshabilita).
 */
export function getScriptpadSrsQueue(appState = {}, limit = 25) {
  const srsQuestions = appState?.srsQuestions || {};
  const wordProgress = appState?.scriptpadWordProgress || {};
  const queue = [];

  // Recorrer todas las unidades y lecciones disponibles (unidades base + módulos currículum)
  const curriculumUnits = getScriptpadUnits('all', 'curriculum');
  const allUnits = [...scriptpadUnitsData, ...curriculumUnits];

  for (const unit of allUnits) {
    if (!Array.isArray(unit.lessons)) continue;

    for (const lesson of unit.lessons) {
      if (!Array.isArray(lesson.words)) continue;

      const isLessonCompleted = Boolean(getLessonStatus(lesson.id, appState).isCompleted);

      for (const word of lesson.words) {
        const wordKey = word.kanji || word.hiragana || word.id;
        if (!wordKey) continue;

        const isWordPracticed = Boolean(wordProgress[wordKey]);

        // REGLA FUNDAMENTAL: Solo palabras de lecciones o vocabulario que el usuario ya vio/completó
        if (!isLessonCompleted && !isWordPracticed) {
          continue;
        }

        const cardKey = `sp_write_${wordKey}`;

        // Evitar duplicados en la cola
        if (queue.some(item => item.cardKey === cardKey)) {
          continue;
        }

        const card = srsQuestions[cardKey];

        if (card) {
          // La tarjeta ya existe: solo entra a la cola si está vencida para repaso
          if (isDue(card)) {
            queue.push({
              ...word,
              cardKey,
              card: ensureFsrsCard(card),
              isNew: false
            });
          }
        } else {
          // Palabra de lección completada que aún no tiene tarjeta SRS:
          // Es elegible para su primer repaso espaciado
          queue.push({
            ...word,
            cardKey,
            card: getNewCard(),
            isNew: true
          });
        }

        if (queue.length >= limit) break;
      }

      if (queue.length >= limit) break;
    }

    if (queue.length >= limit) break;
  }

  return queue;
}
