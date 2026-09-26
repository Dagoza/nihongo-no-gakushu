/**
 * Nihongo Master - Kanji Master Component
 * Visual kanji cards with stroke counts, mnemonics, readings, compound words,
 * and reading typing practice.
 */

class KanjiComponent {
  constructor() {
    this.data = window.KANJI_DATA || [];
    this.searchTerm = '';
    this.quizActive = false;
    this.quizIndex = 0;
    this.quizQuestions = [];
  }

  init() {
    this.render();
  }

  render() {
    const container = document.getElementById('kanji-panel');
    if (!container) return;

    if (this.quizActive) {
      this.renderQuiz(container);
      return;
    }

    const filtered = this.data.filter(k => {
      const matchSearch = !this.searchTerm ||
        k.kanji.includes(this.searchTerm) ||
        (k.meaning_es && k.meaning_es.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (k.meaning_en && k.meaning_en.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (k.pronunciation && k.pronunciation.includes(this.searchTerm)) ||
        (k.onyomi && k.onyomi.includes(this.searchTerm)) ||
        (k.kunyomi && k.kunyomi.includes(this.searchTerm));
      return matchSearch;
    });

    const masteredCount = this.data.filter(k => window.appStorage.isKanjiMastered(k.kanji)).length;

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span>漢</span> Biblioteca de Kanji Interactiva (N5 & N4)
        </h2>
        <p class="section-desc">
          ${this.data.length} caracteres kanji extraídos de tus libros de estudio y fichas mnemotécnicas con orden de trazos, lecturas On'yomi, Kun'yomi y vocabulario compuesto.
        </p>
      </div>

      <!-- Overview Bar -->
      <div class="card" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
            Kanjis Dominados: <span style="color: var(--primary);">${masteredCount} de ${this.data.length}</span> (${Math.round((masteredCount / this.data.length) * 100)}%)
          </div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">
            Aprende la composición y practica escribir la lectura en Hiragana.
          </div>
        </div>

        <button class="btn btn-primary btn-lg" onclick="window.kanjiComp.startKanjiQuiz()">
          ✍️ Practicar Lecturas de Kanji
        </button>
      </div>

      <!-- Search Bar -->
      <div class="vocab-filter-bar">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Buscar kanji por carácter, lectura (いち, に) o significado (persona, norte)..." 
          value="${this.searchTerm}" 
          oninput="window.kanjiComp.handleSearch(this.value)"
        />
      </div>

      <!-- Kanji Grid -->
      <div class="kanji-grid">
        ${filtered.map(k => this.renderKanjiCard(k)).join('')}
      </div>
    `;
  }

  renderKanjiCard(k) {
    const isMastered = window.appStorage.isKanjiMastered(k.kanji);

    return `
      <div class="kanji-card" style="${isMastered ? 'border-color: var(--success);' : ''}">
        <div class="kanji-header">
          <div class="kanji-big-char">
            ${k.kanji}
          </div>

          <div class="kanji-meta">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span class="vocab-tag">${k.strokes ? `${k.strokes} trazos` : 'N5/N4'}</span>
              <label style="cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; gap: 4px;">
                <input 
                  type="checkbox" 
                  ${isMastered ? 'checked' : ''} 
                  onchange="window.kanjiComp.toggleKanjiMastery('${k.kanji}')"
                  style="accent-color: var(--success);"
                />
                <span style="color: var(--text-muted);">${isMastered ? 'Dominado' : 'Aprender'}</span>
              </label>
            </div>

            <div class="kanji-meaning" style="margin-top: 4px;">
              ${k.meaning_es}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              (${k.meaning_en})
            </div>
          </div>
        </div>

        <!-- Readings -->
        <div style="background: var(--bg-main); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.9rem;">
          ${k.kunyomi ? `<div><strong>Kun (Lectura japonesa):</strong> <span class="jp-text" style="color: var(--accent);">${k.kunyomi}</span></div>` : ''}
          ${k.onyomi ? `<div><strong>On (Lectura china):</strong> <span class="jp-text" style="color: var(--primary);">${k.onyomi}</span></div>` : ''}
          ${!k.kunyomi && !k.onyomi && k.pronunciation ? `<div><strong>Pronunciación:</strong> <span class="jp-text" style="color: var(--primary);">${k.pronunciation}</span></div>` : ''}
        </div>

        <!-- Mnemonic if available -->
        ${k.mnemonic ? `
          <div class="kanji-mnemonic">
            💡 <strong>Mnemotecnia:</strong> ${k.mnemonic}
          </div>
        ` : ''}

        <!-- Compound Words -->
        ${k.words && k.words.length > 0 ? `
          <div class="kanji-words-list">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
              Palabras Compuestas:
            </div>
            ${k.words.map(w => `
              <div class="kanji-word-item">
                <span class="jp-text" style="font-weight: 700; font-size: 1rem;">
                  ${w.word} <small style="color: var(--primary); font-weight: normal;">(${w.reading})</small>
                </span>
                <span style="font-size: 0.85rem; color: var(--text-muted);">${w.meaning}</span>
                <button class="audio-btn" style="width: 26px; height: 26px; font-size: 0.8rem;" onclick="window.appAudio.speak('${w.reading || w.word}')">
                  🔊
                </button>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  toggleKanjiMastery(char) {
    window.appStorage.toggleKanji(char);
    this.render();
  }

  handleSearch(val) {
    this.searchTerm = val;
    this.render();
  }

  // -------------------------------------------------------------
  // Kanji Practice / Quiz
  // -------------------------------------------------------------
  startKanjiQuiz() {
    this.quizQuestions = [];
    this.data.forEach(k => {
      // Clean readings to match
      const primaryReading = k.kunyomi ? k.kunyomi.split('[')[1]?.replace(']', '').trim() : (k.pronunciation ? k.pronunciation.split(',')[0].trim() : '');
      if (primaryReading) {
        this.quizQuestions.push({
          kanji: k.kanji,
          meaning: k.meaning_es,
          reading: primaryReading,
          words: k.words
        });
      }
    });

    this.quizQuestions.sort(() => Math.random() - 0.5);
    this.quizIndex = 0;
    this.quizActive = true;
    this.render();
  }

  exitQuiz() {
    this.quizActive = false;
    this.render();
  }

  renderQuiz(container) {
    const q = this.quizQuestions[this.quizIndex];
    if (!q) {
      container.innerHTML = `
        <div class="quiz-container" style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 3.5rem; margin-bottom: 12px;">🏆</div>
          <h3 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 12px;">¡Práctica de Kanji Completada!</h3>
          <p style="color: var(--text-muted); margin-bottom: 24px;">Has repasado la lectura y escritura de tus Kanjis N5/N4.</p>
          <button class="btn btn-primary" onclick="window.kanjiComp.exitQuiz()">Volver a la Biblioteca</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="quiz-container" style="max-width: 600px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button class="btn btn-outline btn-sm" onclick="window.kanjiComp.exitQuiz()">
            ← Volver a Kanjis
          </button>
          <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted);">
            Kanji ${this.quizIndex + 1} de ${this.quizQuestions.length}
          </span>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <div class="kanji-big-char" style="width: 100px; height: 100px; font-size: 4rem; margin: 0 auto 16px auto;">
            ${q.kanji}
          </div>
          <div style="font-size: 1.3rem; font-weight: 700; color: var(--text-main);">
            Significado: ${q.meaning}
          </div>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 6px;">
            Escribe la lectura en Hiragana usando tu teclado en japonés:
          </p>
        </div>

        <div class="typing-box">
          <div class="typing-prompt">
            <span>✍️ Lectura en Hiragana:</span>
            <span class="ime-badge">🇯🇵 Teclado Japonés</span>
          </div>

          <div class="typing-input-row">
            <input 
              type="text" 
              id="kanji-reading-input" 
              class="japanese-input jp-text" 
              placeholder="Escribe la lectura (ej. ひと, いち)..." 
              autocomplete="off" 
              autocorrect="off" 
              autocapitalize="off" 
              spellcheck="false"
            />
            <button class="btn btn-primary" onclick="window.kanjiComp.checkKanjiReading()">
              Validar
            </button>
            <button class="btn btn-outline" onclick="window.kanjiComp.showReadingHint()">
              Pista
            </button>
          </div>

          <div id="kanji-feedback-box" class="typing-feedback"></div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 24px;">
          <button class="btn btn-outline btn-sm" onclick="window.kanjiComp.prevQuizItem()">
            ← Anterior
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.kanjiComp.nextQuizItem()">
            Siguiente →
          </button>
        </div>
      </div>
    `;

    const input = document.getElementById('kanji-reading-input');
    if (input) {
      let isComposing = false;
      input.addEventListener('compositionstart', () => { isComposing = true; });
      input.addEventListener('compositionend', () => { isComposing = false; });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !isComposing) {
          this.checkKanjiReading();
        }
      });
      input.focus();
    }
  }

  checkKanjiReading() {
    const q = this.quizQuestions[this.quizIndex];
    const input = document.getElementById('kanji-reading-input');
    const fb = document.getElementById('kanji-feedback-box');
    if (!q || !input || !fb) return;

    const val = input.value.trim();
    if (!val) return;

    // Check if matches reading or any reading in pronunciation
    const expected = q.reading.toLowerCase();
    const isCorrect = val === expected || (q.words && q.words.some(w => w.reading === val));

    if (isCorrect) {
      fb.innerHTML = `<span class="typing-feedback correct">🎉 ¡Correcto! ${q.kanji} = <strong>${q.reading}</strong> (+20 XP)</span>`;
      window.appStorage.recordActivity(true, true);
      window.appAudio.speak(q.reading);

      setTimeout(() => {
        this.nextQuizItem();
      }, 1500);
    } else {
      fb.innerHTML = `<span class="typing-feedback wrong">Lectura esperada en Hiragana: <strong>${q.reading}</strong></span>`;
      window.appStorage.recordActivity(false, true);
    }
  }

  showReadingHint() {
    const q = this.quizQuestions[this.quizIndex];
    const input = document.getElementById('kanji-reading-input');
    if (!q || !input) return;
    input.value = q.reading.charAt(0);
    input.focus();
  }

  nextQuizItem() {
    if (this.quizIndex < this.quizQuestions.length - 1) {
      this.quizIndex += 1;
    } else {
      this.quizIndex = 0;
    }
    this.render();
  }

  prevQuizItem() {
    if (this.quizIndex > 0) {
      this.quizIndex -= 1;
      this.render();
    }
  }
}

window.kanjiComp = new KanjiComponent();
