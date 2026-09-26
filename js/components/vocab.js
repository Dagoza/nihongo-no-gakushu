/**
 * Nihongo Master - Vocabulary Trainer Component
 * Covers N5 & N4 vocab with category filters, Flashcard mode,
 * IME Japanese typing challenge, and N4 context exercises.
 */

class VocabComponent {
  constructor() {
    this.n5Data = window.VOCABULARY_N5_DATA || [];
    this.n4Data = window.VOCABULARY_N4_DATA || { vocabulary: [], exercises: [] };
    this.mode = 'cards'; // 'cards', 'typing', 'n4_exercises'
    this.currentLevel = 'all'; // 'all', 'N5', 'N4'
    this.currentCategory = 'all';
    this.searchTerm = '';
    
    // Typing state
    this.typingIndex = 0;
    this.typingList = [];

    // N4 exercises state
    this.n4ExerciseIndex = 0;
  }

  init() {
    this.render();
  }

  getAllVocab() {
    let combined = [];
    if (this.currentLevel === 'all' || this.currentLevel === 'N5') {
      combined = combined.concat(this.n5Data.map(v => ({ ...v, level: 'N5' })));
    }
    if (this.currentLevel === 'all' || this.currentLevel === 'N4') {
      combined = combined.concat(this.n4Data.vocabulary.map((v, i) => ({
        id: `v_n4_${i+1}`,
        ...v,
        level: 'N4'
      })));
    }
    return combined;
  }

  getCategories() {
    const all = this.getAllVocab();
    return ['all', ...new Set(all.map(v => v.category))];
  }

