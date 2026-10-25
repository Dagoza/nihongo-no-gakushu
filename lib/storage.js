/**
 * LocalStorage and Progress Manager for Next.js App
 */

import { scheduleDebouncedCloudPush } from './supabaseSync';
import { LESSON_ID_ALIASES } from './scriptpadData';

const STORAGE_KEY = 'nihongo_master_general_v2';

export function getInitialState() {
  return {
    version: 2,
    xp: 0,
    streak: 1,
    lastStudyDate: new Date().toISOString().split('T')[0],
    masteredParticles: {}, // id: boolean
    masteredVocab: {},     // id: boolean
    masteredKanji: {},     // char: boolean
    completedSentences: {},// id: boolean
    completedSteps: {},    // id: boolean
    completedSubSteps: {}, // [`${step}_${substep}`]: boolean (Seguimiento de pasos por módulo)
    moduleProgress: {},    // { [stepNum]: { currentSubStep: number } }
    completedCanDos: {},   // canDoId: boolean (Irodori/NHK autoevaluación Can-Do)
    completedExercises: {},// exerciseId: boolean (Quizzes curriculares y ejercicios resueltos)
    completedConversations: {}, // lessonNumber: boolean
    theme: 'light',
    confettiEnabled: true, // Efectos de animación festiva y confeti al aprender o sumar puntos
    useMassiveDictionary: false, // false = Solo recursos propios (libros), true = Masivo (API Supabase)
    useMassiveKanji: false,      // false = Solo kanjis propios (libros), true = Masivo (API Supabase)
    googleAccount: null,   // { name, email, avatar, connectedAt }
    vocabCustomizations: {}, // { [wordIdOrKanji]: { id, kanji, kana, hiragana, katakana, meaning_es, meaning_en, level, category, notes, updatedAt } }
    savedCustomVocab: [],  // [{ id, kanji, hiragana, katakana, meaning_es, level, category, notes, date }]
    savedPhrases: [],      // [{ id, japanese, translation, videoId, videoTitle, timestamp, date }]
    savedCustomKanji: [],  // [{ char, meaning_es, date }]
    kanjiTags: {},         // { [char]: string[] } - Etiquetas personalizadas de kanjis
    savedCustomVideos: [], // [{ id, youtubeId, title, author, isEmbeddable, spokenLanguage, subtitles, savedAt }]
    favoriteVideos: [],    // [videoId]
    savedStories: [],      // [{ id, title, title_en, difficulty, description, paragraphs, sentences, wordsUsed, createdAt, isCustom }]
    savedConversations: [], // [{ id, title_jp, title_es, level, topic, characters, dialogue, grammar_notes, words_used, createdAt, isCustom }]
    savedPracticeSheets: [], // [{ id, title, date, text, kana, source, strokes, gridType, paperStyle, strokeStyle }]
    dailyGoal: {
      target: 5,
      date: new Date().toISOString().split('T')[0],
      answeredToday: 0,
      completed: false,
      category: 'all', // 'all' | 'kanji' | 'vocab' | 'grammar' | 'jlpt'
      level: 'N5'      // 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
    },
    srsQuestions: {},    // { [questionId]: FSRSCard }
    completedScriptpadLessons: {}, // { [lessonId]: { completedAt, score, totalWords, stars } }
    scriptpadWordProgress: {},     // { [wordKey]: { timesWritten, lastWrittenAt, mastered } }
    jlptExamResults: {}  // { [examId]: { date, score, total, level, passed, timeSpent } }
  };
}

export function loadSavedState() {
  if (typeof window === 'undefined') return getInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const initial = getInitialState();
      const merged = { ...initial, ...parsed };
      
      // Asegurar que la meta diaria resetee contadores al cambiar de día
      const today = new Date().toISOString().split('T')[0];
      if (merged.dailyGoal && merged.dailyGoal.date !== today) {
        merged.dailyGoal = {
          ...merged.dailyGoal,
          date: today,
          answeredToday: 0,
          completed: false
        };
      }
      
      // Preservar e inmunizar el progreso de lecciones completadas con resolución bidireccional de aliases
      if (merged.completedScriptpadLessons && typeof merged.completedScriptpadLessons === 'object') {
        const completedMap = { ...merged.completedScriptpadLessons };
        if (LESSON_ID_ALIASES && typeof LESSON_ID_ALIASES === 'object') {
          Object.entries(LESSON_ID_ALIASES).forEach(([canon, alts]) => {
            if (completedMap[canon]) {
              (alts || []).forEach(alt => {
                if (!completedMap[alt]) completedMap[alt] = completedMap[canon];
              });
            } else {
              for (const alt of (alts || [])) {
                if (completedMap[alt]) {
                  completedMap[canon] = completedMap[alt];
                  break;
                }
              }
            }
          });
        }
        merged.completedScriptpadLessons = completedMap;
      }
      
      return updateStreak(merged);
    }
  } catch (e) {
    console.warn('Storage load error:', e);
  }
  return getInitialState();
}

export function saveState(state, triggerCloud = true) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (triggerCloud) {
      scheduleDebouncedCloudPush(state);
    }
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function updateStreak(state) {
  const today = new Date().toISOString().split('T')[0];
  const last = state.lastStudyDate;

  if (last) {
    const lastDate = new Date(last);
    const currDate = new Date(today);
    const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      state.streak += 1;
      state.lastStudyDate = today;
    } else if (diffDays > 1) {
      state.streak = 1;
      state.lastStudyDate = today;
    }
  } else {
    state.lastStudyDate = today;
    state.streak = 1;
  }
  return state;
}

export function recordActivity(state, isCorrect, isTyping = false) {
  const updated = { ...state };
  updateStreak(updated);
  if (isCorrect) {
    const xpGain = isTyping ? 20 : 10;
    updated.xp = (updated.xp || 0) + xpGain;
  }
  saveState(updated);
  return updated;
}

export function recordDailyGoalActivity(state, isCorrect) {
  const updated = { ...state };
  updateStreak(updated);
  
  const today = new Date().toISOString().split('T')[0];
  const currentGoal = updated.dailyGoal || {
    target: 5,
    date: today,
    answeredToday: 0,
    completed: false,
    category: 'all',
    level: 'N5'
  };

  const answeredToday = (currentGoal.date === today ? (currentGoal.answeredToday || 0) : 0) + 1;
  const isNowCompleted = answeredToday >= (currentGoal.target || 5);

  updated.dailyGoal = {
    ...currentGoal,
    date: today,
    answeredToday,
    completed: isNowCompleted || !!currentGoal.completed
  };

  const xpGain = isCorrect ? 15 : 5;
  updated.xp = (updated.xp || 0) + xpGain;

  saveState(updated);
  return updated;
}

export function exportData(state) {
  if (typeof window === 'undefined') return;
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nihongo_progreso_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportData(rawJson) {
  try {
    const parsed = JSON.parse(rawJson);
    const state = { ...getInitialState(), ...parsed };
    saveState(state);
    return state;
  } catch (err) {
    console.error('Invalid JSON file:', err);
    throw err;
  }
}
