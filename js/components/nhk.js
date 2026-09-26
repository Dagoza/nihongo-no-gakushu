/**
 * Nihongo Master - NHK Spanish Lessons Component
 * Covers conversational dialogues and explanations from 'japones from spanish.pdf'.
 */

class NhkComponent {
  constructor() {
    this.data = window.NHK_LESSONS_DATA || [];
    this.currentLesson = 1;
  }

  init() {
    this.render();
  }

  render() {
    const container = document.getElementById('nhk-panel');
    if (!container) return;

    const lesson = this.data.find(l => l.lesson === this.currentLesson) || this.data[0];

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span>📻</span> Hablemos en Japonés (Curso en Español)
        </h2>
        <p class="section-desc">
          Diálogos reales de la vida cotidiana en Japón extraídos de tu guía de NHK con audio nativo y explicaciones gramaticales directamente en español.
        </p>
      </div>

      <!-- Lesson Selector Bar -->
      <div style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;">
        ${this.data.map(l => `
          <button 
            class="btn ${l.lesson === this.currentLesson ? 'btn-primary' : 'btn-outline'} btn-sm"
            onclick="window.nhkComp.setLesson(${l.lesson})"
          >
            Lección ${l.lesson}: ${l.title_es.split('.')[0]}
          </button>
        `).join('')}
      </div>

      <!-- Lesson Content Card -->
      <div class="card" style="margin-bottom: 24px;">
        <div style="border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 20px;">
          <span class="vocab-tag">Lección ${lesson.lesson} · ${lesson.topic}</span>
          <h3 class="jp-text" style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-top: 8px;">
            ${lesson.title_jp}
          </h3>
          <p style="font-size: 1.1rem; color: var(--text-muted); margin-top: 4px;">
            🇪🇸 ${lesson.title_es}
          </p>
        </div>

        <!-- Dialogue Rows -->
        <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 14px;">
          🗣️ Diálogo de la Lección:
        </h4>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
          ${lesson.dialogue.map(d => `
            <div style="display: flex; gap: 14px; align-items: flex-start; padding: 12px; background: var(--bg-main); border-radius: var(--radius-sm);">
              <div style="min-width: 80px; font-weight: 700; color: var(--accent);">
                ${d.speaker}:
              </div>
              <div style="flex: 1;">
                <div class="jp-text" style="font-size: 1.15rem; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
                  ${d.jp}
                </div>
                <div style="font-size: 0.92rem; color: var(--text-muted);">
                  ${d.es}
                </div>
              </div>
              <button class="audio-btn" onclick="window.appAudio.speak('${this.escapeAudio(d.jp)}')">
                🔊
              </button>
            </div>
          `).join('')}
        </div>

        <!-- Grammar Notes in Spanish -->
        <div style="background: var(--primary-bg); border-left: 4px solid var(--primary); padding: 16px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 8px;">
            💡 Puntos Clave de Gramática:
          </h4>
          <ul style="list-style-type: disc; padding-left: 20px; font-size: 0.92rem; line-height: 1.8;">
            ${lesson.grammar_notes.map(note => `<li>${note}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  escapeAudio(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  setLesson(num) {
    this.currentLesson = num;
    this.render();
  }
}

window.nhkComp = new NhkComponent();
