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
  'u2-l12-texturas-superficies': ['textures-surfaces', 'ref-l22-textures']
};

/**
 * Construye la vista de la "Ruta de Referencia Estándar"
 * Compuesta exactamente por Unit 1: Basics (22 lecciones) y Unit 2: Everyday (22 lecciones)
 * que mapean 1:1 con las capturas de pantalla de referencia del usuario, reutilizando las
 * mismas palabras, IDs y estado completado.
 */
export function getStandardCourseUnits() {
  const allThematicLessonsMap = new Map();
  scriptpadUnitsData.forEach(u => {
    (u.lessons || []).forEach(l => {
      allThematicLessonsMap.set(l.id, l);
    });
  });

  const unit1Map = [
    { num: 1, id: 'u2-l1-mascotas-comunes', title: 'Animals — Common Pets', ja: 'ペット・身近な動物' },
    { num: 2, id: 'u2-l2-animales-salvajes', title: 'Animals — Wild & Zoo', ja: '野生動物・動物園の動物' },
    { num: 3, id: 'u2-l3-animales-granja', title: 'Animals — Farm & Livestock', ja: '家畜・牧場の動物' },
    { num: 4, id: 'u2-l4-aves-pajaros', title: 'Birds', ja: '鳥類・空を飛ぶ鳥' },
    { num: 5, id: 'u2-l5-criaturas-marinas', title: 'Sea Creatures & Fish', ja: '魚類・海の生物' },
    { num: 6, id: 'u2-l6-insectos-bichos', title: 'Insects & Bugs', ja: '昆虫・小さな生き物' },
    { num: 7, id: 'u2-l7-reptiles-anfibios', title: 'Reptiles & Amphibians', ja: '爬虫類・両生類' },
    { num: 8, id: 'u2-l8-colores-principales', title: 'Colors', ja: '基本の色 (いろ)' },
    { num: 9, id: 'u1-l4-ordinales-fracciones', title: 'Ordinals & Fractions', ja: '順序・割合・分数' },
    { num: 10, id: 'u1-l5-matematicas-cantidades', title: 'Math & Quantities', ja: '数量・計算・合計' },
    { num: 11, id: 'u2-l9-formas-dimensiones', title: 'Shapes & Sizes', ja: '形・図形・サイズ' },
    { num: 12, id: 'u3-l1-cabeza-rostro', title: 'Body — Head & Face', ja: '頭・顔の部分' },
    { num: 13, id: 'u3-l2-ojos-orejas-boca', title: 'Body — Eyes & Mouth', ja: '目・耳・鼻・口' },
    { num: 14, id: 'u3-l3-brazos-manos', title: 'Body — Arms & Hands', ja: '腕・手・指先' },
    { num: 15, id: 'u3-l4-piernas-pies-tronco', title: 'Body — Legs & Feet', ja: '足・脚・胴体' },
    { num: 16, id: 'u3-l5-organos-fisiologia', title: 'Body — Torso & Organs', ja: '内臓・血液・呼吸' },
    { num: 17, id: 'u4-l1-familia-inmediata', title: 'Family — Immediate', ja: '家族・両親・子供' },
    { num: 18, id: 'u4-l2-hermanos-abuelos', title: 'Family — Extended & Relatives', ja: '兄弟・祖父母・親戚' },
    { num: 19, id: 'u1-l9-horas-minutos-periodos', title: 'Day & Night / Time', ja: '時・分・一日の時間帯' },
    { num: 20, id: 'u1-l6-dias-semana', title: 'Days & Seasons', ja: '曜日・季節' },
    { num: 21, id: 'u6-l5-posicion-espacial', title: 'Cardinal Directions & Position', ja: '位置・方向・方角' },
    { num: 22, id: 'u2-l12-texturas-superficies', title: 'Textures & Surfaces', ja: '質感・表面・感触' }
  ];

  const unit2Map = [
    { num: 23, id: 'u4-l10-estructura-vivienda', title: 'The House — Structure', ja: '家の構造・建築' },
    { num: 24, id: 'u4-l11-salon-estar', title: 'Living Room', ja: '居間・リビング' },
    { num: 25, id: 'u4-l12-dormitorio-descanso', title: 'Bedroom', ja: '寝室・ベッドルーム' },
    { num: 26, id: 'u4-l13-bano-aseo', title: 'Bathroom & Toiletries', ja: '浴室・洗面所・トイレタリー' },
    { num: 27, id: 'u5-l10-comedor-mesa', title: 'Dining Room & Table', ja: '食卓・ダイニング・配膳' },
    { num: 28, id: 'u5-l11-vajilla-cubiertos', title: 'Crockery & Cutlery', ja: '食器・カトラリー' },
    { num: 29, id: 'u5-l12-cocina-espacio', title: 'Kitchen', ja: '台所設備・シンク・収納' },
    { num: 30, id: 'u5-l13-electrodomesticos-cocina-detallada', title: 'Kitchen Appliances', ja: '調理家電・電化製品' },
    { num: 31, id: 'u5-l14-utensilios-cocina', title: 'Kitchenware & Utensils', ja: '調理器具・台所道具' },
    { num: 32, id: 'u5-l15-acciones-cocinar', title: 'Cooking Actions', ja: '調理動作・料理の動詞' },
    { num: 33, id: 'u5-l16-tecnicas-culinarias', title: 'Cooking Techniques', ja: '調理技法・火加減・盛り付け' },
    { num: 34, id: 'u4-l14-instalaciones-hogar', title: 'Home Systems & Utilities', ja: '住宅設備・ライフライン' },
    { num: 35, id: 'u4-l15-lavanderia-ropa', title: 'Laundry', ja: '洗濯・衣類ケア' },
    { num: 36, id: 'u4-l16-equipos-limpieza', title: 'Cleaning Equipment', ja: '清掃用品・用具' },
    { num: 37, id: 'u4-l17-jardin-patio', title: 'Garden & Yard', ja: '庭・園芸・屋外' },
    { num: 38, id: 'u4-l18-herramientas-bricolaje', title: 'Tools & Workshop', ja: '工具・DIY・ワークショップ' },
    { num: 39, id: 'u4-l19-bebe-cuidado', title: 'Baby & Childcare', ja: '赤ちゃん・育児用品' },
    { num: 40, id: 'u4-l6-ropa-prendas', title: 'Clothing — General', ja: '衣服・着るもの' },
    { num: 41, id: 'u4-l20-accesorios-vestir', title: 'Clothing — Accessories', ja: 'アクセサリー・装身具' },
    { num: 42, id: 'u4-l21-calzado-bolsos', title: 'Shoes & Bags', ja: '靴・鞄・バッグ類' },
    { num: 43, id: 'u4-l22-cabello-peinados', title: 'Hair & Hairstyles', ja: '髪・ヘアスタイル・散髪' },
    { num: 44, id: 'u4-l23-belleza-maquillaje', title: 'Beauty & Makeup', ja: '美容・化粧・メイク用品' }
  ];

  const mapToLessons = (list) => {
    return list.map(item => {
      const baseLesson = allThematicLessonsMap.get(item.id) || {};
      return {
        ...baseLesson,
        id: item.id,
        number: item.num,
        title: item.title,
        japanese_title: item.ja || baseLesson.japanese_title || item.title,
        description: baseLesson.description || item.title,
        words: baseLesson.words || []
      };
    });
  };

  const u1Lessons = mapToLessons(unit1Map);
  const u2Lessons = mapToLessons(unit2Map);

  return [
    {
      id: 'unit-1-basics',
      title: 'Unit 1: Basics',
      japanese_title: '日本語の基礎・動物・色彩・身体',
      subtitle: 'Animals, colors & body • 22 lessons',
      kanji_icon: '基',
      color: '#3b82f6',
      bg_gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      track: 'standard',
      total_words: u1Lessons.reduce((acc, l) => acc + l.words.length, 0),
      lessons_count: u1Lessons.length,
      lessons: u1Lessons
    },
    {
      id: 'unit-2-everyday',
      title: 'Unit 2: Everyday',
      japanese_title: '日々の暮らし・住居・衣食・ケア',
      subtitle: 'Family, numbers & home • 22 lessons',
      kanji_icon: '常',
      color: '#f59e0b',
      bg_gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      track: 'standard',
      total_words: u2Lessons.reduce((acc, l) => acc + l.words.length, 0),
      lessons_count: u2Lessons.length,
      lessons: u2Lessons
    }
  ];
}

