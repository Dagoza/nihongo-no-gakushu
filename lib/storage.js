/**
 * LocalStorage and Progress Manager for Next.js App
 */

import { scheduleDebouncedCloudPush } from './supabaseSync';

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
    completedCanDos: {},   // canDoId: boolean (Irodori/NHK autoevaluación Can-Do)
    completedExercises: {},// exerciseId: boolean (Quizzes curriculares y ejercicios resueltos)
    completedConversations: {}, // lessonNumber: boolean
    theme: 'light',
    useMassiveDictionary: false, // false = Solo recursos propios (libros), true = Masivo (API Supabase)
    useMassiveKanji: false,      // false = Solo kanjis propios (libros), true = Masivo (API Supabase)
    googleAccount: null,   // { name, email, avatar, connectedAt }
    vocabCustomizations: {}, // { [wordIdOrKanji]: { id, kanji, kana, hiragana, katakana, meaning_es, meaning_en, level, category, notes, updatedAt } }
    savedCustomVocab: [],  // [{ id, kanji, hiragana, katakana, meaning_es, level, category, notes, date }]
    savedPhrases: [],      // [{ id, japanese, translation, videoId, videoTitle, timestamp, date }]
    savedCustomKanji: [],  // [{ char, meaning_es, date }]
    savedCustomVideos: [], // [{ id, youtubeId, title, author, isEmbeddable, spokenLanguage, subtitles, savedAt }]
    favoriteVideos: [],    // [videoId]
    savedStories: [],      // [{ id, title, title_en, difficulty, description, paragraphs, sentences, wordsUsed, createdAt, isCustom }]
    savedConversations: [], // [{ id, title_jp, title_es, level, topic, characters, dialogue, grammar_notes, words_used, createdAt, isCustom }]
    savedPracticeSheets: [] // [{ id, title, date, text, kana, source, strokes, gridType, paperStyle, strokeStyle }]
  };
}

export function loadSavedState() {
  if (typeof window === 'undefined') return getInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const initial = getInitialState();
      return updateStreak({ ...initial, ...parsed });
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
