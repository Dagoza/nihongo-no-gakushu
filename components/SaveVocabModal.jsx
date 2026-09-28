'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bookmark, 
  Layers, 
  Languages, 
  Volume2, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import audioManager from '../lib/audioManager';
import { 
  hiraganaToKatakana, 
  katakanaToHiragana, 
  extractKanjis, 
  containsKanji,
  lookupJapaneseWord 
} from '../lib/japaneseUtils';
import { dataStore } from '../lib/data';

export default function SaveVocabModal({
  isOpen,
  onClose,
  initialData = {}, // { type: 'word'|'phrase'|'kanji', text, reading, translation, level, videoTitle, videoId, timestamp, source }
  appState,
  onUpdateState
}) {
  const [activeTab, setActiveTab] = useState(initialData.type || 'word'); // 'word' | 'phrase' | 'kanji'
  
  // Word state
  const [kanji, setKanji] = useState('');
  const [hiragana, setHiragana] = useState('');
  const [katakana, setKatakana] = useState('');
  const [meaningEs, setMeaningEs] = useState('');
  const [level, setLevel] = useState('N5');
  const [category, setCategory] = useState('Anime y Cultura');

  // Phrase state
  const [phraseJapanese, setPhraseJapanese] = useState('');
  const [phraseTranslation, setPhraseTranslation] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoTimestamp, setVideoTimestamp] = useState(0);
  const [videoId, setVideoId] = useState('');
  const [itemSource, setItemSource] = useState('Reproductor de Audio');

  // Status
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      const rawText = (initialData.text || '').trim();
      const rawReading = initialData.reading || '';
      const isPhraseGuessed = rawText.length > 15 || /[。！？\n]/.test(rawText);
      const defaultType = initialData.type || (isPhraseGuessed ? 'phrase' : 'word');
      
      setActiveTab(defaultType);
      setItemSource(initialData.source || (initialData.videoId ? 'YouTube' : 'Reproductor de Audio'));

      // Intentar auto-completar desde catálogo o diccionario
      const foundInfo = lookupJapaneseWord(rawText, appState?.savedCustomVocab || [], dataStore?.vocabulary || []);

      if (containsKanji(rawText)) {
        setKanji(rawText);
        setHiragana(rawReading || foundInfo?.hiragana || katakanaToHiragana(rawText));
        setKatakana(foundInfo?.katakana || hiraganaToKatakana(rawReading || foundInfo?.hiragana || rawText));
      } else {
        setKanji(rawText);
        setHiragana(foundInfo?.hiragana || rawText);
        setKatakana(foundInfo?.katakana || hiraganaToKatakana(rawText));
      }

      setMeaningEs(initialData.translation || foundInfo?.meaning_es || '');
      setLevel(initialData.level || foundInfo?.level || 'N5');
      setCategory(initialData.category || foundInfo?.category || 'Vocabulario General');

      // Frase
      const sentenceTarget = initialData.sentenceText || rawText;
      setPhraseJapanese(sentenceTarget);

      // Buscar si coincide con alguna oración de la historia
      let matchedTranslation = initialData.sentenceTranslation || initialData.translation || '';
      if (!matchedTranslation && dataStore?.stories) {
        for (const st of dataStore.stories) {
          const matchSent = st.sentences?.find(s => s.japanese?.includes(sentenceTarget) || sentenceTarget.includes(s.japanese));
          if (matchSent) {
            matchedTranslation = matchSent.translation_es || matchSent.english || '';
            break;
          }
        }
      }

      setPhraseTranslation(matchedTranslation);
      setVideoTitle(initialData.videoTitle || '');
      setVideoTimestamp(initialData.timestamp || 0);
      setVideoId(initialData.videoId || '');

      setSavedSuccess(false);
      setCopiedJson(false);
    }
  }, [isOpen, initialData, appState?.savedCustomVocab]);

  if (!isOpen) return null;

  // Auto-completar Katakana cuando cambia Hiragana
  const handleHiraganaChange = (val) => {
    setHiragana(val);
    if (!katakana || katakana === hiraganaToKatakana(hiragana)) {
      setKatakana(hiraganaToKatakana(val));
    }
  };

  const detectedKanjis = extractKanjis(kanji || phraseJapanese);

  // Guardar palabra cumpliendo INSTRUCCIONES.md
  const handleSaveWord = () => {
    if (!kanji.trim() || !hiragana.trim() || !meaningEs.trim()) {
      alert('Por favor completa el término en Kanji/Kana, Hiragana y su significado en español.');
      return;
    }

    const finalKatakana = katakana.trim() || hiraganaToKatakana(hiragana);
    const newWord = {
      id: `v_custom_${Date.now()}`,
      kanji: kanji.trim(),
      hiragana: hiragana.trim(),
      katakana: finalKatakana,
      kana: hiragana.trim(),
      meaning_es: meaningEs.trim(),
      meaning_en: '',
      category: category,
      level: level,
      source: itemSource || 'Reproductor de Audio',
      date: new Date().toISOString()
    };

    // Actualizar estado general
    const prevCustomVocab = appState.savedCustomVocab || [];
    const updatedVocab = [newWord, ...prevCustomVocab.filter(v => v.kanji !== newWord.kanji)];

    // Si la palabra contiene kanjis, actualizar o vincular en masteredKanji / savedCustomKanji
    let updatedKanjiMap = { ...(appState.masteredKanji || {}) };
    detectedKanjis.forEach(kChar => {
      if (updatedKanjiMap[kChar] === undefined) {
        updatedKanjiMap[kChar] = false; // Añadido para seguimiento
      }
    });

    const newXp = (appState.xp || 0) + 15;
    onUpdateState({
      ...appState,
      savedCustomVocab: updatedVocab,
      masteredKanji: updatedKanjiMap,
      xp: newXp
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // Guardar frase de ejemplo con timestamp
  const handleSavePhrase = () => {
    if (!phraseJapanese.trim()) return;

    const newPhrase = {
      id: `phrase_${Date.now()}`,
      japanese: phraseJapanese.trim(),
      translation: phraseTranslation.trim(),
      videoTitle: videoTitle || '',
      videoId: videoId,
      timestamp: videoTimestamp,
      youtubeUrl: videoId ? `https://youtu.be/${videoId}?t=${Math.floor(videoTimestamp)}s` : '',
      source: itemSource || (videoId ? videoTitle : 'Reproductor de Audio'),
      date: new Date().toISOString()
    };

    const prevPhrases = appState.savedPhrases || [];
    const updatedPhrases = [newPhrase, ...prevPhrases];

    const newXp = (appState.xp || 0) + 15;
    onUpdateState({
      ...appState,
      savedPhrases: updatedPhrases,
      xp: newXp
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // Generar JSON según formato de INSTRUCCIONES.md para data/vocabulary.json
  const generateVocabularyJson = () => {
    const finalKatakana = katakana.trim() || hiraganaToKatakana(hiragana);
    const obj = {
      id: `v_${Date.now().toString().slice(-4)}`,
      kanji: kanji.trim(),
      hiragana: hiragana.trim(),
      katakana: finalKatakana,
      kana: hiragana.trim(),
      meaning_es: meaningEs.trim(),
      category: category,
      level: level
    };
    return JSON.stringify(obj, null, 2);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(generateVocabularyJson());
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="save-vocab-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Bookmark className="text-primary" size={20} />
            <h3 className="modal-title">Guardar en Mi Cuaderno de Estudio</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Tabs de tipo de guardado */}
        <div className="modal-tabs">
          <button
            className={`modal-tab-btn ${activeTab === 'word' ? 'active' : ''}`}
            onClick={() => setActiveTab('word')}
          >
            <Layers size={16} />
            <span>Palabra (単語)</span>
          </button>
          <button
            className={`modal-tab-btn ${activeTab === 'phrase' ? 'active' : ''}`}
            onClick={() => setActiveTab('phrase')}
          >
            <Sparkles size={16} />
            <span>Frase con Video (例文)</span>
          </button>
        </div>

        {/* Tab 1: Guardar Palabra */}
        {activeTab === 'word' && (
          <div className="modal-body">
            <div className="guideline-badge">
              <AlertCircle size={14} />
              <span>
                Regla obligatoria: Registro simultáneo en <strong>Kanji</strong>, <strong>Hiragana</strong> y <strong>Katakana</strong> con significado en español.
              </span>
            </div>

            <div className="form-group-grid">
              <div className="form-group">
                <label className="form-label">
                  Palabra / Kanji
                  <button 
                    type="button" 
                    className="tts-mini-btn" 
                    onClick={() => audioManager.speak(kanji || hiragana)}
                    title="Escuchar"
                  >
                    <Volume2 size={13} />
                  </button>
                </label>
                <input
                  type="text"
                  className="form-input jp-text"
                  placeholder="ej. 先生 o アニメ"
                  value={kanji}
                  onChange={(e) => setKanji(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hiragana (Lectura Kana)</label>
                <input
                  type="text"
                  className="form-input jp-text"
                  placeholder="ej. せんせい"
                  value={hiragana}
                  onChange={(e) => handleHiraganaChange(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Katakana (Transcripción)</label>
                <input
                  type="text"
                  className="form-input jp-text"
                  placeholder="ej. センセイ"
                  value={katakana}
                  onChange={(e) => setKatakana(e.target.value)}
                />
              </div>

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

            <div className="form-group">
              <label className="form-label">Significado en Español (meaning_es)</label>
              <input
                type="text"
                className="form-input"
                placeholder="ej. Profesor / Maestro"
                value={meaningEs}
                onChange={(e) => setMeaningEs(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoría Temática</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Anime y Cultura">Anime y Cultura</option>
                <option value="Vida Diaria">Vida Diaria</option>
                <option value="Comida y Bebida">Comida y Bebida</option>
                <option value="Viajes y Lugares">Viajes y Lugares</option>
                <option value="Personas y Relaciones">Personas y Relaciones</option>
                <option value="Saludos y Cortesía">Saludos y Cortesía</option>
              </select>
            </div>

            {/* Kanjis detectados con advertencia de sincronización */}
            {detectedKanjis.length > 0 && (
              <div className="kanji-sync-preview">
                <div className="kanji-sync-title">
                  <Languages size={15} />
                  <span>Kanjis a sincronizar en el catálogo ({detectedKanjis.length}):</span>
                </div>
                <div className="kanji-chips">
                  {detectedKanjis.map((k) => (
                    <span key={k} className="kanji-chip">
                      <strong>{k}</strong>
                      <span className="kanji-chip-status">Sincronizado</span>
                    </span>
                  ))}
                </div>
                <small className="kanji-sync-note">
                  La palabra quedará vinculada automáticamente a la ficha de cada uno de estos kanjis en Nihongo Master.
                </small>
              </div>
            )}

            {/* Footer con acciones */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn-outline-copy"
                onClick={handleCopyJson}
                title="Copiar formato JSON para data/vocabulary.json"
              >
                {copiedJson ? <Check size={15} /> : <Copy size={15} />}
                <span>{copiedJson ? '¡Copiado!' : 'Copiar JSON'}</span>
              </button>

              <button
                type="button"
                className={`btn-primary-save ${savedSuccess ? 'success' : ''}`}
                onClick={handleSaveWord}
              >
                {savedSuccess ? (
                  <>
                    <Check size={18} />
                    <span>¡Guardado (+15 XP)!</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={18} />
                    <span>Guardar Palabra</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Guardar Frase con Timestamp de YouTube */}
        {activeTab === 'phrase' && (
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                Oración en Japonés
                <button 
                  type="button" 
                  className="tts-mini-btn" 
                  onClick={() => audioManager.speak(phraseJapanese)}
                  title="Escuchar"
                >
                  <Volume2 size={13} />
                </button>
              </label>
              <textarea
                className="form-textarea jp-text"
                rows={2}
                value={phraseJapanese}
                onChange={(e) => setPhraseJapanese(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Traducción al Español</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Traducción contextual de la frase..."
                value={phraseTranslation}
                onChange={(e) => setPhraseTranslation(e.target.value)}
              />
            </div>

            <div className="phrase-video-metadata">
              <div className="metadata-row">
                <span className="label">Video de origen:</span>
                <span className="value">{videoTitle || 'YouTube'}</span>
              </div>
              {videoId && (
                <div className="metadata-row">
                  <span className="label">Marca de tiempo:</span>
                  <a 
                    href={`https://youtu.be/${videoId}?t=${Math.floor(videoTimestamp)}s`}
                    target="_blank" 
                    rel="noreferrer"
                    className="timestamp-link"
                  >
                    <span>{Math.floor(videoTimestamp / 60)}:{(Math.floor(videoTimestamp % 60)).toString().padStart(2, '0')}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className={`btn-primary-save ${savedSuccess ? 'success' : ''}`}
                onClick={handleSavePhrase}
              >
                {savedSuccess ? (
                  <>
                    <Check size={18} />
                    <span>¡Frase Guardada (+15 XP)!</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Guardar Frase en Mi Cuaderno</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
