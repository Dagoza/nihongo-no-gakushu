'use client';

import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Eye, X, FileText, BookOpen, FileSpreadsheet } from 'lucide-react';
import pdfCatalogData from '../data/pdf_catalog.json';

export default function MaterialLibraryTab({
  initialCategory = 'all',
  initialSearch = '',
  initialDoc = null,
  onParamsChange
}) {
  const [currentCategory, setCurrentCategory] = useState(initialCategory || 'all');
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [activeModal, setActiveModal] = useState(null); // { title, url }

  const catalog = pdfCatalogData || [];

  const updateParams = (newCat, newSearch, newDoc) => {
    if (onParamsChange) {
      onParamsChange({
        category: newCat !== undefined ? newCat : currentCategory,
        search: newSearch !== undefined ? newSearch : searchTerm,
        doc: newDoc !== undefined ? newDoc : (activeModal?.filename || null)
      });
    }
  };

  useEffect(() => {
    if (initialCategory && initialCategory !== currentCategory) {
      setCurrentCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== searchTerm) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialDoc) {
      const found = catalog.find(p => p.filename === initialDoc || p.path?.includes(initialDoc));
      if (found) {
        setActiveModal({
          title: found.title,
          url: found.path,
          externalUrl: found.external_url,
          filename: found.filename
        });
      }
    }
  }, [initialDoc, catalog]);

  const categories = [
    { id: 'all', name: 'Todos los Materiales' },
    { id: 'vocabulario', name: 'Vocabulario' },
    { id: 'gramatica_y_particulas', name: 'Gramática y Partículas' },
    { id: 'kanji', name: 'Kanji' },
    { id: 'historias_y_lecturas', name: 'Historias y Lecturas' },
    { id: 'cursos', name: 'Cursos y Guías' }
  ];

  const filtered = catalog.filter(pdf => {
    const matchCat = currentCategory === 'all' || pdf.category === currentCategory;
    const search = searchTerm.trim().toLowerCase();
    const matchSearch = !search ||
      pdf.title.toLowerCase().includes(search) ||
      pdf.filename.toLowerCase().includes(search) ||
      pdf.description.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  const getFileIcon = (filename) => {
    if (filename.endsWith('.xlsx')) return <FileSpreadsheet size={28} color="#059669" />;
    if (filename.endsWith('.pages')) return <FileText size={28} color="#d97706" />;
    return <BookOpen size={28} color="#4338ca" />;
  };

  return (
    <div className="section-panel active">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <span>📑</span> Biblioteca y Visor de Materiales Originales
        </h2>
        <p className="section-desc">
          Acceso centralizado a los 15 materiales de apoyo de tu carpeta <code style={{ background: 'var(--border)', padding: '2px 6px', borderRadius: 4 }}>material_de_estudio/</code>. Toda la información ha sido extraída e integrada en los ejercicios interactivos de la aplicación, y aquí puedes consultar los documentos originales siempre que lo desees.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="vocab-filter-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="search-input" 
            style={{ paddingLeft: 38 }}
            placeholder="Buscar por nombre de archivo o tema..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              updateParams(currentCategory, e.target.value, activeModal?.filename);
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`btn ${currentCategory === cat.id ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => {
                setCurrentCategory(cat.id);
                updateParams(cat.id, searchTerm, activeModal?.filename);
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Mostrando <strong>{filtered.length}</strong> de {catalog.length} archivos de estudio:
      </div>

      {/* Grid of Materials */}
      <div className="pdf-grid">
        {filtered.map((pdf, idx) => {
          const isPages = pdf.filename.endsWith('.pages');
          const isXlsx = pdf.filename.endsWith('.xlsx');
          const isViewablePdf = !isPages && !isXlsx;

          return (
            <div key={idx} className="pdf-card">
              <div className="pdf-card-header">
                <div className="pdf-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getFileIcon(pdf.filename)}
                </div>
                <div className="pdf-meta" style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {pdf.title}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace', margin: '3px 0' }}>
                    {pdf.filename}
                  </div>
                  <div className="pdf-badges">
                    <span className="badge-tag">{pdf.level}</span>
                    <span className="badge-tag">{pdf.pages} pág.</span>
                    <span className="badge-tag">{pdf.size}</span>
                  </div>
                </div>
              </div>

              <p className="pdf-desc" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1, margin: '12px 0' }}>
                {pdf.description}
              </p>

              <div className="pdf-actions" style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                {isViewablePdf && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setActiveModal({ title: pdf.title, url: pdf.path, externalUrl: pdf.external_url, filename: pdf.filename });
                      updateParams(currentCategory, searchTerm, pdf.filename);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Eye size={14} /> Ver en la App
                  </button>
                )}

                <a 
                  href={pdf.path} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <ExternalLink size={14} /> Abrir Archivo
                </a>

                {pdf.external_url && (
                  <a 
                    href={pdf.external_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    title="Enlace oficial en línea de Fundación Japón"
                  >
                    <ExternalLink size={14} /> Web Oficial
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Integrated PDF Viewer Modal */}
      {activeModal && (
        <div className="modal-overlay active">
          <div className="modal-window">
            <div className="modal-header">
              <h3 className="modal-title">{activeModal.title}</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <a 
                  href={activeModal.externalUrl || activeModal.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <ExternalLink size={14} /> Pestaña Nueva
                </a>
                <button 
                  className="modal-close-btn"
                  onClick={() => {
                    setActiveModal(null);
                    updateParams(currentCategory, searchTerm, null);
                  }}
                  title="Cerrar visor"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <iframe 
                className="pdf-iframe" 
                src={activeModal.url} 
                title={activeModal.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
