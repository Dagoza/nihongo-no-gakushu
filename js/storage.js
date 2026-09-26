/**
 * Nihongo Master - Storage & Progress State Manager
 * Handles local persistence, streaks, XP, mastered items, and backup/restore.
 */

class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'nihongo_master_data_v1';
    this.state = this.loadState();
    this.checkStreak();
  }

  getDefaultState() {
    return {
      version: 1,
      xp: 0,
      streak: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      masteredParticles: {}, // particle_id: boolean
      masteredVocab: {},     // vocab_id: boolean
      masteredKanji: {},     // kanji_char: boolean
      completedSteps: {},    // step_id: boolean
      completedSentences: {},// sent_id: boolean
      studyStats: {
        totalReviews: 0,
        correctAnswers: 0,
        typingExercisesCompleted: 0
      },
      theme: 'light',
      readingMode: 'natural' // 'natural', 'hiragana', 'kanji_only'
    };
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return { ...this.getDefaultState(), ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not load from localStorage:', e);
    }
    return this.getDefaultState();
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
      this.updateHeaderStats();
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  checkStreak() {
    const today = new Date().toISOString().split('T')[0];
    const last = this.state.lastStudyDate;

    if (last) {
      const lastDate = new Date(last);
      const currDate = new Date(today);
      const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        this.state.streak += 1;
        this.state.lastStudyDate = today;
      } else if (diffDays > 1) {
        // Streak lost
        this.state.streak = 1;
        this.state.lastStudyDate = today;
      }
    } else {
      this.state.lastStudyDate = today;
      this.state.streak = 1;
    }
    this.save();
  }

  addXP(points) {
    this.state.xp = (this.state.xp || 0) + points;
    this.save();
  }

  recordActivity(correct = true, isTyping = false) {
    this.state.studyStats.totalReviews += 1;
    if (correct) {
      this.state.studyStats.correctAnswers += 1;
      this.addXP(10);
    }
    if (isTyping && correct) {
      this.state.studyStats.typingExercisesCompleted += 1;
      this.addXP(15);
    }
    this.save();
  }

  toggleParticle(id) {
    this.state.masteredParticles[id] = !this.state.masteredParticles[id];
    if (this.state.masteredParticles[id]) {
      this.addXP(20);
    }
    this.save();
    return this.state.masteredParticles[id];
  }

  isParticleMastered(id) {
    return !!this.state.masteredParticles[id];
  }

  toggleVocab(id) {
    this.state.masteredVocab[id] = !this.state.masteredVocab[id];
    if (this.state.masteredVocab[id]) {
      this.addXP(15);
    }
    this.save();
    return this.state.masteredVocab[id];
  }

  isVocabMastered(id) {
    return !!this.state.masteredVocab[id];
  }

  toggleKanji(char) {
    this.state.masteredKanji[char] = !this.state.masteredKanji[char];
    if (this.state.masteredKanji[char]) {
      this.addXP(25);
    }
    this.save();
    return this.state.masteredKanji[char];
  }

  isKanjiMastered(char) {
    return !!this.state.masteredKanji[char];
  }

  markSentenceCompleted(id) {
    this.state.completedSentences[id] = true;
    this.addXP(20);
    this.save();
  }

  isSentenceCompleted(id) {
    return !!this.state.completedSentences[id];
  }

  getStatsSummary() {
    const masteredParticlesCount = Object.values(this.state.masteredParticles).filter(Boolean).length;
    const masteredVocabCount = Object.values(this.state.masteredVocab).filter(Boolean).length;
    const masteredKanjiCount = Object.values(this.state.masteredKanji).filter(Boolean).length;
    const completedSentencesCount = Object.values(this.state.completedSentences).filter(Boolean).length;

    return {
      xp: this.state.xp,
      streak: this.state.streak,
      particles: masteredParticlesCount,
      vocab: masteredVocabCount,
      kanji: masteredKanjiCount,
      sentences: completedSentencesCount,
      level: Math.floor(this.state.xp / 100) + 1
    };
  }

  updateHeaderStats() {
    const stats = this.getStatsSummary();
    const streakEl = document.getElementById('stat-streak');
    const xpEl = document.getElementById('stat-xp');
    const particlesEl = document.getElementById('stat-particles');
    const wordsEl = document.getElementById('stat-words');

    if (streakEl) streakEl.textContent = `${stats.streak}d`;
    if (xpEl) xpEl.textContent = `Nivel ${stats.level} (${stats.xp} XP)`;
    if (particlesEl) particlesEl.textContent = `${stats.particles}/25`;
    if (wordsEl) wordsEl.textContent = `${stats.vocab} pal.`;
  }

  exportData() {
    const jsonStr = JSON.stringify(this.state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nihongo_master_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        this.state = { ...this.getDefaultState(), ...parsed };
        this.save();
        alert('¡Progreso restaurado con éxito!');
        location.reload();
      }
    } catch (e) {
      alert('Error: Archivo de respaldo no válido.');
    }
  }
}

window.appStorage = new StorageManager();