  render() {
    const container = document.getElementById('vocab-panel');
    if (!container) return;

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span>📚</span> Entrenador de Vocabulario (N5 & N4)
        </h2>
        <p class="section-desc">
          Vocabulario estructurado por categorías temáticas con audio nativo, práctica de escritura con teclado japonés IME y ejercicios contextuales N4.
        </p>
      </div>

      <!-- Mode Switcher -->
      <div class="story-controls" style="margin-bottom: 20px;">
        <div class="reading-mode-selector">
          <button class="mode-btn ${this.mode === 'cards' ? 'active' : ''}" onclick="window.vocabComp.setMode('cards')">
            🗂️ Tarjetas de Vocabulario
          </button>
          <button class="mode-btn ${this.mode === 'typing' ? 'active' : ''}" onclick="window.vocabComp.setMode('typing')">
            ⌨️ Práctica con Teclado IME
          </button>
          <button class="mode-btn ${this.mode === 'n4_exercises' ? 'active' : ''}" onclick="window.vocabComp.setMode('n4_exercises')">
            📝 Ejercicios de Contexto N4
          </button>
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn ${this.currentLevel === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="window.vocabComp.setLevel('all')">
            Todos
          </button>
          <button class="btn ${this.currentLevel === 'N5' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="window.vocabComp.setLevel('N5')">
            N5
          </button>
          <button class="btn ${this.currentLevel === 'N4' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="window.vocabComp.setLevel('N4')">
            N4
          </button>
        </div>
      </div>

      <div id="vocab-mode-content">
        ${this.renderModeContent()}
      </div>
    `;

    if (this.mode === 'typing') {
      this.bindTypingEvents();
    }
  }

  setMode(m) {
    this.mode = m;
    this.render();
  }

  setLevel(lvl) {
    this.currentLevel = lvl;
    this.currentCategory = 'all';
    this.render();
  }

  setCategory(cat) {
    this.currentCategory = cat;
    this.render();
  }

  handleSearch(val) {
    this.searchTerm = val;
    this.render();
  }

  renderModeContent() {
    if (this.mode === 'cards') {
      return this.renderCardsView();
    } else if (this.mode === 'typing') {
      return this.renderTypingView();
    } else if (this.mode === 'n4_exercises') {
      return this.renderN4ExercisesView();
    }
    return '';
  }

  // -------------------------------------------------------------
  // Mode 1: Cards View
  // -------------------------------------------------------------
  renderCardsView() {
    const all = this.getAllVocab();
    const categories = this.getCategories();

    const filtered = all.filter(v => {
      const matchCat = this.currentCategory === 'all' || v.category === this.currentCategory;
      const matchSearch = !this.searchTerm ||
        (v.kanji && v.kanji.includes(this.searchTerm)) ||
        (v.kana && v.kana.includes(this.searchTerm)) ||
        (v.meaning_es && v.meaning_es.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (v.meaning_en && v.meaning_en.toLowerCase().includes(this.searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });

    return `
      <!-- Filter Bar -->
      <div class="vocab-filter-bar">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Buscar por kanji, kana o español..." 
          value="${this.searchTerm}" 
          oninput="window.vocabComp.handleSearch(this.value)"
        />

        <select class="filter-select" onchange="window.vocabComp.setCategory(this.value)">
          ${categories.map(cat => `
            <option value="${cat}" ${this.currentCategory === cat ? 'selected' : ''}>
              ${cat === 'all' ? 'Todas las Categorías' : cat}
            </option>
          `).join('')}
        </select>
      </div>

      <div style="margin-bottom: 16px; font-size: 0.9rem; color: var(--text-muted);">
        Mostrando ${filtered.length} palabras:
      </div>

      <div class="vocab-grid">
        ${filtered.map(v => this.renderVocabCard(v)).join('')}
      </div>
    `;
  }

  renderVocabCard(v) {
    const isMastered = window.appStorage.isVocabMastered(v.id);

    return `
      <div class="vocab-card" style="${isMastered ? 'border-color: var(--success);' : ''}">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <span class="vocab-tag">${v.level} · ${v.category}</span>
            <label style="cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; gap: 4px;">
              <input 
                type="checkbox" 
                ${isMastered ? 'checked' : ''} 
                onchange="window.vocabComp.toggleVocabMastery('${v.id}')"
                style="accent-color: var(--success);"
              />
              <span style="color: var(--text-muted);">${isMastered ? 'Dominada' : 'Repasar'}</span>
            </label>
          </div>

          <div class="vocab-kanji">
            <span>${v.kanji}</span>
            <button class="audio-btn" style="width: 30px; height: 30px;" onclick="window.appAudio.speak('${v.kana || v.kanji}')">
              🔊
            </button>
          </div>

          <div class="vocab-kana">${v.kana || ''}</div>
        </div>

        <div class="vocab-meanings">
          <div class="vocab-es">🇪🇸 ${v.meaning_es}</div>
          <div class="vocab-en">🇬🇧 ${v.meaning_en}</div>
          ${v.polite_masu ? `
            <div style="margin-top: 6px; font-size: 0.8rem; color: var(--primary);">
              Forma ます: <strong>${v.polite_masu}</strong> | て: <strong>${v.te_form}</strong>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  toggleVocabMastery(id) {
    window.appStorage.toggleVocab(id);
    this.render();
  }

  // -------------------------------------------------------------
  // Mode 2: Japanese IME Typing Challenge
  // -------------------------------------------------------------
  renderTypingView() {
    const all = this.getAllVocab();
    if (this.typingList.length === 0) {
      this.typingList = [...all].sort(() => Math.random() - 0.5);
      this.typingIndex = 0;
    }

    const currentItem = this.typingList[this.typingIndex] || this.typingList[0];
    if (!currentItem) return '<p>No hay vocabulario para practicar.</p>';

    return `
      <div class="quiz-container" style="max-width: 640px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <span class="vocab-tag">${currentItem.level} · ${currentItem.category}</span>
          <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">
            Palabra ${this.typingIndex + 1} de ${this.typingList.length}
          </span>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">
            ${currentItem.meaning_es}
          </div>
          <div style="font-size: 1rem; color: var(--text-muted); margin-bottom: 12px;">
            (${currentItem.meaning_en})
          </div>
          <button class="audio-btn" style="width: 40px; height: 40px; font-size: 1.2rem;" onclick="window.appAudio.speak('${currentItem.kana || currentItem.kanji}')">
            🔊 Escuchar pronunciación
          </button>
        </div>

        <div class="typing-box" style="margin-top: 16px;">
          <div class="typing-prompt">
            <span>🇯🇵 Escribe en japonés (Hiragana o Kanji):</span>
            <span class="ime-badge">IME Activo</span>
          </div>

          <div class="typing-input-row">
            <input 
              type="text" 
              id="vocab-typing-input" 
              class="japanese-input jp-text" 
              placeholder="Teclea la palabra en japonés..." 
              autocomplete="off" 
              autocorrect="off" 
              autocapitalize="off" 
              spellcheck="false"
            />
            <button class="btn btn-primary" onclick="window.vocabComp.checkWordTyping()">
              Validar
            </button>
            <button class="btn btn-outline" onclick="window.vocabComp.showWordHint()">
              Pista
            </button>
          </div>

          <div id="vocab-typing-feedback" class="typing-feedback"></div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <button class="btn btn-outline btn-sm" onclick="window.vocabComp.prevTypingWord()">
            ← Anterior
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.vocabComp.nextTypingWord()">
            Siguiente →
          </button>
        </div>
      </div>
    `;
  }

  bindTypingEvents() {
    const input = document.getElementById('vocab-typing-input');
    if (!input) return;

    let isComposing = false;
    input.addEventListener('compositionstart', () => { isComposing = true; });
    input.addEventListener('compositionend', () => { isComposing = false; });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !isComposing) {
        this.checkWordTyping();
      }
    });
    input.focus();
  }

  checkWordTyping() {
    const input = document.getElementById('vocab-typing-input');
    const fb = document.getElementById('vocab-typing-feedback');
    const currentItem = this.typingList[this.typingIndex];
    if (!input || !fb || !currentItem) return;

    const val = input.value.trim();
    if (!val) return;

    const targetKanji = (currentItem.kanji || '').trim();
    const targetKana = (currentItem.kana || '').trim();

    // Check if matches kanji or kana reading!
    if (val === targetKanji || val === targetKana) {
      fb.innerHTML = `<span class="typing-feedback correct">🎉 ¡Correcto! (+20 XP)<br><strong class="jp-text" style="font-size: 1.2rem;">${targetKanji} (${targetKana})</strong></span>`;
      window.appStorage.recordActivity(true, true);
      window.appAudio.speak(targetKana || targetKanji);

      setTimeout(() => {
        this.nextTypingWord();
      }, 1500);
    } else {
      fb.innerHTML = `<span class="typing-feedback wrong">Revisa la ortografía. Respuesta esperada: <strong class="jp-text">${targetKanji || targetKana}</strong> (${targetKana})</span>`;
      window.appStorage.recordActivity(false, true);
    }
  }

  showWordHint() {
    const input = document.getElementById('vocab-typing-input');
    const currentItem = this.typingList[this.typingIndex];
    if (!input || !currentItem) return;
    const target = currentItem.kana || currentItem.kanji;
    input.value = target.charAt(0);
    input.focus();
  }

  nextTypingWord() {
    if (this.typingIndex < this.typingList.length - 1) {
      this.typingIndex += 1;
    } else {
      this.typingIndex = 0;
    }
    this.render();
  }

  prevTypingWord() {
    if (this.typingIndex > 0) {
      this.typingIndex -= 1;
      this.render();
    }
  }

  // -------------------------------------------------------------
  // Mode 3: N4 Context Exercises
  // -------------------------------------------------------------
  renderN4ExercisesView() {
    const exercises = this.n4Data.exercises || [];
    const ex = exercises[this.n4ExerciseIndex];
    if (!ex) return '<p>No hay ejercicios disponibles.</p>';

    return `
      <div class="quiz-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <span class="vocab-tag">N4 Ejercicio en Contexto</span>
          <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">
            Ejercicio ${this.n4ExerciseIndex + 1} de ${exercises.length}
          </span>
        </div>

        <div class="quiz-question-box">
          <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 8px;">
            🇪🇸 ${ex.prompt_es}
          </p>

          <div class="quiz-sentence jp-text" style="font-size: 1.35rem; line-height: 2;">
            ${ex.masked}
          </div>

          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Elige o escribe la palabra correcta para completar la oración:
          </p>
        </div>

        <!-- Options -->
        <div class="quiz-options-grid" id="n4-options-container">
          ${ex.options.map(opt => `
            <button class="quiz-option-btn jp-text" onclick="window.vocabComp.answerN4Exercise('${opt}')">
              ${opt}
            </button>
          `).join('')}
        </div>

        <div id="n4-feedback-box" style="margin-top: 20px; font-weight: 600; min-height: 24px;"></div>

        <div style="display: flex; justify-content: space-between; margin-top: 24px;">
          <button class="btn btn-outline btn-sm" onclick="window.vocabComp.prevN4Exercise()">
            ← Anterior
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.vocabComp.nextN4Exercise()">
            Siguiente →
          </button>
        </div>
      </div>
    `;
  }

  answerN4Exercise(selected) {
    const exercises = this.n4Data.exercises || [];
    const ex = exercises[this.n4ExerciseIndex];
    const fb = document.getElementById('n4-feedback-box');
    const container = document.getElementById('n4-options-container');
    if (!ex || !fb) return;

    const isCorrect = selected === ex.correct;
    window.appStorage.recordActivity(isCorrect);

    if (container) {
      container.querySelectorAll('.quiz-option-btn').forEach(btn => {
        if (btn.textContent.trim() === ex.correct) {
          btn.classList.add('correct');
        } else if (btn.textContent.trim() === selected) {
          btn.classList.add('wrong');
        }
        btn.disabled = true;
      });
    }

    if (isCorrect) {
      fb.innerHTML = `
        <span style="color: var(--success);">
          🎉 ¡Excelente! ${ex.explanation}<br>
          <span class="jp-text" style="font-size: 1.15rem; display: block; margin-top: 4px;">${ex.sentence}</span>
        </span>
      `;
      window.appAudio.speak(ex.sentence);
    } else {
      fb.innerHTML = `
        <span style="color: var(--danger);">
          ❌ La respuesta correcta es <strong>${ex.correct}</strong>.<br>
          ${ex.explanation}<br>
          <span class="jp-text" style="font-size: 1.15rem; display: block; margin-top: 4px;">${ex.sentence}</span>
        </span>
      `;
    }
  }

  nextN4Exercise() {
    const exercises = this.n4Data.exercises || [];
    if (this.n4ExerciseIndex < exercises.length - 1) {
      this.n4ExerciseIndex += 1;
      this.render();
    }
  }

  prevN4Exercise() {
    if (this.n4ExerciseIndex > 0) {
      this.n4ExerciseIndex -= 1;
      this.render();
    }
  }
}

window.vocabComp = new VocabComponent();
