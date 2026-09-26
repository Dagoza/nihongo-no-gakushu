/**
 * Nihongo Master - Curriculum Roadmap Component
 * Incremental step-by-step learning path from zero to N4.
 */

class CurriculumComponent {
  constructor() {
    this.data = window.CURRICULUM_DATA || [];
  }

  init() {
    this.render();
  }

  render() {
    const container = document.getElementById('curriculum-panel');
    if (!container) return;

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span>🗺️</span> Ruta de Aprendizaje Incremental (N5 → N4)
        </h2>
        <p class="section-desc">
          Plan de estudio progresivo diseñado específicamente a partir de tu material de apoyo: cada nivel reutiliza y expande lo aprendido en los niveles anteriores.
        </p>
      </div>

      <div class="curriculum-list">
        ${this.data.map(step => this.renderStepCard(step)).join('')}
      </div>
    `;
  }

  renderStepCard(step) {
    const isCompleted = window.appStorage.state.completedSteps[step.step];

    return `
      <div class="curriculum-step-card ${isCompleted ? 'completed' : ''}">
        <div class="step-number-badge">
          <span>${step.icon}</span>
          <span style="font-size: 0.8rem; font-weight: bold;">L${step.step}</span>
        </div>

        <div class="step-content">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
            <div>
              <span class="step-target-tag">${step.target}</span>
              <h3 class="step-title">${step.title}</h3>
              <p class="step-subtitle">${step.subtitle}</p>
            </div>

            <button 
              class="btn ${isCompleted ? 'btn-outline' : 'btn-primary'} btn-sm"
              onclick="window.curriculumComp.goToStepContent(${step.step})"
            >
              ${isCompleted ? '✓ Repasar Nivel' : '🚀 Empezar Nivel'}
            </button>
          </div>

          <!-- Objectives -->
          <ul class="step-objectives">
            ${step.objectives.map(obj => `<li>${obj}</li>`).join('')}
          </ul>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border);">
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              <strong>Puntos Gramaticales:</strong> ${step.grammar_focus.join(' · ')}
            </div>

            <div>
              <div style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted); margin-bottom: 4px;">
                Vocabulario Clave Integrado:
              </div>
              <div class="step-chips">
                ${step.included_vocab.map(w => `<span class="step-chip">${w}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  goToStepContent(stepNum) {
    // Route to appropriate section based on level
    if (stepNum === 1 || stepNum === 2) {
      window.app.switchTab('vocab');
    } else if (stepNum === 3 || stepNum === 4 || stepNum === 5) {
      window.app.switchTab('particles');
    } else if (stepNum === 6) {
      window.app.switchTab('kanji');
    } else if (stepNum === 7 || stepNum === 8) {
      window.app.switchTab('story');
    } else if (stepNum === 9) {
      window.vocabComp.setMode('n4_exercises');
      window.app.switchTab('vocab');
    }
  }
}

window.curriculumComp = new CurriculumComponent();
