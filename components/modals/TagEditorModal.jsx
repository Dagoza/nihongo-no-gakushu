'use client';

import React, { useState, useEffect } from 'react';
import { X, Tag, Plus, Check } from 'lucide-react';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';
import { POPULAR_KANJI_TAGS, POPULAR_VOCAB_TAGS } from '../../lib/tagUtils';

/**
 * Modal polimórfico y reutilizable para gestión y edición de etiquetas (Tags)
 * Admite tanto elementos de Kanji como de Vocabulario.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está visible
 * @param {Object} props.item - Ítem kanji o vocabulario a editar
 * @param {'kanji'|'vocab'} [props.type='vocab'] - Tipo de ítem
 * @param {string[]} props.currentTags - Lista de etiquetas asignadas actualmente
 * @param {string[]} [props.popularSuggestions] - Lista opcional de sugerencias personalizadas
 * @param {Function} props.onAddTag - Callback para añadir etiqueta: (tag) => void
 * @param {Function} props.onRemoveTag - Callback para eliminar etiqueta: (tag) => void
 * @param {Function} props.onClose - Callback para cerrar el modal
 */
export default function TagEditorModal({
  isOpen = true,
  item,
  type = 'vocab',
  currentTags = [],
  popularSuggestions,
  onAddTag,
  onRemoveTag,
  onClose
}) {
  const [newTagInput, setNewTagInput] = useState('');

  // Bloqueo de scroll cuando el modal está activo
  useBodyScrollLock(Boolean(isOpen && item));

  // Manejo de atajos de teclado (Escape para cerrar)
  useEffect(() => {
    if (!isOpen || !item) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, item, onClose]);

  // Si no está abierto o no hay ítem, no renderizar
  if (!isOpen || !item) return null;

  const suggestions = popularSuggestions || (type === 'kanji' ? POPULAR_KANJI_TAGS : POPULAR_VOCAB_TAGS);

  const handleAddTag = (tag) => {
    const trimmed = (tag || '').trim();
    if (!trimmed) return;
    onAddTag?.(trimmed);
    setNewTagInput('');
  };

  const handleToggleSuggestion = (sugg) => {
    if (currentTags.includes(sugg)) {
      onRemoveTag?.(sugg);
    } else {
      handleAddTag(sugg);
    }
  };

  // Datos para la cabecera según el tipo
  const displayChar = type === 'kanji' 
    ? item.kanji || item.char || '' 
    : item.kanji || item.kana || item.hiragana || '';
  
  const displayReading = type === 'vocab' && item.kanji && (item.kana || item.hiragana)
    ? `(${item.kana || item.hiragana})`
    : '';

  const displayMeaning = item.meaning_es || item.meaning || item.significado || '';

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={`Gestor de etiquetas para ${type === 'kanji' ? 'kanji' : 'vocabulario'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setNewTagInput('');
          onClose?.();
        }
      }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'rgba(0,0,0,0.65)', zIndex: 1100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        backdropFilter: 'blur(4px)',
        overscrollBehavior: 'contain'
      }}
    >
      <div 
        className="card" 
        style={{ 
          maxWidth: 460, 
          width: '100%', 
          position: 'relative', 
          padding: '24px 20px', 
          overscrollBehavior: 'contain',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Botón cerrar */}
        <button 
          type="button"
          className="btn btn-ghost btn-xs"
          style={{ position: 'absolute', top: 12, right: 12, borderRadius: '50%', width: 32, height: 32, padding: 0 }}
          onClick={() => {
            setNewTagInput('');
            onClose?.();
          }}
          title="Cerrar modal"
          aria-label="Cerrar modal"
        >
          <X size={16} />
        </button>

        {/* Cabecera del ítem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div 
            className="kanji-big-char jp-text" 
            style={{ 
              width: 52, 
              height: 52, 
              fontSize: type === 'kanji' ? '2rem' : '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              flexShrink: 0
            }}
          >
            {displayChar}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span>Etiquetas de 【{displayChar}】</span>
              {displayReading && (
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {displayReading}
                </span>
              )}
            </h3>
            {displayMeaning && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayMeaning}
              </div>
            )}
          </div>
        </div>

        {/* Sección: Etiquetas activas */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Tag size={13} />
            <span>Etiquetas asignadas ({currentTags.length}):</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 32, alignItems: 'center' }}>
            {currentTags.map(tag => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '3px 8px',
                  borderRadius: 12,
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTag?.(tag)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--primary)',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={`Eliminar etiqueta #${tag}`}
                  aria-label={`Eliminar etiqueta ${tag}`}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
            {currentTags.length === 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Sin etiquetas asignadas.
              </span>
            )}
          </div>
        </div>

        {/* Sección: Sugerencias populares */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Sugerencias populares (clic para activar/desactivar):
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {suggestions.map(sugg => {
              const isPresent = currentTags.includes(sugg);
              return (
                <button
                  key={sugg}
                  type="button"
                  className={`btn btn-xs ${isPresent ? 'btn-primary' : 'btn-outline'}`}
                  style={{ 
                    borderRadius: 12, 
                    fontSize: '0.75rem', 
                    padding: '3px 9px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  onClick={() => handleToggleSuggestion(sugg)}
                  aria-pressed={isPresent}
                >
                  {isPresent ? <Check size={11} /> : <Plus size={11} />}
                  <span>{sugg}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input para nueva etiqueta personalizada */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input 
            type="text" 
            className="input-text" 
            style={{ flex: 1, fontSize: '0.88rem' }}
            placeholder="Crear nueva etiqueta (ej. Viajes, Trabajo)..."
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag(newTagInput);
              }
            }}
          />
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={() => handleAddTag(newTagInput)}
            disabled={!newTagInput.trim()}
          >
            Añadir
          </button>
        </div>

        {/* Pie del modal */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setNewTagInput('');
              onClose?.();
            }}
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