/**
 * Obtiene todas las unidades filtradas opcionalmente por nivel JLPT o tipo de track
 */
export function getScriptpadUnits(filterLevel = 'all', filterTrack = 'all') {
  let units = [];

  // Pista 1: Ruta Estándar de Referencia (44 lecciones)
  if (filterTrack === 'standard' || filterTrack === 'reference') {
    units = getStandardCourseUnits();
  }
  // Pista 2: Ruta del Currículum (módulos de pasos)
  else if (filterTrack === 'curriculum') {
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
  // Pista 3: Unidades Temáticas maestras (9 unidades)
  else {
    units = [...scriptpadUnitsData];
    if (filterTrack && filterTrack !== 'all' && filterTrack !== 'thematic') {
      units = units.filter(u => u.track === filterTrack);
    }
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

  // 2. Buscar en pista de referencia estándar
  const standardUnits = getStandardCourseUnits();
  for (const unit of standardUnits) {
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

  const currentLessons = { ...(appState?.completedScriptpadLessons || {}) };
  const prevRecord = currentLessons[lessonId] || {};

  const stars = stats.stars !== undefined ? stats.stars : 3;
  const score = stats.score !== undefined ? stats.score : 100;
  const totalWords = stats.totalWords || 10;
  const mode = stats.mode || 'write';

  const prevModes = Array.isArray(prevRecord.completedModes) ? prevRecord.completedModes : (prevRecord.completedAt ? ['write'] : []);
  const completedModes = prevModes.includes(mode) ? prevModes : [...prevModes, mode];

  currentLessons[lessonId] = {
    ...prevRecord,
    completedAt: new Date().toISOString(),
    score: Math.max(score, prevRecord.score || 0),
    stars: Math.max(stars, prevRecord.stars || 0),
    totalWords: totalWords,
    completedModes: completedModes
  };

  // Replicar en aliases conocidos para máxima resiliencia
  const aliases = LESSON_ID_ALIASES[lessonId] || [];
  aliases.forEach(alt => {
    currentLessons[alt] = { ...currentLessons[lessonId] };
  });

  // Otorgar XP de recompensa
  const xpEarned = prevRecord.completedAt ? 10 : 35;
  const currentXp = (appState?.xp || 0) + xpEarned;

  // Registrar cada palabra en scriptpadWordProgress y masteredVocab
  const currentWordProgress = { ...(appState?.scriptpadWordProgress || {}) };
  const currentMasteredVocab = { ...(appState?.masteredVocab || {}) };

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

  onUpdateState({
    ...appState,
    xp: currentXp,
    completedScriptpadLessons: currentLessons,
    scriptpadWordProgress: currentWordProgress,
    masteredVocab: currentMasteredVocab
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
