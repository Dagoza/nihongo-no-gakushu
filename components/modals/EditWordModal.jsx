'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3, Volume2, Check, RotateCcw, StickyNote, Sparkles, AlertCircle, Bot } from 'lucide-react';
import audioManager from '../../lib/audioManager';
import { hiraganaToKatakana, katakanaToHiragana, containsKanji, convertKanjiToKanaSync, fetchKanjiReading, cleanKanaOnly, analyzeVocabularyWithAI } from '../../lib/japaneseUtils';
import { useApp } from '../../lib/AppContext';
import useFocusTrap from '../../lib/useFocusTrap';

export default function EditWordModal({
  isOpen,
  onClose,
  word = null, // The word being edited
  onSave,      // Callback (customizedWord) => void
  onReset,     // Callback (wordIdOrKanji) => void to restore default
  isCustomized = false
}) {
  const modalCardRef = useFocusTrap(isOpen);
  const contextApp = useApp();
  const showConfirm = contextApp?.showConfirm || (() => Promise.resolve(true));
  const showAlert = contextApp?.showAlert || ((opts) => console.log(opts));

  const [kanji, setKanji] = useState('');
  const [hiragana, setHiragana] = useState('');
  const [katakana, setKatakana] = useState('');
  const [meaningEs, setMeaningEs] = useState('');
  const [meaningEn, setMeaningEn] = useState('');
  const [level, setLevel] = useState('N5');
  const [category, setCategory] = useState('Vocabulario General');
  const [notes, setNotes] = useState('');
  const [literalTranslation, setLiteralTranslation] = useState('');
  const [breakdown, setBreakdown] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [exampleReading, setExampleReading] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isConvertingKana, setIsConvertingKana] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const debounceRef = React.useRef(null);

  useEffect(() => {
    if (isOpen && word) {
      const rawKanji = (word.kanji || word.kana || '').trim();
      const rawReading = (word.hiragana || word.kana || '').trim();

      setKanji(rawKanji);
      setMeaningEs(word.meaning_es || '');
      setMeaningEn(word.meaning_en || '');
      setLevel(word.level || 'N5');
      setCategory(word.category || 'Vocabulario General');
      setNotes(word.notes || '');
      setLiteralTranslation(word.literal_translation || '');
      setBreakdown(word.breakdown || '');
      setExampleSentence(word.example_sentence || '');
      setExampleReading(word.example_reading || '');
      setExampleTranslation(word.example_translation || '');
      setSavedSuccess(false);

      if (rawReading && !containsKanji(rawReading)) {
        const cleanHira = katakanaToHiragana(rawReading);
        setHiragana(cleanHira);
        setKatakana(word.katakana || hiraganaToKatakana(cleanHira));
      } else if (rawKanji) {
        const syncRes = convertKanjiToKanaSync(rawKanji);
        if (syncRes.hiragana && !containsKanji(syncRes.hiragana)) {
          setHiragana(syncRes.hiragana);
          setKatakana(syncRes.katakana || hiraganaToKatakana(syncRes.hiragana));
        } else {
          setHiragana('');
          setKatakana('');
        }

        if (containsKanji(rawKanji)) {
          setIsConvertingKana(true);
          fetchKanjiReading(rawKanji).then((res) => {
            if (res && res.hiragana && !containsKanji(res.hiragana)) {
              setHiragana(res.hiragana);
              setKatakana(res.katakana || hiraganaToKatakana(res.hiragana));
            }
          }).catch(console.warn).finally(() => setIsConvertingKana(false));
        }
      } else {
        setHiragana('');
        setKatakana('');
      }
    }
  }, [isOpen, word]);

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !word) return null;

  const handleHiraganaChange = (val) => {
    setHiragana(val);
    if (!katakana || katakana === hiraganaToKatakana(hiragana)) {
      setKatakana(hiraganaToKatakana(val));
    }
  };

  const handleKanjiChange = (val) => {
    setKanji(val);
    const trimmed = val.trim();
    if (!trimmed) {
      setHiragana('');
      setKatakana('');
      return;
    }

    if (!containsKanji(trimmed)) {
      const hira = katakanaToHiragana(trimmed);
      setHiragana(hira);
      setKatakana(hiraganaToKatakana(hira));
      return;
    }

    const syncRes = convertKanjiToKanaSync(trimmed);
    if (syncRes.hiragana && !containsKanji(syncRes.hiragana)) {
      setHiragana(syncRes.hiragana);
      setKatakana(syncRes.katakana || hiraganaToKatakana(syncRes.hiragana));
      if (!meaningEs && syncRes.meaning_es) setMeaningEs(syncRes.meaning_es);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsConvertingKana(true);
      try {
        const res = await fetchKanjiReading(trimmed);
        if (res && res.hiragana && !containsKanji(res.hiragana)) {
          setHiragana(res.hiragana);
          setKatakana(res.katakana || hiraganaToKatakana(res.hiragana));
          if (!meaningEs && res.meaning_es) setMeaningEs(res.meaning_es);
        }
      } finally {
        setIsConvertingKana(false);
      }
    }, 150);
  };

  const handleKanjiBlur = async () => {
    const trimmed = kanji.trim();
    if (!trimmed || !containsKanji(trimmed)) return;
    if (!hiragana || containsKanji(hiragana)) {
      setIsConvertingKana(true);
      try {
        const res = await fetchKanjiReading(trimmed);
        if (res && res.hiragana && !containsKanji(res.hiragana)) {
          setHiragana(res.hiragana);
          setKatakana(res.katakana || hiraganaToKatakana(res.hiragana));
          if (!meaningEs && res.meaning_es) setMeaningEs(res.meaning_es);
        }
      } finally {
        setIsConvertingKana(false);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const cleanKanji = kanji.trim();
    let cleanHiragana = hiragana.trim();

    // Auto-resolución si falta hiragana o contiene kanjis
    if (cleanKanji && (!cleanHiragana || containsKanji(cleanHiragana))) {
      setIsConvertingKana(true);
      try {
        const res = await fetchKanjiReading(cleanKanji);
        if (res && res.hiragana && !containsKanji(res.hiragana)) {
          cleanHiragana = res.hiragana;
          setHiragana(cleanHiragana);
          if (!katakana || containsKanji(katakana)) {
            setKatakana(res.katakana || hiraganaToKatakana(cleanHiragana));
          }
        }
      } catch (err) {
        console.warn('Auto-resolución en edición:', err);
      } finally {
        setIsConvertingKana(false);
      }
    }

    if (!cleanKanji || !cleanHiragana || !meaningEs.trim()) {
      showAlert({
        type: 'warning',
        title: 'Campos Incompletos',
        message: 'Por favor completa al menos el Kanji/palabra, la lectura en Hiragana y su significado en español.'
      });
      return;
    }

    // Regla obligatoria: Hiragana no debe contener Kanji
    if (containsKanji(cleanHiragana)) {
      const syncRes = convertKanjiToKanaSync(cleanKanji);
      if (syncRes.hiragana && !containsKanji(syncRes.hiragana)) {
        cleanHiragana = syncRes.hiragana;
        setHiragana(cleanHiragana);
      } else {
        showAlert({
          type: 'warning',
          title: 'Lectura Fonética Requerida',
          message: 'El campo "Hiragana" no debe contener caracteres Kanji. Por favor introduce la lectura fonética en kana.'
        });
        return;
      }
    }

    let finalKatakana = katakana.trim();
    if (!finalKatakana || containsKanji(finalKatakana)) {
      finalKatakana = hiraganaToKatakana(cleanHiragana);
      setKatakana(finalKatakana);
    }
    if (containsKanji(finalKatakana)) {
      finalKatakana = cleanKanaOnly(finalKatakana);
    }

    const updated = {
      ...word,
      kanji: cleanKanji,
      hiragana: cleanHiragana,
      katakana: finalKatakana,
      kana: cleanHiragana,
      meaning_es: meaningEs.trim(),
      meaning_en: meaningEn.trim(),
      level,
      category: category.trim() || 'Vocabulario General',
      notes: notes.trim(),
      literal_translation: literalTranslation.trim(),
      breakdown: breakdown.trim(),
      example_sentence: exampleSentence.trim(),
      example_reading: exampleReading.trim(),
      example_translation: exampleTranslation.trim(),
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

  const handleAnalyzeAI = async () => {
    const target = kanji.trim() || hiragana.trim();
    if (!target) {
      showAlert({
        type: 'warning',
        title: 'Ingresa una palabra',
        message: 'Por favor escribe el kanji o la palabra antes de analizar con IA.'
      });
      return;
    }

    setIsAnalyzingAI(true);
    try {
      const data = await analyzeVocabularyWithAI(target, { currentReading: hiragana });
      if (data) {
        if (data.kanji && (!kanji || kanji === hiragana)) setKanji(data.kanji);
        if (data.hiragana) {
          setHiragana(data.hiragana);
          setKatakana(data.katakana || hiraganaToKatakana(data.hiragana));
        }
        if (data.meaning_es && (!meaningEs || meaningEs === target)) {
          setMeaningEs(data.meaning_es);
        }
        if (data.literal_translation) setLiteralTranslation(data.literal_translation);
        if (data.breakdown) setBreakdown(data.breakdown);
        if (data.example_sentence) setExampleSentence(data.example_sentence);
        if (data.example_reading) setExampleReading(data.example_reading);
        if (data.example_translation) setExampleTranslation(data.example_translation);
        if (data.level && ['N5', 'N4', 'N3', 'N2', 'N1'].includes(data.level)) {
          setLevel(data.level);
        }
        if (data.category && (!category || category === 'Vocabulario General')) {
          setCategory(data.category);
        }
        if (data.nuance_note && !notes) {
          setNotes(data.nuance_note);
        }
      }
    } catch (err) {
      console.warn('Error en análisis IA:', err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleResetToDefault = async () => {
    const ok = await showConfirm({
      title: '¿Restaurar Palabra?',
      message: '¿Deseas restaurar esta palabra a su valor original de fábrica?',
      confirmText: 'Restaurar',
      isDestructive: false
    });
    if (ok) {
      if (onReset) {
        onReset(word.id || word.kanji);
      }
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        ref={modalCardRef}
        tabIndex={-1}
        className="save-vocab-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 580 }}
        role="dialog"
        aria-modal="true"
        aria-label={isCustomized ? 'Editar Palabra y Notas (Personalizada)' : 'Modificar Escritura o Agregar Notas'}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div className="guideline-badge" style={{ margin: 0, flex: 1, minWidth: 260, background: 'rgba(99, 102, 241, 0.08)' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.84rem' }}>
                Puedes corregir kanjis, afinar la traducción y registrar tus propias <strong>notas de estudio</strong>.
              </span>
            </div>
            <button
              type="button"
              className="btn-ai-analyze"
              onClick={handleAnalyzeAI}
              disabled={isAnalyzingAI || (!kanji.trim() && !hiragana.trim())}
              title="Desglosar morfológicamente y enriquecer con IA"
            >
              <Sparkles size={14} className={isAnalyzingAI ? 'animate-spin' : ''} />
              <span>{isAnalyzingAI ? 'Analizando...' : '✨ Analizar con IA'}</span>
            </button>
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
                onChange={(e) => handleKanjiChange(e.target.value)}
                onBlur={handleKanjiBlur}
                required
                autoFocus
              />
            </div>

            {/* Hiragana */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Hiragana (Lectura Kana)</span>
                {isConvertingKana && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={12} className="animate-spin" />
                    <span>Auto-Kana...</span>
                  </span>
                )}
              </label>
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
                <option value="N5">N5</option>
                <option value="N4">N4</option>
                <option value="N3">N3</option>
                <option value="N2">N2</option>
                <option value="N1">N1</option>
              </select>
            </div>
          </div>

          {/* Significados: Contextual vs Literal */}
          <div className="form-group-grid">
            <div className="form-group">
              <label className="form-label">
                <span>Significado Contextual (meaning_es)</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>¿Cómo se entiende?</span>
              </label>
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
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Traducción Literal (Etimología)</span>
                <span className="literal-tag">Literal</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="ej. Mucha división / Lo previo"
                value={literalTranslation}
                onChange={(e) => setLiteralTranslation(e.target.value)}
              />
            </div>
          </div>

          {/* Desglose de Componentes */}
          <div className="form-group">
            <label className="form-label">Desglose de Componentes / Morfología</label>
            <input
              type="text"
              className="form-input"
              placeholder="ej. お [prefijo honorífico] + 先 [delante / anterior]"
              value={breakdown}
              onChange={(e) => setBreakdown(e.target.value)}
            />
          </div>

          {/* Frase Cotidiana de Ejemplo */}
          <div className="example-sentence-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                <Sparkles size={14} style={{ color: 'var(--primary-light)' }} />
                <span>Frase Cotidiana de Ejemplo (Uso Real)</span>
              </div>
              {exampleSentence && (
                <button
                  type="button"
                  className="tts-mini-btn"
                  onClick={() => audioManager.speak(exampleSentence)}
                  title="Escuchar pronunciación de la frase"
                >
                  <Volume2 size={13} />
                </button>
              )}
            </div>
            <input
              type="text"
              className="form-input jp-text"
              placeholder="ej. お先に失礼します。"
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              style={{ marginTop: 6 }}
            />
            <div className="example-inputs-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
              <input
                type="text"
                className="form-input jp-text"
                placeholder="Lectura: おさきにしつれいします"
                value={exampleReading}
                onChange={(e) => setExampleReading(e.target.value)}
                style={{ fontSize: '0.82rem' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Traducción: Con permiso, me retiro antes"
                value={exampleTranslation}
                onChange={(e) => setExampleTranslation(e.target.value)}
                style={{ fontSize: '0.82rem' }}
              />
            </div>
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
