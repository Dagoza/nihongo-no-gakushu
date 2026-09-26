/**
 * Nihongo Master - Core Application Controller
 * Handles tab navigation, theme switching, header updates, and module coordination.
 */

class AppController {
  constructor() {
    this.currentTab = 'curriculum';
  }

  init() {
    // Apply saved theme
    this.applyTheme(window.appStorage.state.theme || 'light');

    // Update stats in header
    window.appStorage.updateHeaderStats();

    // Initialize all components
    if (window.curriculumComp) window.curriculumComp.init();
    if (window.storyComp) window.storyComp.init();
    if (window.particlesComp) window.particlesComp.init();
    if (window.vocabComp) window.vocabComp.init();
    if (window.kanjiComp) window.kanjiComp.init();
    if (window.nhkComp) window.nhkComp.init();
    if (window.pdfHubComp) window.pdfHubComp.init();

    // Render initial progress view
    this.renderProgressPanel();

    // Bind theme button
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    console.log('Nihongo Master initialized successfully.');
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update tab buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update panels
    document.querySelectorAll('.section-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const targetPanel = document.getElementById(`${tabId}-panel`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Refresh components if needed
    if (tabId === 'curriculum') window.curriculumComp.render();
    if (tabId === 'story') window.storyComp.render();
    if (tabId === 'particles') window.particlesComp.render();
    if (tabId === 'vocab') window.vocabComp.render();
    if (tabId === 'kanji') window.kanjiComp.render();
    if (tabId === 'nhk') window.nhkComp.render();
    if (tabId === 'pdf') window.pdfHubComp.render();
    if (tabId === 'progress') this.renderProgressPanel();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleTheme() {
    const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    window.appStorage.state.theme = newTheme;
    window.appStorage.save();
  }

  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  renderProgressPanel() {
    const container = document.getElementById('progress-panel');
    if (!container) return;

    const stats = window.appStorage.getStatsSummary();
    const state = window.appStorage.state;

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span>📊</span> Mi Progreso y Estadísticas
        </h2>
        <p class="section-desc">
          Todo tu progreso se guarda automáticamente en tu navegador. Puedes exportar o importar una copia de seguridad en cualquier momento.
        </p>
      </div>

      <!-- Stat Badges Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="card" style="text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 6px;">🔥</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--accent);">${stats.streak} días</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Racha de Estudio Actual</div>
        </div>

        <div class="card" style="text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 6px;">⭐</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary);">${stats.xp} XP</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Nivel ${stats.level} Maestro</div>
        </div>

        <div class="card" style="text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 6px;">🎯</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--success);">${stats.particles}/25</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Partículas Dominadas</div>
        </div>

        <div class="card" style="text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 6px;">漢</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary-light);">${stats.kanji}/101</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Kanjis Aprendidos</div>
        </div>
      </div>

      <!-- Backup and Restore Box -->
      <div class="card" style="margin-bottom: 24px;">
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 10px;">
          💾 Respaldo y Sincronización de Datos
        </h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 16px;">
          Guarda una copia de seguridad de tus palabras aprendidas, racha y partículas marcadas en un archivo JSON o restáurala en otro dispositivo.
        </p>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="window.appStorage.exportData()">
            📥 Exportar Progreso a JSON
          </button>

          <label class="btn btn-outline" style="cursor: pointer;">
            📤 Restaurar desde JSON
            <input 
              type="file" 
              accept=".json" 
              style="display: none;" 
              onchange="window.app.handleFileImport(event)"
            />
          </label>
        </div>
      </div>

      <!-- Japanese IME Keyboard Guide -->
      <div class="card" style="background: var(--bg-main); border: 2px dashed var(--border);">
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <span>🇯🇵</span> Consejos para Escribir con Teclado Japonés (IME) en macOS
        </h3>
        <ul style="font-size: 0.92rem; color: var(--text-muted); line-height: 1.8; padding-left: 20px;">
          <li><strong>Cambiar a Japonés:</strong> Presiona <code>Control + Espacio</code> o la tecla <code>Caps Lock</code> (según tu configuración en Preferencias del Sistema → Teclado → Fuentes de Entrada).</li>
          <li><strong>Hiragana Directo:</strong> Escribe fonéticamente en Romaji (ej. <code>watashi</code>) y se convertirá automáticamente a <code>わたし</code>.</li>
          <li><strong>Convertir a Kanji:</strong> Presiona la <code>Barra Espaciadora</code> para que el IME convierta a kanji (ej. <code>わたし</code> → <code>私</code>) y presiona <code>Enter</code> para confirmar.</li>
          <li><strong>Katakana:</strong> Escribe la palabra y presiona la barra espaciadora o <code>F7</code> para convertir a Katakana (ej. <code>terebi</code> → <code>テレビ</code>).</li>
        </ul>
      </div>
    `;
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      window.appStorage.importData(e.target.result);
    };
    reader.readAsText(file);
  }
}

window.app = new AppController();

document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
