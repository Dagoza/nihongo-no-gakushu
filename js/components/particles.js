/**
 * Nihongo Master - Particles Component (Checklist & Quiz)
 * Manages 25 particle functions, interactive checkboxes, and fill-in-the-blank quizzes.
 */

class ParticlesComponent {
  constructor() {
    this.data = window.PARTICLES_DATA || [];
    this.filterParticle = 'all';
    this.searchTerm = '';
    this.quizActive = false;
    this.currentQuizIndex = 0;
    this.quizQuestions = [];
  }

  init() {
    this.render();
  }

  render() {
    const container = document.getElementById('particles-panel');
    if (!container) return;

    if (this.quizActive) {
      this.renderQuiz(container);
      return;
    }

    const uniqueParticles = ['all', ...new Set(this.data.map(p => p.particle))];

    const filtered = this.data.filter(p => {
      const matchFilter = this.filterParticle === 'all' || p.particle === this.filterParticle;
      const matchSearch = !this.searchTerm || 
        p.particle.includes(this.searchTerm) || 
        p.role_es.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.role_en.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.examples.some(ex => ex.includes(this.searchTerm));
      return matchFilter && matchSearch;
    });

    const masteredCount = this.data.filter(p => window.appStorage.isParticleMastered(p.id)).length;

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span>🎯</span> Partículas Japonesas N5 (Checklist & Laboratorio)
        </h2>
        <p class="section-desc">
          Domina las 25 funciones esenciales de las partículas de nivel N5 extraídas de tu material de apoyo con explicaciones en español y ejemplos reales.
        </p>
      </div>

      <!-- Overview Stats & Quiz Launcher -->
      <div class="card" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
            Tu Progreso del Checklist: <span style="color: var(--primary);">${masteredCount} de 25 dominadas</span> (${Math.round((masteredCount / 25) * 100)}%)
          </div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">
            Marca las casillas conforme comprendas cada función y ponlas a prueba con el Quiz.
          </div>
        </div>

        <button class="btn btn-accent btn-lg" onclick="window.particlesComp.startQuiz()">
          ⚡ Iniciar Quiz de Partículas
        </button>
      </div>

      <!-- Filter & Search Bar -->
      <div class="vocab-filter-bar">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Buscar función, ejemplo o partícula (ej. は, posesión, tiempo)..." 
          value="${this.searchTerm}" 
          oninput="window.particlesComp.handleSearch(this.value)"
        />

        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${uniqueParticles.map(p => `
            <button class="btn ${this.filterParticle === p ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="window.particlesComp.setFilter('${p}')">
              ${p === 'all' ? 'Todas' : p}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Particles Grid -->
      <div class="particles-grid">
        ${filtered.map(p => this.renderParticleCard(p)).join('')}
      </div>
    `;
  }

  renderParticleCard(p) {
    const isMastered = window.appStorage.isParticleMastered(p.id);

    return `
      <div class="particle-card ${isMastered ? 'mastered' : ''}">
        <div class="particle-header">
          <div style="display: flex; align-items: center;">
            <div class="particle-symbol">
              ${p.particle}
            </div>
            <div class="particle-role">
              <h4>${p.role_es}</h4>
              <p>${p.role_en}</p>
            </div>
          </div>

          <label class="particle-check" title="Marcar como dominada">
            <input 
              type="checkbox" 
              ${isMastered ? 'checked' : ''} 
              onchange="window.particlesComp.toggleMastery('${p.id}')"
              style="width: 18px; height: 18px; accent-color: var(--success); cursor: pointer;"
            />
            <span style="font-size: 0.8rem; color: var(--text-muted);">${isMastered ? 'Dominada' : 'Aprender'}</span>
          </label>
        </div>

        <!-- Examples with Audio -->
        <div class="particle-examples">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;">
            Ejemplos de Uso:
          </div>
          ${p.examples.map(ex => `
            <div class="particle-example-row">
              <span class="jp-text" style="font-size: 1.05rem; font-weight: 600; color: var(--text-main);">
                ${this.highlightParticle(ex, p.particle)}
              </span>
              <button class="audio-btn" style="width: 28px; height: 28px; font-size: 0.85rem;" onclick="window.appAudio.speak('${this.escapeAudio(ex)}')">
                🔊
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  highlightParticle(sentence, particle) {
    const pClean = particle.split('・')[0];
    const regex = new RegExp(`(${pClean})`, 'g');
    return sentence.replace(regex, `<span style="color: var(--accent); font-weight: 800; border-bottom: 2px solid var(--accent);">$1</span>`);
  }

  escapeAudio(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  toggleMastery(id) {
    window.appStorage.toggleParticle(id);
    this.render();
  }

  setFilter(p) {
    this.filterParticle = p;
    this.render();
  }

  handleSearch(val) {
    this.searchTerm = val;
    this.render();
  }

  // -------------------------------------------------------------
  // Particle Interactive Quiz
  // -------------------------------------------------------------
  startQuiz() {
    this.quizQuestions = [];
    this.data.forEach(p => {
      if (p.quiz_items && p.quiz_items.length > 0) {
        p.quiz_items.forEach(q => {
          this.quizQuestions.push({
            ...q,
            particleRole: p.role_es,
            particleName: p.particle
          });
        });
      }
    });

    // Shuffle questions
    this.quizQuestions.sort(() => Math.random() - 0.5);
    this.currentQuizIndex = 0;
    this.quizActive = true;
    this.render();
  }

  exitQuiz() {
    this.quizActive = false;
    this.render();
  }

  renderQuiz(container) {
    const q = this.quizQuestions[this.currentQuizIndex];
    if (!q) {
      this.renderQuizCompletion(container);
      return;
    }

    container.innerHTML = `
      <div class="quiz-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button class="btn btn-outline btn-sm" onclick="window.particlesComp.exitQuiz()">
            ← Volver al Checklist
          </button>
          <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted);">
            Pregunta ${this.currentQuizIndex + 1} de ${this.quizQuestions.length}
          </span>
        </div>

        <div class="quiz-question-box">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 8px;">
            Función: ${q.particleRole}
          </div>

          <div class="quiz-sentence jp-text">
            ${q.masked}
          </div>

          <p style="color: var(--text-muted); font-size: 0.92rem;">
            ¿Qué partícula encaja correctamente en el espacio para completar la oración?
          </p>
        </div>

        <!-- 4 Options Grid -->
        <div class="quiz-options-grid" id="quiz-options-container">
          ${q.options.map(opt => `
            <button class="quiz-option-btn jp-text" onclick="window.particlesComp.answerQuiz('${opt}')">
              ${opt}
            </button>
          `).join('')}
        </div>

        <!-- Optional IME Typing Mode for Quiz -->
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed var(--border);">
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
            O escribe la partícula directamente con tu teclado en japonés:
          </div>
          <div style="display: flex; gap: 8px;">
            <input 
              type="text" 
              id="quiz-particle-ime" 
              class="japanese-input jp-text" 
              placeholder="Escribe aquí (ej. は, を, に)..." 
              style="font-size: 1.1rem; padding: 8px 12px;"
            />
            <button class="btn btn-primary" onclick="window.particlesComp.answerQuizWithInput()">
              Validar
            </button>
          </div>
        </div>

        <div id="quiz-feedback-box" style="margin-top: 16px; font-weight: 600; min-height: 24px;"></div>
      </div>
    `;

    // Bind Enter key on quiz input
    const imeInput = document.getElementById('quiz-particle-ime');
    if (imeInput) {
      imeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.answerQuizWithInput();
        }
      });
      imeInput.focus();
    }
  }

  answerQuizWithInput() {
    const imeInput = document.getElementById('quiz-particle-ime');
    if (!imeInput || !imeInput.value.trim()) return;
    this.answerQuiz(imeInput.value.trim());
  }

  answerQuiz(selected) {
    const q = this.quizQuestions[this.currentQuizIndex];
    const feedback = document.getElementById('quiz-feedback-box');
    const optionsContainer = document.getElementById('quiz-options-container');
    if (!q || !feedback) return;

    const isCorrect = selected === q.correct;
    window.appStorage.recordActivity(isCorrect);

    if (optionsContainer) {
      const btns = optionsContainer.querySelectorAll('.quiz-option-btn');
      btns.forEach(btn => {
        if (btn.textContent.trim() === q.correct) {
          btn.classList.add('correct');
        } else if (btn.textContent.trim() === selected) {
          btn.classList.add('wrong');
        }
        btn.disabled = true;
      });
    }

    if (isCorrect) {
      feedback.innerHTML = `
        <span style="color: var(--success);">
          🎉 ¡Correcto! La partícula adecuada es <strong>${q.correct}</strong>.<br>
          <span class="jp-text" style="font-size: 1.1rem;">${q.sentence}</span>
        </span>
      `;
      window.appAudio.speak(q.sentence);
    } else {
      feedback.innerHTML = `
        <span style="color: var(--danger);">
          ❌ Incorrecto. La partícula correcta era <strong>${q.correct}</strong> (${q.particleRole}).<br>
          <span class="jp-text" style="font-size: 1.1rem;">${q.sentence}</span>
        </span>
      `;
    }

    setTimeout(() => {
      this.currentQuizIndex += 1;
      this.render();
    }, 2200);
  }

  renderQuizCompletion(container) {
    container.innerHTML = `
      <div class="quiz-container" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 3.5rem; margin-bottom: 12px;">🎉</div>
        <h3 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 12px;">
          ¡Quiz de Partículas Completado!
        </h3>
        <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 24px;">
          Has repasado las partículas fundamentales N5. Has ganado experiencia (+XP) y tu racha de estudio se mantiene activa.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-primary" onclick="window.particlesComp.startQuiz()">
            Repetir Quiz
          </button>
          <button class="btn btn-outline" onclick="window.particlesComp.exitQuiz()">
            Volver al Checklist
          </button>
        </div>
      </div>
    `;
  }
}

window.particlesComp = new ParticlesComponent();
