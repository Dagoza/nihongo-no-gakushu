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
  AlertCircle,
  Lightbulb,
  BookOpen,
  Plus
} from 'lucide-react';
import audioManager from '../../lib/audioManager';
import { 
  hiraganaToKatakana, 
  katakanaToHiragana, 
  extractKanjis, 
  containsKanji, 
  convertKanjiToKanaSync, 
  fetchKanjiReading, 
  cleanKanaOnly,
  analyzeVocabularyWithAI
} from '../../lib/japaneseUtils';
import vocabularyData from '../../data/vocabulary.json';
import kanjiData from '../../data/kanji.json';
import storiesData from '../../data/stories.json';
import { useApp } from '../../lib/AppContext';
import PitchAccent from '../features/PitchAccent';
import useFocusTrap from '../../lib/useFocusTrap';

export default function SaveVocabModal({
  isOpen,
  onClose,
  initialData = {}, // { type: 'word'|'phrase'|'kanji', text, reading, translation, level, videoTitle, videoId, timestamp, source }
  appState,
  onUpdateState
}) {
  const modalCardRef = useFocusTrap(isOpen);
  const contextApp = useApp();
  const showAlert = contextApp?.showAlert || ((opts) => console.log(opts));
  const [activeTab, setActiveTab] = useState(initialData.type || 'word'); // 'word' | 'phrase' | 'kanji'
  
  // Word state
  const [kanji, setKanji] = useState('');
  const [hiragana, setHiragana] = useState('');
  const [katakana, setKatakana] = useState('');
  const [meaningEs, setMeaningEs] = useState('');
  const [literalTranslation, setLiteralTranslation] = useState('');
  const [breakdown, setBreakdown] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [exampleReading, setExampleReading] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [level, setLevel] = useState('N5');
  const [category, setCategory] = useState('Anime y Cultura');
  const [notes, setNotes] = useState('');
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

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
  const [isConvertingKana, setIsConvertingKana] = useState(false);
  const debounceTimerRef = React.useRef(null);

  useEffect(() => {
    if (isOpen && initialData) {
      const rawText = (initialData.text || initialData.kanji || '').trim();
      const rawReading = (initialData.reading || initialData.hiragana || initialData.kana || '').trim();
      const isPhraseGuessed = rawText.length > 15 || /[。！？\n]/.test(rawText);
      const defaultType = initialData.type || (isPhraseGuessed ? 'phrase' : 'word');
      
      setActiveTab(defaultType);
      setItemSource(initialData.source || (initialData.videoId ? 'YouTube' : 'Reproductor de Audio'));
      setKanji(rawText);

      // Cargar campos lingüísticos enriquecidos si ya vienen provistos
      setLiteralTranslation(initialData.literal_translation || initialData.literalTranslation || '');
      setBreakdown(initialData.breakdown || '');
      setExampleSentence(initialData.example_sentence || initialData.exampleSentence || '');
      setExampleReading(initialData.example_reading || initialData.exampleReading || '');
      setExampleTranslation(initialData.example_translation || initialData.exampleTranslation || '');

      // Si se proporcionó una lectura fonética válida (sin kanjis)
      if (rawReading && !containsKanji(rawReading)) {
        const cleanHira = katakanaToHiragana(rawReading);
        const cleanKata = hiraganaToKatakana(cleanHira);
        setHiragana(cleanHira);
        setKatakana(cleanKata);
      } else if (rawText) {
        // 1. Resolución síncrona inmediata en cliente
        const syncMatch = convertKanjiToKanaSync(rawText, appState?.savedCustomVocab || [], vocabularyData || []);
        if (syncMatch && syncMatch.hiragana && !containsKanji(syncMatch.hiragana)) {
          setHiragana(syncMatch.hiragana);
          setKatakana(syncMatch.katakana || hiraganaToKatakana(syncMatch.hiragana));
          if (!initialData.translation && syncMatch.meaning_es) {
            setMeaningEs(syncMatch.meaning_es);
          }
          if (!initialData.level && syncMatch.level) {
            setLevel(syncMatch.level);
          }
        } else if (!containsKanji(rawText)) {
          const hira = katakanaToHiragana(rawText);
          setHiragana(hira);
          setKatakana(hiraganaToKatakana(hira));
        } else {
          setHiragana('');
          setKatakana('');
        }

        // 2. Si contiene kanjis y aún no está resuelto al 100%, consultar API en segundo plano
        if (containsKanji(rawText)) {
          setIsConvertingKana(true);
          fetchKanjiReading(rawText, {
            customVocab: appState?.savedCustomVocab || [],
            externalVocab: vocabularyData || []
          }).then((res) => {
            if (res && res.hiragana && !containsKanji(res.hiragana)) {
              setHiragana(res.hiragana);
              setKatakana(res.katakana || hiraganaToKatakana(res.hiragana));
              if (!initialData.translation && res.meaning_es) {
                setMeaningEs(res.meaning_es);
              }
              if (res.literal_translation && !initialData.literal_translation) {
                setLiteralTranslation(res.literal_translation);
              }
              if (res.breakdown && !initialData.breakdown) {
                setBreakdown(res.breakdown);
              }
              if (res.example_sentence && !initialData.example_sentence) {
                setExampleSentence(res.example_sentence);
                setExampleReading(res.example_reading || '');
                setExampleTranslation(res.example_translation || '');
              }
              if (res.nuance_notes && !initialData.notes) {
                setNotes(res.nuance_notes);
              }
              if (!initialData.level && res.level) {
                setLevel(res.level);
              }
            }
          }).catch(console.warn).finally(() => setIsConvertingKana(false));
        }
      } else {
        setHiragana('');
        setKatakana('');
      }

      setMeaningEs(initialData.translation || initialData.meaning_es || '');
      setLevel(initialData.level || 'N5');
      setCategory(initialData.category || 'Vocabulario General');
      setNotes(initialData.notes || '');

      // Frase
      const sentenceTarget = initialData.sentenceText || rawText;
      setPhraseJapanese(sentenceTarget);

      // Buscar si coincide con alguna oración de la historia
      let matchedTranslation = initialData.sentenceTranslation || initialData.translation || '';
      if (!matchedTranslation && storiesData) {
        for (const st of storiesData) {
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

  // Análisis inteligente profundo con IA (traducción contextual, literal, desglose y frase cotidiana)
  const handleAnalyzeAI = async (textToAnalyze = kanji) => {
    const target = (textToAnalyze || kanji || phraseJapanese || '').trim();
    if (!target) return;

    setIsAnalyzingAI(true);
    try {
      const res = await analyzeVocabularyWithAI(target, { level });
      if (res) {
        if (res.kanji) setKanji(res.kanji);
        if (res.hiragana && !containsKanji(res.hiragana)) {
          setHiragana(res.hiragana);
          setKatakana(res.katakana || hiraganaToKatakana(res.hiragana));
        }
        if (res.meaning_es) setMeaningEs(res.meaning_es);
        if (res.literal_translation) setLiteralTranslation(res.literal_translation);
        if (res.breakdown) setBreakdown(res.breakdown);
        if (res.example_sentence) {
          setExampleSentence(res.example_sentence);
          setExampleReading(res.example_reading || '');
          setExampleTranslation(res.example_translation || '');
        }
        if (res.nuance_notes) {
          setNotes((prev) => {
            if (!prev) return res.nuance_notes;
            if (prev.includes(res.nuance_notes)) return prev;
            return `${prev}\n\n[Matiz cultural]: ${res.nuance_notes}`;
          });
        }
        if (res.level) setLevel(res.level);
        if (res.category) setCategory(res.category);
      }
    } catch (err) {
      console.warn('Error en análisis IA:', err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Guardar la frase de ejemplo contextual directamente en el cuaderno de frases
  const handleSaveExampleAsPhrase = () => {
    if (!exampleSentence.trim()) return;

    const newPhrase = {
      id: `phrase_${Date.now()}`,
      japanese: exampleSentence.trim(),
      reading: exampleReading.trim(),
      translation: exampleTranslation.trim(),
      source: `Ejemplo contextual de: ${kanji.trim() || 'Vocabulario'}`,
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

    showAlert({
      type: 'success',
      title: '¡Frase Guardada!',
      message: `Se añadió la frase de ejemplo "${exampleSentence.trim()}" a tu Cuaderno de Estudio (+15 XP).`
    });
  };

  if (!isOpen) return null;

  // Auto-completar Katakana cuando cambia Hiragana
  const handleHiraganaChange = (val) => {
    setHiragana(val);
    if (!katakana || katakana === hiraganaToKatakana(hiragana)) {
      setKatakana(hiraganaToKatakana(val));
    }
  };

  // Manejo de cambio en campo Kanji con auto-conversión debounced
  const handleKanjiChange = (val) => {
    setKanji(val);
    const trimmed = val.trim();
    if (!trimmed) {
      setHiragana('');
      setKatakana('');
      return;
    }

    // Si es solo kana
    if (!containsKanji(trimmed)) {
      const hira = katakanaToHiragana(trimmed);
      setHiragana(hira);
      setKatakana(hiraganaToKatakana(hira));
      return;
    }

    // Resolución síncrona inmediata
    const syncMatch = convertKanjiToKanaSync(trimmed, appState?.savedCustomVocab || [], vocabularyData || []);
    if (syncMatch && syncMatch.hiragana && !containsKanji(syncMatch.hiragana)) {
      setHiragana(syncMatch.hiragana);
      setKatakana(syncMatch.katakana || hiraganaToKatakana(syncMatch.hiragana));
      if (!meaningEs && syncMatch.meaning_es) setMeaningEs(syncMatch.meaning_es);
      if (syncMatch.level) setLevel(syncMatch.level);
    }

    // Debounce asíncrono rápido para resolución completa en API
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      setIsConvertingKana(true);
      try {
        const res = await fetchKanjiReading(trimmed, {
          customVocab: appState?.savedCustomVocab || [],
          externalVocab: vocabularyData || []
        });
        if (res && res.hiragana && !containsKanji(res.hiragana)) {
          setHiragana(res.hiragana);
          setKatakana(res.katakana || hiraganaToKatakana(res.hiragana));
          if (!meaningEs && res.meaning_es) setMeaningEs(res.meaning_es);
          if (!literalTranslation && res.literal_translation) setLiteralTranslation(res.literal_translation);
          if (!breakdown && res.breakdown) setBreakdown(res.breakdown);
          if (!exampleSentence && res.example_sentence) {
            setExampleSentence(res.example_sentence);
            setExampleReading(res.example_reading || '');
            setExampleTranslation(res.example_translation || '');
          }
          if (!notes && res.nuance_notes) setNotes(res.nuance_notes);
          if (res.level) setLevel(res.level);
        }
      } catch (e) {
        console.warn('Fallo debounce reading:', e);
      } finally {
        setIsConvertingKana(false);
      }
    }, 150);
  };

  // Conversión automática inmediata al perder el foco en el campo Kanji
  const handleKanjiBlur = async () => {
    const trimmed = kanji.trim();
    if (!trimmed || !containsKanji(trimmed)) return;
    if (!hiragana || containsKanji(hiragana)) {
      setIsConvertingKana(true);
      try {
        const res = await fetchKanjiReading(trimmed, {
          customVocab: appState?.savedCustomVocab || [],
          externalVocab: vocabularyData || []
        });
        if (res && res.hiragana && !containsKanji(res.hiragana)) {
          setHiragana(res.hiragana);
          setKatakana(res.katakana || hiraganaToKatakana(res.hiragana));
          if (!meaningEs && res.meaning_es) setMeaningEs(res.meaning_es);
          if (!literalTranslation && res.literal_translation) setLiteralTranslation(res.literal_translation);
          if (!breakdown && res.breakdown) setBreakdown(res.breakdown);
          if (!exampleSentence && res.example_sentence) {
            setExampleSentence(res.example_sentence);
            setExampleReading(res.example_reading || '');
            setExampleTranslation(res.example_translation || '');
          }
          if (!notes && res.nuance_notes) setNotes(res.nuance_notes);
          if (res.level) setLevel(res.level);
        }
      } finally {
        setIsConvertingKana(false);
      }
    }
  };

  const detectedKanjis = extractKanjis(kanji || phraseJapanese);

  // Guardar palabra cumpliendo INSTRUCCIONES.md
  const handleSaveWord = async () => {
    const cleanKanji = kanji.trim();
    let cleanHiragana = hiragana.trim();

    // Auto-resolver si Hiragana aún está vacío o contiene kanjis residuales
    if (cleanKanji && (!cleanHiragana || containsKanji(cleanHiragana))) {
      setIsConvertingKana(true);
      try {
        const res = await fetchKanjiReading(cleanKanji, {
          customVocab: appState?.savedCustomVocab || [],
          externalVocab: vocabularyData || []
        });
        if (res && res.hiragana && !containsKanji(res.hiragana)) {
          cleanHiragana = res.hiragana;
          setHiragana(cleanHiragana);
          if (!katakana || containsKanji(katakana)) {
            setKatakana(res.katakana || hiraganaToKatakana(cleanHiragana));
          }
        }
      } catch (e) {
        console.warn('Auto-resolución en guardado falló:', e);
      } finally {
        setIsConvertingKana(false);
      }
    }

    if (!cleanKanji || !cleanHiragana || !meaningEs.trim()) {
      showAlert({
        type: 'warning',
        title: 'Campos Incompletos',
        message: 'Por favor completa el término en Kanji/Kana, su lectura en Hiragana y el significado en español para guardar la palabra.'
      });
      return;
    }

    // Regla obligatoria: Hiragana NUNCA puede contener ideogramas Kanji
    if (containsKanji(cleanHiragana)) {
      const syncCheck = convertKanjiToKanaSync(cleanKanji, appState?.savedCustomVocab || [], vocabularyData || []);
      if (syncCheck && syncCheck.hiragana && !containsKanji(syncCheck.hiragana)) {
        cleanHiragana = syncCheck.hiragana;
        setHiragana(cleanHiragana);
      } else {
        showAlert({
          type: 'warning',
          title: 'Lectura Fonética Requerida',
          message: 'El campo "Hiragana" no debe contener caracteres Kanji. Por favor escribe la lectura fonética en kana.'
        });
        return;
      }
    }

    // Katakana limpio garantizado
    let finalKatakana = katakana.trim();
    if (!finalKatakana || containsKanji(finalKatakana)) {
      finalKatakana = hiraganaToKatakana(cleanHiragana);
      setKatakana(finalKatakana);
    }
    if (containsKanji(finalKatakana)) {
      finalKatakana = cleanKanaOnly(finalKatakana);
    }

    const newWord = {
      id: initialData?.id || `v_custom_${Date.now()}`,
      kanji: cleanKanji,
      hiragana: cleanHiragana,
      katakana: finalKatakana,
      kana: cleanHiragana,
      meaning_es: meaningEs.trim(),
      meaning_en: initialData?.meaning_en || '',
      literal_translation: literalTranslation.trim(),
      breakdown: breakdown.trim(),
      example_sentence: exampleSentence.trim(),
      example_reading: exampleReading.trim(),
      example_translation: exampleTranslation.trim(),
      category: category,
      level: level,
      notes: notes.trim(),
      source: itemSource || 'Reproductor de Audio',
      date: initialData?.date || new Date().toISOString()
    };

    // Actualizar estado general
    const prevCustomVocab = appState.savedCustomVocab || [];
    const updatedVocab = [newWord, ...prevCustomVocab.filter(v => v.kanji !== newWord.kanji)];

    // Sincronización en memoria con catálogo de kanjis
    if (kanjiData && detectedKanjis.length > 0) {
      detectedKanjis.forEach(kChar => {
        const targetKanji = kanjiData.find(k => k.kanji === kChar);
        if (targetKanji) {
          if (!targetKanji.words) targetKanji.words = [];
          if (!targetKanji.words.some(w => w.word === newWord.kanji)) {
            targetKanji.words.push({
              word: newWord.kanji,
              reading: cleanHiragana,
              meaning: newWord.meaning_es
            });
          }
        }
      });
    }

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
      ...(literalTranslation.trim() ? { literal_translation: literalTranslation.trim() } : {}),
      ...(breakdown.trim() ? { breakdown: breakdown.trim() } : {}),
      ...(exampleSentence.trim() ? { 
        example_sentence: exampleSentence.trim(),
        example_reading: exampleReading.trim(),
        example_translation: exampleTranslation.trim()
      } : {}),
      category: category,
      level: level,
      ...(notes.trim() ? { notes: notes.trim() } : {})
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
      <div 
        ref={modalCardRef}
        tabIndex={-1}
        className="save-vocab-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Guardar en Mi Cuaderno de Estudio"
      >
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div className="guideline-badge" style={{ margin: 0, flex: 1, minWidth: 260 }}>
                <AlertCircle size={14} />
                <span>
                  Registro simultáneo en <strong>Kanji</strong>, <strong>Hiragana</strong> y <strong>Katakana</strong> con significado en español.
                </span>
              </div>
              <button
                type="button"
                className="btn-ai-analyze"
                onClick={() => handleAnalyzeAI(kanji)}
                disabled={isAnalyzingAI || !kanji.trim()}
                title="Desglosar morfológicamente y autocompletar con IA"
              >
                <Sparkles size={14} className={isAnalyzingAI ? 'animate-spin' : ''} />
                <span>{isAnalyzingAI ? 'Analizando...' : '✨ Analizar con IA'}</span>
              </button>
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
                  placeholder="ej. 先生 o お先"
                  value={kanji}
                  onChange={(e) => handleKanjiChange(e.target.value)}
                  onBlur={handleKanjiBlur}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  placeholder="ej. せんせい o おさき"
                  value={hiragana}
                  onChange={(e) => handleHiraganaChange(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Katakana (Transcripción)</label>
                <input
                  type="text"
                  className="form-input jp-text"
                  placeholder="ej. センセイ o オサキ"
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
                  <option value="N5">N5</option>
                  <option value="N4">N4</option>
                  <option value="N3">N3</option>
                  <option value="N2">N2</option>
                  <option value="N1">N1</option>
                </select>
              </div>
            </div>

            {/* Previsualización en vivo de Acento Tonal (Pitch Accent) */}
            {(kanji || hiragana) && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Acento Tonal (Pitch Accent de Tokio):
                </span>
                <PitchAccent word={kanji} reading={hiragana} mode="full" size="sm" showAudio={true} />
              </div>
            )}

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
                  placeholder="ej. Antes / Me adelanto (o Disculpe)"
                  value={meaningEs}
                  onChange={(e) => setMeaningEs(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Lightbulb size={13} style={{ color: 'var(--primary-light)' }} />
                    <span>Traducción Literal (Etimología)</span>
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Palabra por palabra</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ej. Lo previo / el frente con cortesía"
                  value={literalTranslation}
                  onChange={(e) => setLiteralTranslation(e.target.value)}
                />
              </div>
            </div>

            {/* Desglose de Componentes */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <BookOpen size={13} style={{ color: 'var(--primary-light)' }} />
                  <span>Desglose de Componentes (Kanjis, Prefijos y Morfología)</span>
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="ej. お [prefijo honorífico de cortesía] + 先 [delante / anterior]"
                value={breakdown}
                onChange={(e) => setBreakdown(e.target.value)}
              />
            </div>

            {/* Frase Cotidiana de Ejemplo de Alta Frecuencia */}
            <div className="example-sentence-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  <Sparkles size={14} style={{ color: 'var(--primary-light)' }} />
                  <span>Frase Cotidiana de Ejemplo (Uso Real en Japón)</span>
                </div>
                {exampleSentence && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      className="tts-mini-btn"
                      onClick={() => audioManager.speak(exampleSentence)}
                      title="Escuchar pronunciación de la frase"
                    >
                      <Volume2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn-save-example-phrase"
                      onClick={handleSaveExampleAsPhrase}
                      title="Guardar también esta frase de ejemplo en mi Cuaderno de Estudio (+15 XP)"
                    >
                      <Plus size={12} />
                      <span>Guardar Frase (+15 XP)</span>
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  type="text"
                  className="form-input jp-text"
                  placeholder="ej. お先に失礼します。"
                  value={exampleSentence}
                  onChange={(e) => setExampleSentence(e.target.value)}
                  style={{ fontWeight: 600, fontSize: '0.92rem' }}
                />
                <div className="form-group-grid" style={{ marginTop: 2 }}>
                  <input
                    type="text"
                    className="form-input jp-text"
                    placeholder="Lectura kana: ej. おさきにしつれいします。"
                    value={exampleReading}
                    onChange={(e) => setExampleReading(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Traducción: ej. Con su permiso me retiro antes (fórmula laboral)"
                    value={exampleTranslation}
                    onChange={(e) => setExampleTranslation(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Categoría Temática</label>
              <input
                list="category-options"
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Vida Diaria"
              />
              <datalist id="category-options">
                <option value="Anime y Cultura" />
                <option value="Vida Diaria" />
                <option value="Comida y Bebida" />
                <option value="Viajes y Lugares" />
                <option value="Personas y Relaciones" />
                <option value="Saludos y Cortesía" />
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label">Notas Personales (Nemotecnia, Matices de Uso, Gramática)</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="ej. Se usa comúnmente con だろう, o notas de pronunciación..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ resize: 'vertical' }}
              />
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
