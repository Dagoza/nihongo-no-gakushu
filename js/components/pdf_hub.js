/**
 * Nihongo Master - PDF Hub Component
 * Allows viewing and launching all source PDF textbooks directly from the application.
 */

class PdfHubComponent {
  constructor() {
    this.data = window.PDF_CATALOG_DATA || [];
    this.currentCategory = 'all';
    this.searchTerm = '';
  }

  init() {
    this.render();
  }

  render() {
    const container = document.getElementById('pdf-panel');
    if (!container) return;

    const categories = ['all', ...new Set(this.data.map(p => p.category))];

    const filtered = this.data.filter(p => {
      const matchCat = this.currentCategory === 'all' || p.category === this.currentCategory;
      const matchSearch = !this.searchTerm ||
        p.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.filename.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span>📑</span> Biblioteca y Visor de PDFs Originales
        </h2>
        <p class="section-desc">
          Accede directamente a los 15 materiales de apoyo de tu carpeta. Toda la información ha sido extraída a los ejercicios interactivos de la app, pero aquí puedes consultar los documentos originales en cualquier momento.
        </p>
      </div>

      <!-- Filter Bar -->
      <div class="vocab-filter-bar">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Buscar archivo PDF o libro..." 
          value="${this.searchTerm}" 
          oninput="window.pdfHubComp.handleSearch(this.value)"
        />

        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${categories.map(cat => `
            <button 
              class="btn ${this.currentCategory === cat ? 'btn-primary' : 'btn-outline'} btn-sm"
              onclick="window.pdfHubComp.setCategory('${cat}')"
            >
              ${cat === 'all' ? 'Todos los Archivos' : cat}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- PDF Grid -->
      <div class="pdf-grid">
        ${filtered.map(pdf => this.renderPdfCard(pdf)).join('')}
      </div>

      <!-- Integrated PDF Viewer Modal -->
      <div id="pdf-modal" class="modal-overlay">
        <div class="modal-window">
          <div class="modal-header">
            <h3 id="pdf-modal-title" class="modal-title">Visor de Documento</h3>
            <div style="display: flex; gap: 8px; align-items: center;">
              <a id="pdf-modal-external-link" href="#" target="_blank" class="btn btn-outline btn-sm">
                ↗ Abrir en Pestaña Nueva
              </a>
              <button class="modal-close-btn" onclick="window.pdfHubComp.closeModal()">
                ✕
              </button>
            </div>
          </div>
          <div class="modal-body">
            <iframe id="pdf-modal-iframe" class="pdf-iframe" src=""></iframe>
          </div>
        </div>
      </div>
    `;
  }

  renderPdfCard(pdf) {
    const isPages = pdf.filename.endsWith('.pages');
    const isXlsx = pdf.filename.endsWith('.xlsx');
    const icon = isPages ? '📄' : (isXlsx ? '📊' : '📕');

    return `
      <div class="pdf-card">
        <div class="pdf-card-header">
          <div class="pdf-icon">${icon}</div>
          <div class="pdf-meta">
            <h3>${pdf.title}</h3>
            <div style="font-size: 0.8rem; color: var(--text-muted); font-family: monospace;">
              ${pdf.filename}
            </div>
            <div class="pdf-badges">
              <span class="badge-tag">${pdf.level}</span>
              <span class="badge-tag">${pdf.pages} pág.</span>
              <span class="badge-tag">${pdf.size}</span>
            </div>
          </div>
        </div>

        <p class="pdf-desc">
          ${pdf.description}
        </p>

        <div class="pdf-actions">
          ${!isPages && !isXlsx ? `
            <button class="btn btn-primary btn-sm" onclick="window.pdfHubComp.openModal('${encodeURIComponent(pdf.filename)}', '${this.escapeTitle(pdf.title)}')">
              👁️ Ver en la App
            </button>
          ` : ''}

          <a href="${encodeURIComponent(pdf.filename)}" target="_blank" class="btn btn-outline btn-sm">
            ↗ Abrir Archivo
          </a>
        </div>
      </div>
    `;
  }

  escapeTitle(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  setCategory(cat) {
    this.currentCategory = cat;
    this.render();
  }

  handleSearch(val) {
    this.searchTerm = val;
    this.render();
  }

  openModal(fileUrl, title) {
    const modal = document.getElementById('pdf-modal');
    const iframe = document.getElementById('pdf-modal-iframe');
    const titleEl = document.getElementById('pdf-modal-title');
    const extLink = document.getElementById('pdf-modal-external-link');

    if (!modal || !iframe) return;

    titleEl.textContent = title;
    extLink.href = fileUrl;
    iframe.src = fileUrl;
    modal.classList.add('active');
  }

  closeModal() {
    const modal = document.getElementById('pdf-modal');
    const iframe = document.getElementById('pdf-modal-iframe');
    if (!modal) return;
    modal.classList.remove('active');
    if (iframe) iframe.src = '';
  }
}

window.pdfHubComp = new PdfHubComponent();
