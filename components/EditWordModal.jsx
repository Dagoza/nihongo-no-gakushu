'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Volume2, 
  Check, 
  RotateCcw, 
  StickyNote, 
  Sparkles, 
  BookOpen,
  AlertCircle
} from 'lucide-react';
import audioManager from '../lib/audioManager';
import { 
  hiraganaToKatakana, 
  katakanaToHiragana, 
  extractKanjis 
} from '../lib/japaneseUtils';

export default function EditWordModal({
  isOpen,
  onClose,
  word = null, // The word being edited
  onSave,      // Callback (customizedWord) => void
  onReset,     // Callback (wordIdOrKanji) => void to restore default
  isCustomized = false
}) {
  const [kanji, setKanji] = useState('');
  const [hiragana, setHiragana] = useState('');
  const [katakana, setKatakana] = useState('');
  const [meaningEs, setMeaningEs] = useState('');
  const [meaningEn, setMeaningEn] = useState('');
  const [level, setLevel] = useState('N5');
  const [category, setCategory] = useState('Vocabulario General');
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && word) {
      setKanji(word.kanji || word.kana || '');
      setHiragana(word.hiragana || word.kana || '');
      setKatakana(word.katakana || hiraganaToKatakana(word.hiragana || word.kana || ''));
      setMeaningEs(word.meaning_es || '');
      setMeaningEn(word.meaning_en || '');
      setLevel(word.level || 'N5');
      setCategory(word.category || 'Vocabulario General');
      setNotes(word.notes || '');
      setSavedSuccess(false);
    }
  }, [isOpen, word]);

  if (!isOpen || !word) return null;

  const handleHiraganaChange = (val) => {
    setHiragana(val);
    if (!katakana || katakana === hiraganaToKatakana(hiragana)) {
      setKatakana(hiraganaToKatakana(val));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!kanji.trim() || !hiragana.trim() || !meaningEs.trim()) {
      alert('Por favor completa al menos el Kanji/palabra, la lectura en Hiragana y su significado en español.');
      return;
    }

    const finalKatakana = katakana.trim() || hiraganaToKatakana(hiragana);
    const updated = {
      ...word,
      kanji: kanji.trim(),
      hiragana: hiragana.trim(),
      katakana: finalKatakana,
      kana: hiragana.trim(),
      meaning_es: meaningEs.trim(),
      meaning_en: meaningEn.trim(),
      level,
      category: category.trim() || 'Vocabulario General',
      notes: notes.trim(),
      isCustomized: true,
      updatedAt: new Date().toISOString()
    };

    if (onSave) {
      onSave(updated);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleResetToDefault = () => {
    if (window.confirm('¿Deseas restaurar esta palabra a su valor original de fábrica?')) {
      if (onReset) {
        onReset(word.id || word.kanji);
      }
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="save-vocab-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 580 }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Edit3 className="text-primary" size={20} />
            <h3 className="modal-title">
              {isCustomized ? 'Editar Palabra y Notas (Personalizada)' : 'Modificar Escritura o Agregar Notas'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="modal-body">
          <div className="guideline-badge" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.84rem' }}>
              Puedes corregir los kanjis (ej. cambiar de hiragana a kanji estándar como <strong>多分</strong> o <strong>明後日</strong>), afinar la traducción y registrar tus propias <strong>notas de estudio</strong>.
            </span>
          </div>

          <div className="form-group-grid">
            {/* Kanji */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Kanji / Forma Escrita</span>
                <button
                  type="button"
                  className="tts-mini-btn"
                  onClick={() => audioManager.speak(kanji || hiragana)}
                  title="Escuchar pronunciación"
                >
                  <Volume2 size={13} />
                </button>
              </label>
              <input
                type="text"
                className="form-input jp-text"
                placeholder="ej. 多分 o 明後日"
                value={kanji}
                onChange={(e) => setKanji(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Hiragana */}
            <div className="form-group">
              <label className="form-label">Hiragana (Lectura Kana)</label>
              <input
                type="text"
                className="form-input jp-text"
                placeholder="ej. たぶん o あさって"
                value={hiragana}
                onChange={(e) => handleHiraganaChange(e.target.value)}
                required
              />
            </div>

            {/* Katakana */}
            <div className="form-group">
              <label className="form-label">Katakana (Transcripción)</label>
              <input
                type="text"
                className="form-input jp-text"
                placeholder="ej. タブン o アサッテ"
                value={katakana}
                onChange={(e) => setKatakana(e.target.value)}
              />
            </div>

            {/* JLPT Level */}
            <div className="form-group">
              <label className="form-label">Nivel JLPT</label>
              <select
                className="form-select"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="N5">N5 (Principiante)</option>
                <option value="N4">N4 (Básico-Intermedio)</option>
                <option value="N3">N3 (Intermedio)</option>
                <option value="N2">N2 (Intermedio-Avanzado)</option>
                <option value="N1">N1 (Avanzado)</option>
              </select>
            </div>
          </div>

          {/* Meaning ES & EN */}
          <div className="form-group">
            <label className="form-label">Significado en Español (meaning_es)</label>
            <input
              type="text"
              className="form-input"
              placeholder="ej. Quizás / probablemente / tal vez"
              value={meaningEs}
              onChange={(e) => setMeaningEs(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Significado en Inglés (opcional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="ej. Perhaps / probably"
              value={meaningEn}
              onChange={(e) => setMeaningEn(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Categoría Temática</label>
            <input
              type="text"
              className="form-input"
              placeholder="ej. Adverbios y Expresiones, Tiempo y Fechas..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {/* Personal Notes */}
          <div className="form-group" style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber-600, #d97706)', fontWeight: 700 }}>
              <StickyNote size={15} />
              <span>Notas Personales, Nemotecnia o Matices de Uso</span>
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Escribe aquí tus observaciones personales, nemotecnia para recordar el kanji, regla gramatical asociada, contexto coloquial vs formal, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              💡 Las notas se mostrarán en la tarjeta de estudio de esta palabra y se sincronizarán con tu cuenta.
            </div>
          </div>

          {/* Footer actions */}
          <div className="modal-footer" style={{ marginTop: 8 }}>
            {isCustomized && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleResetToDefault}
                style={{ marginRight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                title="Restaurar a los valores originales predeterminados"
              >
                <RotateCcw size={14} />
                <span>Restablecer original</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              disabled={savedSuccess}
            >
              {savedSuccess ? (
                <>
                  <Check size={16} />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
